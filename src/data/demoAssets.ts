/**
 * Copyright 2026 Google LLC
 * Production-grade sample product and brand logo demo assets for instant 1-click testing.
 */

function svgToDataUrl(svg: string): string {
  const base64 = btoa(unescape(encodeURIComponent(svg.trim())));
  return `data:image/svg+xml;base64,${base64}`;
}

export interface DemoProduct {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  icon: string;
  dataUrl: string;
  recommendedPrompt: string;
}

export interface DemoLogo {
  id: string;
  name: string;
  nameEn?: string;
  category?: string;
  icon: string;
  dataUrl: string;
}

export interface DemoModel {
  id: string;
  name: string;
  nameEn: string;
  styleTag: string;
  icon: string;
  dataUrl: string;
}

export const DEMO_MODELS: DemoModel[] = [
  {
    id: 'model-parisian-chic',
    name: '🇫🇷 巴黎高定街拍女模 (驼色羊绒大衣 · 优雅冷艳)',
    nameEn: '🇫🇷 Parisian Haute Couture Female (Camel Coat · Chic)',
    styleTag: '高奢街拍 / 香水皮具',
    icon: '🇫🇷',
    dataUrl: '/models/model_01_parisian_chic.jpg',
  },
  {
    id: 'model-asian-luxury',
    name: '🇨🇳 东方高奢时尚女模 (香槟丝绸礼服 · 清冷高级感)',
    nameEn: '🇨🇳 East Asian Luxury Female (Champagne Silk · Editorial)',
    styleTag: '高定美妆 / 珠宝腕表',
    icon: '🇨🇳',
    dataUrl: '/models/model_02_asian_luxury_female.jpg',
  },
  {
    id: 'model-milan-gentleman',
    name: '🇮🇹 米兰绅士男模 (高定炭灰西装 · 成熟雅痞)',
    nameEn: '🇮🇹 Milanese Tailored Gentleman (Charcoal Suit · Classic)',
    styleTag: '男士精品 / 腕表香氛',
    icon: '🇮🇹',
    dataUrl: '/models/model_03_milan_gentleman.jpg',
  },
  {
    id: 'model-asian-trendy-male',
    name: '🇰🇷 亚洲都市潮流男模 (极简米白针织 · 清爽阳光)',
    nameEn: '🇰🇷 Asian Urban Trendy Male (Cream Knitwear · Fresh)',
    styleTag: '数码潮品 / 精品咖啡',
    icon: '🇰🇷',
    dataUrl: '/models/model_04_asian_trendy_male.jpg',
  },
  {
    id: 'model-athletic-runner',
    name: '🏃‍♀️ 专业运动健康女模 (曜石黑运动装 · 动感张力)',
    nameEn: '🏃‍♀️ Pro Athletic Fitness Model (Obsidian Sportswear)',
    styleTag: '运动跑鞋 / 机能穿戴',
    icon: '🏃‍♀️',
    dataUrl: '/models/model_05_athletic_runner.jpg',
  },
  {
    id: 'model-nordic-muse',
    name: '🌿 北欧极简护肤缪斯 (清透裸妆水光肌 · 自然晨光)',
    nameEn: '🌿 Nordic Minimalist Skincare Muse (Dewy Skin · Morning Light)',
    styleTag: '植萃护肤 / 纯净美妆',
    icon: '🌿',
    dataUrl: '/models/model_06_nordic_skincare_muse.jpg',
  },
  {
    id: 'model-cyber-icon',
    name: '⚡ 新世代先锋机能潮人 (银灰金属机能风 · 赛博霓虹)',
    nameEn: '⚡ Gen-Z Avant-Garde Cyber Icon (Silver Techwear · Neon)',
    styleTag: '潮流耳机 / 先锋球鞋',
    icon: '⚡',
    dataUrl: '/models/model_07_cyber_street_icon.jpg',
  },
  {
    id: 'model-mediterranean-resort',
    name: '🏖️ 地中海度假风女模 (亚麻白衬衫 · 黄金海岸暖阳)',
    nameEn: '🏖️ Mediterranean Resort Model (White Linen · Golden Sun)',
    styleTag: '假日香氛 / 生活方式',
    icon: '🏖️',
    dataUrl: '/models/model_08_mediterranean_resort.jpg',
  },
];

