const { DataTypes } = require('sequelize');
const { sequelize } = require('../models');

async function syncDatabase() {
    await sequelize.sync();

    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const userTable = tables.find(table =>
        (typeof table === 'string' ? table : table.tableName).toLowerCase() === 'users'
    );

    if (!userTable) {
        throw new Error('Không tìm thấy bảng Users sau khi đồng bộ cơ sở dữ liệu.');
    }

    const columns = await queryInterface.describeTable(userTable);
    if (!columns.passwordHash) {
        await queryInterface.addColumn(userTable, 'passwordHash', {
            type: DataTypes.STRING(255),
            allowNull: true
        });
        console.log('Đã bổ sung cột mật khẩu; tài khoản cũ cần được đặt lại mật khẩu trước khi đăng nhập.');
    }
}

module.exports = syncDatabase;
