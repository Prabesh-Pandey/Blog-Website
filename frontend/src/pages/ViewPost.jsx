import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser } from '../auth';
import { votePost, addComment, deleteComment, getPostById } from '../api';
import PostComments from '../components/PostComments';

function ViewPost() {
	const { id } = useParams();
	const [post, setPost] = useState(null);
	const [error, setError] = useState(null);
	const [commentText, setCommentText] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchPost();
	}, [id]);

	const fetchPost = async () => {
		try {
			const res = await getPostById(id);
			setPost(res.data);
		} catch (err) {
			console.error(err);
			setError('Failed to load post');
		}
	};

	if (error) return <p style={{ color: 'red' }}>{error}</p>;
	if (!post) return <p>Loading...</p>;

	const user = getUser();
	const uid = user?.id;
	const authorId = post.author?._id ? post.author._id.toString() : (post.author ? post.author.toString() : null);
	const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

	const handleVote = async (val) => {
		// optimistic vote on single post
		const prev = post;
		const uid = user?.id;
		const up = new Set((post.upvotes || []).map(x => x.toString()));
		const down = new Set((post.downvotes || []).map(x => x.toString()));
		if (val === 1) {
			if (up.has(uid)) up.delete(uid); else { up.add(uid); down.delete(uid); }
		} else {
			if (down.has(uid)) down.delete(uid); else { down.add(uid); up.delete(uid); }
		}
		setPost({ ...post, upvotes: Array.from(up), downvotes: Array.from(down) });

		try {
			const res = await votePost(post._id, val);
			setPost(res.data);
		} catch (err) {
			console.error(err);
			setPost(prev);
			if (err?.response?.status === 401) alert('Please login to vote');
		}
	};

	const submitComment = async (e) => {
		e.preventDefault();
		if (!commentText.trim()) return;
		setSubmitting(true);
		try {
			const res = await addComment(post._id, commentText.trim());
			setPost(res.data);
			setCommentText('');
		} catch (err) {
			console.error(err);
			if (err?.response?.status === 401) alert('Please login to comment');
			else alert('Failed to add comment');
		} finally { setSubmitting(false); }
	};

	const handleDeleteComment = async (commentId) => {
		if (!confirm('Delete this comment?')) return;
		try {
			const res = await deleteComment(post._id, commentId);
			setPost(res.data);
		} catch (err) {
			console.error(err);
			alert('Failed to delete comment');
		}
	};

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
				<h2 className="page-title">{post.title}</h2>
				<div style={{ textAlign: 'right' }}>
					<div className="meta">by @{post.author?.username || 'unknown'}</div>
					<div className="meta" style={{ fontSize: 13, marginTop: 4 }}>{new Date(post.createdAt).toLocaleString()}</div>
				</div>
			</div>
			<p style={{ marginTop: 12 }}>{post.content}</p>

			<div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
				<button onClick={() => handleVote(1)} className="view-btn">▲ Up</button>
				<div style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--glass)' }}>{score}</div>
				<button onClick={() => handleVote(-1)} className="view-btn">▼ Down</button>
				{authorId && uid && authorId === uid && (
					<Link to={`/posts/${id}/edit`} className="view-btn">Edit Post</Link>
				)}
				<Link to="/" style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: 8, textDecoration: 'none' }}>Back</Link>
			</div>

			<section style={{ marginTop: 18 }}>
				<h3 style={{ marginBottom: 8 }}>Comments</h3>
				<PostComments post={post} onUpdate={(updated) => setPost(updated)} />
			</section>
		</div>
	);
}

export default ViewPost;
