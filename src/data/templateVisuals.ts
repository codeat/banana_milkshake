/**
 * Copyright 2026 Google LLC
 * High-fidelity, self-contained SVG creative previews for Banana Milkshake templates.
 * Clean, modern Google flat-vector design with realistic ad badges, gradients, and product silhouettes.
 */

function makeSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const TEMPLATE_VISUALS = {
  streetSnap: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_street" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="neon_street" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
    <linearGradient id="jacket_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_street)"/>
  <!-- City Skyline Silhouette -->
  <path d="M40 380 L40 220 L90 220 L90 380 L130 380 L130 180 L190 180 L190 380 L230 380 L230 250 L270 250 L270 380 L350 380 L350 200 L410 200 L410 380 L470 380 L470 230 L520 230 L520 380 L560 380 L560 260 L600 260 L600 380 Z" fill="#1E293B" opacity="0.6"/>
  <!-- Street Perspective Lines -->
  <polygon points="120,450 480,450 330,300 270,300" fill="#0B0F19" opacity="0.8"/>
  <line x1="300" y1="300" x2="300" y2="450" stroke="#FDE047" stroke-width="4" stroke-dasharray="16,16"/>
  <!-- Model Silhouette in Stylish Streetwear -->
  <g transform="translate(300, 240)">
    <!-- Head & Cap -->
    <circle cx="0" cy="-60" r="16" fill="#FCD34D"/>
    <path d="M-16 -66 Q0 -74 20 -62" stroke="#1E293B" stroke-width="6" fill="none"/>
    <!-- Jacket / Hoodie -->
    <path d="M-28 -40 Q0 -48 28 -40 L34 25 L-34 25 Z" fill="url(#jacket_grad)"/>
    <!-- Cargo Pants -->
    <path d="M-22 25 L-14 95 L-4 95 L-6 30 L6 30 L4 95 L14 95 L22 25 Z" fill="#0284C7"/>
    <!-- Sneakers -->
    <rect x="-18" y="95" width="16" height="8" rx="3" fill="#FFFFFF"/>
    <rect x="2" y="95" width="16" height="8" rx="3" fill="#FFFFFF"/>
  </g>
  <!-- Badges & UI Overlays -->
  <rect x="30" y="30" width="110" height="28" rx="6" fill="#EF4444"/>
  <text x="85" y="49" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">🔥 潮流爆款</text>
  <rect x="440" y="30" width="130" height="28" rx="6" fill="rgba(255,255,255,0.15)"/>
  <text x="505" y="49" fill="#F8FAFC" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" text-anchor="middle">4:3 黄金街拍</text>
  <!-- Text Label -->
  <text x="30" y="410" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">街头潮流街拍 · STREET SNAP</text>
  <text x="30" y="432" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">为服饰鞋帽一键合成真实都市商业街景与自然动态光影</text>
</svg>
`),

  virtualTryOn: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_tryon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF5FF"/>
      <stop offset="100%" stop-color="#F3E8FF"/>
    </linearGradient>
    <linearGradient id="dress_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EC4899"/>
      <stop offset="100%" stop-color="#BE185D"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_tryon)"/>
  <!-- Minimalist Studio Mirror / Arch -->
  <path d="M210 100 Q300 30 390 100 L390 390 L210 390 Z" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="3"/>
  <!-- Studio Softbox Light Stand -->
  <line x1="120" y1="140" x2="120" y2="390" stroke="#CBD5E1" stroke-width="4"/>
  <polygon points="100,140 140,110 160,170 120,180" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
  <!-- Mannequin / Fashion Model -->
  <g transform="translate(300, 230)">
    <circle cx="0" cy="-65" r="16" fill="#FBCFE8"/>
    <!-- Elegant Blazer / Dress -->
    <path d="M-26 -40 Q0 -46 26 -40 L38 40 L16 80 L-16 80 L-38 40 Z" fill="url(#dress_grad)"/>
    <polygon points="-12,-40 0,-15 12,-40 0,-30" fill="#FFFFFF"/>
    <!-- Legs -->
    <line x1="-8" y1="80" x2="-8" y2="135" stroke="#FBCFE8" stroke-width="7"/>
    <line x1="8" y1="80" x2="8" y2="135" stroke="#FBCFE8" stroke-width="7"/>
    <!-- High Heels -->
    <polygon points="-14,135 -2,135 -6,145" fill="#831843"/>
    <polygon points="2,135 14,135 10,145" fill="#831843"/>
  </g>
  <!-- Badges -->
  <rect x="30" y="30" width="115" height="28" rx="6" fill="#A855F7"/>
  <text x="87" y="49" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">✨ 模特试衣</text>
  <rect x="450" y="30" width="120" height="28" rx="6" fill="#FFFFFF" stroke="#E9D5FF"/>
  <text x="510" y="49" fill="#7E22CE" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" text-anchor="middle">1:1 方形大片</text>
  <!-- Label -->
  <text x="30" y="410" fill="#1E293B" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">虚拟模特穿搭 · VIRTUAL TRY-ON</text>
  <text x="30" y="432" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">服饰商品自动提取，逼真上身模特试穿并保留真实剪裁细节</text>
</svg>
`),

  brandGuideline: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#312E81"/>
    </linearGradient>
    <linearGradient id="gold_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_brand)"/>
  <!-- Geometric Design Grid -->
  <rect x="50" y="80" width="500" height="270" rx="12" fill="#2E1065" stroke="#6366F1" stroke-width="2" stroke-dasharray="6,6" opacity="0.7"/>
  <!-- Layout Color Swatches -->
  <circle cx="90" cy="120" r="14" fill="#38BDF8"/>
  <circle cx="125" cy="120" r="14" fill="#F43F5E"/>
  <circle cx="160" cy="120" r="14" fill="#FBBF24"/>
  <!-- Pedestal with Product Serum Bottle -->
  <g transform="translate(300, 210)">
    <ellipse cx="0" cy="60" rx="65" ry="16" fill="#4338CA"/>
    <ellipse cx="0" cy="55" rx="60" ry="14" fill="#6366F1"/>
    <!-- Bottle -->
    <rect x="-24" y="-30" width="48" height="80" rx="8" fill="url(#gold_grad)"/>
    <rect x="-12" y="-52" width="24" height="24" rx="4" fill="#FFFFFF"/>
    <rect x="-8" y="-62" width="16" height="12" rx="3" fill="#D97706"/>
    <!-- Highlights -->
    <line x1="-16" y1="-20" x2="-16" y2="40" stroke="#FEF3C7" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  </g>
  <!-- Typographic Layout Blocks -->
  <rect x="390" y="150" width="130" height="14" rx="3" fill="#E0E7FF"/>
  <rect x="390" y="174" width="100" height="10" rx="2" fill="#A5B4FC"/>
  <rect x="390" y="210" width="90" height="26" rx="5" fill="#F43F5E"/>
  <text x="435" y="227" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SHOP NOW</text>
  <!-- Badges -->
  <rect x="30" y="30" width="115" height="28" rx="6" fill="#3B82F6"/>
  <text x="87" y="49" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">🎨 品牌定制</text>
  <!-- Label -->
  <text x="30" y="410" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">品牌规范延展 · BRAND GUIDELINE</text>
  <text x="30" y="432" fill="#C7D2FE" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">严格遵循企业品牌调性与配色规范，生成商业级广告大片</text>
