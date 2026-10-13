import React from 'react';
import { Link } from "react-router-dom";

const features = [
  {
    icon: "🧭",
    title: "Licensed Local Guides",
    description: "Browse verified, ministry-licensed guides with real reviews and curated itineraries tailored to your interests."
  },
  {
    icon: "📅",
    title: "Instant Booking",
    description: "Check real-time availability and secure your tour in seconds — no back-and-forth needed."
  },
  {
    icon: "🏛️",
    title: "Ministry Approved",
    description: "Every guide and agency is vetted and certified by the Albanian Ministry of Tourism."
  },
  {
    icon: "💬",
    title: "Multilingual Guides",
    description: "Find guides who speak your language for a smooth, enriching travel experience."
  },
  {
    icon: "🔒",
    title: "Secure & Transparent",
    description: "Your bookings and payments are protected and fully traceable from start to finish."
  },
  {
    icon: "⭐",
    title: "Authentic Reviews",
    description: "Trust honest feedback from verified tourists who have experienced it firsthand."
  }
];

const stats = [
  { value: "200+", label: "Local Guides" },
  { value: "50+", label: "Tourism Agencies" },
  { value: "1,000+", label: "Happy Tourists" },
  { value: "100+", label: "Unique Tours" },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-teal-700">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm px-5 py-2 rounded-full mb-8">
            <span>🏔️</span>
            <span>Albania's #1 Tourism Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Discover Albania's
            <span className="block bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">
              Hidden Gems
            </span>
          </h1>

          <p className="text-xl text-blue-100 leading-relaxed mb-10 max-w-2xl mx-auto">
            Connect with licensed guides, book authentic experiences, and explore breathtaking landscapes — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/select-account"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 px-8 py-4 rounded-full text-lg font-bold shadow-2xl hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition-all duration-200"
            >
              Explore features
            </a>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-6 text-blue-200 text-sm">
            <span>✓ Trusted by 200+ local guides</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ Ministry of Tourism verified</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ 1,000+ happy travellers</span>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white dark:bg-gray-900 py-16 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-blue-700 mb-1">{s.value}</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-gray-50 dark:bg-gray-900 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need for the perfect trip
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              From discovery to departure, we've got every step of your Albanian adventure covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-blue-800 to-teal-600 py-24 text-center text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to explore Albania?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of travellers who have discovered the real Albania through our platform.
          </p>
          <Link
            to="/select-account"
            className="inline-flex items-center gap-2 bg-white text-blue-800 px-10 py-4 rounded-full text-lg font-bold shadow-2xl hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Your Journey
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

    </div>
  );
}