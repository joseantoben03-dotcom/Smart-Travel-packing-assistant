import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../UI/Button';
import DestinationForm from './DestinationForm';
import DestinationCard from './DestinationCard';
import WeatherCard from './WeatherCard';
import PackingList from './PackingList';

const Dashboard = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await api.get('/destinations');
      setDestinations(response.data);
      if (response.data.length > 0) {
        setSelectedDestination(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
    setLoading(false);
  };

  const handleAddDestination = async (destinationData) => {
    try {
      const response = await api.post('/destinations', destinationData);
      const newDestination = response.data;
      setDestinations([newDestination, ...destinations]);
      setSelectedDestination(newDestination);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding destination:', error);
      throw error;
    }
  };

  const handleEditDestination = async (destinationData) => {
    try {
      const response = await api.put(`/destinations/${selectedDestination._id}`, destinationData);
      const updatedDestination = response.data;
      
      // Update destinations array
      const updatedDestinations = destinations.map(dest =>
        dest._id === selectedDestination._id ? updatedDestination : dest
      );
      setDestinations(updatedDestinations);
      setSelectedDestination(updatedDestination);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating destination:', error);
      throw error;
    }
  };

  const handleDeleteDestination = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination? This will also delete all associated packing items.')) {
      try {
        await api.delete(`/destinations/${id}`);
        const updatedDestinations = destinations.filter(dest => dest._id !== id);
        setDestinations(updatedDestinations);
        
        if (selectedDestination?._id === id) {
          setSelectedDestination(updatedDestinations[0] || null);
        }
      } catch (error) {
        console.error('Error deleting destination:', error);
      }
    }
  };

  const updateDestination = (updatedDestination) => {
    // Update the selected destination
    setSelectedDestination(updatedDestination);
    
    // Update the destinations array
    setDestinations(prev => 
      prev.map(dest => 
        dest._id === updatedDestination._id ? updatedDestination : dest
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {destinations.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No destinations yet</h3>
            <p className="text-gray-600 mb-6">
              Start planning your trip by adding your first destination
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Add Your First Destination
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Destinations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Destinations</h2>
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {destinations.map((destination) => (
                  <DestinationCard
                    key={destination._id}
                    destination={destination}
                    isSelected={selectedDestination?._id === destination._id}
                    onClick={() => setSelectedDestination(destination)}
                    onEdit={() => {
                      setSelectedDestination(destination);
                      setShowEditForm(true);
                    }}
                    onDelete={() => handleDeleteDestination(destination._id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDestination && (
              <>
                {/* Destination Header */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {selectedDestination.city}, {selectedDestination.country}
                      </h1>
                      <p className="text-gray-600">
                        {new Date(selectedDestination.startDate).toLocaleDateString()} - {new Date(selectedDestination.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {selectedDestination.packingItems.filter(item => item.packed).length} / {selectedDestination.packingItems.length} items packed
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedDestination.packingItems.length > 0 
                          ? Math.round((selectedDestination.packingItems.filter(item => item.packed).length / selectedDestination.packingItems.length) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Card */}
                <WeatherCard destination={selectedDestination} />

                {/* Packing List */}
                <PackingList
                  destination={selectedDestination}
                  onUpdateDestination={updateDestination}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      {showAddForm && (
        <DestinationForm
          onSubmit={handleAddDestination}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Destination Modal */}
      {showEditForm && selectedDestination && (
        <DestinationForm
          destination={selectedDestination}
          onSubmit={handleEditDestination}
          onClose={() => setShowEditForm(false)}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default Dashboard;