/* ==========================================================================
   LIVEGREATER MAGAZINE - CORE PLATFORM JAVASCRIPT
   Prepared for Luigi Derbyshire | Developed by Richeey Designs
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initSlider();
  initMobileNav();
  initArticleReader();
  initNewsletter();
  initAdminPortal();
  initFooterModals();
});

/* ==========================================================================
   1. RESPONSIVE SLIDER SYSTEM
   ========================================================================== */
function initSlider() {
  const track = document.getElementById("sliderTrack");
  const cards = document.querySelectorAll(".card");
  const sliderWindow = document.querySelector(".slider-window");
  const progress = document.querySelector(".progress");
  const leftBtn = document.querySelector(".arrow.left");
  const rightBtn = document.querySelector(".arrow.right");

  if (!track || !cards.length || !sliderWindow) return;

  let currentIndex = 0;
  const intervalTime = 3800;
  let autoSlideTimer = null;

  function getVisibleCards() {
    const width = sliderWindow.clientWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  }

  function getStepWidth() {
    if (!cards.length) return 320;
    const firstCard = cards[0];
    const style = window.getComputedStyle(firstCard);
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const marginRight = parseFloat(style.marginRight) || 0;
    return firstCard.offsetWidth + marginLeft + marginRight;
  }

  function updateSlider() {
    const visible = getVisibleCards();
    const maxTranslate = Math.max(0, cards.length - visible);
    const translateIndex = Math.min(currentIndex, maxTranslate);
    const step = getStepWidth();

    track.style.transform = `translateX(${-translateIndex * step}px)`;

    cards.forEach((card, idx) => {
      card.classList.toggle("active", idx === currentIndex);
    });
  }

  function startProgress() {
    if (!progress) return;
    progress.style.transition = "none";
    progress.style.width = "0%";

    requestAnimationFrame(() => {
      setTimeout(() => {
        progress.style.transition = `width ${intervalTime}ms linear`;
        progress.style.width = "100%";
      }, 30);
    });
  }

  function slideRight() {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateSlider();
    startProgress();
  }

  function slideLeft() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = cards.length - 1;
    }
    updateSlider();
    startProgress();
  }

  function startAutoSlide() {
    stopAutoSlide();
    startProgress();
    autoSlideTimer = setInterval(() => {
      slideRight();
    }, intervalTime);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  // Attach button events safely
  if (leftBtn) {
    leftBtn.onclick = (e) => {
      e.preventDefault();
      slideLeft();
      startAutoSlide();
    };
  }

  if (rightBtn) {
    rightBtn.onclick = (e) => {
      e.preventDefault();
      slideRight();
      startAutoSlide();
    };
  }

  // Hover pause
  sliderWindow.addEventListener("mouseenter", stopAutoSlide);
  sliderWindow.addEventListener("mouseleave", startAutoSlide);

  // Touch Swipe
  let touchStartX = 0;
  let touchEndX = 0;

  sliderWindow.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoSlide();
  }, { passive: true });

  sliderWindow.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      slideRight();
    } else if (diff < -45) {
      slideLeft();
    }
    startAutoSlide();
  }, { passive: true });

  // Window resize re-alignment
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateSlider();
    }, 150);
  });

  // Keyboard navigation when hovering
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      slideLeft();
      startAutoSlide();
    } else if (e.key === "ArrowRight") {
      slideRight();
      startAutoSlide();
    }
  });

  // Init
  updateSlider();
  startAutoSlide();
}

/* ==========================================================================
   2. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const header = document.querySelector("header");
  const nav = document.querySelector("nav");
  if (!header || !nav) return;

  let toggleBtn = document.querySelector(".mobile-toggle");
  if (!toggleBtn) {
    toggleBtn = document.createElement("button");
    toggleBtn.className = "mobile-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle navigation menu");
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    header.appendChild(toggleBtn);
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-open");
    toggleBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Close when clicking nav links
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target) && nav.classList.contains("nav-open")) {
      nav.classList.remove("nav-open");
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
}

/* ==========================================================================
   3. ARTICLE READER MODAL
   ========================================================================== */
