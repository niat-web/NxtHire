// client/src/pages/public/SkillAssessment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Code, Check, ArrowRight, ArrowLeft, ChevronDown,
  Briefcase, Award, AlertCircle, User, Mail, MapPin, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { checkApplicationStatus, submitSkillAssessment } from '../../api/applicant.api';
import { APPLICATION_STATUS } from '../../utils/constants';
import { techStacks } from '../../components/forms/techStackData';
import { useAlert } from '../../hooks/useAlert';

// ─── Accordion Item ─────────────────────────────────────────────────────────
const AccordionItem = ({ tech, register, setValue, watch, isOpen, onToggle }) => {
  const allSubSkills = tech.subSkills.map(s => s.value);
  const watchedSubSkills = watch(`technicalSkills.${tech.id}.subSkills`) || [];
  const selectedCount = watchedSubSkills.length;
  const totalCount = allSubSkills.length;

  const handleSelectAll = (e) => {
    setValue(`technicalSkills.${tech.id}.subSkills`, e.target.checked ? allSubSkills : []);
  };

  return (
    <div className={`border rounded-xl transition-all ${isOpen ? 'border-slate-300 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
      <input type="hidden" {...register(`technicalSkills.${tech.id}.technology`, { value: tech.name })} />
      <button type="button" onClick={onToggle}
        className="flex justify-between items-center w-full px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${selectedCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
            {selectedCount > 0 ? <Check size={14} /> : tech.name.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{tech.name}</h4>
            <p className="text-xs text-gray-400">{selectedCount}/{totalCount} selected</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="pt-4">
            <label className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 cursor-pointer">
              <input type="checkbox" onChange={handleSelectAll}
                checked={watchedSubSkills.length === allSubSkills.length && allSubSkills.length > 0}
                className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-500" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Select All</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tech.subSkills.map((subSkill) => (
                <label key={subSkill.value} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input {...register(`technicalSkills.${tech.id}.subSkills`)}
                    type="checkbox" value={subSkill.value}
                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-slate-900 focus:ring-slate-500" />
                  <span className="text-sm text-gray-700 leading-tight">{subSkill.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const SkillAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [openAccordion, setOpenAccordion] = useState(0);

  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger, reset, setValue, watch } = useForm({
    defaultValues: { technicalSkills: techStacks.map(t => ({ technology: t.name, subSkills: [] })) }
  });

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard', { replace: true });
      return;
    }
    const verifyApplicantStatus = async () => {
      try {
        const response = await checkApplicationStatus(id);
        const data = response.data.data;
        reset(currentValues => ({ ...currentValues, fullName: data.fullName, email: data.email }));
        const completedStages = [APPLICATION_STATUS.SKILLS_ASSESSMENT_COMPLETED, APPLICATION_STATUS.GUIDELINES_SENT, APPLICATION_STATUS.GUIDELINES_REVIEWED, APPLICATION_STATUS.GUIDELINES_FAILED, APPLICATION_STATUS.ONBOARDED, APPLICATION_STATUS.ACTIVE_INTERVIEWER];
        if (completedStages.includes(data.status)) {
          navigate(`/skill-assessment-success/${id}`, { replace: true });
        } else if (data.status !== APPLICATION_STATUS.SKILLS_ASSESSMENT_SENT && data.status !== APPLICATION_STATUS.PROFILE_APPROVED) {
          setError('This link is not valid for your current application status.');
        }
      } catch {
        setError('Failed to verify your application. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) verifyApplicantStatus();
  }, [id, currentUser, authLoading, navigate, reset]);

  const handleNext = async () => {
    const isValid = await trigger(['currentEmployer', 'jobTitle', 'yearsOfExperience']);
    if (isValid) setStep(2);
  };

  const onSubmit = async (data) => {
    const selectedSkills = data.technicalSkills.map(s => ({ ...s, subSkills: Array.isArray(s.subSkills) ? s.subSkills : [] })).filter(s => s.subSkills.length > 0);
    if (selectedSkills.length === 0 && !data.otherSkills) {
      showError("Please select at least one skill or mention other skills.");
      return;
    }
    try {
      await submitSkillAssessment(id, {
        currentEmployer: data.currentEmployer, jobTitle: data.jobTitle,
        yearsOfExperience: Number(data.yearsOfExperience),
        technicalSkills: selectedSkills, otherSkills: data.otherSkills
      });
      showSuccess("Assessment submitted successfully!");
      navigate(`/skill-assessment-success/${id}`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit.');
    }
  };

  // Loading
  if (loading || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Verifying your status...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center p-8">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  // Count selected skills
  const watchedSkills = watch('technicalSkills') || [];
  const totalSelected = watchedSkills.reduce((sum, s) => sum + (Array.isArray(s.subSkills) ? s.subSkills.length : 0), 0);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">

      {/* ─── Left Sidebar ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-80 bg-indigo-600 text-white shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-base font-semibold">Skill Assessment</h1>
          <p className="text-xs text-slate-400 mt-1">Complete both steps to submit</p>
        </div>

        {/* Steps */}
        <div className="flex-1 p-6">
          <div className="space-y-1">
            {[
              { num: 1, label: 'Professional Details', desc: 'Your current role and experience', icon: Briefcase },
              { num: 2, label: 'Technical Skills', desc: 'Select your areas of expertise', icon: Code },
            ].map((s) => (
              <button key={s.num} onClick={() => s.num === 1 && setStep(1)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-colors ${step === s.num ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold ${
                  step > s.num ? 'bg-indigo-500 text-white' :
                  step === s.num ? 'bg-indigo-500 text-white' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>{s.label}</p>
                  <p className={`text-xs mt-0.5 ${step >= s.num ? 'text-slate-400' : 'text-slate-600'}`}>{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="p-6 border-t border-slate-800">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-300 font-semibold">{step}/2</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${step * 50}%` }} />
          </div>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <h1 className="text-sm font-semibold text-gray-900">Skill Assessment</h1>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${step === 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-100 text-indigo-700'}`}>
              Step {step}/2
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-5 py-6 lg:py-8 flex-1 flex flex-col w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">

            {/* ─── Step 1: Professional Details ──────────────────── */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900">Professional Background</h2>
                  <p className="text-sm text-gray-500 mt-1">Tell us about your current role and experience</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                  {/* Read-only fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        <User className="inline w-3 h-3 mr-1" />Full Name
                      </label>
                      <input {...register('fullName')} disabled
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        <Mail className="inline w-3 h-3 mr-1" />Email
                      </label>
                      <input {...register('email')} disabled
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                        Current Company / Employer <span className="text-red-500">*</span>
                      </label>
                      <input {...register('currentEmployer', { required: 'Required' })}
                        placeholder="e.g., Google"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.currentEmployer ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-slate-900/10 focus:border-slate-400'}`} />
                      {errors.currentEmployer && <p className="mt-1 text-xs text-red-500">{errors.currentEmployer.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      Job Title / Role <span className="text-red-500">*</span>
                    </label>
                    <input {...register('jobTitle', { required: 'Required' })}
                      placeholder="e.g., Senior Software Engineer"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.jobTitle ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-slate-900/10 focus:border-slate-400'}`} />
                    {errors.jobTitle && <p className="mt-1 text-xs text-red-500">{errors.jobTitle.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <input {...register('yearsOfExperience', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Cannot be negative' } })}
                      type="number" step="0.1" placeholder="e.g., 5.5"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.yearsOfExperience ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-slate-900/10 focus:border-slate-400'}`} />
                    {errors.yearsOfExperience && <p className="mt-1 text-xs text-red-500">{errors.yearsOfExperience.message}</p>}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button type="button" onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors">
                    Next <ArrowRight size={15} />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Step 2: Technical Skills ───────────────────────── */}
            {step === 2 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-4 flex items-start justify-between shrink-0">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Technical Expertise</h2>
                    <p className="text-sm text-gray-500 mt-1">Select the technologies you're proficient in</p>
                  </div>
                  {totalSelected > 0 && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full shrink-0">
                      {totalSelected} skills selected
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto pr-1 min-h-0">
                  {techStacks.map((tech, index) => (
                    <AccordionItem key={tech.id} tech={tech}
                      register={register} setValue={setValue} watch={watch}
                      isOpen={openAccordion === index}
                      onToggle={() => setOpenAccordion(openAccordion === index ? null : index)} />
                  ))}
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Other Skills or Technologies
                  </label>
                  <textarea {...register('otherSkills')}
                    placeholder="Docker, Kubernetes, AWS, etc..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none" />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center shrink-0">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ArrowLeft size={15} /> Previous
                  </Button>
                  <Button type="submit" disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-black disabled:opacity-50 transition-colors">
                    {isSubmitting ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><Award size={15} /> Submit Assessment</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SkillAssessment;
