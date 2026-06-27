import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import HomeFeed from './pages/HomeFeed';
import MapView from './pages/MapView';
import ReportIssue from './pages/ReportIssue';
import IssueTracking from './pages/IssueTracking';
import ProfileImpact from './pages/ProfileImpact';
import AuthorityQueue from './pages/authority/Queue';
import AuthorityIssueDetail from './pages/authority/IssueDetail';
import AuthorityDashboard from './pages/authority/Dashboard';
import AuthorityProfile from './pages/authority/AuthorityProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Citizen App */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/issue/:id" element={<IssueTracking />} />
          <Route path="/profile" element={<ProfileImpact />} />
        </Route>

        {/* Authority Console */}
        <Route element={<Layout />}>
          <Route path="/authority" element={<AuthorityQueue />} />
          <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
          <Route path="/authority/issue/:id" element={<AuthorityIssueDetail />} />
          <Route path="/authority/profile" element={<AuthorityProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
