import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

export interface RichTextEditorProps {
  defaultText: string
  onSave: (next: string) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
  singleLine?: boolean
}

export function RichTextEditor({
  defaultText,
  onSave,
  placeholder,
  ariaLabel,
  className = '',
  singleLine = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '',
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-zinc-400 dark:before:text-zinc-600 before:float-left before:pointer-events-none before:h-0',
      }),
    ],
    content: defaultText,
    immediatelyRender: false,
    onBlur: ({ editor }) => {
      const next = editor.getText().trim()
      if (next !== defaultText.trim()) {
        onSave(next)
      }
    },
    editorProps: {
      attributes: {
        'aria-label': ariaLabel ?? '',
        class: `${className} focus:outline-none`,
      },
      handleKeyDown: (_view, event) => {
        if (singleLine && event.key === 'Enter') {
          event.preventDefault()
          ;(document.activeElement as HTMLElement | null)?.blur()
          return true
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (editor.isFocused) return
    if (editor.getText().trim() === defaultText.trim()) return
    editor.commands.setContent(defaultText, { emitUpdate: false })
  }, [defaultText, editor])

  return <EditorContent editor={editor} />
}
