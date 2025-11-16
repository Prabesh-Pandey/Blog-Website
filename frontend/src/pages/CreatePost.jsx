import { useState } from "react";
import { createPost } from "../api";
import { useNavigate } from 'react-router-dom';
import { getUser } from '../auth';
import { useEffect } from 'react';

function CreatePost() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	useEffect(() => {
		const u = getUser();
		if (!u) {
			// require login before creating posts
			navigate('/login');
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await createPost({ title, content });
			setTitle("");
			setContent("");
			navigate('/');
		} catch (err) {
			console.error(err);
			setError(err?.response?.data?.error || "Failed to create post");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2 className="page-title">Create Post</h2>
			<form onSubmit={handleSubmit} className="card">
				<div className="form-row">
					<input
						placeholder="Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
				</div>

				<div className="form-row">
					<textarea
						placeholder="Write your post content here..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={8}
						required
					/>
				</div>

				<div className="form-actions">
					<button type="button" className="btn ghost" onClick={() => { setTitle(''); setContent(''); }}>Clear</button>
					<button type="submit" className="btn" disabled={loading}>{loading ? 'Saving...' : 'Create Post'}</button>
				</div>

				{error && <p style={{ color: '#ffb4b4', marginTop: 10 }}>{error}</p>}
			</form>
		</div>
	);
}

export default CreatePost;
