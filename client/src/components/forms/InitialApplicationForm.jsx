// client/src/components/forms/InitialApplicationForm.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { ArrowRight, User, Mail, Phone, Linkedin, Users, MessageSquare, Loader2 } from 'lucide-react';
import { submitApplication } from '../../api/applicant.api';
import { useAlert } from '../../hooks/useAlert';
import { SOURCING_CHANNELS } from '../../utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InitialApplicationForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      interestedInJoining: true
    }
  });

  const onSubmit = async (data) => {
    try {
      const response = await submitApplication(data);
      showSuccess('Application submitted successfully!');

      if (onSuccess) onSuccess();

      navigate(`/application-success/${response.data.data.id}`);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit application. Please try again.');
    }
  };

  // Light-themed React Select styles
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#fff',
      borderColor: state.isFocused ? '#10b981' : (errors.sourcingChannel ? '#ef4444' : '#e5e7eb'),
      borderRadius: '0.75rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(249,115,22,0.15)' : 'none',
      paddingLeft: '2.5rem',
      minHeight: '46px',
      color: '#111827',
      '&:hover': { borderColor: state.isFocused ? '#10b981' : '#d1d5db' },
    }),
    placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
    singleValue: (provided) => ({ ...provided, color: '#111827' }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'transparent',
      color: state.isSelected ? '#fff' : '#374151',
      cursor: 'pointer',
      ':active': { backgroundColor: '#059669' },
    }),
    input: (provided) => ({ ...provided, color: '#111827' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (provided) => ({ ...provided, color: '#9ca3af' }),
  };

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
  const iconCls =
    'absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors';

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
          {/* Full Name */}
          <div className="group">
            <label htmlFor="fullName" className={labelCls}>Full Name</label>
            <div className="relative">
              <User className={iconCls} size={17} />
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                className={cn(
                  'pl-10 h-10 rounded-xl',
                  errors.fullName && 'border-red-400'
                )}
                {...register('fullName', { required: 'Full name is required' })}
              />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div className="group">
            <label htmlFor="email" className={labelCls}>Email Address</label>
            <div className="relative">
              <Mail className={iconCls} size={17} />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={cn(
                  'pl-10 h-10 rounded-xl',
                  errors.email && 'border-red-400'
                )}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
                })}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Phone Number */}
          <div className="group">
            <label htmlFor="phoneNumber" className={labelCls}>Phone Number</label>
            <div className="relative">
              <Phone className={iconCls} size={17} />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="9876543210"
                className={cn(
                  'pl-10 h-10 rounded-xl',
                  errors.phoneNumber && 'border-red-400'
                )}
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: { value: /^\d{10,15}$/, message: 'Please enter a valid phone number' }
                })}
              />
            </div>
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
          </div>

          {/* WhatsApp Number */}
          <div className="group">
            <label htmlFor="whatsappNumber" className={labelCls}>
              WhatsApp Number <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className={iconCls} size={17} />
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="Same as phone"
                className="pl-10 h-10 rounded-xl"
                {...register('whatsappNumber')}
              />
            </div>
          </div>
        </div>

        {/* LinkedIn URL */}
        <div className="group">
          <label htmlFor="linkedinProfileUrl" className={labelCls}>LinkedIn Profile URL</label>
          <div className="relative">
            <Linkedin className={iconCls} size={17} />
            <Input
              id="linkedinProfileUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/your-profile"
              className={cn(
                'pl-10 h-10 rounded-xl',
                errors.linkedinProfileUrl && 'border-red-400'
              )}
              {...register('linkedinProfileUrl', {
                required: 'LinkedIn profile URL is required',
                validate: value => value.includes('linkedin.com/') || 'Please enter a valid LinkedIn profile URL'
              })}
            />
          </div>
          {errors.linkedinProfileUrl && <p className="mt-1 text-xs text-red-500">{errors.linkedinProfileUrl.message}</p>}
        </div>

        {/* Sourcing Channel */}
        <div className="group">
          <label htmlFor="sourcingChannel" className={labelCls}>How did you hear about us?</label>
          <div className="relative">
            <Users className={cn(iconCls, 'z-10')} size={17} />
            <Controller
              name="sourcingChannel"
              control={control}
              rules={{ required: 'Please select an option' }}
              render={({ field }) => (
                <Select
                  {...field}
                  instanceId="sourcing-channel-select"
                  options={SOURCING_CHANNELS}
                  value={SOURCING_CHANNELS.find(c => c.value === field.value)}
                  onChange={val => field.onChange(val.value)}
                  styles={customSelectStyles}
                  placeholder="Select an option"
                />
              )}
            />
          </div>
          {errors.sourcingChannel && <p className="mt-1 text-xs text-red-500">{errors.sourcingChannel.message}</p>}
        </div>

        {/* Additional Comments */}
        <div className="group">
          <label htmlFor="additionalComments" className={labelCls}>
            Additional Comments <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <div className="relative">
            <MessageSquare className={cn(iconCls, 'top-3.5 -translate-y-0')} size={17} />
            <textarea
              id="additionalComments"
              rows={3}
              placeholder="Anything else you'd like to share..."
              className="flex w-full rounded-xl border border-input bg-transparent pl-10 pr-4 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-slate-400 resize-none"
              {...register('additionalComments')}
            />
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            id="interestedInJoining"
            type="checkbox"
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/30 transition-all cursor-pointer"
            {...register('interestedInJoining')}
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
            I am interested in joining the Interviewer Community.
          </span>
        </label>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="success"
            size="lg"
            className="w-full rounded-xl shadow-md shadow-emerald-500/15 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Submitting...
              </>
            ) : (
              <>
                Submit Application <ArrowRight size={17} className="ml-2" />
              </>
            )}
          </Button>
          <p className="text-center text-gray-400 text-xs mt-3">
            By submitting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </form>
    </>
  );
};

export default InitialApplicationForm;
