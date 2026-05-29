import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
    Eye, Link2, Users, Clipboard, Search, ChevronDown,
    Plus, CheckCircle, Clock, Trash2, Inbox, BarChart3, X, Check, Loader2, CalendarPlus, UserPlus,
    Upload, Download, AlertTriangle, FileText
} from 'lucide-react';
import { deletePublicBookingLink, addSlotsToPublicBooking, getPublicBookingDetails, adminManualAddStudentBooking, adminBulkManualAddStudentBookings } from '@/api/admin.api';
import { usePublicBookings, useBookingSlots, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime, formatDate, formatTime } from '@/utils/formatters';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };
const ACCENT = '#C0392B';

// ── Add Slots Modal ──
const AddSlotsModal = ({ isOpen, onClose, publicBookingId, onSuccess }) => {
    const { showSuccess, showError } = useAlert();
    const { data: slots = [], isLoading } = useBookingSlots({});
    const [selectedSlots, setSelectedSlots] = useState({});
    const [saving, setSaving] = useState(false);

    const handleSlotToggle = (row, slot) => {
        setSelectedSlots(prev => {
            const next = { ...prev };
            const entry = next[row.submissionId];
            if (!entry) {
                next[row.submissionId] = { interviewerId: row.interviewerId, date: row.interviewDate, slots: [{ startTime: slot.startTime, endTime: slot.endTime }] };
            } else {
                const idx = entry.slots.findIndex(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                if (idx > -1) {
                    const newSlots = entry.slots.filter((_, i) => i !== idx);
                    if (!newSlots.length) delete next[row.submissionId];
                    else next[row.submissionId] = { ...entry, slots: newSlots };
                } else {
                    next[row.submissionId] = { ...entry, slots: [...entry.slots, { startTime: slot.startTime, endTime: slot.endTime }] };
                }
            }
            return next;
        });
    };

    const selectedCount = Object.values(selectedSlots).reduce((c, item) => c + item.slots.length, 0);

    const handleSave = async () => {
        if (selectedCount === 0) return;
        setSaving(true);
        try {
            await addSlotsToPublicBooking(publicBookingId, { selectedSlots: Object.values(selectedSlots) });
            showSuccess(`${selectedCount} slot(s) added!`);
            setSelectedSlots({});
            onSuccess();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to add slots.');
        } finally { setSaving(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-border shadow-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h2 style={DISPLAY} className="text-[18px] font-semibold text-foreground tracking-tight">Add slots to public link</h2>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Select available slots to append</p>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40"><Loader size="md" /></div>
                    ) : slots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-border bg-white text-muted-foreground/70 mb-3">
                                <Inbox className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <p className="text-[13px] font-semibold text-foreground">No available slots</p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">Create booking requests first to collect availability</p>
                        </div>
                    ) : (
                        <table className="min-w-full text-[13px]">
                            <thead>
                                <tr>
                                    <th className="sticky top-0 px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Interviewer</th>
                                    <th className="sticky top-0 px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10 w-32">Date</th>
                                    <th className="sticky top-0 px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Time slots</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {slots.map(row => {
                                    const entry = selectedSlots[row.submissionId];
                                    return (
                                        <tr key={row.submissionId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 align-middle">
                                                <p className="text-[12.5px] font-semibold text-foreground">{row.fullName}</p>
                                                <p className="text-[11.5px] text-muted-foreground">{row.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-[12.5px] text-foreground/90 align-middle">{formatDate(row.interviewDate)}</td>
                                            <td className="px-4 py-3 align-middle">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {row.timeSlots.map((slot, idx) => {
                                                        const isSelected = entry?.slots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                                                        return (
                                                            <button key={idx} type="button" onClick={() => handleSlotToggle(row, slot)}
                                                                className={cn('inline-flex items-center gap-1 h-7 px-2.5 text-[11.5px] font-semibold rounded-md border transition-colors',
                                                                    isSelected ? 'bg-primary text-white border-primary' : 'bg-white text-foreground/90 border-border hover:border-primary hover:text-foreground')}>
                                                                {isSelected && <Check className="h-3 w-3" aria-hidden="true" />}
                                                                {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30 shrink-0 rounded-b-2xl">
                    <span className="text-[12.5px] text-foreground/80"><span className="font-semibold text-foreground">{selectedCount}</span> slot{selectedCount === 1 ? '' : 's'} selected</span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="h-9 px-4 text-[12.5px] font-semibold text-foreground/90 border border-border rounded-md hover:border-primary hover:text-foreground transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={selectedCount === 0 || saving}
                            className="inline-flex items-center gap-1.5 h-9 px-5 text-[13px] font-semibold text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-40 transition-colors">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                            Add {selectedCount > 0 ? selectedCount : ''} slot{selectedCount === 1 ? '' : 's'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Stat chip ──
const StatChip = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-white px-3 h-9">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span style={DISPLAY} className="text-[15px] font-semibold text-foreground leading-none tracking-tight">{value}</span>
        <span className="text-[11.5px] text-muted-foreground">{label}</span>
    </div>
);

// ── CSV helpers (mirror the Authorize Students page conventions) ──────────
const BULK_EMAIL_RE = /\S+@\S+\.\S+/i;
const bulkHeaderAliases = {
    'hiring name': 'hiringName', 'hiring_name': 'hiringName', 'hiring': 'hiringName',
    domain: 'domain', 'user id': 'userId', userid: 'userId', 'user_id': 'userId',
    'full name': 'fullName', fullname: 'fullName', 'full_name': 'fullName',
    name: 'fullName',
    email: 'email', 'email id': 'email', 'email_id': 'email',
    mobile: 'mobileNumber', 'mobile number': 'mobileNumber', phone: 'mobileNumber',
    resume: 'resumeLink', 'resume link': 'resumeLink', 'resume_link': 'resumeLink',
    'interview id': 'interviewId', interviewid: 'interviewId',
};
const bulkMapHeaders = (headers) => headers.map(h => bulkHeaderAliases[String(h || '').trim().toLowerCase()] || null);
const bulkObjectFromRow = (mapped, row) => {
    const obj = {};
    mapped.forEach((key, idx) => { if (key) obj[key] = row[idx]; });
    return obj;
};
const bulkValidateStudent = (raw) => {
    const s = {
        hiringName: String(raw.hiringName || '').trim(),
        domain: String(raw.domain || '').trim(),
        userId: String(raw.userId || '').trim(),
        fullName: String(raw.fullName || '').trim(),
        email: String(raw.email || '').trim().toLowerCase(),
        mobileNumber: String(raw.mobileNumber || '').trim(),
        resumeLink: String(raw.resumeLink || '').trim(),
        interviewId: String(raw.interviewId || '').trim(),
    };
    let _isValid = true, _error = null;
    if (!s.email || !BULK_EMAIL_RE.test(s.email)) { _isValid = false; _error = 'Invalid or missing email.'; }
    else if (!s.fullName) { _isValid = false; _error = 'Full name is required.'; }
    return { ...s, _isValid, _error };
};
const bulkDedupeByEmail = (list) => {
    const seen = new Set(), out = [];
    for (const s of list) {
        const k = (s.email || '').toLowerCase();
        if (!k || seen.has(k)) continue;
        seen.add(k); out.push(s);
    }
    return out;
};

// ── Manual Add Student Booking Modal ──────────────────────────────────────
// Use case: admin gets student details directly (phone / email / walk-in) and
// needs to book a slot on a public link without the student visiting it.
// Two tabs:
//   1. Single — fill the student data + pick an exact slot
//   2. Bulk CSV — upload many students, auto-assign each to the next free slot
const ManualAddStudentBookingModal = ({ isOpen, onClose, publicBookingId, publicId, onSuccess }) => {
    const { showSuccess, showError } = useAlert();
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState('single'); // 'single' | 'bulk'

    // ── Bulk-mode state ──
    const fileInputRef = useRef(null);
    const [bulkStudents, setBulkStudents] = useState([]);
    const [bulkHostEmail, setBulkHostEmail] = useState('');
    const [bulkEventTitleTpl, setBulkEventTitleTpl] = useState('{domain} || {name}');
    const [bulkResult, setBulkResult] = useState(null); // server response after submit

    const [form, setForm] = useState({
        studentName: '',
        studentEmail: '',
        mobileNumber: '',
        userId: '',
        hiringName: '',
        interviewId: '',
        domain: '',
        resumeLink: '',
        hostEmail: '',
        eventTitle: '',
        date: '',
        slotKey: '', // "startTime|endTime|interviewerId"
    });

    // Reset form + fetch link details whenever the modal opens for a new link
    useEffect(() => {
        if (!isOpen) return;
        setDetails(null);
        setMode('single');
        setForm({
            studentName: '', studentEmail: '', mobileNumber: '', userId: '', hiringName: '',
            interviewId: '', domain: '', resumeLink: '', hostEmail: '', eventTitle: '',
            date: '', slotKey: '',
        });
        setBulkStudents([]);
        setBulkHostEmail('');
        setBulkEventTitleTpl('{domain} || {name}');
        setBulkResult(null);
        if (!publicBookingId) return;
        setLoadingDetails(true);
        getPublicBookingDetails(publicBookingId)
            .then(res => setDetails(res.data.data))
            .catch(() => showError('Failed to load slot details for this link.'))
            .finally(() => setLoadingDetails(false));
    }, [isOpen, publicBookingId, showError]);

    // Available free slot count for the bulk-mode "fits N more" message
    const freeSlotCount = useMemo(() => {
        if (!details) return 0;
        return details.interviewerSlots.reduce(
            (acc, s) => acc + (s.timeSlots || []).filter(t => !t.bookedBy).length, 0
        );
    }, [details]);

    // ── Bulk: file parse ──
    const handleBulkFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        const isCsv = /\.csv$/i.test(file.name);
        reader.onload = (evt) => {
            try {
                if (isCsv) {
                    const text = typeof evt.target.result === 'string'
                        ? evt.target.result
                        : new TextDecoder().decode(evt.target.result);
                    const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
                    if (!lines.length) { showError('CSV is empty.'); return; }
                    const first = lines[0].split(/\t|,/).map(c => c.trim());
                    const headerMap = bulkMapHeaders(first);
                    const hasHeader = headerMap.some(k => k);
                    const dataRows = (hasHeader ? lines.slice(1) : lines).map(r => r.split(/\t|,/));
                    const parsed = dataRows.map(cols => hasHeader
                        ? bulkObjectFromRow(headerMap, cols)
                        : { hiringName: cols[0], domain: cols[1], userId: cols[2], fullName: cols[3], email: cols[4], mobileNumber: cols[5], resumeLink: cols[6] });
                    setBulkStudents(bulkDedupeByEmail(parsed.map(bulkValidateStudent)));
                } else {
                    const wb = XLSX.read(evt.target.result, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const sheet = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
                    if (!sheet?.length) { showError('Sheet is empty.'); return; }
                    const headers = (sheet[0] || []).map(h => (h ?? '').toString().trim());
                    const headerMap = bulkMapHeaders(headers);
                    const hasHeader = headerMap.some(k => k);
                    const dataRows = hasHeader ? sheet.slice(1) : sheet;
                    const parsed = dataRows
                        .filter(row => row.some(c => (c ?? '').toString().trim()))
                        .map(row => hasHeader
                            ? bulkObjectFromRow(headerMap, row)
                            : { hiringName: row[0], domain: row[1], userId: row[2], fullName: row[3], email: row[4], mobileNumber: row[5], resumeLink: row[6] });
                    setBulkStudents(bulkDedupeByEmail(parsed.map(bulkValidateStudent)));
                }
                setBulkResult(null);
            } catch {
                showError('Unable to parse file.');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = null;
            }
        };
        isCsv ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
    };

    const handleDownloadTemplate = () => {
        const cols = ['Hiring Name', 'Domain', 'User ID', 'Full Name', 'Email', 'Mobile', 'Resume Link'];
        const csv = `${cols.join(',')}\nAcme Corp,MERN,USER123,Jane Doe,jane@example.com,+91 9876543210,https://example.com/resume.pdf\n`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'manual_book_students_template.csv';
        a.click();
    };

    const validBulk = useMemo(() => bulkStudents.filter(s => s._isValid), [bulkStudents]);
    const invalidBulk = useMemo(() => bulkStudents.filter(s => !s._isValid), [bulkStudents]);

    const handleBulkSubmit = async () => {
        if (!validBulk.length) { showError('No valid students to book.'); return; }
        if (!bulkHostEmail.trim() || !bulkEventTitleTpl.trim()) { showError('Host email and event title template are required.'); return; }
        if (validBulk.length > freeSlotCount) {
            showError(`Only ${freeSlotCount} free slot(s) on this link — trim the list or add more slots first.`);
            return;
        }
        setSaving(true);
        setBulkResult(null);
        try {
            const payload = {
                hostEmail: bulkHostEmail.trim(),
                eventTitle: bulkEventTitleTpl.trim(),
                students: validBulk.map(({ _isValid, _error, ...rest }) => rest),
            };
            const res = await adminBulkManualAddStudentBookings(publicBookingId, payload);
            const data = res.data?.data || {};
            setBulkResult(data);
            if (data.created > 0) {
                showSuccess(`${data.created} student(s) booked${data.failed ? `, ${data.failed} failed` : ''}.`);
                onSuccess?.();
            } else if (data.failed) {
                showError(`Failed to book any students. ${data.failed} row(s) failed.`);
            }
        } catch (err) {
            showError(err.response?.data?.message || 'Bulk booking failed.');
        } finally {
            setSaving(false);
        }
    };

    // Build the list of dates that have any unbooked slot
    const availableDates = useMemo(() => {
        if (!details) return [];
        const seen = new Set();
        const out = [];
        details.interviewerSlots.forEach(s => {
            const hasFree = (s.timeSlots || []).some(t => !t.bookedBy);
            if (!hasFree) return;
            const key = String(s.date).split('T')[0];
            if (seen.has(key)) return;
            seen.add(key);
            out.push({ value: key, label: formatDate(s.date) });
        });
        return out.sort((a, b) => a.value.localeCompare(b.value));
    }, [details]);

    // Build the list of (time + interviewer) options for the chosen date
    const availableSlotOptions = useMemo(() => {
        if (!details || !form.date) return [];
        const opts = [];
        details.interviewerSlots.forEach(s => {
            if (!String(s.date).startsWith(form.date)) return;
            const interviewerId = s.interviewer?._id || s.interviewer;
            const interviewerName = s.interviewer?.user
                ? `${s.interviewer.user.firstName || ''} ${s.interviewer.user.lastName || ''}`.trim()
                : 'Interviewer';
            (s.timeSlots || []).forEach(t => {
                if (t.bookedBy) return;
                opts.push({
                    value: `${t.startTime}|${t.endTime}|${interviewerId}`,
                    label: `${formatTime(t.startTime)} – ${formatTime(t.endTime)} · ${interviewerName}`,
                });
            });
        });
        return opts;
    }, [details, form.date]);

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.studentName || !form.studentEmail) { showError('Student name and email are required.'); return; }
        if (!form.hostEmail || !form.eventTitle) { showError('Host email and event title are required.'); return; }
        if (!form.date || !form.slotKey) { showError('Pick a date and a slot.'); return; }
        const [startTime, endTime, interviewerId] = form.slotKey.split('|');
        setSaving(true);
        try {
            await adminManualAddStudentBooking(publicBookingId, {
                studentName: form.studentName.trim(),
                studentEmail: form.studentEmail.trim().toLowerCase(),
                mobileNumber: form.mobileNumber.trim(),
                userId: form.userId.trim(),
                hiringName: form.hiringName.trim(),
                interviewId: form.interviewId.trim(),
                domain: form.domain.trim(),
                resumeLink: form.resumeLink.trim(),
                hostEmail: form.hostEmail.trim(),
                eventTitle: form.eventTitle.trim(),
                interviewerId,
                date: form.date,
                slot: { startTime, endTime },
            });
            showSuccess('Student booked successfully.');
            onSuccess?.();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to book student.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = 'w-full h-9 px-3 bg-white border border-border rounded-md text-[13px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-lg border border-border shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h2 style={DISPLAY} className="text-[18px] font-semibold text-foreground tracking-tight">Manually add student</h2>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                            Public link <span className="font-mono">{publicId}</span> — {mode === 'single' ? 'admin enters one student + picks the slot' : 'upload a CSV/Excel to bulk-book many students'}
                        </p>
                    </div>
                    <button aria-label="Close" type="button" onClick={onClose} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Mode tabs */}
                <div className="flex border-b border-border shrink-0">
                    <button type="button" onClick={() => setMode('single')}
                        className={cn(
                            'flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-semibold border-b-2 transition-colors',
                            mode === 'single' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}>
                        <UserPlus className="h-3.5 w-3.5" /> Single student
                    </button>
                    <button type="button" onClick={() => setMode('bulk')}
                        className={cn(
                            'flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-semibold border-b-2 transition-colors',
                            mode === 'bulk' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}>
                        <Upload className="h-3.5 w-3.5" /> Bulk CSV upload
                    </button>
                </div>

                {/* ── Bulk CSV body ── */}
                {mode === 'bulk' && (
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                        {loadingDetails ? (
                            <div className="flex items-center justify-center py-10"><Loader size="md" /></div>
                        ) : (
                            <>
                                {/* Top row — host email + event title template + free-slot capacity */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Host email *</label>
                                        <input type="email" className={inputClass} value={bulkHostEmail} onChange={(e) => setBulkHostEmail(e.target.value)} placeholder="host@nxtwave.in" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Event title template *</label>
                                        <input className={inputClass} value={bulkEventTitleTpl} onChange={(e) => setBulkEventTitleTpl(e.target.value)} placeholder="{domain} || {name}" />
                                    </div>
                                </div>
                                <p className="text-[11.5px] text-muted-foreground">
                                    <span className="font-semibold text-foreground">{freeSlotCount}</span> free slot(s) on this link.
                                    {bulkStudents.length > 0 && (
                                        <> Pending bulk: <span className="font-semibold text-foreground">{validBulk.length}</span> valid · {invalidBulk.length > 0 && <span className="text-red-600 font-semibold">{invalidBulk.length} invalid · </span>}</>
                                    )}
                                    Use <span className="font-mono text-foreground/80">{'{name}'}</span> and <span className="font-mono text-foreground/80">{'{domain}'}</span> as placeholders in the title template.
                                </p>

                                {/* Upload zone */}
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border hover:border-primary/60 rounded-md cursor-pointer transition-colors flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-9 w-9 rounded-md bg-primary/10 text-primary items-center justify-center">
                                            <Upload className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-[12.5px] font-semibold text-foreground">Click to upload CSV or Excel</p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">Columns: Hiring Name, Domain, User ID, Full Name, Email, Mobile, Resume Link</p>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleBulkFile} accept=".csv,.xlsx,.xls,.xlsm" className="hidden" />
                                </div>
                                <button type="button" onClick={handleDownloadTemplate}
                                    className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:text-primary/80 transition-colors">
                                    <Download className="h-3 w-3" /> Download CSV template
                                </button>

                                {/* Preview table */}
                                {bulkStudents.length > 0 && (
                                    <div className="border border-border rounded-md overflow-hidden">
                                        <div className="max-h-64 overflow-auto">
                                            <table className="min-w-full text-[12px]">
                                                <thead className="bg-muted/40">
                                                    <tr>
                                                        <th className="w-8 px-2 py-2 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]"></th>
                                                        <th className="px-2 py-2 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Name</th>
                                                        <th className="px-2 py-2 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Email</th>
                                                        <th className="px-2 py-2 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Domain</th>
                                                        <th className="px-2 py-2 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Mobile</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border bg-white">
                                                    {bulkStudents.map((s, idx) => (
                                                        <tr key={s.email || idx} className={cn(!s._isValid && 'bg-red-50/40')}>
                                                            <td className="px-2 py-1.5 text-center">
                                                                {s._isValid
                                                                    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                                                                    : <AlertTriangle className="h-3.5 w-3.5 text-red-500 mx-auto" title={s._error} />}
                                                            </td>
                                                            <td className="px-2 py-1.5 text-foreground/90">{s.fullName || '—'}</td>
                                                            <td className="px-2 py-1.5 text-muted-foreground">{s.email || '—'}</td>
                                                            <td className="px-2 py-1.5 text-foreground/80">{s.domain || '—'}</td>
                                                            <td className="px-2 py-1.5 text-foreground/80">{s.mobileNumber || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Server result summary */}
                                {bulkResult && (
                                    <div className="rounded-md border border-border bg-muted/30 p-3 text-[12px]">
                                        <p className="font-semibold text-foreground mb-1">Result</p>
                                        <p className="text-muted-foreground">
                                            <span className="text-emerald-700 font-semibold">{bulkResult.created} booked</span>
                                            {bulkResult.failed > 0 && <> · <span className="text-red-600 font-semibold">{bulkResult.failed} failed</span></>}
                                        </p>
                                        {bulkResult.results?.some(r => r.status === 'failed') && (
                                            <ul className="mt-2 space-y-0.5 max-h-32 overflow-auto">
                                                {bulkResult.results.filter(r => r.status === 'failed').map(r => (
                                                    <li key={`${r.row}-${r.email}`} className="text-[11.5px] text-red-700">
                                                        Row {r.row} ({r.email || '—'}): {r.reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── Single-student body (existing form) ── */}
                {mode === 'single' && (
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {loadingDetails ? (
                        <div className="flex items-center justify-center py-10"><Loader size="md" /></div>
                    ) : (
                        <>
                            {/* Student details */}
                            <div>
                                <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-2">Student</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Full name *</label>
                                        <input className={inputClass} value={form.studentName} onChange={set('studentName')} placeholder="Jane Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Email *</label>
                                        <input type="email" className={inputClass} value={form.studentEmail} onChange={set('studentEmail')} placeholder="jane@nxtwave.in" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Mobile number</label>
                                        <input className={inputClass} value={form.mobileNumber} onChange={set('mobileNumber')} placeholder="9876543210" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">User ID</label>
                                        <input className={inputClass} value={form.userId} onChange={set('userId')} placeholder="Student platform ID" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Hiring name</label>
                                        <input className={inputClass} value={form.hiringName} onChange={set('hiringName')} placeholder="e.g. NIAT, Telugu Govt." />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Interview ID</label>
                                        <input className={inputClass} value={form.interviewId} onChange={set('interviewId')} placeholder="Optional" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Domain</label>
                                        <input className={inputClass} value={form.domain} onChange={set('domain')} placeholder="e.g. MERN, JAVA" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Resume link</label>
                                        <input className={inputClass} value={form.resumeLink} onChange={set('resumeLink')} placeholder="https://..." />
                                    </div>
                                </div>
                            </div>

                            {/* Meet details */}
                            <div>
                                <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-2">Meet details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Host email *</label>
                                        <input type="email" className={inputClass} value={form.hostEmail} onChange={set('hostEmail')} placeholder="host@nxtwave.in" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-foreground mb-1">Event title *</label>
                                        <input className={inputClass} value={form.eventTitle} onChange={set('eventTitle')} placeholder="e.g. MERN || Jane Doe" />
                                    </div>
                                </div>
                            </div>

                            {/* Slot pick */}
                            <div>
                                <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-2">Pick slot</p>
                                {availableDates.length === 0 ? (
                                    <p className="text-[12.5px] text-muted-foreground border border-dashed border-border rounded-md px-3 py-3">
                                        No free slots remain on this link. Add more slots first.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-foreground mb-1">Date *</label>
                                            <select className={inputClass} value={form.date} onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value, slotKey: '' }))}>
                                                <option value="">Select a date</option>
                                                {availableDates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-foreground mb-1">Time &amp; interviewer *</label>
                                            <select className={inputClass} value={form.slotKey} onChange={set('slotKey')} disabled={!form.date}>
                                                <option value="">{form.date ? 'Select a slot' : 'Pick a date first'}</option>
                                                {availableSlotOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </form>
                )}

                <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-border bg-muted/30 shrink-0">
                    <button type="button" onClick={onClose} className="h-9 px-4 text-[12.5px] font-semibold text-foreground border border-border rounded-md bg-white hover:bg-muted transition-colors">
                        {bulkResult ? 'Close' : 'Cancel'}
                    </button>
                    {mode === 'single' ? (
                        <button type="button" onClick={handleSubmit} disabled={saving || loadingDetails} className="h-9 px-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Book student
                        </button>
                    ) : (
                        <button type="button" onClick={handleBulkSubmit} disabled={saving || loadingDetails || validBulk.length === 0}
                            className="h-9 px-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Book {validBulk.length || ''} student{validBulk.length === 1 ? '' : 's'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const StudentBookings = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const { data: publicBookings = [], isLoading: loading } = usePublicBookings();
    const { invalidatePublicBookings, invalidateStudentPipeline } = useInvalidateAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [creatorFilter, setCreatorFilter] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
    const [addSlotsModal, setAddSlotsModal] = useState({ isOpen: false, bookingId: null });
    const [manualBookModal, setManualBookModal] = useState({ isOpen: false, bookingId: null, publicId: null });

    const creatorOptions = useMemo(() => {
        const creators = new Map();
        publicBookings.forEach(b => {
            if (b.createdBy) creators.set(b.createdBy._id, `${b.createdBy.firstName} ${b.createdBy.lastName || ''}`.trim());
        });
        return Array.from(creators, ([value, label]) => ({ value, label }));
    }, [publicBookings]);

    const filtered = useMemo(() => {
        let items = [...publicBookings];
        if (searchTerm) items = items.filter(b => b.publicId.toLowerCase().includes(searchTerm.toLowerCase()));
        if (creatorFilter) items = items.filter(b => b.createdBy?._id === creatorFilter);
        switch (sortOption) {
            case 'oldest': items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case 'most_students': items.sort((a, b) => (b.allowedStudents?.length || 0) - (a.allowedStudents?.length || 0)); break;
            default: items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return items;
    }, [publicBookings, searchTerm, sortOption, creatorFilter]);

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return;
        try { await deletePublicBookingLink(deleteDialog.id); showSuccess('Link deleted!'); invalidatePublicBookings(); }
        catch { showError("Failed to delete."); }
        finally { setDeleteDialog({ isOpen: false, id: null }); }
    };

    // Stats
    const totalStudents = useMemo(() => publicBookings.reduce((s, b) => s + (b.allowedStudents?.length || 0), 0), [publicBookings]);
    const totalBooked = useMemo(() => publicBookings.reduce((s, b) => s + (b.bookedCount || 0), 0), [publicBookings]);

    const hasFilters = !!(searchTerm || creatorFilter);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>;

    return (
        <div className="h-full flex flex-col bg-card overflow-hidden">
            {/* Hero — title on the left, search + filters + CTA on the right in one row */}
            <section className="border-b border-border bg-card px-5 lg:px-6 pt-3 pb-3 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 style={DISPLAY} className="text-[22px] sm:text-[26px] font-semibold text-foreground tracking-tight leading-none">
                            Public links
                        </h1>
                        <p className="mt-1 text-[12.5px] text-muted-foreground">
                            {publicBookings.length} link{publicBookings.length === 1 ? '' : 's'} · {totalBooked} student{totalBooked === 1 ? '' : 's'} booked so far
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by public ID"
                                className="w-full pl-10 pr-3 h-9 bg-white border border-border rounded-md text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors" />
                        </div>
                        <div className="relative">
                            <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}
                                className="appearance-none h-9 pl-4 pr-9 bg-white border border-border rounded-md text-[13px] text-foreground/90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors">
                                <option value="">All creators</option>
                                {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" aria-hidden="true" />
                        </div>
                        <div className="relative">
                            <select value={sortOption} onChange={e => setSortOption(e.target.value)}
                                className="appearance-none h-9 pl-4 pr-9 bg-white border border-border rounded-md text-[13px] text-foreground/90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors">
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="most_students">Most students</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" aria-hidden="true" />
                        </div>
                        {hasFilters && (
                            <button onClick={() => { setSearchTerm(''); setCreatorFilter(''); }}
                                className="text-[12px] text-muted-foreground hover:text-foreground font-medium px-3 h-8 rounded-md hover:bg-muted transition-colors">
                                Clear
                            </button>
                        )}
                        <button onClick={() => navigate('/admin/bookings/booking-slots')}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary/90">
                            <Plus className="h-4 w-4" aria-hidden="true" /> New link
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <StatChip label="Links" value={publicBookings.length} icon={Link2} />
                    <StatChip label="Students" value={totalStudents} icon={Users} />
                    <StatChip label="Booked" value={totalBooked} icon={CheckCircle} />
                </div>
            </section>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-border bg-white text-muted-foreground/70 mb-4">
                            <Link2 className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <h3 style={DISPLAY} className="text-[20px] font-semibold text-foreground tracking-tight">
                            {publicBookings.length === 0 ? 'No public links yet' : 'No links match'}
                        </h3>
                        <p className="mt-1 text-[13px] text-muted-foreground max-w-sm">
                            {publicBookings.length === 0 ? 'Create one from Booking slots to share with students.' : 'Try clearing the filters to see all links.'}
                        </p>
                    </div>
                ) : (
                    <div className="px-5 lg:px-6 py-3">
                        <div className="bg-white rounded-lg border border-border overflow-hidden">
                            <table className="min-w-full text-[13px]">
                                <thead>
                                    <tr>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Created</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Public ID</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Interviewers</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Students</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Booked</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Pending</th>
                                        <th className="sticky top-0 w-40 px-5 py-3 bg-muted/40 backdrop-blur border-b border-border z-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map(booking => {
                                        const uniqueInterviewers = [...new Set(
                                            booking.interviewerSlots?.map(s => s.interviewer?.user ? `${s.interviewer.user.firstName} ${s.interviewer.user.lastName}`.trim() : null).filter(Boolean)
                                        )];
                                        const url = `${window.location.origin}/book/${booking.publicId}`;
                                        const creatorName = booking.createdBy ? `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim() : '—';

                                        return (
                                            <tr key={booking._id} className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/admin/public-bookings/${booking._id}/evaluation`)}>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <p className="text-[12.5px] font-semibold text-foreground">{formatDateTime(booking.createdAt)}</p>
                                                    <p className="text-[11.5px] text-muted-foreground mt-0.5">by {creatorName}</p>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[11.5px] font-semibold text-foreground border border-border bg-muted/40 px-2 py-0.5 rounded-md">{booking.publicId}</span>
                                                        <button aria-label="Copy link" onClick={() => { navigator.clipboard.writeText(url); showSuccess("Copied!"); }}
                                                            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Copy link">
                                                            <Clipboard className="h-3 w-3" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className="text-[12.5px] text-foreground/90" title={uniqueInterviewers.join(', ')}>{uniqueInterviewers.length}</span>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className="text-[12.5px] font-semibold text-foreground">{booking.allowedStudents?.length || 0}</span>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-emerald-200 bg-emerald-50/60 text-emerald-700 text-[11.5px] font-semibold">
                                                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> {booking.bookedCount || 0}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-amber-200 bg-amber-50/60 text-amber-800 text-[11.5px] font-semibold">
                                                        <Clock className="h-3 w-3" aria-hidden="true" /> {booking.pendingCount || 0}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button aria-label="Add slots" onClick={() => setAddSlotsModal({ isOpen: true, bookingId: booking._id })}
                                                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Add slots">
                                                            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Manually add student" onClick={() => setManualBookModal({ isOpen: true, bookingId: booking._id, publicId: booking.publicId })}
                                                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Manually add student">
                                                            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Evaluations" onClick={() => navigate(`/admin/public-bookings/${booking._id}/evaluation`)}
                                                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Evaluations">
                                                            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Track" onClick={() => navigate(`/admin/public-bookings/${booking._id}/tracking`)}
                                                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Track">
                                                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Authorize" onClick={() => navigate(`/admin/public-bookings/${booking._id}/authorize`)}
                                                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Authorize">
                                                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Delete" onClick={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {filtered.length > 0 && (
                <div className="px-6 lg:px-8 py-3 border-t border-border bg-white shrink-0">
                    <p className="text-[12px] text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold text-foreground">{publicBookings.length}</span> links</p>
                </div>
            )}

            <AddSlotsModal
                isOpen={addSlotsModal.isOpen}
                onClose={() => setAddSlotsModal({ isOpen: false, bookingId: null })}
                publicBookingId={addSlotsModal.bookingId}
                onSuccess={() => invalidatePublicBookings()}
            />

            <ManualAddStudentBookingModal
                isOpen={manualBookModal.isOpen}
                onClose={() => setManualBookModal({ isOpen: false, bookingId: null, publicId: null })}
                publicBookingId={manualBookModal.bookingId}
                publicId={manualBookModal.publicId}
                onSuccess={() => {
                    invalidatePublicBookings();
                    invalidateStudentPipeline?.();
                }}
            />

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDeleteConfirm} title="Delete public link"
                message="All associated student invitations will be lost. This action is permanent." confirmVariant="danger" />
        </div>
    );
};

export default StudentBookings;
