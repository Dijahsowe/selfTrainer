"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-900">Something went wrong</h2>
            <p className="mt-2 text-xs text-red-700">
              {this.state.error?.message || "An unexpected application error occurred."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
