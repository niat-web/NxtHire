// client/src/components/forms/InitialApplicationForm.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { FiSend, FiUser, FiMail, FiPhone, FiLinkedin, FiUsers } from 'react-icons/fi';
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
    // Set default value for the checkbox
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

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#f8fafc', 
      borderColor: state.isFocused ? '#3b82f6' : (errors.sourcingChannel ? '#ef4444' : '#e2e8f0'), 
      borderRadius: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      paddingLeft: '2.25rem',
      minHeight: '44px',
      '&:hover': { borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1' }, 
    }),
    placeholder: (provided) => ({ ...provided, color: '#94a3b8' }),
    singleValue: (provided) => ({ ...provided, color: '#1e293b' }), 
    menu: (provided) => ({ ...provided, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', zIndex: 20 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : 'transparent',
      color: state.isSelected ? '#ffffff' : '#1e293b',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (provided) => ({ ...provided, color: '#94a3b8' }),
  };

  const inputBaseClasses = "w-full py-2.5 pl-10 pr-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200";
  const inputErrorClasses = "!border-red-500 !focus:ring-red-500 !focus:border-red-500";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400";

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <FiUser className={iconClasses} />
              <input 
                id="fullName" 
                type="text" 
                placeholder="John Doe" 
                className={`${inputBaseClasses} ${errors.fullName && inputErrorClasses}`}
                {...register('fullName', { required: 'Full name is required' })} 
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FiMail className={iconClasses} />
              <input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                className={`${inputBaseClasses} ${errors.email && inputErrorClasses}`}
                {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' } })} 
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className={iconClasses} />
              <input 
                id="phoneNumber" 
                type="tel" 
                placeholder="9876543210" 
                className={`${inputBaseClasses} ${errors.phoneNumber && inputErrorClasses}`}
                {...register('phoneNumber', { required: 'Phone number is required', pattern: { value: /^\d{10,15}$/, message: 'Please enter a valid phone number' } })} 
              />
            </div>
          </div>

          {/* WhatsApp Number Field */}
          <div>
            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
              WhatsApp Number <span className="text-slate-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <FiPhone className={iconClasses} />
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
        <div>
          <label htmlFor="linkedinProfileUrl" className="block text-sm font-medium text-slate-700 mb-1.5">
            LinkedIn Profile URL
          </label>
          <div className="relative">
            <FiLinkedin className={iconClasses} />
            <input 
              id="linkedinProfileUrl" 
              type="url" 
              placeholder="https://www.linkedin.com/in/your-profile" 
              className={`${inputBaseClasses} ${errors.linkedinProfileUrl && inputErrorClasses}`}
              {...register('linkedinProfileUrl', { required: 'LinkedIn profile URL is required', validate: value => value.includes('linkedin.com/') || 'Please enter a valid LinkedIn profile URL' })} 
            />
          </div>
        </div>

        {/* Sourcing Channel Field */}
        <div>
          <label htmlFor="sourcingChannel" className="block text-sm font-medium text-slate-700 mb-1.5">
            How did you hear about us?
          </label>
          <div className="relative">
            <FiUsers className={`${iconClasses} z-10`} />
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
        </div>

        {/* Additional Comments Field */}
        <div>
          <label htmlFor="additionalComments" className="block text-sm font-medium text-slate-700 mb-1.5">
            Additional Comments <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          <textarea 
            id="additionalComments" 
            rows={3} 
            placeholder="Anything else you'd like to share..." 
            className="w-full py-2.5 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            {...register('additionalComments')} 
          />
        </div>
        
        {/* --- ADDITION START: Interested Checkbox --- */}
        <div>
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="interestedInJoining"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-400 bg-slate-100 text-blue-600 focus:ring-blue-500 cursor-pointer"
                {...register('interestedInJoining')}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="interestedInJoining" className="font-medium text-slate-700 cursor-pointer">
                I am interested in joining the Interviewer.
              </label>
            </div>
          </div>
        </div>
        {/* --- ADDITION END --- */}
        
        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-blue-500/20"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <FiSend className="h-5 w-5 mr-2"/>
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default InitialApplicationForm;
