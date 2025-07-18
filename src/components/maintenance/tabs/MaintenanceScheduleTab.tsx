import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnitTurnTracker from '../UnitTurnTracker';
import WorkOrderTracker from '../WorkOrderTracker';
import UnitTurnDetailTracker from '../UnitTurnDetailTracker';
import WorkOrderTimeline from '../WorkOrderTimeline';
import WorkOrderFlow from '../WorkOrderFlow';
import WorkOrderQueue from '../WorkOrderQueue';
import ScheduleDropZone from '../ScheduleDropZone';
import DragDropProvider from '../DragDropProvider';
import UniversalEventDetailModal from '../../events/UniversalEventDetailModal';
import { Calendar, Home, Wrench, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sharedSchedulingService, WorkOrderScheduleData } from '@/services/sharedSchedulingService';

// Mock work orders data - this would normally come from a state management solution or API
const initialWorkOrders = [
  {
    id: 'WO-544857',
    unit: '417',
    title: 'Dripping water faucet',
    description: 'Bathroom faucet dripping intermittently',
    category: 'Plumbing',
    priority: 'medium' as const,
    status: 'unscheduled' as const,
    assignedTo: 'Mike Rodriguez',
    resident: 'Rumi Desai',
    phone: '(555) 123-4567',
    daysOpen: 3,
    estimatedTime: '2 hours',
    submittedDate: '2025-05-22',
    photo: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400'
  },
  {
    id: 'WO-548686',
    unit: '516',
    title: 'Window won\'t close properly',
    description: 'The balancer got stuck and window won\'t close',
    category: 'Windows',
    priority: 'high' as const,
    status: 'unscheduled' as const,
    assignedTo: 'Sarah Johnson',
    resident: 'Kalyani Dronamraju',
    phone: '(555) 345-6789',
    daysOpen: 5,
    estimatedTime: '3 hours',
    submittedDate: '2025-05-14',
    photo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
  },
  {
    id: 'WO-549321',
    unit: '204',
    title: 'HVAC not cooling properly',
    description: 'Air conditioning unit not providing adequate cooling',
    category: 'HVAC',
    priority: 'urgent' as const,
    status: 'overdue' as const,
    assignedTo: 'James Wilson',
    resident: 'Alex Thompson',
    phone: '(555) 456-7890',
    daysOpen: 12,
    estimatedTime: '4 hours',
    submittedDate: '2025-05-01',
    photo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'
  },
  {
    id: 'WO-545123',
    unit: '302',
    title: 'Scheduled Inspection',
    description: 'Annual HVAC maintenance check',
    category: 'Maintenance',
    priority: 'low' as const,
    status: 'scheduled' as const,
    assignedTo: 'Mike Rodriguez',
    resident: 'Jane Smith',
    phone: '(555) 789-0123',
    daysOpen: 1,
    estimatedTime: '1 hour',
    submittedDate: '2025-06-06',
    scheduledDate: '2025-06-10',
    scheduledTime: '10:00 AM',
    photo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400'
  }
];

// Context for sharing work orders between tabs
interface MaintenanceContextType {
  todayWorkOrders: any[];
  addTodayWorkOrder: (workOrder: any) => void;
}

// Simple context provider for this component
const MaintenanceContext = React.createContext<MaintenanceContextType>({
  todayWorkOrders: [],
  addTodayWorkOrder: () => {}
});

interface MaintenanceScheduleTabProps {
  onTodayWorkOrdersChange?: (workOrders: any[]) => void;
  todayWorkOrders?: any[];
  onWorkOrderCompleted?: (workOrderId: string) => void;
}

