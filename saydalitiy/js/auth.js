/**
 * صيدليتنا - Saydalitiy
 * Authentication Module (auth.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
});

/* Handle Login Form */
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const identityInput = document.getElementById('loginIdentity');
    const passwordInput = document.getElementById('loginPassword');
    const rememberMe = document.getElementById('rememberMe');

    let isValid = true;

    // Reset error states
    clearInputErrors(loginForm);

    // Validate identity (email or phone)
    if (!identityInput.value.trim()) {
      showFieldError(identityInput, 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف');
      isValid = false;
    }

    // Validate password
    if (!passwordInput.value.trim()) {
      showFieldError(passwordInput, 'يرجى إدخال كلمة المرور');
      isValid = false;
    } else if (passwordInput.value.length < 6) {
      showFieldError(passwordInput, 'كلمة المرور يجب أن لا تقل عن 6 أحرف');
      isValid = false;
    }

    if (!isValid) return;

    // Submit animation / Mock authentication
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';

    setTimeout(() => {
      // Mock user creation
      const user = {
        name: identityInput.value.includes('@') ? identityInput.value.split('@')[0] : 'أحمد عثمان',
        identifier: identityInput.value.trim(),
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('saydalitiy_user', JSON.stringify(user));
      showToast('مرحباً بك مجدداً! تم تسجيل الدخول بنجاح', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }, 800);
  });
}

/* Handle Registration Form */
function initRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('regName');
    const phoneInput = document.getElementById('regPhone');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('regConfirmPassword');
    const termsCheckbox = document.getElementById('regTerms');

    let isValid = true;
    clearInputErrors(registerForm);

    // Validate Name
    if (!nameInput.value.trim()) {
      showFieldError(nameInput, 'يرجى إدخال الاسم بالكامل');
      isValid = false;
    } else if (nameInput.value.trim().length < 3) {
      showFieldError(nameInput, 'يجب أن يكون الاسم 3 أحرف على الأقل');
      isValid = false;
    }

    // Validate Phone (Sudan phone format loosely checked)
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal) {
      showFieldError(phoneInput, 'يرجى إدخال رقم الهاتف في السودان');
      isValid = false;
    } else if (!/^(09|01|249|\+249)[0-9]{8,9}$/.test(phoneVal.replace(/\s+/g, ''))) {
      showFieldError(phoneInput, 'يرجى إدخال رقم هاتف سوداني صحيح (مثال: 0912345678)');
      isValid = false;
    }

    // Validate Email
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      showFieldError(emailInput, 'يرجى إدخال البريد الإلكتروني');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      showFieldError(emailInput, 'صيغة البريد الإلكتروني غير صحيحة');
      isValid = false;
    }

    // Validate Password
    if (!passwordInput.value) {
      showFieldError(passwordInput, 'يرجى كتابة كلمة المرور');
      isValid = false;
    } else if (passwordInput.value.length < 6) {
      showFieldError(passwordInput, 'كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام');
      isValid = false;
    }

    // Validate Password Match
    if (passwordInput.value !== confirmPasswordInput.value) {
      showFieldError(confirmPasswordInput, 'كلمتا المرور غير متطابقتين');
      isValid = false;
    }

    // Validate Terms Agreement
    if (!termsCheckbox.checked) {
      showToast('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة', 'warning');
      isValid = false;
    }

    if (!isValid) return;

    // Simulate Registration Success
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';

    setTimeout(() => {
      const user = {
        name: nameInput.value.trim(),
        phone: phoneVal,
        email: emailVal,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('saydalitiy_user', JSON.stringify(user));
      showToast('تم إنشاء الحساب بنجاح! أهلاً بك في منصة صيدليتنا', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    }, 1000);
  });
}

function showFieldError(inputElem, message) {
  const formGroup = inputElem.closest('.form-group');
  if (formGroup) {
    formGroup.classList.add('has-error');
    let errorElem = formGroup.querySelector('.input-error');
    if (!errorElem) {
      errorElem = document.createElement('div');
      errorElem.className = 'input-error';
      formGroup.appendChild(errorElem);
    }
    errorElem.textContent = message;
    errorElem.style.display = 'block';
  }
}

function clearInputErrors(form) {
  const errorGroups = form.querySelectorAll('.form-group.has-error');
  errorGroups.forEach(g => {
    g.classList.remove('has-error');
    const err = g.querySelector('.input-error');
    if (err) err.style.display = 'none';
  });
}

/* Forgot password handler */
window.handleForgotPassword = function(e) {
  if (e) e.preventDefault();
  const identity = prompt('يرجى كتابة بريدك الإلكتروني أو رقم هاتفك لإرسال رابط استعادة كلمة المرور:');
  if (identity && identity.trim()) {
    showToast(`تم إرسال تعليمات إعادة التعيين إلى ${identity.trim()}`, 'info');
  }
};
