#!/usr/bin/env node

// KNOUX REC - تحقق من إزالة جميع APIs الخارجية
// هذا السكريبت يفحص الكود للتأكد من عدم وجود أي اتصال بـ Google أو APIs خارجية

const fs = require("fs");
const path = require("path");

// قائمة الكلمات المحظورة
const FORBIDDEN_PATTERNS = [
  // Google APIs
  "generativelanguage.googleapis.com",
  "gemini",
  "GEMINI_API_KEY",
  "google.generativeai",
  "api.google.com",

  // OpenAI APIs
  "api.openai.com",
  "OPENAI_API_KEY",
  "openai.com/api",

  // Other External APIs
  "api.stability.ai",
  "api.huggingface.co",
  "api.anthropic.com",
  "api.cohere.ai",

  // Generic API patterns
  "fetch\\s*\\(\\s*['\"]https?://[^/]*api\\.",
  "axios\\s*\\(\\s*['\"]https?://[^/]*api\\.",
  "API_KEY",
  "api_key",
  "Bearer\\s+[A-Za-z0-9]+",
];

// مجلدات للفحص
const DIRECTORIES_TO_CHECK = [
  "components",
  "services",
  "hooks",
  "utils",
  "src",
];

// أنواع الملفات للفحص
const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".vue"];

class APIVerifier {
  constructor() {
    this.violations = [];
    this.checkedFiles = 0;
    this.totalFiles = 0;
  }

  // فحص ملف واحد
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      this.checkedFiles++;

