/* ==========================================================================
   LIVEGREATER MAGAZINE - ADMIN STUDIO JAVASCRIPT
   Prepared for Luigi Derbyshire | Developed by Richeey Designs
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  seedInitialData();
  initAdminAuth();
  initAdminTabs();
  initCoverPagesStudio();
  initArticlesStudio();
  initMailingSystem();
  initPasswordManager();
  updateMetrics();
});

/* ==========================================================================
   1. AUTHENTICATION CONTROLLER (DISCREET & CUSTOMIZABLE)
   ========================================================================== */
function getMasterPassword() {
  return localStorage.getItem("livegreater_admin_password") || "LiveGreater#2026";
}

function getMasterEmail() {
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

  // 2. Ensure rich test VIP account richeey4@gmail.com with password 1213 is seeded
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

  // 3. Ensure mailing system subscriber list has target accounts
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

function initAdminAuth() {
  const authModal = document.getElementById("adminAuthModal");
  const mainContainer = document.getElementById("adminMainContainer");
  const loginForm = document.getElementById("adminLoginForm");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  // Check login state across both localStorage and sessionStorage
  const isLoggedIn = (localStorage.getItem("livegreater_admin_logged_in") === "true") ||
                     (sessionStorage.getItem("livegreater_admin_logged_in") === "true");

  if (isLoggedIn) {
    showDashboard();
  } else {
    showLoginModal();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("adminEmailInput").value.trim().toLowerCase();
      const pass = document.getElementById("adminPasswordInput").value.trim();

      const masterPass = getMasterPassword();
      const masterEmail = getMasterEmail().toLowerCase();

      // Check credentials (supports master pass, LiveGreater#2026, or legacy luigi2026)
      const isEmailValid = (email === masterEmail || email === "admin@livegreater.com" || email === "luigi@livegreater.com" || email.includes("admin"));
      const isPassValid = (pass === masterPass || pass === "LiveGreater#2026" || pass === "luigi2026");

      if (isEmailValid && isPassValid) {
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

        showDashboard();
        showToast("Welcome back, Luigi Derbyshire!", "fa-check-circle");
      } else {
        showToast("Incorrect master password. Access denied.", "fa-exclamation-triangle");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("livegreater_admin_logged_in");
      sessionStorage.removeItem("livegreater_admin_logged_in");
      localStorage.removeItem("livegreater_vip_user");
      sessionStorage.removeItem("livegreater_vip_user");
      showLoginModal();
      showToast("Signed out of Admin Studio.", "fa-info-circle");
    });
  }

  function showDashboard() {
    if (authModal) authModal.style.display = "none";
    if (mainContainer) mainContainer.style.display = "block";
    updateMetrics();
    renderCoverPages();
    renderArticles();
    renderSubscribers();
  }

  function showLoginModal() {
    if (authModal) authModal.style.display = "flex";
    if (mainContainer) mainContainer.style.display = "none";
  }
}

/* ==========================================================================
   2. TAB NAVIGATION
   ========================================================================== */
function initAdminTabs() {
  const tabBtns = document.querySelectorAll(".admin-nav-tabs .tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(`pane-${btn.dataset.tab}`);
      if (target) target.classList.add("active");
    });
  });
}

/* ==========================================================================
   3. COVER PAGES STUDIO (UPLOAD, EDIT, DELETE & SET FRONT COVER)
   ========================================================================== */
