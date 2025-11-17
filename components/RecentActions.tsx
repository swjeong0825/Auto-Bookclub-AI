"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/client";

export default function RecentActions() {
  const router = useRouter();
  const { reset } = useAppStore();

  const handleNewSearch = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="recent-actions">
      <button onClick={handleNewSearch} className="btn">
        New Search
      </button>
    </div>
  );
}

