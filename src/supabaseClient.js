import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY not set. Supabase calls will fail until provided.');
}

// If keys are missing, return a safe stub that surfaces helpful errors instead of crashing.
let supabase;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  // Minimal stub with the methods the app expects to call to avoid runtime undefined errors.
  const noOp = async () => ({ error: new Error('Supabase not configured') });
  supabase = {
    auth: {
      getUser: noOp,
      signOut: noOp,
      onAuthStateChange: (cb) => ({ subscription: { unsubscribe: () => {} } }),
      signInWithPassword: async ({ email, password }) => ({ data: { user: null }, error: new Error('Supabase not configured') }),
      signUp: async ({ email, password }) => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    },
    from: () => ({ select: noOp, insert: noOp, update: noOp, eq: () => ({ select: noOp }), maybeSingle: noOp }),
    storage: {
      from: () => ({ upload: noOp, getPublicUrl: () => ({ data: { publicUrl: null } }) })
    }
  };
}

export { supabase };
export default supabase;