// Legacy SVG fallbacks kept unused for reference
const perfumeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5eb" stop-opacity="0.95"/>
      <stop offset="40%" stop-color="#ffd8a8" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#e8590c" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffd43b"/>
      <stop offset="50%" stop-color="#fff9db"/>
      <stop offset="100%" stop-color="#f59f00"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a1a24"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad)" />
  <circle cx="300" cy="340" r="160" fill="#f08c00" opacity="0.15" filter="url(#glow)"/>
  
  <!-- Perfume Cap -->
  <rect x="250" y="140" width="100" height="70" rx="8" fill="url(#capGrad)" stroke="#fab005" stroke-width="2"/>
  <rect x="280" y="210" width="40" height="25" fill="#f59f00"/>
  
  <!-- Perfume Glass Body -->
  <path d="M 180 240 C 180 235, 185 235, 230 235 L 370 235 C 415 235, 420 235, 420 240 L 410 490 C 410 500, 400 505, 390 505 L 210 505 C 200 505, 190 500, 190 490 Z" 
        fill="url(#glassGrad)" stroke="#ffe8cc" stroke-width="3" filter="url(#glow)"/>
  
  <!-- Liquid Level -->
  <path d="M 195 300 Q 300 310 405 300 L 400 485 C 400 495, 395 498, 385 498 L 215 498 C 205 498, 200 495, 200 485 Z" fill="#d9480f" opacity="0.65"/>
  
  <!-- Label Badge -->
  <rect x="230" y="340" width="140" height="90" rx="4" fill="#ffffff" stroke="#d4af37" stroke-width="2"/>
  <text x="300" y="375" font-family="'Cinzel', 'Playfair Display', serif" font-size="16" font-weight="bold" fill="#111" text-anchor="middle" letter-spacing="3">L'ÉLIXIR</text>
  <line x1="260" y1="388" x2="340" y2="388" stroke="#d4af37" stroke-width="1"/>
  <text x="300" y="405" font-family="sans-serif" font-size="9" fill="#666" text-anchor="middle" letter-spacing="2">EAU DE PARFUM</text>
  <text x="300" y="420" font-family="sans-serif" font-size="8" fill="#999" text-anchor="middle">50ml · 1.7 FL. OZ</text>
  
  <!-- Light highlights -->
  <path d="M 200 250 L 210 480" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
  <path d="M 215 250 L 220 470" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
</svg>
`;

// 2. Air Modern Sneaker (潮流跑鞋)
const sneakerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="shoeBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="soleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#shoeBg)" />
  <!-- Shadow -->
  <ellipse cx="300" cy="460" rx="220" ry="25" fill="#000" opacity="0.4"/>
  
  <!-- Outsole & Midsole -->
  <path d="M 120 410 Q 180 435 300 425 Q 420 415 480 370 C 490 390, 480 430, 440 445 C 380 460, 240 460, 140 445 C 110 440, 105 420, 120 410 Z" fill="url(#soleGrad)"/>
  
  <!-- Upper Shoe Body -->
  <path d="M 140 410 C 130 350, 160 270, 220 250 C 270 235, 310 280, 370 310 C 430 340, 470 345, 480 370 C 450 410, 360 415, 300 415 C 220 415, 170 410, 140 410 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  
  <!-- Collar & Heel -->
  <path d="M 190 260 C 210 210, 240 215, 270 250 L 250 280 Z" fill="#0284c7"/>
  
  <!-- Dynamic Swoosh / Wave -->
  <path d="M 180 360 Q 280 330 380 320 Q 320 370 240 395 Z" fill="#f43f5e"/>
  
  <!-- Lacing Details -->
  <path d="M 280 270 L 320 295 M 295 285 L 335 310 M 310 300 L 350 325" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
  
  <text x="300" y="530" font-family="'Inter', sans-serif" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle" letter-spacing="4">HYPER·PULSE NITRO V2</text>
</svg>
`;

// 3. Wireless Headphones (头戴式无线耳机)
const headphoneSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="headBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#27272a"/>
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#headBg)"/>
  
  <!-- Headband Arc -->
  <path d="M 160 320 C 140 160, 460 160, 440 320" fill="none" stroke="#3f3f46" stroke-width="26" stroke-linecap="round"/>
  <path d="M 170 310 C 155 175, 445 175, 430 310" fill="none" stroke="#18181b" stroke-width="12" stroke-linecap="round"/>
  <path d="M 230 190 C 270 180, 330 180, 370 190" fill="none" stroke="url(#goldAccent)" stroke-width="6"/>

  <!-- Left Earcup -->
  <ellipse cx="160" cy="350" rx="45" ry="70" fill="#09090b" stroke="url(#goldAccent)" stroke-width="3"/>
  <ellipse cx="160" cy="350" rx="30" ry="50" fill="#27272a"/>
  
  <!-- Right Earcup -->
  <ellipse cx="440" cy="350" rx="45" ry="70" fill="#09090b" stroke="url(#goldAccent)" stroke-width="3"/>
  <ellipse cx="440" cy="350" rx="30" ry="50" fill="#27272a"/>

  <text x="300" y="520" font-family="sans-serif" font-size="14" font-weight="600" fill="#a1a1aa" text-anchor="middle" letter-spacing="5">AURA STUDIO PRO · ANC</text>
