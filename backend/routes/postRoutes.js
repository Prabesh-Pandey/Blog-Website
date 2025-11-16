const express = require("express");
const router = express.Router();
const Post = require("../models/post.js");
const auth = require('../middleware/auth');

// Simple CRUD and interaction routes for posts.
// Kept intentionally explicit so a new developer can follow the flow.
// TODO (intern): add request validation (Joi) and per-route tests.

// GET all posts
router.get("/", async (req, res) => {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate('author', 'username')
            .populate('comments.author', 'username');
        res.json(posts);
});

// GET posts created by current authenticated user
router.get('/mine', auth, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 }).populate('author', 'username');
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch your posts' });
    }
});

// GET single post
router.get("/:id", async (req, res) => {
    const posts = await Post.findById(req.params.id).populate('author', 'username');
    res.json(posts);
});

// CREATE new post (requires auth)
router.post("/", auth, async (req, res) => {
        try {
            const payload = req.body;
            payload.author = req.user.id;
            const newPost = new Post(payload);
            await newPost.save();
            res.json(newPost);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to create post' });
        }
});

// VOTE on a post (value = 1 for upvote, -1 for downvote)
router.post('/:id/vote', auth, async (req, res) => {
    try {
        const { value } = req.body; // 1 or -1
        if (![1, -1].includes(value)) return res.status(400).json({ error: 'Invalid vote value' });
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const uid = req.user.id;
        const upIndex = post.upvotes.findIndex(u => u.toString() === uid);
        const downIndex = post.downvotes.findIndex(u => u.toString() === uid);

        if (value === 1) {
            // toggle upvote
            if (upIndex > -1) {
                post.upvotes.splice(upIndex, 1);
            } else {
                post.upvotes.push(uid);
                if (downIndex > -1) post.downvotes.splice(downIndex, 1);
            }
        } else {
            // toggle downvote
            if (downIndex > -1) {
                post.downvotes.splice(downIndex, 1);
            } else {
                post.downvotes.push(uid);
                if (upIndex > -1) post.upvotes.splice(upIndex, 1);
            }
        }

        await post.save();
        const populated = await Post.findById(post._id).populate('author', 'username').populate('comments.author', 'username');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to vote' });
    }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content required' });
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = { author: req.user.id, content };
        post.comments.push(comment);
        await post.save();
        const populated = await Post.findById(post._id).populate('comments.author', 'username').populate('author', 'username');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Delete a comment (author only)
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.author.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
        comment.remove();
        await post.save();
        const populated = await Post.findById(post._id).populate('comments.author', 'username').populate('author', 'username');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// UPDATE post (requires auth and ownership)
router.put('/:id', auth, async (req, res) => {
    try {
        const existing = await Post.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Post not found' });
        if (!existing.author || existing.author.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
        existing.title = req.body.title ?? existing.title;
        existing.content = req.body.content ?? existing.content;
        await existing.save();
        res.json(existing);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update' });
    }
});

// DELETE post (requires auth and ownership)
router.delete('/:id', auth, async (req, res) => {
    try {
        const existing = await Post.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Post not found' });
        if (!existing.author || existing.author.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete' });
    }
});

module.exports = router;