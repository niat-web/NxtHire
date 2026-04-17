// client/src/pages/admin/AuthorizeStudentsPage.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAlert } from '@/hooks/useAlert';
import { updatePublicBookingLink } from '@/api/admin.api';
import { usePublicBookingDetails, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import {
  Upload, Trash2, Send, ArrowLeft, CheckCircle, AlertTriangle,
  Info, Search, Download, FileText, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Loader from '@/components/common/Loader';

// ── Helpers ──
const EMAIL_RE = /\S+@\S+\.\S+/i;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
const MOBILE_RE = /^[0-9+\-\s()]{7,15}$/;
const trimLower = (s) => (s || '').trim().toLowerCase();
const sanitize = (s) => (typeof s === 'string' ? s.trim() : '');

const columnsHelp = ['Hiring Name', 'Domain', 'User ID', 'Full Name', 'Email', 'Mobile', 'Resume Link'];

const headerAliases = {
  'hiring name': 'hiringName', 'hiring_name': 'hiringName', 'hiring': 'hiringName',
  domain: 'domain', 'user id': 'userId', userid: 'userId', 'user_id': 'userId',
  'full name': 'fullName', fullname: 'fullName', 'full_name': 'fullName',
  email: 'email', 'email id': 'email', 'email_id': 'email',
  mobile: 'mobileNumber', 'mobile number': 'mobileNumber', phone: 'mobileNumber',
  resume: 'resumeLink', 'resume link': 'resumeLink', 'resume_link': 'resumeLink',
};

function validateStudent(raw) {
  const student = { hiringName: sanitize(raw.hiringName), domain: sanitize(raw.domain), userId: sanitize(raw.userId), fullName: sanitize(raw.fullName), email: trimLower(raw.email), mobileNumber: sanitize(raw.mobileNumber), resumeLink: sanitize(raw.resumeLink) };
  let _isValid = true, _error = null;
  if (!student.email || !EMAIL_RE.test(student.email)) { _isValid = false; _error = 'Invalid or missing email.'; }
  else if (!student.fullName) { _isValid = false; _error = 'Full Name is required.'; }
  else if (student.mobileNumber && !MOBILE_RE.test(student.mobileNumber)) { _isValid = false; _error = 'Invalid mobile format.'; }
  else if (student.resumeLink && !URL_RE.test(student.resumeLink)) { _isValid = false; _error = 'Resume link must be a valid URL.'; }
  return { ...student, _isValid, _error };
}

function mapHeaders(headers = []) { return headers.map((h) => headerAliases[trimLower(h)] || null); }
function objectFromRow(mappedHeaders, row) { const obj = {}; mappedHeaders.forEach((key, idx) => { if (key) obj[key] = row[idx]; }); return obj; }
function dedupeByEmail(list) { const seen = new Set(), out = []; for (const s of list) { const email = trimLower(s.email); if (!email || seen.has(email)) continue; seen.add(email); out.push(s); } return out; }

const AuthorizeStudentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const { data: bookingDetails, isLoading: loading } = usePublicBookingDetails(id);
  const { invalidatePublicBookings } = useInvalidateAdmin();
  const [isSaving, setIsSaving] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [students, setStudents] = useState([]);
  const [showInvalidOnly, setShowInvalidOnly] = useState(false);
  const [q, setQ] = useState('');
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'

  const processText = useCallback((text) => {
    if (!text) { setStudents([]); setPastedText(''); return; }
    const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
    if (!lines.length) { setStudents([]); setPastedText(text); return; }
    const first = lines[0].split(/\t|,/).map(c => c.trim());
    const headerMap = mapHeaders(first);
    const hasHeader = headerMap.some(k => k);
    const rows = hasHeader ? lines.slice(1) : lines;
    const parsed = rows.map(row => row.split(/\t|,/)).map(cols => hasHeader ? objectFromRow(headerMap, cols) : { hiringName: cols[0], domain: cols[1], userId: cols[2], fullName: cols[3], email: cols[4], mobileNumber: cols[5], resumeLink: cols[6] });
    setStudents(dedupeByEmail(parsed.map(validateStudent)));
    setPastedText(text);
  }, []);

  const processWorkbook = useCallback((wb) => {
    const ws = wb.Sheets[wb.SheetNames[0]];
    const sheet = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
    if (!sheet?.length) { showError('The uploaded sheet is empty.'); return; }
    const headers = (sheet[0] || []).map(h => (h ?? '').toString().trim());
    const headerMap = mapHeaders(headers);
    const hasHeader = headerMap.some(k => k);
    const dataRows = hasHeader ? sheet.slice(1) : sheet;
    const parsed = dataRows.filter(row => row.some(c => (c ?? '').toString().trim())).map(row => hasHeader ? objectFromRow(headerMap, row) : { hiringName: row[0], domain: row[1], userId: row[2], fullName: row[3], email: row[4], mobileNumber: row[5], resumeLink: row[6] });
    setStudents(dedupeByEmail(parsed.map(validateStudent)));
    setPastedText('');
  }, [showError]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const isCsv = /\.csv$/i.test(file.name);
    reader.onload = (evt) => {
      try { isCsv ? processText(typeof evt.target.result === 'string' ? evt.target.result : new TextDecoder().decode(evt.target.result)) : processWorkbook(XLSX.read(evt.target.result, { type: 'array' })); }
      catch { showError('Unable to parse file.'); }
      finally { if (fileInputRef.current) fileInputRef.current.value = null; }
    };
    isCsv ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = e => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = e => { prevent(e); const file = e.dataTransfer.files?.[0]; if (file) handleFileChange({ target: { files: [file] } }); el.classList.remove('ring-2', 'ring-blue-400'); };
    const onEnter = e => { prevent(e); el.classList.add('ring-2', 'ring-blue-400'); };
    const onLeave = e => { prevent(e); el.classList.remove('ring-2', 'ring-blue-400'); };
    el.addEventListener('dragenter', onEnter); el.addEventListener('dragleave', onLeave);
    el.addEventListener('dragover', prevent); el.addEventListener('drop', onDrop);
    return () => { el.removeEventListener('dragenter', onEnter); el.removeEventListener('dragleave', onLeave); el.removeEventListener('dragover', prevent); el.removeEventListener('drop', onDrop); };
  }, [handleFileChange]);

  const handleClear = () => { if (!students.length && !pastedText) return; if (window.confirm('Clear all data?')) { setStudents([]); setPastedText(''); if (fileInputRef.current) fileInputRef.current.value = null; } };

  const handleSave = async () => {
    const validStudents = students.filter(s => s._isValid).map(({ _isValid, _error, ...rest }) => rest);
    if (!validStudents.length) { showError('No valid students.'); return; }
    setIsSaving(true);
    try { await updatePublicBookingLink(id, { students: validStudents }); showSuccess(`${validStudents.length} students authorized!`); invalidatePublicBookings(); navigate('/admin/bookings/student-bookings'); }
    catch (err) { showError(err?.response?.data?.message || 'Failed to authorize.'); }
    finally { setIsSaving(false); }
  };

  const handleTemplateDownload = () => {
    const csv = `${columnsHelp.join(',')}\nAcme Corp,Frontend,USER123,Jane Doe,jane@example.com,+91 9876543210,https://example.com/resume.pdf\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'student_template.csv'; a.click();
  };

  const { validCount, invalidCount } = useMemo(() => ({ validCount: students.filter(s => s._isValid).length, invalidCount: students.filter(s => !s._isValid).length }), [students]);

  const filtered = useMemo(() => {
    const list = showInvalidOnly ? students.filter(s => !s._isValid) : students;
    if (!q.trim()) return list;
    const needle = q.trim().toLowerCase();
    return list.filter(s => [s.hiringName, s.domain, s.userId, s.fullName, s.email, s.mobileNumber].filter(Boolean).some(v => v.toLowerCase().includes(needle)));
  }, [students, showInvalidOnly, q]);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader size="lg" /></div>;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/admin/bookings/student-bookings"
            className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <h1 className="text-sm font-semibold text-slate-900">Authorize Students</h1>
          {bookingDetails?.title && (
            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              {bookingDetails.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">Total <span className="font-bold text-slate-900">{students.length}</span></span>
          <span className="text-emerald-600">Valid <span className="font-bold">{validCount}</span></span>
          {invalidCount > 0 && <span className="text-red-500">Invalid <span className="font-bold">{invalidCount}</span></span>}
        </div>
      </div>

      {/* ── Body: two columns ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Input panel */}
        <div className="w-[340px] shrink-0 border-r border-slate-200 flex flex-col bg-[#f8fafc]">
          {/* Input mode tabs */}
          <div className="flex border-b border-slate-200 shrink-0">
            <button onClick={() => setInputMode('paste')}
              className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold border-b-2 transition-colors',
                inputMode === 'paste' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600')}>
              <FileText size={13} /> Paste Data
            </button>
            <button onClick={() => setInputMode('upload')}
              className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold border-b-2 transition-colors',
                inputMode === 'upload' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600')}>
              <Upload size={13} /> Import File
            </button>
          </div>

          {inputMode === 'paste' ? (
            <div className="flex-1 flex flex-col p-3 gap-2">
              <textarea
                value={pastedText}
                onChange={e => processText(e.target.value)}
                placeholder={`Paste student data here...\n\nSupported Columns:\n${columnsHelp.join(', ')}`}
                className="flex-1 w-full p-3 bg-white border border-slate-200 rounded-lg text-[12px] font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
                spellCheck={false}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={handleTemplateDownload} className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    <Download size={11} /> Template
                  </button>
                </div>
                <button onClick={handleClear} disabled={!pastedText && !students.length}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors">
                  <Trash2 size={11} /> Clear
                </button>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1"><Info size={10} className="text-blue-400" /> Tab or comma separated</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-3 gap-3">
              <div ref={dropRef} onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg cursor-pointer transition-all">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls,.xlsm" className="hidden" />
                <Upload size={24} className="text-slate-300 mb-2" />
                <p className="text-[12px] font-medium text-slate-600">Click to upload or drag and drop</p>
                <p className="text-[10px] text-slate-400 mt-0.5">CSV, Excel files (max 10MB)</p>
              </div>
              <button onClick={handleTemplateDownload} className="inline-flex items-center justify-center gap-1.5 h-8 text-[11px] font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                <Download size={12} /> Download Template
              </button>
            </div>
          )}
        </div>

        {/* Right: Data table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 shrink-0">
            <div className="relative w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Search students..."
                className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" checked={showInvalidOnly} onChange={e => setShowInvalidOnly(e.target.checked)} />
              <span className="text-[11px] text-slate-600 font-medium">Show Invalid</span>
            </label>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Search size={28} className="mb-2 opacity-20" />
                <p className="text-sm font-medium text-slate-500">{students.length === 0 ? 'No students yet' : 'No results match'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{students.length === 0 ? 'Paste data or upload a file to get started' : 'Try adjusting your search'}</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="sticky top-0 w-12 px-3 py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10" />
                    <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Hiring</th>
                    <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Domain</th>
                    <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">User ID</th>
                    <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Full Name</th>
                    <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Email</th>
                    <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Mobile</th>
                    <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s, i) => (
                    <tr key={`${s.email || i}`} className={cn('hover:bg-slate-50/60 transition-colors', !s._isValid && 'bg-red-50/40')}>
                      <td className="px-3 py-2 text-center">
                        {s._isValid
                          ? <CheckCircle size={14} className="text-emerald-500 mx-auto" />
                          : <AlertTriangle size={14} className="text-red-400 mx-auto" title={s._error} />
                        }
                      </td>
                      <td className="px-3 py-2 text-[12px] text-slate-600">{s.hiringName || '—'}</td>
                      <td className="px-3 py-2 text-[12px] text-slate-600">{s.domain || '—'}</td>
                      <td className="px-3 py-2 text-[11px] font-mono text-slate-500">{s.userId || '—'}</td>
                      <td className="px-3 py-2 text-[12px] font-medium text-slate-900">{s.fullName || '—'}</td>
                      <td className="px-3 py-2 text-[12px] text-slate-500">{s.email || '—'}</td>
                      <td className="px-3 py-2 text-[12px] text-slate-500">{s.mobileNumber || '—'}</td>
                      <td className="px-3 py-2">
                        {s.resumeLink ? (
                          <a href={/^https?:\/\//i.test(s.resumeLink) ? s.resumeLink : `https://${s.resumeLink}`} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] font-medium text-blue-600 hover:text-blue-800">View</a>
                        ) : <span className="text-[11px] text-slate-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 shrink-0">
            <span className="text-[11px] text-slate-400">{filtered.length} of {students.length} students</span>
            <div className="flex items-center gap-2">
              {students.length > 0 && (
                <button onClick={handleClear} className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                  <Trash2 size={13} /> Clear All
                </button>
              )}
              <button onClick={handleSave} disabled={validCount === 0 || isSaving}
                className="inline-flex items-center gap-2 h-8 px-4 text-[12px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40 transition-colors">
                {isSaving ? <Loader size="sm" /> : <Send size={13} />}
                Authorize & Invite {validCount} Students
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorizeStudentsPage;
