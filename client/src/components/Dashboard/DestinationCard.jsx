import React from 'react';
import { MapPin, Calendar, Trash2, Edit } from 'lucide-react';
import Button from '../UI/Button';

const DestinationCard = ({ destination, isSelected, onClick, onEdit, onDelete }) => {
  const packedItems = destination.packingItems.filter(item => item.packed).length;
  const totalItems = destination.packingItems.length;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 group
        ${isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium text-gray-900">
              {destination.city}, {destination.country}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(destination.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
              {new Date(destination.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="text-xs text-gray-600">
            {packedItems} / {totalItems} items packed
          </div>
          
          <div className="mt-2 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="ml-3 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;