// Supabase 연결 정보는 admin/env.js 에서 주입됩니다 (gitignore 처리됨).
// env.example.js 를 복사해 env.js 를 만들고 실제 값을 입력하세요.

const SUPABASE_URL  = window.SUPABASE_URL      || '';
const SUPABASE_ANON = window.SUPABASE_ANON_KEY || '';

const SUPABASE_READY = SUPABASE_URL !== '' && !SUPABASE_URL.startsWith('YOUR_');

let db = null;
if (SUPABASE_READY && typeof supabase !== 'undefined') {
  db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
}

// =============================================
// 데이터 조회 함수 (Supabase 우선, 없으면 mock 데이터)
// =============================================

async function getStations({ region, status, search } = {}) {
  if (!db) return STATIONS.filter(s =>
    (!region || s.region === region) &&
    (!status || s.status === status) &&
    (!search || s.name.includes(search) || s.address.includes(search))
  );
  let q = db.from('stations').select('*').order('id');
  if (region) q = q.eq('region', region);
  if (status) q = q.eq('status', status);
  if (search) q = q.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) { console.error('stations:', error); return STATIONS; }
  return data;
}

async function getChargers({ stationId, status } = {}) {
  if (!db) {
    let list = [...CHARGERS];
    if (stationId) list = list.filter(c => c.stationId === stationId);
    if (status)    list = list.filter(c => c.status === status);
    return list;
  }
  let q = db.from('chargers').select('*, stations(name)').order('id');
  if (stationId) q = q.eq('station_id', stationId);
  if (status)    q = q.eq('status', status);
  const { data, error } = await q;
  if (error) { console.error('chargers:', error); return CHARGERS; }
  return data.map(c => ({ ...c, stationId: c.station_id, stationName: c.stations?.name || '', chargePercent: c.charge_percent, connectedVehicle: c.connected_vehicle, lastUpdate: c.last_update }));
}

async function getHistory({ stationName, memberType, dateFrom, dateTo, search } = {}) {
  if (!db) return HISTORY.filter(h =>
    (!search || h.stationName.includes(search) || h.vehicle.includes(search)) &&
    (!stationName || h.stationName === stationName) &&
    (!memberType || h.memberType === memberType) &&
    (!dateFrom || h.startTime >= dateFrom) &&
    (!dateTo   || h.startTime <= dateTo + 'T23:59:59')
  );
  let q = db.from('charging_history')
    .select('*, stations(name), chargers(id)')
    .order('start_time', { ascending: false });
  if (memberType) q = q.eq('member_type', memberType);
  if (dateFrom)   q = q.gte('start_time', dateFrom);
  if (dateTo)     q = q.lte('start_time', dateTo + 'T23:59:59');
  const { data, error } = await q;
  if (error) { console.error('history:', error); return HISTORY; }
  return data.map(h => ({
    ...h,
    stationName: h.stations?.name || '',
    chargerId:   h.chargers?.id  || h.charger_id,
    memberType:  h.member_type,
    startTime:   h.start_time,
    duration:    h.duration_minutes,
  })).filter(h =>
    (!search || h.stationName.includes(search) || h.vehicle.includes(search)) &&
    (!stationName || h.stationName === stationName)
  );
}

async function getFaults({ status } = {}) {
  if (!db) return status ? FAULTS.filter(f => f.status === status) : [...FAULTS];
  let q = db.from('faults')
    .select('*, stations(name), chargers(id)')
    .order('reported_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) { console.error('faults:', error); return FAULTS; }
  return data.map(f => ({
    ...f,
    stationId:   f.station_id,
    stationName: f.stations?.name || '',
    chargerId:   f.chargers?.id  || f.charger_id,
    reportedAt:  new Date(f.reported_at).toLocaleString('ko-KR').slice(0,-3),
  }));
}

async function getNotices({ status, category } = {}) {
  if (!db) return NOTICES.filter(n =>
    (!status   || n.status === status) &&
    (!category || n.category === category)
  );
  let q = db.from('notices').select('*').order('created_at', { ascending: false });
  if (status)   q = q.eq('status', status);
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) { console.error('notices:', error); return NOTICES; }
  return data.map(n => ({ ...n, createdAt: n.created_at?.slice(0,10) || '' }));
}

// =============================================
// 데이터 입력/수정 함수
// =============================================

async function insertStation(station) {
  if (!db) { STATIONS.push(station); return station; }
  const { data, error } = await db.from('stations').insert(station).select().single();
  if (error) throw error;
  return data;
}

async function insertCharger(charger) {
  if (!db) { CHARGERS.push(charger); return charger; }
  const row = { id: charger.id, station_id: charger.stationId, port: charger.port, type: charger.type, status: 'offline' };
  const { data, error } = await db.from('chargers').insert(row).select().single();
  if (error) throw error;
  return data;
}

async function insertFault(fault) {
  if (!db) { FAULTS.unshift(fault); return fault; }
  const row = {
    id: fault.id, station_id: fault.stationId || STATIONS.find(s=>s.name===fault.stationName)?.id,
    charger_id: fault.chargerId, type: fault.type, severity: fault.severity,
    status: '접수', description: fault.desc
  };
  const { data, error } = await db.from('faults').insert(row).select().single();
  if (error) throw error;
  return data;
}

async function updateFaultStatus(id, status) {
  if (!db) {
    const f = FAULTS.find(x => x.id === id);
    if (f) f.status = status;
    return;
  }
  const update = { status };
  if (status === '완료') update.resolved_at = new Date().toISOString();
  const { error } = await db.from('faults').update(update).eq('id', id);
  if (error) throw error;
}

async function insertNotice(notice) {
  if (!db) { NOTICES.unshift(notice); return notice; }
  const row = {
    id: notice.id, title: notice.title, content: notice.content,
    category: notice.category, status: notice.status, author: notice.author
  };
  const { data, error } = await db.from('notices').insert(row).select().single();
  if (error) throw error;
  return data;
}

async function updateNotice(id, fields) {
  if (!db) {
    const n = NOTICES.find(x => x.id === id);
    if (n) Object.assign(n, fields);
    return;
  }
  const { error } = await db.from('notices').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

async function deleteNotice(id) {
  if (!db) {
    const idx = NOTICES.findIndex(x => x.id === id);
    if (idx !== -1) NOTICES.splice(idx, 1);
    return;
  }
  const { error } = await db.from('notices').delete().eq('id', id);
  if (error) throw error;
}

// =============================================
// Realtime 구독 (충전기 상태 실시간 업데이트)
// =============================================
function subscribeToChargers(onUpdate) {
  if (!db) return null;
  return db.channel('chargers-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chargers' }, payload => {
      const updated = payload.new;
      const idx = CHARGERS.findIndex(c => c.id === updated.id);
      if (idx !== -1) {
        CHARGERS[idx] = { ...CHARGERS[idx], ...updated, stationId: updated.station_id };
      }
      if (typeof onUpdate === 'function') onUpdate(updated);
    })
    .subscribe();
}

function subscribeToFaults(onInsert) {
  if (!db) return null;
  return db.channel('faults-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'faults' }, payload => {
      if (typeof onInsert === 'function') onInsert(payload.new);
    })
    .subscribe();
}
