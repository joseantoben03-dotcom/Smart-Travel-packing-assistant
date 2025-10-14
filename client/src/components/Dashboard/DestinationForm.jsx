import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';

const DestinationForm = ({ destination = null, onSubmit, onClose, isEditing = false }) => {
  const [formData, setFormData] = useState({
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    weatherPreference: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (destination && isEditing) {
      setFormData({
        city: destination.city || '',
        country: destination.country || '',
        startDate: destination.startDate ? new Date(destination.startDate).toISOString().split('T')[0] : '',
        endDate: destination.endDate ? new Date(destination.endDate).toISOString().split('T')[0] : '',
        weatherPreference: destination.weatherPreference || ''
      });
    }
  }, [destination, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.response?.data?.msg || `Failed to ${isEditing ? 'update' : 'add'} destination`);
    }
    
    setLoading(false);
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={isEditing ? 'Edit Destination' : 'Add New Destination'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
          required
        />

        <Input
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Country"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={!formData.city || !formData.country || !formData.startDate || !formData.endDate}
            className="flex-1"
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DestinationForm;