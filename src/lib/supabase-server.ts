import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a privileged Supabase client configured with the service_role key.
 * This client bypasses RLS and must NEVER be exposed to the client browser.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase server credentials. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables."
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

/**
 * Generates a short-lived signed URL (default 1 hour = 3600s) for private assets
 * in the 'card-assets' bucket.
 */
export async function getSignedAssetUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  if (!storagePath) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from("card-assets")
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.error("Failed to generate signed URL:", error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error creating signed URL:", err);
    return null;
  }
}

/**
 * Generates a signed upload URL for secure, direct-to-storage client uploads.
 */
export async function createSignedUploadUrl(
  destinationPath: string
): Promise<{ signedUrl: string; path: string; token: string } | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from("card-assets")
      .createSignedUploadUrl(destinationPath);

    if (error || !data) {
      console.error("Failed to create signed upload URL:", error?.message);
      return null;
    }

    return {
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
    };
  } catch (err) {
    console.error("Error creating signed upload URL:", err);
    return null;
  }
}
