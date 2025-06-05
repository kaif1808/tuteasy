// UK/IB Enhanced Student Profile Types

export enum UKYearGroup {
  NURSERY = 'NURSERY',
  RECEPTION = 'RECEPTION',
  YEAR_1 = 'YEAR_1',
  YEAR_2 = 'YEAR_2',
  YEAR_3 = 'YEAR_3',
  YEAR_4 = 'YEAR_4',
  YEAR_5 = 'YEAR_5',
  YEAR_6 = 'YEAR_6',
  YEAR_7 = 'YEAR_7',
  YEAR_8 = 'YEAR_8',
  YEAR_9 = 'YEAR_9',
  YEAR_10 = 'YEAR_10',
  YEAR_11 = 'YEAR_11',
  YEAR_12 = 'YEAR_12',
  YEAR_13 = 'YEAR_13',
}

export enum UKKeyStage {
  EARLY_YEARS = 'EARLY_YEARS',
  KS1 = 'KS1',
  KS2 = 'KS2',
  KS3 = 'KS3',
  KS4 = 'KS4',
  KS5 = 'KS5',
}

export enum IBProgramme {
  PYP = 'PYP',    // Primary Years Programme (Ages 3-12)
  MYP = 'MYP',    // Middle Years Programme (Ages 11-16)
  DP = 'DP',      // Diploma Programme (Ages 16-19)
  CP = 'CP',      // Career-related Programme (Ages 16-19)
}

export enum UKSchoolType {
  STATE_COMPREHENSIVE = 'STATE_COMPREHENSIVE',
  STATE_GRAMMAR = 'STATE_GRAMMAR',
  ACADEMY = 'ACADEMY',
  FREE_SCHOOL = 'FREE_SCHOOL',
  INDEPENDENT = 'INDEPENDENT',
  INTERNATIONAL = 'INTERNATIONAL',
  SIXTH_FORM_COLLEGE = 'SIXTH_FORM_COLLEGE',
  FE_COLLEGE = 'FE_COLLEGE',
  SPECIAL_SCHOOL = 'SPECIAL_SCHOOL',
  HOMESCHOOL = 'HOMESCHOOL',
  OTHER = 'OTHER',
}

export enum QualificationLevel {
  EARLY_YEARS = 'EARLY_YEARS',
  PRIMARY = 'PRIMARY',
  KS1 = 'KS1',
  KS2 = 'KS2',
  KS3 = 'KS3',
  GCSE = 'GCSE',
  IGCSE = 'IGCSE',
  A_LEVEL = 'A_LEVEL',
  AS_LEVEL = 'AS_LEVEL',
  BTEC_LEVEL_1 = 'BTEC_LEVEL_1',
  BTEC_LEVEL_2 = 'BTEC_LEVEL_2',
  BTEC_LEVEL_3 = 'BTEC_LEVEL_3',
  IB_PYP = 'IB_PYP',
  IB_MYP = 'IB_MYP',
  IB_DP_SL = 'IB_DP_SL',     // Standard Level
  IB_DP_HL = 'IB_DP_HL',     // Higher Level
  IB_CP = 'IB_CP',
  UNDERGRADUATE = 'UNDERGRADUATE',
  POSTGRADUATE = 'POSTGRADUATE',
  ADULT_EDUCATION = 'ADULT_EDUCATION',
  OTHER = 'OTHER',
}

// Enhanced Student Profile interfaces
export interface EnhancedStudentProfile {
  id: string;
  userId: string;
  parentId?: string;
  
  // UK Academic System
  ukYearGroup?: UKYearGroup;
  ukKeyStage?: UKKeyStage;
  
  // IB Programme Information
  ibProgramme?: IBProgramme;
  ibYearOfStudy?: number; // 1-6 for PYP, 1-5 for MYP, 1-2 for DP/CP
  
  // School Information
  schoolName?: string;
  schoolType?: UKSchoolType;
  schoolCountry?: string; // For international students
  
  // Subject Interests with Qualification Levels
  subjectInterests: SubjectInterest[];
  
  // Learning Information
  learningGoals?: string;
  specialNeeds?: string;
  preferredLearningStyle?: string;
  
  // Other
  timezone: string;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectInterest {
  subjectName: string;
  qualificationLevel: QualificationLevel;
  examBoard?: string; // For GCSE/A-Level subjects
  isCore: boolean; // Core subjects vs optional
  targetGrade?: string; // Target grade for this subject
}

export interface EnhancedStudentProfileFormData {
  // Academic Level Selection
  ukYearGroup?: UKYearGroup;
  ibProgramme?: IBProgramme;
  ibYearOfStudy?: number;
  
  // School Information
  schoolName?: string;
  schoolType?: UKSchoolType;
  schoolCountry?: string;
  
  // Subject Interests
  subjectInterests: SubjectInterest[];
  
