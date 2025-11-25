import { Component, inject, input, output, computed, signal } from '@angular/core';
import { Folder, SPECIAL_FOLDERS } from '../../../features/folders/folders.model';
import { GlobalService } from '../../../features/global/global.service';

@Component({
  selector: 'app-folders-menu-item',
  imports: [],
  templateUrl: './folders-menu-item.html',
  styleUrl: './folders-menu-item.scss',
})
export class FoldersmenuItem {
  private global = inject(GlobalService);

  // Inputs
  folder = input.required<Folder>();
  allFolders = input.required<Folder[]>();
  selectedFolderId = input<string | null>(null);
  expandedFolderIds = input.required<Set<string>>();
  level = input<number>(0);

  // Outputs
  folderSelected = output<Folder>();
  folderToggled = output<Folder>();

  // Track drag over state
  isDragOver = signal(false);

  getSubfolders(): Folder[] {
    const currentFolder = this.folder();

    // For Root folder, show all root-level folders (those without parentId)
    if (currentFolder.id === SPECIAL_FOLDERS.ROOT) {
      return this.allFolders().filter(f => !f.parentId && !f.isVirtual);
    }

    // For Unassigned folder, no children
    if (currentFolder.id === SPECIAL_FOLDERS.UNASSIGNED) {
      return [];
    }

    // Regular folders: show children
    return this.allFolders().filter(f => f.parentId === currentFolder.id);
  }

  isExpanded(): boolean {
    return this.expandedFolderIds().has(this.folder().id!);
  }

  isSelected(): boolean {
    return this.selectedFolderId() === this.folder().id;
  }

  hasChildren(): boolean {
    return this.getSubfolders().length > 0;
  }

  // Get folder icon based on state
  getFolderIcon(): string {
    const currentFolder = this.folder();

    // Special folders get special icon
    if (currentFolder.isVirtual) {
      return 'folder_special';
    }

    // Regular folders: open if expanded, closed otherwise
    return this.isExpanded() ? 'folder_open' : 'folder';
  }

  onSelectFolder(event: Event) {
    event.stopPropagation();

    // Don't allow selecting ROOT folder - only expand/collapse
    if (this.folder().id === SPECIAL_FOLDERS.ROOT) {
      return;
    }

    this.folderSelected.emit(this.folder());
  }

  onToggleFolder(event: Event) {
    event.stopPropagation();
    this.folderToggled.emit(this.folder());
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Don't allow drop on ROOT folder - only on UNASSIGNED and regular folders
    if (this.folder().id === SPECIAL_FOLDERS.ROOT) {
      return;
    }

    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const folderId = this.folder().id;

    // Don't allow dropping into ROOT - it's just a container
    if (this.folder().id === SPECIAL_FOLDERS.ROOT) {
      return;
    }

    // Notify global service
    if (folderId) {
      this.global.notifyFolderDrop(folderId);
    }
  }
}
