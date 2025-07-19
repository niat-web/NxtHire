// client/src/pages/public/GuidelinesResult.jsx
import React from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiHome } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const GuidelinesResult = () => {
  const { id } = useParams();
  const location = useLocation();
  
  // Get result data from location state
  const resultData = location.state;
  
  // If no result data, redirect to home
  if (!resultData) {
    return <Navigate to="/" replace />;
  }
  
  const { passed, score, correctAnswers, totalQuestions } = resultData;
  
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <FiCheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <FiXCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Assessment Not Passed'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {passed 
              ? 'You have successfully completed the interviewer guidelines assessment.' 
              : 'Unfortunately, you did not meet the minimum score requirement for the assessment.'}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Your Score:</span>
              <span className={`font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {score}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Correct Answers:</span>
              <span className="font-medium text-gray-900">
                {correctAnswers} of {totalQuestions}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">
            {passed 
              ? 'You will receive an email with instructions to set up your account and start taking interview assignments. Welcome to the NxtWave Interviewer team!' 
              : 'You need a score of at least 80% to pass the assessment. Please review the guidelines and try again later.'}
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
  );
};

export default GuidelinesResult;