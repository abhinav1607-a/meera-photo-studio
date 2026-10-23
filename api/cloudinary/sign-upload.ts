import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function send(res: any, status: number, body: Record<string, unknown>) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

async function requireStudioAdmin(req: any) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) throw new Error('Sign in is required and server authentication must be configured.');
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: 'Bearer ' + token } },
  });
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) throw new Error('Your session is invalid or has expired.');
  const { data: admin, error: adminError } = await client.from('admins').select('user_id').eq('user_id', userData.user.id).maybeSingle();
  if (adminError || !admin) throw new Error('Only an authorised studio administrator can manage media.');
  return userData.user;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  try {
    await requireStudioAdmin(req);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'meera_studio_upload';
    if (!cloudName || !apiKey || !apiSecret) return send(res, 500, { error: 'Cloudinary server environment variables are missing.' });

    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = 'meera-photo-studio/' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    const params: Record<string, string | number> = { public_id: publicId, timestamp, upload_preset: uploadPreset };
    const toSign = Object.keys(params).sort().map((key) => key + '=' + params[key]).join('&') + apiSecret;
    const signature = createHash('sha1').update(toSign).digest('hex');
    return send(res, 200, { cloud_name: cloudName, api_key: apiKey, timestamp, public_id: publicId, upload_preset: uploadPreset, signature });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not authorize upload.';
    const status = message.includes('authorised') ? 403 : message.includes('session') || message.includes('Sign in') ? 401 : 500;
    return send(res, status, { error: message });
  }
}
