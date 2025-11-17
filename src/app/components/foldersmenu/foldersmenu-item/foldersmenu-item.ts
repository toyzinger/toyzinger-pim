import { Component, input, output } from '@angular/core';
import { Folder, SPECIAL_FOLDERS } from '../../../features/folders/folder.model';

@Component({
  selector: 'app-foldersmenu-item',
  imports: [],
  templateUrl: './foldersmenu-item.html',
  styleUrl: './foldersmenu-item.scss'
})
export class FoldersmenuItem {
  folder = input.required<Folder>();
  allFolders = input.required<Folder[]>();
  selectedFolderId = input<string | null>(null);
  expandedFolderIds = input.required<Set<string>>();
  level = input<number>(0);

  folderSelected = output<Folder>();
  folderToggled = output<Folder>();

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

  onSelectFolder(event: Event) {
    event.stopPropagation();
    this.folderSelected.emit(this.folder());
  }

  onToggleFolder(event: Event) {
    event.stopPropagation();
    this.folderToggled.emit(this.folder());
  }
}
