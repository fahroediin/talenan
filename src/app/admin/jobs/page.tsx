'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';
import { Plus, Briefcase, MapPin, Users, Edit, Trash, ExternalLink } from 'lucide-react';

interface JobItem {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  type: string | null;
  status: string;
  createdAt: string;
  _count: {
    candidates: number;
  }
}

export default function JobList() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setJobs(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lowongan ini beserta data terkait?')) return;
    
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchJobs();
      } else {
        alert('Gagal menghapus lowongan.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--slate-gray)' }}>{t('common.loading')}</div>;
  }

  return (
    <div className="jobs-view animate-fade-in">
      <div className="flex-between page-title-section">
        <div>
          <div className="eyebrow">{t('common.jobs')}</div>
          <h2 className="section-title">{t('jobs.list')}</h2>
        </div>
        <Link href="/admin/jobs/new" className="btn btn-primary btn-pill">
          <Plus size={18} />
          {t('jobs.createJob')}
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card empty-card text-center">
          <Briefcase size={48} className="empty-icon" />
          <h3>Belum ada lowongan pekerjaan</h3>
          <p>Mulai dengan membuat posting lowongan pekerjaan baru untuk menerima lamaran kandidat.</p>
          <Link href="/admin/jobs/new" className="btn btn-primary btn-pill mt-4">
            Buat Lowongan Sekarang
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('jobs.title')}</th>
                <th>Tipe & Lokasi</th>
                <th>Kandidat Melamar</th>
                <th>Tanggal Dibuat</th>
                <th>Status</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="job-title-cell">
                      <span className="job-name">{job.title}</span>
                      <a href={`/apply/${job.slug}`} target="_blank" rel="noopener noreferrer" className="public-link">
                        <span>Laman Lamaran</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="meta-cell">
                      <span className="job-type-badge">{job.type || 'Full-time'}</span>
                      <span className="job-location">
                        <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                        {job.location || 'Remote'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="candidates-cell">
                      <Users size={16} className="text-slate" />
                      <strong>{job._count.candidates}</strong> pelamar
                    </div>
                  </td>
                  <td>
                    {new Date(job.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <span className={`status-badge-inline status-${job.status.toLowerCase()}`}>
                      {t(`jobs.status.${job.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link href={`/admin/jobs/${job.id}/edit`} className="action-btn edit-btn" title={t('common.edit')}>
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(job.id)} className="action-btn delete-btn" title={t('common.delete')}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .jobs-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          font-size: 2.25rem;
          margin-top: 8px;
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

        .mt-4 { margin-top: 16px; }

        .job-title-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .job-name {
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--ink-black);
        }

        .public-link {
          font-size: 0.8rem;
          color: var(--link-blue);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }

        .meta-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .job-type-badge {
          background-color: var(--canvas-cream);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--charcoal);
          width: fit-content;
        }

        .job-location {
          font-size: 0.85rem;
          color: var(--slate-gray);
        }

        .candidates-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
        }

        .text-slate {
          color: var(--slate-gray);
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

        .edit-btn:hover {
          background-color: var(--ink-black);
          color: var(--canvas-cream);
          border-color: var(--ink-black);
        }

        .delete-btn:hover {
          background-color: #c0392b;
          color: white;
          border-color: #c0392b;
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
