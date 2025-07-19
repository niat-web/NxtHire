// client/src/pages/interviewer/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave, FiUser, FiDollarSign, FiKey, FiX, FiLoader as SpinnerIcon, FiCheckCircle, FiStar } from 'react-icons/fi';
import { getProfile, updateProfile, updateBankDetails } from '../../api/interviewer.api';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { formatDate } from '../../utils/formatters';

// Replicating Loader component locally to remove dependency
const LocalLoader = ({ size = 'lg', text = 'Loading...' }) => {
    const sizeClasses = { lg: 'h-12 w-12', md: 'h-8 w-8' };
    return (
      <div className="flex flex-col items-center justify-center">
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
        {text && <p className="mt-2 text-gray-500 text-base">{text}</p>}
      </div>
    );
};

const Profile = () => {
  const { currentUser, updateProfile: updateAuthProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register: registerBasic, handleSubmit: handleSubmitBasic, formState: { errors: errorsBasic }, reset: resetBasic } = useForm();
  const { register: registerBank, handleSubmit: handleSubmitBank, formState: { errors: errorsBank }, reset: resetBank } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, reset: resetPasswordHook, watch } = useForm();
  
  const newPassword = watch('newPassword', '');
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getProfile();
        setProfile(response.data.data); // data is nested under a data key now
        resetBasic({
          firstName: currentUser?.firstName || '', lastName: currentUser?.lastName || '',
          phoneNumber: currentUser?.phoneNumber || '', whatsappNumber: currentUser?.whatsappNumber || '',
          currentEmployer: response.data.data.currentEmployer || '', jobTitle: response.data.data.jobTitle || ''
        });
        resetBank({
          accountName: response.data.data.bankDetails?.accountName || '', accountNumber: response.data.data.bankDetails?.accountNumber || '',
          bankName: response.data.data.bankDetails?.bankName || '', ifscCode: response.data.data.bankDetails?.ifscCode || ''
        });
      } catch (error) {
        showError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser, resetBasic, resetBank, showError]);
  
  const onSubmitBasicInfo = async (data) => {
    setIsSubmitting(true);
    try {
      await updateAuthProfile({ firstName: data.firstName, lastName: data.lastName, phoneNumber: data.phoneNumber, whatsappNumber: data.whatsappNumber });
      await updateProfile({ currentEmployer: data.currentEmployer, jobTitle: data.jobTitle });
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onSubmitBankDetails = async (data) => {
    setIsSubmitting(true);
    try {
      await updateBankDetails(data);
      showSuccess('Bank details updated successfully!');
      const response = await getProfile();
      setProfile(response.data.data);
    } catch (error) {
      showError('Failed to update bank details.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onSubmitPasswordChange = async (data) => {
    setIsSubmitting(true);
    try {
      await changePassword(data.currentPassword, data.newPassword, data.confirmPassword);
      showSuccess('Password changed successfully!');
      resetPasswordHook();
      setIsChangingPassword(false);
    } catch (error) {
      showError('Failed to change password. Please check your current password and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LocalLoader text="Loading profile..." />
      </div>
    );
  }
  
  const formSectionClasses = "bg-white rounded-lg shadow-sm border border-gray-200";
  const formHeaderClasses = "px-6 py-4 border-b border-gray-200 flex items-center";
  const formBodyClasses = "p-6";
  const formFooterClasses = "px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end";
  const formInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100";
  const formLabelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const formErrorClasses = "mt-1 text-sm text-red-600";
  const buttonBaseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const statusColors = {
    'Active': 'text-green-600', 'On Probation': 'text-yellow-600',
    'Inactive': 'text-gray-500', 'Suspended': 'text-red-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => setIsChangingPassword(true)}
          className={`${buttonBaseClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500`}
        >
          <FiKey className="mr-2 -ml-1 h-5 w-5" />
          <span>Change Password</span>
        </button>
      </div>

      {/* --- NEW PROFILE OVERVIEW SECTION --- */}
      <div className={formSectionClasses}>
        <div className={formHeaderClasses}>
            <h3 className="text-lg font-medium text-gray-900">Profile Overview</h3>
        </div>
        <div className={formBodyClasses}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                  <label className={formLabelClasses}>Status</label>
                  <p className={`text-lg font-bold ${statusColors[profile?.status] || 'text-gray-800'}`}>{profile?.status || 'N/A'}</p>
              </div>
              <div>
                  <label className={formLabelClasses}>Onboarding Date</label>
                  <p className="text-lg font-bold text-gray-800">{formatDate(profile?.onboardingDate) || 'N/A'}</p>
              </div>
              <div>
                  <label className={formLabelClasses}>Interviews Completed</label>
                  <p className="text-lg font-bold text-gray-800 flex items-center"><FiCheckCircle className="mr-2 text-green-500" />{profile?.metrics?.interviewsCompleted || 0}</p>
              </div>
          </div>
          <div className="mt-6">
            <label className={`${formLabelClasses} mb-2`}>Profile Completeness</label>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${profile?.profileCompleteness || 0}%` }}></div>
              </div>
              <span className="text-sm font-semibold text-gray-600 ml-4">{profile?.profileCompleteness || 0}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Basic Information */}
      <form onSubmit={handleSubmitBasic(onSubmitBasicInfo)}>
        <div className={formSectionClasses}>
          <div className={formHeaderClasses}>
              <FiUser className="mr-2 text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div className={formBodyClasses}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={formLabelClasses}>First Name <span className="text-red-600">*</span></label>
                <input type="text" {...registerBasic('firstName', { required: 'First name is required' })} className={`${formInputClasses} ${errorsBasic.firstName ? 'border-red-300' : 'border-gray-300'}`}/>
                {errorsBasic.firstName && <p className={formErrorClasses}>{errorsBasic.firstName.message}</p>}
              </div>
              <div>
                <label className={formLabelClasses}>Last Name <span className="text-red-600">*</span></label>
                <input type="text" {...registerBasic('lastName', { required: 'Last name is required' })} className={`${formInputClasses} ${errorsBasic.lastName ? 'border-red-300' : 'border-gray-300'}`} />
                {errorsBasic.lastName && <p className={formErrorClasses}>{errorsBasic.lastName.message}</p>}
              </div>
              <div>
                <label className={formLabelClasses}>Email Address</label>
                <input type="text" value={currentUser?.email || ''} disabled className={formInputClasses}/>
                <p className="mt-1 text-sm text-gray-500">Email address cannot be changed</p>
              </div>
              <div>
                <label className={formLabelClasses}>Phone Number <span className="text-red-600">*</span></label>
                <input type="text" {...registerBasic('phoneNumber', { required: 'Phone number is required' })} className={`${formInputClasses} ${errorsBasic.phoneNumber ? 'border-red-300' : 'border-gray-300'}`} />
                {errorsBasic.phoneNumber && <p className={formErrorClasses}>{errorsBasic.phoneNumber.message}</p>}
              </div>
              <div>
                <label className={formLabelClasses}>WhatsApp Number</label>
                <input type="text" {...registerBasic('whatsappNumber')} className={formInputClasses}/>
                <p className="mt-1 text-sm text-gray-500">Leave blank if same as phone number</p>
                {errorsBasic.whatsappNumber && <p className={formErrorClasses}>{errorsBasic.whatsappNumber.message}</p>}
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Domain(s):</span>
                    {profile?.domains?.map((domain) => (
                      <span key={domain} className="inline-flex items-center font-medium px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded">{domain}</span>
                    ))}
                </div>
                <p className="text-xs text-gray-500">Your domains are assigned based on your skill assessment.</p>
              </div>
              <div>
                <label className={formLabelClasses}>Current Employer <span className="text-red-600">*</span></label>
                <input type="text" {...registerBasic('currentEmployer', { required: 'Current employer is required' })} className={`${formInputClasses} ${errorsBasic.currentEmployer ? 'border-red-300' : 'border-gray-300'}`} />
                {errorsBasic.currentEmployer && <p className={formErrorClasses}>{errorsBasic.currentEmployer.message}</p>}
              </div>
              <div>
                <label className={formLabelClasses}>Job Title <span className="text-red-600">*</span></label>
                <input type="text" {...registerBasic('jobTitle', { required: 'Job title is required' })} className={`${formInputClasses} ${errorsBasic.jobTitle ? 'border-red-300' : 'border-gray-300'}`}/>
                {errorsBasic.jobTitle && <p className={formErrorClasses}>{errorsBasic.jobTitle.message}</p>}
              </div>
            </div>
          </div>
          <div className={formFooterClasses}>
            <button type="submit" disabled={isSubmitting} className={`${buttonBaseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500`}>
              {isSubmitting ? <SpinnerIcon className="animate-spin mr-2"/> : <FiSave className="mr-2" />} {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Bank Details */}
      <form onSubmit={handleSubmitBank(onSubmitBankDetails)}>
        <div className={formSectionClasses}>
          <div className={formHeaderClasses}>
            <FiDollarSign className="mr-2 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
          </div>
          <div className={formBodyClasses}>
              <p className="text-gray-600 mb-6">Your payment will be processed weekly based on the number of interviews conducted. Please ensure your bank details are accurate.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={formLabelClasses}>Account Holder Name <span className="text-red-600">*</span></label>
                  <input {...registerBank('accountName', { required: 'Account name is required' })} placeholder="Enter the name on your bank account" className={`${formInputClasses} ${errorsBank.accountName ? 'border-red-300' : 'border-gray-300'}`}/>
                  {errorsBank.accountName && <p className={formErrorClasses}>{errorsBank.accountName.message}</p>}
                </div>
                <div>
                  <label className={formLabelClasses}>Account Number <span className="text-red-600">*</span></label>
                  <input {...registerBank('accountNumber', { required: 'Account number is required' })} placeholder="Enter your bank account number" className={`${formInputClasses} ${errorsBank.accountNumber ? 'border-red-300' : 'border-gray-300'}`}/>
                  {errorsBank.accountNumber && <p className={formErrorClasses}>{errorsBank.accountNumber.message}</p>}
                </div>
                <div>
                  <label className={formLabelClasses}>Bank Name <span className="text-red-600">*</span></label>
                  <input {...registerBank('bankName', { required: 'Bank name is required' })} placeholder="Enter your bank name" className={`${formInputClasses} ${errorsBank.bankName ? 'border-red-300' : 'border-gray-300'}`} />
                  {errorsBank.bankName && <p className={formErrorClasses}>{errorsBank.bankName.message}</p>}
                </div>
                <div>
                  <label className={formLabelClasses}>IFSC Code <span className="text-red-600">*</span></label>
                  <input {...registerBank('ifscCode', { required: 'IFSC code is required' })} placeholder="Enter the IFSC code of your bank branch" className={`${formInputClasses} ${errorsBank.ifscCode ? 'border-red-300' : 'border-gray-300'}`} />
                  {errorsBank.ifscCode && <p className={formErrorClasses}>{errorsBank.ifscCode.message}</p>}
                </div>
              </div>
          </div>
          <div className={formFooterClasses}>
            <button type="submit" disabled={isSubmitting} className={`${buttonBaseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500`}>
              {isSubmitting ? <SpinnerIcon className="animate-spin mr-2"/> : <FiSave className="mr-2"/>} {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="relative w-full max-w-md my-8 bg-white shadow-xl rounded-lg">
            <div className="flex items-center justify-between p-5 border-b rounded-t">
              <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
              <button onClick={() => setIsChangingPassword(false)} className="p-1 ml-auto bg-transparent border-0 text-gray-500 hover:text-gray-800 text-2xl">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmitPassword(onSubmitPasswordChange)}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={formLabelClasses}>Current Password <span className="text-red-600">*</span></label>
                  <input type="password" {...registerPassword('currentPassword', { required: 'Current password is required' })} placeholder="Enter your current password" className={`${formInputClasses} ${errorsPassword.currentPassword ? 'border-red-300' : 'border-gray-300'}`} />
                  {errorsPassword.currentPassword && <p className={formErrorClasses}>{errorsPassword.currentPassword.message}</p>}
                </div>
                <div>
                  <label className={formLabelClasses}>New Password <span className="text-red-600">*</span></label>
                  <input type="password" {...registerPassword('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Password must be at least 8 characters long' }})} placeholder="Enter your new password" className={`${formInputClasses} ${errorsPassword.newPassword ? 'border-red-300' : 'border-gray-300'}`}/>
                  {errorsPassword.newPassword && <p className={formErrorClasses}>{errorsPassword.newPassword.message}</p>}
                </div>
                <div>
                  <label className={formLabelClasses}>Confirm New Password <span className="text-red-600">*</span></label>
                  <input type="password" {...registerPassword('confirmPassword', { required: 'Please confirm your new password', validate: value => value === newPassword || 'Passwords do not match' })} placeholder="Confirm your new password" className={`${formInputClasses} ${errorsPassword.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}/>
                  {errorsPassword.confirmPassword && <p className={formErrorClasses}>{errorsPassword.confirmPassword.message}</p>}
                </div>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
                <button type="button" onClick={() => setIsChangingPassword(false)} disabled={isSubmitting} className={`${buttonBaseClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 mr-3`}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className={`${buttonBaseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500`}>{isSubmitting ? 'Changing...' : 'Change Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;