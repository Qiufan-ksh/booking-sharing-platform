const MAJOR_ALIASES = new Map([
    ['cntt', 'Công nghệ thông tin'],
    ['cong nghe thong tin', 'Công nghệ thông tin'],
    ['cong nghe ky thuat thong tin', 'Công nghệ thông tin'],
    ['cong nghe ky thuat', 'Công nghệ thông tin'],
    ['khoa hoc may tinh', 'Khoa học máy tính'],
    ['khmt', 'Khoa học máy tính'],
    ['may tinh', 'Khoa học máy tính'],
    ['ky thuat dien', 'Kỹ thuật điện'],
    ['dien', 'Kỹ thuật điện'],
    ['ky thuat co khi', 'Kỹ thuật cơ khí'],
    ['co khi', 'Kỹ thuật cơ khí'],
    ['kinh te', 'Kinh tế'],
    ['kt', 'Kinh tế'],
    ['chua cap nhat', 'Chưa cập nhật']
]);

const SUBJECT_ALIASES = new Map([
    ['ctdl', 'Cấu trúc dữ liệu'],
    ['cau truc du lieu', 'Cấu trúc dữ liệu'],
    ['lap trinh web', 'Lập trình web'],
    ['lt web', 'Lập trình web'],
    ['giai tich', 'Giải tích'],
    ['toan cao cap', 'Toán cao cấp'],
    ['co so du lieu', 'Cơ sở dữ liệu'],
    ['csdl', 'Cơ sở dữ liệu'],
    ['lien quan', 'Khác']
]);

function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeKey(value) {
    return normalizeText(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeMajor(value) {
    const raw = normalizeText(value);
    if (!raw) {
        return '';
    }

    const key = normalizeKey(raw);
    const normalized = MAJOR_ALIASES.get(key) || raw;
    return normalized.replace(/\s+/g, ' ').trim();
}

function normalizeSubject(value) {
    const raw = normalizeText(value);
    if (!raw) {
        return '';
    }

    const key = normalizeKey(raw);
    const normalized = SUBJECT_ALIASES.get(key) || raw;
    return normalized.replace(/\s+/g, ' ').trim();
}

function normalizeBookInput(input = {}) {
    const title = normalizeText(input.title || '');
    const subject = normalizeSubject(input.subject || '');
    const major = normalizeMajor(input.major || '');
    const fileUrl = typeof input.fileUrl === 'string' && input.fileUrl.trim() ? input.fileUrl.trim() : null;

    return {
        title,
        subject,
        major,
        fileUrl
    };
}

module.exports = {
    normalizeText,
    normalizeKey,
    normalizeMajor,
    normalizeSubject,
    normalizeBookInput
};
