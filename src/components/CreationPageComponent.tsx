/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Modality, Part} from '@google/genai';
import {defineComponent, PropType, reactive, ref, watch} from 'vue';
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_TEXT_MODEL,
  PROMPT_HELPER_PROMPT,
  SUPPORTED_IMAGE_MODELS,
  useVertexAi,
} from '../constants';
import {ai, callGenAIApi, reportClientLog} from '../services/ai';
import {
  ImageInput,
  StepResult,
  StepState,
  Template,
  TemplateStep,
  TextVariable,
} from '../types';
import {t, currentLanguage, getModelDisplayName} from '../i18n';
import {
  DEMO_PRODUCTS,
  DEMO_LOGOS,
  DEMO_MODELS,
  PROMPT_SCENE_CHIPS,
  DemoProduct,
  DemoModel,
} from '../data/demoAssets';
import {TEMPLATES} from '../data/templates';

const LOGO_POSITIONS = [
  {id: 'top-left', labelZh: '↖ 左上角', labelEn: '↖ Top Left', promptDesc: 'top-left corner with clean margin'},
  {id: 'top-center', labelZh: '↑ 顶部居中', labelEn: '↑ Top Center', promptDesc: 'top-center header area'},
  {id: 'top-right', labelZh: '↗ 右上角', labelEn: '↗ Top Right', promptDesc: 'top-right corner with clean margin'},
  {id: 'bottom-left', labelZh: '↙ 左下角', labelEn: '↙ Bottom Left', promptDesc: 'bottom-left corner with clean margin'},
  {id: 'bottom-center', labelZh: '↓ 底部居中', labelEn: '↓ Bottom Center', promptDesc: 'bottom-center signature position'},
  {id: 'bottom-right', labelZh: '↘ 右下角', labelEn: '↘ Bottom Right', promptDesc: 'bottom-right corner with clean margin'},
];

const LOGO_SCALES = [
  {id: 'subtle', labelZh: '精致小标 (10%)', labelEn: 'Subtle (10%)', promptDesc: 'subtle, refined luxury scale (~10% of canvas width)'},
  {id: 'balanced', labelZh: '标准商业标 (15%)', labelEn: 'Balanced (15%)', promptDesc: 'balanced commercial scale (~15% of canvas width)'},
  {id: 'prominent', labelZh: '醒目主标 (22%)', labelEn: 'Prominent (22%)', promptDesc: 'prominent hero brand scale (~22% of canvas width)'},
];

/**
 * A Vue component for creating and editing templates.
 * It allows users to define steps, add text variables, upload images, and generate new images using AI.
 */
