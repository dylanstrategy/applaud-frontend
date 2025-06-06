import React from 'react';
import { format, addHours } from 'date-fns';
import PointOfSale from '../PointOfSale';

interface MessageConfirmationProps {
  subject: string;
  message: string;
  recipientType: 'management' | 'maintenance' | 'leasing';
  onDone: () => void;
}

const MessageConfirmation = ({ subject, message, recipientType, onDone }: MessageConfirmationProps) => {
  // Simulate finding next available slot based on recipient type
  const getResponseTime = () => {
    const now = new Date();
    let hoursToAdd = 2; // Default 2 hours
    
    switch (recipientType) {
      case 'maintenance':
        hoursToAdd = 4; // Maintenance typically responds in 4 hours
        break;
      case 'leasing':
        hoursToAdd = 1; // Leasing office responds quickly (1 hour)
        break;
      case 'management':
      default:
        hoursToAdd = 2; // Management responds in 2 hours
        break;
    }
    
    // Add some randomness to make it more realistic
    const randomMinutes = Math.floor(Math.random() * 60);
    return addHours(now, hoursToAdd).getTime() + (randomMinutes * 60 * 1000);
  };

  const expectedResponseTime = new Date(getResponseTime());
  const timeString = format(expectedResponseTime, 'h:mm a');
  const dayString = format(expectedResponseTime, 'EEEE, MMMM d');

  const handleOfferClick = (offer: any) => {
    console.log('Offer clicked:', offer);
    // Here you could track the offer click, redirect to a partner page, etc.
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto pb-32">
        <div className="p-4 space-y-4">
          {/* Success Message */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl">✓</span>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">
              Message received
            </h2>
            
            <p className="text-gray-600 text-base">
              We'll respond shortly—check your calendar for updates.
            </p>
          </div>

          {/* Response Time Info */}
          <div className="text-center space-y-2">
            <h3 className="text-base font-semibold text-gray-900">
              {dayString}
            </h3>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-gray-900 font-medium text-sm">
                Response expected by {timeString}
              </div>
            </div>
          </div>

          {/* Point of Sale Offer */}
          <div className="w-full">
            <PointOfSale 
              context="message"
              onOfferClick={handleOfferClick}
            />
          </div>
        </div>
      </div>

      {/* Fixed Done Button - positioned higher to avoid nav */}
      <div className="absolute bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={onDone}
          className="w-full bg-black text-white py-3 px-6 rounded-xl font-semibold text-base hover:bg-gray-800 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default MessageConfirmation;
