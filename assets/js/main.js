// GitHub Projects Loader
document.addEventListener('DOMContentLoaded', (event) => {
  const username = "RoyAalekh";
  const reposToShow = ["temporal-network-analysis-thesis", "R-for-basic-linear-Matrix-algebra", "PyPI-Lens", "Snap2Sketch", "network-models-visualization", "arbor"];
  const projectDetails = {
    "temporal-network-analysis-thesis": {
      description: "Master's thesis: Temporal Network Analysis of Global Armed Conflicts - Comprehensive study of 522 years of global conflicts using network science methodologies and data engineering."
    },
    "network-models-visualization": {
      description: "Interactive educational web application for learning and visualizing classical network generation models with real-time parameter adjustments."
    },
    "PyPI-Lens": {
      description: "A semantic search engine for PyPI to help developers find the right packages more effectively using advanced search algorithms."
    },
    arbor: {
      description: "A blazing-fast CLI tool in Rust to visualize directory structures in a clear, tree-like format with customizable output options."
    },
    Snap2Sketch: {
      description: "Web app to convert images into pencil sketches with varying quality levels and step-by-step transformation features."
    },
    "R-for-basic-linear-Matrix-algebra": {
      description: "Computational Linear Algebra course materials demonstrating matrix operations, decompositions, and numerical methods using R programming."
    }
  };
  const streamlitLinks = {
    Snap2Sketch: "https://snap2sketch.streamlit.app",
    "PyPI-Lens": "https://pypi-lens.streamlit.app"
  };
  const container = document.getElementById("repo-container");

  async function fetchRepos() {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      const repos = await response.json();

      repos
        .filter((repo) => reposToShow.includes(repo.name))
        .sort((a, b) => reposToShow.indexOf(a.name) - reposToShow.indexOf(b.name))
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

// Horizontal Progress Journey Controller
class HorizontalJourneyController {
  constructor() {
    this.currentStep = 'bachelors';
    this.steps = ['bachelors', 'masters', 'career'];
    this.init();
  }
  
  init() {
    this.setupProgressSteps();
    this.setupSmoothScrolling();
    this.updateProgressFill();
  }
  
  setupProgressSteps() {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach(step => {
      step.addEventListener('click', (e) => {
        e.preventDefault();
        const stepData = step.dataset.step;
        this.setActiveStep(stepData);
      });
      
      // Add keyboard support
      step.setAttribute('tabindex', '0');
      step.setAttribute('role', 'button');
      
      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const stepData = step.dataset.step;
          this.setActiveStep(stepData);
        }
        
        // Arrow key navigation
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const currentIndex = this.steps.indexOf(this.currentStep);
          let nextIndex;
          
          if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % this.steps.length;
          } else {
            nextIndex = currentIndex <= 0 ? this.steps.length - 1 : currentIndex - 1;
          }
          
          this.setActiveStep(this.steps[nextIndex]);
        }
      });
    });
    
    // Auto-cycle through steps for initial demo (optional)
    this.setupAutoCycle();
  }
  
  setActiveStep(stepData) {
    this.currentStep = stepData;
    
    // Update progress steps
    document.querySelectorAll('.progress-step').forEach(step => {
      step.classList.remove('active');
    });
    
    const activeStep = document.querySelector(`[data-step="${stepData}"]`);
    if (activeStep) {
      activeStep.classList.add('active');
    }
    
    // Update details panels
    document.querySelectorAll('.step-details').forEach(detail => {
      detail.classList.remove('active');
    });
    
    const activeDetail = document.querySelector(`.step-details[data-step="${stepData}"]`);
    if (activeDetail) {
      activeDetail.classList.add('active');
    }
    
    // Update progress fill
    this.updateProgressFill();
  }
  
  updateProgressFill() {
    const progressFill = document.getElementById('progress-fill');
    if (!progressFill) return;
    
    const stepIndex = this.steps.indexOf(this.currentStep);
    const progressPercentage = (stepIndex / (this.steps.length - 1)) * 100;
    
    // Smooth animation with easing
    progressFill.style.width = `${progressPercentage}%`;
    
    // Update the progress indicator color based on the current step
    if (stepIndex === 0) {
      progressFill.style.background = 'linear-gradient(90deg, #3b82f6 0%, #3b82f6 100%)';
    } else if (stepIndex === 1) {
      progressFill.style.background = 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)';
    } else {
      progressFill.style.background = 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)';
    }
  }
  
  setupAutoCycle() {
    // Optional: Auto-cycle through steps on page load for demonstration
    let cycleIndex = 0;
    
    const cycle = () => {
      if (cycleIndex < this.steps.length) {
        setTimeout(() => {
          this.setActiveStep(this.steps[cycleIndex]);
          cycleIndex++;
          if (cycleIndex < this.steps.length) {
            cycle();
          }
        }, cycleIndex === 0 ? 500 : 1500); // First step faster, others slower
      }
    };
    
    // Start auto-cycle after initial load
    setTimeout(() => {
      cycle();
    }, 1000);
  }
  
  setupSmoothScrolling() {
    // Enhanced smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement && targetId !== '#') {
          e.preventDefault();
          
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
          
          // Update URL without triggering scroll
          history.pushState(null, null, targetId);
        }
      });
    });
  }
}

// Initialize Horizontal Journey Controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for elements to be rendered
  setTimeout(() => {
    new HorizontalJourneyController();
  }, 100);
});

