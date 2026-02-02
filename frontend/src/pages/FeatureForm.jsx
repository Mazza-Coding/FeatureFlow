import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { featuresApi } from '../services/api';

const FeatureForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    business_problem: '',
    expected_value: '',
    affected_users: '',
    complexity: 'medium',
    business_value: 5,
    effort: 5,
    risk: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchFeature();
    }
  }, [id]);

  const fetchFeature = async () => {
    try {
      const response = await featuresApi.getOne(id);
      const { title, business_problem, expected_value, affected_users, complexity, business_value, effort, risk } = response.data;
      setFormData({ title, business_problem, expected_value, affected_users, complexity, business_value, effort, risk });
    } catch (error) {
      console.error('Failed to fetch feature:', error);
      navigate('/');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['business_value', 'effort', 'risk'].includes(name) ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await featuresApi.update(id, formData);
      } else {
        await featuresApi.create(formData);
      }
      navigate('/');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError('Failed to save feature');
      }
    } finally {
      setLoading(false);
    }
  };

  const priorityScore = ((formData.business_value * 2 - formData.effort - formData.risk) / 2).toFixed(1);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>
          &larr; Back to Features
        </Link>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>{isEditing ? 'Edit Feature' : 'New Feature Proposal'}</h2>

        {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Short, descriptive title"
            />
          </div>

          <div className="form-group">
            <label>Business Problem *</label>
            <textarea
              name="business_problem"
              value={formData.business_problem}
              onChange={handleChange}
              required
              placeholder="What problem does this feature solve? Why is it needed?"
            />
          </div>

          <div className="form-group">
            <label>Expected Value *</label>
            <textarea
              name="expected_value"
              value={formData.expected_value}
              onChange={handleChange}
              required
              placeholder="What value will this feature provide to users or the business?"
            />
          </div>

          <div className="form-group">
            <label>Affected Users *</label>
            <textarea
              name="affected_users"
              value={formData.affected_users}
              onChange={handleChange}
              required
              placeholder="Who will use this feature? How many users are affected?"
            />
          </div>

          <div className="form-group">
            <label>Complexity</label>
            <select name="complexity" value={formData.complexity} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>Business Value (1-10)</label>
              <input
                type="range"
                name="business_value"
                min="1"
                max="10"
                value={formData.business_value}
                onChange={handleChange}
              />
              <div style={{ textAlign: 'center', fontWeight: '600', color: '#10b981' }}>{formData.business_value}</div>
            </div>

            <div className="form-group">
              <label>Effort (1-10)</label>
              <input
                type="range"
                name="effort"
                min="1"
                max="10"
                value={formData.effort}
                onChange={handleChange}
              />
              <div style={{ textAlign: 'center', fontWeight: '600', color: '#f59e0b' }}>{formData.effort}</div>
            </div>

            <div className="form-group">
              <label>Risk (1-10)</label>
              <input
                type="range"
                name="risk"
                min="1"
                max="10"
                value={formData.risk}
                onChange={handleChange}
              />
              <div style={{ textAlign: 'center', fontWeight: '600', color: '#ef4444' }}>{formData.risk}</div>
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', marginBottom: '24px', background: '#f3f4f6' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Calculated Priority Score</div>
            <span className="priority-score">{priorityScore}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Feature' : 'Create Feature'}
            </button>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeatureForm;