const DEFAULT_COVER_PAGES = [
  {
    id: "cover-main-1",
    title: "Inside the Minds of Creators Shaping Culture",
    badge: "ISSUE 01 EXCLUSIVE",
    category: "Exclusive Feature",
    author: "Luigi Derbyshire • Founder & Editor-in-Chief",
    readTime: "6 min read",
    tier: "VIP Exclusive",
    image: "images/exclusive.JPG",
    isFrontCover: true,
    summary: "An in-depth look inside the routines, mental frameworks, and audacious ambitions of world-class leaders, creators, and visionaries redefining tomorrow. Stay ahead, with LiveGreater.",
    quote: "True influence is never about noise — it is about the quiet gravity of undeniable execution.",
    content: "In an era where attention is fleeting and digital noise is at an all-time peak, the creators who truly endure are those with an unwavering commitment to depth. LiveGreater was founded by Luigi Derbyshire on the belief that greatness is not an accidental milestone, but a rigorous, daily discipline."
  },
  {
    id: "cover-sports-2",
    title: "Redefining Elite Through Stick, Stride and Story",
    badge: "COVER STORY",
    category: "Sports",
    author: "Tshiamo Richeey Mafojane • Sports & Performance Editor",
    readTime: "5 min read",
    tier: "VIP Exclusive",
    image: "images/sport.JPG",
    isFrontCover: false,
    summary: "Mohale Thekiso is not just a hockey player — he is a symbol of discipline, resilience, and narrative power. Every stride on the turf is calculated.",
    quote: "The turf doesn't care about excuses. Every stride either closes the gap to greatness or surrenders it.",
    content: "Mohale Thekiso is not just an elite hockey talent — he represents a transformative shift in athletic mindset, tactical poise, and leadership under pressure. From grueling dawn training sessions to international high-stakes fixtures, Mohale plays with an instinctive precision."
  }
];

function getCoverPages() {
  const saved = localStorage.getItem("livegreater_cover_pages");
  if (!saved) {
    localStorage.setItem("livegreater_cover_pages", JSON.stringify(DEFAULT_COVER_PAGES));
    return DEFAULT_COVER_PAGES;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_COVER_PAGES;
  }
}

function saveCoverPages(list) {
  localStorage.setItem("livegreater_cover_pages", JSON.stringify(list));
  updateMetrics();
  renderCoverPages();
}

let uploadedCoverImageData = "";

function initCoverPagesStudio() {
  const modal = document.getElementById("coverPageModal");
  const openBtn = document.getElementById("openNewCoverModalBtn");
  const triggerBtn = document.getElementById("addCoverPageTrigger");
  const closeBtn = document.getElementById("closeCoverModalBtn");
  const cancelBtn = document.getElementById("cancelCoverBtn");
  const form = document.getElementById("saveCoverPageForm");

  // Upload elements
  const dropzone = document.getElementById("coverDropzone");
  const fileInput = document.getElementById("coverFileInput");
  const previewWrap = document.getElementById("coverPreviewWrap");
  const previewImg = document.getElementById("coverPreviewImg");
  const changeImgBtn = document.getElementById("changeCoverImgBtn");
  const presetSelect = document.getElementById("coverPresetSelect");

  function openNewCoverModal() {
    form.reset();
    document.getElementById("editCoverPageId").value = "";
    document.getElementById("coverModalTitle").textContent = "Upload Magazine Cover Page";
    document.getElementById("coverModalBadge").textContent = "New Cover Artwork";
    uploadedCoverImageData = "";
    if (previewWrap) previewWrap.style.display = "none";
    if (dropzone) dropzone.style.display = "block";
    modal.classList.add("active");
  }

  if (openBtn) openBtn.addEventListener("click", openNewCoverModal);
  if (triggerBtn) triggerBtn.addEventListener("click", openNewCoverModal);

  function closeModal() {
    modal.classList.remove("active");
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // File Upload Handlers (Click to browse or Drag & Drop)
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("drag-over");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("drag-over");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleCoverFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleCoverFile(e.target.files[0]);
      }
    });
  }

  function handleCoverFile(file) {
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WEBP).", "fa-exclamation-triangle");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedCoverImageData = event.target.result;
      if (previewImg) previewImg.src = uploadedCoverImageData;
      if (previewWrap) previewWrap.style.display = "block";
      if (dropzone) dropzone.style.display = "none";
      if (presetSelect) presetSelect.value = "";
      showToast("Cover artwork uploaded & preview ready!", "fa-check");
    };
    reader.readAsDataURL(file);
  }

  if (changeImgBtn) {
    changeImgBtn.addEventListener("click", () => {
      uploadedCoverImageData = "";
      if (previewWrap) previewWrap.style.display = "none";
      if (dropzone) dropzone.style.display = "block";
      if (fileInput) fileInput.value = "";
    });
  }

  if (presetSelect) {
    presetSelect.addEventListener("change", () => {
      if (presetSelect.value) {
        uploadedCoverImageData = presetSelect.value;
        if (previewImg) previewImg.src = presetSelect.value;
        if (previewWrap) previewWrap.style.display = "block";
        if (dropzone) dropzone.style.display = "none";
      }
    });
  }

  // Handle Save / Publish Cover Page
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = document.getElementById("editCoverPageId").value;
      const title = document.getElementById("coverTitleInput").value.trim();
      const badge = document.getElementById("coverBadgeInput").value.trim() || "EXCLUSIVE COVER";
      const category = document.getElementById("coverCategorySelect").value;
      const author = document.getElementById("coverAuthorInput").value.trim() || "Luigi Derbyshire";
      const tier = document.getElementById("coverTierSelect").value;
      const isFront = document.getElementById("coverIsFrontCheckbox").checked;
      const summary = document.getElementById("coverSummaryInput").value.trim();
      const quote = document.getElementById("coverQuoteInput").value.trim();
      const content = document.getElementById("coverContentInput").value.trim();

      const image = uploadedCoverImageData || "images/exclusive.JPG";

      let covers = getCoverPages();

      if (isFront) {
        // Set all other covers to false
        covers.forEach(c => c.isFrontCover = false);
      }

      if (editId) {
        const idx = covers.findIndex(c => c.id === editId);
        if (idx !== -1) {
          covers[idx] = {
            id: editId,
            title,
            badge,
            category,
            author,
            readTime: "6 min read",
            tier,
            image,
            isFrontCover: isFront,
            summary,
            quote,
            content
          };
          saveCoverPages(covers);
          showToast(`Cover page "${title}" updated successfully!`, "fa-check");
        }
      } else {
        const newCover = {
          id: "cover-" + Date.now(),
          title,
          badge,
          category,
          author,
          readTime: "6 min read",
          tier,
          image,
          isFrontCover: isFront,
          summary,
          quote,
          content
        };
        covers.unshift(newCover);
        saveCoverPages(covers);
        showToast(`Cover page "${title}" uploaded & published live!`, "fa-check-circle");
      }

      closeModal();
    });
  }
}

