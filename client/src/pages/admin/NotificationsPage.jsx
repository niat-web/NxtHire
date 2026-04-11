import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Loader from '@/components/common/Loader';
import {
  Mail, MessageCircle, Bell, Loader2, Video,
  Users, UserCheck, Briefcase, Shield, Send, CreditCard, FileText,
  AlertCircle, CheckCircle, Clock, Zap,
} from 'lucide-react';
import { getNotificationSettings, updateNotificationSettings } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { cn } from '@/lib/utils';

// ── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ enabled, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    disabled={disabled}
    onClick={() => onChange(!enabled)}
    className={cn(
      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40',
      enabled ? 'bg-indigo-600' : 'bg-gray-200'
    )}
  >
    <span className={cn(
      'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5',
      enabled ? 'translate-x-[18px] ml-0' : 'translate-x-0.5'
    )} />
  </button>
);

// ── Single notification row ──────────────────────────────────────────────────
const Row = ({ icon: Icon, color, title, desc, settingKey, settings, onToggle, saving }) => {
  const enabled = settings[settingKey] !== false;
  return (
    <div className={cn(
      'flex items-center gap-3 py-3 px-3 rounded-lg transition-colors',
      enabled ? 'hover:bg-gray-50' : 'opacity-60 hover:opacity-80'
    )}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <Toggle enabled={enabled} onChange={(val) => onToggle(settingKey, val)} disabled={saving} />
    </div>
  );
};

