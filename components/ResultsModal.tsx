"use client";

import { useEffect, useRef, useState } from "react";
import type { BookResult } from "@/lib/types";
import { Language } from "@/lib/constants";

const LANGUAGE_OPTIONS = [
  { label: "English", value: Language.ENGLISH },
  { label: "Korean", value: Language.KOREAN },
];

interface ResultsModalProps {
  results: BookResult[];
  onSelect: (book: BookResult, topic: string) => void;
  onClose: () => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  topicsCache: Map<string, string[]>;
}

type ModalPage = "books" | "topics";

export default function ResultsModal({
  results,
  onSelect,
  onClose,
  selectedLanguage,
  onLanguageChange,
  topicsCache,
}: ResultsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const [currentPage, setCurrentPage] = useState<ModalPage>("books");
  const [selectedBook, setSelectedBook] = useState<BookResult | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [customTopic, setCustomTopic] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Backspace") {
        if (currentPage === "topics") {
          setCurrentPage("books");
        } else {
          onClose();
        }
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
  }, [onClose, currentPage]);

  const getCacheKey = (book: BookResult) => {
    return `${book.title}|${book.author}`;
  };

  const handleBookSelect = async (book: BookResult) => {
    setSelectedBook(book);
    
    // Check cache first
    const cacheKey = getCacheKey(book);
    const cachedTopics = topicsCache.get(cacheKey);
    if (cachedTopics) {
      setTopics(cachedTopics);
      setCurrentPage("topics");
      return;
    }

    // Immediately transition to topics page with loading state
    setCurrentPage("topics");
    setIsLoadingTopics(true);
    
    // Generate new topics
    try {
      const res = await fetch("/api/discussions/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metaHint: book,
          language: selectedLanguage 
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate topics");
      }
      
      const data = await res.json();
      setTopics(data.topics);
      
      // Cache the topics with both title and author as key
      topicsCache.set(cacheKey, data.topics);
    } catch (error) {
      console.error("Topic generation failed:", error);
      // Could show an error message to user here
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleTopicSelect = (topic: string) => {
    if (selectedBook) {
      onSelect(selectedBook, topic);
    }
  };

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim() && selectedBook) {
      onSelect(selectedBook, customTopic.trim());
    }
  };

  const goToPage = (page: ModalPage) => {
    if (page === "books" || (page === "topics" && selectedBook)) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal card modal-with-fixed-footer" ref={modalRef}>
        <div className="modal-content-scrollable">
          {currentPage === "books" && (
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
                          onClick={() => handleBookSelect(book)}
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
          )}

          {currentPage === "topics" && (
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
                            onClick={() => handleTopicSelect(topic)}
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
          )}
        </div>

        {/* Page Indicators at Bottom - Always Visible */}
        <div className="modal-page-indicators">
          <button
            className={`page-dot ${currentPage === "books" ? "active" : ""}`}
            onClick={() => goToPage("books")}
            aria-label="Book selection page"
          />
          <button
            className={`page-dot ${currentPage === "topics" ? "active" : ""} ${!selectedBook ? "disabled" : ""}`}
            onClick={() => goToPage("topics")}
            aria-label="Topic selection page"
            disabled={!selectedBook}
          />
        </div>
      </div>
    </div>
  );
}
