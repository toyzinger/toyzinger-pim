import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Product } from './products.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'products';

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Get all products
  async getProducts(): Promise<Product[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const docSnap = await getDocs(query(collection(this.firestore, this.COLLECTION_NAME), where('__name__', '==', id)));
    if (docSnap.empty) return null;
    return { id: docSnap.docs[0].id, ...docSnap.docs[0].data() } as Product;
  }

  // Add product
  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);

    // Remove undefined values (Firebase doesn't accept them)
    const cleanProduct = this.removeUndefined({
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
    await updateDoc(docRef, {
      ...product,
      updatedAt: new Date()
    });
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  // ========================================
  // HELPERS
  // ========================================

  // Helper: Remove undefined values from object (Firebase doesn't support undefined)
  private removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
  }
}
