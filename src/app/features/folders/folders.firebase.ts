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
import { Folder } from './folders.model';
import { ItemType } from '../global/global.model';

const FOLDERS_COLLECTION = 'folders';

@Injectable({
  providedIn: 'root',
})
export class FoldersFirebase {
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

    // Finally delete the folder itself
    const folderRef = doc(this.firestore, FOLDERS_COLLECTION, folderId);
    await deleteDoc(folderRef);
  }
}
