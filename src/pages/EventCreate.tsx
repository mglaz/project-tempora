import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { useCreateEvent } from '../hooks/useEvent';

export function EventCreate() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 2,
    timeframe: 'afternoon' as 'morning' | 'afternoon' | 'evening' | 'custom'
  });
  
  const [createdEvent, setCreatedEvent] = useState<{event: any, shareableLink: string} | null>(null);
  const { createEvent, loading, error } = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      const result = await createEvent(
        formData.name,
        formData.description,
        formData.duration,
        formData.timeframe
      );
      setCreatedEvent(result);
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const copyToClipboard = async () => {
    if (createdEvent) {
      try {
        await navigator.clipboard.writeText(createdEvent.shareableLink);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  if (createdEvent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success State */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Created!</h1>
              <p className="text-gray-600">Your scheduling event is ready to share</p>
            </div>

            {/* Event Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{createdEvent.event.name}</h2>
              {createdEvent.event.description && (
                <p className="text-gray-600 mb-4">{createdEvent.event.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-medium">{createdEvent.event.duration} hours</span>
                </div>
                <div>
                  <span className="text-gray-500">Timeframe:</span>
                  <span className="ml-2 font-medium capitalize">{createdEvent.event.timeframe}</span>
                </div>
              </div>
            </div>

            {/* Shareable Link */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Share this link with participants:</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createdEvent.shareableLink}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline">
                  Copy Link
                </Button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Tip:</strong> Send this link to everyone who needs to participate. 
                  They can select their available times and see everyone else's selections in real-time.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Button 
                onClick={() => window.open(createdEvent.shareableLink, '_blank')} 
                variant="primary"
                className="flex-1"
              >
                View Event
              </Button>
              <Button 
                onClick={() => setCreatedEvent(null)} 
                variant="outline"
                className="flex-1"
              >
                Create Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Set up a scheduling event to find the best time for your group</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Team Meeting, Coffee Chat, Project Review"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add any additional details about the meeting..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Duration
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Timeframe
              </label>
              <select
                id="timeframe"
                name="timeframe"
                value={formData.timeframe}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="morning">Morning (8 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="evening">Evening (5 PM - 10 PM)</option>
                <option value="custom">All Day (8 AM - 10 PM)</option>
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              loading={loading}
              disabled={!formData.name.trim() || loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}