import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, MapPin, Camera, Target, Lightbulb,
  ShieldCheck, Cpu, TrendingUp, ArrowRight, ChevronDown
} from "lucide-react";

/* animated counter */
function Counter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const step = Math.ceil(end / (duration / 16));
          let cur = 0;
          const timer = setInterval(() => {
            cur = Math.min(cur + step, end);
            setCount(cur);
            if (cur >= end) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">

      {/* HERO */}
      <section
        className="relative w-full min-h-screen flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto gap-8">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4 shadow-2xl">
            <img src="/logo-icon.jpg" alt="PaveTrack Icon" className="h-14 w-auto object-contain mix-blend-lighten" />
            <img src="/logo-text.jpg" alt="PaveTrack" className="h-10 w-auto object-contain mix-blend-lighten" />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-xl">
            Smarter Roads,<br />
            <span className="text-blue-400">Safer Cities.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            AI-powered pothole detection, transparent repair tracking, and real-time accountability — built for citizens and civic authorities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            <Link
              to="/report"
              className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl flex-1 transition-all duration-300 shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              <Camera size={20} />
              Report a Pothole
            </Link>
            <Link
              to="/track"
              className="flex items-center justify-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur text-white font-bold py-4 px-8 rounded-xl flex-1 transition-all duration-300 border border-white/30 hover:-translate-y-0.5"
            >
              <Search size={20} />
              Track Complaint
            </Link>
          </div>

          <div className="mt-4 flex flex-col items-center gap-1 text-white/40 text-xs animate-bounce">
            <ChevronDown size={20} />
            <span>Scroll to explore</span>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#0f172a] py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { end: 1200, suffix: "+", label: "Potholes Reported" },
            { end: 87, suffix: "%", label: "AI Accuracy Rate" },
            { end: 340, suffix: "+", label: "Repairs Verified" },
            { end: 15, suffix: " Cities", label: "Covered" },
          ].map(({ end, suffix, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-4xl font-black text-blue-400">
                <Counter end={end} suffix={suffix} />
              </span>
              <span className="text-white/60 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">How it works</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4">From Report to Repair in 3 Steps</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">A transparent, end-to-end workflow that keeps everyone accountable.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: <Camera size={28} className="text-blue-600" />,
                bg: "bg-blue-50",
                title: "Citizen Reports",
                desc: "Upload a photo of the pothole. Our AI instantly analyses severity, location, and road context.",
              },
              {
                step: "02",
                icon: <ShieldCheck size={28} className="text-violet-600" />,
                bg: "bg-violet-50",
                title: "Municipal Reviews",
                desc: "Verified officers review AI findings, assign certified contractors, and set repair timelines.",
              },
              {
                step: "03",
                icon: <TrendingUp size={28} className="text-emerald-600" />,
                bg: "bg-emerald-50",
                title: "AI Verifies Repair",
                desc: "Before & after photos are scored by AI. Repair quality is logged and publicly accessible.",
              },
            ].map(({ step, icon, bg, title, desc }) => (
              <div key={step} className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <span className="absolute top-6 right-6 text-6xl font-black text-gray-100 select-none">{step}</span>
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-5`}>
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Platform Features</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4">Everything Built In</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">PaveTrack bundles reporting, AI analysis, live maps, and role-based dashboards in one cohesive system.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Cpu size={24} className="text-blue-600" />,
                bg: "bg-blue-50",
                title: "Gemini AI Verification",
                desc: "Multi-metric AI scoring of repair quality using GPS, angle, background, and surface analysis.",
                link: "/ai-verification",
              },
              {
                icon: <MapPin size={24} className="text-rose-600" />,
                bg: "bg-rose-50",
                title: "Live Pothole Map",
                desc: "Interactive heatmap of all reported and resolved potholes across the city in real time.",
                link: "/map",
              },
              {
                icon: <Search size={24} className="text-amber-600" />,
                bg: "bg-amber-50",
                title: "Complaint Tracking",
                desc: "Citizens get a unique complaint ID and can track every status update from report to fix.",
                link: "/track",
              },
              {
                icon: <Camera size={24} className="text-violet-600" />,
                bg: "bg-violet-50",
                title: "Before & After Comparison",
                desc: "Side-by-side photographic evidence with AI-scored improvement metrics for every repair.",
                link: "/before-after",
              },
              {
                icon: <Target size={24} className="text-emerald-600" />,
                bg: "bg-emerald-50",
                title: "Role-Based Dashboards",
                desc: "Separate, purpose-built portals for Citizens, Municipal Officers, Contractors, and Admins.",
                link: "/dashboard",
              },
              {
                icon: <Lightbulb size={24} className="text-orange-500" />,
                bg: "bg-orange-50",
                title: "Smart City Ready",
                desc: "Designed to integrate with civic infrastructure — scalable, auditable, and transparent.",
                link: "/about",
              },
            ].map(({ icon, bg, title, desc, link }) => (
              <Link
                key={title}
                to={link}
                className="group flex flex-col gap-4 p-7 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                  Explore <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative overflow-hidden bg-[#0f172a] py-20">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-700/30 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-violet-700/20 rounded-full blur-[80px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            See a pothole?<br />
            <span className="text-blue-400">Report it in 60 seconds.</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of citizens making their roads safer. Every report matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/report"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              <Camera size={18} />
              Report a Pothole
            </Link>
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER STRIP */}
      <footer className="bg-[#080e1c] py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.jpg" alt="PaveTrack" className="h-7 w-auto mix-blend-lighten opacity-80" />
            <span className="text-white/40 text-sm">PaveTrack &copy; 2026</span>
          </div>
          <div className="flex gap-6 text-white/40 text-sm">
            <Link to="/about" className="hover:text-white/70 transition-colors">About</Link>
            <Link to="/map" className="hover:text-white/70 transition-colors">Map</Link>
            <Link to="/track" className="hover:text-white/70 transition-colors">Track</Link>
            <Link to="/report" className="hover:text-white/70 transition-colors">Report</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
