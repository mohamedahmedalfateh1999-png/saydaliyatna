/**
 * صيدليتنا - Saydalitiy
 * Smart Search & Price Comparison Engine (search.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSearchPage();
});

let currentQuery = '';
let currentAreaFilter = 'الكل';
let currentSortOrder = 'price-asc'; // 'price-asc', 'price-desc', 'name'
let currentViewMode = 'table'; // 'table' or 'cards'

function initSearchPage() {
  const searchInput = document.getElementById('medicineSearchInput');
  const searchBtn = document.getElementById('medicineSearchBtn');
  const autocompleteBox = document.getElementById('autocompleteDropdown');
  const areaFilter = document.getElementById('areaFilter');
  const sortFilter = document.getElementById('sortFilter');
  const viewToggleBtn = document.getElementById('viewToggleBtn');

  // Check URL query parameters (?q=...)
  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');

  if (searchInput) {
    if (qParam) {
      searchInput.value = qParam;
      executeMedicineSearch(qParam);
    } else {
      // Default to showing popular medicine like Panadol 500mg
      executeMedicineSearch('Panadol 500mg');
    }

    // Input events & Autocomplete
    searchInput.addEventListener('input', (e) => {
      handleAutocomplete(e.target.value.trim());
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        hideAutocomplete();
        executeMedicineSearch(searchInput.value.trim());
      }
    });

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !autocompleteBox.contains(e.target)) {
        hideAutocomplete();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      hideAutocomplete();
      executeMedicineSearch(searchInput.value.trim());
    });
  }

  // Quick tag clicks
  document.querySelectorAll('.search-tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const medName = chip.getAttribute('data-medicine') || chip.textContent.trim();
      if (searchInput) searchInput.value = medName;
      hideAutocomplete();
      executeMedicineSearch(medName);
    });
  });

  // Filter & Sort changes
  if (areaFilter) {
    areaFilter.addEventListener('change', (e) => {
      currentAreaFilter = e.target.value;
      renderCurrentSearchResults();
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', (e) => {
      currentSortOrder = e.target.value;
      renderCurrentSearchResults();
    });
  }

  if (viewToggleBtn) {
    viewToggleBtn.addEventListener('click', () => {
      currentViewMode = currentViewMode === 'table' ? 'cards' : 'table';
      viewToggleBtn.innerHTML = currentViewMode === 'table' 
        ? '<i class="fas fa-th-large"></i> عرض كبطاقات' 
        : '<i class="fas fa-table"></i> عرض جدول المقارنة';
      renderCurrentSearchResults();
    });
  }
}

/* Autocomplete Logic */
function handleAutocomplete(term) {
  const dropdown = document.getElementById('autocompleteDropdown');
  if (!dropdown) return;

  if (!term || term.length < 2) {
    hideAutocomplete();
    return;
  }

  const matches = (window.PHARMACY_DATA ? window.PHARMACY_DATA.medicines : []).filter(m => {
    const q = term.toLowerCase();
    return m.name.toLowerCase().includes(q) ||
           (m.generic_name && m.generic_name.toLowerCase().includes(q)) ||
           (m.category && m.category.toLowerCase().includes(q));
  });

  if (matches.length === 0) {
    hideAutocomplete();
    return;
  }

  dropdown.innerHTML = matches.slice(0, 6).map(m => `
    <div class="autocomplete-item" onclick="selectAutocomplete('${m.name}')">
      <div>
        <div class="med-name">${m.name} <small class="text-muted">(${m.concentration || ''})</small></div>
        <div class="med-cat"><i class="fas fa-capsules"></i> ${m.category} &bull; ${m.manufacturer || ''}</div>
      </div>
      <span class="badge badge-area"><i class="fas fa-search"></i> بحث</span>
    </div>
  `).join('');

  dropdown.style.display = 'block';
}

function hideAutocomplete() {
  const dropdown = document.getElementById('autocompleteDropdown');
  if (dropdown) dropdown.style.display = 'none';
}

window.selectAutocomplete = function(name) {
  const searchInput = document.getElementById('medicineSearchInput');
  if (searchInput) searchInput.value = name;
  hideAutocomplete();
  executeMedicineSearch(name);
};

