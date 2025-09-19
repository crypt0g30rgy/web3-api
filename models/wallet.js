const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'supersecretkey'; // Must be 32 chars in production

const WalletSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    privateKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    funded: { type: Boolean, default: false }
});

// Encrypt privateKey before saving
WalletSchema.pre('save', function(next) {
    if (!this.isModified('privateKey')) return next();
    this.privateKey = CryptoJS.AES.encrypt(this.privateKey, ENCRYPTION_KEY).toString();
    next();
});

// Method to decrypt privateKey
WalletSchema.methods.getPrivateKey = function() {
    const bytes = CryptoJS.AES.decrypt(this.privateKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = mongoose.model('Wallet', WalletSchema);
