import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Folder, FolderItem, ItemType } from '../models/folder.model';

const FOLDERS_COLLECTION = 'folders';
const FOLDER_ITEMS_COLLECTION = 'folder_items';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private firestore = inject(Firestore);

  // ========================================
  // FOLDER OPERATIONS (CRUD)
  // ========================================

  // Get all folders
  async getFolders(): Promise<Folder[]> {
    const foldersRef = collection(this.firestore, FOLDERS_COLLECTION);
    const q = query(foldersRef, orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Folder));
  }

  // Get subfolders
  async getSubfolders(parentId: string): Promise<Folder[]> {
    const foldersRef = collection(this.firestore, FOLDERS_COLLECTION);
    const q = query(foldersRef, where('parentId', '==', parentId), orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Folder));
  }

  // Get folder by ID
  async getFolderById(folderId: string): Promise<Folder | null> {
    const folderDoc = await getDoc(doc(this.firestore, FOLDERS_COLLECTION, folderId));
    if (folderDoc.exists()) {
      return { id: folderDoc.id, ...folderDoc.data() } as Folder;
    }
    return null;
  }

  // Create folder
  async createFolder(folder: Omit<Folder, 'id'>): Promise<string> {
    const foldersRef = collection(this.firestore, FOLDERS_COLLECTION);
    const docRef = await addDoc(foldersRef, {
      ...folder,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  // Update folder
  async updateFolder(folderId: string, data: Partial<Folder>): Promise<void> {
    const folderRef = doc(this.firestore, FOLDERS_COLLECTION, folderId);
    await updateDoc(folderRef, {
      ...data,
      updatedAt: new Date(),
    });
  }

  // Delete folder
  async deleteFolder(folderId: string): Promise<void> {
    // First, recursively delete all subfolders
    const subfolders = await this.getSubfolders(folderId);
    for (const subfolder of subfolders) {
      await this.deleteFolder(subfolder.id!); // Recursive call
    }

    // Delete all folder items
    const relationsRef = collection(this.firestore, FOLDER_ITEMS_COLLECTION);
    const q = query(relationsRef, where('folderId', '==', folderId));
    const snapshot = await getDocs(q);
    const deleteItemsPromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deleteItemsPromises);

    // Finally delete the folder itself
    const folderRef = doc(this.firestore, FOLDERS_COLLECTION, folderId);
    await deleteDoc(folderRef);
  }

  // ========================================
  // FOLDER ITEMS OPERATIONS (CRUD)
  // ========================================

  // Get items in a folder filtered by type
  async getFolderItemIds(folderId: string, itemType?: ItemType): Promise<string[]> {
    const relationsRef = collection(this.firestore, FOLDER_ITEMS_COLLECTION);

    let q;
    if (itemType) {
      // Filter by type (products or images)
      q = query(
        relationsRef,
        where('folderId', '==', folderId),
        where('itemType', '==', itemType),
        orderBy('order')
      );
    } else {
      // Get all items (both products and images)
      q = query(relationsRef, where('folderId', '==', folderId), orderBy('order'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data()['itemId']);
  }

  // Get count of items by type in a folder
  async getFolderItemCount(folderId: string, itemType: ItemType): Promise<number> {
    const relationsRef = collection(this.firestore, FOLDER_ITEMS_COLLECTION);
    const q = query(
      relationsRef,
      where('folderId', '==', folderId),
      where('itemType', '==', itemType)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Add item to folder
  async addItemToFolder(
    folderId: string,
    itemId: string,
    itemType: ItemType,
    order: number = 0
  ): Promise<void> {
    const folderItemsRef = collection(this.firestore, FOLDER_ITEMS_COLLECTION);
    await addDoc(folderItemsRef, {
      folderId,
      itemId,
      itemType,
      order,
      addedAt: new Date(),
    });
  }

  // Remove item from folder
  async removeItemFromFolder(
    folderId: string,
    itemId: string,
    itemType: ItemType
  ): Promise<void> {
    const relationsRef = collection(this.firestore, FOLDER_ITEMS_COLLECTION);
    const q = query(
      relationsRef,
      where('folderId', '==', folderId),
      where('itemId', '==', itemId),
      where('itemType', '==', itemType)
    );
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  // Get uncategorized items
  async getUncategorizedItemIds(
    allItemIds: string[],
    itemType: ItemType
  ): Promise<string[]> {
    const relationsRef = collection(this.firestore, FOLDER_ITEMS_COLLECTION);
    const q = query(relationsRef, where('itemType', '==', itemType));
    const snapshot = await getDocs(q);
    const categorizedIds = new Set(snapshot.docs.map((doc) => doc.data()['itemId']));

    return allItemIds.filter((id) => !categorizedIds.has(id));
  }
}