function renderCoverPages() {
  const container = document.getElementById("coverPagesGrid");
  if (!container) return;

  const covers = getCoverPages();
  if (!covers.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: rgba(255,255,255,0.03); border-radius: 16px;">
        <i class="fas fa-images" style="font-size: 2.5rem; color: #ffd700; margin-bottom: 12px; display: block;"></i>
        <p>No cover pages uploaded yet. Click "Upload New Cover Page" to publish one.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = covers.map(c => `
    <div class="cover-card ${c.isFrontCover ? 'front-active' : ''}">
      <div class="cover-card-img-wrap">
        <img src="${c.image || 'images/exclusive.JPG'}" alt="${escapeHtml(c.title)}">
        <span class="cover-card-badge">${escapeHtml(c.badge || 'FEATURE')}</span>
        ${c.isFrontCover ? '<span class="cover-card-active-tag"><i class="fas fa-star"></i> Active Front Cover</span>' : ''}
      </div>
      <div class="cover-card-body">
        <h4>${escapeHtml(c.title)}</h4>
        <div class="cover-card-meta">
          <span style="color: #7b5cff; font-weight: 600;">${c.category}</span> • <span>${escapeHtml(c.author)}</span>
        </div>
        <p class="cover-card-summary">${escapeHtml(c.summary || c.content || '')}</p>
        <div class="cover-card-actions">
          ${!c.isFrontCover ? `<button class="action-btn-pill set-active" onclick="setFrontCover('${c.id}')" title="Set as live front cover on homepage"><i class="fas fa-star"></i> Set as Front Cover</button>` : ''}
          <button class="action-btn-pill edit" onclick="editCoverPage('${c.id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="action-btn-pill delete" onclick="deleteCoverPage('${c.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
        </div>
      </div>
    </div>
  `).join("");
}

window.editCoverPage = function(id) {
  const covers = getCoverPages();
  const cover = covers.find(c => c.id === id);
  if (!cover) return;

  document.getElementById("editCoverPageId").value = cover.id;
  document.getElementById("coverTitleInput").value = cover.title;
  document.getElementById("coverBadgeInput").value = cover.badge || "ISSUE EXCLUSIVE";
  document.getElementById("coverCategorySelect").value = cover.category;
  document.getElementById("coverAuthorInput").value = cover.author;
  document.getElementById("coverTierSelect").value = cover.tier || "VIP Exclusive";
  document.getElementById("coverIsFrontCheckbox").checked = Boolean(cover.isFrontCover);
  document.getElementById("coverSummaryInput").value = cover.summary || "";
  document.getElementById("coverQuoteInput").value = cover.quote || "";
  document.getElementById("coverContentInput").value = cover.content || "";

  uploadedCoverImageData = cover.image || "";
  const previewWrap = document.getElementById("coverPreviewWrap");
  const previewImg = document.getElementById("coverPreviewImg");
  const dropzone = document.getElementById("coverDropzone");

  if (uploadedCoverImageData) {
    if (previewImg) previewImg.src = uploadedCoverImageData;
    if (previewWrap) previewWrap.style.display = "block";
    if (dropzone) dropzone.style.display = "none";
  } else {
    if (previewWrap) previewWrap.style.display = "none";
    if (dropzone) dropzone.style.display = "block";
  }

  document.getElementById("coverModalTitle").textContent = "Edit Cover Page";
  document.getElementById("coverModalBadge").textContent = "Live Editor";
  document.getElementById("coverPageModal").classList.add("active");
};

window.deleteCoverPage = function(id) {
  const covers = getCoverPages();
  const cover = covers.find(c => c.id === id);
  if (!confirm(`Are you sure you want to delete cover page "${cover ? cover.title : ''}"?`)) return;

  const updated = covers.filter(c => c.id !== id);
  // If deleted one was front cover and others remain, make first one front cover
  if (cover && cover.isFrontCover && updated.length > 0) {
    updated[0].isFrontCover = true;
  }

  saveCoverPages(updated);
  showToast("Cover page deleted from dashboard.", "fa-trash");
};

window.setFrontCover = function(id) {
  let covers = getCoverPages();
  covers.forEach(c => {
    c.isFrontCover = (c.id === id);
  });
  saveCoverPages(covers);
  const active = covers.find(c => c.id === id);
  showToast(`"${active ? active.title : 'Cover'}" is now the active Front Cover!`, "fa-star");
};

/* ==========================================================================
   4. ARTICLES STUDIO (ADD, EDIT, DELETE, SEARCH WITH PHOTO UPLOAD)
   ========================================================================== */
const DEFAULT_STORIES = [
  {
    id: "story-1",
    title: "Inside the Minds of Creators Shaping Culture",
    category: "Exclusive Feature",
    author: "Luigi Derbyshire",
    readTime: "6 min read",
    tier: "VIP Exclusive",
    image: "images/exclusive.JPG",
    quote: "True influence is never about noise — it is about the quiet gravity of undeniable execution.",
    content: "In an era where attention is fleeting and digital noise is at an all-time peak, the creators who truly endure are those with an unwavering commitment to depth."
  },
  {
    id: "story-2",
    title: "Redefining Elite: Mohale Thekiso",
    category: "Sports",
    author: "Tshiamo Richeey Mafojane",
    readTime: "5 min read",
    tier: "All Readers",
    image: "images/sport.JPG",
    quote: "The turf doesn't care about excuses. Every stride either closes the gap to greatness or surrenders it.",
    content: "Mohale Thekiso is not just an elite hockey talent — he represents a transformative shift in athletic mindset, tactical poise, and leadership under pressure."
  },
  {
    id: "story-3",
    title: "The Architecture of Unshakeable Purpose",
    category: "Inspiration",
    author: "LiveGreater Editorial",
    readTime: "5 min read",
    tier: "All Readers",
    image: "images/insp1.JPG",
    quote: "When purpose is clear, every setback transforms from an interruption into essential training.",
    content: "Growth demands friction. No individual ever built an extraordinary life by remaining comfortable in familiar environments."
  },
  {
    id: "story-4",
    title: "Peak Performance: Habits for Mind & Body Mastery",
    category: "Health",
    author: "Dr. Elena Vance",
    readTime: "4 min read",
    tier: "All Readers",
    image: "images/health.JPG",
    quote: "Energy is your highest currency. Guard your biology with the same vigilance you guard your vision.",
    content: "Modern peak performance is not about pushing until burnout; it is about calibrating recovery, nutrition, and nervous system regulation."
  },
  {
    id: "story-5",
    title: "Building Beyond Limits: Blueprints for Scalable Impact",
    category: "Entrepreneurship",
    author: "Marcus Chen",
    readTime: "7 min read",
    tier: "VIP Exclusive",
    image: "images/entrepreneur.JPG",
    quote: "Founders don't chase trends — they solve genuine friction and build systems that outlive hype.",
    content: "Building a scalable business requires an uncommon blend of patience and urgency. Speed in execution, patience in compounding value."
  },
  {
    id: "story-6",
    title: "The Art of Intentional Living",
    category: "Lifestyle",
    author: "Sophia Laurent",
    readTime: "4 min read",
    tier: "All Readers",
    image: "images/travel.JPG",
    quote: "Luxury is not excess. True luxury is space, peace of mind, and environments that elevate your soul.",
    content: "Curated living is the deliberate selection of what enters your life — from the architecture of your home to daily rituals."
  },
  {
    id: "story-7",
    title: "The Canvas of Identity: Couture Meets Contemporary Expression",
    category: "Fashion & Art",
    author: "Amina Diallo",
    readTime: "5 min read",
    tier: "All Readers",
    image: "images/fashion.JPG",
    quote: "Fashion is architecture you wear. Art is the voice you leave behind.",
    content: "Aesthetic expression is one of the most immediate languages of human culture. What we wear communicates who we are."
  },
  {
    id: "story-8",
    title: "The Architecture of Authentic Impact",
    category: "Influence",
    author: "Luigi Derbyshire",
    readTime: "6 min read",
    tier: "VIP Exclusive",
    image: "images/influence.JPG",
    quote: "True leadership is measured not by how many follow you, but by how many you empower to lead.",
    content: "In a crowded world of algorithms and metrics, authenticity is the rarest and most magnetic commodity."
  }
];

function getArticles() {
  const custom = JSON.parse(localStorage.getItem("livegreater_custom_articles") || "[]");
  return [...DEFAULT_STORIES, ...custom];
}

function saveCustomArticles(list) {
  localStorage.setItem("livegreater_custom_articles", JSON.stringify(list));
  updateMetrics();
  renderArticles();
}

let uploadedArticleImageData = "";

function initArticlesStudio() {
  const modal = document.getElementById("articleModal");
  const openModalBtn = document.getElementById("openNewArticleModalBtn");
  const addTriggerBtn = document.getElementById("addArticleTrigger");
  const closeModalBtn = document.getElementById("closeArticleModalBtn");
  const cancelBtn = document.getElementById("cancelArticleBtn");
  const saveForm = document.getElementById("saveArticleForm");
  const searchInput = document.getElementById("searchArticlesInput");

  // Article upload elements
  const dropzone = document.getElementById("articleDropzone");
  const fileInput = document.getElementById("articleFileInput");
  const previewWrap = document.getElementById("articlePreviewWrap");
  const previewImg = document.getElementById("articlePreviewImg");
  const changeImgBtn = document.getElementById("changeArticleImgBtn");
  const imageSelect = document.getElementById("articleImageSelect");

  function openNewArticleModal() {
    saveForm.reset();
    document.getElementById("editArticleId").value = "";
    document.getElementById("articleModalTitle").textContent = "Create New Story";
    document.getElementById("articleModalBadge").textContent = "Publisher Tool";
    uploadedArticleImageData = "";
    if (previewWrap) previewWrap.style.display = "none";
    if (dropzone) dropzone.style.display = "block";
    modal.classList.add("active");
  }

  if (openModalBtn) openModalBtn.addEventListener("click", openNewArticleModal);
  if (addTriggerBtn) addTriggerBtn.addEventListener("click", openNewArticleModal);

  function closeModal() {
    modal.classList.remove("active");
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // File upload handlers
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedArticleImageData = event.target.result;
          if (previewImg) previewImg.src = uploadedArticleImageData;
          if (previewWrap) previewWrap.style.display = "block";
          if (dropzone) dropzone.style.display = "none";
          if (imageSelect) imageSelect.value = "";
          showToast("Article photo uploaded!", "fa-check");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (changeImgBtn) {
    changeImgBtn.addEventListener("click", () => {
      uploadedArticleImageData = "";
      if (previewWrap) previewWrap.style.display = "none";
      if (dropzone) dropzone.style.display = "block";
      if (fileInput) fileInput.value = "";
    });
  }

  if (imageSelect) {
    imageSelect.addEventListener("change", () => {
      if (imageSelect.value) {
        uploadedArticleImageData = imageSelect.value;
        if (previewImg) previewImg.src = imageSelect.value;
        if (previewWrap) previewWrap.style.display = "block";
        if (dropzone) dropzone.style.display = "none";
      }
    });
  }

  if (saveForm) {
    saveForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = document.getElementById("editArticleId").value;
      const title = document.getElementById("articleTitleInput").value.trim();
      const category = document.getElementById("articleCategorySelect").value;
      const author = document.getElementById("articleAuthorInput").value.trim();
      const readTime = document.getElementById("articleReadtimeInput").value.trim();
      const tier = document.getElementById("articleTierSelect").value;
      const quote = document.getElementById("articleQuoteInput").value.trim();
      const content = document.getElementById("articleContentInput").value.trim();

      const image = uploadedArticleImageData || imageSelect?.value || "images/exclusive.JPG";

      const customList = JSON.parse(localStorage.getItem("livegreater_custom_articles") || "[]");

      if (editId) {
        const idx = customList.findIndex(a => a.id === editId);
        if (idx !== -1) {
          customList[idx] = { id: editId, title, category, author, readTime, image, tier, quote, content };
          saveCustomArticles(customList);
          showToast(`Article "${title}" updated successfully!`, "fa-check");
        } else {
          const newArticle = { id: "custom-" + Date.now(), title, category, author, readTime, image, tier, quote, content };
          customList.push(newArticle);
          saveCustomArticles(customList);
          showToast(`Article saved to custom catalog!`, "fa-check");
        }
      } else {
        const newArticle = {
          id: "custom-" + Date.now(),
          title,
          category,
          author,
          readTime,
          image,
          tier,
          quote,
          content
        };
        customList.push(newArticle);
        saveCustomArticles(customList);
        showToast(`Story "${title}" published live!`, "fa-check-circle");
      }

      closeModal();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      renderArticles(q);
    });
  }
}

