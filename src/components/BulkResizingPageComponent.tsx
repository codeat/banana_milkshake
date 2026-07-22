/**
 * Copyright 2026 Google LLC
 */

import {PropType, computed, defineComponent, ref, watch, reactive} from 'vue';
import {SUPPORTED_IMAGE_MODELS} from '../constants';
import {BulkJob, Template} from '../types';

/**
 * A Vue component for the bulk image resizing page.
 * It allows users to upload a CSV with image URLs, select target sizes,
 * and review the results of the bulk image resizing process.
 */
export const BulkResizingPageComponent = defineComponent({
  name: 'BulkResizingPageComponent',
  props: {
    selectedTemplate: {
      type: Object as PropType<Template | null>,
      default: null,
    },
    jobs: {type: Array as PropType<BulkJob[]>, required: true},
    isProcessing: {type: Boolean, required: true},
    isDownloading: {type: Boolean, required: true},
    progress: {type: Number, required: true},
    completedCount: {type: Number, required: true},
    successCount: {type: Number, required: true},
    model: {type: String, required: true},
  },
  emits: [
    'change-template',
    'file-upload',
    'start-generation',
    'download-zip',
    'open-preview',
    'rerun-selected',
    'update:model',
    'update-sizes',
  ],
  setup(props, {emit}) {
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const selectAllRef = ref(false);
    const supportedModels = SUPPORTED_IMAGE_MODELS;

    // Hardcoded sizes for Resizer
    const sizes = ['970x250', '300x600', '300x250', '336x280'];
    const selectedSizes = reactive<Record<string, boolean>>({
      '970x250': true,
      '300x600': true,
      '300x250': true,
      '336x280': true,
    });

    const isAnyRowSelected = computed(() =>
      props.jobs.some((j: BulkJob) => j.selected),
    );

    watch(
      selectedSizes,
      (newSizes) => {
        emit('update-sizes', newSizes);
      },
      {deep: true},
    );

    const toggleSelectAll = () => {
      const isChecked = selectAllRef.value;
      props.jobs.forEach((j: BulkJob) => (j.selected = isChecked));
    };

    watch(
      () => props.jobs,
      (newJobs: BulkJob[]) => {
        if (newJobs.length > 0 && newJobs.every((j) => j.selected)) {
          selectAllRef.value = true;
        } else {
          selectAllRef.value = false;
        }
      },
      {deep: true},
    );

    const handleFileUpload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      emit('file-upload', file, selectedSizes);
    };

    const startBulkGeneration = () => {
      emit('start-generation', selectedSizes);
    };
    const downloadZip = async () => {
      emit('download-zip');
    };
    const rerunSelected = () => {
      emit('rerun-selected', selectedSizes);
      selectAllRef.value = false;
    };

    return () => (
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Setup */}
          <div class="lg:col-span-1 space-y-6 sticky top-[80px]">
            <div class="material-card">
              <h2 class="text-lg font-bold mb-4">1. Selected Template</h2>
              <div class="p-4 border border-outline rounded-lg flex items-center">
                {props.selectedTemplate?.previewImage ? (
                  <img
                    src={props.selectedTemplate.previewImage}
                    class="w-16 h-12 object-cover rounded-md mr-4 bg-gray-100"
                    alt="Template thumbnail"
                  />
                ) : (
                  <div class="w-16 h-12 bg-gray-100 rounded-md mr-4 flex items-center justify-center font-bold text-xs text-gray-500">
                    Resizer
                  </div>
                )}
                <div>
                  <p class="font-semibold">{props.selectedTemplate?.name || 'Ad Image Resizer'}</p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      emit('change-template');
                    }}
                    class="text-sm text-primary font-medium">
                    Change template
                  </a>
                </div>
              </div>
            </div>
            <div class="material-card">
              <h2 class="text-lg font-bold mb-4">2. Upload Data</h2>
              <input
                type="file"
                onChange={handleFileUpload}
                ref={fileInputRef}
                accept=".csv"
                class="material-input p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                disabled={props.isProcessing}
              />
              <div class="mt-3 text-xs text-on-surface-variant bg-gray-50 p-3 rounded-lg">
                <p>
                  Upload a CSV (max 100 rows) containing a unique <code class="text-primary">id</code> column for naming and an <code class="text-primary">image_url</code> column with public image URLs.
                </p>
              </div>
            </div>
            <div class="material-card">
              <h2 class="text-lg font-bold mb-4">3. Generation Settings</h2>

              <div class="mb-4">
                <label class="block text-sm font-medium text-on-surface-variant mb-1">
                  GenAI Model
                </label>
                <select
                  value={props.model}
                  onInput={(e: Event) =>
                    emit(
                      'update:model',
                      (e.target as HTMLSelectElement).value,
                    )
                  }
                  class="material-input bg-white">
                  {supportedModels.map((m) => {
                    const isSupported =
                      m === 'gemini-3.1-flash-image' ||
                      m === 'gemini-3.1-flash-lite-image';
                    return (
                      <option key={m} value={m} disabled={!isSupported}>
                        {m}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-on-surface-variant mb-2">
                  Target Sizes (Multi-select)
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
            <button
              onClick={startBulkGeneration}
              class="material-button material-button-primary w-full"
              disabled={
                props.isProcessing || props.jobs.length === 0
              }>
              {props.isProcessing ? 'Generating...' : 'Generate Images'}
            </button>
          </div>

          {/* Right Column: Results */}
          <div class="lg:col-span-2 material-card">
            {props.jobs.length === 0 ? (
              <div class="text-center py-16">
                <h2 class="text-lg font-bold">4. Review Results</h2>
                <p class="mt-2 text-on-surface-variant">
                  Upload a CSV file to get started. Results will appear here.
                </p>
              </div>
            ) : (
              <div>
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-lg font-bold">4. Review Results</h2>
                  <div class="flex items-center space-x-2">
                    <button
                      onClick={rerunSelected}
                      class="material-button material-button-secondary"
                      disabled={
                        !isAnyRowSelected.value || props.isProcessing
                      }>
                      Rerun Selected
                    </button>
                    <button
                      onClick={downloadZip}
                      class="material-button material-button-primary"
                      disabled={
                        props.isDownloading ||
                        props.isProcessing ||
                        props.successCount === 0
                      }>
                      {props.isDownloading ? 'Zipping...' : 'Download All (' + props.successCount + ')'}
                    </button>
                  </div>
                </div>
                {(props.isProcessing ||
                  (props.completedCount < props.jobs.length &&
                    props.jobs.length > 0)) && (
                  <div class="mb-4">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        class="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style={{width: props.progress + '%'}}></div>
                    </div>
                    <p class="text-center text-sm text-on-surface-variant mt-2">
                      {props.completedCount} of {props.jobs.length} complete.
                    </p>
                  </div>
                )}

                {/* Results Table */}
                <div class="space-y-2">
                  {/* Header */}
                  <div class="grid grid-cols-12 gap-4 items-center px-4 py-2 font-semibold text-on-surface-variant text-sm border-b border-outline">
                    <div class="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        v-model={selectAllRef.value}
                        onChange={toggleSelectAll}
                        class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                    <div class="col-span-2">ID</div>
                    <div class="col-span-3">Input Image</div>
                    <div class="col-span-3">Output Image</div>
                    <div class="col-span-3">Status</div>
                  </div>

                  {/* Job Rows */}
                  {props.jobs.map((job) => (
                    <div
                      key={job.id}
                      class="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-gray-50 border-b border-outline last:border-b-0">
                      <div class="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          v-model={job.selected}
                          class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                      <div
                        class="col-span-2 text-sm font-medium truncate"
                        title={job.rowData.id}>
                        {job.rowData.id}
                      </div>
                      <div class="col-span-3">
                        <div class="aspect-square bg-gray-100 rounded-md w-full max-w-[100px] flex items-center justify-center">
                          {job.inputImageUrl ? (
                            <img
                              src={job.inputImageUrl}
                              onError={(e: Event) =>
                                ((
                                  e.target as HTMLImageElement
                                ).style.display = 'none')
                              }
                              class="w-full h-full object-contain rounded-md"
                              alt="Input Asset"
                            />
                          ) : (
                            <span class="text-xs text-on-surface-variant">
                              N/A
                            </span>
                          )}
                        </div>
                      </div>
                      <div class="col-span-3">
                        <div class="aspect-square bg-gray-100 rounded-md w-full max-w-[100px] flex items-center justify-center relative">
                          {job.status === 'processing' ? (
                            <div class="p-2">
                              <svg
                                class="animate-spin h-6 w-6 text-primary"
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
                            </div>
                          ) : job.status === 'success' &&
                            job.resultImageUrl ? (
                            <div class="w-full h-full relative group">
                              <img
                                src={job.resultImageUrl}
                                class="w-full h-full object-contain rounded-md"
                              />
                              <div
                                onClick={() =>
                                  emit('open-preview', job.resultImageUrl)
                                }
                                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="h-8 w-8 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                              </div>
                            </div>
                          ) : job.status === 'failed' ? (
                            <div
                              class="p-2 text-center"
                              title={job.error || 'Failed'}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6 text-red-500 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div class="text-xs text-on-surface-variant">
                              Pending
                            </div>
                          )}
                          {/* Pixel Size Badge */}
                          <div class="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none z-10">
                            {job.rowData['size']}
                          </div>
                        </div>
                      </div>
                      <div class="col-span-3 text-sm">
                        {job.status === 'success' ? (
                          <div class="flex items-center text-green-600 font-semibold">
                            Success
                          </div>
                        ) : job.status === 'failed' ? (
                          <div class="text-red-600">
                            <div class="flex items-center font-semibold mb-1">
                              Failed
                            </div>
                            <span class="text-xs block break-words leading-tight">
                              {job.error}
                            </span>
                          </div>
                        ) : job.status === 'processing' ? (
                          <div class="flex items-center text-primary font-semibold">
                            Processing
                          </div>
                        ) : (
                          <div class="text-gray-500">Pending</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
});
