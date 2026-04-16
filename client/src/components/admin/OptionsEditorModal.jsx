// client/src/components/admin/OptionsEditorModal.jsx
import React from 'react';
import { useFieldArray } from 'react-hook-form';
import Modal from '@/components/common/Modal';
import { Plus, Trash2 } from 'lucide-react';

const OptionsEditorModal = ({ isOpen, onClose, path, control, register }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: path
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Dropdown Options" size="lg">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
                    <div className="col-span-6">Label (What the user sees)</div>
                    <div className="col-span-5">Value (For scoring, e.g., 1-5)</div>
                </div>

                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                            <input
                                {...register(`${path}.${index}.label`)}
                                placeholder="e.g., Confident & Fluent"
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                            />
                        </div>
                        <div className="col-span-5">
                             <input
                                {...register(`${path}.${index}.value`)}
                                placeholder="e.g., 5"
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                            />
                        </div>
                        <div className="col-span-1">
                             <button
                                type="button"
                                onClick={() => remove(index)}
                                className="inline-flex items-center justify-center px-2 h-10 text-sm font-medium rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                             >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                        </div>
                    </div>
                ))}
                 <button
                    type="button"
                    onClick={() => append({ label: '', value: '' })}
                    className="inline-flex items-center px-4 h-10 text-sm font-medium rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors mt-4"
                 >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                 </button>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t">
                 <button
                    onClick={onClose}
                    className="inline-flex items-center px-4 h-10 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                 >
                    Done
                 </button>
            </div>
        </Modal>
    );
};

export default OptionsEditorModal;