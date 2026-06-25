import { prisma } from './prisma';

export interface SettingsType {
  ocr_url: string;
  ocr_token: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_from: string;
  smtp_from_name: string;
  email_subject_template: string;
  email_body_template: string;
  gcal_credentials: string; // JSON string of google calendar service account
}

export const DEFAULT_SETTINGS: SettingsType = {
  ocr_url: process.env.OCR_API_URL || 'https://oksara.senar.id/api/v1/resume',
  ocr_token: process.env.OCR_API_TOKEN || 'a30f61aef80b82eb8050c1ad83d5e36337ed45d873923cbf3a3330a86f833464',
  smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtp_port: process.env.SMTP_PORT || '465',
  smtp_user: process.env.SMTP_USER || '',
  smtp_pass: process.env.SMTP_PASSWORD || '',
  smtp_from: process.env.SMTP_FROM || '',
  smtp_from_name: process.env.SMTP_FROM_NAME || 'Talenan Recruitment Team',
  email_subject_template: 'Undangan Wawancara: {{job_title}} - {{candidate_name}}',
  email_body_template: 'Halo {{candidate_name}},\n\nSelamat! Anda terpilih untuk mengikuti sesi wawancara untuk posisi {{job_title}}.\n\nDetail Wawancara:\nTanggal: {{date}}\nWaktu: {{time}}\nInterviewer: {{hr_email}} (HR) & {{user_email}} (User)\n\nTautan Google Meet: {{meet_link}}\n\nMohon konfirmasi kehadiran Anda dengan membalas email ini.\n\nSalam,\n{{from_name}}',
  gcal_credentials: '',
};

export async function getSettings(): Promise<SettingsType> {
  try {
    const dbSettings = await prisma.appSetting.findMany();
    const settingsMap = new Map(dbSettings.map(s => [s.key, s.value]));

    const settings: Partial<SettingsType> = {};
    for (const key of Object.keys(DEFAULT_SETTINGS) as Array<keyof SettingsType>) {
      settings[key] = settingsMap.get(key) ?? DEFAULT_SETTINGS[key];
    }

    return settings as SettingsType;
  } catch (error) {
    console.error('Error fetching settings from database:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<SettingsType>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => {
    return prisma.appSetting.upsert({
      where: { key },
      update: { value: value || '' },
      create: { key, value: value || '' },
    });
  });

  await prisma.$transaction(updates);
}
