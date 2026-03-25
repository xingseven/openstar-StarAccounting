"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeletons";
import {
  THEME_DIALOG_INPUT_CLASS,
  THEME_DIALOG_SELECT_CLASS,
  THEME_STATUS_NEUTRAL_SURFACE_CLASS,
  THEME_STATUS_SUCCESS_SURFACE_CLASS,
  ThemeActionBar,
  ThemeDialogSection,
  ThemeFormField,
  ThemeFormGrid,
  ThemeHero,
  ThemeMetricCard,
  ThemeNotice,
  ThemeSectionHeader,
  ThemeSurface,
  type ThemeTone,
} from "@/components/shared/theme-primitives";
import { cn } from "@/lib/utils";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: "vision" | "text";
  status: "active" | "inactive";
  apiKeyConfigured: boolean;
  isDefault: boolean;
  endpoint?: string;
  modelId?: string;
  description: string;
}

const initialModels: AIModel[] = [];

type NoticeState = {
  tone: ThemeTone;
  title?: string;
  description: string;
};

const PROVIDERS = [
  { id: "volcengine", name: "火山引擎 (豆包)", baseUrl: "https://ark.cn-beijing.volces.com/api/v3" },
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com" },
  { id: "custom", name: "自定义", baseUrl: "" },
];

