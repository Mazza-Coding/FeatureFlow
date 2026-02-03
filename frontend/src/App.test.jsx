import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FeatureForm from "./pages/FeatureForm";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBanner from "./components/ErrorBanner";

vi.mock("./services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  featuresApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getOne: vi.fn(),
    create: vi.fn(() => Promise.resolve({ data: { id: 1, title: "Test" } })),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>{component}</ToastProvider>
      </AuthProvider>
    </BrowserRouter>,
  );
};

describe("Login Component", () => {
  it("renders login form", () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("Login to FeatureFlow")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("has link to register page", () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("Register")).toBeInTheDocument();
  });
});

describe("Register Component", () => {
  it("renders register form", () => {
    renderWithProviders(<Register />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
  });

  it("validates password match", async () => {
    renderWithProviders(<Register />);

    const inputs = screen.getAllByRole("textbox");
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    fireEvent.change(inputs[0], { target: { value: "testuser" } }); // username
    fireEvent.change(inputs[1], { target: { value: "test@example.com" } }); // email
    fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "different" } });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });
});

describe("FeatureForm Component", () => {
  it("renders new feature form", () => {
    renderWithProviders(<FeatureForm />);

    expect(screen.getByText("New Feature Proposal")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/short, descriptive title/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/what problem does this feature solve/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/what value will this feature provide/i),
    ).toBeInTheDocument();
  });

  it("calculates priority score", () => {
    renderWithProviders(<FeatureForm />);

    expect(screen.getByText(/calculated priority score/i)).toBeInTheDocument();
  });

  it("has complexity selector", () => {
    renderWithProviders(<FeatureForm />);

    const complexitySelect = screen.getByRole("combobox");
    expect(complexitySelect).toBeInTheDocument();
    expect(complexitySelect.value).toBe("medium");
  });
});

describe("LoadingSpinner Component", () => {
  it("renders with default text", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(<LoadingSpinner text="Fetching data..." />);
    expect(screen.getByText("Fetching data...")).toBeInTheDocument();
  });

  it("renders small variant without text", () => {
    const { container } = render(<LoadingSpinner small />);
    expect(container.querySelector(".spinner--small")).toBeInTheDocument();
  });
});

describe("ErrorBanner Component", () => {
  it("renders with default title", () => {
    render(<ErrorBanner />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders with custom title and message", () => {
    render(<ErrorBanner title="Error!" message="Failed to load data" />);
    expect(screen.getByText("Error!")).toBeInTheDocument();
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", () => {
    const mockRetry = vi.fn();
    render(<ErrorBanner onRetry={mockRetry} />);

    const retryButton = screen.getByText("Try Again");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("does not show retry button when onRetry is not provided", () => {
    render(<ErrorBanner />);
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });
});

describe("ToastContext", () => {
  const TestComponent = () => {
    const toast = useToast();
    return (
      <div>
        <button onClick={() => toast.success("Success!")}>Show Success</button>
        <button onClick={() => toast.error("Error!")}>Show Error</button>
        <button onClick={() => toast.info("Info!")}>Show Info</button>
      </div>
    );
  };

  it("renders toasts when triggered", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Success"));
    await waitFor(() => {
      expect(screen.getByText("Success!")).toBeInTheDocument();
    });
  });

  it("renders different toast types", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Error"));
    await waitFor(() => {
      expect(screen.getByText("Error!")).toBeInTheDocument();
    });
  });

  it("allows closing toasts", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Info"));
    await waitFor(() => {
      expect(screen.getByText("Info!")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Info!")).not.toBeInTheDocument();
    });
  });
});
