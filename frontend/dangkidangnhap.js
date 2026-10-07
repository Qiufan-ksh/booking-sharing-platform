const API_BASE = window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`;

const container = document.querySelector('.container');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const loginMessage = document.querySelector('#login-message');
const registerMessage = document.querySelector('#register-message');

function setMessage(element, message, success = false) {
    element.textContent = message;
    element.classList.toggle('success', success);
}

async function sendAuthRequest(endpoint, form, messageElement) {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setMessage(messageElement, 'Đang xử lý...');

    try {
        const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.');
        }
        if (!result.token || !result.data) {
            throw new Error('Phản hồi từ máy chủ không hợp lệ.');
        }

        localStorage.setItem('hocLieuToken', result.token);
        localStorage.setItem('hocLieuUser', JSON.stringify(result.data));
        setMessage(messageElement, endpoint === 'register' ? 'Đăng ký thành công. Đang chuyển về trang chủ...' : 'Đăng nhập thành công. Đang chuyển về trang chủ...', true);
        form.reset();
        window.location.assign(new URL('giaodien.html', window.location.href));
    } catch (error) {
        const message = error instanceof TypeError
            ? 'Không kết nối được backend. Hãy kiểm tra máy chủ tại cổng 5000.'
            : error.message;
        setMessage(messageElement, message);
    } finally {
        button.disabled = false;
    }
}

document.querySelector('.register-btn').addEventListener('click', () => {
    container.classList.add('active');
    setMessage(loginMessage, '');
});

document.querySelector('.login-btn').addEventListener('click', () => {
    container.classList.remove('active');
    setMessage(registerMessage, '');
});

loginForm.addEventListener('submit', event => {
    event.preventDefault();
    sendAuthRequest('login', loginForm, loginMessage);
});

registerForm.addEventListener('submit', event => {
    event.preventDefault();
    sendAuthRequest('register', registerForm, registerMessage);
});

document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
        const passwordInput = button.closest('.input-box').querySelector('input');
        const icon = button.querySelector('i');
        const showPassword = passwordInput.type === 'password';

        passwordInput.type = showPassword ? 'text' : 'password';
        button.setAttribute('aria-pressed', String(showPassword));
        button.setAttribute('aria-label', showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
        icon.classList.toggle('fa-eye', !showPassword);
        icon.classList.toggle('fa-eye-slash', showPassword);
    });
});