const ARTICLES_DATABASE = {
  "exclusive": {
    category: "Exclusive Feature",
    title: "Inside the Minds of Creators Shaping Culture",
    author: "Luigi Derbyshire • Founder & Editor-in-Chief",
    readTime: "6 min read",
    image: "images/exclusive.JPG",
    quote: "True influence is never about noise — it is about the quiet gravity of undeniable execution.",
    paragraphs: [
      "In an era where attention is fleeting and digital noise is at an all-time peak, the creators who truly endure are those with an unwavering commitment to depth. LiveGreater was founded on the belief that greatness is not an accidental milestone, but a rigorous, daily discipline.",
      "Across design, business, athletics, and the arts, visionaries operate under a fundamentally distinct framework: they don't react to current culture, they construct its next iteration. They recognize that every project is a testament to standards, identity, and narrative power.",
      "When we speak to founders and creators across the globe, a recurring pattern emerges: relentless elimination of distraction, extreme clarity of purpose, and an appetite for calculated risk. As we step into this next chapter of LiveGreater Magazine, our mission is to deliver the blueprints that empower you to elevate your own orbit."
    ]
  },
  "mohale": {
    category: "Sports",
    title: "Redefining Elite: Mohale Thekiso",
    author: "Tshiamo Mafojane • Sports & Performance Editor",
    readTime: "5 min read",
    image: "images/sport.JPG",
    quote: "The turf doesn't care about excuses. Every stride either closes the gap to greatness or surrenders it.",
    paragraphs: [
      "Mohale Thekiso is not just an elite hockey talent — he represents a transformative shift in athletic mindset, tactical poise, and leadership under pressure.",
      "From grueling dawn training sessions to international high-stakes fixtures, Mohale plays with an instinctive precision. His stick handling is fluid, but behind that effortless aesthetic lies thousands of hours of calculated repetition.",
      "Beyond the game itself, Mohale is rewriting what it means to be a modern African athlete: articulate, culturally grounded, and relentlessly ambitious. His story continues to inspire the next generation of competitors who refuse to accept ordinary standards."
    ]
  },
  "health": {
    category: "Health & Vitality",
    title: "Peak Performance: Habits for Mind & Body Mastery",
    author: "Dr. Elena Vance • Wellness & Human Optimization",
    readTime: "4 min read",
    image: "images/health.JPG",
    quote: "Energy is your highest currency. Guard your biology with the same vigilance you guard your vision.",
    paragraphs: [
      "Modern peak performance is not about pushing until burnout; it is about calibrating recovery, nutrition, and nervous system regulation to sustain high output year-round.",
      "When you master sleep architecture, zone-2 cardiovascular conditioning, and clean whole-food fueling, cognitive clarity naturally compounds. Stress shifts from an obstacle to an adaptive stimulus.",
      "Longevity is built in the micro-decisions: the hydration upon waking, the intentional stillness before meetings, and the discipline to disconnect when the work is complete."
    ]
  },
  "inspiration": {
    category: "Inspiration",
    title: "The Architecture of Unshakeable Purpose",
    author: "LiveGreater Editorial Board",
    readTime: "5 min read",
    image: "images/insp1.JPG",
    quote: "When purpose is clear, every setback transforms from an interruption into essential training.",
    paragraphs: [
      "Growth demands friction. No individual ever built an extraordinary life by remaining comfortable in familiar environments.",
      "To live greater means embracing the discomfort of uncharted territory. It requires an internal compass that remains steady regardless of external opinions or temporary delays.",
      "Your story is still being drafted. Choose courage over complacency, surround yourself with minds that challenge your ceiling, and commit to the relentless pursuit of your potential."
    ]
  },
  "entrepreneurship": {
    category: "Entrepreneurship",
    title: "Building Beyond Limits: Blueprints for Scalable Impact",
    author: "Marcus Chen • Capital & Strategy Contributor",
    readTime: "7 min read",
    image: "images/entrepreneur.JPG",
    quote: "Founders don't chase trends — they solve genuine friction and build systems that outlive hype.",
    paragraphs: [
      "Building a scalable business requires an uncommon blend of patience and urgency. Speed in execution, patience in compounding value.",
      "The founders spotlighted in LiveGreater Magazine understand that sustainable competitive advantage is built on defensible culture, rigorous cash flow discipline, and deep customer empathy.",
      "As capital markets evolve, the companies that emerge victorious will not be the loudest, but the most resilient and operationally sound."
    ]
  },
  "lifestyle": {
    category: "Lifestyle",
    title: "The Art of Curated Living",
    author: "Sophia Laurent • Design & Culture Editor",
    readTime: "4 min read",
    image: "images/travel.JPG",
    quote: "Luxury is not excess. True luxury is space, peace of mind, and environments that elevate your soul.",
    paragraphs: [
      "Curated living is the deliberate selection of what enters your life — from the architecture of your home to the books on your nightstand and the places you travel.",
      "When your environment reflects tranquility and intentional craftsmanship, your mental bandwidth expands. Quality always outshines quantity.",
      "LiveGreater explores spaces and rituals designed to inspire clarity, foster creative breakthroughs, and celebrate the beauty of everyday presence."
    ]
  },
  "fashion": {
    category: "Fashion & Art",
    title: "The Canvas of Identity: Couture Meets Contemporary Expression",
    author: "Amina Diallo • Creative Director",
    readTime: "5 min read",
    image: "images/fashion.JPG",
    quote: "Fashion is architecture you wear. Art is the voice you leave behind.",
    paragraphs: [
      "Aesthetic expression is one of the most immediate languages of human culture. What we wear and what we create visually communicates who we are and what we stand for.",
      "The contemporary fashion landscape is undergoing a profound renaissance, blending heritage craft with futuristic silhouettes and sustainable materials.",
      "At LiveGreater, we spotlight designers and artists who challenge conformity, transforming clothing and galleries into platforms of radical storytelling."
    ]
  },
  "influence": {
    category: "Influence",
    title: "The Architecture of Authentic Impact",
    author: "Luigi Derbyshire & Editorial Board",
    readTime: "6 min read",
    image: "images/influence.JPG",
    quote: "True leadership is measured not by how many follow you, but by how many you empower to lead.",
    paragraphs: [
      "In a crowded world of algorithms and metrics, authenticity is the rarest and most magnetic commodity.",
      "Influence that matters goes beyond surface vanity: it creates tangible economic opportunity, elevates cultural discourse, and unlocks doors for emerging talent.",
      "When you lead with principle, conviction, and a vision larger than yourself, your resonance becomes timeless."
    ]
  }
};

