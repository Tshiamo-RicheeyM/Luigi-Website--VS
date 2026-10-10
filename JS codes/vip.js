/* ==========================================================================
   LIVEGREATER MAGAZINE - VIP & UNIFIED DISCREET SIGN-IN LOGIC
   Prepared for Luigi Derbyshire | Developed by Richeey Designs
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  seedInitialData();
  initVipAuth();
  initVipArticles();
});

function getMasterAdminPassword() {
  return localStorage.getItem("livegreater_admin_password") || "LiveGreater#2026";
}

function getMasterAdminEmail() {
  return localStorage.getItem("livegreater_admin_email") || "admin@livegreater.com";
}

function seedInitialData() {
  // 1. Ensure master admin credentials initialized
  if (!localStorage.getItem("livegreater_admin_password")) {
    localStorage.setItem("livegreater_admin_password", "LiveGreater#2026");
  }
  if (!localStorage.getItem("livegreater_admin_email")) {
    localStorage.setItem("livegreater_admin_email", "admin@livegreater.com");
  }

  // 2. Pre-seed/Ensure richeey4@gmail.com as VIP Premium Member with password 1213
  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
  } catch (err) {
    accounts = [];
  }

  const targetEmail = "richeey4@gmail.com";
  const existingIdx = accounts.findIndex(a => a.email && a.email.toLowerCase() === targetEmail);
  const premiumUser = {
    name: "Tshiamo Richeey",
    email: targetEmail,
    password: "1213",
    tier: "VIP Premium Member",
    status: "Active",
    date: "2026-02-17"
  };

  if (existingIdx !== -1) {
    accounts[existingIdx].password = "1213";
    accounts[existingIdx].tier = "VIP Premium Member";
    accounts[existingIdx].name = accounts[existingIdx].name || "Tshiamo Richeey";
    accounts[existingIdx].status = "Active";
  } else {
    accounts.unshift(premiumUser);
  }
  localStorage.setItem("livegreater_member_accounts", JSON.stringify(accounts));

  // 3. Ensure mailing system subscriber list has richeey4@gmail.com
  let subs = [];
  try {
    subs = JSON.parse(localStorage.getItem("livegreater_subscribers") || "[]");
  } catch (err) {
    subs = [];
  }
  if (!subs.some(s => typeof s === "string" && s.toLowerCase() === targetEmail)) {
    subs.unshift(targetEmail);
  }
  if (!subs.includes("admin@livegreater.com")) subs.push("admin@livegreater.com");
  if (!subs.includes("luigi@livegreater.com")) subs.push("luigi@livegreater.com");
  localStorage.setItem("livegreater_subscribers", JSON.stringify(subs));
}

function initVipAuth() {
  const gatekeeper = document.getElementById("vipGatekeeperSection");
  const vipContent = document.getElementById("vipContentSection");
  const tabSignupBtn = document.getElementById("tabSignupBtn");
  const tabSigninBtn = document.getElementById("tabSigninBtn");
  const signupForm = document.getElementById("vipSignupForm");
  const signinForm = document.getElementById("vipSigninForm");
  const logoutBtn = document.getElementById("memberLogoutBtn");
  const headerProfile = document.getElementById("memberHeaderProfile");
  const greetingEl = document.getElementById("memberHeaderGreeting");
  const welcomeHeading = document.getElementById("memberWelcomeHeading");

  // Tab switching
  if (tabSignupBtn && tabSigninBtn) {
    tabSignupBtn.addEventListener("click", () => {
      tabSignupBtn.classList.add("active");
      tabSigninBtn.classList.remove("active");
      if (signupForm) signupForm.classList.add("active");
      if (signinForm) signinForm.classList.remove("active");
    });

    tabSigninBtn.addEventListener("click", () => {
      tabSigninBtn.classList.add("active");
      tabSignupBtn.classList.remove("active");
      if (signinForm) signinForm.classList.add("active");
      if (signupForm) signupForm.classList.remove("active");
    });
  }

  // Check existing session (persisted in localStorage or sessionStorage)
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("livegreater_vip_user") || sessionStorage.getItem("livegreater_vip_user") || "null");
  } catch (e) {
    currentUser = null;
  }

  if (currentUser) {
    showLounge(currentUser);
  } else {
    showGatekeeper();
  }

  // Handle Sign In (SMART DISCREET ROUTING: DETECTS ADMIN OR MEMBER)
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("signinEmailInput").value.trim().toLowerCase();
      const password = document.getElementById("signinPasswordInput").value.trim();

      const masterPass = getMasterAdminPassword();
      const masterEmail = getMasterAdminEmail().toLowerCase();

      // 1. DISCREET ADMIN DETECTION:
      // If Admin enters master credentials, immediately save session and launch admin.html
      const isAdminEmail = (email === masterEmail || email === "admin@livegreater.com" || email === "luigi@livegreater.com" || email.startsWith("admin@"));
      const isAdminPass = (password === masterPass || password === "LiveGreater#2026" || password === "luigi2026");

      if (isAdminEmail && isAdminPass) {
        localStorage.setItem("livegreater_admin_logged_in", "true");
        sessionStorage.setItem("livegreater_admin_logged_in", "true");

        const adminUser = {
          name: "Luigi Derbyshire",
          email: "admin@livegreater.com",
          tier: "Publisher Admin",
          role: "admin",
          status: "Active"
        };
        localStorage.setItem("livegreater_vip_user", JSON.stringify(adminUser));
        sessionStorage.setItem("livegreater_vip_user", JSON.stringify(adminUser));

        showToast("Master credentials verified. Launching Admin Studio...", "fa-shield-alt");
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 600);
        return;
      }

      // 2. MEMBER / SUBSCRIBER LOGIN:
      const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
      const user = accounts.find(a => a.email && a.email.toLowerCase() === email);

      if (user) {
        if (user.password && user.password !== password) {
          showToast("Incorrect password for this account. Please verify.", "fa-exclamation-triangle");
          return;
        }
        localStorage.setItem("livegreater_vip_user", JSON.stringify(user));
        sessionStorage.setItem("livegreater_vip_user", JSON.stringify(user));
        showLounge(user);
        showToast(`Welcome back, ${user.name}! VIP Lounge unlocked.`, "fa-crown");
      } else {
        // Auto-enroll new subscriber and record password
        const newUser = {
          name: email.split("@")[0],
          email: email,
          password: password || "VIP#2026",
          tier: "VIP Circle",
          status: "Active",
          date: new Date().toISOString().slice(0, 10)
        };
        accounts.push(newUser);
        localStorage.setItem("livegreater_member_accounts", JSON.stringify(accounts));

        // Auto-enroll in mailing list
        const subs = JSON.parse(localStorage.getItem("livegreater_subscribers") || "[]");
        if (!subs.includes(email)) {
          subs.push(email);
          localStorage.setItem("livegreater_subscribers", JSON.stringify(subs));
        }

        localStorage.setItem("livegreater_vip_user", JSON.stringify(newUser));
        sessionStorage.setItem("livegreater_vip_user", JSON.stringify(newUser));
        showLounge(newUser);
        showToast(`Account created and signed in! Saved to mailing list.`, "fa-check");
      }
    });
  }

  // Handle VIP Account Creation (AUTO-SAVES ACCOUNT & PASSWORD TO MAILING SYSTEM)
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupNameInput").value.trim();
      const email = document.getElementById("signupEmailInput").value.trim().toLowerCase();
      const password = document.getElementById("signupPasswordInput").value.trim();

      if (!name || !email || !password) return;

      // 1. Save Member Account WITH Password Record
      const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
      const existing = accounts.find(a => a.email && a.email.toLowerCase() === email);

      const userRecord = {
        name,
        email,
        password, // RECORDED for admin
        tier: "VIP Circle",
        status: "Active",
        date: new Date().toISOString().slice(0, 10)
      };

      if (!existing) {
        accounts.push(userRecord);
      } else {
        existing.name = name;
        existing.password = password;
      }
      localStorage.setItem("livegreater_member_accounts", JSON.stringify(accounts));

      // 2. AUTO-SAVE DIRECTLY INTO MAILING SYSTEM (Subscribers list)
      const subscribers = JSON.parse(localStorage.getItem("livegreater_subscribers") || "[]");
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem("livegreater_subscribers", JSON.stringify(subscribers));
      }

      // 3. Set Active Session & Show VIP Lounge
      localStorage.setItem("livegreater_vip_user", JSON.stringify(userRecord));
      sessionStorage.setItem("livegreater_vip_user", JSON.stringify(userRecord));
      showLounge(userRecord);
      showToast(`Welcome to the VIP Circle, ${name}! Your profile is saved in our mailing system.`, "fa-crown");
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("livegreater_vip_user");
      sessionStorage.removeItem("livegreater_vip_user");
      localStorage.removeItem("livegreater_admin_logged_in");
      sessionStorage.removeItem("livegreater_admin_logged_in");
      showGatekeeper();
      showToast("Signed out of VIP Lounge.", "fa-info-circle");
    });
  }

  function showLounge(user) {
    if (gatekeeper) gatekeeper.style.display = "none";
    if (vipContent) vipContent.style.display = "block";
    if (headerProfile) headerProfile.style.display = "flex";
    if (greetingEl) greetingEl.textContent = `Hi, ${user.name}`;
    if (welcomeHeading) welcomeHeading.textContent = `Welcome, ${user.name}.`;
  }

  function showGatekeeper() {
    if (gatekeeper) gatekeeper.style.display = "flex";
    if (vipContent) vipContent.style.display = "none";
    if (headerProfile) headerProfile.style.display = "none";
  }
}

function initVipArticles() {
  document.querySelectorAll(".open-article-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const key = btn.dataset.key || "exclusive";
      if (typeof window.openArticleModal === "function") {
        window.openArticleModal(key, null, true);
      } else {
        const readerModal = document.getElementById("articleReaderModal");
        if (readerModal) readerModal.classList.add("active");
      }
    });
  });
}
