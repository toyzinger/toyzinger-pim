import { Injectable, computed, signal, inject } from '@angular/core';
import { FoldersFirebase } from './folders.firebase';
import { Folder, ItemType, SPECIAL_FOLDERS } from './folders.model';

@Injectable({
  providedIn: 'root'
})
export class FoldersService {
  private foldersFirabase = inject(FoldersFirebase);

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _folders = signal<Folder[]>([]);
  private _selectedFolder = signal<Folder | null>(null);
  private _expandedFolderIds = signal<Set<string>>(new Set());
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  folders = this._folders.asReadonly();
  selectedFolder = this._selectedFolder.asReadonly();
  expandedFolderIds = this._expandedFolderIds.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // All folders including virtual ones
  allFolders = computed(() => {
    const realFolders = this._folders();

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

    return [...virtualFolders, ...realFolders];
  });

  // Only virtual folders (for root level display)
  rootFolders = computed(() =>
    this.allFolders().filter(f => f.isVirtual)
  );

  // Real folders without parent (children of "All Folders")
  realRootFolders = computed(() =>
    this._folders().filter(f => !f.parentId)
  );

  // Get subfolders of a specific folder
  getSubfolders = (parentId: string) => computed(() =>
    this._folders().filter(f => f.parentId === parentId)
  );

  // Count of real folders (excluding virtual)
  folderCount = computed(() => this._folders().length);

  // Check if folder is expanded
  isFolderExpanded = (folderId: string) => computed(() =>
    this._expandedFolderIds().has(folderId)
  );

  // Check if folder is selected
  isFolderSelected = (folderId: string) => computed(() =>
    this._selectedFolder()?.id === folderId
  );

  // ========================================
  // ACTIONS
  // ========================================

  // Load all folders from Firebase
  async loadFolders(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const folders = await this.foldersFirabase.getFolders();
      this._folders.set(folders);

      // Select UNASSIGNED folder by default if no folder is selected
      if (!this._selectedFolder()) {
        const unassignedFolder = this.allFolders().find(f => f.id === SPECIAL_FOLDERS.UNASSIGNED);
        if (unassignedFolder) {
          this._selectedFolder.set(unassignedFolder);
        }
      }

      // Expand ROOT folder by default
      this.expandFolder(SPECIAL_FOLDERS.ROOT);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to load folders');
      console.error('Error loading folders:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Create new folder
  async createFolder(folder: Omit<Folder, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const id = await this.foldersFirabase.createFolder(folder);

      // Optimistic update
      const newFolder: Folder = { ...folder, id };
      this._folders.update(folders => [...folders, newFolder]);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to create folder');
      console.error('Error creating folder:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Update existing folder
  async updateFolder(id: string, data: Partial<Folder>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.foldersFirabase.updateFolder(id, data);

      // Optimistic update
      this._folders.update(folders =>
        folders.map(f => f.id === id ? { ...f, ...data, updatedAt: new Date() } : f)
      );

      // Update selected folder if it's the one being updated
      if (this._selectedFolder()?.id === id) {
        this._selectedFolder.update(f => f ? { ...f, ...data } : null);
      }
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to update folder');
      console.error('Error updating folder:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Delete folder (recursively)
  async deleteFolder(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.foldersFirabase.deleteFolder(id);

      // Optimistic update - remove deleted folder and its children
      this._folders.update(folders =>
        this.removeDeletedFolders(folders, id)
      );

      // Clear selection if deleted folder was selected
      if (this._selectedFolder()?.id === id) {
        this._selectedFolder.set(null);
      }
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to delete folder');
      console.error('Error deleting folder:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Helper: Remove folder and all its children recursively
  private removeDeletedFolders(folders: Folder[], deletedId: string): Folder[] {
    const idsToRemove = new Set<string>([deletedId]);

    // Find all children recursively
    const findChildren = (parentId: string) => {
      folders.forEach(folder => {
        if (folder.parentId === parentId) {
          idsToRemove.add(folder.id!);
          findChildren(folder.id!);
        }
      });
    };

    findChildren(deletedId);

    // Filter out all marked folders
    return folders.filter(f => !idsToRemove.has(f.id!));
  }

  // ========================================
  // UI STATE ACTIONS
  // ========================================

  // Select a folder
  selectFolder(folder: Folder | null): void {
    this._selectedFolder.set(folder);
  }

  // Toggle folder expanded/collapsed state
  toggleFolder(folderId: string): void {
    this._expandedFolderIds.update(expanded => {
      const newSet = new Set(expanded);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }

  // Expand a folder
  expandFolder(folderId: string): void {
    this._expandedFolderIds.update(expanded => {
      const newSet = new Set(expanded);
      newSet.add(folderId);
      return newSet;
    });
  }

  // Collapse a folder
  collapseFolder(folderId: string): void {
    this._expandedFolderIds.update(expanded => {
      const newSet = new Set(expanded);
      newSet.delete(folderId);
      return newSet;
    });
  }

  // Expand all folders
  expandAll(): void {
    const allIds = this._folders()
      .filter(f => !f.isVirtual)
      .map(f => f.id!)
      .filter(id => id !== undefined);
    this._expandedFolderIds.set(new Set(allIds));
  }

  // Collapse all folders
  collapseAll(): void {
    this._expandedFolderIds.set(new Set());
  }

  // Clear selection
  clearSelection(): void {
    this._selectedFolder.set(null);
  }

  // Clear error
  clearError(): void {
    this._error.set(null);
  }

  // ========================================
  // FOLDER ITEMS OPERATIONS
  // ========================================

  // Get items in a folder
  async getFolderItemIds(folderId: string, itemType?: ItemType): Promise<string[]> {
    try {
      return await this.foldersFirabase.getFolderItemIds(folderId, itemType);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to get folder items');
      console.error('Error getting folder items:', error);
      return [];
    }
  }

  // Get count of items in folder
  async getFolderItemCount(folderId: string, itemType: ItemType): Promise<number> {
    try {
      return await this.foldersFirabase.getFolderItemCount(folderId, itemType);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to get item count');
      console.error('Error getting item count:', error);
      return 0;
    }
  }

  // Add item to folder
  async addItemToFolder(folderId: string, itemId: string, itemType: ItemType): Promise<void> {
    try {
      await this.foldersFirabase.addItemToFolder(folderId, itemId, itemType);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to add item to folder');
      console.error('Error adding item to folder:', error);
      throw error;
    }
  }

  // Remove item from folder
  async removeItemFromFolder(folderId: string, itemId: string, itemType: ItemType): Promise<void> {
    try {
      await this.foldersFirabase.removeItemFromFolder(folderId, itemId, itemType);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to remove item from folder');
      console.error('Error removing item from folder:', error);
      throw error;
    }
  }

  // Get uncategorized items
  async getUncategorizedItemIds(allItemIds: string[], itemType: ItemType): Promise<string[]> {
    try {
      return await this.foldersFirabase.getUncategorizedItemIds(allItemIds, itemType);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to get uncategorized items');
      console.error('Error getting uncategorized items:', error);
      return [];
    }
  }
}
