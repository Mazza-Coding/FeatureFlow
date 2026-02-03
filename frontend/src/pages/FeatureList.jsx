import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { featuresApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import SearchInput from "../components/SearchInput";
import FeatureCard from "../components/FeatureCard";

const FeatureList = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await featuresApi.getAll();
      setFeatures(response.data.results || response.data);
    } catch (err) {
      setError("Failed to load features. Please try again.");
      console.error("Failed to fetch features:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeatures = features
    .filter((f) => filter === "all" || f.status === filter)
    .filter((f) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(query) ||
        f.business_problem.toLowerCase().includes(query) ||
        f.created_by.username.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "priority") return b.priority_score - a.priority_score;
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Calculate stats
  const stats = {
    total: features.length,
    proposed: features.filter((f) => f.status === "proposed").length,
    inProgress: features.filter((f) => f.status === "in_progress").length,
    done: features.filter((f) => f.status === "done").length,
  };

  if (loading) {
    return <LoadingSpinner text="Loading features..." />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchFeatures} />;
  }

  return (
    <div>
      <div className="feature-list-header">
        <h2>Feature Proposals</h2>
        <Link to="/features/new" className="btn btn-primary">
          + New Feature
        </Link>
      </div>

      {/* Stats */}
      {features.length > 0 && (
        <div className="stat-counter">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#3b82f6" }}>
              {stats.proposed}
            </span>
            <span className="stat-label">Proposed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#8b5cf6" }}>
              {stats.inProgress}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#10b981" }}>
              {stats.done}
            </span>
            <span className="stat-label">Done</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 1, maxWidth: "300px" }}>
            <SearchInput
              placeholder="Search features..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="proposed">Proposed</option>
              <option value="under_discussion">Under Discussion</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority Score</option>
            </select>
          </div>
        </div>
      </div>

      {features.length === 0 ? (
        <EmptyState
          icon="🚀"
          title="No features yet"
          message="Create your first feature proposal to get started tracking ideas."
          actionText="+ New Feature"
          actionLink="/features/new"
        />
      ) : filteredFeatures.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No matches found"
          message="Try adjusting your search or filter criteria."
          actionText="Clear Filters"
          onAction={() => {
            setFilter("all");
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="grid grid-2">
          {filteredFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureList;
