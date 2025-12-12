export interface ProductImage {
  id?: string;
  filename: string;
  alt?: string;
  subcollectionId?: string;
}

export interface ImageUploadResponse {
  filename: string;
  size: number;
  mimetype: string;
  path: string;
}

export interface ImageUploadResult {
  message: string;
  files: ImageUploadResponse[];
}

export interface UploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'invalid';
  result?: ImageUploadResponse;
  error?: string;
  progress?: number;
}
