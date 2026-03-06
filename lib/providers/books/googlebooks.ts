import type { BookResult } from "@/lib/types";

interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  categories?: string[];
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

interface GoogleBooksVolume {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

interface GoogleBooksResponse {
  items?: GoogleBooksVolume[];
  totalItems: number;
}

/**
 * Search for Korean books using Google Books API
 * @param title - Book title to search for
 * @param limit - Maximum number of results (default: 5)
 * @returns Array of BookResult objects
 */
export async function search(
  title: string,
  limit: number = 5
): Promise<BookResult[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  
  // Search specifically for Korean books by adding langRestrict parameter
  url.searchParams.set("q", title);
  url.searchParams.set("langRestrict", "ko");
  url.searchParams.set("maxResults", Math.min(limit, 40).toString());
  url.searchParams.set("printType", "books");
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Google Books search failed: ${res.statusText}`);
  }

  const data: GoogleBooksResponse = await res.json();
  
  if (!data.items || data.items.length === 0) {
    return [];
  }

  return data.items.map((item) => {
    const info = item.volumeInfo;
    
    // Extract year from publishedDate (format: YYYY-MM-DD or YYYY)
    const year = info.publishedDate
      ? parseInt(info.publishedDate.split("-")[0])
      : undefined;

    // Get the best available thumbnail
    const coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;

    return {
      title: info.title,
      author: info.authors?.[0] || "Unknown Author",
      year,
      coverUrl: coverUrl?.replace("http://", "https://"), // Force HTTPS
      workKey: item.id, // Use Google Books ID as workKey
      subjects: info.categories?.slice(0, 5),
      description: info.description,
    };
  });
}

/**
 * Resolve book metadata by fetching detailed information
 * @param metaHint - Partial book information with workKey (Google Books ID)
 * @returns Fully resolved BookResult
 */
export async function resolve(metaHint: Partial<BookResult>): Promise<BookResult> {
  // If we have a workKey (Google Books ID), fetch detailed info
  if (metaHint.workKey) {
    try {
      const resolveUrl = new URL(`https://www.googleapis.com/books/v1/volumes/${metaHint.workKey}`);
      if (process.env.GOOGLE_BOOKS_API_KEY) {
        resolveUrl.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
      }
      const res = await fetch(resolveUrl.toString());
      
      if (res.ok) {
        const data: GoogleBooksVolume = await res.json();
        const info = data.volumeInfo;

        const year = info.publishedDate
          ? parseInt(info.publishedDate.split("-")[0])
          : undefined;

        const coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;

        return {
          title: info.title,
          author: info.authors?.[0] || "Unknown Author",
          year,
          coverUrl: coverUrl?.replace("http://", "https://"),
          workKey: data.id,
          subjects: info.categories?.slice(0, 5),
          description: info.description,
        };
      }
    } catch (error) {
      console.error("Failed to resolve book from Google Books:", error);
    }
  }

  // Fallback: return what we have
  return {
    title: metaHint.title || "Unknown Title",
    author: metaHint.author || "Unknown Author",
    year: metaHint.year,
    coverUrl: metaHint.coverUrl,
    workKey: metaHint.workKey,
    subjects: metaHint.subjects,
    description: metaHint.description,
  };
}

