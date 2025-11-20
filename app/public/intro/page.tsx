"use client";

import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function IntroPage() {
  const router = useRouter();

  const handleDemoClick = () => {
    router.push("/demo");
  };

  return (
    <div className="search-container" style={{ textAlign: "center" }}>
      <h1 className="h1">Auto-Bookclub AI</h1>
      
      <p className="subtle" style={{ 
        marginTop: "var(--space-6)", 
        marginBottom: "var(--space-8)",
        fontSize: "1.25rem",
        maxWidth: "600px",
        margin: "var(--space-6) auto var(--space-8) auto"
      }}>
        Experience AI-powered book discussions with diverse personas debating 
        themes, characters, and ideas from your favorite books.
      </p>

      <div style={{ 
        display: "flex", 
        gap: "var(--space-4)", 
        justifyContent: "center",
        marginTop: "var(--space-8)"
      }}>
        <SignInButton mode="modal" forceRedirectUrl="/">
          <button className="btn btn-primary" style={{ minWidth: "140px" }}>
            Sign In
          </button>
        </SignInButton>
        
        <button 
          onClick={handleDemoClick}
          className="btn"
          style={{ minWidth: "140px" }}
        >
          Try Demo
        </button>
      </div>
    </div>
  );
}

