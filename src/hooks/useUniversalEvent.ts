
import { useState, useCallback } from 'react';
import { UniversalEvent, EventTask } from '@/types/eventTasks';
import { Role } from '@/types/roles';
import { getEventType } from '@/services/eventTypeService';
import { useToast } from '@/hooks/use-toast';

export const useUniversalEvent = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createEvent = useCallback(async (
    typeId: string,
    eventData: Partial<UniversalEvent>
  ): Promise<UniversalEvent | null> => {
    setIsLoading(true);
    try {
      const eventType = getEventType(typeId);
      if (!eventType) {
        throw new Error(`Event type ${typeId} not found`);
      }

      // Create tasks from event type defaults
      const tasks: EventTask[] = eventType.defaultTasks.map((taskTemplate, index) => ({
        id: `${Date.now()}-${index}`,
        ...taskTemplate,
        isComplete: false,
        status: 'available'
      }));

      const newEvent: UniversalEvent = {
        id: `event-${Date.now()}`,
        type: typeId,
        title: eventData.title || eventType.name,
        description: eventData.description || eventType.description,
        date: eventData.date || new Date(),
        time: eventData.time || '09:00',
        status: 'scheduled',
        priority: eventData.priority || 'medium',
        category: eventType.category,
        tasks,
        assignedUsers: eventData.assignedUsers || [],
        createdBy: eventData.createdBy || 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        rescheduledCount: 0,
        followUpHistory: [],
        metadata: eventData.metadata || {},
        taskCompletionStamps: []
      };

      console.log('Created universal event:', newEvent);
      
      toast({
        title: "Event Created",
        description: `${eventType.name} has been scheduled successfully.`,
      });

      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateEventTask = useCallback(async (
    eventId: string,
    taskId: string,
    updates: Partial<EventTask>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call
      console.log('Updating event task:', { eventId, taskId, updates });
      
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const completeTask = useCallback(async (
    eventId: string,
    taskId: string,
    completedBy: Role
  ): Promise<boolean> => {
    return updateEventTask(eventId, taskId, {
      isComplete: true,
      completedAt: new Date(),
      completedBy: completedBy,
      status: 'complete'
    });
  }, [updateEventTask]);

  const undoTaskCompletion = useCallback(async (
    eventId: string,
    taskId: string
  ): Promise<boolean> => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check if it's before 11:59 PM on the same day
    if (now > endOfDay) {
      toast({
        title: "Cannot Undo",
        description: "Tasks cannot be undone after 11:59 PM.",
        variant: "destructive"
      });
      return false;
    }

    return updateEventTask(eventId, taskId, {
      isComplete: false,
      completedAt: undefined,
      completedBy: undefined,
      status: 'available'
    });
  }, [updateEventTask, toast]);

  const rescheduleEvent = useCallback(async (
    eventId: string,
    newDate: Date,
    newTime: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Rescheduling event:', { eventId, newDate, newTime });
      
      toast({
        title: "Event Rescheduled",
        description: "Event has been rescheduled successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error rescheduling event:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule event. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const cancelEvent = useCallback(async (
    eventId: string,
    reason: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Cancelling event:', { eventId, reason });
      
      toast({
        title: "Event Cancelled",
        description: "Event has been cancelled successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast({
        title: "Error",
        description: "Failed to cancel event. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    createEvent,
    updateEventTask,
    completeTask,
    undoTaskCompletion,
    rescheduleEvent,
    cancelEvent
  };
};