</svg>
`;

// 4. Artisan Coffee Cup (精品咖啡杯)
const coffeeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="cupBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#292524"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
    <linearGradient id="ceramicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fafaf9"/>
      <stop offset="70%" stop-color="#f5f5f4"/>
      <stop offset="100%" stop-color="#e7e5e4"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#cupBg)"/>
  
  <!-- Saucer -->
  <ellipse cx="300" cy="460" rx="180" ry="30" fill="url(#ceramicGrad)" stroke="#d6d3d1" stroke-width="2"/>
  <ellipse cx="300" cy="455" rx="130" ry="20" fill="#e7e5e4"/>

  <!-- Coffee Cup Body -->
  <path d="M 200 280 L 230 440 C 235 450, 365 450, 370 440 L 400 280 Z" fill="url(#ceramicGrad)" stroke="#d6d3d1" stroke-width="2"/>
  <ellipse cx="300" cy="280" rx="100" ry="25" fill="#e7e5e4" stroke="#d6d3d1" stroke-width="1"/>
  
  <!-- Coffee Liquid & Foam Art -->
  <ellipse cx="300" cy="282" rx="92" ry="20" fill="#78350f"/>
  <!-- Latte Art Heart -->
  <path d="M 285 280 C 275 272, 290 268, 300 276 C 310 268, 325 272, 315 280 L 300 292 Z" fill="#fef3c7"/>
  
  <!-- Handle -->
  <path d="M 380 300 C 440 310, 440 400, 370 410" fill="none" stroke="url(#ceramicGrad)" stroke-width="16" stroke-linecap="round"/>

  <!-- Steam Whisps -->
  <path d="M 270 240 Q 260 210 280 180" stroke="#f5f5f4" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>
  <path d="M 320 240 Q 340 200 320 170" stroke="#f5f5f4" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>

  <text x="300" y="535" font-family="'Playfair Display', serif" font-size="15" fill="#d6d3d1" text-anchor="middle" letter-spacing="3">ROAST &amp; CO. ROASTERY</text>
</svg>
`;

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'demo-perfume',
    name: '🧴 奢华法式香水',
    nameEn: 'Luxury French Perfume',
    category: '高奢香氛 · 玻璃瓶身',
    icon: '🧴',
    dataUrl: '/products/demo_perfume.png',
    recommendedPrompt:
      'Place this luxury perfume bottle in the center of an opulent Italian marble vanity table. Soft morning sunlight streaming through sheer linen curtains, casting warm golden caustics and subtle reflections. Minimalist organic floral vase in soft background blur. Editorial high-end beauty commercial advertisement photography, cinematic depth of field, 8k resolution.',
  },
  {
    id: 'demo-sneaker',
    name: '👟 极简潮酷跑鞋',
    nameEn: 'Air Modern Sneaker',
    category: '运动鞋履 · 动感街拍',
    icon: '👟',
    dataUrl: '/products/demo_sneaker.png',
    recommendedPrompt:
      'Dynamic street fashion commercial for these running sneakers. Floating in mid-air above a wet asphalt street in a neon-lit cyberpunk metropolis at dusk. Neon pink and cyan reflections on the wet ground, dramatic rim lighting emphasizing the aerodynamic sole curves, cinematic motion blur, commercial advertising poster.',
  },
  {
    id: 'demo-headphone',
    name: '🎧 降噪头戴耳机',
    nameEn: 'Wireless ANC Headphones',
    category: '声学数码 · 钛金质感',
    icon: '🎧',
    dataUrl: '/products/demo_headphone.png',
    recommendedPrompt:
      'Professional industrial design showcase for premium over-ear headphones. Displayed resting on a sleek dark brushed titanium stand in a modern minimalist architect loft studio. Warm dramatic studio spot lighting highlighting the metallic chamfered edges, dark matte background, ultra-sharp texture detail.',
  },
  {
    id: 'demo-coffee',
    name: '☕ 精品手冲咖啡',
    nameEn: 'Artisan Craft Coffee',
    category: '餐饮烘焙 · 拿铁拉花',
    icon: '☕',
    dataUrl: '/products/demo_coffee.png',
    recommendedPrompt:
      'Artisanal cafe atmosphere featuring this handcrafted ceramic latte cup on a rustic dark oak table. Roasted whole coffee beans scattered artfully around the saucer, steam rising gently in the warm golden afternoon lighting. Cozy Nordic bakery aesthetic, rich earthy tones, professional food & beverage catalog styling.',
  },
  {
    id: 'demo-cashmere-coat',
    name: '🧥 高定驼色羊绒大衣',
    nameEn: 'Camel Cashmere Trench Coat',
    category: '高定女装 · 模特试穿',
    icon: '🧥',
    dataUrl: '/products/prod_05_cashmere_coat.png',
    recommendedPrompt:
      'High-fashion Parisian autumn editorial street photography featuring a model wearing this tailored camel cashmere trench coat while walking past Haussmann limestone architecture in warm golden hour sunlight.',
  },
  {
    id: 'demo-leather-handbag',
    name: '👜 巴黎黑金真皮手提包',
    nameEn: 'Parisian Black & Gold Handbag',
    category: '高奢皮具 · 金扣小牛皮',
    icon: '👜',
    dataUrl: '/products/prod_06_leather_handbag.png',
    recommendedPrompt:
      'Luxury fashion campaign featuring this structured black calfskin handbag with champagne-gold hardware resting on a travertine stone plinth with warm architectural shadow play.',
  },
  {
    id: 'demo-swiss-watch',
    name: '⌚ 瑞士皇家蓝机械腕表',
    nameEn: 'Swiss Rose-Gold Chronograph',
    category: '高级制表 · 玫瑰金蓝盘',
    icon: '⌚',
    dataUrl: '/products/prod_07_swiss_watch.png',
    recommendedPrompt:
      'Haute horlogerie macro commercial advertisement of this rose-gold and royal blue chronograph watch resting on dark brushed slate with dramatic golden rim lighting.',
  },
  {
    id: 'demo-emerald-serum',
    name: '🌿 翡翠植萃修护精华',
    nameEn: 'Botanical Emerald Elixir Serum',
    category: '植萃护肤 · 滴管精华瓶',
    icon: '🌿',
    dataUrl: '/products/prod_08_emerald_serum.png',
    recommendedPrompt:
      'Clean botanical skincare campaign showing this emerald glass dropper serum bottle on rippled water and white stone, surrounded by fresh dewy green leaves in bright morning sunlight.',
  },
  {
    id: 'demo-silk-dress',
    name: '👗 香槟金真丝晚礼服',
    nameEn: 'Champagne Silk Evening Dress',
    category: '高定礼服 · 垂坠真丝',
    icon: '👗',
    dataUrl: '/products/prod_09_silk_dress.png',
    recommendedPrompt:
      'Editorial luxury eveningwear campaign featuring a model wearing this draped champagne-gold silk midi dress in a grand candlelit neoclassical gallery.',
  },
  {
    id: 'demo-velvet-lipstick',
    name: '💄 玫瑰金丝绒哑光口红',
    nameEn: 'Rose-Gold Velvet Matte Lipstick',
    category: '高奢彩妆 · 正红丝绒膏体',
    icon: '💄',
    dataUrl: '/products/prod_10_velvet_lipstick.png',
    recommendedPrompt:
      'High-impact luxury beauty campaign featuring this rose-gold couture ruby lipstick on a glossy champagne mirror surface with soft studio rim light.',
  },
  {
    id: 'demo-aviator-sunglasses',
    name: '🕶️ 钛金属流线太阳镜',
    nameEn: 'Titanium Aviator Sunglasses',
    category: '潮流配饰 · 度假街拍',
    icon: '🕶️',
    dataUrl: '/products/prod_11_aviator_sunglasses.png',
    recommendedPrompt:
      'Mediterranean resort eyewear campaign featuring these brushed-titanium aviator sunglasses on sun-warmed white marble overlooking the Amalfi coast.',
  },
  {
    id: 'demo-scented-candle',
    name: '🕯️ 琥珀乌木香氛蜡烛',
    nameEn: 'Artisanal Amber & Oud Candle',
    category: '家居香氛 · 棱纹琥珀杯',
    icon: '🕯️',
    dataUrl: '/products/prod_12_scented_candle.png',
    recommendedPrompt:
      'Warm minimalist interior lifestyle photograph featuring this ribbed smoked-amber glass candle on a travertine coffee table with soft evening shadows.',
  },
];

