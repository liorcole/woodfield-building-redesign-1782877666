const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

if (header) {
  const setHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 16);
  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });
}

const setProgress = () => {
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  document.documentElement.style.setProperty("--scroll-progress", String(window.scrollY / scrollable));
};
setProgress();
window.addEventListener("scroll", setProgress, { passive: true });

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }
  });
}

if (!prefersReduced) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll("[data-reveal]").forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min(index % 7, 6) * 70}ms`);
    revealObserver.observe(element);
  });

  const hero = document.querySelector("[data-hero-stage]");
  if (hero) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--mx", x.toFixed(3));
      hero.style.setProperty("--my", y.toFixed(3));
    });
  }
}

document.querySelectorAll("[data-magnetic]").forEach((button) => {
  if (prefersReduced) return;
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
  });
  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

document.querySelectorAll("[data-drag-rail]").forEach((rail) => {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  rail.addEventListener("pointerdown", (event) => {
    isDown = true;
    rail.classList.add("is-dragging");
    rail.setPointerCapture(event.pointerId);
    startX = event.pageX - rail.offsetLeft;
    scrollLeft = rail.scrollLeft;
  });

  rail.addEventListener("pointermove", (event) => {
    if (!isDown) return;
    event.preventDefault();
    const x = event.pageX - rail.offsetLeft;
    rail.scrollLeft = scrollLeft - (x - startX);
  });

  const end = () => {
    isDown = false;
    rail.classList.remove("is-dragging");
  };

  rail.addEventListener("pointerup", end);
  rail.addEventListener("pointercancel", end);
  rail.addEventListener("pointerleave", end);
});

const lightbox = document.querySelector("[data-lightbox]");
if (lightbox) {
  const image = lightbox.querySelector("[data-lightbox-image]");
  const title = lightbox.querySelector("[data-lightbox-title]");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  const close = () => {
    lightbox.close();
    document.body.classList.remove("modal-open");
  };

  document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      image.src = trigger.dataset.image;
      image.alt = trigger.dataset.title || "Woodfield project image";
      title.textContent = trigger.dataset.title || "Project image";
      caption.textContent = trigger.dataset.caption || "";
      lightbox.showModal();
      document.body.classList.add("modal-open");
    });
  });

  lightbox.querySelectorAll("[data-lightbox-close]").forEach((button) => button.addEventListener("click", close));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest("[data-filter-group]");
    const value = button.dataset.filter;
    group.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
    document.querySelectorAll("[data-project-card]").forEach((card) => {
      const show = value === "all" || card.dataset.category === value;
      card.hidden = !show;
    });
  });
});

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(contactForm);
    const name = form.get("name") || "";
    const phone = form.get("phone") || "";
    const email = form.get("email") || "";
    const message = form.get("message") || "";
    const body = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      "",
      message
    ].join("\n");
    window.location.href = `mailto:info@woodfieldbuilding.co.uk?subject=${encodeURIComponent("Woodfield Building enquiry")}&body=${encodeURIComponent(body)}`;
  });
}
