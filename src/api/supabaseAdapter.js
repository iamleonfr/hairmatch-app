import supabase from '../supabaseClient';

const auth = {
  me: async () => {
    try {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;
      if (!user) {
        // Return a safe guest user to avoid null dereferences in UI when Supabase isn't configured
        return { id: null, email: '', full_name: '', phone: '', hair_type: 'Not Set', favorite_barber_ids: [] };
      }
      // Try profiles table first (legacy), then users table
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profile) return { id: user.id, email: user.email, ...profile };
      const { data: uprofile } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
      if (uprofile) return { id: user.id, email: user.email, ...uprofile };
      return { id: user.id, email: user.email };
    } catch (err) {
      console.warn('supabase auth.me error', err);
      return { id: null, email: '', full_name: '', phone: '', hair_type: 'Not Set', favorite_barber_ids: [] };
    }
  },
  logout: async (redirectTo) => {
    await supabase.auth.signOut();
    if (redirectTo && typeof window !== 'undefined') window.location.href = redirectTo;
  },
  signInWithEmail: async (email) => {
    if (!email) throw new Error('Email required');
    // Use magic link / OTP sign-in
    try {
      const res = await supabase.auth.signInWithOtp({ email });
      return res;
    } catch (err) {
      console.error('signInWithEmail error', err);
      throw err;
    }
  },
  signUpWithPassword: async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const user = data?.user;
      if (!user) throw new Error('Failed to create user');
      // Insert into users table
      const payload = {
        id: user.id,
        email: user.email,
        username: username || null,
        favorite_barber_ids: [],
      };
      const { data: created, error: createErr } = await supabase.from('users').upsert(payload, { returning: 'representation' });
      if (createErr) {
        console.warn('users upsert error', createErr);
      }
      return { user, profile: created?.[0] || payload };
    } catch (err) {
      console.error('signUpWithPassword error', err);
      throw err;
    }
  },
  signInWithPassword: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data?.user;
      if (!user) throw new Error('Failed to sign in');
      // fetch profile from users table
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
      return { user, profile };
    } catch (err) {
      console.error('signInWithPassword error', err);
      throw err;
    }
  },
  updateMe: async (updates) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('profiles').upsert({ id: user.id, ...updates }, { returning: 'representation' });
    if (error) throw error;
    return { id: user.id, email: user.email, ...data[0] };
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
      Object.entries(filters).forEach(([k, v]) => q = q.eq(k, v));
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
    },
    list: async (orderBy) => {
      let q = supabase.from('reviews').select('*');
      if (orderBy) {
        const direction = orderBy.startsWith('-') ? 'desc' : 'asc';
        const col = orderBy.replace(/^-/, '');
        q = q.order(col, { ascending: direction === 'asc' });
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    }
  },
  Shop: {
    list: async () => {
      const { data, error } = await supabase.from('shops').select('*');
      if (error) throw error;
      return data || [];
    },
    create: async (payload) => {
      const { data, error } = await supabase.from('shops').insert(payload).select();
      if (error) throw error;
      return data;
    }
  },
  User: {
    list: async (orderBy) => {
      const { data, error } = await supabase.from('profiles').select('*');
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
  getPublicUrl: (bucket, path) => supabase.storage.from(bucket).getPublicUrl(path).data?.publicUrl || null
};

const integrations = {
  Core: {
    InvokeLLM: async (opts = {}) => {
      // opts: { prompt: string, response_json_schema?: object }
      try {
        const openaiKey = process.env.REACT_APP_OPENAI_KEY || (typeof window !== 'undefined' && window.__OPENAI_KEY__);
        if (!openaiKey) {
          // Return a mocked/simple response when OpenAI key not configured
          // Try to return shape that caller might expect
          if (opts.response_json_schema) {
            // attempt to return something reasonable for known shapes
            return { city: 'Berlin', latitude: 52.52, longitude: 13.405 };
          }
          return { text: 'Curly' };
        }

        // Call OpenAI Chat Completions API
        const body = {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: opts.prompt || '' }],
          temperature: 0
        };

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenAI error: ${res.status} ${errText}`);
        }

        const data = await res.json();
        const assistant = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';

        // If a JSON schema is expected, try to parse JSON from the model output
        if (opts.response_json_schema) {
          try {
            const parsed = JSON.parse(assistant);
            return parsed;
          } catch (e) {
            // If parsing fails, return the raw text under a key so caller can handle it
            return { raw: assistant };
          }
        }

        return { text: assistant };
      } catch (err) {
        console.error('InvokeLLM error', err);
        // Fail gracefully
        return { error: String(err) };
      }
    },
    UploadFile: async ({ file, bucket = 'public', folder = 'uploads' } = {}) => {
      try {
        if (!file) return { file_url: null };
        // create a safe path: folder/timestamp-filename
        const timestamp = Date.now();
        const safeName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `${folder}/${safeName}`;

        if (!supabase || !supabase.storage || typeof supabase.storage.from !== 'function') {
          console.warn('Supabase storage not configured');
          return { file_url: null };
        }

        const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) {
          console.error('Supabase upload error', error);
          throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        const publicUrl = urlData?.publicUrl || null;
        return { file_url: publicUrl, path };
      } catch (err) {
        console.error('UploadFile error', err);
        return { file_url: null, error: String(err) };
      }
    }
  }
};

const supabaseApi = { auth, entities, storage, integrations };
export default supabaseApi;
export { supabaseApi };
