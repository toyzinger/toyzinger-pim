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
  Timestamp,
  deleteField,
} from '@angular/fire/firestore';
import { DimSize } from '../dimensions.model';

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
      const q = query(sizesCollection, orderBy('text', 'asc'));
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
      const data = {
        text: size.text,
        ...(size.slug && { slug: size.slug }),
        ...(size.order !== undefined && { order: size.order }),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(sizesCollection, data);
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
      const data: any = {
        ...(updates.text !== undefined && { text: updates.text }),
        ...(updates.slug !== undefined && updates.slug
          ? { slug: updates.slug }
          : { slug: deleteField() }),
        ...(updates.order !== undefined && updates.order !== null
          ? { order: updates.order }
          : { order: deleteField() }),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(sizeDoc, data);
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
