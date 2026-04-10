// client/src/pages/public/GuidelinesResult.jsx
import React from 'react';
import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      <Card className="rounded-xl">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Assessment Not Passed'}
          </h2>

          <p className="text-gray-600 mb-6">
            {passed
              ? 'You have successfully completed the interviewer guidelines assessment.'
              : 'Unfortunately, you did not meet the minimum score requirement for the assessment.'}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Your Score:</span>
              <span className={cn('font-medium', passed ? 'text-green-600' : 'text-red-600')}>
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

          <Button asChild variant="success" size="lg">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuidelinesResult;
