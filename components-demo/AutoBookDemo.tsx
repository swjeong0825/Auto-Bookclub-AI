"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/client";
import { Language } from "@/lib/constants";
import TopicSelectionPage from "./ResultsModalDemo/TopicSelectionPage";
import UserSettingsPage, { type UserSettings } from "./ResultsModalDemo/UserSettingsPage";
import ModalPageIndicators from "./ResultsModalDemo/ModalPageIndicators";
import type { BookResult } from "@/lib/types";

// Predefined book: 1984 by George Orwell
const PREDEFINED_BOOK: BookResult = {
  title: "1984",
  author: "George Orwell",
  year: 1949,
  description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism, government surveillance, and repressive regimentation.",
  subjects: [
    "Fiction",
    "Dystopian fiction",
    "Political fiction",
    "Science fiction",
    "Totalitarianism",
    "Surveillance"
  ],
  coverUrl: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
};

type ModalPage = "books" | "topics" | "settings";

export default function AutoBookDemo() {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<ModalPage>("topics");
  const [selectedTopic, setSelectedTopicState] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [language] = useState(Language.ENGLISH);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setMeta } = useAppStore();
  const hasLoadedTopicsRef = useRef(false);

  // Auto-open modal and load topics on mount
  useEffect(() => {
    setShowModal(true);
    
    // Load topics for the predefined book
    if (!hasLoadedTopicsRef.current) {
      hasLoadedTopicsRef.current = true;
      loadTopics();
    }
  }, []);

  // Handle escape key and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const loadTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const res = await fetch("/api/demo/discussions/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metaHint: PREDEFINED_BOOK,
          language 
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate topics");
      }
      
      const data = await res.json();
      setTopics(data.topics);
    } catch (error) {
      console.error("Topic generation failed:", error);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopicState(topic);
    setCurrentPage("settings");
  };

  const handleSettingsComplete = (userSettings: UserSettings) => {
    setShowModal(false);

    try {
      // Set the meta directly without needing to resolve (since we have all the data)
      setMeta(PREDEFINED_BOOK, language);
      
      // Store selected topic and user settings in Zustand
      const { setSelectedTopic, setCustomReaderName } = useAppStore.getState();
      setSelectedTopic(selectedTopic!);
      setCustomReaderName(userSettings.customReaderName);
      
      router.push("/demo/discuss");
    } catch (error) {
      console.error("Setup failed:", error);
    }
  };

  const goToPage = (page: ModalPage) => {
    // In demo mode, we skip the books page and start at topics
    if (page === "books") {
      setCurrentPage("topics");
    } else if (page === "topics" || (page === "settings" && selectedTopic)) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="search-container">
        <h1 className="h1">Auto-Bookclub AI - Demo</h1>
        <p className="subtle" style={{ marginBottom: "var(--space-6)" }}>
          Demo discussion about <strong>1984</strong> by George Orwell
        </p>
        <div style={{ textAlign: "center", marginTop: "var(--space-6)" }}>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            {showModal ? "Continue Setup" : "Start Discussion"}
          </button>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal card modal-with-fixed-footer" ref={modalRef}>
            <div className="modal-content-scrollable">
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
              hasSelectedBook={true}
              hasSelectedTopic={!!selectedTopic}
              onPageChange={goToPage}
            />
          </div>
        </div>
      )}
    </>
  );
}

