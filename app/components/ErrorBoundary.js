// app/components/ErrorBoundary.js
"use client";

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Check if an error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
          <h2 className="text-2xl font-bold mb-4">Oops, Something Went Wrong</h2>
          <p className="text-gray-400 mb-6">A part of the application failed to load. Please try refreshing the page.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg hover:bg-yellow-300"
          >
            Try Again
          </button>
        </div>
      );
    }

    // Return children components in case of no error
    return this.props.children;
  }
}

export default ErrorBoundary;