"use client";

import { useState } from "react";

interface TopicSelectionPageProps {
  topics: string[];
  isLoadingTopics: boolean;
  onTopicSelect: (topic: string) => void;
}

export default function TopicSelectionPage({
  topics,
  isLoadingTopics,
  onTopicSelect,
}: TopicSelectionPageProps) {
  const [customTopic, setCustomTopic] = useState("");

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      onTopicSelect(customTopic.trim());
    }
  };

  return (
    <>
      <div className="modal-header">
        <h2>Select a topic</h2>
      </div>
      <div className="modal-body">
        {isLoadingTopics ? (
          <div className="loading-state">
            <div className="spinner" />
            <p className="subtle">Generating discussion topics...</p>
          </div>
        ) : (
          <div className="topics-container">
            {/* Custom Topic Input */}
            <div className="topic-item custom-topic">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customTopic.trim()) {
                    handleCustomTopicSubmit();
                  }
                }}
                placeholder="Write your own topic..."
                className="custom-topic-input"
              />
              <button
                onClick={handleCustomTopicSubmit}
                disabled={!customTopic.trim()}
                className="btn btn-primary custom-topic-btn"
              >
                Use Custom Topic
              </button>
            </div>

            {/* Generated Topics */}
            <div className="topics-divider">
              <span>or choose a generated topic</span>
            </div>
            
            <ul className="topics-list">
              {topics.map((topic, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => onTopicSelect(topic)}
                    className="topic-item"
                  >
                    <div className="topic-number">{idx + 1}</div>
                    <div className="topic-text">{topic}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

