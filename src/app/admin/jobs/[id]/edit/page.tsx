'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';

interface QuestionInput {
  id?: string;
  text: string;
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO';
  options: string;
  required: boolean;
  isDeleted?: boolean;
}

export default function EditJob() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const id = params.id as string;
  
  // Job Info states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salaryRange, setSalaryRange] = useState('');
  const [status, setStatus] = useState('PUBLISHED');

  // Screening parameters states
  const [minExperience, setMinExperience] = useState('0');
  const [minGpa, setMinGpa] = useState('0');
  const [minEducation, setMinEducation] = useState('Any');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [matchThreshold, setMatchThreshold] = useState('50');

  // Custom questions states
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setTitle(data.title);
          setDescription(data.description);
          setRequirements(data.requirements);
          setLocation(data.location || '');
          setType(data.type || 'Full-time');
          setSalaryRange(data.salaryRange || '');
          setStatus(data.status);
          
          if (data.screeningParameter) {
            setMinExperience(data.screeningParameter.minExperience.toString());
            setMinGpa(data.screeningParameter.minGpa.toString());
            setMinEducation(data.screeningParameter.minEducation);
            setRequiredSkills(data.screeningParameter.requiredSkills);
            setMatchThreshold(data.screeningParameter.matchThreshold.toString());
          }
          
          if (data.questions) {
            setQuestions(data.questions);
          }
        } else {
          alert('Lowongan tidak ditemukan');
          router.push('/admin/jobs');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', type: 'TEXT', options: '', required: true }
    ]);
  };

  const handleQuestionChange = (index: number, key: keyof QuestionInput, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [key]: value };
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    const q = questions[index];
    if (q.id) {
      // Mark as deleted so backend knows to delete
      const updated = [...questions];
      updated[index] = { ...q, isDeleted: true };
      setQuestions(updated);
    } else {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !requirements) {
      alert('Judul, deskripsi, dan persyaratan wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          requirements,
          location,
          type,
          salaryRange,
          status,
          minExperience: parseInt(minExperience) || 0,
          minGpa: parseFloat(minGpa) || 0,
          minEducation,
          requiredSkills,
          matchThreshold: parseFloat(matchThreshold) || 50,
          questions
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Gagal mengubah lowongan.');
      } else {
        router.push('/admin/jobs');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--slate-gray)' }}>{t('common.loading')}</div>;
  }

  // Active questions are those not marked as deleted
  const activeQuestions = questions.filter(q => !q.isDeleted);

  return (
    <div className="edit-job-view animate-fade-in">
      <div className="page-header">
        <Link href="/admin/jobs" className="back-link">
          <ChevronLeft size={16} />
          <span>Kembali ke Daftar</span>
        </Link>
        <div className="page-title-section mt-2">
          <div className="eyebrow">{t('common.jobs')}</div>
          <h2 className="section-title">{t('jobs.editJob')}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="job-form-layout">
        {/* Step 1: Info Utama */}
        <div className="card form-section-card">
          <h3 className="section-card-title">Informasi Lowongan</h3>
          <p className="section-card-desc">Detail dasar pekerjaan yang akan dilihat oleh pelamar.</p>
          
          <div className="form-group">
            <label className="form-label">Status Lowongan</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="form-select">
              <option value="DRAFT">{t('jobs.status.draft')}</option>
              <option value="PUBLISHED">{t('jobs.status.published')}</option>
              <option value="CLOSED">{t('jobs.status.closed')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('jobs.title')} *</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">{t('jobs.type')}</label>
              <select value={type} onChange={e => setType(e.target.value)} className="form-select">
                <option value="Full-time">Full-time</option>
                <option value="Contract">Kontrak (Contract)</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Magang (Internship)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('jobs.location')}</label>
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('jobs.salary')}</label>
            <input 
              type="text" 
              value={salaryRange} 
              onChange={e => setSalaryRange(e.target.value)} 
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('jobs.description')} *</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="form-textarea" 
              rows={6}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">{t('jobs.requirements')} *</label>
            <textarea 
              value={requirements} 
              onChange={e => setRequirements(e.target.value)} 
              className="form-textarea" 
              rows={6}
              required
            ></textarea>
          </div>
        </div>

        {/* Step 2: Parameter Auto-Screening */}
        <div className="card form-section-card">
          <h3 className="section-card-title">{t('jobs.screeningParams')}</h3>
          <p className="section-card-desc">Gunakan parameter ini untuk menghitung kecocokan CV kandidat secara otomatis.</p>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">{t('jobs.minExperience')}</label>
              <input 
                type="number" 
                min="0" 
                value={minExperience} 
                onChange={e => setMinExperience(e.target.value)} 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('jobs.minGpa')}</label>
              <input 
                type="number" 
                min="0" 
                max="4" 
                step="0.1" 
                value={minGpa} 
                onChange={e => setMinGpa(e.target.value)} 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('jobs.minEducation')}</label>
              <select value={minEducation} onChange={e => setMinEducation(e.target.value)} className="form-select">
                <option value="Any">Bebas (Any)</option>
                <option value="High School">SMA / SMK</option>
                <option value="Associate">D3 (Diploma)</option>
                <option value="Bachelor">S1 (Sarjana)</option>
                <option value="Master">S2 (Magister)</option>
                <option value="PhD">S3 (Doktor)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('jobs.requiredSkills')}</label>
            <input 
              type="text" 
              value={requiredSkills} 
              onChange={e => setRequiredSkills(e.target.value)} 
              className="form-input"
            />
            <span className="input-hint">Pisahkan keahlian wajib dengan tanda koma.</span>
          </div>

          <div className="form-group">
            <label className="form-label">{t('jobs.matchThreshold')}</label>
            <div className="range-container">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={matchThreshold} 
                onChange={e => setMatchThreshold(e.target.value)} 
                className="range-slider"
              />
              <span className="range-value">{matchThreshold}%</span>
            </div>
          </div>
        </div>

        {/* Step 3: Pertanyaan Tambahan */}
        <div className="card form-section-card">
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <h3 className="section-card-title">{t('jobs.additionalQuestions')}</h3>
            <button type="button" onClick={handleAddQuestion} className="btn btn-secondary btn-pill text-sm">
              <Plus size={16} />
              {t('jobs.addQuestion')}
            </button>
          </div>
          <p className="section-card-desc" style={{ marginBottom: '24px' }}>Tanyakan pertanyaan spesifik ke kandidat setelah mereka review hasil OCR.</p>

          {activeQuestions.length === 0 ? (
            <div className="empty-questions">Belum ada pertanyaan tambahan. Pelamar hanya akan mengisi data CV saja.</div>
          ) : (
            <div className="questions-list">
              {questions.map((q, index) => {
                if (q.isDeleted) return null;
                return (
                  <div key={index} className="question-item-card">
                    <div className="question-item-header">
                      <h4>Pertanyaan #{index + 1}</h4>
                      <button type="button" onClick={() => handleRemoveQuestion(index)} className="btn-remove-question">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('jobs.questionText')} *</label>
                      <input 
                        type="text" 
                        value={q.text} 
                        onChange={e => handleQuestionChange(index, 'text', e.target.value)} 
                        className="form-input" 
                        required
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">{t('jobs.questionType')}</label>
                        <select 
                          value={q.type} 
                          onChange={e => handleQuestionChange(index, 'type', e.target.value)} 
                          className="form-select"
                        >
                          <option value="TEXT">{t('jobs.questionTypes.text')}</option>
                          <option value="MULTIPLE_CHOICE">{t('jobs.questionTypes.multiple_choice')}</option>
                          <option value="YES_NO">{t('jobs.questionTypes.yes_no')}</option>
                        </select>
                      </div>
                      <div className="form-group flex-center-y" style={{ paddingTop: '28px' }}>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={q.required} 
                            onChange={e => handleQuestionChange(index, 'required', e.target.checked)} 
                          />
                          <span style={{ marginLeft: '8px' }}>{t('jobs.questionRequired')}</span>
                        </label>
                      </div>
                    </div>

                    {q.type === 'MULTIPLE_CHOICE' && (
                      <div className="form-group">
                        <label className="form-label">Pilihan Jawaban *</label>
                        <input 
                          type="text" 
                          value={q.options} 
                          onChange={e => handleQuestionChange(index, 'options', e.target.value)} 
                          className="form-input" 
                          placeholder={t('jobs.optionsHelp')}
                          required
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="form-actions">
          <Link href="/admin/jobs" className="btn btn-secondary btn-pill">
            {t('common.cancel')}
          </Link>
          <button type="submit" className="btn btn-primary btn-pill" disabled={saving}>
            <Save size={18} />
            {saving ? t('common.loading') : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .edit-job-view {
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

        .job-form-layout {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-section-card {
          background-color: var(--white);
          padding: 40px;
        }

        .section-card-title {
          font-size: 1.5rem;
          margin-bottom: 6px;
        }

        .section-card-desc {
          color: var(--slate-gray);
          font-size: 0.95rem;
          margin-bottom: 32px;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1.5fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
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

        .range-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .range-slider {
          flex: 1;
          height: 6px;
          background: var(--canvas-cream);
          border-radius: 3px;
          outline: none;
          accent-color: var(--primary);
        }

        .range-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
          min-width: 60px;
        }

        .empty-questions {
          text-align: center;
          padding: 40px;
          border: 2px dashed var(--dust-taupe);
          border-radius: var(--radius-md);
          color: var(--slate-gray);
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .question-item-card {
          background-color: var(--canvas-cream);
          border-radius: var(--radius-md);
          padding: 24px;
          border: 1px solid var(--dust-taupe);
          position: relative;
        }

        .question-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .question-item-header h4 {
          font-size: 1.1rem;
          color: var(--ink-black);
        }

        .btn-remove-question {
          background: none;
          border: none;
          color: #c0392b;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }
        .btn-remove-question:hover {
          background-color: rgba(192, 57, 43, 0.08);
        }

        .flex-center-y {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          font-weight: 500;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 16px;
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
