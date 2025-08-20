// Core event types
export interface Event {
  id: string;
  name: string;
  description?: string;
  duration: number; // in hours
  timeframe: 'morning' | 'afternoon' | 'evening' | 'custom';
  createdAt: Date;
  createdBy?: string;
  shareableLink: string;
}

// Participant types
export interface Participant {
  id: string;
  name: string;
  color: string;
  joinedAt: Date;
}

// Time slot types
export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  participantIds: string[]; // Array of participant IDs who selected this slot
}

// Availability response
export interface AvailabilityResponse {
  eventId: string;
  participantId: string;
  timeSlots: TimeSlot[];
  updatedAt: Date;
}

// UI state types
export interface CalendarDay {
  date: string;
  isAvailable: boolean;
  participantCount: number;
  timeSlots: TimeSlot[];
}

export interface CommonTimeSlot extends TimeSlot {
  participantCount: number;
  participantNames: string[];
  conflictLevel: 'high' | 'medium' | 'low'; // Based on how many people are available
}

// Component props types
export interface CalendarProps {
  event: Event;
  participants: Participant[];
  timeSlots: TimeSlot[];
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  currentParticipant?: Participant;
}

export interface DayModalProps {
  isOpen: boolean;
  date: string;
  event: Event;
  timeSlots: TimeSlot[];
  participants: Participant[];
  onTimeSlotToggle: (timeSlot: TimeSlot) => void;
  onClose: () => void;
  currentParticipant?: Participant;
}

// Form types
export interface EventCreateForm {
  name: string;
  description: string;
  duration: number;
  timeframe: 'morning' | 'afternoon' | 'evening' | 'custom';
}

export interface ParticipantJoinForm {
  name: string;
}

// API response types
export interface CreateEventResponse {
  event: Event;
  shareableLink: string;
}

export interface GetEventResponse {
  event: Event;
  participants: Participant[];
  timeSlots: TimeSlot[];
  commonTimeSlots: CommonTimeSlot[];
}

// Utility types
export type TimeframeHours = {
  morning: { start: number; end: number };
  afternoon: { start: number; end: number };
  evening: { start: number; end: number };
};

// Color palette for participants
export const PARTICIPANT_COLORS = [
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#3B82F6', // blue
  '#06B6D4', // lightBlue
  '#14B8A6', // turquoise
  '#F59E0B', // yellow
  '#10B981', // green
] as const;

export type ParticipantColor = typeof PARTICIPANT_COLORS[number];