import { describe, it, expect } from "vitest";
import { splitIntoThread } from "./threadSplitter";

const MAX = 300;

describe("splitIntoThread", () => {
  it("returns empty array for empty/null input", () => {
    expect(splitIntoThread("")).toEqual([]);
    expect(splitIntoThread(null)).toEqual([]);
    expect(splitIntoThread("   ")).toEqual([]);
  });

  it("returns a single chunk for short text", () => {
    const text = "This is a short note.";
    const result = splitIntoThread(text);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(text);
  });

  it("each chunk is at most MAX_CHARS long", () => {
    const text = Array(20)
      .fill("This is a sentence that is somewhat long and fills space.")
      .join(" ");
    const result = splitIntoThread(text);
    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(MAX);
    }
  });

  it("splits at paragraph boundaries when possible", () => {
    const para1 = "First paragraph with content.";
    const para2 = "Second paragraph with content.";
    const text = `${para1}\n\n${para2}`;
    const result = splitIntoThread(text, 300);
    // Both short paragraphs should be merged into one chunk
    expect(result).toHaveLength(1);
    expect(result[0]).toContain(para1);
    expect(result[0]).toContain(para2);
  });

  it("keeps paragraphs separate when merging would exceed limit", () => {
    const para1 = "A".repeat(200);
    const para2 = "B".repeat(200);
    const result = splitIntoThread(`${para1}\n\n${para2}`);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(para1);
    expect(result[1]).toBe(para2);
  });

  it("splits long paragraphs at sentence boundaries", () => {
    // Two sentences that together exceed 300 chars
    const s1 = "The first sentence is exactly long enough to take up space here and needs room. ";
    const s2 = "The second sentence also takes up a lot of space and pushes past the limit of three hundred characters total.";
    const text = s1 + s2;
    expect(text.length).toBeGreaterThan(MAX);
    const result = splitIntoThread(text);
    expect(result.length).toBeGreaterThanOrEqual(2);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(MAX);
    }
  });

  it("handles a single sentence longer than MAX_CHARS by splitting on words", () => {
    const longSentence = Array(80).fill("word").join(" "); // ~320 chars
    expect(longSentence.length).toBeGreaterThan(MAX);
    const result = splitIntoThread(longSentence);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(MAX);
    }
    // All words are preserved
    const allWords = result.join(" ").split(" ");
    expect(allWords.length).toBe(80);
  });

  it("does not produce empty chunks", () => {
    const text = "Hello.\n\n\n\nWorld.";
    const result = splitIntoThread(text);
    for (const chunk of result) {
      expect(chunk.trim().length).toBeGreaterThan(0);
    }
  });

  it("respects a custom maxChars parameter", () => {
    const text = "One two three four five six seven eight nine ten.";
    const result = splitIntoThread(text, 20);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(20);
    }
  });

  it("preserves all content across chunks", () => {
    const text = [
      "Opening thought that sets the scene for what follows.",
      "Second point that builds on the first with more detail.",
      "Third point that takes the argument further.",
      "Conclusion that wraps everything up neatly.",
    ].join("\n\n");

    const result = splitIntoThread(text, 100);
    const reconstructed = result.join(" ");
    // Every word from the original should appear somewhere in the output
    const originalWords = text.replace(/\n/g, " ").split(/\s+/).filter(Boolean);
    for (const word of originalWords) {
      expect(reconstructed).toContain(word);
    }
  });
});
