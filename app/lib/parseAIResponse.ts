// ── AI Response Parser ───────────────────────────────────────────────────────
// Extracts structured fields from Gemini's text response into a typed object.

export interface ParsedResponse {
  monument: string;
  location: string;
  builtBy: string;
  purpose: string;
  year: string;
  architectureStyle: string;
  civilization: string;
  interestingFacts: string;
  tourismTips: string;
  story: string;
  raw: string;
}

/**
 * Searches for a field value in the raw AI text using multiple possible key names.
 * Handles markdown bold formatting and colon separators.
 */
function extractField(text: string, keys: string[]): string {
  for (const key of keys) {
    const re = new RegExp(`(?:-|\\*)*\\b${key}\\b(?:-|\\*|:)*\\s*(.+)`, "i");
    const m = text.match(re);
    if (m) {
      return m[1].replace(/\*+/g, "").trim();
    }
  }
  return "";
}

/**
 * Extracts a multi-line section from the raw text.
 * Used for fields like "Interesting Facts" and "Tourism Tips" that may span several lines.
 */
function extractSection(text: string, sectionKeys: string[], nextSectionKeys: string[]): string {
  for (const key of sectionKeys) {
    // Match the section header and capture everything until the next known section or end
    const nextPattern = nextSectionKeys.length > 0
      ? `(?=${nextSectionKeys.map(k => `\\b${k}\\b`).join("|")}|$)`
      : "$";
    const re = new RegExp(`(?:\\*{0,2}${key}\\*{0,2}):?\\s*([\\s\\S]*?)${nextPattern}`, "i");
    const m = text.match(re);
    if (m && m[1].trim()) {
      return m[1]
        .replace(/\*+/g, "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .join(" ")
        .trim();
    }
  }
  return "";
}

/**
 * Parses the raw AI response text into a structured ParsedResponse object.
 * Falls back gracefully if fields are missing.
 */
export function parseAIResponse(raw: string): ParsedResponse {
  // Extract story section — everything after "Story:" header
  const storyMatch = raw.match(
    /(?:\*{0,2}Story|Storytelling|Narrative|History\*{0,2}):?\s*([\s\S]+)/i
  );
  const story = storyMatch ? storyMatch[1].trim() : raw;

  return {
    monument: extractField(raw, ["Name", "Monument Name", "Monument"]),
    location: extractField(raw, [
      "Location or museum",
      "Location",
      "Museum",
      "Where it is located",
    ]),
    builtBy: extractField(raw, [
      "Built or created by",
      "Built by",
      "Created by",
      "Who built it",
      "Builder",
      "Creator",
      "Artist",
    ]),
    purpose: extractField(raw, [
      "Purpose or artistic meaning",
      "Purpose",
      "Artistic meaning",
      "Why it was built",
      "Meaning",
    ]),
    year: extractField(raw, [
      "Era / year / century",
      "Era or year",
      "Year or century built",
      "Year built",
      "Year / Era",
      "Year",
      "Era",
      "Century",
    ]),
    architectureStyle: extractField(raw, [
      "Architecture style",
      "Architectural style",
      "Style",
      "Art style",
    ]),
    civilization: extractField(raw, [
      "Civilization or culture",
      "Civilization",
      "Culture",
      "Cultural origin",
    ]),
    interestingFacts: extractSection(
      raw,
      ["Interesting facts", "Fun facts", "Facts"],
      ["Tourism", "Story", "Storytelling"]
    ),
    tourismTips: extractSection(
      raw,
      ["Tourism tips", "Tourism", "Visitor tips", "Travel tips"],
      ["Story", "Storytelling"]
    ),
    story,
    raw,
  };
}
