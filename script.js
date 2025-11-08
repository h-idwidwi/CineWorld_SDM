import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';
import localeEn from 'air-datepicker/locale/en';

// Календарь и задний фон при открытии календаря
const dp = new AirDatepicker('.form__date-of-birth', {
    locale: localeEn,
    dateFormat: 'yyyy-MM-dd',
    autoClose: false,
    inline: false,
    overlay: true,
    onRenderCell({ date, cellType }) {
        if (cellType === 'day') return { classes: 'hover-day-cell' };
        if (cellType === 'month') return { classes: 'hover-month-cell' };
        if (cellType === 'year') return { classes: 'hover-year-cell' };
    },
    position({ $datepicker, $pointer }) {
        const top = window.innerHeight / 2 - $datepicker.clientHeight / 2;
        const left = window.innerWidth / 2 - $datepicker.clientWidth / 2;
        $datepicker.style.position = 'fixed';
        $datepicker.style.top = `${top}px`;
        $datepicker.style.left = `${left}px`;
        $datepicker.style.transform = 'none';
        $datepicker.style.zIndex = '9999';
        if ($pointer) $pointer.style.display = 'none';
    },
    onShow({ datepicker }) {
        var theme = getCookie('theme');
        var color;
        if (theme === 'light') {
            var color = '#242527';
        }

        else {
            color = '#BD9BE9';
        }
        document.body.style.overflow = 'hidden';
        if (!document.getElementById('datepicker-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'datepicker-overlay';
            Object.assign(overlay.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: color,
                opacity: '0.5',
                zIndex: '9998'
            });
            document.body.appendChild(overlay);
        }
    },
    onHide() {
        document.body.style.overflow = '';
        const overlay = document.getElementById('datepicker-overlay');
        if (overlay) overlay.remove();
    },
});

// Выпадающий список и крестик в поле ввода
document.querySelector('.dropdown').addEventListener('change', function() {
    this.classList.toggle('dropdown__item--active', !!this.value);
});

const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');

inputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.value) input.classList.add('form__cross-visible');
        else input.classList.remove('form__cross-visible');
    });

    input.addEventListener('click', (e) => {
        const bounds = input.getBoundingClientRect();
        const clickX = e.clientX - bounds.left;
        if (clickX > bounds.width - 36 && input.value) {
            input.value = '';
            input.classList.remove('form__cross-visible');
        }
    });
});

const dropdowns = document.querySelectorAll(".dropdown__field");

dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector(".dropdown");
    const dropdown__menu = dropdown.querySelector(".dropdown__menu");
    const options = dropdown.querySelectorAll(".dropdown__menu li");
    const selected = dropdown.querySelector(".selected");

    select.addEventListener("click", () => {
        select.classList.toggle('dropdown--clicked');
        dropdown__menu.classList.toggle('menu-open');
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;
            selected.classList.add('dropdown__field--blacktext');
            select.classList.remove('dropdown--clicked');
            dropdown__menu.classList.remove('menu-open');
            options.forEach(opt => {
                opt.classList.remove('dropdown__item--active');
                opt.classList.remove('dropdown__field--blacktext');
            });
            option.classList.add('dropdown__item--active');
            option.classList.add('dropdown__field--blacktext');
        });
    });
});

// Валидация
const registerButton = document.querySelector('.button--register');
const firstName = document.querySelector('input[placeholder="Thomas"]');
const lastName = document.querySelector('input[placeholder="Edisson"]');
const email = document.querySelector('input[type="email"]');
const passwords = document.querySelectorAll('input[type="password"]');
const consentCheckbox = document.querySelectorAll('.checkbox__input')[1];

const requiredInputs = [firstName, lastName, email, ...passwords, consentCheckbox];

function updateButtonState() {
    const allFilled = requiredInputs.every(input => {
        if (input.type === 'checkbox') {
            return input.checked;
        }
        return input.value.trim() !== '';
    });
    registerButton.disabled = !allFilled;
}

function showError(field) {
    const parent = field.parentElement;
    const prevError = parent.querySelector('.form__input--text-invalid');
    if (prevError) {
        prevError.remove();
    }
    field.classList.add('form__input--invalid');
    const error = document.createElement('span');
    error.classList.add('form__input--text-invalid', 'font-bold-14');
    error.textContent = 'Please enter a valid value';
    parent.appendChild(error);
}

function clearError(field) {
    const parent = field.parentElement;
    const prevError = parent.querySelector('.form__input--text-invalid');
    if (prevError) {
        prevError.remove();
    }
    field.classList.remove('form__input--invalid');
}

requiredInputs.forEach(input => {
    if (input.type === 'checkbox') {
        input.addEventListener('change', updateButtonState);
    } 
    else {
        input.addEventListener('input', () => {
            clearError(input);
            updateButtonState();
        });
    }
});

registerButton.addEventListener('click', (e) => {
    e.preventDefault();
    let valid = true;

    [firstName, lastName].forEach(input => {
        if (input.value.trim().length < 2 || input.value.includes(' ')) {
            showError(input);
            valid = false;
        }
    });

    if (!isValidEmail(email.value)) {
        showError(email);
        valid = false;
    }

    passwords.forEach(password => {
        if (password.value.length < 6) {
            showError(password);
            valid = false;
        }
    });

    if (passwords[0].value !== passwords[1].value) {
        passwords.forEach(password => showError(password));
        valid = false;
    }

    if (!consentCheckbox.checked) {
        showError(consentCheckbox);
        valid = false;
    }

    updateButtonState();

    if (valid) {
        window.location.href = 'successfulRegistration.html';
    }
});

updateButtonState();

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Смена темы через хранение в куки
const themeSwitch = document.querySelector('.switch-theme__checkbox');
const themeLink = document.getElementById('theme');
const headerLogo = document.querySelector('.header-logo');

if (themeSwitch && themeLink) {
    const setCookie = (name, value, days = 365) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    };

    const getCookie = (name) => {
        const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return match ? match.pop() : null;
    };

    const savedTheme = getCookie('theme');
    if (savedTheme === 'dark') {
        themeLink.href = 'darkTheme.css';
        headerLogo.src = 'images/logo_dark.svg';
        themeSwitch.checked = true;
    } else {
        themeLink.href = 'style.css';
        headerLogo.src = 'images/logo.svg'
        themeSwitch.checked = false;
    }

    themeSwitch.addEventListener('click', () => {
        if (themeSwitch.checked) {
            themeLink.href = 'darkTheme.css';
            headerLogo.src = 'images/logo_dark.svg';
            setCookie('theme', 'dark');
        } else {
            themeLink.href = 'style.css';
            headerLogo.src = 'images/logo.svg'
            setCookie('theme', 'light');
        }
    });
}

function getCookie(name) {
        const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return match ? match.pop() : null;
    };