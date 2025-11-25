import { Component, signal, HostListener } from '@angular/core';
import { Foldersmenu } from '../folders-menu/folders-menu';

@Component({
  selector: 'app-sidebar',
  imports: [Foldersmenu],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  width = signal(350); // Initial width in pixels
  private isResizing = false;
  private minWidth = 200;
  private maxWidth = 700;

  onResizeStart(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const newWidth = event.clientX;

    if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
      this.width.set(newWidth);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }
}
