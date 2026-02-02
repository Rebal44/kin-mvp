import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <nav className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold">KIN</div>
        <div className="space-x-4">
          <Link to="/pricing" className="hover:text-pink-300 transition">Pricing</Link>
          <Link to="/login" className="bg-white text-purple-900 px-4 py-2 rounded-lg font-semibold hover:bg-pink-100 transition">Get Started</Link>
        </div>
      </nav>
      
      <main className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Your Personal AI
          <br />
          <span className="text-pink-400">That Gets Things Done</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          KIN handles your tasks, bookings, calls, and errands. 
          Just tell it what you need.
        </p>
        
        <div className="flex justify-center gap-4 mb-16">
          <Link 
            to="/login" 
            className="bg-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-pink-600 transition shadow-lg shadow-pink-500/25"
          >
            Start Free Trial
          </Link>
          <a 
            href="https://t.me/KINAssistantBot" 
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition"
          >
            Try on Telegram
          </a>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: '🍽️', title: 'Book Restaurants', desc: 'Reservations made in seconds' },
            { icon: '🛒', title: 'Order Products', desc: 'Find and buy what you need' },
            { icon: '📞', title: 'Make Calls', desc: 'Handle calls on your behalf' },
            { icon: '⏰', title: 'Set Reminders', desc: 'Never forget important tasks' },
            { icon: '📋', title: 'Handle Errands', desc: 'Any task, big or small' },
            { icon: '💬', title: 'Natural Chat', desc: 'Just talk like a human' }
          ].map((feature, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
