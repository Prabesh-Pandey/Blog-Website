import { useEffect, useState } from 'react';
import { getMyPosts, deletePost } from '../api';
import { Link, useNavigate } from 'react-router-dom';

function Profile(){
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getMyPosts()
      .then(res => setPosts(res.data))
      .catch(err => { console.error(err); setError('Failed to load your posts'); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      setPosts(p => p.filter(x => x._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete post');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="page-title">My Posts</h2>
        <Link to="/create" className="view-btn">+ New Post</Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>You have not created any posts yet.</p>
      ) : (
        <div className="post-list">
          {posts.map(post => (
            <div key={post._id} className="post-card">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.content.slice(0, 200)}...</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/posts/${post._id}/edit`} className="view-btn">Edit</Link>
                <button onClick={() => handleDelete(post._id)} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: 8 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
