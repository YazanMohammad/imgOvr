import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImage, updateImage } from '../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function ImageEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', overlayText: '' });

  useEffect(() => {
    getImage(id)
      .then((r) => setForm({ title: r.data.title, description: r.data.description, overlayText: r.data.overlayText || '' }))
      .catch(() => toast.error('Image not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSubmitting(true);
    try {
      await updateImage(id, form);
      toast.success('Saved!');
      nav(`/images/${id}`);
    } catch {
      toast.error('Update failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit Metadata</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overlay Text</label>
          <input
            name="overlayText"
            value={form.overlayText}
            onChange={handleChange}
            placeholder="Text used for overlay"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
            onClick={() => nav(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
