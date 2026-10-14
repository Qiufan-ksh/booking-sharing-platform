(() => {
    const API_BASE = window.location.protocol === 'file:'
        ? 'http://localhost:5000/api'
        : `${window.location.origin}/api`;
    const TOKEN_KEY = 'hocLieuToken';
    const USER_KEY = 'hocLieuUser';
    const DATA_KEY = 'studyShareFrontendData';
    const page = document.body.dataset.page;
    const byId = id => document.getElementById(id);
    const localData = readLocalData();
    let books = [];
    let editingId = null;

    function readLocalData() {
        try {
            const data = JSON.parse(localStorage.getItem(DATA_KEY) || '{}');
            return {
                metadata: data.metadata && typeof data.metadata === 'object' ? data.metadata : {},
                favorites: Array.isArray(data.favorites) ? data.favorites.map(Number) : [],
                history: Array.isArray(data.history) ? data.history.map(Number) : [],
                searchHistory: Array.isArray(data.searchHistory) ? data.searchHistory.filter(value => typeof value === 'string') : [],
                myBookIds: Array.isArray(data.myBookIds) ? data.myBookIds.map(Number) : [],
                hiddenIds: Array.isArray(data.hiddenIds) ? data.hiddenIds.map(Number) : [],
                interactions: data.interactions && typeof data.interactions === 'object' ? data.interactions : {},
                profile: data.profile && typeof data.profile === 'object' ? data.profile : {},
                messages: Array.isArray(data.messages) ? data.messages : []
            };
        } catch {
            localStorage.removeItem(DATA_KEY);
            return { metadata: {}, favorites: [], history: [], searchHistory: [], myBookIds: [], hiddenIds: [], interactions: {}, profile: {}, messages: [] };
        }
    }

    function saveLocalData() {
        try {
            localStorage.setItem(DATA_KEY, JSON.stringify(localData));
            return true;
        } catch (error) {
            console.error('Không thể lưu dữ liệu StudyShare trên thiết bị:', error);
            return false;
        }
    }

    function user() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        } catch {
            localStorage.removeItem(USER_KEY);
            return null;
        }
    }

    function loggedIn() {
        return Boolean(user() && localStorage.getItem(TOKEN_KEY));
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
    }

    function safeUrl(value) {
        try {
            const url = new URL(value);
            return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
        } catch {
            return '';
        }
    }

    function safeAttachment(value) {
        return typeof value === 'string'
            && /^data:application\/(?:pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation);base64,[A-Za-z0-9+/=]+$/.test(value)
            ? value
            : '';
    }

    function withMetadata(book) {
        return { ...book, ...(localData.metadata[book.id] || {}), id: Number(book.id) };
    }

    function updateLayout() {
        const accountLink = byId('account-link');
        if (accountLink) {
            if (loggedIn()) {
                const current = user();
                accountLink.textContent = `Hồ sơ (${current.username || current.fullName || 'Sinh viên'})`;
                accountLink.href = 'hoso.html';
            } else {
                accountLink.textContent = 'Đăng nhập/Đăng ký';
                accountLink.href = 'dangkidangnhap.html';
            }
        }
        const toggle = byId('darkMode');
        if (toggle) {
            toggle.checked = localStorage.getItem('studyShareDarkMode') === 'true';
            document.body.classList.toggle('dark-theme', toggle.checked);
            toggle.addEventListener('change', () => {
                localStorage.setItem('studyShareDarkMode', String(toggle.checked));
                document.body.classList.toggle('dark-theme', toggle.checked);
            });
        }
    }

    async function api(path, options = {}) {
        const headers = { ...options.headers };
        const token = localStorage.getItem(TOKEN_KEY);
        if (options.body) headers['Content-Type'] = 'application/json';
        if (token) headers.Authorization = `Bearer ${token}`;
        let response;
        try {
            response = await fetch(`${API_BASE}${path}`, { ...options, headers });
        } catch {
            throw new Error(`Không thể kết nối backend tại ${API_BASE}. Hãy chạy backend và kiểm tra MySQL.`);
        }
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        return result;
    }

    function bookCard(raw, owner = false) {
        const book = withMetadata(raw);
        const detailUrl = `chitiet.html?id=${encodeURIComponent(book.id)}`;
        const fileUrl = safeUrl(book.fileUrl) || safeAttachment(book.attachment);
        const coverUrl = safeUrl(book.coverUrl);
        const actions = owner
            ? `<button type="button" data-action="edit" data-id="${book.id}">Sửa</button>
               <button type="button" data-action="hide" data-id="${book.id}">${localData.hiddenIds.includes(book.id) ? 'Hiện lại' : 'Ẩn'}</button>
               <button type="button" data-action="remove" data-id="${book.id}">Gỡ khỏi mục của tôi</button>`
            : `<a class="book-open" href="${detailUrl}">Chi tiết</a>
               <button type="button" data-action="favorite" data-id="${book.id}">${localData.favorites.includes(book.id) ? 'Bỏ yêu thích' : 'Yêu thích'}</button>
               <a class="book-open" href="${detailUrl}#traodoi">Trao đổi</a>`;
        const badges = [book.format || (book.fileUrl ? 'Tài liệu số' : 'Sách giấy'), book.shareType || 'Tải tài liệu']
            .map(value => `<span class="book-badge">${escapeHtml(value)}</span>`).join('');
        return `<article class="card">
            <div class="book-cover" aria-hidden="true">${coverUrl ? `<img src="${escapeHtml(coverUrl)}" alt="">` : 'StudyShare'}</div>
            <div class="book-badges">${badges}</div>
            <h3>${escapeHtml(book.title)}</h3>
            <p>Tác giả: ${escapeHtml(book.author || 'Chưa cập nhật')}</p>
            <p>Môn: ${escapeHtml(book.subject)}</p>
            <p>Ngành: ${escapeHtml(book.major)}</p>
            <p>Tình trạng: ${escapeHtml(book.status || 'Còn sẵn')}</p>
            <p class="card-description">${escapeHtml(book.description || '')}</p>
            <div class="book-actions">
                ${fileUrl ? `<a class="book-open" href="${escapeHtml(fileUrl)}" target="_blank" rel="noopener noreferrer" data-action="download" data-id="${book.id}">Tải tài liệu</a>` : ''}
                ${actions}
            </div>
        </article>`;
    }

    function renderCards(element, list, emptyMessage, owner = false) {
        if (!element) return;
        element.innerHTML = list.length
            ? list.map(item => bookCard(item, owner)).join('')
            : `<p class="book-message">${escapeHtml(emptyMessage)}</p>`;
    }

    async function loadBooks() {
        try {
            const result = await api('/books');
            if (!Array.isArray(result.data)) throw new Error('Danh sách tài liệu từ máy chủ không hợp lệ.');
            books = result.data.map(withMetadata);
            return books;
        } catch (error) {
            const status = byId('page-message');
            if (status) {
                status.textContent = error.message;
                status.classList.add('error');
            }
            return [];
        }
    }

    function saveSearch(value) {
        const query = value.trim();
        if (!query) return;
        localData.searchHistory = [query, ...localData.searchHistory.filter(item => item.toLocaleLowerCase('vi') !== query.toLocaleLowerCase('vi'))].slice(0, 12);
        saveLocalData();
    }

    function recordView(id) {
        localData.history = [Number(id), ...localData.history.filter(item => item !== Number(id))].slice(0, 30);
        saveLocalData();
    }

    async function track(id, type) {
        if (!loggedIn()) {
            alert('Vui lòng đăng nhập để sử dụng chức năng này.');
            return false;
        }
        try {
            await api('/interactions', { method: 'POST', body: JSON.stringify({ bookId: Number(id), type }) });
            const key = Number(id);
            localData.interactions[key] = Number(localData.interactions[key] || 0) + 1;
            if (type === 'VIEW') recordView(key);
            else saveLocalData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    async function initHome() {
        const list = (await loadBooks()).filter(book => !loggedIn() || !localData.hiddenIds.includes(book.id));
        const newest = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const popular = [...list].sort((a, b) => Number(localData.interactions[b.id] || 0) - Number(localData.interactions[a.id] || 0));
        renderCards(byId('new-book-list'), newest.slice(0, 3), 'Chưa có tài liệu mới.');
        renderCards(byId('popular-book-list'), popular.slice(0, 3), 'Chưa có tài liệu phổ biến.');
        const majors = [...new Set(list.map(book => book.major).filter(Boolean))].sort();
        const subjects = [...new Set(list.map(book => book.subject).filter(Boolean))].sort();
        const categories = [...majors.map(value => ['major', value]), ...subjects.map(value => ['subject', value])];
        const categoryList = byId('category-list');
        if (categoryList) categoryList.innerHTML = categories.length
            ? categories.map(([kind, value]) => `<a class="category-chip" href="tailieu.html?${kind}=${encodeURIComponent(value)}">${escapeHtml(value)}</a>`).join('')
            : '<p class="book-message">Danh mục sẽ xuất hiện khi có tài liệu.</p>';
        if (loggedIn()) {
            byId('recommendations').hidden = false;
            try {
                const result = await api(`/recommendations/${encodeURIComponent(user().id)}`);
                renderCards(byId('recommendation-list'), result.data || [], 'Chưa có gợi ý phù hợp. Hãy tương tác với tài liệu để nhận gợi ý.');
            } catch (error) {
                byId('recommendation-list').innerHTML = `<p class="book-message error">${escapeHtml(error.message)}</p>`;
            }
        }
        byId('quick-search').addEventListener('submit', event => {
            event.preventDefault();
            const query = event.currentTarget.elements.search.value.trim();
            saveSearch(query);
            window.location.assign(`tailieu.html${query ? `?search=${encodeURIComponent(query)}` : ''}`);
        });
    }

    function populateSelect(select, options, label, selected = '') {
        select.innerHTML = `<option value="">${label}</option>` + options.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
        if (options.includes(selected)) select.value = selected;
    }

    async function initSearch() {
        const list = (await loadBooks()).filter(book => !loggedIn() || !localData.hiddenIds.includes(book.id));
        const form = byId('filter-form');
        const input = byId('search-input');
        const params = new URLSearchParams(location.search);
        const majors = [...new Set(list.map(book => book.major).filter(Boolean))].sort();
        const subjects = [...new Set(list.map(book => book.subject).filter(Boolean))].sort();
        populateSelect(form.elements.major, majors, 'Tất cả ngành học', params.get('major'));
        populateSelect(form.elements.subject, subjects, 'Tất cả môn học', params.get('subject'));
        input.value = params.get('search') || '';
        const render = () => {
            const values = new FormData(form);
            const query = input.value.trim().toLocaleLowerCase('vi');
            const filtered = list.filter(book => {
                const allFields = [book.title, book.author, book.subject, book.major, book.description].join(' ').toLocaleLowerCase('vi');
                return (!query || allFields.includes(query))
                    && (!values.get('major') || book.major === values.get('major'))
                    && (!values.get('subject') || book.subject === values.get('subject'))
                    && (!values.get('documentType') || (book.documentType || 'Giáo trình') === values.get('documentType'))
                    && (!values.get('format') || (book.format || 'PDF') === values.get('format'))
                    && (!values.get('shareType') || (book.shareType || 'Tải tài liệu') === values.get('shareType'));
            });
            if (values.get('sort') === 'newest') filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            else if (values.get('sort') === 'popular') filtered.sort((a, b) => Number(localData.interactions[b.id] || 0) - Number(localData.interactions[a.id] || 0));
            else if (query) filtered.sort((a, b) => Number(!a.title.toLocaleLowerCase('vi').includes(query)) - Number(!b.title.toLocaleLowerCase('vi').includes(query)));
            renderCards(byId('book-list'), filtered, 'Không tìm thấy tài liệu phù hợp.');
            byId('result-count').textContent = `Tìm thấy ${filtered.length} tài liệu.`;
        };
        form.addEventListener('change', render);
        input.addEventListener('input', render);
        byId('search-form').addEventListener('submit', event => {
            event.preventDefault();
            saveSearch(input.value);
            render();
        });
        render();
    }

    async function initDetail() {
        const id = Number(new URLSearchParams(location.search).get('id'));
        const list = await loadBooks();
        const book = list.find(item => item.id === id);
        const detail = byId('book-detail');
        if (!book) {
            detail.innerHTML = '<p class="book-message">Không tìm thấy tài liệu này.</p><a class="btn-batdau" href="tailieu.html">Quay lại danh sách</a>';
            return;
        }
        const fileUrl = safeUrl(book.fileUrl) || safeAttachment(book.attachment);
        const coverUrl = safeUrl(book.coverUrl);
        detail.innerHTML = `<article class="detail-panel">
            <div class="book-cover detail-cover" aria-hidden="true">${coverUrl ? `<img src="${escapeHtml(coverUrl)}" alt="">` : 'StudyShare'}</div>
            <div class="book-badges"><span class="book-badge">${escapeHtml(book.format || 'PDF')}</span><span class="book-badge">${escapeHtml(book.shareType || 'Tải tài liệu')}</span></div>
            <h1>${escapeHtml(book.title)}</h1>
            <p><strong>Tác giả:</strong> ${escapeHtml(book.author || 'Chưa cập nhật')}</p>
            <p><strong>Mô tả:</strong> ${escapeHtml(book.description || 'Chưa có mô tả.')}</p>
            <p><strong>Ngành học:</strong> ${escapeHtml(book.major)}</p>
            <p><strong>Môn học:</strong> ${escapeHtml(book.subject)}</p>
            <p><strong>Năm xuất bản:</strong> ${escapeHtml(book.publicationYear || 'Chưa cập nhật')}</p>
            <p><strong>Định dạng:</strong> ${escapeHtml(book.format || (fileUrl ? 'Tài liệu số' : 'Sách giấy'))}</p>
            <p><strong>Tình trạng:</strong> ${escapeHtml(book.status || 'Còn sẵn')}</p>
            <p><strong>Người đăng:</strong> ${escapeHtml(book.postedBy || 'Chưa cập nhật')}</p>
            <p><strong>Hình thức trao đổi:</strong> ${escapeHtml(book.shareType || 'Tải tài liệu')}</p>
            ${fileUrl ? `<a class="book-open" href="${escapeHtml(fileUrl)}" target="_blank" rel="noopener noreferrer" data-action="download" data-id="${book.id}">Mở / tải tài liệu</a>` : ''}
            <div class="book-actions">
                <button type="button" data-action="favorite" data-id="${book.id}">${localData.favorites.includes(book.id) ? 'Bỏ yêu thích' : 'Lưu yêu thích'}</button>
                <a class="book-open" href="#traodoi">Liên hệ / Đề nghị trao đổi</a>
            </div>
        </article>`;
        byId('exchange-form').elements.bookId.value = String(book.id);
        byId('exchange-form').elements.bookTitle.value = book.title;
        const similar = list.filter(item => item.id !== id && (item.major === book.major || item.subject === book.subject)).slice(0, 3);
        renderCards(byId('similar-list'), similar, 'Chưa có tài liệu tương tự.');
        if (loggedIn()) await track(id, 'VIEW');
        else recordView(id);
        byId('exchange-form').addEventListener('submit', async event => {
            event.preventDefault();
            const form = event.currentTarget;
            if (!await track(id, 'EXCHANGE')) return;
            localData.messages.unshift({ bookId: id, message: form.elements.message.value.trim(), createdAt: new Date().toISOString() });
            saveLocalData();
            byId('exchange-message').textContent = 'Đã ghi nhận quan tâm. Gửi tin nhắn trực tiếp cần backend hỗ trợ.';
            form.reset();
            form.elements.bookId.value = String(book.id);
            form.elements.bookTitle.value = book.title;
        });
    }

    function fileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Không đọc được tệp đã chọn.'));
            reader.readAsDataURL(file);
        });
    }

    function initManage() {
        const form = byId('share-form');
        if (!loggedIn()) {
            byId('manage-notice').textContent = 'Đăng nhập để đăng và quản lý tài liệu.';
            form.hidden = true;
        }
        loadBooks().then(list => {
            const renderMine = () => {
                const owned = list.filter(book => localData.myBookIds.includes(book.id));
                byId('my-book-list').innerHTML = owned.length
                    ? owned.map(book => bookCard(book, true)).join('')
                    : '<p class="book-message">Bạn chưa có tài liệu nào trong danh sách của mình.</p>';
            };
            renderMine();
            if (!loggedIn()) return;
            byId('manage-notice').textContent = 'Chỉnh sửa, ẩn và gỡ bài đăng khỏi danh sách của bạn được lưu trên thiết bị; backend hiện chưa có API cập nhật hoặc xóa.';
            byId('manage-notice').classList.remove('error');
            form.hidden = false;
            form.addEventListener('submit', async event => {
                event.preventDefault();
                const values = Object.fromEntries(new FormData(form).entries());
                const file = form.elements.attachment.files[0];
                if (file && file.size > 500 * 1024) {
                    byId('manage-notice').textContent = 'Tệp phải nhỏ hơn 500 KB; tệp hiện chỉ lưu trên thiết bị.';
                    return;
                }
                const extra = {
                    title: values.title, author: values.author, description: values.description,
                    subject: values.subject, major: values.major, documentType: values.documentType, format: values.format,
                    shareType: values.shareType, status: values.status, publicationYear: values.publicationYear,
                    coverUrl: values.coverUrl, fileUrl: values.fileUrl
                };
                if (editingId) {
                    localData.metadata[editingId] = { ...localData.metadata[editingId], ...extra };
                    const index = list.findIndex(item => item.id === editingId);
                    if (index >= 0) list[index] = { ...list[index], ...extra };
                    if (file) localData.metadata[editingId].attachment = await fileAsDataUrl(file);
                    byId('manage-notice').textContent = 'Đã cập nhật thông tin tài liệu trên thiết bị này.';
                } else {
                    const payload = { title: values.title, subject: values.subject, major: values.major };
                    if (values.fileUrl) payload.fileUrl = values.fileUrl;
                    try {
                        const result = await api('/books', { method: 'POST', body: JSON.stringify(payload) });
                        const id = Number(result.data?.id);
                        if (!Number.isInteger(id)) throw new Error('Máy chủ không trả về mã tài liệu hợp lệ.');
                        extra.postedBy = user().username || user().fullName || 'Sinh viên';
                        if (file) extra.attachment = await fileAsDataUrl(file);
                        localData.metadata[id] = extra;
                        localData.myBookIds.unshift(id);
                        list.unshift({ ...result.data, ...extra });
                        byId('manage-notice').textContent = 'Đăng tài liệu thành công.';
                    } catch (error) {
                        byId('manage-notice').textContent = error.message;
                        byId('manage-notice').classList.add('error');
                        return;
                    }
                }
                if (!saveLocalData()) {
                    byId('manage-notice').textContent = 'Không thể lưu thông tin bổ sung do bộ nhớ trình duyệt đã đầy.';
                    byId('manage-notice').classList.add('error');
                }
                form.reset();
                editingId = null;
                form.elements.submitPost.textContent = 'Đăng tài liệu';
                byId('cancel-edit').hidden = true;
                renderMine();
            });
            byId('cancel-edit').addEventListener('click', () => {
                form.reset();
                editingId = null;
                form.elements.submitPost.textContent = 'Đăng tài liệu';
                byId('cancel-edit').hidden = true;
            });
            byId('my-book-list').addEventListener('click', event => {
                const button = event.target.closest('[data-action]');
                if (!button) return;
                const id = Number(button.dataset.id);
                const book = list.find(item => item.id === id);
                if (button.dataset.action === 'edit') {
                    editingId = id;
                    const data = withMetadata(book);
                    ['title', 'author', 'description', 'subject', 'major', 'documentType', 'format', 'shareType', 'status', 'publicationYear', 'coverUrl', 'fileUrl'].forEach(key => {
                        if (form.elements[key]) form.elements[key].value = data[key] || '';
                    });
                    form.elements.submitPost.textContent = 'Lưu chỉnh sửa trên thiết bị';
                    byId('cancel-edit').hidden = false;
                    form.scrollIntoView({ behavior: 'smooth' });
                } else if (button.dataset.action === 'hide') {
                    localData.hiddenIds = localData.hiddenIds.includes(id)
                        ? localData.hiddenIds.filter(item => item !== id)
                        : [...localData.hiddenIds, id];
                    saveLocalData();
                    renderMine();
                } else if (button.dataset.action === 'remove') {
                    if (!confirm('Gỡ tài liệu khỏi danh sách của bạn? Bài đăng trên máy chủ không bị xóa.')) return;
                    localData.myBookIds = localData.myBookIds.filter(item => item !== id);
                    saveLocalData();
                    renderMine();
                }
            });
        });
    }

    async function initProfile() {
        const form = byId('profile-form');
        if (!loggedIn()) {
            byId('profile-notice').textContent = 'Đăng nhập để xem hồ sơ sinh viên.';
            form.hidden = true;
            return;
        }
        form.hidden = false;
        const current = user();
        const profile = localData.profile;
        Object.entries({
            fullName: profile.fullName || current.username || '',
            school: profile.school || '',
            faculty: profile.faculty || '',
            major: profile.major || current.major || '',
            subjects: profile.subjects || ''
        }).forEach(([key, value]) => { form.elements[key].value = value; });
        const renderInterests = () => {
            const interests = form.elements.subjects.value.split(',').map(item => item.trim()).filter(Boolean);
            byId('interest-list').innerHTML = interests.length
                ? interests.map(item => `<span class="category-chip">${escapeHtml(item)}</span>`).join('')
                : '<p class="book-message">Thêm các môn học bạn quan tâm vào hồ sơ.</p>';
        };
        form.elements.subjects.addEventListener('input', renderInterests);
        renderInterests();
        form.addEventListener('submit', event => {
            event.preventDefault();
            localData.profile = Object.fromEntries(new FormData(form).entries());
            byId('profile-notice').textContent = saveLocalData()
                ? 'Đã lưu hồ sơ trên thiết bị này.'
                : 'Không thể lưu hồ sơ do bộ nhớ trình duyệt đã đầy.';
            renderInterests();
        });
        byId('logout-button').addEventListener('click', () => {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            location.assign('giaodien.html');
        });
        const list = (await loadBooks()).filter(book => !localData.hiddenIds.includes(book.id));
        const byIds = ids => ids.map(id => list.find(book => book.id === Number(id))).filter(Boolean);
        renderCards(byId('favorite-list'), byIds(localData.favorites), 'Bạn chưa lưu tài liệu yêu thích.');
        renderCards(byId('history-list'), byIds(localData.history), 'Lịch sử tài liệu đã xem sẽ xuất hiện tại đây.');
        byId('search-history-list').innerHTML = localData.searchHistory.length
            ? localData.searchHistory.map(value => `<a class="category-chip" href="tailieu.html?search=${encodeURIComponent(value)}">${escapeHtml(value)}</a>`).join('')
            : '<p class="book-message">Chưa có lịch sử tìm kiếm.</p>';
        byId('interaction-list').innerHTML = localData.messages.length
            ? localData.messages.map(item => `<p class="book-message">${escapeHtml(item.message || 'Đã quan tâm tài liệu')} — ${escapeHtml(new Date(item.createdAt).toLocaleString('vi-VN'))}</p>`).join('')
            : '<p class="book-message">Chưa có tương tác trao đổi.</p>';
    }

    document.addEventListener('click', async event => {
        const action = event.target.closest('[data-action]');
        if (!action) return;
        const id = Number(action.dataset.id);
        if (action.dataset.action === 'favorite') {
            if (!await track(id, 'FAVORITE')) return;
            localData.favorites = localData.favorites.includes(id)
                ? localData.favorites.filter(item => item !== id)
                : [id, ...localData.favorites];
            saveLocalData();
            action.textContent = localData.favorites.includes(id)
                ? (page === 'detail' ? 'Bỏ yêu thích' : 'Bỏ yêu thích')
                : (page === 'detail' ? 'Lưu yêu thích' : 'Yêu thích');
        } else if (action.dataset.action === 'download') {
            track(id, 'DOWNLOAD');
        }
    });

    updateLayout();
    const initializers = { home: initHome, search: initSearch, detail: initDetail, manage: initManage, profile: initProfile };
    initializers[page]?.();
})();