/* Core Search Execution */
let activeSearchResults = null;
let matchedMedicine = null;

function executeMedicineSearch(query) {
  currentQuery = query.trim();
  const resultsContainer = document.getElementById('searchResultsSection');
  if (!resultsContainer) return;

  // Show loading skeleton
  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 60px 20px;">
      <i class="fas fa-circle-notch fa-spin" style="font-size: 40px; color: var(--primary);"></i>
      <p style="margin-top: 16px; font-weight: 700; color: var(--text-secondary);">جاري البحث ومقارنة الأسعار في صيدليات الخرطوم...</p>
    </div>
  `;

  setTimeout(() => {
    if (!currentQuery) {
      resultsContainer.innerHTML = `
        <div class="state-message-box">
          <div class="state-icon not-found"><i class="fas fa-search"></i></div>
          <h3 class="state-title">ابدأ البحث عن أي دواء</h3>
          <p class="state-desc">اكتب اسم الدواء في مربع البحث بالأعلى لمعرفة الصيدليات المتوفر فيها وأقل سعر متاح.</p>
        </div>
      `;
      return;
    }

    const medicines = window.PHARMACY_DATA ? window.PHARMACY_DATA.medicines : [];
    const qLower = currentQuery.toLowerCase();

    // Exact or partial match
    matchedMedicine = medicines.find(m => 
      m.name.toLowerCase() === qLower || 
      (m.generic_name && m.generic_name.toLowerCase() === qLower)
    );

    if (!matchedMedicine) {
      // Try substring match
      matchedMedicine = medicines.find(m => 
        m.name.toLowerCase().includes(qLower) || 
        (m.generic_name && m.generic_name.toLowerCase().includes(qLower)) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(qLower)) ||
        (m.category && m.category.toLowerCase().includes(qLower))
      );
    }

    // CASE 1: Medicine not found at all in the database
    if (!matchedMedicine) {
      resultsContainer.innerHTML = `
        <div class="state-message-box">
          <div class="state-icon not-found"><i class="fas fa-exclamation-triangle"></i></div>
          <h3 class="state-title">عذرًا، لم يتم العثور على الدواء الذي تبحث عنه</h3>
          <p class="state-desc">تأكد من كتابة الاسم بصورة صحيحة (مثال: Panadol, Augmentin, Concor, Ventolin)، أو تواصل مع الصيدليات المسجلة مباشرة.</p>
          <a href="pharmacies.html" class="btn btn-primary"><i class="fas fa-clinic-medical"></i> تصفح جميع صيدليات الخرطوم</a>
        </div>
      `;
      return;
    }

    // CASE 2: Medicine exists, check availability across pharmacies
    const availabilityList = matchedMedicine.availability || [];
    const hasAnyAvailable = availabilityList.some(item => item.available);

    if (!hasAnyAvailable) {
      resultsContainer.innerHTML = `
        <div class="state-message-box">
          <div class="state-icon out-of-stock"><i class="fas fa-box-open"></i></div>
          <h3 class="state-title">الدواء مسجل في النظام ولكنه غير متوفر حاليًا</h3>
          <p class="state-desc">دواء <strong>${matchedMedicine.name}</strong> (${matchedMedicine.generic_name}) مسجل في قاعدة بيانات صيدليات الخرطوم ولكنه نفد حالياً من مخزون الصيدليات المسجلة. يتم تحديث المخزون باستمرار من قبل الصيدليات.</p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-outline-primary" onclick="showToast('سيتم إشعارك فور توفر الدواء في أقرب صيدلية', 'info')">
              <i class="fas fa-bell"></i> أبلغني عند توفر الدواء
            </button>
            <a href="pharmacies.html" class="btn btn-primary"><i class="fas fa-phone-alt"></i> الاتصال بالصيدليات</a>
          </div>
        </div>
      `;
      return;
    }

    // CASE 3: Medicine is found and available!
    activeSearchResults = availabilityList;
    renderCurrentSearchResults();
  }, 400);
}

/* Render & Filter Results */
function renderCurrentSearchResults() {
  const resultsContainer = document.getElementById('searchResultsSection');
  if (!resultsContainer || !activeSearchResults || !matchedMedicine) return;

  // 1. Filter by Area
  let filtered = activeSearchResults.filter(item => {
    if (currentAreaFilter === 'الكل') return true;
    return item.area.trim() === currentAreaFilter.trim();
  });

  if (filtered.length === 0) {
    resultsContainer.innerHTML = `
      <div class="state-message-box">
        <div class="state-icon out-of-stock"><i class="fas fa-map-marker-alt"></i></div>
        <h3 class="state-title">لا تتوفر نتائج في منطقة "${currentAreaFilter}"</h3>
        <p class="state-desc">الدواء متوفر في مناطق أخرى داخل ولاية الخرطوم. اختر "الكل" في فلتر المنطقة لمشاهدة جميع الصيدليات المتاحة.</p>
        <button class="btn btn-primary" onclick="resetAreaFilter()"><i class="fas fa-redo"></i> عرض كل مناطق الخرطوم</button>
      </div>
    `;
    return;
  }

  // 2. Identify the Absolute Cheapest Available Pharmacy in current set
  const availableItems = filtered.filter(item => item.available);
  let minPrice = Infinity;
  let cheapestItem = null;

  availableItems.forEach(item => {
    if (item.price < minPrice) {
      minPrice = item.price;
      cheapestItem = item;
    }
  });

  // 3. Sort Results
  filtered.sort((a, b) => {
    if (currentSortOrder === 'price-asc') {
      // Put available first, then lowest price
      if (a.available !== b.available) return a.available ? -1 : 1;
      return a.price - b.price;
    } else if (currentSortOrder === 'price-desc') {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.price - a.price;
    } else {
      return a.pharmacy_name.localeCompare(b.pharmacy_name, 'ar');
    }
  });

  // 4. Construct Output HTML
  let html = '';

  // Medicine Info Card Banner
  html += `
    <div class="card" style="margin-bottom: 24px; border-right: 4px solid var(--primary);">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 56px; height: 56px; border-radius: 14px; background: #ecfdf5; display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--primary);">
            <i class="fas fa-pills"></i>
          </div>
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              ${matchedMedicine.name} 
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">(${matchedMedicine.dosage_form})</span>
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem;">
              المادة الفعالة: <strong>${matchedMedicine.generic_name}</strong> &bull; الشركة: <strong>${matchedMedicine.manufacturer}</strong> &bull; التركيز: <strong>${matchedMedicine.concentration}</strong>
            </p>
          </div>
        </div>
        <div>
          <span class="badge badge-area" style="font-size: 0.9rem; padding: 6px 14px;">
            <i class="fas fa-clinic-medical"></i> متوفر في ${availableItems.length} صيدليات
          </span>
        </div>
      </div>
    </div>
  `;

  // CHEAPEST WINNER HERO BANNER
  if (cheapestItem) {
    const pharmacyData = (window.PHARMACY_DATA ? window.PHARMACY_DATA.pharmacies : []).find(p => p.id === cheapestItem.pharmacy_id);
    html += `
      <div class="cheapest-highlight-banner">
        <div style="display: flex; align-items: center;">
          <div class="cheapest-badge-icon">
            <i class="fas fa-award"></i>
          </div>
          <div class="cheapest-banner-info">
            <div class="cheapest-banner-title">
              <span>أرخص سعر متوفر في ولاية الخرطوم</span>
              <span class="badge badge-cheapest"><i class="fas fa-star"></i> السعر الأقل</span>
            </div>
            <div class="cheapest-banner-desc">
              متوفر حالياً لدى <strong>${cheapestItem.pharmacy_name}</strong> - منطقة ${cheapestItem.area} (${cheapestItem.quantity_status})
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div class="cheapest-price-tag">
            <div style="font-size: 0.85rem; color: #047857; font-weight: 700;">سعر العبوة</div>
            <div class="cheapest-price-value">${cheapestItem.price.toLocaleString('ar-EG')} <span class="cheapest-price-currency">${cheapestItem.currency}</span></div>
          </div>
          <a href="pharmacy-details.html?id=${cheapestItem.pharmacy_id}" class="btn btn-primary" style="background-color: #047857;">
            <i class="fas fa-map-marker-alt"></i> التوجه للصيدلية
          </a>
        </div>
      </div>
    `;
  }

  // Comparison View: Table or Cards
  if (currentViewMode === 'table') {
    html += `
      <div class="table-responsive">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>الصيدلية</th>
              <th>المنطقة</th>
              <th>السعر</th>
              <th>حالة التوفر</th>
              <th>آخر تحديث</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(item => {
              const isCheapest = item.available && item.price === minPrice;
              return `
                <tr class="${isCheapest ? 'row-cheapest' : ''}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-clinic-medical" style="color: ${isCheapest ? '#059669' : '#94a3b8'};"></i>
                      <div>
                        <strong>${item.pharmacy_name}</strong>
                        ${isCheapest ? '<span class="badge badge-cheapest" style="margin-right: 8px;"><i class="fas fa-star"></i> أرخص سعر</span>' : ''}
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-area"><i class="fas fa-map-pin"></i> ${item.area}</span></td>
                  <td>
                    <div class="price-cell">
                      ${item.price.toLocaleString('ar-EG')} <span style="font-size: 0.85rem; font-weight: 500;">${item.currency}</span>
                    </div>
                  </td>
                  <td>
                    ${item.available 
                      ? `<span class="badge badge-available"><i class="fas fa-check-circle"></i> ${item.quantity_status}</span>` 
                      : `<span class="badge badge-unavailable"><i class="fas fa-times-circle"></i> غير متوفر</span>`}
                  </td>
                  <td style="color: var(--text-muted); font-size: 0.85rem;">
                    <i class="far fa-clock"></i> ${item.last_updated}
                  </td>
                  <td>
                    <a href="pharmacy-details.html?id=${item.pharmacy_id}" class="btn btn-sm ${isCheapest ? 'btn-primary' : 'btn-outline-primary'}">
                      عرض الصيدلية <i class="fas fa-arrow-left"></i>
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Cards View
    html += `
      <div class="comparison-cards-grid">
        ${filtered.map(item => {
          const isCheapest = item.available && item.price === minPrice;
          return `
            <div class="result-card ${isCheapest ? 'is-cheapest' : ''}">
              ${isCheapest ? '<div style="position: absolute; top: -12px; left: 16px;"><span class="badge badge-cheapest"><i class="fas fa-star"></i> أرخص سعر</span></div>' : ''}
              <div class="result-card-header">
                <div>
                  <h3 class="result-pharmacy-name">${item.pharmacy_name}</h3>
                  <div class="result-pharmacy-area"><i class="fas fa-map-marker-alt"></i> ${item.area}</div>
                </div>
                <div class="price-cell">
                  ${item.price.toLocaleString('ar-EG')} <small>${item.currency}</small>
                </div>
              </div>
              <div class="result-card-body">
                <div class="result-detail-row">
                  <span>التوفر:</span>
                  ${item.available 
                    ? `<span class="badge badge-available"><i class="fas fa-check"></i> ${item.quantity_status}</span>` 
                    : `<span class="badge badge-unavailable"><i class="fas fa-times"></i> غير متوفر</span>`}
                </div>
                <div class="result-detail-row">
                  <span>آخر تحديث:</span>
                  <span style="color: var(--text-muted);"><i class="far fa-clock"></i> ${item.last_updated}</span>
                </div>
              </div>
              <div class="result-card-footer">
                <a href="pharmacy-details.html?id=${item.pharmacy_id}" class="btn btn-block ${isCheapest ? 'btn-primary' : 'btn-outline-primary'}">
                  <i class="fas fa-clinic-medical"></i> عرض تفاصيل الصيدلية
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  resultsContainer.innerHTML = html;
}

window.resetAreaFilter = function() {
  currentAreaFilter = 'الكل';
  const filterElem = document.getElementById('areaFilter');
  if (filterElem) filterElem.value = 'الكل';
  renderCurrentSearchResults();
};
