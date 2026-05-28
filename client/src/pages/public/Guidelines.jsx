// client/src/pages/public/Guidelines.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GuidelinesQuestionnaireForm from '../../components/forms/GuidelinesQuestionnaireForm';
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
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-slate-900 mx-auto" />
          <h2 className="font-display mt-6 text-[26px] font-semibold text-slate-900 tracking-tight">Verifying application…</h2>
          <p className="mt-2 text-[13.5px] text-slate-500">Please wait while we validate your access.</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-red-600 p-6">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-white bg-opacity-25">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <h3 className="font-display text-[26px] font-semibold text-slate-900 text-center mb-3 tracking-tight">Invalid link.</h3>
            <p className="text-gray-600 mb-6 text-center">{error}</p>
            
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/')}
                className="flex items-center justify-center px-6 h-10 border border-transparent text-base font-medium rounded-md text-white bg-slate-900 hover:bg-[#C0392B] shadow-md transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen bg-slate-100">
      <main>
        <GuidelinesQuestionnaireForm />
      </main>
    </div>
  );
};

export default Guidelines;