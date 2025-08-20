import React, { useState } from 'react';
import { Button } from './components/ui/Button';
// Temporarily using simplified EventCreate without Firebase
// import { EventCreate } from './pages/EventCreate';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'create'>('home');

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Event</h1>
            <p className="text-gray-600">Demo form - Firebase integration needed for full functionality</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <p className="text-gray-600 mb-4">Event creation form would go here.</p>
            <p className="text-sm text-gray-500 mb-6">
              The full EventCreate component requires Firebase configuration to work properly.
            </p>
            <Button 
              onClick={() => setCurrentView('home')}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Project Tempora</h1>
          <p className="text-lg opacity-90">Find the perfect time for your group meetings</p>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Get Started</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Create Event Card */}
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create New Event</h3>
              <p className="text-gray-600 mb-4">
                Set up a new scheduling event and get a shareable link for participants.
              </p>
              <Button
                onClick={() => setCurrentView('create')}
                className="w-full"
              >
                Create Event
              </Button>
            </div>

            {/* Join Event Card */}
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-green-600 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Join Event</h3>
              <p className="text-gray-600 mb-4">
                Have a link? Enter it below to participate in an existing event.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste event link here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Join Event
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-4">🚀 Basic App Working!</h3>
            <div className="text-sm text-gray-600">
              <p className="mb-2">✅ React is working</p>
              <p className="mb-2">✅ Tailwind CSS is working</p>
              <p className="mb-2">✅ Basic routing is working</p>
              <p>🔄 Ready to add back complex components</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;