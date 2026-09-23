import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, User, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b-2 border-gray-100 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Left: Hamburger + Back Button */}
          <div className="flex items-center gap-3 w-1/3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-black hover:text-gray-600 focus:outline-none"
            >
              <Menu size={40} strokeWidth={1.5} />
            </button>
            {!isHomePage && (
              <button
                onClick={() => navigate(-1)}
                className="text-[#3b5998] hover:text-[#2d4373] focus:outline-none flex items-center gap-1 font-bold text-sm"
                title="Go Back"
              >
                <ArrowLeft size={26} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Logo (Center) */}
          <div className="w-1/3 flex justify-center">
            <Link to="/" className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-1">
                <img src="/logo-icon.jpg" alt="PaveTrack Icon" className="h-12 w-auto object-contain mix-blend-multiply" />
                <img src="/logo-text.jpg" alt="PaveTrack Text" className="h-10 w-auto object-contain mix-blend-multiply" />
              </div>
            </Link>
          </div>

          {/* Profile Icon (Right) */}
          <div className="flex items-center w-1/3 justify-end relative">
            {user ? (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-black hover:text-gray-600 focus:outline-none bg-gray-100 p-2 rounded-full"
              >
                <User size={28} strokeWidth={2} />
              </button>
            ) : (
              <Link to="/login" className="text-black hover:text-gray-600 focus:outline-none">
                <User size={36} strokeWidth={2} fill="currentColor" />
              </Link>
            )}

            {/* Dropdown for authenticated users */}
            {dropdownOpen && user && (
              <div className="absolute right-0 top-12 w-48 bg-white border rounded shadow-lg py-2 mt-2">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-semibold">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Dashboard</Link>
                {user.role === 'municipal' && (
                  <Link to="/all-complaints" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">All Complaints</Link>
                )}
                {user.role === 'contractor' && (
                  <Link to="/my-assignments" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">My Assignments</Link>
                )}
                {(!user.role || user.role === 'citizen') && (
                  <Link to="/report" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Report Pothole</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown — role-based */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-64 bg-white border shadow-lg rounded-br-lg py-2 z-50">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-gray-800 hover:bg-gray-50 border-b">Home</Link>
          <Link to="/track" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-gray-800 hover:bg-gray-50 border-b">Track Complaint</Link>
          <Link to="/map" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-gray-800 hover:bg-gray-50 border-b">Map View</Link>

          {/* Citizen-only */}
          {(!user || user.role === 'citizen') && (
            <Link to="/report" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-gray-800 hover:bg-gray-50 border-b">Report Pothole</Link>
          )}

          {/* Municipal-only */}
          {user?.role === 'municipal' && (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-[#3b5998] font-bold hover:bg-gray-50 border-b">Dashboard</Link>
              <Link to="/all-complaints" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-[#3b5998] font-bold hover:bg-gray-50 border-b">All Complaints</Link>
            </>
          )}

          {/* Contractor-only */}
          {user?.role === 'contractor' && (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-[#3b5998] font-bold hover:bg-gray-50 border-b">Dashboard</Link>
              <Link to="/my-assignments" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-[#3b5998] font-bold hover:bg-gray-50 border-b">My Assignments</Link>
            </>
          )}

          <Link to="/about" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-gray-800 hover:bg-gray-50">About Us</Link>
        </div>
      )}
    </nav>
  );
}
