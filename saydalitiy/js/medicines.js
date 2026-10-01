/**
 * صيدليتنا - Saydalitiy
 * Medicines & Pharmacy Details Module (medicines.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMedicinesCatalog();
  initPharmacyDetails();
});

/* --------------------------------------------------------------------------
   1. Medicines Catalog Page (medicines.html)
   -------------------------------------------------------------------------- */
function initMedicinesCatalog() {
  const container = document.getElementById('medicinesCatalogContainer');
  if (!container) return;

  const medicines = window.PHARMACY_DATA ? window.PHARMACY_DATA.medicines : [];
  const searchInput = document.getElementById('medicineCatalogSearch');
  const categoryFilter = document.getElementById('categoryFilter');

  function renderList(query = '', category = 'الكل') {
    const filtered = medicines.filter(m => {
      const matchQ = !query || 
        m.name.toLowerCase().includes(query.toLowerCase()) || 
        (m.generic_name && m.generic_name.toLowerCase().includes(query.toLowerCase())) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(query.toLowerCase()));

      const matchCat = category === 'الكل' || m.category === category;
      return matchQ && matchCat;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="state-message-box" style="grid-column: 1 / -1;">
          <div class="state-icon not-found"><i class="fas fa-pills"></i></div>
          <h3 class="state-title">لا توجد أدوية مطابقة</h3>
          <p class="state-desc">لم نتمكن من العثور على أدوية مطابقة لبحثك. جرب كتابة اسم المادة الفعالة أو اسم تجاري آخر.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(m => {
      // Find lowest price
      const availableItems = m.availability.filter(a => a.available);
      let priceText = 'غير متوفر حالياً';
      let lowestPrice = null;

      if (availableItems.length > 0) {
        lowestPrice = Math.min(...availableItems.map(a => a.price));
        priceText = `يبدأ من ${lowestPrice.toLocaleString('ar-EG')} ج.س`;
      }

      return `
        <div class="card" style="display: flex; flex-direction: column;">
          <div style="height: 160px; background: #f8fafc; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; overflow: hidden;">
            <img src="${m.image}" alt="${m.name}" style="max-height: 100%; object-fit: contain;">
          </div>
          <div style="flex: 1;">
            <span class="badge badge-area" style="margin-bottom: 8px;">${m.category}</span>
            <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 4px;">${m.name}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;">${m.generic_name} &bull; ${m.concentration}</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 14px;">${m.description}</p>
          </div>
          <div style="border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: auto; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">أرخص سعر:</span>
              <strong style="color: ${lowestPrice ? 'var(--primary)' : 'var(--danger)'}; font-size: 1.05rem;">
                ${priceText}
              </strong>
            </div>
            <a href="search.html?q=${encodeURIComponent(m.name)}" class="btn btn-primary btn-sm">
              <i class="fas fa-search-dollar"></i> مقارنة الأسعار
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderList(e.target.value.trim(), categoryFilter ? categoryFilter.value : 'الكل');
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      renderList(searchInput ? searchInput.value.trim() : '', e.target.value);
    });
  }

  renderList();
}

/* --------------------------------------------------------------------------
   2. Pharmacy Details Page (pharmacy-details.html)
   -------------------------------------------------------------------------- */
function initPharmacyDetails() {
  const detailsContainer = document.getElementById('pharmacyDetailsView');
  if (!detailsContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const pharmacyId = parseInt(urlParams.get('id'), 10) || 1; // Default to first pharmacy if none provided

  const pharmacy = window.getPharmacyById ? window.getPharmacyById(pharmacyId) : null;

  if (!pharmacy) {
    detailsContainer.innerHTML = `
      <div class="state-message-box">
        <div class="state-icon not-found"><i class="fas fa-exclamation-triangle"></i></div>
        <h3 class="state-title">الصيدلية المطلوبة غير موجودة</h3>
        <p class="state-desc">تعذر العثور على بيانات الصيدلية المحددة، ربما تم تحديث الرابط أو إزالة الصيدلية.</p>
        <a href="pharmacies.html" class="btn btn-primary">العودة لدليل الصيدليات</a>
      </div>
    `;
    return;
  }

  // Get medicines in this pharmacy
  const pharmacyMedicines = window.getMedicinesByPharmacyId ? window.getMedicinesByPharmacyId(pharmacyId) : [];

  // Update Page Title
  document.title = `${pharmacy.name} | منصة صيدليتنا - ولاية الخرطوم`;

  const isOpen = pharmacy.status === 'open';

  detailsContainer.innerHTML = `
    <!-- Header Hero Banner -->
    <div class="pharmacy-detail-hero">
      <div class="container">
        <div class="pharmacy-detail-header">
          <div class="pharmacy-detail-info">
            <div class="pharmacy-badges-row">
              <span class="badge ${isOpen ? 'badge-open' : 'badge-closed'}">
                <i class="fas ${isOpen ? 'fa-door-open' : 'fa-door-closed'}"></i> ${pharmacy.status_text}
              </span>
              <span class="badge badge-area">
                <i class="fas fa-map-pin"></i> ولاية الخرطوم - ${pharmacy.area}
              </span>
              ${pharmacy.is_24h ? '<span class="badge badge-cheapest"><i class="fas fa-history"></i> خدمة 24 ساعة</span>' : ''}
              ${pharmacy.delivery_available ? '<span class="badge badge-available"><i class="fas fa-motorcycle"></i> خدمة التوصيل متوفرة</span>' : ''}
            </div>

            <h1>${pharmacy.name}</h1>
            <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 20px;">
              <i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> ${pharmacy.address}
            </p>

            <div class="pharmacy-quick-contact">
              <a href="tel:${pharmacy.phone}" class="btn btn-primary btn-lg">
                <i class="fas fa-phone-alt"></i> اتصل بالصيدلية (${pharmacy.phone})
              </a>
              ${pharmacy.whatsapp ? `
                <a href="https://wa.me/${pharmacy.whatsapp}" target="_blank" rel="noopener" class="btn btn-outline" style="color: #25d366; border-color: #25d366;">
                  <i class="fab fa-whatsapp"></i> مراسلة عبر واتساب
                </a>
              ` : ''}
              <button class="btn btn-light" onclick="copyPharmacyPhone('${pharmacy.phone}')">
                <i class="fas fa-copy"></i> نسخ الرقم
              </button>
            </div>
          </div>

          <div style="width: 240px; text-align: center;">
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm);">
              <div style="font-size: 2.2rem; font-weight: 900; color: #f59e0b; margin-bottom: 4px;">
                <i class="fas fa-star"></i> ${pharmacy.rating}
              </div>
              <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px;">بناءً على ${pharmacy.reviews_count} تقييم</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid #f1f5f9; padding-top: 10px;">
                <strong>ساعات العمل:</strong><br>${pharmacy.working_hours}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="container">
      <div class="pharmacy-details-grid">
        
        <!-- Left: Medicines Inventory in this Pharmacy -->
        <div>
          <div class="card" style="margin-bottom: 30px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                  <i class="fas fa-boxes" style="color: var(--primary);"></i> قائمة الأدوية المسجلة في هذه الصيدلية
                </h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">الأسعار وتوفر الأدوية كما يتم تحديثها بواسطة الصيدلية</p>
              </div>
              <div>
                <input type="text" id="internalSearch" placeholder="ابحث عن دواء في هذه الصيدلية..." 
                  style="padding: 8px 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; outline: none; width: 260px;">
              </div>
            </div>

            <!-- Medicines Table -->
            <div class="table-responsive">
              <table class="comparison-table" id="pharmacyMedicinesTable">
                <thead>
                  <tr>
                    <th>اسم الدواء</th>
                    <th>الشكل والتركيز</th>
                    <th>السعر</th>
                    <th>الحالة</th>
                    <th>آخر تحديث</th>
                    <th>مقارنة</th>
                  </tr>
                </thead>
                <tbody id="pharmacyMedicinesTbody">
                  ${renderPharmacyMedicinesRows(pharmacyMedicines)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Pharmacy Meta, Location & Hours -->
        <div>
          <div class="card" style="margin-bottom: 24px;">
            <h4 style="font-weight: 800; margin-bottom: 16px; color: #0f172a;">
              <i class="fas fa-map-marked-alt" style="color: var(--secondary);"></i> موقع الصيدلية على الخريطة
            </h4>
            <div class="map-card-placeholder">
              <i class="fas fa-map-marker-alt" style="font-size: 40px; color: #ef4444; margin-bottom: 10px;"></i>
              <strong style="color: #0f172a;">${pharmacy.name}</strong>
              <p style="font-size: 0.85rem; color: #475569; margin-top: 4px;">${pharmacy.address}</p>
              <a href="https://maps.google.com/?q=${pharmacy.coordinates.lat},${pharmacy.coordinates.lng}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary" style="margin-top: 14px; background: white;">
                <i class="fas fa-external-link-alt"></i> فتح في خرائط Google
              </a>
            </div>
          </div>

          <div class="card">
            <h4 style="font-weight: 800; margin-bottom: 16px; color: #0f172a;">
              <i class="fas fa-info-circle" style="color: var(--primary);"></i> معلومات الصيدلية
            </h4>
            <ul style="display: flex; flex-direction: column; gap: 14px; font-size: 0.95rem;">
              <li style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);"><i class="fas fa-city"></i> الولاية والمدينة:</span>
                <strong>ولاية الخرطوم - ${pharmacy.area}</strong>
              </li>
              <li style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);"><i class="fas fa-clock"></i> ساعات الدوام:</span>
                <strong>${pharmacy.working_hours}</strong>
              </li>
              <li style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);"><i class="fas fa-phone"></i> رقم الهاتف المباشر:</span>
                <strong dir="ltr">${pharmacy.phone}</strong>
              </li>
              <li style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);"><i class="fas fa-motorcycle"></i> خدمة التوصيل المنزلي:</span>
                <strong>${pharmacy.delivery_available ? 'متاح للطلب' : 'غير متوفر'}</strong>
              </li>
              <li style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);"><i class="far fa-calendar-check"></i> آخر تدقيق بيانات:</span>
                <span>${window.PHARMACY_DATA.last_updated}</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  `;

  // Internal search filter for medicines in this pharmacy
  const internalSearch = document.getElementById('internalSearch');
  if (internalSearch) {
    internalSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const tbody = document.getElementById('pharmacyMedicinesTbody');
      if (!tbody) return;

      const filteredMeds = pharmacyMedicines.filter(item => 
        item.medicine.name.toLowerCase().includes(q) ||
        (item.medicine.generic_name && item.medicine.generic_name.toLowerCase().includes(q))
      );

      tbody.innerHTML = renderPharmacyMedicinesRows(filteredMeds);
    });
  }
}

function renderPharmacyMedicinesRows(items) {
  if (!items || items.length === 0) {
    return `
      <tr>
        <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
          لا توجد أدوية مطابقة للبحث في هذه الصيدلية.
        </td>
      </tr>
    `;
  }

  return items.map(item => {
    const med = item.medicine;
    const det = item.details;
    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${med.name}</div>
          <small style="color: var(--text-muted);">${med.generic_name}</small>
        </td>
        <td>${med.dosage_form} - ${med.concentration}</td>
        <td>
          <span class="price-cell">${det.price.toLocaleString('ar-EG')} <small>${det.currency}</small></span>
        </td>
        <td>
          ${det.available 
            ? `<span class="badge badge-available"><i class="fas fa-check"></i> ${det.quantity_status}</span>` 
            : `<span class="badge badge-unavailable"><i class="fas fa-times"></i> نفد</span>`}
        </td>
        <td style="color: var(--text-muted); font-size: 0.85rem;">${det.last_updated}</td>
        <td>
          <a href="search.html?q=${encodeURIComponent(med.name)}" class="btn btn-sm btn-outline-primary" title="مقارنة سعره في كل الصيدليات">
            <i class="fas fa-search-dollar"></i> مقارنة
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

window.copyPharmacyPhone = function(phone) {
  navigator.clipboard.writeText(phone).then(() => {
    showToast(`تم نسخ رقم الهاتف (${phone}) بنجاح`, 'info');
  }).catch(() => {
    showToast(`رقم الصيدلية: ${phone}`, 'info');
  });
};
