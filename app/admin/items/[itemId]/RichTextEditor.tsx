// app/admin/items/[itemId]/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline cursor-pointer",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "w-full min-h-[150px] bg-slate-950 border border-slate-700 rounded-b-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm prose prose-invert max-w-none focus:prose-a:text-blue-300 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mt-1",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sinkronisasi jika form di-reset dari luar
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL Link:", previousUrl);
    
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-all">
      {/* TOOLBAR BUTTONS */}
      <div className="flex flex-wrap gap-1 bg-slate-900 border-b border-slate-700 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${editor.isActive("bold") ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-xs font-mono italic transition-colors ${editor.isActive("italic") ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${editor.isActive("bulletList") ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={addLink}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${editor.isActive("link") ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
        >
          Link 🔗
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors ml-auto"
        >
          Clear
        </button>
      </div>

      {/* AREA EDITOR */}
      <EditorContent editor={editor} />
    </div>
  );
}