/* ==========================================================================
   LIVEGREATER MAGAZINE - CORE PLATFORM JAVASCRIPT
   Prepared for Luigi Derbyshire | Developed by Richeey Designs
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  seedInitialData();
  renderDynamicCoverPage();
  initSlider();
  initMobileNav();
  initArticleReader();
  initGatekeeperModal();
  initArticleInteractions();
  initHeaderAuth();
  initNewsletter();
  initFloatingWhatsApp();
  initFooterModals();
});

/* ==========================================================================
   0. PRE-SEED ESSENTIAL CREDENTIALS & VIP TEST PROFILES
   ========================================================================== */
function seedInitialData() {
  // Master Admin defaults
  if (!localStorage.getItem("livegreater_admin_password")) {
    localStorage.setItem("livegreater_admin_password", "LiveGreater#2026");
  }
  if (!localStorage.getItem("livegreater_admin_email")) {
    localStorage.setItem("livegreater_admin_email", "admin@livegreater.com");
  }

  // Pre-seed VIP Premium User: richeey4@gmail.com with password 1213
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

  // Ensure added to subscribers
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

function getMasterAdminPassword() {
  return localStorage.getItem("livegreater_admin_password") || "LiveGreater#2026";
}

function getMasterAdminEmail() {
  return localStorage.getItem("livegreater_admin_email") || "admin@livegreater.com";
}

function getAuthUser() {
  const isAdmin = (localStorage.getItem("livegreater_admin_logged_in") === "true") ||
                  (sessionStorage.getItem("livegreater_admin_logged_in") === "true");

  let vipUser = null;
  try {
    vipUser = JSON.parse(localStorage.getItem("livegreater_vip_user") || sessionStorage.getItem("livegreater_vip_user") || "null");
  } catch (e) {
    vipUser = null;
  }

  if (isAdmin) {
    return {
      name: "Luigi Derbyshire",
      email: "admin@livegreater.com",
      tier: "Publisher Admin",
      isAdmin: true,
      isVip: true
    };
  }

  if (vipUser) {
    return {
      name: vipUser.name || "VIP Member",
      email: vipUser.email,
      tier: vipUser.tier || "VIP Premium Member",
      isAdmin: false,
      isVip: true
    };
  }

  return null;
}

function initHeaderAuth() {
  const isSubfolder = window.location.pathname.includes("/html codes/") || window.location.pathname.includes("/html%20codes/");
  const vipUrl = isSubfolder ? "../vip.html" : "vip.html";
  const adminUrl = isSubfolder ? "../admin.html" : "admin.html";

  const vipNavBtn = document.querySelector(".vip-nav-btn");
  if (!vipNavBtn) return;

  const user = getAuthUser();
  if (user) {
    if (user.isAdmin) {
      vipNavBtn.href = adminUrl;
      vipNavBtn.innerHTML = `<i class="fas fa-shield-alt"></i> Studio (Admin)`;
      vipNavBtn.style.background = "rgba(0, 255, 153, 0.15)";
      vipNavBtn.style.borderColor = "rgba(0, 255, 153, 0.35)";
      vipNavBtn.style.color = "#00ff99";
    } else {
      vipNavBtn.href = vipUrl;
      vipNavBtn.innerHTML = `<i class="fas fa-crown"></i> VIP: ${user.name}`;
      vipNavBtn.style.background = "rgba(255, 215, 0, 0.18)";
      vipNavBtn.style.borderColor = "rgba(255, 215, 0, 0.4)";
      vipNavBtn.style.color = "#ffd700";
    }
  } else {
    vipNavBtn.href = vipUrl;
    vipNavBtn.innerHTML = `<i class="fas fa-user-circle"></i> Member Sign In`;
    vipNavBtn.style.background = "rgba(255, 215, 0, 0.15)";
    vipNavBtn.style.borderColor = "rgba(255, 215, 0, 0.35)";
    vipNavBtn.style.color = "#ffd700";
  }
}

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

  sliderWindow.addEventListener("mouseenter", stopAutoSlide);
  sliderWindow.addEventListener("mouseleave", startAutoSlide);

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

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateSlider();
    }, 150);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      slideLeft();
      startAutoSlide();
    } else if (e.key === "ArrowRight") {
      slideRight();
      startAutoSlide();
    }
  });

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

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  document.addEventListener("click", (e) => {
    if (!header.contains(e.target) && nav.classList.contains("nav-open")) {
      nav.classList.remove("nav-open");
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
}

/* ==========================================================================
   3. ARTICLE READER MODAL & ARTICLES DATABASE
   ========================================================================== */
const ARTICLES_DATABASE = {
  "exclusive": {
    category: "Exclusive Feature",
    title: "Inside the Minds of Creators Shaping Culture",
    author: "Luigi Derbyshire • Founder & Editor-in-Chief",
    readTime: "6 min read",
    tier: "VIP Exclusive",
    layoutStyle: "editorial-spread",
    image: "images/exclusive.JPG",
    quote: "True influence is never about noise — it is about the quiet gravity of undeniable execution.",
    paragraphs: [
      "In an era where attention is fleeting and digital noise is at an all-time peak, the creators who truly endure are those with an unwavering commitment to depth. LiveGreater was founded by Luigi Derbyshire on the belief that greatness is not an accidental milestone, but a rigorous, daily discipline.",
      "Across design, business, athletics, and the arts, visionaries operate under a fundamentally distinct framework: they don't react to current culture, they construct its next iteration. Stay ahead, with LiveGreater.",
      "When we speak to founders and creators across South Africa and the globe, a recurring pattern emerges: relentless elimination of distraction, extreme clarity of purpose, and an appetite for calculated risk."
    ],
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
  "mohale": {
    category: "Sports",
    title: "Redefining Elite: Mohale Thekiso",
    author: "Tshiamo Richeey Mafojane • Sports & Performance Editor",
    readTime: "5 min read",
    tier: "All Readers",
    layoutStyle: "two-column",
    image: "images/sport.JPG",
    quote: "The turf doesn't care about excuses. Every stride either closes the gap to greatness or surrenders it.",
    paragraphs: [
      "Mohale Thekiso is not just an elite hockey talent — he represents a transformative shift in athletic mindset, tactical poise, and leadership under pressure.",
      "From grueling dawn training sessions to international high-stakes fixtures, Mohale plays with an instinctive precision. His stick handling is fluid, but behind that effortless aesthetic lies thousands of hours of calculated repetition.",
      "Beyond the game itself, Mohale is rewriting what it means to be a modern African athlete: articulate, culturally grounded, and relentlessly ambitious."
    ],
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
  "health": {
    category: "Health & Vitality",
    title: "Peak Performance: Habits for Mind & Body Mastery",
    author: "Dr. Elena Vance • Wellness & Human Optimization",
    readTime: "4 min read",
    tier: "All Readers",
    layoutStyle: "alternating",
    image: "images/health.JPG",
    quote: "Energy is your highest currency. Guard your biology with the same vigilance you guard your vision.",
    paragraphs: [
      "Modern peak performance is not about pushing until burnout; it is about calibrating recovery, nutrition, and nervous system regulation to sustain high output year-round.",
      "When you master sleep architecture, zone-2 cardiovascular conditioning, and clean whole-food fueling, cognitive clarity naturally compounds. Stress shifts from an obstacle to an adaptive stimulus.",
      "Longevity is built in the micro-decisions: the hydration upon waking, the intentional stillness before meetings, and the discipline to disconnect when the work is complete."
    ],
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
  "inspiration": {
    category: "Inspiration",
    title: "The Architecture of Unshakeable Purpose",
    author: "LiveGreater Editorial Board",
    readTime: "5 min read",
    tier: "All Readers",
    layoutStyle: "editorial-spread",
    image: "images/insp1.JPG",
    quote: "When purpose is clear, every setback transforms from an interruption into essential training.",
    paragraphs: [
      "Growth demands friction. No individual ever built an extraordinary life by remaining comfortable in familiar environments.",
      "To live greater means embracing the discomfort of uncharted territory. It requires an internal compass that remains steady regardless of external opinions or temporary delays.",
      "Your story is still being drafted. Choose courage over complacency, surround yourself with minds that challenge your ceiling, and commit to the relentless pursuit of your potential."
    ],
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
  "entrepreneurship": {
    category: "Entrepreneurship",
    title: "Building Beyond Limits: Blueprints for Scalable Impact",
    author: "Marcus Chen • Capital & Strategy Contributor",
    readTime: "7 min read",
    tier: "VIP Exclusive",
    layoutStyle: "two-column",
    image: "images/entrepreneur.JPG",
    quote: "Founders don't chase trends — they solve genuine friction and build systems that outlive hype.",
    paragraphs: [
      "Building a scalable business requires an uncommon blend of patience and urgency. Speed in execution, patience in compounding value.",
      "The founders spotlighted in LiveGreater Magazine understand that sustainable competitive advantage is built on defensible culture, rigorous cash flow discipline, and deep customer empathy.",
      "As capital markets evolve, the companies that emerge victorious will not be the loudest, but the most resilient and operationally sound."
    ],
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
  "lifestyle": {
    category: "Lifestyle",
    title: "The Art of Curated Living",
    author: "Sophia Laurent • Design & Culture Editor",
    readTime: "4 min read",
    tier: "All Readers",
    layoutStyle: "alternating",
    image: "images/travel.JPG",
    quote: "Luxury is not excess. True luxury is space, peace of mind, and environments that elevate your soul.",
    paragraphs: [
      "Curated living is the deliberate selection of what enters your life — from the architecture of your home to the books on your nightstand and the places you travel.",
      "When your environment reflects tranquility and intentional craftsmanship, your mental bandwidth expands. Quality always outshines quantity.",
      "LiveGreater explores spaces and rituals designed to inspire clarity, foster creative breakthroughs, and celebrate the beauty of everyday presence."
    ],
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
  "fashion": {
    category: "Fashion & Art",
    title: "The Canvas of Identity: Couture Meets Contemporary Expression",
    author: "Amina Diallo • Creative Director",
    readTime: "5 min read",
    tier: "All Readers",
    layoutStyle: "photojournalism",
    image: "images/fashion.JPG",
    quote: "Fashion is architecture you wear. Art is the voice you leave behind.",
    paragraphs: [
      "Aesthetic expression is one of the most immediate languages of human culture. What we wear and what we create visually communicates who we are and what we stand for.",
      "The contemporary fashion landscape is undergoing a profound renaissance, blending heritage craft with futuristic silhouettes and sustainable materials.",
      "At LiveGreater, we spotlight designers and artists who challenge conformity, transforming clothing and galleries into platforms of radical storytelling."
    ],
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
  "influence": {
    category: "Influence",
    title: "The Architecture of Authentic Impact",
    author: "Luigi Derbyshire & Editorial Board",
    readTime: "6 min read",
    tier: "VIP Exclusive",
    layoutStyle: "editorial-spread",
    image: "images/influence.JPG",
    quote: "True leadership is measured not by how many follow you, but by how many you empower to lead.",
    paragraphs: [
      "In a crowded world of algorithms and metrics, authenticity is the rarest and most magnetic commodity.",
      "Influence that matters goes beyond surface vanity: it creates tangible economic opportunity, elevates cultural discourse, and unlocks doors for emerging talent.",
      "When you lead with principle, conviction, and a vision larger than yourself, your resonance becomes timeless."
    ],
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
};

function initArticleReader() {
  let modal = document.getElementById("articleReaderModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "articleReaderModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-dialog mag-modal-dialog">
        <button class="modal-close" aria-label="Close reader">&times;</button>
        <div class="mag-hero-cover">
          <img class="modal-hero" src="" alt="Article feature">
          <div class="mag-hero-overlay">
            <div id="modalVipUnlockedBanner" style="display: none;" class="vip-unlocked-banner">
              <i class="fas fa-crown"></i>
              <span id="modalVipUnlockedText">Exclusive VIP Feature • Unlocked</span>
            </div>
            <div class="article-meta">
              <span class="article-category">Feature</span>
              <span class="article-readtime"><i class="far fa-clock"></i> 5 min read</span>
            </div>
            <h2 class="mag-title">Article Title</h2>
          </div>
        </div>
        <div class="modal-body mag-reader-body">
          <div class="mag-byline-bar">
            <div>By <span class="mag-byline-author article-byline">LiveGreater Editorial</span></div>
            <div class="mag-meta-tag" style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-book-open" style="color: #ffd700;"></i> Digital Magazine Edition
            </div>
          </div>
          <div class="mag-quote-box" id="magQuoteBox" style="display: none;"></div>
          <div class="article-text mag-content-flow"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Create Lightbox Modal if not present
  let lightbox = document.getElementById("magLightboxOverlay");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "magLightboxOverlay";
    lightbox.className = "mag-lightbox-overlay";
    lightbox.innerHTML = `
      <div class="mag-lightbox-dialog">
        <button class="mag-lightbox-close" id="magLightboxCloseBtn" aria-label="Close zoomed photo">&times;</button>
        <img id="magLightboxImg" src="" alt="Zoomed magazine artwork">
        <div id="magLightboxCaption" class="mag-caption" style="margin-top: 10px; border-radius: 8px;"></div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const lbCloseBtn = lightbox.querySelector("#magLightboxCloseBtn");
    function closeLightbox() {
      lightbox.classList.remove("active");
    }
    if (lbCloseBtn) lbCloseBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
      }
    });
  }

  const closeBtn = modal.querySelector(".modal-close");
  const heroImg = modal.querySelector(".modal-hero");
  const categoryPill = modal.querySelector(".article-category");
  const readtimeSpan = modal.querySelector(".article-readtime");
  const titleEl = modal.querySelector(".mag-title");
  const bylineEl = modal.querySelector(".article-byline");
  const textEl = modal.querySelector(".article-text");
  const quoteBox = modal.querySelector("#magQuoteBox");
  const vipBanner = modal.querySelector("#modalVipUnlockedBanner");
  const vipBannerText = modal.querySelector("#modalVipUnlockedText");
  const modalDialog = modal.querySelector(".mag-modal-dialog");

  window.openArticleModal = function(key, customData = null, isExclusive = false) {
    const isSubfolder = window.location.pathname.includes("/html codes/") || window.location.pathname.includes("/html%20codes/");

    // 1. Resolve article data
    let data = customData;
    if (!data && key) {
      // Check custom articles from local storage
      const customList = JSON.parse(localStorage.getItem("livegreater_custom_articles") || "[]");
      const foundCustom = customList.find(a => a.id === key || (a.title && a.title.toLowerCase().includes(key.toLowerCase())));
      if (foundCustom) {
        data = foundCustom;
      } else {
        data = ARTICLES_DATABASE[key] || ARTICLES_DATABASE["exclusive"];
      }
    } else if (customData && customData.title) {
      // If customData was provided from card click, check if full article exists in ARTICLES_DATABASE or customList
      const customList = JSON.parse(localStorage.getItem("livegreater_custom_articles") || "[]");
      const match = customList.find(a => a.title.toLowerCase() === customData.title.toLowerCase()) ||
                    Object.values(ARTICLES_DATABASE).find(a => a.title.toLowerCase() === customData.title.toLowerCase());
      if (match) {
        data = match;
      }
    }

    if (!data) data = ARTICLES_DATABASE["exclusive"];

    function fixPath(imgPath) {
      if (!imgPath) return isSubfolder ? "../images/exclusive.JPG" : "images/exclusive.JPG";
      if (imgPath.startsWith("data:") || imgPath.startsWith("http") || imgPath.startsWith("//")) return imgPath;
      if (isSubfolder && !imgPath.startsWith("../")) return "../" + imgPath;
      return imgPath;
    }

    heroImg.src = fixPath(data.image);
    categoryPill.textContent = data.category || "Feature";
    readtimeSpan.innerHTML = `<i class="far fa-clock"></i> ${data.readTime || "5 min read"}`;
    titleEl.textContent = data.title;
    bylineEl.textContent = data.author || "By LiveGreater Editorial";

    if (isExclusive) {
      const user = getAuthUser();
      const userName = user ? user.name : "VIP Member";
      vipBanner.style.display = "flex";
      vipBannerText.textContent = `Exclusive VIP Feature • Unlocked for ${userName}`;
    } else {
      vipBanner.style.display = "none";
    }

    // Pull Quote
    if (data.quote && quoteBox) {
      quoteBox.innerHTML = `"${escapeHtml(data.quote)}"`;
      quoteBox.style.display = "block";
    } else if (quoteBox) {
      quoteBox.style.display = "none";
    }

    // Layout class
    const layout = data.layoutStyle || "editorial-spread";
    if (modalDialog) {
      modalDialog.classList.remove("mag-layout-editorial", "mag-layout-twocol", "mag-layout-alternating", "mag-layout-photojournalism");
      if (layout === "two-column") {
        modalDialog.classList.add("mag-layout-twocol");
      } else if (layout === "alternating") {
        modalDialog.classList.add("mag-layout-alternating");
      } else if (layout === "photojournalism") {
        modalDialog.classList.add("mag-layout-photojournalism");
      } else {
        modalDialog.classList.add("mag-layout-editorial");
      }
    }

    // Normalize sections
    let sections = [];
    if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
      sections = data.sections;
    } else if (data.paragraphs && Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
      sections = data.paragraphs.map((p, idx) => ({
        subtitle: "",
        paragraph: p,
        image: idx === 1 ? (data.image || "") : "",
        caption: "",
        placement: "full"
      }));
    } else if (data.content) {
      const parts = data.content.split(/\n\n+/).filter(Boolean);
      sections = parts.map((p, idx) => ({
        subtitle: "",
        paragraph: p,
        image: idx === 1 ? (data.image || "") : "",
        caption: "",
        placement: "full"
      }));
    } else {
      sections = [{
        subtitle: "",
        paragraph: "Stay ahead, with LiveGreater Magazine.",
        image: "",
        caption: "",
        placement: "full"
      }];
    }

    // Render sections according to layout
    let html = "";
    sections.forEach((sec, idx) => {
      const isFirst = (idx === 0);
      const secImg = sec.image ? fixPath(sec.image) : "";
      const captionText = sec.caption ? escapeHtml(sec.caption) : "";
      const subtitleHTML = sec.subtitle ? `<h3 class="mag-section-heading">${escapeHtml(sec.subtitle)}</h3>` : "";
      const pClass = isFirst ? "mag-text-p first-p" : "mag-text-p";
      const pHTML = `<p class="${pClass}">${escapeHtml(sec.paragraph)}</p>`;

      if (layout === "two-column") {
        html += `
          <div class="mag-section-block ${idx % 2 === 1 ? 'reverse' : ''}">
            <div class="mag-twocol-text">
              ${subtitleHTML}
              ${pHTML}
            </div>
            ${secImg ? `
              <figure class="mag-figure full-width" style="margin: 0;">
                <img src="${secImg}" alt="${captionText || data.title}" class="mag-zoomable-img" data-caption="${captionText}">
                ${captionText ? `<figcaption class="mag-caption"><i class="fas fa-camera"></i> ${captionText}</figcaption>` : ''}
              </figure>
            ` : '<div style="display: none;"></div>'}
          </div>
        `;
      } else if (layout === "alternating") {
        const floatClass = sec.placement === "float-left" || (idx % 2 === 1 && sec.placement !== "float-right") ? "float-left" : "float-right";
        html += `
          <div class="mag-section-block mag-clearfix">
            ${secImg ? `
              <figure class="mag-figure ${floatClass}">
                <img src="${secImg}" alt="${captionText || data.title}" class="mag-zoomable-img" data-caption="${captionText}">
                ${captionText ? `<figcaption class="mag-caption"><i class="fas fa-camera"></i> ${captionText}</figcaption>` : ''}
              </figure>
            ` : ''}
            ${subtitleHTML}
            ${pHTML}
          </div>
        `;
      } else if (layout === "photojournalism") {
        html += `
          <div class="mag-section-block" style="text-align: center;">
            ${subtitleHTML}
            ${secImg ? `
              <figure class="mag-figure centered">
                <img src="${secImg}" alt="${captionText || data.title}" class="mag-zoomable-img" data-caption="${captionText}">
                ${captionText ? `<figcaption class="mag-caption" style="justify-content: center;"><i class="fas fa-camera"></i> ${captionText}</figcaption>` : ''}
              </figure>
            ` : ''}
            <div style="text-align: left; max-width: 820px; margin: 0 auto;">
              ${pHTML}
            </div>
          </div>
        `;
      } else {
        // editorial-spread (default)
        html += `
          <div class="mag-section-block">
            ${subtitleHTML}
            ${pHTML}
            ${secImg ? `
              <figure class="mag-figure full-width">
                <img src="${secImg}" alt="${captionText || data.title}" class="mag-zoomable-img" data-caption="${captionText}">
                ${captionText ? `<figcaption class="mag-caption"><i class="fas fa-camera"></i> ${captionText}</figcaption>` : ''}
              </figure>
            ` : ''}
          </div>
        `;
      }
    });

    textEl.innerHTML = html;

    // Attach click-to-zoom Lightbox handlers
    textEl.querySelectorAll(".mag-zoomable-img").forEach(img => {
      img.addEventListener("click", () => {
        const lbImg = document.getElementById("magLightboxImg");
        const lbCap = document.getElementById("magLightboxCaption");
        const lb = document.getElementById("magLightboxOverlay");
        if (lbImg) lbImg.src = img.src;
        if (lbCap) {
          const cap = img.getAttribute("data-caption");
          if (cap) {
            lbCap.innerHTML = `<i class="fas fa-camera" style="color: #ffd700; margin-right: 8px;"></i> ${cap}`;
            lbCap.style.display = "flex";
          } else {
            lbCap.style.display = "none";
          }
        }
        if (lb) lb.classList.add("active");
      });
    });

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

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
}

/* ==========================================================================
   4. VIP GATEKEEPER MODAL FOR BIG EXCLUSIVE ARTICLES
   ========================================================================== */
let pendingExclusiveKey = "exclusive";

function initGatekeeperModal() {
  let modal = document.getElementById("exclusiveGatekeeperModal");
  if (modal) return;

  const isSubfolder = window.location.pathname.includes("/html codes/") || window.location.pathname.includes("/html%20codes/");
  const vipPageUrl = isSubfolder ? "../vip.html" : "vip.html";

  modal = document.createElement("div");
  modal.id = "exclusiveGatekeeperModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-dialog gatekeeper-dialog">
      <button class="modal-close" id="gatekeeperModalCloseBtn" aria-label="Close gatekeeper">&times;</button>
      <div class="modal-body" style="padding: 36px 30px 40px; text-align: center;">
        <div style="width: 68px; height: 68px; margin: 0 auto 16px; border-radius: 50%; background: rgba(255, 215, 0, 0.15); border: 2px solid rgba(255, 215, 0, 0.35); display: flex; align-items: center; justify-content: center; font-size: 1.85rem; color: #ffd700;">
          <i class="fas fa-crown"></i>
        </div>
        <div class="vip-exclusive-badge" style="margin-bottom: 12px;">Exclusive VIP Story</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.65rem; margin-bottom: 10px; color: #fff;">Members Only Feature</h3>
        <p style="color: rgba(255, 255, 255, 0.75); font-size: 0.94rem; line-height: 1.6; margin-bottom: 24px;">
          Our lead cover features are reserved exclusively for <strong>LiveGreater VIP & Premium members</strong>. Sign in below to unlock this story immediately.
        </p>

        <form id="gatekeeperFastLoginForm" style="text-align: left; display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.7); display: block; margin-bottom: 6px;">
              <i class="fas fa-envelope" style="color: #ffd700; margin-right: 6px;"></i> Account Email
            </label>
            <input type="email" id="gatekeeperEmailInput" placeholder="richeey4@gmail.com" required style="width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 10px; color: #fff; font-size: 0.95rem; outline: none; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.7); display: block; margin-bottom: 6px;">
              <i class="fas fa-lock" style="color: #ffd700; margin-right: 6px;"></i> Password
            </label>
            <input type="password" id="gatekeeperPasswordInput" placeholder="Enter password (e.g. 1213)" required style="width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 10px; color: #fff; font-size: 0.95rem; outline: none; box-sizing: border-box;">
          </div>
          <button type="submit" class="primary-btn" style="width: 100%; justify-content: center; background: #ffd700; color: #181203; font-weight: 700; margin-top: 6px; padding: 13px; cursor: pointer; border: none; border-radius: 30px;">
            <i class="fas fa-unlock"></i> Unlock & Read Article
          </button>
        </form>

        <div style="margin-top: 18px; padding: 10px 14px; background: rgba(255, 215, 0, 0.08); border: 1px dashed rgba(255, 215, 0, 0.25); border-radius: 10px; font-size: 0.82rem; color: rgba(255, 255, 255, 0.75);">
          <span style="color: #ffd700; font-weight: 600;"><i class="fas fa-key"></i> VIP Test Member:</span> <code>richeey4@gmail.com</code> | Pass: <code>1213</code>
        </div>

        <div style="margin-top: 20px; font-size: 0.88rem; color: rgba(255,255,255,0.65);">
          Need an account? <a href="${vipPageUrl}" style="color: #ffd700; font-weight: 600; text-decoration: underline;">Join the VIP Circle</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector("#gatekeeperModalCloseBtn");
  const loginForm = modal.querySelector("#gatekeeperFastLoginForm");

  function closeGatekeeper() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeGatekeeper);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeGatekeeper();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeGatekeeper();
    }
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("gatekeeperEmailInput").value.trim().toLowerCase();
    const password = document.getElementById("gatekeeperPasswordInput").value.trim();

    const masterPass = getMasterAdminPassword();
    const masterEmail = getMasterAdminEmail().toLowerCase();

    // 1. Check if Admin logging in
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

      closeGatekeeper();
      initHeaderAuth();
      showToast("Master Access Verified! Exclusive Article Unlocked.", "fa-crown");
      if (typeof window.openArticleModal === "function") {
        window.openArticleModal(pendingExclusiveKey, null, true);
      }
      return;
    }

    // 2. Check VIP / Subscriber account
    const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
    const user = accounts.find(a => a.email && a.email.toLowerCase() === email);

    if (user) {
      if (user.password && user.password !== password) {
        showToast("Incorrect password for " + email, "fa-exclamation-triangle");
        return;
      }
      localStorage.setItem("livegreater_vip_user", JSON.stringify(user));
      sessionStorage.setItem("livegreater_vip_user", JSON.stringify(user));

      closeGatekeeper();
      initHeaderAuth();
      showToast(`VIP Access Verified! Welcome, ${user.name}.`, "fa-crown");
      if (typeof window.openArticleModal === "function") {
        window.openArticleModal(pendingExclusiveKey, null, true);
      }
    } else {
      showToast("Account not found. Please verify email or join VIP Circle.", "fa-exclamation-triangle");
    }
  });

  window.openGatekeeperModal = function(storyKey) {
    pendingExclusiveKey = storyKey || "exclusive";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };
}

/* ==========================================================================
   4.5 DYNAMIC COVER PAGE SYNCHRONIZATION (FROM ADMIN STUDIO)
   ========================================================================== */
function renderDynamicCoverPage() {
  const isHomePage = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/") || window.location.pathname.endsWith("Luigi-Website--VS") || window.location.pathname.endsWith("Luigi-Website--VS/");

  let covers = [];
  try {
    covers = JSON.parse(localStorage.getItem("livegreater_cover_pages") || "[]");
  } catch (e) {
    covers = [];
  }

  // Find active front cover
  let activeCover = covers.find(c => c.isFrontCover);
  if (!activeCover && covers.length > 0) {
    activeCover = covers[0];
  }

  if (activeCover && isHomePage) {
    const exclusiveSection = document.querySelector(".exclusive");
    if (exclusiveSection) {
      const img = exclusiveSection.querySelector("img");
      const badge = exclusiveSection.querySelector(".feature-badge");
      const h3 = exclusiveSection.querySelector("h3");
      const p = exclusiveSection.querySelector("p");

      if (img && activeCover.image) img.src = activeCover.image;
      if (badge && activeCover.badge) badge.innerHTML = `<i class="fas fa-crown"></i> ${escapeHtml(activeCover.badge)}`;
      if (h3 && activeCover.title) h3.textContent = activeCover.title;
      if (p && (activeCover.summary || activeCover.content)) {
        p.textContent = activeCover.summary || (activeCover.content.slice(0, 180) + "...");
      }

      // Register this active cover into the database so reader modal can display full story
      ARTICLES_DATABASE["custom_front_cover"] = {
        category: activeCover.category || "Exclusive Feature",
        title: activeCover.title,
        author: activeCover.author || "Luigi Derbyshire",
        readTime: activeCover.readTime || "6 min read",
        image: activeCover.image || "images/exclusive.JPG",
        quote: activeCover.quote || "",
        paragraphs: activeCover.content ? [activeCover.content] : [activeCover.summary || "Stay Ahead, with LiveGreater."]
      };
    }
  }
}

/* ==========================================================================
   5. ARTICLE INTERACTION HANDLER:
      - BIG ARTICLE (EXCLUSIVE) -> GATED FOR VIP & ADMIN ONLY
      - BOTTOM SLIDESHOW CARDS -> PUBLIC & OPEN TO ANY PERSON
   ========================================================================== */
function initArticleInteractions() {
  function getPageStoryKey() {
    const isHomePage = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/") || window.location.pathname.endsWith("Luigi-Website--VS") || window.location.pathname.endsWith("Luigi-Website--VS/");
    if (isHomePage && ARTICLES_DATABASE["custom_front_cover"]) {
      return "custom_front_cover";
    }

    const pagePath = window.location.pathname.toLowerCase();
    if (pagePath.includes("sport")) return "mohale";
    if (pagePath.includes("health")) return "health";
    if (pagePath.includes("insp")) return "inspiration";
    if (pagePath.includes("entrepreneur")) return "entrepreneurship";
    if (pagePath.includes("lifestyle")) return "lifestyle";
    if (pagePath.includes("fashion")) return "fashion";
    if (pagePath.includes("influence")) return "influence";
    return "exclusive";
  }

  // 1. BIG EXCLUSIVE ARTICLES (Gated for VIP / Admin)
  document.querySelectorAll(".exclusive button, .exclusive .primary-btn").forEach(btn => {
    if (btn.classList.contains("open-article-btn")) return;
    btn.removeAttribute("onclick");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const storyKey = getPageStoryKey();
      const user = getAuthUser();

      if (user) {
        // Authenticated VIP member or Admin -> open full story immediately
        if (typeof window.openArticleModal === "function") {
          window.openArticleModal(storyKey, null, true);
        }
      } else {
        // Unauthenticated guest -> trigger VIP gatekeeper modal
        if (typeof window.openGatekeeperModal === "function") {
          window.openGatekeeperModal(storyKey);
        }
      }
    });
  });

  // 2. BOTTOM SLIDE SHOW CARDS (Open to ANY PERSON freely)
  document.querySelectorAll(".slider-section .card, .card").forEach((card) => {
    card.addEventListener("click", () => {
      const cardTitle = card.querySelector("h4")?.textContent || "Story";
      const cardDesc = card.querySelector("p")?.textContent || "";
      const cardImg = card.querySelector("img")?.getAttribute("src") || "";

      if (typeof window.openArticleModal === "function") {
        window.openArticleModal(null, {
          category: "Magazine Issue",
          title: cardTitle,
          author: "LiveGreater Editorial • Luigi Derbyshire",
          readTime: "4 min read",
          image: cardImg,
          quote: cardDesc,
          paragraphs: [
            `This story explores the core dynamics of ${cardTitle.toLowerCase()} — examining how elite visionaries cultivate daily mastery and stay ahead of culture.`,
            `${cardDesc} Stay ahead, with LiveGreater Magazine. Explore the full catalog by visiting our dedicated VIP Lounge.`
          ]
        }, false); // isExclusive = false -> public for anyone
      }
    });
  });
}

/* ==========================================================================
   6. NEWSLETTER SUBSCRIPTION (AUTO-ENROLLS INTO MAILING SYSTEM)
   ========================================================================== */
function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      const email = input.value.trim().toLowerCase();
      if (!email) return;

      const subscribers = JSON.parse(localStorage.getItem("livegreater_subscribers") || "[]");
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem("livegreater_subscribers", JSON.stringify(subscribers));
      }

      // Also save to member accounts list
      const accounts = JSON.parse(localStorage.getItem("livegreater_member_accounts") || "[]");
      if (!accounts.some(a => a.email && a.email.toLowerCase() === email)) {
        accounts.push({
          name: email.split("@")[0],
          email: email,
          password: "VIP#" + Math.floor(1000 + Math.random() * 9000),
          tier: "VIP Circle",
          status: "Active",
          date: new Date().toISOString().slice(0, 10)
        });
        localStorage.setItem("livegreater_member_accounts", JSON.stringify(accounts));
      }

      input.value = "";
      showToast("Welcome to LiveGreater! You are subscribed to the priority mailing system.", "fa-crown");
    });
  }
}

/* ==========================================================================
   7. FLOATING WHATSAPP BUTTON (0630280064)
   ========================================================================== */
function initFloatingWhatsApp() {
  if (document.querySelector(".whatsapp-float")) return;

  const waBtn = document.createElement("a");
  waBtn.className = "whatsapp-float";
  waBtn.href = "https://wa.me/27630280064";
  waBtn.target = "_blank";
  waBtn.rel = "noopener";
  waBtn.setAttribute("aria-label", "Contact LiveGreater on WhatsApp");
  waBtn.innerHTML = '<i class="fab fa-whatsapp"></i><span class="wa-tooltip">Chat with LiveGreater</span>';
  document.body.appendChild(waBtn);
}

/* ==========================================================================
   8. FOOTER MODALS (About Us / Contact Us)
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
        <p><strong>Tagline:</strong> <em>"Stay Ahead, with LiveGreater"</em></p>
        <p><strong>Owner & Publisher:</strong> Luigi Derbyshire</p>
        <p><strong>Digital Agency & Platform Engineering:</strong> Tshiamo Richeey Mafojane (Richeey Designs)</p>
        <p>Our mandate is uncompromising: to deliver high-aesthetic stories that inspire growth, elevate mindset, and push culture forward.</p>
      `;
    } else if (type.includes("contact")) {
      titleEl.textContent = "Contact Editorial & Inquiries";
      contentEl.innerHTML = `
        <p>Reach out to the LiveGreater team for editorial pitches, VIP inquiries, or partnership opportunities:</p>
        <div style="background: rgba(255,255,255,0.05); padding: 18px; border-radius: 12px; margin: 16px 0;">
          <p><i class="fab fa-whatsapp" style="color: #00ff99; margin-right: 10px;"></i> <strong>WhatsApp:</strong> <a href="https://wa.me/27630280064" target="_blank" style="color: #fff;">+27 63 028 0064 (0630280064)</a></p>
          <p><i class="fab fa-instagram" style="color: #c77dff; margin-right: 10px;"></i> <strong>Instagram:</strong> <a href="https://www.instagram.com/livegreatermagazine?rpxt=MnJ3dDU0cjhucjIx" target="_blank" style="color: #fff;">@livegreatermagazine</a></p>
          <p><i class="fas fa-map-marker-alt" style="color: #ff3344; margin-right: 10px;"></i> <strong>Headquarters:</strong> <a href="https://maps.apple.com/place?address=60%20Wolmarans%20Street,%20Potchefstroom,%20North%20West,%202531,%20South%20Africa&coordinate=-26.716500,27.095500&name=60%20Wolmarans%20Street&map=explore" target="_blank" style="color: #fff;">60 Wolmarans Street, Potchefstroom, North West, 2531, South Africa</a></p>
          <p><i class="fas fa-crown" style="color: #ffd700; margin-right: 10px;"></i> <strong>Publisher:</strong> Luigi Derbyshire</p>
          <p><i class="fas fa-code" style="color: #7b5cff; margin-right: 10px;"></i> <strong>Developer:</strong> Tshiamo Richeey Mafojane (Richeey Designs)</p>
        </div>
      `;
    } else {
      titleEl.textContent = "LiveGreater Services & Portfolio";
      contentEl.innerHTML = `
        <p>LiveGreater Magazine provides bespoke multimedia editorial publishing, brand collaborations, executive features, and curated digital drops.</p>
        <p>Digital Architecture & Development engineered by <strong>Tshiamo Richeey Mafojane (Richeey Designs)</strong>.</p>
      `;
    }

    modal.classList.add("active");
  }
}

/* ==========================================================================
   9. TOAST NOTIFICATION UTILITY
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

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

