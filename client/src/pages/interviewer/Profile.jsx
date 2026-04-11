// client/src/pages/interviewer/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    Save, User, DollarSign, KeyRound, Eye, EyeOff, Briefcase,
    Lock, Edit, Trash2, Plus, Phone, Mail, CheckCircle,
    AlertTriangle, X, Layers, Shield, Calendar, MapPin
} from 'lucide-react';
import { updateProfile, updateBankDetails, addExperience, updateExperience, deleteExperience, addSkill, updateSkill, deleteSkill } from '../../api/interviewer.api';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { formatDate } from '../../utils/formatters';
import { useInterviewerProfile, useInvalidateInterviewer } from '../../hooks/useInterviewerQueries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';

// --- STYLED UI COMPONENTS ---

const SectionCard = ({ title, icon: Icon, children, footer, className = '' }) => (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden", className)}>
        {title && (
            <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50/50">
                {Icon && <Icon className="h-5 w-5 mr-3 text-gray-500" />}
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
            </div>
        )}
        <div className="p-6 flex-grow">{children}</div>
        {footer && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                {footer}
            </div>
        )}
    </div>
);

const InputField = React.forwardRef(({ label, name, error, register, ...props }, ref) => (
    <div className="w-full">
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
        <input
            id={name}
            {...register}
            {...props}
            className={cn(
                "w-full px-3 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors",
                error
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            )}
        />
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error.message}</p>}
    </div>
));
InputField.displayName = 'InputField';

const SelectField = React.forwardRef(({ label, name, error, register, options, ...props }, ref) => (
    <div className="w-full">
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
        <select
            id={name}
            {...register}
            {...props}
            className={cn(
                "w-full px-3 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors appearance-none",
                error
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            )}
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error.message}</p>}
    </div>
));
SelectField.displayName = 'SelectField';

const PasswordInputField = ({ label, name, error, register }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="w-full">
            <label htmlFor={name} className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id={name}
                    type={show ? 'text' : 'password'}
                    {...register}
                    className={cn(
                        "w-full pl-10 pr-10 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors",
                        error
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                    )}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    {show ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error.message}</p>}
        </div>
    );
};


const LocalLoader = () => (
    <div className="flex flex-col justify-center items-center py-20 h-full">
        <Loader size="lg" />
        <span className="text-sm font-medium text-gray-500">Loading Profile...</span>
    </div>
);

// --- MODALS ---

const ExperienceModal = ({ isOpen, onClose, onSave, experience, isLoading }) => {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm();
    const [isPresent, setIsPresent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (experience) {
                reset({ ...experience, skills: (experience.skills || []).join(', '), startDate: experience.startDate ? new Date(experience.startDate) : null, endDate: experience.endDate ? new Date(experience.endDate) : null });
                setIsPresent(experience.isPresent || false);
            } else {
                reset({ title: '', company: '', startDate: null, endDate: null, skills: '' });
                setIsPresent(false);
            }
        }
    }, [experience, isOpen, reset]);

    const handleFormSubmit = (data) => {
        onSave({ ...data, isPresent, skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [] });
    };

    const datePickerClass = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors";

    return isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h3 className="text-lg font-semibold text-gray-900">{experience ? 'Edit Experience' : 'Add Experience'}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"><X className="h-5 w-5"/></Button>
                </div>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-grow overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Job Title" name="title" register={{...register('title', { required: 'Title is required' })}} error={errors.title} placeholder="e.g. Senior Developer" />
                            <InputField label="Company" name="company" register={{...register('company', { required: 'Company is required' })}} error={errors.company} placeholder="e.g. Acme Corp" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">Start Date</label>
                                <Controller name="startDate" control={control} rules={{ required: "Required" }} render={({ field }) => <DatePicker {...field} selected={field.value} onChange={date => field.onChange(date)} className={datePickerClass} dateFormat="MM/yyyy" showMonthYearPicker placeholderText="Select Date" />} />
                                {errors.startDate && <p className="mt-1.5 text-xs text-red-600">{errors.startDate.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">End Date</label>
                                <Controller name="endDate" control={control} render={({ field }) => <DatePicker {...field} selected={field.value} onChange={date => field.onChange(date)} className={datePickerClass} dateFormat="MM/yyyy" showMonthYearPicker disabled={isPresent} placeholderText={isPresent ? "Present" : "Select Date"} />} />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input id="isPresent" type="checkbox" checked={isPresent} onChange={(e) => setIsPresent(e.target.checked)} className="h-4 w-4 text-gray-900 rounded border-gray-300 focus:ring-gray-900" />
                            <label htmlFor="isPresent" className="ml-2 text-sm font-medium text-gray-700">I currently work here</label>
                        </div>
                        <InputField label="Skills (comma-separated)" name="skills" register={{...register('skills')}} placeholder="React, Node.js, Python..." />
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading} variant="default"><Save className="mr-2 h-4 w-4" />Save Experience</Button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;
};

