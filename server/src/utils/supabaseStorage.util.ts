import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

let supabaseClientInstance: SupabaseClient | null = null;
let bucketVerified = false;

/**
 * Initializes and returns the Supabase client if environment variables are set.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) return supabaseClientInstance;

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    return supabaseClientInstance;
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Ensures the target Supabase Storage bucket exists and is public.
 */
async function ensureBucketExists(supabase: SupabaseClient, bucketName: string) {
  if (bucketVerified) return;
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.warn('⚠️ Could not list Supabase buckets (continuing upload):', listError.message);
      return;
    }

    const exists = buckets?.some((b) => b.name === bucketName);
    if (!exists) {
      console.log(`📦 Creating public Supabase storage bucket: "${bucketName}"...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10 MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'],
      });
      if (createError) {
        console.warn(`⚠️ Bucket creation notice for "${bucketName}":`, createError.message);
      } else {
        console.log(`✅ Supabase bucket "${bucketName}" created successfully as public.`);
      }
    }
    bucketVerified = true;
  } catch (err: any) {
    console.warn('⚠️ Bucket verification notice:', err.message || err);
  }
}

export interface UploadOptions {
  fileBuffer: Buffer;
  originalName: string;
  mimeType: string;
  bucketName?: string;
  folder?: string;
}

/**
 * Uploads an image to Supabase Storage.
 * Falls back to local disk storage if Supabase credentials are not provided.
 */
export async function uploadImageToStorage(options: UploadOptions): Promise<{ url: string; filename: string }> {
  const {
    fileBuffer,
    originalName,
    mimeType,
    bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'product-images',
    folder = 'products',
  } = options;

  const ext = (path.extname(originalName) || '.jpg').toLowerCase();
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const cleanFilename = `img-${uniqueId}${ext}`;
  const filePath = folder ? `${folder}/${cleanFilename}` : cleanFilename;

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      await ensureBucketExists(supabase, bucketName);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('❌ Supabase storage upload error:', error);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;
      console.log(`✅ Image uploaded to Supabase Storage: ${publicUrl}`);

      return {
        url: publicUrl,
        filename: cleanFilename,
      };
    } catch (supabaseErr: any) {
      console.error('❌ Error during Supabase upload attempt:', supabaseErr);
      throw supabaseErr;
    }
  }

  // Fallback: Local file storage for offline development
  console.warn('⚠️ Supabase credentials not set. Falling back to local filesystem storage.');
  const baseUploadDir = path.resolve(__dirname, '../../uploads/public');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
  }

  const localFilePath = path.join(baseUploadDir, cleanFilename);
  fs.writeFileSync(localFilePath, fileBuffer);

  return {
    url: `/uploads/public/${cleanFilename}`,
    filename: cleanFilename,
  };
}