function initArticleReader() {
  // Inject modal into DOM if not present
  let modal = document.getElementById("articleReaderModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "articleReaderModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-dialog">
        <button class="modal-close" aria-label="Close reader">&times;</button>
        <img class="modal-hero" src="" alt="Article feature">
        <div class="modal-body">
          <div class="article-meta">
            <span class="article-category">Feature</span>
            <span class="article-readtime"><i class="far fa-clock"></i> 5 min read</span>
          </div>
          <h2>Article Title</h2>
          <div class="article-byline">By LiveGreater Editorial</div>
          <div class="article-text"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const closeBtn = modal.querySelector(".modal-close");
  const heroImg = modal.querySelector(".modal-hero");
  const categoryPill = modal.querySelector(".article-category");
  const readtimeSpan = modal.querySelector(".article-readtime");
  const titleEl = modal.querySelector("h2");
  const bylineEl = modal.querySelector(".article-byline");
  const textEl = modal.querySelector(".article-text");

  function openArticle(key, customData = null) {
    const data = customData || ARTICLES_DATABASE[key] || ARTICLES_DATABASE["exclusive"];

    // Detect path depth (subfolder vs root)
    const isSubfolder = window.location.pathname.includes("/html codes/") || window.location.pathname.includes("/html%20codes/");
    const imgPrefix = isSubfolder ? "../" : "";

    let finalImg = data.image;
    if (finalImg && !finalImg.startsWith("http") && !finalImg.startsWith("../") && isSubfolder) {
      finalImg = "../" + finalImg;
    }

    heroImg.src = finalImg || (isSubfolder ? "../images/exclusive.JPG" : "images/exclusive.JPG");
    categoryPill.textContent = data.category || "Feature";
    readtimeSpan.innerHTML = `<i class="far fa-clock"></i> ${data.readTime || "5 min read"}`;
    titleEl.textContent = data.title;
    bylineEl.textContent = data.author || "By LiveGreater Editorial";

    let bodyHTML = "";
    if (data.quote) {
      bodyHTML += `<div class="article-quote">"${data.quote}"</div>`;
    }
    if (data.paragraphs && Array.isArray(data.paragraphs)) {
      bodyHTML += data.paragraphs.map(p => `<p>${p}</p>`).join("");
    } else if (data.content) {
      bodyHTML += `<p>${data.content}</p>`;
    } else {
      bodyHTML += `<p>Full digital issue coverage coming in LiveGreater Release 1.0.</p>`;
    }

    textEl.innerHTML = bodyHTML;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Attach to Read Exclusive & Read Article buttons
  document.querySelectorAll(".exclusive button, .primary-btn, button[onclick*='location']").forEach(btn => {
    btn.removeAttribute("onclick");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Determine article from context
      const pagePath = window.location.pathname.toLowerCase();
      if (pagePath.includes("sport")) openArticle("mohale");
      else if (pagePath.includes("health")) openArticle("health");
      else if (pagePath.includes("insp")) openArticle("inspiration");
      else if (pagePath.includes("entrepreneur")) openArticle("entrepreneurship");
      else if (pagePath.includes("lifestyle")) openArticle("lifestyle");
      else if (pagePath.includes("fashion")) openArticle("fashion");
      else if (pagePath.includes("influence")) openArticle("influence");
      else openArticle("exclusive");
    });
  });

  // Attach to Slider Cards
  document.querySelectorAll(".card").forEach((card, idx) => {
    card.addEventListener("click", () => {
      const cardTitle = card.querySelector("h4")?.textContent || "Story";
      const cardDesc = card.querySelector("p")?.textContent || "";
      const cardImg = card.querySelector("img")?.getAttribute("src") || "";

      openArticle(null, {
        category: "Magazine Issue",
        title: cardTitle,
        author: "LiveGreater Editorial • Curated Series",
        readTime: "4 min read",
        image: cardImg,
        quote: cardDesc,
        paragraphs: [
          `This story explores the core dynamics of ${cardTitle.toLowerCase()} — examining how elite visionaries cultivate daily mastery and lead transformative movements.`,
          `${cardDesc} At LiveGreater Magazine, we delve into the untold aspects of the journey, highlighting tactical intelligence, emotional fortitude, and relentless drive.`,
          "Explore the complete issue releases by subscribing to our VIP circle below or exploring related categories across the magazine."
        ]
      });
    });
  });
}

