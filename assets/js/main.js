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

// Journey Map Interactive Features
class JourneyMapController {
  constructor() {
    this.locationMarkers = document.querySelectorAll('.location-marker');
    this.journeyCards = document.querySelectorAll('.journey-card');
    this.activeLocation = null;
    this.isScrolling = false;
    
    this.init();
  }
  
  init() {
    this.setupLocationMarkers();
    this.setupSmoothScrolling();
    this.setupJourneyCardObserver();
    this.setupKeyboardNavigation();
    this.setupCardHoverSync();
  }
  
  setupLocationMarkers() {
    this.locationMarkers.forEach((marker, index) => {
      // Click/Tap events
      marker.addEventListener('click', (e) => {
        e.preventDefault();
        const location = marker.dataset.location;
        this.focusLocation(location, true);
      });
      
      // Touch events for mobile
      let touchStartTime = 0;
      marker.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        const location = marker.dataset.location;
        this.highlightCard(location, false);
      }, { passive: true });
      
      marker.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touchDuration = Date.now() - touchStartTime;
        
        // Only trigger if it's a quick tap (not a scroll)
        if (touchDuration < 200) {
          const location = marker.dataset.location;
          this.focusLocation(location, true);
        }
      });
      
      marker.addEventListener('touchcancel', () => {
        // Clean up any highlights if touch is cancelled
        if (this.activeLocation !== marker.dataset.location) {
          this.removeCardHighlight(marker.dataset.location);
        }
      });
      
      // Mouse events for desktop
      marker.addEventListener('mouseenter', () => {
        if (!this.isScrolling && !this.isMobileDevice()) {
          this.highlightCard(marker.dataset.location, false);
        }
      });
      
      marker.addEventListener('mouseleave', () => {
        if (!this.isScrolling && this.activeLocation !== marker.dataset.location && !this.isMobileDevice()) {
          this.removeCardHighlight(marker.dataset.location);
        }
      });
      
      // Add keyboard support
      marker.setAttribute('tabindex', '0');
      marker.setAttribute('role', 'button');
      marker.setAttribute('aria-label', `View details for ${marker.querySelector('.location-label').textContent}`);
      
      marker.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const location = marker.dataset.location;
          this.focusLocation(location, true);
        }
      });
    });
  }
  
  setupCardHoverSync() {
    this.journeyCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const location = card.dataset.location;
        this.highlightMarker(location);
      });
      
      card.addEventListener('mouseleave', () => {
        const location = card.dataset.location;
        if (this.activeLocation !== location) {
          this.removeMarkerHighlight(location);
        }
      });
    });
  }
  
  focusLocation(location, scrollToCard = false) {
    // Remove previous active states
    this.clearActiveStates();
    
    // Set new active location
    this.activeLocation = location;
    
    // Highlight marker and card
    this.highlightMarker(location);
    this.highlightCard(location, true);
    
    // Scroll to card if requested
    if (scrollToCard) {
      this.scrollToCard(location);
    }
    
    // Add focused state for accessibility
    const marker = document.querySelector(`[data-location="${location}"]`);
    if (marker) {
      marker.focus();
    }
  }
  
  highlightMarker(location) {
    const marker = document.querySelector(`.location-marker[data-location="${location}"]`);
    if (marker) {
      marker.classList.add('active');
      marker.style.transform = 'scale(1.2)';
      marker.style.zIndex = '20';
    }
  }
  
  removeMarkerHighlight(location) {
    const marker = document.querySelector(`.location-marker[data-location="${location}"]`);
    if (marker && this.activeLocation !== location) {
      marker.classList.remove('active');
      marker.style.transform = '';
      marker.style.zIndex = '';
    }
  }
  
  highlightCard(location, isActive = false) {
    const card = document.querySelector(`#card-${location}`);
    if (card) {
      card.classList.add('highlighted');
      if (isActive) {
        card.classList.add('active');
      }
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
      card.style.borderColor = 'rgba(59, 130, 246, 0.4)';
    }
  }
  
  removeCardHighlight(location) {
    const card = document.querySelector(`#card-${location}`);
    if (card && this.activeLocation !== location) {
      card.classList.remove('highlighted');
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.borderColor = '';
    }
  }
  
  clearActiveStates() {
    // Clear all markers
    this.locationMarkers.forEach(marker => {
      marker.classList.remove('active');
      marker.style.transform = '';
      marker.style.zIndex = '';
    });
    
    // Clear all cards
    this.journeyCards.forEach(card => {
      card.classList.remove('highlighted', 'active');
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.borderColor = '';
    });
    
    this.activeLocation = null;
  }
  
  scrollToCard(location) {
    const card = document.querySelector(`#card-${location}`);
    if (card) {
      this.isScrolling = true;
      
      card.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      
      // Reset scrolling flag after animation
      setTimeout(() => {
        this.isScrolling = false;
      }, 1000);
    }
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
  
  setupJourneyCardObserver() {
    const journeyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          
          // Add staggered animation
          const cards = Array.from(this.journeyCards);
          const index = cards.indexOf(entry.target);
          entry.target.style.animationDelay = `${index * 0.2}s`;
        }
      });
    }, { 
      threshold: 0.1, 
      rootMargin: '0px 0px -50px 0px' 
    });
    
    this.journeyCards.forEach(card => {
      journeyObserver.observe(card);
    });
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Arrow key navigation between locations
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        
        const locations = ['delhi', 'bhubaneswar', 'current'];
        let currentIndex = this.activeLocation ? locations.indexOf(this.activeLocation) : -1;
        
        if (e.key === 'ArrowRight') {
          currentIndex = (currentIndex + 1) % locations.length;
        } else {
          currentIndex = currentIndex <= 0 ? locations.length - 1 : currentIndex - 1;
        }
        
        this.focusLocation(locations[currentIndex], true);
      }
      
      // Escape to clear selection
      if (e.key === 'Escape') {
        this.clearActiveStates();
      }
    });
  }
  
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768 || 
           ('ontouchstart' in window);
  }
}

// Initialize Journey Map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for the map to render
  setTimeout(() => {
    new JourneyMapController();
  }, 500);
});

// Add custom styles for journey map interactions
const journeyStyles = document.createElement('style');
journeyStyles.textContent = `
  .location-marker:focus {
    outline: 3px solid rgba(59, 130, 246, 0.6);
    outline-offset: 4px;
    border-radius: 50%;
  }
  
  .journey-card.highlighted {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .journey-card.active {
    position: relative;
  }
  
  .journey-card.active::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06d6a0);
    border-radius: 22px;
    z-index: -1;
    opacity: 0.7;
    animation: borderGlow 2s ease-in-out infinite alternate;
  }
  
  @keyframes borderGlow {
    0% { opacity: 0.7; transform: scale(1); }
    100% { opacity: 1; transform: scale(1.01); }
  }
  
  .marker-pin.active-marker {
    animation: markerBounce 0.6s ease-out;
  }
  
  @keyframes markerBounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1.2); }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .journey-card.highlighted,
    .location-marker {
      transition: none !important;
    }
    
    .journey-card.active::before {
      animation: none;
    }
  }
`;
document.head.appendChild(journeyStyles);

