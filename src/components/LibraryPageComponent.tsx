/**
 * Copyright 2026 Google LLC
 *
 * Enhanced LibraryPageComponent with:
 * - 3-Step Quick Start Onboarding Banner (解决"不知道咋用")
 * - Category Filter Chips (全部、潮流穿搭、尺寸重构、品牌定制、节日大促等)
 * - High-fidelity visual SVG previews (告别丑陋文字占位方块)
 * - Clear primary "🎨 开始制作素材" action (直达工作台，绝不误跳 CSV 批量页)
 * - 100% 免登录开箱即用 (移除误导性登录门槛)
 */

import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import { TEMPLATES } from '../data/templates';
import { Template } from '../types';
import { t, currentLanguage } from '../i18n';

export const LibraryPageComponent = defineComponent({
  name: 'LibraryPageComponent',
  props: {
    isSignedIn: {
      type: Boolean,
      required: true,
    },
    driveTemplates: {
      type: Array as PropType<Template[]>,
      required: true,
    },
    listTemplates: {
      type: Function as PropType<() => Promise<Template[]>>,
      required: true,
    },
    deleteTemplate: {
      type: Function as PropType<(template: Template) => Promise<void>>,
      required: true,
    },
  },
  emits: ['use-template', 'create-new', 'sign-in'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const selectedCategory = ref('all');
    const builtInTemplates = ref(TEMPLATES);

    const categories = computed(() => [
      { id: 'all', label: currentLanguage.value === 'zh' ? '全部推荐模板 (9)' : 'All Templates (9)' },
      { id: 'fashion', label: currentLanguage.value === 'zh' ? '👗 潮流服饰穿搭' : 'Fashion & Models' },
      { id: 'resize', label: currentLanguage.value === 'zh' ? '📐 6大版位尺寸重构' : 'Ad Image Resizer' },
      { id: 'retail', label: currentLanguage.value === 'zh' ? '🛍️ 品牌电商营销' : 'Brand & Retail' },
      { id: 'holiday', label: currentLanguage.value === 'zh' ? '🎁 节日大促海报' : 'Holiday Promo' },
      { id: 'text', label: currentLanguage.value === 'zh' ? '💡 纯文本一键生图' : 'Text to Image' },
    ]);

    const displayedTemplates = computed(() => {
      let list = builtInTemplates.value;
      if (selectedCategory.value !== 'all') {
        list = list.filter((item) => (item as any).category === selectedCategory.value);
      }
      if (!searchQuery.value.trim()) {
        return list;
      }
      const q = searchQuery.value.toLowerCase();
      return list.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    });

    const quickStartFirst = () => {
      const target = builtInTemplates.value.find((t) => t.id === 'street-snap') || builtInTemplates.value[0];
      emit('use-template', target, 'edit');
    };

    return () => (
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* ============================================================== */}
        {/* 1. 新手快速上手三步指引横幅 (消除乱、不知道怎么用的迷茫感) */}
        {/* ============================================================== */}
        <div class="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 rounded-2xl p-6 border border-indigo-100/80 shadow-sm">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div class="space-y-2 max-w-3xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold tracking-wide shadow-sm">
                <span>💡 30 秒上手指南</span>
                <span class="opacity-80">|</span>
                <span>免登录 · Vertex AI 实时在线</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {currentLanguage.value === 'zh'
                  ? '只需 3 步，轻松生成多尺寸商用广告图'
                  : 'Create Professional Commercial Ad Assets in 3 Simple Steps'}
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div class="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-indigo-50 shadow-sm">
                  <div class="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">1</div>
                  <div>
                    <div class="text-xs font-bold text-gray-900">挑一个模板</div>
                    <div class="text-[11px] text-gray-600 leading-snug">点击下方卡片的「开始制作素材」立即载入</div>
                  </div>
                </div>
                <div class="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-indigo-50 shadow-sm">
                  <div class="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">2</div>
                  <div>
                    <div class="text-xs font-bold text-gray-900">调提示词或上传图</div>
                    <div class="text-[11px] text-gray-600 leading-snug">输入商品描述或让「AI 创意总监」帮写</div>
                  </div>
                </div>
                <div class="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-indigo-50 shadow-sm">
                  <div class="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">3</div>
                  <div>
                    <div class="text-xs font-bold text-gray-900">一键出图 & 多尺寸</div>
                    <div class="text-[11px] text-gray-600 leading-snug">Vertex AI 秒级直出高清图，支持一键外绘</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex-shrink-0 w-full sm:w-auto flex flex-col gap-2">
              <button
                onClick={quickStartFirst}
                class="material-button material-button-primary w-full sm:w-auto px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">
                <span>🚀 极速体验第一张广告</span>
              </button>
              <div class="text-[11px] text-center text-gray-500 font-medium">
                ⚡ 预载「街头潮流街拍」爆款模板
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. 搜索框与分类快捷标签 (Filter Chips) */}
        {/* ============================================================== */}
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                v-model={searchQuery.value}
                class="block w-full pl-10 pr-4 py-2.5 sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 hover:bg-white transition-colors"
                placeholder={t('searchPlaceholder')}
              />
            </div>

            {/* Create Custom Template Button */}
            <button
              onClick={() => emit('create-new')}
              class="inline-flex items-center justify-center px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('createNewTemplate')}</span>
            </button>
          </div>

          {/* Category Chips */}
          <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
            <span class="text-xs font-bold text-gray-400 mr-1">快捷品类:</span>
            {categories.value.map((cat) => (
              <button
                key={cat.id}
                onClick={() => (selectedCategory.value = cat.id)}
                class={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory.value === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm font-bold scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. 模板列表网格 (精美真实卡片，告别单调占位色块) */}
        {/* ============================================================== */}
        {displayedTemplates.value.length === 0 ? (
          <div class="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div class="text-4xl mb-3">🔍</div>
            <h3 class="text-base font-bold text-gray-900">{t('noTemplatesFound')}</h3>
            <p class="text-xs text-gray-500 mt-1">请尝试清除搜索关键词或切换到「全部推荐模板」</p>
            <button
              onClick={() => {
                searchQuery.value = '';
                selectedCategory.value = 'all';
              }}
              class="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100">
              重置筛选条件
            </button>
          </div>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTemplates.value.map((template) => (
              <div
                key={template.id}
                class="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between">
                
                <div>
                  {/* Top Preview Image & Floating Badges */}
                  <div
                    class="relative aspect-[4/3] bg-gray-900 overflow-hidden cursor-pointer"
                    onClick={() => emit('use-template', template, 'edit')}
                    title="点击直接进入制作">
                    
                    {/* Badge Pill Left */}
                    <div class="absolute top-3 left-3 z-10">
                      <span class="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md bg-white/95 text-gray-900 backdrop-blur-sm border border-white/40">
                        {(template as any).badge || (template.id === 'ad-image-resizer' ? '📐 尺寸矩阵' : '🔥 热门推荐')}
                      </span>
                    </div>

                    {/* Aspect Ratio Badge Right */}
                    <div class="absolute top-3 right-3 z-10">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                        {template.aspect_ratio || '1:1'}
                      </span>
                    </div>

                    {/* Preview Image / SVG */}
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quick Hover Overlay */}
                    <div class="absolute inset-0 bg-indigo-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span class="px-4 py-2 bg-white text-indigo-700 text-xs font-bold rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        🎨 点击开始创作 &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div class="p-5">
                    <h3
                      class="font-black text-base text-gray-900 mb-2 cursor-pointer group-hover:text-indigo-600 transition-colors line-clamp-1"
                      onClick={() => emit('use-template', template, 'edit')}>
                      {template.name}
                    </h3>
                    <p class="text-xs text-gray-600 leading-relaxed line-clamp-2 min-h-[32px]">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions (清晰明确：主操作立即创作，次操作批量出图) */}
                <div class="px-5 pb-5 pt-1">
                  <div class="flex items-center gap-2">
                    {/* Primary Button: 立即开始创作 (绝不误跳 CSV 页面) */}
                    <button
                      onClick={() => emit('use-template', template, 'edit')}
                      class="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5">
                      <span>🎨</span>
                      <span>{currentLanguage.value === 'zh' ? '开始制作素材' : 'Create with Template'}</span>
                    </button>

                    {/* Secondary Button: 批量出图 */}
                    <button
                      onClick={() => emit('use-template', template, 'use')}
                      class="py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                      title={currentLanguage.value === 'zh' ? '上传 CSV 表格批量生成上百套广告物料' : 'Batch generation driven by CSV'}>
                      <span>📦</span>
                      <span>{currentLanguage.value === 'zh' ? '批量出图' : 'Bulk'}</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    );
  },
});
