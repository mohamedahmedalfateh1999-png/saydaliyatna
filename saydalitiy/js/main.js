/**
 * صيدليتنا - Saydalitiy
 * Main JavaScript File (main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initUserSession();
  initStatsCounters();
  initGlobalShortcuts();
});

/* Mobile Menu Toggle */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = menuBtn.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuBtn.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }
}

/* User Session Management (localStorage) */
function initUserSession() {
  const userJson = localStorage.getItem('saydalitiy_user');
  const navActions = document.querySelectorAll('.nav-actions');

  if (!userJson) return;

  try {
    const user = JSON.parse(userJson);
    navActions.forEach(container => {
      container.innerHTML = `
        <div class="user-profile-badge">
          <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : '<i class="fas fa-user"></i>'}</div>
          <span class="user-name">${user.name ? user.name.split(' ')[0] : 'المستخدم'}</span>
          <button class="logout-btn" onclick="logoutUser()" title="تسجيل الخروج">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      `;
    });
  } catch (e) {
    console.error('Failed to parse user session:', e);
  }
}

/* Logout handler */
window.logoutUser = function() {
  localStorage.removeItem('saydalitiy_user');
  showToast('تم تسجيل الخروج بنجاح', 'info');
  setTimeout(() => {
    window.location.reload();
  }, 600);
};

/* Animated Counter for Statistics */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countTo = parseInt(target.getAttribute('data-count'), 10);
        animateCounter(target, countTo);
        obs.unobserve(target);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(elem => observer.observe(elem));
}

function animateCounter(elem, target) {
  let current = 0;
  const duration = 1500;
  const stepTime = 25;
  const steps = duration / stepTime;
  const increment = target / steps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      elem.textContent = Number(target).toLocaleString('ar-EG');
      clearInterval(timer);
    } else {
      elem.textContent = Math.floor(current).toLocaleString('ar-EG');
    }
  }, stepTime);
}

/* Toast Notification Utility */
window.showToast = function(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  if (type === 'warning') icon = 'fa-exclamation-triangle';
  if (type === 'info') icon = 'fa-info-circle';

  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

/* Keyboard Shortcut: Pressing '/' focuses search */
function initGlobalShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      const searchInput = document.querySelector('input[type="search"], input#medicineSearchInput, .hero-quick-search input');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }
  });
}
