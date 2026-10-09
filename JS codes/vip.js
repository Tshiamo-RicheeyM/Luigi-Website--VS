/* ==========================================================================
   LIVEGREATER MAGAZINE - VIP & UNIFIED DISCREET SIGN-IN LOGIC
   Prepared for Luigi Derbyshire | Developed by Richeey Designs
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initVipAuth();
  initVipArticles();
});

function getMasterAdminPassword() {
  return localStorage.getItem("livegreater_admin_password") || "LiveGreater#2026";
}

function getMasterAdminEmail() {
  return localStorage.getItem("livegreater_admin_email") || "admin@livegreater.com";
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
      signupForm.classList.add("active");
      signinForm.classList.remove("active");
    });

    tabSigninBtn.addEventListener("click", () => {
      tabSigninBtn.classList.add("active");
      tabSignupBtn.classList.remove("active");
      signinForm.classList.add("active");
      signupForm.classList.remove("active");
    });
  }

  // Check existing session
  const currentUser = JSON.parse(sessionStorage.getItem("livegreater_vip_user") || "null");
  if (currentUser) {
    showLounge(currentUser);
  } else {
    showGatekeeper();
  }

  // Handle Sign In (SMART DISCREET ROUTING: DETECTS ADMIN OR CLIENT)
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("signinEmailInput").value.trim().toLowerCase();
      const password = document.getElementById("signinPasswordInput").value.trim();

      const masterPass = getMasterAdminPassword();
      const masterEmail = getMasterAdminEmail().toLowerCase();

      // 1. DISCREET ADMIN DETECTION:
      // If Luigi/Admin enters master credentials, immediately redirect to admin.html!
      const isAdminEmail = (email === masterEmail || email === "luigi@livegreater.com" || email === "admin@livegreater.com");
      const isAdminPass = (password === masterPass || password === "LiveGreater#2026" || password === "luigi2026");

      if (isAdminEmail && isAdminPass) {
        sessionStorage.setItem("livegreater_admin_logged_in", "true");
        showToast("Master access verified. Launching Admin Studio...", "fa-shield-alt");
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 800);
        return;
      }

      // 2. CLIENT / SUBSCRIBER LOGIN:
      const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
      const user = accounts.find(a => a.email.toLowerCase() === email);

      if (user) {
        if (user.password && user.password !== password) {
          showToast("Incorrect password for this member account.", "fa-exclamation-triangle");
          return;
        }
        sessionStorage.setItem("livegreater_vip_user", JSON.stringify(user));
        showLounge(user);
        showToast(`Welcome back to the VIP Circle, ${user.name}!`, "fa-check-circle");
      } else {
        // Auto-enroll client and record password
        const newUser = {
          name: email.split("@")[0],
          email,
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

        sessionStorage.setItem("livegreater_vip_user", JSON.stringify(newUser));
        showLounge(newUser);
        showToast(`Account created and signed in! Saved to priority mailing system.`, "fa-check");
      }
    });
  }

  // Handle VIP Account Creation (AUTO-SAVES ACCOUNT & PASSWORD TO MAILING SYSTEM)
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupNameInput").value.trim();
      const email = document.getElementById("signupEmailInput").value.trim();
      const password = document.getElementById("signupPasswordInput").value.trim();

      if (!name || !email || !password) return;

      // 1. Save Member Account WITH Password Record
      const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
      const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

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
      sessionStorage.setItem("livegreater_vip_user", JSON.stringify(userRecord));
      showLounge(userRecord);
      showToast(`Welcome to the VIP Circle, ${name}! Your profile is saved in our mailing system.`, "fa-crown");
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("livegreater_vip_user");
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
        window.openArticleModal(key);
      } else {
        const readerModal = document.getElementById("articleReaderModal");
        if (readerModal) readerModal.classList.add("active");
      }
    });
  });
}
