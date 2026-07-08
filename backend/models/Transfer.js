const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    beneficiaryName: { type: String, required: true },
    beneficiaryLastName: { type: String, required: true },
    iban: { type: String, required: true },
    bic: { type: String, required: true },
    reference: { type: String },
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'rejected'], 
        default: 'pending' 
    },
    rejectionReason: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transfer', TransferSchema);