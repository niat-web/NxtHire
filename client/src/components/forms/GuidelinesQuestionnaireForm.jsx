// client/src/components/forms/GuidelinesQuestionnaireForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSend, FiClock, FiCheck, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { submitGuidelines } from '../../api/applicant.api';
import { useAlert } from '../../hooks/useAlert';

const questions = [
  { id: 1, question: "Why is it important to review the candidate's resume before the interview?", options: ["To understand the candidate's personal interests", "To understand the candidate's skill set and background", "To decide if the candidate should be disqualified", "To prepare for casual conversation topics"] },
  { id: 2, question: "Why is it important to understand the objective of an interview?", options: ["To have a casual conversation with the candidate", "To focus on key aspects of the interview", "To determine the candidate's favorite hobbies", "To make the interview process longer"] },
  { id: 3, question: "Why is it important to prepare a set of questions before the interview?", options: ["To fill time during the interview", "To assess the candidate's skills and relevant experience effectively.", "To make the interview more casual and relaxed", "To avoid having to listen to the candidate's responses"] },
  { id: 4, question: "What steps should you take to test the technology before the interview?", options: ["Check your internet connection, device audio, and video capabilities", "Ignore testing as it is not important", "Ask the candidate to test their technology", "Conduct the interview without any preparation"] },
  { id: 5, question: "What are the key considerations for setting up your environment for the interview?", options: ["Conduct the interview in a noisy place", "Find a quiet, well-lit place with a professional background", "Use a background with personal items", "Conduct the interview outdoors"] },
  { id: 6, question: "How should you start the interview?", options: ["Start by asking about the candidate's salary expectations", "Start with a friendly greeting and introduce yourself, including your role and experience", "Start with difficult technical questions", "Start with a casual conversation"] },
  { id: 7, question: "Why is it important to ask the candidate for a self-introduction?", options: ["To understand the candidate's hobbies", "To know more about the candidate", "To decide if the candidate's voice is pleasant", "To pass time"] },
  { id: 8, question: "How do you assess the candidate's technical skills?", options: ["By asking questions about their personal interests", "By using a mix of theoretical questions and practical problems", "By discussing non-technical topics", "By avoiding technical questions"] },
  { id: 9, question: "What are key aspects of maintaining professionalism during the interview?", options: ["Interrupt the candidate frequently", "Be professional, attentive, and avoid interruptions", "Use slang and casual language", "Ignore the candidate's responses"] },
  { id: 10, question: "What should you do if the candidate seems confused about a question?", options: ["Ignore the candidate and move to the next question", "Offer clarifications or rephrase the question", "Laugh at the candidate's confusion", "End the interview immediately"] },
  { id: 11, question: "How do you manage time during the interview?", options: ["Let the interview run as long as it takes", "Keep track of time to ensure all key topics are covered", "Focus on one topic for the entire interview", "Ignore the time constraints"] },
  { id: 12, question: "How can you make the candidate feel comfortable during the interview?", options: ["Ignore their responses", "Engage with the candidate and acknowledge their responses", "Criticize their answers", "Maintain a stern and unapproachable demeanor"] },
  { id: 13, question: "Why are follow-up questions important?", options: ["To confuse the candidate", "To delve deeper into the candidate's expertise and thought process", "To extend the duration of the interview unnecessarily", "To avoid addressing the candidate's main points"] },
  { id: 14, question: "What should you do immediately after the interview ends?", options: ["Disconnect without saying anything", "Thank the candidate", "Ask the candidate to follow up with you", "Criticize the candidate's performance"] },
  { id: 15, question: "How do you evaluate the candidate's performance?", options: ["Based on your personal biases", "Based on predefined criteria, including technical skills, problem-solving abilities, and communication skills", "By comparing them to previous candidates", "By focusing only on their appearance"] },
  { id: 16, question: "What is the timeframe within which interviewers are required to complete their evaluation remarks after conducting an interview?", options: ["1 day", "1 hour", "1 week", "No need to update remarks"] },
  { id: 17, question: "How much advance notice must interviewers provide if they need to cancel a scheduled interview?", options: ["Before 5 minutes", "Before 2 hours", "No need to inform", "None of the above"] }
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
      if (startTime) setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleOptionSelect = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(a => !a)) { showError('Please answer all questions.'); return; }
    setIsSubmitting(true);
    try {
      await submitGuidelines(id, {
        answers: answers.map((selectedOption, i) => ({ questionNumber: questions[i].id, selectedOption })),
        completionTime: Math.floor((Date.now() - (startTime || Date.now())) / 1000)
      });
      showSuccess('Assessment submitted!');
      navigate('/guidelines-submission-success');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit.');
    } finally { setIsSubmitting(false); }
  };

  const answeredCount = answers.filter(a => a !== '').length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const q = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* ─── Top Bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shrink-0 z-10">
        <div>
          <h1 className="text-base font-bold text-gray-900">Interview Guidelines Assessment</h1>
          <p className="text-xs text-gray-400 mt-0.5">{answeredCount}/{questions.length} answered</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <FiClock className="text-gray-400" size={15} />
            <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">{formatTime(elapsedTime)}</span>
          </div>
          <div className="hidden sm:block text-xs font-medium text-gray-500">
            <span className="font-bold text-gray-800">{currentQuestion + 1}</span> / {questions.length}
          </div>
        </div>
      </div>

      {/* ─── Progress Bar ────────────────────────────────────────── */}
      <div className="h-1 bg-gray-100 shrink-0">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Question Navigator */}
        <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0">
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Questions</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => {
                const isActive = i === currentQuestion;
                const isAnswered = answers[i] !== '';
                return (
                  <button key={i} onClick={() => setCurrentQuestion(i)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all relative ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : isAnswered
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {i + 1}
                    {isAnswered && !isActive && (
                      <FiCheck className="absolute -top-1 -right-1 w-3.5 h-3.5 text-emerald-600 bg-white rounded-full p-px" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-gray-100">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">Progress</span>
              <span className="font-bold text-gray-700">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-100 rounded border border-emerald-200" /> Answered</div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gray-100 rounded border border-gray-200" /> Unanswered</div>
            </div>
          </div>
        </div>

        {/* Right: Question Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex items-start justify-center p-5 lg:p-10">
            <div className="w-full max-w-2xl">

              {/* Question Number Badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                  {currentQuestion + 1}
                </span>
                <span className="text-xs text-gray-400 font-medium">of {questions.length} questions</span>
              </div>

              {/* Question Text */}
              <h2 className="text-lg font-bold text-gray-900 leading-relaxed mb-8">
                {q.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {q.options.map((option, i) => {
                  const isSelected = answers[currentQuestion] === option;
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <button key={i} type="button" onClick={() => handleOptionSelect(option)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                        isSelected ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isSelected ? <FiCheck size={16} /> : letter}
                      </div>
                      <span className={`text-sm leading-relaxed ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="bg-white border-t border-gray-200 px-5 lg:px-10 py-4 flex items-center justify-between shrink-0">
            <button type="button" onClick={() => setCurrentQuestion(c => Math.max(0, c - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <FiArrowLeft size={15} /> Previous
            </button>

            {/* Mobile: question dots */}
            <div className="flex lg:hidden items-center gap-1">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQuestion(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentQuestion ? 'bg-slate-900 w-4' : answers[i] ? 'bg-emerald-400' : 'bg-gray-300'
                  }`} />
              ))}
            </div>

            {isLastQuestion ? (
              <button type="button" onClick={handleSubmit}
                disabled={answeredCount !== questions.length || isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><FiSend size={15} /> Submit Assessment</>
                )}
              </button>
            ) : (
              <button type="button" onClick={() => setCurrentQuestion(c => Math.min(questions.length - 1, c + 1))}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-black transition-colors">
                Next <FiArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesQuestionnaireForm;