</svg>
`),

  multiProduct: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_multi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#042F2E"/>
      <stop offset="100%" stop-color="#115E59"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_multi)"/>
  <!-- 3 Presentation Podiums -->
  <!-- Left Podium (Headphones) -->
  <g transform="translate(160, 240)">
    <ellipse cx="0" cy="50" rx="50" ry="14" fill="#0F766E"/>
    <rect x="-25" y="-10" width="50" height="50" rx="8" fill="#14B8A6"/>
    <circle cx="0" cy="15" r="14" fill="#042F2E"/>
    <text x="0" y="45" fill="#CCFBF1" font-size="10" text-anchor="middle">SKU #1</text>
  </g>
  <!-- Center Main Podium (Smartwatch) -->
  <g transform="translate(300, 200)">
    <ellipse cx="0" cy="70" rx="65" ry="18" fill="#0D9488"/>
    <rect x="-30" y="-30" width="60" height="80" rx="12" fill="#F59E0B"/>
    <circle cx="0" cy="10" r="20" fill="#1E293B"/>
    <text x="0" y="15" fill="#38BDF8" font-size="10" text-anchor="middle">10:09</text>
    <text x="0" y="65" fill="#FEF3C7" font-size="11" font-weight="bold" text-anchor="middle">PRIMARY</text>
  </g>
  <!-- Right Podium (Wireless Earbuds Case) -->
  <g transform="translate(440, 240)">
    <ellipse cx="0" cy="50" rx="50" ry="14" fill="#0F766E"/>
    <rect x="-22" y="0" width="44" height="40" rx="10" fill="#38BDF8"/>
    <text x="0" y="45" fill="#E0F2FE" font-size="10" text-anchor="middle">SKU #3</text>
  </g>
  <!-- Badges -->
  <rect x="30" y="30" width="115" height="28" rx="6" fill="#14B8A6"/>
  <text x="87" y="49" fill="#042F2E" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">📦 多物料组合</text>
  <rect x="440" y="30" width="130" height="28" rx="6" fill="rgba(255,255,255,0.15)"/>
  <text x="505" y="49" fill="#CCFBF1" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" text-anchor="middle">16:9 横版宽屏</text>
  <!-- Label -->
  <text x="30" y="410" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">多商品组合大片 · MULTI-PRODUCT</text>
  <text x="30" y="432" fill="#A7F3D0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">支持同一构图中并列协同摆放 3 组产品，自动平衡景深与透视</text>
</svg>
`),

  holidaySeason: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_holiday" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#881337"/>
      <stop offset="60%" stop-color="#4C0519"/>
      <stop offset="100%" stop-color="#1C0208"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_holiday)"/>
  <!-- Sparkles & Stars -->
  <circle cx="100" cy="120" r="3" fill="#FDE047"/>
  <circle cx="480" cy="100" r="4" fill="#FDE047"/>
  <circle cx="520" cy="220" r="3" fill="#FDE047"/>
  <circle cx="130" cy="260" r="4" fill="#FDE047"/>
  <!-- Luxury Festive Gift Box with Golden Ribbons -->
  <g transform="translate(300, 230)">
    <rect x="-65" y="-30" width="130" height="110" rx="8" fill="#BE123C" stroke="#FDA4AF" stroke-width="2"/>
    <!-- Gold Ribbon Vertical & Horizontal -->
    <rect x="-14" y="-30" width="28" height="110" fill="#FBBF24"/>
    <rect x="-65" y="20" width="130" height="24" fill="#FBBF24"/>
    <!-- Ribbon Bow -->
    <ellipse cx="-20" cy="-42" rx="20" ry="12" fill="#F59E0B" transform="rotate(-20,-20,-42)"/>
    <ellipse cx="20" cy="-42" rx="20" ry="12" fill="#F59E0B" transform="rotate(20,20,-42)"/>
    <circle cx="0" cy="-35" r="10" fill="#D97706"/>
    <!-- Sale Tag -->
    <polygon points="50,60 90,60 110,80 90,100 50,100" fill="#FDE047"/>
    <circle cx="65" cy="80" r="4" fill="#713F12"/>
    <text x="85" y="85" fill="#713F12" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">50%</text>
  </g>
  <!-- Badges -->
  <rect x="30" y="30" width="115" height="28" rx="6" fill="#F43F5E"/>
  <text x="87" y="49" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">🎁 节日大促</text>
  <!-- Label -->
  <text x="30" y="410" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">节日大促营销 · HOLIDAY SEASON</text>
  <text x="30" y="432" fill="#FECDD3" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">黑五、圣诞、新年节日氛围渲染，自带礼品包装与促销光效</text>
