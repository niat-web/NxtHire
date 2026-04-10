import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MessageCircle, Bell, Loader2, Zap,
  Briefcase, CheckCircle, UserCheck, CreditCard, FileText, AlertCircle,
} from 'lucide-react';
import { getNotificationPreferences, updateNotificationPreferences } from '@/api/interviewer.api';
import { useAlert } from '@/hooks/useAlert';
import { cn } from '@/lib/utils';

// Toggle
const Toggle = ({ enabled, onChange, disabled }) => (
  <button type="button" role="switch" aria-checked={enabled} disabled={disabled}
    onClick={() => onChange(!enabled)}
    className={cn(
      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40',
      enabled ? 'bg-indigo-600' : 'bg-gray-200'
    )}>
    <span className={cn('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5',
      enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
    )} />
  </button>
);

// Row
const Row = ({ icon: Icon, color, title, desc, settingKey, settings, onToggle, saving }) => {
  const enabled = settings[settingKey] !== false;
  return (
    <div className={cn('flex items-center gap-3 py-3 px-3 rounded-lg transition-colors', enabled ? 'hover:bg-gray-50' : 'opacity-60 hover:opacity-80')}>
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

const GroupLabel = ({ label, color = 'text-gray-400' }) => (
  <div className="px-3 pt-5 pb-1.5 first:pt-2">
    <p className={cn('text-xs font-semibold uppercase tracking-wider', color)}>{label}</p>
  </div>
);

const InterviewerNotificationsPage = () => {
  const { showError } = useAlert();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getNotificationPreferences();
        setSettings(res.data.data || {});
      } catch { showError('Failed to load settings.'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleToggle = async (key, value) => {
    const prev = { ...settings };
    setSettings(s => ({ ...s, [key]: value }));
    setSaving(true);
    try { await updateNotificationPreferences({ [key]: value }); }
    catch { setSettings(prev); showError('Failed to update.'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-0.5">Control which notifications you receive</p>
      </div>

      {saving && (
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 mb-4">
          <Loader2 size={12} className="animate-spin" /> Saving…
        </div>
      )}

      {/* Email Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Mail size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Email Notifications</h2>
            <p className="text-xs text-gray-400">Emails sent to your inbox</p>
          </div>
        </div>
        <div className="px-2 py-1">
          <GroupLabel label="Interviews" color="text-indigo-500" />
          <Row icon={Briefcase} color="bg-indigo-50 text-indigo-600" title="Booking Request" desc="New interview request notification" settingKey="emailBookingRequest" settings={settings} onToggle={handleToggle} saving={saving} />
          <Row icon={AlertCircle} color="bg-red-50 text-red-500" title="Interview Cancelled" desc="When an interview is cancelled" settingKey="emailInterviewCancelled" settings={settings} onToggle={handleToggle} saving={saving} />

          <GroupLabel label="Account" color="text-emerald-500" />
          <Row icon={CheckCircle} color="bg-emerald-50 text-emerald-500" title="Probation Complete" desc="When you complete probation" settingKey="emailProbationComplete" settings={settings} onToggle={handleToggle} saving={saving} />
          <Row icon={UserCheck} color="bg-teal-50 text-teal-600" title="Welcome Email" desc="Welcome email on joining" settingKey="emailWelcome" settings={settings} onToggle={handleToggle} saving={saving} />

          <GroupLabel label="Payments" color="text-violet-500" />
          <Row icon={CreditCard} color="bg-violet-50 text-violet-600" title="Payment Confirmation" desc="Payment details from admin" settingKey="emailPaymentConfirmation" settings={settings} onToggle={handleToggle} saving={saving} />
          <Row icon={FileText} color="bg-indigo-50 text-indigo-500" title="Invoice Email" desc="Payment invoice" settingKey="emailInvoice" settings={settings} onToggle={handleToggle} saving={saving} />
          <Row icon={CreditCard} color="bg-green-50 text-green-600" title="Payment Received" desc="Confirm payment receipt" settingKey="emailPaymentReceived" settings={settings} onToggle={handleToggle} saving={saving} />
        </div>
      </motion.div>

      {/* WhatsApp & Push */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <MessageCircle size={15} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">WhatsApp</h2>
          </div>
          <div className="px-2 py-2">
            <Row icon={MessageCircle} color="bg-green-50 text-green-600" title="Welcome Message" desc="On onboarding" settingKey="whatsappWelcome" settings={settings} onToggle={handleToggle} saving={saving} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Push</h2>
          </div>
          <div className="px-2 py-2">
            <Row icon={Bell} color="bg-violet-50 text-violet-600" title="Booking Request" desc="Browser push alerts" settingKey="pushBookingRequest" settings={settings} onToggle={handleToggle} saving={saving} />

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewerNotificationsPage;
