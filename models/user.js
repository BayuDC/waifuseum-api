const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        abilities: { type: Array, default: [] },
        discordId: { type: String },
        token: { type: String, select: false },
    },
    {
        versionKey: false,
    }
);
schema.method('comparePassword', async function (password = '') {
    return await bcrypt.compare(password, this.password);
});
schema.method('generateToken', async function () {
    this.token = crypto.randomBytes(32).toString('hex');
    await this.save();

    return this.token;
});
schema.method('toJSON', function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        abilities: this.abilities,
    };
});
schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

schema.query.simple = function () {
    return this.select(['name', 'email']);
};

module.exports = mongoose.model('User', schema);
