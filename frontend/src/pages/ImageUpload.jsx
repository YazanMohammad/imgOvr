import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/api';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';

export default function ImageUpload() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { toast.error('Please select an image.'); return; }
    if (!title.trim()) { toast.error('Title is required.'); return; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title.trim());
    fd.append('description', description.trim());
    if (overlayText.trim()) fd.append('overlayText', overlayText.trim());

    setSubmitting(true);
    try {
      const { data } = await uploadImage(fd);
      toast.success('Image uploaded!');
      nav(`/images/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">Upload Image</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 p-4 text-slate-500 transition hover:border-indigo-500">
          {preview
            ? <img src={preview} className="max-h-[260px] w-full rounded-md object-contain" alt="preview" />
            : <><UploadCloud size={40} /><span>Click to select image</span></>}
          <input type="file" accept="image/*" onChange={handleFile} hidden />
        </label>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Sunset in Amman"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional description..."
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overlay Text (optional)</label>
          <input
            value={overlayText}
            onChange={e => setOverlayText(e.target.value)}
            placeholder="Text to overlay on image"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}
