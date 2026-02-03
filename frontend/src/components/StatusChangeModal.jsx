import React, { useState } from "react";

const STATUS_OPTIONS = [
  { value: "proposed", label: "Proposed" },
  { value: "under_discussion", label: "Under Discussion" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

// Valid status transitions (matches backend)
const STATUS_TRANSITIONS = {
  proposed: ["under_discussion", "approved"],
  under_discussion: ["proposed", "approved", "in_progress"],
  approved: ["in_progress", "under_discussion"],
  in_progress: ["done", "approved"],
  done: ["in_progress"],
};

const StatusChangeModal = ({ currentStatus, onClose, onSubmit }) => {
  const validTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  const [status, setStatus] = useState(validTransitions[0] || currentStatus);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === currentStatus) {
      onClose();
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(status, justification);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to change status");
      setSubmitting(false);
    }
  };

  const getStatusLabel = (value) => {
    return STATUS_OPTIONS.find((opt) => opt.value === value)?.label || value;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Change Status</h2>

        <div className="transitions-info">
          Current status: <strong>{getStatusLabel(currentStatus)}</strong>
          <br />
          Valid transitions:{" "}
          {validTransitions.map(getStatusLabel).join(", ") || "None"}
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={validTransitions.length === 0}
            >
              {validTransitions.map((transitionValue) => {
                const opt = STATUS_OPTIONS.find(
                  (o) => o.value === transitionValue,
                );
                return (
                  <option key={transitionValue} value={transitionValue}>
                    {opt?.label || transitionValue}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Justification *</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
              placeholder="Why is this status change needed?"
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                submitting ||
                !justification.trim() ||
                validTransitions.length === 0
              }
            >
              {submitting ? "Saving..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusChangeModal;