const SkillModal = ({ isOpen, onClose, onSave, skill, isLoading }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const levels = [{value: 'Beginner', label: 'Beginner'}, {value: 'Intermediate', label: 'Intermediate'}, {value: 'Advanced', label: 'Advanced'}, {value: 'Expert', label: 'Expert'}];
    
    useEffect(() => {
        if (isOpen) { reset(skill || { skill: '', proficiencyLevel: 'Intermediate' }); }
    }, [skill, isOpen, reset]);

    return isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h3 className="text-lg font-semibold text-gray-900">{skill ? 'Edit Skill' : 'Add Skill'}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"><X className="h-5 w-5"/></Button>
                </div>
                <form onSubmit={handleSubmit(onSave)} className="flex flex-col">
                    <div className="p-6 space-y-5">
                        <InputField label="Skill Name" name="skill" register={{...register('skill', { required: 'Required' })}} error={errors.skill} placeholder="e.g. React Native" />
                        <SelectField label="Proficiency Level" name="proficiencyLevel" register={{...register('proficiencyLevel', { required: 'Required' })}} options={levels} error={errors.proficiencyLevel} />
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading} variant="default"><Save className="mr-2 h-4 w-4" />Save Skill</Button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemType, isLoading }) => isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600"/>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete {itemType}</h3>
                <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-center gap-3 border-t border-gray-100">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="destructive" onClick={onConfirm} isLoading={isLoading} className="bg-white text-red-600 border border-red-200 hover:bg-red-50">Delete</Button>
            </div>
        </div>
    </div>
) : null;

// --- MAIN PROFILE PAGE COMPONENT ---

