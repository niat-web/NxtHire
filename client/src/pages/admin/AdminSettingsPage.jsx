// client/src/pages/admin/AdminSettingsPage.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Check, Loader2, Database } from 'lucide-react';
import { useDomainOptionsList, useInvalidateDomainOptions, useAllAppSettings, useInvalidateAppSettings } from '@/hooks/useAdminQueries';
import { createDomainOption, updateDomainOption, deleteDomainOption, seedDomainOptions, createAppSetting, updateAppSetting, deleteAppSetting, seedAllAppSettings } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import Loader from '@/components/common/Loader';
import ConfirmDialog from '@/components/common/ConfirmDialog';

// ── Inline editable list for a single settings category ──
const SettingSection = ({ title, description, items, category, onAdd, onUpdate, onDelete, showAmount = false }) => {
    const [addMode, setAddMode] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [editId, setEditId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!newValue.trim()) return;
        setSaving(true);
        const ok = await onAdd(category, { value: newValue.trim(), label: newValue.trim(), amount: showAmount ? Number(newAmount) || 0 : undefined });
        setSaving(false);
        if (ok) { setNewValue(''); setNewAmount(''); setAddMode(false); }
    };

    const handleUpdate = async () => {
        if (!editValue.trim() || !editId) return;
        setSaving(true);
        const ok = await onUpdate(editId, { value: editValue.trim(), label: editValue.trim(), amount: showAmount ? Number(editAmount) || 0 : undefined });
        setSaving(false);
        if (ok) setEditId(null);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <div>
                    <h3 className="text-[13px] font-semibold text-slate-900">{title}</h3>
                    <p className="text-[10px] text-slate-400">{description}</p>
                </div>
                {!addMode && (
                    <button onClick={() => { setAddMode(true); setNewValue(''); setNewAmount(''); }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        <Plus size={12} /> Add
                    </button>
                )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                {/* Add row */}
                {addMode && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/40 border-b border-slate-200">
                        <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Enter name..." autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            className="flex-1 h-7 px-2 border border-slate-200 rounded text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-300" />
                        {showAmount && (
                            <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="₹ Amount"
                                className="w-20 h-7 px-2 border border-slate-200 rounded text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-300" />
                        )}
                        <button onClick={handleAdd} disabled={saving || !newValue.trim()} className="w-6 h-6 rounded flex items-center justify-center text-emerald-600 hover:bg-emerald-50 disabled:opacity-40">
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button onClick={() => setAddMode(false)} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Items */}
                {items.length === 0 && !addMode ? (
                    <div className="px-3 py-4 text-center text-[11px] text-slate-400">Empty — click "Add" or seed defaults</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {items.map(item => (
                            <div key={item._id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50/60 transition-colors group">
                                {editId === item._id ? (
                                    <>
                                        <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                                            onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditId(null); }}
                                            className="flex-1 h-7 px-2 border border-slate-200 rounded text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-300" />
                                        {showAmount && (
                                            <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                                                className="w-20 h-7 px-2 border border-slate-200 rounded text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-300" />
                                        )}
                                        <button onClick={handleUpdate} disabled={saving} className="w-6 h-6 rounded flex items-center justify-center text-emerald-600 hover:bg-emerald-50 disabled:opacity-40">
                                            {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={13} />}
                                        </button>
                                        <button onClick={() => setEditId(null)} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                                            <X size={13} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-[12px] text-slate-800">{item.value || item.name}</span>
                                        {showAmount && item.amount !== undefined && <span className="text-[11px] font-mono text-slate-400">₹{item.amount}</span>}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditId(item._id); setEditValue(item.value || item.name); setEditAmount(item.amount || ''); }}
                                                className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit size={11} />
                                            </button>
                                            <button onClick={() => onDelete(item._id, item.value || item.name)}
                                                className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50">
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminSettingsPage = () => {
    const { showSuccess, showError } = useAlert();
    const { data: domainItems = [], isLoading: domainsLoading } = useDomainOptionsList();
    const invalidateDomains = useInvalidateDomainOptions();
    const { data: allSettings = {}, isLoading: settingsLoading } = useAllAppSettings();
    const invalidateSettings = useInvalidateAppSettings();
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '', type: '' });
    const [seeding, setSeeding] = useState(false);

    // Domain handlers
    const handleDomainAdd = async (_, data) => {
        try { await createDomainOption(data); showSuccess('Added.'); invalidateDomains(); return true; }
        catch (e) { showError(e.response?.data?.message || 'Failed.'); return false; }
    };
    const handleDomainUpdate = async (id, data) => {
        try { await updateDomainOption(id, data); showSuccess('Updated.'); invalidateDomains(); return true; }
        catch (e) { showError(e.response?.data?.message || 'Failed.'); return false; }
    };

    // App setting handlers
    const handleSettingAdd = async (category, data) => {
        try { await createAppSetting(category, data); showSuccess('Added.'); invalidateSettings(category); return true; }
        catch (e) { showError(e.response?.data?.message || 'Failed.'); return false; }
    };
    const handleSettingUpdate = async (id, data) => {
        try { await updateAppSetting(id, data); showSuccess('Updated.'); invalidateSettings(); return true; }
        catch (e) { showError(e.response?.data?.message || 'Failed.'); return false; }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return;
        try {
            if (deleteDialog.type === 'domain') { await deleteDomainOption(deleteDialog.id); invalidateDomains(); }
            else { await deleteAppSetting(deleteDialog.id); invalidateSettings(); }
            showSuccess('Deleted.');
        } catch { showError('Failed.'); }
        finally { setDeleteDialog({ isOpen: false, id: null, name: '', type: '' }); }
    };

    const openDelete = (type) => (id, name) => setDeleteDialog({ isOpen: true, id, name, type });

    // Seed all defaults
    const handleSeedAll = async () => {
        setSeeding(true);
        try {
            await seedDomainOptions();
            await seedAllAppSettings();
            showSuccess('All defaults loaded!');
            invalidateDomains();
            invalidateSettings();
        } catch { showError('Seed failed.'); }
        finally { setSeeding(false); }
    };

    const loading = domainsLoading || settingsLoading;
    if (loading) return <div className="flex items-center justify-center h-full"><Loader size="lg" /></div>;

    const hasEmptySections = (allSettings.sourcing_channels || []).length === 0 ||
        (allSettings.proficiency_levels || []).length === 0 ||
        (allSettings.payment_tiers || []).length === 0 ||
        (allSettings.tech_stacks || []).length === 0 ||
        (allSettings.interview_statuses || []).length === 0;

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
                <div>
                    <h1 className="text-sm font-semibold text-slate-900">Settings</h1>
                    <p className="text-[11px] text-slate-400">Manage dropdowns and options used across the app</p>
                </div>
                {hasEmptySections && (
                    <button onClick={handleSeedAll} disabled={seeding}
                        className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {seeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                        Seed All Defaults
                    </button>
                )}
            </div>

            {/* Grid layout — 2 columns, full height */}
            <div className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl">
                    <SettingSection title="Domain Names" description="Interviewer domains — forms, filters, dropdowns"
                        items={domainItems} category="domains" onAdd={handleDomainAdd} onUpdate={handleDomainUpdate} onDelete={openDelete('domain')} />

                    <SettingSection title="Sourcing Channels" description="Where applicants are sourced from"
                        items={allSettings.sourcing_channels || []} category="sourcing_channels" onAdd={handleSettingAdd} onUpdate={handleSettingUpdate} onDelete={openDelete('setting')} />

                    <SettingSection title="Proficiency Levels" description="Skill proficiency levels for assessments"
                        items={allSettings.proficiency_levels || []} category="proficiency_levels" onAdd={handleSettingAdd} onUpdate={handleSettingUpdate} onDelete={openDelete('setting')} />

                    <SettingSection title="Payment Tiers" description="Interviewer payment tier options" showAmount
                        items={allSettings.payment_tiers || []} category="payment_tiers" onAdd={handleSettingAdd} onUpdate={handleSettingUpdate} onDelete={openDelete('setting')} />

                    <SettingSection title="Tech Stacks" description="Main sheet tech stack / domain options"
                        items={allSettings.tech_stacks || []} category="tech_stacks" onAdd={handleSettingAdd} onUpdate={handleSettingUpdate} onDelete={openDelete('setting')} />

                    <SettingSection title="Interview Statuses" description="Main sheet interview status options"
                        items={allSettings.interview_statuses || []} category="interview_statuses" onAdd={handleSettingAdd} onUpdate={handleSettingUpdate} onDelete={openDelete('setting')} />
                </div>
            </div>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '', type: '' })}
                onConfirm={handleDeleteConfirm} title="Delete Item"
                message={`Delete "${deleteDialog.name}"? Existing records won't be affected.`} confirmVariant="danger" />
        </div>
    );
};

export default AdminSettingsPage;
