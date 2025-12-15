// GitHub Projects Loader
document.addEventListener('DOMContentLoaded', () => {
  const defaultUsername = "RoyAalekh";
  const reposToShow = [
    "PieceWiseProjects/formatify",
    "temporal-network-analysis-thesis",
    "R-for-basic-linear-Matrix-algebra",
    "PyPI-Lens",
    "Snap2Sketch",
    "network-models-visualization",
    "arbor"
  ];

  const projectDetails = {
    formatify: {
      description:
        "Auto-detect and standardize messy timestamp formats. Perfect for log parsers, data pipelines, or anyone tired of wrestling with inconsistent datetime strings."
    },
    "temporal-network-analysis-thesis": {
      description:
        "Master's thesis: Temporal Network Analysis of Global Armed Conflicts - Comprehensive study of 522 years of global conflicts using network science methodologies and data engineering."
    },
    "network-models-visualization": {
      description:
        "Interactive educational web application for learning and visualizing classical network generation models with real-time parameter adjustments."
    },
    "PyPI-Lens": {
      description:
        "A semantic search engine for PyPI to help developers find the right packages more effectively using advanced search algorithms."
    },
    arbor: {
      description:
        "A blazing-fast CLI tool in Rust to visualize directory structures in a clear, tree-like format with customizable output options."
    },
    Snap2Sketch: {
      description:
        "Web app to convert images into pencil sketches with varying quality levels and step-by-step transformation features."
    },
    "R-for-basic-linear-Matrix-algebra": {
      description:
        "Computational Linear Algebra course materials demonstrating matrix operations, decompositions, and numerical methods using R programming."
    }
  };

  const streamlitLinks = {
    Snap2Sketch: "https://snap2sketch.streamlit.app",
    "PyPI-Lens": "https://pypi-lens.streamlit.app"
  };

  const container = document.getElementById("repo-container");
  if (!container) return;

  function parseRepoId(repoId) {
    if (repoId.includes("/")) {
      const [owner, repo] = repoId.split("/");
      return { owner, repo };
    }
    return { owner: defaultUsername, repo: repoId };
  }

  function getRepoDescription(repo) {
    const details = projectDetails?.[repo.name];
    return details?.description || repo.description || "";
  }

  async function fetchRepos() {
    try {
      const allRepos = [];

      for (const repoId of reposToShow) {
        const { owner, repo } = parseRepoId(repoId);
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) continue;

        const repoData = await response.json();
        allRepos.push(repoData);
      }

      allRepos
        .sort((a, b) => {
          const aId = `${a.owner.login}/${a.name}`.replace(`${defaultUsername}/`, "");
          const bId = `${b.owner.login}/${b.name}`.replace(`${defaultUsername}/`, "");
          const aIndex = reposToShow.findIndex(
            (r) => r === aId || r === `${a.owner.login}/${a.name}`
          );
          const bIndex = reposToShow.findIndex(
            (r) => r === bId || r === `${b.owner.login}/${b.name}`
          );
          return aIndex - bIndex;
        })
        .forEach((repo) => {
          const repoCard = `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div class="p-4 flex-grow">
                <h3 class="font-semibold text-lg mb-2">${repo.name}</h3>
                <p class="text-gray-600 text-sm mb-4">${getRepoDescription(repo)}</p>
              </div>
              <div class="p-4 bg-gray-50 flex justify-between items-center">
                <span class="text-xs text-gray-500">${repo.language || "Unknown"}</span>
                <div class="flex gap-3">
                  <a href="${repo.html_url}" class="text-gray-500 hover:text-blue-500" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i></a>
                  ${
                    streamlitLinks[repo.name]
                      ? `<a href="${streamlitLinks[repo.name]}" class="text-gray-500 hover:text-green-500" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i></a>`
                      : ""
                  }
                </div>
              </div>
            </div>
          `;

          container.insertAdjacentHTML("beforeend", repoCard);
        });

      if (container.innerHTML.trim() === "") {
        container.innerHTML =
          '<p class="text-center text-gray-500 col-span-3">No projects found.</p>';
      }
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error);
      container.innerHTML =
        '<p class="text-center text-red-500 col-span-3">Failed to load projects.</p>';
    }
  }

  fetchRepos();
});

// Timeline animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    } else {
      entry.target.classList.remove('is-visible');
    }
  });
}, { threshold: 0.1 });

const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach(item => {
  observer.observe(item);
});

// Tech constellation interactivity
const techNodes = document.querySelectorAll('.tech-node');
const techTooltip = document.getElementById('tech-tooltip');

const techItems = document.querySelectorAll('.tech-item, .tech-item-small');

techItems.forEach(item => {
  const tooltip = item.querySelector('.tooltip');
  item.addEventListener('mouseenter', () => {
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
  });
  item.addEventListener('mouseleave', () => {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
  });
});

// Add scroll-based animations for new sections (optimized)
const newSections = document.querySelectorAll('.philosophy-card, .social-ds-card, .interest-item, .tech-node');

const newObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

newSections.forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(15px)';
  section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  newObserver.observe(section);
});

// Smooth anchor scrolling (site-wide)
function initSmoothAnchorScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetElement = targetId ? document.querySelector(targetId) : null;

      if (targetElement && targetId !== '#') {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        history.pushState(null, null, targetId);
      }
    });
  });
}

// Journey Tabs Controller (minimal + accessible)
class JourneyTabsController {
  constructor() {
    this.tabs = Array.from(document.querySelectorAll('.journey-tab'));
    this.panels = Array.from(document.querySelectorAll('.journey-panel'));
    if (!this.tabs.length || !this.panels.length) return;

    this.steps = this.tabs.map(t => t.dataset.step).filter(Boolean);
    this.currentStep = this.steps[0] || 'bachelors';

    this.bind();
    this.setActive(this.currentStep, { focusTab: false });
  }

  bind() {
    this.tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        const step = tab.dataset.step;
        if (!step) return;
        this.setActive(step, { focusTab: true });
      });

      tab.addEventListener('keydown', (e) => {
        const key = e.key;

        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          tab.click();
          return;
        }

        if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End') {
          e.preventDefault();

          let nextIdx = idx;
          if (key === 'ArrowRight') nextIdx = (idx + 1) % this.tabs.length;
          if (key === 'ArrowLeft') nextIdx = idx === 0 ? this.tabs.length - 1 : idx - 1;
          if (key === 'Home') nextIdx = 0;
          if (key === 'End') nextIdx = this.tabs.length - 1;

          this.tabs[nextIdx].focus();
          const step = this.tabs[nextIdx].dataset.step;
          if (step) this.setActive(step, { focusTab: false });
        }
      });
    });
  }

  setActive(step, { focusTab }) {
    this.currentStep = step;

    this.tabs.forEach((tab) => {
      const isActive = tab.dataset.step === step;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && focusTab) tab.focus();
    });

    this.panels.forEach((panel) => {
      const isActive = panel.dataset.step === step;
      panel.classList.toggle('active', isActive);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSmoothAnchorScrolling();
  new JourneyTabsController();
});

