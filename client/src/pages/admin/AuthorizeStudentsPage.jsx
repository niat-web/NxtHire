// client/src/pages/admin/AuthorizeStudentsPage.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAlert } from '@/hooks/useAlert';
import { updatePublicBookingLink, getPublicBookingDetails } from '@/api/admin.api';
import {
  FiUpload,
  FiTrash2,
  FiSend,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiFilter,
  FiSearch,
  FiDownload,
  FiFileText,
  FiXCircle,
} from 'react-icons/fi';

// ---------- Reusable Button ----------
const LocalButton = ({
  children,
  onClick,
  type = 'button',
  isLoading = false,
  variant = 'primary',
  icon: Icon,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg',
    md: 'text-sm px-5 py-2.5 rounded-xl',
    lg: 'text-base px-6 py-3 rounded-xl',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 border border-transparent',
    outline:
      'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm',
    subtle:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent',
    danger:
      'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={`mr-2 ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />}
          {children}
        </>
      )}
    </button>
  );
};

// ---------- Helpers ----------
const EMAIL_RE = /\S+@\S+\.\S+/i;
const URL_RE =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
const MOBILE_RE = /^[0-9+\-\s()]{7,15}$/;

const trimLower = (s) => (s || '').trim().toLowerCase();
const sanitize = (s) => (typeof s === 'string' ? s.trim() : '');

const columnsHelp = [
  'Hiring Name',
  'Domain',
  'User ID',
  'Full Name',
  'Email',
  'Mobile',
  'Resume Link',
];

const headerAliases = {
  'hiring name': 'hiringName',
  'hiring_name': 'hiringName',
  'hiring': 'hiringName',
  domain: 'domain',
  'user id': 'userId',
  userid: 'userId',
  'user_id': 'userId',
  'full name': 'fullName',
  fullname: 'fullName',
  'full_name': 'fullName',
  email: 'email',
  'email id': 'email',
  'email_id': 'email',
  mobile: 'mobileNumber',
  'mobile number': 'mobileNumber',
  'phone': 'mobileNumber',
  'resume': 'resumeLink',
  'resume link': 'resumeLink',
  'resume_link': 'resumeLink',
};

function validateStudent(raw) {
  const student = {
    hiringName: sanitize(raw.hiringName),
    domain: sanitize(raw.domain),
    userId: sanitize(raw.userId),
    fullName: sanitize(raw.fullName),
    email: trimLower(raw.email),
    mobileNumber: sanitize(raw.mobileNumber),
    resumeLink: sanitize(raw.resumeLink),
  };

  let _isValid = true;
  let _error = null;

  if (!student.email || !EMAIL_RE.test(student.email)) {
    _isValid = false;
    _error = 'Invalid or missing email.';
  } else if (!student.fullName) {
    _isValid = false;
    _error = 'Full Name is required.';
  } else if (student.mobileNumber && !MOBILE_RE.test(student.mobileNumber)) {
    _isValid = false;
    _error = 'Invalid mobile format.';
  } else if (student.resumeLink && !URL_RE.test(student.resumeLink)) {
    _isValid = false;
    _error = 'Resume link must be a valid URL.';
  }

  return { ...student, _isValid, _error };
}

function mapHeaders(headers = []) {
  return headers.map((h) => headerAliases[trimLower(h)] || null);
}

function objectFromRow(mappedHeaders, row) {
  const obj = {};
  mappedHeaders.forEach((key, idx) => {
    if (!key) return;
    obj[key] = row[idx];
  });
  return obj;
}

function dedupeByEmail(list) {
  const seen = new Set();
  const out = [];
  for (const s of list) {
    const email = trimLower(s.email);
    if (!email || seen.has(email)) continue;
    seen.add(email);
    out.push(s);
  }
  return out;
}

const AuthorizeStudentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [students, setStudents] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);

  const [showInvalidOnly, setShowInvalidOnly] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    getPublicBookingDetails(id)
      .then((res) => setBookingDetails(res.data.data))
      .catch(() => showError('Failed to load booking details.'))
      .finally(() => setLoading(false));
  }, [id, showError]);

  const processText = useCallback((text) => {
    if (!text) {
      setStudents([]);
      setPastedText('');
      return;
    }

    const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) {
      setStudents([]);
      setPastedText(text);
      return;
    }
    const first = lines[0].split(/\t|,/).map((c) => c.trim());
    const headerMap = mapHeaders(first);
    const hasHeader = headerMap.some((k) => k);
    let rows = hasHeader ? lines.slice(1) : lines;
    const parsed = rows
      .map((row) => row.split(/\t|,/))
      .map((cols) => {
        if (hasHeader) return objectFromRow(headerMap, cols);
        return { hiringName: cols[0], domain: cols[1], userId: cols[2], fullName: cols[3], email: cols[4], mobileNumber: cols[5], resumeLink: cols[6] };
      });
    const validated = dedupeByEmail(parsed.map(validateStudent));
    setStudents(validated);
    setPastedText(text);
  }, []);

  const processWorkbook = useCallback((wb) => {
    const ws = wb.Sheets[wb.SheetNames[0]];
    const sheet = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
    if (!sheet || sheet.length === 0) { showError('The uploaded sheet is empty.'); return; }
    const headers = (sheet[0] || []).map((h) => (h ?? '').toString().trim());
    const headerMap = mapHeaders(headers);
    const hasHeader = headerMap.some((k) => k);
    const dataRows = hasHeader ? sheet.slice(1) : sheet;
    const parsed = dataRows
      .filter((row) => row.some((c) => (c ?? '').toString().trim() !== ''))
      .map((row) => {
        if (hasHeader) return objectFromRow(headerMap, row);
        return { hiringName: row[0], domain: row[1], userId: row[2], fullName: row[3], email: row[4], mobileNumber: row[5], resumeLink: row[6] };
      });
    const validated = dedupeByEmail(parsed.map(validateStudent));
    setStudents(validated);
    setPastedText('');
  }, [showError]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const isCsv = /\.csv$/i.test(file.name);
    const isXlsx = /\.(xlsx|xls|xlsm)$/i.test(file.name);

    reader.onload = (evt) => {
      const data = evt.target.result;
      try {
        if (isCsv) { processText(typeof data === 'string' ? data : new TextDecoder().decode(data)); }
        else if (isXlsx) { processWorkbook(XLSX.read(data, { type: 'array' })); }
        else { processWorkbook(XLSX.read(data, { type: 'array' })); }
      } catch (err) { console.error(err); showError('Unable to parse the uploaded file. Please check the format.'); }
      finally { if (fileInputRef.current) fileInputRef.current.value = null; }
    };
    if (isCsv) reader.readAsText(file); else reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onPrevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e) => { onPrevent(e); const file = e.dataTransfer.files?.[0]; if (file) { handleFileChange({ target: { files: [file] } }); } el.classList.remove('ring-2', 'ring-blue-500'); };
    const onDragEnter = (e) => { onPrevent(e); el.classList.add('ring-2', 'ring-blue-500'); };
    const onDragLeave = (e) => { onPrevent(e); el.classList.remove('ring-2', 'ring-blue-500'); };
    const onDragOver = onPrevent;
    el.addEventListener('dragenter', onDragEnter); el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('dragover', onDragOver); el.addEventListener('drop', onDrop);
    return () => { el.removeEventListener('dragenter', onDragEnter); el.removeEventListener('dragleave', onDragLeave); el.removeEventListener('dragover', onDragOver); el.removeEventListener('drop', onDrop); };
  }, [handleFileChange]);

  const handleClear = () => { if (students.length === 0 && pastedText === '') return; if (window.confirm('Clear all imported/pasted data?')) { setStudents([]); setPastedText(''); if (fileInputRef.current) fileInputRef.current.value = null; } };

  const handleSave = async () => {
    const validStudents = students.filter((s) => s._isValid).map(({ _isValid, _error, ...rest }) => rest);
    if (validStudents.length === 0) { showError('No valid student data found to save.'); return; }
    setIsSaving(true);
    try { await updatePublicBookingLink(id, { students: validStudents }); showSuccess(`${validStudents.length} students authorized and invited successfully!`); navigate('/admin/bookings/student-bookings'); }
    catch (err) { showError(err?.response?.data?.message || 'Failed to authorize students.'); }
    finally { setIsSaving(false); }
  };

  const handleTemplateDownload = () => {
    const header = columnsHelp.join(',');
    const sample = ['Acme Corp,Frontend,USER123,Jane Doe,jane@example.com,+91 9876543210,https://example.com/jane-resume.pdf', 'Acme Corp,Backend,USER124,John Smith,john@example.com,9876501234,https://example.com/john-resume.pdf'].join('\n');
    const csv = `${header}\n${sample}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'student_authorization_template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const { validCount, invalidCount } = useMemo(() => {
    const v = students.filter((s) => s._isValid).length;
    return { validCount: v, invalidCount: students.length - v };
  }, [students]);

  const filtered = useMemo(() => {
    const list = showInvalidOnly ? students.filter((s) => !s._isValid) : students;
    if (!q.trim()) return list;
    const needle = q.trim().toLowerCase();
    return list.filter((s) =>
      [s.hiringName, s.domain, s.userId, s.fullName, s.email, s.mobileNumber].filter(Boolean).some((v) => v.toLowerCase().includes(needle)),
    );
  }, [students, showInvalidOnly, q]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50/50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/bookings/student-bookings"
              className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all duration-200 shadow-sm"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Authorize Students</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              {bookingDetails?.title || 'Booking Session'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">

            {/* Left Panel: Input Methods */}
            <div className="xl:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pb-6">

              {/* Paste Data Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FiFileText className="h-4 w-4" />
                    </div>
                    Paste Data
                  </div>
                  <LocalButton variant="ghost" size="sm" icon={FiDownload} onClick={handleTemplateDownload}>
                    Template
                  </LocalButton>
                </div>

                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className="relative flex-1 min-h-[200px]">
                    <textarea
                      value={pastedText}
                      onChange={(e) => processText(e.target.value)}
                      placeholder={`Paste student data here...\n\nSupported Columns:\n${columnsHelp.join(', ')}`}
                      className="w-full h-full absolute inset-0 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                      spellCheck={false}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <FiInfo className="text-blue-500" />
                      Tab or comma separated
                    </p>
                    <LocalButton variant="subtle" size="sm" icon={FiTrash2} onClick={handleClear} disabled={!pastedText && students.length === 0}>
                      Clear
                    </LocalButton>
                  </div>
                </div>
              </div>

              {/* File Upload Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <FiUpload className="h-4 w-4" />
                    </div>
                    Import File
                  </div>
                </div>
                <div className="p-5">
                  <div
                    ref={dropRef}
                    className="group relative border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl p-8 text-center transition-all duration-200 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls,.xlsm" className="hidden" />

                    <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                      <FiUpload className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1">Click to upload or drag and drop</h3>
                    <p className="text-xs text-slate-500">CSV, Excel files (max 10MB)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Data Table */}
            <div className="xl:col-span-8 flex flex-col h-full overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200">

              {/* Toolbar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search students..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors select-none">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      checked={showInvalidOnly}
                      onChange={(e) => setShowInvalidOnly(e.target.checked)}
                    />
                    <span className="text-sm text-slate-700 font-medium">Show Invalid</span>
                  </label>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center gap-4 text-sm overflow-x-auto">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-slate-600 font-medium">Total: {students.length}</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-50 border border-green-100 text-green-700 shadow-sm">
                  <FiCheckCircle className="h-3.5 w-3.5" />
                  <span className="font-medium">Valid: {validCount}</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-50 border border-red-100 text-red-700 shadow-sm animate-pulse">
                    <FiAlertTriangle className="h-3.5 w-3.5" />
                    <span className="font-medium">Invalid: {invalidCount}</span>
                  </div>
                )}
              </div>

              {/* Table Content */}
              <div className="flex-1 overflow-auto relative">
                {filtered.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <FiSearch className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No students found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                      {students.length === 0
                        ? "Get started by pasting data or uploading a file."
                        : "No results match your search filters."}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 text-center">Status</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hiring Name</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((s, i) => (
                        <tr
                          key={`${s.email || 'row'}-${i}`}
                          className={`group transition-colors hover:bg-slate-50 ${!s._isValid ? 'bg-red-50/50 hover:bg-red-50' : ''}`}
                        >
                          <td className="py-3 px-4 text-center">
                            {s._isValid ? (
                              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                                <FiCheckCircle className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600" title={s._error}>
                                <FiAlertTriangle className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700">{s.hiringName}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{s.domain}</td>
                          <td className="py-3 px-4 text-sm text-slate-700 font-mono text-xs">{s.userId}</td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">{s.fullName}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{s.email}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{s.mobileNumber}</td>
                          <td className="py-3 px-4 text-sm">
                            {s.resumeLink ? (
                              <a
                                href={/^https?:\/\//i.test(s.resumeLink) ? s.resumeLink : `https://${s.resumeLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors font-medium text-xs"
                              >
                                View <FiFileText className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Missing</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="text-sm text-slate-500 font-medium">
                  Showing {filtered.length} of {students.length} students
                </div>
                <div className="flex items-center gap-3">
                  <LocalButton
                    variant="danger"
                    icon={FiTrash2}
                    onClick={handleClear}
                    disabled={students.length === 0}
                  >
                    Clear All
                  </LocalButton>
                  <LocalButton
                    icon={FiSend}
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={validCount === 0}
                    variant="primary"
                    size="lg"
                    className="shadow-xl shadow-blue-600/20"
                  >
                    {`Authorize & Invite ${validCount} Students`}
                  </LocalButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorizeStudentsPage;
