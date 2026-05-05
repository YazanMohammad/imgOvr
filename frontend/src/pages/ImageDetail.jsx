import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getImage, deleteImage, generateOverlay, fileUrl } from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, Pencil, Trash2, Wand2 } from 'lucide-react';

export default function ImageDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overlayText, setOverlayText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    getImage(id)
      .then((r) => { setImage(r.data); setOverlayText(r.data.overlayText || ''); })
      .catch(() => toast.error('Image not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this image permanently?')) return;
    try {
      await deleteImage(id);
      toast.success('Deleted.');
      nav('/');
    } catch {
      toast.error('Delete failed.');
    }
  }

  async function handleOverlay() {
    if (!overlayText.trim()) { toast.error('Enter overlay text first.'); return; }
    setGenerating(true);
    try {
      const { data } = await generateOverlay(id, overlayText.trim());
      setImage(data);
      setShowOverlay(true);
      toast.success('Overlay generated!');
    } catch {
      toast.error('Overlay generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  if (!image) return <div className="flex h-[60vh] items-center justify-center text-red-600">Image not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-3xl font-bold">{image.title}</h1>
          <p className="text-sm text-slate-500">
            {new Date(image.createdAt).toLocaleString()} &bull; {(image.fileSize / 1024).toFixed(1)} KB &bull; {image.contentType}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/images/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
          >
            <Pencil size={16} /> Edit
          </Link>
          <button
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            onClick={handleDelete}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {image.description && <p className="mb-5 text-slate-500">{image.description}</p>}

      <div className="mb-3 flex gap-1">
        <button
          className={`rounded-md border px-4 py-1.5 text-sm font-medium transition ${
            !showOverlay ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          onClick={() => setShowOverlay(false)}
        >
          Original
        </button>
        {image.hasOverlay && (
          <button
            className={`rounded-md border px-4 py-1.5 text-sm font-medium transition ${
              showOverlay ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            onClick={() => setShowOverlay(true)}
          >
            With Overlay
          </button>
        )}
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
        <img
          key={showOverlay ? 'overlay' : 'original'}
          src={showOverlay && image.hasOverlay
            ? fileUrl(image.overlayFileName ?? image.fileName)
            : fileUrl(image.fileName)}
          alt={image.title}
          className="max-h-[520px] w-full object-contain"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-base font-semibold text-slate-900"><Wand2 size={18} /> Generate Text Overlay</h2>
        <div className="mb-2 flex flex-col gap-2 sm:flex-row">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
            value={overlayText}
            onChange={e => setOverlayText(e.target.value)}
            placeholder="Enter text to overlay..."
          />
          <button
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleOverlay}
            disabled={generating}
          >
            {generating ? <Loader2 className="animate-spin" size={16} /> : 'Generate'}
          </button>
        </div>
        {image.overlayText && <p className="text-sm text-slate-500">Last overlay: <em>"{image.overlayText}"</em></p>}
      </div>
    </div>
  );
}
