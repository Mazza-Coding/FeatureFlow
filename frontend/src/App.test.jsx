import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import FeatureForm from './pages/FeatureForm';

vi.mock('./services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  featuresApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getOne: vi.fn(),
    create: vi.fn(() => Promise.resolve({ data: { id: 1, title: 'Test' } })),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText('Login to FeatureFlow')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('has link to register page', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText('Register')).toBeInTheDocument();
  });
});

describe('Register Component', () => {
  it('renders register form', () => {
    renderWithProviders(<Register />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('validates password match', async () => {
    renderWithProviders(<Register />);
    
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different' } });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
});

describe('FeatureForm Component', () => {
  it('renders new feature form', () => {
    renderWithProviders(<FeatureForm />);
    
    expect(screen.getByText('New Feature Proposal')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business problem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected value/i)).toBeInTheDocument();
  });

  it('calculates priority score', () => {
    renderWithProviders(<FeatureForm />);
    
    expect(screen.getByText(/calculated priority score/i)).toBeInTheDocument();
  });

  it('has complexity selector', () => {
    renderWithProviders(<FeatureForm />);
    
    const complexitySelect = screen.getByLabelText(/complexity/i);
    expect(complexitySelect).toBeInTheDocument();
    expect(complexitySelect.value).toBe('medium');
  });
});
