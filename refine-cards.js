const fs = require('fs');

let dash = fs.readFileSync('web/src/features/dashboard/components/themes/DefaultDashboard.tsx', 'utf8');

dash = dash.replace(
  /className=\{`relative overflow-hidden rounded-\[24px\] border px-4 py-4 shadow-\[0_10px_28px_rgba\(15,23,42,0\.04\)\]/,
  'className={`relative overflow-hidden rounded-[24px] sm:border px-4 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
);

fs.writeFileSync('web/src/features/dashboard/components/themes/DefaultDashboard.tsx', dash);
console.log('Refined card shadows and borders for mobile');