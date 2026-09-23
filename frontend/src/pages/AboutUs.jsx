import React from 'react';
import { ShieldCheck, Eye, Phone } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="bg-white min-h-screen py-8 px-4 font-sans flex flex-col">
      <div className="container mx-auto max-w-4xl flex-1 flex flex-col">
        <h1 className="text-3xl font-extrabold text-[#1e2a4a] mb-6">About Us</h1>
        
        {/* Hero Image */}
        <div className="w-full h-48 md:h-72 bg-gray-200 rounded-md overflow-hidden mb-8 shadow-sm">
          {/* Using a high-quality city skyline image as a placeholder for the vector illustration */}
          <img 
            src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1200" 
            alt="City Skyline" 
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Intro Text */}
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-[#1e2a4a] mb-2">PaveTrack</h2>
          <p className="text-gray-500 font-medium text-[17px] leading-snug">
            A simple platform to report, track and<br className="hidden sm:block" />
            verify pothole repairs for safer and better<br className="hidden sm:block" />
            roads.
          </p>
        </div>

        {/* Info List Items */}
        <div className="flex flex-col gap-7">
          
          {/* Mission */}
          <div className="flex items-center gap-5">
            <div className="w-[60px] h-[60px] rounded-full bg-[#e8f0fe] flex items-center justify-center shrink-0">
              <ShieldCheck size={32} className="text-[#1e2a4a]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-[#1e2a4a] mb-0.5">Our Mission</h3>
              <p className="text-[#6b7b9e] font-medium text-base">Safer roads for better tomorrow.</p>
            </div>
          </div>

          {/* Vision */}
          <div className="flex items-center gap-5">
            <div className="w-[60px] h-[60px] rounded-full bg-[#1e2a4a] flex items-center justify-center shrink-0 shadow-sm">
              <Eye size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-[#1e2a4a] mb-0.5">Our Vision</h3>
              <p className="text-[#6b7b9e] font-medium text-base">Smart cities with efficient infrastructure.</p>
            </div>
          </div>

          {/* Contact Us */}
          <div className="flex items-center gap-5">
            <div className="w-[60px] h-[60px] rounded-full bg-[#e8f0fe] flex items-center justify-center shrink-0">
              <Phone size={32} className="text-[#1e2a4a]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-[#1e2a4a] mb-0.5">Contact Us</h3>
              <p className="text-[#6b7b9e] font-medium text-base">Support pavetrack@gmail.com</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
