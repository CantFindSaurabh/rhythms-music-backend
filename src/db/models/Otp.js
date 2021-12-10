const mongoose = require('mongoose');
const validator = require('validator');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email');
            }
        }
    },
    otp: {
        type: Number,
        required: true
    }
})

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;

