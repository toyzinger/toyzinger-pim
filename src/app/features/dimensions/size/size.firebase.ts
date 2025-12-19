import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { DimSize } from '../dimensions.model';
import { removeUndefined, prepareUpdateData } from '../../../utils/firestore.utils';

@Injectable({
  providedIn: 'root',
})
export class SizeFirebase {
  private firestore = inject(Firestore);
  private collectionName = 'dim_sizes';

  /**
   * Fetch all sizes from Firestore
   */
  async getSizes(): Promise<DimSize[]> {
    try {
      const sizesCollection = collection(this.firestore, this.collectionName);
      const q = query(sizesCollection, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as DimSize));
    } catch (error) {
      console.error('Error fetching sizes:', error);
      throw error;
    }
  }

  /**
   * Create a new size in Firestore
   */
  async createSize(size: Omit<DimSize, 'id'>): Promise<string> {
    try {
      const sizesCollection = collection(this.firestore, this.collectionName);
      // Remove undefined values (Firebase doesn't accept them)
      const cleanSize = removeUndefined(size);
      const docRef = await addDoc(sizesCollection, cleanSize);
      return docRef.id;
    } catch (error) {
      console.error('Error creating size:', error);
      throw error;
    }
  }

  /**
   * Update an existing size in Firestore
   */
  async updateSize(id: string, updates: Partial<DimSize>): Promise<void> {
    try {
      const sizeDoc = doc(this.firestore, this.collectionName, id);
      // Prepare data: replace undefined with deleteField()
      const updateData = prepareUpdateData(updates);
      await updateDoc(sizeDoc, updateData);
    } catch (error) {
      console.error('Error updating size:', error);
      throw error;
    }
  }

  /**
   * Delete a size from Firestore
   */
  async deleteSize(id: string): Promise<void> {
    try {
      const sizeDoc = doc(this.firestore, this.collectionName, id);
      await deleteDoc(sizeDoc);
    } catch (error) {
      console.error('Error deleting size:', error);
      throw error;
    }
  }
}
