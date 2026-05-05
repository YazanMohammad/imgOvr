import { Link } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <ImageIcon size={22} className="text-indigo-600" />
        <span>ImageVault</span>
      </Link>
      <Link
        to="/upload"
        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        + Upload
      </Link>
    </nav>
  );
}
