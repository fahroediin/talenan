import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const useMock = formData.get('useMock') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Mock response fallback if requested or if token is default placeholder
    const settings = await getSettings();
    if (useMock || settings.ocr_token === 'your-token-placeholder' || !settings.ocr_url) {
      console.log('Using mock OCR response for testing...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      return NextResponse.json(getMockOCRResponse(file.name));
    }

    // Prepare external form data
    const externalFormData = new FormData();
    externalFormData.append('file', file, file.name);

    console.log(`Sending CV to OCR: ${settings.ocr_url}`);
    const response = await fetch(settings.ocr_url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': settings.ocr_token.startsWith('Bearer ') 
          ? settings.ocr_token 
          : `Bearer ${settings.ocr_token}`,
        'X-Swagger-UI': 'oksara-swagger'
      },
      body: externalFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OCR API error response: Status ${response.status}`, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ error: errorJson?.data?.message || 'OCR extraction failed' }, { status: response.status });
      } catch {
        return NextResponse.json({ error: `OCR Service error (status ${response.status})` }, { status: response.status });
      }
    }

    const ocrData = await response.json();
    return NextResponse.json(ocrData);
  } catch (error: any) {
    console.error('OCR Proxy error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error during OCR processing' }, { status: 500 });
  }
}

function getMockOCRResponse(filename: string) {
  return {
    "status": "success",
    "version": "4.0.0",
    "metadata": {
      "id": "d4e39fde-fa85-4d53-9a43-a472b82ef347",
      "speed": 1.123,
      "score": 100,
      "document": {
        "filename": filename,
        "pages": 1,
        "media": "Digital"
      }
    },
    "data": {
      "personal": {
        "name": filename.toLowerCase().includes('fahrudin') ? "Imam Fahrudin" : "John Doe",
        "title": "Software Engineer",
        "bio": "Developer software yang berdedikasi dengan keahlian dalam membangun aplikasi web modern dan responsif.",
        "address": "Jl. Merdeka No. 45, Jakarta, Indonesia"
      },
      "social": {
        "phone": "+62 812-3456-7890",
        "email": filename.toLowerCase().includes('fahrudin') ? "imam.fahrudin@example.com" : "john.doe@example.com",
        "web": "https://fahrudin.dev",
        "others": [
          "https://github.com/fahrudin",
          "https://linkedin.com/in/fahrudin"
        ]
      },
      "education": [
        {
          "name": "Universitas Indonesia",
          "description": "Gelar Sarjana Ilmu Komputer",
          "gpa": "3.75",
          "level": "Bachelor's Degree",
          "major": "Computer Science",
          "date": {
            "start": "2018-09-01",
            "end": "2022-06-30"
          }
        }
      ],
      "experience": [
        {
          "position": "Frontend Developer",
          "company": "Tech Innovator Indo",
          "description": "Mengembangkan aplikasi web menggunakan React dan Next.js dengan arsitektur modern.",
          "date": {
            "start": "2022-08-01",
            "end": "2024-05-31"
          }
        },
        {
          "position": "Software Engineering Intern",
          "company": "Startup Digital Nusantara",
          "description": "Membantu pembuatan API dan integrasi antarmuka pengguna.",
          "date": {
            "start": "2021-06-01",
            "end": "2021-09-30"
          }
        }
      ],
      "skill": [
        {
          "name": "React",
          "description": "Sangat mahir dalam UI rendering",
          "level": "Advanced"
        },
        {
          "name": "Next.js",
          "description": "Mengerti server components dan routing",
          "level": "Advanced"
        },
        {
          "name": "JavaScript",
          "description": "Bahasa pemrograman utama",
          "level": "Advanced"
        },
        {
          "name": "TypeScript",
          "description": "Pengembangan type-safe",
          "level": "Intermediate"
        },
        {
          "name": "CSS",
          "description": "Slicing desain presisi",
          "level": "Advanced"
        }
      ],
      "license": [],
      "project": [
        {
          "name": "Talenan Recruitment App",
          "description": "Aplikasi screening CV dengan OCR dan scheduling",
          "location": "Jakarta",
          "tag": ["Next.js", "Prisma", "OCR"],
          "date": {
            "start": "2026-06-01",
            "end": "2026-06-24"
          }
        }
      ]
    }
  };
}
