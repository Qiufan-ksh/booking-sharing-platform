const API_BASE = window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`;

const tokenKey = 'hocLieuToken';
const userKey = 'hocLieuUser';
const accountLink = document.querySelector('#account-link');
const bookList = document.querySelector('#book-list');
const bookMessage = document.querySelector('#book-message');
const searchForm = document.querySelector('#search-form');
const shareForm = document.querySelector('#share-form');
const shareNotice = document.querySelector('#share-notice');
const recommendationSection = document.querySelector('#goiy');
const recommendationList = document.querySelector('#recommendation-list');

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem(userKey) || 'null');
    } catch {
        localStorage.removeItem(userKey);
        return null;
    }
}

function setMessage(element, text, isError = false) {
    element.textContent = text;
    element.classList.toggle('error', isError);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function safeUrl(value) {
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
}

async function apiRequest(path, options = {}) {
    const headers = { ...options.headers };
    const token = localStorage.getItem(tokenKey);

    if (options.body) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } catch {
        throw new Error(`Không thể kết nối backend tại ${API_BASE}. Hãy chạy backend và kiểm tra MySQL.`);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && token) {
            localStorage.removeItem(tokenKey);
            localStorage.removeItem(userKey);
            updateAccount();
        }
        throw new Error(result.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
    return result;
}

function bookCard(book) {
    const id = Number(book.id);
    if (!Number.isInteger(id) || id <= 0) return '';

    const fileUrl = safeUrl(book.fileUrl);
    const openLink = fileUrl
        ? `<a class="book-open" href="${escapeHtml(fileUrl)}" target="_blank" rel="noopener noreferrer" data-action="download" data-id="${id}">Mở tài liệu</a>`
        : '';

    return `<article class="card">
        <h3>${escapeHtml(book.title)}</h3>
        <p>Môn: ${escapeHtml(book.subject)}</p>
        <p>Ngành: ${escapeHtml(book.major)}</p>
        <div class="book-actions">
            ${openLink}
            <button type="button" data-action="view" data-id="${id}">Đã xem</button>
            <button type="button" data-action="favorite" data-id="${id}">Yêu thích</button>
            <button type="button" data-action="exchange" data-id="${id}">Quan tâm trao đổi</button>
        </div>
    </article>`;
}

async function loadBooks() {
    const query = new URLSearchParams();
    const search = String(new FormData(searchForm).get('search') || '').trim();
    if (search) query.set('search', search);

    bookList.replaceChildren();
    setMessage(bookMessage, 'Đang tải danh sách tài liệu...');
    try {
        const result = await apiRequest(`/books${query.size ? `?${query}` : ''}`);
        const cards = result.data.map(bookCard).filter(Boolean);
        if (cards.length) {
            bookList.innerHTML = cards.join('');
            setMessage(bookMessage, `Tìm thấy ${cards.length} tài liệu.`);
        } else {
            setMessage(bookMessage, 'Chưa có tài liệu phù hợp. Bạn có thể đăng tài liệu đầu tiên.');
        }
    } catch (error) {
        setMessage(bookMessage, error.message, true);
    }
}

async function recordInteraction(bookId, type) {
    if (!localStorage.getItem(tokenKey)) {
        setMessage(bookMessage, 'Đăng nhập để ghi nhận lượt xem, yêu thích hoặc quan tâm trao đổi.', true);
        return;
    }

    try {
        await apiRequest('/interactions', {
            method: 'POST',
            body: JSON.stringify({ bookId, type })
        });
        setMessage(bookMessage, 'Đã ghi nhận tương tác của bạn.');
        if (type !== 'VIEW') loadRecommendations();
    } catch (error) {
        setMessage(bookMessage, error.message, true);
    }
}

async function loadRecommendations() {
    const user = getStoredUser();
    if (!user || !localStorage.getItem(tokenKey)) {
        recommendationSection.hidden = true;
        return;
    }

    recommendationSection.hidden = false;
    recommendationList.replaceChildren();
    try {
        const result = await apiRequest(`/recommendations/${encodeURIComponent(user.id)}`);
        const cards = result.data.map(bookCard).filter(Boolean);
        if (cards.length) {
            recommendationList.innerHTML = cards.join('');
        } else {
            recommendationList.innerHTML = '<p class="book-message">Chưa có gợi ý phù hợp. Hãy xem hoặc yêu thích một số tài liệu.</p>';
        }
    } catch (error) {
        recommendationList.innerHTML = `<p class="book-message error">${escapeHtml(error.message)}</p>`;
    }
}

function updateAccount() {
    const user = getStoredUser();
    const loggedIn = Boolean(user && localStorage.getItem(tokenKey));
    shareForm.hidden = !loggedIn;
    accountLink.textContent = loggedIn ? `Đăng xuất (${user.username})` : 'Đăng nhập/Đăng ký';
    accountLink.href = loggedIn ? '#' : 'dangkidangnhap.html';
    if (!loggedIn) {
        recommendationSection.hidden = true;
        setMessage(shareNotice, 'Đăng nhập để chia sẻ tài liệu với cộng đồng.');
    } else {
        setMessage(shareNotice, '');
        loadRecommendations();
    }
}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    loadBooks();
});

document.querySelector('.timkiem input').addEventListener('input', () => {
    if (!document.querySelector('.timkiem input').value.trim()) loadBooks();
});

document.querySelectorAll('a[href="#traodoi"], .btn-batdau[href="#traodoi"]').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('#traodoi').scrollIntoView({ behavior: 'smooth' });
    });
});

shareForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!localStorage.getItem(tokenKey)) {
        setMessage(shareNotice, 'Vui lòng đăng nhập trước khi đăng tài liệu.', true);
        return;
    }

    const values = Object.fromEntries(new FormData(shareForm).entries());
    if (!values.fileUrl) delete values.fileUrl;
    try {
        await apiRequest('/books', { method: 'POST', body: JSON.stringify(values) });
        shareForm.reset();
        setMessage(shareNotice, 'Đăng tài liệu thành công.');
        await loadBooks();
    } catch (error) {
        setMessage(shareNotice, error.message, true);
    }
});

document.addEventListener('click', event => {
    if (event.target.closest('#account-link') && localStorage.getItem(tokenKey)) {
        event.preventDefault();
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        updateAccount();
        setMessage(shareNotice, 'Bạn đã đăng xuất.');
    }

    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const actionTypes = { view: 'VIEW', favorite: 'FAVORITE', exchange: 'EXCHANGE', download: 'DOWNLOAD' };
    const type = actionTypes[actionElement.dataset.action];
    if (type) recordInteraction(Number(actionElement.dataset.id), type);
});

updateAccount();
loadBooks();
