// client/src/pages/public/SkillAssessmentSuccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiHome } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const SkillAssessmentSuccess = () => {
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 py-12">
            <Card>
                <div className="text-center p-6">
                    <div className="flex justify-center mb-4">
                        <FiCheckCircle className="h-20 w-20 text-green-500" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Thank you for completing the registration form and expressing your interest in becoming an interviewer with NxtWave. Your expertise is valuable to us, and we look forward to the possibility of working together.
                    </p>
                    
                    <p className="text-gray-600 mb-8">
                        Our team will review your complete profile and get back to you with the next steps. Please keep an eye on your email.
                    </p>
                    
                    <Button
                        to="/"
                        variant="primary"
                        icon={<FiHome />}
                        iconPosition="left"
                    >
                        Back to Home
                    </Button>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default SkillAssessmentSuccess;