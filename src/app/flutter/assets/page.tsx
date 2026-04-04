import { FlutterPreviewFrame } from "@/components/flutter-preview/FlutterPreviewFrame";

export default function FlutterAssetsPage() {
  return (
    <FlutterPreviewFrame
      title="新资产页独立主页面"
      description="这里直接查看 Flutter 版资产页。后续迁资产页时，直接改 flutter/lib/features/assets/ 或收浅后的模块目录即可。"
      routePath="assets"
    />
  );
}
