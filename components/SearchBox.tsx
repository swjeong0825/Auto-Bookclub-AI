"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import ResultsModal from "./ResultsModal";
import type { BookResult } from "@/lib/types";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setMeta } = useAppStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/search?title=${encodeURIComponent(query)}&limit=5`);
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

  const handleSelect = async (book: BookResult) => {
    setShowModal(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/books/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      const resolved = await res.json();
      setMeta(resolved);
      router.push("/discuss");
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
        <ResultsModal
          results={results}
          onSelect={handleSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

