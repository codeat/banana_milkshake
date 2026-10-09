import {cropImageToSize} from '../services/image';
/**
 * Copyright 2026 Google LLC
 */

import {Modality, Part} from '@google/genai';
import JSZip from 'jszip';
import {computed, defineComponent, PropType, reactive, ref, watch} from 'vue';
import {
  DEFAULT_IMAGE_MODEL,
  SUPPORTED_IMAGE_MODELS,
  useVertexAi,
} from '../constants';
import {PLACEHOLDERS} from '../data/placeholders';
import {ai, callGenAIApi, reportClientLog} from '../services/ai';
import {Template} from '../types';
import {t, currentLanguage, getModelDisplayName} from '../i18n';
import {DEMO_PRODUCTS, DEMO_MODELS, DemoProduct} from '../data/demoAssets';

const SIZE_SPECS: Record<string, {nameZh: string; nameEn: string; tag: string}> = {
  '970x250': {nameZh: '巨幅通栏 (IAB Billboard)', nameEn: 'IAB Billboard', tag: 'PC 首页顶通'},
  '300x600': {nameZh: '半页摩天大楼 (Half-Page)', nameEn: 'Half-Page Ad', tag: '高视觉冲击竖版'},
  '300x250': {nameZh: '黄金中矩形 (Medium Rect)', nameEn: 'Medium Rectangle', tag: 'GDN 最高曝光版位'},
  '336x280': {nameZh: '大矩形展位 (Large Rect)', nameEn: 'Large Rectangle', tag: '正文内嵌黄金位'},
};

/**
 * A component that allows users to intelligently resize and adapt product images
 * into multiple standard advertisement dimensions (e.g., 970x250, 300x600) using
 * Gemini's image generation capabilities combined with automated precise cropping.
 * It helps automate the creation of various ad banner sizes from a single product image.
 */
