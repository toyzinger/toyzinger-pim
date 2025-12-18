import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { ProductImage } from './pimages.model';
import { removeUndefined, prepareUpdateData } from '../../utils/firestore.utils';

@Injectable({
  providedIn: 'root'
})
export class ImagesFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'toy_images';

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Get all product images
  async getProductImages(): Promise<ProductImage[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductImage));
  }

  // Add product image
  async addProductImage(image: Omit<ProductImage, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const imageData = removeUndefined(image);
    const docRef = await addDoc(collectionRef, imageData);
    return docRef.id;
  }

  // Update product image
  async updateProductImage(id: string, image: Partial<ProductImage>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const updateData = prepareUpdateData(image);
    await updateDoc(docRef, updateData);
  }

  // Delete product image
  async deleteProductImage(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}
