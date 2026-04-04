const fs = require('fs');

let dash = fs.readFileSync('web/src/features/dashboard/components/themes/DefaultDashboard.tsx', 'utf8');

// 恢复净资产（蓝色）卡片为明亮现代的宝蓝色渐变（高度还原设计图中的活力蓝）
dash = dash.replace(
  /background: "linear-gradient\(135deg, #083344 0%, #0891b2 100%\)",[^\n]*/,
  'background: "linear-gradient(135deg, #2f6fed 0%, #5d98ff 100%)",'
);

// 恢复储蓄（绿色）卡片为明亮的翠绿色渐变
dash = dash.replace(
  /background: "linear-gradient\(135deg, #064e3b 0%, #059669 100%\)",[^\n]*/,
  'background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",'
);

// 把背景线条和填充的透明度调回适合亮色的级别（让波浪图重新清晰起来）
dash = dash.replace(/chartLine: "rgba\(255,255,255,0\.4\)",/g, 'chartLine: "rgba(255,255,255,0.9)",');
dash = dash.replace(/chartFill: "rgba\(255,255,255,0\.05\)",/g, 'chartFill: "rgba(255,255,255,0.15)",');
dash = dash.replace(/chartLine: "rgba\(255,255,255,0\.3\)",/g, 'chartLine: "rgba(255,255,255,0.8)",');
// chartFill for green was also 0.05, we need to change it back to 0.15/0.18
// Wait, to be safe, let's just do a blanket replace for the exact toneStyles block for blue and green to ensure it's perfect.

const blueBlockRegex = /tone === "blue"[\s\S]*?\{[\s\S]*?chartFill:\s*"[^"]*",\s*\}/;
const newBlueBlock = `tone === "blue"
      ? {
          background: "linear-gradient(135deg, #2f6fed 0%, #5d98ff 100%)",
          color: "#ffffff",
          iconBg: "rgba(255,255,255,0.2)",
          detailColor: "rgba(255,255,255,0.85)",
          chartLine: "rgba(255,255,255,0.9)",
          chartFill: "rgba(255,255,255,0.15)",
        }`;

const greenBlockRegex = /tone === "green"[\s\S]*?\{[\s\S]*?chartFill:\s*"[^"]*",\s*\}/;
const newGreenBlock = `tone === "green"
        ? {
            background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
            color: "#ffffff",
            iconBg: "rgba(255,255,255,0.18)",
            detailColor: "rgba(255,255,255,0.8)",
            chartLine: "rgba(255,255,255,0.8)",
            chartFill: "rgba(255,255,255,0.15)",
          }`;

dash = dash.replace(blueBlockRegex, newBlueBlock);
dash = dash.replace(greenBlockRegex, newGreenBlock);

fs.writeFileSync('web/src/features/dashboard/components/themes/DefaultDashboard.tsx', dash);
console.log('Reverted to vibrant blue and green');