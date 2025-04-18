const mongoose = require('mongoose');

const RecoveryTokenSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('RecoveryToken', RecoveryTokenSchema);
