const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        trim: true
    },
    accounts: {
        current: {
            balance: { type: Number, default: 0 },
            iban: { type: String, unique: true }
        },
        savings: {
            balance: { type: Number, default: 0 },
            iban: { type: String, unique: true }
        },
        joint: {
            balance: { type: Number, default: 0 },
            iban: { type: String, unique: true }
        }
    },
    transactions: [{
        type: {
            type: String,
            enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'interest']
        },
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
        from: String,
        to: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hashage du mot de passe avant sauvegarde
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Génération d'IBAN unique
UserSchema.pre('save', function(next) {
    if (!this.accounts.current.iban) {
        this.accounts.current.iban = this.generateIban('CUR');
        this.accounts.savings.iban = this.generateIban('SAV');
        this.accounts.joint.iban = this.generateIban('JNT');
    }
    next();
});

UserSchema.methods.generateIban = function(prefix) {
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return `FR76${prefix}${random}`;
};

// Comparer le mot de passe
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);