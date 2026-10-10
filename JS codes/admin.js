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
    layoutStyle: "editorial-spread",
    image: "images/exclusive.JPG",
    quote: "True influence is never about noise — it is about the quiet gravity of undeniable execution.",
    content: "In an era where attention is fleeting and digital noise is at an all-time peak, the creators who truly endure are those with an unwavering commitment to depth.",
    sections: [
      {
        subtitle: "The Discipline of Enduring Depth",
        paragraph: "In an era where attention is fleeting and digital noise is at an all-time peak, the creators who truly endure are those with an unwavering commitment to depth. LiveGreater was founded by Luigi Derbyshire on the belief that greatness is not an accidental milestone, but a rigorous, daily discipline.",
        image: "images/travel.JPG",
        caption: "Luigi Derbyshire exploring intentional spaces that foster high-level strategic focus.",
        placement: "full"
      },
      {
        subtitle: "Constructing Tomorrow's Culture",
        paragraph: "Across design, business, athletics, and the arts, visionaries operate under a fundamentally distinct framework: they don't react to current culture, they construct its next iteration. Stay ahead, with LiveGreater.",
        image: "images/influence.JPG",
        caption: "Influence is measured by cultural gravity and the courage to build unconventionally.",
        placement: "full"
      },
      {
        subtitle: "The Relentless Elimination of Distraction",
        paragraph: "When we speak to founders and creators across South Africa and the globe, a recurring pattern emerges: relentless elimination of distraction, extreme clarity of purpose, and an appetite for calculated risk. Excellence is never gifted; it is extracted through relentless iteration.",
        image: "images/entrepreneur.JPG",
        caption: "Mastering focus in a world saturated with ephemeral noise.",
        placement: "full"
      }
    ]
  },
  {
    id: "story-2",
    title: "Redefining Elite: Mohale Thekiso",
    category: "Sports",
    author: "Tshiamo Richeey Mafojane",
    readTime: "5 min read",
    tier: "All Readers",
    layoutStyle: "two-column",
    image: "images/sport.JPG",
    quote: "The turf doesn't care about excuses. Every stride either closes the gap to greatness or surrenders it.",
    content: "Mohale Thekiso is not just an elite hockey talent — he represents a transformative shift in athletic mindset, tactical poise, and leadership under pressure.",
    sections: [
      {
        subtitle: "The Kinetic Geometry of the Pitch",
        paragraph: "Mohale Thekiso is not just an elite hockey talent — he represents a transformative shift in athletic mindset, tactical poise, and leadership under pressure.",
        image: "images/sport.JPG",
        caption: "Mohale Thekiso commanding the pitch with relentless tactical discipline at NWU Astroturf.",
        placement: "side"
      },
      {
        subtitle: "Thousands of Calculated Repetitions",
        paragraph: "From grueling dawn training sessions to international high-stakes fixtures, Mohale plays with an instinctive precision. His stick handling is fluid, but behind that effortless aesthetic lies thousands of hours of calculated repetition.",
        image: "images/fitness.JPG",
        caption: "Explosive conditioning and biomechanical discipline during off-field preparation.",
        placement: "side"
      },
      {
        subtitle: "A Catalyst for the Next Generation",
        paragraph: "Beyond the game itself, Mohale is rewriting what it means to be a modern African athlete: articulate, culturally grounded, and relentlessly ambitious. He mentors young talent across the North West province, instilling the belief that local roots can yield global mastery.",
        image: "images/insp1.JPG",
        caption: "Inspiring the next generation of student-athletes in Potchefstroom.",
        placement: "side"
      }
    ]
  },
  {
    id: "story-3",
    title: "The Architecture of Unshakeable Purpose",
    category: "Inspiration",
    author: "LiveGreater Editorial",
    readTime: "5 min read",
    tier: "All Readers",
    layoutStyle: "editorial-spread",
    image: "images/insp1.JPG",
    quote: "When purpose is clear, every setback transforms from an interruption into essential training.",
    content: "Growth demands friction. No individual ever built an extraordinary life by remaining comfortable in familiar environments.",
    sections: [
      {
        subtitle: "The Friction of True Growth",
        paragraph: "Growth demands friction. No individual ever built an extraordinary life by remaining comfortable in familiar environments.",
        image: "images/insp1.JPG",
        caption: "Stepping beyond the comfort zone is where personal identity is forged.",
        placement: "full"
      },
      {
        subtitle: "The Steady Internal Compass",
        paragraph: "To live greater means embracing the discomfort of uncharted territory. It requires an internal compass that remains steady regardless of external opinions or temporary delays.",
        image: "images/influence.JPG",
        caption: "Unwavering conviction amidst societal noise.",
        placement: "full"
      },
      {
        subtitle: "Authoring Your Own Standard",
        paragraph: "Your story is still being drafted. Choose courage over complacency, surround yourself with minds that challenge your ceiling, and commit to the relentless pursuit of your potential.",
        image: "images/fashion.JPG",
        caption: "Expressing individuality with dignity and artistic confidence.",
        placement: "full"
      }
    ]
  },
  {
    id: "story-4",
    title: "Peak Performance: Habits for Mind & Body Mastery",
    category: "Health",
    author: "Dr. Elena Vance",
    readTime: "4 min read",
    tier: "All Readers",
    layoutStyle: "alternating",
    image: "images/health.JPG",
    quote: "Energy is your highest currency. Guard your biology with the same vigilance you guard your vision.",
    content: "Modern peak performance is not about pushing until burnout; it is about calibrating recovery, nutrition, and nervous system regulation.",
    sections: [
      {
        subtitle: "The Biology of Sustainable Output",
        paragraph: "Modern peak performance is not about pushing until burnout; it is about calibrating recovery, nutrition, and nervous system regulation to sustain high output year-round.",
        image: "images/health.JPG",
        caption: "Optimizing circadian cycles and cellular recovery for heightened executive focus.",
        placement: "float-right"
      },
      {
        subtitle: "Precision Movement & Metabolic Health",
        paragraph: "When you master sleep architecture, zone-2 cardiovascular conditioning, and clean whole-food fueling, cognitive clarity naturally compounds. Stress shifts from an obstacle to an adaptive stimulus.",
        image: "images/fitness.JPG",
        caption: "Targeted cardiovascular protocols build deep cognitive and physiological resilience.",
        placement: "float-left"
      },
      {
        subtitle: "Micro-Decisions That Compound",
        paragraph: "Longevity is built in the micro-decisions: the hydration upon waking, the intentional stillness before meetings, and the discipline to disconnect when the work is complete. The greatest investment you will ever make is your health.",
        image: "images/travel.JPG",
        caption: "Sanctuary spaces and restorative habits form the foundation of lifelong vitality.",
        placement: "float-right"
      }
    ]
  },
  {
    id: "story-5",
    title: "Building Beyond Limits: Blueprints for Scalable Impact",
    category: "Entrepreneurship",
    author: "Marcus Chen",
    readTime: "7 min read",
    tier: "VIP Exclusive",
    layoutStyle: "two-column",
    image: "images/entrepreneur.JPG",
    quote: "Founders don't chase trends — they solve genuine friction and build systems that outlive hype.",
    content: "Building a scalable business requires an uncommon blend of patience and urgency. Speed in execution, patience in compounding value.",
    sections: [
      {
        subtitle: "Speed in Execution, Patience in Compounding",
        paragraph: "Building a scalable business requires an uncommon blend of patience and urgency. Speed in execution, patience in compounding value.",
        image: "images/entrepreneur.JPG",
        caption: "Architecting sustainable ventures with high operational discipline.",
        placement: "side"
      },
      {
        subtitle: "Defensible Culture & Unit Economics",
        paragraph: "The founders spotlighted in LiveGreater Magazine understand that sustainable competitive advantage is built on defensible culture, rigorous cash flow discipline, and deep customer empathy.",
        image: "images/influence.JPG",
        caption: "Leading teams with transparent mission alignment and high accountability.",
        placement: "side"
      },
      {
        subtitle: "Winning in Evolving Markets",
        paragraph: "As capital markets evolve, the companies that emerge victorious will not be the loudest, but the most resilient and operationally sound.",
        image: "images/travel.JPG",
        caption: "Global thinking paired with rigorous local execution.",
        placement: "side"
      }
    ]
  },
  {
    id: "story-6",
    title: "The Art of Intentional Living",
    category: "Lifestyle",
    author: "Sophia Laurent",
    readTime: "4 min read",
    tier: "All Readers",
    layoutStyle: "alternating",
    image: "images/travel.JPG",
    quote: "Luxury is not excess. True luxury is space, peace of mind, and environments that elevate your soul.",
    content: "Curated living is the deliberate selection of what enters your life — from the architecture of your home to daily rituals.",
    sections: [
      {
        subtitle: "Curating Your Immediate World",
        paragraph: "Curated living is the deliberate selection of what enters your life — from the architecture of your home to the books on your nightstand and the places you travel.",
        image: "images/travel.JPG",
        caption: "Immersive architectural retreats designed for restoration and creative clarity.",
        placement: "float-right"
      },
      {
        subtitle: "The Value of Space and Silence",
        paragraph: "When your environment reflects tranquility and intentional craftsmanship, your mental bandwidth expands. Quality always outshines quantity.",
        image: "images/fashion.JPG",
        caption: "Elegance through understated craft and bespoke craftsmanship.",
        placement: "float-left"
      },
      {
        subtitle: "Everyday Rituals of Presence",
        paragraph: "LiveGreater explores spaces and rituals designed to inspire clarity, foster creative breakthroughs, and celebrate the beauty of everyday presence.",
        image: "images/insp1.JPG",
        caption: "Stillness is not passive; it is the ultimate preparation for decisive action.",
        placement: "float-right"
      }
    ]
  },
  {
    id: "story-7",
    title: "The Canvas of Identity: Couture Meets Contemporary Expression",
    category: "Fashion & Art",
    author: "Amina Diallo",
    readTime: "5 min read",
    tier: "All Readers",
    layoutStyle: "photojournalism",
    image: "images/fashion.JPG",
    quote: "Fashion is architecture you wear. Art is the voice you leave behind.",
    content: "Aesthetic expression is one of the most immediate languages of human culture. What we wear communicates who we are.",
    sections: [
      {
        subtitle: "The Visual Dialect of Culture",
        paragraph: "Aesthetic expression is one of the most immediate languages of human culture. What we wear and what we create visually communicates who we are and what we stand for.",
        image: "images/fashion.JPG",
        caption: "Sculptural tailoring merging classical African silhouettes with avant-garde minimalism.",
        placement: "centered"
      },
      {
        subtitle: "Heritage Meets Futurism",
        paragraph: "The contemporary fashion landscape is undergoing a profound renaissance, blending heritage craft with futuristic silhouettes and sustainable materials.",
        image: "images/exclusive.JPG",
        caption: "The intersection of haute couture craftsmanship and conscious material selection.",
        placement: "centered"
      },
      {
        subtitle: "Radical Storytelling on the Runway",
        paragraph: "At LiveGreater, we spotlight designers and artists who challenge conformity, transforming clothing and galleries into platforms of radical storytelling.",
        image: "images/influence.JPG",
        caption: "Designers redefining the runway into an arena of cultural advocacy.",
        placement: "centered"
      }
    ]
  },
  {
    id: "story-8",
    title: "The Architecture of Authentic Impact",
    category: "Influence",
    author: "Luigi Derbyshire",
    readTime: "6 min read",
    tier: "VIP Exclusive",
    layoutStyle: "editorial-spread",
    image: "images/influence.JPG",
    quote: "True leadership is measured not by how many follow you, but by how many you empower to lead.",
    content: "In a crowded world of algorithms and metrics, authenticity is the rarest and most magnetic commodity.",
    sections: [
      {
        subtitle: "The Rarest Commodity",
        paragraph: "In a crowded world of algorithms and metrics, authenticity is the rarest and most magnetic commodity.",
        image: "images/influence.JPG",
        caption: "Authentic resonance cuts through the static of modern algorithmic distribution.",
        placement: "full"
      },
      {
        subtitle: "Unlocking Doors for Emerging Voices",
        paragraph: "Influence that matters goes beyond surface vanity: it creates tangible economic opportunity, elevates cultural discourse, and unlocks doors for emerging talent.",
        image: "images/entrepreneur.JPG",
        caption: "Creating sustainable pipelines that empower the next generation of creative leaders.",
        placement: "full"
      },
      {
        subtitle: "Timeless Resonance",
        paragraph: "When you lead with principle, conviction, and a vision larger than yourself, your resonance becomes timeless.",
        image: "images/sport.JPG",
        caption: "Excellence in leadership inspires collective elevation across communities.",
        placement: "full"
      }
    ]
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
let currentArticleSections = [];

const SECTION_IMAGE_PRESETS = [
  { label: "-- Choose Preset Photo (Optional) --", value: "" },
  { label: "images/exclusive.JPG (Issue 01 Exclusive)", value: "images/exclusive.JPG" },
  { label: "images/sport.JPG (Mohale Hockey Pitch)", value: "images/sport.JPG" },
  { label: "images/fitness.JPG (Athletic Training)", value: "images/fitness.JPG" },
  { label: "images/entrepreneur.JPG (Entrepreneurship & Business)", value: "images/entrepreneur.JPG" },
  { label: "images/fashion.JPG (Fashion & Runway)", value: "images/fashion.JPG" },
  { label: "images/insp1.JPG (Inspiration & Mindset)", value: "images/insp1.JPG" },
  { label: "images/travel.JPG (Travel & Lifestyle)", value: "images/travel.JPG" },
  { label: "images/health.JPG (Health & Longevity)", value: "images/health.JPG" }
];

function initArticlesStudio() {
  const modal = document.getElementById("articleModal");
  const openModalBtn = document.getElementById("openNewArticleModalBtn");
  const addTriggerBtn = document.getElementById("addArticleTrigger");
  const closeModalBtn = document.getElementById("closeArticleModalBtn");
  const cancelBtn = document.getElementById("cancelArticleBtn");
  const saveForm = document.getElementById("saveArticleForm");
  const searchInput = document.getElementById("searchArticlesInput");

  // Repeater buttons
  const addSectionTopBtn = document.getElementById("addSectionTopBtn");
  const addSectionBottomBtn = document.getElementById("addSectionBottomBtn");

  // Article hero upload elements
  const dropzone = document.getElementById("articleDropzone");
  const fileInput = document.getElementById("articleFileInput");
  const previewWrap = document.getElementById("articlePreviewWrap");
  const previewImg = document.getElementById("articlePreviewImg");
  const changeImgBtn = document.getElementById("changeArticleImgBtn");
  const imageSelect = document.getElementById("articleImageSelect");

  function openNewArticleModal() {
    saveForm.reset();
    document.getElementById("editArticleId").value = "";
    document.getElementById("articleModalTitle").textContent = "Create New Magazine Story";
    document.getElementById("articleModalBadge").textContent = "Publisher Tool";
    uploadedArticleImageData = "";
    if (previewWrap) previewWrap.style.display = "none";
    if (dropzone) dropzone.style.display = "block";

    // Initialize with 1 clean section
    currentArticleSections = [
      {
        subtitle: "",
        paragraph: "",
        image: "",
        caption: "",
        placement: "full"
      }
    ];
    renderSections();
    modal.classList.add("active");
  }

  if (openModalBtn) openModalBtn.addEventListener("click", openNewArticleModal);
  if (addTriggerBtn) addTriggerBtn.addEventListener("click", openNewArticleModal);

  function closeModal() {
    modal.classList.remove("active");
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // Hero Image upload handlers
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
          showToast("Hero cover photo uploaded!", "fa-check");
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

  // Sections repeater actions
  function appendNewSection() {
    currentArticleSections.push({
      subtitle: "",
      paragraph: "",
      image: "",
      caption: "",
      placement: "full"
    });
    renderSections();
    showToast(`Added Section #${currentArticleSections.length}!`, "fa-plus");
  }

  if (addSectionTopBtn) addSectionTopBtn.addEventListener("click", appendNewSection);
  if (addSectionBottomBtn) addSectionBottomBtn.addEventListener("click", appendNewSection);

  // Form Submission
  if (saveForm) {
    saveForm.addEventListener("submit", (e) => {
      e.preventDefault();
      syncSectionsFromDOM();

      const editId = document.getElementById("editArticleId").value;
      const title = document.getElementById("articleTitleInput").value.trim();
      const category = document.getElementById("articleCategorySelect").value;
      const author = document.getElementById("articleAuthorInput").value.trim();
      const readTime = document.getElementById("articleReadtimeInput").value.trim();
      const layoutStyle = document.getElementById("articleLayoutSelect")?.value || "editorial-spread";
      const tier = document.getElementById("articleTierSelect").value;
      const quote = document.getElementById("articleQuoteInput").value.trim();

      const image = uploadedArticleImageData || imageSelect?.value || "images/exclusive.JPG";

      // Filter sections: ensure at least one section exists with paragraph content
      const validSections = currentArticleSections.filter(s => (s.paragraph && s.paragraph.trim().length > 0) || s.image);

      if (!validSections.length) {
        showToast("Please enter at least one paragraph for your story.", "fa-exclamation-triangle");
        return;
      }

      const content = validSections.map(s => s.paragraph).filter(Boolean).join("\n\n");
      const paragraphs = validSections.map(s => s.paragraph).filter(Boolean);

      const customList = JSON.parse(localStorage.getItem("livegreater_custom_articles") || "[]");

      const storyPayload = {
        id: editId || ("custom-" + Date.now()),
        title,
        category,
        author,
        readTime,
        layoutStyle,
        image,
        tier,
        quote,
        content,
        paragraphs,
        sections: validSections
      };

      if (editId) {
        const idx = customList.findIndex(a => a.id === editId);
        if (idx !== -1) {
          customList[idx] = storyPayload;
          saveCustomArticles(customList);
          showToast(`Magazine story "${title}" updated successfully!`, "fa-check");
        } else {
          customList.push(storyPayload);
          saveCustomArticles(customList);
          showToast(`Story saved to custom catalog!`, "fa-check");
        }
      } else {
        customList.unshift(storyPayload);
        saveCustomArticles(customList);
        showToast(`Magazine story "${title}" published live with ${validSections.length} sections!`, "fa-check-circle");
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

function renderSections() {
  const container = document.getElementById("articleSectionsContainer");
  if (!container) return;

  if (!currentArticleSections.length) {
    currentArticleSections = [{ subtitle: "", paragraph: "", image: "", caption: "", placement: "full" }];
  }

  container.innerHTML = currentArticleSections.map((sec, idx) => `
    <div class="article-section-card" data-index="${idx}">
      <div class="section-card-top">
        <span class="section-card-badge">
          <i class="fas fa-bookmark" style="color: #ffd700;"></i> Section #${idx + 1}: Paragraph ${idx + 1} & Image ${idx + 1}
        </span>
        ${currentArticleSections.length > 1 ? `
          <button type="button" class="btn-remove-section" data-index="${idx}" title="Delete Section #${idx + 1}">
            <i class="fas fa-trash-alt"></i> Remove Section
          </button>
        ` : ''}
      </div>

      <!-- SECTION SUBTITLE -->
      <div class="form-group" style="margin-bottom: 12px;">
        <label style="font-size: 0.85rem;"><i class="fas fa-heading" style="color: #ffd700;"></i> Subtitle / Chapter Headline (Optional)</label>
        <input type="text" class="section-subtitle-input" data-index="${idx}" value="${escapeHtml(sec.subtitle || '')}" placeholder="e.g. Chapter ${idx + 1}: The Philosophy of Craft">
      </div>

      <!-- SECTION PARAGRAPH BODY -->
      <div class="form-group" style="margin-bottom: 14px;">
        <label style="font-size: 0.85rem;"><i class="fas fa-paragraph" style="color: #ffd700;"></i> Paragraph ${idx + 1} Body Text <span style="color: #ff4757;">*</span></label>
        <textarea class="section-paragraph-input" data-index="${idx}" rows="4" placeholder="Write or paste paragraph ${idx + 1} text here..." required>${escapeHtml(sec.paragraph || '')}</textarea>
      </div>

      <!-- SECTION IMAGE PAIRING BLOCK -->
      <div class="section-image-block">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <label style="font-size: 0.85rem; margin: 0; font-weight: 600; color: #ffd700;">
            <i class="fas fa-camera"></i> Inline Photo for Paragraph ${idx + 1} (Optional)
          </label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.78rem; color: var(--text-muted);">Layout Placement:</span>
            <select class="section-placement-select" data-index="${idx}" style="padding: 5px 10px; font-size: 0.8rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 6px; color: #fff;">
              <option value="full" ${sec.placement === 'full' ? 'selected' : ''}>Full-Width Chapter Spread</option>
              <option value="side" ${sec.placement === 'side' ? 'selected' : ''}>Side-by-Side (50% Column)</option>
              <option value="float-right" ${sec.placement === 'float-right' ? 'selected' : ''}>Float Right (Wrapped Text)</option>
              <option value="float-left" ${sec.placement === 'float-left' ? 'selected' : ''}>Float Left (Wrapped Text)</option>
              <option value="centered" ${sec.placement === 'centered' ? 'selected' : ''}>Centered Photojournalism Card</option>
            </select>
          </div>
        </div>

        <!-- UPLOAD DROPZONE -->
        <div class="upload-dropzone section-dropzone" data-index="${idx}" style="padding: 12px; margin-bottom: 8px; ${sec.image ? 'display: none;' : ''}">
          <i class="fas fa-cloud-upload-alt" style="font-size: 1.4rem; color: #ffd700;"></i>
          <p style="font-size: 0.82rem; margin: 4px 0;"><strong>Click to upload photo for Paragraph ${idx + 1}</strong></p>
          <input type="file" class="section-file-input" data-index="${idx}" accept="image/*" style="display: none;">
        </div>

        <!-- PREVIEW BOX -->
        <div class="section-preview-wrap" data-index="${idx}" style="margin-bottom: 8px; position: relative; ${sec.image ? '' : 'display: none;'}">
          <img class="section-thumb-preview" src="${sec.image || ''}" alt="Section ${idx + 1} photo" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,215,0,0.3);">
          <button type="button" class="btn-remove-sec-img btn-danger" data-index="${idx}" style="position: absolute; top: 6px; right: 6px; padding: 3px 8px; font-size: 0.72rem;">
            <i class="fas fa-times"></i> Remove Photo
          </button>
        </div>

        <!-- PRESET DROPDOWN & CAPTION -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <select class="section-preset-select" data-index="${idx}" style="flex: 1; padding: 6px 10px; font-size: 0.8rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff;">
            ${SECTION_IMAGE_PRESETS.map(p => `<option value="${p.value}" ${sec.image === p.value ? 'selected' : ''}>${p.label}</option>`).join('')}
          </select>
          <input type="text" class="section-caption-input" data-index="${idx}" value="${escapeHtml(sec.caption || '')}" placeholder="Caption / photo credit (e.g. Photo by Richeey Designs)" style="flex: 1; padding: 6px 10px; font-size: 0.8rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff;">
        </div>
      </div>
    </div>
  `).join("");

  attachSectionListeners();
}

function syncSectionsFromDOM() {
  const container = document.getElementById("articleSectionsContainer");
  if (!container) return;

  const cards = container.querySelectorAll(".article-section-card");
  cards.forEach((card, idx) => {
    if (!currentArticleSections[idx]) {
      currentArticleSections[idx] = { subtitle: "", paragraph: "", image: "", caption: "", placement: "full" };
    }
    const sub = card.querySelector(".section-subtitle-input");
    const para = card.querySelector(".section-paragraph-input");
    const place = card.querySelector(".section-placement-select");
    const cap = card.querySelector(".section-caption-input");

    if (sub) currentArticleSections[idx].subtitle = sub.value.trim();
    if (para) currentArticleSections[idx].paragraph = para.value.trim();
    if (place) currentArticleSections[idx].placement = place.value;
    if (cap) currentArticleSections[idx].caption = cap.value.trim();
  });
}

function attachSectionListeners() {
  const container = document.getElementById("articleSectionsContainer");
  if (!container) return;

  // 1. Remove section button
  container.querySelectorAll(".btn-remove-section").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      syncSectionsFromDOM();
      currentArticleSections.splice(idx, 1);
      renderSections();
      showToast("Section removed.", "fa-trash");
    });
  });

  // 2. Dropzone file upload
  container.querySelectorAll(".section-dropzone").forEach(dz => {
    const idx = parseInt(dz.dataset.index, 10);
    const fileInp = dz.querySelector(".section-file-input");

    dz.addEventListener("click", () => {
      if (fileInp) fileInp.click();
    });

    if (fileInp) {
      fileInp.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            syncSectionsFromDOM();
            currentArticleSections[idx].image = event.target.result;
            renderSections();
            showToast(`Photo for Section #${idx + 1} uploaded!`, "fa-check");
          };
          reader.readAsDataURL(file);
        }
      });
    }
  });

  // 3. Remove section photo button
  container.querySelectorAll(".btn-remove-sec-img").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      syncSectionsFromDOM();
      currentArticleSections[idx].image = "";
      renderSections();
    });
  });

  // 4. Preset select change
  container.querySelectorAll(".section-preset-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const idx = parseInt(sel.dataset.index, 10);
      syncSectionsFromDOM();
      currentArticleSections[idx].image = sel.value;
      renderSections();
    });
  });
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
      <td>
        <strong>${escapeHtml(a.title)}</strong>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
          <i class="fas fa-th-large" style="color: #ffd700;"></i> Layout: <strong>${a.layoutStyle || 'editorial-spread'}</strong> • ${(a.sections && a.sections.length) || 1} sections
        </div>
      </td>
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
  if (document.getElementById("articleLayoutSelect")) {
    document.getElementById("articleLayoutSelect").value = article.layoutStyle || "editorial-spread";
  }
  document.getElementById("articleTierSelect").value = article.tier || "All Readers";
  document.getElementById("articleQuoteInput").value = article.quote || "";

  // Hero Cover Image
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

  // Populate Sections
  if (article.sections && Array.isArray(article.sections) && article.sections.length > 0) {
    currentArticleSections = JSON.parse(JSON.stringify(article.sections));
  } else if (article.paragraphs && Array.isArray(article.paragraphs) && article.paragraphs.length > 0) {
    currentArticleSections = article.paragraphs.map((p, idx) => ({
      subtitle: idx === 0 ? "Introduction" : "",
      paragraph: p,
      image: idx === 0 ? (article.image || "") : "",
      caption: "",
      placement: "full"
    }));
  } else if (article.content) {
    const parts = article.content.split(/\n\n+/).filter(Boolean);
    currentArticleSections = parts.map((p, idx) => ({
      subtitle: idx === 0 ? "Introduction" : "",
      paragraph: p,
      image: idx === 0 ? (article.image || "") : "",
      caption: "",
      placement: "full"
    }));
  } else {
    currentArticleSections = [{ subtitle: "", paragraph: "", image: "", caption: "", placement: "full" }];
  }

  renderSections();

  document.getElementById("articleModalTitle").textContent = "Edit Magazine Story";
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
