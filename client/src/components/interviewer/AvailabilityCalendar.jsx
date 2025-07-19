// client/src/components/interviewer/AvailabilityCalendar.jsx
import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import Card from '../common/Card';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import { getAvailability, setAvailability } from '../../api/interviewer.api';
import { useAlert } from '../../hooks/useAlert';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../utils/constants';

const AvailabilityCalendar = () => {
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for weekly, 1 for specific dates
  const [availability, setAvailabilityData] = useState({
    recurringSlots: [],
    specificSlots: [],
    timezone: 'Asia/Kolkata',
    availabilityNotes: ''
  });
  
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await getAvailability();
        setAvailabilityData(response.data || {
          recurringSlots: [],
          specificSlots: [],
          timezone: 'Asia/Kolkata',
          availabilityNotes: ''
        });
      } catch (error) {
        console.error('Error fetching availability:', error);
        showError('Failed to load availability data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [showError]);
  
  const handleTimezoneChange = (e) => {
    setAvailabilityData(prev => ({
      ...prev,
      timezone: e.target.value
    }));
  };
  
  const handleNotesChange = (e) => {
    setAvailabilityData(prev => ({
      ...prev,
      availabilityNotes: e.target.value
    }));
  };
  
  const addRecurringSlot = () => {
    setAvailabilityData(prev => ({
      ...prev,
      recurringSlots: [
        ...prev.recurringSlots,
        {
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          isActive: true
        }
      ]
    }));
  };
  
  const removeRecurringSlot = (index) => {
    setAvailabilityData(prev => ({
      ...prev,
      recurringSlots: prev.recurringSlots.filter((_, i) => i !== index)
    }));
  };
  
  const updateRecurringSlot = (index, field, value) => {
    setAvailabilityData(prev => {
      const newSlots = [...prev.recurringSlots];
      newSlots[index] = {
        ...newSlots[index],
        [field]: value
      };
      return {
        ...prev,
        recurringSlots: newSlots
      };
    });
  };
  
  const addSpecificSlot = () => {
    setAvailabilityData(prev => ({
      ...prev,
      specificSlots: [
        ...prev.specificSlots,
        {
          date: '',
          startTime: '',
          endTime: '',
          isActive: true
        }
      ]
    }));
  };
  
  const removeSpecificSlot = (index) => {
    setAvailabilityData(prev => ({
      ...prev,
      specificSlots: prev.specificSlots.filter((_, i) => i !== index)
    }));
  };
  
  const updateSpecificSlot = (index, field, value) => {
    setAvailabilityData(prev => {
      const newSlots = [...prev.specificSlots];
      newSlots[index] = {
        ...newSlots[index],
        [field]: value
      };
      return {
        ...prev,
        specificSlots: newSlots
      };
    });
  };
  
  const handleSaveAvailability = async () => {
    // Validate slots
    const validateSlots = () => {
      // Validate recurring slots
      for (const slot of availability.recurringSlots) {
        if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
          showError('Please fill in all fields for recurring slots');
          return false;
        }
        
        if (slot.startTime >= slot.endTime) {
          showError('End time must be after start time');
          return false;
        }
      }
      
      // Validate specific slots
      for (const slot of availability.specificSlots) {
        if (!slot.date || !slot.startTime || !slot.endTime) {
          showError('Please fill in all fields for specific dates');
          return false;
        }
        
        if (slot.startTime >= slot.endTime) {
          showError('End time must be after start time');
          return false;
        }
        
        // Check if date is in the past
        const selectedDate = new Date(slot.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          showError('Cannot set availability for past dates');
          return false;
        }
      }
      
      return true;
    };
    
    if (!validateSlots()) {
      return;
    }
    
    setSaving(true);
    try {
      await setAvailability(availability);
      showSuccess('Availability updated successfully!');
    } catch (error) {
      console.error('Error updating availability:', error);
      showError('Failed to update availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card title="Timezone Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Your Timezone"
            value={availability.timezone}
            onChange={handleTimezoneChange}
            options={[
              { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
              { value: 'Etc/UTC', label: 'Coordinated Universal Time (UTC)' }
            ]}
            required
          />
          
          <Input
            label="Availability Notes"
            value={availability.availabilityNotes}
            onChange={handleNotesChange}
            placeholder="Add any notes about your availability (optional)"
          />
        </div>
      </Card>
      
      <Card 
        title="Set Your Availability"
        footer={
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSaveAvailability}
              disabled={saving}
              icon={<FiSave />}
              iconPosition="left"
            >
              {saving ? 'Saving...' : 'Save Availability'}
            </Button>
          </div>
        }
      >
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab(0)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 0
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiCalendar className="inline-block mr-2" />
                Weekly Schedule
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 1
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiClock className="inline-block mr-2" />
                Specific Dates
              </button>
            </nav>
          </div>
          
          <div className="mt-6">
            {activeTab === 0 ? (
              // Weekly Recurring Slots
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Set your recurring weekly availability. These slots will repeat every week.
                </p>
                
                {availability.recurringSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No recurring slots added yet.</p>
                    <Button
                      variant="outline"
                      onClick={addRecurringSlot}
                      icon={<FiPlus />}
                      iconPosition="left"
                    >
                      Add Weekly Slot
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availability.recurringSlots.map((slot, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-md font-medium text-gray-900">Weekly Slot {index + 1}</h4>
                          <Button
                            variant="ghost"
                            onClick={() => removeRecurringSlot(index)}
                            icon={<FiTrash2 className="text-red-500" />}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Select
                            label="Day of Week"
                            value={slot.dayOfWeek}
                            onChange={(e) => updateRecurringSlot(index, 'dayOfWeek', e.target.value)}
                            options={DAYS_OF_WEEK}
                            placeholder="Select day"
                            required
                          />
                          
                          <Select
                            label="Start Time"
                            value={slot.startTime}
                            onChange={(e) => updateRecurringSlot(index, 'startTime', e.target.value)}
                            options={TIME_SLOTS}
                            placeholder="Select start time"
                            required
                          />
                          
                          <Select
                            label="End Time"
                            value={slot.endTime}
                            onChange={(e) => updateRecurringSlot(index, 'endTime', e.target.value)}
                            options={TIME_SLOTS}
                            placeholder="Select end time"
                            required
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={addRecurringSlot}
                        icon={<FiPlus />}
                        iconPosition="left"
                      >
                        Add Another Weekly Slot
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Specific Date Slots
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Set availability for specific dates. These are one-time slots that don't repeat.
                </p>
                
                {availability.specificSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No specific date slots added yet.</p>
                    <Button
                      variant="outline"
                      onClick={addSpecificSlot}
                      icon={<FiPlus />}
                      iconPosition="left"
                    >
                      Add Specific Date
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availability.specificSlots.map((slot, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-md font-medium text-gray-900">Specific Date Slot {index + 1}</h4>
                          <Button
                            variant="ghost"
                            onClick={() => removeSpecificSlot(index)}
                            icon={<FiTrash2 className="text-red-500" />}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="Date"
                            type="date"
                            value={slot.date}
                            onChange={(e) => updateSpecificSlot(index, 'date', e.target.value)}
                            required
                          />
                          
                          <Select
                            label="Start Time"
                            value={slot.startTime}
                            onChange={(e) => updateSpecificSlot(index, 'startTime', e.target.value)}
                            options={TIME_SLOTS}
                            placeholder="Select start time"
                            required
                          />
                          
                          <Select
                            label="End Time"
                            value={slot.endTime}
                            onChange={(e) => updateSpecificSlot(index, 'endTime', e.target.value)}
                            options={TIME_SLOTS}
                            placeholder="Select end time"
                            required
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={addSpecificSlot}
                        icon={<FiPlus />}
                        iconPosition="left"
                      >
                        Add Another Specific Date
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AvailabilityCalendar;