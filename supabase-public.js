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

  window.getPublicChargers = async function() {
    if (!db) return null;
    const { data, error } = await db.from('chargers')
      .select('id,status,charge_percent,station_id,stations(name)')
      .order('id');
    if (error) { console.error('chargers:', error); return null; }
    return data.map(c => ({ ...c, stationName: c.stations?.name || '' }));
  };

  window.getPublicTodayHistoryCount = async function() {
    if (!db) return null;
    const today = new Date().toISOString().slice(0, 10);
    const { count, error } = await db.from('charging_history')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', today + 'T00:00:00');
    if (error) { console.error('history count:', error); return null; }
    return count;
  };

  // ── 페이지 방문 기록 ──────────────────────────────
  window.trackPageView = async function() {
    if (!db) return;
    // 세션 ID: 탭을 닫기 전까지 유지
    let sid = sessionStorage.getItem('kdn_sid');
    if (!sid) {
      sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('kdn_sid', sid);
    }
    const page = window.location.pathname.split('/').pop() || 'index.html';
    try {
      await db.from('page_views').insert({ page, session_id: sid });
    } catch (_) {}
  };

  // 페이지 로드 시 자동 기록
  document.addEventListener('DOMContentLoaded', window.trackPageView);
})();
