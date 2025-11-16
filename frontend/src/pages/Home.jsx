import { useEffect, useState } from "react";
import { getPosts, votePost, addComment, deleteComment } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from '../auth';
import PostComments from '../components/PostComments';

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    getPosts()
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Fetch error:", err));
  };

  const navigate = useNavigate();
  const user = getUser();
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const handleVote = async (postId, val) => {
    // optimistic vote: modify counts locally then call API
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const uid = user?.id;
      const up = new Set((p.upvotes || []).map(x => x.toString()));
      const down = new Set((p.downvotes || []).map(x => x.toString()));

      const hadUp = up.has(uid);
      const hadDown = down.has(uid);

      if (val === 1) {
        if (hadUp) up.delete(uid); else { up.add(uid); down.delete(uid); }
      } else {
        if (hadDown) down.delete(uid); else { down.add(uid); up.delete(uid); }
      }

      return { ...p, upvotes: Array.from(up), downvotes: Array.from(down) };
    }));

    try {
      const res = await votePost(postId, val);
      setPosts(prev => prev.map(p => p._id === res.data._id ? res.data : p));
    } catch (err) {
      console.error(err);
      // revert on error by refetching posts
      fetchPosts();
      if (err?.response?.status === 401) navigate('/login');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="page-title">All Posts</h2>
        <Link to="/create" className="view-btn">+ New Post</Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No posts yet. Create one!</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="post-title">{post.title}</h3>
                <div style={{ textAlign: 'right' }}>
                  <div className="meta">by @{post.author?.username || 'unknown'}</div>
                  <div className="meta" style={{ fontSize: 12, marginTop: 4 }}>{new Date(post.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <p className="post-content">{post.content}</p>

              <div className="actions" style={{ marginTop: 8 }}>
                <button className={`btn ghost ${user && (post.upvotes || []).map(x=>x.toString()).includes(user.id) ? 'voted-up' : ''}`} onClick={() => handleVote(post._id, 1)}>▲ {post.upvotes?.length || 0}</button>
                <button className={`btn ghost ${user && (post.downvotes || []).map(x=>x.toString()).includes(user.id) ? 'voted-down' : ''}`} onClick={() => handleVote(post._id, -1)}>▼ {post.downvotes?.length || 0}</button>
                <button className="btn" onClick={() => setOpenComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}>💬 {post.comments?.length || 0}</button>
                {user && user.id === (post.author?._id ? post.author._id.toString() : (post.author ? post.author.toString() : '')) && (
                  <Link to={`/posts/${post._id}/edit`} className="btn" style={{ marginLeft: 'auto' }}>Edit</Link>
                )}
              </div>

              {openComments[post._id] && (
                <div style={{ marginTop: 12 }}>
                  
                  <PostComments post={post} onUpdate={(updated) => setPosts(prev => prev.map(p => p._id === updated._id ? updated : p))} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
