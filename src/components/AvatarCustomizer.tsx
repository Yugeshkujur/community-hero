import { useState, useEffect, useRef } from 'react';

interface AvatarCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
  initialSeed: string;
}

const TOPS = ['dreads', 'frizzle', 'shaggy', 'shortCurly', 'shortFlat', 'shortRound', 'shortWaved', 'sides', 'straight01', 'straight02', 'curvy', 'hijab', 'turban', 'winterHat01'];
const SKIN_COLORS = ['f8d25c', 'fd9841', 'ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '614335'];
const HAIR_COLORS = ['2c1b18', '4a3123', 'b58143', 'd6b370', '724133', 'c93305', 'f59797', 'ffffff'];
const CLOTHING_COLORS = ['262e33', '65c9ff', '5199e4', '25557c', 'e6e6e6', '929598', '3c4f5c', 'ff488e', 'ff5c5c', 'ffffff'];

const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export default function AvatarCustomizer({ isOpen, onClose, onSave, initialSeed }: AvatarCustomizerProps) {
  const [top, setTop] = useState(TOPS[8]);
  const [skinColor, setSkinColor] = useState(SKIN_COLORS[3]);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
  const [clothingColor, setClothingColor] = useState(CLOTHING_COLORS[1]);
  const [seed, setSeed] = useState(initialSeed);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_DIM = 400; // Small size for avatar
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

      // Compress
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      onSave(compressedBase64);
      setIsUploading(false);
    };
    img.src = objectUrl;
  };

  useEffect(() => {
    if (isOpen) {
      setSeed(initialSeed);
      randomize();
    }
  }, [isOpen, initialSeed]);

  const randomize = () => {
    setTop(randomItem(TOPS));
    setSkinColor(randomItem(SKIN_COLORS));
    setHairColor(randomItem(HAIR_COLORS));
    setClothingColor(randomItem(CLOTHING_COLORS));
  };

  if (!isOpen) return null;

  const currentAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=${top}&skinColor=${skinColor}&hairColor=${hairColor}&clothingColor=${clothingColor}`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Avatar Studio</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative w-32 h-32 rounded-full border-4 border-primary shadow-lg overflow-hidden bg-surface-variant">
              <img src={currentAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
            </div>
            
            <button 
              onClick={randomize}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-container-high transition-colors text-label-lg font-label-lg shadow-sm border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[18px]">shuffle</span>
              Shuffle Looks
            </button>
          </div>

          <div className="space-y-6">
            {/* Top Style */}
            <div>
              <label className="font-label-lg text-label-lg text-on-surface-variant mb-2 block">Hair & Accessories</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {TOPS.map(t => (
                  <button 
                    key={t}
                    onClick={() => setTop(t)}
                    title={t}
                    className={`h-10 rounded-lg border flex items-center justify-center capitalize text-[10px] overflow-hidden ${
                      top === t ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' : 'border-outline-variant bg-surface hover:bg-surface-variant/50 text-on-surface'
                    }`}
                  >
                    {t.replace(/([A-Z])/g, ' $1').trim().split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Color */}
            <div>
              <label className="font-label-lg text-label-lg text-on-surface-variant mb-2 block">Skin Tone</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => setSkinColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${skinColor === c ? 'border-primary scale-110 shadow-md' : 'border-outline-variant/30 hover:scale-105'}`}
                    style={{ backgroundColor: `#${c}` }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div>
              <label className="font-label-lg text-label-lg text-on-surface-variant mb-2 block">Hair Color</label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => setHairColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${hairColor === c ? 'border-primary scale-110 shadow-md' : 'border-outline-variant/30 hover:scale-105'}`}
                    style={{ backgroundColor: `#${c}` }}
                  />
                ))}
              </div>
            </div>

            {/* Clothing Color */}
            <div>
              <label className="font-label-lg text-label-lg text-on-surface-variant mb-2 block">Outfit Color</label>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => setClothingColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${clothingColor === c ? 'border-primary scale-110 shadow-md' : 'border-outline-variant/30 hover:scale-105'}`}
                    style={{ backgroundColor: `#${c}` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex justify-between gap-3 items-center">
          <div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 text-primary font-label-lg text-label-lg hover:bg-primary/10 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">upload</span>
              {isUploading ? 'Uploading...' : 'Upload Photo instead'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleCustomUpload} 
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-label-lg text-label-lg text-on-surface hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onSave(currentAvatarUrl);
              }}
              disabled={isUploading}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-label-lg text-label-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Save Avatar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
