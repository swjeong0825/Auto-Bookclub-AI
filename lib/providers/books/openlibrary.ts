import type { BookResult } from "@/lib/types";

interface OpenLibrarySearchDoc {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  key: string;
  subject?: string[];
}

interface OpenLibrarySearchResponse {
  docs: OpenLibrarySearchDoc[];
}

interface OpenLibraryWork {
  title: string;
  authors?: Array<{ author: { key: string } }>;
  first_publish_date?: string;
  covers?: number[];
  subjects?: string[];
  description?: string | { value: string };
  key: string;
}

interface OpenLibraryAuthor {
  name: string;
}

export async function search(
  title: string,
  limit: number = 5
): Promise<BookResult[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("title", title);
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("fields", "title,author_name,first_publish_year,cover_i,key,subject");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open Library search failed: ${res.statusText}`);
  }

  const data: OpenLibrarySearchResponse = await res.json();
  return data.docs.map((doc) => ({
    title: doc.title,
    author: doc.author_name?.[0] || "Unknown Author",
    year: doc.first_publish_year,
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : undefined,
    workKey: doc.key?.replace("/works/", ""),
    subjects: doc.subject?.slice(0, 5),
  }));
}

export async function resolve(metaHint: Partial<BookResult>): Promise<BookResult> {
  if (metaHint.workKey) {
    const workRes = await fetch(
      `https://openlibrary.org/works/${metaHint.workKey}.json`
    );
    if (workRes.ok) {
      const work: OpenLibraryWork = await workRes.json();
      const authorKey = work.authors?.[0]?.author?.key;
      let authorName = "Unknown Author";

      if (authorKey) {
        const authorRes = await fetch(
          `https://openlibrary.org${authorKey}.json`
        );
        if (authorRes.ok) {
          const author: OpenLibraryAuthor = await authorRes.json();
          authorName = author.name;
        }
      }

      const year = work.first_publish_date
        ? parseInt(work.first_publish_date.split("-")[0])
        : undefined;

      const description =
        typeof work.description === "string"
          ? work.description
          : work.description?.value;

      return {
        title: work.title,
        author: authorName,
        year,
        coverUrl: work.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-M.jpg`
          : undefined,
        workKey: metaHint.workKey,
        subjects: work.subjects?.slice(0, 5),
        description,
      };
    }
  }

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

