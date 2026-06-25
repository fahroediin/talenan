'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Trash, Sparkles } from 'lucide-react';

interface EducationItem {
  name: string;
  description: string;
  gpa: string;
  level: string;
  major: string;
  date: {
    start: string;
    end: string;
  };
}

interface ExperienceItem {
  position: string;
  company: string;
  description: string;
  date: {
    start: string;
    end: string;
  };
}

interface SkillItem {
  name: string;
  level: string;
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
    others?: string[];
  };
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
}

export default function ReviewOCR() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<ApplicationData | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [web, setWeb] = useState('');

  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<string>(''); // Comma separated in input for easier edit

  useEffect(() => {
    const rawData = sessionStorage.getItem('talenan_application_data');
    if (!rawData) {
      router.push(`/apply/${slug}`);
      return;
    }

    try {
      const parsed: ApplicationData = JSON.parse(rawData);
      setData(parsed);
      setName(parsed.personal?.name || '');
      setEmail(parsed.social?.email || '');
      setPhone(parsed.social?.phone || '');
      setBio(parsed.personal?.bio || '');
      setAddress(parsed.personal?.address || '');
      setWeb(parsed.social?.web || '');
      setEducation(parsed.education || []);
      setExperience(parsed.experience || []);

      // Skills is array of { name, level? } or simple string array. Normalize to comma separated
      const skillNames = (parsed.skills || []).map((s: any) => typeof s === 'string' ? s : s.name);
      setSkills(skillNames.join(', '));
    } catch (e) {
      console.error(e);
      router.push(`/apply/${slug}`);
    }
  }, [slug, router]);

  // Education Helpers
  const handleAddEducation = () => {
    setEducation([...education, {
      name: '',
      description: '',
      gpa: '',
      level: 'Bachelor\'s Degree',
      major: '',
      date: { start: '', end: '' }
    }]);
  };

  const handleEducationChange = (index: number, field: keyof EducationItem | 'start' | 'end', val: string) => {
    const updated = [...education];
    if (field === 'start' || field === 'end') {
      updated[index] = {
        ...updated[index],
        date: { ...updated[index].date, [field]: val }
      };
    } else {
      updated[index] = { ...updated[index], [field]: val } as any;
    }
    setEducation(updated);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Experience Helpers
  const handleAddExperience = () => {
    setExperience([...experience, {
      position: '',
      company: '',
      description: '',
      date: { start: '', end: '' }
    }]);
  };

  const handleExperienceChange = (index: number, field: keyof ExperienceItem | 'start' | 'end', val: string) => {
    const updated = [...experience];
    if (field === 'start' || field === 'end') {
      updated[index] = {
        ...updated[index],
        date: { ...updated[index].date, [field]: val }
      };
    } else {
      updated[index] = { ...updated[index], [field]: val } as any;
    }
    setExperience(updated);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!name || !email || !phone) {
      alert('Nama, email, dan telepon wajib diisi!');
      return;
    }

    if (!data) return;

    // Parse skills back to array
    const skillList = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => ({ name: s, level: 'Advanced' }));

    const updatedData: ApplicationData = {
      ...data,
      personal: {
        ...data.personal,
        name,
        bio,
        address
      },
      social: {
        ...data.social,
        email,
        phone,
        web
      },
      education,
      experience,
      skills: skillList
    };

    sessionStorage.setItem('talenan_application_data', JSON.stringify(updatedData));

    // Redirect to questions page
    router.push(`/apply/${slug}/questions`);
  };

  if (!data) {
    return <div className="review-loading">Memuat data hasil OCR...</div>;
  }

  return (
    <div className="public-review-page animate-fade-in">
      <header className="public-header">
        <div className="brand-logo">
          <span className="brand-logo-text">Talenan</span>
        </div>
        <span className="step-indicator">Langkah 2 dari 3</span>
      </header>

      <main className="review-main-content">
        <div className="review-container card">
          <div className="review-header">
            <div className="sparkle-badge">
              <Sparkles size={16} />
              <span>Di-extract menggunakan OKSARA</span>
            </div>
            <h2 className="review-title">Tinjau Profil Anda</h2>
            <p className="review-desc">
              Berikut adalah hasil pembacaan CV Anda oleh sistem OKSARA. Harap verifikasi dan perbaiki data yang kurang tepat sebelum melanjutkan.
            </p>
          </div>

          <div className="form-layout-review">
            {/* Section 1: Data Diri */}
            <div className="form-section-review">
              <h3 className="section-title-review">Data Diri & Kontak</h3>

              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" required />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">No. Telepon *</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" required />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Website / Portofolio</label>
                  <input type="text" value={web} onChange={e => setWeb(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tentang Saya / Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} className="form-textarea" rows={3}></textarea>
              </div>
            </div>

            {/* Section 2: Keahlian */}
            <div className="form-section-review">
              <h3 className="section-title-review">Keahlian (Skills)</h3>
              <div className="form-group">
                <label className="form-label">Daftar Keahlian (pisahkan dengan koma)</label>
                <textarea value={skills} onChange={e => setSkills(e.target.value)} className="form-textarea" rows={3} placeholder="Contoh: React, JavaScript, Node.js"></textarea>
              </div>
            </div>

            {/* Section 3: Riwayat Pendidikan */}
            <div className="form-section-review">
              <div className="flex-between section-header-with-action">
                <h3 className="section-title-review">Riwayat Pendidikan</h3>
                <button type="button" onClick={handleAddEducation} className="btn btn-secondary btn-pill text-sm">
                  <Plus size={14} />
                  <span>Tambah Pendidikan</span>
                </button>
              </div>

              {education.length === 0 ? (
                <div className="empty-section-placeholder">Belum ada riwayat pendidikan. Klik tombol di atas untuk menambahkan.</div>
              ) : (
                <div className="items-list-review">
                  {education.map((edu, idx) => (
                    <div key={idx} className="item-card-review">
                      <div className="item-card-header">
                        <h4>Pendidikan #{idx + 1}</h4>
                        <button type="button" onClick={() => handleRemoveEducation(idx)} className="btn-remove-item">
                          <Trash size={16} />
                        </button>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="form-label">Institusi / Universitas</label>
                          <input type="text" value={edu.name} onChange={e => handleEducationChange(idx, 'name', e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Jurusan / Bidang Studi</label>
                          <input type="text" value={edu.major} onChange={e => handleEducationChange(idx, 'major', e.target.value)} className="form-input" />
                        </div>
                      </div>

                      <div className="form-row-3">
                        <div className="form-group">
                          <label className="form-label">Tingkat Kelulusan</label>
                          <select value={edu.level} onChange={e => handleEducationChange(idx, 'level', e.target.value)} className="form-select">
                            <option value="High School">SMA / SMK</option>
                            <option value="Associate's Degree">D3 (Diploma)</option>
                            <option value="Bachelor's Degree">S1 (Sarjana)</option>
                            <option value="Master's Degree">S2 (Magister)</option>
                            <option value="PhD">S3 (Doktor)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">IPK / GPA</label>
                          <input type="text" value={edu.gpa} onChange={e => handleEducationChange(idx, 'gpa', e.target.value)} className="form-input" placeholder="3.75" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tahun Kelulusan</label>
                          <div className="flex-gap-2">
                            <input type="text" value={edu.date?.start || ''} onChange={e => handleEducationChange(idx, 'start', e.target.value)} className="form-input text-center" placeholder="Mulai (YYYY)" />
                            <input type="text" value={edu.date?.end || ''} onChange={e => handleEducationChange(idx, 'end', e.target.value)} className="form-input text-center" placeholder="Selesai (YYYY)" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Pengalaman Kerja */}
            <div className="form-section-review">
              <div className="flex-between section-header-with-action">
                <h3 className="section-title-review">Pengalaman Kerja</h3>
                <button type="button" onClick={handleAddExperience} className="btn btn-secondary btn-pill text-sm">
                  <Plus size={14} />
                  <span>Tambah Pengalaman</span>
                </button>
              </div>

              {experience.length === 0 ? (
                <div className="empty-section-placeholder">Belum ada riwayat pengalaman kerja. Klik tombol di atas untuk menambahkan.</div>
              ) : (
                <div className="items-list-review">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="item-card-review">
                      <div className="item-card-header">
                        <h4>Pengalaman Kerja #{idx + 1}</h4>
                        <button type="button" onClick={() => handleRemoveExperience(idx)} className="btn-remove-item">
                          <Trash size={16} />
                        </button>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="form-label">Perusahaan</label>
                          <input type="text" value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Posisi / Jabatan</label>
                          <input type="text" value={exp.position} onChange={e => handleExperienceChange(idx, 'position', e.target.value)} className="form-input" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Masa Kerja</label>
                        <div className="flex-gap-2" style={{ maxWidth: '400px' }}>
                          <input type="text" value={exp.date?.start || ''} onChange={e => handleExperienceChange(idx, 'start', e.target.value)} className="form-input" placeholder="Mulai (YYYY-MM-DD)" />
                          <input type="text" value={exp.date?.end || ''} onChange={e => handleExperienceChange(idx, 'end', e.target.value)} className="form-input" placeholder="Selesai (YYYY-MM-DD atau kosong jika aktif)" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Deskripsi Pekerjaan</label>
                        <textarea value={exp.description} onChange={e => handleExperienceChange(idx, 'description', e.target.value)} className="form-textarea" rows={3}></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="form-actions-review">
              <button onClick={() => router.push(`/apply/${slug}`)} className="btn btn-secondary btn-pill">
                <ChevronLeft size={16} />
                <span>Unggah Ulang CV</span>
              </button>
              <button onClick={handleNext} className="btn btn-primary btn-pill">
                <span>Lanjut ke Pertanyaan</span>
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </main>

      <style jsx>{`
        .public-review-page {
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

        .review-main-content {
          max-width: 900px;
          margin: 40px auto 80px auto;
          padding: 0 24px;
          width: 100%;
        }

        .review-container {
          background-color: var(--white);
          padding: 48px;
        }

        .review-header {
          margin-bottom: 40px;
          border-bottom: 1px solid var(--dust-taupe);
          padding-bottom: 24px;
        }

        .sparkle-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: var(--canvas-lavender);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .review-title {
          font-size: 2.25rem;
          margin-bottom: 12px;
        }

        .review-desc {
          color: var(--slate-gray);
          font-size: 1rem;
          line-height: 1.5;
        }

        .form-layout-review {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .form-section-review {
          border-bottom: 1px solid var(--dust-taupe);
          padding-bottom: 32px;
        }
        .form-section-review:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .section-title-review {
          font-size: 1.25rem;
          color: var(--ink-black);
          margin-bottom: 24px;
        }

        .section-header-with-action {
          margin-bottom: 24px;
        }
        .section-header-with-action .section-title-review {
          margin-bottom: 0;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1.5fr 1fr 2fr;
          gap: 24px;
        }

        @media (max-width: 600px) {
          .form-row-2, .form-row-3 {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .empty-section-placeholder {
          text-align: center;
          padding: 32px;
          border: 1px dashed var(--dust-taupe);
          border-radius: var(--radius-md);
          color: var(--slate-gray);
          font-size: 0.95rem;
        }

        .items-list-review {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .item-card-review {
          background-color: var(--canvas-cream);
          border-radius: var(--radius-md);
          padding: 24px;
          border: 1px solid var(--dust-taupe);
        }

        .item-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(20, 20, 19, 0.05);
          padding-bottom: 8px;
        }

        .item-card-header h4 {
          font-size: 1rem;
        }

        .btn-remove-item {
          background: none;
          border: none;
          color: #c0392b;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }
        .btn-remove-item:hover {
          background-color: rgba(192, 57, 43, 0.08);
        }

        .flex-gap-2 {
          display: flex;
          gap: 12px;
        }

        .text-center {
          text-align: center;
        }

        .form-actions-review {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
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
