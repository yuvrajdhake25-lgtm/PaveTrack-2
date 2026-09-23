import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MunicipalDashboard from './pages/MunicipalDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import AllComplaints from './pages/AllComplaints';
import MyAssignments from './pages/MyAssignments';
import ReportPothole from './pages/ReportPothole';
import TrackComplaint from './pages/TrackComplaint';
import PotholeDetails from './pages/PotholeDetails';
import AIVerification from './pages/AIVerification';
import BeforeAfter from './pages/BeforeAfter';
import PotholeMap from './pages/PotholeMap';
import AboutUs from './pages/AboutUs';

const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Renders the correct dashboard based on user role
const RoleDashboard = () => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'municipal') return <MunicipalDashboard />;
  if (user.role === 'contractor') return <ContractorDashboard />;
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/complaints/:code" element={<PotholeDetails />} />
              <Route path="/complaints/:code/verification" element={<AIVerification />} />
              <Route path="/complaints/:code/comparison" element={<BeforeAfter />} />
              <Route path="/map" element={<PotholeMap />} />
              <Route path="/all-complaints" element={
                <ProtectedRoute>
                  <AllComplaints />
                </ProtectedRoute>
              } />
              <Route path="/my-assignments" element={
                <ProtectedRoute>
                  <MyAssignments />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleDashboard />
                </ProtectedRoute>
              } />
              <Route path="/report" element={
                <ProtectedRoute>
                  <ReportPothole />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
