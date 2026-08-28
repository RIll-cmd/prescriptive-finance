'use client';

import React, { useState } from 'react';
import { useCategoryStore } from '@/stores/category-store';
import { Category } from '@financial-os/shared-types';

interface CategoryManagementModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenAddModal?: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  onOpenAddModal: propsOnOpenAddModal,
}) => {
  const { categories, deleteCategory, isManageModalOpen, closeManageModal, openAddModal } = useCategoryStore();

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isManageModalOpen;
  const handleClose = propsOnClose || closeManageModal;
  const handleOpenAdd = propsOnOpenAddModal || openAddModal;

  const [selectedCatToDelete, setSelectedCatToDelete] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const customCategories = categories.filter((c) => !c.is_default && c.user_id);
  const defaultCategories = categories.filter((c) => c.is_default);

  const handleDelete = async () => {
    if (!selectedCatToDelete) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      await deleteCategory(selectedCatToDelete.id, reassignTargetId || undefined);
      setSelectedCatToDelete(null);
      setReassignTargetId('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[540px] max-h-[85vh] flex flex-col rounded-[24px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_2px_12px_rgba(56,105,210,0.3)]">
              <span className="material-symbols-rounded text-[18px] text-white">tune</span>
            </div>
            <div>
              <h2 className="text-[1.15rem] font-bold tracking-tight">Categories</h2>
              <p className="text-[0.72rem] text-white/40">Manage default and custom spending classifications</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] flex items-center gap-2 shrink-0">
            <span className="material-symbols-rounded text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Delete Confirmation Sub-modal */}
        {selectedCatToDelete && (
          <div className="mb-4 p-4 rounded-[16px] bg-red-500/10 border border-red-500/30 text-white text-[0.82rem] shrink-0 animate-[cardReveal_0.2s_ease-out]">
            <h4 className="font-bold text-red-300 mb-1">Delete "{selectedCatToDelete.name}"?</h4>
            <p className="text-white/60 text-[0.75rem] mb-3">
              Existing transactions in this category will not be deleted. You can reassign them to another category.
            </p>

            <div className="mb-3">
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                Reassign existing transactions to:
              </label>
              <select
                value={reassignTargetId}
                onChange={(e) => setReassignTargetId(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.1] rounded-[8px] px-3 py-2 text-[0.78rem] text-white outline-none focus:border-red-400"
              >
                <option value="">Leave Uncategorized (None)</option>
                {categories
                  .filter((c) => c.id !== selectedCatToDelete.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCatToDelete(null)}
                className="px-3 py-1.5 rounded-[8px] bg-white/10 text-white text-[0.75rem] font-semibold hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-[8px] bg-red-500 text-white text-[0.75rem] font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* Custom Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[0.75rem] font-bold text-white/40 uppercase tracking-wider">
                Custom Categories ({customCategories.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  handleOpenAdd();
                }}
                className="text-[0.72rem] font-semibold text-[#d9a4ff] hover:text-white flex items-center gap-1"
              >
                <span className="material-symbols-rounded text-[14px]">add</span>
                New Category
              </button>
            </div>

            {customCategories.length === 0 ? (
              <div className="p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.04] text-center text-white/30 text-[0.78rem]">
                No custom categories created yet. Click "+ New Category" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 text-white shadow-sm"
                        style={{ backgroundColor: `${cat.color_hex}26`, color: cat.color_hex }}
                      >
                        <span className="material-symbols-rounded text-[18px]">{cat.icon}</span>
                      </div>
                      <span className="text-[0.82rem] font-medium text-white/90 truncate">{cat.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCatToDelete(cat)}
                      className="w-7 h-7 rounded-[6px] hover:bg-red-500/10 text-white/30 hover:text-red-400 flex items-center justify-center transition-all shrink-0"
                    >
                      <span className="material-symbols-rounded text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Default Categories Section */}
          <div>
            <h3 className="text-[0.75rem] font-bold text-white/40 uppercase tracking-wider mb-2.5">
              Default System Categories ({defaultCategories.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {defaultCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 text-white shadow-sm"
                      style={{ backgroundColor: `${cat.color_hex}20`, color: cat.color_hex }}
                    >
                      <span className="material-symbols-rounded text-[18px]">{cat.icon}</span>
                    </div>
                    <span className="text-[0.82rem] font-medium text-white/80 truncate">{cat.name}</span>
                  </div>

                  <span className="text-[0.65rem] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.06]">
                    {cat.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.06] flex justify-end shrink-0 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.1] text-[0.82rem] font-semibold text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementModal;
