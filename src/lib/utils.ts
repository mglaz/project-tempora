import { clsx, type ClassValue } from 'clsx';
import { format, addDays, startOfDay, isToday, isTomorrow, isYesterday } from 'date-fns';
import { PARTICIPANT_COLORS, TimeSlot, CommonTimeSlot, Participant } from './types';

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Generate a shareable link for an event
export function generateShareableLink(eventId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/event/${eventId}`;
}

// Get participant color by index
export function getParticipantColor(index: number): string {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

// Format date for display
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';
  
  return format(dateObj, 'MMM d');
}

// Format time for display
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Generate time slots for a given day and duration
export function generateTimeSlots(date: string, duration: number, timeframe: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  let startHour: number;
  let endHour: number;
  
  // Define timeframe boundaries
  switch (timeframe) {
    case 'morning':
      startHour = 8;
      endHour = 12;
      break;
    case 'afternoon':
      startHour = 12;
      endHour = 17;
      break;
    case 'evening':
      startHour = 17;
      endHour = 22;
      break;
    default: // all day
      startHour = 8;
      endHour = 22;
  }
  
  // Generate slots
  for (let hour = startHour; hour <= endHour - duration; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + duration).toString().padStart(2, '0')}:00`;
    
    slots.push({
      id: generateId(),
      date,
      startTime,
      endTime,
      participantIds: []
    });
  }
  
  return slots;
}

// Calculate common time slots (times when multiple people are available)
export function calculateCommonTimeSlots(
  timeSlots: TimeSlot[], 
  participants: Participant[]
): CommonTimeSlot[] {
  const commonSlots: CommonTimeSlot[] = [];
  
  // Group slots by date and time
  const slotGroups = new Map<string, TimeSlot[]>();
  
  timeSlots.forEach(slot => {
    const key = `${slot.date}-${slot.startTime}-${slot.endTime}`;
    if (!slotGroups.has(key)) {
      slotGroups.set(key, []);
    }
    slotGroups.get(key)!.push(slot);
  });
  
  // Calculate availability for each time slot
  slotGroups.forEach((slots, key) => {
    const [date, startTime, endTime] = key.split('-');
    
    // Collect all participant IDs who selected this time
    const allParticipantIds = new Set<string>();
    slots.forEach(slot => {
      slot.participantIds.forEach(id => allParticipantIds.add(id));
    });
    
    if (allParticipantIds.size > 0) {
      const participantCount = allParticipantIds.size;
      const participantNames = participants
        .filter(p => allParticipantIds.has(p.id))
        .map(p => p.name);
      
      let conflictLevel: 'high' | 'medium' | 'low';
      const availabilityRatio = participantCount / participants.length;
      
      if (availabilityRatio >= 0.8) conflictLevel = 'high';
      else if (availabilityRatio >= 0.5) conflictLevel = 'medium';
      else conflictLevel = 'low';
      
      commonSlots.push({
        id: generateId(),
        date,
        startTime,
        endTime,
        participantIds: Array.from(allParticipantIds),
        participantCount,
        participantNames,
        conflictLevel
      });
    }
  });
  
  // Sort by participant count (most available first), then by time
  return commonSlots.sort((a, b) => {
    if (a.participantCount !== b.participantCount) {
      return b.participantCount - a.participantCount;
    }
    return a.startTime.localeCompare(b.startTime);
  });
}

// Get the next 14 days for calendar display
export function getNext14Days(): string[] {
  const days: string[] = [];
  const today = startOfDay(new Date());
  
  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i);
    days.push(format(date, 'yyyy-MM-dd'));
  }
  
  return days;
}

// Check if a time slot is selected by a specific participant
export function isTimeSlotSelected(timeSlot: TimeSlot, participantId: string): boolean {
  return timeSlot.participantIds.includes(participantId);
}

// Toggle participant selection for a time slot
export function toggleTimeSlotSelection(
  timeSlot: TimeSlot, 
  participantId: string
): TimeSlot {
  const isSelected = isTimeSlotSelected(timeSlot, participantId);
  
  return {
    ...timeSlot,
    participantIds: isSelected
      ? timeSlot.participantIds.filter(id => id !== participantId)
      : [...timeSlot.participantIds, participantId]
  };
}