'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Save, Info, Key, Server, Mail, Sliders } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [ocrUrl, setOcrUrl] = useState('');
  const [ocrToken, setOcrToken] = useState('');
  
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [gcalCredentials, setGcalCredentials] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setOcrUrl(data.ocr_url);
          setOcrToken(data.ocr_token);
          setSmtpHost(data.smtp_host);
          setSmtpPort(data.smtp_port);
          setSmtpUser(data.smtp_user);
          setSmtpPass(data.smtp_pass);
          setSmtpFrom(data.smtp_from);
          setSmtpFromName(data.smtp_from_name);
          setEmailSubject(data.email_subject_template);
          setEmailBody(data.email_body_template);
          setGcalCredentials(data.gcal_credentials || '');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocr_url: ocrUrl,
          ocr_token: ocrToken,
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          smtp_user: smtpUser,
          smtp_pass: smtpPass,
          smtp_from: smtpFrom,
          smtp_from_name: smtpFromName,
          email_subject_template: emailSubject,
          email_body_template: emailBody,
          gcal_credentials: gcalCredentials
        })
      });

      if (res.ok) {
        alert('Pengaturan berhasil disimpan!');
      } else {
        alert('Gagal menyimpan pengaturan.');
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

  return (
    <div className="settings-view animate-fade-in">
      <div className="page-title-section">
        <div className="eyebrow">{t('common.settings')}</div>
        <h2 className="section-title">{t('settings.title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="settings-form-layout">
        {/* OCR Configuration */}
        <div className="card settings-card">
          <h3 className="card-title-with-icon">
            <Server size={22} className="card-title-icon" />
            <span>{t('settings.ocrTitle')}</span>
          </h3>
          <p className="card-desc">Konfigurasi endpoint OCR Resume Parser (default: Oksara OCR).</p>

          <div className="form-group">
            <label className="form-label">{t('settings.ocrUrl')}</label>
            <input 
              type="text" 
              value={ocrUrl} 
              onChange={e => setOcrUrl(e.target.value)} 
              className="form-input" 
              placeholder="https://oksara.senar.id/api/v1/resume"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('settings.ocrToken')}</label>
            <input 
              type="password" 
              value={ocrToken} 
              onChange={e => setOcrToken(e.target.value)} 
              className="form-input" 
              placeholder="Bearer Token"
            />
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="card settings-card">
          <h3 className="card-title-with-icon">
            <Mail size={22} className="card-title-icon" />
            <span>{t('settings.smtpTitle')}</span>
          </h3>
          <p className="card-desc">Gunakan akun SMTP Anda untuk mengirim email notifikasi undangan wawancara.</p>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">{t('settings.smtpHost')}</label>
              <input 
                type="text" 
                value={smtpHost} 
                onChange={e => setSmtpHost(e.target.value)} 
                className="form-input" 
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.smtpPort')}</label>
              <input 
                type="text" 
                value={smtpPort} 
                onChange={e => setSmtpPort(e.target.value)} 
                className="form-input" 
                placeholder="465"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">{t('settings.smtpUser')}</label>
              <input 
                type="text" 
                value={smtpUser} 
                onChange={e => setSmtpUser(e.target.value)} 
                className="form-input" 
                placeholder="recruitment@perusahaan.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.smtpPass')}</label>
              <input 
                type="password" 
                value={smtpPass} 
                onChange={e => setSmtpPass(e.target.value)} 
                className="form-input" 
                placeholder="Password / App Password"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">{t('settings.smtpFrom')}</label>
              <input 
                type="email" 
                value={smtpFrom} 
                onChange={e => setSmtpFrom(e.target.value)} 
                className="form-input" 
                placeholder="no-reply@perusahaan.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.smtpFromName')}</label>
              <input 
                type="text" 
                value={smtpFromName} 
                onChange={e => setSmtpFromName(e.target.value)} 
                className="form-input" 
                placeholder="Talenan Recruitment Team"
              />
            </div>
          </div>
        </div>

        {/* Calendar Integration Configuration */}
        <div className="card settings-card">
          <h3 className="card-title-with-icon">
            <Key size={22} className="card-title-icon" />
            <span>Integrasi Google Calendar</span>
          </h3>
          <p className="card-desc">Gunakan Google Service Account credentials JSON untuk membuat jadwal dan link Google Meet otomatis.</p>

          <div className="form-group">
            <label className="form-label">Service Account Key JSON</label>
            <textarea 
              value={gcalCredentials} 
              onChange={e => setGcalCredentials(e.target.value)} 
              className="form-textarea code-font" 
              rows={6}
              placeholder='{ "type": "service_account", "project_id": ... }'
            ></textarea>
            <span className="input-hint">Paste data JSON key lengkap yang diunduh dari GCP Console untuk Service Account dengan Calendar API enabled.</span>
          </div>
        </div>

        {/* Email Template Configuration */}
        <div className="card settings-card">
          <h3 className="card-title-with-icon">
            <Mail size={22} className="card-title-icon" />
            <span>{t('settings.templatesTitle')}</span>
          </h3>
          <p className="card-desc">Atur isi email yang akan dikirim secara otomatis ke kandidat, HR, dan User saat interview dijadwalkan.</p>

          <div className="form-group">
            <label className="form-label">{t('settings.templateSubject')}</label>
            <input 
              type="text" 
              value={emailSubject} 
              onChange={e => setEmailSubject(e.target.value)} 
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('settings.templateBody')}</label>
            <textarea 
              value={emailBody} 
              onChange={e => setEmailBody(e.target.value)} 
              className="form-textarea" 
              rows={8}
            ></textarea>
          </div>

          <div className="info-box-placeholders">
            <Info size={16} className="info-icon" style={{ marginTop: '2px' }} />
            <div className="info-text">
              <strong>Placeholder yang tersedia:</strong>
              <div className="placeholders-grid">
                <span><code>{"{{candidate_name}}"}</code>: Nama Kandidat</span>
                <span><code>{"{{job_title}}"}</code>: Nama Lowongan</span>
                <span><code>{"{{date}}"}</code>: Tanggal Wawancara</span>
                <span><code>{"{{time}}"}</code>: Waktu Sesi</span>
                <span><code>{"{{meet_link}}"}</code>: Tautan Google Meet</span>
                <span><code>{"{{hr_email}}"}</code>: Email HR</span>
                <span><code>{"{{user_email}}"}</code>: Email User/Manager</span>
                <span><code>{"{{from_name}}"}</code>: Nama Pengirim SMTP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="form-actions-settings">
          <button type="submit" className="btn btn-primary btn-pill save-btn" disabled={saving}>
            <Save size={18} />
            <span>{saving ? t('common.loading') : 'Simpan Semua Pengaturan'}</span>
          </button>
        </div>
      </form>

      <style jsx>{`
        .settings-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          font-size: 2.25rem;
        }

        .settings-form-layout {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .settings-card {
          background-color: var(--white);
          padding: 40px;
        }

        .card-desc {
          color: var(--slate-gray);
          font-size: 0.95rem;
          margin-bottom: 24px;
        }

        .card-title-with-icon {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          margin-bottom: 6px;
        }

        .card-title-icon {
          color: var(--primary);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 600px) {
          .form-row-2 {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .code-font {
          font-family: monospace;
          font-size: 0.9rem;
        }

        .input-hint {
          display: block;
          font-size: 0.8rem;
          color: var(--slate-gray);
          margin-top: 6px;
        }

        .info-box-placeholders {
          margin-top: 24px;
          background-color: var(--canvas-cream);
          border-radius: var(--radius-md);
          padding: 20px;
          border: 1px solid var(--dust-taupe);
          display: flex;
          gap: 12px;
        }

        .info-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .info-text {
          font-size: 0.9rem;
          color: var(--charcoal);
        }

        .placeholders-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 16px;
          margin-top: 12px;
        }

        @media (max-width: 600px) {
          .placeholders-grid {
            grid-template-columns: 1fr;
          }
        }

        .placeholders-grid code {
          background-color: var(--white);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          color: var(--primary);
        }

        .form-actions-settings {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .save-btn {
          padding: 12px 36px;
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
