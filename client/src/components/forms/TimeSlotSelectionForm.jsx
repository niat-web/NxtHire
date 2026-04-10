// client/src/components/forms/TimeSlotSelectionForm.jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { setAvailability } from '../../api/interviewer.api';
import { useAlert } from '../../hooks/useAlert';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../utils/constants';

const SelectField = React.forwardRef(({ label, options, error, placeholder, required, className, ...props }, ref) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-slate-400',
        error && 'border-red-400',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));
SelectField.displayName = 'SelectField';

const TimeSlotSelectionForm = ({ initialData = null, onSuccess }) => {
  const { showSuccess, showError } = useAlert();
  const [activeTab, setActiveTab] = useState(0);

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

  const tabs = [
    { label: 'Weekly Schedule', value: 0 },
    { label: 'Specific Dates', value: 1 },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Timezone</CardTitle>
          </CardHeader>
          <CardContent>
            <SelectField
              label="Your Timezone"
              {...register('timezone', { required: 'Timezone is required' })}
              options={[
                { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                { value: 'Etc/UTC', label: 'Coordinated Universal Time (UTC)' }
              ]}
              error={errors.timezone?.message}
              required
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability Notes</label>
              <Input
                {...register('availabilityNotes')}
                placeholder="Add any notes about your availability (optional)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Set Your Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Tab buttons */}
            <div className="flex border-b border-gray-200 mb-6">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 -mb-px rounded-none transition-colors',
                    activeTab === tab.value
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Weekly Schedule Tab */}
            {activeTab === 0 && (
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
                    >
                      <Plus className="mr-2 h-4 w-4" />
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
                            size="sm"
                            onClick={() => recurringSlots.remove(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <SelectField
                            label="Day of Week"
                            {...register(`recurringSlots.${index}.dayOfWeek`, {
                              required: 'Day of week is required'
                            })}
                            options={DAYS_OF_WEEK}
                            error={errors.recurringSlots?.[index]?.dayOfWeek?.message}
                            placeholder="Select day"
                            required
                          />

                          <SelectField
                            label="Start Time"
                            {...register(`recurringSlots.${index}.startTime`, {
                              required: 'Start time is required'
                            })}
                            options={TIME_SLOTS}
                            error={errors.recurringSlots?.[index]?.startTime?.message}
                            placeholder="Select start time"
                            required
                          />

                          <SelectField
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
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Weekly Slot
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specific Dates Tab */}
            {activeTab === 1 && (
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
                    >
                      <Plus className="mr-2 h-4 w-4" />
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
                            size="sm"
                            onClick={() => specificSlots.remove(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Date <span className="text-red-500">*</span>
                            </label>
                            <Input
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
                              className={cn(errors.specificSlots?.[index]?.date && 'border-red-400')}
                            />
                            {errors.specificSlots?.[index]?.date && (
                              <p className="mt-1 text-xs text-red-500">{errors.specificSlots[index].date.message}</p>
                            )}
                          </div>

                          <SelectField
                            label="Start Time"
                            {...register(`specificSlots.${index}.startTime`, {
                              required: 'Start time is required'
                            })}
                            options={TIME_SLOTS}
                            error={errors.specificSlots?.[index]?.startTime?.message}
                            placeholder="Select start time"
                            required
                          />

                          <SelectField
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
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Specific Date
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="success"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TimeSlotSelectionForm;
