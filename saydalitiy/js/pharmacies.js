/**
 * صيدليتنا - Saydalitiy
 * Pharmacies Directory Module (pharmacies.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initPharmaciesDirectory();
});

let currentPharmaciesList = [];
let pharmacySearchQuery = '';
let pharmacyAreaFilter = 'الكل';
let pharmacyStatusFilter = 'all';

function initPharmaciesDirectory() {
  const container = document.getElementById('pharmaciesContainer');
  if (!container) return;

  currentPharmaciesList = window.PHARMACY_DATA ? window.PHARMACY_DATA.pharmacies : [];

  const searchInput = document.getElementById('pharmacySearchInput');
  const areaSelect = document.getElementById('pharmacyAreaSelect');
  const statusSelect = document.getElementById('pharmacyStatusSelect');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      pharmacySearchQuery = e.target.value.trim().toLowerCase();
      filterAndRenderPharmacies();
    });
  }

  if (areaSelect) {
    areaSelect.addEventListener('change', (e) => {
      pharmacyAreaFilter = e.target.value;
      filterAndRenderPharmacies();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      pharmacyStatusFilter = e.target.value;
      filterAndRenderPharmacies();
    });
  }

  filterAndRenderPharmacies();
}

function filterAndRenderPharmacies() {
  const container = document.getElementById('pharmaciesContainer');
  const countBadge = document.getElementById('pharmaciesCountBadge');
  if (!container) return;

  let filtered = currentPharmaciesList.filter(pharmacy => {
    // 1. Search Query
    const matchesSearch = !pharmacySearchQuery || 
      pharmacy.name.toLowerCase().includes(pharmacySearchQuery) ||
      pharmacy.address.toLowerCase().includes(pharmacySearchQuery) ||
      pharmacy.area.toLowerCase().includes(pharmacySearchQuery);

    // 2. Area Filter
    const matchesArea = pharmacyAreaFilter === 'الكل' || pharmacy.area === pharmacyAreaFilter;

    // 3. Status Filter
    let matchesStatus = true;
    if (pharmacyStatusFilter === 'open') {
      matchesStatus = pharmacy.status === 'open';
    } else if (pharmacyStatusFilter === '24h') {
      matchesStatus = pharmacy.is_24h === true;
    }

    return matchesSearch && matchesArea && matchesStatus;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} صيدلية مسجلة`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="state-message-box" style="grid-column: 1 / -1;">
        <div class="state-icon not-found"><i class="fas fa-clinic-medical"></i></div>
        <h3 class="state-title">لا توجد صيدليات مطابقة لخيارات البحث</h3>
        <p class="state-desc">جرب تغيير المنطقة أو التأكد من الاسم للبحث في صيدليات ولاية الخرطوم الأخرى.</p>
        <button class="btn btn-outline-primary" onclick="resetPharmacyFilters()"><i class="fas fa-redo"></i> إعادة تعيين الفلاتر</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(pharmacy => {
    const isOpen = pharmacy.status === 'open';
    return `
      <div class="pharmacy-card">
        <div class="pharmacy-card-image">
          <img src="${pharmacy.image}" alt="${pharmacy.name}" loading="lazy">
          <div class="pharmacy-card-status-badge">
            <span class="badge ${isOpen ? 'badge-open' : 'badge-closed'}">
              <i class="fas ${isOpen ? 'fa-door-open' : 'fa-door-closed'}"></i> ${pharmacy.status_text}
            </span>
          </div>
        </div>
        <div class="pharmacy-card-body">
          <h3 class="pharmacy-card-title">${pharmacy.name}</h3>
          
          <div class="pharmacy-meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${pharmacy.address}</span>
          </div>

          <div class="pharmacy-meta-item">
            <i class="fas fa-phone-alt"></i>
            <span dir="ltr">${pharmacy.phone}</span>
          </div>

          <div class="pharmacy-meta-item">
            <i class="fas fa-pills"></i>
            <span>${pharmacy.medicines_count} دواء مسجل في النظام</span>
          </div>

          <div class="pharmacy-meta-item">
            <i class="fas fa-star" style="color: #f59e0b;"></i>
            <span><strong>${pharmacy.rating}</strong> (${pharmacy.reviews_count} تقييم)</span>
          </div>

          <div class="pharmacy-card-actions">
            <a href="pharmacy-details.html?id=${pharmacy.id}" class="btn btn-primary btn-block">
              <i class="fas fa-info-circle"></i> عرض التفاصيل والأدوية
            </a>
            <a href="tel:${pharmacy.phone}" class="btn btn-outline" title="اتصال مباشر">
              <i class="fas fa-phone"></i>
            </a>
            ${pharmacy.whatsapp ? `
              <a href="https://wa.me/${pharmacy.whatsapp}" target="_blank" rel="noopener" class="btn btn-outline" style="color: #25d366; border-color: #25d366;" title="محادثة واتساب">
                <i class="fab fa-whatsapp"></i>
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.resetPharmacyFilters = function() {
  pharmacySearchQuery = '';
  pharmacyAreaFilter = 'الكل';
  pharmacyStatusFilter = 'all';

  const sInput = document.getElementById('pharmacySearchInput');
  const aSelect = document.getElementById('pharmacyAreaSelect');
  const stSelect = document.getElementById('pharmacyStatusSelect');

  if (sInput) sInput.value = '';
  if (aSelect) aSelect.value = 'الكل';
  if (stSelect) stSelect.value = 'all';

  filterAndRenderPharmacies();
};
