import React, { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'under_discussion', label: 'Under Discussion' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const StatusChangeModal = ({ currentStatus, onClose, onSubmit }) => {
  const [status, setStatus] = useState(currentStatus);
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === currentStatus) {
      onClose();
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(status, justification);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '500px', margin: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '20px' }}>Change Status</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} {opt.value === currentStatus ? '(current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Justification *</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required={status !== currentStatus}
              placeholder="Why is this status change needed?"
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || (status !== currentStatus && !justification.trim())}
            >
              {submitting ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusChangeModal;
