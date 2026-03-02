export interface MediaRow {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  category: string;
  uploadedBy: string;
  createdAt: string;
}

export type UploadResult = {
  uploaded: Pick<MediaRow, "id" | "filename" | "originalName">[];
  errors: string[];
};
