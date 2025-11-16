import React, { useState } from 'react';
import { addComment, deleteComment } from '../api';
import { getUser } from '../auth';

export default function PostComments({ post, onUpdate }) {
  const user = getUser();
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = (input || '').trim();
    if (!text) return;

    // optimistic add
    const tempId = 'tmp-' + Date.now();
    const tempComment = {
      _id: tempId,
      content: text,
      createdAt: new Date().toISOString(),
      author: { _id: user?.id, username: user?.username }
    };

    const prev = post;
    try {
      setSubmitting(true);
      // call onUpdate with optimistic post update
      onUpdate({ ...post, comments: [...(post.comments || []), tempComment] });
      setInput('');

      const res = await addComment(post._id, text);
      onUpdate(res.data);
    } catch (err) {
      console.error(err);
      // revert optimistic
      onUpdate(prev);
      if (err?.response?.status === 401) alert('Please login to comment');
      else alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    const prev = post;
    try {
      // optimistic remove
      onUpdate({ ...post, comments: (post.comments || []).filter(c => c._id !== commentId) });
      const res = await deleteComment(post._id, commentId);
      onUpdate(res.data);
    } catch (err) {
      console.error(err);
      onUpdate(prev);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="comments" style={{ marginTop: 12 }}>
      {(post.comments || []).map(c => (
        <div key={c._id} className="comment" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="who">{c.author?.username || 'unknown'} <span className="muted" style={{ fontWeight: 400, marginLeft: 8 }}>{new Date(c.createdAt).toLocaleString()}</span></div>
            <div style={{ marginTop: 6, color: 'var(--muted)' }}>{c.content}</div>
          </div>
          {user && user.id === (c.author?._id ? c.author._id.toString() : (c.author ? c.author.toString() : '')) && (
            <div>
              <button className="btn ghost" onClick={() => handleDelete(c._id)}>Delete</button>
            </div>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Write a comment..." />
        <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Posting...' : 'Post'}</button>
      </form>
    </div>
  );
}