export const ResizingPageComponent = defineComponent({
  name: 'ResizingPageComponent',
  props: {
    initialTemplate: {
      type: Object as PropType<Template | null>,
      default: null,
    },
    initialSourceImage: {
      type: String as PropType<string | null>,
      default: null,
    },
    isSaving: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['change-template', 'open-preview'],
  setup(props, {emit}) {
    const genaiModel = ref(DEFAULT_IMAGE_MODEL);
    const supportedModels = SUPPORTED_IMAGE_MODELS;

    const sizes = ['970x250', '300x600', '300x250', '336x280'];
    const selectedSizes = reactive<Record<string, boolean>>({
      '970x250': true,
      '300x600': true,
      '300x250': true,
      '336x280': true,
    });
    const getEstimatedDimensions = (size: string) => {
      if (size === '970x250') return '1344x768 → 970x250';
      if (size === '300x600') return '768x1344 → 300x600';
      if (size === '300x250') return '1152x896 → 300x250';
      if (size === '336x280') return '1152x896 → 336x280';
      return 'Auto';
    };
    const productImage = ref<File | null>(null);
    const productImagePreview = ref<string | null>(
      props.initialSourceImage || DEMO_PRODUCTS[0].dataUrl,
    );
    const fromCreationStudio = ref<boolean>(Boolean(props.initialSourceImage));

    watch(
      () => props.initialSourceImage,
      (newVal) => {
        if (newVal) {
          productImagePreview.value = newVal;
          productImage.value = null;
          fromCreationStudio.value = true;
        }
      },
    );

    const loadDemoProduct = (product: DemoProduct) => {
      productImagePreview.value = product.dataUrl;
      productImage.value = null;
      fromCreationStudio.value = false;
    };

    const loadPresetPoster = (url: string) => {
      productImagePreview.value = url;
      productImage.value = null;
      fromCreationStudio.value = false;
    };

    const defaultPrompt =
      `Intelligently adapt and resize the product from Asset 1 to perfectly fit the dimensions and layout suggested by Asset 2 (the placeholder). The final image must be a professional advertisement of the specified size.

**Key Layout Rules:**
* **Product Placement:** Keep the main product centered, sharp, and naturally integrated, preserving its original quality.
* **Background:** Ensure the background fills the entire new dimensions seamlessly.
* **Native Elements:** If Asset 1 contains existing logo and text overlays, rearrange these native elements and the layout to adapt to the new specified size.

**Strict Restrictions:**
* **No New Additions:** Apart from the native elements already present in Asset 1, do not add any new text overlays, logos, watermarks, or extra graphic elements.`;

    const prompt = ref(defaultPrompt);

    const results = reactive<
      Record<
        string,
        {
          geminiImageUrl: string | null;
          croppedImageUrl: string | null;
          isLoading: boolean;
          error: string | null;
          hasRun: boolean;
          geminiDimensions: string | null;
          durationSec: string | null;
        }
      >
    >({});

    // Initialize results
    sizes.forEach((size) => {
      results[size] = {
        geminiImageUrl: null,
        croppedImageUrl: null,
        isLoading: false,
        error: null,
        hasRun: false,
        geminiDimensions: null,
        durationSec: null,
      };
    });

    const handleFileChange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        productImage.value = file;
        fromCreationStudio.value = false;
        const reader = new FileReader();
        reader.onload = (e) => {
          productImagePreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };

    const dataUrlToBase64 = (dataUrl: string) =>
      dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

    const resolveImageBase64 = async (
      urlOrDataUrl: string,
    ): Promise<{base64: string; mimeType: string}> => {
      if (urlOrDataUrl.startsWith('data:')) {
        const mimeType =
          urlOrDataUrl.match(/data:(.*?);base64/)?.[1] || 'image/png';
        const base64 = dataUrlToBase64(urlOrDataUrl);
        return {base64, mimeType};
      }
      const res = await fetch(urlOrDataUrl);
      const blob = await res.blob();
      const mimeType = blob.type || 'image/png';
      const buffer = await blob.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      return {base64, mimeType};
    };

    const runForSize = async (size: string) => {
      const result = results[size];
      const startTime = Date.now();
      result.isLoading = true;
      result.error = null;
      result.geminiImageUrl = null;
      result.croppedImageUrl = null;
      result.durationSec = null;

      try {
        if (!productImagePreview.value) {
          throw new Error('Please upload a product image.');
        }

        const parts: Part[] = [];

        // Asset 1: Product Image
        const {base64: productBase64, mimeType: productMimeType} =
          await resolveImageBase64(productImagePreview.value);
        parts.push({
          inlineData: {data: productBase64, mimeType: productMimeType},
        });

        // Asset 2: Placeholder for this size
        const placeholderDataUrl = PLACEHOLDERS[size];
        if (!placeholderDataUrl) {
          throw new Error(`Placeholder for ${size} not found.`);
        }
        const {base64: placeholderBase64, mimeType: placeholderMimeType} =
          await resolveImageBase64(placeholderDataUrl);
        parts.push({
          inlineData: {data: placeholderBase64, mimeType: placeholderMimeType},
        });

        // Prompt
        parts.push({text: prompt.value});

        const modelToUse = genaiModel.value || DEFAULT_IMAGE_MODEL;

        let apiAspectRatio = '1:1';
        if (size === '970x250') apiAspectRatio = '16:9';
        if (size === '300x600') apiAspectRatio = '9:16';
        if (size === '300x250') apiAspectRatio = '4:3';
        if (size === '336x280') apiAspectRatio = '4:3';

        let response;
        if (useVertexAi) {
          response = await callGenAIApi({
            model: modelToUse,
            stepTag: `Resizer ${size}`,
            contents: {
              role: 'user',
              parts,
            },
            config: {
              responseModalities: [Modality.IMAGE],
              imageConfig: {
                aspectRatio: apiAspectRatio,
              },
            },
          });
        } else {
          response = await ai.models.generateContent({
            model: modelToUse,
            contents: {parts},
            config: {
              responseModalities: [Modality.IMAGE],
              imageConfig: {
                aspectRatio: apiAspectRatio,
              },
            },
          });
        }

        const imagePart = response.candidates?.[0]?.content?.parts?.find(
          (p: Part) => p.inlineData,
        );
        if (imagePart?.inlineData) {
          const geminiImage = `data:image/png;base64,${imagePart.inlineData.data}`;
          result.geminiImageUrl = geminiImage;
          result.durationSec = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

          // Step 2: 代码精确裁剪
          const [targetW, targetH] = size.split('x').map(Number);
          const {croppedImageUrl, originalWidth, originalHeight} = await cropImageToSize(geminiImage, targetW, targetH);
          result.croppedImageUrl = croppedImageUrl;
          result.geminiDimensions = `${originalWidth}×${originalHeight}`;
        } else {
          throw new Error('No image returned.');
        }
      } catch (e: unknown) {
        console.error(`Error generating for ${size}:`, e);
        const errMsg = e instanceof Error ? e.message : 'Error occurred.';
        result.error = errMsg;
        reportClientLog({
          status: 499,
          model: genaiModel.value || DEFAULT_IMAGE_MODEL,
          stepTag: `Resizer ${size}`,
          durationMs: Date.now() - startTime,
          prompt: prompt.value,
          error: errMsg,
        });
      } finally {
        result.isLoading = false;
        result.hasRun = true;
      }
    };

    const runAllSelected = async () => {
      const activeSizes = sizes.filter((size) => selectedSizes[size]);
      const promises = activeSizes.map(async (size, idx) => {
        if (idx > 0) {
          await new Promise((r) => setTimeout(r, idx * 350));
        }
        return runForSize(size);
      });
      await Promise.all(promises);
    };

    const downloadSingleSize = (size: string) => {
      const url = results[size]?.croppedImageUrl;
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.download = `ad_banner_${size}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const hasCroppedImages = computed(() => {
      return sizes.some((size) => results[size]?.croppedImageUrl);
    });

    const downloadAllCroppedImages = async () => {
      const zip = new JSZip();
      const originalName = productImage.value
        ? productImage.value.name.substring(0, productImage.value.name.lastIndexOf('.'))
        : 'ad_image';

      const promises = sizes.map(async (size) => {
        const result = results[size];
        if (result.croppedImageUrl) {
          const response = await fetch(result.croppedImageUrl);
          const blob = await response.blob();
          zip.file(`${originalName}_${size}.png`, blob);
        }
      });

      await Promise.all(promises);

      const content = await zip.generateAsync({type: 'blob'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${originalName}_cropped_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return () => (
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-full">
        <div class="flex flex-col space-y-8">
          {/* Settings Section */}
          <div class="flex flex-wrap justify-between items-center gap-4 mb-2">
            <div>
              <h2 class="text-xl font-bold flex items-center gap-2">
                <span>{t('resizerTitle')}</span>
                {fromCreationStudio.value && (
                  <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✨ 已载入创作中心合成母版
                  </span>
                )}
              </h2>
              <p class="text-xs text-gray-500 mt-1">{t('resizerSubtitle')}</p>
            </div>
            <div class="flex items-center space-x-3 shrink-0">
              <button
                onClick={runAllSelected}
                class="material-button material-button-primary whitespace-nowrap shrink-0"
                disabled={!productImagePreview.value}>
                {t('startResizing')}
              </button>
              <button
                onClick={() => emit('change-template')}
                class="text-sm text-primary font-medium hover:underline whitespace-nowrap shrink-0">
                {currentLanguage.value === 'zh' ? '← 返回模板库' : '← Back to Library'}
              </button>
            </div>
          </div>

          {/* Step 1: Gemini 生成图片 */}
          <div class="material-card">
            <div class="step-title">{t('resizerStep1Title')}</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-on-surface-variant mb-1 whitespace-nowrap">
                  {t('model')}
                </label>
                <select
                  value={genaiModel.value}
                  onChange={(e: Event) =>
                    (genaiModel.value = (e.target as HTMLInputElement).value)
                  }
                  class="material-input bg-white text-sm">
                  {supportedModels.map((model) => (
                    <option key={model} value={model}>
                      {getModelDisplayName(model)}
                    </option>
                  ))}
                </select>
              </div>

              <div class="md:col-span-2 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-indigo-900 flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <span>
                      💡{' '}
                      {currentLanguage.value === 'zh'
                        ? '示例商品 & 商业海报母版一键填入 (带缩略图预览):'
                        : '1-Click Sample Products & Master Posters:'}
                    </span>
                  </span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {DEMO_PRODUCTS.map((prod) => {
                    const isSelected = productImagePreview.value === prod.dataUrl;
                    return (
                      <button
                        type="button"
                        key={prod.id}
                        onClick={() => loadDemoProduct(prod)}
                        class={`p-1.5 text-left rounded-lg bg-white border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-indigo-100 hover:border-indigo-500'
                        }`}>
                        <img
                          src={prod.dataUrl}
                          alt={prod.name}
                          class="w-8 h-8 rounded object-cover border border-gray-100 shrink-0"
                        />
                        <span class="text-xs font-bold text-gray-800 truncate">
                          {currentLanguage.value === 'zh' ? prod.name : prod.nameEn}
                        </span>
                      </button>
                    );
                  })}
                  {DEMO_MODELS.slice(0, 2).map((poster) => {
                    const isSelected = productImagePreview.value === poster.dataUrl;
                    return (
                      <button
                        type="button"
                        key={poster.id}
                        onClick={() => loadPresetPoster(poster.dataUrl)}
                        class={`p-1.5 text-left rounded-lg bg-white border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                            : 'border-purple-100 hover:border-purple-500'
                        }`}>
                        <img
                          src={poster.dataUrl}
                          alt={poster.name}
                          class="w-8 h-8 rounded object-cover border border-purple-100 shrink-0"
                        />
                        <span class="text-xs font-bold text-purple-900 truncate">
                          {currentLanguage.value === 'zh'
                            ? poster.name.split(' (')[0]
                            : poster.nameEn.split(' (')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-on-surface-variant mb-1 whitespace-nowrap">
                  {currentLanguage.value === 'zh' ? '原版商品主体图 / 待延展母版 (Asset 1)' : 'Source Ad / Product Image (Asset 1)'}
                </label>
                <div class="flex items-center space-x-4">
                  <label class="cursor-pointer flex-1">
                    <div class="p-2 border-2 border-dashed border-outline rounded-lg text-center hover:bg-gray-50 flex items-center justify-center min-h-[56px] bg-gray-50">
                      {productImagePreview.value ? (
                        <div class="flex items-center gap-3">
                          <img
                            src={productImagePreview.value}
                            class="max-h-14 mx-auto rounded shadow-2xs"
                            alt="Product preview"
                          />
                          <span class="text-xs text-gray-500">
                            {currentLanguage.value === 'zh' ? '点击上传更换母版' : 'Click to replace'}
                          </span>
                        </div>
                      ) : (
                        <span class="text-sm text-on-surface-variant">
                          Click to upload Product Image
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div class="md:col-span-2">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-on-surface-variant whitespace-nowrap">
                    {t('targetSizesLabel')}
                  </label>
                  <div class="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => sizes.forEach((s) => (selectedSizes[s] = true))}
                      class="text-indigo-600 hover:underline font-semibold cursor-pointer">
                      {currentLanguage.value === 'zh' ? '全选 4 大规格' : 'Select All'}
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {sizes.map((size) => {
                    const spec = SIZE_SPECS[size];
                    return (
                      <label
                        key={size}
                        class={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          selectedSizes[size]
                            ? 'bg-indigo-50/50 border-indigo-400 shadow-2xs'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}>
                        <input
                          type="checkbox"
                          v-model={selectedSizes[size]}
                          class="form-checkbox h-4 w-4 mt-0.5 text-primary rounded border-outline focus:ring-primary"
                        />
                        <div class="overflow-hidden">
                          <div class="text-sm font-black text-gray-900 font-mono">{size}</div>
                          <div class="text-[11px] font-semibold text-indigo-800 truncate">
                            {currentLanguage.value === 'zh' ? spec?.nameZh : spec?.nameEn}
                          </div>
                          <div class="text-[10px] text-gray-500 truncate">{spec?.tag}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div class="mt-6">
              <label class="block text-sm font-medium text-on-surface-variant mb-1">
                {t('resizerPromptLabel')}
              </label>
              <textarea
                v-model={prompt.value}
                class="material-input bg-white w-full"
                rows={3}></textarea>
            </div>
          </div>

          {/* Step 2: 代码精确裁剪 */}
          <div class="material-card">
            <div class="step-title">{t('resizerStep2Title')}</div>
            <div class="text-sm text-gray-500">
              {t('resizerStep2Subtitle')}
            </div>
          </div>

          {/* Results Section */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sizes.map((size) => {
              const result = results[size];
              if (!selectedSizes[size]) return null;
              const spec = SIZE_SPECS[size];

              return (
                <div key={size} class="material-card flex flex-col justify-between col-span-1 lg:col-span-2">
                  <div>
                    <div class="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <div class="flex items-center gap-2">
                        <h3 class="font-black text-base font-mono text-gray-900">{size}</h3>
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {currentLanguage.value === 'zh' ? spec?.nameZh : spec?.nameEn}
                        </span>
                        {result.durationSec && (
                          <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ⏱️ {result.durationSec}
                          </span>
                        )}
                      </div>
                      <div class="flex items-center gap-2">
                        {result.croppedImageUrl && (
                          <button
                            type="button"
                            onClick={() => downloadSingleSize(size)}
                            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer">
                            📥 {currentLanguage.value === 'zh' ? `下载 ${size}` : `Download ${size}`}
                          </button>
                        )}
                        <button
                          onClick={() => runForSize(size)}
                          disabled={result.isLoading || !productImagePreview.value}
                          class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {result.isLoading
                            ? (result.hasRun ? t('btnRetrying') : t('btnGenerating'))
                            : (result.hasRun ? t('btnRetry') : t('btnRun'))}
                        </button>
                      </div>
                    </div>
                    {result.isLoading ? (
                      <div class="flex flex-col items-center justify-center h-48">
                        <svg
                          class="animate-spin h-8 w-8 text-primary"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p class="mt-2 text-sm text-on-surface-variant">
                          {t('btnGenerating')}
                        </p>
                      </div>
                    ) : result.error ? (
                      <div class="text-xs text-red-500 p-2 text-center h-48 flex items-center justify-center">
                        {result.error}
                      </div>
                    ) : (
                      <div class="grid grid-cols-2 gap-4">
                        {/* Step 1: Gemini Generated */}
                        <div>
                          <div class="text-xs font-medium text-gray-500 mb-1">
                            {t('generatedImageLabel')} ({result.geminiDimensions || getEstimatedDimensions(size)})
                          </div>
                          <div class="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative">
                            {result.geminiImageUrl ? (
                              <img
                                src={result.geminiImageUrl}
                                alt={`Gemini Result for ${size}`}
                                class="object-contain w-full h-full cursor-pointer"
                                onClick={() => emit('open-preview', result.geminiImageUrl)}
                              />
                            ) : (
                              <div class="text-xs text-gray-400">{t('notStarted')}</div>
                            )}
                          </div>
                        </div>

                        {/* Step 2: Cropped */}
                        <div>
                          <div class="text-xs font-medium text-gray-500 mb-1">
                            {t('croppedImageLabel')} ({size} px)
                          </div>
                          <div class="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative">
                            {result.croppedImageUrl ? (
                              <img
                                src={result.croppedImageUrl}
                                alt={`Cropped Result for ${size}`}
                                class="object-contain w-full h-full cursor-pointer"
                                onClick={() => emit('open-preview', result.croppedImageUrl)}
                              />
                            ) : (
                              <div class="text-xs text-gray-400">{t('notStarted')}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div class="mt-4 text-center">
                    <div class="text-xs font-medium text-gray-500 mb-1">{t('placeholderLabel')}</div>
                    <img
                      src={PLACEHOLDERS[size]}
                      class="h-8 mx-auto mt-1 opacity-50 cursor-pointer"
                      alt="Placeholder"
                      onClick={() => emit('open-preview', PLACEHOLDERS[size])}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Download All Button */}
          <div class="flex justify-end mt-8">
            <button
              onClick={downloadAllCroppedImages}
              class="material-button material-button-primary"
              disabled={!hasCroppedImages.value}
            >
              {t('downloadAllCropped')}
            </button>
          </div>
        </div>
      </div>
    );
  },
});
