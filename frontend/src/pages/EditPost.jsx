import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPostById, updatePost } from "../api";

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getPostById(id)
      .then((res) => {
        setTitle(res.data.title || "");
        setContent(res.data.content || "");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load post");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updatePost(id, { title, content });
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading post...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2 className="page-title">Edit Post</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: 8 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;