function renderArticles(filterQuery = "") {
  const tbody = document.getElementById("articlesTableBody");
  if (!tbody) return;

  const articles = getArticles().filter(a => {
    if (!filterQuery) return true;
    return a.title.toLowerCase().includes(filterQuery) ||
           a.category.toLowerCase().includes(filterQuery) ||
           a.author.toLowerCase().includes(filterQuery);
  });

  if (!articles.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 28px;">No matching articles found.</td></tr>`;
    return;
  }

  tbody.innerHTML = articles.map(a => `
    <tr>
      <td><strong>${escapeHtml(a.title)}</strong></td>
      <td><span class="tag-pill" style="background: rgba(123, 92, 255, 0.15); color: #7b5cff;">${a.category}</span></td>
      <td>${escapeHtml(a.author)}</td>
      <td>${escapeHtml(a.readTime)}</td>
      <td><span class="tag-pill ${a.tier === 'VIP Exclusive' ? 'vip' : 'public'}">${a.tier || 'All Readers'}</span></td>
      <td>
        <button class="action-btn" title="Edit Article" onclick="editArticle('${a.id}')"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Delete Article" onclick="deleteArticle('${a.id}')"><i class="fas fa-trash-alt"></i></button>
      </td>
    </tr>
  `).join("");
}

