// client/src/components/admin/SkillCategorization.jsx
import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiCode, FiExternalLink, FiMail, FiPhone, FiSend } from 'react-icons/fi';
import Button from '../common/Button';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Badge from '../common/Badge';
import StatusBadge from '../common/StatusBadge';
import { processSkillCategorization } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { DOMAINS } from '../../utils/constants';

const SkillCategorization = ({ applicant, skillAssessment, onCategorizeComplete }) => {
  const { showSuccess, showError } = useAlert();
  const [selectedDomain, setSelectedDomain] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedDomain(skillAssessment?.domain || '');
    setNotes(skillAssessment?.additionalNotes || '');
  }, [skillAssessment]);

  const handleSubmit = async () => {
    if (!selectedDomain) {
      showError('Please select a final domain for this applicant.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await processSkillCategorization(skillAssessment._id, { domain: selectedDomain, notes });
      showSuccess('Skill assessment categorized successfully!');
      if (onCategorizeComplete) {
        onCategorizeComplete();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to categorize assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!applicant || !skillAssessment) {
    return null;
  }
  
  return (
    <div className="space-y-8 animate-fade-in">
        {/* Profile Header */}
        <div className="pb-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{applicant.fullName}</h2>
                    <div className="mt-2 flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><FiMail className="text-gray-400"/> {applicant.email}</div>
                        <div className="flex items-center gap-2"><FiPhone className="text-gray-400"/> {applicant.phoneNumber}</div>
                    </div>
                </div>
                <StatusBadge status={applicant.status} />
            </div>
             <a href={applicant.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline">
                View LinkedIn Profile <FiExternalLink className="ml-1.5 h-4 w-4"/>
            </a>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Current Role</p>
                <p className="mt-1 text-lg font-semibold text-gray-800 truncate">{skillAssessment.jobTitle} at {skillAssessment.currentEmployer}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Total Experience</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{skillAssessment.yearsOfExperience} years</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-indigo-700">Auto-Suggested Domain</p>
                <p className="mt-1 text-2xl font-bold text-indigo-900">{skillAssessment.autoCategorizedDomain || 'N/A'}</p>
            </div>
        </div>

        {/* Technical Skills Section */}
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3"><FiCode/> Technical Skills</h3>
            {skillAssessment.technicalSkills && skillAssessment.technicalSkills.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {skillAssessment.technicalSkills.map((skill, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-base font-semibold text-gray-900">{skill.technology}</h4>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {skill.subSkills.length} skill{skill.subSkills.length !== 1 && 's'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {skill.subSkills.map((subSkill, subIndex) => (
                                <Badge key={subIndex} variant="info" size="md">{subSkill}</Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center py-4 text-sm text-gray-500 italic">No specific skills listed by applicant.</p>
            )}

            {skillAssessment.otherSkills && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Other Skills Listed by Applicant</h4>
                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50/70 text-yellow-900 text-sm whitespace-pre-line">
                  {skillAssessment.otherSkills}
                </div>
              </div>
            )}
        </div>
      
        {/* Admin Action Form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3"><FiCheckCircle className="text-primary-600"/> Admin Review & Action</h3>
            </div>
            <div className="p-6 space-y-6">
                <Select
                    label="Assign Final Domain"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    options={DOMAINS}
                    placeholder="Select the most appropriate domain"
                    required
                />
                <Textarea
                    label="Internal Review Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about this categorization decision..."
                    rows={3}
                />
            </div>
            <div className="px-6 py-4 bg-gray-50/50 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedDomain}
                  isLoading={isSubmitting}
                  icon={<FiSend />}
                  iconPosition="right"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm & Send Guidelines'}
                </Button>
            </div>
      </div>
    </div>
  );
};

export default SkillCategorization;