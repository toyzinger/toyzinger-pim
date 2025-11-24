import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { ProductImage } from './productimages.model';

@Injectable({
  providedIn: 'root'
})
export class ImagesFirebase {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'productimages';

  // Get all product images
  async getProductImages(): Promise<ProductImage[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductImage));
  }

  // Get product image by ID
  async getProductImageById(id: string): Promise<ProductImage | null> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const docSnap = await getDocs(query(collection(this.firestore, this.COLLECTION_NAME), where('__name__', '==', id)));
    if (docSnap.empty) return null;
    return { id: docSnap.docs[0].id, ...docSnap.docs[0].data() } as ProductImage;
  }

  // Add product image
  async addProductImage(image: Omit<ProductImage, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const imageData = {
      ...image,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collectionRef, imageData);
    return docRef.id;
  }

  // Update product image
  async updateProductImage(id: string, image: Partial<ProductImage>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...image,
      updatedAt: new Date()
    });
  }

  // Delete product image
  async deleteProductImage(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  // Get product images by folder ID
  async getProductImagesByFolder(folderId: string): Promise<ProductImage[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(collectionRef, where('folderId', '==', folderId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductImage));
  }

  // Get product images by filename
  async getProductImagesByFilename(filename: string): Promise<ProductImage[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(collectionRef, where('filename', '==', filename));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductImage));
  }

  // Search product images by filename pattern
  async searchProductImages(searchTerm: string): Promise<ProductImage[]> {
    const images = await this.getProductImages();
    return images.filter(image =>
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.alt?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Get product images without folder (unorganized images)
  async getUnorganizedProductImages(): Promise<ProductImage[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    // Get all images and filter for those without folderId
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ProductImage))
      .filter(img => !img.folderId); // Filter images without folderId
  }
}
