"use client";

import { useEffect, useRef } from "react";
import type { BookResult } from "@/lib/types";

interface ResultsModalProps {
  results: BookResult[];
  onSelect: (book: BookResult) => void;
  onClose: () => void;
}

export default function ResultsModal({
  results,
  onSelect,
  onClose,
}: ResultsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    firstButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal card" ref={modalRef}>
        <div className="modal-header">
          <h2>Select a book</h2>
          <button onClick={onClose} className="btn-close" aria-label="Close">
            ×
          </button>
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
                    onClick={() => onSelect(book)}
                    className="result-item"
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
      </div>
    </div>
  );
}

