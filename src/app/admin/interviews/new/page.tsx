'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { ChevronLeft, Calendar, Video, Clock, User, Save } from 'lucide-react';
import Link from 'next/link';

function InterviewSchedulerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId');
  const { t } = useLanguage();

  const [candidate, setCandidate] = useState<any>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(!!candidateId);

  // Form states
  const [title, setTitle] = useState('Wawancara Tahap Pertama');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [hrEmail, setHrEmail] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [customMeetLink, setCustomMeetLink] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (candidateId) {
      fetch(`/api/candidates/${candidateId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setCandidate(data);
            // Default title based on candidate & job
            setTitle(`Wawancara ${data.jobPosting.title}: ${data.name}`);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingCandidate(false));
    }
  }, [candidateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId) {
      alert('Kandidat tidak valid!');
      return;
    }
    if (!date || !time || !hrEmail || !userEmail) {
      alert('Harap isi semua kolom wajib!');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          title,
          date,
          time,
          duration: parseInt(duration) || 60,
          hrEmail,
          userEmail,
          customMeetLink: customMeetLink.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal menjadwalkan wawancara.');
      } else {
        alert('Wawancara berhasil dijadwalkan, undangan kalender dan email notifikasi telah dikirim!');
        router.push('/admin/interviews');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingCandidate) {
    return <div style={{ padding: '40px', color: 'var(--slate-gray)' }}>{t('common.loading')}</div>;
  }

  return (
    <div className="new-interview-view animate-fade-in">
      <div className="page-header">
        <Link href={`/admin/candidates/${candidateId || ''}`} className="back-link">
          <ChevronLeft size={16} />
          <span>Kembali ke Detail Kandidat</span>
        </Link>
        <div className="page-title-section mt-2">
          <div className="eyebrow">{t('common.interviews')}</div>
          <h2 className="section-title">Jadwalkan Wawancara Baru</h2>
        </div>
      </div>

      <div className="scheduler-layout">
        {/* Candidate Detail Card */}
        {candidate && (
          <div className="card candidate-summary-card">
            <h3 className="card-title">Kandidat Terpilih</h3>
            <div className="candidate-card-body">
              <div className="candidate-avatar-p">
                <User size={24} />
              </div>
              <div className="candidate-meta-p">
                <span className="c-name">{candidate.name}</span>
                <span className="c-email">{candidate.email}</span>
                <span className="c-job">{candidate.jobPosting.title}</span>
              </div>
            </div>
            <div className="candidate-score-p">
              <span>Skor Screening:</span>
              <strong>{Math.round(candidate.score)}%</strong>
            </div>
          </div>
        )}

        {/* Schedule Form */}
        <div className="card form-scheduler-card">
          <form onSubmit={handleSubmit} className="scheduler-form">
            <div className="form-group">
              <label className="form-label">{t('interviews.title')} *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="form-input" 
                required 
              />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">{t('interviews.date')} *</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('interviews.time')} *</label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={e => setTime(e.target.value)} 
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('interviews.duration')} *</label>
                <select value={duration} onChange={e => setDuration(e.target.value)} className="form-select">
                  <option value="30">30 menit</option>
                  <option value="45">45 menit</option>
                  <option value="60">60 menit (1 Jam)</option>
                  <option value="90">90 menit</option>
                  <option value="120">120 menit (2 Jam)</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">{t('interviews.hrEmail')} *</label>
                <input 
                  type="email" 
                  value={hrEmail} 
                  onChange={e => setHrEmail(e.target.value)} 
                  className="form-input" 
                  placeholder="hr@perusahaan.com"
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('interviews.userEmail')} *</label>
                <input 
                  type="email" 
                  value={userEmail} 
                  onChange={e => setUserEmail(e.target.value)} 
                  className="form-input" 
                  placeholder="user-manager@perusahaan.com"
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('interviews.meetLink')}</label>
              <input 
                type="text" 
                value={customMeetLink} 
                onChange={e => setCustomMeetLink(e.target.value)} 
                className="form-input" 
                placeholder="Contoh: https://meet.google.com/abc-defg-hij (Opsional)"
              />
              <span className="input-hint">Jika dikosongkan, sistem Google Calendar akan menghasilkan tautan Google Meet secara otomatis.</span>
            </div>

            <div className="form-actions">
              <Link href={`/admin/candidates/${candidateId || ''}`} className="btn btn-secondary btn-pill">
                {t('common.cancel')}
              </Link>
              <button type="submit" className="btn btn-primary btn-pill" disabled={saving}>
                <Save size={18} />
                {saving ? t('common.loading') : 'Jadwalkan & Kirim Undangan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .new-interview-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--slate-gray);
          font-size: 0.95rem;
          font-weight: 500;
        }
        .back-link:hover {
          color: var(--primary);
        }

        .mt-2 { margin-top: 8px; }

        .section-title {
          font-size: 2.25rem;
        }

        .scheduler-layout {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .scheduler-layout {
            grid-template-columns: 1fr;
          }
        }

        .candidate-summary-card {
          background-color: var(--white);
          padding: 32px;
        }

        .card-title {
          font-size: 1.15rem;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--dust-taupe);
          padding-bottom: 12px;
        }

        .candidate-card-body {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .candidate-avatar-p {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--canvas-cream);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--slate-gray);
          border: 1px solid var(--dust-taupe);
        }

        .candidate-meta-p {
          display: flex;
          flex-direction: column;
        }

        .c-name {
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--ink-black);
        }

        .c-email {
          font-size: 0.85rem;
          color: var(--slate-gray);
        }

        .c-job {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 700;
        }

        .candidate-score-p {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background-color: var(--canvas-cream);
          border-radius: var(--radius-md);
          border: 1px solid var(--dust-taupe);
        }

        .candidate-score-p strong {
          color: #27ae60;
          font-size: 1.15rem;
        }

        .form-scheduler-card {
          background-color: var(--white);
          padding: 40px;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.2fr;
          gap: 24px;
        }

        @media (max-width: 600px) {
          .form-row-2, .form-row-3 {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .input-hint {
          display: block;
          font-size: 0.8rem;
          color: var(--slate-gray);
          margin-top: 6px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 24px;
          border-top: 1px solid var(--dust-taupe);
          padding-top: 24px;
        }

        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function NewInterview() {
  return (
    <Suspense fallback={<div>Memuat halaman...</div>}>
      <InterviewSchedulerForm />
    </Suspense>
  );
}
