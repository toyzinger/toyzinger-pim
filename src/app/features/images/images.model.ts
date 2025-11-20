export interface ProductImage {
  id?: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
  folderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
