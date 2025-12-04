import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit, deleteField } from '@angular/fire/firestore';
import { Product } from './products.model';
import { removeUndefined, prepareUpdateData } from '../../utils/firestore.utils';

@Injectable({
  providedIn: 'root'
})
export class ProductsFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'toy_products';

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Get all products
  async getProducts(): Promise<Product[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  // Add product
  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);

    // Remove undefined values (Firebase doesn't accept them)
    const cleanProduct = removeUndefined({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const docRef = await addDoc(collectionRef, cleanProduct);
    return docRef.id;
  }

  // Update product
  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);

    // Prepare data: replace undefined with deleteField()
    const updateData = prepareUpdateData({
      ...product,
      updatedAt: new Date()
    });

    await updateDoc(docRef, updateData);
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

}
