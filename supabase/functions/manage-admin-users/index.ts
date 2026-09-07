/**
 * Supabase Edge Function: manage-admin-users
 *
 * Handles privileged admin user operations using the Supabase service role key.
 * All actions require the caller to have a valid Superadmin session.
 *
 * Actions:
 *   list          — list all auth users with admin/superadmin roles
 *   create        — create a new admin user (email + password)
 *   delete        — delete an admin user by userId
 *   resetPassword — set a new password for an admin user by userId
 *
 * Required environment secrets (Supabase Dashboard → Settings → Edge Functions):
 *   SUPABASE_URL              — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (NEVER expose to browser)
 *
 * The caller must send their session JWT in the Authorization header.
 * The function verifies the caller is a Superadmin before executing any action.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ---- CORS headers (allow your dashboard origin) ----------------------------
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// ---- Main handler -----------------------------------------------------------
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    // ---- 1. Validate caller session -----------------------------------------
    const authHeader = req.headers.get('Authorization') ?? '';
    const callerJwt  = authHeader.replace('Bearer ', '').trim();

    if (!callerJwt) {
      return jsonResponse({ error: 'Missing Authorization header' }, 401);
    }

    // Supabase auto-injects these as default secrets in every Edge Function.
    // SUPABASE_URL is a plain string. SUPABASE_SECRET_KEYS and SUPABASE_PUBLISHABLE_KEYS
    // are JSON dicts — we extract the keys we need from them.
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

    const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}';
    const secretKeys    = JSON.parse(secretKeysRaw) as Record<string, string>;
    const SUPABASE_SERVICE_ROLE_KEY = secretKeys['service_role']
      ?? (Object.values(secretKeys)[0] ?? '');

    const pubKeysRaw = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}';
    const pubKeys    = JSON.parse(pubKeysRaw) as Record<string, string>;
    const SUPABASE_ANON_KEY = pubKeys['anon']
      ?? (Object.values(pubKeys)[0] ?? '');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }

    // Use anon client to verify the caller's JWT without service-role escalation
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: `Bearer ${callerJwt}` } },
      auth: { persistSession: false },
    });

    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser(callerJwt);

    if (callerError || !callerUser) {
      return jsonResponse({ error: 'Unauthorized: invalid or expired session' }, 401);
    }

    // Enforce Superadmin role
    const callerRole = callerUser.app_metadata?.role;
    if (callerRole !== 'superadmin') {
      return jsonResponse({ error: 'Forbidden: Superadmin role required' }, 403);
    }

    // ---- 2. Parse request body ----------------------------------------------
    const body = await req.json();
    const { action, email, password, userId } = body as {
      action: string;
      email?: string;
      password?: string;
      userId?: string;
    };

    if (!action) {
      return jsonResponse({ error: 'Missing action' }, 400);
    }

    // ---- 3. Admin client (service role) -------------------------------------
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ---- 4. Dispatch action -------------------------------------------------

    // LIST — return all users that have admin or superadmin role
    if (action === 'list') {
      const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;

      // Filter to only admin/superadmin accounts
      const admins = data.users.filter(
        (u) => u.app_metadata?.role === 'admin' || u.app_metadata?.role === 'superadmin'
      );

      return jsonResponse({ users: admins });
    }

    // CREATE — create a new admin user
    if (action === 'create') {
      if (!email || !password) {
        return jsonResponse({ error: 'email and password are required' }, 400);
      }
      if (password.length < 8) {
        return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
      }

      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,         // skip email confirmation
        app_metadata: { role: 'admin' },
      });

      if (error) throw error;
      return jsonResponse({ user: data.user });
    }

    // DELETE — delete an admin user by userId
    if (action === 'delete') {
      if (!userId) {
        return jsonResponse({ error: 'userId is required' }, 400);
      }

      // Safety: cannot delete a superadmin
      const { data: targetData, error: fetchErr } = await adminClient.auth.admin.getUserById(userId);
      if (fetchErr) throw fetchErr;

      if (targetData.user?.app_metadata?.role === 'superadmin') {
        return jsonResponse({ error: 'Cannot delete a Superadmin account' }, 403);
      }

      // Safety: cannot self-delete
      if (targetData.user?.id === callerUser.id) {
        return jsonResponse({ error: 'Cannot delete your own account' }, 403);
      }

      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // RESET PASSWORD — set a new password for any non-superadmin admin
    if (action === 'resetPassword') {
      if (!userId || !password) {
        return jsonResponse({ error: 'userId and password are required' }, 400);
      }
      if (password.length < 8) {
        return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
      }

      // Safety: verify target exists and is not a superadmin (protect superadmin accounts)
      const { data: targetData, error: fetchErr } = await adminClient.auth.admin.getUserById(userId);
      if (fetchErr) throw fetchErr;

      if (!targetData.user) {
        return jsonResponse({ error: 'Target user not found' }, 404);
      }

      // Superadmins can reset any admin's password, but cannot reset another superadmin's
      // (protect the integrity of the superadmin tier)
      const targetRole = targetData.user.app_metadata?.role;
      if (targetRole === 'superadmin' && targetData.user.id !== callerUser.id) {
        return jsonResponse({ error: 'Cannot reset another Superadmin\'s password' }, 403);
      }

      const { data, error } = await adminClient.auth.admin.updateUserById(userId, { password });
      if (error) throw error;

      console.log(`Password reset by ${callerUser.email} for user ${data.user?.email}`);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);

  } catch (err) {
    console.error('manage-admin-users error:', err);
    return jsonResponse({ error: String(err) }, 500);
  }
});
