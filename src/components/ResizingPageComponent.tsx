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
import {ai, callGenAIApi} from '../services/ai';
import {Template} from '../types';
import {t, currentLanguage, getModelDisplayName} from '../i18n';
import {DEMO_PRODUCTS, DemoProduct} from '../data/demoAssets';

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
      if (size === '970x250') return '1024x256 (顶部全宽横幅)';
      if (size === '300x600') return '384x688 (侧边半版大屏)';
      if (size === '300x250') return '576x464 (黄金中矩形)';
      if (size === '336x280') return '576x464 (大矩形展位)';
      return 'Unknown';
    };
    const productImage = ref<File | null>(null);
    const productImagePreview = ref<string | null>(
      props.initialSourceImage || DEMO_PRODUCTS[0].dataUrl,
    );

    watch(
      () => props.initialSourceImage,
      (newVal) => {
        if (newVal) {
          productImagePreview.value = newVal;
          productImage.value = null;
        }
      },
    );

    const loadDemoProduct = (product: DemoProduct) => {
      productImagePreview.value = product.dataUrl;
      productImage.value = null;
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
      };
    });

    const handleFileChange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        productImage.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          productImagePreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };

    const resolveImageBase64 = async (
      urlOrDataUrl: string,
    ): Promise<{base64: string; mimeType: string}> => {
      if (urlOrDataUrl.startsWith('data:')) {
        const mimeType =
          urlOrDataUrl.match(/data:(.*?);base64/)?.[1] || 'image/png';
        const base64 = urlOrDataUrl.split(',')[1];
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
      result.isLoading = true;
      result.error = null;
      result.geminiImageUrl = null;
      result.croppedImageUrl = null;

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
        const placeholderBase64 = dataUrlToBase64(placeholderDataUrl);
        const placeholderMimeType = 'image/png'; // Assuming PNG from script
        parts.push({
          inlineData: {data: placeholderBase64, mimeType: placeholderMimeType},
        });

        // Prompt
        parts.push({text: prompt.value});

        const modelToUse = genaiModel.value || DEFAULT_IMAGE_MODEL;

        let apiAspectRatio = '1:1';
        if (size === '970x250') apiAspectRatio = '4:1';
        if (size === '300x600') apiAspectRatio = '9:16';
        if (size === '300x250') apiAspectRatio = '5:4';
        if (size === '336x280') apiAspectRatio = '5:4';

        let apiResolution = '1K';
        if (size === '970x250') apiResolution = modelToUse === 'gemini-3.1-flash-image' ? '512' : '1K';
        if (size === '300x600') apiResolution = modelToUse === 'gemini-3.1-flash-image' ? '512' : '1K';
        if (size === '300x250') apiResolution = modelToUse === 'gemini-3.1-flash-image' ? '512' : '1K';
        if (size === '336x280') apiResolution = modelToUse === 'gemini-3.1-flash-image' ? '512' : '1K';

        let response;
        if (useVertexAi) {
          response = await callGenAIApi({
            model: modelToUse,
            contents: {
              role: 'user',
              parts,
            },
            config: {
              responseModalities: [Modality.IMAGE],
              imageConfig: {
                aspectRatio: apiAspectRatio,
                imageSize: apiResolution,
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
                imageSize: apiResolution,
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

          // Step 2: 代码精确裁剪
          const [targetW, targetH] = size.split('x').map(Number);
          const {croppedImageUrl, originalWidth, originalHeight} = await cropImageToSize(geminiImage, targetW, targetH);
          result.croppedImageUrl = croppedImageUrl;
          result.geminiDimensions = `${originalWidth}x${originalHeight}`;
        } else {
          throw new Error('No image returned.');
        }
      } catch (e: unknown) {
        console.error(`Error generating for ${size}:`, e);
        result.error = e instanceof Error ? e.message : 'Error occurred.';
      } finally {
        result.isLoading = false;
        result.hasRun = true;
      }
    };

    const runAllSelected = async () => {
      const promises = sizes
        .filter((size) => selectedSizes[size])
        .map((size) => runForSize(size));
      await Promise.all(promises);
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
          <div class="flex justify-between items-center mb-2">
            <div>
              <h2 class="text-xl font-bold">{t('resizerTitle')}</h2>
              <p class="text-xs text-gray-500 mt-1">{t('resizerSubtitle')}</p>
            </div>
            <div class="flex items-center space-x-4">
              <button
                onClick={runAllSelected}
                class="material-button material-button-primary"
                disabled={!productImagePreview.value}>
                {t('startResizing')}
              </button>
              <button
                onClick={() => emit('change-template')}
                class="text-sm text-primary font-medium hover:underline">
                {currentLanguage.value === 'zh' ? '← 返回模板库' : '← Back to Library'}
              </button>
            </div>
          </div>

          {/* Step 1: Gemini 生成图片 */}
          <div class="material-card">
            <div class="step-title">{currentLanguage.value === 'zh' ? '步骤 1: 使用 Gemini 生成基础多模态图像' : 'Step 1: Generate Base Image with Gemini'}</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-on-surface-variant mb-1">
                  {t('model')}
                </label>
                <select
                  value={genaiModel.value}
                  onChange={(e: Event) =>
                    (genaiModel.value = (e.target as HTMLInputElement).value)
                  }
                  class="material-input bg-white">
                  {supportedModels.map((model) => (
                    <option key={model} value={model}>
                      {getModelDisplayName(model)}
                    </option>
                  ))}
                </select>
              </div>

              <div class="md:col-span-2 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold text-indigo-900 flex items-center gap-1">
                  <span>💡 示例商品一键填入 (无需自己准备图片):</span>
                </span>
                <div class="flex flex-wrap items-center gap-1.5">
                  {DEMO_PRODUCTS.map((prod) => (
                    <button
                      type="button"
                      key={prod.id}
                      onClick={() => loadDemoProduct(prod)}
                      class="px-2.5 py-1 text-xs rounded-lg bg-white border border-indigo-100 text-gray-800 font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-2xs flex items-center gap-1">
                      <span>{prod.icon}</span>
                      <span>{currentLanguage.value === 'zh' ? prod.name : prod.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-on-surface-variant mb-1">
                  {currentLanguage.value === 'zh' ? '原版商品主体图 (Asset 1)' : 'Product Image (Asset 1)'}
                </label>
                <div class="flex items-center space-x-4">
                  <label class="cursor-pointer flex-1">
                    <div class="p-2 border-2 border-dashed border-outline rounded-lg text-center hover:bg-gray-50 flex items-center justify-center min-h-[42px] bg-gray-50">
                      {productImagePreview.value ? (
                        <img
                          src={productImagePreview.value}
                          class="max-h-12 mx-auto rounded"
                          alt="Product preview"
                        />
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

              <div>
                <label class="block text-sm font-medium text-on-surface-variant mb-2">
                  {t('targetSizesLabel')}
                </label>
                <div class="grid grid-cols-2 gap-2">
                  {sizes.map((size) => (
                    <label key={size} class="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        v-model={selectedSizes[size]}
                        class="form-checkbox h-4 w-4 text-primary rounded border-outline focus:ring-primary"
                      />
                      <span class="text-sm text-on-surface">{size}</span>
                    </label>
                  ))}
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

              return (
                <div key={size} class="material-card flex flex-col justify-between col-span-1 lg:col-span-2">
                  <div>
                    <div class="flex justify-between items-center mb-2">
                      <h3 class="font-bold text-md">{size}</h3>
                      <button
                        onClick={() => runForSize(size)}
                        disabled={result.isLoading || !productImagePreview.value}
                        class="text-xs font-medium text-primary hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                      >
                        {result.isLoading
                          ? (result.hasRun ? t('btnRetrying') : t('btnGenerating'))
                          : (result.hasRun ? t('btnRetry') : t('btnRun'))}
                      </button>
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
                          <div class="text-xs font-medium text-gray-500 mb-1">{t('croppedImageLabel')}</div>
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
