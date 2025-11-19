"use client";

import { useState } from "react";

interface ContinueDiscussionFormProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export default function ContinueDiscussionForm({
  onSubmit,
  disabled = false,
}: ContinueDiscussionFormProps) {
  const [userPrompt, setUserPrompt] = useState("");

  const handleSubmit = () => {
    if (userPrompt.trim()) {
      onSubmit(userPrompt.trim());
      setUserPrompt("");
    }
  };

  return (
    <div className="user-prompt-section" style={{ 
      marginTop: "var(--space-6)", 
      padding: "var(--space-4)",
      border: "1px solid var(--border-color)",
      borderRadius: "var(--radius-md)",
      background: "var(--surface-bg)"
    }}>
      <label 
        htmlFor="user-prompt" 
        style={{ 
          display: "block", 
          marginBottom: "var(--space-2)",
          fontWeight: 600,
          fontSize: "var(--text-base)"
        }}
      >
        Continue the Discussion
      </label>
      <p className="subtle" style={{ marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
        Ask a question or share your thoughts to continue the conversation with the personas.
      </p>
      <textarea
        id="user-prompt"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="What are your thoughts on this discussion? Ask a question or share your perspective..."
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
          }
        }}
        style={{
          width: "100%",
          minHeight: "120px",
          padding: "var(--space-3)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--text-base)",
          fontFamily: "inherit",
          resize: "vertical",
          marginBottom: "var(--space-3)",
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!userPrompt.trim() || disabled}
        className="btn btn-primary"
        style={{
          opacity: !userPrompt.trim() || disabled ? 0.5 : 1,
          cursor: !userPrompt.trim() || disabled ? "not-allowed" : "pointer",
        }}
      >
        {disabled ? "Continuing..." : "Continue Discussion"}
      </button>
      <span className="subtle" style={{ marginLeft: "var(--space-3)", fontSize: "var(--text-sm)" }}>
        Press ⌘+Enter (or Ctrl+Enter) to submit
      </span>
    </div>
  );
}

