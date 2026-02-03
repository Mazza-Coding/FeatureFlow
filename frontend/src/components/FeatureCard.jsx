import React from "react";
import { Link } from "react-router-dom";

const FeatureCard = ({ feature }) => {
  const formatStatus = (status) => status.replace(/_/g, " ");

  return (
    <Link to={`/features/${feature.id}`} className="feature-card-link">
      <div className="card feature-card">
        <div className="feature-card-header">
          <h3 className="feature-card-title">{feature.title}</h3>
          <span className="priority-score" title="Priority Score">
            {feature.priority_score}
          </span>
        </div>

        <p className="feature-card-excerpt">
          {feature.business_problem.length > 120
            ? `${feature.business_problem.substring(0, 120)}...`
            : feature.business_problem}
        </p>

        <div className="feature-card-badges">
          <span className={`badge badge-${feature.status}`}>
            {formatStatus(feature.status)}
          </span>
          <span className={`badge badge-${feature.complexity}`}>
            {feature.complexity} complexity
          </span>
        </div>

        <div className="feature-card-meta">
          <span className="feature-card-author">
            <span className="avatar-small">
              {feature.created_by.username[0].toUpperCase()}
            </span>
            {feature.created_by.username}
          </span>
          <span className="feature-card-comments">
            💬 {feature.comment_count}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