  // Learning Information
  learningGoals?: string;
  specialNeeds?: string;
  preferredLearningStyle?: string;
  timezone?: string;
  parentId?: string;
}

// UK Year Group Options with descriptions
export const UK_YEAR_GROUP_OPTIONS = [
  { value: UKYearGroup.NURSERY, label: 'Nursery', description: 'Ages 3-4', keyStage: UKKeyStage.EARLY_YEARS },
  { value: UKYearGroup.RECEPTION, label: 'Reception', description: 'Ages 4-5', keyStage: UKKeyStage.EARLY_YEARS },
  { value: UKYearGroup.YEAR_1, label: 'Year 1', description: 'Ages 5-6', keyStage: UKKeyStage.KS1 },
  { value: UKYearGroup.YEAR_2, label: 'Year 2', description: 'Ages 6-7', keyStage: UKKeyStage.KS1 },
  { value: UKYearGroup.YEAR_3, label: 'Year 3', description: 'Ages 7-8', keyStage: UKKeyStage.KS2 },
  { value: UKYearGroup.YEAR_4, label: 'Year 4', description: 'Ages 8-9', keyStage: UKKeyStage.KS2 },
  { value: UKYearGroup.YEAR_5, label: 'Year 5', description: 'Ages 9-10', keyStage: UKKeyStage.KS2 },
  { value: UKYearGroup.YEAR_6, label: 'Year 6', description: 'Ages 10-11', keyStage: UKKeyStage.KS2 },
  { value: UKYearGroup.YEAR_7, label: 'Year 7', description: 'Ages 11-12', keyStage: UKKeyStage.KS3 },
  { value: UKYearGroup.YEAR_8, label: 'Year 8', description: 'Ages 12-13', keyStage: UKKeyStage.KS3 },
  { value: UKYearGroup.YEAR_9, label: 'Year 9', description: 'Ages 13-14', keyStage: UKKeyStage.KS3 },
  { value: UKYearGroup.YEAR_10, label: 'Year 10', description: 'Ages 14-15', keyStage: UKKeyStage.KS4 },
  { value: UKYearGroup.YEAR_11, label: 'Year 11', description: 'Ages 15-16', keyStage: UKKeyStage.KS4 },
  { value: UKYearGroup.YEAR_12, label: 'Year 12', description: 'Ages 16-17', keyStage: UKKeyStage.KS5 },
  { value: UKYearGroup.YEAR_13, label: 'Year 13', description: 'Ages 17-18', keyStage: UKKeyStage.KS5 },
];

// IB Programme Options with descriptions
export const IB_PROGRAMME_OPTIONS = [
  { 
    value: IBProgramme.PYP, 
    label: 'Primary Years Programme (PYP)', 
    description: 'Ages 3-12, inquiry-based learning',
    ageRange: '3-12 years'
  },
  { 
    value: IBProgramme.MYP, 
    label: 'Middle Years Programme (MYP)', 
    description: 'Ages 11-16, interdisciplinary approach',
    ageRange: '11-16 years'
  },
  { 
    value: IBProgramme.DP, 
    label: 'Diploma Programme (DP)', 
    description: 'Ages 16-19, university preparation',
    ageRange: '16-19 years'
  },
  { 
    value: IBProgramme.CP, 
    label: 'Career-related Programme (CP)', 
    description: 'Ages 16-19, career and academic integration',
    ageRange: '16-19 years'
  },
];

// UK School Type Options
export const UK_SCHOOL_TYPE_OPTIONS = [
  { value: UKSchoolType.STATE_COMPREHENSIVE, label: 'State Comprehensive School' },
  { value: UKSchoolType.STATE_GRAMMAR, label: 'State Grammar School' },
  { value: UKSchoolType.ACADEMY, label: 'Academy' },
  { value: UKSchoolType.FREE_SCHOOL, label: 'Free School' },
  { value: UKSchoolType.INDEPENDENT, label: 'Independent/Private School' },
  { value: UKSchoolType.INTERNATIONAL, label: 'International School' },
  { value: UKSchoolType.SIXTH_FORM_COLLEGE, label: 'Sixth Form College' },
  { value: UKSchoolType.FE_COLLEGE, label: 'Further Education College' },
  { value: UKSchoolType.SPECIAL_SCHOOL, label: 'Special Educational Needs School' },
  { value: UKSchoolType.HOMESCHOOL, label: 'Home Education' },
  { value: UKSchoolType.OTHER, label: 'Other' },
];

// UK Curriculum Subjects by Key Stage
export const UK_CURRICULUM_SUBJECTS = {
  [UKKeyStage.EARLY_YEARS]: [
    'Communication and Language',
    'Physical Development',
    'Personal, Social and Emotional Development',
    'Literacy',
    'Mathematics',
    'Understanding the World',
    'Expressive Arts and Design',
  ],
  [UKKeyStage.KS1]: [
    'English',
    'Mathematics',
    'Science',
    'Art and Design',
    'Computing',
    'Design and Technology',
    'Geography',
    'History',
    'Music',
    'Physical Education',
    'Religious Education',
  ],
  [UKKeyStage.KS2]: [
    'English',
    'Mathematics',
    'Science',
    'Art and Design',
    'Computing',
    'Design and Technology',
    'Geography',
    'History',
    'Music',
    'Physical Education',
    'Religious Education',
    'Modern Foreign Languages',
  ],
  [UKKeyStage.KS3]: [
    'English',
    'Mathematics',
    'Science',
    'Art and Design',
    'Citizenship',
    'Computing',
    'Design and Technology',
    'Geography',
    'History',
    'Modern Foreign Languages',
    'Music',
    'Physical Education',
    'Religious Education',
  ],
  [UKKeyStage.KS4]: [
    'English Language',
    'English Literature',
    'Mathematics',
    'Science (Combined or Separate)',
    'Biology',
    'Chemistry',
    'Physics',
    'Art and Design',
    'Business Studies',
    'Computer Science',
    'Design and Technology',
    'Drama',
    'Economics',
    'Geography',
    'History',
    'Modern Foreign Languages',
    'Music',
    'Physical Education',
    'Religious Studies',
    'Psychology',
  ],
  [UKKeyStage.KS5]: [
    'English Literature',
    'Mathematics',
    'Further Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'Art and Design',
    'Business Studies',
    'Computer Science',
    'Economics',
    'Geography',
    'History',
    'Modern Foreign Languages',
    'Music',
    'Psychology',
    'Philosophy',
    'Politics',
    'Sociology',
    'Media Studies',
    'Film Studies',
  ],
};

// IB Subject Groups
export const IB_SUBJECT_GROUPS = {
  [IBProgramme.PYP]: [
    'Language',
    'Mathematics',
    'Science',
    'Social Studies',
    'Arts',
    'Personal, Social and Physical Education',
  ],
  [IBProgramme.MYP]: [
    'Language Acquisition',
    'Language and Literature',
    'Individuals and Societies',
    'Sciences',
    'Mathematics',
    'Arts',
    'Physical and Health Education',
    'Design',
  ],
  [IBProgramme.DP]: [
    'Studies in Language and Literature',
    'Language Acquisition',
    'Individuals and Societies',
    'Sciences',
    'Mathematics',
    'The Arts',
  ],
  [IBProgramme.CP]: [
    'DP Course',
    'Career-related Study',
    'Core (Personal and Professional Skills, Service Learning, Language Development, Reflective Project)',
  ],
};

// UK Exam Boards
export const UK_EXAM_BOARDS = [
  'AQA',
  'Edexcel (Pearson)',
  'OCR',
  'WJEC/Eduqas',
  'CIE (Cambridge International)',
  'Other',
];

// Helper function to get appropriate subjects based on academic level
export const getSubjectsForAcademicLevel = (
  ukYearGroup?: UKYearGroup,
  ibProgramme?: IBProgramme
): string[] => {
  if (ibProgramme && IB_SUBJECT_GROUPS[ibProgramme]) {
    return IB_SUBJECT_GROUPS[ibProgramme];
  }
  
  if (ukYearGroup) {
    const option = UK_YEAR_GROUP_OPTIONS.find(opt => opt.value === ukYearGroup);
    if (option && UK_CURRICULUM_SUBJECTS[option.keyStage]) {
      return UK_CURRICULUM_SUBJECTS[option.keyStage];
    }
  }
  
  return [];
};

// Helper function to get available qualification levels based on academic level
export const getQualificationLevelsForYear = (
  ukYearGroup?: UKYearGroup,
  ibProgramme?: IBProgramme
): QualificationLevel[] => {
  if (ibProgramme) {
    switch (ibProgramme) {
      case IBProgramme.PYP:
        return [QualificationLevel.IB_PYP];
      case IBProgramme.MYP:
        return [QualificationLevel.IB_MYP];
      case IBProgramme.DP:
        return [QualificationLevel.IB_DP_SL, QualificationLevel.IB_DP_HL];
      case IBProgramme.CP:
        return [QualificationLevel.IB_CP];
    }
  }
  
  if (ukYearGroup) {
    const option = UK_YEAR_GROUP_OPTIONS.find(opt => opt.value === ukYearGroup);
    if (option) {
      switch (option.keyStage) {
        case UKKeyStage.EARLY_YEARS:
          return [QualificationLevel.EARLY_YEARS];
        case UKKeyStage.KS1:
          return [QualificationLevel.KS1];
        case UKKeyStage.KS2:
          return [QualificationLevel.KS2];
        case UKKeyStage.KS3:
          return [QualificationLevel.KS3];
        case UKKeyStage.KS4:
          return [QualificationLevel.GCSE, QualificationLevel.IGCSE, QualificationLevel.BTEC_LEVEL_1, QualificationLevel.BTEC_LEVEL_2];
        case UKKeyStage.KS5:
          return [QualificationLevel.A_LEVEL, QualificationLevel.AS_LEVEL, QualificationLevel.BTEC_LEVEL_3];
      }
    }
  }
  
  return [QualificationLevel.OTHER];
}; 