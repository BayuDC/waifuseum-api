const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        source: { type: String, required: false },
        messageId: { type: String, required: true },
        album: { type: mongoose.mongo.ObjectId, ref: 'Album', required: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        versionKey: false,
    }
);

schema.static('createAndUpload', async function (channel, { file, album, source }) {
    const message = await channel.send({ files: [file.path] });
    const picture = await this.create({
        url: message.attachments.first().url,
        messageId: message.id,
        album: album.id,
        source,
    });
    picture.album = album;

    await message.edit({ content: `\`${picture.id}\`` });

    return picture;
});
schema.static('findRandom', async function ({ count, full, album }) {
    const pictures = await this.aggregate()
        .match(album ? { album: album._id } : {})
        .sample(count || 1)
        .project({
            ...{ url: true, source: true, _id: true },
            ...(full ? { album: true } : {}),
        });

    if (full) {
        await this.populate(pictures, { path: 'album' });
    }

    return pictures.map(picture => ({
        ...{ id: picture._id, url: picture.url, source: picture.source },
        ...(picture.album
            ? { album: { id: picture.album._id, name: picture.album.name, slug: picture.album.slug } }
            : {}),
    }));
});
schema.static('findAll', async function ({ album, full, count, page }) {
    const pictures = await this.find(album ? { album: album._id } : {})
        .select(full ? {} : { album: false })
        .sort({ createdAt: 'desc' })
        .skip(count * (page - 1))
        .limit(count);

    if (full) {
        await this.populate(pictures, { path: 'album' });
    }

    return pictures;
});
schema.method('toJSON', function () {
    return {
        ...{ id: this._id, url: this.url, source: this.source },
        ...(this.album ? { album: this.album.toJSON() } : {}),
    };
});

module.exports = mongoose.model('Picture', schema);
