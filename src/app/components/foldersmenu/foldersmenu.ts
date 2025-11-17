import { Component, inject, signal, input } from '@angular/core';
import { FolderService } from '../../services/folder.service';
import { Folder, ItemType, SPECIAL_FOLDERS } from '../../models/folder.model';
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

  async loadFolders() {
    const allFolders = await this.folderService.getFolders();

    // Create virtual folders
    const virtualFolders: Folder[] = [
      {
        id: SPECIAL_FOLDERS.UNASSIGNED,
        name: 'Unassigned',
        order: -2,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVirtual: true,
      },
      {
        id: SPECIAL_FOLDERS.ROOT,
        name: 'All Folders',
        order: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVirtual: true,
      },
    ];

    // Combine virtual and real folders
    this.folders.set([...virtualFolders, ...allFolders]);
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
    // Only return virtual folders at root level
    // Real root folders (without parentId) will be shown inside "All Folders"
    return this.folders().filter(f => f.isVirtual);
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
