const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll(".primary-nav a[href^='#']")];
const sections = [...document.querySelectorAll("main section[id]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

const getStoredTheme = () => {
  try {
    const theme = localStorage.getItem("theme");
    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    return null;
  }
};

const syncThemeControls = () => {
  if (!themeToggle) return;
  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", isDark ? "切换到浅色模式" : "切换到深色模式");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeColorMeta?.setAttribute("content", isDark ? "#08111f" : "#f5f5f7");
};

const setTheme = (theme, persist = true) => {
  document.documentElement.dataset.theme = theme;
  if (persist) {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }
  syncThemeControls();
};

syncThemeControls();

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

colorSchemeQuery.addEventListener("change", (event) => {
  if (!getStoredTheme()) {
    setTheme(event.matches ? "dark" : "light", false);
  }
});

const setMenuState = (isOpen) => {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "关闭导航菜单" : "打开导航菜单");
  navigation.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
};

menuButton?.addEventListener("click", () => {
  setMenuState(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuState(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});

document.addEventListener("click", (event) => {
  if (
    navigation?.classList.contains("is-open") &&
    !navigation.contains(event.target) &&
    !menuButton?.contains(event.target)
  ) {
    setMenuState(false);
  }
});

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;

  header?.classList.toggle("is-scrolled", scrollTop > 24);
  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
};

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const revealElements = document.querySelectorAll(".reveal");

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          if (isActive) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-35% 0px -55%", threshold: 0 },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

const finePointer = window.matchMedia("(pointer: fine)");
const glow = document.querySelector(".page-glow");

if (finePointer.matches && glow && !reduceMotion.matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      document.body.classList.add("has-pointer");
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    },
    { passive: true },
  );

  document.documentElement.addEventListener("mouseleave", () => {
    document.body.classList.remove("has-pointer");
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
