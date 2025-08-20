import { useState, useEffect } from 'react';
import { 
  Event, 
  Participant, 
  TimeSlot, 
  GetEventResponse, 
  CommonTimeSlot 
} from '../lib/types';
import { 
  getCompleteEventData, 
  subscribeToEvent,
  addParticipant as addParticipantService,
  saveTimeSlotSelections 
} from '../lib/firebaseService';
import { calculateCommonTimeSlots } from '../lib/utils';

export interface UseEventState {
  event: Event | null;
  participants: Participant[];
  timeSlots: TimeSlot[];
  commonTimeSlots: CommonTimeSlot[];
  loading: boolean;
  error: string | null;
}

export interface UseEventActions {
  addParticipant: (name: string) => Promise<Participant | null>;
  saveSelections: (participantId: string, selectedSlots: TimeSlot[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useEvent(eventId: string | null): [UseEventState, UseEventActions] {
  const [state, setState] = useState<UseEventState>({
    event: null,
    participants: [],
    timeSlots: [],
    commonTimeSlots: [],
    loading: true,
    error: null
  });

  // Fetch initial data and set up real-time listener
  useEffect(() => {
    if (!eventId) {
      setState(prev => ({ ...prev, loading: false, error: 'No event ID provided' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Set up real-time subscription
    const unsubscribe = subscribeToEvent(eventId, (data) => {
      if (data) {
        const commonTimeSlots = calculateCommonTimeSlots(data.timeSlots, data.participants);
        setState({
          event: data.event,
          participants: data.participants,
          timeSlots: data.timeSlots,
          commonTimeSlots,
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Event not found' 
        }));
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [eventId]);

  // Actions
  const addParticipant = async (name: string): Promise<Participant | null> => {
    if (!eventId) return null;
    
    try {
      const participant = await addParticipantService(eventId, name);
      return participant;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to add participant' 
      }));
      return null;
    }
  };

  const saveSelections = async (participantId: string, selectedSlots: TimeSlot[]): Promise<void> => {
    if (!eventId) return;
    
    try {
      await saveTimeSlotSelections(eventId, participantId, selectedSlots);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to save selections' 
      }));
    }
  };

  const refetch = async (): Promise<void> => {
    if (!eventId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await getCompleteEventData(eventId);
      
      if (data) {
        const commonTimeSlots = calculateCommonTimeSlots(data.timeSlots, data.participants);
        setState({
          event: data.event,
          participants: data.participants,
          timeSlots: data.timeSlots,
          commonTimeSlots,
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Event not found' 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch event data' 
      }));
    }
  };

  return [state, { addParticipant, saveSelections, refetch }];
}

// Hook for creating events
export function useCreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (
    name: string,
    description: string = '',
    duration: number = 2,
    timeframe: 'morning' | 'afternoon' | 'evening' | 'custom' = 'afternoon'
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Import here to avoid circular dependency
      const { createEvent: createEventService } = await import('../lib/firebaseService');
      const result = await createEventService(name, description, duration, timeframe);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return { createEvent, loading, error };
}