// client/src/pages/interviewer/Profile.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
    FiSave, FiUser, FiDollarSign, FiKey, FiEye, FiEyeOff, FiBriefcase, 
    FiLock, FiEdit, FiTrash2, FiPlus, FiPhone, FiMail, FiCheckCircle, 
    FiAlertTriangle, FiX, FiLayers, FiShield, FiCalendar, FiMapPin
} from 'react-icons/fi';
import { getProfile, updateProfile, updateBankDetails, addExperience, updateExperience, deleteExperience, addSkill, updateSkill, deleteSkill } from '../../api/interviewer.api';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';

// --- STYLED UI COMPONENTS ---

const SectionCard = ({ title, icon: Icon, children, footer, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden ${className}`}>
        {title && (
            <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50/50">
                {Icon && <Icon className="h-5 w-5 mr-3 text-gray-500" />}
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
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
        <label htmlFor={name} className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
        <input 
            id={name} 
            {...register} 
            {...props} 
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-gray-900 focus:border-gray-900'
            }`} 
        />
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error.message}</p>}
    </div>
));
InputField.displayName = 'InputField';

const SelectField = React.forwardRef(({ label, name, error, register, options, ...props }, ref) => (
    <div className="w-full">
        <label htmlFor={name} className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
        <select 
            id={name} 
            {...register} 
            {...props} 
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors appearance-none ${
                error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-gray-900 focus:border-gray-900'
            }`}
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
            <label htmlFor={name} className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                    id={name} 
                    type={show ? 'text' : 'password'} 
                    {...register} 
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                        error 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-gray-900 focus:border-gray-900'
                    }`} 
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    {show ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
                </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error.message}</p>}
        </div>
    );
};

const LocalButton = ({ children, onClick, type = 'button', isLoading = false, icon: Icon, variant = 'primary', className = '' }) => {
    const base = 'inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]';
    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black focus:ring-gray-900',
        secondary: 'bg-[#FFD130] text-gray-900 hover:bg-[#FFC400] border border-[#FFD130]',
        danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-500',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
    };
    
    return (
        <button type={type} onClick={onClick} disabled={isLoading} className={`${base} ${variants[variant]} ${className}`}>
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
            ) : (Icon && <Icon className="mr-2 h-4 w-4" />)}
            {children}
        </button>
    );
};

const LocalLoader = () => (
    <div className="flex flex-col justify-center items-center py-20 h-full">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
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
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h3 className="text-lg font-bold text-gray-900">{experience ? 'Edit Experience' : 'Add Experience'}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"><FiX className="h-5 w-5"/></button>
                </div>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-grow overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Job Title" name="title" register={{...register('title', { required: 'Title is required' })}} error={errors.title} placeholder="e.g. Senior Developer" />
                            <InputField label="Company" name="company" register={{...register('company', { required: 'Company is required' })}} error={errors.company} placeholder="e.g. Acme Corp" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Start Date</label>
                                <Controller name="startDate" control={control} rules={{ required: "Required" }} render={({ field }) => <DatePicker {...field} selected={field.value} onChange={date => field.onChange(date)} className={datePickerClass} dateFormat="MM/yyyy" showMonthYearPicker placeholderText="Select Date" />} />
                                {errors.startDate && <p className="mt-1.5 text-xs text-red-600">{errors.startDate.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">End Date</label>
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
                        <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
                        <LocalButton type="submit" isLoading={isLoading} icon={FiSave} variant="primary">Save Experience</LocalButton>
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
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h3 className="text-lg font-bold text-gray-900">{skill ? 'Edit Skill' : 'Add Skill'}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"><FiX className="h-5 w-5"/></button>
                </div>
                <form onSubmit={handleSubmit(onSave)} className="flex flex-col">
                    <div className="p-6 space-y-5">
                        <InputField label="Skill Name" name="skill" register={{...register('skill', { required: 'Required' })}} error={errors.skill} placeholder="e.g. React Native" />
                        <SelectField label="Proficiency Level" name="proficiencyLevel" register={{...register('proficiencyLevel', { required: 'Required' })}} options={levels} error={errors.proficiencyLevel} />
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
                        <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
                        <LocalButton type="submit" isLoading={isLoading} icon={FiSave} variant="primary">Save Skill</LocalButton>
                    </div>
                </form>
            </div>
        </div>
    ) : null;
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemType, isLoading }) => isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                    <FiAlertTriangle className="h-6 w-6 text-red-600"/>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete {itemType}</h3>
                <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-center gap-3 border-t border-gray-100">
                <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
                <LocalButton variant="danger" onClick={onConfirm} isLoading={isLoading}>Delete</LocalButton>
            </div>
        </div>
    </div>
) : null;

