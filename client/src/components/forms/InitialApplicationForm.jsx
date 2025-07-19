// client/src/components/forms/InitialApplicationForm.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiSend } from 'react-icons/fi';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { submitApplication } from '../../api/applicant.api';
import { useAlert } from '../../hooks/useAlert';
import { SOURCING_CHANNELS } from '../../utils/constants';

const InitialApplicationForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await submitApplication(data);
      showSuccess('Application submitted successfully!');
      
      // Close the modal before navigating
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to success page with application ID
      navigate(`/application-success/${response.data.data.id}`);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit application. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Full Name"
        {...register('fullName', { required: 'Full name is required' })}
        error={errors.fullName?.message}
        placeholder="Enter your full name"
        required
      />
      
      <Input
        label="Email Address"
        type="email"
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
          }
        })}
        error={errors.email?.message}
        placeholder="Enter your email address"
        required
      />
      
      <Input
        label="Phone Number"
        {...register('phoneNumber', { 
          required: 'Phone number is required',
          pattern: {
            value: /^\d{10,15}$/,
            message: 'Please enter a valid phone number'
          }
        })}
        error={errors.phoneNumber?.message}
        placeholder="Enter your phone number"
        required
      />
      
      <Input
        label="WhatsApp Number"
        {...register('whatsappNumber')}
        error={errors.whatsappNumber?.message}
        placeholder="Enter your WhatsApp number (if different from phone number)"
        helpText="Leave blank if same as phone number"
      />
      
      <Input
        label="LinkedIn Profile URL"
        {...register('linkedinProfileUrl', { 
          required: 'LinkedIn profile URL is required',
          validate: value => 
            value.includes('linkedin.com/') || 'Please enter a valid LinkedIn profile URL'
        })}
        error={errors.linkedinProfileUrl?.message}
        placeholder="Enter your LinkedIn profile URL"
        required
      />
      
      <div className="flex items-center mb-4">
        <input
          id="interestedInJoining"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          {...register('interestedInJoining')}
          defaultChecked={true}
        />
        <label htmlFor="interestedInJoining" className="ml-2 block text-sm text-gray-700">
          I am interested in joining NxtWave as a freelance technical interviewer
        </label>
      </div>
      
      <Select
        label="How did you hear about this opportunity?"
        {...register('sourcingChannel', { required: 'Please select an option' })}
        options={SOURCING_CHANNELS}
        placeholder="Select an option"
        error={errors.sourcingChannel?.message}
        required
      />
      
      <Textarea
        label="Additional Comments"
        {...register('additionalComments')}
        placeholder="Any additional information you'd like to share"
        rows={4}
      />
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          icon={<FiSend />}
          iconPosition="right"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
};

export default InitialApplicationForm;