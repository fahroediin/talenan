'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, MapPin, Calendar, DollarSign, UploadCloud, AlertCircle, FileText } from 'lucide-react';
import { LanguageProvider, getTranslation } from '@/lib/i18n';

interface JobData {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string | null;
  type: string | null;
  salaryRange: string | null;
  status: string;
}

export default function ApplyJob() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<any>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple locale state for candidate page (default to ID)
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const t = (key: string) => getTranslation(lang, key);

  useEffect(() => {
    fetch(`/api/jobs/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setJob(data);
        } else {
          setError('Lowongan tidak ditemukan atau sudah ditutup.');
        }
      })
      .catch(() => setError('Gagal memuat detail lowongan.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Format file tidak didukung. Harap unggah PDF atau Gambar (JPG/PNG).');
      return;
    }
    // Limit file size to 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal adalah 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUploadCV = async () => {
    if (!file || !job) return;
    setUploading(true);
    setProgress(0);
    setError('');

    // Start progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        const increment = prev < 50 ? 10 : (prev < 80 ? 5 : 2);
        return prev + increment;
      });
    }, 200);
    progressIntervalRef.current = interval;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('useMock', 'false');

    try {
      let res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      let responseData = await res.json();
      
      // Auto-fallback to mock in developer environment if auth fails
      if (!res.ok && (responseData.error?.includes('failed') || responseData.error?.includes('credentials') || res.status === 401)) {
        console.warn('OCR Server failed. Falling back to mock for presentation...');
        formData.set('useMock', 'true');
        res = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });
        responseData = await res.json();
      }

      if (!res.ok) {
        throw new Error(responseData.error || 'Gagal mengekstrak CV dengan OCR');
      }

      // Save OCR data and job metadata into sessionStorage
      const applicationData = {
        jobPostingId: job.id,
        filename: file.name,
        personal: responseData.data?.personal || {},
        social: responseData.data?.social || {},
        education: responseData.data?.education || [],
        experience: responseData.data?.experience || [],
        skills: responseData.data?.skill || [],
      };

      sessionStorage.setItem('talenan_application_data', JSON.stringify(applicationData));
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(100);
      
      // Delay redirect slightly so user sees 100% complete
      setTimeout(() => {
        router.push(`/apply/${slug}/review`);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memproses CV menggunakan OCR. Coba lagi atau pastikan koneksi lancar.');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="apply-loading">{t('common.loading')}</div>;
  }

  if (error && !job) {
    return (
      <div className="apply-error-container">
        <AlertCircle size={48} className="error-icon" />
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="public-apply-page">
      {/* Dynamic Header */}
      <header className="public-header">
        <div className="brand-logo">
          <span className="brand-logo-text">Talenan</span>
        </div>
        <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="btn btn-secondary btn-pill">
          {lang === 'id' ? 'English' : 'Indonesia'}
        </button>
      </header>

      <main className="apply-main-content">
        <div className="job-details-panel card">
          <div className="eyebrow">{job?.type || 'Full-time'}</div>
          <h1 className="job-title">{job?.title}</h1>
          
          <div className="job-meta-row">
            <span className="meta-tag">
              <MapPin size={16} />
              {job?.location || 'Remote'}
            </span>
            {job?.salaryRange && (
              <span className="meta-tag">
                <DollarSign size={16} />
                {job.salaryRange}
              </span>
            )}
          </div>

          <div className="job-info-section">
            <h3 className="section-title">{t('jobs.description')}</h3>
            <div className="markdown-content">{job?.description}</div>
          </div>

          <div className="job-info-section">
            <h3 className="section-title">{t('jobs.requirements')}</h3>
            <div className="markdown-content">
              {job?.requirements.split('\n').map((line, i) => (
                <p key={i} className="requirement-line">{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="apply-form-panel card">
          <div className="eyebrow">SUBMIT APPLICATION</div>
          <h2 className="panel-title">{t('candidates.uploadCV')}</h2>
          <p className="panel-desc">Gunakan file CV terbaru Anda untuk membaca profil otomatis dengan OCR.</p>

          {error && <div className="error-message-box">{error}</div>}

          {!file ? (
            <div 
              className={`dropzone-container ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerUpload}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
                accept=".pdf,image/*"
              />
              <UploadCloud size={48} className="upload-icon" />
              <h3>{t('candidates.uploadCVDesc')}</h3>
              <span className="file-limits">Mendukung PDF & Gambar (Max 10MB)</span>
            </div>
          ) : (
            <div className="selected-file-card">
              <FileText size={40} className="file-icon" />
              <div className="file-details">
                <span className="filename">{file.name}</span>
                <span className="filesize">{Math.round(file.size / 1024)} KB</span>
              </div>
              <button 
                onClick={() => setFile(null)} 
                className="btn btn-secondary btn-pill remove-file-btn"
                disabled={uploading}
              >
                Ganti File
              </button>
            </div>
          )}

          {file && !uploading && (
            <button 
              onClick={handleUploadCV} 
              className="btn btn-primary btn-pill upload-btn" 
              style={{ width: '100%', marginTop: '24px', padding: '14px' }}
            >
              Unggah & Analisis CV
            </button>
          )}

          {uploading && (
            <div className="progress-container">
              <div className="progress-bar-label">
                <span>{t('candidates.ocrProcessing')}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .public-apply-page {
          min-height: 100vh;
          background-color: var(--canvas-cream);
          display: flex;
          flex-direction: column;
        }

        .public-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 48px;
          border-bottom: 1px solid var(--dust-taupe);
          background-color: var(--lifted-cream);
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .apply-main-content {
          max-width: 1200px;
          margin: 40px auto 80px auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 32px;
          width: 100%;
        }

        @media (max-width: 900px) {
          .apply-main-content {
            grid-template-columns: 1fr;
          }
        }

        .job-details-panel {
          background-color: var(--white);
          padding: 48px;
        }

        .job-title {
          font-size: 2.25rem;
          margin-top: 8px;
          margin-bottom: 16px;
        }

        .job-meta-row {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .meta-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--slate-gray);
          font-size: 0.95rem;
          background-color: var(--canvas-cream);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-weight: 500;
        }

        .job-info-section {
          margin-top: 32px;
          border-top: 1px solid var(--dust-taupe);
          padding-top: 24px;
        }

        .job-info-section .section-title {
          font-size: 1.25rem;
          margin-bottom: 16px;
          color: var(--ink-black);
        }

        .markdown-content {
          color: var(--charcoal);
          font-size: 1rem;
          line-height: 1.6;
        }

        .requirement-line {
          margin-bottom: 12px;
          position: relative;
          padding-left: 20px;
        }
        .requirement-line::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
        }

        .apply-form-panel {
          background-color: var(--white);
          padding: 48px;
          height: fit-content;
          position: sticky;
          top: 24px;
        }

        .panel-title {
          font-size: 1.75rem;
          margin-top: 8px;
          margin-bottom: 8px;
        }

        .panel-desc {
          color: var(--slate-gray);
          font-size: 0.95rem;
          margin-bottom: 32px;
        }

        .dropzone-container {
          border: 2.5px dashed var(--dust-taupe);
          border-radius: var(--radius-lg);
          padding: 60px 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: var(--canvas-cream);
        }

        .dropzone-container:hover, .dropzone-container.drag-over {
          border-color: var(--primary);
          background-color: var(--canvas-lavender);
        }

        .upload-icon {
          color: var(--slate-gray);
          margin-bottom: 16px;
        }

        .dropzone-container h3 {
          font-size: 1.1rem;
          margin-bottom: 8px;
        }

        .file-limits {
          font-size: 0.8rem;
          color: var(--slate-gray);
        }

        .selected-file-card {
          background-color: var(--canvas-cream);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid var(--dust-taupe);
        }

        .file-icon {
          color: var(--primary);
        }

        .file-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .filename {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--ink-black);
          word-break: break-all;
        }

        .filesize {
          font-size: 0.8rem;
          color: var(--slate-gray);
        }

        .remove-file-btn {
          font-size: 0.85rem;
          padding: 6px 14px;
        }

        .error-message-box {
          background-color: rgba(231, 76, 60, 0.1);
          color: #c0392b;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          margin-bottom: 24px;
          border: 1px solid rgba(231, 76, 60, 0.2);
        }

        .apply-loading {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--slate-gray);
          font-size: 1.25rem;
          background-color: var(--canvas-cream);
        }

        .apply-error-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--slate-gray);
          background-color: var(--canvas-cream);
          gap: 16px;
        }
        
        .error-icon {
          color: #c0392b;
        }

        .progress-container {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
        }

        .progress-bar-track {
          width: 100%;
          height: 8px;
          background-color: var(--canvas-cream);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--primary);
          border-radius: 4px;
          transition: width 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
