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

import AdminDashboard from './pages/AdminDashboard';
import PendingApproval from './pages/PendingApproval';

const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const MunicipalRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'municipal' && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (user.role === 'municipal' && user.approval_status === 'pending') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const ContractorRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'contractor' && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (user.role === 'contractor' && user.approval_status === 'pending') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Renders the correct dashboard based on user role and approval status
const RoleDashboard = () => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'municipal') {
    if (user.approval_status === 'pending') {
      return <PendingApproval />;
    }
    return <MunicipalDashboard />;
  }

  if (user.role === 'contractor') {
    if (user.approval_status === 'pending') {
      return <PendingApproval />;
    }
    return <ContractorDashboard />;
  }

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
              {/* Public & Citizen Accessible Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/complaints/:code" element={<PotholeDetails />} />
              <Route path="/complaints/:code/verification" element={<AIVerification />} />
              <Route path="/complaints/:code/comparison" element={<BeforeAfter />} />
              <Route path="/map" element={<PotholeMap />} />
              
              {/* Report Pothole (available to logged-in users including pending accounts) */}
              <Route path="/report" element={
                <ProtectedRoute>
                  <ReportPothole />
                </ProtectedRoute>
              } />

              {/* Central Dynamic Role Dashboard (shows PendingApproval when pending) */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleDashboard />
                </ProtectedRoute>
              } />

              {/* Dedicated Admin Portal */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

              {/* Municipal Only Task Pages (Blocked if pending) */}
              <Route path="/all-complaints" element={
                <MunicipalRoute>
                  <AllComplaints />
                </MunicipalRoute>
              } />

              {/* Contractor Only Task Pages (Blocked if pending) */}
              <Route path="/my-assignments" element={
                <ContractorRoute>
                  <MyAssignments />
                </ContractorRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
