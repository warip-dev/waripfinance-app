const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true },
    phoneCountry: { type: String, required: true },
    streetNumber: { type: String, required: true },
    streetName: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    gender: { type: String, enum: ['Homme', 'Femme', 'Autre'], required: true },
    maritalStatus: { type: String, enum: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'], required: true },
    profession: { type: String, required: true },
    country: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'rejected'], 
        default: 'pending' 
    },
    rejectionReason: { type: String, default: '' },
    accounts: {
        current: {
            balance: { type: Number, default: 0 },
            iban: { type: String, unique: true }
        },
        savings: {
            balance: { type: Number, default: 0 },
            iban: { type: String, unique: true }
        }
    },
    transactions: [{
        type: { type: String, enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'interest'] },
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
        from: String,
        to: String,
        status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
        rejectionReason: String
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.pre('save', function(next) {
    if (!this.accounts.current.iban) {
        const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        this.accounts.current.iban = `FR76CUR${random}`;
        this.accounts.savings.iban = `FR76SAV${random}`;
    }
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);