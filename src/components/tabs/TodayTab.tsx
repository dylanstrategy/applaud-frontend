import React, { useState, useEffect } from 'react';
import MessageModule from '../message/MessageModule';
import ServiceModule from '../service/ServiceModule';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WorkOrderFlow from '../schedule/WorkOrderFlow';
import WorkOrdersReview from './today/WorkOrdersReview';
import WorkOrderTimeline from '../maintenance/WorkOrderTimeline';
import UniversalEventDetailModal from '../events/UniversalEventDetailModal';
import { EventCardGrid } from '../events/EventCardGrid';
import HourlyCalendarView from '../schedule/HourlyCalendarView';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isSameDay, differenceInDays, isPast, isToday, startOfWeek, endOfWeek, addWeeks, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import ResidentTimeline from '../ResidentTimeline';
import TodayHeader from './today/TodayHeader';
import QuickActionsGrid from './today/QuickActionsGrid';
import TodayMiniCalendar from './today/TodayMiniCalendar';
import PointOfSale from '../PointOfSale';
import { useRealtimeOverdueDetection } from '@/hooks/useRealtimeOverdueDetection';
import { sharedEventService } from '@/services/sharedEventService';
import { UniversalEvent } from '@/types/eventTasks';

const TodayTab = () => {
  const { toast } = useToast();
  const { profile, getPersonalizedContext } = useProfile();
  
  const [showTimeline, setShowTimeline] = useState(false);
  const [showMessageModule, setShowMessageModule] = useState(false);
  const [showServiceModule, setShowServiceModule] = useState(false);
  const [showWorkOrderFlow, setShowWorkOrderFlow] = useState(false);
  const [showWorkOrdersReview, setShowWorkOrdersReview] = useState(false);
  const [showWorkOrderTimeline, setShowWorkOrderTimeline] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showUniversalEventDetail, setShowUniversalEventDetail] = useState(false);
  const [selectedUniversalEvent, setSelectedUniversalEvent] = useState<any>(null);
  const [messageConfig, setMessageConfig] = useState({
    subject: '',
    recipientType: 'management' as 'management' | 'maintenance' | 'leasing',
    mode: 'compose' as 'compose' | 'reply'
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Allow date changes
  const [viewType, setViewType] = useState<'day' | '3day' | 'week' | 'month'>('day');
  const [weather, setWeather] = useState({ temp: 72, condition: 'Sunny' });
  const [calendarEvents, setCalendarEvents] = useState<UniversalEvent[]>([]);

  // Subscribe to shared event service
  useEffect(() => {
    const updateEvents = () => {
      const residentEvents = sharedEventService.getEventsForRole('resident');
      setCalendarEvents(residentEvents);
    };

    // Initial load
    updateEvents();

    // Subscribe to changes
    const unsubscribe = sharedEventService.subscribe(updateEvents);
    return unsubscribe;
  }, []);

  // Use profile pets instead of hardcoded ones
  const userPets = profile.pets;
  const hasPets = userPets.length > 0;

  // Simulate live weather updates
  useEffect(() => {
    const updateWeather = () => {
      const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Clear'];
      const temps = [68, 70, 72, 74, 76];
      setWeather({
        temp: temps[Math.floor(Math.random() * temps.length)],
        condition: conditions[Math.floor(Math.random() * conditions.length)]
      });
    };

    const interval = setInterval(updateWeather, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleOfferClick = (offer: any) => {
    toast({
      title: "Offer Activated",
      description: `${offer.title} from ${offer.business}`,
    });
  };

  const handleWorkOrderClick = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setShowWorkOrderTimeline(true);
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked in TodayTab:', event);
    setSelectedUniversalEvent(event);
    setShowUniversalEventDetail(true);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      setShowWorkOrderFlow(false);
      setCurrentStep(1);
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
      setShowWorkOrderFlow(false);
      setCurrentStep(1);
    }
  };

  const handleCloseWorkOrder = () => {
    setShowWorkOrderFlow(false);
    setCurrentStep(1);
  };

  const getEventsForDate = (date: Date) => {
    return sharedEventService.getEventsForRoleAndDate('resident', date)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getEventsForDateRange = () => {
    const events = [];
    const today = new Date(selectedDate);
    
    switch (viewType) {
      case 'day':
        return getEventsForDate(today);
      case '3day':
        for (let i = 0; i < 3; i++) {
          const date = addDays(today, i);
          events.push(...getEventsForDate(date));
        }
        return events;
      case 'week':
        const weekStart = startOfWeek(today);
        for (let i = 0; i < 7; i++) {
          const date = addDays(weekStart, i);
          events.push(...getEventsForDate(date));
        }
        return events;
      case 'month':
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        let current = monthStart;
        while (current <= monthEnd) {
          events.push(...getEventsForDate(current));
          current = addDays(current, 1);
        }
        return events;
      default:
        return getEventsForDate(today);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate = new Date(selectedDate);
    
    switch (viewType) {
      case 'day':
      case '3day':
        newDate = addDays(selectedDate, direction === 'next' ? (viewType === 'day' ? 1 : 3) : (viewType === 'day' ? -1 : -3));
        break;
      case 'week':
        newDate = addWeeks(selectedDate, direction === 'next' ? 1 : -1);
        break;
      case 'month':
        newDate = addMonths(selectedDate, direction === 'next' ? 1 : -1);
        break;
    }
    
    setSelectedDate(newDate);
  };

  const getDateRangeText = () => {
    switch (viewType) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case '3day':
        return `${format(selectedDate, 'MMM d')} - ${format(addDays(selectedDate, 2), 'MMM d, yyyy')}`;
      case 'week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Use real-time overdue detection for events
  const { isEventOverdue } = useRealtimeOverdueDetection(calendarEvents);

  const getUrgencyClass = (event: any) => {
    const isOverdue = isEventOverdue(event);
    
    if (isOverdue) {
      return 'wiggle-urgent pulse-urgent';
    }
    
    if (!event.dueDate) return '';
    
    const daysUntilDue = differenceInDays(event.dueDate, new Date());
    const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
    
    if (isDueSoon && event.priority === 'high') {
      return 'wiggle-urgent';
    }
    
    return '';
  };

  const getRentUrgencyClass = () => {
    const daysUntilRentDue = 3; // Rent due in 3 days
    if (daysUntilRentDue <= 3) {
      return 'wiggle-urgent';
    }
    return '';
  };

  const getSwipeActionsForEvent = (event: any) => {
    // Special handling for promotional events
    if (event.type === 'promotional') {
      return {
        onSwipeRight: {
          label: "Redeem Offer",
          action: () => {
            handleAction("Redeemed promotional offer", event.title);
          },
          color: "#10B981",
          icon: "🎉"
        },
        onSwipeLeft: {
          label: "Schedule Service",
          action: () => {
            handleAction("Scheduled service booking", event.title);
          },
          color: "#3B82F6",
          icon: "📅"
        }
      };
    }

    switch (event.category) {
      case 'Work Order':
        return {
          onSwipeRight: {
            label: "Reschedule",
            action: () => handleAction("Requested reschedule", event.title),
            color: "#F59E0B",
            icon: "📅"
          }
        };
      
      case 'Management':
        return {
          onSwipeRight: {
            label: "Archive",
            action: () => handleAction("Archived", event.title),
            color: "#6B7280",
            icon: "📦"
          },
          onSwipeLeft: {
            label: "Quick Reply",
            action: () => handleQuickReply(event.title, 'management'),
            color: "#3B82F6",
            icon: "💬"
          }
        };
      
      case 'Lease':
        return {
          onSwipeRight: {
            label: "Accept",
            action: () => handleAction("Accepted lease renewal", event.title),
            color: "#10B981",
            icon: "✅"
          }
        };
      
      case 'Point of Sale':
        return {
          onSwipeRight: {
            label: "Save to Wallet",
            action: () => handleAction("Saved to wallet", event.title),
            color: "#10B981",
            icon: "💾"
          }
        };
      
      case 'Community Event':
        return {
          onSwipeRight: {
            label: "Confirm Attendance",
            action: () => handleAction("Confirmed attendance", event.title),
            color: "#10B981",
            icon: "✅"
          }
        };

      case 'Payment':
        return {
          onSwipeRight: {
            label: "Pay Now",
            action: () => handleAction("Paid", event.title),
            color: "#10B981",
            icon: "💳"
          }
        };

      case 'Pet Service':
        return {
          onSwipeRight: {
            label: "Book Service",
            action: () => handleAction("Booked pet service", event.title),
            color: "#10B981",
            icon: "🐾"
          }
        };
      
      default:
        return {
          onSwipeRight: {
            label: "View",
            action: () => handleAction("Viewed", event.title),
            color: "#3B82F6",
            icon: "👁️"
          }
        };
    }
  };

  const handleDropSuggestion = (suggestion: any, targetTime?: string) => {
    console.log('TodayTab: handleDropSuggestion called with:', suggestion, targetTime);
    
    // For TodayTab, we can show a toast or handle the drop
    toast({
      title: "Suggestion Scheduled!",
      description: `${suggestion.title} scheduled for ${format(selectedDate, 'MMM d, yyyy')}`,
    });
  };

  const handleDateSelect = (date: Date) => {
    // For TodayTab, we could navigate to schedule tab or show events for that date
    toast({
      title: "Date Selected",
      description: `Viewing events for ${format(date, 'MMM d, yyyy')}`,
    });
  };

  // Handle event rescheduling
  const handleEventReschedule = (event: any, newTime: string) => {
    console.log('Handling event reschedule in TodayTab:', event, 'to', newTime);
    
    // Use shared service to reschedule
    const success = sharedEventService.rescheduleEvent(event.id, event.date, newTime);
    
    if (success) {
      toast({
        title: "Event Rescheduled",
        description: `${event.title} moved to ${formatTime(newTime)}`,
      });
    }
  };

  const renderPersonalizedOffers = () => {
    if (profile.pets.length > 0) {
      return (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            🐾 Special Offers for {profile.pets.map(pet => pet.name).join(' & ')}
          </h2>
          <PointOfSale 
            context="pet-service" 
            onOfferClick={handleOfferClick}
            petName={profile.pets[0].name}
          />
        </div>
      );
    }

    if (profile.selectedLifestyleTags.length > 0) {
      const primaryTag = profile.selectedLifestyleTags[0];
      return (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            {primaryTag.emoji} {primaryTag.label} Offers
          </h2>
          <PointOfSale 
            context={getPersonalizedContext() as 'pet-service' | 'message' | 'event' | 'work-order' | 'appointment' | 'service' | 'document' | 'moving-service' | 'home-setup'} 
            onOfferClick={handleOfferClick}
          />
        </div>
      );
    }

    return null;
  };

  const handleEventUpdate = (updatedEvent: any) => {
    // Update through shared service
    sharedEventService.updateEvent(updatedEvent.id, updatedEvent);
    
    toast({
      title: "Event Updated",
      description: `${updatedEvent.title} has been updated successfully.`,
    });
  };

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

  if (showWorkOrderTimeline && selectedWorkOrder) {
    return (
      <WorkOrderTimeline
        workOrder={selectedWorkOrder}
        onClose={() => {
          setShowWorkOrderTimeline(false);
          setSelectedWorkOrder(null);
        }}
      />
    );
  }

  if (showWorkOrderFlow) {
    return (
      <WorkOrderFlow
        selectedScheduleType="Work Order"
        currentStep={currentStep}
        onNextStep={() => {
          if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
          } else {
            setShowWorkOrderFlow(false);
            setCurrentStep(1);
            toast({
              title: "Work Order Submitted",
              description: "Your work order has been successfully submitted. You'll receive a confirmation email shortly.",
            });
          }
        }}
        onPrevStep={() => {
          if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
          } else {
            setShowWorkOrderFlow(false);
            setCurrentStep(1);
          }
        }}
        onClose={() => {
          setShowWorkOrderFlow(false);
          setCurrentStep(1);
        }}
      />
    );
  }

  if (showWorkOrdersReview) {
    return (
      <WorkOrdersReview
        onCreateWorkOrder={() => {
          setShowWorkOrdersReview(false);
          setShowWorkOrderFlow(true);
        }}
        onClose={() => setShowWorkOrdersReview(false)}
        onWorkOrderClick={handleWorkOrderClick}
      />
    );
  }

  if (showServiceModule) {
    return <ServiceModule onClose={() => setShowServiceModule(false)} />;
  }

  if (showMessageModule) {
    return (
      <MessageModule
        onClose={() => setShowMessageModule(false)}
        initialSubject={messageConfig.subject}
        recipientType={messageConfig.recipientType}
        mode={messageConfig.mode}
      />
    );
  }

  if (showTimeline) {
    return <ResidentTimeline onClose={() => setShowTimeline(false)} />;
  }

  // Get events for current view
  const displayEvents = getEventsForDateRange();

  console.log('TodayTab: Display events loaded:', displayEvents.length, 'events for', viewType, 'view');

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6">
        <TodayHeader 
          selectedDate={selectedDate}
          weather={weather}
          onTimelineClick={() => setShowTimeline(true)}
        />

        <QuickActionsGrid 
          onAction={handleAction}
          onServiceClick={() => setShowServiceModule(true)}
          onMaintenanceClick={() => setShowWorkOrdersReview(true)}
          getRentUrgencyClass={() => {
            const daysUntilRentDue = 3; // Rent due in 3 days
            if (daysUntilRentDue <= 3) {
              return 'wiggle-urgent';
            }
            return '';
          }}
        />

        {/* Personalized offers based on lifestyle tags */}
        {renderPersonalizedOffers()}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Schedule
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({displayEvents.length} events)
              </span>
            </h2>
            
            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Select value={viewType} onValueChange={(value: 'day' | '3day' | 'week' | 'month') => setViewType(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="3day">3 Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{getDateRangeText()}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <HourlyCalendarView
            selectedDate={selectedDate}
            events={displayEvents}
            onDropSuggestion={handleDropSuggestion}
            onEventClick={handleEventClick}
            onEventReschedule={handleEventReschedule}
            currentUserRole="resident"
            viewType={viewType}
          />
        </div>
      </div>
    </div>
  );
};

export default TodayTab;