export default function AIPage() {
  const [models, setModels] = useState<AIModel[]>(initialModels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [configModel, setConfigModel] = useState<AIModel | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("configured");
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    provider: "volcengine",
    type: "vision" as "vision" | "text",
    endpoint: "",
    modelId: "",
    apiKey: "",
    description: "",
  });

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [configForm, setConfigForm] = useState({
    name: "",
    provider: "",
    endpoint: "",
    modelId: "",
  });

  const [isTesting, setIsTesting] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [pageNotice, setPageNotice] = useState<NoticeState | null>(null);
  const [formNotice, setFormNotice] = useState<NoticeState | null>(null);
  const [configNotice, setConfigNotice] = useState<NoticeState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    void loadModels();
  }, []);

  async function loadModels() {
    try {
      const data = await apiFetch<{ items: AIModel[] }>("/api/ai/models");
      setModels(data.items || []);
      setHasLoadError(false);
      return true;
    } catch (loadError) {
      console.error(loadError);
      setHasLoadError(true);
      setPageNotice({
        tone: "red",
        title: "模型列表加载失败",
        description: loadError instanceof Error ? loadError.message : "请稍后重试。",
      });
      return false;
    }
  }

  const configuredModels = models.filter((model) => model.apiKeyConfigured);
  const unconfiguredModels = models.filter((model) => !model.apiKeyConfigured);

  function openCreate() {
    setEditingModel(null);
    setFormNotice(null);
    setShowApiKey(false);
    setFormData({
      name: "",
      provider: "volcengine",
      type: "vision",
      endpoint: "https://ark.cn-beijing.volces.com/api/v3",
      modelId: "",
      apiKey: "",
      description: "",
    });
    setIsModalOpen(true);
  }

  function openEdit(model: AIModel) {
    const providerLabel = model.provider.toLowerCase();
    setEditingModel(model);
    setFormNotice(null);
    setShowApiKey(false);
    setFormData({
      name: model.name,
      provider: providerLabel.includes("火山") ? "volcengine" : providerLabel.includes("openai") ? "openai" : providerLabel.includes("anthropic") ? "anthropic" : "custom",
      type: model.type,
      endpoint: model.endpoint || "",
      modelId: model.modelId || "",
      apiKey: "",
      description: model.description,
    });
    setIsModalOpen(true);
  }

  function openConfig(model: AIModel) {
    setConfigModel(model);
    setApiKey("");
    setShowApiKey(false);
    setConfigNotice(null);
    setConfigForm({
      name: model.name,
      provider: model.provider,
      endpoint: model.endpoint || "",
      modelId: model.modelId || "",
    });
    setIsConfigModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormNotice(null);
    const provider = PROVIDERS.find((item) => item.id === formData.provider);

    const payload = {
      name: formData.name,
      provider: provider?.name || formData.provider,
      type: formData.type,
      endpoint: formData.endpoint || provider?.baseUrl,
      modelId: formData.modelId,
      apiKey: formData.apiKey || undefined,
      status: formData.apiKey ? "active" : "inactive",
      description: formData.description,
    };

    try {
      if (editingModel) {
        await apiFetch(`/api/ai/models/${editingModel.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/ai/models", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const refreshed = await loadModels();
      if (refreshed) {
        setPageNotice({
          tone: "green",
          title: editingModel ? "模型已更新" : "模型已添加",
          description: editingModel ? "模型基础信息已保存。" : "新模型已经加入可配置列表。",
        });
      }
      setIsModalOpen(false);
    } catch (submitError) {
      setFormNotice({
        tone: "red",
        title: editingModel ? "更新失败" : "创建失败",
        description: submitError instanceof Error ? submitError.message : "请稍后重试。",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个模型吗？")) return;

    try {
      await apiFetch(`/api/ai/models/${id}`, { method: "DELETE" });
      const refreshed = await loadModels();
      if (refreshed) {
        setPageNotice({
          tone: "green",
          title: "模型已删除",
          description: "该模型已从列表中移除。",
        });
      }
    } catch (deleteError) {
      setPageNotice({
        tone: "red",
        title: "删除失败",
        description: deleteError instanceof Error ? deleteError.message : "请稍后重试。",
      });
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await apiFetch(`/api/ai/models/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isDefault: true }),
      });
      const refreshed = await loadModels();
      if (refreshed) {
        setPageNotice({
          tone: "green",
          title: "默认模型已更新",
          description: "后续 AI 功能将优先使用该模型。",
        });
      }
    } catch (defaultError) {
      setPageNotice({
        tone: "red",
        title: "设置默认模型失败",
        description: defaultError instanceof Error ? defaultError.message : "请稍后重试。",
      });
    }
  }

  async function handleConfigSave() {
    if (!configModel) return;
    setConfigNotice(null);

    try {
      await apiFetch(`/api/ai/models/${configModel.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: configForm.name,
          provider: configForm.provider,
          endpoint: configForm.endpoint || undefined,
          modelId: configForm.modelId || undefined,
          apiKey: apiKey || undefined,
          status: apiKey ? "active" : "inactive",
        }),
      });
      const refreshed = await loadModels();
      if (refreshed) {
        setPageNotice({
          tone: "green",
          title: "模型配置已保存",
          description: "端点、模型 ID 和 API Key 已更新。",
        });
      }
      setIsConfigModalOpen(false);
    } catch (saveError) {
      setConfigNotice({
        tone: "red",
        title: "配置保存失败",
        description: saveError instanceof Error ? saveError.message : "请稍后重试。",
      });
    }
  }

  async function handleTestConnection() {
    if (!configForm.endpoint || !configForm.modelId || !apiKey) {
      setConfigNotice({
        tone: "amber",
        title: "信息未填写完整",
        description: "测试连接前请补全端点、模型 ID 和 API Key。",
      });
      return;
    }

    setIsTesting(true);
    setConfigNotice(null);
    try {
      const response = await apiFetch<{ message: string }>("/api/ai/models/test", {
        method: "POST",
        body: JSON.stringify({
          endpoint: configForm.endpoint,
          modelId: configForm.modelId,
          apiKey,
          provider: configForm.provider,
        }),
      });
      setConfigNotice({
        tone: "green",
        title: "连接测试通过",
        description: response.message || "当前配置可以正常连接模型服务。",
      });
    } catch (testError) {
      setConfigNotice({
        tone: "red",
        title: "连接测试失败",
        description: testError instanceof Error ? testError.message : "请检查端点或密钥后重试。",
      });
    } finally {
      setIsTesting(false);
    }
  }

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
  }

  if (showInitialSkeleton) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 py-4 sm:space-y-5 sm:py-6 lg:py-8">
        <Skeleton className="h-[180px] rounded-[28px]" />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
        </div>
        <Skeleton className="h-[220px] rounded-[24px]" />
        <Skeleton className="h-[260px] rounded-[24px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 py-4 sm:space-y-5 sm:py-6 lg:py-8">
      <ThemeHero className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">AI 模型配置</h1>
            <p className="mt-1 text-sm text-slate-500">管理视觉与文本模型接入，为 AI 记账和分析提供服务。</p>
          </div>
        </div>
      </ThemeHero>

      <div className="grid gap-3 md:grid-cols-3">
        <ThemeMetricCard label="模型总数" value={`${models.length} 个`} detail="全部模型" tone="blue" icon={Brain} className="p-4" hideDetailOnMobile />
        <ThemeMetricCard label="已配置" value={`${configuredModels.length} 个`} detail="可用模型" tone="green" icon={CheckCircle2} className="p-4" hideDetailOnMobile />
        <ThemeMetricCard label="未配置" value={`${unconfiguredModels.length} 个`} detail="待配置" tone="slate" icon={Key} className="p-4" hideDetailOnMobile />
      </div>

      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader
          eyebrow="功能说明"
          title="AI 智能记账"
          description="配置视觉或文本模型后，可在消费页使用 AI 拍照记账与智能分析。"
          action={
            <Button onClick={openCreate} className="rounded-2xl bg-slate-900 hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" />
              添加模型
            </Button>
          }
        />
      </ThemeSurface>

      {pageNotice ? <ThemeNotice tone={pageNotice.tone} title={pageNotice.title} description={pageNotice.description} /> : null}

      {models.length === 0 && !hasLoadError ? (
        <ThemeNotice
          tone="slate"
          title="还没有可用模型"
          description="先添加一个视觉或文本模型，后续 AI 记账、分析和图片识别功能才会启用。"
        />
      ) : null}

      {configuredModels.length > 0 ? (
        <ThemeSurface className="p-4 sm:p-6">
          <button className="flex w-full items-center justify-between" onClick={() => toggleSection("configured")}>
            <div className="flex items-center gap-2">
              {expandedSection === "configured" ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
              <h2 className="text-base font-semibold text-slate-950 sm:text-lg">已配置模型</h2>
            </div>
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">{configuredModels.length} 个</span>
          </button>
          {expandedSection === "configured" ? (
            <div className="mt-5 space-y-3">
              {configuredModels.map((model) => (
                <ModelCard key={model.id} model={model} onEdit={() => openEdit(model)} onConfig={() => openConfig(model)} onDelete={() => handleDelete(model.id)} onSetDefault={() => handleSetDefault(model.id)} />
              ))}
            </div>
          ) : null}
        </ThemeSurface>
      ) : null}

      {unconfiguredModels.length > 0 ? (
        <ThemeSurface className="p-4 sm:p-6">
          <button className="flex w-full items-center justify-between" onClick={() => toggleSection("unconfigured")}>
            <div className="flex items-center gap-2">
              {expandedSection === "unconfigured" ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
              <h2 className="text-base font-semibold text-slate-950 sm:text-lg">未配置模型</h2>
            </div>
            <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">{unconfiguredModels.length} 个</span>
          </button>
          {expandedSection === "unconfigured" ? (
            <div className="mt-5 space-y-3">
              {unconfiguredModels.map((model) => (
                <ModelCard key={model.id} model={model} onEdit={() => openEdit(model)} onConfig={() => openConfig(model)} onDelete={() => handleDelete(model.id)} onSetDefault={() => handleSetDefault(model.id)} />
              ))}
            </div>
          ) : null}
        </ThemeSurface>
      ) : null}

      <BottomSheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>{editingModel ? "编辑模型" : "添加新模型"}</BottomSheetTitle>
            <BottomSheetDescription>
              {editingModel ? "更新模型的基础信息和启用参数。" : "先登记模型信息，后续可继续补充或调整配置。"}
            </BottomSheetDescription>
          </BottomSheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formNotice ? <ThemeNotice tone={formNotice.tone} title={formNotice.title} description={formNotice.description} /> : null}

            <ThemeNotice
              tone="slate"
              title="模型信息"
              description="这里维护模型名称、提供商、端点和模型 ID。填写 API Key 后可直接启用，不填则会保留为待配置状态。"
            />

            <ThemeDialogSection className="space-y-4">
              <ThemeFormField label="模型名称">
                <Input
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="例如：豆包视觉模型"
                  required
                  className={THEME_DIALOG_INPUT_CLASS}
                />
              </ThemeFormField>

              <ThemeFormGrid>
                <ThemeFormField label="提供商">
                  <select
                    className={THEME_DIALOG_SELECT_CLASS}
                    value={formData.provider}
                    onChange={(event) => {
                      const provider = PROVIDERS.find((item) => item.id === event.target.value);
                      setFormData({
                        ...formData,
                        provider: event.target.value,
                        endpoint: provider?.baseUrl || "",
                      });
                    }}
                  >
                    {PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </ThemeFormField>

                <ThemeFormField label="模型类型">
                  <select
                    className={THEME_DIALOG_SELECT_CLASS}
                    value={formData.type}
                    onChange={(event) => setFormData({ ...formData, type: event.target.value as "vision" | "text" })}
                  >
                    <option value="vision">视觉模型</option>
                    <option value="text">文本模型</option>
                  </select>
                </ThemeFormField>
              </ThemeFormGrid>

              <ThemeFormField
                label="API 端点"
                hint={formData.provider === "custom" ? "自定义提供商需要填写完整的请求地址。" : "切换提供商时会自动填入推荐端点。"}
              >
                <Input
                  value={formData.endpoint}
                  onChange={(event) => setFormData({ ...formData, endpoint: event.target.value })}
                  placeholder="https://ark.cn-beijing.volces.com/api/v3"
                  className={THEME_DIALOG_INPUT_CLASS}
                />
              </ThemeFormField>

              <ThemeFormGrid>
                <ThemeFormField label="模型 ID">
                  <Input
                    value={formData.modelId}
                    onChange={(event) => setFormData({ ...formData, modelId: event.target.value })}
                    placeholder="例如：doubao-vision-pro-xxx"
                    className={THEME_DIALOG_INPUT_CLASS}
                  />
                </ThemeFormField>

                <ThemeFormField label="描述" hint="可选，用一句话标注用途。">
                  <Input
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    placeholder="简短描述此模型的用途"
                    className={THEME_DIALOG_INPUT_CLASS}
                  />
                </ThemeFormField>
              </ThemeFormGrid>

              <ThemeFormField label="API Key" hint="留空则仅登记模型信息，不会立即启用。">
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={formData.apiKey}
                    onChange={(event) => setFormData({ ...formData, apiKey: event.target.value })}
                    placeholder="请输入 API Key"
                    className={cn(THEME_DIALOG_INPUT_CLASS, "pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </ThemeFormField>
            </ThemeDialogSection>
            <ThemeActionBar>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-11 rounded-2xl sm:min-w-28">
                取消
              </Button>
              <Button type="submit" className="h-11 rounded-2xl sm:min-w-28">
                保存
              </Button>
            </ThemeActionBar>
          </form>
        </BottomSheetContent>
      </BottomSheet>

      <BottomSheet open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>配置模型</BottomSheetTitle>
            <BottomSheetDescription>补全可直接调用模型服务的运行参数，并在保存前完成连通性测试。</BottomSheetDescription>
          </BottomSheetHeader>
          <div className="space-y-4">
            {configNotice ? <ThemeNotice tone={configNotice.tone} title={configNotice.title} description={configNotice.description} /> : null}

            <ThemeNotice tone="blue" title="连接测试" description="建议先测试接口可用性，再保存到当前模型配置。" />

            <ThemeDialogSection className="space-y-4">
              <ThemeFormField label="模型名称">
                <Input value={configForm.name} onChange={(event) => setConfigForm({ ...configForm, name: event.target.value })} className={THEME_DIALOG_INPUT_CLASS} />
              </ThemeFormField>

              <ThemeFormField label="提供商">
                <Input value={configForm.provider} onChange={(event) => setConfigForm({ ...configForm, provider: event.target.value })} className={THEME_DIALOG_INPUT_CLASS} />
              </ThemeFormField>

              <ThemeFormField label="API 端点">
                <Input value={configForm.endpoint} onChange={(event) => setConfigForm({ ...configForm, endpoint: event.target.value })} className={THEME_DIALOG_INPUT_CLASS} />
              </ThemeFormField>

              <ThemeFormField label="模型 ID">
                <Input value={configForm.modelId} onChange={(event) => setConfigForm({ ...configForm, modelId: event.target.value })} className={THEME_DIALOG_INPUT_CLASS} />
              </ThemeFormField>

              <ThemeFormField label="API Key" hint="测试连接与保存配置都会使用当前输入的密钥。">
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    className={cn(THEME_DIALOG_INPUT_CLASS, "pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </ThemeFormField>
            </ThemeDialogSection>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-2xl"
              disabled={isTesting}
              onClick={() => void handleTestConnection()}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  测试中...
                </>
              ) : (
                "测试连接"
              )}
            </Button>
          </div>
          <ThemeActionBar>
            <Button type="button" variant="outline" onClick={() => setIsConfigModalOpen(false)} className="h-11 rounded-2xl sm:min-w-28">
              取消
            </Button>
            <Button onClick={handleConfigSave} className="h-11 rounded-2xl sm:min-w-28">
              保存配置
            </Button>
          </ThemeActionBar>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  );
}

function ModelCard({
  model,
  onEdit,
  onConfig,
  onDelete,
  onSetDefault,
}: {
  model: AIModel;
  onEdit: () => void;
  onConfig: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={cn("flex items-center justify-between rounded-xl border p-4 transition-all", model.status === "active" ? THEME_STATUS_SUCCESS_SURFACE_CLASS : THEME_STATUS_NEUTRAL_SURFACE_CLASS)}>
      <div className="flex items-center gap-4">
        <div className={cn("rounded-lg p-2", model.status === "active" ? "bg-green-100" : "bg-slate-100")}>
          <Brain className={cn("h-5 w-5", model.status === "active" ? "text-green-600" : "text-slate-500")} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 sm:text-base">{model.name}</span>
            {model.status === "active" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-yellow-600" />}
            {model.isDefault ? <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">默认</span> : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 sm:text-xs">
            <span>{model.provider}</span>
            <span>·</span>
            <span className={cn("rounded px-1.5 py-0.5", model.type === "vision" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700")}>
              {model.type === "vision" ? "视觉" : "文本"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onConfig}>
          <Key className="mr-1 h-3 w-3" />
          {model.apiKeyConfigured ? "修改" : "配置"}
        </Button>
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowActions(!showActions)}>
            <Settings className="h-4 w-4" />
          </Button>
          {showActions ? (
            <div className="absolute right-0 top-full z-10 mt-1 min-w-[100px] rounded-lg border bg-white py-1 shadow-lg">
              {!model.isDefault ? (
                <button
                  onClick={() => {
                    onSetDefault();
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  设为默认
                </button>
              ) : null}
              <button
                onClick={() => {
                  onEdit();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <Edit className="h-3 w-3" />
                编辑
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
                删除
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
