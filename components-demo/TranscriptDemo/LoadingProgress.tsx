"use client";

interface LoadingProgressProps {
  progress: number;
  message?: string;
}

export default function LoadingProgress({ 
  progress, 
  message = "Continuing discussion..." 
}: LoadingProgressProps) {
  return (
    <div className="loading-state" style={{ marginTop: "var(--space-4)" }}>
      <p className="subtle">{message}</p>
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="progress-text">{Math.round(progress * 100)}%</p>
      </div>
    </div>
  );
}

