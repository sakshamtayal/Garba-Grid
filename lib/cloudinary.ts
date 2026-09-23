import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

/**
 * Upload a base64-encoded image to Cloudinary.
 * @param base64 - Data URL string (e.g. "data:image/jpeg;base64,...")
 * @param folder - Cloudinary folder to upload into (e.g. "garbagrid/profiles")
 * @returns The secure URL of the uploaded image
 */
export async function uploadImage(base64: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    max_bytes: 5 * 1024 * 1024, // 5 MB limit
  });

  return result.secure_url;
}

/**
 * Delete an image from Cloudinary by its public ID.
 * @param publicId - The Cloudinary public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

/**
 * Extract the Cloudinary public ID from a secure URL.
 * Useful when you need to delete an image and only have its URL.
 */
export function getPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const uploadIndex = parts.findIndex((p) => p === 'upload');
  // Skip "upload" + version segment (e.g. "v1234567890")
  const relevantParts = parts.slice(uploadIndex + 2);
  const lastPart = relevantParts[relevantParts.length - 1];
  // Remove file extension
  relevantParts[relevantParts.length - 1] = lastPart.split('.')[0];
  return relevantParts.join('/');
}

export default cloudinary;
