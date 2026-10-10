import { Component, type ErrorInfo, type ReactNode } from "react";
import "./error-boundary.css";

interface ErrorBoundaryProps {
  /** Shown before the Reload button, e.g. "The editor failed to load." */
  message: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    return (
      <div className="error-boundary notification is-danger" role="alert">
        <span>{this.props.message}</span>
        <button
          className="button is-small"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
