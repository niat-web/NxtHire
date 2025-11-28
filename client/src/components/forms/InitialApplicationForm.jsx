// client/src/components/forms/InitialApplicationForm.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { Send, User, Mail, Phone, Linkedin, Users, MessageSquare } from 'lucide-react';
import { submitApplication } from '../../api/applicant.api';
import { useAlert } from '../../hooks/useAlert';
import { SOURCING_CHANNELS } from '../../utils/constants';

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

  // Custom styles for React Select to match dark theme
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#1e293b', // slate-800
      borderColor: state.isFocused ? '#f97316' : (errors.sourcingChannel ? '#ef4444' : '#334155'), // orange-500 : slate-700
      borderRadius: '0.75rem', // rounded-xl
      boxShadow: state.isFocused ? '0 0 0 1px #f97316' : 'none',
      paddingLeft: '2.5rem',
      minHeight: '50px',
      color: 'white',
      '&:hover': { borderColor: state.isFocused ? '#f97316' : '#475569' },
    }),
    placeholder: (provided) => ({ ...provided, color: '#94a3b8' }), // slate-400
    singleValue: (provided) => ({ ...provided, color: '#f8fafc' }), // slate-50
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1e293b', // slate-800
      border: '1px solid #334155', // slate-700
      borderRadius: '0.75rem',
      zIndex: 50
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#334155' : 'transparent',
      color: state.isSelected ? '#ffffff' : '#f8fafc',
      cursor: 'pointer',
      ':active': {
        backgroundColor: '#ea580c', // orange-600
      }
    }),
    input: (provided) => ({ ...provided, color: 'white' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (provided) => ({ ...provided, color: '#94a3b8' }),
  };

  const inputBaseClasses = "w-full py-3 pl-11 pr-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200";
  const inputErrorClasses = "!border-red-500 !focus:ring-red-500/50 !focus:border-red-500";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-2";
  const iconClasses = "absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-orange-400 transition-colors";

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Application Details</h2>
        <p className="text-slate-400 text-sm">Please fill in your information to get started.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          {/* Full Name Field */}
          <div className="group relative">
            <label htmlFor="fullName" className={labelClasses}>
              Full Name
            </label>
            <div className="relative">
              <User className={iconClasses} />
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                className={`${inputBaseClasses} ${errors.fullName && inputErrorClasses}`}
                {...register('fullName', { required: 'Full name is required' })}
              />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          {/* Email Field */}
          <div className="group relative">
            <label htmlFor="email" className={labelClasses}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={iconClasses} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`${inputBaseClasses} ${errors.email && inputErrorClasses}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
                })}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Phone Number Field */}
          <div className="group relative">
            <label htmlFor="phoneNumber" className={labelClasses}>
              Phone Number
            </label>
            <div className="relative">
              <Phone className={iconClasses} />
              <input
                id="phoneNumber"
                type="tel"
                placeholder="9876543210"
                className={`${inputBaseClasses} ${errors.phoneNumber && inputErrorClasses}`}
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: { value: /^\d{10,15}$/, message: 'Please enter a valid phone number' }
                })}
              />
            </div>
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
          </div>

          {/* WhatsApp Number Field */}
          <div className="group relative">
            <label htmlFor="whatsappNumber" className={labelClasses}>
              WhatsApp Number <span className="text-slate-500 text-xs ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className={iconClasses} />
              <input
                id="whatsappNumber"
                type="tel"
                placeholder="Same as phone"
                className={`${inputBaseClasses} ${errors.whatsappNumber && inputErrorClasses}`}
                {...register('whatsappNumber')}
              />
            </div>
          </div>
        </div>

        {/* LinkedIn URL Field */}
        <div className="group relative">
          <label htmlFor="linkedinProfileUrl" className={labelClasses}>
            LinkedIn Profile URL
          </label>
          <div className="relative">
            <Linkedin className={iconClasses} />
            <input
              id="linkedinProfileUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/your-profile"
              className={`${inputBaseClasses} ${errors.linkedinProfileUrl && inputErrorClasses}`}
              {...register('linkedinProfileUrl', {
                required: 'LinkedIn profile URL is required',
                validate: value => value.includes('linkedin.com/') || 'Please enter a valid LinkedIn profile URL'
              })}
            />
          </div>
          {errors.linkedinProfileUrl && <p className="mt-1 text-xs text-red-500">{errors.linkedinProfileUrl.message}</p>}
        </div>

        {/* Sourcing Channel Field */}
        <div className="group relative">
          <label htmlFor="sourcingChannel" className={labelClasses}>
            How did you hear about us?
          </label>
          <div className="relative">
            <Users className={`${iconClasses} z-10`} />
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

        {/* Additional Comments Field */}
        <div className="group relative">
          <label htmlFor="additionalComments" className={labelClasses}>
            Additional Comments <span className="text-slate-500 text-xs ml-1">(Optional)</span>
          </label>
          <div className="relative">
            <MessageSquare className={`${iconClasses} top-4 -translate-y-0`} />
            <textarea
              id="additionalComments"
              rows={3}
              placeholder="Anything else you'd like to share..."
              className={`${inputBaseClasses} pl-11 resize-none`}
              {...register('additionalComments')}
            />
          </div>
        </div>

        {/* Interested Checkbox */}
        <div>
          <label className="flex items-start cursor-pointer group">
            <div className="flex items-center h-5">
              <input
                id="interestedInJoining"
                type="checkbox"
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500/50 focus:ring-offset-0 focus:ring-offset-transparent transition-all cursor-pointer"
                {...register('interestedInJoining')}
              />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                I am interested in joining the Interviewer Community.
              </span>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-orange-500/25"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Application
              </>
            )}
          </button>
          <p className="text-center text-slate-500 text-xs mt-4">
            By submitting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </form>
    </>
  );
};

export default InitialApplicationForm;
