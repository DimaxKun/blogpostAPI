const express = require("express");
const postController = require("../controllers/post");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.get('/getPosts', postController.getPosts);

router.get('/getPost/:id', postController.getPost);

router.post('/addPost', verify, postController.addPost);

router.patch('/updatePost/:id', verify, postController.updatePost);

router.delete('/deletePost/:id', verify, postController.deletePost);

router.patch('/addComment/:id', verify, postController.addComment);

router.get('/getComments/:id', postController.getComments);

router.delete('/deleteComment/:postId/:commentId', verify, verifyAdmin, postController.deleteComment);

module.exports = router;

