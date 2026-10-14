const assert = require('node:assert/strict');
const test = require('node:test');

const {
    normalizeMajor,
    normalizeSubject,
    normalizeBookInput
} = require('../services/dataPreprocessor');

test('normalizes common major aliases to canonical values', () => {
    assert.equal(normalizeMajor('CNTT'), 'Công nghệ thông tin');
    assert.equal(normalizeMajor('  khoa hoc may tinh  '), 'Khoa học máy tính');
    assert.equal(normalizeMajor('Kỹ thuật điện'), 'Kỹ thuật điện');
});

test('normalizes subject aliases and trims whitespace', () => {
    assert.equal(normalizeSubject('CTDL'), 'Cấu trúc dữ liệu');
    assert.equal(normalizeSubject('  lap trinh web  '), 'Lập trình web');
    assert.equal(normalizeSubject('Cơ sở dữ liệu'), 'Cơ sở dữ liệu');
});

test('normalizes a full book payload before persisting', () => {
    const processed = normalizeBookInput({
        title: '  Lập trình web nâng cao  ',
        subject: 'lt web',
        major: 'cntt'
    });

    assert.deepEqual(processed, {
        title: 'Lập trình web nâng cao',
        subject: 'Lập trình web',
        major: 'Công nghệ thông tin',
        fileUrl: null
    });
});
