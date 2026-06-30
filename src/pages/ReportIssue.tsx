import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, CircleMarker } from 'react-leaflet';
import { useLocationContext } from '../context/LocationContext';
import { useRole } from '../context/RoleContext';
import { useIssues } from '../hooks/useIssues';
import { analyzeIssue } from '../lib/gemini';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { stripUndefined } from '../lib/sanitize';
import { uploadIssueImage } from '../lib/storage';
import type { Issue } from '../data/mockData';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FlyToMarker({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

const CATEGORIES = ['Roads', 'Water', 'Electricity', 'Sanitation', 'Parks & Rec', 'Other'];

type Step = 1 | 2 | 3 | 4;

export default function ReportIssue() {
  const navigate = useNavigate();
  const { currentUser, userData } = useRole();
  const { coordinates, permission, requestPermission, fetchLocation } = useLocationContext();
  const { issues: mockIssues } = useIssues();

  const [step, setStep] = useState<Step>(1);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Other');

  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [finalIssueId, setFinalIssueId] = useState('');

  const [mapCenter, setMapCenter] = useState<[number, number]>([18.520, 73.856]);
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trackingId = useRef('CH-2024-' + Math.floor(Math.random() * 90000 + 10000)).current;

  function handleMyLocation(e: React.MouseEvent) {
    e.preventDefault();
    setIsLocating(true);

    if (permission === 'prompt') {
      requestPermission('once');
    } else if (permission !== 'never') {
      fetchLocation();
    }

    if (coordinates) {
      setMapCenter([coordinates[0] + (Math.random() * 0.0000001), coordinates[1]]);
    }

    setTimeout(() => setIsLocating(false), 800);
  }

  useEffect(() => {
    if (coordinates && step === 2) {
      setMapCenter([coordinates[0], coordinates[1]]);
    }
  }, [coordinates, step]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');
    if (file) {
      // 10MB raw file size limit
      if (file.size > 10 * 1024 * 1024) {
        setImageError('File size exceeds 10MB. Please choose a smaller image.');
        e.target.value = '';
        return;
      }

      // Auto-compress using canvas so the base64 payload sent to Gemini stays small
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const MAX_DIM = 1280;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG at 80% quality — keeps size well under Gemini's payload limit
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setBase64Image(compressedBase64);
        setMimeType('image/jpeg');
      };
      img.src = objectUrl;
    }
  };

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const citizenId = currentUser?.uid || 'anonymous';
      const citizenName = userData?.name || 'Anonymous Citizen';

      // Find nearby issues (rough 1km bounding box)
      const nearby = mockIssues.filter(i => 
        Math.abs(i.lat - mapCenter[0]) < 0.01 && 
        Math.abs(i.lng - mapCenter[1]) < 0.01
      ).map(i => ({ id: i.id, title: i.title, category: i.category }));

      // 1. Call Gemini for analysis
      const analysis = await analyzeIssue(description, base64Image || undefined, mimeType || undefined, nearby);

      const newId = `issue-${Date.now()}`;
      setFinalIssueId(newId);

      // 2. Determine final status based on confidence
      const finalStatus: Issue['status'] = analysis.confidence < 60 ? 'Reported' : 'Triaged';

      // Reverse geocode to get a precise, readable location
      let readableLocation = "Captured Location";
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapCenter[0]}&lon=${mapCenter[1]}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.display_name) {
            const parts = geoData.display_name.split(', ');
            // Take first 3 parts of the address for brevity (e.g. "Main Street, Pune, Maharashtra")
            readableLocation = parts.slice(0, 3).join(', ');
          }
        }
      } catch (e) {
        console.warn("Reverse geocoding failed", e);
      }

      const imageUrl = base64Image
        ? await uploadIssueImage(citizenId, newId, base64Image)
        : "https://placehold.co/600x400/e2e8f0/475569?text=No+Image";

      // 3. Construct Issue
      const issue: Issue = {
        id: newId,
        title: analysis.category + " Issue reported",
        description: description,
        category: analysis.category as any,
        severity: analysis.severity,
        status: finalStatus as any,
        location: readableLocation,
        lat: mapCenter[0],
        lng: mapCenter[1],
        image: imageUrl,
        citizenId: citizenId,
        citizenName: citizenName,
        departmentId: analysis.departmentId,
        upvotes: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + analysis.slaDeadlineHours * 60 * 60 * 1000).toISOString(),
        trackingId: trackingId,
        aiConfidence: analysis.confidence,
        agentLog: analysis.agentLog,
        isDuplicate: analysis.isDuplicate,
        duplicateOfId: analysis.duplicateOfId
      };

      // 4. Save to Firestore
      await setDoc(doc(db, 'reports', newId), stripUndefined(issue));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="px-margin-mobile pt-stack-gap flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto text-center gap-6">
        <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-600 text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold mb-2">Report Submitted!</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">The AI agent has successfully triaged your report.</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 w-full">
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Your Tracking ID</p>
          <p className="font-headline-md text-headline-md text-primary font-bold">{trackingId}</p>
        </div>
        {/* AI Pipeline animation */}
        <div className="w-full space-y-2">
          {['Perceive', 'Classify', 'Deduplicate', 'Route', 'Notify'].map((s) => (
            <div key={s} className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>
              </div>
              <span className="font-label-lg text-label-lg text-on-surface">{s}</span>
              <span className="ml-auto font-label-sm text-label-sm text-emerald-600">Done</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={() => navigate(`/issue/${finalIssueId}`)} className="flex-1 bg-primary text-on-primary h-12 rounded-xl font-label-lg text-label-lg hover:bg-primary/90 transition-colors">
            Track Issue
          </button>
          <button onClick={() => navigate('/home')} className="flex-1 border border-outline-variant text-on-surface h-12 rounded-xl font-label-lg text-label-lg hover:bg-surface-variant/30 transition-colors">
            Go Home
          </button>
        </div>
      </main>
    );
  }

  if (isSubmitting) {
    return (
      <main className="px-margin-mobile pt-stack-gap flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto text-center gap-6">
        <div className="w-16 h-16 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">AI Agent Analyzing...</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Please wait while our AI classifies and routes your issue.</p>
      </main>
    );
  }

  return (
    <main className="px-margin-mobile pt-stack-gap flex flex-col gap-section-gap max-w-xl mx-auto pb-24">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > s ? 'bg-primary text-on-primary' :
                step === s ? 'bg-primary text-on-primary ring-2 ring-primary/30' :
                  'bg-surface-container border border-outline-variant text-on-surface-variant'
              }`}>
              {step > s ? <span className="material-symbols-outlined text-[14px]">check</span> : s}
            </div>
            <span className={`font-label-sm text-label-sm ${step === s ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
              {s === 1 ? 'Evidence' : s === 2 ? 'Location' : 'Category'}
            </span>
            {s < 3 && <div className="flex-1 h-0.5 bg-outline-variant rounded" />}
          </div>
        ))}
      </div>

      {/* Step 1: Photo */}
      {step === 1 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Add Evidence</h2>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-surface-container-high group flex items-center justify-center">
            {base64Image ? (
              <img
                className="w-full h-full object-cover"
                alt="Captured evidence"
                src={base64Image}
              />
            ) : (
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant">photo_camera</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <div className="absolute inset-0 bg-black/20 flex items-end p-3">
              <button onClick={() => fileInputRef.current?.click()} className="bg-surface/80 backdrop-blur-sm text-on-surface font-label-sm text-label-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm cursor-pointer hover:bg-surface transition-colors">
                <span className="material-symbols-outlined text-[16px]">{base64Image ? 'change_circle' : 'add_photo_alternate'}</span>
                {base64Image ? 'Change Photo' : 'Upload Photo'}
              </button>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              📸 Tap to capture or upload a photo/video of the issue
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-75">
              (Max 10MB · Auto-compressed for quality)
            </p>
            {imageError && (
              <p className="font-label-sm text-label-sm text-red-500 font-medium">
                {imageError}
              </p>
            )}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!base64Image}
            className="w-full bg-primary text-on-primary h-[56px] rounded-xl font-label-lg text-label-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            Continue
          </button>
        </section>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Confirm Location</h2>
          <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-sm border border-surface-variant z-0">
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
            >
              <FlyToMarker center={mapCenter} />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {/* Show existing issues as faint dots so user knows what's nearby */}
              {mockIssues.map(issue => (
                <CircleMarker
                  key={issue.id}
                  center={[issue.lat, issue.lng]}
                  radius={6}
                  pathOptions={{ color: '#EAB308', fillColor: '#EAB308', fillOpacity: 0.5, weight: 2 }}
                />
              ))}

              {/* Current reporting location */}
              <Marker position={mapCenter} />
            </MapContainer>

            <button
              onClick={handleMyLocation}
              disabled={isLocating}
              className={`absolute bottom-2 right-2 bg-surface text-primary p-2 rounded-full shadow-md hover:bg-surface-container-high active:scale-95 transition-all z-[400] flex items-center justify-center border border-outline-variant ${isLocating ? 'opacity-75' : ''}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isLocating ? 'animate-spin' : ''}`}>
                {isLocating ? 'refresh' : 'my_location'}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
            <span className="material-symbols-outlined text-primary">edit_location_alt</span>
            <div>
              <p className="font-label-lg text-label-lg text-on-surface">Selected Location</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Tap map to refine</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="w-12 h-12 border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/30 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button onClick={() => setStep(3)} className="flex-1 bg-primary text-on-primary h-12 rounded-xl font-label-lg text-label-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm">
              Continue
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Category + Description + Submit */}
      {step === 3 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Details & Submit</h2>

          {/* AI Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              <span className="font-label-lg text-label-lg text-on-surface">AI Processing</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              When you submit, our AI agent will analyze your photo and description to automatically categorize, prioritize, and route the issue to the correct department.
            </p>
          </div>

          {/* Optional Category override */}
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-2">Suggest Category (Optional)</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm border transition-all ${selectedCategory === c
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-variant/30'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="block w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-lg text-body-lg placeholder-on-surface-variant resize-none mt-2"
            placeholder="Please describe the issue (e.g., 'The glass is shattered on the sidewalk')"
            rows={4}
            required
          />

          <div className="flex gap-3 mt-2">
            <button onClick={() => setStep(2)} className="w-12 h-12 border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/30 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={!description}
              className="flex-1 bg-primary text-on-primary h-12 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined">send</span>
              Submit Report
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