const MaintenanceScheduleTab = ({ 
  onTodayWorkOrdersChange, 
  todayWorkOrders: externalTodayWorkOrders,
  onWorkOrderCompleted 
}: MaintenanceScheduleTabProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedUnitTurn, setSelectedUnitTurn] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [showWorkOrderFlow, setShowWorkOrderFlow] = useState(false);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [scheduledWorkOrders, setScheduledWorkOrders] = useState<any[]>([]);
  const [internalTodayWorkOrders, setInternalTodayWorkOrders] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUnitCardSelected, setIsUnitCardSelected] = useState(false);
  const [showUniversalEventDetail, setShowUniversalEventDetail] = useState(false);
  const [selectedUniversalEvent, setSelectedUniversalEvent] = useState<any>(null);
  const [scheduledStepIds, setScheduledStepIds] = useState<string[]>([]);

  // Use external state if provided, otherwise use internal state
  const todayWorkOrders = externalTodayWorkOrders || internalTodayWorkOrders;

  // Helper function to update today's work orders
  const updateTodayWorkOrders = (newWorkOrders: any[]) => {
    console.log('Updating today work orders with:', newWorkOrders);
    if (onTodayWorkOrdersChange) {
      onTodayWorkOrdersChange(newWorkOrders);
    } else {
      setInternalTodayWorkOrders(newWorkOrders);
    }
  };

  const handleWorkOrderCompleted = (workOrderId: string) => {
    console.log('Schedule tab - Work order completed:', workOrderId);
    
    // Remove from scheduled work orders
    setScheduledWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
    
    // Remove from today's work orders
    const updatedTodayWorkOrders = todayWorkOrders.filter(wo => wo.id !== workOrderId);
    updateTodayWorkOrders(updatedTodayWorkOrders);
    
    // If it's a unit turn step, remove from scheduled step IDs
    const workOrder = todayWorkOrders.find(wo => wo.id === workOrderId);
    if (workOrder?.unitTurnStep) {
      setScheduledStepIds(prev => prev.filter(id => id !== workOrderId));
    }
    
    // Notify parent component
    if (onWorkOrderCompleted) {
      onWorkOrderCompleted(workOrderId);
    }
    
    toast({
      title: "Work Order Completed",
      description: "The work order has been completed and removed from the schedule.",
    });
  };

  // Helper function to find first available time slot
  const findFirstAvailableTimeSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // If it's before 9 AM, start at 9 AM
    if (currentHour < 9) {
      return '09:00';
    }
    
    // If it's after 5 PM, schedule for tomorrow 9 AM
    if (currentHour >= 17) {
      return 'Tomorrow 09:00';
    }
    
    // Find next available hour slot (round up to next hour)
    let nextHour = currentMinute > 0 ? currentHour + 1 : currentHour;
    
    // Check for conflicts with existing scheduled work orders
    const timeSlot = `${nextHour.toString().padStart(2, '0')}:00`;
    const hasConflict = todayWorkOrders.some(wo => wo.scheduledTime === timeSlot);
    
    if (hasConflict) {
      // Try next hour
      nextHour += 1;
      if (nextHour >= 17) {
        return 'Tomorrow 09:00';
      }
      return `${nextHour.toString().padStart(2, '0')}:00`;
    }
    
    return timeSlot;
  };

  const handleScheduleWorkOrder = (workOrder: any, scheduledTime: string) => {
    console.log('🔥 SCHEDULING WORK ORDER:', {
      workOrderTitle: workOrder.title,
      workOrderUnit: workOrder.unit,
      scheduledTime,
      workOrderData: workOrder
    });
    
    // Convert work order to the format expected by shared scheduling service
    const workOrderData: WorkOrderScheduleData = {
      workOrderId: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      category: workOrder.category,
      priority: workOrder.priority,
      assignedResidentId: sharedSchedulingService.getSharedTestResidentId(),
      assignedMaintenanceUserId: sharedSchedulingService.getSharedTestMaintenanceId(),
      estimatedDuration: 120 // 2 hours default for work orders
    };

    const targetDate = new Date();
    let targetTime: string | undefined;

    // Parse the scheduled time if it's not "Tomorrow"
    if (!scheduledTime.includes('Tomorrow')) {
      // Handle different time formats
      if (scheduledTime.includes('AM') || scheduledTime.includes('PM')) {
        // Format: "1:30 PM" or "Today at 1:30 PM"
        const timeOnly = scheduledTime.replace('Today at ', '').replace('today at ', '');
        const [time, period] = timeOnly.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        targetTime = `${hour24.toString().padStart(2, '0')}:${(minutes || 0).toString().padStart(2, '0')}`;
      } else {
        // Format: "13:30" (24-hour format)
        targetTime = scheduledTime;
      }
    } else {
      // Schedule for tomorrow
      targetDate.setDate(targetDate.getDate() + 1);
      targetTime = '09:00';
    }

    const result = sharedSchedulingService.scheduleWorkOrder(workOrderData, targetDate, targetTime);

    if (result.success) {
      // Update the work order with scheduled information
      const updatedWorkOrder = {
        ...workOrder,
        status: 'scheduled',
        scheduledDate: targetDate.toISOString().split('T')[0],
        scheduledTime: result.scheduledTime,
        eventId: result.eventId
      };

      // If it's a unit turn step, add to scheduled step IDs
      if (workOrder.unitTurnStep) {
        console.log('Scheduling unit turn step:', workOrder.id);
        setScheduledStepIds(prev => [...prev, workOrder.id]);
      } else {
        // Remove from work orders queue for regular work orders
        setWorkOrders(prev => prev.filter(wo => wo.id !== workOrder.id));
      }
      
      // Add to scheduled work orders
      setScheduledWorkOrders(prev => [...prev, updatedWorkOrder]);
      
      // Add to today's work orders if scheduled for today
      const isToday = targetDate.toDateString() === new Date().toDateString();
      if (isToday) {
        console.log('Adding to today work orders:', updatedWorkOrder);
        const newTodayWorkOrders = [...todayWorkOrders, updatedWorkOrder];
        updateTodayWorkOrders(newTodayWorkOrders);
      }
      
      toast({
        title: "Work Order Scheduled",
        description: `${workOrder.title} has been scheduled for ${result.scheduledTime} with mutual availability confirmed`,
      });
    } else {
      toast({
        title: "Scheduling Failed",
        description: `Could not find mutual availability for ${workOrder.title}. Please try a different time.`,
        variant: "destructive"
      });
    }
  };

  const addTodayWorkOrder = (workOrder: any) => {
    console.log('Adding work order to today context:', workOrder);
    const newTodayWorkOrders = [...todayWorkOrders, workOrder];
    updateTodayWorkOrders(newTodayWorkOrders);
  };

  const contextValue = {
    todayWorkOrders,
    addTodayWorkOrder
  };

  const handleStepSelected = (step: any) => {
    setSelectedUniversalEvent(step);
    setShowUniversalEventDetail(true);
  };

  // Show drop zone when: 
  // 1. On Queue tab, OR
  // 2. Currently dragging, OR 
  // 3. On Unit Turns tab AND a unit card is selected (showing steps view)
  const shouldShowDropZone = activeTab === 'queue' || isDragging || (activeTab === 'unitturns' && isUnitCardSelected);

  if (showUniversalEventDetail && selectedUniversalEvent) {
    return (
      <UniversalEventDetailModal
        event={selectedUniversalEvent}
        onClose={() => {
          setShowUniversalEventDetail(false);
          setSelectedUniversalEvent(null);
        }}
        userRole="maintenance"
      />
    );
  }

  if (showWorkOrderFlow) {
    return (
      <WorkOrderFlow
        workOrder={selectedWorkOrder}
        onClose={() => {
          setShowWorkOrderFlow(false);
          setSelectedWorkOrder(null);
        }}
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

  if (selectedWorkOrder && !showWorkOrderFlow) {
    return (
      <WorkOrderTimeline 
        workOrder={selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
      />
    );
  }

  const handleWorkOrderSelect = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setShowWorkOrderFlow(true);
  };

  const handleWorkOrderDetailsView = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    // Don't set showWorkOrderFlow to true, just show the timeline
  };

  return (
    <MaintenanceContext.Provider value={contextValue}>
      <DragDropProvider>
        <div className="w-full">
          <div className="px-4 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-orange-600" />
                Maintenance Dashboard
              </h1>
              <p className="text-gray-600">Track work orders, unit turns, and maintenance operations</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="queue" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Queue
                </TabsTrigger>
                <TabsTrigger value="unitturns" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Unit Turns
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="w-full">
            {activeTab === 'queue' && (
              <div className="w-full">
                <WorkOrderQueue 
                  workOrders={workOrders}
                  onSelectWorkOrder={handleWorkOrderDetailsView}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                />
              </div>
            )}

            {activeTab === 'unitturns' && (
              <div className="w-full">
                <UnitTurnTracker 
                  onSelectUnitTurn={setSelectedUnitTurn}
                  onUnitCardSelected={setIsUnitCardSelected}
                  onStepSelected={handleStepSelected}
                  scheduledStepIds={scheduledStepIds}
                />
              </div>
            )}
          </div>

          {/* Show drop zone based on updated logic - only show when Queue tab OR when unit card steps are shown */}
          {shouldShowDropZone && (
            <ScheduleDropZone onScheduleWorkOrder={handleScheduleWorkOrder} />
          )}
        </div>
      </DragDropProvider>
    </MaintenanceContext.Provider>
  );
};

// Export the context for use in other components
export { MaintenanceContext };
export default MaintenanceScheduleTab;
