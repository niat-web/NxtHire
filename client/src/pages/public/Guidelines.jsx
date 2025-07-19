// client/src/pages/public/Guidelines.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';
import Card from '../../components/common/Card';
import GuidelinesQuestionnaireForm from '../../components/forms/GuidelinesQuestionnaireForm';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { checkApplicationStatus } from '../../api/applicant.api';
import { APPLICATION_STATUS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const Guidelines = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicant, setApplicant] = useState(null);
  
  useEffect(() => {
    // If auth state is still loading, do nothing yet.
    if (authLoading) return;
    
    // If a user is already logged in, redirect them.
    if (currentUser) {
      const destination = currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
      navigate(destination, { replace: true });
      return;
    }
    
    const verifyApplicant = async () => {
      setLoading(true);
      try {
        const response = await checkApplicationStatus(id);
        const applicantData = response.data.data;
        const status = applicantData.status;
        
        // Check if applicant is at the correct stage
        if (status !== APPLICATION_STATUS.GUIDELINES_SENT) {
          setError('This guidelines questionnaire link is no longer valid or has already been completed.');
        } else {
          setApplicant(applicantData);
        }
      } catch (err) {
        setError('Failed to verify application. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyApplicant();
  }, [id, currentUser, authLoading, navigate]);
  
  if (loading || authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
        <Loader size="lg" text="Verifying application..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card>
          <Alert
            type="error"
            title="Invalid Link"
            message={error}
            className="mb-6"
          />
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Back to Home
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <GuidelinesQuestionnaireForm />
      </div>
    </div>
  );
};

export default Guidelines;