/* ==========================================================================
   4. NEWSLETTER SUBSCRIPTION (Phase 1 Deliverable)
   ========================================================================== */
function initNewsletter() {
  // Inject newsletter section into page if not already present before footer
  const footer = document.querySelector("footer");
  if (footer && !document.querySelector(".newsletter-section")) {
    const newsletter = document.createElement("section");
    newsletter.className = "newsletter-section";
    newsletter.innerHTML = `
      <div class="newsletter-content">
        <span class="feature-badge"><i class="fas fa-crown"></i> VIP CIRCLE</span>
        <h3>Join the LiveGreater Circle</h3>
        <p>Subscribe to receive priority access to new magazine issues, exclusive editorial drops, and founder interviews.</p>
        <form class="newsletter-form" id="newsletterForm">
          <input type="email" placeholder="Enter your email address" required aria-label="Email address">
          <button type="submit"><i class="fas fa-paper-plane"></i> Subscribe</button>
        </form>
        <div class="newsletter-note">Zero spam. Pure editorial inspiration. Unsubscribe anytime.</div>
      </div>
    `;
    footer.parentNode.insertBefore(newsletter, footer);
  }

  const form = document.getElementById("newsletterForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      const email = input.value.trim();
      if (!email) return;

      const subscribers = JSON.parse(localStorage.getItem("livegreater_subscribers") || "[]");
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem("livegreater_subscribers", JSON.stringify(subscribers));
      }

      input.value = "";
      showToast("Welcome to LiveGreater! You're now subscribed to issue releases.", "fa-check-circle");
    });
  }
}

/* ==========================================================================
   5. ADMIN PORTAL MODAL (Phase 1 Deliverable)
   ========================================================================== */