export const CreationPageComponent = defineComponent({
  name: 'CreationPageComponent',
  props: {
    initialTemplate: {
      type: Object as PropType<Template | null>,
      default: null,
    },
    isSaving: {
      type: Boolean,
      required: true,
    },
    getTemplateAssets: {
      type: Function as PropType<
        (
          folderId: string,
          steps: TemplateStep[],
        ) => Promise<Record<string, string>>
      >,
      required: true,
    },
  },
  emits: [
    'save-template-to-drive',
    'change-template',
    'create-new',
    'open-preview',
    'send-to-resizer',
  ],
  setup(props, {emit}) {
    const templateName = ref('');
    const aspectRatio = ref('1:1');
    const genaiModel = ref(DEFAULT_IMAGE_MODEL);
    const steps = reactive<StepState[]>([]);
    const results = reactive<Record<string, StepResult>>({});
    const stepMeta = reactive<
      Record<string, {dimensions: string; durationSec: string; compareBase: boolean}>
    >({});
    const logoPosition = ref('bottom-center');
    const logoScale = ref('balanced');
    const previewImageFile = ref<File | null>(null);
    const previewImagePreview = ref<string | null>(null);
    const usePreviewAsModelRef = ref(false);
    const isLoadingTemplate = ref(false);
    const supportedModels = SUPPORTED_IMAGE_MODELS;

    const loadTemplate = async (template: Template) => {
      templateName.value = template.name;
      aspectRatio.value = template.aspect_ratio;
      genaiModel.value = template.genai_model || DEFAULT_IMAGE_MODEL;
      steps.splice(0, steps.length);
      Object.keys(results).forEach((key) => delete results[key]);
      Object.keys(stepMeta).forEach((key) => delete stepMeta[key]);
      previewImageFile.value = null;
      previewImagePreview.value = template.previewImage || null;
      usePreviewAsModelRef.value = false;

      let staticAssets: Record<string, string> = {};
      if (template.driveFolderId) {
        // Fetch static assets from drive
        staticAssets = await props.getTemplateAssets(
          template.driveFolderId,
          template.steps,
        );
      }

      template.steps.forEach((stepData, index) => {
        const stepId = `step-${index}`;
        const imageInputs: ImageInput[] = stepData.image_slots.map(
          (slot, i) => {
            let preview = staticAssets[slot.asset_name] || null;
            let defaultFileName = slot.default_file_name;
            if (!preview) {
              if (index === 0 && i === 0) {
                preview = DEMO_PRODUCTS[0].dataUrl;
                defaultFileName = 'sample_luxury_perfume.png';
              } else if (index === 1 && (slot.asset_name === 'asset2' || i === 0)) {
                preview = DEMO_LOGOS[0].dataUrl;
                defaultFileName = 'sample_lumina_logo.png';
              }
            }
            return {
              assetName: slot.asset_name,
              isStatic: slot.is_static,
              file: null,
              previewUrl: preview,
              defaultFileName: defaultFileName,
              isLoading: false,
            };
          },
        );

        const textVariables: TextVariable[] = (
          stepData.text_variables || []
        ).map((tv) => ({...tv}));

        steps.push({
          id: stepId,
          title: stepData.name,
          prompt: stepData.text_prompt,
          imageInputs,
          textVariables,
          isGeneratingPrompt: false,
        });
        results[stepId] = {
          id: `result-${index}`,
          title: stepData.name,
          imageUrl: null,
          isLoading: false,
          error: null,
        };
      });
    };

    watch(
      () => props.initialTemplate,
      async (newTemplate) => {
        if (newTemplate) {
          isLoadingTemplate.value = true;
          try {
            await loadTemplate(newTemplate);
          } catch (e) {
            console.error('Error loading template data:', e);
            alert(
              'There was a problem loading the template. Please try again.',
            );
            // Reset state on failure
            templateName.value = '';
            aspectRatio.value = '1:1';
            genaiModel.value = DEFAULT_IMAGE_MODEL;
            steps.splice(0, steps.length);
            Object.keys(results).forEach((key) => delete results[key]);
            previewImageFile.value = null;
            previewImagePreview.value = null;
          } finally {
            isLoadingTemplate.value = false;
          }
        } else {
          // Zero Cold-Start: Load default flagship template instead of empty screen
          isLoadingTemplate.value = true;
          try {
            await loadTemplate(TEMPLATES[0]);
          } catch (e) {
            console.error('Failed to load default template:', e);
          } finally {
            isLoadingTemplate.value = false;
          }
        }
      },
      {immediate: true},
    );

    const addStep = () => {
      const stepIndex = steps.length;
      const stepId = `step-${stepIndex}`;
      steps.push({
        id: stepId,
        title: `Step ${stepIndex + 1}: Additional Edit`,
        prompt: '',
        imageInputs: [
          {
            assetName: `asset${stepIndex * 2 + 2}`,
            isStatic: false,
            file: null,
            previewUrl: null,
            isLoading: false,
          },
        ],
        textVariables: [],
        isGeneratingPrompt: false,
      });
      results[stepId] = {
        id: `result-${stepIndex}`,
        title: `Step ${stepIndex + 1}: Additional Edit`,
        imageUrl: null,
        isLoading: false,
        error: null,
      };
    };

    const addImageSlot = (stepIndex: number) => {
      const step = steps[stepIndex];
      let maxAssetNum = 0;
      steps.forEach((s) => {
        s.imageInputs.forEach((input) => {
          const match = input.assetName.match(/^asset(\d+)$/);
          if (match) {
            const num = Number(match[1]);
            if (!isNaN(num) && num > maxAssetNum) {
              maxAssetNum = num;
            }
          }
        });
      });
      const newAssetNumber = maxAssetNum + 1;
      step.imageInputs.push({
        assetName: `asset${newAssetNumber}`,
        isStatic: false,
        file: null,
        previewUrl: null,
        isLoading: false,
      });
    };

    const removeImageSlot = (stepIndex: number, imgIndex: number) => {
      steps[stepIndex].imageInputs.splice(imgIndex, 1);
    };

    const addTextVariable = (stepIndex: number) => {
      steps[stepIndex].textVariables.push({name: '', default_value: ''});
    };
    const deleteTextVariable = (stepIndex: number, varIndex: number) => {
      steps[stepIndex].textVariables.splice(varIndex, 1);
    };

    const deleteStep = (index: number) => {
      const stepId = steps[index].id;
      steps.splice(index, 1);
      delete results[stepId];
    };

    const handleFileChange = (event: Event, imageInput: ImageInput) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        imageInput.file = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          imageInput.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };

    const handlePreviewFileChange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        previewImageFile.value = file;
        usePreviewAsModelRef.value = true;
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImagePreview.value = e.target?.result as string;
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

    const runStep = async (step: StepState, index: number) => {
      const result = results[step.id];
      if (!step.prompt) {
        alert(`Please provide a prompt for ${step.title}.`);
        return;
      }

      const startTime = Date.now();
      result.isLoading = true;
      result.error = null;
      result.imageUrl = null;
      stepMeta[step.id] = {
        dimensions: '',
        durationSec: '',
        compareBase: false,
      };

      try {
        const parts: Part[] = [];
        // Handle image inputs in order
        // 1. Previous step's result
        if (index > 0) {
          const prevStep = steps[index - 1];
          const prevResult = results[prevStep.id];
          if (prevResult.imageUrl) {
            const {base64, mimeType} = await resolveImageBase64(
              prevResult.imageUrl,
            );
            parts.push({inlineData: {data: base64, mimeType}});
          } else {
            throw new Error(
              `Please run '${prevStep.title}' to generate an image for this step.`,
            );
          }
        }

        // 2. Current step's uploaded/static images
        for (const imageInput of step.imageInputs) {
          if (imageInput.previewUrl) {
            const {base64, mimeType} = await resolveImageBase64(
              imageInput.previewUrl,
            );
            parts.push({inlineData: {data: base64, mimeType}});
          }
        }

        // 3. Optional Model / Style Reference Image from Cover/Model slot (Step 1)
        let injectedModelRef = false;
        if (
          index === 0 &&
          (usePreviewAsModelRef.value || previewImageFile.value) &&
          previewImagePreview.value
        ) {
          const {base64, mimeType} = await resolveImageBase64(
            previewImagePreview.value,
          );
          parts.push({inlineData: {data: base64, mimeType}});
          injectedModelRef = true;
        }

        if (parts.length === 0) {
          throw new Error('Please upload at least one image to run this step.');
        }

        // Substitute text variables
        let promptToSend = step.prompt;
        for (const variable of step.textVariables) {
          if (variable.name) {
            const regex = new RegExp(`{{${variable.name.trim()}}}`, 'g');
            promptToSend = promptToSend.replace(
              regex,
              variable.default_value || '',
            );
          }
        }

        if (injectedModelRef) {
          promptToSend +=
            '\n\n[Model & Style Reference Instruction: An additional reference image has been provided as the last image input. Use the person/model appearance, pose, and outfit styling from that reference image as inspiration, while strictly featuring and preserving the primary product from the first image input (asset1).]';
        }

        if (index === 1) {
          const posObj =
            LOGO_POSITIONS.find((p) => p.id === logoPosition.value) ||
            LOGO_POSITIONS[4];
          const scaleObj =
            LOGO_SCALES.find((s) => s.id === logoScale.value) || LOGO_SCALES[1];
          promptToSend += `\n\n[Designer Layout Guidance: Place the transparent brand logo from asset2 cleanly in the ${posObj.promptDesc} at a ${scaleObj.promptDesc}, preserving 100% of the transparent background with no rectangular box around the logo.]`;
        }

        parts.push({text: promptToSend});

        const modelToUse = genaiModel.value || DEFAULT_IMAGE_MODEL;

        let response;
        if (useVertexAi) {
          response = await callGenAIApi({
            model: modelToUse,
            stepTag: step.title,
            contents: {
              role: 'user',
              parts,
            },
            config: {
              responseModalities: [Modality.IMAGE],
              imageConfig: {aspectRatio: aspectRatio.value},
            },
          });
        } else {
          response = await ai.models.generateContent({
            model: modelToUse,
            contents: {parts},
            config: {
              responseModalities: [Modality.IMAGE],
              imageConfig: {aspectRatio: aspectRatio.value},
            },
          });
        }

        const imagePart = response.candidates?.[0]?.content?.parts?.find(
          (p: Part) => p.inlineData,
        );
        if (imagePart?.inlineData) {
          const dataUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
          result.imageUrl = dataUrl;
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
          stepMeta[step.id].durationSec = elapsed;
          const img = new Image();
          img.onload = () => {
            if (stepMeta[step.id]) {
              stepMeta[step.id].dimensions = `${img.naturalWidth}×${img.naturalHeight} px`;
            }
          };
          img.src = dataUrl;
        } else {
          throw new Error(
            'The model did not return an image. Try a different prompt.',
          );
        }
      } catch (e: unknown) {
        console.error('Error running step:', e);
        const errMsg =
          e instanceof Error
            ? e.message
            : 'An error occurred while generating the image.';
        result.error = errMsg;
        reportClientLog({
          status: 499,
          model: genaiModel.value || DEFAULT_IMAGE_MODEL,
          stepTag: step.title,
          durationMs: Date.now() - startTime,
          prompt: step.prompt,
          error: errMsg,
        });
      } finally {
        result.isLoading = false;
      }
    };

    const helpMeWritePrompt = (step: StepState) => {
      const inputEl = document.getElementById(`prompt-helper-input-${step.id}`);
      if (inputEl) {
        inputEl.click();
      }
    };

    const handlePromptHelperUpload = async (event: Event, step: StepState) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      step.isGeneratingPrompt = true;
      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64Data = dataUrl.split(',')[1];
        const mimeType = dataUrl.match(/data:(.*);base64/)?.[1] || 'image/png';

        const imagePart = {inlineData: {data: base64Data, mimeType}};
        const textPart = {text: PROMPT_HELPER_PROMPT};

        if (useVertexAi) {
          const response = await callGenAIApi({
            model: DEFAULT_TEXT_MODEL,
            contents: {
              role: 'user',
              parts: [imagePart, textPart],
            },
          });
          // When using the server proxy, the response is plain JSON, so we can't use the .text getter.
          step.prompt =
            response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          const response = await ai.models.generateContent({
            model: DEFAULT_TEXT_MODEL,
            contents: {parts: [imagePart, textPart]},
          });
          step.prompt = response.text ? response.text.trim() : '';
        }
      } catch (e: unknown) {
        console.error('Error generating prompt:', e);
        let message = 'An unknown error occurred.';
        if (e instanceof Error) {
          message = e.message;
        }
        alert('Failed to generate prompt. ' + message);
      } finally {
        step.isGeneratingPrompt = false;
        // Reset the file input value so the same file can be selected again
        (event.target as HTMLInputElement).value = '';
      }
    };

    const loadDemoProduct = (step: StepState, product: DemoProduct) => {
      if (step.imageInputs[0]) {
        step.imageInputs[0].previewUrl = product.dataUrl;
        step.imageInputs[0].defaultFileName = `${product.id}.png`;
      }
    };

    const appendSceneChip = (step: StepState, sceneText: string) => {
      if (step.prompt.trim()) {
        step.prompt = `${step.prompt.trim()} ${sceneText}`;
      } else {
        step.prompt = sceneText;
      }
    };

    const isPipelineRunning = ref(false);

    const runFullPipeline = async () => {
      if (steps.length === 0) return;
      isPipelineRunning.value = true;
      try {
        // Step 0 execution
        await runStep(steps[0], 0);
        const step0Result = results[steps[0].id];
        if (!step0Result?.imageUrl) {
          throw new Error(step0Result?.error || 'Step 1 generation did not produce an image.');
        }

        // Step 1 (Logo overlay step, if present)
        if (steps.length > 1) {
          const step1 = steps[1];
          if (step1.imageInputs[0] && !step1.imageInputs[0].previewUrl) {
            step1.imageInputs[0].previewUrl = DEMO_LOGOS[0].dataUrl;
            step1.imageInputs[0].defaultFileName = 'sample_lumina_logo.png';
          }
          try {
            await runStep(step1, 1);
          } catch (e) {
            console.warn('Step 2 logo overlay failed, maintaining Step 1 high-res image as final result:', e);
            results[step1.id].imageUrl = step0Result.imageUrl;
            results[step1.id].error = null;
          }
        }
      } catch (err: unknown) {
        console.error('Pipeline failed:', err);
      } finally {
        isPipelineRunning.value = false;
      }
    };

    const sendToResizer = (imageUrl: string) => {
      emit('send-to-resizer', imageUrl);
    };

    const downloadImage = (url: string, filename = 'ad-creative.png') => {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const copyImageToClipboard = async (url: string) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({[blob.type]: blob}),
        ]);
        alert(t('imageCopied'));
      } catch (e) {
        console.error('Clipboard copy failed, downloading instead:', e);
        downloadImage(url);
      }
    };

    const saveTemplate = async () => {
      if (!templateName.value.trim()) {
        alert('Please enter a name for your template.');
        return;
      }
      const filesToSave: Record<string, File> = {};
      const previewImageFileName = `preview.${previewImageFile.value?.name.split('.').pop() || 'png'}`;
      if (previewImageFile.value) {
        filesToSave[previewImageFileName] = previewImageFile.value;
      }

      const templateData: Template = {
        id: `custom-${Date.now()}`,
        name: templateName.value,
        description: `Custom template created on ${new Date().toLocaleDateString()}`,
        previewImage: previewImageFile.value
          ? previewImageFileName
          : props.initialTemplate?.previewImageFileName || '',
        aspect_ratio: aspectRatio.value,
        genai_model: genaiModel.value,
        steps: steps.map((s, stepIndex) => {
          return {
            name: s.title,
            text_prompt: s.prompt,
            image_slots: s.imageInputs.map((input, inputIndex) => {
              let fileName: string | undefined;
              if (input.isStatic && input.file) {
                const extension = input.file.name.split('.').pop() || 'png';
                fileName = `step_${stepIndex}_asset_${inputIndex}.${extension}`;
                filesToSave[fileName] = input.file;
              } else if (input.isStatic && input.defaultFileName) {
                fileName = input.defaultFileName;
              }
              return {
                asset_name: input.assetName,
                is_static: input.isStatic,
                default_file_name: fileName,
              };
            }),
            text_variables: s.textVariables
              .map((tv) => ({
                name: tv.name.trim(),
                default_value: tv.default_value.trim(),
              }))
              .filter((tv) => tv.name), // Only save variables with a name
          };
        }),
        previewImageFileName: previewImageFile.value
          ? previewImageFileName
          : props.initialTemplate?.previewImageFileName,
      };
      emit('save-template-to-drive', templateData, filesToSave, props.initialTemplate?.driveFolderId);
    };

    return () => (
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-full">
        {isLoadingTemplate.value ? (
          <div class="flex flex-col items-center justify-center h-full text-center py-20">
            <svg
              class="animate-spin h-12 w-12 text-primary mx-auto"
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
            <h2 class="mt-4 text-xl font-bold text-on-surface">
              Loading Template...
            </h2>
            <p class="mt-2 text-md text-on-surface-variant">
              Please wait while we prepare your creative canvas.
            </p>
          </div>
        ) : steps.length > 0 ? (
          <div class="flex flex-col space-y-8">
            {/* Top Section: Settings */}
            <div class="material-card">
              <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                  <h2 class="text-xl font-black text-gray-900 flex items-center gap-2">
                    <span>{t('templateSettings')}</span>
                    <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                      {genaiModel.value}
                    </span>
                  </h2>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={runFullPipeline}
                    disabled={isPipelineRunning.value}
                    class="material-button material-button-primary bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0">
                    {isPipelineRunning.value ? (
                      <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      <span>🚀</span>
                    )}
                    <span class="whitespace-nowrap">{isPipelineRunning.value ? t('runningPipeline') : t('runFullPipeline')}</span>
                  </button>
                  <button
                    onClick={() => emit('change-template')}
                    class="text-sm text-primary font-medium hover:underline px-2 py-1 whitespace-nowrap shrink-0">
                    {currentLanguage.value === 'zh' ? '← 返回模板库' : '← Back to Library'}
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label
                    for="templateName"
                    class="block text-sm font-medium text-on-surface-variant mb-1">
                    {t('templateName')}
                  </label>
                  <input
                    type="text"
                    id="templateName"
                    value={templateName.value}
                    onInput={(e: Event) =>
                      (templateName.value = (
                        e.target as HTMLInputElement
                      ).value)
                    }
                    class="material-input bg-white"
                    placeholder={currentLanguage.value === 'zh' ? '例如：高端美妆产品大片' : 'e.g., Product Lifestyle Shot'}
                  />
                </div>
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
                <div>
                  <label class="block text-sm font-medium text-on-surface-variant mb-1">
                    {t('aspectRatio')}
                  </label>
                  <select
                    value={aspectRatio.value}
                    onChange={(e: Event) =>
                      (aspectRatio.value = (e.target as HTMLInputElement).value)
                    }
                    class="material-input bg-white">
                    <optgroup label={currentLanguage.value === 'zh' ? '正方形 (1:1)' : 'Square'}>
                      <option>1:1</option>
                    </optgroup>
                    <optgroup label={currentLanguage.value === 'zh' ? '横屏比例 (Landscape)' : 'Landscape'}>
                      <option>21:9</option>
                      <option>16:9</option>
                      <option>3:2</option>
                      <option>4:3</option>
                      <option>5:4</option>
                    </optgroup>
                    <optgroup label={currentLanguage.value === 'zh' ? '竖屏比例 (Portrait)' : 'Portrait'}>
                      <option>9:16</option>
                      <option>2:3</option>
                      <option>3:4</option>
                      <option>4:5</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1 gap-1">
                    <label class="block text-sm font-medium text-on-surface-variant whitespace-nowrap">
                      {t('previewImage')}
                    </label>
                    {previewImagePreview.value && (
                      <button
                        type="button"
                        onClick={() => {
                          usePreviewAsModelRef.value =
                            !usePreviewAsModelRef.value;
                        }}
                        class={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                          usePreviewAsModelRef.value
                            ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-amber-50 hover:text-amber-800'
                        }`}
                        title={
                          currentLanguage.value === 'zh'
                            ? '开启后将此图作为步骤 1 的人物模特/穿搭风格参考输入给大模型'
                            : 'When enabled, feeds this image into Step 1 as model/outfit style reference'
                        }>
                        {usePreviewAsModelRef.value
                          ? currentLanguage.value === 'zh'
                            ? '✨ 已启用模特参考'
                            : '✨ Model Ref ON'
                          : currentLanguage.value === 'zh'
                            ? '👤 作为模特参考'
                            : '👤 Use as Model Ref'}
                      </button>
                    )}
                  </div>
                  <label
                    for="preview-image-file"
                    class="mt-1 block cursor-pointer">
                    <div
                      class={`p-2 border-2 border-dashed rounded-lg text-center hover:bg-gray-50 flex items-center justify-center min-h-[42px] transition-colors ${
                        usePreviewAsModelRef.value
                          ? 'border-amber-500 bg-amber-50/40'
                          : 'border-outline bg-gray-50'
                      }`}>
                      {previewImagePreview.value ? (
                        <div class="flex items-center gap-2">
                          <img
                            src={previewImagePreview.value}
                            class="max-h-12 mx-auto rounded shadow-2xs"
                            alt="Preview / Model reference"
                          />
                          <span class="text-[11px] text-gray-500 leading-tight text-left hidden xl:inline-block">
                            {previewImageFile.value
                              ? currentLanguage.value === 'zh'
                                ? '已上传自定义模特/参考图'
                                : 'Custom Model Ref Uploaded'
                              : currentLanguage.value === 'zh'
                                ? '点击更换模特/封面图'
                                : 'Click to replace model/cover'}
                          </span>
                        </div>
                      ) : (
                        <div class="flex items-center space-x-2 text-xs text-on-surface-variant">
                          <svg
                            class="h-6 w-6 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48">
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"></path>
                          </svg>
                          <span>{t('dragOrClick')}</span>
                        </div>
                      )}
                    </div>
                  </label>
                  <p class="mt-1 text-[11px] text-gray-500 leading-snug">
                    💡 {t('previewImageHint')}
                  </p>
                  <input
                    type="file"
                    id="preview-image-file"
                    onChange={handlePreviewFileChange}
                    class="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
              <div class="mt-6 text-right">
                <button
                  onClick={saveTemplate}
                  class="material-button material-button-primary"
                  disabled={props.isSaving}>
                  {props.isSaving ? (
                    <svg
                      class="animate-spin h-5 w-5 mr-2 text-white"
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
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                  )}
                  {props.isSaving ? t('saving') : t('saveTemplate')}
                </button>
              </div>
            </div>

            {/* Bottom Section: Steps & Results */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Steps Column */}
              <div class="lg:col-span-2 space-y-6">
                {steps.map((step, index) => (
                  <div key={step.id} class="material-card relative">
                    {steps.length > 1 && (
                      <button
                        onClick={() => deleteStep(index)}
                        class="absolute top-4 right-4 p-1 text-on-surface-variant hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                        aria-label={'Delete ' + step.title}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                    <input
                      type="text"
                      value={step.title}
                      onInput={(e: Event) => {
                        step.title = (e.target as HTMLInputElement).value;
                        results[step.id].title = (
                          e.target as HTMLInputElement
                        ).value;
                      }}
                      class="step-title"
                    />
                    <textarea
                      value={step.prompt}
                      onInput={(e: Event) =>
                        (step.prompt = (e.target as HTMLInputElement).value)
                      }
                      class="material-input bg-white"
                      rows={3}
                      placeholder={t('promptPlaceholder')}></textarea>

                    {/* 场景风格灵感快捷芯片 */}
                    <div class="mt-2.5 p-2 bg-gray-50 rounded-lg border border-gray-200/60 flex flex-wrap items-center gap-1.5">
                      <span class="text-[11px] font-bold text-gray-500 flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <span>{t('sceneChipsTitle')}</span>
                      </span>
                      {PROMPT_SCENE_CHIPS.map((chip) => (
                        <button
                          type="button"
                          key={chip.label}
                          onClick={() => appendSceneChip(step, chip.text)}
                          class="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all border border-gray-200 shadow-2xs whitespace-nowrap shrink-0">
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <div class="text-right mt-2 text-sm">
                      {step.isGeneratingPrompt ? (
                        <span class="text-on-surface-variant inline-flex items-center">
                          <svg
                            class="animate-spin h-4 w-4 mr-1.5"
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
                          {t('generatingPrompt')}
                        </span>
                      ) : (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            helpMeWritePrompt(step);
                          }}
                          class="text-primary font-medium hover:underline">
                          {t('helpPrompt')}
                        </a>
                      )}
                    </div>
                    <input
                      type="file"
                      id={`prompt-helper-input-${step.id}`}
                      onChange={(e) => handlePromptHelperUpload(e, step)}
                      class="hidden"
                      accept="image/*"
                    />

                    <div class="mt-4 pt-4 border-t border-outline">
                      <h4 class="text-sm font-semibold mb-2 text-on-surface-variant">
                        Text Variables
                      </h4>
                      {step.textVariables.length === 0 ? (
                        <div class="text-center text-xs text-gray-500 py-2">
                          No variables defined. Click below to add one.
                        </div>
                      ) : (
                        <div class="space-y-2">
                          {step.textVariables.map((variable, varIndex) => (
                            <div
                              key={varIndex}
                              class="flex items-center space-x-2">
                              <input
                                type="text"
                                value={variable.name}
                                onInput={(e: Event) =>
                                  (variable.name = (
                                    e.target as HTMLInputElement
                                  ).value)
                                }
                                placeholder="Variable Name (e.g., CTA)"
                                class="material-input text-sm p-2 flex-1 bg-white"
                              />
                              <input
                                type="text"
                                value={variable.default_value}
                                onInput={(e: Event) =>
                                  (variable.default_value = (
                                    e.target as HTMLInputElement
                                  ).value)
                                }
                                placeholder="Default Value (e.g., Shop Now)"
                                class="material-input text-sm p-2 flex-1 bg-white"
                              />
                              <button
                                onClick={() =>
                                  deleteTextVariable(index, varIndex)
                                }
                                class="p-1.5 text-on-surface-variant hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                                aria-label="Delete variable">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => addTextVariable(index)}
                        class="material-button material-button-secondary w-full mt-3 text-sm py-1.5">
                        Add Variable
                      </button>
                    </div>

                    {index > 0 && (
                      <div class="mt-4 p-3 border border-dashed border-outline rounded-lg text-center bg-gray-50">
                        <p class="text-sm text-on-surface-variant">
                          Uses result from Step {index} as asset1.
                        </p>
                      </div>
                    )}

                    {index === 0 && (
                      <div class="space-y-3 mt-4">
                        <div class="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 shadow-2xs">
                          <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="text-xs font-bold text-indigo-900 flex items-center gap-1 shrink-0 whitespace-nowrap">
                              <span>
                                {currentLanguage.value === 'zh'
                                  ? '💡 示例商品矩阵一键填入 (12款全品类棚拍主图 · 无需自己准备图片):'
                                  : '💡 12-Product Studio Packshot Matrix (1-Click Fill):'}
                              </span>
                            </span>
                          </div>
                          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {DEMO_PRODUCTS.map((prod) => {
                              const isSelected =
                                step.imageInputs[0]?.previewUrl === prod.dataUrl;
                              return (
                                <button
                                  type="button"
                                  key={prod.id}
                                  onClick={() => loadDemoProduct(step, prod)}
                                  class={`p-2 text-left rounded-lg bg-white border transition-all flex items-center gap-2.5 group cursor-pointer ${
                                    isSelected
                                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs bg-indigo-50/30'
                                      : 'border-indigo-100 hover:border-indigo-500 hover:shadow-sm'
                                  }`}>
                                  <img
                                    src={prod.dataUrl}
                                    alt={prod.name}
                                    class="w-11 h-11 rounded-md object-cover border border-indigo-100 shrink-0 bg-gray-50"
                                  />
                                  <div class="overflow-hidden min-w-0">
                                    <div class="text-xs font-bold text-gray-800 group-hover:text-indigo-600 truncate">
                                      {currentLanguage.value === 'zh'
                                        ? prod.name
                                        : prod.nameEn}
                                    </div>
                                    <div class="text-[10px] text-gray-500 truncate">
                                      {prod.category}
                                    </div>
                                    <div class="text-[10px] text-indigo-600 font-semibold truncate">
                                      {isSelected ? '✓ 当前已选商品' : '点击一键填入'}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div class="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200/80 shadow-2xs">
                          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span class="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                              <span>
                                {currentLanguage.value === 'zh'
                                  ? '👤 预设模特 / 穿搭风格参考图库 (点击缩略图一键选用，也可在顶部自行上传):'
                                  : '👤 Preset Model / Style Reference Library (1-Click Thumbnail Select):'}
                              </span>
                            </span>
                            {usePreviewAsModelRef.value && (
                              <button
                                type="button"
                                onClick={() => {
                                  usePreviewAsModelRef.value = false;
                                  previewImageFile.value = null;
                                  previewImagePreview.value =
                                    props.initialTemplate?.previewImage || null;
                                }}
                                class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-purple-800 border border-purple-300 hover:bg-purple-100 transition-colors cursor-pointer whitespace-nowrap">
                                {currentLanguage.value === 'zh'
                                  ? '↺ 恢复默认封面 (不指定特定模特)'
                                  : '↺ Reset to Default Cover'}
                              </button>
                            )}
                          </div>
                          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {DEMO_MODELS.map((m: DemoModel) => {
                              const isSelected =
                                usePreviewAsModelRef.value &&
                                previewImagePreview.value === m.dataUrl;
                              return (
                                <button
                                  type="button"
                                  key={m.id}
                                  onClick={() => {
                                    previewImageFile.value = null;
                                    previewImagePreview.value = m.dataUrl;
                                    usePreviewAsModelRef.value = true;
                                  }}
                                  class={`p-1.5 text-left rounded-lg bg-white border transition-all flex items-center gap-2 group cursor-pointer ${
                                    isSelected
                                      ? 'border-purple-600 ring-2 ring-purple-500/25 bg-purple-50/30 shadow-xs'
                                      : 'border-purple-100 hover:border-purple-400 hover:shadow-sm'
                                  }`}>
                                  <img
                                    src={m.dataUrl}
                                    alt={m.name}
                                    class="w-10 h-12 rounded-md object-cover border border-purple-100 shrink-0 shadow-2xs"
                                  />
                                  <div class="overflow-hidden flex-1">
                                    <div class="text-xs font-bold text-gray-800 group-hover:text-purple-800 truncate">
                                      {currentLanguage.value === 'zh'
                                        ? m.name.split(' (')[0]
                                        : m.nameEn.split(' (')[0]}
                                    </div>
                                    <div class="text-[10px] text-gray-500 truncate">
                                      {m.styleTag}
                                    </div>
                                    <div
                                      class={`text-[10px] font-semibold truncate ${
                                        isSelected
                                          ? 'text-purple-700'
                                          : 'text-purple-500/80'
                                      }`}>
                                      {isSelected ? '✨ 已启用参考' : '点击选用模特'}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {index === 1 && (
                      <div class="mt-4 p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 shadow-2xs space-y-3">
                        <div>
                          <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="text-xs font-bold text-amber-950 flex items-center gap-1 shrink-0 whitespace-nowrap">
                              <span>
                                {currentLanguage.value === 'zh'
                                  ? '✨ 100% 透明底品牌 Logo 矩阵 (点击缩略图一键选用):'
                                  : '✨ 100% Transparent Brand Logo Matrix (1-Click Select):'}
                              </span>
                            </span>
                          </div>
                          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {DEMO_LOGOS.map((logo) => {
                              const isSelected =
                                step.imageInputs[0]?.previewUrl === logo.dataUrl;
                              return (
                                <button
                                  type="button"
                                  key={logo.id}
                                  onClick={() => {
                                    if (step.imageInputs[0]) {
                                      step.imageInputs[0].previewUrl =
                                        logo.dataUrl;
                                      step.imageInputs[0].defaultFileName = `${logo.id}.png`;
                                    }
                                  }}
                                  class={`p-2 text-left rounded-lg bg-white border transition-all flex items-center gap-2 group cursor-pointer ${
                                    isSelected
                                      ? 'border-amber-600 ring-2 ring-amber-500/25 shadow-xs'
                                      : 'border-amber-200 hover:border-amber-500 hover:shadow-sm'
                                  }`}>
                                  <img
                                    src={logo.dataUrl}
                                    alt={logo.name}
                                    class="h-9 w-16 object-contain rounded p-1 border border-gray-200 shrink-0"
                                    style="background-image: conic-gradient(#e9ecef 25%, #ffffff 0 50%, #e9ecef 0 75%, #ffffff 0); background-size: 8px 8px;"
                                  />
                                  <div class="overflow-hidden">
                                    <div class="text-xs font-bold text-gray-800 group-hover:text-amber-800 truncate">
                                      {logo.name.split(' (')[0]}
                                    </div>
                                    <div class="text-[10px] text-gray-500 truncate">
                                      {logo.category || '透明底 PNG'}
                                    </div>
                                    <div class="text-[10px] text-emerald-700 font-semibold truncate">
                                      {isSelected ? '✓ 当前已选 Logo' : '透明 RGBA · 选用'}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 📐 设计师免改提示词版式控制器：方位 & 大小 */}
                        <div class="pt-2.5 border-t border-amber-200/70 flex flex-col gap-2">
                          <div class="flex flex-wrap items-center justify-between gap-2">
                            <span class="text-[11px] font-bold text-amber-950 flex items-center gap-1 whitespace-nowrap">
                              <span>
                                {currentLanguage.value === 'zh'
                                  ? '📐 设计师版式控制 (免改提示词 · 指定 Logo 摆放方位):'
                                  : '📐 Designer Layout Control (Logo Placement):'}
                              </span>
                            </span>
                            <div class="flex flex-wrap items-center gap-1">
                              {LOGO_POSITIONS.map((pos) => (
                                <button
                                  type="button"
                                  key={pos.id}
                                  onClick={() => (logoPosition.value = pos.id)}
                                  class={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                                    logoPosition.value === pos.id
                                      ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                                      : 'bg-white text-gray-700 border-amber-200 hover:border-amber-500'
                                  }`}>
                                  {currentLanguage.value === 'zh'
                                    ? pos.labelZh
                                    : pos.labelEn}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div class="flex flex-wrap items-center justify-between gap-2">
                            <span class="text-[11px] font-bold text-amber-950 flex items-center gap-1 whitespace-nowrap">
                              <span>
                                {currentLanguage.value === 'zh'
                                  ? '🔍 Logo 视觉占比 (Scale):'
                                  : '🔍 Logo Visual Scale:'}
                              </span>
                            </span>
                            <div class="flex flex-wrap items-center gap-1">
                              {LOGO_SCALES.map((sc) => (
                                <button
                                  type="button"
                                  key={sc.id}
                                  onClick={() => (logoScale.value = sc.id)}
                                  class={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                                    logoScale.value === sc.id
                                      ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                                      : 'bg-white text-gray-700 border-amber-200 hover:border-amber-500'
                                  }`}>
                                  {currentLanguage.value === 'zh'
                                    ? sc.labelZh
                                    : sc.labelEn}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step.imageInputs.map((imageInput, imgIndex) => (
                      <div key={imageInput.assetName} class="mt-4 relative">
                        <label
                          for={`${step.id}-${imgIndex}-file`}
                          class="block cursor-pointer">
                          <div
                            class="p-4 border-2 border-dashed border-outline rounded-lg text-center hover:bg-gray-50 flex flex-col items-center justify-center min-h-[100px] bg-gray-50"
                            style={
                              index === 1 && imageInput.previewUrl
                                ? 'background-image: conic-gradient(#e9ecef 25%, #ffffff 0 50%, #e9ecef 0 75%, #ffffff 0); background-size: 16px 16px;'
                                : undefined
                            }>
                            {imageInput.previewUrl ? (
                              <>
                                <img
                                  src={imageInput.previewUrl}
                                  class="max-h-48 mx-auto rounded-lg"
                                  alt="Image preview"
                                />
                                {index === 1 && (
                                  <span class="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                                    ✨ 100% 透明背景 PNG (Alpha=0 · 边缘无白框)
                                  </span>
                                )}
                              </>
                            ) : (
                              <div>
                                <svg
                                  class="mx-auto h-8 w-8 text-gray-400"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48">
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"></path>
                                </svg>
                                <p class="mt-1 text-xs text-on-surface-variant">
                                  Click to upload image for{' '}
                                  {imageInput.assetName}
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                        <input
                          type="file"
                          id={`${step.id}-${imgIndex}-file`}
                          onChange={(e) => handleFileChange(e, imageInput)}
                          class="hidden"
                          accept="image/*"
                        />
                        {imageInput.previewUrl && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              imageInput.isStatic = !imageInput.isStatic;
                            }}
                            class={`absolute top-2 left-2 p-1.5 rounded-full transition-colors ${imageInput.isStatic ? 'bg-primary text-white' : 'bg-white/80 text-on-surface-variant hover:bg-white'}`}
                            title={
                              imageInput.isStatic
                                ? 'Unpin: Ask for this image on each run'
                                : 'Pin: Save this image in the template'
                            }>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-5 w-5"
                              viewBox="0 0 16 16"
                              fill="currentColor">
                              <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1 -.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => removeImageSlot(index, imgIndex)}
                          class="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-on-surface-variant hover:bg-white hover:text-red-600 transition-colors"
                          aria-label="Remove image slot">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {((index === 0 && step.imageInputs.length < 6) ||
                      (index > 0 && step.imageInputs.length < 5)) && (
                      <button
                        onClick={() => addImageSlot(index)}
                        class="material-button material-button-secondary w-full mt-4 text-sm py-2">
                        {t('addImageSlot')}
                      </button>
                    )}

                    <div class="mt-4">
                      <button
                        onClick={() => runStep(step, index)}
                        class="material-button material-button-primary w-full"
                        disabled={results[step.id]?.isLoading}>
                        {!results[step.id]?.isLoading ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            class="animate-spin h-5 w-5 mr-2 text-white"
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
                        )}
                        {results[step.id]?.isLoading
                          ? t('running')
                          : t('runStep')}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addStep}
                  class="material-button material-button-secondary w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {t('addStep')}
                </button>
              </div>

              {/* Results Column */}
              <div class="lg:col-span-1 space-y-6 sticky top-[80px]">
                {steps.map((stepObj, rIndex) => {
                  const result = results[stepObj.id];
                  if (!result) return null;
                  const meta = stepMeta[stepObj.id];
                  const baseStepResult = rIndex > 0 ? results[steps[0].id] : null;
                  const displayedImageUrl =
                    meta?.compareBase && baseStepResult?.imageUrl
                      ? baseStepResult.imageUrl
                      : result.imageUrl;

                  return (
                    <div key={result.id} class="material-card">
                      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h2 class="text-base font-bold text-gray-900">
                          {t('stepResult')}: <span class="font-medium">{result.title}</span>
                        </h2>
                        {result.imageUrl && (
                          <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {aspectRatio.value}
                            </span>
                            {meta?.dimensions && (
                              <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                {meta.dimensions}
                              </span>
                            )}
                            {meta?.durationSec && (
                              <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ⏱️ {meta.durationSec}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-2">
                        {result.isLoading ? (
                          <div class="flex flex-col items-center justify-center h-full">
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
                              {t('running')}
                            </p>
                          </div>
                        ) : displayedImageUrl ? (
                          <div class="flex flex-col w-full h-full">
                            <div class="relative group w-full flex-grow rounded-lg overflow-hidden bg-white flex items-center justify-center min-h-[220px]">
                              <img
                                src={displayedImageUrl}
                                class="max-h-72 w-full object-contain rounded-lg"
                                alt="Generated image"
                              />
                              {meta?.compareBase && (
                                <span class="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white shadow-sm">
                                  👁️ 正在检视 Step 1 无标底图
                                </span>
                              )}
                              <div
                                onClick={() =>
                                  emit('open-preview', displayedImageUrl)
                                }
                                class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                                <span class="text-white text-xs font-bold bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                                  <span>🔍 点击放大检视细节</span>
                                </span>
                              </div>
                            </div>

                            {/* 商用交付工具箱 */}
                            <div class="mt-3 pt-3 border-t border-gray-200 space-y-2">
                              {rIndex > 0 && baseStepResult?.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (stepMeta[stepObj.id]) {
                                      stepMeta[stepObj.id].compareBase =
                                        !stepMeta[stepObj.id].compareBase;
                                    }
                                  }}
                                  class={`w-full py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    meta?.compareBase
                                      ? 'bg-amber-100 text-amber-900 border-amber-400'
                                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-amber-50 hover:text-amber-900'
                                  }`}>
                                  <span>
                                    {meta?.compareBase
                                      ? '✨ 切回 Step 2 品牌成品图 (After Logo)'
                                      : '👁️ 对比 Step 1 无标底图 (Before / After)'}
                                  </span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => sendToResizer(result.imageUrl!)}
                                class="material-button material-button-primary w-full py-2.5 text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center gap-1.5 shadow-sm rounded-lg transition-all">
                                <span>{t('sendToResizer')}</span>
                              </button>
                              <div class="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadImage(
                                      result.imageUrl!,
                                      `${templateName.value || 'ad-creative'}_step${rIndex + 1}.png`,
                                    )
                                  }
                                  class="material-button material-button-secondary text-xs py-1.5 font-semibold flex items-center justify-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg">
                                  <span>{t('downloadPng')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyImageToClipboard(result.imageUrl!)
                                  }
                                  class="material-button material-button-secondary text-xs py-1.5 font-semibold flex items-center justify-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg">
                                  <span>{t('copyImage')}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : result.error ? (
                          <p class="text-red-500 text-center p-4 text-sm">
                            {result.error}
                          </p>
                        ) : (
                          <p class="text-on-surface-variant text-sm text-center">
                            {t('outputPlaceholder')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div class="text-center flex flex-col items-center justify-center h-full">
            <svg
              class="mx-auto h-16 w-16 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.158 0a.225.225 0 0 1-.225.225h-.008a.225.225 0 0 1-.225-.225v-.008c0-.124.101-.225.225-.225h.008c.124 0 .225.101.225.225v.008Z"
              />
            </svg>
            <h2 class="mt-4 text-2xl font-bold text-on-surface">
              Start Creating Your Images
            </h2>
            <p class="mt-2 text-md text-on-surface-variant max-w-lg mx-auto">
              Choose a pre-built template from our library to get started
              quickly, or build a custom workflow from scratch to fit your exact
              needs.
            </p>
            <div class="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => emit('change-template')}
                class="material-button material-button-primary">
                Browse Template Library
              </button>
              <button
                onClick={() => emit('create-new')}
                class="material-button material-button-secondary">
                Create New From Scratch
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
});
