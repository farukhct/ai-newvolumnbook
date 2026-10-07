export interface VolumeRecord {
  id: string;
  serialNo: number;
  caseNo: string;
  judgementDate: string; // YYYY-MM-DD
  draftDate: string; // YYYY-MM-DD
  finalDate: string; // YYYY-MM-DD
  sendToSectionDate: string; // YYYY-MM-DD
  remarks: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string;
  updatedBy: string;
}

export type UserRole = 'Administrator' | 'User';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AppSettings {
  officeName: string;
  officeAddress: string;
  phone: string;
  email: string;
  defaultRecordsPerPage: number;
  defaultPrintOrientation: 'portrait' | 'landscape';
  dateFormat: string; // 'dd-mm-yyyy'
  theme: 'light' | 'dark';
  portableMode: boolean;
  backupFolder: string;
}

export interface FilterCriteria {
  caseNo?: string;
  serialNo?: string;
  searchTerm?: string;
  judgementFrom?: string;
  judgementTo?: string;
  draftFrom?: string;
  draftTo?: string;
  finalFrom?: string;
  finalTo?: string;
  sendSectionFrom?: string;
  sendSectionTo?: string;
  createdBy?: string;
}

export interface DashboardStats {
  totalRecords: number;
  addedToday: number;
  addedThisMonth: number;
  draftPending: number;
  finalPending: number;
  sentToSection: number;
  latestRecords: VolumeRecord[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}
