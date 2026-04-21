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

// AR-ADDED: WebAR Module
(function() {
  'use strict';

  // AR-ADDED: Configuration - UPDATE THIS PATH TO YOUR MODEL
  const AR_CONFIG = {
    modelUrl: '[cdn.glitch.com](https://cdn.glitch.com/36cb8393-65c6-408d-a538-055ada20f0d9%2Fscene.glb?v=1590675618957)', // Replace with your .glb/.gltf URL
    modelScale: '0.5 0.5 0.5',
    modelPosition: '0 0 0',
    modelRotation: '0 0 0'
  };

  // AR-ADDED: Script URLs for lazy loading
  const SCRIPTS = {
    aframe: '[aframe.io](https://aframe.io/releases/1.4.2/aframe.min.js)',
    arjs: '[raw.githack.com](https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js)'
  };

  let arInitialized = false;
  let arScene = null;

  // AR-ADDED: Check browser support
  function checkARSupport() {
    const hasWebGL = (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    })();

    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    if (!hasWebGL) {
      alert('WebGL is not supported on this device. AR cannot run.');
      return false;
    }
    if (!hasGetUserMedia) {
      alert('Camera access is not supported on this browser. Please use Chrome or Safari.');
      return false;
    }
    return true;
  }

  // AR-ADDED: Load external script dynamically
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load: ${url}`));
      document.head.appendChild(script);
    });
  }

  // AR-ADDED: Create AR scene HTML
  function createARScene() {
    const sceneHTML = `
      <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; antialias: true; alpha: true;"
        id="ar-scene"
      >
        <a-assets>
          <a-asset-item id="ar-model" src="${AR_CONFIG.modelUrl}"></a-asset-item>
        </a-assets>

        <a-marker preset="hiro" smooth="true" smoothCount="5" smoothTolerance="0.01" smoothThreshold="2">
          <a-entity
            id="ar-model-entity"
            gltf-model="#ar-model"
            scale="${AR_CONFIG.modelScale}"
            position="${AR_CONFIG.modelPosition}"
            rotation="${AR_CONFIG.modelRotation}"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear"
          ></a-entity>
        </a-marker>

        <a-entity camera></a-entity>
      </a-scene>
    `;
    return sceneHTML;
  }

  // AR-ADDED: Initialize AR experience
  async function initAR() {
    const container = document.getElementById('ar-container');
    const loading = document.getElementById('ar-loading');

    if (!checkARSupport()) return;

    container.style.display = 'block';
    loading.style.display = 'flex';

    try {
      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

      // Lazy load scripts
      if (!arInitialized) {
        await loadScript(SCRIPTS.aframe);
        await loadScript(SCRIPTS.arjs);
        arInitialized = true;
      }

      // Inject scene
      const sceneContainer = document.createElement('div');
      sceneContainer.id = 'ar-scene-wrapper';
      sceneContainer.innerHTML = createARScene();
      container.appendChild(sceneContainer);

      arScene = document.getElementById('ar-scene');

      // Hide loading when scene is ready
      arScene.addEventListener('loaded', () => {
        loading.style.display = 'none';
      });

      // Fallback timeout for loading
      setTimeout(() => {
        loading.style.display = 'none';
      }, 5000);

      // AR-ADDED: Basic touch rotation
      addTouchInteraction();

    } catch (error) {
      console.error('AR initialization failed:', error);
      loading.innerHTML = '<p>Camera access denied or unavailable.</p><button onclick="window.closeAR()">Close</button>';
    }
  }

  // AR-ADDED: Touch interaction for rotation and pinch zoom
  function addTouchInteraction() {
    let initialDistance = 0;
    let currentScale = 0.5;

    document.addEventListener('touchmove', (e) => {
      const modelEntity = document.getElementById('ar-model-entity');
      if (!modelEntity) return;

      // Pinch to scale
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (initialDistance > 0) {
          const scaleFactor = distance / initialDistance;
          currentScale = Math.max(0.1, Math.min(2, currentScale * scaleFactor));
          modelEntity.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
        }
        initialDistance = distance;
      }
    });

    document.addEventListener('touchend', () => {
      initialDistance = 0;
    });
  }

  // AR-ADDED: Close AR experience
  function closeAR() {
    const container = document.getElementById('ar-container');
    const sceneWrapper = document.getElementById('ar-scene-wrapper');
    const loading = document.getElementById('ar-loading');

    // Stop camera streams
    if (arScene) {
      const video = document.querySelector('video');
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    }

    // Remove scene
    if (sceneWrapper) {
      sceneWrapper.remove();
    }

    container.style.display = 'none';
    loading.style.display = 'flex';
    arScene = null;
  }

  // AR-ADDED: Expose close function globally
  window.closeAR = closeAR;

  // AR-ADDED: Attach event listener to existing button
  document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startAR');
    if (startButton) {
      startButton.addEventListener('click', (e) => {
        e.preventDefault();
        initAR();
      });
    }

    const closeButton = document.getElementById('ar-close');
    if (closeButton) {
      closeButton.addEventListener('click', closeAR);
    }
  });

})();


