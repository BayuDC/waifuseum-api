const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    url: { type: String, required: true },
    source: { type: String, required: false },
    messageId: { type: String, required: true },
    album: { type: mongoose.mongo.ObjectId, ref: 'Album', required: true },
});

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
        .match({ album: album._id })
        .sample(count || 1)
        .project({
            ...{ id: '$_id', url: true, source: true, _id: false },
            ...(full ? { album: true } : {}),
        });

    if (full) {
        await this.populate(pictures, { path: 'album', select: 'name slug -_id' });
    }

    return pictures;
});
schema.method('toJSON', function () {
    return {
        id: this._id,
        url: this.url,
        source: this.source,
        album: {
            id: this.album.id,
            name: this.album.name,
            slug: this.album.slug,
        },
    };
});

module.exports = mongoose.model('Picture', schema);
