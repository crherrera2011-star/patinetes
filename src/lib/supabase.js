import { createClient } from "@supabase/supabase-js";

/**
 * Supabase es opcional: si faltan credenciales, la web usa el snapshot local.
 * La clave publishable puede estar en el navegador; RLS hace el trabajo real.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : null;
