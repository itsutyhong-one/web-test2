// Header scroll effect
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// =============================================
// D3 Korea Map — 실제 지리 좌표 기반 정확한 지도
// =============================================
function drawKoreaMap() {
  const svgEl = document.getElementById('koreaMapSvg');
  if (!svgEl || typeof d3 === 'undefined') return;

  const W = 320, H = 420;
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // 실제 지리 좌표 (WGS84) — 남한 본토 해안선 (단순화)
  const mainland = [
    [126.18, 37.74], [126.30, 37.89], [126.48, 37.95],
    [126.62, 37.83], [126.71, 37.68], [126.97, 37.85],
    [127.10, 38.00], [127.30, 38.12], [127.60, 38.18],
    [128.00, 38.30], [128.40, 38.30], [128.62, 38.18],
    [128.82, 38.10], [129.08, 37.92], [129.18, 37.62],
    [129.35, 37.28], [129.42, 36.95], [129.45, 36.52],
    [129.42, 36.20], [129.35, 35.90], [129.20, 35.60],
    [129.08, 35.35], [128.88, 35.22], [128.72, 35.08],
    [128.48, 35.06], [128.22, 34.95], [127.88, 34.82],
    [127.62, 34.72], [127.28, 34.60], [126.92, 34.48],
    [126.62, 34.42], [126.38, 34.50], [126.28, 34.62],
    [126.12, 34.76], [125.95, 35.00], [125.90, 35.18],
    [126.00, 35.40], [126.30, 35.60], [126.50, 35.82],
    [126.68, 36.02], [126.60, 36.28], [126.32, 36.52],
    [126.10, 36.68], [125.98, 36.85], [126.12, 37.02],
    [126.38, 37.12], [126.52, 37.32], [126.42, 37.52],
    [126.28, 37.62], [126.18, 37.74]
  ];

  // 제주도 좌표
  const jeju = [
    [126.15, 33.52], [126.35, 33.28], [126.60, 33.18],
    [126.88, 33.22], [127.00, 33.38], [126.92, 33.55],
    [126.62, 33.68], [126.32, 33.62], [126.15, 33.52]
  ];

  const collection = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { id: 'mainland' }, geometry: { type: 'Polygon', coordinates: [mainland] } },
      { type: 'Feature', properties: { id: 'jeju' }, geometry: { type: 'Polygon', coordinates: [jeju] } }
    ]
  };

  // 메르카토르 투영 — fitExtent로 viewBox에 딱 맞게 자동 스케일
  const projection = d3.geoMercator()
    .fitExtent([[18, 16], [W - 14, H - 16]], collection);
  const pathGen = d3.geoPath().projection(projection);
  const svg = d3.select(svgEl);

  // 본토
  svg.append('path')
    .datum(collection.features[0])
    .attr('class', 'korea-outline')
    .attr('d', pathGen);

  // 제주
  svg.append('path')
    .datum(collection.features[1])
    .attr('class', 'jeju-outline')
    .attr('d', pathGen);

  // 충전소 위치 (지리 좌표로 정확하게 배치)
  const stationDots = [
    // 서울/경기
    { lon: 127.00, lat: 37.57, r: 5 },   { lon: 127.20, lat: 37.65, r: 4 },
    { lon: 126.88, lat: 37.52, r: 4 },   { lon: 127.10, lat: 37.45, r: 4.5 },
    { lon: 127.32, lat: 37.40, r: 3.5 }, { lon: 126.95, lat: 37.70, r: 3.5 },
    { lon: 127.45, lat: 37.55, r: 4 },   { lon: 126.72, lat: 37.42, r: 3.5 },
    // 강원
    { lon: 127.90, lat: 37.88, r: 4.5 }, { lon: 128.55, lat: 37.75, r: 4 },
    { lon: 129.05, lat: 37.55, r: 3.5 }, { lon: 128.70, lat: 37.35, r: 3.5 },
    // 충청
    { lon: 127.05, lat: 36.88, r: 5 },   { lon: 127.38, lat: 36.68, r: 4.5 },
    { lon: 126.80, lat: 36.65, r: 4 },   { lon: 127.65, lat: 36.82, r: 3.5 },
    { lon: 126.68, lat: 36.48, r: 3.5 }, { lon: 127.18, lat: 36.45, r: 4 },
    // 전라
    { lon: 126.88, lat: 35.92, r: 5 },   { lon: 126.68, lat: 35.65, r: 4.5 },
    { lon: 126.42, lat: 35.55, r: 4 },   { lon: 127.02, lat: 35.38, r: 3.5 },
    { lon: 126.78, lat: 35.22, r: 4 },   { lon: 126.42, lat: 35.10, r: 3.5 },
    { lon: 126.98, lat: 34.98, r: 3.5 }, { lon: 126.58, lat: 34.82, r: 3.5 },
    // 경상
    { lon: 128.08, lat: 35.92, r: 5 },   { lon: 128.52, lat: 35.78, r: 4.5 },
    { lon: 128.32, lat: 35.60, r: 4 },   { lon: 128.72, lat: 35.58, r: 4 },
    { lon: 128.52, lat: 35.38, r: 4.5 }, { lon: 128.88, lat: 35.35, r: 3.5 },
    { lon: 128.22, lat: 35.18, r: 3.5 }, { lon: 128.62, lat: 35.25, r: 4 },
    { lon: 129.02, lat: 35.42, r: 3.5 },
    // 부산/경남
    { lon: 129.05, lat: 35.18, r: 5 },   { lon: 128.78, lat: 35.10, r: 4.5 },
    { lon: 129.18, lat: 35.28, r: 4 },   { lon: 128.52, lat: 34.98, r: 3.5 },
    // 광주/전남
    { lon: 126.85, lat: 35.18, r: 5 },   { lon: 126.95, lat: 34.98, r: 4 },
    { lon: 126.62, lat: 35.08, r: 3.5 }, { lon: 126.80, lat: 34.78, r: 3.5 },
    // 제주
    { lon: 126.48, lat: 33.52, r: 4.5 }, { lon: 126.72, lat: 33.42, r: 4 },
    { lon: 126.95, lat: 33.50, r: 3.5 }
  ];

  const jejuStart = stationDots.length - 3;
  stationDots.forEach((s, i) => {
    const [px, py] = projection([s.lon, s.lat]);
    svg.append('circle')
      .attr('class', i >= jejuStart ? 'station-jeju' : 'station')
      .attr('cx', px).attr('cy', py).attr('r', s.r);
  });

  // 지역 레이블
  const labels = [
    { lon: 127.05, lat: 37.55, text: '서울·경기' },
    { lon: 128.40, lat: 37.85, text: '강원' },
    { lon: 127.10, lat: 36.75, text: '충청' },
    { lon: 126.78, lat: 35.52, text: '전라' },
    { lon: 128.45, lat: 35.58, text: '경상' },
    { lon: 126.70, lat: 33.50, text: '제주' },
  ];
  labels.forEach(l => {
    const [px, py] = projection([l.lon, l.lat]);
    svg.append('text')
      .attr('class', 'map-region-label')
      .attr('x', px).attr('y', py + 14)
      .text(l.text);
  });
}

document.addEventListener('DOMContentLoaded', drawKoreaMap);
