import { supabase, isSupabaseConfigured } from "./client";

export interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

export const storageService = {
  /**
   * Upload a file to Supabase Storage bucket 'manufacturing-documents'
   */
  async uploadDocument(
    bucket: "requirements" | "certifications" | "bids" | "purchase-orders",
    path: string,
    file: File | Blob
  ): Promise<UploadResult> {
    if (!isSupabaseConfigured()) {
      // Local development simulation
      return {
        path: `${bucket}/${path}`,
        url: `/uploads/${bucket}/${path}`,
      };
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) {
      return { path: "", url: "", error: error.message };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  },

  /**
   * Get public or signed URL for authorized access
   */
  getSignedUrl(bucket: string, path: string, expiresInSeconds: number = 3600): string {
    if (!isSupabaseConfigured()) {
      return `/mock-docs/${bucket}/${path}`;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
};