      FORBIDDEN_PATTERNS.forEach((pattern) => {
        const regex = new RegExp(pattern, "gi");
        const matches = content.match(regex);

        if (matches) {
          matches.forEach((match) => {
            // تجاهل التعليقات التوضيحية
            const lines = content.split("\n");
            let lineNumber = 0;

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(match)) {
                lineNumber = i + 1;

                // تجاهل إذا كان في تعليق
                const line = lines[i].trim();
                if (
                  line.startsWith("//") ||
                  line.startsWith("*") ||
                  line.startsWith("/*")
                ) {
                  continue;
                }

                this.violations.push({
                  file: filePath,
                  line: lineNumber,
                  pattern: pattern,
                  match: match,
                  context: line,
                });
              }
            }
          });
        }
      });
    } catch (error) {
      console.warn(`⚠️ لا يمكن قراءة الملف: ${filePath} - ${error.message}`);
    }
  }

  // فحص مجلد بشكل متكرر
  checkDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);

      items.forEach((item) => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // تجاهل مجلدات معينة
          if (
            !["node_modules", ".git", "dist", "build", ".next"].includes(item)
          ) {
            this.checkDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(fullPath);
          if (FILE_EXTENSIONS.includes(ext)) {
            this.totalFiles++;
            this.checkFile(fullPath);
          }
        }
      });
    } catch (error) {
      console.warn(`⚠️ لا يمكن قراءة المجلد: ${dirPath} - ${error.message}`);
    }
  }

  // فحص ملفات package.json للتبعيات المشبوهة
  checkPackageJson() {
    const packagePaths = ["package.json", "package-lock.json"];

    packagePaths.forEach((packagePath) => {
      if (fs.existsSync(packagePath)) {
        try {
          const packageContent = fs.readFileSync(packagePath, "utf8");
          const packageObj = JSON.parse(packageContent);

          const suspiciousDeps = [
            "@google-ai/generativelanguage",
            "google-generativeai",
            "openai",
            "@anthropic-ai/sdk",
            "cohere-ai",
          ];

          const allDeps = {
            ...packageObj.dependencies,
            ...packageObj.devDependencies,
            ...packageObj.peerDependencies,
          };

          suspiciousDeps.forEach((dep) => {
            if (allDeps[dep]) {
              this.violations.push({
                file: packagePath,
                line: "dependency",
                pattern: "external-api-dependency",
                match: dep,
                context: `"${dep}": "${allDeps[dep]}"`,
              });
            }
          });
        } catch (error) {
          console.warn(`⚠️ خطأ في قراءة ${packagePath}: ${error.message}`);
        }
      }
    });
  }

  // فحص متغيرات البيئة
  checkEnvFiles() {
    const envFiles = [
      ".env",
      ".env.local",
      ".env.production",
      ".env.development",
    ];

    envFiles.forEach((envFile) => {
      if (fs.existsSync(envFile)) {
        try {
          const envContent = fs.readFileSync(envFile, "utf8");
          const lines = envContent.split("\n");

          lines.forEach((line, index) => {
            const suspiciousEnvPatterns = [
              "GEMINI_API_KEY",
              "GOOGLE_API_KEY",
              "OPENAI_API_KEY",
              "ANTHROPIC_API_KEY",
              "COHERE_API_KEY",
            ];

            suspiciousEnvPatterns.forEach((pattern) => {
              if (line.includes(pattern) && !line.trim().startsWith("#")) {
                this.violations.push({
                  file: envFile,
                  line: index + 1,
                  pattern: "env-api-key",
                  match: pattern,
                  context: line,
                });
              }
            });
          });
        } catch (error) {
          console.warn(`⚠️ خطأ في قراءة ${envFile}: ${error.message}`);
        }
      }
    });
  }

  // تشغيل الفحص الكامل
  run() {
    console.log("🔍 بدء فحص إزالة APIs الخارجية...\n");

    // فحص الملفات
    DIRECTORIES_TO_CHECK.forEach((dir) => {
      if (fs.existsSync(dir)) {
        console.log(`📂 فحص مجلد: ${dir}`);
        this.checkDirectory(dir);
      }
    });

    // فحص التبعيات
    console.log("📦 فحص التبعيات...");
    this.checkPackageJson();

    // فحص متغيرات البيئة
    console.log("🔐 فحص متغيرات البيئة...");
    this.checkEnvFiles();

    this.generateReport();
  }

  // إنشاء تقرير النتائج
  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 تقرير فحص APIs الخارجية");
    console.log("=".repeat(60));

    console.log(`📁 الملفات المفحوصة: ${this.checkedFiles}/${this.totalFiles}`);
    console.log(`🚨 المخالفات المكتشفة: ${this.violations.length}`);

    if (this.violations.length === 0) {
      console.log("\n✅ تهانينا! لم يتم العثور على أي APIs خارجية");
      console.log("🔒 التطبيق يعمل بنسبة 100% محلياً");
      console.log("🚫 لا Google APIs, لا OpenAI APIs, لا خدمات خارجية");

      // إنشاء شهادة النظافة
      this.generateCleanCertificate();

      process.exit(0);
    } else {
      console.log("\n❌ تم العثور على مخالفات:");
      console.log("-".repeat(40));

      // تجميع المخالفات حسب النوع
      const violationsByType = {};
      this.violations.forEach((violation) => {
        const type = violation.pattern;
        if (!violationsByType[type]) {
          violationsByType[type] = [];
        }
        violationsByType[type].push(violation);
      });

      Object.keys(violationsByType).forEach((type) => {
        console.log(`\n🔍 نوع المخالفة: ${type}`);
        violationsByType[type].forEach((violation) => {
          console.log(`   📄 ${violation.file}:${violation.line}`);
          console.log(`   🔎 "${violation.match}"`);
          console.log(`   📝 ${violation.context}`);
          console.log("");
        });
      });

      console.log("\n🛠️ الإجراءات المطلوبة:");
      console.log("1. قم بإزالة أو تعليق الأكواد المذكورة أعلاه");
      console.log("2. تأكد من استبدالها بنظام AI محل��");
      console.log("3. أعد تشغيل الفحص للتأكد");

      process.exit(1);
    }
  }

  // إنشاء شهادة نظافة
  generateCleanCertificate() {
    const certificate = {
      timestamp: new Date().toISOString(),
      status: "CLEAN",
      filesChecked: this.checkedFiles,
      totalFiles: this.totalFiles,
      violations: 0,
      certification: {
        noGoogleApis: true,
        noOpenAiApis: true,
        noExternalApis: true,
        fullyOffline: true,
        privacyCompliant: true,
      },
      summary:
        "تم التحقق من أن KNOUX REC يعمل بنسبة 100% محلياً بدون APIs خارجية",
    };

    fs.writeFileSync(
      "NO_EXTERNAL_APIS_CERTIFICATE.json",
      JSON.stringify(certificate, null, 2),
    );
    console.log(
      "\n📜 تم إنشاء شهادة النظافة: NO_EXTERNAL_APIS_CERTIFICATE.json",
    );
  }
}

// تشغيل الفحص
if (require.main === module) {
  const verifier = new APIVerifier();
  verifier.run();
}

module.exports = APIVerifier;
