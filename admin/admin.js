// =============================================
// MOCK DATA — Supabase 연결 시 이 데이터를 교체하세요
// =============================================

const STATIONS = [
  { id: 'ST001', name: '서울 강남 충전소', region: '서울', address: '서울시 강남구 테헤란로 123', lat: 37.5012, lng: 127.0396, chargerCount: 6, status: 'normal' },
  { id: 'ST002', name: '서울 마포 충전소', region: '서울', address: '서울시 마포구 상암동 456', lat: 37.5665, lng: 126.8927, chargerCount: 4, status: 'normal' },
  { id: 'ST003', name: '경기 분당 충전소', region: '경기', address: '경기도 성남시 분당구 판교로 78', lat: 37.3948, lng: 127.1114, chargerCount: 8, status: 'normal' },
  { id: 'ST004', name: '인천 송도 충전소', region: '인천', address: '인천시 연수구 송도대로 36', lat: 37.3883, lng: 126.6505, chargerCount: 6, status: 'normal' },
  { id: 'ST005', name: '부산 해운대 충전소', region: '부산', address: '부산시 해운대구 해운대해변로 10', lat: 35.1581, lng: 129.1600, chargerCount: 6, status: 'fault' },
  { id: 'ST006', name: '대구 수성 충전소', region: '대구', address: '대구시 수성구 달구벌대로 234', lat: 35.8317, lng: 128.6301, chargerCount: 4, status: 'normal' },
  { id: 'ST007', name: '광주 상무 충전소', region: '광주', address: '광주시 서구 상무대로 567', lat: 35.1527, lng: 126.8490, chargerCount: 4, status: 'normal' },
  { id: 'ST008', name: '대전 유성 충전소', region: '대전', address: '대전시 유성구 대학로 99', lat: 36.3622, lng: 127.3567, chargerCount: 4, status: 'normal' },
  { id: 'ST009', name: '강원 춘천 충전소', region: '강원', address: '강원도 춘천시 중앙로 55', lat: 37.8813, lng: 127.7298, chargerCount: 2, status: 'normal' },
  { id: 'ST010', name: '제주 제주시 충전소', region: '제주', address: '제주시 연동 330', lat: 33.5091, lng: 126.4926, chargerCount: 4, status: 'normal' },
];

const CHARGER_TYPES = ['초급속 350kW', '급속 100kW', '완속 7kW'];
const CHARGER_STATUSES = ['available', 'charging', 'fault', 'offline', 'maintenance'];

// 충전기 데이터 자동 생성
const CHARGERS = [];
let chargerIdSeq = 1;
STATIONS.forEach(st => {
  for (let i = 1; i <= st.chargerCount; i++) {
    const type = i <= Math.floor(st.chargerCount * 0.6) ? '초급속 350kW' : i <= Math.floor(st.chargerCount * 0.85) ? '급속 100kW' : '완속 7kW';
    const statusPool = st.status === 'fault' && i === 1
      ? 'fault'
      : ['available', 'available', 'available', 'charging', 'charging', 'offline'][Math.floor(Math.random() * 6)];
    CHARGERS.push({
      id: 'CHG' + String(chargerIdSeq++).padStart(4, '0'),
      stationId: st.id,
      stationName: st.name,
      port: `${i}번 포트`,
      type,
      status: statusPool,
      chargePercent: statusPool === 'charging' ? Math.floor(Math.random() * 80) + 10 : null,
      connectedVehicle: statusPool === 'charging' ? `${['12가', '34나', '56다', '78라', '90마'][Math.floor(Math.random()*5)]}${Math.floor(1000+Math.random()*9000)}` : null,
      lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 600000)).toISOString(),
    });
  }
});

// 충전 내역 샘플
const HISTORY = Array.from({ length: 80 }, (_, i) => {
  const st = STATIONS[Math.floor(Math.random() * STATIONS.length)];
  const charger = CHARGERS.filter(c => c.stationId === st.id)[0];
  const kwh = +(Math.random() * 60 + 5).toFixed(2);
  const rate = [275, 310, 400][Math.floor(Math.random() * 3)];
  const start = new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000 - Math.floor(Math.random() * 86400000));
  const duration = Math.floor(Math.random() * 50) + 5;
  return {
    id: 'HIS' + String(i + 1).padStart(5, '0'),
    stationName: st.name,
    chargerId: charger ? charger.id : 'CHG0001',
    vehicle: `${['12가', '34나', '56다', '78라', '90마'][Math.floor(Math.random()*5)]}${Math.floor(1000+Math.random()*9000)}`,
    startTime: start.toISOString(),
    duration,
    kwh,
    amount: Math.round(kwh * rate),
    memberType: ['회원', '비회원'][Math.floor(Math.random()*2)],
  };
}).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

// 고장 내역
const FAULTS = [
  { id: 'FLT001', chargerId: 'CHG0013', stationName: '부산 해운대 충전소', type: '통신 오류', severity: 'high', status: '처리중', reportedAt: '2026-05-26 14:32', desc: '충전기와 서버 간 통신 단절. 충전 불가 상태.' },
  { id: 'FLT002', chargerId: 'CHG0008', stationName: '경기 분당 충전소', type: '커넥터 불량', severity: 'medium', status: '완료', reportedAt: '2026-05-24 09:15', desc: 'CCS1 커넥터 잠금 장치 고장으로 충전 중단.' },
  { id: 'FLT003', chargerId: 'CHG0021', stationName: '대구 수성 충전소', type: '전원 이상', severity: 'low', status: '접수', reportedAt: '2026-05-25 18:00', desc: '전원부 전압 불안정 알람 발생.' },
];

