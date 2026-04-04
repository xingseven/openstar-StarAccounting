import { FlutterPreviewFrame } from "@/components/flutter-preview/FlutterPreviewFrame";

export default function FlutterDashboardPage() {
  return (
    <FlutterPreviewFrame
      title="新总览页独立主页面"
      description="这里直接查看 Flutter 自己的总览主页面结构。旧的 TypeScript 总览页仍保留在 / ，方便继续对照开发。"
      routePath="dashboard"
    />
  );
}
