import express from 'express';
import { uploadImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload an image file (Child photos, blog banners, news covers, avatars)
 * @access  Public / Authenticated
 */
router.post('/', (req, res) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Image upload failed',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please select an image file to upload (field name: "image")',
      });
    }

    // Return the relative URL served statically by express at /uploads
    const relativeUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: relativeUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  });
});

export default router;
