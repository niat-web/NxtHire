// client/src/pages/public/ResetPassword.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiLock } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { resetPassword } from '../../api/auth.api';
import { useAlert } from '../../hooks/useAlert';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useAlert();
  
  // Get token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm();
  
  const password = watch('password', '');
  
  const onSubmit = async (data) => {
    if (!token) {
      showError('Invalid or missing token. Please check your link and try again.');
      return;
    }
    
    try {
      await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      
      showSuccess('Password reset successfully! You can now log in with your new password.');
      navigate('/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      showError('Failed to reset password. The link may be invalid or expired.');
    }
  };
  
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <Card>
          <Alert
            type="error"
            title="Invalid Reset Link"
            message="The password reset link is invalid or has expired. Please request a new one."
            className="mb-6"
          />
          <div className="text-center">
            <Button
              to="/forgot-password"
              variant="primary"
            >
              Request New Link
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card title="Reset Password">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <p className="text-gray-600">
              Please enter a new password for your account.
            </p>
          </div>
          
          <Input
            label="New Password"
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long'
              }
            })}
            error={errors.password?.message}
            placeholder="Enter your new password"
            required
          />
          
          <Input
            label="Confirm Password"
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message}
            placeholder="Confirm your new password"
            required
          />
          
          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
              icon={<FiLock />}
              iconPosition="left"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;