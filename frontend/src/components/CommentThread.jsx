import React, { useState } from 'react';

const CommentThread = ({ comments, onAddComment }) => {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('idea');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(content, tag);
      setContent('');
      setTag('idea');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="question">Question</option>
            <option value="idea">Idea</option>
            <option value="risk">Risk</option>
            <option value="agreement">Agreement</option>
          </select>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your thoughts..."
            style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
          <button type="submit" className="btn btn-primary" disabled={submitting || !content.trim()}>
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
          No comments yet. Be the first to start the discussion!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  color: '#374151',
                  flexShrink: 0,
                }}
              >
                {comment.author.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600' }}>{comment.author.username}</span>
                  <span className={`badge badge-${comment.tag}`}>{comment.tag}</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: '#374151' }}>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
