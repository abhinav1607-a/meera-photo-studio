import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR_PROJECT_ID') && !anonKey.includes('YOUR_SUPABASE'));
export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null;

export type GalleryItem = {
  id: string;
  title: string;
  caption: string | null;
  category: string;
  image_url: string;
  alt_text: string | null;
  is_published: boolean;
  is_featured: boolean;
  position: number;
  created_at?: string;
  cloudinary_public_id?: string | null;
  storage_path?: string | null;
};

export type Enquiry = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  service: string;
  event_date: string | null;
  event_location: string | null;
  message: string | null;
  status: 'New' | 'Contacted' | 'In Discussion' | 'Confirmed' | 'Closed';
  created_at: string;
};