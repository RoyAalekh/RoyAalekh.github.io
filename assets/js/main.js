// GitHub Projects Loader
document.addEventListener('DOMContentLoaded', (event) => {
  const username = "RoyAalekh";
  const reposToShow = ["Snap2Sketch", "PyPI-Lens", "suntimes", "arbor", "ruvo", "network-analysis-nutrients", "one-piece-network-analysis", "virtualize"];
  const projectDetails = {
    Snap2Sketch: {
      description: "A simple web app to convert images into pencil sketches with adjustable quality levels."
    },
    "PyPI-Lens": {
      description: "A semantic search engine for PyPI to help developers find the right packages more effectively."
    },
    suntimes: {
      description: "A sleek web app to find accurate sunrise and sunset times for any location with timezone awareness."
    },
    arbor: {
      description: "A blazing-fast CLI tool in Rust to visualize directory structures in a clear, tree-like format."
    },
    ruvo: {
      description: "A lightweight virtual environment manager in Rust to simplify Python venv management."
    },
    "network-analysis-nutrients": {
      description: "An application of network analysis to visualize and explore the relationships between various nutrients."
    },
    "one-piece-network-analysis": {
      description: "A creative network analysis of One Piece character appearances to uncover key relationships."
    },
    virtualize: {
      description: "A Textual User Interface (TUI) to provide a more intuitive way to manage Python virtual environments."
    }
  };
  const streamlitLinks = {
    Snap2Sketch: "https://snap2sketch.streamlit.app",
    "PyPI-Lens": "https://pypi-lens.streamlit.app",
    suntimes: "https://suntimes-mmiw.onrender.com/",
  };
  const container = document.getElementById("repo-container");

  async function fetchRepos() {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      const repos = await response.json();

      repos
        .filter((repo) => reposToShow.includes(repo.name))
        .forEach((repo) => {
          const repoCard = `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div class="p-4 flex-grow">
                <h3 class="font-semibold text-lg mb-2">${repo.name}</h3>
                <p class="text-gray-600 text-sm mb-4">${projectDetails[repo.name].description || repo.description}</p>
              </div>
              <div class="p-4 bg-gray-50 flex justify-between items-center">
                <span class="text-xs text-gray-500">${repo.language || "Unknown"}</span>
                <div class="flex gap-3">
                  <a href="${repo.html_url}" class="text-gray-500 hover:text-blue-500" target="_blank"><i class="fab fa-github"></i></a>
                  ${
                    streamlitLinks[repo.name]
                      ? `<a href="${streamlitLinks[repo.name]}" class="text-gray-500 hover:text-green-500" target="_blank"><i class="fas fa-external-link-alt"></i></a>`
                      : ""
                  }
                </div>
              </div>
            </div>
          `;
          container.innerHTML += repoCard;
        });

      if (container.innerHTML === "") {
        container.innerHTML = `<p class="text-center text-gray-500 col-span-3">No projects found.</p>`;
      }
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error);
      container.innerHTML = `<p class="text-center text-red-500 col-span-3">Failed to load projects.</p>`;
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

