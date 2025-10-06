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

// (Helper components like LocalButton and others remain the same)
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
    'inline-flex items-center justify-center rounded-xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-5 py-2.5',
  };
  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline:
      'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
    subtle:
      'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          Processing…
        </span>
      ) : (
        <>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  );
};

// ... (Rest of the helper functions: EMAIL_RE, URL_RE, MOBILE_RE, trimLower, sanitize, columnsHelp, headerAliases, validateStudent, mapHeaders, objectFromRow, dedupeByEmail remain unchanged) ...
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
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-8 w-full bg-gray-200 rounded" />
          <div className="h-80 w-full bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 p-6">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-grow overflow-hidden">
        
        {/* Left: Import Panel */}
        <div className="xl:col-span-1 flex flex-col gap-6">
            
            {/* --- MODIFICATION START: New Header and Back Button --- */}
            <div className="flex-shrink-0">
                <Link to="/admin/bookings/student-bookings" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-2">
                    <FiArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Manage Links
                </Link>
            </div>
            {/* --- MODIFICATION END --- */}

          <div className="bg-white border rounded-xl shadow-sm flex-1 flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-semibold text-gray-900 flex items-center gap-2"><FiFileText /> Paste Data</div>
              <LocalButton variant="subtle" size="sm" icon={FiDownload} onClick={handleTemplateDownload} className="text-gray-700">Download Template</LocalButton>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <textarea
                value={pastedText}
                onChange={(e) => processText(e.target.value)}
                placeholder={`Paste student data...\nColumns: ${columnsHelp.join(', ')}\n(Headers optional)`}
                className="w-full flex-grow p-4 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm resize-y"
                spellCheck={false}
                aria-label="Paste student data"
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500 flex items-center gap-2"><FiInfo /> Supports comma or tab separated.</div>
                <LocalButton variant="outline" size="sm" icon={FiTrash2} onClick={handleClear}>Clear</LocalButton>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b font-semibold text-gray-900 flex items-center gap-2"><FiUpload /> Import File (CSV/XLSX)</div>
            <div className="p-4">
              <div ref={dropRef} className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center gap-2"><FiUpload className="h-6 w-6 text-gray-500" /><div className="text-sm text-gray-700">Drag & drop file here</div><div className="text-xs text-gray-500">or</div><div><input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls,.xlsm" className="hidden" id="csv-upload" /><label htmlFor="csv-upload" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-full px-4 py-2 cursor-pointer hover:bg-blue-50"><FiUpload size={16} /> Choose File</label></div><div className="text-xs text-gray-500 mt-2">Accepted: .csv, .xlsx</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Table Panel */}
        <div className="xl:col-span-2 flex flex-col min-h-0">
          <div className="bg-white border rounded-xl shadow-sm flex flex-col h-full">
            {/* Table header controls */}
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, email, user ID, domain…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={showInvalidOnly} onChange={(e) => setShowInvalidOnly(e.target.checked)}/>
                <FiFilter /> Show invalid only
              </label>
            </div>
            
            <div className="p-2 border-b flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 text-green-800 px-3 py-1.5 border border-green-200 text-sm"><FiCheckCircle /> {validCount} Valid</span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-red-50 text-red-800 px-3 py-1.5 border border-red-200 text-sm"><FiAlertTriangle /> {invalidCount} Invalid</span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-gray-800 px-3 py-1.5 border border-gray-200 text-sm">Total {students.length}</span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-500">{students.length === 0 ? 'No data yet. Paste or import a file to get started.' : 'No rows match your current filters.'}</div>
              ) : (
                <div className="min-w-full">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10"><tr className="text-left text-[11px] uppercase tracking-wider text-gray-600"><th className="p-2 w-12 text-center">Status</th><th className="p-2">Hiring Name</th><th className="p-2">Domain</th><th className="p-2">User ID</th><th className="p-2">Full Name</th><th className="p-2">Email ID</th><th className="p-2">Mobile</th><th className="p-2">Resume</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">{filtered.map((s, i) => (<tr key={`${s.email || 'row'}-${i}`} className={`${!s._isValid ? 'bg-red-50' : 'bg-white'} hover:bg-gray-50`}>
                        <td className="p-2 text-center align-middle">{s._isValid ? <FiCheckCircle className="text-green-500 mx-auto" title="Valid" /> : <FiAlertTriangle className="text-red-500 mx-auto" title={s._error || 'Invalid'} />}</td>
                        <td className="p-2">{s.hiringName}</td><td className="p-2">{s.domain}</td><td className="p-2">{s.userId}</td><td className="p-2 font-medium text-gray-900">{s.fullName}</td><td className="p-2 text-gray-700">{s.email}</td><td className="p-2 text-gray-700">{s.mobileNumber}</td>
                        <td className="p-2">{s.resumeLink ? (<a href={/^https?:\/\//i.test(s.resumeLink) ? s.resumeLink : `https://${s.resumeLink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Link<svg width="12" height="12" viewBox="0 0 24 24" className="inline"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg></a>) : (<span className="text-gray-400">N/A</span>)}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-4 py-3 border-t bg-white flex items-center justify-between">
              <div className="text-xs text-gray-500">Showing {filtered.length} of {students.length} rows</div>
              <div className="flex items-center gap-2"><LocalButton variant="outline" icon={FiTrash2} onClick={handleClear} disabled={students.length === 0}>Clear All</LocalButton><LocalButton icon={FiSend} onClick={handleSave} isLoading={isSaving} disabled={validCount === 0} variant="primary">{`Save & Invite ${validCount}`}</LocalButton></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorizeStudentsPage;