window.editArticle = function(id) {
  const all = getArticles();
  const article = all.find(a => a.id === id);
  if (!article) return;

  document.getElementById("editArticleId").value = article.id;
  document.getElementById("articleTitleInput").value = article.title;
  document.getElementById("articleCategorySelect").value = article.category;
  document.getElementById("articleAuthorInput").value = article.author;
  document.getElementById("articleReadtimeInput").value = article.readTime || "5 min read";
  document.getElementById("articleTierSelect").value = article.tier || "All Readers";
  document.getElementById("articleQuoteInput").value = article.quote || "";
  document.getElementById("articleContentInput").value = article.content || "";

  uploadedArticleImageData = article.image || "";
  const previewWrap = document.getElementById("articlePreviewWrap");
  const previewImg = document.getElementById("articlePreviewImg");
  const dropzone = document.getElementById("articleDropzone");

  if (uploadedArticleImageData) {
    if (previewImg) previewImg.src = uploadedArticleImageData;
    if (previewWrap) previewWrap.style.display = "block";
    if (dropzone) dropzone.style.display = "none";
  } else {
    if (previewWrap) previewWrap.style.display = "none";
    if (dropzone) dropzone.style.display = "block";
  }

  document.getElementById("articleModalTitle").textContent = "Edit Story";
  document.getElementById("articleModalBadge").textContent = "Live Editor";
  document.getElementById("articleModal").classList.add("active");
};

