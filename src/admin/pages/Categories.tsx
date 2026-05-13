import React, { useCallback, useEffect, useState } from 'react';
import {
  HiPlus,
  HiTag,
  HiTrash,
  HiCheck,
  HiXMark,
} from 'react-icons/hi2';
import {
  Spinner,
  EmptyState,
  Modal,
  Confirm,
  Field,
  Toggle,
  inputClass,
} from '../components/ui';
import { categoriesApi } from '../api';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Category {
  category_id: number;
  name: string;
  status: number;
  priority: number;
}

interface DraftValues {
  name: string;
  priority: string;
}

interface AddFormState {
  name: string;
  priority: string;
  status: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftValues, setDraftValues] = useState<DraftValues>({ name: '', priority: '' });
  const [savingId, setSavingId] = useState<number | null>(null);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>({ name: '', priority: '', status: true });
  const [addError, setAddError] = useState<string | null>(null);
  const [addSaving, setAddSaving] = useState(false);

  // Delete
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.list();
      const data: Category[] = res.data?.data ?? [];
      data.sort((a, b) => a.priority - b.priority);
      setCategories(data);
    } catch {
      // leave current state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Inline editing helpers ────────────────────────────────────────────────────

  function startEditing(cat: Category) {
    setEditingId(cat.category_id);
    setDraftValues({ name: cat.name, priority: String(cat.priority) });
  }

  function cancelEditing() {
    setEditingId(null);
    setDraftValues({ name: '', priority: '' });
  }

  function isDirty(cat: Category): boolean {
    if (editingId !== cat.category_id) return false;
    return (
      draftValues.name !== cat.name ||
      draftValues.priority !== String(cat.priority)
    );
  }

  async function saveRow(cat: Category) {
    const newName = draftValues.name.trim();
    const newPriority = parseInt(draftValues.priority, 10);
    if (!newName) return;
    setSavingId(cat.category_id);
    try {
      await categoriesApi.update(cat.category_id, {
        name: newName,
        priority: isNaN(newPriority) ? cat.priority : newPriority,
        status: cat.status,
      });
      cancelEditing();
      await fetchCategories();
    } catch {
      // surface nothing — row stays dirty
    } finally {
      setSavingId(null);
    }
  }

  async function handlePriorityBlur(cat: Category, value: string) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed === cat.priority) return;
    setSavingId(cat.category_id);
    try {
      await categoriesApi.update(cat.category_id, {
        name: cat.name,
        priority: parsed,
        status: cat.status,
      });
      await fetchCategories();
    } catch {
      // leave as-is
    } finally {
      setSavingId(null);
    }
  }

  async function handleStatusToggle(cat: Category) {
    const newStatus = cat.status === 1 ? 0 : 1;
    // Optimistic
    setCategories(prev =>
      prev.map(c => c.category_id === cat.category_id ? { ...c, status: newStatus } : c)
    );
    try {
      await categoriesApi.update(cat.category_id, {
        name: cat.name,
        priority: cat.priority,
        status: newStatus,
      });
    } catch {
      // Revert
      setCategories(prev =>
        prev.map(c => c.category_id === cat.category_id ? { ...c, status: cat.status } : c)
      );
    }
  }

  // ── Add modal ─────────────────────────────────────────────────────────────────

  function openAdd() {
    const maxPriority = categories.length > 0
      ? Math.max(...categories.map(c => c.priority)) + 10
      : 10;
    setAddForm({ name: '', priority: String(maxPriority), status: true });
    setAddError(null);
    setShowAdd(true);
  }

  function closeAdd() {
    setShowAdd(false);
    setAddError(null);
  }

  async function handleAdd() {
    if (!addForm.name.trim()) { setAddError('Category name is required.'); return; }
    setAddError(null);
    setAddSaving(true);
    try {
      await categoriesApi.create({
        name: addForm.name.trim(),
        priority: parseInt(addForm.priority, 10) || 10,
        status: addForm.status ? 1 : 0,
      });
      closeAdd();
      await fetchCategories();
    } catch {
      setAddError('Failed to create category. Please try again.');
    } finally {
      setAddSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (confirmDelete === null) return;
    try {
      await categoriesApi.delete(confirmDelete);
      if (editingId === confirmDelete) cancelEditing();
    } catch {
      // ignore
    } finally {
      setConfirmDelete(null);
      await fetchCategories();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const deletingName = confirmDelete !== null
    ? (categories.find(c => c.category_id === confirmDelete)?.name ?? 'this category')
    : '';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black">Categories</h1>
          {!loading && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: '#EC482422', color: '#EC4824' }}
            >
              {categories.length}
            </span>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#EC4824] hover:bg-[#d4401f] text-white text-sm font-bold rounded-xl transition-colors"
        >
          <HiPlus size={18} />
          Add Category
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size={32} />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<HiTag size={56} />}
          title="No categories yet"
          action={
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-[#EC4824] hover:bg-[#d4401f] text-white text-sm font-bold rounded-xl transition-colors"
            >
              Add First Category
            </button>
          }
        />
      ) : (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-5 py-3 text-xs font-bold text-white/30 uppercase tracking-widest w-24">
                  #
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold text-white/30 uppercase tracking-widest w-32">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-bold text-white/30 uppercase tracking-widest w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => {
                const isEditingRow = editingId === cat.category_id;
                const rowDirty = isDirty(cat);
                const rowSaving = savingId === cat.category_id;

                return (
                  <tr
                    key={cat.category_id}
                    className={`border-b border-white/5 last:border-0 transition-colors ${
                      isEditingRow ? 'bg-white/[0.02]' : 'hover:bg-white/[0.015]'
                    }`}
                  >
                    {/* Priority */}
                    <td className="px-5 py-3">
                      {isEditingRow ? (
                        <input
                          type="number"
                          className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm focus:border-[#EC4824] focus:outline-none transition-colors"
                          value={draftValues.priority}
                          onChange={e =>
                            setDraftValues(prev => ({ ...prev, priority: e.target.value }))
                          }
                          onBlur={() => {
                            // priority blur save only if name is not actively edited
                          }}
                        />
                      ) : (
                        <input
                          type="number"
                          className="w-16 bg-transparent border border-transparent hover:border-white/10 rounded-lg px-2 py-1 text-white/60 text-sm focus:border-[#EC4824] focus:bg-white/5 focus:outline-none transition-colors"
                          defaultValue={cat.priority}
                          onFocus={e => e.currentTarget.select()}
                          onBlur={e => handlePriorityBlur(cat, e.target.value)}
                          key={`${cat.category_id}-${cat.priority}`}
                        />
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3">
                      {isEditingRow ? (
                        <input
                          autoFocus
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm focus:border-[#EC4824] focus:outline-none transition-colors w-full max-w-xs"
                          value={draftValues.name}
                          onChange={e =>
                            setDraftValues(prev => ({ ...prev, name: e.target.value }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveRow(cat);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                      ) : (
                        <button
                          className="text-white/80 hover:text-white text-sm font-medium text-left transition-colors group flex items-center gap-2"
                          onClick={() => startEditing(cat)}
                          title="Click to edit name"
                        >
                          {cat.name}
                          <span className="text-white/20 group-hover:text-white/40 transition-colors text-xs">
                            (edit)
                          </span>
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <Toggle
                        value={cat.status === 1}
                        onChange={() => handleStatusToggle(cat)}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isEditingRow && (
                          <>
                            <button
                              onClick={() => saveRow(cat)}
                              disabled={!rowDirty || rowSaving}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#EC4824]/15 text-[#EC4824] hover:bg-[#EC4824]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              title="Save"
                            >
                              {rowSaving ? <Spinner size={12} /> : <HiCheck size={14} />}
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                              title="Cancel"
                            >
                              <HiXMark size={16} />
                            </button>
                          </>
                        )}
                        {!isEditingRow && rowSaving && (
                          <div className="px-2">
                            <Spinner size={14} />
                          </div>
                        )}
                        <button
                          onClick={() => setConfirmDelete(cat.category_id)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <HiTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add category modal */}
      <Modal
        open={showAdd}
        onClose={closeAdd}
        title="Add Category"
        size="sm"
      >
        <div className="space-y-4">
          <Field label="Name" required>
            <input
              autoFocus
              className={inputClass}
              placeholder="e.g. Starters"
              value={addForm.name}
              onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            />
          </Field>

          <Field label="Priority" hint="Lower numbers appear first in the list.">
            <input
              type="number"
              className={inputClass}
              placeholder="10"
              value={addForm.priority}
              onChange={e => setAddForm(prev => ({ ...prev, priority: e.target.value }))}
            />
          </Field>

          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Active</span>
            <Toggle
              value={addForm.status}
              onChange={v => setAddForm(prev => ({ ...prev, status: v }))}
            />
          </div>

          {addError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {addError}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={closeAdd}
              className="px-4 py-2 text-sm text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={addSaving}
              className="px-5 py-2 text-sm font-bold bg-[#EC4824] hover:bg-[#d4401f] disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              {addSaving && <Spinner size={14} />}
              {addSaving ? 'Adding…' : 'Add Category'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Confirm
        open={confirmDelete !== null}
        danger
        message={`Are you sure you want to delete "${deletingName}"? Any menu items in this category may be affected.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
