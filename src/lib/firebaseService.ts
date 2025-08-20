import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Event, 
  Participant, 
  TimeSlot, 
  AvailabilityResponse, 
  CreateEventResponse, 
  GetEventResponse 
} from './types';
import { generateId, generateShareableLink, getParticipantColor } from './utils';

// Collection names
const EVENTS_COLLECTION = 'events';
const PARTICIPANTS_COLLECTION = 'participants';
const TIME_SLOTS_COLLECTION = 'timeSlots';

// Create a new event
export async function createEvent(
  name: string,
  description: string = '',
  duration: number = 2,
  timeframe: 'morning' | 'afternoon' | 'evening' | 'custom' = 'afternoon'
): Promise<CreateEventResponse> {
  try {
    const eventData = {
      name,
      description,
      duration,
      timeframe,
      createdAt: Timestamp.now(),
      createdBy: null, // We'll add auth later
    };

    // Add event to Firestore
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
    
    const event: Event = {
      id: docRef.id,
      ...eventData,
      createdAt: eventData.createdAt.toDate(),
      shareableLink: generateShareableLink(docRef.id)
    };

    return {
      event,
      shareableLink: event.shareableLink
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
}

// Get event by ID
export async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    
    if (!eventDoc.exists()) {
      return null;
    }

    const data = eventDoc.data();
    return {
      id: eventDoc.id,
      name: data.name,
      description: data.description || '',
      duration: data.duration,
      timeframe: data.timeframe,
      createdAt: data.createdAt.toDate(),
      createdBy: data.createdBy,
      shareableLink: generateShareableLink(eventDoc.id)
    };
  } catch (error) {
    console.error('Error getting event:', error);
    throw new Error('Failed to get event');
  }
}

// Add participant to event
export async function addParticipant(
  eventId: string,
  name: string
): Promise<Participant> {
  try {
    // Check if participant already exists for this event
    const existingQuery = query(
      collection(db, PARTICIPANTS_COLLECTION),
      where('eventId', '==', eventId),
      where('name', '==', name)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      // Return existing participant
      const existingDoc = existingDocs.docs[0];
      const data = existingDoc.data();
      return {
        id: existingDoc.id,
        name: data.name,
        color: data.color,
        joinedAt: data.joinedAt.toDate()
      };
    }

    // Get current participant count to assign color
    const participantsQuery = query(
      collection(db, PARTICIPANTS_COLLECTION),
      where('eventId', '==', eventId)
    );
    const participantDocs = await getDocs(participantsQuery);
    const participantIndex = participantDocs.size;

    const participantData = {
      eventId,
      name,
      color: getParticipantColor(participantIndex),
      joinedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, PARTICIPANTS_COLLECTION), participantData);

    return {
      id: docRef.id,
      name: participantData.name,
      color: participantData.color,
      joinedAt: participantData.joinedAt.toDate()
    };
  } catch (error) {
    console.error('Error adding participant:', error);
    throw new Error('Failed to add participant');
  }
}

// Get all participants for an event
export async function getParticipants(eventId: string): Promise<Participant[]> {
  try {
    const participantsQuery = query(
      collection(db, PARTICIPANTS_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('joinedAt', 'asc')
    );

    const participantDocs = await getDocs(participantsQuery);
    
    return participantDocs.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        color: data.color,
        joinedAt: data.joinedAt.toDate()
      };
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    throw new Error('Failed to get participants');
  }
}

