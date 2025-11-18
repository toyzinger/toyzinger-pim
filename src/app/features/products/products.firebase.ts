import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Product } from './products.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'products';

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
    const productData = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collectionRef, productData);
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

  // Get products by franchise
  async getProductsByFranchise(franchiseId: number | string): Promise<Product[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(collectionRef, where('franchiseId', '==', franchiseId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  // Get products by manufacturer
  async getProductsByManufacturer(manufacturerId: number | string): Promise<Product[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(collectionRef, where('manufacturerId', '==', manufacturerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  // Get active products
  async getActiveProducts(): Promise<Product[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(collectionRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  // Search products by name
  async searchProducts(searchTerm: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
