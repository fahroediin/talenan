'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';
import { Users, Briefcase, ChevronRight, Check, X, Search, Calendar } from 'lucide-react';

interface CandidateItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  score: number;
  createdAt: string;
  jobPosting: {
    title: string;
  }
}

export default function CandidatesList() {
  const { t } = useLanguage();
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateItem[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    // Fetch all candidates
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setCandidates(data);
          setFilteredCandidates(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Fetch jobs for filter dropdown
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setJobs(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Handle filtering client-side
  useEffect(() => {
    let result = candidates;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q)
      );
    }

    if (selectedJob) {
      result = result.filter(c => c.jobPosting.title === selectedJob);
    }

    if (selectedStatus) {
      result = result.filter(c => c.status === selectedStatus);
    }

    setFilteredCandidates(result);
  }, [search, selectedJob, selectedStatus, candidates]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh local candidate list
        setCandidates(candidates.map(c => c.id === id ? { ...c, status: newStatus } : c));
      } else {
        alert('Gagal memperbarui status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--slate-gray)' }}>{t('common.loading')}</div>;
  }

  return (
    <div className="candidates-view animate-fade-in">
      <div className="page-title-section">
        <div className="eyebrow">{t('common.candidates')}</div>
        <h2 className="section-title">Manajemen Kandidat</h2>
      </div>

      {/* Filter Toolbar */}
      <div className="card filter-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input search-input-field"
          />
        </div>

        <div className="filters-row">
          <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)} className="form-select filter-select">
            <option value="">Semua Lowongan</option>
            {jobs.map((job, idx) => (
              <option key={idx} value={job.title}>{job.title}</option>
            ))}
          </select>

          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="form-select filter-select">
            <option value="">Semua Status</option>
            <option value="SCREENED">Ter-Screen</option>
            <option value="SHORTLISTED">Lolos Threshold</option>
            <option value="INTERVIEW">Wawancara</option>
            <option value="ACCEPTED">Diterima</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="card empty-card text-center">
          <Users size={48} className="empty-icon" />
          <h3>Kandidat tidak ditemukan</h3>
          <p>Belum ada pelamar yang masuk dengan kriteria filter tersebut.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nama Pelamar</th>
                <th>Lowongan Dilamar</th>
                <th>Skor Screening</th>
                <th>Tanggal Melamar</th>
                <th>Status</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="candidate-info-cell">
                      <span className="candidate-name-lbl">{c.name}</span>
                      <span className="candidate-email-lbl">{c.email} • {c.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="job-cell">
                      <Briefcase size={14} className="cell-icon" />
                      <span>{c.jobPosting.title}</span>
                    </div>
                  </td>
                  <td>
                    <div className="score-cell">
                      <span className="score-val" style={{ 
                        color: c.score >= 70 ? '#27ae60' : c.score >= 50 ? '#d35400' : '#c0392b'
                      }}>
                        {Math.round(c.score)}%
                      </span>
                      <div className="score-bar-bg">
                        <div className="score-bar-fill" style={{ 
                          width: `${c.score}%`,
                          backgroundColor: c.score >= 70 ? '#27ae60' : c.score >= 50 ? '#d35400' : '#c0392b'
                        }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {new Date(c.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <span className={`status-badge-inline status-${c.status.toLowerCase()}`}>
                      {t(`candidates.${c.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {c.status === 'SHORTLISTED' && (
                        <Link href={`/admin/interviews/new?candidateId=${c.id}`} className="action-btn interview-btn" title="Jadwalkan Wawancara">
                          <Calendar size={16} />
                        </Link>
                      )}
                      {c.status !== 'ACCEPTED' && c.status !== 'REJECTED' && (
                        <>
                          <button onClick={() => handleUpdateStatus(c.id, 'ACCEPTED')} className="action-btn accept-btn" title="Terima">
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleUpdateStatus(c.id, 'REJECTED')} className="action-btn reject-btn" title="Tolak">
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <Link href={`/admin/candidates/${c.id}`} className="action-btn detail-btn" title="Lihat Profil Lengkap">
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .candidates-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          font-size: 2.25rem;
          margin-top: 8px;
        }

        .filter-toolbar {
          background-color: var(--white);
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-radius: var(--radius-md);
        }

        @media (max-width: 768px) {
          .filter-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-gray);
        }

        .search-input-field {
          padding-left: 48px;
        }

        .filters-row {
          display: flex;
          gap: 16px;
        }

        @media (max-width: 480px) {
          .filters-row {
            flex-direction: column;
          }
        }

        .filter-select {
          min-width: 180px;
        }

        .candidate-info-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .candidate-name-lbl {
          font-weight: 700;
          color: var(--ink-black);
          font-size: 1.05rem;
        }

        .candidate-email-lbl {
          font-size: 0.85rem;
          color: var(--slate-gray);
        }

        .job-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          color: var(--charcoal);
        }

        .cell-icon {
          color: var(--slate-gray);
        }

        .score-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 120px;
        }

        .score-val {
          font-weight: 700;
          font-size: 1.05rem;
        }

        .score-bar-bg {
          width: 100%;
          height: 6px;
          background-color: var(--canvas-cream);
          border-radius: 3px;
          overflow: hidden;
        }

        .score-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        /* Inherits unified status badges from globals.css */

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          border: none;
          background: var(--white);
          border: 1px solid var(--dust-taupe);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--charcoal);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .interview-btn:hover {
          background-color: var(--link-blue);
          color: white;
          border-color: var(--link-blue);
        }

        .accept-btn:hover {
          background-color: #27ae60;
          color: white;
          border-color: #27ae60;
        }

        .reject-btn:hover {
          background-color: #c0392b;
          color: white;
          border-color: #c0392b;
        }

        .detail-btn:hover {
          background-color: var(--ink-black);
          color: var(--canvas-cream);
          border-color: var(--ink-black);
        }

        .empty-card {
          padding: 80px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          background-color: var(--white);
        }

        .empty-icon {
          color: var(--slate-gray);
          opacity: 0.5;
        }

        .empty-card h3 {
          font-size: 1.5rem;
          margin-top: 8px;
        }

        .empty-card p {
          color: var(--slate-gray);
          max-width: 480px;
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
