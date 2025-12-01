import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { DimSubCollection } from '../dimensions.model';
import { removeUndefined, prepareUpdateData } from '../../../utils/firestore.utils';

@Injectable({
  providedIn: 'root'
})
export class SubCollectionFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'dim_subcollection';

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Get all subcollections
  async getSubCollections(): Promise<DimSubCollection[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DimSubCollection));
  }

  // Add subcollection
  async addSubCollection(subCollection: Omit<DimSubCollection, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);

    // Remove undefined values (Firebase doesn't accept them)
    const cleanSubCollection = removeUndefined(subCollection);

    const docRef = await addDoc(collectionRef, cleanSubCollection);
    return docRef.id;
  }

  // Update subcollection
  async updateSubCollection(id: string, subCollection: Partial<DimSubCollection>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);

    // Prepare data: replace undefined with deleteField()
    const updateData = prepareUpdateData(subCollection);

    await updateDoc(docRef, updateData);
  }

  // Delete subcollection
  async deleteSubCollection(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}
