const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    alias: { type: String },
    description: { type: String },
    slug: { type: String, required: true, unique: true },
    albums: [{ type: mongoose.mongo.ObjectId, ref: 'Album' }],
    createdBy: { type: mongoose.mongo.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

schema.method('toJSON', function () {
    return {
        id: this._id,
        name: this.name,
        alias: this.alias,
        description: this.description,
        slug: this.slug,
        createdBy: this.createdBy,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
});

schema.pre('find', function (next) {
    const { full } = this.getOptions();

    if (full) {
        this.populate('createdBy', 'name');
    } else {
        this.select({ name: 1, slug: 1 });
    }

    next();
});

schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Tag', schema);