function initAdminPortal() {
  // Add Admin Portal link in nav actions or footer
  const nav = document.querySelector("nav");
  if (nav && !document.querySelector(".admin-nav-btn")) {
    const adminBtn = document.createElement("button");
    adminBtn.className = "admin-nav-btn";
    adminBtn.innerHTML = '<i class="fas fa-lock"></i> Admin';
    adminBtn.title = "LiveGreater Publisher Admin Portal";
    adminBtn.addEventListener("click", openAdminModal);
    nav.appendChild(adminBtn);
  }

  let adminModal = document.getElementById("adminPortalModal");
  if (!adminModal) {
    adminModal = document.createElement("div");
    adminModal.id = "adminPortalModal";
    adminModal.className = "modal-overlay";
    adminModal.innerHTML = `
      <div class="modal-dialog">
        <button class="modal-close" aria-label="Close admin portal">&times;</button>
        <div class="modal-body" style="padding-top: 28px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div>
              <span class="article-category">Publisher Studio</span>
              <h2 style="margin-top: 6px;">LiveGreater Admin Portal</h2>
            </div>
            <span style="font-size: 0.85rem; color: #00ff99; background: rgba(0,255,153,0.1); padding: 4px 12px; border-radius: 20px;">
              <i class="fas fa-circle" style="font-size: 0.6rem;"></i> Phase 1 System Live
            </span>
          </div>

          <div class="admin-tabs">
            <button class="admin-tab active" data-tab="dashboard">Dashboard</button>
            <button class="admin-tab" data-tab="upload">Upload Article</button>
            <button class="admin-tab" data-tab="subscribers">Subscribers</button>
          </div>

          <!-- TAB 1: DASHBOARD -->
          <div class="tab-content active" id="tab-dashboard">
            <div class="admin-stat-grid">
              <div class="stat-box">
                <div class="num" id="statSubscribersCount">0</div>
                <div class="lbl">Active Subscribers</div>
              </div>
              <div class="stat-box">
                <div class="num">8</div>
                <div class="lbl">Published Sections</div>
              </div>
              <div class="stat-box">
                <div class="num">100%</div>
                <div class="lbl">Platform Health</div>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);">
              <h4 style="margin-bottom: 8px;"><i class="fas fa-info-circle"></i> Project Status: Phase 1 Launch</h4>
              <p style="color: var(--text-muted); font-size: 0.92rem; line-height: 1.5;">
                Client: Luigi Derbyshire • Platform: LiveGreater Magazine • Developed by Tshiamo Mafojane (Richeey Designs).
                All core magazine categories, mobile navigation, responsive sliders, reading modals, and subscriber collection are fully integrated.
              </p>
            </div>
          </div>

          <!-- TAB 2: UPLOAD ARTICLE -->
          <div class="tab-content" id="tab-upload">
            <form id="articleUploadForm">
              <div class="form-group">
                <label>Article Title</label>
                <input type="text" placeholder="e.g. The Science of High Performance" required id="artTitle">
              </div>
              <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <div class="form-group" style="flex: 1;">
                  <label>Category</label>
                  <select id="artCategory">
                    <option>Inspiration</option>
                    <option>Health</option>
                    <option>Sports</option>
                    <option>Influence</option>
                    <option>Entrepreneurship</option>
                    <option>Lifestyle</option>
                    <option>Fashion & Art</option>
                  </select>
                </div>
                <div class="form-group" style="flex: 1;">
                  <label>Author</label>
                  <input type="text" placeholder="e.g. Luigi Derbyshire" value="Luigi Derbyshire" id="artAuthor">
                </div>
              </div>
              <div class="form-group">
                <label>Article Lead / Summary</label>
                <textarea rows="3" placeholder="Brief editorial synopsis..." id="artSummary"></textarea>
              </div>
              <button type="submit" class="primary-btn" style="width: 100%; justify-content: center;">
                <i class="fas fa-cloud-upload-alt"></i> Publish Draft to Magazine
              </button>
            </form>
          </div>

          <!-- TAB 3: SUBSCRIBERS -->
          <div class="tab-content" id="tab-subscribers">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <h4>Subscriber List (Local Database)</h4>
              <button id="clearSubsBtn" style="background: none; border: 1px solid rgba(255,255,255,0.2); color: var(--text-muted); padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; cursor: pointer;">
                Clear All
              </button>
            </div>
            <div style="overflow-x: auto; max-height: 250px;">
              <table class="subscribers-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="subscribersTableBody">
                  <tr>
                    <td colspan="3" style="text-align: center; color: var(--text-muted);">No subscribers yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    `;
    document.body.appendChild(adminModal);
  }

  const closeBtn = adminModal.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => adminModal.classList.remove("active"));
  adminModal.addEventListener("click", (e) => {
    if (e.target === adminModal) adminModal.classList.remove("active");
  });

  // Tab switching
  const tabs = adminModal.querySelectorAll(".admin-tab");
  const contents = adminModal.querySelectorAll(".tab-content");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      const target = adminModal.querySelector(`#tab-${tab.dataset.tab}`);
      if (target) target.classList.add("active");
    });
  });

  // Handle article draft submit
  const uploadForm = adminModal.querySelector("#articleUploadForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = adminModal.querySelector("#artTitle").value;
      const cat = adminModal.querySelector("#artCategory").value;
      showToast(`Article "${title}" published draft to ${cat}!`, "fa-check");
      uploadForm.reset();
    });
  }

  // Handle clear subscribers
  const clearSubsBtn = adminModal.querySelector("#clearSubsBtn");
  if (clearSubsBtn) {
    clearSubsBtn.addEventListener("click", () => {
      localStorage.removeItem("livegreater_subscribers");
      refreshSubscribersList();
      showToast("Subscriber list cleared.", "fa-trash");
    });
  }

  function openAdminModal() {
    refreshSubscribersList();
    adminModal.classList.add("active");
  }

  function refreshSubscribersList() {
    const subs = JSON.parse(localStorage.getItem("livegreater_subscribers") || '["luigi@livegreater.com", "editorial@richeeydesigns.com"]');
    const tbody = adminModal.querySelector("#subscribersTableBody");
    const countEl = adminModal.querySelector("#statSubscribersCount");

    if (countEl) countEl.textContent = subs.length;

    if (!subs.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px;">No subscribers registered yet.</td></tr>';
      return;
    }

    tbody.innerHTML = subs.map((email, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${email}</td>
        <td><span style="color: #00ff99; font-size: 0.8rem;"><i class="fas fa-check"></i> Subscribed</span></td>
      </tr>
    `).join("");
  }
}

/* ==========================================================================
   6. FOOTER MODALS (About Us / Contact Us)
   ========================================================================== */
function initFooterModals() {
  document.querySelectorAll("footer .footer-links a").forEach(link => {
    link.addEventListener("click", (e) => {
      const text = link.textContent.trim().toLowerCase();
      if (text.includes("about") || text.includes("contact") || text.includes("services") || text.includes("portfolio")) {
        e.preventDefault();
        openAboutContactModal(text);
      }
    });
  });

  function openAboutContactModal(type) {
    let modal = document.getElementById("infoModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "infoModal";
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="modal-dialog">
          <button class="modal-close" aria-label="Close info modal">&times;</button>
          <div class="modal-body" style="padding-top: 32px;">
            <span class="article-category">LiveGreater Information</span>
            <h2 id="infoTitle" style="margin-top: 8px;">About Us</h2>
            <div id="infoContent" style="color: rgba(255,255,255,0.85); line-height: 1.8; margin-top: 16px;"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector(".modal-close").addEventListener("click", () => modal.classList.remove("active"));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
      });
    }

    const titleEl = modal.querySelector("#infoTitle");
    const contentEl = modal.querySelector("#infoContent");

    if (type.includes("about")) {
      titleEl.textContent = "About LiveGreater Magazine";
      contentEl.innerHTML = `
        <p><strong>LiveGreater Magazine</strong> is a premier digital publication platform focused on inspiration, lifestyle, influence, and exclusive editorial storytelling.</p>
        <p>Founded by <strong>Luigi Derbyshire</strong> and developed in partnership with <strong>Tshiamo Mafojane (Richeey Designs)</strong>, the magazine spotlights visionary thinkers, elite athletes, cultural pioneers, and bold entrepreneurs shaping our collective future.</p>
        <p>Our editorial mandate is uncompromising: to deliver high-aesthetic stories that inspire growth, elevate mindset, and push culture forward.</p>
      `;
    } else if (type.includes("contact")) {
      titleEl.textContent = "Contact Editorial & Inquiries";
      contentEl.innerHTML = `
        <p>Have an editorial pitch, sponsorship inquiry, or partnership opportunity? Reach out to the LiveGreater team:</p>
        <div style="background: rgba(255,255,255,0.05); padding: 18px; border-radius: 12px; margin: 16px 0;">
          <p><i class="fas fa-envelope" style="color: var(--primary); margin-right: 10px;"></i> <strong>Editorial:</strong> editorial@livegreater.com</p>
          <p><i class="fas fa-crown" style="color: var(--primary); margin-right: 10px;"></i> <strong>Publisher:</strong> luigi@livegreater.com</p>
          <p><i class="fas fa-code" style="color: var(--primary); margin-right: 10px;"></i> <strong>Development:</strong> Tshiamo Mafojane (Richeey Designs)</p>
        </div>
      `;
    } else {
      titleEl.textContent = "LiveGreater Services & Portfolio";
      contentEl.innerHTML = `
        <p>LiveGreater Magazine provides bespoke multimedia editorial publishing, brand collaborations, executive features, and curated digital drops.</p>
        <p>Designed and engineered by Richeey Designs, our digital architecture supports scalable publication, multimedia features, subscriber pipelines, and monetized digital issues.</p>
      `;
    }

    modal.classList.add("active");
  }
}

/* ==========================================================================
   7. TOAST NOTIFICATION UTILITY
   ========================================================================== */
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
