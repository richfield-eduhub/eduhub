export type UserRole = 'admin' | 'student' | 'lecturer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  tempPassword?: boolean;
}

export interface Application {
  id: string;
  studentId: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'declined';
  declineReason?: string;

  // Application type (from JotForm)
  applicationType: 'new' | 'returning' | 'other';
  admissionFor: string; // '1st Semester' | '2nd Semester' | '1st Year' | '2nd Year' | '3rd Year'
  studyYear: 1 | 2 | 3;

  // Personal
  firstName: string;
  lastName: string;
  idNumber: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;

  // Contact
  phone: string;
  email: string;
  altEmail?: string;

  // Address
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;

  // Education
  highSchool: string;
  highSchoolYear: string;
  highestGrade: string;

  // Tertiary (optional)
  tertiaryInstitution?: string;
  tertiaryQualification?: string;
  tertiaryYear?: string;

  // Account Payer
  payerName: string;
  payerRelation: string;
  payerPhone: string;
  payerEmail: string;
  payerAddress: string;

  // Qualification
  qualificationCode: string;
  qualificationName: string;

  // Docs
  docsUploaded: string[];

  // T&C
  tcAccepted: boolean;
}

export interface Module {
  code: string;
  name: string;
  credits: number;
  semester: 1 | 2;
  year: 1 | 2 | 3;
}

export interface Qualification {
  code: string;
  name: string;
  faculty: string;
  duration: string;
  modules: Module[];
  fee: number;
}

export interface Registration {
  id: string;
  studentId: string;
  applicationId: string;
  qualificationCode: string;
  qualificationName: string;
  modules: Module[];
  semester: 1 | 2;
  studyYear: 1 | 2 | 3;
  year: number;
  /** 'allocated' = admin assigned modules directly (Model B) */
  status: 'pending' | 'approved' | 'declined' | 'allocated';
  allocatedAt?: string;
  allocatedBy?: string;  // admin name
  submittedAt: string;
  totalFee: number;
  feePaid: boolean;
  declineReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
