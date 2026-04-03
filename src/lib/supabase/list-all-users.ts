import { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;

/**
 * Paginate through all auth users to avoid the 1000-user silent truncation
 * in supabase.auth.admin.listUsers({ perPage: 1000 }).
 */
export async function listAllAuthUsers(
  supabase: SupabaseClient
): Promise<{ id: string; email?: string; created_at?: string }[]> {
  const allUsers: { id: string; email?: string; created_at?: string }[] = [];
  let page = 1;

  while (true) {
    const { data } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (!data?.users || data.users.length === 0) break;

    for (const u of data.users) {
      allUsers.push({ id: u.id, email: u.email, created_at: u.created_at });
    }

    if (data.users.length < PAGE_SIZE) break;
    page++;
  }

  return allUsers;
}

/**
 * Build a userId -> email map from all auth users (paginated).
 */
export async function buildEmailMap(
  supabase: SupabaseClient
): Promise<Map<string, string>> {
  const users = await listAllAuthUsers(supabase);
  const map = new Map<string, string>();
  for (const u of users) {
    if (u.email) map.set(u.id, u.email);
  }
  return map;
}

/**
 * Build a userId -> { email, created_at } map from all auth users (paginated).
 */
export async function buildAuthMap(
  supabase: SupabaseClient
): Promise<Map<string, { email: string; created_at: string }>> {
  const users = await listAllAuthUsers(supabase);
  const map = new Map<string, { email: string; created_at: string }>();
  for (const u of users) {
    if (u.email && u.created_at) {
      map.set(u.id, { email: u.email, created_at: u.created_at });
    }
  }
  return map;
}
