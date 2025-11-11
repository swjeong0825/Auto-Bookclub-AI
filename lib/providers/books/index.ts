import type { BookResult } from "@/lib/types";

export interface BookProvider {
  search(title: string, limit?: number): Promise<BookResult[]>;
  resolve(metaHint: Partial<BookResult>): Promise<BookResult>;
}

export { search, resolve } from "./openlibrary";

