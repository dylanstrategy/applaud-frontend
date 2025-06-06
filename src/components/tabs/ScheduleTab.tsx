import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ScheduleMenu from '../schedule/ScheduleMenu';
import WorkOrderFlow from '../schedule/WorkOrderFlow';
import DraggableSuggestionsSection from '../schedule/DraggableSuggestionsSection';
import DroppableCalendar from '../schedule/DroppableCalendar';
import MessageModule from '../message/MessageModule';
import ServiceModule from '../service/ServiceModule';
import UniversalEventDetailModal from '../events/UniversalEventDetailModal';
import RescheduleFlow from '../events/RescheduleFlow';
import { EnhancedEvent } from '@/types/events';
import { teamAvailabilityService } from '@/services/teamAvailabilityService';
import HourlyCalendarView from '../schedule/HourlyCalendarView';

const ScheduleTab = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedScheduleType, setSelectedScheduleType] = useState<string>('');
  const [showMessageModule, setShowMessageModule] = useState(false);
  const [showServiceModule, setShowServiceModule] = useState(false);
  const [showUniversalEventDetail, setShowUniversalEventDetail] = useState(false);
  const [showRescheduleFlow, setShowRescheduleFlow] = useState(false);
  const [selectedUniversalEvent, setSelectedUniversalEvent] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<EnhancedEvent | null>(null);
  const [messageConfig, setMessageConfig] = useState({
    subject: '',
    recipientType: 'management' as 'management' | 'maintenance' | 'leasing',
    mode: 'compose' as 'compose' | 'reply'
  });

  // State for managing scheduled events including dropped suggestions
  const [scheduledEvents, setScheduledEvents] = useState([
    {
      id: 1,
      date: new Date(),
      time: '09:00',
      title: 'Work Order',
      description: 'Broken outlet - Unit 4B',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      category: 'Work Order',
      priority: 'high',
      unit: '4B',
      building: 'Building A',
      dueDate: addDays(new Date(), -1),
      isDroppedSuggestion: false,
      type: 'maintenance',
      rescheduledCount: 0
    },
    {
      id: 2,
      date: new Date(),
      time: '10:30',
      title: 'Message from Management',
      description: 'Please submit your lease renewal documents by Friday',
      category: 'Management',
      priority: 'medium',
      isDroppedSuggestion: false,
      type: 'message',
      rescheduledCount: 0
    },
    {
      id: 3,
      date: new Date(),
      time: '11:00',
      title: 'Lease Renewal',
      description: 'New rent: $1,550/month starting March 1st',
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400',
      category: 'Lease',
      priority: 'high',
      unit: '204',
      building: 'Building A',
      dueDate: addDays(new Date(), 2),
      isDroppedSuggestion: false,
      type: 'lease',
      rescheduledCount: 0
    },
    {
      id: 4,
      date: addDays(new Date(), 1),
      time: '14:00',
      title: 'Rooftop BBQ Social',
      description: 'Community event - RSVP required',
      category: 'Community Event',
      priority: 'low',
      isDroppedSuggestion: false,
      type: 'tour',
      rescheduledCount: 0
    },
    {
      id: 5,
      date: addDays(new Date(), 2),
      time: '09:00',
      title: 'HVAC Maintenance',
      description: 'Filter replacement scheduled',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      category: 'Work Order',
      priority: 'medium',
      unit: '204',
      building: 'Building A',
      isDroppedSuggestion: false,
      type: 'maintenance',
      rescheduledCount: 0
    }
  ]);

  // State to track which suggestions have been scheduled and completed
  const [scheduledSuggestionIds, setScheduledSuggestionIds] = useState<number[]>([]);
  const [completedSuggestionIds, setCompletedSuggestionIds] = useState<number[]>([]);

  const convertTimeToMinutes = (timeString: string): number => {
    if (!timeString) return 0;
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = (hours % 12) * 60 + minutes;
      if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
      if (period === 'AM' && hours === 12) totalMinutes = minutes;
      return totalMinutes;
    }
    
    // Handle 24-hour format (HH:mm)
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTimeFromMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const isSameDateSafe = (date1: any, date2: Date): boolean => {
    try {
      const d1 = date1 instanceof Date ? date1 : new Date(date1);
      const d2 = date2 instanceof Date ? date2 : new Date(date2);
      return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Date comparison error:', error);
      return false;
    }
  };

  const findAvailableTimeSlot = (date: Date, duration: number = 60): string => {
    const eventsForDate = scheduledEvents
      .filter(event => isSameDateSafe(event.date, date))
      .map(event => ({
        start: convertTimeToMinutes(event.time),
        end: convertTimeToMinutes(event.time) + 60 // Assume 1 hour duration
      }))
      .sort((a, b) => a.start - b.start);

    let proposedStart = 0; // Start from midnight (00:00)
    
    for (const event of eventsForDate) {
      if (proposedStart + duration <= event.start) {
        break;
      }
      proposedStart = Math.max(proposedStart, event.end);
    }
    
    // If we go past 11:30 PM (1410 minutes), wrap around or place at end
    if (proposedStart + duration > 1410) {
      proposedStart = 1410 - duration;
    }
    
    return formatTimeFromMinutes(proposedStart);
  };

  const handleDropSuggestionInTimeline = (suggestion: any, targetTime?: string) => {
    console.log('ScheduleTab: handleDropSuggestionInTimeline called with:', suggestion, targetTime);
    
    let assignedTime: string;
    
    if (targetTime) {
      assignedTime = targetTime;
    } else {
      assignedTime = findAvailableTimeSlot(selectedDate);
    }

    const isDuplicate = scheduledEvents.some(event => 
      isSameDateSafe(event.date, selectedDate) && 
      event.time === assignedTime && 
      event.title === suggestion.title
    );

    if (isDuplicate) {
      toast({
        title: "Event Already Exists",
        description: `${suggestion.title} is already scheduled at ${assignedTime}`,
        variant: "destructive"
      });
      return;
    }

    // Create event with proper structure to match existing events
    const newEvent = {
      id: Date.now() + Math.random(),
      date: new Date(selectedDate),
      time: assignedTime,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.suggestionType || suggestion.type, // Use suggestionType from drag data
      priority: suggestion.priority,
      isDroppedSuggestion: true,
      type: (suggestion.suggestionType || suggestion.type).toLowerCase(),
      rescheduledCount: 0,
      unit: suggestion.unit || undefined,
      building: suggestion.building || undefined,
      dueDate: suggestion.dueDate || undefined,
      image: suggestion.image || undefined,
      originalSuggestionId: suggestion.id // Track which suggestion this came from
    };

    console.log('ScheduleTab: Adding new event from timeline drop:', newEvent);
    
    setScheduledEvents(prev => {
      const updated = [...prev, newEvent];
      console.log('ScheduleTab: Updated scheduled events:', updated);
      return updated;
    });
    
    // Mark suggestion as scheduled (but not completed yet)
    setScheduledSuggestionIds(prev => {
      const updated = [...prev, suggestion.id];
      console.log('ScheduleTab: Updated scheduled suggestion IDs:', updated);
      return updated;
    });

    toast({
      title: "Task Scheduled!",
      description: `${suggestion.title} scheduled at ${assignedTime} on ${format(selectedDate, 'MMM d, yyyy')}`,
    });
  };

  const handleDropSuggestion = (suggestion: any, date: Date) => {
    console.log('ScheduleTab: handleDropSuggestion called with:', suggestion, date);
    
    const assignedTime = findAvailableTimeSlot(date);
    
    const isDuplicate = scheduledEvents.some(event => 
      isSameDateSafe(event.date, date) && 
      event.time === assignedTime && 
      event.title === suggestion.title
    );

    if (isDuplicate) {
      toast({
        title: "Event Already Exists",
        description: `${suggestion.title} is already scheduled at ${assignedTime}`,
        variant: "destructive"
      });
      return;
    }
    
    // Create event with proper structure to match existing events
    const newEvent = {
      id: Date.now() + Math.random(),
      date: new Date(date),
      time: assignedTime,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.suggestionType || suggestion.type, // Use suggestionType from drag data
      priority: suggestion.priority,
      isDroppedSuggestion: true,
      type: (suggestion.suggestionType || suggestion.type).toLowerCase(),
      rescheduledCount: 0,
      unit: suggestion.unit || undefined,
      building: suggestion.building || undefined,
      dueDate: suggestion.dueDate || undefined,
      image: suggestion.image || undefined,
      originalSuggestionId: suggestion.id // Track which suggestion this came from
    };

    console.log('ScheduleTab: Adding calendar drop event:', newEvent);

    setScheduledEvents(prev => {
      const updated = [...prev, newEvent];
      console.log('ScheduleTab: Updated scheduled events from calendar:', updated);
      return updated;
    });
    
    // Mark suggestion as scheduled (but not completed yet)
    setScheduledSuggestionIds(prev => {
      const updated = [...prev, suggestion.id];
      console.log('ScheduleTab: Updated scheduled suggestion IDs from calendar:', updated);
      return updated;
    });

    toast({
      title: "Task Scheduled!",
      description: `${suggestion.title} scheduled for ${format(date, 'MMM d, yyyy')}`,
    });
  };

  const handleAction = (action: string, item: string) => {
    toast({
      title: `${action}`,
      description: `${item} - Action completed`,
    });
  };

  const handleQuickReply = (subject: string, recipientType: 'management' | 'maintenance' | 'leasing' = 'management') => {
    setMessageConfig({
      subject: `Re: ${subject}`,
      recipientType,
      mode: 'reply'
    });
    setShowMessageModule(true);
  };

  const handleEventClick = (event: any) => {
    setSelectedUniversalEvent(event);
    setShowUniversalEventDetail(true);
  };

  const handleEventHold = (event: any) => {
    const enhancedEvent: EnhancedEvent = {
      id: event.id,
      date: event.date,
      time: event.time,
      title: event.title,
      description: event.description,
      category: event.category,
      priority: event.priority,
      canReschedule: true,
      canCancel: true,
      estimatedDuration: 60,
      rescheduledCount: event.rescheduledCount || 0,
      assignedTeamMember: teamAvailabilityService.assignTeamMember({ category: event.category }),
      residentName: 'John Doe',
      phone: '(555) 123-4567',
      unit: event.unit,
      building: event.building
    };
    
    setSelectedEvent(enhancedEvent);
    setShowRescheduleFlow(true);
  };

  const handleRescheduleConfirm = () => {
    toast({
      title: "Event Rescheduled",
      description: `${selectedEvent?.title} has been rescheduled successfully.`,
    });
    setShowRescheduleFlow(false);
    setSelectedEvent(null);
  };

  const handleEventReschedule = (event: any, newTime: string) => {
    const updatedEvents = scheduledEvents.map(e => 
      e.id === event.id 
        ? { ...e, time: newTime, rescheduledCount: (e.rescheduledCount || 0) + 1 }
        : e
    );
    
    setScheduledEvents(updatedEvents);
    
    toast({
      title: "Event Rescheduled",
      description: `${event.title} moved to ${newTime}`,
    });
  };

  const handleEventUpdate = (updatedEvent: any) => {
    const updatedEvents = scheduledEvents.map(e => 
      e.id === updatedEvent.id ? updatedEvent : e
    );
    setScheduledEvents(updatedEvents);

    // If the event was marked as completed and it was from a suggestion, mark the suggestion as completed
    if (updatedEvent.status === 'completed' && updatedEvent.originalSuggestionId) {
      setCompletedSuggestionIds(prev => {
        if (!prev.includes(updatedEvent.originalSuggestionId)) {
          return [...prev, updatedEvent.originalSuggestionId];
        }
        return prev;
      });
      
      toast({
        title: "Task Completed!",
        description: `${updatedEvent.title} has been marked as completed and removed from pending tasks.`,
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCreatingOrder(false);
      setCurrentStep(1);
      setShowScheduleMenu(false);
      toast({
        title: "Work Order Submitted",
        description: "Your work order has been successfully submitted. You'll receive a confirmation email shortly.",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setIsCreatingOrder(false);
      setShowScheduleMenu(true);
    }
  };

  const startScheduling = (type: string) => {
    setSelectedScheduleType(type);
    if (type === 'Work Order') {
      setIsCreatingOrder(true);
      setShowScheduleMenu(false);
      setCurrentStep(1);
    } else if (type === 'Message') {
      setMessageConfig({
        subject: '',
        recipientType: 'management',
        mode: 'compose'
      });
      setShowMessageModule(true);
      setShowScheduleMenu(false);
    } else if (type === 'Service') {
      setShowServiceModule(true);
      setShowScheduleMenu(false);
    } else {
      toast({
        title: `${type} Selected`,
        description: `${type} flow coming soon!`,
      });
      setShowScheduleMenu(false);
    }
  };

  const handleCloseWorkOrder = () => {
    setIsCreatingOrder(false);
    setCurrentStep(1);
    setShowScheduleMenu(false);
  };

  const handleCloseMessage = () => {
    setShowMessageModule(false);
    setShowScheduleMenu(false);
  };

  const handleCloseService = () => {
    setShowServiceModule(false);
    setShowScheduleMenu(false);
  };

  const getEventsForDate = (date: Date) => {
    const eventsForDate = scheduledEvents.filter(event => isSameDateSafe(event.date, date))
      .sort((a, b) => {
        const timeA = convertTimeToMinutes(a.time);
        const timeB = convertTimeToMinutes(b.time);
        return timeA - timeB;
      });
    
    console.log(`Events for ${format(date, 'MMM d')}:`, eventsForDate);
    return eventsForDate;
  };

  const hasEventsOnDate = (date: Date) => {
    return scheduledEvents.some(event => isSameDateSafe(event.date, date));
  };

  if (showRescheduleFlow && selectedEvent) {
    return (
      <RescheduleFlow
        event={selectedEvent}
        onClose={() => {
          setShowRescheduleFlow(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleRescheduleConfirm}
        userRole="resident"
      />
    );
  }

  if (showUniversalEventDetail && selectedUniversalEvent) {
    return (
      <UniversalEventDetailModal
        event={selectedUniversalEvent}
        onClose={() => {
          setShowUniversalEventDetail(false);
          setSelectedUniversalEvent(null);
        }}
        userRole="resident"
        onEventUpdate={handleEventUpdate}
      />
    );
  }

  if (showServiceModule) {
    return <ServiceModule onClose={handleCloseService} />;
  }

  if (showMessageModule) {
    return (
      <MessageModule
        onClose={handleCloseMessage}
        initialSubject={messageConfig.subject}
        recipientType={messageConfig.recipientType}
        mode={messageConfig.mode}
      />
    );
  }

  if (isCreatingOrder) {
    return (
      <WorkOrderFlow
        selectedScheduleType={selectedScheduleType}
        currentStep={currentStep}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onClose={handleCloseWorkOrder}
      />
    );
  }

  if (showScheduleMenu) {
    return (
      <ScheduleMenu
        onSelectType={startScheduling}
        onClose={() => setShowScheduleMenu(false)}
      />
    );
  }

  return (
    <div className="w-full bg-gray-50">
      <div className="px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-center sm:justify-start text-left font-normal shadow-sm w-12 sm:w-[240px]"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DroppableCalendar
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
                hasEventsOnDate={hasEventsOnDate}
                onDropSuggestion={handleDropSuggestion}
                events={scheduledEvents}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <button 
          onClick={() => setShowScheduleMenu(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-50"
        >
          <Plus className="text-white" size={28} />
        </button>

        <div className="mb-6">
          <HourlyCalendarView
            selectedDate={selectedDate}
            events={getEventsForDate(selectedDate)}
            onDropSuggestion={handleDropSuggestionInTimeline}
            onEventClick={handleEventClick}
            onEventHold={handleEventHold}
            onEventReschedule={handleEventReschedule}
          />
        </div>

        <DraggableSuggestionsSection 
          selectedDate={selectedDate}
          onSchedule={startScheduling}
          onAction={handleAction}
          scheduledSuggestionIds={scheduledSuggestionIds}
          completedSuggestionIds={completedSuggestionIds}
        />
      </div>
    </div>
  );
};

export default ScheduleTab;
