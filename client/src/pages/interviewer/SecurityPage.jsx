import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SecurityPage = () => {
  const { changePassword } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await changePassword(data.currentPassword, data.newPassword, data.confirmPassword);
      showSuccess('Password changed successfully.');
      reset();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({ id, label, show, onToggle, error, ...rest }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          className={cn('pl-10 pr-10 h-11 rounded-xl text-sm bg-white', error ? 'border-red-400' : 'border-gray-200')}
          {...rest}
        />
        <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Security</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your password and account security</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-400">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            error={errors.currentPassword}
            placeholder="Enter current password"
            {...register('currentPassword', { required: 'Current password is required' })}
          />

          <PasswordField
            id="newPassword"
            label="New Password"
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            error={errors.newPassword}
            placeholder="Enter new password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            })}
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            error={errors.confirmPassword}
            placeholder="Confirm new password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: val => val === newPassword || 'Passwords do not match',
            })}
          />

          <div className="pt-2">
            <Button type="submit" disabled={saving} className="rounded-xl">
              {saving ? <><Loader2 size={15} className="animate-spin mr-2" /> Updating...</> : 'Update Password'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SecurityPage;
