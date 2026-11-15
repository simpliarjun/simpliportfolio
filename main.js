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

  if (rail) {
    const allCards = [...rail.querySelectorAll(".proj")];

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
});
