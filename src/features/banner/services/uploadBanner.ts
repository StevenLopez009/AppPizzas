import { uploadImageToCloudinary } from "@/lib/storage/cloudinary";

export async function uploadBanner(file: File): Promise<string> {
  return uploadImageToCloudinary(file);
}
