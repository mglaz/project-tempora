import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/calendar/Calendar';
import { Button } from '../components/ui/Button';
import { useEvent } from '../hooks/useEvent';
import { Participant, TimeSlot } from '../lib/types';
import { calculateCommonTimeSlots, formatTime, formatDate } from '../lib/utils';

interface EventParticipateProps {
  eventId: string;
}

export function EventParticipate({ eventId }: EventParticipateProps) {
  const [eventState, eventActions] = useEvent(eventId);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);

  const { event, participants, timeSlots, commonTimeSlots, loading, error } = eventState;

  // Handle joining as a participant
  const handleJoinEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) return;

    setIsJoining(true);
    try {
      const participant = await eventActions.addParticipant(participantName.trim());
      if (participant) {
        setCurrentParticipant(participant);
        setParticipantName('');
      }
    } catch (error) {
      console.error('Failed to join event:', error);
    } finally {
      setIsJoining(false);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (!currentParticipant) return;

    // Update local state immediately for responsiveness
    setSelectedTimeSlots(prev => {
      const existingIndex = prev.findIndex(
        slot => slot.date === timeSlot.date && 
                slot.startTime === timeSlot.startTime && 
                slot.endTime === timeSlot.endTime
      );

      if (existingIndex >= 0) {
        // Remove if exists
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add if doesn't exist
        return [...prev, timeSlot];
      }
    });

    // Save to Firebase (will update via real-time listener)
    eventActions.saveSelections(currentParticipant.id, [timeSlot]);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "This event doesn't exist or the link is invalid."}
          </p>
          <Button onClick={() => window.location.href = '/'} variant="primary">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.name}</h1>
          {event.description && (
            <p className="text-gray-600 text-lg">{event.description}</p>
          )}
        </div>

        {/* Join Form - Show if not joined yet */}
        {!currentParticipant && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Join this event</h2>
            <form onSubmit={handleJoinEvent} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <Button
                type="submit"
                loading={isJoining}
                disabled={!participantName.trim() || isJoining}
                className="w-full"
              >
                {isJoining ? 'Joining...' : 'Join Event'}
              </Button>
            </form>
          </div>
        )}

        {/* Main Content - Show if joined */}
        {currentParticipant && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar - Main content */}
            <div className="lg:col-span-2">
              <Calendar
                event={event}
                participants={participants}
                timeSlots={timeSlots}
                onTimeSlotSelect={handleTimeSlotSelect}
                currentParticipant={currentParticipant}
              />
            </div>

            {/* Sidebar - Common times and participants */}
            <div className="space-y-6">
              {/* Best Times Panel */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Best Times
                </h3>
                
                {commonTimeSlots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm">No common times yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start selecting your available times
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {commonTimeSlots.slice(0, 5).map((slot, index) => (
                      <div
                        key={`${slot.date}-${slot.startTime}`}
                        className={`p-3 rounded-lg border-2 ${
                          slot.conflictLevel === 'high' 
                            ? 'border-green-300 bg-green-50' 
                            : slot.conflictLevel === 'medium'
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-900">
                            {formatDate(slot.date)}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            slot.conflictLevel === 'high' 
                              ? 'bg-green-200 text-green-800' 
                              : slot.conflictLevel === 'medium'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            #{index + 1}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {slot.participantCount} of {participants.length} available
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {slot.participantNames.slice(0, 3).map((name, i) => (
                            <span 
                              key={i}
                              className="text-xs bg-white px-2 py-1 rounded-full border"
                            >
                              {name}
                            </span>
                          ))}
                          {slot.participantNames.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{slot.participantNames.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Participants Panel */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Participants ({participants.length})
                </h3>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div 
                      key={participant.id}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: participant.color }}
                      />
                      <span className="text-gray-900">
                        {participant.name}
                        {currentParticipant?.id === participant.id && ' (You)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Panel */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Invite Others
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Share this link to invite more participants:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border border-blue-300 rounded-lg bg-white"
                  />
                  <Button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}