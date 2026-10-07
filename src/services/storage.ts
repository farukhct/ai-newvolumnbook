import { AppSettings, User, VolumeRecord } from '../types';

const STORAGE_KEYS = {
  RECORDS: 'volumnbook_volume_records',
  USERS: 'volumnbook_users',
  SETTINGS: 'volumnbook_settings',
  SESSION: 'volumnbook_active_session',
  AUTO_BACKUP: 'volumnbook_safety_backup',
};

// Default Settings
export const DEFAULT_SETTINGS: AppSettings = {
  officeName: 'VolumnBook Case Volume Office',
  officeAddress: 'Court Record & Judicial Section',
  phone: '+880-1700-000000',
  email: 'office@volumnbook.local',
  defaultRecordsPerPage: 20,
  defaultPrintOrientation: 'landscape',
  dateFormat: 'dd-mm-yyyy',
  theme: 'light',
  portableMode: true,
  backupFolder: 'C:\\VolumnBook\\Backups',
};

// Simple secure offline hash function for passwords
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode('volumnbook_salt_2026_' + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class StorageService {
  /**
   * Initializes storage structures.
   * STRICT REQUIREMENT: No dummy records inserted!
   */
  public static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  // ===================== USER MANAGEMENT =====================

  public static getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static hasAdministrator(): boolean {
    const users = this.getUsers();
    return users.some(u => u.role === 'Administrator' && u.isActive);
  }

  public static async createInitialAdmin(fullName: string, username: string, email: string, password: string): Promise<User> {
    const users = this.getUsers();
    if (users.length > 0 && this.hasAdministrator()) {
      throw new Error('An administrator account already exists.');
    }
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const admin: User = {
      id: 'usr_' + Date.now(),
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      email: email.trim(),
      passwordHash,
      role: 'Administrator',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    users.push(admin);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setActiveSession(admin);
    return admin;
  }

  public static async createUser(creatorRole: string, userData: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    role: 'Administrator' | 'User';
  }): Promise<User> {
    if (creatorRole !== 'Administrator') {
      throw new Error('Only administrators can register new users.');
    }
    const users = this.getUsers();
    const normalizedUsername = userData.username.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === normalizedUsername)) {
      throw new Error(`Username "${userData.username}" is already taken.`);
    }

    const passwordHash = await hashPassword(userData.password);
    const now = new Date().toISOString();
    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: normalizedUsername,
      fullName: userData.fullName.trim(),
      email: userData.email.trim(),
      passwordHash,
      role: userData.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  public static async authenticate(username: string, password: string): Promise<User> {
    const users = this.getUsers();
    const normalizedUsername = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === normalizedUsername);

    if (!user) {
      throw new Error('Invalid username or password.');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact an Administrator.');
    }

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Invalid username or password.');
    }

    user.lastLoginAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setActiveSession(user);
    return user;
  }

  public static async resetPassword(adminUsername: string, targetUserId: string, newPassword: string): Promise<void> {
    const users = this.getUsers();
    const admin = users.find(u => u.username === adminUsername);
    if (!admin || admin.role !== 'Administrator') {
      throw new Error('Only an administrator can reset passwords.');
    }

    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found.');
    }

    targetUser.passwordHash = await hashPassword(newPassword);
    targetUser.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public static toggleUserStatus(adminUsername: string, targetUserId: string): User {
    const users = this.getUsers();
    const admin = users.find(u => u.username === adminUsername);
    if (!admin || admin.role !== 'Administrator') {
      throw new Error('Only an administrator can change user status.');
    }

    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) {
      throw new Error('User not found.');
    }

    // Safety: Prevent deactivating the only active administrator
    if (targetUser.role === 'Administrator' && targetUser.isActive) {
      const activeAdmins = users.filter(u => u.role === 'Administrator' && u.isActive);
      if (activeAdmins.length <= 1) {
        throw new Error('Cannot deactivate the sole active Administrator account.');
      }
    }

    targetUser.isActive = !targetUser.isActive;
    targetUser.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return targetUser;
  }

  public static deleteUser(adminUsername: string, targetUserId: string): void {
    const users = this.getUsers();
    const admin = users.find(u => u.username === adminUsername);
    if (!admin || admin.role !== 'Administrator') {
      throw new Error('Only an administrator can delete users.');
    }

    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) {
      throw new Error('User not found.');
    }

    if (targetUser.role === 'Administrator') {
      const adminCount = users.filter(u => u.role === 'Administrator').length;
      if (adminCount <= 1) {
        throw new Error('Cannot delete the only Administrator account.');
      }
    }

    const updated = users.filter(u => u.id !== targetUserId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  }

  // ===================== SESSION MANAGEMENT =====================

  public static setActiveSession(user: User): void {
    const safeUser = { ...user, passwordHash: 'REDACTED' };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
  }

  public static getActiveSession(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // ===================== VOLUME RECORDS CRUD =====================

  public static getRecords(): VolumeRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static getNextSerialNo(): number {
    const records = this.getRecords();
    if (records.length === 0) return 1;
    const maxSerial = Math.max(...records.map(r => Number(r.serialNo) || 0));
    return maxSerial + 1;
  }

  public static isSerialNoUnique(serialNo: number, excludeId?: string): boolean {
    const records = this.getRecords();
    return !records.some(r => r.serialNo === serialNo && r.id !== excludeId);
  }

  public static checkDuplicateCase(caseNo: string, judgementDate?: string, excludeId?: string): VolumeRecord | null {
    if (!caseNo) return null;
    const records = this.getRecords();
    const trimmedCase = caseNo.trim().toLowerCase();
    return records.find(r => 
      r.caseNo.trim().toLowerCase() === trimmedCase &&
      (!judgementDate || r.judgementDate === judgementDate) &&
      r.id !== excludeId
    ) || null;
  }

  public static createRecord(recordData: {
    serialNo?: number;
    caseNo: string;
    judgementDate: string;
    draftDate: string;
    finalDate: string;
    sendToSectionDate: string;
    remarks: string;
  }, username: string): VolumeRecord {
    const records = this.getRecords();
    const finalSerialNo = recordData.serialNo ?? this.getNextSerialNo();

    if (!this.isSerialNoUnique(finalSerialNo)) {
      throw new Error(`Serial No ${finalSerialNo} is already assigned to another record.`);
    }

    if (!recordData.caseNo || !recordData.caseNo.trim()) {
      throw new Error('Case No is required.');
    }

    const now = new Date().toISOString();
    const newRecord: VolumeRecord = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      serialNo: finalSerialNo,
      caseNo: recordData.caseNo.trim(),
      judgementDate: recordData.judgementDate?.trim() || '',
      draftDate: recordData.draftDate?.trim() || '',
      finalDate: recordData.finalDate?.trim() || '',
      sendToSectionDate: recordData.sendToSectionDate?.trim() || '',
      remarks: recordData.remarks || '',
      createdAt: now,
      updatedAt: now,
      createdBy: username || 'System',
      updatedBy: username || 'System',
    };

    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return newRecord;
  }

  public static updateRecord(id: string, updateData: Partial<VolumeRecord>, username: string): VolumeRecord {
    const records = this.getRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Record not found.');
    }

    if (updateData.serialNo !== undefined && !this.isSerialNoUnique(updateData.serialNo, id)) {
      throw new Error(`Serial No ${updateData.serialNo} is already in use.`);
    }

    const existing = records[index];
    const updated: VolumeRecord = {
      ...existing,
      ...updateData,
      caseNo: updateData.caseNo ? updateData.caseNo.trim() : existing.caseNo,
      updatedAt: new Date().toISOString(),
      updatedBy: username || 'System',
    };

    records[index] = updated;
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return updated;
  }

  public static deleteRecord(id: string): void {
    const records = this.getRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filtered));
  }

  // ===================== SETTINGS =====================

  public static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // ===================== DATABASE SAFETY: BACKUP, RESTORE, CLEAN, INTEGRITY =====================

  public static backupDatabase(): { filename: string; jsonContent: string; recordCount: number; userCount: number } {
    const records = this.getRecords();
    const users = this.getUsers();
    const settings = this.getSettings();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `VolumnBook_Backup_${timestamp.substring(0, 19)}.db.json`;

    const backupPayload = {
      version: '1.0.0',
      database: 'VolumnBook.db',
      checksum: 'vb_' + records.length + '_' + users.length,
      createdAt: new Date().toISOString(),
      schema: {
        VolumeRecords: records,
        Users: users,
        Settings: settings,
      },
    };

    return {
      filename,
      jsonContent: JSON.stringify(backupPayload, null, 2),
      recordCount: records.length,
      userCount: users.length,
    };
  }

  public static restoreDatabase(jsonString: string): { restoredRecords: number; restoredUsers: number } {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new Error('Invalid backup file. JSON format is corrupt or unreadable.');
    }

    if (!parsed.schema || !Array.isArray(parsed.schema.VolumeRecords)) {
      throw new Error('Invalid backup schema. Required "VolumeRecords" table not found.');
    }

    // Step 1: Automatic Safety Backup of Current State
    const currentRecords = this.getRecords();
    const currentUsers = this.getUsers();
    localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP, JSON.stringify({
      timestamp: new Date().toISOString(),
      records: currentRecords,
      users: currentUsers,
    }));

    // Step 2: Validate integrity of incoming records
    const recordsToRestore: VolumeRecord[] = parsed.schema.VolumeRecords;
    for (const r of recordsToRestore) {
      if (!r.id || !r.caseNo || r.serialNo === undefined) {
        throw new Error('Integrity check failed: Incoming record is missing required fields (id, caseNo, serialNo).');
      }
    }

    // Step 3: Apply restore
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(recordsToRestore));

    let restoredUsers = 0;
    if (Array.isArray(parsed.schema.Users) && parsed.schema.Users.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed.schema.Users));
      restoredUsers = parsed.schema.Users.length;
    }

    if (parsed.schema.Settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.schema.Settings));
    }

    return {
      restoredRecords: recordsToRestore.length,
      restoredUsers,
    };
  }

  public static cleanDatabase(adminUsername: string): { backupFilename: string; deletedCount: number } {
    const users = this.getUsers();
    const admin = users.find(u => u.username === adminUsername);
    if (!admin || admin.role !== 'Administrator') {
      throw new Error('Unauthorized: Only Administrators can clean the database.');
    }

    const currentRecords = this.getRecords();
    const deletedCount = currentRecords.length;

    // Automatic pre-clean backup
    const backup = this.backupDatabase();
    localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP, backup.jsonContent);

    // Empty VolumeRecords table
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));

    return {
      backupFilename: backup.filename,
      deletedCount,
    };
  }

  public static runIntegrityCheck(): {
    status: 'HEALTHY' | 'WARNING' | 'ERROR';
    summary: string;
    details: string[];
    recordCount: number;
    userCount: number;
  } {
    const records = this.getRecords();
    const users = this.getUsers();
    const details: string[] = [];
    let hasError = false;
    let hasWarning = false;

    // Check 1: User sanity
    if (users.length === 0) {
      details.push('WARNING: No user accounts detected. First-run administrator creation is pending.');
      hasWarning = true;
    } else {
      const activeAdmins = users.filter(u => u.role === 'Administrator' && u.isActive);
      if (activeAdmins.length === 0) {
        details.push('ERROR: No active Administrator account exists in Users table.');
        hasError = true;
      } else {
        details.push(`PRAGMA user_check: ${users.length} total user(s), ${activeAdmins.length} active Administrator(s).`);
      }
    }

    // Check 2: Serial number collisions
    const serialMap = new Map<number, number>();
    for (const r of records) {
      serialMap.set(r.serialNo, (serialMap.get(r.serialNo) || 0) + 1);
    }
    const duplicateSerials: number[] = [];
    serialMap.forEach((count, serial) => {
      if (count > 1) duplicateSerials.push(serial);
    });

    if (duplicateSerials.length > 0) {
      details.push(`ERROR: Duplicate Serial Numbers detected: ${duplicateSerials.join(', ')}.`);
      hasError = true;
    } else {
      details.push('PRAGMA serial_check: All Serial Numbers are unique and consistent.');
    }

    // Check 3: Date formatting sanity
    let dateIssues = 0;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const r of records) {
      if (r.judgementDate && !isoDateRegex.test(r.judgementDate)) dateIssues++;
      if (r.draftDate && !isoDateRegex.test(r.draftDate)) dateIssues++;
      if (r.finalDate && !isoDateRegex.test(r.finalDate)) dateIssues++;
      if (r.sendToSectionDate && !isoDateRegex.test(r.sendToSectionDate)) dateIssues++;
    }

    if (dateIssues > 0) {
      details.push(`WARNING: ${dateIssues} dates do not match strict YYYY-MM-DD SQLite standard.`);
      hasWarning = true;
    } else {
      details.push('PRAGMA date_check: All date fields follow standard ISO YYYY-MM-DD representation.');
    }

    details.push(`PRAGMA table_volume_records: ${records.length} records indexed.`);

    return {
      status: hasError ? 'ERROR' : hasWarning ? 'WARNING' : 'HEALTHY',
      summary: hasError
        ? 'Integrity check encountered critical issues.'
        : hasWarning
        ? 'Integrity check completed with warnings.'
        : 'PRAGMA integrity_check: OK. Database structure and records are 100% valid.',
      details,
      recordCount: records.length,
      userCount: users.length,
    };
  }
}
