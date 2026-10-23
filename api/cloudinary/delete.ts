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
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  try {
    await requireStudioAdmin(req);
    const publicId = typeof req.body?.public_id === 'string' ? req.body.public_id : '';
    if (!publicId.startsWith('meera-photo-studio/')) return send(res, 400, { error: 'Invalid Cloudinary asset identifier.' });
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) return send(res, 500, { error: 'Cloudinary server environment variables are missing.' });

    const timestamp = Math.floor(Date.now() / 1000);
    const params = { invalidate: 'true', public_id: publicId, timestamp: String(timestamp) };
    const toSign = Object.keys(params).sort().map((key) => key + '=' + params[key as keyof typeof params]).join('&') + apiSecret;
    const signature = createHash('sha1').update(toSign).digest('hex');
    const form = new URLSearchParams({ ...params, api_key: apiKey, signature });
    const response = await fetch('https://api.cloudinary.com/v1_1/' + cloudName + '/image/destroy', { method: 'POST', body: form });
    const result = await response.json() as { result?: string; error?: { message?: string } };
    if (!response.ok || result.result !== 'ok' && result.result !== 'not found') {
      return send(res, 502, { error: result.error?.message || 'Cloudinary could not delete this asset.' });
    }
    return send(res, 200, { ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not authorize media deletion.';
    const status = message.includes('authorised') ? 403 : message.includes('session') || message.includes('Sign in') ? 401 : 500;
    return send(res, status, { error: message });
  }
}
