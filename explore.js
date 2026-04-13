(() => {
  const toc = document.querySelector(".explore-toc");
  const sections = Array.from(document.querySelectorAll("[data-chapter]"));
  document.body.classList.add("js-enabled");
  if (!toc || !sections.length) {
    return;
  }

  const links = new Map();
  toc.querySelectorAll("a[href^='#']").forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    if (id) {
      links.set(id, link);
    }
  });

  const setActive = (id) => {
    links.forEach((link, key) => {
      if (key === id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    sections.forEach((section) => {
      section.classList.toggle("is-active", section.id === id);
    });
  };

  const getValidId = (id) => {
    if (links.has(id)) {
      return id;
    }
    return sections[0].id;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) {
        setActive(visible[0].target.id);
      }
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: [0.25, 0.5, 0.75] }
  );

  sections.forEach((section) => observer.observe(section));

  const applyFromHash = () => {
    const id = getValidId(location.hash.replace("#", ""));
    setActive(id);
  };

  applyFromHash();
  window.addEventListener("hashchange", applyFromHash);

  const zoomables = Array.from(document.querySelectorAll("[data-zoomable]"));
  const modal = document.querySelector("[data-image-modal]");
  const modalImage = modal?.querySelector(".image-modal__image");
  const modalCaption = modal?.querySelector("[data-modal-caption]");
  const modalClose = modal?.querySelector("[data-modal-close]");
  if (!modal || !modalImage || !modalCaption || !zoomables.length) {
    return;
  }

  let closeTimer = null;
  let lastActive = null;
  const closeDelayMs = 200;

  const openModal = ({ src, caption, alt }) => {
    if (!src) {
      return;
    }
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    lastActive = document.activeElement;
    modalImage.src = src;
    modalImage.alt = alt || caption || "Expanded image";
    modalCaption.textContent = caption || "";
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });
    document.body.classList.add("modal-open");
    if (modalClose) {
      modalClose.focus();
    }
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      modalImage.src = "";
      modalCaption.textContent = "";
    }, closeDelayMs);
    if (lastActive && typeof lastActive.focus === "function") {
      lastActive.focus();
    }
  };

  zoomables.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      const img = link.querySelector("img");
      const src = link.getAttribute("href") || img?.currentSrc || img?.src;
      const caption = link.dataset.caption || img?.alt || "";
      openModal({ src, caption, alt: img?.alt });
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-modal-close]")) {
      event.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      event.preventDefault();
      closeModal();
    }
  });
})();
