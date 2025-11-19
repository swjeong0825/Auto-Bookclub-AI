"use client";

type ModalPage = "books" | "topics";

interface ModalPageIndicatorsProps {
  currentPage: ModalPage;
  hasSelectedBook: boolean;
  onPageChange: (page: ModalPage) => void;
}

export default function ModalPageIndicators({
  currentPage,
  hasSelectedBook,
  onPageChange,
}: ModalPageIndicatorsProps) {
  return (
    <div className="modal-page-indicators">
      <button
        className={`page-dot ${currentPage === "books" ? "active" : ""}`}
        onClick={() => onPageChange("books")}
        aria-label="Book selection page"
      />
      <button
        className={`page-dot ${currentPage === "topics" ? "active" : ""} ${!hasSelectedBook ? "disabled" : ""}`}
        onClick={() => onPageChange("topics")}
        aria-label="Topic selection page"
        disabled={!hasSelectedBook}
      />
    </div>
  );
}

