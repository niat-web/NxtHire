// client/src/pages/public/SkillAssessment.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillAssessmentForm from '../../components/forms/SkillAssessmentForm';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const SkillAssessment = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  
  useEffect(() => {
    // If a user is already logged in, they should not be on this page.
    if (currentUser) {
      const destination = currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
      navigate(destination, { replace: true });
    }
  }, [currentUser, navigate]);
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Loading..." />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <SkillAssessmentForm />
      </div>
    </div>
  );
};

export default SkillAssessment;