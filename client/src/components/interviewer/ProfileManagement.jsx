// client/src/components/interviewer/ProfileManagement.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave, FiUser, FiDollarSign } from 'react-icons/fi';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { updateProfile, updateBankDetails } from '../../api/interviewer.api';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';

const ProfileManagement = ({ initialData = {} }) => {
  const { currentUser, updateProfile: updateAuthProfile } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form for basic info
  const { 
    register: registerBasic, 
    handleSubmit: handleSubmitBasic, 
    formState: { errors: errorsBasic }
  } = useForm({
    defaultValues: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      phoneNumber: currentUser?.phoneNumber || '',
      whatsappNumber: currentUser?.whatsappNumber || '',
      currentEmployer: initialData.currentEmployer || '',
      jobTitle: initialData.jobTitle || ''
    }
  });
  
  // Form for bank details
  const { 
    register: registerBank, 
    handleSubmit: handleSubmitBank, 
    formState: { errors: errorsBank }
  } = useForm({
    defaultValues: {
      accountName: initialData.bankDetails?.accountName || '',
      accountNumber: initialData.bankDetails?.accountNumber || '',
      bankName: initialData.bankDetails?.bankName || '',
      ifscCode: initialData.bankDetails?.ifscCode || ''
    }
  });
  
  const onSubmitBasicInfo = async (data) => {
    setIsSubmitting(true);
    try {
      // Update user profile in auth context
      await updateAuthProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        whatsappNumber: data.whatsappNumber
      });
      
      // Update interviewer profile
      await updateProfile({
        currentEmployer: data.currentEmployer,
        jobTitle: data.jobTitle
      });
      
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onSubmitBankDetails = async (data) => {
    setIsSubmitting(true);
    try {
      await updateBankDetails(data);
      showSuccess('Bank details updated successfully!');
    } catch (error) {
      console.error('Error updating bank details:', error);
      showError('Failed to update bank details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <form onSubmit={handleSubmitBasic(onSubmitBasicInfo)}>
        <Card 
          title={
            <div className="flex items-center">
              <FiUser className="mr-2 text-primary-600" />
              <span>Basic Information</span>
            </div>
          }
          footer={
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                icon={<FiSave />}
                iconPosition="left"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              {...registerBasic('firstName', { required: 'First name is required' })}
              error={errorsBasic.firstName?.message}
              required
            />
            
            <Input
              label="Last Name"
              {...registerBasic('lastName', { required: 'Last name is required' })}
              error={errorsBasic.lastName?.message}
              required
            />
            
            <Input
              label="Email Address"
              value={currentUser?.email || ''}
              disabled
              helpText="Email address cannot be changed"
            />
            
            <Input
              label="Phone Number"
              {...registerBasic('phoneNumber', { required: 'Phone number is required' })}
              error={errorsBasic.phoneNumber?.message}
              required
            />
            
            <Input
              label="WhatsApp Number"
              {...registerBasic('whatsappNumber')}
              error={errorsBasic.whatsappNumber?.message}
              helpText="Leave blank if same as phone number"
            />
            
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Domain(s):</span>
                {initialData.domains?.map((domain) => (
                  <Badge key={domain} variant="primary" size="sm">{domain}</Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Your domains are assigned based on your skill assessment.
              </p>
            </div>
            
            <Input
              label="Current Employer"
              {...registerBasic('currentEmployer', { required: 'Current employer is required' })}
              error={errorsBasic.currentEmployer?.message}
              required
            />
            
            <Input
              label="Job Title"
              {...registerBasic('jobTitle', { required: 'Job title is required' })}
              error={errorsBasic.jobTitle?.message}
              required
            />
          </div>
        </Card>
      </form>
      
      {/* Bank Details */}
      <form onSubmit={handleSubmitBank(onSubmitBankDetails)}>
        <Card 
          title={
            <div className="flex items-center">
              <FiDollarSign className="mr-2 text-primary-600" />
              <span>Payment Information</span>
            </div>
          }
          footer={
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                icon={<FiSave />}
                iconPosition="left"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          }
        >
          <div className="mb-6">
            <p className="text-gray-600">
              Your payment will be processed weekly based on the number of interviews conducted. Please ensure your bank details are accurate.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Account Holder Name"
              {...registerBank('accountName', { required: 'Account name is required' })}
              error={errorsBank.accountName?.message}
              placeholder="Enter the name on your bank account"
              required
            />
            
            <Input
              label="Account Number"
              {...registerBank('accountNumber', { required: 'Account number is required' })}
              error={errorsBank.accountNumber?.message}
              placeholder="Enter your bank account number"
              required
            />
            
            <Input
              label="Bank Name"
              {...registerBank('bankName', { required: 'Bank name is required' })}
              error={errorsBank.bankName?.message}
              placeholder="Enter your bank name"
              required
            />
            
            <Input
              label="IFSC Code"
              {...registerBank('ifscCode', { required: 'IFSC code is required' })}
              error={errorsBank.ifscCode?.message}
              placeholder="Enter the IFSC code of your bank branch"
              required
            />
          </div>
        </Card>
      </form>
    </div>
  );
};

export default ProfileManagement;