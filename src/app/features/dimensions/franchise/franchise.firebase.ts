import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, deleteField } from '@angular/fire/firestore';
import { DimFranchise } from '../dimensions.model';
import { removeUndefined, prepareUpdateData } from '../../../utils/firestore.utils';

@Injectable({
  providedIn: 'root'
})
export class FranchiseFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'dim_franchise';

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Get all franchises
  async getFranchises(): Promise<DimFranchise[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DimFranchise));
  }

  // Add franchise
  async addFranchise(franchise: Omit<DimFranchise, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);

    // Remove undefined values (Firebase doesn't accept them)
    const cleanFranchise = removeUndefined(franchise);

    const docRef = await addDoc(collectionRef, cleanFranchise);
    return docRef.id;
  }

  // Update franchise
  async updateFranchise(id: string, franchise: Partial<DimFranchise>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);

    // Prepare data: replace undefined with deleteField()
    const updateData = prepareUpdateData(franchise);

    await updateDoc(docRef, updateData);
  }

  // Delete franchise
  async deleteFranchise(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}