// --- MAIN PROFILE PAGE COMPONENT ---

const Profile = () => {
  const { currentUser, updateProfile: updateAuthProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('Experience');
  const [submittingSection, setSubmittingSection] = useState(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, item: null, type: '' });

  
  const { register: registerBasic, handleSubmit: handleSubmitBasic, formState: { errors: errorsBasic }, reset: resetBasic } = useForm();
  const { register: registerBank, handleSubmit: handleSubmitBank, formState: { errors: errorsBank }, reset: resetBank } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, reset: resetPasswordHook, watch } = useForm();
  
  const newPassword = watch('newPassword', '');
  
  const fetchProfileData = useCallback(() => {
    setLoading(true);
    getProfile().then(response => {
        const data = response.data.data;
        setProfile(data);
        resetBasic({
          firstName: currentUser?.firstName, lastName: currentUser?.lastName,
          phoneNumber: currentUser?.phoneNumber, whatsappNumber: currentUser?.whatsappNumber,
          currentEmployer: data.currentEmployer, jobTitle: data.jobTitle,
          yearsOfExperience: data.yearsOfExperience, companyType: data.companyType
        });
        resetBank({
            accountName: data.bankDetails?.accountName, accountNumber: data.bankDetails?.accountNumber,
            bankName: data.bankDetails?.bankName, ifscCode: data.bankDetails?.ifscCode
        });
    }).catch(() => showError('Failed to load profile data.'))
    .finally(() => setLoading(false));
  }, [currentUser, resetBasic, resetBank, showError]);
  
  useEffect(fetchProfileData, [fetchProfileData]);
  
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
      showSuccess('Profile updated successfully!');
    } catch (error) { showError('Failed to update profile.'); } 
    finally { setSubmittingSection(null); }
  };
  
  const onSubmitBankDetails = async (data) => {
    setSubmittingSection('bank');
    try {
      await updateBankDetails(data);
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
          fetchProfileData();
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
        fetchProfileData();
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
        fetchProfileData();
        setDeleteModalState({ isOpen: false, item: null, type: '' });
    } catch (err) {
        showError(`Failed to delete ${type.toLowerCase()}.`);
    } finally {
        setSubmittingSection(null);
    }
  };

  if (loading) return <LocalLoader />;
  
  const tabs = [
    { id: 'Experience', label: 'Experience', icon: FiBriefcase },
    { id: 'Skills', label: 'Skills', icon: FiLayers },
    { id: 'Profile Details', label: 'Profile Details', icon: FiUser },
    { id: 'Security', label: 'Security', icon: FiShield }
  ];
  
  return (
    <div className="flex flex-col h-full bg-[#F5F7F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-8 flex-shrink-0">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {currentUser?.firstName?.charAt(0)}
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</h1>
                    <div className="mt-2 flex flex-col md:flex-row items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
                        <span className="flex items-center"><FiBriefcase className="mr-2" /> {profile?.jobTitle || 'No Title'} at {profile?.currentEmployer || 'No Company'}</span>
                        <span className="flex items-center"><FiMail className="mr-2" /> {currentUser?.email}</span>
                        <span className="flex items-center"><FiPhone className="mr-2" /> {currentUser?.phoneNumber || 'No phone'}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                     <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                         <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Status</span>
                         <Badge variant={profile?.status === 'Active' ? 'success' : 'warning'}>{profile?.status}</Badge>
                     </div>
                </div>
            </div>
            {/* Tabs */}
            <div className="flex space-x-1 mt-8 border-b border-gray-200 overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)} 
                            className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'border-gray-900 text-gray-900' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* --- EXPERIENCE TAB --- */}
                {activeTab === 'Experience' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                             <h2 className="text-lg font-bold text-gray-900">Work Experience</h2>
                             <LocalButton variant="secondary" icon={FiPlus} onClick={() => { setEditingExperience(null); setIsExperienceModalOpen(true); }}>Add Experience</LocalButton>
                        </div>
                        
                        {/* Current Role Card */}
                        {profile?.jobTitle && profile?.currentEmployer && (
                             <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">Current Role</h3>
                                    <div className="text-lg font-bold text-gray-900">{profile.jobTitle}</div>
                                    <div className="text-gray-600 font-medium">{profile.currentEmployer} • {profile.yearsOfExperience} Years Exp.</div>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                    <FiBriefcase className="h-6 w-6" />
                                </div>
                             </div>
                        )}

                        {profile?.experiences?.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <FiBriefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No past experience added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {profile?.experiences?.map(exp => (
                                    <div key={exp._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                                                <p className="text-gray-600 font-medium">{exp.company}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingExperience(exp); setIsExperienceModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit className="h-4 w-4"/></button>
                                                <button onClick={() => handleDeleteRequest(exp, 'Experience')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 className="h-4 w-4"/></button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center mb-4">
                                            <FiCalendar className="mr-2 h-4 w-4" />
                                            {formatDate(exp.startDate)} - {exp.isPresent ? <span className="text-green-600 font-semibold ml-1">Present</span> : (exp.endDate ? formatDate(exp.endDate) : 'N/A')}
                                        </p>
                                        {exp.skills && exp.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {exp.skills.map((skill, idx) => <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium border border-gray-200">{skill}</span>)}
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
                            <h2 className="text-lg font-bold text-gray-900">Technical Skills</h2>
                            <LocalButton variant="secondary" icon={FiPlus} onClick={() => { setEditingSkill(null); setIsSkillModalOpen(true); }}>Add Skill</LocalButton>
                        </div>
                        {profile?.skills?.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <FiLayers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No skills added yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {profile?.skills?.map(skill => (
                                    <div key={skill._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{skill.skill}</h4>
                                            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded ${
                                                skill.proficiencyLevel === 'Expert' ? 'bg-purple-50 text-purple-700' :
                                                skill.proficiencyLevel === 'Advanced' ? 'bg-green-50 text-green-700' :
                                                'bg-blue-50 text-blue-700'
                                            }`}>
                                                {skill.proficiencyLevel}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingSkill(skill); setIsSkillModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><FiEdit /></button>
                                            <button onClick={() => handleDeleteRequest(skill, 'Skill')} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><FiTrash2 /></button>
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
                            <SectionCard title="Personal Information" icon={FiUser} footer={<LocalButton type="submit" isLoading={submittingSection === 'basic'} icon={FiSave} variant="primary">Save Changes</LocalButton>}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="First Name" name="firstName" register={{...registerBasic('firstName', { required: 'Required' })}} error={errorsBasic.firstName} />
                                    <InputField label="Last Name" name="lastName" register={{...registerBasic('lastName', { required: 'Required' })}} error={errorsBasic.lastName} />
                                    <InputField label="Phone Number" name="phoneNumber" register={{...registerBasic('phoneNumber', { required: 'Required' })}} error={errorsBasic.phoneNumber} />
                                    <InputField label="WhatsApp Number" name="whatsappNumber" register={{...registerBasic('whatsappNumber')}} error={errorsBasic.whatsappNumber} />
                                    <div className="md:col-span-2 pt-4 mt-2 border-t border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Professional Overview</h4>
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
                            <SectionCard title="Bank Details" icon={FiDollarSign} footer={<LocalButton type="submit" isLoading={submittingSection === 'bank'} icon={FiSave} variant="primary">Update Bank Info</LocalButton>}>
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
                        <SectionCard title="Security Settings" icon={FiLock} footer={<LocalButton type="submit" isLoading={submittingSection === 'password'} icon={FiSave} variant="primary">Update Password</LocalButton>}>
                           <div className="max-w-lg space-y-5">
                                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex items-start">
                                    <FiAlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
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

        <ExperienceModal isOpen={isExperienceModalOpen} onClose={() => setIsExperienceModalOpen(false)} onSave={onSaveExperience} experience={editingExperience} isLoading={submittingSection === 'experience'} />
        <SkillModal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} onSave={onSaveSkill} skill={editingSkill} isLoading={submittingSection === 'skill'} />
        <ConfirmDeleteModal isOpen={deleteModalState.isOpen} onClose={() => setDeleteModalState({ isOpen: false, item: null, type: '' })} onConfirm={handleConfirmDelete} itemType={deleteModalState.type} isLoading={submittingSection === 'delete'} />
    </div>
  );
};

export default Profile;
