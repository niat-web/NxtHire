// client/src/components/forms/TimeSlotSelectionForm.jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import Card from '../common/Card';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import Tabs from '../common/Tabs';
import { setAvailability } from '../../api/interviewer.api';
import { useAlert } from '../../hooks/useAlert';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../utils/constants';

const TimeSlotSelectionForm = ({ initialData = null, onSuccess }) => {
  const { showSuccess, showError } = useAlert();
  const [activeTab, setActiveTab] = useState(0);
  
  // Initialize form with existing data or defaults
  const { 
    register, 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      recurringSlots: initialData?.recurringSlots || [],
      specificSlots: initialData?.specificSlots || [],
      timezone: initialData?.timezone || 'Asia/Kolkata',
      availabilityNotes: initialData?.availabilityNotes || ''
    }
  });

  // Field arrays for both types of slots
  const recurringSlots = useFieldArray({
    control,
    name: 'recurringSlots'
  });

  const specificSlots = useFieldArray({
    control,
    name: 'specificSlots'
  });

  const onSubmit = async (data) => {
    try {
      await setAvailability(data);
      showSuccess('Availability updated successfully!');
      
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update availability. Please try again.');
    }
  };

  const addRecurringSlot = () => {
    recurringSlots.append({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      isActive: true
    });
  };

  const addSpecificSlot = () => {
    specificSlots.append({
      date: '',
      startTime: '',
      endTime: '',
      isActive: true
    });
  };

  // Tab content
  const tabContent = [
    {
      label: 'Weekly Schedule',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            Set your recurring weekly availability. These slots will repeat every week.
          </p>
          
          {recurringSlots.fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No recurring slots added yet.</p>
              <Button
                type="button"
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
              {recurringSlots.fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Weekly Slot {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => recurringSlots.remove(index)}
                      icon={<FiTrash2 className="text-red-500" />}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Day of Week"
                      {...register(`recurringSlots.${index}.dayOfWeek`, { 
                        required: 'Day of week is required' 
                      })}
                      options={DAYS_OF_WEEK}
                      error={errors.recurringSlots?.[index]?.dayOfWeek?.message}
                      placeholder="Select day"
                      required
                    />
                    
                    <Select
                      label="Start Time"
                      {...register(`recurringSlots.${index}.startTime`, { 
                        required: 'Start time is required' 
                      })}
                      options={TIME_SLOTS}
                      error={errors.recurringSlots?.[index]?.startTime?.message}
                      placeholder="Select start time"
                      required
                    />
                    
                    <Select
                      label="End Time"
                      {...register(`recurringSlots.${index}.endTime`, { 
                        required: 'End time is required',
                        validate: (value, formValues) => {
                          const startTime = formValues.recurringSlots[index].startTime;
                          return !startTime || value > startTime || 'End time must be after start time';
                        }
                      })}
                      options={TIME_SLOTS}
                      error={errors.recurringSlots?.[index]?.endTime?.message}
                      placeholder="Select end time"
                      required
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center">
                <Button
                  type="button"
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
      )
    },
    {
      label: 'Specific Dates',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            Set availability for specific dates. These are one-time slots that don't repeat.
          </p>
          
          {specificSlots.fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No specific date slots added yet.</p>
              <Button
                type="button"
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
              {specificSlots.fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Specific Date Slot {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => specificSlots.remove(index)}
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
                      {...register(`specificSlots.${index}.date`, { 
                        required: 'Date is required',
                        validate: value => {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return selectedDate >= today || 'Date cannot be in the past';
                        }
                      })}
                      error={errors.specificSlots?.[index]?.date?.message}
                      required
                    />
                    
                    <Select
                      label="Start Time"
                      {...register(`specificSlots.${index}.startTime`, { 
                        required: 'Start time is required' 
                      })}
                      options={TIME_SLOTS}
                      error={errors.specificSlots?.[index]?.startTime?.message}
                      placeholder="Select start time"
                      required
                    />
                    
                    <Select
                      label="End Time"
                      {...register(`specificSlots.${index}.endTime`, { 
                        required: 'End time is required',
                        validate: (value, formValues) => {
                          const startTime = formValues.specificSlots[index].startTime;
                          return !startTime || value > startTime || 'End time must be after start time';
                        }
                      })}
                      options={TIME_SLOTS}
                      error={errors.specificSlots?.[index]?.endTime?.message}
                      placeholder="Select end time"
                      required
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center">
                <Button
                  type="button"
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
      )
    }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Card title="Timezone">
          <Select
            label="Your Timezone"
            {...register('timezone', { required: 'Timezone is required' })}
            options={[
              { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
              { value: 'Etc/UTC', label: 'Coordinated Universal Time (UTC)' }
            ]}
            error={errors.timezone?.message}
            required
          />
          
          <Input
            label="Availability Notes"
            className="mt-4"
            {...register('availabilityNotes')}
            placeholder="Add any notes about your availability (optional)"
          />
        </Card>
        
        <Card title="Set Your Availability">
          <Tabs 
            tabs={tabContent} 
            defaultTab={activeTab} 
            onChange={setActiveTab}
          />
        </Card>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            icon={<FiSave />}
            iconPosition="left"
          >
            {isSubmitting ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TimeSlotSelectionForm;