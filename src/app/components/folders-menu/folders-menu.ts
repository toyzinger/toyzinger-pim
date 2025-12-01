import { Component, inject, Signal, signal } from '@angular/core';
import { FoldersService } from '../../features/folders/folders.service';
import { Folder, SPECIAL_FOLDERS } from '../../features/folders/folders.model';
import { ToastService } from '../../features/toast/toast.service';
import { GlobalService } from '../../features/global/global.service';
import { FoldersmenuNew } from './folders-menu-new/folders-menu-new';
import { FoldersmenuRename } from './folders-menu-rename/folders-menu-rename';
import { FoldersmenuDelete } from './folders-menu-delete/folders-menu-delete';
import { FoldersmenuItem } from './folders-menu-item/folders-menu-item';
import { ItemType } from '../../features/global/global.model';

@Component({
  selector: 'app-folders-menu',
  imports: [
    FoldersmenuItem,
    FoldersmenuNew,
    FoldersmenuRename,
    FoldersmenuDelete,
  ],
  templateUrl: './folders-menu.html',
  styleUrl: './folders-menu.scss',
})
export class Foldersmenu {
  private foldersStore = inject(FoldersService);
  private toastService = inject(ToastService);
  private globalService = inject(GlobalService);

  itemType: Signal<ItemType | null> = this.globalService.itemType;

  // Expose store state to template
  folders = this.foldersStore.allFolders;
  selectedFolder = this.foldersStore.selectedFolder;
  expandedFolders = this.foldersStore.expandedFolderIds;
  loading = this.foldersStore.loading;

  // Action menus state (local UI state)
  actionMenuTitle = signal<string>('');
  showNewFolderMenu = signal<boolean>(false);
  showRenameMenu = signal<boolean>(false);
  showDeleteMenu = signal<boolean>(false);

  async ngOnInit() {
    await this.foldersStore.loadFolders();
  }

  // Action menus handlers
  openNewFolderMenu() {
    const selected = this.selectedFolder();
    // Don't allow creating folders inside Unassigned
    if (selected?.id === SPECIAL_FOLDERS.UNASSIGNED) {
      this.toastService.warning('Cannot create folders inside Unassigned');
      return;
    }

    this.showNewFolderMenu.set(true);
    this.showRenameMenu.set(false);
    this.showDeleteMenu.set(false);
    this.actionMenuTitle.set('Create New Folder');
  }

  openRenameMenu() {
    const selected = this.selectedFolder();
    // Don't allow renaming virtual folders
    if (selected?.isVirtual) {
      this.toastService.warning('Cannot rename special folders');
      return;
    }

    this.showRenameMenu.set(true);
    this.showNewFolderMenu.set(false);
    this.showDeleteMenu.set(false);
    this.actionMenuTitle.set('Rename Folder');
  }

  openDeleteMenu() {
    const selected = this.selectedFolder();
    // Don't allow deleting virtual folders
    if (selected?.isVirtual) {
      this.toastService.warning('Cannot delete special folders');
      return;
    }

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

  toggleFolder(folder: Folder) {
    this.foldersStore.toggleFolder(folder.id!);
  }

  selectFolder(folder: Folder) {
    this.foldersStore.selectFolder(folder);
  }

  getRootFolders(): Folder[] {
    return this.foldersStore.rootFolders();
  }

  async onCreateFolder(name: string) {
    if (!name || !name.trim()) {
      this.closeActionsMenus();
      return;
    }

    const folderName = name.trim();
    const selectedFolder = this.selectedFolder();

    // Don't allow creating inside Root - create at root level instead
    const parentId = selectedFolder?.id === SPECIAL_FOLDERS.ROOT
      ? undefined
      : selectedFolder?.id;

    const newFolder: Omit<Folder, 'id'> = {
      name: folderName,
      order: this.folders().length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add parentId if there's a selected folder (and it's not Root)
    if (parentId) {
      newFolder.parentId = parentId;
    }

    try {
      await this.foldersStore.createFolder(newFolder);
      this.toastService.success(`Folder "${folderName}" created`);
    } catch (error) {
      this.toastService.error('Failed to create folder');
    }
  }

  async onRenameFolder(name: string) {
    const selectedFolder = this.selectedFolder();
    if (!selectedFolder || !name || !name.trim()) {
      this.toastService.error('Invalid folder name');
      return;
    }

    const folderName = name.trim();

    try {
      await this.foldersStore.updateFolder(selectedFolder.id!, {
        name: folderName,
      });
      this.toastService.success(`Folder renamed to "${folderName}"`);
    } catch (error) {
      this.toastService.error('Failed to rename folder');
    }
  }

  async onDeleteFolder() {
    const selectedFolder = this.selectedFolder();
    if (!selectedFolder) {
      this.toastService.error('No folder selected to delete');
      return;
    }

    try {
      await this.foldersStore.deleteFolder(selectedFolder.id!);
      this.toastService.success(`Folder "${selectedFolder.name}" deleted`);
    } catch (error) {
      this.toastService.error('Failed to delete folder');
    }
  }
}
