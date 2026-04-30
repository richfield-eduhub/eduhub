/**
 * EduHub shared.js  v3 — API-connected
 * Every data operation calls the real REST API at /api/*
 * Auth token stored in localStorage('authToken')
 * User object cached in localStorage('currentUser') for instant UI render
 */

/* ═══════════════════════════════════════════════════
   CONSTANTS  (no server call needed)
   ═══════════════════════════════════════════════════ */
const EDUHUB_LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAACUCAMAAADRRocBAAAA51BMVEUAVa////8AVbEAVq7///38//8AQ6eLpcj///sAUK6Sqc6DpscAOKDC0OG+0uP2//8AR6UATq/p9f1Xd7Pu+//r7/bZ5fDh7vfN4eseXahKdqrP3+0vZ7AvZqgAKJSgu9nC2eU9cLhdhLwgVKgAPJROer4AO5sANZjg8fXuQ0CdRG0AM56WqslGaaqy0+r2QTlijsOSsMotTpVDVZ4AT551T37DS1twUYgAR5xQVJI8RofDTmXVSE94nMuTstQybqmzTmDJUFSTTnOGSnneSUz/PjOPSGVfSoEmZbiswNZpk7pkhqwAGIkzmFnwAAAIWUlEQVR4nO2ba3fiNhCGLcs2VmJACmBDgIZgIpMl5DbsLDPbJDPbvdNNtv//79kqyTYOm3xYZ87JYU49fQHLxuh1SW+VhOMQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBPEhcO64BfYd5+b9kSKg61ZBBQcb+Ed3rT6VGO0lYeNHd6wmriNfI5BSHKskMTs54Dp/7RzpwOPBqd+GPxXa+VGDH2eYQBLz2SuErOEcrSSPDRvXjRL7tukft6SJBocrEGjpsnHUkpg3ibDzhYEr8fCTPKlKsvm36upVsbntH7a+OJufd6stZS5/8eTyfP9OSWwSYK7FTCTg3/rvP/8j2EsSQmdRlGVZtNRSmEA6QZYpyMYcUprSej6fZxFY/lxrkfdLaJ0JLrT5YJYt4dPSdWWmBXezpW3EG8JNomgDxYrVy7k5pbVULn5PLYOykiKQA1XE+pe1WP/6z6vPv1QkqdFkmnOz3QSmrnictkYOdkPpp/th1z/rTxw3fey3Lm0y4/pm2vouO7tpSWsbDO6nNysx2rdNbwZq3J8+RqUk3bIXP3Z0ADNA1I9SBI+DO7/+9vvD5l9Xt7efH/aSuHPZL1zQY+x0LlzBm6z9BF/IN+OWbQ7ZWKVT1rtT9rlmC9a7CGYJnjP26fmP0bjJuh0xgA94+Q0Xq+Ccea29pE/tMMQ7hqx7KhWvpamQxHn65eu/v/7x+fb29uq3dXXgXQy99pnBh75MAuGipBW8iLs29PZserOL2UqkLZbcSXvbJUqSs6T45NlZ0tAjlCQHfujlbd3pACSxA0l4wgs91h+od0gKePrtZwjP1ZX5+wd/KYkNLzKYMPP1hIU96DVveu2VEuqOhX5yul5GkT7/7oKkXi7JLaPUGuAH5xs93wgjSYGk5NNmbqbgnKtzFr6U1Btket3ZdcOwPRZ1Cphckvvta6EH/n5xDiVd4uMSKtsx1ty4qYmSeuiysDkKsMh1YOBbSdx0z0iKUNIIO8thpsKkREnB2vcSXRTFKOlllLzeGIa21HexFybz99jDt89XJV+/vSLJeCtMBG84sJKcaMIgfLK4kY1SYFxY4cB7wig1R9BB8FGwVFEMPJDkmJwATqPMXDKRLSWZ+RjMeh47lTU05ZKchy9/K/nyk/tqlCAWadeLR8JGKfOZvw3KoWEl2aEiyoHXHKdo9WD4vCopNbkALfMNSZzre99b1AlTIckdXV4UjMQrUTJrQrVqQ5SM463kE/PiTSX7oqRd4xo5aXRzSfG9aWigmZSSzuxVHWh8W5K77oGP1vCHXJLLG/GwYCIdeWgPgRBSyXTH/N1GOCgJy44bvc/zKMnbV72hlVS4NVy4l5Q3NiRk6jcl8QwSBMzNupL4ppHEcQLESTyZH0Yp3nZmwN2OeclMKSMpumd+I+AvJPlwE4vvWUldezjR1YHnm7bpTPLXB55jtkNwrp4GdSVpno6gyx0AXi7E4VyyfRjCQ+/CEBKlpMcDSb3GzNLp5pKGz+b4QhSSFA68c2y7/O6+IQmnGXeDifcuSWBIwcXJ9fVkIAVM8QNJZfkw3KZgVWYuRacs3EUvJSUzLXCZr37s81Kg4Bhrw72kJMOrFM6TNyU5PGqF7LmeJKwIsHJTndhvszHuDh3Opd4Op3MfsuIntGMjCTsTb8SB40nHFNL7VAsm7piy1KlI0qbYdt+UZA43YA9PdexBbpm302ZHaDRkXntjMpC8htnr7u2hA4/ZOW+zMxj/uSTHmHj0QhIWRMaeDySZCyqS5riiMJ98ay65roYl26JGXrKWM9RmN1I2WdiXKEm4E9Z+FhUTV/AlwY6FQ4k5BgsiJwL7G46C4k65JLveqUhSxeKoGiXHmtqbklw3mvXAHVSd8gELgp5GFTyY+GwnMaeLUYt1Z9KK3hdEg3bon+oiSi4chsOnIN+bddKWlxSmqxfhPkq8GiVwPJbg3IXgCeGqS6zxzChE2bYgggyczeIw7G/qKHJc+HYfxgtKemzDc8E+ybsuG67sOC6rB7jgmbF4VFbi4j8s9OLtJoN12/hCrVseLC6spGzhlZL4C0lQ47HkxxzKVlglZo48Z37rh7bM3bxs3VzaslXVXDCdQKmWYZTUXY91cDkpHJhK10VP8uoBJLnzIbicFutc0ubZh7XPorWDxcU2SI0ke9OyxqtIcqwkGHheYlgk3bsNlK2hPUzOblJcXOA7XGIlkHNrSXKcOeS+LSy0XTXu+QMYACqAdVAyy6emW0YJzkAR1HsObNmK63FcAuKCzgNJ66m32C8Bw97lS0muKudSWGaFO1xclId9I8kuKbv3a2XrwDphgsqmdw62INLdzQOmv1UMuYqXRrXr7y7MAhdK8dN+f5Kmk/50hGOfC/00ibu+n7TGAlpbMzuXuLzp40K91b8fiHwHwRXf4YInZ9A3TKf4/2xz2S+Op3DnzLT2W5PZXO/D+//icj0Noc5BC4L7CMU7YOatcvnFHZlp47jwzESQZQGkrWUW5L/hKJ3BYg6v4PAuHyggFd67AtudomdcyCwDQ9DLZbRcZhm8ZMpRuNmyBKJoGbg8P6FxiHBRc1se/G0Qe1DLDOAOsPgaPC/A1meyssf1v5tZeVbJb1DsUh1ed/gTVbnpVWyUYUPlly2nPKqlpARLlfEQ0uZwu0r5agb1tI+KjvfHGHzgUH7tILH58eQatHm93ViaX9E+umt1wUzJRbptnlnb6TW3qXT4UUfJ/q4pB9td3G3Hze0gMOXLR/frHaC1GJOQ6azRmK2DfA/8o/v1pwCqpDjYdT92jtgR3sDsMf61RP0JSY4gCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgiL8C/wV+5uPHBSgcigAAAABJRU5ErkJggg==";

const DEFAULT_APP_CONFIG = {
  API_BASE: "/api",
  LOCALE: "en-ZA",
  ROUTES: {
    login: "/login",
    home: "/",
    roleHomes: {
      admin: "/admin",
      student: "/student",
      lecturer: "/lecturer",
    },
    forceChangePassword: "/student/profile?forceChange=1",
  },
  DEFAULTS: {
    auditLogLimit: 50,
    toastMs: 4000,
    minuteMs: 60000,
    referenceDataTtlMs: 24 * 60 * 60 * 1000,
    referenceDataVersion: "v2",
    homeConfigTtlMs: 24 * 60 * 60 * 1000,
    homeConfigVersion: "v1",
    popularProgrammesLimit: 4,
  },
  THEME: {
    roleColors: {
      admin: "#7c3aed",
      lecturer: "#d97706",
      student: "#059669",
    },
  },
  HOME_STATS: {
    yearsOfExcellence: 25,
    alumniWorldwide: 50000,
    display: {
      yearsOfExcellence: { label: "Years of Excellence", suffix: "+" },
      alumniWorldwide: { label: "Alumni Worldwide", suffix: "+" },
      qualifications: { label: "Qualifications", suffix: "+" },
      campuses: { label: "Campus Locations", suffix: "" },
    },
  },
};

