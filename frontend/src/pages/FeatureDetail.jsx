import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { featuresApi, commentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentThread from '../components/CommentThread';
import StatusChangeModal from '../components/StatusChangeModal';
import ActivityTimeline from '../components/ActivityTimeline';

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState('discussion');

  useEffect(() => {
    fetchFeature();
  }, [id]);

  const fetchFeature = async () => {
    try {
      const response = await featuresApi.getOne(id);
      setFeature(response.data);
    } catch (error) {
      console.error('Failed to fetch feature:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, justification) => {
    try {
      const response = await featuresApi.changeStatus(id, newStatus, justification);
      setFeature(response.data);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  const handleAddComment = async (content, tag) => {
    try {
      await commentsApi.create(id, { content, tag });
      fetchFeature();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await featuresApi.delete(id);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete feature:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading feature...</div>;
  }

  if (!feature) {
    return <div className="empty-state">Feature not found</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>
          &larr; Back to Features
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{feature.title}</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className={`badge badge-${feature.status}`}>
                {feature.status.replace('_', ' ')}
              </span>
              <span className={`badge badge-${feature.complexity}`}>
                {feature.complexity} complexity
              </span>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                by {feature.created_by.username} on {new Date(feature.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="priority-score" title="Priority Score">{feature.priority_score}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button className="btn btn-primary" onClick={() => setShowStatusModal(true)}>
            Change Status
          </button>
          {feature.created_by.id === user?.id && (
            <>
              <Link to={`/features/${id}/edit`} className="btn btn-secondary">
                Edit
              </Link>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <h3 style={{ marginBottom: '8px', color: '#374151' }}>Business Problem</h3>
            <p style={{ color: '#6b7280' }}>{feature.business_problem}</p>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '8px', color: '#374151' }}>Expected Value</h3>
            <p style={{ color: '#6b7280' }}>{feature.expected_value}</p>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '8px', color: '#374151' }}>Affected Users</h3>
            <p style={{ color: '#6b7280' }}>{feature.affected_users}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{feature.business_value}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Business Value</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{feature.effort}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Effort</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{feature.risk}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Risk</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
          <button
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'discussion' ? '600' : '400',
              color: activeTab === 'discussion' ? '#4f46e5' : '#6b7280',
              borderBottom: activeTab === 'discussion' ? '2px solid #4f46e5' : '2px solid transparent',
            }}
            onClick={() => setActiveTab('discussion')}
          >
            Discussion ({feature.comments?.length || 0})
          </button>
          <button
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'activity' ? '600' : '400',
              color: activeTab === 'activity' ? '#4f46e5' : '#6b7280',
              borderBottom: activeTab === 'activity' ? '2px solid #4f46e5' : '2px solid transparent',
            }}
            onClick={() => setActiveTab('activity')}
          >
            Activity ({feature.activities?.length || 0})
          </button>
        </div>

        {activeTab === 'discussion' ? (
          <CommentThread comments={feature.comments || []} onAddComment={handleAddComment} />
        ) : (
          <ActivityTimeline activities={feature.activities || []} statusChanges={feature.status_changes || []} />
        )}
      </div>

      {showStatusModal && (
        <StatusChangeModal
          currentStatus={feature.status}
          onClose={() => setShowStatusModal(false)}
          onSubmit={handleStatusChange}
        />
      )}
    </div>
  );
};

export default FeatureDetail;
