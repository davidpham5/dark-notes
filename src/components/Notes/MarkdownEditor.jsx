import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { EditorView } from "@codemirror/view";

const editorStyle = EditorView.theme({
  "&": {
    fontFamily: "'Fira Code', monospace",
    fontSize: "14px",
    borderRadius: "6px",
    minHeight: "300px",
  },
  ".cm-content": {
    padding: "12px 16px",
    minHeight: "300px",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-line": {
    lineHeight: "1.7",
  },
  // Heading styles
  ".cm-header-1": { fontSize: "1.5em", fontWeight: "bold" },
  ".cm-header-2": { fontSize: "1.3em", fontWeight: "bold" },
  ".cm-header-3": { fontSize: "1.1em", fontWeight: "bold" },
});

export default function MarkdownEditor({ value, onChange, height, minHeight = "300px" }) {
  return (
    <CodeMirror
      value={value}
      theme={dracula}
      height={height}
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        editorStyle,
        EditorView.lineWrapping,
      ]}
      onChange={onChange}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: false,
        highlightActiveLine: true,
        highlightSelectionMatches: false,
      }}
      style={{ minHeight, height: height || undefined }}
    />
  );
}
