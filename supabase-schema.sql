-- =============================================
-- KDN Charge 운영시스템 Supabase 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요
-- =============================================

-- 1. 충전소 테이블
CREATE TABLE IF NOT EXISTS stations (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  region      TEXT NOT NULL,
  address     TEXT NOT NULL,
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  status      TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal','fault')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 충전기 테이블
CREATE TABLE IF NOT EXISTS chargers (
  id                TEXT PRIMARY KEY,
  station_id        TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  port              TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('초급속 350kW','급속 100kW','완속 7kW')),
  status            TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('available','charging','fault','offline','maintenance')),
  charge_percent    INTEGER CHECK (charge_percent BETWEEN 0 AND 100),
  connected_vehicle TEXT,
  last_update       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 충전 내역 테이블
CREATE TABLE IF NOT EXISTS charging_history (
  id               TEXT PRIMARY KEY,
  station_id       TEXT NOT NULL REFERENCES stations(id),
  charger_id       TEXT NOT NULL REFERENCES chargers(id),
  vehicle          TEXT NOT NULL,
  start_time       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER NOT NULL,
  kwh              DOUBLE PRECISION NOT NULL,
  amount           INTEGER NOT NULL,
  member_type      TEXT NOT NULL DEFAULT '비회원' CHECK (member_type IN ('회원','비회원')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 고장 내역 테이블
CREATE TABLE IF NOT EXISTS faults (
  id           TEXT PRIMARY KEY,
  station_id   TEXT NOT NULL REFERENCES stations(id),
  charger_id   TEXT NOT NULL REFERENCES chargers(id),
  type         TEXT NOT NULL,
  severity     TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  status       TEXT NOT NULL DEFAULT '접수' CHECK (status IN ('접수','처리중','완료')),
  description  TEXT NOT NULL,
  action_taken TEXT,
  reported_at  TIMESTAMPTZ DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

-- 5. 공지사항 테이블
CREATE TABLE IF NOT EXISTS notices (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT '공지' CHECK (category IN ('공지','이벤트','점검')),
  status       TEXT NOT NULL DEFAULT '미게시' CHECK (status IN ('게시중','예약','미게시')),
  author       TEXT NOT NULL DEFAULT '관리자',
  is_pinned    BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 인덱스
-- =============================================
CREATE INDEX IF NOT EXISTS idx_chargers_station ON chargers(station_id);
CREATE INDEX IF NOT EXISTS idx_chargers_status  ON chargers(status);
CREATE INDEX IF NOT EXISTS idx_history_station  ON charging_history(station_id);
CREATE INDEX IF NOT EXISTS idx_history_time     ON charging_history(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_faults_status    ON faults(status);
CREATE INDEX IF NOT EXISTS idx_notices_status   ON notices(status);

-- =============================================
-- Row Level Security (필요 시 활성화)
-- =============================================
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE charging_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE faults ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (대민 페이지용)
CREATE POLICY "공개 읽기 - stations"  ON stations  FOR SELECT USING (true);
CREATE POLICY "공개 읽기 - chargers"  ON chargers  FOR SELECT USING (true);
CREATE POLICY "공개 읽기 - notices"   ON notices   FOR SELECT USING (status = '게시중');

-- 관리자 전체 권한 (anon 키로 운영 — 추후 Auth 도입 시 교체)
CREATE POLICY "관리자 전체권한 - stations"  ON stations  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "관리자 전체권한 - chargers"  ON chargers  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "관리자 전체권한 - history"   ON charging_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "관리자 전체권한 - faults"    ON faults    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "관리자 전체권한 - notices"   ON notices   FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 시드 데이터 (초기 충전소 10개소)
-- =============================================
INSERT INTO stations (id, name, region, address, lat, lng) VALUES
  ('ST001','서울 강남 충전소','서울','서울시 강남구 테헤란로 123',37.5012,127.0396),
  ('ST002','서울 마포 충전소','서울','서울시 마포구 상암동 456',37.5665,126.8927),
  ('ST003','경기 분당 충전소','경기','경기도 성남시 분당구 판교로 78',37.3948,127.1114),
  ('ST004','인천 송도 충전소','인천','인천시 연수구 송도대로 36',37.3883,126.6505),
  ('ST005','부산 해운대 충전소','부산','부산시 해운대구 해운대해변로 10',35.1581,129.1600),
  ('ST006','대구 수성 충전소','대구','대구시 수성구 달구벌대로 234',35.8317,128.6301),
  ('ST007','광주 상무 충전소','광주','광주시 서구 상무대로 567',35.1527,126.8490),
  ('ST008','대전 유성 충전소','대전','대전시 유성구 대학로 99',36.3622,127.3567),
  ('ST009','강원 춘천 충전소','강원','강원도 춘천시 중앙로 55',37.8813,127.7298),
  ('ST010','제주 제주시 충전소','제주','제주시 연동 330',33.5091,126.4926)
ON CONFLICT (id) DO NOTHING;
