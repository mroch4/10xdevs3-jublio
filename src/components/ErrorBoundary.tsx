import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // TODO: Integrate telemetry service before production release
    // Track in backlog: Send errors to monitoring service (e.g., Sentry, LogRocket, Firebase Analytics)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something went wrong</h4>
            <p>We encountered an unexpected error. Please try refreshing the page.</p>
            {this.state.error && (
              <details className="mt-3">
                <summary className="text-muted" style={{ cursor: "pointer" }}>
                  Error details
                </summary>
                <pre className="mt-2 p-2 bg-light border rounded" style={{ fontSize: "0.875rem" }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <hr />
            <button className="btn btn-primary" onClick={this.handleReset}>
              Try Again
            </button>
            <button className="btn btn-secondary ms-2" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
