// client/src/components/forms/GuidelinesQuestionnaireForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSend, FiClock, FiCheck, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { submitGuidelines } from '../../api/applicant.api';
import { useAlert } from '../../hooks/useAlert';

const questions = [
  {
    id: 1,
    question: "Why is it important to review the candidate's resume before the interview?",
    options: ["To understand the candidate's personal interests", "To understand the candidate's skill set and background", "To decide if the candidate should be disqualified", "To prepare for casual conversation topics"]
  },
  {
    id: 2,
    question: "Why is it important to understand the objective of an interview?",
    options: ["To have a casual conversation with the candidate", "To focus on key aspects of the interview", "To determine the candidate's favorite hobbies", "To make the interview process longer"]
  },
  {
    id: 3,
    question: "Why is it important to prepare a set of questions before the interview?",
    options: ["To fill time during the interview", "To assess the candidate's skills and relevant experience effectively.", "To make the interview more casual and relaxed", "To avoid having to listen to the candidate's responses"]
  },
  {
    id: 4,
    question: "What steps should you take to test the technology before the interview?",
    options: ["Check your internet connection, device audio, and video capabilities", "Ignore testing as it is not important", "Ask the candidate to test their technology", "Conduct the interview without any preparation"]
  },
  {
    id: 5,
    question: "What are the key considerations for setting up your environment for the interview?",
    options: ["Conduct the interview in a noisy place", "Find a quiet, well-lit place with a professional background", "Use a background with personal items", "Conduct the interview outdoors"]
  },
  {
    id: 6,
    question: "How should you start the interview?",
    options: ["Start by asking about the candidate's salary expectations", "Start with a friendly greeting and introduce yourself, including your role and experience", "Start with difficult technical questions", "Start with a casual conversation"]
  },
  {
    id: 7,
    question: "Why is it important to ask the candidate for a self-introduction?",
    options: ["To understand the candidate's hobbies", "To know more about the candidate", "To decide if the candidate's voice is pleasant", "To pass time"]
  },
  {
    id: 8,
    question: "How do you assess the candidate's technical skills?",
    options: ["By asking questions about their personal interests", "By using a mix of theoretical questions and practical problems", "By discussing non-technical topics", "By avoiding technical questions"]
  },
  {
    id: 9,
    question: "What are key aspects of maintaining professionalism during the interview?",
    options: ["Interrupt the candidate frequently", "Be professional, attentive, and avoid interruptions", "Use slang and casual language", "Ignore the candidate's responses"]
  },
  {
    id: 10,
    question: "What should you do if the candidate seems confused about a question?",
    options: ["Ignore the candidate and move to the next question", "Offer clarifications or rephrase the question", "Laugh at the candidate's confusion", "End the interview immediately"]
  },
  {
    id: 11,
    question: "How do you manage time during the interview?",
    options: ["Let the interview run as long as it takes", "Keep track of time to ensure all key topics are covered", "Focus on one topic for the entire interview", "Ignore the time constraints"]
  },
  {
    id: 12,
    question: "How can you make the candidate feel comfortable during the interview?",
    options: ["Ignore their responses", "Engage with the candidate and acknowledge their responses", "Criticize their answers", "Maintain a stern and unapproachable demeanor"]
  },
  {
    id: 13,
    question: "Why are follow-up questions important?",
    options: ["To confuse the candidate", "To delve deeper into the candidate's expertise and thought process", "To extend the duration of the interview unnecessarily", "To avoid addressing the candidate's main points"]
  },
  {
    id: 14,
    question: "What should you do immediately after the interview ends?",
    options: ["Disconnect without saying anything", "Thank the candidate", "Ask the candidate to follow up with you", "Criticize the candidate's performance"]
  },
  {
    id: 15,
    question: "How do you evaluate the candidate's performance?",
    options: ["Based on your personal biases", "Based on predefined criteria, including technical skills, problem-solving abilities, and communication skills", "By comparing them to previous candidates", "By focusing only on their appearance"]
  },
  {
    id: 16,
    question: "What is the timeframe within which interviewers are required to complete their evaluation remarks after conducting an interview?",
    options: ["1 day", "1 hour", "1 week", "No need to update remarks"]
  },
  {
    id: 17,
    question: "How much advance notice must interviewers provide if they need to cancel a scheduled interview?",
    options: ["Before 5 minutes", "Before 2 hours", "No need to inform", "None of the above"]
  }
];

const GuidelinesQuestionnaireForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useAlert();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
    
    const timer = setInterval(() => {
      if(startTime) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.some(answer => !answer)) {
      showError('Please answer all questions before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const completionTime = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
      const submissionData = {
        answers: answers.map((selectedOption, index) => ({
          questionNumber: questions[index].id,
          selectedOption
        })),
        completionTime
      };
      
      await submitGuidelines(id, submissionData);
      showSuccess('Guidelines questionnaire submitted successfully!');
      navigate(`/guidelines-submission-success`);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit guidelines questionnaire. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const answeredCount = answers.filter(answer => answer !== '').length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Progress</h3>
                <p className="text-sm text-gray-500 mb-4">Completed {answeredCount} of {questions.length} questions.</p>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-6">
                    <span>Progress</span>
                    <span className="font-semibold text-primary-600">{Math.round(progress)}%</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200/80">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <FiClock/>
                        <span className="text-sm font-medium">Time Elapsed</span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-gray-800">
                        {formatTime(elapsedTime)}
                    </span>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-3">
                    {questions.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`relative h-10 w-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
                            index === currentQuestion
                            ? 'bg-primary-600 text-white shadow-lg ring-2 ring-white ring-offset-2 ring-offset-primary-600'
                            : answers[index]
                            ? 'bg-green-100 text-green-800 border border-green-200/50'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        aria-label={`Go to question ${index + 1}`}
                    >
                        {index + 1}
                        {answers[index] && (
                            <FiCheckCircle className="absolute -top-1.5 -right-1.5 text-green-500 bg-white rounded-full p-px" size={16} />
                        )}
                    </button>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={answeredCount !== questions.length || isSubmitting}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-500"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Final Assessment'}
                <FiSend className="ml-2 h-5 w-5"/>
            </button>
          </div>
        </div>

        {/* Right Column: Question Display */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-6 sm:p-8 lg:p-10 min-h-[500px] flex flex-col justify-between">
            <div>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 mb-6">
                  Question {currentQuestion + 1} of {questions.length}
                </span>

                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {currentQuestionData.question}
                </h3>
            </div>
            
            <div className="space-y-4 my-8">
              {currentQuestionData.options.map((option, index) => (
                 <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full text-left p-4 pr-10 border rounded-xl cursor-pointer transition-all duration-200 flex items-center group relative
                      ${ answers[currentQuestion] === option
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
                        : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center font-bold text-lg transition-all duration-200
                        ${ answers[currentQuestion] === option 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                        }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-800 text-base">{option}</span>
                    {answers[currentQuestion] === option && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-white rounded-full">
                            <FiCheck className="w-5 h-5 text-blue-600" />
                        </div>
                    )}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiArrowLeft className="mr-2 h-5 w-5" />
                    Previous
                </button>
              
                {currentQuestion < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!answers[currentQuestion]}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                      <FiArrowRight className="ml-2 h-5 w-5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!answers.every(a => a !== '') || isSubmitting}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
                      <FiCheckCircle className="ml-2 h-5 w-5"/>
                    </button>
                )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuidelinesQuestionnaireForm;