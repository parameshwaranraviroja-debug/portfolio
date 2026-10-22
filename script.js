// ========================================================
// 1. CREDENTIALS & INITIALIZATION (EMAILJS & FIREBASE)
// ========================================================
const EMAILJS_PUBLIC_KEY = "5I_LUi2CKLqd2bYPS";
const EMAILJS_SERVICE_ID = "service_ecbq656";               // Active Service ID
const EMAILJS_OTP_TEMPLATE_ID = "template_m1q1ocm";         // For visitor access OTP
const EMAILJS_CONTACT_TEMPLATE_ID = "template_unsn3fa";     // For contact inquiry emails

const firebaseConfig = {
  apiKey: "AIzaSyAHFRrscUtVNQh_yR0OU_SsD29tqJKOlz0",
  authDomain: "portfolio-visitors-2490c.firebaseapp.com",
  projectId: "portfolio-visitors-2490c",
  storageBucket: "portfolio-visitors-2490c.firebasestorage.app",
  messagingSenderId: "326782501150",
  appId: "1:326782501150:web:7a7c5b72a32257bbc7c90f",
  measurementId: "G-XLWS6MG24X"
};

// Safe initialization
let db = null;
try {
  if (typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

try {
  if (typeof emailjs !== "undefined") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
} catch (e) {
  console.error("EmailJS initialization failed:", e);
}

let generatedOtp = null;
let visitorData = {};

// ========================================================
// 2. OTP AUTHENTICATION GATEWAY (PRODUCTION MODE: ACTIVATED)
// ========================================================
function checkGateAccess() {
  const authGateModal = document.getElementById("authGateModal");
  if (!authGateModal) return;

  // Clear previous persistent overrides
  localStorage.removeItem("portfolio_access_granted");
  
  // Check session verification
  const isVerified = sessionStorage.getItem("portfolio_access_granted");

  if (isVerified === "true") {
    authGateModal.classList.add("hidden");
    document.body.style.overflow = "";
  } else {
    authGateModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

// Step 1: Send OTP via Official EmailJS SDK Method
function handleSendOtp(e) {
  e.preventDefault();
  const nameInput = document.getElementById("visitorName");
  const emailInput = document.getElementById("visitorEmail");
  const sendOtpBtn = document.getElementById("sendOtpBtn");

  visitorData.name = nameInput.value.trim();
  visitorData.email = emailInput.value.trim();

  // Generate 6-digit random verification code
  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  sendOtpBtn.disabled = true;
  sendOtpBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <span>Sending OTP...</span>
  `;

  const templateParams = {
    to_name: visitorData.name,
    to_email: visitorData.email,
    otp_code: generatedOtp,
    otp: generatedOtp
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_OTP_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
    .then((response) => {
      console.log("OTP email success:", response.status, response.text);
      showOtpInputScreen();
      showToast("OTP sent successfully to your email!");
    })
    .catch((error) => {
      console.error("OTP send error:", error);
      alert("Error sending OTP: " + (error.text || error.message || JSON.stringify(error)));
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerHTML = `
        <i data-lucide="send" class="w-4 h-4"></i>
        <span>Send Verification OTP</span>
      `;
      lucide.createIcons();
    });
}

function showOtpInputScreen() {
  document.getElementById("gateDetailsForm").classList.add("hidden");
  document.getElementById("gateOtpForm").classList.remove("hidden");
  document.getElementById("sentEmailDisplay").textContent = visitorData.email;
  lucide.createIcons();
}

function resetGateToDetails() {
  document.getElementById("gateDetailsForm").classList.remove("hidden");
  document.getElementById("gateOtpForm").classList.add("hidden");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  sendOtpBtn.disabled = false;
  sendOtpBtn.innerHTML = `
    <i data-lucide="send" class="w-4 h-4"></i>
    <span>Send Verification OTP</span>
  `;
  lucide.createIcons();
}

// Step 2: Verify OTP & Auto-Log Visitor to Cloud Firestore
function handleVerifyOtp(e) {
  e.preventDefault();
  const enteredOtp = document.getElementById("otpInput").value.trim();
  const otpError = document.getElementById("otpError");

  if (enteredOtp === generatedOtp) {
    sessionStorage.setItem("portfolio_access_granted", "true");
    sessionStorage.setItem("visitor_name", visitorData.name);

    if (db) {
      db.collection("visitors").add({
        name: visitorData.name,
        email: visitorData.email,
        loginTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        deviceInfo: navigator.userAgent
      }).then((docRef) => {
        console.log("Visitor saved to Firestore. ID:", docRef.id);
      }).catch((err) => {
        console.error("Firestore logging error:", err);
      });
    }

    const authGateModal = document.getElementById("authGateModal");
    authGateModal.classList.add("opacity-0");
    setTimeout(() => {
      authGateModal.classList.add("hidden");
      document.body.style.overflow = "";
    }, 300);

    showToast("Welcome! Portfolio access verified.");
  } else {
    otpError.classList.remove("hidden");
    document.getElementById("otpInput").classList.add("border-rose-500");
  }
}

// ========================================================
// 3. PROJECTS DATA & DYNAMIC RENDERING
// ========================================================
const projectsData = [
  {
    id: "dual-biometric-fraud-detection",
    title: "Dual-Biometric Credit Card Fraud Prevention System",
    category: "data",
    categoryLabel: "Data / AI & FinTech",
    description: "Proactive fraud prevention mobile app featuring ensemble ML risk scoring (0-100), merchant intelligence analysis, and threshold-based adaptive authentication using fingerprint, facial liveness detection, and OTP triggers.",
    tags: ["Python", "Ensemble ML", "Scikit-learn", "Android", "Biometrics", "Firebase / SQLite"],
    liveUrl: null,
    hasModal: true
  },
  {
    id: "safeid-health-cortex",
    title: "SafeID Health – Privacy-First Health Identity",
    category: "fullstack",
    categoryLabel: "Full Stack / Cloud",
    description: "Web-based Health ID platform featuring 15 baseline clinical fields, dynamic revocable QR tokens, 2FA doctor verification gateway, and automated SMS access alerts.",
    tags: ["React / Next.js", "Supabase", "PostgreSQL", "Vercel API", "2FA OTP", "Dynamic QR"],
    liveUrl: "https://cortex-connect-gamma.vercel.app/",
    hasModal: false
  },
  {
    id: "hubfive-uiux",
    title: "Hubfive Digital UI/UX Design System",
    category: "uiux",
    categoryLabel: "UI / UX",
    description: "Interactive prototype designs, wireframes, and design guidelines created during the UI/UX internship at Hubfive.",
    tags: ["Canva", "HTML5", "CSS3", "UI/UX", "Wireframing"],
    liveUrl: null,
    hasModal: false
  },
  {
    id: "vcodez-data-analysis",
    title: "Exploratory Data Science & Analytics",
    category: "data",
    categoryLabel: "Data / AI",
    description: "Data extraction, feature preparation, and visualization pipelines developed during internship at VCODEZ.",
    tags: ["Python", "Data Science", "MS Excel", "Analysis"],
    liveUrl: null,
    hasModal: false
  }
];

function renderProjects(categoryFilter = 'all') {
  const projectsGrid = document.getElementById('projectsGrid');
  if (!projectsGrid) return;
  projectsGrid.innerHTML = '';

  const filtered = categoryFilter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === categoryFilter);

  filtered.forEach(project => {
    const card = document.createElement('div');
    card.className = "group flex flex-col justify-between bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800/90 p-5 sm:p-6 hover:shadow-xl hover:border-blue-500/40 transition-all duration-300";

    const tagsHtml = project.tags
      .map(t => `<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">${t}</span>`)
      .join('');

    let actionBtnHtml = "";
    if (project.liveUrl) {
      actionBtnHtml = `
        <div class="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            <span>Live Project Demo</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
          <span class="flex h-2 w-2 relative" title="Live Deployment">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      `;
    } else if (project.hasModal) {
      actionBtnHtml = `
        <div class="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <button onclick="openFraudProjectModal()" class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>View Architecture &amp; System Flow</span>
          </button>
          <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">B.E. Capstone</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="text-[10px] font-mono uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">${project.categoryLabel}</span>
        </div>
        <h3 class="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">${project.title}</h3>
        <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">${project.description}</p>
      </div>
      <div>
        <div class="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div class="flex flex-wrap gap-1.5 mb-1">${tagsHtml}</div>
        </div>
        ${actionBtnHtml}
      </div>
    `;
    projectsGrid.appendChild(card);
  });

  lucide.createIcons();
}

// Deep-Dive Modal with Architecture Details
function openFraudProjectModal() {
  const modal = document.getElementById("projectModal");
  const modalBody = document.getElementById("projectModalBody");
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="space-y-6">
      
      <!-- Modal Header -->
      <div class="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-xs font-mono uppercase text-blue-500 font-bold">College Final Year Capstone Project</span>
          <h2 class="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">Dual-Biometric Credit Card Fraud Detection</h2>
          <p class="text-xs text-zinc-500 font-mono mt-1">Madha Engineering College &bull; CSE (2022-2026)</p>
        </div>

        <a href="Credit_Card_Fraud_Detection_Presentation.pdf" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer">
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          <span>Open Full Presentation</span>
        </a>
      </div>

      <!-- Problem & Innovation -->
      <div>
        <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
          <i data-lucide="shield-alert" class="w-4 h-4 text-blue-500"></i> The Core Problem &amp; Innovation
        </h3>
        <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Traditional fraud systems operate reactively—identifying unauthorized transactions only after completion. This application proactively prevents fraudulent activity prior to settlement using real-time machine learning risk scores, merchant credibility analysis, and adaptive multi-factor biometrics.
        </p>
      </div>

      <!-- Adaptive Thresholds -->
      <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <i data-lucide="cpu" class="w-4 h-4 text-cyan-500"></i> Adaptive Security Thresholds
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span class="font-mono font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">Risk &lt; 50</span>
            <span class="text-zinc-600 dark:text-zinc-400">Fingerprint + Face ID</span>
          </div>
          <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span class="font-mono font-semibold text-amber-600 dark:text-amber-400 block mb-0.5">50 &le; Risk &lt; 70</span>
            <span class="text-zinc-600 dark:text-zinc-400">Fingerprint + Face ID + OTP</span>
          </div>
          <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span class="font-mono font-semibold text-rose-500 block mb-0.5">70 &le; Risk &lt; 90</span>
            <span class="text-zinc-600 dark:text-zinc-400">OTP + Live Face Detection</span>
          </div>
          <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span class="font-mono font-semibold text-rose-700 dark:text-rose-400 block mb-0.5">Risk &ge; 90</span>
            <span class="text-zinc-600 dark:text-zinc-400">SMS Alert + Temporary Freeze (6h)</span>
          </div>
        </div>
      </div>

      <!-- Technical Architecture Highlights -->
      <div>
        <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
          <i data-lucide="database" class="w-4 h-4 text-emerald-500"></i> Technical Architecture
        </h3>
        <ul class="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
          <li><strong>Ensemble ML:</strong> SVM, Decision Trees, and Logistic Regression producing 0–100 dynamic risk probability.</li>
          <li><strong>Merchant Intelligence:</strong> Trust evaluation based on category reputation and historical chargeback records.</li>
          <li><strong>Database Schema:</strong> Relational model normalized to 3NF eliminating anomalies across users, cards, and transactions.</li>
          <li><strong>Mobile Integration:</strong> Android biometric APIs, front-camera liveness detection, and secure RESTful backend communication.</li>
        </ul>
      </div>

      <!-- Live Presentation Slides -->
      <div>
        <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
          <i data-lucide="presentation" class="w-4 h-4 text-purple-500"></i> Project Presentation Slides
        </h3>
        <div class="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
          <iframe
            src="Credit_Card_Fraud_Detection_Presentation.pdf"
            class="w-full h-full border-0"
            title="Presentation Slides"
          ></iframe>
        </div>
      </div>

      <!-- Close Button -->
      <div class="pt-2 flex justify-end">
        <button onclick="closeProjectModal()" class="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          Close Overview
        </button>
      </div>

    </div>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  lucide.createIcons();
}

function closeProjectModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active', 'bg-white', 'dark:bg-zinc-800', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
      b.classList.add('text-zinc-600', 'dark:text-zinc-400');
    });

    btn.classList.add('active', 'bg-white', 'dark:bg-zinc-800', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
    btn.classList.remove('text-zinc-600', 'dark:text-zinc-400');

    const cat = btn.getAttribute('data-category');
    renderProjects(cat);
  });
});

// ========================================================
// 4. CERTIFICATIONS DATA & DYNAMIC RENDERING
// ========================================================
const certificationsData = [
  {
    title: "Artificial Intelligence Fundamentals",
    issuer: "IBM SkillsBuild",
    date: "Apr 2026",
    badgeUrl: "https://www.credly.com/badges/f2018809-3c65-4cf6-900c-b0cc2cc539e0",
    description: "Core concepts of artificial intelligence, machine learning principles, and enterprise AI workflows.",
    tags: ["Artificial Intelligence", "Machine Learning", "IBM"]
  },
  {
    title: "CCNA: Introduction to Networks",
    issuer: "Cisco Networking Academy",
    date: "Mar 2025",
    badgeUrl: null,
    description: "Switch/router configuration, IPv4/IPv6 subnetting, OSI reference model, network troubleshooting, and security.",
    tags: ["Cisco CCNA", "IPv4 / IPv6", "Routing & Switching", "Network Security"]
  },
  {
    title: "Advanced Cyber-Physical Systems & Intelligent Cybersecurity",
    issuer: "AICTE ATAL / SRM IST",
    date: "Sep 2026",
    badgeUrl: null,
    description: "Smart infrastructure protection, resilient CPS design, threat mitigation, and cybersecurity frameworks.",
    tags: ["Cybersecurity", "CPS", "AICTE ATAL", "Smart Infrastructure"]
  }
];

function renderCertifications() {
  const container = document.getElementById("certificationsGrid");
  if (!container) return;
  container.innerHTML = "";

  certificationsData.forEach((cert) => {
    const card = document.createElement("div");
    card.className = "group flex flex-col justify-between bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800/90 p-5 sm:p-6 hover:shadow-xl hover:border-blue-500/40 transition-all duration-300";

    const tagsHtml = cert.tags
      .map(t => `<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">${t}</span>`)
      .join("");

    const verifyBtnHtml = cert.badgeUrl
      ? `<a href="${cert.badgeUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-4">
           <span>Verify Credential</span>
           <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
         </a>`
      : "";

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[10px] font-mono uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">${cert.issuer}</span>
          <span class="text-xs text-zinc-500 font-mono">${cert.date}</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mt-1 group-hover:text-blue-500 transition-colors">${cert.title}</h3>
        <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">${cert.description}</p>
        ${verifyBtnHtml}
      </div>
      <div class="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div class="flex flex-wrap gap-1.5">${tagsHtml}</div>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

// ========================================================
// 5. THEME & MOBILE MENU CONTROLS
// ========================================================
const themeToggleBtn = document.getElementById('themeToggleBtn');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (sunIcon) sunIcon.classList.toggle('hidden');
    if (moonIcon) moonIcon.classList.toggle('hidden');
  });
}

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuOpenIcon = document.getElementById('menuOpenIcon');
const menuCloseIcon = document.getElementById('menuCloseIcon');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.toggle('hidden');
    if (menuOpenIcon) menuOpenIcon.classList.toggle('hidden', !isHidden);
    if (menuCloseIcon) menuCloseIcon.classList.toggle('hidden', isHidden);
  });
}

