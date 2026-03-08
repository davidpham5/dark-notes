const MAX_CHARS = 300;

/**
 * Splits a sentence that exceeds MAX_CHARS at word boundaries.
 */
function splitLongSentence(sentence, maxChars) {
  const words = sentence.split(" ");
  const chunks = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? current + " " + word : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = word;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Splits a paragraph into chunks of at most maxChars.
 * Tries to split at sentence boundaries first, then word boundaries.
 */
function splitParagraph(paragraph, maxChars) {
  if (paragraph.length <= maxChars) return [paragraph];

  const sentenceRe = /[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g;
  const sentences = paragraph.match(sentenceRe) || [paragraph];

  const chunks = [];
  let current = "";

  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;

    if (s.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      chunks.push(...splitLongSentence(s, maxChars));
      continue;
    }

    const candidate = current ? current + " " + s : s;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = s;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Splits long-form text into an array of strings each ≤ maxChars.
 *
 * Strategy:
 *  1. Split on paragraph breaks (blank lines).
 *  2. For each paragraph ≤ maxChars, try to merge with the previous chunk.
 *  3. For paragraphs > maxChars, split at sentence then word boundaries.
 */
export function splitIntoThread(text, maxChars = MAX_CHARS) {
  if (!text || !text.trim()) return [];

  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];

  for (const para of paragraphs) {
    const paraChunks = splitParagraph(para, maxChars);
    for (const chunk of paraChunks) {
      const last = chunks[chunks.length - 1];
      // Attempt to merge short consecutive chunks
      if (last && last.length + "\n\n".length + chunk.length <= maxChars) {
        chunks[chunks.length - 1] = last + "\n\n" + chunk;
      } else {
        chunks.push(chunk);
      }
    }
  }

  return chunks;
}
