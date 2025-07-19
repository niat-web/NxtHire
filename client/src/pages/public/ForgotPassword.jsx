// client/src/pages/public/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { forgotPassword } from '../../api/auth.api';
import { useAlert } from '../../hooks/useAlert';

const ForgotPassword = () => {
  const { showError } = useAlert();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showError('Please enter your email address.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      showError('Failed to request password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link to="/login" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
        <FiArrowLeft className="mr-2" />
        Back to Login
      </Link>
      
      <Card title="Reset Password">
        {isSubmitted ? (
          <div>
            <Alert
              type="success"
              title="Reset Link Sent"
              message="If an account exists with that email, we've sent password reset instructions to your email address."
              className="mb-6"
            />
            <div className="text-center">
              <Button
                to="/login"
                variant="primary"
              >
                Return to Login
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="text-gray-600">
                Enter your email address below and we'll send you instructions to reset your password.
              </p>
            </div>
            
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                icon={<FiSend />}
                iconPosition="left"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;