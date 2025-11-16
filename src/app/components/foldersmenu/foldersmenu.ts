import { Component, inject, signal, input } from '@angular/core';
import { FolderService } from '../../services/folder.service';
import { Folder, ItemType } from '../../models/folder.model';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-foldersmenu',
  imports: [FormsModule],
  templateUrl: './foldersmenu.html',
  styleUrl: './foldersmenu.scss',
})
export class Foldersmenu {
  private folderService = inject(FolderService);
  private toastService = inject(ToastService);

  itemType = input<ItemType>();

  folders = signal<Folder[]>([]);
  selectedFolder = signal<Folder | null>(null);
  expandedFolders = signal<Set<string>>(new Set());
  newFolderName = signal<string>('');
  // Show Actions Menus
  actionMenuTitle = signal<string>('');
  showNewFolderMenu = signal<boolean>(false);
  showRenameMenu = signal<boolean>(false);
  showDeleteMenu = signal<boolean>(false);

  async ngOnInit() {
    await this.loadFolders();
  }

  // Folders Actions Menus
  openNewFolderMenu() {
    this.showNewFolderMenu.set(true);
    this.showRenameMenu.set(false);
    this.showDeleteMenu.set(false);
    this.actionMenuTitle.set('Create New Folder');
  }

  openRenameMenu() {
    this.showRenameMenu.set(true);
    this.showNewFolderMenu.set(false);
    this.showDeleteMenu.set(false);
    this.actionMenuTitle.set('Rename Folder');
  }

  openDeleteMenu() {
    this.showDeleteMenu.set(true);
    this.showNewFolderMenu.set(false);
    this.showRenameMenu.set(false);
    this.actionMenuTitle.set('Delete Folder');
  }

  closeActionsMenus() {
    this.showNewFolderMenu.set(false);
    this.showRenameMenu.set(false);
    this.showDeleteMenu.set(false);
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

  async createFolder() {
    const name = this.newFolderName().trim();
    if (!name) {
      this.toastService.warning('Folder name cannot be empty');
      return;
    }
    const parentId = this.selectedFolder()?.id;
    await this.folderService.createFolder({
      name,
      parentId,
      order: this.folders().length,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.loadFolders();
    this.newFolderName.set('');
    this.showNewFolderMenu.set(false);
    this.toastService.success(`Folder "${name}" created`);
  }
}
