
import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeOverdueDetection } from '@/hooks/useRealtimeOverdueDetection';
import { useIsMobile } from '@/hooks/use-mobile';

interface HourlyCalendarViewProps {
  selectedDate: Date;
  events: any[];
  onDropSuggestion?: (suggestion: any, targetTime?: string) => void;
  onEventClick?: (event: any) => void;
  onEventHold?: (event: any) => void;
  onEventReschedule?: (event: any, newTime: string) => void;
}

const HourlyCalendarView = ({ 
  selectedDate, 
  events, 
  onDropSuggestion, 
  onEventClick, 
  onEventHold,
  onEventReschedule 
}: HourlyCalendarViewProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [draggedEvent, setDraggedEvent] = useState<any>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  
  // Use real-time overdue detection
  const { isEventOverdue } = useRealtimeOverdueDetection(events);

  // Generate all 48 time slots for 24 hours (30-minute intervals)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const convertTimeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleEventDragStart = (e: React.DragEvent, event: any) => {
    console.log('Event drag start:', event);
    setDraggedEvent(event);
    
    // Set the drag data for the event
    const dragData = {
      type: 'event',
      event: event,
      eventId: event.id,
      originalTime: event.time
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback - properly cast to HTMLElement
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleEventDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback - properly cast to HTMLElement
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedEvent(null);
  };

  const handleSlotDragOver = (e: React.DragEvent, timeSlot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(timeSlot);
  };

  const handleSlotDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're actually leaving the slot
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSlot(null);
    }
  };

  const handleSlotDrop = (e: React.DragEvent, timeSlot: string) => {
    e.preventDefault();
    console.log('Drop event triggered on time slot:', timeSlot);
    setDragOverSlot(null);
    
    try {
      const dragDataText = e.dataTransfer.getData('application/json');
      console.log('Drag data received:', dragDataText);
      
      if (!dragDataText) {
        console.error('No drag data found');
        return;
      }
      
      const dragData = JSON.parse(dragDataText);
      console.log('Parsed drag data:', dragData);
      
      if (dragData.type === 'suggestion') {
        console.log('Processing suggestion drop:', dragData, 'at time:', timeSlot);
        // Handle suggestion drop
        if (onDropSuggestion) {
          onDropSuggestion(dragData, timeSlot);
        } else {
          console.error('onDropSuggestion handler not provided');
        }
      } else if (dragData.type === 'event') {
        console.log('Processing event reschedule:', dragData.event, 'to time:', timeSlot);
        // Handle event reschedule
        if (dragData.originalTime !== timeSlot) {
          if (onEventReschedule) {
            onEventReschedule(dragData.event, timeSlot);
          }
          toast({
            title: "Event Rescheduled",
            description: `${dragData.event.title} moved to ${formatTime(timeSlot)}`,
          });
        }
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
    
    setDraggedEvent(null);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes?.padStart(2, '0') || '00'} ${ampm}`;
  };

  const getEventsForTime = (time: string) => {
    return events.filter(event => event.time === time);
  };

  const getEventUrgencyClass = (event: any) => {
    const isOverdue = isEventOverdue(event);
    return isOverdue ? 'wiggle-urgent bg-red-100 border-red-300' : '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-300px)]">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <p className="text-sm text-gray-600">Click to view • Drag to reschedule • Drop suggestions here</p>
      </div>

      <div className="h-full overflow-y-auto overflow-x-hidden">
        {timeSlots.map((timeSlot) => {
          const eventsAtTime = getEventsForTime(timeSlot);
          const isDragOver = dragOverSlot === timeSlot;
          
          return (
            <div
              key={timeSlot}
              className={`border-b border-gray-100 last:border-b-0 min-h-[60px] transition-all duration-200 ${
                isDragOver ? 'bg-green-100 border-green-300 scale-105' : 'hover:bg-gray-50'
              }`}
              onDragOver={(e) => handleSlotDragOver(e, timeSlot)}
              onDragLeave={handleSlotDragLeave}
              onDrop={(e) => handleSlotDrop(e, timeSlot)}
            >
              <div className="flex min-w-0">
                <div className={`flex-shrink-0 p-3 text-sm text-gray-500 border-r border-gray-100 ${
                  isMobile ? 'w-16' : 'w-20'
                }`}>
                  <div className="truncate font-medium">
                    {isMobile ? timeSlot : formatTime(timeSlot)}
                  </div>
                </div>
                <div className="flex-1 p-3 min-w-0">
                  {eventsAtTime.length === 0 ? (
                    <div className={`text-gray-400 text-sm italic transition-all ${
                      isDragOver ? 'text-green-600 font-medium' : ''
                    }`}>
                      {isDragOver ? 'Drop here to schedule' : 'Available'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {eventsAtTime.map((event) => (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleEventDragStart(e, event)}
                          onDragEnd={handleEventDragEnd}
                          onClick={() => onEventClick?.(event)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            onEventHold?.(event);
                          }}
                          className={`p-3 rounded-lg border cursor-move transition-all duration-200 hover:shadow-md min-w-0 touch-manipulation select-none ${
                            getEventUrgencyClass(event) || 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          } ${draggedEvent?.id === event.id ? 'opacity-50 scale-95' : ''}`}
                          style={{ 
                            touchAction: 'none',
                            userSelect: 'none',
                            WebkitUserSelect: 'none'
                          }}
                        >
                          <div className="flex items-center justify-between min-w-0">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                              <p className="text-sm text-gray-600 truncate">{event.description}</p>
                              {event.unit && (
                                <p className="text-xs text-gray-500 mt-1 truncate">{event.building} {event.unit}</p>
                              )}
                            </div>
                            <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                event.priority === 'high' ? 'bg-red-100 text-red-800' :
                                event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {event.priority}
                              </span>
                              <div className="text-gray-400 text-xs">
                                ⋮⋮
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyCalendarView;
