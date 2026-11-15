document.addEventListener("DOMContentLoaded", () => {
  // 1. Header Solid Background on Scroll
  const header = document.getElementById("header");
  const onScrollHeader = () => {
    if (header) {
      header.classList.toggle("is-solid", window.scrollY > 24);
    }
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  // 2. Scroll-Spy Navigation
  const navLinks = [...document.querySelectorAll(".header__nav a")];
  const spySections = navLinks.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  if (navLinks.length && spySections.length) {
    const spyObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            navLinks.forEach(link => {
              const matches = link.getAttribute("href") === `#${entry.target.id}`;
              link.classList.toggle("is-active", matches);
            });
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    spySections.forEach(section => spyObserver.observe(section));
  }

  // 3. Scroll Reveal Animations
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 4. Interactive Metric Count-Up Animation (Cubic Ease-Out)
  const animateCounter = el => {
    const targetVal = parseFloat(el.dataset.to);
    const decimals = parseInt(el.dataset.dec || "0", 10);
    const duration = 1500;
    const startTime = performance.now();

    const updateCount = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = targetVal * easeOut;
      el.textContent = current.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = targetVal.toFixed(decimals);
      }
    };
    requestAnimationFrame(updateCount);
  };

  const statCounters = document.querySelectorAll(".stat");
  if (statCounters.length) {
    const statObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".count").forEach(animateCounter);
            statObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    statCounters.forEach(stat => statObserver.observe(stat));
  }

  // 5. Complete Work Archive (Carousel & Grid Navigation)
  const rail = document.getElementById("rail");
  const dotsContainer = document.getElementById("dots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const viewToggleBtn = document.getElementById("viewToggleBtn");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // 6. Project Dossier Drawer Elements
  const drawer = document.getElementById("projectDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");
  const drawerBadge = document.getElementById("drawerBadge");
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerStack = document.getElementById("drawerStack");
  const drawerArchitecture = document.getElementById("drawerArchitecture");
  const drawerImpact = document.getElementById("drawerImpact");
  const drawerLink = document.getElementById("drawerLink");

  const openDrawer = card => {
    if (!drawer) return;
    const idx = card.querySelector(".proj__idx")?.textContent || "PROJECT";
    const name = card.querySelector(".proj__name")?.textContent || "PROJECT DOSSIER";
    const desc = card.querySelector(".proj__desc")?.textContent || "";
    const role = card.querySelector(".proj__role")?.textContent || "";
    const linkEl = card.querySelector(".proj__link");
    const href = linkEl?.getAttribute("href") || "#";
    const linkText = linkEl?.textContent || "VISIT REPO ↗";

    if (drawerBadge) drawerBadge.textContent = idx;
    if (drawerTitle) drawerTitle.textContent = name;
    if (drawerStack) drawerStack.textContent = role;
    if (drawerArchitecture) {
      drawerArchitecture.textContent = card.dataset.architecture || `${name}: Engineered with ${role}. Modular architecture, production-ready schema validation, and verified unit and integration test coverage.`;
    }
    if (drawerImpact) {
      drawerImpact.textContent = desc;
    }
    if (drawerLink) {
      drawerLink.setAttribute("href", href);
      drawerLink.textContent = linkText;
      if (href === "#") {
        drawerLink.style.display = "none";
      } else {
        drawerLink.style.display = "inline-flex";
      }
    }

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (drawerBackdrop) drawerBackdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (drawerBackdrop) drawerBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") closeDrawer();
  });

  if (rail) {
    const allCards = [...rail.querySelectorAll(".proj")];

    // Drag-vs-Click Delta Detection (<5px click / >5px drag)
    let startX = 0;
    let startY = 0;
    let isPointerDown = false;
    let hasDragged = false;

    rail.addEventListener("mousedown", e => {
      isPointerDown = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
    });

    window.addEventListener("mousemove", e => {
      if (!isPointerDown) return;
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx > 5 || dy > 5) {
        hasDragged = true;
      }
    });

    window.addEventListener("mouseup", () => {
      isPointerDown = false;
    });

    // Attach card click handlers obeying drag delta
    allCards.forEach(card => {
      card.style.cursor = "pointer";
      card.addEventListener("click", e => {
        // If clicking a direct external link button inside top bar, let it open normally
        if (e.target.closest(".proj__link")) return;

        // If user dragged horizontally, ignore click
        if (hasDragged) {
          e.preventDefault();
          return;
        }

        openDrawer(card);
      });
    });

    // Build Dots
    const renderDots = visibleCards => {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      visibleCards.forEach((card, idx) => {
        const dot = document.createElement("button");
        dot.setAttribute("aria-label", `Project ${idx + 1}`);
        if (idx === 0) dot.classList.add("is-active");
        dot.addEventListener("click", () => {
          card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
        dotsContainer.appendChild(dot);
      });
    };

    renderDots(allCards);

    // Scroll sync with dots
    rail.addEventListener(
      "scroll",
      () => {
        if (rail.classList.contains("is-grid")) return;
        const visibleCards = allCards.filter(c => c.style.display !== "none");
        if (!visibleCards.length) return;
        const cardWidth = visibleCards[0].offsetWidth + 32;
        const activeIdx = Math.round(rail.scrollLeft / cardWidth);
        const dots = [...(dotsContainer ? dotsContainer.children : [])];
        dots.forEach((dot, idx) => {
          dot.classList.toggle("is-active", idx === Math.min(activeIdx, visibleCards.length - 1));
        });
      },
      { passive: true }
    );

    // Prev / Next Arrows
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const visibleCards = allCards.filter(c => c.style.display !== "none");
        const cardWidth = (visibleCards[0]?.offsetWidth || 400) + 32;
        rail.scrollBy({ left: -cardWidth, behavior: "smooth" });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const visibleCards = allCards.filter(c => c.style.display !== "none");
        const cardWidth = (visibleCards[0]?.offsetWidth || 400) + 32;
        rail.scrollBy({ left: cardWidth, behavior: "smooth" });
      });
    }

    // Category Filter Pills
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const filter = btn.dataset.filter;
        allCards.forEach(card => {
          const categories = card.dataset.category || "";
          if (filter === "all" || categories.includes(filter)) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        });

        const activeVisible = allCards.filter(c => c.style.display !== "none");
        renderDots(activeVisible);
        rail.scrollTo({ left: 0, behavior: "smooth" });
      });
    });

    // View Mode Toggle (Sideways Track <-> Expand Grid)
    if (viewToggleBtn) {
      let isGrid = false;
      viewToggleBtn.addEventListener("click", () => {
        isGrid = !isGrid;
        rail.classList.toggle("is-grid", isGrid);
        viewToggleBtn.innerHTML = isGrid
          ? `<span>SIDEWAYS TRACK ↔</span>`
          : `<span>EXPAND ALL GRID ⊞</span>`;

        if (dotsContainer) dotsContainer.style.display = isGrid ? "none" : "flex";
        if (prevBtn) prevBtn.style.display = isGrid ? "none" : "flex";
        if (nextBtn) nextBtn.style.display = isGrid ? "none" : "flex";
      });
    }
  }

  // 7. Toast Notification & Email Clipboard Copy
  const emailToast = document.getElementById("emailToast");
  let toastTimer = null;

  const showToast = (message = "// EMAIL COPIED TO CLIPBOARD ✓") => {
    if (!emailToast) return;
    emailToast.textContent = message;
    emailToast.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      emailToast.classList.remove("is-visible");
    }, 2400);
  };

  const copyEmailAndToast = async (e) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText("simpliarjun@gmail.com");
      }
    } catch (_) {}
    showToast("// EMAIL COPIED TO CLIPBOARD ✓");
  };

  const sayHelloBtn = document.getElementById("sayHelloBtn");
  if (sayHelloBtn) {
    sayHelloBtn.addEventListener("click", copyEmailAndToast);
  }

  const footerCta = document.querySelector(".footer__cta");
  if (footerCta) {
    footerCta.addEventListener("click", copyEmailAndToast);
  }
});
