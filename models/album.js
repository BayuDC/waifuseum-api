const mongoose = require('mongoose');
const Picture = require('./picture');

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        private: { type: Boolean, default: false },
        community: { type: Boolean, default: false },
        channelId: { type: String, required: true },
        createdBy: { type: mongoose.mongo.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        versionKey: false,
    }
);

schema.virtual('pictures', {
    ref: Picture,
    localField: '_id',
    foreignField: 'album',
});
schema.virtual('picturesCount', {
    ref: Picture,
    localField: '_id',
    foreignField: 'album',
    count: true,
});

schema.query.bypass = function () {
    return this.setOptions({ bypass: true });
};
schema.query.paginate = function (page, count) {
    return this.skip(count * (page - 1)).limit(count);
};

schema.method('toJSON', function () {
    return {
        id: this._id,
        name: this.name,
        slug: this.slug,
        private: this.private,
        community: this.community,
        picturesCount: this.picturesCount,
        createdBy: this.createdBy,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
});
schema.pre('find', function (next) {
    const { bypass, full } = this.getOptions();

    if (!bypass) this.find({ private: false });

    if (full) {
        this.populate('picturesCount');
        this.populate('createdBy', 'name');
    } else {
        this.select(['name', 'slug']);
    }

    this.sort({ createdAt: 'desc' });

    next();
});
schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Album', schema);
