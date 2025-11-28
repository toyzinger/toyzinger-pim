import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { DimCollection } from './dimensions.model';
import { removeUndefined, prepareUpdateData } from '../../utils/firestore.utils';

@Injectable({
  providedIn: 'root'
})
export class CollectionFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'dim_collection';

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Get all collections
  async getCollections(): Promise<DimCollection[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DimCollection));
  }

  // Add collection
  async addCollection(dimCollection: Omit<DimCollection, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);

    // Remove undefined values (Firebase doesn't accept them)
    const cleanCollection = removeUndefined(dimCollection);

    const docRef = await addDoc(collectionRef, cleanCollection);
    return docRef.id;
  }

  // Update collection
  async updateCollection(id: string, dimCollection: Partial<DimCollection>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);

    // Prepare data: replace undefined with deleteField()
    const updateData = prepareUpdateData(dimCollection);

    await updateDoc(docRef, updateData);
  }

  // Delete collection
  async deleteCollection(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}
