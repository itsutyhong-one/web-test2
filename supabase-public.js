// Public-facing Supabase client — read-only, no auth required
// Credentials injected via admin/env.js (loaded before this script)

(function() {
  const url  = window.SUPABASE_URL      || '';
  const anon = window.SUPABASE_ANON_KEY || '';
  const ready = url !== '' && !url.startsWith('YOUR_');

  let db = null;
  if (ready && typeof supabase !== 'undefined') {
    db = supabase.createClient(url, anon);
  }

  window.getPublicNotices = async function({ category } = {}) {
    if (!db) return null; // caller uses fallback hardcoded data
    let q = db.from('notices').select('*').eq('status', '게시중').order('created_at', { ascending: false });
    if (category) q = q.eq('category', category);
    const { data, error } = await q;
    if (error) { console.error('notices:', error); return null; }
    return data.map(n => ({ ...n, createdAt: n.created_at?.slice(0,10) || '' }));
  };

  window.getPublicNoticeDetail = async function(id) {
    if (!db) return null;
    const { data, error } = await db.from('notices').select('*').eq('id', id).eq('status', '게시중').single();
    if (error) return null;
    return { ...data, createdAt: data.created_at?.slice(0,10) || '' };
  };

  window.getPublicStations = async function() {
    if (!db) return null;
    const { data, error } = await db.from('stations').select('id,name,region,address,status').order('region');
    if (error) { console.error('stations:', error); return null; }
    return data;
  };
})();
