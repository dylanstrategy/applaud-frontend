
import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SwipeCard from '@/components/SwipeCard';
import WorkOrderFlow from '@/components/maintenance/WorkOrderFlow';
import UnitTurnDetailTracker from '@/components/maintenance/UnitTurnDetailTracker';
import HourlyCalendarView from '@/components/schedule/HourlyCalendarView';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceTodayTabProps {
  todayWorkOrders?: any[];
  onWorkOrderCompleted?: (workOrderId: string) => void;
}

const MaintenanceTodayTab = ({ todayWorkOrders = [], onWorkOrderCompleted }: MaintenanceTodayTabProps) => {
  const { toast } = useToast();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [selectedUnitTurn, setSelectedUnitTurn] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  const today = new Date();

  console.log('MaintenanceTodayTab - received todayWorkOrders:', todayWorkOrders);

  // Sample unit turns data
  const unitTurns = [
    {
      id: 'UT-323-4',
      unit: '323-4',
      moveOutDate: '2025-06-01',
      moveInDate: '2025-06-15',
      status: 'In Progress',
      completedSteps: ['Punch', 'Upgrades/Repairs', 'Floors'],
      pendingSteps: ['Paint', 'Clean', 'Inspection'],
      daysUntilMoveIn: 13,
      priority: 'medium',
      assignedTo: 'Mike Rodriguez'
    },
    {
      id: 'UT-420-3',
      unit: '420-3',
      moveOutDate: '2025-06-06',
      moveInDate: '2025-06-20',
      status: 'Scheduled',
      completedSteps: [],
      pendingSteps: ['Punch', 'Upgrades/Repairs', 'Floors', 'Paint', 'Clean', 'Inspection'],
      daysUntilMoveIn: 18,
      priority: 'low',
      assignedTo: 'James Wilson'
    }
  ];

  // Convert work orders to calendar events format and update state when needed
  React.useEffect(() => {
    const events = [
      // Add today's scheduled work orders from props
      ...todayWorkOrders.map(workOrder => {
        console.log('Converting work order to calendar event:', workOrder);
        return {
          id: workOrder.id,
          date: today,
          time: workOrder.scheduledTime || '09:00',
          title: `Work Order - Unit ${workOrder.unit}`,
          description: workOrder.title,
          category: 'work-order',
          priority: workOrder.priority,
          workOrderData: workOrder,
          canReschedule: true,
          canCancel: false,
          estimatedDuration: 120,
          rescheduledCount: 0
        };
      }),
      // Add unit turns scheduled for today
      ...unitTurns.filter(turn => turn.status === 'Scheduled').map(unitTurn => ({
        id: unitTurn.id,
        date: today,
        time: '10:00',
        title: `Unit Turn - ${unitTurn.unit}`,
        description: `${unitTurn.pendingSteps.length} steps remaining`,
        category: 'unit-turn',
        priority: unitTurn.priority,
        unitTurnData: unitTurn,
        canReschedule: true,
        canCancel: false,
        estimatedDuration: 240,
        rescheduledCount: 0
      }))
    ];
    
    setCalendarEvents(events);
    console.log('Calendar events generated:', events);
  }, [todayWorkOrders]);

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
    if (event.category === 'work-order') {
      setSelectedWorkOrder(event.workOrderData);
    } else if (event.category === 'unit-turn') {
      setSelectedUnitTurn(event.unitTurnData);
    }
  };

  const handleEventHold = (event: any) => {
    // Handle hold/reschedule if needed
    console.log('Event held:', event);
  };

  const handleEventReschedule = (event: any, newTime: string) => {
    console.log('Event rescheduled:', event, 'to', newTime);
    
    // Update the calendar events state
    setCalendarEvents(prev => prev.map(e => 
      e.id === event.id 
        ? { ...e, time: newTime, rescheduledCount: (e.rescheduledCount || 0) + 1 }
        : e
    ));
    
    toast({
      title: "Event Rescheduled",
      description: `${event.title} moved to ${newTime}`,
    });
  };

  const handleWorkOrderCompleted = (workOrderId: string) => {
    console.log('Work order completed in Today tab:', workOrderId);
    
    // Remove from calendar events
    setCalendarEvents(prev => prev.filter(e => e.workOrderData?.id !== workOrderId));
    
    // Notify parent component if callback provided
    if (onWorkOrderCompleted) {
      onWorkOrderCompleted(workOrderId);
    }
    
    toast({
      title: "Work Order Completed",
      description: "The work order has been completed and removed from your schedule.",
    });
  };

  if (selectedWorkOrder) {
    console.log('Showing WorkOrderFlow for:', selectedWorkOrder);
    return (
      <WorkOrderFlow 
        workOrder={selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
        onWorkOrderCompleted={handleWorkOrderCompleted}
      />
    );
  }

  if (selectedUnitTurn) {
    return (
      <UnitTurnDetailTracker 
        unitTurn={selectedUnitTurn}
        onClose={() => setSelectedUnitTurn(null)}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Header Stats */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{todayWorkOrders.length}</div>
              <div className="text-sm text-gray-600">Work Orders Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{unitTurns.filter(ut => ut.status === 'Scheduled').length}</div>
              <div className="text-sm text-gray-600">Unit Turns Today</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar View */}
      <div className="px-4 pb-6">
        <HourlyCalendarView
          selectedDate={today}
          events={calendarEvents}
          onEventClick={handleEventClick}
          onEventHold={handleEventHold}
          onEventReschedule={handleEventReschedule}
        />
      </div>
    </div>
  );
};

export default MaintenanceTodayTab;
