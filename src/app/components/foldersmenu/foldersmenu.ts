import { Component, inject, signal, input } from '@angular/core';
import { FolderService } from '../../services/folder.service';
import { Folder, ItemType } from '../../models/folder.model';

@Component({
  selector: 'app-foldersmenu',
  imports: [],
  templateUrl: './foldersmenu.html',
  styleUrl: './foldersmenu.scss',
})
export class Foldersmenu {
  private folderService = inject(FolderService);

  itemType = input<ItemType>();

  folders = signal<Folder[]>([]);
  selectedFolder = signal<Folder | null>(null);
  expandedFolders = signal<Set<string>>(new Set());

  async ngOnInit() {
    await this.loadFolders();
  }

  async loadFolders() {
    const allFolders = await this.folderService.getFolders();
    this.folders.set(allFolders);
  }

  async toggleFolder(folder: Folder) {
    const expanded = this.expandedFolders();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(folder.id!)) {
      newExpanded.delete(folder.id!);
    } else {
      newExpanded.add(folder.id!);
    }

    this.expandedFolders.set(newExpanded);
  }

  selectFolder(folder: Folder) {
    this.selectedFolder.set(folder);
  }

  isExpanded(folderId: string): boolean {
    return this.expandedFolders().has(folderId);
  }

  isSelected(folderId: string): boolean {
    return this.selectedFolder()?.id === folderId;
  }

  getRootFolders(): Folder[] {
    return this.folders().filter(f => !f.parentId);
  }

  getSubfolders(parentId: string): Folder[] {
    return this.folders().filter(f => f.parentId === parentId);
  }

  async createFolder(name: string, parentId?: string) {
    await this.folderService.createFolder({
      name,
      parentId,
      order: this.folders().length,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.loadFolders();
  }
}
