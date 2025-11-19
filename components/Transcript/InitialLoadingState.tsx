"use client";

import type { BookResult } from "@/lib/types";

interface InitialLoadingStateProps {
  meta: BookResult;
  progress?: number;
}

export default function InitialLoadingState({ meta, progress }: InitialLoadingStateProps) {
  const progressPercent = progress !== undefined ? Math.round(progress * 100) : 0;
  
  return (
    <div className="discuss-container">
      <div className="loading-state">
        <h1 className="h1">{meta.title}</h1>
        <p className="subtle">Creating personas and generating debate...</p>
        {progress !== undefined && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="progress-text">{progressPercent}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

