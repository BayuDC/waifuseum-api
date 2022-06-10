const mongoose = require('mongoose');
const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        abilities: { type: Array, default: [] },
        discordId: { type: String, required: true, unique: true },
        token: { type: String },
    },
    {
        versionKey: false,
    }
);

schema.method('toJSON', function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        abilities: this.abilities,
    };
});

module.exports = mongoose.model('User', schema);
