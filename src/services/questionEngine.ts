/*
Create src/services/questionEngine.ts. This is the heart of Project 3 
— a function that reads a sentence and decides what the user is asking for, 
using nothing but .includes() checks. 
This is a near-exact parallel to fallbackIntent() in server/index.ts.
 */

// Every possible "intent" your app can recognize.
// A union of string literals — TypeScript will error on any typo
// like "top_populaton_state".
export type Intent =
  | "top_population_state"
  | "least_population_state"
  | "top_veteran_state"
  | "total_population"
  | "avg_median_age"
  | "city_count"
  | "biggest_city"
  | "smallest_city"
  | "unknown";

/*
  Why a union type and not just string? If Intent were string, 
  you could accidentally write "top_populaton_state" (typo) 
  anywhere and TypeScript would never complain — it's just a string. 
  With the union, every place that produces or consumes an Intent 
  is checked against this exact list of 9 values. 
  Typos become compile errors instead of silent bugs.
   */

// The keyword router. Reads a question and returns one Intent.
// This function has NO AI, NO API calls — just string matching.
// It is the safety net: Project 4 calls this whenever the AI fails.
export function detectIntent(question: string): Intent {
  // Lowercase once at the start so every check below is case-insensitive.
  // "Which STATE has the Most veterans?" and "which state has the most veterans?"
  // produce identical results.
  const q = question.toLowerCase();
  // ── Topic detectors ──────────────────────────────────────────────
  // Each of these is true/false: did the question mention this topic at all?

  const asksForVeterans = q.includes("veteran") || q.includes("military");

  const asksForAge =
    q.includes("age") || q.includes("median age") || q.includes("how old");

  const asksForTotalPopulation =
    q.includes("total population") ||
    q.includes("overall population") ||
    q.includes("how many people") ||
    q.includes("combined population");

  const asksForCityCount =
    q.includes("how many cities") ||
    q.includes("number of cities") ||
    q.includes("count of cities");

  const asksForState = q.includes("state");
  const asksForCity = q.includes("city") || q.includes("cities");

  // ── Direction detectors ─────────────────────────────────────────
  // Did the question ask for the maximum or the minimum?

  const asksForTop =
    q.includes("most") ||
    q.includes("highest") ||
    q.includes("largest") ||
    q.includes("biggest") ||
    q.includes("top") ||
    q.includes("maximum");

  const asksForLeast =
    q.includes("least") ||
    q.includes("lowest") ||
    q.includes("smallest") ||
    q.includes("minimum");

  // ── Decision tree ────────────────────────────────────────────────
  // Order matters! More specific checks must come BEFORE general ones.
  // The first matching condition wins — every branch returns immediately.

  // Most specific: exact phrasings checked first
  if (asksForCityCount) return "city_count";
  if (asksForAge) return "avg_median_age";
  if (asksForTotalPopulation) return "total_population";

  // Veterans — only "top" is implemented for now
  if (asksForVeterans) return "top_veteran_state";

  // "biggest/smallest city" (not state) — single city, not aggregated by state
  if (asksForCity && !asksForState) {
    if (asksForLeast) return "smallest_city";
    if (asksForTop) return "biggest_city";
  }

  // State population — check least BEFORE top, since "least" questions
  // sometimes also contain the word "smallest" which could be ambiguous
  if (asksForLeast && asksForState) return "least_population_state";
  if (asksForTop && asksForState) return "top_population_state";

  // Nothing matched
  return "unknown";
}
