"use client";

import { useEffect, useRef, useState } from "react";
import type { BookResult } from "@/lib/types";
import BookSelectionPage from "./BookSelectionPage";
import TopicSelectionPage from "./TopicSelectionPage";
import UserSettingsPage, { type UserSettings } from "./UserSettingsPage";
import ModalPageIndicators from "./ModalPageIndicators";

interface ResultsModalProps {
  results: BookResult[];
  onSelect: (book: BookResult, topic: string, userSettings: UserSettings) => void;
  onClose: () => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  topicsCache: Map<string, string[]>;
}

type ModalPage = "books" | "topics" | "settings";

export default function ResultsModal({
  results,
  onSelect,
  onClose,
  selectedLanguage,
  onLanguageChange,
  topicsCache,
}: ResultsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<ModalPage>("books");
  const [selectedBook, setSelectedBook] = useState<BookResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

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
    setSelectedTopic(topic);
    setCurrentPage("settings");
  };

  const handleSettingsComplete = (userSettings: UserSettings) => {
    if (selectedBook && selectedTopic) {
      onSelect(selectedBook, selectedTopic, userSettings);
    }
  };

  const goToPage = (page: ModalPage) => {
    if (
      page === "books" ||
      (page === "topics" && selectedBook) ||
      (page === "settings" && selectedBook && selectedTopic)
    ) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal card modal-with-fixed-footer" ref={modalRef}>
        <div className="modal-content-scrollable">
          {currentPage === "books" && (
            <BookSelectionPage
              results={results}
              selectedLanguage={selectedLanguage}
              isLoadingTopics={isLoadingTopics}
              onLanguageChange={onLanguageChange}
              onBookSelect={handleBookSelect}
            />
          )}

          {currentPage === "topics" && (
            <TopicSelectionPage
              topics={topics}
              isLoadingTopics={isLoadingTopics}
              onTopicSelect={handleTopicSelect}
            />
          )}

          {currentPage === "settings" && (
            <UserSettingsPage
              initialCustomReaderName={undefined}
              onComplete={handleSettingsComplete}
            />
          )}
        </div>

        <ModalPageIndicators
          currentPage={currentPage}
          hasSelectedBook={!!selectedBook}
          hasSelectedTopic={!!selectedTopic}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
}

