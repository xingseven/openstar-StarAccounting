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
import { Label } from "@/components/ui/label";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeletons";
import { ThemeActionBar, ThemeDialogSection, ThemeHero, ThemeMetricCard, ThemeSectionHeader, ThemeSurface } from "@/components/shared/theme-primitives";
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

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    void loadModels();
  }, []);

  async function loadModels() {
    const data = await apiFetch<{ items: AIModel[] }>("/api/ai/models");
    setModels(data.items || []);
  }

  const configuredModels = models.filter((model) => model.apiKeyConfigured);
  const unconfiguredModels = models.filter((model) => !model.apiKeyConfigured);

  function openCreate() {
    setEditingModel(null);
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
    setEditingModel(model);
    setFormData({
      name: model.name,
      provider: model.provider.toLowerCase().includes("火山") ? "volcengine" : model.provider.toLowerCase().includes("openai") ? "openai" : model.provider.toLowerCase().includes("anthropic") ? "anthropic" : "custom",
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

    await loadModels();
    setIsModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个模型吗？")) return;
    await apiFetch(`/api/ai/models/${id}`, { method: "DELETE" });
    await loadModels();
  }

  async function handleSetDefault(id: string) {
    await apiFetch(`/api/ai/models/${id}`, {
      method: "PUT",
      body: JSON.stringify({ isDefault: true }),
    });
    await loadModels();
  }

  async function handleConfigSave() {
    if (!configModel) return;

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
    await loadModels();
    setIsConfigModalOpen(false);
  }

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
  }

  if (showInitialSkeleton) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
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
    <div className="mx-auto max-w-[1680px] space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
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

      {configuredModels.length > 0 ? (
        <ThemeSurface className="p-4 sm:p-6">
          <button className="flex w-full items-center justify-between" onClick={() => toggleSection("configured")}>
            <div className="flex items-center gap-2">
              {expandedSection === "configured" ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
              <h2 className="text-lg font-semibold text-slate-950">已配置模型</h2>
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
              <h2 className="text-lg font-semibold text-slate-950">未配置模型</h2>
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
          </BottomSheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ThemeDialogSection className="space-y-2">
              <Label>模型名称</Label>
              <Input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="例如：豆包视觉模型" required />
            </ThemeDialogSection>
            <ThemeDialogSection className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>提供商</Label>
                <select
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
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
              </div>
              <div className="space-y-2">
                <Label>模型类型</Label>
                <select className="w-full rounded-md border border-input px-3 py-2 text-sm" value={formData.type} onChange={(event) => setFormData({ ...formData, type: event.target.value as "vision" | "text" })}>
                  <option value="vision">视觉模型</option>
                  <option value="text">文本模型</option>
                </select>
              </div>
            </ThemeDialogSection>
            <ThemeDialogSection className="space-y-2">
              <Label>API 端点</Label>
              <Input value={formData.endpoint} onChange={(event) => setFormData({ ...formData, endpoint: event.target.value })} placeholder="https://ark.cn-beijing.volces.com/api/v3" />
            </ThemeDialogSection>
            <ThemeDialogSection className="space-y-2">
              <Label>模型 ID</Label>
              <Input value={formData.modelId} onChange={(event) => setFormData({ ...formData, modelId: event.target.value })} placeholder="例如：doubao-vision-pro-xxx" />
            </ThemeDialogSection>
            <ThemeDialogSection className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={formData.apiKey}
                  onChange={(event) => setFormData({ ...formData, apiKey: event.target.value })}
                  placeholder="请输入 API Key"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </ThemeDialogSection>
            <ThemeDialogSection className="space-y-2">
              <Label>描述</Label>
              <Input value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="简短描述此模型的用途" />
            </ThemeDialogSection>
            <ThemeActionBar>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </ThemeActionBar>
          </form>
        </BottomSheetContent>
      </BottomSheet>

      <BottomSheet open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>配置模型</BottomSheetTitle>
          </BottomSheetHeader>
          <div className="space-y-4">
            <ThemeDialogSection className="space-y-2">
              <Label>模型名称</Label>
              <Input value={configForm.name} onChange={(event) => setConfigForm({ ...configForm, name: event.target.value })} />
            </ThemeDialogSection>
            <ThemeDialogSection className="space-y-2">
              <Label>提供商</Label>
              <Input value={configForm.provider} onChange={(event) => setConfigForm({ ...configForm, provider: event.target.value })} />
            </ThemeDialogSection>
            <ThemeDialogSection className="space-y-2">
              <Label>API 端点</Label>
              <Input value={configForm.endpoint} onChange={(event) => setConfigForm({ ...configForm, endpoint: event.target.value })} />
            </ThemeDialogSection>
            <ThemeDialogSection className="space-y-2">
              <Label>模型 ID</Label>
              <Input value={configForm.modelId} onChange={(event) => setConfigForm({ ...configForm, modelId: event.target.value })} />
            </ThemeDialogSection>
            <ThemeDialogSection className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Key className="h-4 w-4" />
                <span>API Key</span>
              </div>
              <div className="relative">
                <Input type={showApiKey ? "text" : "password"} value={apiKey} onChange={(event) => setApiKey(event.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </ThemeDialogSection>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isTesting}
              onClick={async () => {
                if (!configForm.endpoint || !configForm.modelId || !apiKey) {
                  alert("请填写完整的端点、模型 ID 和 API Key");
                  return;
                }
                setIsTesting(true);
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
                  alert(response.message || "连接成功");
                } catch (testError) {
                  alert(testError instanceof Error ? testError.message : "连接失败");
                } finally {
                  setIsTesting(false);
                }
              }}
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
            <Button type="button" variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfigSave}>保存配置</Button>
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
    <div className={cn("flex items-center justify-between rounded-xl border p-4 transition-all", model.status === "active" ? "border-green-200 bg-green-50" : "border-slate-200 bg-white hover:border-slate-300")}>
      <div className="flex items-center gap-4">
        <div className={cn("rounded-lg p-2", model.status === "active" ? "bg-green-100" : "bg-slate-100")}>
          <Brain className={cn("h-5 w-5", model.status === "active" ? "text-green-600" : "text-slate-500")} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{model.name}</span>
            {model.status === "active" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-yellow-600" />}
            {model.isDefault ? <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">默认</span> : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
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