// Save participant's time slot selections
export async function saveTimeSlotSelections(
  eventId: string,
  participantId: string,
  selectedTimeSlots: TimeSlot[]
): Promise<void> {
  try {
    // Remove existing selections for this participant
    const existingQuery = query(
      collection(db, TIME_SLOTS_COLLECTION),
      where('eventId', '==', eventId),
      where('participantId', '==', participantId)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    // Delete existing selections
    const deletePromises = existingDocs.docs.map(doc => 
      updateDoc(doc.ref, { deleted: true })
    );
    await Promise.all(deletePromises);

    // Add new selections
    const addPromises = selectedTimeSlots.map(timeSlot => {
      const timeSlotData = {
        eventId,
        participantId,
        date: timeSlot.date,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        createdAt: Timestamp.now(),
        deleted: false
      };
      
      return addDoc(collection(db, TIME_SLOTS_COLLECTION), timeSlotData);
    });

    await Promise.all(addPromises);
  } catch (error) {
    console.error('Error saving time slot selections:', error);
    throw new Error('Failed to save selections');
  }
}

// Get all time slots for an event
export async function getTimeSlots(eventId: string): Promise<TimeSlot[]> {
  try {
    const timeSlotsQuery = query(
      collection(db, TIME_SLOTS_COLLECTION),
      where('eventId', '==', eventId),
      where('deleted', '==', false)
    );

    const timeSlotDocs = await getDocs(timeSlotsQuery);
    
    // Group by time slot (date + startTime + endTime)
    const timeSlotMap = new Map<string, TimeSlot>();
    
    timeSlotDocs.docs.forEach(doc => {
      const data = doc.data();
      const key = `${data.date}-${data.startTime}-${data.endTime}`;
      
      if (!timeSlotMap.has(key)) {
        timeSlotMap.set(key, {
          id: generateId(),
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          participantIds: []
        });
      }
      
      timeSlotMap.get(key)!.participantIds.push(data.participantId);
    });

    return Array.from(timeSlotMap.values());
  } catch (error) {
    console.error('Error getting time slots:', error);
    throw new Error('Failed to get time slots');
  }
}

// Get complete event data (event + participants + time slots)
export async function getCompleteEventData(eventId: string): Promise<GetEventResponse | null> {
  try {
    const [event, participants, timeSlots] = await Promise.all([
      getEvent(eventId),
      getParticipants(eventId),
      getTimeSlots(eventId)
    ]);

    if (!event) {
      return null;
    }

    // Calculate common time slots will be done in the component
    return {
      event,
      participants,
      timeSlots,
      commonTimeSlots: [] // Will be calculated by utils function
    };
  } catch (error) {
    console.error('Error getting complete event data:', error);
    throw new Error('Failed to get event data');
  }
}

// Real-time listener for event updates
export function subscribeToEvent(
  eventId: string, 
  callback: (data: GetEventResponse | null) => void
): () => void {
  try {
    // Set up listeners for participants and time slots
    const participantsQuery = query(
      collection(db, PARTICIPANTS_COLLECTION),
      where('eventId', '==', eventId)
    );
    
    const timeSlotsQuery = query(
      collection(db, TIME_SLOTS_COLLECTION),
      where('eventId', '==', eventId),
      where('deleted', '==', false)
    );

    let latestEvent: Event | null = null;
    let latestParticipants: Participant[] = [];
    let latestTimeSlots: TimeSlot[] = [];

    // Function to combine and send latest data
    const sendUpdate = () => {
      if (latestEvent) {
        callback({
          event: latestEvent,
          participants: latestParticipants,
          timeSlots: latestTimeSlots,
          commonTimeSlots: []
        });
      }
    };

    // Subscribe to participants
    const unsubscribeParticipants = onSnapshot(participantsQuery, (snapshot) => {
      latestParticipants = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          color: data.color,
          joinedAt: data.joinedAt.toDate()
        };
      });
      sendUpdate();
    });

    // Subscribe to time slots
    const unsubscribeTimeSlots = onSnapshot(timeSlotsQuery, (snapshot) => {
      const timeSlotMap = new Map<string, TimeSlot>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const key = `${data.date}-${data.startTime}-${data.endTime}`;
        
        if (!timeSlotMap.has(key)) {
          timeSlotMap.set(key, {
            id: generateId(),
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            participantIds: []
          });
        }
        
        timeSlotMap.get(key)!.participantIds.push(data.participantId);
      });

      latestTimeSlots = Array.from(timeSlotMap.values());
      sendUpdate();
    });

    // Get initial event data
    getEvent(eventId).then(event => {
      latestEvent = event;
      sendUpdate();
    });

    // Return cleanup function
    return () => {
      unsubscribeParticipants();
      unsubscribeTimeSlots();
    };
  } catch (error) {
    console.error('Error setting up real-time listener:', error);
    callback(null);
    return () => {};
  }
}