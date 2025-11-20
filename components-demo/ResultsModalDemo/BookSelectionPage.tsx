"use client";

import { useRef } from "react";
import type { BookResult } from "@/lib/types";
import { Language } from "@/lib/constants";

const LANGUAGE_OPTIONS = [
  { label: "English", value: Language.ENGLISH },
  { label: "Korean", value: Language.KOREAN },
];

interface BookSelectionPageProps {
  results: BookResult[];
  selectedLanguage: string;
  isLoadingTopics: boolean;
  onLanguageChange: (language: string) => void;
  onBookSelect: (book: BookResult) => void;
}

export default function BookSelectionPage({
  results,
  selectedLanguage,
  isLoadingTopics,
  onLanguageChange,
  onBookSelect,
}: BookSelectionPageProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="modal-header">
        <h2>Select a book</h2>
        <select
          id="discussion-language"
          className="language-select"
          value={selectedLanguage}
          onChange={(event) => onLanguageChange(event.target.value)}
          aria-label="Discussion language"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="modal-body">
        {results.length === 0 ? (
          <p className="subtle">No results found</p>
        ) : (
          <ul className="results-list">
            {results.map((book, idx) => (
              <li key={idx}>
                <button
                  ref={idx === 0 ? firstButtonRef : undefined}
                  onClick={() => onBookSelect(book)}
                  className="result-item"
                  disabled={isLoadingTopics}
                >
                  {book.coverUrl && (
                    <img
                      src={book.coverUrl}
                      alt={`${book.title} cover`}
                      className="result-cover"
                    />
                  )}
                  <div className="result-info">
                    <div className="result-title">{book.title}</div>
                    <div className="result-author subtle">
                      {book.author}
                      {book.year && ` (${book.year})`}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

