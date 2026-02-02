import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { featuresApi } from '../services/api';

const FeatureList = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await featuresApi.getAll();
      setFeatures(response.data);
    } catch (error) {
      console.error('Failed to fetch features:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeatures = features
    .filter((f) => filter === 'all' || f.status === filter)
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priority_score - a.priority_score;
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) {
    return <div className="loading">Loading features...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Feature Proposals</h2>
        <Link to="/features/new" className="btn btn-primary">
          + New Feature
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '8px', fontWeight: '500' }}>Status:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="all">All</option>
              <option value="proposed">Proposed</option>
              <option value="under_discussion">Under Discussion</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label style={{ marginRight: '8px', fontWeight: '500' }}>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority Score</option>
            </select>
          </div>
        </div>
      </div>

      {filteredFeatures.length === 0 ? (
        <div className="empty-state">
          <h3>No features found</h3>
          <p style={{ marginTop: '8px' }}>Create your first feature proposal to get started.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {filteredFeatures.map((feature) => (
            <Link to={`/features/${feature.id}`} key={feature.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ height: '100%', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', color: '#111' }}>{feature.title}</h3>
                  <span className="priority-score">{feature.priority_score}</span>
                </div>
                
                <p style={{ color: '#6b7280', marginBottom: '12px', fontSize: '14px' }}>
                  {feature.business_problem.substring(0, 120)}...
                </p>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span className={`badge badge-${feature.status}`}>
                    {feature.status.replace('_', ' ')}
                  </span>
                  <span className={`badge badge-${feature.complexity}`}>
                    {feature.complexity} complexity
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                  <span>By {feature.created_by.username}</span>
                  <span>{feature.comment_count} comments</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureList;
