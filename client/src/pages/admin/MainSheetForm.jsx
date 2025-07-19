// client/src/pages/admin/MainSheetForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import Loader from '@/components/common/Loader';
import { useAlert } from '@/hooks/useAlert';
import { bulkUpdateMainSheetEntries, getInterviewers, getMainSheetEntry } from '@/api/admin.api';
import { MAIN_SHEET_TECH_STACKS, MAIN_SHEET_INTERVIEW_STATUSES } from '@/utils/constants';

const MainSheetForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { showSuccess, showError } = useAlert();
    const [loading, setLoading] = useState(isEditMode);
    
    // Dropdown options
    const [interviewerOptions, setInterviewerOptions] = useState([]);
    
    // *** FIX START: Default values are now empty strings or null to show placeholders ***
    const defaultEntry = {
        hiringName: '',
        techStack: '',
        interviewId: '',
        uid: '',
        candidateName: '',
        mobileNumber: '',
        mailId: '',
        candidateResume: '',
        meetingLink: '',
        interviewDate: '',
        interviewTime: '',
        interviewDuration: '',
        interviewStatus: '',
        remarks: '',
        interviewer: null,
    };
    // *** FIX END ***

    // React Hook Form setup
    const {
        register, control, handleSubmit, setValue, watch, reset, formState: { isSubmitting },
    } = useForm({
        defaultValues: { entries: [defaultEntry] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'entries' });

    // Fetch Interviewers for the dropdown
    useEffect(() => {
        getInterviewers({ status: 'Active,On Probation', limit: 500 })
            .then(res => {
                const options = (res.data.data.interviewers || []).map(i => ({
                    value: i._id, label: `${i.user.firstName} ${i.user.lastName}`, email: i.user.email
                }));
                setInterviewerOptions(options);
            })
            .catch(() => showError("Failed to load interviewers list."));
    }, [showError]);

    // Fetch existing entry if in edit mode
    useEffect(() => {
        if (isEditMode) {
            getMainSheetEntry(id).then(res => {
                const entry = res.data.data;
                // Format date for the input field
                if(entry.interviewDate) {
                    entry.interviewDate = new Date(entry.interviewDate).toISOString().split('T')[0];
                }
                reset({ entries: [entry] });
                setLoading(false);
            }).catch(() => {
                showError('Failed to load entry data.');
                navigate('/admin/main-sheet');
            });
        }
    }, [id, isEditMode, reset, navigate, showError]);
    
    // Handler for auto-populating interviewer email on change
    const handleInterviewerChange = (interviewerId, index) => {
        const selected = interviewerOptions.find(opt => opt.value === interviewerId);
        // The watch/controller doesn't immediately update for a disabled field, 
        // so we manually update the email. No 'interviewerMailId' field in model, it's UI only.
        const mailIdInput = document.getElementById(`interviewer-mail-${index}`);
        if(mailIdInput) {
            mailIdInput.value = selected ? selected.email : '';
        }
    };
    
    // Handler for saving data
    const onSubmit = async (data) => {
        try {
            await bulkUpdateMainSheetEntries(data.entries);
            showSuccess(`Successfully ${isEditMode ? 'updated' : 'created'} entries!`);
            navigate('/admin/main-sheet');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save entries.');
        }
    };
    
    if (loading) {
        return <div className="flex justify-center py-20"><Loader text="Loading Entry..."/></div>
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <Link to="/admin/main-sheet" className="text-sm text-gray-600 hover:text-gray-900 flex items-center mb-1">
                            <FiArrowLeft className="mr-2"/> Back to Main Sheet
                        </Link>
                        <h2 className="text-xl font-bold text-gray-800">
                           {isEditMode ? "" : ""}
                        </h2>
                    </div>
                     <Button type="submit" variant="primary" icon={<FiSave/>} isLoading={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Entries'}
                    </Button>
                </div>

                <div className=" overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                {[
                                    '#', 'Hiring Name', 'Tech Stack', 'Interview ID', 'UID', 'Candidate Name', 
                                    'Mobile Number', 'Mail Id\'s', 'Candidate Resume', 'Meeting Link', 'Interview Date', 'Interview Time', 
                                    'Interview Duration', 'Interview Status', 'Remarks', 'Interviewer Name', 
                                    'Interviewer Mail ID', ''
                                ].map(h => (
                                    <th key={h} className="p-2 border border-gray-300 whitespace-nowrap font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.id} className="even:bg-gray-50 align-top">
                                    <td className="p-1 border border-gray-300 text-center">{index + 1}</td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '150px'}}><Input {...register(`entries.${index}.hiringName`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '200px'}}><Select {...register(`entries.${index}.techStack`)} options={MAIN_SHEET_TECH_STACKS} className="m-0" placeholder="Select Stack..."/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '180px'}}><Input {...register(`entries.${index}.interviewId`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '120px'}}><Input {...register(`entries.${index}.uid`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '200px'}}><Input {...register(`entries.${index}.candidateName`, { required: true })} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '150px'}}><Input {...register(`entries.${index}.mobileNumber`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '220px'}}><Input type="email" {...register(`entries.${index}.mailId`, { required: true })} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '220px'}}><Input {...register(`entries.${index}.candidateResume`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '220px'}}><Input {...register(`entries.${index}.meetingLink`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '150px'}}><Input type="date" {...register(`entries.${index}.interviewDate`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '120px'}}><Input type="time" {...register(`entries.${index}.interviewTime`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '120px'}}><Input {...register(`entries.${index}.interviewDuration`)} className="m-0"/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '150px'}}><Select {...register(`entries.${index}.interviewStatus`)} options={MAIN_SHEET_INTERVIEW_STATUSES} className="m-0" placeholder="Select Status..."/></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '250px'}}><Textarea {...register(`entries.${index}.remarks`)} className="m-0" rows={1} /></td>
                                    <td className="p-1 border border-gray-300" style={{minWidth: '200px'}}>
                                        <Controller
                                            name={`entries.${index}.interviewer`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select {...field} options={interviewerOptions} onChange={(e) => {field.onChange(e.target.value); handleInterviewerChange(e.target.value, index);}} className="m-0" placeholder="Select Interviewer..."/>
                                            )}
                                        />
                                    </td>
                                    <td className="p-1 border border-gray-300"><Input id={`interviewer-mail-${index}`} defaultValue={interviewerOptions.find(opt => opt.value === watch(`entries.${index}.interviewer`))?.email || ''} disabled className="m-0 bg-gray-100" /></td>
                                    <td className="p-1 border border-gray-300 text-center">
                                       {!isEditMode && <Button type="button" variant="danger" className="!p-2" onClick={() => remove(index)}><FiTrash2 size={16}/></Button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {!isEditMode && (
                        <Button type="button" variant="outline" icon={<FiPlus />} className="mt-4" onClick={() => append(defaultEntry)}>Add Row</Button>
                    )}
                </div>
            </Card>
        </form>
    );
};

export default MainSheetForm;