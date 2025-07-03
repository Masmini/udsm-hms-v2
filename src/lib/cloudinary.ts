// /src/lib/cloudinary.ts
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
  file: File,
  options: {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    public_id?: string;
    transformation?: any[];
    upload_preset?: string;
  } = {}
): Promise<UploadResult> => {
  try {
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || "udsm-hms",
      resource_type: options.resource_type || "auto",
      public_id: options.public_id,
      transformation: options.transformation || [
        { quality: "auto", fetch_format: "auto" },
      ],
      upload_preset:
        options.upload_preset ||
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadOptions.upload_preset || "udsm_hms");
    if (uploadOptions.folder) formData.append("folder", uploadOptions.folder);
    if (uploadOptions.public_id)
      formData.append("public_id", uploadOptions.public_id);
    if (uploadOptions.transformation) {
      formData.append(
        "transformation",
        JSON.stringify(uploadOptions.transformation)
      );
    }
    formData.append("resource_type", uploadOptions.resource_type || "auto");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Cloudinary upload failed: ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const result = await response.json();
    return result as UploadResult;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(
      `Failed to upload file to Cloudinary: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export default cloudinary;
