'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

const btnCls = 'px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors';
const activeCls = 'bg-gray-200';

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnCls} ${editor.isActive('bold') ? activeCls : ''}`}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnCls} ${editor.isActive('italic') ? activeCls : ''}`}><em>I</em></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${btnCls} ${editor.isActive('underline') ? activeCls : ''}`}><u>U</u></button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btnCls} ${editor.isActive('heading', { level: 2 }) ? activeCls : ''}`}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${btnCls} ${editor.isActive('heading', { level: 3 }) ? activeCls : ''}`}>H3</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnCls} ${editor.isActive('bulletList') ? activeCls : ''}`}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnCls} ${editor.isActive('orderedList') ? activeCls : ''}`}>1. List</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${btnCls} ${editor.isActive('blockquote') ? activeCls : ''}`}>&ldquo;</button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnCls}>─</button>
        <div className="w-px bg-gray-300 mx-1" />
        {/* Image upload */}
        <label className={`${btnCls} cursor-pointer`} title="Insert image">
          🖼
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            if (res.ok) {
              const { url } = await res.json();
              editor.chain().focus().setImage({ src: url, alt: file.name }).run();
            }
            e.target.value = '';
          }} />
        </label>
        {/* Insert/remove link */}
        <button type="button" title="Insert link" className={`${btnCls} ${editor.isActive('link') ? activeCls : ''}`}
          onClick={() => {
            const url = window.prompt('URL:', editor.getAttributes('link').href || 'https://');
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().unsetLink().run();
            } else {
              editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
            }
          }}>🔗</button>
      </div>
      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}
