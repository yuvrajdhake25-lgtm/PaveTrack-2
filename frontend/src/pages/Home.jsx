import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Camera, Target, Lightbulb } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div
        className="relative w-full h-[600px] bg-cover bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80')" }}
      >
        {/* Overlay for better text readability on background */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 text-center mt-[-40px]">
          
          {/* Logo Area inside Hero */}
          <div className="flex flex-col items-center mb-6 bg-white/95 px-8 py-6 rounded-xl shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src="/logo-icon.jpg" alt="PaveTrack Icon" className="h-24 md:h-32 w-auto object-contain mix-blend-multiply" />
              <img src="/logo-text.jpg" alt="PaveTrack Text" className="h-20 md:h-24 w-auto object-contain mix-blend-multiply" />
            </div>
          </div>

          {/* Tagline */}
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-12 max-w-3xl drop-shadow-lg leading-snug">
            "Don't wait for anyone to report potholes. Detect the potholes nobody reported."
          </h1>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-2xl px-4">
            <Link
              to="/track"
              className="flex items-center justify-center gap-3 bg-white/80 hover:bg-white text-black font-bold py-4 px-8 rounded-full flex-1 transition duration-300 border-2 border-black shadow-lg"
            >
              <Search size={22} strokeWidth={2.5} />
              Track Complaint
            </Link>
            
            <Link
              to="/report"
              className="flex items-center justify-center gap-3 bg-[#1e2a4a]/90 hover:bg-[#1e2a4a] text-white font-bold py-4 px-8 rounded-full flex-1 transition duration-300 shadow-lg border border-[#1e2a4a]"
            >
              {/* Pencil icon for report */}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              Report a Pothole
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white w-full border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center justify-items-center">
            
            {/* Feature 1 */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
                {/* Road Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2 2 22"/><path d="M14 2l8 20"/><path d="M12 2v4"/><path d="M12 10v4"/><path d="M12 18v4"/></svg>
              </div>
              <span className="font-bold text-blue-900 text-sm leading-tight">Safe<br/>Roads</span>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
                <Camera size={32} />
              </div>
              <span className="font-bold text-blue-900 text-sm leading-tight text-left">Transparent<br/>Process</span>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
                <Target size={32} fill="currentColor" className="text-blue-700/80" />
              </div>
              <span className="font-bold text-blue-900 text-sm leading-tight">Accountability</span>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
                <Lightbulb size={32} />
              </div>
              <span className="font-bold text-blue-900 text-sm leading-tight text-left">Smart<br/>cities</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