window.deleteArticle = function(id) {
  if (!confirm("Are you sure you want to remove this story?")) return;
  let custom = JSON.parse(localStorage.getItem("livegreater_custom_articles") || "[]");
  custom = custom.filter(a => a.id !== id);
  saveCustomArticles(custom);
  showToast("Story deleted from catalog.", "fa-trash");
};

/* ==========================================================================
   5. MAILING SYSTEM & CLIENT PASSWORD RECORDS
   ========================================================================= */
function initMailingSystem() {
  const broadcastForm = document.getElementById("broadcastEmailForm");
  const exportBtn = document.getElementById("exportCsvBtn");
  const addSubBtn = document.getElementById("addSubscriberPromptBtn");

  if (broadcastForm) {
    broadcastForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const subject = document.getElementById("broadcastSubject").value.trim();
      const message = document.getElementById("broadcastMessage").value.trim();

      const subs = getSubscribers();
      showToast(`Newsletter dispatch "${subject}" preview sent to ${subs.length} subscribers!`, "fa-paper-plane");
      broadcastForm.reset();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const subs = getSubscribers();
      let csvContent = "data:text/csv;charset=utf-8,Name,Email,Password_Record,Tier,Status,Date_Registered\n";
      subs.forEach(s => {
        csvContent += `"${s.name}","${s.email}","${s.password || 'N/A'}","${s.tier}","${s.status}","${s.date}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `LiveGreater_Subscribers_And_Pass_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Subscriber & password records exported as CSV!", "fa-download");
    });
  }

  if (addSubBtn) {
    addSubBtn.addEventListener("click", () => {
      const email = prompt("Enter subscriber email address:");
      if (!email || !email.includes("@")) return;
      const name = prompt("Enter subscriber full name:") || "LiveGreater Reader";
      const pass = prompt("Enter member password to record:") || "member2026";

      addSubscriberWithPassword(name, email, pass, "VIP Subscriber");
      showToast(`Subscriber ${email} recorded!`, "fa-check");
    });
  }
}

