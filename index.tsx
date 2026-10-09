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

import {computed, createApp, onMounted, onUnmounted, ref} from 'vue';
import {BulkCreationPageComponent} from './src/components/BulkCreationPageComponent';
import {BulkResizingPageComponent} from './src/components/BulkResizingPageComponent';
import {CreationPageComponent} from './src/components/CreationPageComponent';
import {ResizingPageComponent} from './src/components/ResizingPageComponent';
import {LibraryPageComponent} from './src/components/LibraryPageComponent';
import {useBulkCreation} from './src/composables/useBulkCreation';
import {useBulkResizing} from './src/composables/useBulkResizing';
import {useGoogleDrive} from './src/composables/useGoogleDrive';
import {DEFAULT_IMAGE_MODEL} from './src/constants';
import {Template} from './src/types';
import {TEMPLATES} from './src/data/templates';
import {t, currentLanguage, toggleLanguage} from './src/i18n';

declare const process: {env: {[key: string]: string | undefined}};
// --- HELPERS ---
async function fetchConfig() {
  const response = await fetch('/api/config');
  const config = await response.json();
  return config;
}

// --- ROOT APP COMPONENT ---
const App = {
  setup() {
    const currentPage = ref('library'); // 'creation', 'library', 'experiment'
    const isMobileMenuOpen = ref(false);
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };
    const currentTemplateForCreation = ref<Template | null>(null);
    const currentTemplateForBulk = ref<Template | null>(null);
    const isSaving = ref(false);
    const previewImageUrl = ref<string | null>(null);

    const openPreview = (url: string) => {
      previewImageUrl.value = url;
    };
    const closePreview = () => {
      previewImageUrl.value = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImageUrl.value) {
        closePreview();
      }
    };

    // Note: useGoogleDrive might mistakenly have 'initialize' typed as taking config from the previous step?
    // Let's check useGoogleDrive signature.
    // It returns 'initialize'.
    const {
      isReady,
      isSignedIn,
      signIn,
      signOut,
      saveTemplate,
      listTemplates,
      getTemplateAssets,
      deleteTemplate,
      initialize: initializeDrive,
      driveTemplates,
    } = useGoogleDrive((authed: boolean) => {
      if (authed && currentPage.value === 'library') {
        // Potentially refresh drive templates list here
      }
    });

    onMounted(async () => {
      window.addEventListener('keydown', handleKeyDown);
      if (!currentTemplateForCreation.value) {
        currentTemplateForCreation.value = TEMPLATES[0];
      }
      try {
        const config = await fetchConfig();
        initializeDrive(config);
      } catch (e) {
        console.error('Failed to fetch server configuration:', e);
        // Initialize with empty config to show warnings in console
        initializeDrive({});
      }
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });

    // --- BULK CREATION LOGIC ---
    const {
      bulkJobs: creationJobs,
      isBulkProcessing: isCreationProcessing,
      isBulkDownloading: isCreationDownloading,
      bulkConcurrency: creationConcurrency,
      bulkProgress: creationProgress,
      bulkCompletedCount: creationCompletedCount,
      bulkSuccessCount: creationSuccessCount,
      bulkTemperature: creationTemperature,
      bulkGenaiModel: creationGenaiModel,
      bulkAspectRatio,
      bulkResolution,
      handleBulkFileUpload: handleCreationFileUpload,
      startBulkGeneration: startCreationGeneration,
      downloadBulkZip: downloadCreationZip,
      rerunSelectedJobs: rerunCreationJobs,
    } = useBulkCreation(currentTemplateForBulk, getTemplateAssets);

    // --- BULK RESIZING LOGIC ---
    const {
      bulkJobs: resizingJobs,
      isBulkProcessing: isResizingProcessing,
      isBulkDownloading: isResizingDownloading,
      bulkProgress: resizingProgress,
      bulkCompletedCount: resizingCompletedCount,
      bulkSuccessCount: resizingSuccessCount,
      bulkGenaiModel: resizingGenaiModel,
      handleBulkFileUpload: handleResizingFileUpload,
      startBulkGeneration: startResizingGeneration,
      downloadBulkZip: downloadResizingZip,
      rerunSelectedJobs: rerunResizingJobs,
      updateSelectedSizes: updateResizingSizes,
    } = useBulkResizing();

    const isResizer = computed(() => currentTemplateForBulk.value?.id === 'ad-image-resizer');

    const bulkJobs = computed(() => isResizer.value ? resizingJobs : creationJobs);
    const isBulkProcessing = computed(() => isResizer.value ? isResizingProcessing.value : isCreationProcessing.value);
    const isBulkDownloading = computed(() => isResizer.value ? isResizingDownloading.value : isCreationDownloading.value);
    const bulkProgress = computed(() => isResizer.value ? resizingProgress.value : creationProgress.value);
    const bulkCompletedCount = computed(() => isResizer.value ? resizingCompletedCount.value : creationCompletedCount.value);
    const bulkSuccessCount = computed(() => isResizer.value ? resizingSuccessCount.value : creationSuccessCount.value);
    const bulkConcurrency = computed({
      get: () => creationConcurrency.value,
      set: (val) => {
        creationConcurrency.value = val;
      }
    });
    const bulkTemperature = computed({
      get: () => creationTemperature.value,
      set: (val) => {
        creationTemperature.value = val;
      }
    });

    const bulkGenaiModel = computed({
      get: () => isResizer.value ? resizingGenaiModel.value : creationGenaiModel.value,
      set: (val) => {
        if (isResizer.value) {
          resizingGenaiModel.value = val;
        } else {
          creationGenaiModel.value = val;
        }
      }
    });

    const handleBulkFileUpload = (file: File, sizes?: Record<string, boolean>) => {
      if (isResizer.value) {
        handleResizingFileUpload(file, sizes || {});
      } else {
        handleCreationFileUpload(file);
      }
    };

    const startBulkGeneration = (sizes?: Record<string, boolean>) => {
      if (isResizer.value) {
        startResizingGeneration(sizes || {});
      } else {
        startCreationGeneration();
      }
    };

    const downloadBulkZip = () => {
      if (isResizer.value) {
        downloadResizingZip();
      } else {
        downloadCreationZip();
      }
    };

    const rerunSelectedJobs = (sizes?: Record<string, boolean>) => {
      if (isResizer.value) {
        rerunResizingJobs(sizes || {});
      } else {
        rerunCreationJobs();
      }
    };

    const handleUpdateSizes = (sizes: Record<string, boolean>) => {
      if (isResizer.value) {
        updateResizingSizes(sizes);
      }
    };

    const initialSourceImage = ref<string | null>(null);

    const openResizerPage = (sourceImageUrl?: string) => {
      const resizerTpl =
        TEMPLATES.find((t) => t.id === 'ad-image-resizer') || TEMPLATES[1];
      currentTemplateForCreation.value = resizerTpl;
      if (sourceImageUrl) {
        initialSourceImage.value = sourceImageUrl;
      }
      currentPage.value = 'resizer';
      isMobileMenuOpen.value = false;
    };

    const handleSendToResizer = (imageUrl: string) => {
      openResizerPage(imageUrl);
    };

    const switchPage = (page: string) => {
      if (
        page === 'creation' &&
        (!currentTemplateForCreation.value ||
          currentTemplateForCreation.value.id === 'ad-image-resizer')
      ) {
        currentTemplateForCreation.value = TEMPLATES[0];
      }
      if (page === 'experiment' && !currentTemplateForBulk.value) {
        currentTemplateForBulk.value = TEMPLATES[0];
      }
      currentPage.value = page;
      isMobileMenuOpen.value = false;
    };

    const useTemplate = (template: Template, mode: 'edit' | 'use') => {
      if (mode === 'edit') {
        currentTemplateForCreation.value = template;
        switchPage('creation');
      } else {
        // 'use'

        currentTemplateForBulk.value = template;
        switchPage('experiment');
      }
    };

    const createNewTemplate = () => {
      const blankTemplate: Template = {
        id: 'new-template',
        name: 'New Custom Template',
        description: '',
        previewImage: '',
        aspect_ratio: '1:1',
        genai_model: DEFAULT_IMAGE_MODEL,
        steps: [
          {
            name: 'Step 1: Base Image',
            text_prompt: 'Describe the transformation for asset1...',
            image_slots: [{asset_name: 'asset1', is_static: false}],
            text_variables: [],
          },
        ],
      };
      currentTemplateForCreation.value = blankTemplate;
      switchPage('creation');
    };

    const handleSaveToDrive = async (
      templateData: Template,
      filesToSave: Record<string, File>,
      sourceFolderId?: string,
    ) => {
      if (!isSignedIn.value) {
        // 免登录模式：直接一键导出 JSON 模板至本地
        try {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateData, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", `${templateData.name || 'custom_template'}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          alert(currentLanguage.value === 'zh' ? '✅ 免登录模式：已将模板配置以 JSON 文件成功保存并下载至本地！' : 'Saved template configuration locally as JSON.');
        } catch (e) {
          console.error(e);
        }
        return;
      }
      isSaving.value = true;
      try {
        await saveTemplate(templateData, filesToSave, sourceFolderId);
      } catch (err: unknown) {
        console.error('Failed to save template:', err);
        let message = 'An unknown error occurred.';
        if (err instanceof Error) {
          message = err.message;
        }
        alert(`Failed to save template. Error: ${message}`);
      } finally {
        isSaving.value = false;
      }
    };

    const pageComponent = computed(() => {
      switch (currentPage.value) {
        case 'library':
          return LibraryPageComponent;
        case 'resizer':
          return ResizingPageComponent;
        case 'experiment':
          if (currentTemplateForBulk.value?.id === 'ad-image-resizer') {
            return BulkResizingPageComponent;
          }
          return BulkCreationPageComponent;
        case 'creation':
        default:
          if (currentTemplateForCreation.value?.id === 'ad-image-resizer') {
            return ResizingPageComponent;
          }
          return CreationPageComponent;
      }
    });

    return {
      currentPage,
      isMobileMenuOpen,
      toggleMobileMenu,
      isSignedIn,
      isReady,
      isSaving,
      signIn,
      signOut,
      switchPage,
      openResizerPage,
      handleSendToResizer,
      initialSourceImage,
      useTemplate,
      createNewTemplate,
      handleSaveToDrive,
      currentTemplateForCreation,
      currentTemplateForBulk,
      pageComponent,
      listTemplates,
      driveTemplates,
      getTemplateAssets,
      previewImageUrl,
      openPreview,
      closePreview,
      deleteTemplate,
      // Bulk creation state and handlers
      bulkJobs,
      isBulkProcessing,
      bulkConcurrency,
      isBulkDownloading,
      bulkProgress,
      bulkCompletedCount,
      bulkSuccessCount,
      bulkTemperature,
      bulkGenaiModel,
      bulkAspectRatio,
      bulkResolution,
      handleBulkFileUpload,
      startBulkGeneration,
      downloadBulkZip,
      rerunSelectedJobs,
      handleUpdateSizes,
      t,
      currentLanguage,
      toggleLanguage,
    };
  },
  template: `
    <header class="bg-surface border-b border-outline sticky top-0 z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <!-- Logo and Title -->
                <div class="flex items-center">
                    <div class="flex-shrink-0 flex items-baseline space-x-2">
                         <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 whitespace-nowrap">🍌 Banana Milkshake</h1>
                         <span class="text-xs font-bold tracking-wider text-red-600 pb-1">PRO</span>
                         <span class="text-xs font-bold tracking-wider text-gray-500 pb-1 ml-2">v${process.env.APP_VERSION}</span>
                    </div>
                </div>

                <!-- Desktop Navigation -->
                <nav class="hidden md:flex items-center space-x-2">
                    <div @click="switchPage('creation')" class="nav-item" :class="{active: currentPage === 'creation'}">{{ t('creationCenter') }}</div>
                    <div @click="openResizerPage()" class="nav-item" :class="{active: currentPage === 'resizer'}">{{ t('adResizerNav') }}</div>
                    <div @click="switchPage('library')" class="nav-item" :class="{active: currentPage === 'library'}">{{ t('templateLibrary') }}</div>
                    <div @click="switchPage('experiment')" class="nav-item" :class="{active: currentPage === 'experiment'}">{{ t('bulkCreation') }}</div>
                </nav>

                <!-- Status & Language Toggle (Desktop) -->
                <div class="hidden md:flex items-center space-x-3" id="auth-container">
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-xs">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Vertex AI Global · Nano Banana 2.1 & 3.8</span>
                    </div>
                    <button @click="toggleLanguage" class="material-button material-button-secondary text-xs px-3 py-1.5 flex items-center gap-1 font-medium bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors">
                        <span>🌐</span>
                        <span>{{ currentLanguage === 'zh' ? 'English' : '简体中文' }}</span>
                    </button>
                </div>
                <!-- Mobile Menu Button -->
                <div class="md:hidden flex items-center">
                    <button @click="toggleMobileMenu" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" aria-controls="mobile-menu" aria-expanded="false">
                        <span class="sr-only">Open main menu</span>
                        <svg v-if="!isMobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile menu, show/hide based on menu state. -->
        <div v-if="isMobileMenuOpen" class="md:hidden" id="mobile-menu">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface border-b border-outline">
                <div @click="switchPage('creation')" class="mobile-nav-item" :class="{active: currentPage === 'creation'}">{{ t('creationCenter') }}</div>
                <div @click="openResizerPage()" class="mobile-nav-item" :class="{active: currentPage === 'resizer'}">{{ t('adResizerNav') }}</div>
                <div @click="switchPage('library')" class="mobile-nav-item" :class="{active: currentPage === 'library'}">{{ t('templateLibrary') }}</div>
                <div @click="switchPage('experiment')" class="mobile-nav-item" :class="{active: currentPage === 'experiment'}">{{ t('bulkCreation') }}</div>
                <div class="border-t border-outline my-2"></div>
                <div class="px-2 py-2 space-y-2">
                     <div class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                         <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                         <span>Vertex AI Global · Nano Banana 2.1 & 3.8</span>
                     </div>
                     <button @click="toggleLanguage" class="material-button material-button-secondary w-full text-xs py-2 flex items-center justify-center gap-1">
                         <span>🌐</span>
                         <span>切换语言: {{ currentLanguage === 'zh' ? 'English' : '简体中文' }}</span>
                     </button>
                </div>
            </div>
        </div>
    </header>
    <main class="flex-grow">
        <component
            :is="pageComponent"
            :is-signed-in="isSignedIn"
            :initial-template="currentTemplateForCreation"
            :initial-source-image="initialSourceImage"
            :selected-template="currentTemplateForBulk"
            :is-saving="isSaving"
            :list-templates="listTemplates"
            :drive-templates="driveTemplates"
            :get-template-assets="getTemplateAssets"
            :delete-template="deleteTemplate"
            :jobs="bulkJobs"
            :is-processing="isBulkProcessing"
            :is-downloading="isBulkDownloading"
            :progress="bulkProgress"
            :completed-count="bulkCompletedCount"
            :success-count="bulkSuccessCount"
            :temperature="bulkTemperature"
            @update:temperature="val => bulkTemperature = val"
            :model="bulkGenaiModel"
            @update:model="val => bulkGenaiModel = val"
            :aspect-ratio="bulkAspectRatio"
            @update:aspect-ratio="val => bulkAspectRatio = val"
            :resolution="bulkResolution"
            @update:resolution="val => bulkResolution = val"
            :concurrency="bulkConcurrency"
            @update:concurrency="val => bulkConcurrency = val"

            @use-template="useTemplate"
            @create-new="createNewTemplate"
            @sign-in="signIn"
            @change-template="switchPage('library')"
            @save-template-to-drive="handleSaveToDrive"
            @open-preview="openPreview"
            @send-to-resizer="handleSendToResizer"

            @file-upload="handleBulkFileUpload"
            @start-generation="startBulkGeneration"
            @download-zip="downloadBulkZip"
            @rerun-selected="rerunSelectedJobs"
            @update-sizes="handleUpdateSizes"
        />
    </main>
    <footer class="bg-surface border-t border-outline py-4 px-4 sm:px-6 lg:px-8 mt-auto">
        <div class="max-w-7xl mx-auto text-center text-xs text-on-surface-variant">
            <p>{{ t('footerDisclaimer') }}</p>
        </div>
    </footer>

    <!-- Image Preview Modal -->
    <div v-if="previewImageUrl" @click="closePreview" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity duration-300" style="backdrop-filter: blur(4px);">
        <div @click.stop class="relative">
            <img :src="previewImageUrl" class="rounded-lg shadow-2xl max-w-4xl max-h-[90vh]">
            <button @click="closePreview" class="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-white rounded-full p-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    </div>
  `,
};

const app = createApp(App);
app.mount('#app');
