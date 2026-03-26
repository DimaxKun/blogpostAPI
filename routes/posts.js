const express = require("express");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const postController = require("../controllers/post");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

// Store uploaded images locally in `server/uploads/`.
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    cb(null, isImage);
  },
});

router.get('/getPosts', postController.getPosts);

router.get('/getPost/:id', postController.getPost);

router.get('/author/:authorId', postController.getPostsByAuthor);

router.post('/addPost', verify, postController.addPost);

router.patch('/updatePost/:id', verify, postController.updatePost);

router.delete('/deletePost/:id', verify, postController.deletePost);

router.patch('/addComment/:id', verify, postController.addComment);

router.get('/getComments/:id', postController.getComments);

router.delete('/deleteComment/:postId/:commentId', verify, verifyAdmin, postController.deleteComment);

// Upload a post image for the rich-text editor.
router.post('/uploadImage', verify, upload.single('image'), postController.uploadImage);

module.exports = router;

