// client/src/pages/admin/SkillCategorizationPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    Briefcase, CheckCircle, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, User, Clock, Star,
    Mail, Phone, Linkedin, Send, Search, X, Loader2
} from 'lucide-react';
import { processSkillCategorization } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { debounce } from '../../utils/helpers';
import { formatDate, formatDateTime } from '../../utils/formatters';
import Select from 'react-select';
import { DOMAINS } from '../../utils/constants';
import { useSkillAssessments, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { Button } from '@/components/ui/button';

// --- Simple UI Components ---

const SimpleButton = ({ children, variant = 'primary', icon: Icon, ...props }) => {
    const variantMap = {
        primary: 'default',
        secondary: 'secondary',
        outline: 'outline',
    };

    return (
        <Button
            variant={variantMap[variant] || 'default'}
            {...props}
        >
            {Icon && <Icon className="inline w-4 h-4 mr-2" />}
            {children}
        </Button>
    );
};

const SimpleCard = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
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

// --- Inline Loading Spinner ---

const InlineLoader = ({ text }) => (
    <div className="flex flex-col items-center justify-center">
        <div className="relative">
            <div className="w-8 h-8 rounded-full border-[2.5px] border-slate-200" />
            <div className="absolute inset-0 w-8 h-8 rounded-full border-[2.5px] border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
        </div>
        {text && <p className="text-xs mt-2.5 text-slate-400 font-medium">{text}</p>}
    </div>
);

// --- Inline Empty State ---

const InlineEmptyState = ({ icon: Icon, iconClassName = 'text-slate-400', title, description }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {Icon && <Icon className={`w-14 h-14 mb-4 ${iconClassName}`} />}
        <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 max-w-xs">{description}</p>
    </div>
);

// --- Page Components ---

const ApplicantInfo = ({ applicant, skillAssessment }) => (
    <SimpleCard className="p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 mb-2">{applicant.fullName}</h1>
                <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {applicant.email}
                    </div>
                    <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {applicant.phoneNumber}
                    </div>
                    <div className="flex items-center">
                        <Linkedin className="w-4 h-4 mr-2" />
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SimpleCard className="p-5">
            <div className="flex items-center mb-2">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-slate-600">Current Role</span>
            </div>
            <p className="font-semibold text-slate-900">{skillAssessment.jobTitle}</p>
            <p className="text-sm text-slate-600">{skillAssessment.currentEmployer}</p>
        </SimpleCard>

        <SimpleCard className="p-5">
            <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-slate-600">Experience</span>
            </div>
            <p className="text-xl font-semibold text-slate-900">{skillAssessment.yearsOfExperience} years</p>
        </SimpleCard>

        <SimpleCard className="p-5">
            <div className="flex items-center mb-2">
                <Star className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-slate-600">Suggested Domain</span>
            </div>
            <p className="font-semibold text-blue-700">{skillAssessment.autoCategorizedDomain || 'N/A'}</p>
        </SimpleCard>
    </div>
);

const SkillsList = ({ skillAssessment }) => (
    <SimpleCard className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Technical Skills</h3>

        {skillAssessment.technicalSkills && skillAssessment.technicalSkills.length > 0 ? (
            <div className="space-y-6">
                {skillAssessment.technicalSkills.map((skill, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-slate-800">{skill.technology}</h4>
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
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-slate-700 mb-2">Other Skills</h4>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{skillAssessment.otherSkills}</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center py-8 text-slate-500">
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
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-slate-900">Admin Review</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                                borderColor: '#e2e8f0',
                                '&:hover': {
                                    borderColor: '#94a3b8',
                                },
                            }),
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Review Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this assessment..."
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    />
                </div>

                <div className="flex justify-end">
                    <SimpleButton
                        type="submit"
                        disabled={isSubmitting || selectedDomains.length === 0}
                        icon={Send}
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
}) => {
    const handleClear = () => onSearchChange({ target: { value: '' } });

    return (
        <div className={`bg-white border-r border-slate-200 flex flex-col ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-80'}`}>
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Review Queue</h2>
                    <SimpleBadge color="yellow">{pagination.totalItems} Pending</SimpleBadge>
                </div>
                {/* Inline Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder="Search applicants..."
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:outline-none"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading && assessments.length === 0 && (
                    <div className="p-6">
                        <InlineLoader text="Loading..." />
                    </div>
                )}

                {!loading && assessments.length === 0 && (
                    <InlineEmptyState
                        icon={CheckCircle}
                        iconClassName="text-green-500"
                        title="Queue Empty"
                        description="No pending assessments"
                    />
                )}

                {assessments.map((assessment) => (
                    <button
                        key={assessment._id}
                        onClick={() => onSelectAssessment(assessment)}
                        className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 focus:outline-none transition-colors ${selectedAssessment?._id === assessment._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-slate-900">{assessment.applicant.fullName}</p>
                            <span className="text-xs text-slate-500">{formatDateTime(assessment.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <SimpleBadge color="blue">{assessment.autoCategorizedDomain || 'N/A'}</SimpleBadge>
                            <span className="text-slate-600">{assessment.yearsOfExperience} years exp</span>
                        </div>
                    </button>
                ))}
            </div>

            {pagination.totalPages > 1 && (
                <div className="p-3 border-t border-slate-200 flex justify-between items-center">
                    <SimpleButton
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        variant="outline"
                        icon={ChevronLeft}
                    >
                        Previous
                    </SimpleButton>

                    <span className="text-sm text-slate-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <SimpleButton
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        variant="outline"
                        icon={ChevronRight}
                    >
                        Next
                    </SimpleButton>
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
const SkillCategorizationPage = () => {
    const { invalidateSkillAssessments, invalidateDashboard } = useInvalidateAdmin();
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter] = useState('Pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Debounce search input
    const debouncedUpdate = useMemo(() => debounce((value) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
    }, 300), []);

    useEffect(() => { debouncedUpdate(searchTerm); return () => debouncedUpdate.cancel(); }, [searchTerm, debouncedUpdate]);

    const queryParams = useMemo(() => ({
        page: currentPage,
        limit: 15,
        status: statusFilter,
        search: debouncedSearch,
        sortBy: 'createdAt',
        sortOrder: 'asc',
    }), [currentPage, statusFilter, debouncedSearch]);

    const { data, isLoading: loading } = useSkillAssessments(queryParams, {
        keepPreviousData: true,
    });

    const assessments = data?.assessments || [];
    const pagination = {
        currentPage: data?.page || 1,
        totalPages: data?.totalPages || 1,
        totalItems: data?.totalDocs || 0,
    };

    // Auto-select first assessment when data loads and nothing is selected
    useEffect(() => {
        if (!loading && assessments.length > 0 && !selectedAssessment) {
            setSelectedAssessment(assessments[0]);
        }
    }, [loading, assessments, selectedAssessment]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
            setSelectedAssessment(null);
        }
    };

    const handleSelectAssessment = (assessment) => {
        setSelectedAssessment(assessment);
        if (window.innerWidth < 1024) setSidebarCollapsed(true);
    };

    const handleCategorizeComplete = () => {
        setSelectedAssessment(null);
        invalidateSkillAssessments();
        invalidateDashboard();
    };

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="flex h-full bg-[#f5f7fb]">
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
                <Button
                    onClick={toggleSidebar}
                    variant="outline"
                    size="icon"
                    className="absolute top-4 left-4 z-10"
                    aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                >
                    {sidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                </Button>

                <div className="h-full overflow-y-auto p-6">
                    {loading && !selectedAssessment && (
                        <div className="flex items-center justify-center h-full">
                            <InlineLoader text="Loading Assessment..." />
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
                            <InlineEmptyState
                                icon={Briefcase}
                                iconClassName="text-slate-400"
                                title="Select Assessment"
                                description="Choose an applicant from the list to review"
                            />
                        </div>
                    ))}

                    {!loading && assessments.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <InlineEmptyState
                                icon={CheckCircle}
                                iconClassName="text-green-500"
                                title="All Done!"
                                description="No pending assessments to review"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillCategorizationPage;
