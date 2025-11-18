import { Component, input, model, effect, viewChild, ElementRef, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

@Component({
  selector: 'app-form-textarea',
  imports: [FormsModule],
  templateUrl: 'form-textarea.html',
  styleUrl: '../form.scss',
})
export class FormTextarea implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  // Inputs
  label = input<string>('');
  placeholder = input<string>('');
  id = input<string>('');
  required = input<boolean>(false);
  disabled = input<boolean>(false);

  // Two-way binding with model signal
  value = model<string>('');

  // ViewChild for rich text editor container
  editorElement = viewChild<ElementRef<HTMLDivElement>>('editorElement');

  private editor: Editor | null = null;

  constructor() {
    // Initialize rich text editor only in browser
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const container = this.editorElement()?.nativeElement;
      if (container && !this.editor) {
        this.initEditor(container);
      }
    });

    // Update editor content when value changes externally
    effect(() => {
      const val = this.value();
      if (this.editor && this.editor.getHTML() !== val) {
        this.editor.commands.setContent(val || '');
      }
    });

    // Update disabled state
    effect(() => {
      const isDisabled = this.disabled();
      if (this.editor) {
        this.editor.setEditable(!isDisabled);
      }
    });
  }

  private initEditor(container: HTMLDivElement): void {
    this.editor = new Editor({
      element: container,
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          horizontalRule: false,
          blockquote: false,
        }),
      ],
      content: this.value() || '',
      editable: !this.disabled(),
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.value.set(html);
      },
    });
  }

  // Rich text toolbar actions
  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  // Check if command is active
  isBold(): boolean {
    return this.editor?.isActive('bold') ?? false;
  }

  isItalic(): boolean {
    return this.editor?.isActive('italic') ?? false;
  }

  isStrike(): boolean {
    return this.editor?.isActive('strike') ?? false;
  }

  isBulletList(): boolean {
    return this.editor?.isActive('bulletList') ?? false;
  }

  isOrderedList(): boolean {
    return this.editor?.isActive('orderedList') ?? false;
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
