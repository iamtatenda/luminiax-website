const revealTargets = document.querySelectorAll("[data-reveal]");
const progressBar = document.querySelector(".scroll-progress");
const backToTop = document.querySelector(".back-to-top");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let ticking = false;

const revealOnScroll = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealOnScroll.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px",
  }
);

revealTargets.forEach((target) => revealOnScroll.observe(target));

const updateScrollProgress = () => {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = height > 0 ? (window.scrollY / height) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${scrolled}%`;
  }

  if (backToTop) {
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  }

  ticking = false;
};

const onScroll = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateScrollProgress);
  }
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

const countTargets = document.querySelectorAll("[data-count]");

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCount(el);
        countObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

countTargets.forEach((target) => countObserver.observe(target));

function animateCount(el) {
  const target = Number(el.dataset.count || 0);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const decimals = Number(el.dataset.decimals || 0);
  const duration = 1400;
  const startTime = performance.now();

  el.textContent = `${prefix}0${suffix}`;

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

    el.textContent = `${prefix}${display}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

const contactForm = document.querySelector("[data-mailto]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get("name") || "";
    const company = data.get("company") || "";
    const email = data.get("email") || "";
    const goal = data.get("goal") || "";
    const message = data.get("message") || "";

    const subject = encodeURIComponent(`Luminiax inquiry from ${name}`.trim());
    const body = encodeURIComponent(
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nGoal: ${goal}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:lyntrastudio@gmail.com?subject=${subject}&body=${body}`;
  });
}

const tileModal = document.querySelector("#tile-modal");
const tileModalTitle = tileModal?.querySelector("[data-modal-title]");
const tileModalBody = tileModal?.querySelector("[data-modal-body]");
const tileModalClose = tileModal?.querySelector("[data-modal-close]");
const tileTriggers = document.querySelectorAll("[data-modal-title-text]");

const openTileModal = (trigger) => {
  if (!tileModal || !tileModalTitle || !tileModalBody) return;
  tileModalTitle.textContent = trigger.dataset.modalTitleText || "Details";
  tileModalBody.textContent = trigger.dataset.modalBodyText || "";
  tileModal.classList.add("is-open");
  tileModal.setAttribute("aria-hidden", "false");
};

const closeTileModal = () => {
  if (!tileModal) return;
  tileModal.classList.remove("is-open");
  tileModal.setAttribute("aria-hidden", "true");
};

tileTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    openTileModal(trigger);
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openTileModal(trigger);
    }
  });
});

tileModalClose?.addEventListener("click", closeTileModal);

tileModal?.addEventListener("click", (event) => {
  if (event.target === tileModal) {
    closeTileModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTileModal();
  }
});
