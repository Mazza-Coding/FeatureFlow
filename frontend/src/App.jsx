import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import FeatureList from './pages/FeatureList';
import FeatureDetail from './pages/FeatureDetail';
import FeatureForm from './pages/FeatureForm';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      {user && <Header />}
      <div className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <FeatureList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/features/new"
            element={
              <ProtectedRoute>
                <FeatureForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/features/:id"
            element={
              <ProtectedRoute>
                <FeatureDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/features/:id/edit"
            element={
              <ProtectedRoute>
                <FeatureForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

export default App;
