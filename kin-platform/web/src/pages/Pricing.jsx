import React from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      credits: 100,
      features: ['100 credits/month', 'Telegram access', 'Basic tasks', 'Email support']
    },
    {
      name: 'Pro',
      price: '$29',
      credits: 500,
      popular: true,
      features: ['500 credits/month', 'Priority processing', 'Advanced tasks', 'Priority support', 'API access']
    },
    {
      name: 'Business',
      price: '$99',
      credits: 2000,
      features: ['2000 credits/month', 'Dedicated agent', 'Custom integrations', '24/7 support', 'Team management']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <nav className="flex justify-between items-center p-6">
        <Link to="/" className="text-2xl font-bold">KIN</Link>
        <Link to="/login" className="bg-white text-purple-900 px-4 py-2 rounded-lg font-semibold">Get Started</Link>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Simple Pricing</h1>
        <p className="text-xl text-gray-300 text-center mb-12">Pay for what you use. Credits never expire.</p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`p-8 rounded-2xl ${
                plan.popular 
                  ? 'bg-pink-500/20 border-2 border-pink-500 scale-105' 
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-400">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> {feature}
                  </li>
                ))}
              </ul>
              
              <Link
                to="/login"
                className={`block text-center py-3 rounded-lg font-bold transition ${
                  plan.popular
                    ? 'bg-pink-500 hover:bg-pink-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 text-gray-400">
          <p>Need more? Contact us for enterprise pricing.</p>
        </div>
      </main>
    </div>
  );
}
