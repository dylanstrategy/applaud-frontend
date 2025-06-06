
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, X, Calendar, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WorkOrderEventDetailsProps {
  event: any;
  userRole: 'operator' | 'maintenance' | 'resident';
  onNudgeSent?: (event: any) => void;
  onMarkUrgent?: (event: any) => void;
  onCancel?: (event: any) => void;
}

const WorkOrderEventDetails = ({ 
  event, 
  userRole, 
  onNudgeSent,
  onMarkUrgent,
  onCancel 
}: WorkOrderEventDetailsProps) => {
  const { toast } = useToast();

  const handleNudge = () => {
    // Add nudge to timeline
    const nudgeEntry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'nudge',
      message: 'Gentle reminder sent to maintenance team',
      user: userRole === 'resident' ? 'You' : 'Operator'
    };

    // Update the event's timeline
    const updatedEvent = {
      ...event,
      timeline: [nudgeEntry, ...(event.timeline || [])]
    };

    // Call the parent handler
    if (onNudgeSent) {
      onNudgeSent(updatedEvent);
    }

    toast({
      title: "Nudge Sent",
      description: "A gentle reminder has been sent to the maintenance team",
    });
  };

  const handleUrgentEscalation = () => {
    // Add urgent escalation to timeline
    const urgentEntry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'urgent',
      message: 'Work order escalated to URGENT priority',
      user: userRole === 'resident' ? 'You' : 'Operator'
    };

    // Update the event with urgent priority and timeline
    const updatedEvent = {
      ...event,
      priority: 'urgent',
      status: 'urgent',
      timeline: [urgentEntry, ...(event.timeline || [])]
    };

    // Call the parent handler
    if (onMarkUrgent) {
      onMarkUrgent(updatedEvent);
    }

    toast({
      title: "Marked as Urgent",
      description: "This work order has been escalated to urgent priority",
      variant: "destructive"
    });
  };

  const handleCancel = () => {
    // Add cancellation to timeline
    const cancelEntry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'cancelled',
      message: 'Work order cancelled',
      user: userRole === 'resident' ? 'You' : 'Operator'
    };

    // Update the event with cancelled status and timeline
    const updatedEvent = {
      ...event,
      status: 'cancelled',
      timeline: [cancelEntry, ...(event.timeline || [])]
    };

    // Call the parent handler
    if (onCancel) {
      onCancel(updatedEvent);
    }

    toast({
      title: "Work Order Cancelled",
      description: "The work order has been cancelled successfully",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Don't show action buttons if work order is completed or cancelled
  const isCompleted = event.status?.toLowerCase() === 'completed';
  const isCancelled = event.status?.toLowerCase() === 'cancelled';
  const showActions = !isCompleted && !isCancelled;

  return (
    <div className="p-6 space-y-6">
      {/* Work Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-4">
          {/* Attached Image/Video */}
          {event.image && (
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img 
                src={event.image} 
                alt="Work order issue"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getPriorityColor(event.priority)}>
                {event.status?.toLowerCase() === 'urgent' ? 'URGENT' : (event.priority || 'Medium')} Priority
              </Badge>
              <Badge className={getStatusColor(event.status)}>
                {event.status || 'Submitted'}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-3">{event.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Submitted: {format(new Date(), 'MMM d, yyyy')}</span>
              </div>
              {event.unit && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Unit: {event.unit}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Scheduled: {event.time}</span>
                </div>
              )}
              {event.building && (
                <div className="flex items-center gap-2">
                  <span>Building: {event.building}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Only show if not completed or cancelled */}
      {showActions && (
        <div className="space-y-3">
          {/* Nudge Button - Available to residents and operators */}
          {(userRole === 'resident' || userRole === 'operator') && (
            <Button
              onClick={handleNudge}
              variant="outline"
              className="w-full flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Bell className="w-4 h-4" />
              Send Gentle Nudge
            </Button>
          )}

          {/* Urgent Escalation - Available to all roles, disabled if already urgent */}
          <Button
            onClick={handleUrgentEscalation}
            variant="outline"
            disabled={event.status?.toLowerCase() === 'urgent' || event.priority?.toLowerCase() === 'urgent'}
            className="w-full flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4" />
            {event.status?.toLowerCase() === 'urgent' || event.priority?.toLowerCase() === 'urgent' 
              ? 'Already Marked as Urgent' 
              : 'Mark as Urgent'}
          </Button>

          {/* Cancel Work Order - Available to all roles */}
          <Button
            onClick={handleCancel}
            variant="destructive"
            className="w-full flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel Work Order
          </Button>
        </div>
      )}

      {/* Show status message if completed or cancelled */}
      {(isCompleted || isCancelled) && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600">
            This work order has been {isCompleted ? 'completed' : 'cancelled'} and is no longer actionable.
          </p>
        </div>
      )}

      {/* Additional Details */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="font-medium text-gray-900">Work Order Details</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Category:</span>
            <span className="text-gray-900">{event.category || 'Maintenance'}</span>
          </div>
          
          {event.dueDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date:</span>
              <span className="text-gray-900">{format(event.dueDate, 'MMM d, yyyy')}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-500">Estimated Duration:</span>
            <span className="text-gray-900">1-2 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderEventDetails;