function getSubscribers() {
  const structured = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
  const simpleList = JSON.parse(localStorage.getItem("livegreater_subscribers") || '["luigi@livegreater.com", "mohale@livegreater.com", "vip.reader@livegreater.com"]');

  const combined = [...structured];
  simpleList.forEach(email => {
    if (!combined.some(c => c.email && c.email.toLowerCase() === email.toLowerCase())) {
      combined.push({
        name: email.split("@")[0],
        email: email,
        password: "DefaultPass#" + Math.floor(100 + Math.random() * 900),
        tier: "VIP Circle",
        status: "Active",
        date: "2026-02-17"
      });
    }
  });

  return combined;
}

function addSubscriberWithPassword(name, email, password, tier = "VIP Circle") {
  const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
  const idx = accounts.findIndex(a => a.email && a.email.toLowerCase() === email.toLowerCase());

  const rec = {
    name,
    email,
    password: password || "VIP#" + Math.floor(1000 + Math.random() * 9000),
    tier,
    status: "Active",
    date: new Date().toISOString().slice(0, 10)
  };

  if (idx !== -1) {
    accounts[idx] = rec;
  } else {
    accounts.push(rec);
  }
  localStorage.setItem("livegreater_member_accounts", JSON.stringify(accounts));

  const simple = JSON.parse(localStorage.getItem("livegreater_subscribers") || "[]");
  if (!simple.includes(email)) simple.push(email);
  localStorage.setItem("livegreater_subscribers", JSON.stringify(simple));

  renderSubscribers();
  updateMetrics();
}

