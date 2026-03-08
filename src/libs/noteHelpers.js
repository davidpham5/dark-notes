export function wordCount(text) {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

export function readingTime(text) {
  const words = wordCount(text);
  const minutes = Math.ceil(words / 200);
  return minutes < 1 ? "< 1 min" : `${minutes} min read`;
}

export function excerpt(content, maxLen = 160) {
  if (!content) return "";
  const plain = content.replace(/[#*`_~\[\]]/g, "").replace(/\n+/g, " ").trim();
  return plain.length <= maxLen ? plain : plain.substring(0, maxLen).trimEnd() + "…";
}
