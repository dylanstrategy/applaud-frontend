import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Bell, Mail, MessageSquare, Gesture } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface NotificationSetupProps {
  onBack: () => void;
}

const NotificationSetup: React.FC<NotificationSetupProps> = ({ onBack }) => {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    email: {
      workOrders: true,
      moveIns: true,
      moveOuts: true,
      emergencies: true,
      dailyReports: false,
      weeklyReports: true,
      maintenanceAlerts: true,
      leaseRenewals: true
    },
    sms: {
      emergencies: true,
      urgentWorkOrders: true,
      moveInReminders: true,
      importantUpdates: false
    },
    push: {
      newMessages: true,
      taskReminders: true,
      meetingAlerts: true,
      systemUpdates: false
    },
    desktop: {
      incomingCalls: true,
      newEmails: false,
      calendarReminders: true,
      systemAlerts: true
    }
  });

  const [swipeGestures, setSwipeGestures] = useState({
    payment: {
      left: 'remind',
      right: 'pay'
    },
    service: {
      left: 'skip',
      right: 'schedule'
    },
    event: {
      left: 'decline',
      right: 'accept'
    },
    workorder: {
      left: 'reschedule',
      right: 'approve'
    },
    message: {
      left: 'archive',
      right: 'reply'
    }
  });

  const gestureOptions = {
    payment: {
      options: [
        { value: 'remind', label: '⏰ Remind Me Later', icon: '⏰' },
        { value: 'pay', label: '💳 Pay Now', icon: '💳' },
        { value: 'skip', label: '⏭️ Skip', icon: '⏭️' },
        { value: 'view', label: '👁️ View Details', icon: '👁️' }
      ]
    },
    service: {
      options: [
        { value: 'schedule', label: '📅 Schedule', icon: '📅' },
        { value: 'skip', label: '⏭️ Skip', icon: '⏭️' },
        { value: 'info', label: 'ℹ️ More Info', icon: 'ℹ️' },
        { value: 'save', label: '💾 Save for Later', icon: '💾' }
      ]
    },
    event: {
      options: [
        { value: 'accept', label: '✅ Accept/RSVP', icon: '✅' },
        { value: 'decline', label: '❌ Decline', icon: '❌' },
        { value: 'maybe', label: '🤔 Maybe', icon: '🤔' },
        { value: 'remind', label: '⏰ Remind Me', icon: '⏰' }
      ]
    },
    workorder: {
      options: [
        { value: 'approve', label: '✅ Approve', icon: '✅' },
        { value: 'reschedule', label: '📅 Reschedule', icon: '📅' },
        { value: 'cancel', label: '❌ Cancel', icon: '❌' },
        { value: 'comment', label: '💬 Add Comment', icon: '💬' }
      ]
    },
    message: {
      options: [
        { value: 'reply', label: '💬 Quick Reply', icon: '💬' },
        { value: 'archive', label: '📦 Archive', icon: '📦' },
        { value: 'star', label: '⭐ Star/Important', icon: '⭐' },
        { value: 'delete', label: '🗑️ Delete', icon: '🗑️' }
      ]
    }
  };

  const handleSave = () => {
    try {
      // Save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      localStorage.setItem('swipeGesturePreferences', JSON.stringify(swipeGestures));
      
      // Show success toast
      toast({
        title: "✅ Settings Updated",
        description: "Your notification and gesture preferences have been saved successfully.",
        duration: 4000,
      });
      
      console.log('Settings saved successfully:', { notifications, swipeGestures });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "❌ Save Failed",
        description: "Failed to save preferences. Please try again.",
        duration: 4000,
      });
    }
  };

  const handleEmailChange = (key: keyof typeof notifications.email, checked: boolean) => {
    const newNotifications = {
      ...notifications,
      email: { ...notifications.email, [key]: checked }
    };
    setNotifications(newNotifications);
    
    // Save immediately
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notification change:', error);
    }
  };

  const handleSmsChange = (key: keyof typeof notifications.sms, checked: boolean) => {
    const newNotifications = {
      ...notifications,
      sms: { ...notifications.sms, [key]: checked }
    };
    setNotifications(newNotifications);
    
    // Save immediately
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notification change:', error);
    }
  };

  const handlePushChange = (key: keyof typeof notifications.push, checked: boolean) => {
    const newNotifications = {
      ...notifications,
      push: { ...notifications.push, [key]: checked }
    };
    setNotifications(newNotifications);
    
    // Save immediately
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notification change:', error);
    }
  };

  const handleDesktopChange = (key: keyof typeof notifications.desktop, checked: boolean) => {
    const newNotifications = {
      ...notifications,
      desktop: { ...notifications.desktop, [key]: checked }
    };
    setNotifications(newNotifications);
    
    // Save immediately
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notification change:', error);
    }
  };

  const handleGestureChange = (eventType: string, direction: 'left' | 'right', action: string) => {
    const newGestures = {
      ...swipeGestures,
      [eventType]: {
        ...swipeGestures[eventType as keyof typeof swipeGestures],
        [direction]: action
      }
    };
    setSwipeGestures(newGestures);
    
    // Save immediately
    try {
      localStorage.setItem('swipeGesturePreferences', JSON.stringify(newGestures));
    } catch (error) {
      console.error('Error saving gesture change:', error);
    }
  };

  // Load saved data on mount and listen for storage changes
  useEffect(() => {
    const loadData = () => {
      const savedNotifications = localStorage.getItem('notificationSettings');
      const savedGestures = localStorage.getItem('swipeGesturePreferences');
      
      if (savedNotifications) {
        try {
          setNotifications(JSON.parse(savedNotifications));
        } catch (error) {
          console.error('Error loading saved notification settings:', error);
        }
      }
      
      if (savedGestures) {
        try {
          setSwipeGestures(JSON.parse(savedGestures));
        } catch (error) {
          console.error('Error loading saved gesture settings:', error);
        }
      }
    };

    loadData();

    // Listen for localStorage changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notificationSettings' || e.key === 'swipeGesturePreferences') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications & Gestures</h2>
            <p className="text-sm text-gray-600">Manage your notification preferences and swipe gestures</p>
          </div>
        </div>

        {/* Swipe Gestures Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gesture className="w-5 h-5" />
              Swipe Gesture Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(gestureOptions).map(([eventType, config]) => (
              <div key={eventType} className="space-y-3">
                <h3 className="font-medium capitalize text-gray-900">{eventType} Events</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Swipe Left Action
                    </label>
                    <Select
                      value={swipeGestures[eventType as keyof typeof swipeGestures]?.left}
                      onValueChange={(value) => handleGestureChange(eventType, 'left', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Swipe Right Action
                    </label>
                    <Select
                      value={swipeGestures[eventType as keyof typeof swipeGestures]?.right}
                      onValueChange={(value) => handleGestureChange(eventType, 'right', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Work Orders</div>
                  <div className="text-sm text-gray-600">New work orders and updates</div>
                </div>
                <Switch 
                  checked={notifications.email.workOrders}
                  onCheckedChange={(checked) => handleEmailChange('workOrders', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Move-Ins</div>
                  <div className="text-sm text-gray-600">Move-in notifications and reminders</div>
                </div>
                <Switch 
                  checked={notifications.email.moveIns}
                  onCheckedChange={(checked) => handleEmailChange('moveIns', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Move-Outs</div>
                  <div className="text-sm text-gray-600">Move-out notifications and reminders</div>
                </div>
                <Switch 
                  checked={notifications.email.moveOuts}
                  onCheckedChange={(checked) => handleEmailChange('moveOuts', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Emergency Alerts</div>
                  <div className="text-sm text-gray-600">Critical emergency notifications</div>
                </div>
                <Switch 
                  checked={notifications.email.emergencies}
                  onCheckedChange={(checked) => handleEmailChange('emergencies', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Daily Reports</div>
                  <div className="text-sm text-gray-600">Daily summary reports</div>
                </div>
                <Switch 
                  checked={notifications.email.dailyReports}
                  onCheckedChange={(checked) => handleEmailChange('dailyReports', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Weekly Reports</div>
                  <div className="text-sm text-gray-600">Weekly summary reports</div>
                </div>
                <Switch 
                  checked={notifications.email.weeklyReports}
                  onCheckedChange={(checked) => handleEmailChange('weeklyReports', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              SMS Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Emergency Alerts</div>
                  <div className="text-sm text-gray-600">Critical emergency text messages</div>
                </div>
                <Switch 
                  checked={notifications.sms.emergencies}
                  onCheckedChange={(checked) => handleSmsChange('emergencies', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Urgent Work Orders</div>
                  <div className="text-sm text-gray-600">High-priority work order alerts</div>
                </div>
                <Switch 
                  checked={notifications.sms.urgentWorkOrders}
                  onCheckedChange={(checked) => handleSmsChange('urgentWorkOrders', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Move-In Reminders</div>
                  <div className="text-sm text-gray-600">Move-in appointment reminders</div>
                </div>
                <Switch 
                  checked={notifications.sms.moveInReminders}
                  onCheckedChange={(checked) => handleSmsChange('moveInReminders', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Important Updates</div>
                  <div className="text-sm text-gray-600">System updates and announcements</div>
                </div>
                <Switch 
                  checked={notifications.sms.importantUpdates}
                  onCheckedChange={(checked) => handleSmsChange('importantUpdates', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">New Messages</div>
                  <div className="text-sm text-gray-600">Instant message notifications</div>
                </div>
                <Switch 
                  checked={notifications.push.newMessages}
                  onCheckedChange={(checked) => handlePushChange('newMessages', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Task Reminders</div>
                  <div className="text-sm text-gray-600">Task and deadline reminders</div>
                </div>
                <Switch 
                  checked={notifications.push.taskReminders}
                  onCheckedChange={(checked) => handlePushChange('taskReminders', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Meeting Alerts</div>
                  <div className="text-sm text-gray-600">Meeting and appointment alerts</div>
                </div>
                <Switch 
                  checked={notifications.push.meetingAlerts}
                  onCheckedChange={(checked) => handlePushChange('meetingAlerts', checked)}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">System Updates</div>
                  <div className="text-sm text-gray-600">App updates and maintenance notices</div>
                </div>
                <Switch 
                  checked={notifications.push.systemUpdates}
                  onCheckedChange={(checked) => handlePushChange('systemUpdates', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default NotificationSetup;
