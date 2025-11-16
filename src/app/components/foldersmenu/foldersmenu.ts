import { Component, inject, signal, input } from '@angular/core';
import { FolderService } from '../../services/folder.service';
import { Folder, ItemType } from '../../models/folder.model';
import { ToastService } from '../../services/toast.service';
import { FoldersmenuNew } from './foldersmenu-new/foldersmenu-new';
import { FoldersmenuRename } from './foldersmenu-rename/foldersmenu-rename';
import { FoldersmenuDelete } from './foldersmenu-delete/foldersmenu-delete';
import { FoldersmenuItem } from './foldersmenu-item/foldersmenu-item';

@Component({
  selector: 'app-foldersmenu',
  imports: [FoldersmenuNew, FoldersmenuRename, FoldersmenuDelete, FoldersmenuItem],
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
  // Action menus state
  actionMenuTitle = signal<string>('');
  showNewFolderMenu = signal<boolean>(false);
  showRenameMenu = signal<boolean>(false);
  showDeleteMenu = signal<boolean>(false);

  async ngOnInit() {
    await this.loadFolders();
  }

  // Action menus handlers
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

  getRootFolders(): Folder[] {
    return this.folders().filter(f => !f.parentId);
  }

  async onCreateFolder(name: string) {
    if (!name || !name.trim()) {
      this.closeActionsMenus();
      return;
    }

    const folderName = name.trim();
    const selectedFolder = this.selectedFolder();

    const newFolder: Omit<Folder, 'id'> = {
      name: folderName,
      order: this.folders().length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add parentId if there's a selected folder
    if (selectedFolder?.id) {
      newFolder.parentId = selectedFolder.id;
    }

    await this.folderService.createFolder(newFolder);

    await this.loadFolders();
    this.toastService.success(`Folder "${folderName}" created`);
  }

  async onRenameFolder(name: string) {
    const selectedFolder = this.selectedFolder();
    if (!selectedFolder || !name || !name.trim()) {
      this.toastService.danger('Invalid folder name');
      return;
    }

    const folderName = name.trim();
    await this.folderService.updateFolder(selectedFolder.id!, {
      ...selectedFolder,
      name: folderName,
      updatedAt: new Date(),
    });

    await this.loadFolders();
    this.toastService.success(`Folder renamed to "${folderName}"`);
  }

  async onDeleteFolder() {
    const selectedFolder = this.selectedFolder();
    if (!selectedFolder) {
      this.toastService.danger('No folder selected to delete');
      return;
    };

    await this.folderService.deleteFolder(selectedFolder.id!);

    this.selectedFolder.set(null);
    await this.loadFolders();
    this.toastService.success(`Folder "${selectedFolder.name}" deleted`);
  }
}