// ── Group header ─────────────────────────────────────────────────────────────
const GroupLabel = ({ label, color = 'text-gray-400' }) => (
  <div className="px-3 pt-5 pb-1.5 first:pt-2">
    <p className={cn('text-xs font-semibold uppercase tracking-wider', color)}>{label}</p>
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getNotificationSettings();
      setSettings(res.data.data);
    } catch { showError('Failed to load settings.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleToggle = async (key, value) => {
    const prev = { ...settings };
    setSettings(s => ({ ...s, [key]: value }));
    setSaving(true);
    try { await updateNotificationSettings({ [key]: value }); }
    catch { setSettings(prev); showError('Failed to update.'); }
    finally { setSaving(false); }
  };

  const toggleBulk = async (keys, enable) => {
    const prev = { ...settings };
    const updates = {};
    keys.forEach(k => { updates[k] = enable; });
    setSettings(s => ({ ...s, ...updates }));
    setSaving(true);
    try {
      await updateNotificationSettings(updates);
      showSuccess(enable ? 'All enabled.' : 'All disabled.');
    } catch { setSettings(prev); showError('Failed.'); }
    finally { setSaving(false); }
  };

  // Keys
  const applicantKeys = ['emailApplicationConfirmation', 'emailSkillAssessmentInvitation', 'emailProfileRejection', 'emailGuidelinesInvitation', 'emailAccountCreation'];
  const adminKeys = ['emailNewApplicantNotification', 'emailWorkflowReminder'];
  const interviewerKeys = ['emailBookingRequestNotification', 'emailProbationComplete', 'emailNewInterviewerWelcome', 'emailPaymentConfirmation', 'emailInvoiceMail', 'emailPaymentReceivedConfirmation', 'emailInterviewCancelled'];
  const studentKeys = ['emailStudentBookingInvitation', 'emailStudentBookingReminder', 'emailMeetLinkNotification'];
  const otherKeys = ['emailCustomBulkEmail', 'emailPasswordReset'];
  const allEmailKeys = [...applicantKeys, ...adminKeys, ...interviewerKeys, ...studentKeys, ...otherKeys];
  const whatsappPushKeys = ['whatsappInterviewerWelcome', 'pushBookingRequest'];

  const emailEnabledCount = allEmailKeys.filter(k => settings[k] !== false).length;
  const wpEnabledCount = whatsappPushKeys.filter(k => settings[k] !== false).length;
  const allEmailOn = emailEnabledCount === allEmailKeys.length;
  const allWpOn = wpEnabledCount === whatsappPushKeys.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Top bar */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage all email, WhatsApp and push notifications</p>
        </div>
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-indigo-600">
            <Loader2 size={12} className="animate-spin" /> Saving…
          </span>
        )}
      </div>

      {/* Content — two columns */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-6xl">

          {/* ═══ EMAIL COLUMN ═══ */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Mail size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Email Notifications</h2>
                  <p className="text-xs text-gray-400">{emailEnabledCount} of {allEmailKeys.length} active</p>
                </div>
              </div>
              <button
                onClick={() => toggleBulk(allEmailKeys, !allEmailOn)}
                className={cn('text-xs font-semibold px-2.5 py-1 rounded-md transition-colors',
                  allEmailOn ? 'text-gray-500 bg-gray-100 hover:bg-gray-200' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                )}
              >
                {allEmailOn ? 'Disable All' : 'Enable All'}
              </button>
            </div>

            {/* Rows */}
            <div className="px-2 py-1">
              <GroupLabel label="Applicants" color="text-indigo-500" />
              <Row icon={CheckCircle} color="bg-green-50 text-green-600" title="Application Confirmation" desc="When applicant submits form" settingKey="emailApplicationConfirmation" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={FileText} color="bg-indigo-50 text-indigo-600" title="Skill Assessment Invite" desc="After LinkedIn profile approval" settingKey="emailSkillAssessmentInvitation" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={AlertCircle} color="bg-red-50 text-red-500" title="Profile Rejection" desc="When profile is rejected" settingKey="emailProfileRejection" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={FileText} color="bg-violet-50 text-violet-600" title="Guidelines Invitation" desc="After skill categorization" settingKey="emailGuidelinesInvitation" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={Mail} color="bg-sky-50 text-sky-600" title="Account Setup Link" desc="Password setup for new accounts" settingKey="emailAccountCreation" settings={settings} onToggle={handleToggle} saving={saving} />

              <GroupLabel label="Admin" color="text-amber-500" />
              <Row icon={Bell} color="bg-amber-50 text-amber-600" title="New Applicant Alert" desc="Notify admin on new submission" settingKey="emailNewApplicantNotification" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={Clock} color="bg-amber-50 text-amber-500" title="Workflow Reminder" desc="Daily stuck applications (10 AM)" settingKey="emailWorkflowReminder" settings={settings} onToggle={handleToggle} saving={saving} />

              <GroupLabel label="Interviewers" color="text-emerald-500" />
              <Row icon={Briefcase} color="bg-emerald-50 text-emerald-600" title="Booking Request" desc="New interview request alert" settingKey="emailBookingRequestNotification" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={CheckCircle} color="bg-emerald-50 text-emerald-500" title="Probation Complete" desc="Probation completion notice" settingKey="emailProbationComplete" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={UserCheck} color="bg-teal-50 text-teal-600" title="Welcome Email" desc="Credentials for new interviewer" settingKey="emailNewInterviewerWelcome" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={CreditCard} color="bg-violet-50 text-violet-600" title="Payment Confirmation" desc="Payment details to interviewer" settingKey="emailPaymentConfirmation" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={FileText} color="bg-indigo-50 text-indigo-500" title="Invoice Email" desc="Payment invoice" settingKey="emailInvoiceMail" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={CreditCard} color="bg-green-50 text-green-600" title="Payment Received" desc="Confirm payment receipt" settingKey="emailPaymentReceivedConfirmation" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={AlertCircle} color="bg-red-50 text-red-500" title="Interview Cancelled" desc="Cancellation notification" settingKey="emailInterviewCancelled" settings={settings} onToggle={handleToggle} saving={saving} />

              <GroupLabel label="Students" color="text-sky-500" />
              <Row icon={Send} color="bg-sky-50 text-sky-600" title="Booking Invitation" desc="Invite to book interview slot" settingKey="emailStudentBookingInvitation" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={Clock} color="bg-sky-50 text-sky-500" title="Booking Reminder" desc="Remind to complete booking" settingKey="emailStudentBookingReminder" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={Video} color="bg-indigo-50 text-indigo-500" title="Meet Link Notification" desc="Send meet link, date & time after generating" settingKey="emailMeetLinkNotification" settings={settings} onToggle={handleToggle} saving={saving} />

              <GroupLabel label="Other" color="text-gray-400" />
              <Row icon={Send} color="bg-gray-50 text-gray-500" title="Custom Bulk Email" desc="Admin custom templated emails" settingKey="emailCustomBulkEmail" settings={settings} onToggle={handleToggle} saving={saving} />
              <Row icon={Shield} color="bg-rose-50 text-rose-500" title="Password Reset" desc="Reset link emails" settingKey="emailPasswordReset" settings={settings} onToggle={handleToggle} saving={saving} />
            </div>
          </motion.div>

          {/* ═══ WHATSAPP + PUSH COLUMN ═══ */}
          <div className="space-y-5">
            {/* WhatsApp */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                    <MessageCircle size={15} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">WhatsApp</h2>
                    <p className="text-xs text-gray-400">Message notifications</p>
                  </div>
                </div>
              </div>
              <div className="px-2 py-2">
                <Row icon={MessageCircle} color="bg-green-50 text-green-600" title="Interviewer Welcome" desc="Welcome message on onboarding" settingKey="whatsappInterviewerWelcome" settings={settings} onToggle={handleToggle} saving={saving} />
              </div>
            </motion.div>

            {/* Push */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                    <Zap size={15} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Push Notifications</h2>
                    <p className="text-xs text-gray-400">Browser notifications</p>
                  </div>
                </div>
              </div>
              <div className="px-2 py-2">
                <Row icon={Bell} color="bg-violet-50 text-violet-600" title="Booking Request" desc="Browser push for new requests" settingKey="pushBookingRequest" settings={settings} onToggle={handleToggle} saving={saving} />
              </div>
            </motion.div>

            {/* Info card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <AlertCircle size={15} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900">How it works</p>
                  <p className="text-xs text-indigo-700/70 mt-1 leading-relaxed">
                    Turning off a notification stops it from being sent. Critical system emails like password resets should stay enabled. Changes take effect immediately.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
