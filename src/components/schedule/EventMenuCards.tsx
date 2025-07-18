import React from 'react';
import { 
  MessageCircle, 
  Wrench, 
  Calendar, 
  Settings, 
  FileText, 
  Users,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface EventMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

interface EventMenuCardsProps {
  onMenuItemTap: (item: EventMenuItem) => void;
  className?: string;
  userRole?: 'resident' | 'operator';
}

const EventMenuCards: React.FC<EventMenuCardsProps> = ({
  onMenuItemTap,
  className = "",
  userRole = 'operator'
}) => {
  const getEventMenuItems = (): EventMenuItem[] => {
    if (userRole === 'resident') {
      return [
        {
          id: 'maintenance',
          title: 'Maintenance Request',
          description: 'Report unit issues',
          icon: Wrench,
          color: 'from-orange-500 to-orange-600',
          category: 'Maintenance'
        },
        {
          id: 'package',
          title: 'Package Delivery',
          description: 'Schedule deliveries',
          icon: Settings,
          color: 'from-purple-500 to-purple-600',
          category: 'Service'
        },
        {
          id: 'amenity',
          title: 'Amenity Booking',
          description: 'Reserve common areas',
          icon: Calendar,
          color: 'from-green-500 to-green-600',
          category: 'Booking'
        },
        {
          id: 'payment',
          title: 'Rent Payment',
          description: 'Make rental payments',
          icon: FileText,
          color: 'from-indigo-500 to-indigo-600',
          category: 'Financial'
        },
        {
          id: 'guest',
          title: 'Guest Registration',
          description: 'Register visitors',
          icon: Users,
          color: 'from-pink-500 to-pink-600',
          category: 'Access'
        },
        {
          id: 'service',
          title: 'Service Request',
          description: 'Cleaning & services',
          icon: CheckCircle,
          color: 'from-teal-500 to-teal-600',
          category: 'Service'
        },
        {
          id: 'renewal',
          title: 'Lease Renewal',
          description: 'Renewal process',
          icon: FileText,
          color: 'from-amber-500 to-amber-600',
          category: 'Lease'
        },
        {
          id: 'community',
          title: 'Community Event',
          description: 'Join activities',
          icon: Users,
          color: 'from-blue-500 to-blue-600',
          category: 'Community'
        },
        {
          id: 'message',
          title: 'Send a Message',
          description: 'Contact management',
          icon: MessageCircle,
          color: 'from-blue-500 to-blue-600',
          category: 'Communication'
        }
      ];
    }

    // Operator events
    return [
      {
        id: 'message',
        title: 'Message',
        description: 'Send resident communications',
        icon: MessageCircle,
        color: 'from-blue-500 to-blue-600',
        category: 'Communication'
      },
      {
        id: 'work-order',
        title: 'Work Order',
        description: 'Schedule maintenance tasks',
        icon: Wrench,
        color: 'from-orange-500 to-orange-600',
        category: 'Maintenance'
      },
      {
        id: 'appointment',
        title: 'Appointment',
        description: 'Schedule resident meetings',
        icon: Calendar,
        color: 'from-green-500 to-green-600',
        category: 'Scheduling'
      },
      {
        id: 'service',
        title: 'Service Request',
        description: 'External service needs',
        icon: Settings,
        color: 'from-purple-500 to-purple-600',
        category: 'Service'
      },
      {
        id: 'document',
        title: 'Document',
        description: 'Process lease documents',
        icon: FileText,
        color: 'from-indigo-500 to-indigo-600',
        category: 'Documentation'
      },
      {
        id: 'inspection',
        title: 'Inspection',
        description: 'Unit quality checks',
        icon: CheckCircle,
        color: 'from-teal-500 to-teal-600',
        category: 'Quality'
      },
      {
        id: 'meeting',
        title: 'Team Meeting',
        description: 'Staff coordination',
        icon: Users,
        color: 'from-pink-500 to-pink-600',
        category: 'Management'
      },
      {
        id: 'follow-up',
        title: 'Follow Up',
        description: 'Track pending items',
        icon: Clock,
        color: 'from-amber-500 to-amber-600',
        category: 'Follow-up'
      },
      {
        id: 'emergency',
        title: 'Emergency',
        description: 'Urgent response needed',
        icon: AlertTriangle,
        color: 'from-red-500 to-red-600',
        category: 'Emergency'
      }
    ];
  };

  const eventMenuItems = getEventMenuItems();

  return (
    <div className={`px-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Event Menu
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Tap to create new events)
          </span>
        </h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {eventMenuItems.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <div
              key={item.id}
              onClick={() => onMenuItemTap(item)}
              className={`
                relative p-4 rounded-xl cursor-pointer
                bg-gradient-to-br ${item.color}
                transform transition-all duration-200
                hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
                text-white
              `}
            >
              {/* Icon */}
              <div className="flex justify-center mb-2">
                <IconComponent className="w-6 h-6" />
              </div>
              
              {/* Title */}
              <h4 className="text-xs font-medium text-center leading-tight mb-1">
                {item.title}
              </h4>
              
              {/* Description */}
              <p className="text-xs text-center text-white/80 leading-tight">
                {item.description}
              </p>
              
              {/* Category Tag */}
              <div className="absolute top-1 right-1">
                <div className="bg-white/20 rounded-full px-1.5 py-0.5">
                  <span className="text-xs font-medium">
                    {item.category.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventMenuCards;