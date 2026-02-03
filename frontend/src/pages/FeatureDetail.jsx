import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { featuresApi, commentsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import CommentThread from "../components/CommentThread";
import StatusChangeModal from "../components/StatusChangeModal";
import ActivityTimeline from "../components/ActivityTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import ConfirmModal from "../components/ConfirmModal";

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("discussion");

  useEffect(() => {
    fetchFeature();
  }, [id]);

  const fetchFeature = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await featuresApi.getOne(id);
      setFeature(response.data);
    } catch (err) {
      setError("Failed to load feature details.");
      console.error("Failed to fetch feature:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, justification) => {
    try {
      const response = await featuresApi.changeStatus(
        id,
        newStatus,
        justification,
      );
      setFeature(response.data);
      setShowStatusModal(false);
      toast.success(`Status changed to "${newStatus.replace("_", " ")}"`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to change status";
      toast.error(errorMsg);
      console.error("Failed to change status:", err);
      throw err; // Re-throw so modal can show error
    }
  };

  const handleAddComment = async (content, tag) => {
    try {
      await commentsApi.create(id, { content, tag });
      fetchFeature();
      toast.success("Comment added successfully");
    } catch (err) {
      toast.error("Failed to add comment");
      console.error("Failed to add comment:", err);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await featuresApi.delete(id);
      toast.success("Feature deleted");
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete feature");
      console.error("Failed to delete feature:", err);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading feature..." />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchFeature} />;
  }

  if (!feature) {
    return <div className="empty-state">Feature not found</div>;
  }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to Features
      </Link>

      <div className="card">
        <div className="feature-detail-header">
          <div>
            <h1 className="feature-detail-title">{feature.title}</h1>
            <div className="feature-detail-meta">
              <span className={`badge badge-${feature.status}`}>
                {feature.status.replace("_", " ")}
              </span>
              <span className={`badge badge-${feature.complexity}`}>
                {feature.complexity} complexity
              </span>
              <span className="feature-detail-author">
                by {feature.created_by.username} on{" "}
                {new Date(feature.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="priority-score" title="Priority Score">
              {feature.priority_score}
            </span>
          </div>
        </div>

        <div className="feature-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowStatusModal(true)}
          >
            Change Status
          </button>
          {feature.created_by.id === user?.id && (
            <>
              <Link to={`/features/${id}/edit`} className="btn btn-secondary">
                Edit
              </Link>
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </button>
            </>
          )}
        </div>

        <div className="feature-section">
          <h3>Business Problem</h3>
          <p>{feature.business_problem}</p>
        </div>

        <div className="feature-section">
          <h3>Expected Value</h3>
          <p>{feature.expected_value}</p>
        </div>

        <div className="feature-section">
          <h3>Affected Users</h3>
          <p>{feature.affected_users}</p>
        </div>

        <div className="metrics-grid">
          <div className="card metric-card">
            <div className="metric-value metric-value--green">
              {feature.business_value}
            </div>
            <div className="metric-label">Business Value</div>
          </div>
          <div className="card metric-card">
            <div className="metric-value metric-value--yellow">
              {feature.effort}
            </div>
            <div className="metric-label">Effort</div>
          </div>
          <div className="card metric-card">
            <div className="metric-value metric-value--red">{feature.risk}</div>
            <div className="metric-label">Risk</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "discussion" ? "tab-button--active" : ""}`}
            onClick={() => setActiveTab("discussion")}
          >
            Discussion ({feature.comments?.length || 0})
          </button>
          <button
            className={`tab-button ${activeTab === "activity" ? "tab-button--active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            Activity ({feature.activities?.length || 0})
          </button>
        </div>

        {activeTab === "discussion" ? (
          <CommentThread
            comments={feature.comments || []}
            onAddComment={handleAddComment}
          />
        ) : (
          <ActivityTimeline
            activities={feature.activities || []}
            statusChanges={feature.status_changes || []}
          />
        )}
      </div>

      {showStatusModal && (
        <StatusChangeModal
          currentStatus={feature.status}
          onClose={() => setShowStatusModal(false)}
          onSubmit={handleStatusChange}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Feature"
          message={`Are you sure you want to delete "${feature.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={deleting}
        />
      )}
    </div>
  );
};

export default FeatureDetail;
