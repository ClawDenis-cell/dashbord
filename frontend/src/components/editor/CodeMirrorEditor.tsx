import React, { useEffect, useRef, useCallback, useState } from 'react';
import { EditorState, Extension, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, highlightSpecialChars, rectangularSelection, crosshairCursor, dropCursor } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { syntaxHighlighting, HighlightStyle, indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { vim } from '@replit/codemirror-vim';
import { tags } from '@lezer/highlight';

// Custom markdown syntax highlighting
const markdownHighlighting = HighlightStyle.define([
  { tag: tags.heading1, color: '#c678dd', fontSize: '1.4em', fontWeight: 'bold' },
  { tag: tags.heading2, color: '#c678dd', fontSize: '1.25em', fontWeight: 'bold' },
  { tag: tags.heading3, color: '#c678dd', fontSize: '1.1em', fontWeight: 'bold' },
  { tag: tags.heading4, color: '#c678dd', fontWeight: 'bold' },
  { tag: tags.heading5, color: '#c678dd', fontWeight: 'bold' },
  { tag: tags.heading6, color: '#c678dd', fontWeight: 'bold' },
  { tag: tags.strong, color: '#e5c07b', fontWeight: 'bold' },
  { tag: tags.emphasis, color: '#e5c07b', fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#7f848e' },
  { tag: tags.link, color: '#61afef', textDecoration: 'underline' },
  { tag: tags.url, color: '#61afef' },
  { tag: tags.monospace, color: '#98c379', backgroundColor: 'rgba(152,195,121,0.1)', borderRadius: '3px', padding: '0 3px' },
  { tag: tags.processingInstruction, color: '#98c379' },
  { tag: tags.quote, color: '#7f848e', fontStyle: 'italic' },
  { tag: tags.list, color: '#d19a66' },
  { tag: tags.contentSeparator, color: '#61afef' },
  { tag: tags.meta, color: '#7f848e' },
]);

// Custom dark theme extending oneDark
const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    padding: '8px 0',
  },
  '.cm-gutters': {
    background: 'var(--color-bg-tertiary, #1e1e2e)',
    borderRight: '1px solid var(--color-border, #333)',
    color: 'var(--color-text-tertiary, #555)',
    minWidth: '48px',
  },
  '.cm-activeLineGutter': {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--color-text-secondary, #aaa)',
  },
  '.cm-activeLine': {
    background: 'rgba(255,255,255,0.03)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--color-accent, #7c3aed)',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground': {
    background: 'rgba(124,58,237,0.25) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    background: 'rgba(124,58,237,0.3) !important',
  },
  '.cm-searchMatch': {
    background: 'rgba(255,193,7,0.3)',
    outline: '1px solid rgba(255,193,7,0.5)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    background: 'rgba(255,193,7,0.5)',
  },
  '.cm-panels': {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    color: 'var(--color-text-primary, #ccc)',
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: '1px solid var(--color-border, #333)',
  },
  '.cm-panel.cm-search': {
    padding: '8px 12px',
  },
  '.cm-panel.cm-search input': {
    background: 'var(--color-bg-primary, #111)',
    color: 'var(--color-text-primary, #ccc)',
    border: '1px solid var(--color-border, #444)',
    borderRadius: '4px',
    padding: '4px 8px',
    margin: '0 4px',
  },
  '.cm-panel.cm-search button': {
    background: 'var(--color-bg-tertiary, #333)',
    color: 'var(--color-text-primary, #ccc)',
    border: '1px solid var(--color-border, #444)',
    borderRadius: '4px',
    padding: '4px 8px',
    margin: '0 2px',
    cursor: 'pointer',
  },
  '.cm-panel.cm-search label': {
    color: 'var(--color-text-secondary, #999)',
    margin: '0 4px',
  },
  // Vim mode status bar
  '.cm-vim-panel': {
    background: 'var(--color-bg-tertiary, #1e1e2e)',
    color: 'var(--color-text-primary, #ccc)',
    padding: '2px 12px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    borderTop: '1px solid var(--color-border, #333)',
  },
  '.cm-fat-cursor': {
    background: 'rgba(124,58,237,0.5) !important',
    border: 'none !important',
  },
  '&:not(.cm-focused) .cm-fat-cursor': {
    background: 'none !important',
    outline: '1px solid rgba(124,58,237,0.5) !important',
  },
});

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  vimMode?: boolean;
  fontSize?: number;
  tabSize?: number;
  onSave?: () => void;
  onImagePaste?: (file: File) => void;
  onImageUrlPaste?: (url: string) => void;
}

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  vimMode = false,
  fontSize = 14,
  tabSize = 2,
  onSave,
  onImagePaste,
  onImageUrlPaste,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const vimCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const fontSizeCompartment = useRef(new Compartment());
  const tabSizeCompartment = useRef(new Compartment());
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0, lines: 0 });
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const onImagePasteRef = useRef(onImagePaste);
  const onImageUrlPasteRef = useRef(onImageUrlPaste);
  const isExternalUpdate = useRef(false);

  // Keep refs updated
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);
  useEffect(() => { onImagePasteRef.current = onImagePaste; }, [onImagePaste]);
  useEffect(() => { onImageUrlPasteRef.current = onImageUrlPaste; }, [onImageUrlPaste]);

  const updateWordCount = useCallback((text: string) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    setWordCount({ words, chars, lines });
  }, []);

  // Markdown auto-continue lists
  const autoListExtension = keymap.of([{
    key: 'Enter',
    run: (view: EditorView) => {
      const { state } = view;
      const { from } = state.selection.main;
      const line = state.doc.lineAt(from);
      const lineText = line.text;

      // Match unordered list markers
      const ulMatch = lineText.match(/^(\s*)([-*+])\s(.*)$/);
      if (ulMatch) {
        const [, indent, marker, content] = ulMatch;
        // If empty list item, remove it
        if (!content.trim()) {
          view.dispatch({
            changes: { from: line.from, to: line.to, insert: '' },
          });
          return true;
        }
        view.dispatch({
          changes: { from, to: from, insert: `\n${indent}${marker} ` },
          selection: { anchor: from + indent.length + marker.length + 3 },
        });
        return true;
      }

      // Match ordered list markers
      const olMatch = lineText.match(/^(\s*)(\d+)\.\s(.*)$/);
      if (olMatch) {
        const [, indent, num, content] = olMatch;
        if (!content.trim()) {
          view.dispatch({
            changes: { from: line.from, to: line.to, insert: '' },
          });
          return true;
        }
        const nextNum = parseInt(num) + 1;
        view.dispatch({
          changes: { from, to: from, insert: `\n${indent}${nextNum}. ` },
          selection: { anchor: from + indent.length + `${nextNum}`.length + 4 },
        });
        return true;
      }

      // Match checkbox lists
      const cbMatch = lineText.match(/^(\s*)([-*+])\s\[[ x]\]\s(.*)$/);
      if (cbMatch) {
        const [, indent, marker, content] = cbMatch;
        if (!content.trim()) {
          view.dispatch({
            changes: { from: line.from, to: line.to, insert: '' },
          });
          return true;
        }
        view.dispatch({
          changes: { from, to: from, insert: `\n${indent}${marker} [ ] ` },
          selection: { anchor: from + indent.length + marker.length + 6 },
        });
        return true;
      }

      return false;
    },
  }]);

  // Tab indent for lists
  const tabListExtension = keymap.of([{
    key: 'Tab',
    run: (view: EditorView) => {
      const { state } = view;
      const { from } = state.selection.main;
      const line = state.doc.lineAt(from);
      const listMatch = line.text.match(/^(\s*)([-*+]|\d+\.)\s/);
      if (listMatch) {
        view.dispatch({
          changes: { from: line.from, to: line.from, insert: '  ' },
        });
        return true;
      }
      return false;
    },
  }, {
    key: 'Shift-Tab',
    run: (view: EditorView) => {
      const { state } = view;
      const { from } = state.selection.main;
      const line = state.doc.lineAt(from);
      const listMatch = line.text.match(/^(\s{2,})([-*+]|\d+\.)\s/);
      if (listMatch) {
        view.dispatch({
          changes: { from: line.from, to: line.from + 2, insert: '' },
        });
        return true;
      }
      return false;
    },
  }]);

  // Image paste handling
  const imagePasteExtension = EditorView.domEventHandlers({
    paste(event: ClipboardEvent, _view: EditorView) {
      const items = event.clipboardData?.items;
      if (!items) return false;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file && onImagePasteRef.current) {
            onImagePasteRef.current(file);
          }
          return true;
        }

        // Check for HTML with img tags (image copied from browser)
        if (item.type === 'text/html') {
          item.getAsString((html: string) => {
            const imgMatch = html.match(/<img[^>]+src="([^"]+)"/i);
            if (imgMatch && imgMatch[1] && onImageUrlPasteRef.current) {
              onImageUrlPasteRef.current(imgMatch[1]);
            }
          });
        }
      }
      return false;
    },
    drop(event: DragEvent, _view: EditorView) {
      const files = event.dataTransfer?.files;
      if (!files) return false;

      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          event.preventDefault();
          if (onImagePasteRef.current) {
            onImagePasteRef.current(file);
          }
          return true;
        }
      }

      // Check for dragged URLs
      const text = event.dataTransfer?.getData('text/uri-list') || event.dataTransfer?.getData('text/plain');
      if (text && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)/i.test(text)) {
        event.preventDefault();
        if (onImageUrlPasteRef.current) {
          onImageUrlPasteRef.current(text);
        }
        return true;
      }

      return false;
    },
  });

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const saveKeymap = keymap.of([{
      key: 'Mod-s',
      run: () => {
        onSaveRef.current?.();
        return true;
      },
    }]);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isExternalUpdate.current) {
        const newValue = update.state.doc.toString();
        onChangeRef.current(newValue);
        updateWordCount(newValue);
      }
    });

    const extensions: Extension[] = [
      vimCompartment.current.of(vimMode ? vim() : []),
      readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
      fontSizeCompartment.current.of(EditorView.theme({ '.cm-content': { fontSize: `${fontSize}px` } })),
      tabSizeCompartment.current.of(EditorState.tabSize.of(tabSize)),
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      highlightSpecialChars(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      history(),
      foldGutter(),
      indentOnInput(),
      bracketMatching(),
      highlightSelectionMatches(),
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(markdownHighlighting),
      oneDark,
      editorTheme,
      autoListExtension,
      tabListExtension,
      imagePasteExtension,
      saveKeymap,
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        ...foldKeymap,
        indentWithTab,
      ]),
      updateListener,
      EditorView.lineWrapping,
    ];

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    updateWordCount(value);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Only init once

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== value) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: value,
        },
      });
      isExternalUpdate.current = false;
      updateWordCount(value);
    }
  }, [value, updateWordCount]);

  // Sync vim mode
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: vimCompartment.current.reconfigure(vimMode ? vim() : []),
    });
  }, [vimMode]);

  // Sync readOnly
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // Sync fontSize
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: fontSizeCompartment.current.reconfigure(
        EditorView.theme({ '.cm-content': { fontSize: `${fontSize}px` } })
      ),
    });
  }, [fontSize]);

  // Sync tabSize
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: tabSizeCompartment.current.reconfigure(EditorState.tabSize.of(tabSize)),
    });
  }, [tabSize]);

  return (
    <div className="flex flex-col h-full">
      <div
        ref={editorRef}
        className="flex-1 overflow-hidden rounded-xl"
        style={{
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
        }}
      />
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-3 py-1 text-xs mt-1 rounded-lg"
        style={{
          background: 'var(--color-bg-tertiary, var(--color-bg-secondary))',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-4">
          <span>{wordCount.lines} lines</span>
          <span>{wordCount.words} words</span>
          <span>{wordCount.chars} chars</span>
        </div>
        <div className="flex items-center gap-4">
          {vimMode && <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>VIM</span>}
          <span>Tab: {tabSize}</span>
          <span>{fontSize}px</span>
        </div>
      </div>
    </div>
  );
};
