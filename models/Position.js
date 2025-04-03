const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    Salary: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Position', positionSchema);