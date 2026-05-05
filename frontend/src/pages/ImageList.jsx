import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImages, fileUrl } from '../services/api';
import { Loader2 } from 'lucide-react';

export default function ImageList() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getImages()
      .then((r) => setImages(r.data))
      .catch(() => setError('Failed to load images.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  if (error) {
    return <div className="flex h-[60vh] items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">All Images</h1>
      {images.length === 0 && (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-sm text-slate-500">
          <span>No images yet.</span>
          <Link to="/upload" className="font-medium text-indigo-600 hover:text-indigo-700">
            Upload one!
          </Link>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
        {images.map((img) => (
          <Link
            key={img.id}
            to={`/images/${img.id}`}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-150 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
              <img src={fileUrl(img.fileName)} alt={img.title} />
              {img.hasOverlay && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                  Overlay
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="truncate text-sm font-semibold text-slate-900">{img.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {(img.fileSize / 1024).toFixed(1)} KB &bull; {new Date(img.createdAt).toLocaleDateString()}
              </p>
              {img.description && <p className="mt-2 truncate text-xs text-slate-500">{img.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
