import { FlutterPreviewFrame } from "@/components/flutter-preview/FlutterPreviewFrame";

export default function FlutterDataPage() {
  return (
    <FlutterPreviewFrame
      title="新数据页独立主页面"
      description="这里直接查看 Flutter 版数据页。当前如果 Flutter 侧还是占位页，后续只需要继续补 flutter/lib 里的数据页即可。"
      routePath="data"
    />
  );
}
