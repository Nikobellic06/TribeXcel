const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/*
 * POST /api/student/uploads   body: { fileName, mimeType, data (base64), docType }
 *
 * Files arrive as base64 JSON (the API already accepts 25 MB JSON bodies), so
 * no extra upload package is needed. Each file is checked by its real content
 * (magic bytes), not just the extension, and saved under an unguessable name.
 */

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const MAX_BYTES = 2 * 1024 * 1024;

const TYPES = {
  'application/pdf': { ext: 'pdf', check: (b) => b.slice(0, 4).toString('latin1') === '%PDF' },
  'image/jpeg': { ext: 'jpg', check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', check: (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
};

const uploadFile = async (req, res) => {
  try {
    const { fileName, mimeType, data, docType } = req.body || {};
    const type = TYPES[mimeType];
    if (!type) {
      return res.status(400).json({ message: 'Only PDF, JPG and PNG files are allowed' });
    }
    if (typeof data !== 'string' || !data) {
      return res.status(400).json({ message: 'File content is missing' });
    }

    const buffer = Buffer.from(data.replace(/^data:[^,]+,/, ''), 'base64');
    if (buffer.length === 0 || buffer.length > MAX_BYTES) {
      return res.status(400).json({ message: 'File must be smaller than 2 MB' });
    }
    if (!type.check(buffer)) {
      return res.status(400).json({ message: 'File content does not match its type' });
    }

    const folder = path.join(UPLOAD_ROOT, String(req.student._id));
    await fs.promises.mkdir(folder, { recursive: true });
    const safeDoc = String(docType || 'doc').replace(/[^a-z0-9_]/gi, '').slice(0, 40) || 'doc';
    const storedName = `${safeDoc}-${crypto.randomBytes(12).toString('hex')}.${type.ext}`;
    await fs.promises.writeFile(path.join(folder, storedName), buffer);

    res.status(201).json({
      fileUrl: `/uploads/${req.student._id}/${storedName}`,
      fileName: String(fileName || storedName).replace(/[\\/]/g, '_').slice(0, 120),
      mimeType,
      size: buffer.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed, please try again' });
  }
};

module.exports = { uploadFile, UPLOAD_ROOT };
