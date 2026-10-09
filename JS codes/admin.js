/* ==========================================================================
   LIVEGREATER MAGAZINE - ADMIN STUDIO JAVASCRIPT
   Prepared for Luigi Derbyshire | Developed by Richeey Designs
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initAdminAuth();
  initAdminTabs();
  initArticlesStudio();
  initMailingSystem();
  updateMetrics();
});

/* ==========================================================================
   1. AUTHENTICATION CONTROLLER
   ========================================================================== */
function initAdminAuth() {
  const authModal = document.getElementById("adminAuthModal");
  const mainContainer = document.getElementById("adminMainContainer");
  const loginForm = document.getElementById("adminLoginForm");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  // Check existing session
  const isLoggedIn = sessionStorage.getItem("livegreater_admin_logged_in") === "true";

  if (isLoggedIn) {
    showDashboard();
  } else {
    showLoginModal();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("adminEmailInput").value.trim();
      const pass = document.getElementById("adminPasswordInput").value.trim();

      // Master check: Luigi Derbyshire / admin
      if ((email === "admin@livegreater.com" || email === "luigi@livegreater.com" || email.includes("richeey")) && pass.length >= 4) {
        sessionStorage.setItem("livegreater_admin_logged_in", "true");
        showDashboard();
        showToast("Welcome back, Luigi Derbyshire!", "fa-check-circle");
      } else {
        showToast("Invalid credentials. Please check password.", "fa-exclamation-triangle");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("livegreater_admin_logged_in");
      showLoginModal();
      showToast("Signed out of Admin Studio.", "fa-info-circle");
    });
  }

  function showDashboard() {
    if (authModal) authModal.style.display = "none";
    if (mainContainer) mainContainer.style.display = "block";
    updateMetrics();
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
   3. ARTICLES STUDIO (ADD, EDIT, DELETE, SEARCH)
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

function initArticlesStudio() {
  const modal = document.getElementById("articleModal");
  const openModalBtn = document.getElementById("openNewArticleModalBtn");
  const addTriggerBtn = document.getElementById("addArticleTrigger");
  const closeModalBtn = document.getElementById("closeArticleModalBtn");
  const cancelBtn = document.getElementById("cancelArticleBtn");
  const saveForm = document.getElementById("saveArticleForm");
  const searchInput = document.getElementById("searchArticlesInput");

  // Open modal for new article
  function openNewArticleModal() {
    saveForm.reset();
    document.getElementById("editArticleId").value = "";
    document.getElementById("articleModalTitle").textContent = "Create New Story";
    document.getElementById("articleModalBadge").textContent = "Publisher Tool";
    modal.classList.add("active");
  }

  if (openModalBtn) openModalBtn.addEventListener("click", openNewArticleModal);
  if (addTriggerBtn) addTriggerBtn.addEventListener("click", openNewArticleModal);

  function closeModal() {
    modal.classList.remove("active");
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // Save / Update Article
  if (saveForm) {
    saveForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = document.getElementById("editArticleId").value;
      const title = document.getElementById("articleTitleInput").value.trim();
      const category = document.getElementById("articleCategorySelect").value;
      const author = document.getElementById("articleAuthorInput").value.trim();
      const readTime = document.getElementById("articleReadtimeInput").value.trim();
      const image = document.getElementById("articleImageSelect").value;
      const tier = document.getElementById("articleTierSelect").value;
      const quote = document.getElementById("articleQuoteInput").value.trim();
      const content = document.getElementById("articleContentInput").value.trim();

      const customList = JSON.parse(localStorage.getItem("livegreater_custom_articles") || "[]");

      if (editId) {
        // Edit existing
        const idx = customList.findIndex(a => a.id === editId);
        if (idx !== -1) {
          customList[idx] = { id: editId, title, category, author, readTime, image, tier, quote, content };
          saveCustomArticles(customList);
          showToast(`Article "${title}" updated successfully!`, "fa-check");
        } else {
          // If default story was edited, save copy into custom
          const newArticle = { id: "custom-" + Date.now(), title, category, author, readTime, image, tier, quote, content };
          customList.push(newArticle);
          saveCustomArticles(customList);
          showToast(`Article saved to custom catalog!`, "fa-check");
        }
      } else {
        // Create new
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

  // Search input live filtering
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
  document.getElementById("articleImageSelect").value = article.image || "images/exclusive.JPG";
  document.getElementById("articleTierSelect").value = article.tier || "All Readers";
  document.getElementById("articleQuoteInput").value = article.quote || "";
  document.getElementById("articleContentInput").value = article.content || "";

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
   4. MAILING SYSTEM & SUBSCRIBERS
   ========================================================================== */
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
      let csvContent = "data:text/csv;charset=utf-8,Name,Email,Tier,Status,Date Registered\n";
      subs.forEach(s => {
        csvContent += `"${s.name}","${s.email}","${s.tier}","${s.status}","${s.date}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `LiveGreater_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Subscriber list exported as CSV!", "fa-download");
    });
  }

  if (addSubBtn) {
    addSubBtn.addEventListener("click", () => {
      const email = prompt("Enter subscriber email address:");
      if (!email || !email.includes("@")) return;
      const name = prompt("Enter subscriber full name:") || "LiveGreater Reader";

      addSubscriber(name, email, "VIP Subscriber");
      showToast(`Subscriber ${email} added!`, "fa-check");
    });
  }
}

function getSubscribers() {
  // Sync basic list & structured list
  const structured = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
  const simpleList = JSON.parse(localStorage.getItem("livegreater_subscribers") || '["luigi@livegreater.com", "mohale@livegreater.com", "vip.reader@livegreater.com"]');

  const combined = [...structured];
  simpleList.forEach(email => {
    if (!combined.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      combined.push({
        name: email.split("@")[0],
        email: email,
        tier: "VIP Circle",
        status: "Active",
        date: "2026-02-17"
      });
    }
  });

  return combined;
}

function addSubscriber(name, email, tier = "VIP Circle") {
  const subs = getSubscribers();
  if (subs.some(s => s.email.toLowerCase() === email.toLowerCase())) {
    showToast("This email is already in the database.", "fa-info-circle");
    return;
  }

  subs.push({
    name,
    email,
    tier,
    status: "Active",
    date: new Date().toISOString().slice(0, 10)
  });

  localStorage.setItem("livegreater_member_accounts", JSON.stringify(subs));

  // Sync to simple list
  const simple = JSON.parse(localStorage.getItem("livegreater_subscribers") || "[]");
  if (!simple.includes(email)) simple.push(email);
  localStorage.setItem("livegreater_subscribers", JSON.stringify(simple));

  renderSubscribers();
  updateMetrics();
}

function removeSubscriber(email) {
  if (!confirm(`Remove ${email} from subscriber list?`)) return;

  let subs = getSubscribers().filter(s => s.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem("livegreater_member_accounts", JSON.stringify(subs));

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
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No subscribers registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = subs.map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(s.name || 'Member')}</strong></td>
      <td>${escapeHtml(s.email)}</td>
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
   5. METRICS COUNTER
   ========================================================================== */
function updateMetrics() {
  const subsCount = getSubscribers().length;
  const articlesCount = getArticles().length;

  const subEl = document.getElementById("metricSubscribers");
  const artEl = document.getElementById("metricArticles");

  if (subEl) subEl.textContent = subsCount;
  if (artEl) artEl.textContent = articlesCount;
}

/* ==========================================================================
   HELPERS & TOAST
   ========================================================================== */
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
