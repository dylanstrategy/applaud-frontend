
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Wrench, AlertTriangle, User, Calendar, Filter } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface WorkOrder {
  id: string;
  unit: string;
  title: string;
  description: string;
  category: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'unscheduled' | 'scheduled' | 'overdue';
  assignedTo: string;
  resident: string;
  phone: string;
  daysOpen: number;
  estimatedTime: string;
  submittedDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  photo: string;
  timeline?: any[];
}

interface WorkOrderQueueProps {
  workOrders?: WorkOrder[];
  onSelectWorkOrder?: (workOrder: WorkOrder) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const WorkOrderCard: React.FC<{ workOrder: WorkOrder; onClick: () => void; onDragStart?: () => void; onDragEnd?: () => void }> = ({ workOrder, onClick, onDragStart, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'workOrder',
    item: { workOrder },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (isDragging && onDragStart) {
      onDragStart();
    } else if (!isDragging && onDragEnd) {
      onDragEnd();
    }
  }, [isDragging, onDragStart, onDragEnd]);

  // Add timeline data to work order when clicked
  const handleClick = () => {
    const workOrderWithTimeline = {
      ...workOrder,
      timeline: workOrder.timeline || [
        {
          date: workOrder.submittedDate,
          time: '08:30',
          type: 'submitted',
          message: 'Work order submitted by resident',
          user: workOrder.resident
        },
        {
          date: workOrder.submittedDate,
          time: '09:15',
          type: 'assigned',
          message: `Assigned to ${workOrder.assignedTo}`,
          user: 'System'
        }
      ]
    };
    onClick();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-600 text-white';
      case 'unscheduled': return 'bg-gray-600 text-white';
      case 'overdue': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card 
        className={`cursor-move hover:shadow-md transition-shadow ${
          workOrder.status === 'overdue' ? 'border-l-4 border-l-red-500' : 
          workOrder.status === 'unscheduled' ? 'border-l-4 border-l-gray-400' :
          'border-l-4 border-l-blue-500'
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          {/* Priority Strip */}
          <div className={`h-1 w-full ${
            workOrder.priority === 'urgent' ? 'bg-red-500' :
            workOrder.priority === 'high' ? 'bg-orange-500' :
            workOrder.priority === 'medium' ? 'bg-yellow-500' :
            'bg-green-500'
          }`}></div>
          
          <div className="p-4">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">#{workOrder.id}</span>
                  <Badge className={`${getPriorityColor(workOrder.priority)} text-xs px-2 py-0.5`}>
                    {workOrder.priority.toUpperCase()}
                  </Badge>
                </div>
                <Badge className={`${getStatusColor(workOrder.status)} text-xs px-2 py-0.5`}>
                  {workOrder.status.toUpperCase()}
                </Badge>
                {workOrder.scheduledDate && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Scheduled: {workOrder.scheduledDate} at {workOrder.scheduledTime}</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ml-3">
                <img 
                  src={workOrder.photo} 
                  alt="Issue"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Title and Description */}
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Unit {workOrder.unit} - {workOrder.title}
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                {workOrder.description}
              </p>
            </div>
            
            {/* Resident Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">{workOrder.resident}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{workOrder.phone}</span>
              </div>
            </div>
            
            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-blue-500" />
                <span className="text-gray-700 font-medium">{workOrder.assignedTo}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-green-500" />
                  <span className="text-gray-600">{workOrder.estimatedTime}</span>
                </div>
                <span className={`font-bold ${workOrder.daysOpen > 7 ? 'text-red-600' : 'text-orange-600'}`}>
                  {workOrder.daysOpen}d
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const WorkOrderQueue: React.FC<WorkOrderQueueProps> = ({ workOrders = [], onSelectWorkOrder, onDragStart, onDragEnd }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredWorkOrders = useMemo(() => {
    let filtered = workOrders;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(wo => wo.status === filterStatus || wo.priority === filterStatus);
    }

    // Sort by priority then by days open
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.daysOpen - a.daysOpen;
    });
  }, [workOrders, filterStatus]);

  const unscheduledCount = workOrders.filter(wo => wo.status === 'unscheduled').length;
  const scheduledCount = workOrders.filter(wo => wo.status === 'scheduled').length;
  const overdueCount = workOrders.filter(wo => wo.status === 'overdue').length;

  return (
    <div className="w-full">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            Work Order Queue
          </h2>
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="bg-gray-50">
              {unscheduledCount} Unscheduled
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              {scheduledCount} Scheduled
            </Badge>
            <Badge variant="outline" className="bg-red-50">
              {overdueCount} Overdue
            </Badge>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter work orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Work Orders</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="unscheduled">Unscheduled</SelectItem>
                <SelectItem value="scheduled">Future Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="px-4 pb-32">
        <div className="space-y-4">
          {filteredWorkOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No work orders found for the selected filter.
            </div>
          ) : (
            filteredWorkOrders.map((workOrder) => (
              <WorkOrderCard
                key={workOrder.id}
                workOrder={workOrder}
                onClick={() => onSelectWorkOrder?.(workOrder)}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderQueue;
