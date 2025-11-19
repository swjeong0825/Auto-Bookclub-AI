/**
 * Shared constants used across the application
 */

/**
 * Server-Sent Events (SSE) prefix used in streaming responses
 * Format: "data: {json}\n\n"
 */
export const SSE_PREFIX = "data: ";

/**
 * Supported languages for AI-generated discussions and book searches
 */
export enum Language {
  ENGLISH = "en",
  KOREAN = "kr",
  JAPANESE = "ja",
  CHINESE = "zh",
  RUSSIAN = "ru",
  ARABIC = "ar",
  UNKNOWN = "unknown",
}

/**
 * Default number of turns to generate in a discussion
 * - Used for initial debate generation
 * - Used when user continues the discussion
 */
export const DEFAULT_DISCUSSION_TURNS = 3;

