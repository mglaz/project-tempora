import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/Button';
import { EventCreate } from './pages/EventCreate';
import { EventParticipate } from './pages/EventParticipate';

type Route = 'home' | 'create' | 'event';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [eventId, setEventId] = useState<string | null>(null);

  // Handle URL routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/event/')) {
      const id = path.split('/event/')[1];
      setEventId(id);
      setCurrentRoute('event');
    } else if (path === '/create') {
      setCurrentRoute('create');
    } else {
      setCurrentRoute('home');
    }
  }, []);

  const navigateTo = (route: Route, id?: string) => {
    if (route === 'event' && id) {
      window.history.pushState({}, '', `/event/${id}`);
      setEventId(id);
    } else if (route === 'create') {
      window.history.pushState({}, '', '/create');
    } else {
      window.history.pushState({}, '', '/');
    }
    setCurrentRoute(route);
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/event/')) {
        const id = path.split('/event/')[1];
        setEventId(id);
        setCurrentRoute('event');
      } else if (path === '/create') {
        setCurrentRoute('create');
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render based on current route
  if (currentRoute === 'create') {
    return <EventCreate />;
  }

  if (currentRoute === 'event' && eventId) {
    return <EventParticipate eventId={eventId} />;
  }

  // Home page
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
                onClick={() => navigateTo('create')}
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
                  id="event-link"
                  placeholder="Paste event link here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('event-link') as HTMLInputElement;
                    const link = input.value;
                    // Extract event ID from link
                    const match = link.match(/\/event\/([a-zA-Z0-9]+)/);
                    if (match) {
                      navigateTo('event', match[1]);
                    } else if (link.length > 0) {
                      // Try using the input as event ID directly
                      navigateTo('event', link);
                    }
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Join Event
                </button>
              </div>
            </div>
          </div>

          {/* Demo Event for Testing */}
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <h3 className="font-semibold text-gray-700 mb-2">🧪 Test the App</h3>
            <p className="text-sm text-gray-600 mb-3">
              Want to test the app without Firebase? Try our demo event:
            </p>
            <Button
              onClick={() => navigateTo('event', 'demo-event-123')}
              variant="outline"
              size="sm"
            >
              Open Demo Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;