// 공지사항 (대민 페이지에 반영)
const NOTICES = [
  { id: 'NTC001', title: '2026년 상반기 신규 충전소 20개소 추가 오픈 안내', category: '공지', status: '게시중', author: '관리자', createdAt: '2026-05-20', content: '안녕하세요. KDN Charge입니다. 2026년 상반기 신규 충전소 20개소가 추가 오픈됩니다.' },
  { id: 'NTC002', title: 'KDN Charge 앱 v3.2 업데이트 안내', category: '공지', status: '게시중', author: '관리자', createdAt: '2026-05-10', content: '앱 v3.2 업데이트에서 충전 예약 기능이 추가되었습니다.' },
  { id: 'NTC003', title: '고속도로 휴게소 충전소 정기 점검 일정 안내', category: '점검', status: '게시중', author: '관리자', createdAt: '2026-04-30', content: '5월 정기 점검 일정을 안내드립니다.' },
  { id: 'NTC004', title: '신규 회원 가입 이벤트 — 첫 충전 50% 할인 쿠폰 증정', category: '이벤트', status: '게시중', author: '관리자', createdAt: '2026-04-15', content: '신규 회원 가입 이벤트를 진행합니다.' },
  { id: 'NTC005', title: '프리미엄 회원 요금 개편 안내', category: '공지', status: '예약', author: '관리자', createdAt: '2026-04-01', content: '2026.05.01부터 프리미엄 회원 요금이 개편됩니다.' },
];

async function initData() {
  const [stations, chargers, history, faults, notices] = await Promise.all([
    getStations(), getChargers(), getHistory(), getFaults(), getNotices()
  ]);
  STATIONS.length = 0; STATIONS.push(...stations);
  CHARGERS.length = 0; CHARGERS.push(...chargers);
  HISTORY.length  = 0; HISTORY.push(...history);
  FAULTS.length   = 0; FAULTS.push(...faults);
  NOTICES.length  = 0; NOTICES.push(...notices);
  // recalculate chargerCount per station
  const countMap = {};
  CHARGERS.forEach(c => { countMap[c.stationId] = (countMap[c.stationId] || 0) + 1; });
  STATIONS.forEach(s => { s.chargerCount = countMap[s.id] || 0; });
}

// =============================================
// UTILS
// =============================================

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
}

function formatKrw(n) {
  return n.toLocaleString('ko-KR') + '원';
}

function statusBadge(status) {
  const map = {
    available: ['badge-available', '충전 가능'],
    charging:  ['badge-charging',  '충전 중'],
    fault:     ['badge-fault',     '고장'],
    offline:   ['badge-offline',   '오프라인'],
    maintenance:['badge-maintenance','점검 중'],
  };
  const [cls, label] = map[status] || ['badge-offline', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer') || (() => {
    const el = document.createElement('div');
    el.id = 'toastContainer';
    el.className = 'toast-container';
    document.body.appendChild(el);
    return el;
  })();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function setActive(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

function updateTopbarDate() {
  const el = document.getElementById('topbarDate');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' });
    setInterval(() => {
      el.textContent = new Date().toLocaleString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' });
    }, 1000);
  }
}

// =============================================
// SIDEBAR HTML (공통 삽입)
// =============================================
function getSidebarHTML(activePage) {
  const navItems = [
    { page: 'dashboard', icon: '📊', label: '대시보드', href: 'index.html' },
    { page: 'stations', icon: '📍', label: '충전소 관리', href: 'stations.html' },
    { page: 'realtime', icon: '⚡', label: '실시간 현황', href: 'realtime.html', badge: null },
    { page: 'history', icon: '📋', label: '충전 내역', href: 'history.html' },
    { page: 'fault', icon: '🔧', label: '고장 등록', href: 'fault.html', badge: FAULTS.filter(f=>f.status==='접수').length },
    { page: 'notices', icon: '📢', label: '공지사항 관리', href: 'notices.html' },
    { page: 'ai-chat', icon: '🤖', label: 'AI 고장진단', href: 'ai-chat.html' },
  ];
  return `
    <div class="sidebar-logo">
      <span class="logo-icon">⚡</span>
      <span class="logo-text">KDN<span class="logo-accent">Charge</span></span>
      <span class="logo-badge">관리자</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">메인 메뉴</div>
      ${navItems.filter(i => i.page !== 'ai-chat').map(item => `
        <a href="${item.href}" class="nav-item${activePage === item.page ? ' active' : ''}" data-page="${item.page}">
          <span class="nav-icon">${item.icon}</span>
          ${item.label}
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </a>
      `).join('')}
      <div class="nav-section-label" style="margin-top:8px;">AI 도구</div>
      <a href="ai-chat.html" class="nav-item${activePage === 'ai-chat' ? ' active' : ''}" data-page="ai-chat">
        <span class="nav-icon">🤖</span>
        AI 고장진단
      </a>
    </nav>
    <div class="sidebar-footer">
      <a href="../index.html" class="sidebar-back-btn">← 대민 홈페이지로</a>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  // 공통 사이드바 마운트
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const page = document.body.dataset.page || 'dashboard';
    sidebar.innerHTML = getSidebarHTML(page);
  }
  updateTopbarDate();
  // 모달 닫기
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
});
