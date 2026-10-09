/* ==========================================================================
   LIVEGREATER MAGAZINE - VIP MEMBER PORTAL LOGIC
   Prepared for Luigi Derbyshire | Developed by Richeey Designs
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initVipAuth();
  initVipArticles();
});

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

  // Handle VIP Account Creation (AUTO-SAVES TO MAILING SYSTEM)
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupNameInput").value.trim();
      const email = document.getElementById("signupEmailInput").value.trim();
      const password = document.getElementById("signupPasswordInput").value.trim();

      if (!name || !email || !password) return;

      // 1. Save into Member Accounts
      const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
      const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

      const userRecord = {
        name,
        email,
        password,
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
      showToast(`Welcome to the VIP Circle, ${name}! You are registered in our mailing system.`, "fa-crown");
    });
  }

  // Handle Sign In
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("signinEmailInput").value.trim();
      const password = document.getElementById("signinPasswordInput").value.trim();

      const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
      const user = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

      if (user) {
        sessionStorage.setItem("livegreater_vip_user", JSON.stringify(user));
        showLounge(user);
        showToast(`Welcome back, ${user.name}!`, "fa-check-circle");
      } else {
        // Fallback: enroll email directly
        const newUser = {
          name: email.split("@")[0],
          email,
          tier: "VIP Circle",
          status: "Active",
          date: new Date().toISOString().slice(0, 10)
        };
        accounts.push(newUser);
        localStorage.setItem("livegreater_member_accounts", JSON.stringify(accounts));
        sessionStorage.setItem("livegreater_vip_user", JSON.stringify(newUser));
        showLounge(newUser);
        showToast(`Signed in to VIP Lounge as ${email}`, "fa-check");
      }
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
        // Trigger via reader click
        const readerModal = document.getElementById("articleReaderModal");
        if (readerModal) readerModal.classList.add("active");
      }
    });
  });
}
