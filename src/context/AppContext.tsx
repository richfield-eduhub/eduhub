import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Application, Registration, Notification } from '../types';
import { SEED_USERS, generateStudentId } from '../utils/data';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  applications: Application[];
  registrations: Registration[];
  notifications: Notification[];
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  submitApplication: (app: Omit<Application, 'id' | 'studentId' | 'submittedAt' | 'status'>) => Application;
  approveApplication: (id: string) => { tempPassword?: string; isNew: boolean };
  declineApplication: (id: string, reason: string) => void;
  submitRegistration: (reg: Omit<Registration, 'id' | 'submittedAt' | 'status'>) => Registration;
  approveRegistration: (id: string) => void;
  declineRegistration: (id: string, reason: string) => void;
  markNotificationRead: (id: string) => void;
  changePassword: (userId: string, newPassword: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  // Returning student helpers
  findStudentByIdOrPassport: (value: string) => { user: User; application: Application } | null;
  allocateModules: (applicationId: string, modules: import('../types').Module[], semester: 1 | 2, studyYear: 1 | 2 | 3) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const save = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => load('currentUser', null));
  const [users, setUsers] = useState<User[]>(() => load('users', SEED_USERS));
  const [applications, setApplications] = useState<Application[]>(() => load('applications', []));
  const [registrations, setRegistrations] = useState<Registration[]>(() => load('registrations', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => load('notifications', []));
  const [passwords, setPasswords] = useState<Record<string, string>>(() =>
    load('passwords', { 'admin@richfield.ac.za': 'admin123', 'smokoena@richfield.ac.za': 'lec123' })
  );

  useEffect(() => { save('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { save('users', users); }, [users]);
  useEffect(() => { save('applications', applications); }, [applications]);
  useEffect(() => { save('registrations', registrations); }, [registrations]);
  useEffect(() => { save('notifications', notifications); }, [notifications]);
  useEffect(() => { save('passwords', passwords); }, [passwords]);

  const addNotification = (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const notif: Notification = { ...n, id: Date.now().toString(), createdAt: new Date().toISOString(), read: false };
    setNotifications(prev => [notif, ...prev]);
  };

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, message: 'No account found with that email.' };
    if (passwords[email.toLowerCase()] !== password && passwords[email] !== password)
      return { success: false, message: 'Incorrect password.' };
    setCurrentUser(user);
    return { success: true, message: 'Welcome back!' };
  };

  const logout = () => setCurrentUser(null);

  // Look up an existing student by SA ID or passport number
  const findStudentByIdOrPassport = (value: string): { user: User; application: Application } | null => {
    const app = applications.find(a =>
      a.status === 'approved' &&
      (a.idNumber === value || a.passportNumber === value)
    );
    if (!app) return null;
    const user = users.find(u => u.studentId === app.studentId);
    if (!user) return null;
    return { user, application: app };
  };

  const submitApplication = (appData: Omit<Application, 'id' | 'studentId' | 'submittedAt' | 'status'>): Application => {
    // For returning students, reuse existing studentId if found
    let studentId = generateStudentId();
    if (appData.applicationType === 'returning') {
      const existing = findStudentByIdOrPassport(appData.idNumber || appData.passportNumber);
      if (existing) studentId = existing.application.studentId;
    }

    const app: Application = {
      ...appData,
      id: `APP-${Date.now()}`,
      studentId,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    setApplications(prev => [app, ...prev]);
    const admins = users.filter(u => u.role === 'admin');
    const typeLabel = appData.applicationType === 'returning' ? '🔄 Returning Student' : '🆕 New Student';
    admins.forEach(a => addNotification({
      userId: a.id,
      title: `${typeLabel} Application Received`,
      message: `${appData.firstName} ${appData.lastName} submitted a ${appData.applicationType} application for ${appData.qualificationName} (Year ${appData.studyYear}).`,
      type: 'info',
    }));
    return app;
  };

  const approveApplication = (id: string): { tempPassword?: string; isNew: boolean } => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    const app = applications.find(a => a.id === id);
    if (!app) return { isNew: false };

    // For returning students, find existing user — don't create duplicate
    const existingUser = users.find(u => u.studentId === app.studentId);
    if (existingUser) {
      addNotification({
        userId: existingUser.id,
        title: '🎉 Re-enrolment Approved!',
        message: `Your returning student application for Year ${app.studyYear} of ${app.qualificationName} has been approved. You can now register for your new modules.`,
        type: 'success',
      });
      return { isNew: false };
    }

    // New student — create account
    const tempPwd = `Richfield@${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: `${app.firstName} ${app.lastName}`,
      email: app.email,
      role: 'student',
      studentId: app.studentId,
      tempPassword: true,
    };
    setUsers(prev => [...prev, newUser]);
    setPasswords(prev => ({ ...prev, [app.email.toLowerCase()]: tempPwd }));
    addNotification({
      userId: newUser.id,
      title: '🎉 Application Approved!',
      message: `Your application has been approved. Your Student ID is ${app.studentId}. Temporary password: ${tempPwd}. Please log in and change your password.`,
      type: 'success',
    });
    const admins = users.filter(u => u.role === 'admin');
    admins.forEach(a => addNotification({
      userId: a.id,
      title: 'Application Approved',
      message: `Approved ${app.firstName} ${app.lastName}'s application. Student ID: ${app.studentId}.`,
      type: 'success',
    }));
    return { tempPassword: tempPwd, isNew: true };
  };

  const declineApplication = (id: string, reason: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'declined', declineReason: reason } : a));
    const app = applications.find(a => a.id === id);
    if (!app) return;
    addNotification({
      userId: app.studentId,
      title: 'Application Update',
      message: `Your application was not approved. Reason: ${reason}`,
      type: 'error',
    });
  };

  const submitRegistration = (regData: Omit<Registration, 'id' | 'submittedAt' | 'status'>): Registration => {
    const reg: Registration = {
      ...regData,
      id: `REG-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    setRegistrations(prev => [reg, ...prev]);
    const admins = users.filter(u => u.role === 'admin');
    admins.forEach(a => addNotification({
      userId: a.id,
      title: 'New Registration Submitted',
      message: `Student ${regData.studentId} submitted registration for ${regData.qualificationName} — Year ${regData.studyYear}, Semester ${regData.semester}.`,
      type: 'info',
    }));
    return reg;
  };

  const approveRegistration = (id: string) => {
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    const reg = registrations.find(r => r.id === id);
    if (!reg) return;
    const student = users.find(u => u.studentId === reg.studentId);
    if (student) {
      addNotification({
        userId: student.id,
        title: '✅ Registration Confirmed!',
        message: `Your registration for ${reg.qualificationName} — Year ${reg.studyYear}, Semester ${reg.semester} — has been approved. You are registered for ${reg.modules.length} modules.`,
        type: 'success',
      });
    }
  };

  const declineRegistration = (id: string, reason: string) => {
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: 'declined', declineReason: reason } : r));
    const reg = registrations.find(r => r.id === id);
    if (!reg) return;
    const student = users.find(u => u.studentId === reg.studentId);
    if (student) addNotification({
      userId: student.id,
      title: 'Registration Declined',
      message: `Your registration was declined. Reason: ${reason}`,
      type: 'error',
    });
  };

  const markNotificationRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const changePassword = (userId: string, newPassword: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setPasswords(prev => ({ ...prev, [user.email.toLowerCase()]: newPassword }));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tempPassword: false } : u));
    setCurrentUser(prev => prev?.id === userId ? { ...prev, tempPassword: false } : prev);
  };

  /** Admin allocates modules directly to a student (Model B) */
  const allocateModules = (
    applicationId: string,
    modules: import('../types').Module[],
    semester: 1 | 2,
    studyYear: 1 | 2 | 3,
  ) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;
    const qual = app.qualificationCode;
    const qualName = app.qualificationName;
    const fee = modules.length * 5000; // simplified per-module fee

    // Remove any existing allocation for this student/semester/year
    setRegistrations(prev => prev.filter(r =>
      !(r.studentId === app.studentId && r.semester === semester && r.studyYear === studyYear)
    ));

    const reg: import('../types').Registration = {
      id: `ALLOC-${Date.now()}`,
      studentId: app.studentId,
      applicationId,
      qualificationCode: qual,
      qualificationName: qualName,
      modules,
      semester,
      studyYear,
      year: new Date().getFullYear(),
      status: 'allocated',
      allocatedAt: new Date().toISOString(),
      allocatedBy: 'Admin',
      submittedAt: new Date().toISOString(),
      totalFee: fee,
      feePaid: false,
    };
    setRegistrations(prev => [reg, ...prev]);

    // Notify student
    const student = users.find(u => u.studentId === app.studentId);
    if (student) {
      addNotification({
        userId: student.id,
        title: '📚 Modules Allocated!',
        message: `Your modules for ${qualName} — Year ${studyYear}, Semester ${semester} — have been allocated by admin. You have ${modules.length} modules. Log in to view your timetable.`,
        type: 'success',
      });
    }

    // Notify admins
    const admins = users.filter(u => u.role === 'admin');
    admins.forEach(a => addNotification({
      userId: a.id,
      title: 'Modules Allocated',
      message: `${modules.length} modules allocated to ${app.firstName} ${app.lastName} (${app.studentId}) for Semester ${semester}, Year ${studyYear}.`,
      type: 'success',
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, applications, registrations, notifications,
      login, logout, submitApplication, approveApplication, declineApplication,
      submitRegistration, approveRegistration, declineRegistration,
      markNotificationRead, changePassword, addNotification,
      findStudentByIdOrPassport, allocateModules,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
