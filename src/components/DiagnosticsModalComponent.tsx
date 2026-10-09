/**
 * Copyright 2026 Google LLC
 *
 * Diagnostics & Logging Console Component
 * Real-time monitoring of Vertex AI API requests, latency, prompt payloads, and error telemetry.
 */

import { defineComponent, ref, onMounted, computed, PropType } from 'vue';
import { currentLanguage, t } from '../i18n';

export interface LogEntry {
  id: string;
  timestamp: string;
  status: number;
  model: string;
  durationMs: number;
  imagesCount: number;
  outputSizeBytes: number;
  prompt: string;
  error: string | null;
}

export interface EnvironmentInfo {
  gcpProject: string;
  gcpLocation: string;
  activeImageModel: string;
  activeTextModel: string;
  cloudRunRevision: string;
  uptimeSeconds: number;
}

export const DiagnosticsModalComponent = defineComponent({
  name: 'DiagnosticsModalComponent',
  props: {
    isOpen: { type: Boolean, required: true },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const logs = ref<LogEntry[]>([]);
    const env = ref<EnvironmentInfo | null>(null);
    const isLoading = ref(false);
    const filter = ref<'all' | 'success' | 'error'>('all');
    const copiedText = ref(false);

    const fetchLogs = async () => {
      isLoading.value = true;
      try {
        const resp = await fetch('/api/logs');
        if (resp.ok) {
          const data = await resp.json();
          logs.value = data.logs || [];
          env.value = data.environment || null;
        }
      } catch (e) {
        console.error('Failed to load server diagnostics logs:', e);
      } finally {
        isLoading.value = false;
      }
    };

    const clearLogs = async () => {
      if (!confirm('确定清空当前诊断流水日志吗？')) return;
      try {
        await fetch('/api/logs', { method: 'DELETE' });
        logs.value = [];
      } catch (e) {
        console.error(e);
      }
    };

    const copyAllLogs = () => {
      const json = JSON.stringify({ environment: env.value, logs: logs.value }, null, 2);
      navigator.clipboard.writeText(json);
      copiedText.value = true;
      setTimeout(() => (copiedText.value = false), 2000);
    };

    const filteredLogs = computed(() => {
      if (filter.value === 'success') return logs.value.filter((l) => l.status === 200);
      if (filter.value === 'error') return logs.value.filter((l) => l.status !== 200);
      return logs.value;
    });

    const avgLatency = computed(() => {
      if (logs.value.length === 0) return '0.0s';
      const sum = logs.value.reduce((acc, l) => acc + (l.durationMs || 0), 0);
      return (sum / logs.value.length / 1000).toFixed(1) + 's';
    });

    const successRate = computed(() => {
      if (logs.value.length === 0) return '100%';
      const ok = logs.value.filter((l) => l.status === 200).length;
      return Math.round((ok / logs.value.length) * 100) + '%';
    });

    onMounted(() => {
      if (props.isOpen) {
        fetchLogs();
      }
    });

    return () => {
      if (!props.isOpen) return null;

      const gcpLogsUrl = `https://console.cloud.google.com/run/detail/us-central1/banana-milkshake/logs?project=${env.value?.gcpProject || 'panliuyang-ramp-up-project-01'}`;

      return (
        <div class="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => emit('close')}></div>

          {/* Slide-out Drawer */}
          <div class="relative w-full max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col border-l border-gray-200">
            {/* Drawer Header */}
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-900 text-white flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🛠️</span>
                <div>
                  <h3 class="font-bold text-base flex items-center gap-2">
                    <span>系统运行日志与诊断中心</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                      ACTIVE
                    </span>
                  </h3>
                  <p class="text-xs text-gray-400">Vertex AI API 请求链路、响应耗时与报错排查</p>
                </div>
              </div>
              <button
                onClick={() => emit('close')}
                class="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div class="grid grid-cols-4 gap-2 p-4 bg-gray-50 border-b border-gray-200 text-center">
              <div class="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                <div class="text-[11px] text-gray-500 font-medium">累计请求</div>
                <div class="text-lg font-black text-gray-900">{logs.value.length}</div>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                <div class="text-[11px] text-gray-500 font-medium">成功率</div>
                <div class="text-lg font-black text-emerald-600">{successRate.value}</div>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                <div class="text-[11px] text-gray-500 font-medium">平均延迟</div>
                <div class="text-lg font-black text-indigo-600">{avgLatency.value}</div>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                <div class="text-[11px] text-gray-500 font-medium">默认模型</div>
                <div class="text-xs font-bold text-gray-800 truncate mt-1">nano-banana-2.1</div>
              </div>
            </div>

            {/* Cloud Logging Link Banner */}
            <div class="px-6 py-2.5 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
              <div class="flex items-center gap-1.5 font-medium">
                <span>☁️ GCP Cloud Logging 云端全量日志:</span>
                <span class="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {env.value?.cloudRunRevision || 'banana-milkshake-live'}
                </span>
              </div>
              <a
                href={gcpLogsUrl}
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900 hover:underline">
                <span>在 Cloud Console 打开</span>
                <span>&rarr;</span>
              </a>
            </div>

            {/* Filter and Actions Bar */}
            <div class="px-6 py-3 border-b border-gray-200 flex items-center justify-between gap-3 bg-white">
              <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => (filter.value = 'all')}
                  class={`px-2.5 py-1 rounded-md transition-all ${
                    filter.value === 'all' ? 'bg-white font-bold text-gray-900 shadow-xs' : 'text-gray-600'
                  }`}>
                  全部 ({logs.value.length})
                </button>
                <button
                  onClick={() => (filter.value = 'success')}
                  class={`px-2.5 py-1 rounded-md transition-all ${
                    filter.value === 'success' ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-gray-600'
                  }`}>
                  成功 ({logs.value.filter((l) => l.status === 200).length})
                </button>
                <button
                  onClick={() => (filter.value = 'error')}
                  class={`px-2.5 py-1 rounded-md transition-all ${
                    filter.value === 'error' ? 'bg-white font-bold text-red-700 shadow-xs' : 'text-gray-600'
                  }`}>
                  失败 ({logs.value.filter((l) => l.status !== 200).length})
                </button>
              </div>

              <div class="flex items-center gap-2">
                <button
                  onClick={fetchLogs}
                  disabled={isLoading.value}
                  class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors">
                  <span>🔄</span>
                  <span>{isLoading.value ? '刷新中...' : '刷新'}</span>
                </button>
                <button
                  onClick={copyAllLogs}
                  class="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
                  <span>📋</span>
                  <span>{copiedText.value ? '已复制！' : '复制诊断 JSON'}</span>
                </button>
                <button
                  onClick={clearLogs}
                  class="px-2 py-1 text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs rounded-lg transition-colors"
                  title="清空流水">
                  <span>🗑️</span>
                </button>
              </div>
            </div>

            {/* Logs List Container */}
            <div class="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
              {filteredLogs.value.length === 0 ? (
                <div class="text-center py-20 text-gray-400">
                  <div class="text-3xl mb-2">📜</div>
                  <div class="text-sm font-semibold text-gray-600">暂无请求日志</div>
                  <p class="text-xs text-gray-400 mt-1">当在画布中点击生成或执行尺寸重构时，调用流水将在此实时呈现</p>
                </div>
              ) : (
                filteredLogs.value.map((entry) => (
                  <div
                    key={entry.id}
                    class="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs hover:border-indigo-300 transition-all space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2">
                        <span
                          class={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                            entry.status === 200
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {entry.status === 200 ? '200 OK' : `${entry.status} ERROR`}
                        </span>
                        <span class="font-mono text-gray-600 font-semibold">{entry.model}</span>
                        <span class="text-gray-400">|</span>
                        <span class="text-gray-500 font-mono">{(entry.durationMs / 1000).toFixed(2)}s</span>
                      </div>
                      <span class="text-[11px] text-gray-400 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Prompt Snippet */}
                    <div class="bg-gray-50 rounded-lg p-2.5 border border-gray-100 text-xs text-gray-800 font-mono break-words leading-relaxed">
                      <div class="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Prompt Payload</div>
                      {entry.prompt || '<No Text Prompt>'}
                    </div>

                    {/* Metadata & Errors */}
                    <div class="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      <span>输入资产: {entry.imagesCount} 张 | 产出大小: {Math.round(entry.outputSizeBytes / 1024)} KB</span>
                      {entry.error && (
                        <span class="text-red-600 font-semibold truncate max-w-xs">{entry.error}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div class="p-4 border-t border-gray-200 bg-white flex justify-between items-center text-xs text-gray-500">
              <span>GCP 项目: <code class="font-mono text-gray-800">{env.value?.gcpProject || 'panliuyang-ramp-up-project-01'}</code></span>
              <button
                onClick={() => emit('close')}
                class="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      );
    };
  },
});