</svg>
`),

  adResizer: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_resizer" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="60%" stop-color="#172554"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_resizer)"/>
  <!-- Multi-size Screen Frames Mockup -->
  <!-- 970x250 Billboard Top -->
  <rect x="60" y="90" width="480" height="45" rx="6" fill="rgba(255,255,255,0.1)" stroke="#38BDF8" stroke-width="2"/>
  <text x="80" y="118" fill="#38BDF8" font-size="11" font-weight="bold">970 x 250 (Billboard)</text>
  <rect x="420" y="100" width="100" height="24" rx="4" fill="#38BDF8"/>
  <text x="470" y="116" fill="#0F172A" font-size="10" font-weight="bold" text-anchor="middle">AD BANNER</text>
  <!-- 300x250 Medium Rectangle -->
  <rect x="60" y="155" width="220" height="150" rx="8" fill="rgba(255,255,255,0.08)" stroke="#818CF8" stroke-width="2"/>
  <text x="80" y="185" fill="#818CF8" font-size="11" font-weight="bold">300 x 250 (Square Feed)</text>
  <!-- 160x600 Skyscraper (scaled) -->
  <rect x="300" y="155" width="100" height="150" rx="8" fill="rgba(255,255,255,0.08)" stroke="#F43F5E" stroke-width="2"/>
  <text x="350" y="235" fill="#F43F5E" font-size="11" font-weight="bold" text-anchor="middle">160x600</text>
  <!-- 300x600 Half Page -->
  <rect x="420" y="155" width="120" height="150" rx="8" fill="rgba(255,255,255,0.12)" stroke="#10B981" stroke-width="2"/>
  <text x="480" y="235" fill="#10B981" font-size="11" font-weight="bold" text-anchor="middle">300x600</text>
  <!-- Badges -->
  <rect x="30" y="30" width="130" height="28" rx="6" fill="#0284C7"/>
  <text x="95" y="49" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">📐 6大版位适配</text>
  <rect x="430" y="30" width="140" height="28" rx="6" fill="rgba(56,189,248,0.2)" stroke="#38BDF8"/>
  <text x="500" y="49" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Pica Lanczos3 算法</text>
  <!-- Label -->
  <text x="30" y="410" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">智能广告尺寸重构 · AD IMAGE RESIZER</text>
  <text x="30" y="432" fill="#93C5FD" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">一图自适应扩展至 Google Ads 6 大标准投放版位，智能保留主体</text>
</svg>
`),

  studioProduct: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_studio" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="metal_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#64748B"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_studio)"/>
  <!-- Marble Pedestal Studio Floor -->
  <ellipse cx="300" cy="310" rx="140" ry="35" fill="#CBD5E1"/>
  <ellipse cx="300" cy="300" rx="135" ry="30" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Camera / High-end Watch or Product -->
  <g transform="translate(300, 220)">
    <rect x="-40" y="-30" width="80" height="60" rx="10" fill="url(#metal_grad)"/>
    <circle cx="0" cy="0" r="22" fill="#0F172A" stroke="#E2E8F0" stroke-width="4"/>
    <circle cx="0" cy="0" r="16" fill="#1E293B"/>
    <circle cx="-5" cy="-5" r="5" fill="#38BDF8" opacity="0.8"/>
  </g>
  <!-- Badges -->
  <rect x="30" y="30" width="115" height="28" rx="6" fill="#64748B"/>
  <text x="87" y="49" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">📸 影棚精修</text>
  <!-- Label -->
  <text x="30" y="410" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">标准商品静物精修 · STUDIO PRODUCT</text>
  <text x="30" y="432" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">极简纯净影棚光影，高清呈现商品材质按键与五金质感</text>
