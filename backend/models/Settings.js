const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    btcAddress: { type: String, default: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    ethAddress: { type: String, default: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    supportEmail: { type: String, default: 'support@waripfinance.com' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);