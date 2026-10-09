/**
 * Copyright 2026 Google LLC
 *
 * Internationalization (i18n) Engine for Banana Milkshake Pro
 * Supports Simplified Chinese (zh-CN) and English (en-US)
 */

import { reactive, ref } from 'vue';

export type Language = 'zh' | 'en';

const savedLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('banana_lang') : null) as Language | null;
export const currentLanguage = ref<Language>(savedLang || 'zh');

export function setLanguage(lang: Language) {
  currentLanguage.value = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('banana_lang', lang);
  }
}

export function toggleLanguage() {
  setLanguage(currentLanguage.value === 'zh' ? 'en' : 'zh');
}

export const messages = {
  zh: {
    // Navigation
    appName: 'Banana Milkshake',
    proBadge: 'PRO',
    creationCenter: '单素材创作中心',
    templateLibrary: '广告模板库',
    bulkCreation: '批量实验中心',
    signIn: '使用 Google 账号登录',
    signOut: '退出登录',
    langToggle: 'English',

    // Template Library
    libraryTitle: '广告创意模板库',
    librarySubtitle: '浏览精选的垂直行业高转化率营销模板，一键套用或自定义二次创作',
    searchPlaceholder: '搜索行业广告模板（如：时尚、美妆、尺寸重构、极简）...',
    tabBuiltin: '系统预置模板',
    tabDrive: '我的云端模板 (Drive)',
    tabSheets: 'Google 表格协同',
    createNewTemplate: '+ 新建自定义模板',
    useTemplate: '选用此模板',
    customizeTemplate: '定制编辑',
    deleteTemplate: '删除',
    loadingTemplates: '正在加载模板资产...',
    noTemplatesFound: '未找到匹配的模板，请尝试其他关键词',
    categoryAll: '全部模板',
    categoryResize: '尺寸重构',
    categoryFashion: '时尚服饰',
    categoryBeauty: '美妆护肤',
    categoryRetail: '电商零售',

    // Creation Center
    templateSettings: '模板核心参数设置',
    templateName: '模板名称',
    aspectRatio: '画幅比例 (Aspect Ratio)',
    model: 'AI 生成模型',
    resolution: '画质分辨率 (Resolution)',
    previewImage: '封面示意图',
    saveTemplate: '保存模板至 Drive',
    saving: '保存中...',
    stepsSection: '创意制作图层步骤',
    addStep: '+ 添加图层步骤',
    stepTitle: '步骤名称',
    promptPlaceholder: '详细描述素材生成要求... 例如：以 asset1 为主体，融入自然暖日光照背景，加入高级大理石台面',
    helpPrompt: '✨ AI 创意总监帮我写提示词',
    generatingPrompt: '创意总监思考中...',
    imageSlots: '输入资产槽位 (Image Slots)',
    addImageSlot: '+ 添加图片槽位',
    runStep: '⚡ 执行生成当前步骤',
    running: 'Vertex AI 正在生成中...',
    stepResult: '生成成果预览',
    outputPlaceholder: '生成的商业广告物料将在此实时高清呈现',
    uploadPromptImage: '上传样图以提取风格提示词',
    dragOrClick: '点击或拖拽上传图片',

    // Ad Resizer
    resizerTitle: '智能广告尺寸重构矩阵 (Ad Image Resizer)',
    resizerSubtitle: '基于 Google Ads 黄金投放版位规范，一键智能重构并外绘延伸至 6 大主流广告规格',
    selectAdSizes: '选择需要派发的广告规格',
    sourceAsset: '上传广告主体图',
    startResizing: '启动全尺寸矩阵重构',
    resizingProgress: '多尺寸渲染进度',
    downloadZip: '一键打包下载全部物料 (ZIP)',

    // Bulk Creation
    bulkTitle: '批量广告创意生成与实验中心',
    bulkSubtitle: '通过 CSV 表格批量注入不同商品标题、卖点、促销文案，实现百倍规模素材量产',
    uploadCsvFile: '点击或拖拽上传包含变体参数的 CSV 数据集',
    concurrencySettings: '并发 Worker 线程池调节',
    parallelWorkers: '个并行 Worker',
    startBulkJob: '启动批量量产任务',
    bulkStatusPending: '等待队列',
    bulkStatusRunning: '正在生成',
    bulkStatusCompleted: '已完成',
    bulkStatusFailed: '异常失败',
    totalProgress: '整体处理进度',

    // Footer
    footerDisclaimer: '声明：本平台商业视觉由 Google Cloud Vertex AI 提供技术支持。广告主需根据当地法规和 Google 政策确保广告物料包含所有法定合规披露。'
  },
  en: {
    // Navigation
    appName: 'Banana Milkshake',
    proBadge: 'PRO',
    creationCenter: 'Creation Center',
    templateLibrary: 'Template Library',
    bulkCreation: 'Bulk Creation',
    signIn: 'Sign In with Google',
    signOut: 'Sign Out',
    langToggle: '中文版',

    // Template Library
    libraryTitle: 'Ad Template Library',
    librarySubtitle: 'Explore pre-crafted high-converting ad templates across diverse retail verticals',
    searchPlaceholder: 'Search ad templates (e.g., fashion, beauty, resizer, minimalist)...',
    tabBuiltin: 'Built-in Templates',
    tabDrive: 'My Drive Templates',
    tabSheets: 'Google Sheets',
    createNewTemplate: '+ Create New Template',
    useTemplate: 'Use Template',
    customizeTemplate: 'Customize',
    deleteTemplate: 'Delete',
    loadingTemplates: 'Loading template assets...',
    noTemplatesFound: 'No templates matching your query were found',
    categoryAll: 'All Templates',
    categoryResize: 'Resizing',
    categoryFashion: 'Fashion',
    categoryBeauty: 'Beauty',
    categoryRetail: 'Retail',

    // Creation Center
    templateSettings: 'Template Settings',
    templateName: 'Template Name',
    aspectRatio: 'Aspect Ratio',
    model: 'AI Generative Model',
    resolution: 'Resolution',
    previewImage: 'Cover Image',
    saveTemplate: 'Save Template to Drive',
    saving: 'Saving...',
    stepsSection: 'Creative Generation Steps',
    addStep: '+ Add Step',
    stepTitle: 'Step Title',
    promptPlaceholder: 'Describe the transformation for asset1, lighting, background, and {{CTA}} text...',
    helpPrompt: '✨ Help me write the prompt',
    generatingPrompt: 'Creative Director thinking...',
    imageSlots: 'Input Image Slots',
    addImageSlot: '+ Add Image Slot',
    runStep: '⚡ Run Step',
    running: 'Vertex AI Generating...',
    stepResult: 'Result Preview',
    outputPlaceholder: 'Generated advertising visual will appear here',
    uploadPromptImage: 'Upload moodboard/style guide image to extract prompt',
    dragOrClick: 'Click or drag image to upload',

    // Ad Resizer
    resizerTitle: 'Ad Image Resizer Matrix',
    resizerSubtitle: 'Intelligently adapt and outpaint single product hero into 6 official Google Ads standard sizes',
    selectAdSizes: 'Select Target Ad Formats',
    sourceAsset: 'Upload Hero Image',
    startResizing: 'Generate All Sizes',
    resizingProgress: 'Multi-ratio Rendering Progress',
    downloadZip: 'Download All Assets (ZIP)',

    // Bulk Creation
    bulkTitle: 'Bulk Creation & Experimentation Center',
    bulkSubtitle: 'Mass-generate hundreds of advertising variations driven by CSV feeds and dynamic text parameters',
    uploadCsvFile: 'Click or drop a CSV parameter file here',
    concurrencySettings: 'Parallel Worker Concurrency Pool',
    parallelWorkers: 'Parallel Workers',
    startBulkJob: 'Start Bulk Batch Generation',
    bulkStatusPending: 'Pending',
    bulkStatusRunning: 'Running',
    bulkStatusCompleted: 'Completed',
    bulkStatusFailed: 'Failed',
    totalProgress: 'Total Progress',

    // Footer
    footerDisclaimer: 'Note: AI was used to edit or generate assets for your ads. As per Google policy, advertisers are ultimately responsible for ensuring ads comply with applicable laws.'
  }
};

export function t(key: keyof typeof messages['zh']): string {
  const lang = currentLanguage.value;
  return messages[lang]?.[key] || messages['zh'][key] || key;
}
