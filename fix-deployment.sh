#!/bin/bash

# ============================================
# سكريبت إصلاح مشاكل النشر - تلقائي
# ============================================

echo "🔧 بدء إصلاح مشاكل النشر..."
echo ""

# ============================================
# 1. إصلاح package.json
# ============================================
echo "📦 تحديث package.json..."

cat > package.json << 'EOF'
{
  "name": "invoice-generator-pro",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "vite": "^5.2.0"
  }
}
EOF

echo "✅ تم تحديث package.json"

# ============================================
# 2. نقل ملفات .env إلى الجذر
# ============================================
echo ""
echo "📁 نقل ملفات .env إلى الجذر..."

# احذف من src إذا كانت موجودة
rm -f src/.env.example src/.env.local src/.env.production

# أنشئ في الجذر
cat > .env.example << 'EOF'
VITE_API_BASE_URL=https://adel-creative-invoice-api.hf.space
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Invoice Generator Pro
EOF

cat > .env.local << 'EOF'
VITE_API_BASE_URL=https://adel-creative-invoice-api.hf.space
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Invoice Generator Pro
EOF

cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://adel-creative-invoice-api.hf.space
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Invoice Generator Pro
EOF

echo "✅ تم نقل ملفات .env"

# ============================================
# 3. تحديث .gitignore
# ============================================
echo ""
echo "🚫 تحديث .gitignore..."

cat > .gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.development

# Vercel
.vercel

# Build
build
.cache
.turbo
EOF

echo "✅ تم تحديث .gitignore"

# ============================================
# 4. تحديث vercel.json
# ============================================
echo ""
echo "⚙️ تحديث vercel.json..."

cat > vercel.json << 'EOF'
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "cleanUrls": true,
  "trailingSlash": false,
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
EOF

echo "✅ تم تحديث vercel.json"

# ============================================
# 5. إنشاء مجلد components إذا لم يكن موجوداً
# ============================================
echo ""
echo "📂 التحقق من مجلد components..."

mkdir -p src/components

# احذف الملف القديم إذا كان موجوداً
rm -f src/components/invoice.tsx

echo "✅ تم إنشاء/التحقق من مجلد components"

# ============================================
# 6. تحديث src/App.jsx
# ============================================
echo ""
echo "📄 تحديث src/App.jsx..."

cat > src/App.jsx << 'EOF'
import React from 'react'
import InvoiceGeneratorApp from './components/InvoiceGeneratorApp'

function App() {
  return <InvoiceGeneratorApp />
}

export default App
EOF

echo "✅ تم تحديث src/App.jsx"

# ============================================
# 7. تثبيت التبعيات
# ============================================
echo ""
echo "📥 تثبيت التبعيات..."
npm install

# ============================================
# 8. اختبار البناء
# ============================================
echo ""
echo "🧪 اختبار البناء..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ البناء نجح!"
    echo ""
    echo "🎉 تم إصلاح جميع المشاكل!"
    echo ""
    echo "📝 الخطوات التالية:"
    echo "1. تأكد من أن ملف src/components/InvoiceGeneratorApp.jsx موجود ويحتوي على الكود الصحيح"
    echo "2. قم بتنفيذ: git add ."
    echo "3. قم بتنفيذ: git commit -m 'Fix: Resolve deployment issues'"
    echo "4. قم بتنفيذ: git push origin main"
    echo ""
    echo "🚀 Vercel سيبدأ النشر تلقائياً!"
else
    echo ""
    echo "❌ فشل البناء! راجع الأخطاء أعلاه"
    echo ""
    echo "💡 تأكد من:"
    echo "1. وجود ملف src/components/InvoiceGeneratorApp.jsx"
    echo "2. صحة محتوى الملف"
    echo "3. عدم وجود أخطاء في الكود"
fi

echo ""
echo "=========================================="
echo "✨ انتهى السكريبت"
echo "=========================================="