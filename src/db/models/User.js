const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    favorites: [{}]
})

userSchema.methods.createToken = async function () {

    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7 days" });
    user.tokens.push({ token });

    await user.save();
    return token;
}

userSchema.statics.findUser = async email => {
    const user = await User.findOne({ email });
    return user;
}

userSchema.methods.toJSON = function () {
    const user = this.toObject();

    delete user.password;
    delete user.tokens;

    return user;
}

userSchema.pre('save', async function (next) {

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;