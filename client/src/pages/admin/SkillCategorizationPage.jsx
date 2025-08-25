// client/src/pages/admin/SkillCategorizationPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
    FiBriefcase, FiCheckCircle, FiChevronLeft, FiChevronRight, 
    FiChevronsLeft, FiChevronsRight, FiUser, FiClock, FiStar, 
    FiMail, FiPhone, FiLinkedin, FiSend
} from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import { getSkillAssessments, processSkillCategorization } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import EmptyState from '../../components/common/EmptyState';
import { debounce } from '../../utils/helpers';
import SearchInput from '../../components/common/SearchInput';
import { formatDate } from '../../utils/formatters';
import Select from 'react-select';
import { DOMAINS } from '../../utils/constants';

// --- Simple UI Components ---

const SimpleButton = ({ children, variant = 'primary', icon: Icon, ...props }) => {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    };
    
    return (
        <button 
            {...props} 
            className={`px-4 py-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${variants[variant]}`}
        >
            {Icon && <Icon className="inline w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};

const SimpleCard = ({ children, className = '' }) => (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        {children}
    </div>
);

const SimpleBadge = ({ children, color = 'gray' }) => {
    const colors = {
        gray: 'bg-gray-100 text-gray-800',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors[color]}`}>
            {children}
        </span>
    );
};

// --- Page Components ---

const ApplicantInfo = ({ applicant, skillAssessment }) => (
    <SimpleCard className="p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{applicant.fullName}</h1>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                        <FiMail className="w-4 h-4 mr-2" />
                        {applicant.email}
                    </div>
                    <div className="flex items-center">
                        <FiPhone className="w-4 h-4 mr-2" />
                        {applicant.phoneNumber}
                    </div>
                    <div className="flex items-center">
                        <FiLinkedin className="w-4 h-4 mr-2" />
                        <a href={applicant.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                        </a>
                    </div>
                </div>
            </div>
            <SimpleBadge color="green">Assessment Done</SimpleBadge>
        </div>
    </SimpleCard>
);

const BasicMetrics = ({ skillAssessment }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SimpleCard className="p-4">
            <div className="flex items-center mb-2">
                <FiUser className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Current Role</span>
            </div>
            <p className="font-semibold text-gray-900">{skillAssessment.jobTitle}</p>
            <p className="text-sm text-gray-600">{skillAssessment.currentEmployer}</p>
        </SimpleCard>

        <SimpleCard className="p-4">
            <div className="flex items-center mb-2">
                <FiClock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Experience</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{skillAssessment.yearsOfExperience} years</p>
        </SimpleCard>

        <SimpleCard className="p-4">
            <div className="flex items-center mb-2">
                <FiStar className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Suggested Domain</span>
            </div>
            <p className="font-semibold text-blue-700">{skillAssessment.autoCategorizedDomain || 'N/A'}</p>
        </SimpleCard>
    </div>
);

const SkillsList = ({ skillAssessment }) => (
    <SimpleCard className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Skills</h3>
        
        {skillAssessment.technicalSkills && skillAssessment.technicalSkills.length > 0 ? (
            <div className="space-y-6">
                {skillAssessment.technicalSkills.map((skill, index) => (
                    <div key={index} className="border border-gray-100 rounded p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-800">{skill.technology}</h4>
                            <SimpleBadge color="gray">{skill.subSkills.length} skills</SimpleBadge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skill.subSkills.map((subSkill, subIndex) => (
                                <SimpleBadge key={subIndex} color="blue">{subSkill}</SimpleBadge>
                            ))}
                        </div>
                    </div>
                ))}
                
                {skillAssessment.otherSkills && (
                    <div className="border border-gray-100 rounded p-4 bg-gray-50">
                        <h4 className="font-semibold text-gray-700 mb-2">Other Skills</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{skillAssessment.otherSkills}</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center py-8 text-gray-500">
                <p>No technical skills listed</p>
            </div>
        )}
    </SimpleCard>
);

const ReviewForm = ({ applicant, skillAssessment, onCategorizeComplete }) => {
    const { showSuccess, showError } = useAlert();
    const [selectedDomains, setSelectedDomains] = useState([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    useEffect(() => {
        const initialDomains = (skillAssessment?.domains && skillAssessment.domains.length > 0) 
            ? skillAssessment.domains 
            : (skillAssessment?.autoCategorizedDomain ? [skillAssessment.autoCategorizedDomain] : []);
        setSelectedDomains(DOMAINS.filter(d => initialDomains.includes(d.value)));
        setNotes(skillAssessment?.additionalNotes || '');
    }, [skillAssessment]);
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDomains || selectedDomains.length === 0) {
            return showError('Please select at least one domain.');
        }
        setIsSubmitting(true);
        try {
            const domainValues = selectedDomains.map(d => d.value);
            await processSkillCategorization(skillAssessment._id, { domains: domainValues, notes });
            showSuccess('Assessment categorized successfully!');
            onCategorizeComplete?.();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to categorize assessment.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <SimpleCard className="p-6">
            <div className="flex items-center mb-6">
                <FiCheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Admin Review</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Domain(s) *
                    </label>
                    <Select 
                        isMulti 
                        name="domains" 
                        options={DOMAINS} 
                        value={selectedDomains} 
                        onChange={setSelectedDomains} 
                        placeholder="Select domains..." 
                        className="text-sm"
                        styles={{
                            control: (base) => ({
                                ...base,
                                minHeight: '40px',
                                borderColor: '#d1d5db',
                                '&:hover': {
                                    borderColor: '#6b7280',
                                },
                            }),
                        }}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this assessment..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                <div className="flex justify-end">
                    <SimpleButton 
                        type="submit" 
                        disabled={isSubmitting || selectedDomains.length === 0}
                        icon={FiSend}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm & Send Guidelines'}
                    </SimpleButton>
                </div>
            </form>
        </SimpleCard>
    );
};

const SimpleSidebar = ({ 
    assessments, 
    selectedAssessment, 
    onSelectAssessment, 
    loading, 
    searchTerm, 
    onSearchChange, 
    pagination, 
    onPageChange,
    sidebarCollapsed 
}) => (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-80'}`}>
        <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Review Queue</h2>
                <SimpleBadge color="yellow">{pagination.totalItems} Pending</SimpleBadge>
            </div>
            <SearchInput 
                value={searchTerm} 
                onChange={onSearchChange} 
                onClear={() => onSearchChange({ target: { value: '' } })} 
                placeholder="Search applicants..." 
            />
        </div>

        <div className="flex-1 overflow-y-auto">
            {loading && assessments.length === 0 && (
                <div className="p-6 text-center">
                    <Loader text="Loading..." />
                </div>
            )}
            
            {!loading && assessments.length === 0 && (
                <div className="p-8 text-center">
                    <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Queue Empty</h3>
                    <p className="text-sm text-gray-500">No pending assessments</p>
                </div>
            )}
            
            {assessments.map((assessment) => (
                <button 
                    key={assessment._id} 
                    onClick={() => onSelectAssessment(assessment)} 
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 focus:outline-none ${selectedAssessment?._id === assessment._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900">{assessment.applicant.fullName}</p>
                        <span className="text-xs text-gray-500">{formatDate(assessment.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <SimpleBadge color="blue">{assessment.autoCategorizedDomain || 'N/A'}</SimpleBadge>
                        <span className="text-gray-600">{assessment.yearsOfExperience} years exp</span>
                    </div>
                </button>
            ))}
        </div>
        
        {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-gray-200 flex justify-between items-center">
                <SimpleButton
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    variant="outline"
                    icon={FiChevronLeft}
                >
                    Previous
                </SimpleButton>
                
                <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <SimpleButton
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    variant="outline"
                    icon={FiChevronRight}
                >
                    Next
                </SimpleButton>
            </div>
        )}
    </div>
);

// --- Main Page Component ---
const SkillCategorizationPage = () => {
    const [loading, setLoading] = useState(true);
    const [assessments, setAssessments] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const { showError } = useAlert();
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter] = useState('Pending');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const fetchAssessments = useCallback(async (page = 1, shouldPreserveSelection = false) => {
        setLoading(true);
        if (!shouldPreserveSelection) setSelectedAssessment(null);
        
        try {
            const response = await getSkillAssessments({ 
                page, 
                limit: 15, 
                status: statusFilter, 
                search: searchTerm, 
                sortBy: 'createdAt', 
                sortOrder: 'asc' 
            });
            const data = response.data.data;
            setAssessments(data.assessments || []);
            setPagination({ 
                currentPage: data.page, 
                totalPages: data.totalPages, 
                totalItems: data.totalDocs 
            });
            
            if (!shouldPreserveSelection && (data.assessments || []).length > 0) {
                setSelectedAssessment(data.assessments[0]);
            }
        } catch (error) { 
            showError('Failed to fetch assessments for review.'); 
        } finally { 
            setLoading(false); 
        }
    }, [showError, statusFilter, searchTerm]);

    useEffect(() => { 
        const handler = debounce(() => fetchAssessments(1), 300); 
        handler(); 
        return () => handler.cancel(); 
    }, [fetchAssessments]);

    const handlePageChange = (newPage) => { 
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchAssessments(newPage); 
        }
    };

    const handleSelectAssessment = (assessment) => { 
        setSelectedAssessment(assessment); 
        if (window.innerWidth < 1024) setSidebarCollapsed(true); 
    };

    const handleCategorizeComplete = () => {
        const currentIndex = assessments.findIndex(a => a._id === selectedAssessment._id);
        const remaining = assessments.filter(a => a._id !== selectedAssessment._id);
        setAssessments(remaining);
        
        if (remaining.length > 0) { 
            setSelectedAssessment(remaining[Math.min(currentIndex, remaining.length - 1)]); 
        } else {
            if (pagination.currentPage < pagination.totalPages) {
                fetchAssessments(pagination.currentPage);
            } else if (pagination.currentPage > 1) {
                fetchAssessments(pagination.currentPage - 1);
            } else {
                setSelectedAssessment(null);
            }
        }
    };

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="flex h-full bg-gray-50">
            <SimpleSidebar
                assessments={assessments}
                selectedAssessment={selectedAssessment}
                onSelectAssessment={handleSelectAssessment}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                pagination={pagination}
                onPageChange={handlePageChange}
                sidebarCollapsed={sidebarCollapsed}
            />

            <div className="flex-1 relative">
                <button 
                    onClick={toggleSidebar} 
                    className="absolute top-4 left-4 z-10 bg-white border border-gray-300 rounded p-2 hover:bg-gray-50" 
                    aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                >
                    {sidebarCollapsed ? <FiChevronsRight className="w-4 h-4" /> : <FiChevronsLeft className="w-4 h-4" />}
                </button>

                <div className="h-full overflow-y-auto p-6">
                    {loading && !selectedAssessment && (
                        <div className="flex items-center justify-center h-full">
                            <Loader text="Loading Assessment..." />
                        </div>
                    )}
                    
                    {!loading && selectedAssessment ? (
                        <div className="max-w-4xl mx-auto">
                            <ApplicantInfo 
                                applicant={selectedAssessment.applicant} 
                                skillAssessment={selectedAssessment} 
                            />
                            <BasicMetrics skillAssessment={selectedAssessment} />
                            <SkillsList skillAssessment={selectedAssessment} />
                            <ReviewForm 
                                applicant={selectedAssessment.applicant} 
                                skillAssessment={selectedAssessment} 
                                onCategorizeComplete={handleCategorizeComplete} 
                            />
                        </div>
                    ) : (!loading && assessments.length > 0 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <FiBriefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Assessment</h3>
                                <p className="text-gray-600">Choose an applicant from the list to review</p>
                            </div>
                        </div>
                    ))}

                    {!loading && assessments.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">All Done!</h3>
                                <p className="text-gray-600">No pending assessments to review</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillCategorizationPage;