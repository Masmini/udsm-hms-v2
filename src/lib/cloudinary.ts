//src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
}

export const uploadToCloudinary = async (
  file: File | string,
  options: {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    public_id?: string;
    transformation?: any[];
  } = {}
): Promise<UploadResult> => {
  try {
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || "udsm-hms",
      resource_type: options.resource_type || "auto",
      public_id: options.public_id,
      transformation: options.transformation,
    };

    const filePath = file instanceof File ? await fileToDataURL(file) : file;

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    return result as UploadResult;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default cloudinary;