const Profile = () => {
  const { currentUser, updateProfile: updateAuthProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [activeTab, setActiveTab] = useState('Experience');
  const [submittingSection, setSubmittingSection] = useState(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, item: null, type: '' });

  const { data: profile, isLoading: loading } = useInterviewerProfile();
  const { invalidateProfile } = useInvalidateInterviewer();

  const { register: registerBasic, handleSubmit: handleSubmitBasic, formState: { errors: errorsBasic }, reset: resetBasic } = useForm();
  const { register: registerBank, handleSubmit: handleSubmitBank, formState: { errors: errorsBank }, reset: resetBank } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, reset: resetPasswordHook, watch } = useForm();

  const newPassword = watch('newPassword', '');

  useEffect(() => {
    if (profile) {
        resetBasic({
          firstName: currentUser?.firstName, lastName: currentUser?.lastName,
          phoneNumber: currentUser?.phoneNumber, whatsappNumber: currentUser?.whatsappNumber,
          currentEmployer: profile.currentEmployer, jobTitle: profile.jobTitle,
          yearsOfExperience: profile.yearsOfExperience, companyType: profile.companyType
        });
        resetBank({
            accountName: profile.bankDetails?.accountName, accountNumber: profile.bankDetails?.accountNumber,
            bankName: profile.bankDetails?.bankName, ifscCode: profile.bankDetails?.ifscCode
        });
    }
  }, [profile, currentUser, resetBasic, resetBank]);
  
  const onSubmitBasicInfo = async (data) => {
    setSubmittingSection('basic');
    try {
      await updateAuthProfile({ firstName: data.firstName, lastName: data.lastName, phoneNumber: data.phoneNumber, whatsappNumber: data.whatsappNumber });
      await updateProfile({
          currentEmployer: data.currentEmployer,
          jobTitle: data.jobTitle,
          yearsOfExperience: data.yearsOfExperience,
          companyType: data.companyType
      });
      invalidateProfile();
      showSuccess('Profile updated successfully!');
    } catch (error) { showError('Failed to update profile.'); } 
    finally { setSubmittingSection(null); }
  };
  
  const onSubmitBankDetails = async (data) => {
    setSubmittingSection('bank');
    try {
      await updateBankDetails(data);
      invalidateProfile();
      showSuccess('Bank details updated successfully!');
    } catch (error) { showError('Failed to update bank details.'); } 
    finally { setSubmittingSection(null); }
  };
  
  const onSubmitPasswordChange = async (data) => {
    setSubmittingSection('password');
    try {
      await changePassword(data.currentPassword, data.newPassword, data.confirmPassword);
      showSuccess('Password changed successfully!');
      resetPasswordHook();
      setActiveTab('Experience');
    } catch (error) { showError('Failed to change password. Please check your current password.'); } 
    finally { setSubmittingSection(null); }
  };
  
  const onSaveExperience = async (data) => {
      setSubmittingSection('experience');
      try {
          if (editingExperience) {
              await updateExperience(editingExperience._id, data);
              showSuccess("Experience updated!");
          } else {
              await addExperience(data);
              showSuccess("Experience added!");
          }
          invalidateProfile();
          setIsExperienceModalOpen(false);
          setEditingExperience(null);
      } catch (err) { showError("Failed to save experience."); } 
      finally { setSubmittingSection(null); }
  };

  const onSaveSkill = async (data) => {
    setSubmittingSection('skill');
    try {
        if (editingSkill) {
            await updateSkill(editingSkill._id, data);
            showSuccess("Skill updated!");
        } else {
            await addSkill(data);
            showSuccess("Skill added!");
        }
        invalidateProfile();
        setIsSkillModalOpen(false);
        setEditingSkill(null);
    } catch (err) {
        showError("Failed to save skill.");
    } finally {
        setSubmittingSection(null);
    }
  };
  
  const handleDeleteRequest = (item, type) => {
    setDeleteModalState({ isOpen: true, item, type });
  };
  
  const handleConfirmDelete = async () => {
    const { item, type } = deleteModalState;
    if (!item) return;

    setSubmittingSection('delete');
    try {
        if (type === 'Experience') {
            await deleteExperience(item._id);
            showSuccess("Experience deleted.");
        } else if (type === 'Skill') {
            await deleteSkill(item._id);
            showSuccess("Skill deleted.");
        }
        invalidateProfile();
        setDeleteModalState({ isOpen: false, item: null, type: '' });
    } catch (err) {
        showError(`Failed to delete ${type.toLowerCase()}.`);
    } finally {
        setSubmittingSection(null);
    }
  };

  if (loading) return <LocalLoader />;

  const tabs = [
    { id: 'Experience', label: 'Experience', icon: Briefcase },
    { id: 'Skills', label: 'Skills', icon: Layers },
    { id: 'Profile Details', label: 'Profile Details', icon: User },
    { id: 'Security', label: 'Security', icon: Shield }
  ];

  const statusColor = cn(
    profile?.status === 'Active' && 'bg-emerald-500',
    profile?.status === 'On Probation' && 'bg-amber-500',
    profile?.status !== 'Active' && profile?.status !== 'On Probation' && 'bg-gray-400'
  );

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">

        {/* ─── LEFT: Profile Sidebar ─────────────────────────────────── */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto hidden lg:flex">
            {/* Avatar & Info */}
            <div className="p-6 text-center border-b border-gray-100">
                <div className="relative inline-block">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-semibold mx-auto shadow-lg">
                        {currentUser?.firstName?.charAt(0)}
                    </div>
                    <span className={`absolute bottom-1 right-1 w-4 h-4 ${statusColor} rounded-full border-2 border-white`} title={profile?.status} />
                </div>
                <h2 className="text-base font-semibold text-gray-900 mt-3">{currentUser?.firstName} {currentUser?.lastName}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{profile?.jobTitle || 'No Title'} at {profile?.currentEmployer || '—'}</p>
                <Badge variant={profile?.status === 'Active' ? 'success' : 'warning'} className="mt-2 text-xs font-medium uppercase tracking-wide">
                    {profile?.status}
                </Badge>
            </div>

            {/* Quick Info */}
            <div className="px-5 py-4 space-y-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600 truncate text-xs">{currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600 text-xs">{currentUser?.phoneNumber || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600 text-xs">{profile?.yearsOfExperience || 0} years experience</span>
                </div>
                {profile?.domains?.length > 0 && (
                    <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                            {profile.domains.map((d, i) => (
                                <Badge key={i} variant="gray" className="text-xs">{d}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                activeTab === tab.id
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}>
                            <Icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-gray-400")} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            {/* Profile Completeness */}
            {profile?.profileCompleteness !== undefined && (
                <div className="p-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Profile</span>
                        <span className="text-xs font-medium text-gray-600">{Math.round(profile.profileCompleteness)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", profile.profileCompleteness === 100 ? "bg-emerald-500" : "bg-indigo-500")}
                            style={{ width: `${profile.profileCompleteness}%` }} />
                    </div>
                </div>
            )}
        </div>

        {/* ─── RIGHT: Tab Content ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
            {/* Mobile header (visible only on sm) */}
            <div className="lg:hidden bg-white border-b border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-lg font-semibold">
                        {currentUser?.firstName?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</h2>
                        <p className="text-xs text-gray-500">{profile?.jobTitle} at {profile?.currentEmployer}</p>
                    </div>
                </div>
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors",
                                activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                            )}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                
                {/* --- EXPERIENCE TAB --- */}
                {activeTab === 'Experience' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                             <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
                             <Button variant="secondary" onClick={() => { setEditingExperience(null); setIsExperienceModalOpen(true); }} className="bg-amber-400 text-gray-900 hover:bg-amber-500 border border-amber-400"><Plus className="mr-2 h-4 w-4" />Add Experience</Button>
                        </div>
                        
                        {/* Current Role Card */}
                        {profile?.jobTitle && profile?.currentEmployer && (
                             <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-medium text-emerald-900 uppercase tracking-wide mb-1">Current Role</h3>
                                    <div className="text-lg font-semibold text-gray-900">{profile.jobTitle}</div>
                                    <div className="text-gray-600 font-medium">{profile.currentEmployer} • {profile.yearsOfExperience} Years Exp.</div>
                                </div>
                                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                             </div>
                        )}

                        {profile?.experiences?.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No past experience added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {profile?.experiences?.map(exp => (
                                    <div key={exp._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                                                <p className="text-gray-600 font-medium">{exp.company}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingExperience(exp); setIsExperienceModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(exp, 'Experience')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center mb-4">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {formatDate(exp.startDate)} - {exp.isPresent ? <span className="text-green-600 font-semibold ml-1">Present</span> : (exp.endDate ? formatDate(exp.endDate) : 'N/A')}
                                        </p>
                                        {exp.skills && exp.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {exp.skills.map((skill, idx) => <Badge key={idx} variant="gray">{skill}</Badge>)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- SKILLS TAB --- */}
                {activeTab === 'Skills' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Technical Skills</h2>
                            <Button variant="secondary" onClick={() => { setEditingSkill(null); setIsSkillModalOpen(true); }} className="bg-amber-400 text-gray-900 hover:bg-amber-500 border border-amber-400"><Plus className="mr-2 h-4 w-4" />Add Skill</Button>
                        </div>
                        {profile?.skills?.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No skills added yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {profile?.skills?.map(skill => (
                                    <div key={skill._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-gray-300 transition-colors">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{skill.skill}</h4>
                                            <Badge
                                                variant={
                                                    skill.proficiencyLevel === 'Expert' ? 'purple' :
                                                    skill.proficiencyLevel === 'Advanced' ? 'success' :
                                                    skill.proficiencyLevel === 'Intermediate' ? 'info' : 'gray'
                                                }
                                                className="mt-1"
                                            >
                                                {skill.proficiencyLevel}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingSkill(skill); setIsSkillModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg"><Edit /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(skill, 'Skill')} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- PROFILE DETAILS TAB --- */}
                {activeTab === 'Profile Details' && (
                    <div className="space-y-6">
                        <form onSubmit={handleSubmitBasic(onSubmitBasicInfo)}>
                            <SectionCard title="Personal Information" icon={User} footer={<Button type="submit" isLoading={submittingSection === 'basic'} variant="default"><Save className="mr-2 h-4 w-4" />Save Changes</Button>}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="First Name" name="firstName" register={{...registerBasic('firstName', { required: 'Required' })}} error={errorsBasic.firstName} />
                                    <InputField label="Last Name" name="lastName" register={{...registerBasic('lastName', { required: 'Required' })}} error={errorsBasic.lastName} />
                                    <InputField label="Phone Number" name="phoneNumber" register={{...registerBasic('phoneNumber', { required: 'Required' })}} error={errorsBasic.phoneNumber} />
                                    <InputField label="WhatsApp Number" name="whatsappNumber" register={{...registerBasic('whatsappNumber')}} error={errorsBasic.whatsappNumber} />
                                    <div className="md:col-span-2 pt-4 mt-2 border-t border-gray-100">
                                        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Professional Overview</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField label="Current Employer" name="currentEmployer" register={{...registerBasic('currentEmployer', { required: 'Required' })}} error={errorsBasic.currentEmployer}/>
                                            <InputField label="Job Title" name="jobTitle" register={{...registerBasic('jobTitle', { required: 'Required' })}} error={errorsBasic.jobTitle} />
                                            <InputField label="Years of Experience" name="yearsOfExperience" type="number" step="0.1" register={{...registerBasic('yearsOfExperience', { required: 'Required', valueAsNumber: true, min: 0 })}} error={errorsBasic.yearsOfExperience} />
                                            <SelectField label="Company Type" name="companyType" register={{...registerBasic('companyType', { required: 'Required' })}} options={[{ value: 'Product-based', label: 'Product-based'}, { value: 'Service-based', label: 'Service-based'}, { value: 'Startup', label: 'Startup'}, { value: 'Other', label: 'Other'}]} error={errorsBasic.companyType} />
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </form>

                        <form onSubmit={handleSubmitBank(onSubmitBankDetails)}>
                            <SectionCard title="Bank Details" icon={DollarSign} footer={<Button type="submit" isLoading={submittingSection === 'bank'} variant="default"><Save className="mr-2 h-4 w-4" />Update Bank Info</Button>}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Account Holder" name="accountName" register={{...registerBank('accountName', { required: 'Required' })}} error={errorsBank.accountName} />
                                    <InputField label="Bank Name" name="bankName" register={{...registerBank('bankName', { required: 'Required' })}} error={errorsBank.bankName} />
                                    <InputField label="Account Number" name="accountNumber" register={{...registerBank('accountNumber', { required: 'Required' })}} error={errorsBank.accountNumber} />
                                    <InputField label="IFSC Code" name="ifscCode" register={{...registerBank('ifscCode', { required: 'Required' })}} error={errorsBank.ifscCode} />
                                </div>
                            </SectionCard>
                        </form>
                    </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'Security' && (
                     <form onSubmit={handleSubmitPassword(onSubmitPasswordChange)}>
                        <SectionCard title="Security Settings" icon={Lock} footer={<Button type="submit" isLoading={submittingSection === 'password'} variant="default"><Save className="mr-2 h-4 w-4" />Update Password</Button>}>
                           <div className="max-w-lg space-y-5">
                                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex items-start">
                                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                                    <p>Ensure your new password is at least 8 characters long and includes a mix of letters, numbers, and symbols.</p>
                                </div>
                                <PasswordInputField label="Current Password" name="currentPassword" register={{...registerPassword('currentPassword', { required: 'Required' })}} error={errorsPassword.currentPassword} />
                                <PasswordInputField label="New Password" name="newPassword" register={{...registerPassword('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}} error={errorsPassword.newPassword} />
                                <PasswordInputField label="Confirm New Password" name="confirmPassword" register={{...registerPassword('confirmPassword', { required: 'Required', validate: value => value === newPassword || 'Mismatch' })}} error={errorsPassword.confirmPassword} />
                            </div>
                        </SectionCard>
                    </form>
                )}
            </div>
        </div>
        </div>

        <ExperienceModal isOpen={isExperienceModalOpen} onClose={() => setIsExperienceModalOpen(false)} onSave={onSaveExperience} experience={editingExperience} isLoading={submittingSection === 'experience'} />
        <SkillModal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} onSave={onSaveSkill} skill={editingSkill} isLoading={submittingSection === 'skill'} />
        <ConfirmDeleteModal isOpen={deleteModalState.isOpen} onClose={() => setDeleteModalState({ isOpen: false, item: null, type: '' })} onConfirm={handleConfirmDelete} itemType={deleteModalState.type} isLoading={submittingSection === 'delete'} />
    </div>
  );
};

export default Profile;
