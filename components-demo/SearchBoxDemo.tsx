"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/client";
import { Language } from "@/lib/constants";
import { detectLanguage, getLanguageCode } from "@/lib/utils/languageDetection";
import ResultsModalDemo from "./ResultsModalDemo";
import type { UserSettings } from "./ResultsModalDemo/UserSettingsPage";
import type { BookResult } from "@/lib/types";

export default function SearchBoxDemo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [language, setLanguage] = useState(Language.ENGLISH);
  const [detectedLangCode, setDetectedLangCode] = useState("en");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setMeta } = useAppStore();
  
  // Persistent topics cache that survives modal open/close
  const topicsCacheRef = useRef<Map<string, string[]>>(new Map());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    // Detect language from the search query
    const detectedLang = detectLanguage(query);
    const langCode = getLanguageCode(detectedLang); // Use detectedLang directly, not state variable
    
    // Update state for UI
    setLanguage(detectedLang);
    setDetectedLangCode(langCode);
    
    // Log detected language (placeholder logic)
    console.log("===========================================");
    console.log("🌍 Language Detection Results:");
    console.log(`   Language: ${detectedLang}`);
    console.log(`   Language Code: ${langCode}`);
    console.log("===========================================");

    setIsLoading(true);
    try {
      const res = await fetch(`/api/demo/books/${langCode}/search?title=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setResults(data);
      setShowModal(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowModal(false);
    }
  };

  const handleSelect = async (book: BookResult, topic: string, userSettings: UserSettings) => {
    setShowModal(false);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/demo/books/${detectedLangCode}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      const resolved = await res.json();
      setMeta(resolved, language);
      
      // Store selected topic and user settings in Zustand
      const { setSelectedTopic, setCustomReaderName } = useAppStore.getState();
      setSelectedTopic(topic);
      setCustomReaderName(userSettings.customReaderName);
      
      router.push("/demo/discuss");
    } catch (error) {
      console.error("Resolve failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="search-container">
        <h1 className="h1">Auto-Bookclub AI</h1>
        <p className="subtle" style={{ marginBottom: "var(--space-6)" }}>
          Search for a book to start an AI-powered discussion
        </p>
        <div className="search-box">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter book title..."
            className="search-input"
            disabled={isLoading}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="btn btn-primary"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      {showModal && (
        <ResultsModalDemo
          results={results}
          onSelect={handleSelect}
          onClose={() => setShowModal(false)}
          selectedLanguage={language}
          onLanguageChange={(lang) => setLanguage(lang as Language)}
          topicsCache={topicsCacheRef.current}
        />
      )}
    </>
  );
}

