/**
 * Copyright 2026 Google LLC
 */

import {Modality, Part} from '@google/genai';
import JSZip from 'jszip';
import {computed, reactive, ref} from 'vue';
import {DEFAULT_IMAGE_MODEL, useVertexAi} from '../constants';
import {ai, callGenAIApi} from '../services/ai';
import {BulkJob} from '../types';
import {cropImageToSize} from '../services/image';
import {PLACEHOLDERS} from '../data/placeholders';

/**
 * A composable function for managing the bulk resizing of images.
 */
export function useBulkResizing() {
  const bulkJobs = reactive<BulkJob[]>([]);
  const isBulkProcessing = ref(false);
  const isBulkDownloading = ref(false);
  const bulkGenaiModel = ref(DEFAULT_IMAGE_MODEL);

  let originalCsvData: Array<Record<string, string>> = [];

  const bulkProgress = computed(() => {
    if (bulkJobs.length === 0) return 0;
    const completed = bulkJobs.filter(
      (j) => j.status === 'success' || j.status === 'failed',
    ).length;
    return Math.round((completed / bulkJobs.length) * 100);
  });
  const bulkCompletedCount = computed(
    () =>
      bulkJobs.filter((j) => j.status === 'success' || j.status === 'failed')
        .length,
  );
  const bulkSuccessCount = computed(
    () => bulkJobs.filter((j) => j.status === 'success').length,
  );

  const parseCSV = (text: string): Array<Record<string, string>> => {
    const rows = text
      .trim()
      .split('\n')
      .map((r) => r.trim());
    if (rows.length < 2) {
      return [];
    }
    const headers = rows[0].split(',').map((h) => h.trim());
    return rows.slice(1).map((row) => {
      const values = row.split(',');
      return headers.reduce(
        (obj, header, index) => {
          obj[header] = values[index]?.trim() || '';
          return obj;
        },
        {} as Record<string, string>,
      );
    });
  };

  const expandJobs = (data: Array<Record<string, string>>, sizes: Record<string, boolean>) => {
    const expanded: BulkJob[] = [];
    let jobIndex = 0;

    // Create a map of existing jobs for quick lookup
    const existingJobsMap = new Map<string, BulkJob>();
    bulkJobs.forEach(job => {
      const jobId = job.rowData['id'];
      if (jobId) {
        existingJobsMap.set(jobId, job);
      }
    });

    for (const row of data) {
      const id = row['id'];
      const imageUrl = row['image_url'];

      if (!id || !imageUrl) continue;

      for (const [size, selected] of Object.entries(sizes)) {
        if (selected) {
          const key = `${id}_${size}`;
          const existingJob = existingJobsMap.get(key);

          if (existingJob) {
            existingJob.id = jobIndex++; // Reassign ID to keep them sequential
            expanded.push(existingJob);
          } else {
            expanded.push({
              id: jobIndex++,
              rowData: {
                ...row,
                id: `${id}_${size}`, // Override ID to be unique per size
                original_id: id,
                size,
              },
              status: 'pending',
              resultImageUrl: null,
              error: null,
              selected: false,
              inputImageUrl: imageUrl,
            });
          }
        }
      }
    }

    bulkJobs.splice(0, bulkJobs.length, ...expanded);
  };

  const handleBulkFileUpload = (file: File, sizes: Record<string, boolean>) => {
    if (isBulkProcessing.value) {
      alert('A bulk generation is already in progress. Please wait for it to complete.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);

      if (data.length > 100) {
        alert('Please upload a CSV with a maximum of 100 rows.');
        return;
      }

      const headers = Object.keys(data[0] || {});
      if (!headers.includes('id') || !headers.includes('image_url')) {
        alert('Your CSV must contain "id" and "image_url" columns.');
        return;
      }

      originalCsvData = data;
      bulkJobs.splice(0, bulkJobs.length); // Clear existing jobs to start fresh for new file
      expandJobs(data, sizes);
    };
    reader.readAsText(file);
  };

  const dataUrlToBase64 = (dataUrl: string) => dataUrl.split(',')[1];

  const blobToGeminiPart = (blob: Blob) => {
    if (blob.size === 0) {
      throw new Error(`Fetched image blob is empty.`);
    }
    return new Promise<Part>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string)?.split(',')[1];
        if (!base64data) {
          reject(new Error('Failed to read image data as base64.'));
          return;
        }
        resolve({inlineData: {data: base64data, mimeType: blob.type}});
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const urlToGeminiPart = async (url: string) => {
    try {
      const fetchTarget =
        url.startsWith('/') || url.startsWith('data:')
          ? url
          : '/image-proxy?url=' + encodeURIComponent(url);
      const response = await fetch(fetchTarget);
      if (!response.ok) {
        throw new Error(
          `Image fetch failed with status: ${response.statusText} (${response.status})`,
        );
      }
      const blob = await response.blob();
      return await blobToGeminiPart(blob);
    } catch (err: unknown) {
      console.error(`Fetch for ${url} failed:`, err);
      throw new Error(`Could not load image from URL: ${url}`);
    }
  };

  const generateImageForRow = async (job: BulkJob) => {
    job.status = 'processing';
    const MAX_RETRIES = 1;
    const modelToUse = bulkGenaiModel.value;
    const size = job.rowData['size'];
    const inputImageUrl = job.inputImageUrl;

    if (!size || !inputImageUrl) {
      job.status = 'failed';
      job.error = 'Missing size or input image URL.';
      return;
    }

    const defaultPrompt =
      `Intelligently adapt and resize the product from Asset 1 to perfectly fit the dimensions and layout suggested by Asset 2 (the placeholder). The final image must be a professional advertisement of the specified size.

**Key Layout Rules:**
* **Product Placement:** Keep the main product centered, sharp, and naturally integrated, preserving its original quality.
* **Background:** Ensure the background fills the entire new dimensions seamlessly.
* **Native Elements:** If Asset 1 contains existing logo and text overlays, rearrange these native elements and the layout to adapt to the new specified size.

**Strict Restrictions:**
* **No New Additions:** Apart from the native elements already present in Asset 1, do not add any new text overlays, logos, watermarks, or extra graphic elements.`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const parts: Part[] = [];

        // Asset 1: Product Image
        parts.push(await urlToGeminiPart(inputImageUrl));

        // Asset 2: Placeholder for this size
        const placeholderDataUrl = PLACEHOLDERS[size];
        if (!placeholderDataUrl) {
          throw new Error(`Placeholder for ${size} not found.`);
        }
        parts.push(await urlToGeminiPart(placeholderDataUrl));

        // Prompt
        parts.push({text: defaultPrompt});

        let apiAspectRatio = '1:1';
        if (size === '970x250') apiAspectRatio = '16:9';
        if (size === '300x600') apiAspectRatio = '9:16';
        if (size === '300x250') apiAspectRatio = '4:3';
        if (size === '336x280') apiAspectRatio = '4:3';

        let response;
        const commonConfig = {
          responseModalities: [Modality.IMAGE],
          imageConfig: {
            aspectRatio: apiAspectRatio,
          },
        };

        if (useVertexAi) {
          response = await callGenAIApi({
            model: modelToUse,
            stepTag: `BulkResizer ${job.rowData.id}`,
            contents: {
              role: 'user',
              parts,
            },
            config: commonConfig,
          });
        } else {
          response = await ai.models.generateContent({
            model: modelToUse,
            contents: {parts},
            config: commonConfig,
          });
        }

        const imagePart = response.candidates?.[0]?.content?.parts?.find(
          (p: Part) => p.inlineData,
        );
        if (!imagePart || !imagePart.inlineData) {
          throw new Error('Model did not return an image.');
        }

        const geminiImage = `data:image/png;base64,${imagePart.inlineData.data}`;

        // Step 2: 代码精确裁剪
        const [targetW, targetH] = size.split('x').map(Number);
        const {croppedImageUrl} = await cropImageToSize(geminiImage, targetW, targetH);

        job.resultImageUrl = croppedImageUrl;
        job.status = 'success';
        return;

      } catch (e: unknown) {
        console.error(`Attempt ${attempt + 1} failed for job ${job.id}:`, e);
        if (attempt === MAX_RETRIES) {
          job.status = 'failed';
          job.error = e instanceof Error ? e.message : 'An unknown error occurred.';
        }
      }
    }
  };

  const startBulkGeneration = async (sizes: Record<string, boolean>) => {
    if (isBulkProcessing.value) {
      return;
    }

    if (originalCsvData.length > 0) {
        expandJobs(originalCsvData, sizes);
    }

    isBulkProcessing.value = true;
    const jobsToRun = bulkJobs.filter((j) => j.status === 'pending');
    for (const job of jobsToRun) {
      if (!isBulkProcessing.value) {
        break;
      }
      await generateImageForRow(job);
    }
    isBulkProcessing.value = false;
  };

  const rerunSelectedJobs = async (sizes: Record<string, boolean>) => {
    if (isBulkProcessing.value) {
      return;
    }
    const jobsToRerun = bulkJobs.filter((j) => j.selected);
    if (jobsToRerun.length === 0) {
      alert('Please select at least one row to rerun.');
      return;
    }

    jobsToRerun.forEach((job) => {
      job.status = 'pending';
      job.resultImageUrl = null;
      job.error = null;
      job.selected = false;
    });

    isBulkProcessing.value = true;
    for (const job of jobsToRerun) {
      if (!isBulkProcessing.value) {
        break;
      }
      await generateImageForRow(job);
    }
    isBulkProcessing.value = false;
  };

  const downloadBulkZip = async () => {
    if (isBulkDownloading.value) {
      return;
    }
    isBulkDownloading.value = true;
    try {
      const zip = new JSZip();
      const successfulJobs = bulkJobs.filter(
        (j) => j.status === 'success' && j.resultImageUrl,
      );

      await Promise.all(
        successfulJobs.map(async (job) => {
          const response = await fetch(job.resultImageUrl!);
          const blob = await response.blob();
          zip.file(`${job.rowData.id}.png`, blob);
        }),
      );

      const content = await zip.generateAsync({type: 'blob'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `banana_milkshake_bulk_resized_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      alert('Failed to create ZIP file.');
    } finally {
      isBulkDownloading.value = false;
    }
  };

  const updateSelectedSizes = (sizes: Record<string, boolean>) => {
    if (originalCsvData.length > 0) {
      expandJobs(originalCsvData, sizes);
    }
  };

  return {
    bulkJobs,
    isBulkProcessing,
    isBulkDownloading,
    bulkProgress,
    bulkCompletedCount,
    bulkSuccessCount,
    bulkGenaiModel,
    handleBulkFileUpload,
    startBulkGeneration,
    downloadBulkZip,
    rerunSelectedJobs,
    updateSelectedSizes,
  };
}
