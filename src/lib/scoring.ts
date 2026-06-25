interface EducationItem {
  level?: string;
  gpa?: string | number;
}

interface ExperienceItem {
  date?: {
    start?: string;
    end?: string;
  };
}

interface SkillItem {
  name: string;
}

const EDUCATION_LEVEL_SCORES: Record<string, number> = {
  "any": 0,
  "high school": 1,
  "sma": 1,
  "associate's degree": 2,
  "d3": 2,
  "bachelor's degree": 3,
  "s1": 3,
  "bachelor": 3,
  "master's degree": 4,
  "s2": 4,
  "master": 4,
  "phd": 5,
  "doctorate": 5,
  "s3": 5
};

function getEducationLevelScore(level: string): number {
  if (!level) return 0;
  const normalized = level.toLowerCase().trim();
  for (const [key, value] of Object.entries(EDUCATION_LEVEL_SCORES)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  return 0;
}

export function calculateTotalExperienceYears(experience: ExperienceItem[]): number {
  const intervals: { start: number; end: number }[] = [];
  
  for (const exp of experience) {
    const startStr = exp.date?.start;
    const endStr = exp.date?.end;
    
    // Custom date parser that supports blank, "present", "saat ini"
    const parseDateHelper = (str: string | undefined | null, defaultToNow: boolean): Date | null => {
      if (!str) return defaultToNow ? new Date() : null;
      const normalized = str.toLowerCase().trim();
      if (
        normalized === '' || 
        normalized === 'present' || 
        normalized === 'saat ini' || 
        normalized === 'sekarang' || 
        normalized === 'current' || 
        normalized === 'active' || 
        normalized === 'now' || 
        normalized === '-'
      ) {
        return new Date();
      }
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    };
    
    const startDate = parseDateHelper(startStr, false);
    const endDate = parseDateHelper(endStr, true);
    
    if (!startDate || !endDate) continue;
    
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    
    if (startMs > endMs) continue; // Ignore entries where start is after end
    
    intervals.push({ start: startMs, end: endMs });
  }
  
  if (intervals.length === 0) return 0;
  
  // Sort intervals by start date to prepare for overlapping checks
  intervals.sort((a, b) => a.start - b.start);
  
  // Merge overlapping intervals (so concurrent jobs do not double count)
  const merged: { start: number; end: number }[] = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    
    if (current.start <= last.end) {
      // Overlap detected, merge them by extending the end time
      last.end = Math.max(last.end, current.end);
    } else {
      // No overlap, append as a distinct interval
      merged.push(current);
    }
  }
  
  // Calculate total duration in months
  let totalMonths = 0;
  for (const interval of merged) {
    const diffTime = interval.end - interval.start;
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
    totalMonths += diffMonths;
  }
  
  return Math.round((totalMonths / 12) * 10) / 10; // e.g. 2.5 years
}

export function calculateCandidateScore(
  candidateData: {
    education: EducationItem[];
    experience: ExperienceItem[];
    skills: SkillItem[];
  },
  params: {
    minExperience: number;
    minGpa: number;
    minEducation: string;
    requiredSkills: string;
  }
) {
  let scoreDetails = {
    skillsMatch: 0,
    experienceMatch: 0,
    educationMatch: 0,
    gpaMatch: 0,
    skillsFound: [] as string[],
    skillsMissing: [] as string[],
    experienceYears: 0,
    candidateHighestEducation: 'None',
    candidateHighestGpa: 0
  };

  // 1. Skill Match (40% Weight)
  const reqSkills = params.requiredSkills
    ? params.requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];
  
  const candSkills = candidateData.skills.map(s => s.name.toLowerCase().trim());
  
  if (reqSkills.length === 0) {
    scoreDetails.skillsMatch = 100;
  } else {
    let matchedCount = 0;
    reqSkills.forEach(reqSkill => {
      const match = candSkills.some(candSkill => candSkill.includes(reqSkill) || reqSkill.includes(candSkill));
      if (match) {
        matchedCount++;
        scoreDetails.skillsFound.push(reqSkill);
      } else {
        scoreDetails.skillsMissing.push(reqSkill);
      }
    });
    scoreDetails.skillsMatch = Math.round((matchedCount / reqSkills.length) * 100);
  }

  // 2. Experience Match (30% Weight)
  const expYears = calculateTotalExperienceYears(candidateData.experience);
  scoreDetails.experienceYears = expYears;
  
  if (params.minExperience === 0) {
    scoreDetails.experienceMatch = 100;
  } else {
    // If experience is equal or greater than required, 100%. Else, scale it down.
    scoreDetails.experienceMatch = expYears >= params.minExperience
      ? 100
      : Math.round((expYears / params.minExperience) * 100);
  }

  // 3. Education Match (15% Weight)
  let highestEducationLevel = 'None';
  let highestEducationScore = 0;
  let highestGpa = 0.0;
  
  candidateData.education.forEach(edu => {
    const levelStr = edu.level || 'Any';
    const score = getEducationLevelScore(levelStr);
    if (score > highestEducationScore) {
      highestEducationScore = score;
      highestEducationLevel = levelStr;
    }
    
    const gpaVal = typeof edu.gpa === 'string' ? parseFloat(edu.gpa) : edu.gpa;
    if (gpaVal && gpaVal > highestGpa) {
      highestGpa = gpaVal;
    }
  });

  scoreDetails.candidateHighestEducation = highestEducationLevel;
  scoreDetails.candidateHighestGpa = highestGpa;

  const minEduScore = getEducationLevelScore(params.minEducation);
  if (minEduScore === 0) {
    scoreDetails.educationMatch = 100;
  } else {
    scoreDetails.educationMatch = highestEducationScore >= minEduScore ? 100 : 0;
  }

  // 4. GPA Match (15% Weight)
  if (params.minGpa === 0) {
    scoreDetails.gpaMatch = 100;
  } else {
    scoreDetails.gpaMatch = highestGpa >= params.minGpa ? 100 : 0;
  }

  // Calculate Weighted Total Score
  const totalScore = Math.round(
    (scoreDetails.skillsMatch * 0.40) +
    (scoreDetails.experienceMatch * 0.30) +
    (scoreDetails.educationMatch * 0.15) +
    (scoreDetails.gpaMatch * 0.15)
  );

  return {
    totalScore,
    details: scoreDetails
  };
}
