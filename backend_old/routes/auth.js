const { promisePool } = require('../config/database');

class Settings {
    static async get() {
        let [rows] = await promisePool.execute('SELECT * FROM settings LIMIT 1');
        
        if (rows.length === 0) {
            await promisePool.execute(`
                INSERT INTO settings (btcAddress, ethAddress, supportEmail)
                VALUES ('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'support@waripfinance.com')
            `);
            [rows] = await promisePool.execute('SELECT * FROM settings LIMIT 1');
        }
        
        return rows[0];
    }

    static async update(data) {
        const { btcAddress, ethAddress, supportEmail } = data;
        await promisePool.execute(`
            UPDATE settings SET btcAddress = ?, ethAddress = ?, supportEmail = ?, updatedAt = CURRENT_TIMESTAMP
        `, [btcAddress, ethAddress, supportEmail]);
    }
}

module.exports = Settings;