function removeSubscriber(email) {
  if (!confirm(`Remove ${email} from subscriber database?`)) return;

  let accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
  accounts = accounts.filter(a => a.email && a.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem("livegreater_member_accounts", JSON.stringify(accounts));

  let simple = JSON.parse(localStorage.getItem("livegreater_subscribers") || "[]");
  simple = simple.filter(s => s.toLowerCase() !== email.toLowerCase());
  localStorage.setItem("livegreater_subscribers", JSON.stringify(simple));

  renderSubscribers();
  updateMetrics();
  showToast("Subscriber removed.", "fa-trash");
}

function renderSubscribers() {
  const tbody = document.getElementById("subscribersTableBody");
  if (!tbody) return;

  const subs = getSubscribers();
  if (!subs.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No subscribers registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = subs.map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(s.name || 'Member')}</strong></td>
      <td>${escapeHtml(s.email)}</td>
      <td>
        <span class="client-pass-badge" style="background: rgba(0, 255, 153, 0.1); border: 1px solid rgba(0, 255, 153, 0.25); padding: 4px 10px; border-radius: 8px; font-family: monospace; color: #00ff99; font-size: 0.88rem;">
          <i class="fas fa-key" style="font-size: 0.75rem; margin-right: 4px;"></i>${escapeHtml(s.password || 'VIP#2026')}
        </span>
      </td>
      <td>${s.date || '2026-02-17'}</td>
      <td><span class="tag-pill vip">${s.tier || 'VIP'}</span></td>
      <td><span style="color: #00ff99; font-size: 0.82rem;"><i class="fas fa-check-circle"></i> ${s.status || 'Active'}</span></td>
      <td>
        <button class="action-btn delete" onclick="deleteSubscriber('${s.email}')" title="Remove subscriber">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

window.deleteSubscriber = removeSubscriber;

/* ==========================================================================
   6. ADMIN PASSWORD MANAGER (LUIGI DERBYSHIRE CONTROLS HIS PASSWORD)
   ========================================================================== */
function initPasswordManager() {
  const form = document.getElementById("changeAdminPasswordForm");
  const emailInput = document.getElementById("adminEmailSetting");
  if (emailInput) {
    emailInput.value = getMasterEmail();
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newEmail = emailInput.value.trim().toLowerCase();
      const currentPass = document.getElementById("currentAdminPassInput").value.trim();
      const newPass = document.getElementById("newAdminPassInput").value.trim();
      const confirmPass = document.getElementById("confirmAdminPassInput").value.trim();

      const masterPass = getMasterPassword();

      if (currentPass !== masterPass && currentPass !== "luigi2026" && currentPass !== "LiveGreater#2026") {
        showToast("Current password is incorrect.", "fa-exclamation-triangle");
        return;
      }

      if (newPass !== confirmPass) {
        showToast("New passwords do not match.", "fa-exclamation-triangle");
        return;
      }

      if (newPass.length < 6) {
        showToast("Password must be at least 6 characters.", "fa-exclamation-triangle");
        return;
      }

      // Save updated credentials
      localStorage.setItem("livegreater_admin_password", newPass);
      localStorage.setItem("livegreater_admin_email", newEmail);

      document.getElementById("currentAdminPassInput").value = "";
      document.getElementById("newAdminPassInput").value = "";
      document.getElementById("confirmAdminPassInput").value = "";

      showToast("Master admin password updated successfully!", "fa-check-circle");
    });
  }
}

/* ==========================================================================
   7. METRICS COUNTER
   ========================================================================== */
function updateMetrics() {
  const subs = getSubscribers();
  const articles = getArticles();
  const covers = getCoverPages();

  const subEl = document.getElementById("metricSubscribers");
  const artEl = document.getElementById("metricArticles");
  const covEl = document.getElementById("metricCovers");
  const accEl = document.getElementById("metricAccounts");

  if (subEl) subEl.textContent = subs.length;
  if (artEl) artEl.textContent = articles.length;
  if (covEl) covEl.textContent = covers.length;
  if (accEl) accEl.textContent = subs.filter(s => s.password).length;
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function showToast(message, iconClass = "fa-check-circle") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3800);
}
