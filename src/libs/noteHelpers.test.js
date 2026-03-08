import { describe, it, expect } from "vitest";
import { wordCount, readingTime, excerpt } from "./noteHelpers";

describe("wordCount", () => {
  it("returns 0 for empty string", () => {
    expect(wordCount("")).toBe(0);
  });

  it("returns 0 for null/undefined", () => {
    expect(wordCount(null)).toBe(0);
    expect(wordCount(undefined)).toBe(0);
  });

  it("counts words correctly", () => {
    expect(wordCount("hello world")).toBe(2);
    expect(wordCount("one two three four five")).toBe(5);
  });

  it("handles multiple spaces and newlines", () => {
    expect(wordCount("hello   world")).toBe(2);
    expect(wordCount("hello\nworld\nfoo")).toBe(3);
  });

  it("handles leading/trailing whitespace", () => {
    expect(wordCount("  hello world  ")).toBe(2);
  });
});

describe("readingTime", () => {
  it("returns '< 1 min' for very short text", () => {
    expect(readingTime("hello world")).toBe("< 1 min");
  });

  it("returns '1 min read' for ~200 words", () => {
    const text = Array(200).fill("word").join(" ");
    expect(readingTime(text)).toBe("1 min read");
  });

  it("returns '2 min read' for ~350 words", () => {
    const text = Array(350).fill("word").join(" ");
    expect(readingTime(text)).toBe("2 min read");
  });

  it("rounds up to nearest minute", () => {
    const text = Array(201).fill("word").join(" ");
    expect(readingTime(text)).toBe("2 min read");
  });

  it("handles empty string", () => {
    expect(readingTime("")).toBe("< 1 min");
  });
});

describe("excerpt", () => {
  it("returns empty string for null/undefined", () => {
    expect(excerpt(null)).toBe("");
    expect(excerpt(undefined)).toBe("");
  });

  it("returns the full string if under maxLen", () => {
    const text = "Short note content.";
    expect(excerpt(text)).toBe(text);
  });

  it("truncates and appends ellipsis when over maxLen", () => {
    const text = Array(40).fill("word").join(" "); // 199 chars
    const result = excerpt(text, 50);
    expect(result.length).toBeLessThanOrEqual(51); // 50 + ellipsis char
    expect(result.endsWith("…")).toBe(true);
  });

  it("strips markdown syntax characters", () => {
    expect(excerpt("# Heading\n**bold** and _italic_")).toBe(
      "Heading bold and italic"
    );
  });

  it("collapses newlines into spaces", () => {
    expect(excerpt("line one\n\nline two")).toBe("line one  line two");
  });
});
