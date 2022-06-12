const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        abilities: { type: Array, default: [] },
        discordId: { type: String },
        token: { type: String },
    },
    {
        versionKey: false,
    }
);
schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

schema.method('toJSON', function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        abilities: this.abilities,
    };
});

module.exports = mongoose.model('User', schema);
