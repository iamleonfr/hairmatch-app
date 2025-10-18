import supabase from '../supabaseClient';

// Adapter that provides a small API similar to the original `base44` object used
// across the app. This implementation uses Supabase for auth, database and storage.

const auth = {
  me: async () => {
    // Return merged auth user + profile record so UI can read fields like full_name
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    const user = userData?.user;
    if (!user) return null;

    const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (profileErr) throw profileErr;

    // Merge common fields: full_name, email, favorite_barber_ids, hair_type, etc.
    return {
      id: user.id,
      email: user.email,
      ...profile
    };
  },
  logout: async (redirectTo) => {
    await supabase.auth.signOut();
    if (redirectTo && typeof window !== 'undefined') window.location.href = redirectTo;
  },
  updateMe: async (updates) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('Not authenticated');
    const id = user.id;
    const { data, error } = await supabase.from('profiles').upsert({ id, ...updates }, { returning: 'representation' });
    if (error) throw error;
    return { id, email: user.email, ...data[0] };
  }
};

const entities = {
  Barber: {
    list: async (orderBy) => {
      let q = supabase.from('barbers').select('*');
      if (orderBy) {
        const direction = orderBy.startsWith('-') ? 'desc' : 'asc';
        const col = orderBy.replace(/^-/, '');
        q = q.order(col, { ascending: direction === 'asc' });
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    filter: async (filters = {}) => {
      let q = supabase.from('barbers').select('*');
      Object.entries(filters).forEach(([k, v]) => {
        q = q.eq(k, v);
      });
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    update: async (id, updates) => {
      const { data, error } = await supabase.from('barbers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    create: async (payload) => {
      const { data, error } = await supabase.from('barbers').insert(payload).select();
      if (error) throw error;
      return data;
    }
  },
  Review: {
    filter: async (filters = {}, orderBy) => {
      let q = supabase.from('reviews').select('*');
      Object.entries(filters).forEach(([k, v]) => q = q.eq(k, v));
      if (orderBy) {
        const direction = orderBy.startsWith('-') ? 'desc' : 'asc';
        const col = orderBy.replace(/^-/, '');
        q = q.order(col, { ascending: direction === 'asc' });
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    create: async (payload) => {
      const { data, error } = await supabase.from('reviews').insert(payload).select();
      if (error) throw error;
      return data;
    }
  },
  Shop: {
    list: async () => {
      const { data, error } = await supabase.from('shops').select('*');
      if (error) throw error;
      return data || [];
    }
  }
};

const storage = {
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return data;
  },
  getPublicUrl: (bucket, path) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data?.publicUrl || null;
  }
};

export const base44 = { auth, entities, storage };
export default base44;

