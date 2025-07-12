// tsParticles Configuration
tsParticles.load("tsparticles", {
  background: {
    color: {
      value: "#ffffff"
    }
  },
  fullScreen: {
    enable: false
  },
  particles: {
    number: {
      value: 250 /* Reduced */
    },
    color: {
      value: "#7c3aed"
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.6 /* Reduced */
    },
    size: {
      value: { min: 1, max: 3 }
    },
    move: {
      enable: true,
      speed: 1, /* Reduced */
      direction: "none",
      outModes: {
        default: "out"
      }
    },
    links: {
      enable: true,
      distance: 120,
      color: "#3b82f6",
      opacity: 0.2, /* Reduced */
      width: 1
    }
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse"
      }
    },
    modes: {
      repulse: {
        distance: 100
      }
    }
  }
});
