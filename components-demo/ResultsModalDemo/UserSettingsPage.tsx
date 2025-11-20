"use client";

import { useState } from "react";

interface UserSettingsPageProps {
  initialCustomReaderName?: string;
  onComplete: (settings: UserSettings) => void;
}

export interface UserSettings {
  customReaderName?: string;
  // Future fields can be added here:
  // email?: string;
  // preferredPace?: string;
  // notificationPreference?: boolean;
}

const MAX_NAME_LENGTH = 20;

export default function UserSettingsPage({
  initialCustomReaderName,
  onComplete,
}: UserSettingsPageProps) {
  const [customReaderName, setCustomReaderName] = useState(
    initialCustomReaderName || ""
  );

  const handleNameChange = (value: string) => {
    // Enforce character limit
    if (value.length <= MAX_NAME_LENGTH) {
      setCustomReaderName(value);
    }
  };

  const handleStartDiscussion = () => {
    const settings: UserSettings = {
      customReaderName: customReaderName.trim() || undefined,
      // Future fields will be added here
    };
    onComplete(settings);
  };

  const remainingChars = MAX_NAME_LENGTH - customReaderName.length;
  const isNearLimit = remainingChars <= 5;

  return (
    <>
      <div className="modal-header">
        <h2>Personalize Your Experience</h2>
      </div>
      <div className="modal-body">
        <div className="settings-welcome-section">
          <div className="settings-icon">👤</div>
          <p className="settings-description">
            Personalize your discussion experience by letting the AI personas know what to call you.
          </p>
          <p className="subtle" style={{ fontSize: "0.9rem", marginBottom: "var(--space-6)" }}>
            This is completely optional and can be skipped.
          </p>
        </div>

        <div className="settings-form">
          {/* Custom Reader Name Field */}
          <div className="settings-field-group">
            <label htmlFor="custom-reader-name" className="settings-field-label">
              Your name
              <span className="optional-badge">Optional</span>
            </label>
            <input
              id="custom-reader-name"
              type="text"
              value={customReaderName}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleStartDiscussion();
                }
              }}
              placeholder="e.g., Sarah, John..."
              className="settings-field-input"
              maxLength={MAX_NAME_LENGTH}
              autoFocus
            />
            <div className="settings-field-footer">
              <span className="subtle settings-field-hint">
                {customReaderName.trim()
                  ? "Personas will address you by this name"
                  : "Leave blank to be addressed as 'you'"}
              </span>
              {customReaderName && (
                <span
                  className="char-counter"
                  style={{
                    color: isNearLimit ? "#ff6b6b" : "var(--muted)",
                  }}
                >
                  {remainingChars}
                </span>
              )}
            </div>
          </div>

          {/* Future fields can be added here following the same pattern:
          
          <div className="settings-field-group">
            <label htmlFor="email" className="settings-field-label">
              Email address
              <span className="optional-badge">Optional</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="settings-field-input"
            />
            <div className="settings-field-footer">
              <span className="subtle settings-field-hint">
                Get discussion summaries and updates
              </span>
            </div>
          </div>
          
          */}
        </div>

        <div className="settings-actions">
          <button
            onClick={handleStartDiscussion}
            className="btn btn-primary settings-start-btn"
          >
            Start the Book Club!
          </button>
        </div>
      </div>
    </>
  );
}

