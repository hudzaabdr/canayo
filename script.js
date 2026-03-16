// Mobile navigation toggle
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("nav--open");
    navToggle.classList.toggle("nav-toggle--open");
  });

  // Close nav when clicking a link (mobile)
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("nav--open");
      navToggle.classList.remove("nav-toggle--open");
    });
  });
}

// Animate nav toggle icon (optional small micro-animation)
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const spans = navToggle.querySelectorAll("span");
    navToggle.classList.toggle("is-open");

    if (navToggle.classList.contains("is-open")) {
      spans[0].style.transform = "translateY(3px) rotate(45deg)";
      spans[1].style.transform = "translateY(-3px) rotate(-45deg)";
    } else {
      spans[0].style.transform = "";
      spans[1].style.transform = "";
    }
  });
}

// Reveal on scroll (fade-in sections)
const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--visible");
        // Optional: unobserve once visible
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealElements.forEach((el) => observer.observe(el));

// Set current year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}