export const DEMO_LOGOS: DemoLogo[] = [
  {
    id: 'logo-lumina',
    name: '💎 LUMINA PARIS (高奢香水珠宝 · 金星钻石徽标)',
    nameEn: '💎 LUMINA PARIS (Haute Parfumerie · Diamond Crest)',
    category: '高奢香氛/珠宝',
    icon: '💎',
    dataUrl: '/logos/logo_lumina_luxury.png',
  },
  {
    id: 'logo-aero',
    name: '👟 AERO PERFORMANCE (专业运动科技 · 橘黑飞翼标)',
    nameEn: '👟 AERO PERFORMANCE (Athletic Lab · Wing Emblem)',
    category: '运动跑鞋/户外',
    icon: '👟',
    dataUrl: '/logos/logo_aero_sports.png',
  },
  {
    id: 'logo-verdant',
    name: '🌿 VERDANT BOTANICAL (植萃护肤沙龙 · 翡翠金叶标)',
    nameEn: '🌿 VERDANT BOTANICAL (Organic Atelier · Leaf Crest)',
    category: '植萃护肤/美妆',
    icon: '🌿',
    dataUrl: '/logos/logo_verdant_organic.png',
  },
  {
    id: 'logo-chronos',
    name: '⌚ CHRONOS GENÈVE (瑞士高级制表 · 皇冠陀飞轮标)',
    nameEn: '⌚ CHRONOS GENÈVE (Swiss Horology · Royal Crown)',
    category: '名表/男士精品',
    icon: '⌚',
    dataUrl: '/logos/logo_chronos_geneve.png',
  },
  {
    id: 'logo-nova',
    name: '🎧 NOVA ACOUSTIC LABS (未来声学数码 · 几何声波标)',
    nameEn: '🎧 NOVA ACOUSTIC LABS (Future Audio · Sonic Prism)',
    category: '数码耳机/科技',
    icon: '🎧',
    dataUrl: '/logos/logo_nova_cyber.png',
  },
  {
    id: 'logo-eclat',
    name: '👜 MAISON ÉCLAT PARIS (巴黎高定皮具 · 黑金皇家纹章)',
    nameEn: '👜 MAISON ÉCLAT PARIS (Couture Leather · Monogram)',
    category: '高定箱包/时装',
    icon: '👜',
    dataUrl: '/logos/logo_maison_eclat.png',
  },
  {
    id: 'logo-aurora',
    name: '☕ AURORA ROASTERS (精品庄园咖啡 · 暖铜日出徽标)',
    nameEn: '☕ AURORA ROASTERS (Artisan Coffee · Sunburst)',
    category: '精品咖啡/餐饮',
    icon: '☕',
    dataUrl: '/logos/logo_aurora_roasters.png',
  },
  {
    id: 'logo-solaris',
    name: '☀️ SOLARIS LUMIÈRE (奢华抗老美妆 · 玫瑰金日冕标)',
    nameEn: '☀️ SOLARIS LUMIÈRE (Luxury Beauty · Rose Gold Halo)',
    category: '奢华彩妆/香氛',
    icon: '☀️',
    dataUrl: '/logos/logo_solaris_beauty.png',
  },
];

export const PROMPT_SCENE_CHIPS = [
  {
    label: '🏢 现代都市街拍',
    text: 'Set on a modern urban street with glass skyscrapers and sunny morning city atmosphere.',
  },
  {
    label: '✨ 奢华大理石展台',
    text: 'Displayed on a polished white Carrara marble pedestal with soft golden hour lighting and clean aesthetic.',
  },
  {
    label: '🌿 极简北欧自然',
    text: 'Surrounded by fresh green monstera leaves and warm neutral beige tones in a bright Scandinavian studio.',
  },
  {
    label: '🌅 黄金日落暖光',
    text: 'Bathed in dramatic sunset golden light casting long soft shadows with cinematic warmth.',
  },
  {
    label: '⚡ 赛博未来霓虹',
    text: 'Dark reflective cyberpunk scene illuminated by neon blue and magenta rim lights.',
  },
  {
    label: '🎨 纯色极简棚拍',
    text: 'Clean minimalist commercial studio photography on a seamless pastel gradient background.',
  },
];
