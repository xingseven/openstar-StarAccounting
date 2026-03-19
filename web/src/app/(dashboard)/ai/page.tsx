"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Key,
  Loader2
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetFooter,
} from "@/components/ui/bottomsheet";
import { apiFetch } from "@/lib/api";

// 大模型类型定义
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

// 初始为空，用户自行添加
const initialModels: AIModel[] = [];

// 支持的模型提供商
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

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    provider: "volcengine",
    type: "vision" as "vision" | "text",
    endpoint: "",
    modelId: "",
    apiKey: "",
    description: ""
  });

  // 配置状态
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [configForm, setConfigForm] = useState({
    name: "",
    provider: "",
    endpoint: "",
    modelId: ""
  });

  // 筛选状态
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  // 加载数据
  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    setLoading(true);
    try {
      const data = await apiFetch<{ items: AIModel[] }>("/api/ai/models");
      setModels(data.items || []);
    } catch (error) {
      console.error("Failed to load models:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredModels = models.filter(m => {
    if (filterStatus === "all") return true;
    return m.status === filterStatus;
  });

  const configuredModels = models.filter(m => m.apiKeyConfigured);
  const unconfiguredModels = models.filter(m => !m.apiKeyConfigured);

  function openCreate() {
    setEditingModel(null);
    setFormData({
      name: "",
      provider: "volcengine",
      type: "vision",
      endpoint: "https://ark.cn-beijing.volces.com/api/v3",
      modelId: "",
      apiKey: "",
      description: ""
    });
    setIsModalOpen(true);
  }

  function openEdit(model: AIModel) {
    setEditingModel(model);
    setFormData({
      name: model.name,
      provider: model.provider.toLowerCase().includes("火山") ? "volcengine" :
                model.provider.toLowerCase().includes("openai") ? "openai" :
                model.provider.toLowerCase().includes("anthropic") ? "anthropic" : "custom",
      type: model.type,
      endpoint: model.endpoint || "",
      modelId: model.modelId || "",
      apiKey: "",
      description: model.description
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
      modelId: model.modelId || ""
    });
    setIsConfigModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const provider = PROVIDERS.find(p => p.id === formData.provider);

    try {
      if (editingModel) {
        // 更新
        await apiFetch(`/api/ai/models/${editingModel.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: formData.name,
            provider: provider?.name || formData.provider,
            type: formData.type,
            endpoint: formData.endpoint || provider?.baseUrl,
            modelId: formData.modelId,
            apiKey: formData.apiKey || undefined,
            status: formData.apiKey ? "active" : "inactive",
            description: formData.description
          })
        });
      } else {
        // 创建
        await apiFetch("/api/ai/models", {
          method: "POST",
          body: JSON.stringify({
            name: formData.name,
            provider: provider?.name || formData.provider,
            type: formData.type,
            endpoint: formData.endpoint || provider?.baseUrl,
            modelId: formData.modelId,
            apiKey: formData.apiKey || undefined,
            status: formData.apiKey ? "active" : "inactive",
            description: formData.description
          })
        });
      }
      await loadModels();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save model error:", error);
      alert("保存失败");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个模型吗？")) return;
    try {
      await apiFetch(`/api/ai/models/${id}`, { method: "DELETE" });
      await loadModels();
    } catch (error) {
      console.error("Delete model error:", error);
      alert("删除失败");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await apiFetch(`/api/ai/models/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isDefault: true })
      });
      await loadModels();
    } catch (error) {
      console.error("Set default error:", error);
      alert("设置默认模型失败");
    }
  }

  async function handleConfigSave() {
    if (!configModel) return;

    try {
      await apiFetch(`/api/ai/models/${configModel.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: configForm.name,
          provider: configForm.provider,
          endpoint: configForm.endpoint || undefined,
          modelId: configForm.modelId || undefined,
          apiKey: apiKey || undefined,
          status: apiKey ? "active" : "inactive"
        })
      });
      await loadModels();
      setIsConfigModalOpen(false);
    } catch (error) {
      console.error("Save config error:", error);
      alert("保存配置失败");
    }
  }

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">大模型配置</h1>
            <p className="text-sm text-gray-500">管理 AI 大模型接入，支持视觉识别与文本处理</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          添加模型
        </Button>
      </div>

      {/* 功能介绍卡片 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI 智能记账</h3>
              <p className="text-sm text-gray-600 mb-3">
                配置大模型后，可在消费页面使用「AI 拍照记账」功能，自动识别小票、账单上的金额、商户、日期等信息。
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="/consumption">前往体验</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 已配置的模型 */}
      {configuredModels.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("configured")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {expandedSection === "configured" ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <CardTitle className="text-base">已配置模型</CardTitle>
              </div>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {configuredModels.length} 个
              </span>
            </div>
          </CardHeader>
          {expandedSection === "configured" && (
            <CardContent className="space-y-3">
              {configuredModels.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onEdit={() => openEdit(model)}
                  onConfig={() => openConfig(model)}
                  onDelete={() => handleDelete(model.id)}
                  onSetDefault={() => handleSetDefault(model.id)}
                />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* 未配置的模型 */}
      {unconfiguredModels.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("unconfigured")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {expandedSection === "unconfigured" ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <CardTitle className="text-base">未配置模型</CardTitle>
              </div>
              <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {unconfiguredModels.length} 个
              </span>
            </div>
            <CardDescription className="mt-1">
              需要配置 API Key 才能使用
            </CardDescription>
          </CardHeader>
          {expandedSection === "unconfigured" && (
            <CardContent className="space-y-3">
              {unconfiguredModels.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onEdit={() => openEdit(model)}
                  onConfig={() => openConfig(model)}
                  onDelete={() => handleDelete(model.id)}
                  onSetDefault={() => handleSetDefault(model.id)}
                />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* 添加/编辑模型弹窗 */}
      <BottomSheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>{editingModel ? "编辑模型" : "添加新模型"}</BottomSheetTitle>
          </BottomSheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>模型名称</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：豆包视觉模型"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>提供商</Label>
                <select
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={formData.provider}
                  onChange={e => {
                    const provider = PROVIDERS.find(p => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      provider: e.target.value,
                      endpoint: provider?.baseUrl || ""
                    });
                  }}
                >
                  {PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>模型类型</Label>
                <select
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as "vision" | "text" })}
                >
                  <option value="vision">视觉模型 (Vision)</option>
                  <option value="text">文本模型 (Text)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>API 端点</Label>
              <Input
                value={formData.endpoint}
                onChange={e => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://ark.cn-beijing.volces.com/api/v3"
              />
            </div>
            <div className="space-y-2">
              <Label>模型 ID</Label>
              <Input
                value={formData.modelId}
                onChange={e => setFormData({ ...formData, modelId: e.target.value })}
                placeholder="如: doubao-vision-pro-xxx 或 ep-xxx"
              />
              {(formData.provider === "volcengine" || formData.endpoint?.includes("volces")) && (
                <p className="text-xs text-orange-500 mt-1">
                  注意：火山引擎请复制控制台代码示例中自动生成的模型 ID（如 doubao-xxx 或 ep-xxx），不要直接填入下拉框的显示名称。
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={formData.apiKey || ""}
                  onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="请输入 API Key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="简短描述此模型的用途"
              />
            </div>
            <BottomSheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                {editingModel ? "保存" : "添加"}
              </Button>
            </BottomSheetFooter>
          </form>
        </BottomSheetContent>
      </BottomSheet>

      {/* API Key 配置弹窗 */}
      <BottomSheet open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>配置大模型</BottomSheetTitle>
          </BottomSheetHeader>
          <div className="space-y-4">
            {/* 模型基本信息 */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm">模型名称</Label>
                <Input
                  value={configForm.name}
                  onChange={e => setConfigForm({ ...configForm, name: e.target.value })}
                  placeholder="例如：豆包视觉模型"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">提供商</Label>
                <Input
                  value={configForm.provider}
                  onChange={e => setConfigForm({ ...configForm, provider: e.target.value })}
                  placeholder="例如：火山引擎"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">API 端点</Label>
                <Input
                  value={configForm.endpoint}
                  onChange={e => setConfigForm({ ...configForm, endpoint: e.target.value })}
                  placeholder="https://ark.cn-beijing.volces.com/api/v3"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">模型 ID</Label>
                <Input
                  value={configForm.modelId}
                  onChange={e => setConfigForm({ ...configForm, modelId: e.target.value })}
                  placeholder="如: doubao-vision-pro-xxx 或 ep-xxx"
                />
                {(configForm.provider?.includes("火山") || configForm.endpoint?.includes("volces")) && (
                  <p className="text-xs text-orange-500 mt-1">
                    注意：火山引擎请复制控制台代码示例中自动生成的模型 ID（如 doubao-xxx 或 ep-xxx），不要直接填入下拉框的显示名称。
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Key className="h-4 w-4" />
                <span>API Key</span>
              </div>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="请输入 API Key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                API Key 将安全存储，用于调用 AI 服务
              </p>
            </div>

            {/* 测试连接按钮 */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isTesting}
              onClick={async () => {
                if (!configForm.endpoint || !configForm.modelId || !apiKey) {
                  alert("请填写完整的端点、模型ID和API Key");
                  return;
                }
                setIsTesting(true);
                try {
                  const response = await apiFetch<{ success: boolean; message: string }>("/api/ai/models/test", {
                    method: "POST",
                    body: JSON.stringify({
                      endpoint: configForm.endpoint,
                      modelId: configForm.modelId,
                      apiKey: apiKey,
                      provider: configForm.provider
                    })
                  });
                  alert(response.message || "连接成功！");
                } catch (error) {
                  const msg = error instanceof Error ? error.message : "连接失败";
                  alert("连接失败：" + msg);
                } finally {
                  setIsTesting(false);
                }
              }}
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                "测试连接"
              )}
            </Button>
          </div>
          <BottomSheetFooter>
            <Button type="button" variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfigSave}>
              保存配置
            </Button>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  );
}

// 模型卡片组件
function ModelCard({
  model,
  onEdit,
  onConfig,
  onDelete,
  onSetDefault
}: {
  model: AIModel;
  onEdit: () => void;
  onConfig: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-all",
        model.status === "active"
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200 hover:border-gray-300"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2 rounded-lg",
          model.status === "active" ? "bg-green-100" : "bg-gray-100"
        )}>
          <Brain className={cn(
            "h-5 w-5",
            model.status === "active" ? "text-green-600" : "text-gray-500"
          )} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{model.name}</span>
            {model.status === "active" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            {model.isDefault && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                默认
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{model.provider}</span>
            <span>·</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded",
              model.type === "vision" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            )}>
              {model.type === "vision" ? "视觉" : "文本"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onConfig}>
          <Key className="h-3 w-3 mr-1" />
          {model.apiKeyConfigured ? "修改" : "配置"}
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
              {!model.isDefault && (
                <button
                  onClick={() => {
                    onSetDefault();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  设为默认
                </button>
              )}
              <button
                onClick={() => {
                  onEdit();
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="h-3 w-3" />
                编辑
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-3 w-3" />
                删除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
