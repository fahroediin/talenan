'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO';
  options: string; // Comma separated
  required: boolean;
}

interface ApplicationData {
  jobPostingId: string;
  filename: string;
  personal: {
    name?: string;
    title?: string;
    bio?: string;
    address?: string;
  };
  social: {
    phone?: string;
    email?: string;
    web?: string;
  };
  education: any[];
  experience: any[];
  skills: any[];
}

export default function CandidateQuestions() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<ApplicationData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const rawData = sessionStorage.getItem('talenan_application_data');
    if (!rawData) {
      router.push(`/apply/${slug}`);
      return;
    }

    try {
      const parsed: ApplicationData = JSON.parse(rawData);
      setData(parsed);

      // Fetch questions for this job
      fetch(`/api/jobs/${parsed.jobPostingId}`)
        .then(res => res.json())
        .then(jobData => {
          if (!jobData.error) {
            setQuestions(jobData.questions || []);
            // Initialize answer map
            const initialAnswers: Record<string, string> = {};
            (jobData.questions || []).forEach((q: Question) => {
              initialAnswers[q.id] = q.type === 'YES_NO' ? 'Yes' : '';
            });
            setAnswers(initialAnswers);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));

    } catch (e) {
      console.error(e);
      router.push(`/apply/${slug}`);
    }
  }, [slug, router]);

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers({
      ...answers,
      [questionId]: val
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    // Validate required questions
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        alert(`Pertanyaan "${q.text}" wajib dijawab!`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    // Format answers payload
    const answersPayload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    const finalPayload = {
      jobPostingId: data.jobPostingId,
      name: data.personal.name,
      email: data.social.email,
      phone: data.social.phone,
      bio: data.personal.bio,
      address: data.personal.address,
      web: data.social.web,
      socialUrls: [], // or populate from social.others if needed
      education: data.education,
      experience: data.experience,
      skills: data.skills,
      resumeUrl: data.filename,
      answers: answersPayload
    };

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });

      const resData = await response.json();
      if (!response.ok) {
        setError(resData.error || 'Gagal mengirimkan lamaran pekerjaan.');
      } else {
        // Clear session storage and route to success page
        sessionStorage.removeItem('talenan_application_data');
        router.push(`/apply/${slug}/success`);
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi saat mengirim lamaran.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="questions-loading">Memuat daftar pertanyaan...</div>;
  }

  return (
    <div className="public-questions-page animate-fade-in">
      <header className="public-header">
        <div className="brand-logo">
          <span className="brand-logo-text">Talenan</span>
        </div>
        <span className="step-indicator">Langkah 3 dari 3</span>
      </header>

      <main className="questions-main-content">
        <div className="questions-container card">
          <div className="questions-header">
            <div className="eyebrow">FINAL STEP</div>
            <h2 className="questions-title">Pertanyaan Tambahan</h2>
            <p className="questions-desc">
              Harap jawab beberapa pertanyaan berikut dari recruiter untuk melengkapi berkas lamaran Anda.
            </p>
          </div>

          {error && (
            <div className="error-message-box flex-align-center">
              <AlertCircle size={20} style={{ marginRight: '8px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {questions.length === 0 ? (
            <form onSubmit={handleSubmit} className="empty-questions-form">
              <div className="no-questions-notice">
                <CheckCircle size={40} className="notice-icon" />
                <h3>Siap Dikirim!</h3>
                <p>Tidak ada pertanyaan tambahan untuk lowongan ini. Anda dapat langsung mengirim lamaran Anda.</p>
              </div>
              <div className="form-actions-questions">
                <button type="button" onClick={() => router.push(`/apply/${slug}/review`)} className="btn btn-secondary btn-pill" disabled={submitting}>
                  <ChevronLeft size={16} />
                  <span>Kembali</span>
                </button>
                <button type="submit" className="btn btn-primary btn-pill submit-btn" disabled={submitting}>
                  {submitting ? 'Mengirim...' : 'Kirim Lamaran Pekerjaan'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="questions-form">
              <div className="questions-list-form">
                {questions.map((q, idx) => (
                  <div key={q.id} className="question-input-group">
                    <label className="form-label font-bold">
                      {idx + 1}. {q.text} {q.required && <span className="text-danger">*</span>}
                    </label>

                    {q.type === 'TEXT' && (
                      <textarea 
                        value={answers[q.id] || ''} 
                        onChange={e => handleAnswerChange(q.id, e.target.value)} 
                        className="form-textarea" 
                        rows={4}
                        required={q.required}
                        placeholder="Tuliskan jawaban Anda di sini..."
                      ></textarea>
                    )}

                    {q.type === 'YES_NO' && (
                      <div className="radio-options-row">
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name={`q_${q.id}`} 
                            value="Yes" 
                            checked={answers[q.id] === 'Yes'} 
                            onChange={() => handleAnswerChange(q.id, 'Yes')} 
                          />
                          <span>Ya (Yes)</span>
                        </label>
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name={`q_${q.id}`} 
                            value="No" 
                            checked={answers[q.id] === 'No'} 
                            onChange={() => handleAnswerChange(q.id, 'No')} 
                          />
                          <span>Tidak (No)</span>
                        </label>
                      </div>
                    )}

                    {q.type === 'MULTIPLE_CHOICE' && (
                      <select 
                        value={answers[q.id] || ''} 
                        onChange={e => handleAnswerChange(q.id, e.target.value)} 
                        className="form-select"
                        required={q.required}
                      >
                        <option value="">-- Pilih Jawaban --</option>
                        {q.options.split(',').map(o => o.trim()).filter(Boolean).map((optionVal, oIdx) => (
                          <option key={oIdx} value={optionVal}>{optionVal}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions-questions">
                <button type="button" onClick={() => router.push(`/apply/${slug}/review`)} className="btn btn-secondary btn-pill" disabled={submitting}>
                  <ChevronLeft size={16} />
                  <span>Kembali</span>
                </button>
                <button type="submit" className="btn btn-primary btn-pill submit-btn" disabled={submitting}>
                  {submitting ? 'Mengirim...' : 'Kirim Lamaran Pekerjaan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <style jsx>{`
        .public-questions-page {
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

        .step-indicator {
          font-size: 0.9rem;
          color: var(--slate-gray);
          font-weight: 500;
        }

        .questions-main-content {
          max-width: 720px;
          margin: 40px auto 80px auto;
          padding: 0 24px;
          width: 100%;
        }

        .questions-container {
          background-color: var(--white);
          padding: 48px;
        }

        .questions-header {
          margin-bottom: 40px;
          border-bottom: 1px solid var(--dust-taupe);
          padding-bottom: 24px;
        }

        .questions-title {
          font-size: 2.25rem;
          margin-top: 8px;
          margin-bottom: 12px;
        }

        .questions-desc {
          color: var(--slate-gray);
          font-size: 1rem;
          line-height: 1.5;
        }

        .no-questions-notice {
          text-align: center;
          padding: 40px;
          background-color: var(--canvas-cream);
          border-radius: var(--radius-md);
          margin-bottom: 32px;
          border: 1px solid var(--dust-taupe);
        }

        .notice-icon {
          color: #27ae60;
          margin-bottom: 16px;
        }

        .no-questions-notice h3 {
          font-size: 1.25rem;
          margin-bottom: 8px;
        }

        .no-questions-notice p {
          color: var(--slate-gray);
          font-size: 0.95rem;
        }

        .questions-list-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 40px;
        }

        .question-input-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .font-bold {
          font-weight: 700;
          font-size: 1.05rem;
        }

        .text-danger {
          color: #c0392b;
        }

        .radio-options-row {
          display: flex;
          gap: 24px;
          margin-top: 8px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          cursor: pointer;
        }

        .radio-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
        }

        .form-actions-questions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--dust-taupe);
          padding-top: 32px;
        }

        .submit-btn {
          padding: 12px 32px;
        }

        .error-message-box {
          background-color: rgba(231, 76, 60, 0.1);
          color: #c0392b;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          margin-bottom: 32px;
          border: 1px solid rgba(231, 76, 60, 0.2);
          display: flex;
          align-items: center;
        }

        .questions-loading {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--slate-gray);
          font-size: 1.25rem;
          background-color: var(--canvas-cream);
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
