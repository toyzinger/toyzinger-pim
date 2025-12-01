import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { DimManufacturer } from '../dimensions.model';
import { removeUndefined, prepareUpdateData } from '../../../utils/firestore.utils';

@Injectable({
  providedIn: 'root'
})
export class ManufacturerFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'dim_manufacturer';

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Get all manufacturers
  async getManufacturers(): Promise<DimManufacturer[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DimManufacturer));
  }

  // Add manufacturer
  async addManufacturer(manufacturer: Omit<DimManufacturer, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);

    // Remove undefined values (Firebase doesn't accept them)
    const cleanManufacturer = removeUndefined(manufacturer);

    const docRef = await addDoc(collectionRef, cleanManufacturer);
    return docRef.id;
  }

  // Update manufacturer
  async updateManufacturer(id: string, manufacturer: Partial<DimManufacturer>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);

    // Prepare data: replace undefined with deleteField()
    const updateData = prepareUpdateData(manufacturer);

    await updateDoc(docRef, updateData);
  }

  // Delete manufacturer
  async deleteManufacturer(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}