// ========================================================
// 6. UTILITIES (TOAST, RESUME, CLIPBOARD, CONTACT VIA EMAILJS)
// ========================================================
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.remove('translate-y-2');
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('translate-y-2');
    setTimeout(() => toast.classList.add('hidden'), 200);
  }, 3500);
}

function handleResumeDownload(e) {
  e.preventDefault();
  const link = document.createElement('a');
  link.href = 'Parameswaran_R_Resume.pdf';
  link.download = 'Parameswaran_R_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Downloading resume...");
}

function copyEmailToClipboard() {
  navigator.clipboard.writeText("parameshwaranraviroja@gmail.com");
  const copyBtnText = document.getElementById('copyEmailText');
  if (copyBtnText) copyBtnText.textContent = "Copied to Clipboard!";
  showToast("Email address copied to clipboard.");
  setTimeout(() => {
    if (copyBtnText) copyBtnText.textContent = "Copy Email Address";
  }, 2500);
}

// Direct EmailJS Integration for Contact Form
function handleContactSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const formSuccessMessage = document.getElementById('formSuccessMessage');
  
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <span>Sending Message...</span>
  `;

  const contactParams = {
    name: name,
    email: email,
    message: message,
    to_name: "Parameswaran R",
    to_email: "parameshwaranraviroja@gmail.com"
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, contactParams, EMAILJS_PUBLIC_KEY)
    .then((response) => {
      console.log("Contact email success:", response.status, response.text);
      if (formSuccessMessage) formSuccessMessage.classList.remove('hidden');
      e.target.reset();
      showToast("Message sent successfully!");
    })
    .catch((error) => {
      console.error("Contact send error:", error);
      alert("Failed to send message: " + (error.text || error.message || JSON.stringify(error)));
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <i data-lucide="send" class="w-4 h-4"></i>
        <span>Send Message</span>
      `;
      lucide.createIcons();
    });
}

// Page Initialize
window.onload = function() {
  initTheme();
  checkGateAccess();
  renderProjects('all');
  renderCertifications();
  lucide.createIcons();
};
