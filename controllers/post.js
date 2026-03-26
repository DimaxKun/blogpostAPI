const Post = require('../models/Post');
const { errorHandler } = require('../auth');

module.exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a valid image file.' });
    }

    // Express static is mounted at `/uploads`. Return an absolute URL so the
    // frontend can load images even when client/backend run on different origins.
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    return res.status(201).send({ url });
}


module.exports.addPost = (req, res) => {
    let newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        author: req.user.id,
        comments: req.body.comments
    });

    Post.findOne({ title: req.body.title })
    .then(existingPost => {
        if(existingPost){
            return res.status(409).send({ message: 'Post already exists' });
        } else {
            return newPost.save()
            .then(result => res.status(201).send({
                result: result
            }))
            .catch(error => errorHandler(error,req,res));
        }
    })
    .catch(error => errorHandler(error, req, res));
}

module.exports.getPosts = (req, res) => {
    return Post.find({})
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .then(result => {
        if(result.length > 0){
            return res.status(200).send({posts: result});
        }
        else{
            return res.status(404).send({ message: 'No posts found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getPost = (req, res) => {
    Post.findById(req.params.id)
    .populate('author', 'username')
    .populate('comments.userId', 'username')
    .then(post => {
        if(post){
            return res.status(200).send(post)
        }else{
            return res.status(404).send({message: 'post not found'})
        }
    }).catch(error => errorHandler(error, req, res))
};

module.exports.updatePost = (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
        if(!post){
            return res.status(404).send({message: 'Post not found'});
        }
        
        if(post.author.toString() !== req.user.id && !req.user.isAdmin){
            return res.status(403).send({message: 'You are not authorized'});
        }

        let updatedPost = {
            title: req.body.title,
            content: req.body.content
        }
        
        return Post.findByIdAndUpdate(req.params.id, updatedPost, {new: true})
        .then(updated => {
            res.status(200).send({
                message: 'Post updated successfully',
                updatedPost: updated
            });
        });
    }).catch(error => errorHandler(error, req, res));
}

module.exports.deletePost = (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
        if(!post){
            return res.status(404).send({message: 'Post not found'});
        }
        
        if(post.author.toString() !== req.user.id && !req.user.isAdmin){
            return res.status(403).send({message: 'You are not authorized'});
        }

        return Post.findOneAndDelete({_id: req.params.id})
        .then(() => {
            return res.status(200).send({message: 'Post deleted successfully'})
        });
    }).catch(error => errorHandler(error, req, res));
};

module.exports.addComment = (req, res) => {
    const newComment = {
        userId: req.user.id, 
        comment: req.body.comment
    };

    Post.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: newComment } },
        { new: true }
    )
    .then(post => {
        if(post){
            res.status(200).send({
                message: 'Comment added successfully',
                updatedPost: post
            });
        } else{
            res.status(404).send({message: 'Post not found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getComments = (req, res) => {
    Post.findById(req.params.id)
    .populate('comments.userId', 'username')
    .then(post => {
        if(!post){
            return res.status(404).send({message: 'post not found'})
        } else{
            return res.status(200).send({
                comments: post.comments
            })
        }
    }).catch(error => errorHandler(error, req , res))
};


module.exports.deleteComment = (req, res) => {
    const { postId, commentId } = req.params;

    Post.findById(postId)
    .then(post => {
        if(!post){
            return res.status(404).send({message: 'Post not found'});
        }

        const comment = post.comments.id(commentId);
        if(!comment){
            return res.status(404).send({message: 'Comment not found'});
        }

        if(!req.user.isAdmin){
            return res.status(403).send({message: 'Only admin can delete comments'});
        }

        comment.deleteOne();
        
        return post.save()
        .then(updatedPost => {
            res.status(200).send({
                message: 'Comment deleted successfully',
                updatedPost: updatedPost
            });
        });
    }).catch(error => errorHandler(error, req, res));
};


module.exports.getPostsByAuthor = (req, res) => {
    return Post.find({ author: req.params.authorId })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .then(result => {
        if(result.length > 0){
            return res.status(200).send({posts: result});
        }
        else{
            return res.status(404).send({ message: 'No posts found for this author'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};
