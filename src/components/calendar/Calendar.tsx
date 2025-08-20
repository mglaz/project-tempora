import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';
import { CalendarProps, TimeSlot } from '../../lib/types';
import { cn } from '../../lib/utils';
import { DayModal } from './DayModal';

export function Calendar({ 
  event, 
  participants, 
  timeSlots, 
  onTimeSlotSelect,
  currentParticipant 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Get calendar days for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get availability data for each day
  const getDayAvailability = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayTimeSlots = timeSlots.filter(slot => slot.date === dateString);
    const participantCount = new Set(
      dayTimeSlots.flatMap(slot => slot.participantIds)
    ).size;
    
    return {
      hasAvailability: dayTimeSlots.length > 0,
      participantCount,
      timeSlots: dayTimeSlots
    };
  };

  // Get day styling
  const getDayClasses = (date: Date) => {
    const availability = getDayAvailability(date);
    const isPast = isBefore(date, startOfDay(new Date()));
    const isCurrentMonth = isSameMonth(date, currentDate);
    const todayClass = isToday(date) ? 'ring-2 ring-blue-500' : '';
    
    let baseClasses = 'relative w-full h-12 flex items-center justify-center text-sm rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-100';
    
    // Past dates
    if (isPast) {
      baseClasses += ' text-gray-300 cursor-not-allowed';
    }
    // Other month dates
    else if (!isCurrentMonth) {
      baseClasses += ' text-gray-400';
    }
    // Current month dates
    else {
      baseClasses += ' text-gray-900 hover:bg-blue-50';
      
      // Availability colors
      if (availability.participantCount === 0) {
        baseClasses += ' bg-white';
      } else if (availability.participantCount === 1) {
        baseClasses += ' bg-blue-50 border border-blue-200';
      } else if (availability.participantCount === 2) {
        baseClasses += ' bg-blue-100 border border-blue-300';
      } else if (availability.participantCount >= 3) {
        baseClasses += ' bg-blue-200 border border-blue-400';
      }
    }
    
    return cn(baseClasses, todayClass);
  };

  const handleDayClick = (date: Date) => {
    const isPast = isBefore(date, startOfDay(new Date()));
    if (isPast) return;
    
    const dateString = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateString);
    setIsDayModalOpen(true);
  };

  const handleTimeSlotToggle = (timeSlot: TimeSlot) => {
    onTimeSlotSelect(timeSlot);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Available Times
        </h2>
        <p className="text-gray-600">
          Click on any day to see and select available time slots
        </p>
      </div>

      {/* Event Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
            {event.description && (
              <p className="text-gray-600 mt-1">{event.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Duration</div>
            <div className="text-lg font-medium text-gray-900">
              {event.duration} hour{event.duration !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="text-sm text-gray-500 mb-2">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: participant.color }}
                >
                  {participant.name}
                  {currentParticipant?.id === participant.id && ' (You)'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Calendar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const availability = getDayAvailability(date);
            const isPast = isBefore(date, startOfDay(new Date()));
            
            return (
              <div
                key={date.toISOString()}
                onClick={() => handleDayClick(date)}
                className={getDayClasses(date)}
              >
                <span className="relative z-10">
                  {format(date, 'd')}
                </span>
                
                {/* Availability indicator */}
                {availability.hasAvailability && !isPast && (
                  <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-green-500"></div>
                )}
                
                {/* Participant count indicator */}
                {availability.participantCount > 0 && !isPast && (
                  <div className="absolute top-1 right-1 text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {availability.participantCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2" />
            No availability
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2" />
            1 person available
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2" />
            2 people available
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded mr-2" />
            3+ people available
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Has selections
          </div>
        </div>
      </div>

      {/* Day Modal */}
      {selectedDate && (
        <DayModal
          isOpen={isDayModalOpen}
          onClose={() => setIsDayModalOpen(false)}
          date={selectedDate}
          event={event}
          timeSlots={timeSlots.filter(slot => slot.date === selectedDate)}
          participants={participants}
          onTimeSlotToggle={handleTimeSlotToggle}
          currentParticipant={currentParticipant}
        />
      )}
    </div>
  );
}