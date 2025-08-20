import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DayModalProps, TimeSlot } from '../../lib/types';
import { formatTime, generateTimeSlots, isTimeSlotSelected, cn } from '../../lib/utils';

export function DayModal({
  isOpen,
  onClose,
  date,
  event,
  timeSlots,
  participants,
  onTimeSlotToggle,
  currentParticipant
}: DayModalProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  // Generate available time slots for this day
  useEffect(() => {
    if (isOpen && date) {
      const generatedSlots = generateTimeSlots(date, event.duration, event.timeframe);
      setAvailableSlots(generatedSlots);
      
      // Set currently selected slots
      if (currentParticipant) {
        const currentlySelected = new Set(
          timeSlots
            .filter(slot => slot.participantIds.includes(currentParticipant.id))
            .map(slot => `${slot.startTime}-${slot.endTime}`)
        );
        setSelectedSlots(currentlySelected);
      }
    }
  }, [isOpen, date, event, timeSlots, currentParticipant]);

  const handleSlotToggle = (slot: TimeSlot) => {
    if (!currentParticipant) return;

    const slotKey = `${slot.startTime}-${slot.endTime}`;
    const newSelectedSlots = new Set(selectedSlots);
    
    if (selectedSlots.has(slotKey)) {
      newSelectedSlots.delete(slotKey);
    } else {
      newSelectedSlots.add(slotKey);
    }
    
    setSelectedSlots(newSelectedSlots);

    // Find or create the time slot with participants
    const existingSlot = timeSlots.find(
      ts => ts.date === date && ts.startTime === slot.startTime && ts.endTime === slot.endTime
    );

    const updatedSlot: TimeSlot = existingSlot 
      ? {
          ...existingSlot,
          participantIds: newSelectedSlots.has(slotKey)
            ? [...existingSlot.participantIds.filter(id => id !== currentParticipant.id), currentParticipant.id]
            : existingSlot.participantIds.filter(id => id !== currentParticipant.id)
        }
      : {
          ...slot,
          participantIds: newSelectedSlots.has(slotKey) ? [currentParticipant.id] : []
        };

    onTimeSlotToggle(updatedSlot);
  };

  // Get participants for a specific time slot
  const getSlotParticipants = (slot: TimeSlot) => {
    const existingSlot = timeSlots.find(
      ts => ts.startTime === slot.startTime && ts.endTime === slot.endTime
    );
    
    if (!existingSlot) return [];
    
    return participants.filter(p => existingSlot.participantIds.includes(p.id));
  };

  // Check if current participant has selected this slot
  const isSlotSelected = (slot: TimeSlot) => {
    const slotKey = `${slot.startTime}-${slot.endTime}`;
    return selectedSlots.has(slotKey);
  };

  const dateObj = parseISO(date);
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select Times for ${formattedDate}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            {currentParticipant 
              ? `Select the ${event.duration}-hour time slots when you're available on this day.`
              : 'Please enter your name first to select time slots.'
            }
          </p>
        </div>

        {/* Time Slots */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Available {event.duration}-hour time slots:
          </h4>
          
          {availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No time slots available for this timeframe ({event.timeframe})
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableSlots.map((slot) => {
                const slotParticipants = getSlotParticipants(slot);
                const isSelected = isSlotSelected(slot);
                const participantCount = slotParticipants.length;
                
                return (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    onClick={() => handleSlotToggle(slot)}
                    disabled={!currentParticipant}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                      'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : participantCount > 0
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      {isSelected && (
                        <div className="text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Participants indicator */}
                    {participantCount > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          {participantCount} participant{participantCount !== 1 ? 's' : ''} available:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {slotParticipants.map((participant) => (
                            <div
                              key={participant.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: participant.color }}
                            >
                              {participant.name}
                              {currentParticipant?.id === participant.id && ' (You)'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {participantCount === 0 && !isSelected && (
                      <div className="text-xs text-gray-500">
                        No one available yet
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        {currentParticipant && selectedSlots.size > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-800 text-sm">
              ✓ You've selected {selectedSlots.size} time slot{selectedSlots.size !== 1 ? 's' : ''} for this day.
              Your selections are automatically saved.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="primary">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}