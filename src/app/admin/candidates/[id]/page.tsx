'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  FileCheck,
  CheckCircle,
  XCircle,
  Calendar,
  Sliders
} from 'lucide-react';

interface CandidateDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string | null;
  address: string | null;
  web: string | null;
  socialUrls: string; // JSON
  education: string; // JSON
  experience: string; // JSON
  skills: string; // JSON
  resumeUrl: string | null;
  status: string;
  score: number;
  scoreDetails: string; // JSON
  createdAt: string;
  jobPosting: {
    title: string;
  };
  answers: Array<{
    id: string;
    answer: string;
    question: {
      text: string;
    }
  }>;
}

export default function CandidateProfile() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { t } = useLanguage();

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCandidate = useCallback(() => {
    fetch(`/api/candidates/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setCandidate(data);
        } else {
          alert('Kandidat tidak ditemukan');
          router.push('/admin/candidates');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchCandidate();
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

  if (!candidate) return null;

  // Parsed fields
  const education = JSON.parse(candidate.education || '[]');
  const experience = JSON.parse(candidate.experience || '[]');
  const skills = JSON.parse(candidate.skills || '[]');
  const scoreDetails = JSON.parse(candidate.scoreDetails || '{}');

  return (
    <div className="candidate-profile-view animate-fade-in">
      <div className="page-header">
        <Link href="/admin/candidates" className="back-link">
          <ChevronLeft size={16} />
          <span>Kembali ke Daftar</span>
        </Link>
        <div className="page-title-section mt-2">
          <div className="eyebrow">DETAIL PROFIL</div>
          <h2 className="section-title">{candidate.name}</h2>
          <span className="applied-job-badge">{candidate.jobPosting.title}</span>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Left Column: CV Details & Answers */}
        <div className="left-column">
          {/* Summary / Bio Card */}
          {candidate.bio && (
            <div className="card profile-info-card">
              <h3 className="card-title">Tentang Kandidat</h3>
              <p className="bio-text">{candidate.bio}</p>
            </div>
          )}

          {/* Education Card */}
          <div className="card profile-info-card">
            <h3 className="card-title-with-icon">
              <GraduationCap size={22} className="card-title-icon" />
              <span>Riwayat Pendidikan</span>
            </h3>
            
            {education.length === 0 ? (
              <p className="empty-text">Tidak ada riwayat pendidikan.</p>
            ) : (
              <div className="timeline-list">
                {education.map((edu: any, idx: number) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-item-meta">
                      <span className="timeline-date">{edu.date?.start || ''} - {edu.date?.end || 'Selesai'}</span>
                      <span className="timeline-badge">{edu.level || 'Bachelor'}</span>
                    </div>
                    <div className="timeline-item-body">
                      <span className="timeline-main-title">{edu.name}</span>
                      <span className="timeline-subtitle">{edu.major || 'Umum'} • IPK: <strong>{edu.gpa || '-'}</strong></span>
                      {edu.description && <p className="timeline-desc">{edu.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience Card */}
          <div className="card profile-info-card">
            <h3 className="card-title-with-icon">
              <Briefcase size={22} className="card-title-icon" />
              <span>Pengalaman Kerja</span>
            </h3>

            {experience.length === 0 ? (
              <p className="empty-text">Tidak ada riwayat pengalaman kerja.</p>
            ) : (
              <div className="timeline-list">
                {experience.map((exp: any, idx: number) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-item-meta">
                      <span className="timeline-date">{exp.date?.start || ''} - {exp.date?.end || 'Sekarang'}</span>
                    </div>
                    <div className="timeline-item-body">
                      <span className="timeline-main-title">{exp.position}</span>
                      <span className="timeline-subtitle"><strong>{exp.company}</strong></span>
                      {exp.description && <p className="timeline-desc">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Answers Card */}
          <div className="card profile-info-card">
            <h3 className="card-title-with-icon">
              <FileCheck size={22} className="card-title-icon" />
              <span>Jawaban Pertanyaan Tambahan</span>
            </h3>

            {candidate.answers.length === 0 ? (
              <p className="empty-text">Tidak ada pertanyaan tambahan untuk lowongan ini.</p>
            ) : (
              <div className="answers-list-profile">
                {candidate.answers.map((ans, idx) => (
                  <div key={ans.id} className="answer-item-profile">
                    <span className="profile-question-text">{idx + 1}. {ans.question.text}</span>
                    <div className="profile-answer-text">
                      {ans.answer === 'Yes' || ans.answer === 'No' ? (
                        <span className={`badge ${ans.answer === 'Yes' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem' }}>
                          {ans.answer === 'Yes' ? 'Ya' : 'Tidak'}
                        </span>
                      ) : (
                        <p>{ans.answer}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scoring Summary & Status */}
        <div className="right-column">
          {/* Screening Score Card */}
          <div className="card score-summary-card">
            <div className="score-header-big">
              <span className="score-lbl">Skor Kelulusan</span>
              <h2 className="score-percent" style={{ 
                color: candidate.score >= 70 ? '#27ae60' : candidate.score >= 50 ? '#d35400' : '#c0392b'
              }}>
                {Math.round(candidate.score)}%
              </h2>
            </div>

            <div className="score-details-list">
              {/* Skill Match */}
              <div className="score-detail-item">
                <div className="flex-between text-sm">
                  <span>Kecocokan Keahlian (40%)</span>
                  <strong>{scoreDetails.skillsMatch || 0}%</strong>
                </div>
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${scoreDetails.skillsMatch || 0}%`, backgroundColor: '#3498db' }}></div></div>
              </div>

              {/* Experience Match */}
              <div className="score-detail-item">
                <div className="flex-between text-sm">
                  <span>Kecocokan Pengalaman (30%)</span>
                  <strong>{scoreDetails.experienceMatch || 0}%</strong>
                </div>
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${scoreDetails.experienceMatch || 0}%`, backgroundColor: '#e67e22' }}></div></div>
                <span className="score-subtext">Total Pengalaman: {scoreDetails.experienceYears || 0} Tahun</span>
              </div>

              {/* Education Match */}
              <div className="score-detail-item">
                <div className="flex-between text-sm">
                  <span>Kecocokan Tingkat Pendidikan (15%)</span>
                  <strong>{scoreDetails.educationMatch || 0}%</strong>
                </div>
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${scoreDetails.educationMatch || 0}%`, backgroundColor: '#9b59b6' }}></div></div>
                <span className="score-subtext">Pendidikan Tertinggi: {scoreDetails.candidateHighestEducation || '-'}</span>
              </div>

              {/* GPA Match */}
              <div className="score-detail-item">
                <div className="flex-between text-sm">
                  <span>Kecocokan IPK / GPA (15%)</span>
                  <strong>{scoreDetails.gpaMatch || 0}%</strong>
                </div>
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${scoreDetails.gpaMatch || 0}%`, backgroundColor: '#2ecc71' }}></div></div>
                <span className="score-subtext">IPK Kandidat: {scoreDetails.candidateHighestGpa || '0'}</span>
              </div>
            </div>

            {/* Skill Lists */}
            {scoreDetails.skillsFound && scoreDetails.skillsFound.length > 0 && (
              <div className="skills-extracted-list">
                <span className="subhead-title">Keahlian Ditemukan:</span>
                <div className="tags-row-profile">
                  {scoreDetails.skillsFound.map((s: string, idx: number) => (
                    <span key={idx} className="tag-profile found-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {scoreDetails.skillsMissing && scoreDetails.skillsMissing.length > 0 && (
              <div className="skills-extracted-list mt-4">
                <span className="subhead-title">Keahlian Wajib Kurang:</span>
                <div className="tags-row-profile">
                  {scoreDetails.skillsMissing.map((s: string, idx: number) => (
                    <span key={idx} className="tag-profile missing-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Details Card */}
          <div className="card contact-details-card">
            <h3 className="card-title">Kontak Detail</h3>
            <ul className="contact-list">
              <li>
                <Mail size={16} className="contact-icon" />
                <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
              </li>
              <li>
                <Phone size={16} className="contact-icon" />
                <a href={`tel:${candidate.phone}`}>{candidate.phone}</a>
              </li>
              {candidate.address && (
                <li>
                  <MapPin size={16} className="contact-icon" />
                  <span>{candidate.address}</span>
                </li>
              )}
              {candidate.web && (
                <li>
                  <Globe size={16} className="contact-icon" />
                  <a href={candidate.web} target="_blank" rel="noopener noreferrer">{candidate.web}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Action Status Card */}
          <div className="card action-status-card">
            <h3 className="card-title">Aksi & Status</h3>
            
            <div className="status-indicator">
              <span className="status-lbl-small">Status Saat Ini:</span>
              <span className={`status-badge-inline status-${candidate.status.toLowerCase()}`}>
                {t(`candidates.${candidate.status.toLowerCase()}`)}
              </span>
            </div>

            <div className="action-buttons-grid">
              {(candidate.status === 'SHORTLISTED' || candidate.status === 'SCREENED') && (
                <Link 
                  href={`/admin/interviews/new?candidateId=${candidate.id}`} 
                  className="btn btn-primary btn-pill action-main-btn"
                >
                  <Calendar size={18} />
                  <span>Jadwalkan Wawancara</span>
                </Link>
              )}

              {candidate.status !== 'ACCEPTED' && (
                <button 
                  onClick={() => handleUpdateStatus('ACCEPTED')} 
                  className="btn btn-secondary btn-pill action-sub-btn green-btn"
                >
                  <CheckCircle size={16} />
                  <span>Terima Kandidat</span>
                </button>
              )}

              {candidate.status !== 'REJECTED' && (
                <button 
                  onClick={() => handleUpdateStatus('REJECTED')} 
                  className="btn btn-secondary btn-pill action-sub-btn red-btn"
                >
                  <XCircle size={16} />
                  <span>Tolak Kandidat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .candidate-profile-view {
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

        .applied-job-badge {
          display: inline-block;
          background-color: var(--dust-taupe);
          color: var(--charcoal);
          padding: 4px 14px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          margin-top: 8px;
        }

        .profile-layout-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
        }

        @media (max-width: 900px) {
          .profile-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        .profile-info-card {
          background-color: var(--white);
          margin-bottom: 24px;
          padding: 40px;
        }

        .card-title {
          font-size: 1.25rem;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--dust-taupe);
          padding-bottom: 12px;
        }

        .card-title-with-icon {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--dust-taupe);
          padding-bottom: 12px;
        }

        .card-title-icon {
          color: var(--primary);
        }

        .bio-text {
          color: var(--charcoal);
          font-size: 1rem;
          line-height: 1.6;
        }

        .empty-text {
          color: var(--slate-gray);
          font-style: italic;
        }

        /* Timeline Styles */
        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          padding-left: 20px;
        }
        .timeline-list::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background-color: var(--dust-taupe);
        }

        .timeline-item {
          position: relative;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -20px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--primary);
          border: 2px solid var(--white);
        }

        .timeline-item-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .timeline-date {
          font-size: 0.85rem;
          color: var(--slate-gray);
          font-weight: 700;
        }

        .timeline-badge {
          font-size: 0.75rem;
          background-color: var(--canvas-cream);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
          color: var(--charcoal);
        }

        .timeline-main-title {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ink-black);
        }

        .timeline-subtitle {
          font-size: 0.9rem;
          color: var(--slate-gray);
        }

        .timeline-desc {
          margin-top: 8px;
          font-size: 0.95rem;
          color: var(--charcoal);
          line-height: 1.5;
        }

        /* Answers Profile */
        .answers-list-profile {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .answer-item-profile {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background-color: var(--canvas-cream);
          padding: 16px 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--dust-taupe);
        }

        .profile-question-text {
          font-weight: 700;
          color: var(--ink-black);
          font-size: 0.95rem;
        }

        .profile-answer-text {
          color: var(--charcoal);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        /* Right Column Scoring */
        .score-summary-card {
          background-color: var(--white);
          padding: 40px;
          margin-bottom: 24px;
        }

        .score-header-big {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--dust-taupe);
          padding-bottom: 20px;
        }

        .score-lbl {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--slate-gray);
        }

        .score-percent {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1;
          margin-top: 4px;
        }

        .score-details-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .score-detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
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

        .score-subtext {
          font-size: 0.8rem;
          color: var(--slate-gray);
        }

        .skills-extracted-list {
          border-top: 1px solid var(--dust-taupe);
          margin-top: 24px;
          padding-top: 20px;
        }

        .subhead-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--slate-gray);
          display: block;
          margin-bottom: 10px;
        }

        .tags-row-profile {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag-profile {
          font-size: 0.8rem;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-weight: 700;
        }

        .found-tag {
          background-color: rgba(46, 204, 113, 0.1);
          color: #27ae60;
        }

        .missing-tag {
          background-color: rgba(231, 76, 60, 0.1);
          color: #c0392b;
        }

        .mt-4 { margin-top: 16px; }

        /* Contact details */
        .contact-details-card {
          background-color: var(--white);
          padding: 40px;
          margin-bottom: 24px;
        }

        .contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contact-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          color: var(--charcoal);
        }

        .contact-list li a {
          color: var(--link-blue);
          font-weight: 500;
        }

        .contact-icon {
          color: var(--slate-gray);
          flex-shrink: 0;
        }

        /* Action Status Card */
        .action-status-card {
          background-color: var(--white);
          padding: 40px;
        }

        .status-indicator {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--canvas-cream);
          padding: 12px 20px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
          border: 1px solid var(--dust-taupe);
        }

        .status-lbl-small {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--slate-gray);
        }

        .status-badge-inline {
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-screened { background-color: #e3f2fd; color: #1e88e5; }
        .status-shortlisted { background-color: #e8f5e9; color: #2e7d32; }
        .status-interview { background-color: #fff3e0; color: #ef6c00; }
        .status-accepted { background-color: #e8f5e9; color: #2e7d32; }
        .status-rejected { background-color: #ffebee; color: #c62828; }

        .action-buttons-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-main-btn {
          width: 100%;
          padding: 12px 24px;
        }

        .action-sub-btn {
          width: 100%;
          padding: 10px 24px;
          font-size: 0.95rem;
        }

        .green-btn {
          border-color: #27ae60;
          color: #27ae60;
        }
        .green-btn:hover {
          background-color: rgba(39, 174, 96, 0.08);
        }

        .red-btn {
          border-color: #c0392b;
          color: #c0392b;
        }
        .red-btn:hover {
          background-color: rgba(192, 57, 43, 0.08);
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