</svg>
`),

  textToModel: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_textmodel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14532D"/>
      <stop offset="100%" stop-color="#052E16"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_textmodel)"/>
  <!-- Floating Text & Prompt Chips -->
  <rect x="50" y="90" width="220" height="32" rx="8" fill="rgba(255,255,255,0.15)"/>
  <text x="70" y="111" fill="#86EFAC" font-size="12" font-weight="bold">✨ Prompt: 欧洲名模 · 晨光穿搭</text>
  <rect x="50" y="135" width="180" height="28" rx="6" fill="rgba(255,255,255,0.1)"/>
  <text x="70" y="154" fill="#BBF7D0" font-size="11">📸 4K 超写实商业摄影</text>
  <!-- Stylized Model -->
  <g transform="translate(420, 220)">
    <circle cx="0" cy="-55" r="22" fill="#FDE047"/>
    <path d="M-30 -25 Q0 -35 30 -25 L40 60 L-40 60 Z" fill="#22C55E"/>
    <line x1="-15" y1="60" x2="-15" y2="130" stroke="#FDE047" stroke-width="8"/>
    <line x1="15" y1="60" x2="15" y2="130" stroke="#FDE047" stroke-width="8"/>
  </g>
  <!-- Badges -->
  <rect x="30" y="30" width="115" height="28" rx="6" fill="#16A34A"/>
  <text x="87" y="49" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">💡 文生图大片</text>
  <!-- Label -->
  <text x="30" y="410" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">文案驱动模特大片 · TEXT TO MODEL</text>
  <text x="30" y="432" fill="#86EFAC" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">零底图门槛，仅凭提示词生成多国籍真人模特穿搭海报</text>
</svg>
`),

  textOnly: makeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg_textonly" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#022C22"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg_textonly)"/>
  <g transform="translate(300, 200)">
    <rect x="-140" y="-50" width="280" height="100" rx="16" fill="rgba(255,255,255,0.1)" stroke="#34D399" stroke-width="2"/>
    <text x="0" y="0" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="bold" text-anchor="middle">PROMPT TO AD</text>
    <text x="0" y="26" fill="#A7F3D0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" text-anchor="middle">纯文本提示词直出商用物料</text>
  </g>
  <!-- Badges -->
  <rect x="30" y="30" width="115" height="28" rx="6" fill="#059669"/>
  <text x="87" y="49" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">⚡ 纯文生图</text>
  <!-- Label -->
  <text x="30" y="410" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">纯文本创意直出 · PURE TEXT AD</text>
  <text x="30" y="432" fill="#6EE7B7" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13">无需任何已有素材，直接基于自然语言生成商业摄影级视觉</text>
</svg>
`)
};
