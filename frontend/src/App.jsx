import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ImageList from './pages/ImageList';
import ImageUpload from './pages/ImageUpload';
import ImageDetail from './pages/ImageDetail';
import ImageEdit from './pages/ImageEdit';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50">
        <Routes>
          <Route path="/" element={<ImageList />} />
          <Route path="/upload" element={<ImageUpload />} />
          <Route path="/images/:id" element={<ImageDetail />} />
          <Route path="/images/:id/edit" element={<ImageEdit />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