function mergeAppConfig(base, override) {
  if (!override || typeof override !== "object") return base;
  const mergedRoutes = {
    ...base.ROUTES,
    ...(override.ROUTES || {}),
    roleHomes: {
      ...base.ROUTES.roleHomes,
      ...((override.ROUTES && override.ROUTES.roleHomes) || {}),
    },
  };
  const mergedDefaults = {
    ...base.DEFAULTS,
    ...(override.DEFAULTS || {}),
  };
  const mergedTheme = {
    ...base.THEME,
    ...(override.THEME || {}),
    roleColors: {
      ...base.THEME.roleColors,
      ...((override.THEME && override.THEME.roleColors) || {}),
    },
  };
  const mergedHomeStatsDisplay = {
    ...(base.HOME_STATS.display || {}),
    ...((override.HOME_STATS && override.HOME_STATS.display) || {}),
  };
  const mergedHomeStats = {
    ...base.HOME_STATS,
    ...(override.HOME_STATS || {}),
    display: mergedHomeStatsDisplay,
  };
  return {
    ...base,
    ...override,
    ROUTES: mergedRoutes,
    DEFAULTS: mergedDefaults,
    THEME: mergedTheme,
    HOME_STATS: mergedHomeStats,
  };
}

const APP_CONFIG = mergeAppConfig(
  DEFAULT_APP_CONFIG,
  window.__EDUHUB_CONFIG || {},
);

const ROLES = Object.freeze({
  ADMIN: "admin",
  STUDENT: "student",
  LECTURER: "lecturer",
});

// Qualifications are fetched from backend API (/api/qualifications)
// This array is populated dynamically via initReferenceData()
let QUALIFICATIONS = [];

let NATIONALITIES = [
  "South African",
  "Zimbabwean",
  "Mozambican",
  "Zambian",
  "Malawian",
  "Botswanan",
  "Namibian",
  "Swazi",
  "Lesothan",
  "Congolese (DRC)",
  "Nigerian",
  "Ghanaian",
  "Kenyan",
  "Tanzanian",
  "British",
  "American",
  "Canadian",
  "Australian",
  "Indian",
  "Pakistani",
  "Other",
];

// Static reference data (hardcoded - rarely changes)
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

const EDUCATION_LEVELS_SA = ["Grade 12 / Matric", "Grade 11", "GED", "N3"];

const EDUCATION_LEVELS_FOREIGN = ["Foreign equivalent"];

const PAYER_RELATIONSHIPS = [
  "Self",
  "Parent",
  "Guardian",
  "Sponsor",
  "Employer",
];

// Dynamic reference data (fetched from backend - changes frequently)
let DOCUMENT_REQUIREMENTS_SA = [
  "Certified copy of SA ID document",
  "Certified copy of Matric certificate",
  "Certified copy of tertiary qualifications",
  "Proof of payment / funding letter",
  "Passport photo",
];

let DOCUMENT_REQUIREMENTS_FOREIGN = [
  "Certified copy of Passport (all pages)",
  "Study permit / visa",
  "Certified copy of highest qualification",
  "Proof of payment / funding letter",
  "Passport photo",
  "SAQA evaluation letter",
];

const REFERENCE_CACHE_KEY = "eduhub.referenceData";
let referenceDataInitPromise = null;

function getQualifications() {
  return QUALIFICATIONS;
}

function getNationalities() {
  return NATIONALITIES;
}

function getGenders() {
  return GENDERS;
}

function getProvinces() {
  return PROVINCES;
}

function getEducationLevels(isForeign = false) {
  return isForeign ? EDUCATION_LEVELS_FOREIGN : EDUCATION_LEVELS_SA;
}

function getPayerRelationships() {
  return PAYER_RELATIONSHIPS;
}

function getDocumentRequirements(isForeign = false) {
  return isForeign ? DOCUMENT_REQUIREMENTS_FOREIGN : DOCUMENT_REQUIREMENTS_SA;
}

function readReferenceCache() {
  try {
    const raw = localStorage.getItem(REFERENCE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      parsed.version !== APP_CONFIG.DEFAULTS.referenceDataVersion
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeReferenceCache(data) {
  try {
    localStorage.setItem(
      REFERENCE_CACHE_KEY,
      JSON.stringify({
        version: APP_CONFIG.DEFAULTS.referenceDataVersion,
        fetchedAt: Date.now(),
        qualifications: data.qualifications,
        nationalities: data.nationalities,
        documentRequirementsSA: data.documentRequirementsSA,
        documentRequirementsForeign: data.documentRequirementsForeign,
      }),
    );
  } catch {
    // ignore cache write failures
  }
}

function hydrateReferenceData(data) {
  if (Array.isArray(data.qualifications) && data.qualifications.length) {
    QUALIFICATIONS = data.qualifications;
  }
  if (Array.isArray(data.nationalities) && data.nationalities.length) {
    NATIONALITIES = data.nationalities;
  }
  if (
    Array.isArray(data.documentRequirementsSA) &&
    data.documentRequirementsSA.length
  ) {
    DOCUMENT_REQUIREMENTS_SA = data.documentRequirementsSA;
  }
  if (
    Array.isArray(data.documentRequirementsForeign) &&
    data.documentRequirementsForeign.length
  ) {
    DOCUMENT_REQUIREMENTS_FOREIGN = data.documentRequirementsForeign;
  }
}

function normalizeQualification(q) {
  const durationYears =
    q.duration_years ?? q.durationYears ?? q.duration ?? q.duration_in_years;
  const fee = Number(q.total_fee ?? q.totalFee ?? q.fee ?? 0);
  return {
    code: q.code,
    name: q.name,
    faculty: q.faculty,
    duration:
      typeof durationYears === "number"
        ? `${durationYears} Year${durationYears === 1 ? "" : "s"}`
        : String(durationYears || "N/A"),
    fee,
    modules: Array.isArray(q.modules)
      ? q.modules.map((m) => ({
          code: m.code,
          name: m.name,
          credits: Number(m.credits || 0),
          semester: Number(m.semester || m.semester_number || 1),
          year: Number(m.year || m.year_of_study || 1),
        }))
      : [],
  };
}

async function fetchReferenceDataFromApi() {
  let qualifications = [];

  // Prefer richer reference catalogue if available.
  const referenceQualsRes = await api("GET", "/reference/qualifications");
  if (referenceQualsRes.ok && Array.isArray(referenceQualsRes.data)) {
    qualifications = referenceQualsRes.data
      .map((q) => normalizeQualification(q))
      .filter((q) => q.code && q.name);
  }

  // Fallback to legacy qualifications endpoint for older environments.
  if (!qualifications.length) {
    const qualsRes = await api("GET", "/qualifications?active_only=true");
    if (!qualsRes.ok || !Array.isArray(qualsRes.data)) {
      throw new Error("Failed to fetch qualifications");
    }

    const detailResponses = await Promise.all(
      qualsRes.data.map((q) => api("GET", `/qualifications/${q.id}`)),
    );

    qualifications = detailResponses
      .filter((r) => r.ok && r.data)
      .map((r) => normalizeQualification(r.data))
      .filter((q) => q.code && q.name);
  }

  // Fetch dynamic reference data in parallel (items that change frequently)
  const [natsRes, docReqSARes, docReqForeignRes] = await Promise.all([
    api("GET", "/reference/nationalities"),
    api("GET", "/reference/document-requirements?type=sa_national"),
    api("GET", "/reference/document-requirements?type=foreign_national"),
  ]);

  const nationalities =
    natsRes.ok && Array.isArray(natsRes.data) ? natsRes.data : [];
  const documentRequirementsSA =
    docReqSARes.ok && Array.isArray(docReqSARes.data) ? docReqSARes.data : [];
  const documentRequirementsForeign =
    docReqForeignRes.ok && Array.isArray(docReqForeignRes.data)
      ? docReqForeignRes.data
      : [];

  if (!qualifications.length) {
    throw new Error("No qualification data returned");
  }

  return {
    qualifications,
    nationalities,
    documentRequirementsSA,
    documentRequirementsForeign,
  };
}

async function initReferenceData(options = {}) {
  const { force = false } = options;
  if (!force && referenceDataInitPromise) return referenceDataInitPromise;

  referenceDataInitPromise = (async () => {
    const cached = readReferenceCache();
    const isFresh =
      cached &&
      Date.now() - cached.fetchedAt < APP_CONFIG.DEFAULTS.referenceDataTtlMs;

    if (!force && isFresh) {
      hydrateReferenceData(cached);
      return { fromCache: true };
    }

    try {
      const fresh = await fetchReferenceDataFromApi();
      hydrateReferenceData(fresh);
      writeReferenceCache(fresh);
      return { fromCache: false };
    } catch (err) {
      if (cached) {
        hydrateReferenceData(cached);
        return { fromCache: true, stale: true, error: err.message };
      }
      return { fromCache: true, stale: true, error: err.message };
    }
  })();

  try {
    return await referenceDataInitPromise;
  } finally {
    referenceDataInitPromise = null;
  }
}

/* ═══════════════════════════════════════════════════
   API CORE
   ═══════════════════════════════════════════════════ */
function getToken() {
  return localStorage.getItem("authToken") || "";
}
function setToken(t) {
  t
    ? localStorage.setItem("authToken", t)
    : localStorage.removeItem("authToken");
}
function getCachedUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}
function setCachedUser(u) {
  u
    ? localStorage.setItem("currentUser", JSON.stringify(u))
    : localStorage.removeItem("currentUser");
}
function getCurrentUser() {
  return getCachedUser();
}

async function api(method, path, body) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${APP_CONFIG.API_BASE}${path}`, opts);
    if (res.status === 401) {
      setToken(null);
      setCachedUser(null);
      window.location.href = APP_CONFIG.ROUTES.login;
      return { ok: false, message: "Session expired." };
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, message: `Network error: ${err.message}` };
  }
}

/* ═══════════════════════════════════════════════════
   AUTH  →  /api/auth/*
   ═══════════════════════════════════════════════════ */
async function login(email, password) {
  const res = await api("POST", "/auth/login", { email, password });
  if (!res.ok)
    return { success: false, message: res.message || "Login failed." };
  setToken(res.data.accessToken);
  setCachedUser(res.data.user);
  return { success: true, user: res.data.user };
}

async function logout() {
  await api("POST", "/auth/logout");
  setToken(null);
  setCachedUser(null);
  localStorage.removeItem("_unreadCount");
}

async function registerAccount(data) {
  return api("POST", "/auth/register", data);
}
async function forgotPassword(email) {
  return api("POST", "/auth/forgot-password", { email });
}
async function resetPassword(token, password) {
  return api("POST", "/auth/reset-password", { token, password });
}

function requireAuth(role) {
  const user = getCachedUser();
  if (!user || !getToken()) {
    window.location.href = APP_CONFIG.ROUTES.login;
    return null;
  }
  if (role && user.role !== role) {
    redirectToRoleHome(user);
    return null;
  }
  return user;
}

function getRoleHomePath(role) {
  return APP_CONFIG.ROUTES.roleHomes[role] || APP_CONFIG.ROUTES.home;
}

function redirectToRoleHome(userOrRole) {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  window.location.href = getRoleHomePath(role);
}

/* ═══════════════════════════════════════════════════
   USERS  →  /api/users/*
   ═══════════════════════════════════════════════════ */
async function getProfile() {
  return api("GET", "/users/profile");
}
async function updateProfile(data) {
  const res = await api("PUT", "/users/profile", data);
  if (res.ok && res.user) setCachedUser(res.user);
  return res;
}
async function changePassword(currentPassword, newPassword) {
  const res = await api("PUT", "/users/password", {
    currentPassword,
    newPassword,
  });
  if (res.ok) {
    const u = getCachedUser();
    if (u) {
      u.tempPassword = false;
      setCachedUser(u);
    }
  }
  return res;
}

/* ═══════════════════════════════════════════════════
   APPLICATIONS  →  /api/applications/*
   ═══════════════════════════════════════════════════ */
async function getApplications() {
  const res = await api("GET", "/applications");
  return res.ok ? res.applications : [];
}
async function submitApplication(appData) {
  return api("POST", "/applications", appData);
}
async function getApplication(id) {
  return api("GET", `/applications/${id}`);
}
async function approveApplication(id) {
  return api("PUT", `/applications/${id}/approve`);
}
async function rejectApplication(id, reason) {
  return api("PUT", `/applications/${id}/reject`, { reason });
}
async function uploadDocument(appId, documentName) {
  return api("POST", `/applications/${appId}/documents`, { documentName });
}

/* ═══════════════════════════════════════════════════
   REGISTRATIONS  →  /api/registrations/*
   ═══════════════════════════════════════════════════ */
async function getRegistrations() {
  const res = await api("GET", "/registrations");
  return res.ok ? res.registrations : [];
}
async function allocateModules(applicationId, modules, semester, studyYear) {
  return api("POST", "/registrations", {
    applicationId,
    modules,
    semester,
    studyYear,
  });
}
async function dropRegistration(id) {
  return api("DELETE", `/registrations/${id}`);
}
async function getEligibleModules() {
  const res = await api("GET", "/registrations/eligible");
  return res.ok ? res : { eligible: [] };
}

/* ═══════════════════════════════════════════════════
   COURSES  →  /api/courses/*
   ═══════════════════════════════════════════════════ */
async function getCourses() {
  return api("GET", "/courses");
}
async function getCourseRoster(moduleCode) {
  return api("GET", `/courses/${moduleCode}/roster`);
}

/* ═══════════════════════════════════════════════════
   ADMIN  →  /api/admin/*
   ═══════════════════════════════════════════════════ */
async function getUsers() {
  const res = await api("GET", "/admin/users");
  return res.ok ? res.users : [];
}
async function getAdminUsers() {
  return getUsers();
}
async function getStatistics() {
  return api("GET", "/admin/statistics");
}
async function getAuditLogs(limit) {
  return api(
    "GET",
    `/admin/audit-logs?limit=${limit || APP_CONFIG.DEFAULTS.auditLogLimit}`,
  );
}
async function changeUserRole(userId, role) {
  return api("PUT", `/admin/users/${userId}/role`, { role });
}
async function changeUserStatus(userId, status) {
  return api("PUT", `/admin/users/${userId}/status`, { status });
}

/* ═══════════════════════════════════════════════════
   LEGACY DASHBOARD ADAPTERS
   These keep older dashboard screens functional while
   their API integrations are completed.
   ═══════════════════════════════════════════════════ */
function getInboxFor(userId) {
  return [];
}
function getSentBy(userId) {
  return [];
}

function getAssignments() {
  return [];
}
function getStudentAssignments(studentId) {
  return [];
}

function getUpcomingEvents(role) {
  return [];
}

function getSchoolEmails(studentId) {
  return [];
}

/* ═══════════════════════════════════════════════════
   NOTIFICATIONS  →  /api/notifications/*
   ═══════════════════════════════════════════════════ */
async function getNotifications() {
  const res = await api("GET", "/notifications");
  return res.ok ? res.notifications : [];
}
async function markNotifRead(id) {
  return api("PUT", `/notifications/${id}/read`);
}
async function deleteNotif(id) {
  return api("DELETE", `/notifications/${id}`);
}

/* ═══════════════════════════════════════════════════
   UI HELPERS
   ═══════════════════════════════════════════════════ */
function showAlert(containerId, msg, type) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  el.innerHTML = `<div class="alert alert-${type || "error"}" style="margin-bottom:16px"><span>${icons[type] || "ℹ️"}</span><span>${msg}</span></div>`;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function clearAlert(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = "";
}

function setLoading(btnId, loading, text) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn._orig = btn.innerHTML;
    btn.innerHTML = text || "Loading...";
  } else {
    btn.innerHTML = btn._orig || text || btn.innerHTML;
  }
}

function badge(status) {
  const map = {
    pending: "badge-pending",
    approved: "badge-approved",
    declined: "badge-declined",
    allocated: "badge-allocated",
  };
  return `<span class="badge ${map[status] || "badge-info"}">${status}</span>`;
}

function fmtDate(d) {
  return d
    ? new Date(d).toLocaleDateString(APP_CONFIG.LOCALE, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
}
function timeAgo(d) {
  const m = Math.floor(
    (Date.now() - new Date(d).getTime()) / APP_CONFIG.DEFAULTS.minuteMs,
  );
  if (m < 1) return "Just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return fmtDate(d);
}

function openModal(id) {
  document.getElementById(id)?.classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id)?.classList.add("hidden");
}

function showToast(msg, type, ms) {
  let t = document.getElementById("_toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "_toast";
    t.className = "toast hidden";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast toast-${type || "success"}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(
    () => t.classList.add("hidden"),
    ms || APP_CONFIG.DEFAULTS.toastMs,
  );
}

/* ═══════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════ */
function renderNavbar(activePage) {
  const user = getCachedUser();
  const links = {
    public: [
      { href: "/", label: "Home", key: "home" },
      { href: "/programmes", label: "Programmes", key: "programmes" },
      {
        href: "/apply",
        label: "New Application",
        key: "apply",
        highlight: true,
      },
      { href: "/login", label: "Login", key: "login" },
    ],
    admin: [
      { href: "/admin", label: "Dashboard", key: "dashboard" },
      {
        href: "/admin/applications",
        label: "Applications",
        key: "applications",
      },
      {
        href: "/admin/registrations",
        label: "Registrations",
        key: "registrations",
      },
      {
        href: "/admin/allocations",
        label: "Allocate Modules",
        key: "allocations",
        highlight: true,
      },
      { href: "/admin/students", label: "Students", key: "students" },
    ],
    student: [
      { href: "/student", label: "Dashboard", key: "dashboard" },
      { href: "/student/register", label: "Register Modules", key: "register" },
      { href: "/student/modules", label: "My Modules", key: "modules" },
    ],
    lecturer: [{ href: "/lecturer", label: "Dashboard", key: "dashboard" }],
  };
  const role = user ? user.role : "public";
  const navLinks = links[role] || links.public;
  const linksHtml = navLinks
    .map(
      (l) =>
        `<a href="${l.href}" class="nav-link${activePage === l.key ? " active" : ""}${l.highlight ? " highlight" : ""}">${l.label}</a>`,
    )
    .join("");
  const cachedCount = parseInt(localStorage.getItem("_unreadCount") || "0");
  const userHtml = user
    ? `
    <div style="position:relative;margin-left:8px">
      <button class="notif-btn" id="notif-btn" onclick="toggleNotifs(event)">🔔
        <span id="notif-badge" style="position:absolute;top:4px;right:4px;width:16px;height:16px;background:#e8192c;border-radius:50%;font-size:10px;font-weight:700;display:${cachedCount > 0 ? "flex" : "none"};align-items:center;justify-content:center">${cachedCount}</span>
      </button>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-left:12px">
      <div style="text-align:right"><div style="font-size:13px;font-weight:600">${user.first_name || user.email.split("@")[0]}</div><div style="font-size:11px;opacity:.7;text-transform:capitalize">${user.role}</div></div>
      <button onclick="doLogout()" style="background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.3);padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='rgba(255,255,255,.25)'" onmouseout="this.style.background='rgba(255,255,255,.15)'">Logout</button>
    </div>`
    : "";
  const notifHtml = user
    ? `
    <div id="notif-dropdown" class="hidden" style="position:fixed;top:64px;right:20px;width:360px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.2);z-index:200;overflow:hidden;border:1px solid #e5e7eb">
      <div style="padding:14px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:700;color:var(--rf-navy);font-size:15px">Notifications</span>
        <span id="notif-unread-label" style="font-size:12px;color:#123f7a"></span>
      </div>
      <div id="notif-list" style="max-height:340px;overflow-y:auto">
        <div style="padding:20px;text-align:center;color:var(--rf-gray);font-size:13px">Loading...</div>
      </div>
    </div>`
    : "";
  const navMarkup = `
      <nav class="navbar">
        <a href="${user ? "/" + user.role : "/"}" style="display:flex;align-items:center;gap:8px">
          <img src="${EDUHUB_LOGO}" alt="EduHub" style="height:36px" onerror="this.style.display='none'">
          <span class="navbar-logo-text" style="color:white">EDUHUB</span>
        </a>
        <div class="navbar-links">${linksHtml}${userHtml}</div>
      </nav>${notifHtml}`;
  const placeholder =
    document.getElementById("navbar-placeholder") ||
    document.getElementById("navbar-root");
  if (placeholder) {
    placeholder.innerHTML = navMarkup;
  }
  document.addEventListener("click", (e) => {
    const d = document.getElementById("notif-dropdown"),
      b = document.getElementById("notif-btn");
    if (d && b && !d.contains(e.target) && !b.contains(e.target))
      d.classList.add("hidden");
  });
  if (user)
    getNotifications().then((notifs) => {
      const unread = notifs.filter((n) => !n.read).length;
      localStorage.setItem("_unreadCount", String(unread));
      const b = document.getElementById("notif-badge");
      if (b) {
        b.textContent = unread;
        b.style.display = unread > 0 ? "flex" : "none";
      }
    });
}

function toggleNotifs(event) {
  if (event) event.stopPropagation();
  const d = document.getElementById("notif-dropdown");
  if (!d) return;
  const wasHidden = d.classList.contains("hidden");
  d.classList.toggle("hidden");
  if (wasHidden) loadNotifDropdown();
}

async function loadNotifDropdown() {
  const list = document.getElementById("notif-list"),
    label = document.getElementById("notif-unread-label");
  if (!list) return;
  const notifs = await getNotifications();
  const unread = notifs.filter((n) => !n.read).length;
  if (label) label.textContent = unread > 0 ? `${unread} unread` : "";
  const b = document.getElementById("notif-badge");
  if (b) {
    b.textContent = unread;
    b.style.display = unread > 0 ? "flex" : "none";
  }
  if (notifs.length === 0) {
    list.innerHTML =
      '<div style="padding:24px;text-align:center;color:var(--rf-gray);font-size:14px">No notifications yet</div>';
    return;
  }
  list.innerHTML = notifs
    .map(
      (n) => `
    <div onclick="doMarkRead('${n.id}')" style="padding:12px 16px;border-bottom:1px solid #e5e7eb;cursor:pointer;background:${n.read ? "white" : "#EEF2FF"}">
      <div style="font-weight:600;font-size:13px;color:var(--rf-navy);margin-bottom:3px">${n.title}</div>
      <div style="font-size:12px;color:var(--rf-gray);line-height:1.5">${n.message}</div>
      <div style="font-size:11px;color:#9CA3AF;margin-top:4px">${timeAgo(n.createdAt)}</div>
    </div>`,
    )
    .join("");
}

async function doMarkRead(id) {
  await markNotifRead(id);
  loadNotifDropdown();
}
async function doLogout() {
  await logout();
  window.location.href = APP_CONFIG.ROUTES.home;
}

function getStudyMode() {
  return localStorage.getItem("studyMode") || null;
}

function setStudyMode(mode) {
  localStorage.setItem("studyMode", mode);
}

/* ═══════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════ */
function renderFooter() {
  const ph = document.getElementById("footer-placeholder");
  if (!ph) return;
  ph.innerHTML = `<footer class="footer"><div class="footer-inner">
    <div style="width:260px">
      <div style="width:180px;height:100px;border:1px solid white;display:flex;align-items:center;justify-content:center;margin-bottom:20px"><img src="${EDUHUB_LOGO}" style="width:140px" alt="EduHub"></div>
      <p style="font-size:14px;margin-bottom:20px;line-height:1.7;opacity:.9">Your path to a brighter future, offering quality education that's accessible to all.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm" style="border:1px solid white;background:transparent;color:white;border-radius:20px">Enquire Now</button>
        <a href="/apply" class="btn btn-sm" style="border:1px solid white;background:transparent;color:white;border-radius:20px">Apply</a>
      </div>
    </div>
    <div class="footer-col"><h3>STUDY WITH US</h3><a href="#">Postgraduate</a><a href="#">Faculty of IT</a><a href="#">Faculty of Business</a><a href="#">Online Learning</a></div>
    <div class="footer-col"><h3>WHY EDUHUB?</h3><a href="#">Graduate Success</a><a href="#">Accreditation</a><a href="#">Prospectus</a></div>
    <div class="footer-col"><h3>ADMISSIONS</h3><a href="/apply">Apply</a><a href="#">Financial Info</a><a href="#">FAQ & Help</a></div>
  </div>
  <div class="footer-bottom">© ${new Date().getFullYear()} EduHub — A Learning Experience of a Lifetime · All rights reserved</div>
  </footer>`;
}
