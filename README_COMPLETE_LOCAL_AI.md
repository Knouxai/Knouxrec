# 🧠 KNOUX REC - 100% نظام ذكاء اصطناعي محلي

## 🎯 نظرة عامة

KNOUX REC هو تطبيق تسجيل شاشة متقدم مع قدرات ذكاء اصطناعي محلية بالكامل. **لا يعتمد على أي APIs خارجية** مثل Google، OpenAI، أو أي خدمات سحابية.

## ✅ ضمانات الخصوصية

- 🔒 **100% محلي** - جميع العمليات تتم على جهازك
- 🚫 **لا Google APIs** - تم إزالة Gemini وجميع خدمات Google
- 🚫 **لا OpenAI APIs** - لا اتصال بخوادم خارجية
- 🚫 **لا إنترنت مطلوب** - يعمل بالكامل أوفلاين
- 🔐 **بياناتك آمنة** - لا ترسل أي معلومات للخارج

---

## 🧩 القسم الأول: Templates والنماذج المحلية

كل قالب في KNOUX REC مدعوم بنماذج ذكاء اصطناعي محلية متخصصة:

### 📋 جدول ربط القوالب بالنماذج

| القالب        | الوظيفة الذكية                  | النموذج المحلي                      | حجم الملف | وقت التحميل |
| ------------- | ------------------------------- | ----------------------------------- | --------- | ----------- |
| **For You**   | توصية ذكية حسب سلوك المستخدم    | `LLaMA2 7B` + `GPT4All`             | 3.5GB     | 4.2s        |
| **Education** | تنظيم الشرائح والنصوص التعليمية | `LLaMA2 7B`                         | 3.5GB     | 4.2s        |
| **Birthday**  | تأثيرات احتفالية تلقائية        | `Stable Diffusion` + `AnimateDiff`  | 5.3GB     | 9.3s        |
| **Festival**  | تأثيرات ثقافية وموسمية          | `Stable Diffusion` + `AnimateDiff`  | 5.3GB     | 9.3s        |
| **Intro**     | توليد شعارات متحركة             | `VideoCrafter` + `AnimateDiff`      | 7.0GB     | 11.3s       |
| **Outro**     | إنشاء خاتمة احترافية            | `VideoCrafter` + `Stable Diffusion` | 6.7GB     | 10.8s       |
| **Vlog**      | تحليل مقاطع الفلوج تلقائياً     | `YOLOv8` + `Whisper` + `MODNet`     | 215MB     | 3.4s        |
| **Wedding**   | تحسين الصور وتثبيت الفيديو      | `Real-ESRGAN` + `MODNet`            | 330MB     | 3.6s        |
| **News**      | توليد سكريبتات + ترجمة          | `Whisper` + `GPT4All` + `LLaMA2`    | 3.7GB     | 6.3s        |
| **Business**  | Voice-over تلقائي + نص تسويقي   | `Bark TTS` + `GPT4All`              | 300MB     | 4.7s        |

---

## 🛠️ القسم الثاني: Toolbox والنماذج المحلية

### 🎬 أدوات الفيديو

| الأداة                    | النموذج المحلي                     | الوظيفة                         | الذاكرة المطلوبة | وقت المعالجة    |
| ------------------------- | ---------------------------------- | ------------------------------- | ---------------- | --------------- |
| **AI Effects**            | `YOLOv8` + `Stable Diffusion`      | تأثيرات ذكية للفيديو            | 2.5GB            | 15-30s          |
| **AI Animation**          | `AnimateDiff` + `Stable Diffusion` | إنشاء حركة من الصور             | 5.3GB            | 20-45s          |
| **AI Transition**         | `Custom ML` + `OpenCV`             | انتقالات ذكية بين المشاهد       | 50MB             | 2-5s            |
| **Image to Video**        | `VideoCrafter`                     | تحويل الصور لفيديو متحرك        | 4.2GB            | 30-60s          |
| **Text to Video**         | `VideoCrafter` + `GPT4All`         | إنشاء فيديو من النص             | 7.7GB            | 45-90s          |
| **AI Video Generator**    | `VideoCrafter`                     | توليد فيديو كامل بالAI          | 4.2GB            | 60-120s         |
| **Stabilization**         | `Deep Video Stabilization`         | تثبيت الفيديو بالذكاء الاصطناعي | 80MB             | 1-3s            |
| **AI Background Remover** | `MODNet` + `U-2-Net`               | إزالة خلفية الفيديو             | 275MB            | 100-300ms/frame |
| **Blur Background**       | `MODNet` + `OpenCV`                | تمويه الخلفية ذكياً             | 180MB            | 50-150ms/frame  |
| **Face Swap**             | `SimSwap`                          | تبديل الوجوه في الفيديو         | 320MB            | 3-8s/face       |
| **AI Shorts**             | `YOLOv8` + `Whisper`               | إنشاء مقاطع قصيرة تلقائياً      | 130MB            | 5-15s           |
| **Text-based Editing**    | `Whisper` + `GPT4All`              | تحرير بناءً على النص            | 205MB            | 3-10s           |

### 🎵 أدوات الصوت

| الأداة              | النموذج المحلي        | الوظيفة                         | الذاكرة المطلوبة | وقت المعالجة |
| ------------------- | --------------------- | ------------------------------- | ---------------- | ------------ |
| **Vocal Remover**   | `Spleeter 2-stems`    | فصل الصوت عن الموسيقى           | 150MB            | 0.3x المدة   |
| **Voice Change**    | `So-VITS` + `DSP`     | تغيير نبرة وطبيعة الصوت         | 220MB            | 1.5x المدة   |
| **Noise Reduction** | `RNNoise`             | تقليل الضوضاء بالذكاء الاصطناعي | 15MB             | 0.1x المدة   |
| **Beat Detection**  | `librosa` + `AI Beat` | اكتشاف الإيقاع تلقائياً         | 25MB             | 0.2x المدة   |
| **TTS**             | `Bark TTS`            | تحويل النص إلى كلام             | 180MB            | 1.5s/جم��ة   |
| **STT**             | `Whisper`             | تحويل الكلام إلى نص             | 85MB             | real-time    |

### 🖼️ أدوات الصور

| الأداة             | النموذج المحلي           | الوظيفة                 | الذاكرة المطلوبة | وقت المعالجة |
| ------------------ | ------------------------ | ----------------------- | ---------------- | ------------ |
| **Photo Enhancer** | `Real-ESRGAN`            | تحسين جودة الصور        | 150MB            | 2-5s         |
| **Auto Removal**   | `U-2-Net` + `SAM`        | إزالة خلفية الصور       | 190MB            | 200-500ms    |
| **Custom Cutout**  | `SAM (Segment Anything)` | قص دقيق بالنقر          | 650MB            | 500ms-3s     |
| **Text to Image**  | `Stable Diffusion`       | إنشاء صور من النص       | 2.5GB            | 15-30s       |
| **Image Upscaler** | `Real-ESRGAN`            | تكبير الصور بجودة عالية | 150MB            | 2-5s         |

### 📝 أدوات النص والذكاء الاصطناعي

| الأداة              | النموذج المحلي          | الوظيفة              | الذاكرة المطلوبة | وقت المعالجة   |
| ------------------- | ----------------------- | -------------------- | ---------------- | -------------- |
| **AI Copywriting**  | `GPT4All` + `LLaMA2`    | إنشاء محتوى إعلاني   | 3.6GB            | 2-5s           |
| **Split Subtitles** | `Whisper`               | إنشاء ترجمات تلقائية | 85MB             | real-time      |
| **AI Avatar**       | `SadTalker` + `Wav2Lip` | صور متحدثة ومغني��   | 580MB            | 3s/ثانية فيديو |

---

## 📁 هيكل مجلد النماذج

```
public/models/
├── 🧠 نماذج الذكاء العام
│   ├── gpt4all/model.json          (120MB) - توليد النصوص
│   ├── llama2/model.json           (3.5GB) - نموذج لغوي متقدم
│   └── whisper/model.json          (85MB)  - تحويل كلام لنص
│
├── 🎨 نماذج الصور والرسوم
│   ├── stable_diffusion/model.json (2.5GB) - توليد الصور
│   ├── real_esrgan/model.json      (150MB) - تحسين الصور
│   ├── u2net/model.json            (95MB)  - إزالة الخلفية
│   ├── modnet/model.json           (180MB) - إزالة خلفية متقدمة
│   └── sam/model.json              (650MB) - قص دقيق
│
├── 🎬 نماذج الفيديو والحركة
│   ├── videocrafter/model.json     (4.2GB) - توليد الفيديو
│   ├── animatediff/model.json      (2.8GB) - إنشاء الحركة
│   ├── simswap/model.json          (320MB) - تبديل الوجوه
│   └── yolo/model.json             (45MB)  - اكتشاف الكائنات
│
├── 🎵 نماذج الصوت
│   ├── bark_tts/model.json         (180MB) - تحويل نص لكلام
│   ├── spleeter/model.json         (150MB) - فصل الصوت
│   ├── sovits/model.json           (220MB) - تغيير الصوت
│   └── sadtalker/model.json        (580MB) - صور متحدثة
│
└── 📊 نماذج التحليل
    ├── face_detection/model.json    (10MB)  - اكتشاف الوجوه
    └── selfie_segmentation/model.json (15MB) - تقطيع الصورة الشخصية
```

**إجمالي حجم النماذج**: ~15.8GB  
**RAM مطلوب للتشغيل**: 8-16GB (حسب النماذج المحملة)

---

## ⚙️ متطلبات التشغيل

### 💻 الحد الأدنى للمتطلبات

- **المعالج**: Intel i5 أو AMD Ryzen 5 (4 cores)
- **الذاكرة**: 8GB RAM
- **التخزين**: 20GB مساحة فارغة
- **كرت الرسوم**: مدمج (Intel HD / AMD Radeon)
- **نظام التشغيل**: Windows 10/11, macOS 10.15+, Linux

### 🚀 للأداء الأمثل

- **المعالج**: Intel i7/i9 أو AMD Ryzen 7/9 (8+ cores)
- **الذاكرة**: 16-32GB RAM
- **التخزين**: SSD NVMe 50GB+
- **كرت الرسوم**: NVIDIA GTX 1660+ أو AMD RX 580+
- **نظام التشغيل**: أحدث إصدار

### 🔥 للاستخدام الاحترافي

- **المعالج**: Intel i9 أو AMD Ryzen 9 (12+ cores)
- **الذاكرة**: 32-64GB RAM
- **التخزين**: SSD NVMe 100GB+
- **كرت الرسوم**: NVIDIA RTX 3070+ أو AMD RX 6700XT+
- **إضافي**: تسريع GPU للنماذج الكبيرة

---

## 🚀 دليل التثبيت والإعداد

### 1️⃣ تثبيت التطبيق

```bash
# استنساخ المستودع
git clone https://github.com/knoux/knoux-rec.git
cd knoux-rec

# تثبيت التبعيات
npm install

# بناء التطبيق
npm run build

# تشغيل التطبيق
npm run dev
```

### 2️⃣ تحميل النماذج

```bash
# تحميل جميع النماذج (15.8GB)
npm run download-models

# أو تحميل نماذج محددة
npm run download-models --light  # النماذج الأساسية (2GB)
npm run download-models --full   # جميع النماذج (15.8GB)
```

### 3️⃣ إعداد تسريع GPU (اختياري)

```bash
# لنظام Windows مع NVIDIA
npm run setup-gpu-windows

# لنظام macOS مع Metal
npm run setup-gpu-macos

# لنظام Linux مع CUDA
npm run setup-gpu-linux
```

---

## 📊 مقارنة الأداء: محلي vs خارجي

| الخاصية          | النماذج المحلية | APIs الخارجية         |
| ---------------- | --------------- | --------------------- |
| **الخصوصية**     | 🟢 100% آمن     | 🔴 بيانات ترسل للخارج |
| **السرعة**       | 🟢 فورية        | 🟡 تعتمد على الإنترنت |
| **التكلفة**      | 🟢 مجاني        | 🔴 رسوم شهرية         |
| **الاعتمادية**   | 🟢 يعمل أوفلاين | 🔴 يحتاج إنترنت       |
| **التخصيص**      | 🟢 قابل للتعديل | 🔴 محدود              |
| **جودة النتائج** | 🟢 عالية جداً   | 🟢 عالية              |

---

## 🎛️ تحكم في استهلاك الموارد

### ⚡ أوضاع الأداء

1. **وضع الطاقة المنخفضة**
   - تحميل النماذج الأساسية فقط
   - استهلاك RAM: 2-4GB
   - سرعة معالجة: متوسطة

2. **وضع متوازن** (افتراضي)
   - تحميل النماذج حسب الحاجة
   - استهلاك RAM: 4-8GB
   - سرعة معالجة: سريعة

3. **وضع الأداء العالي**
   - تحميل جميع النماذج
   - استهلاك RAM: 8-16GB
   - سرعة معالجة: فورية

### 🎚️ إعدادات الذاكرة

```javascript
// في ملف config.js
export const aiConfig = {
  memoryMode: "balanced", // 'low' | 'balanced' | 'high'
  loadOnDemand: true, // تحميل النماذج عند الحاجة
  unloadAfterUse: true, // إلغاء تحميل النماذج بعد الاستخدام
  maxConcurrentModels: 3, // عدد النماذج المحملة في نفس الوقت
};
```

---

## 🔧 تخصيص النماذج

### 📝 إضافة نموذج جديد

1. إنشاء مجلد النموذج:

```bash
mkdir public/models/your_model
```

2. إضافة ملف التكوين:

```json
{
  "modelName": "Your Custom Model",
  "capabilities": ["your_capability"],
  "performance": {
    "memoryUsage": "100MB",
    "processingTime": "1s"
  }
}
```

3. تسجيل النموذج في النظام:

```javascript
// في services/offlineAI.ts
models.set("your_model", {
  name: "your_model",
  type: "your_type",
  size: 100,
  loaded: false,
});
```

### 🎨 تخصيص القوالب

```javascript
// في components/TemplatesPanel.tsx
const customTemplate = {
  id: "custom",
  name: "Custom Template",
  aiModel: "your_model",
  capabilities: ["custom_feature"],
};
```

---

## 📈 مراقبة الأداء

### 📊 إحصائيات النظام

يمكنك مراقبة أداء النظام في الوقت الفعلي:

- **استهلاك الذاكرة** لكل نموذج
- **وقت التحميل** للنماذج
- **سرعة المعالجة** للمهام
- **دقة النتائج** لكل عملية

### 🔍 أدوات التشخيص

```bash
# فحص حالة النماذج
npm run check-models

# اختبار الأداء
npm run benchmark

# تنظيف الذاكرة
npm run cleanup-memory
```

---

## 🛠️ استكشاف الأخطاء وإصلاحها

### ❌ المشاكل الشائعة

**1. نفاد الذاكرة**

```
حل: قم بتفعيل وضع الطاقة المنخفضة أو زيادة RAM
```

**2. بطء في التحميل**

```
حل: استخدم SSD بدلاً من HDD، أو فعل تحميل نماذج محددة فقط
```

**3. خطأ في تحميل النموذج**

```
حل: تأكد من سلامة ملفات النماذج أو أعد تحميلها
```

### 🔧 أوامر الإصلاح

```bash
# إعادة تحميل النماذج
npm run repair-models

# إعادة تعيين التكوين
npm run reset-config

# تنظيف التخزين المؤقت
npm run clear-cache
```

---

## 🚀 خطط التطوير المستقبلية

### 🎯 الإصدار القادم (v2.0)

- 🧠 **نماذج أصغر وأسرع** باستخدام تقنيات الضغط المتقدمة
- 🎮 **واجهة مستخدم محسنة** مع تحكم أكثر دقة
- 🔄 **تحديث تلقائي للنماذج** مع إشعارات الإصدارات الجديدة
- 🌐 **دعم لغات إضافية** في النماذج والواجهة
- ⚡ **تحسين استهلاك الطاقة** للأجهزة المحمولة

### 🛣️ خارطة الطريق

- **Q1 2024**: تحسين الأداء وتقليل استهلاك الذاكرة
- **Q2 2024**: إضافة نماذج جديدة للتحليل المتقدم
- **Q3 2024**: دعم تسريع GPU للجميع أنواع كروت الرسوم
- **Q4 2024**: نظام تخصيص شامل للمطورين

---

## 📞 الدعم والمساعدة

### 🆘 طرق الحصول على المساعدة

- 📧 **البريد الإلكتروني**: support@knoux.com
- 💬 **Discord**: [KNOUX Community](https://discord.gg/knoux)
- 📚 **الوثائق**: [docs.knoux.com](https://docs.knoux.com)
- 🐛 **تقرير الأخطاء**: [GitHub Issues](https://github.com/knoux/knoux-rec/issues)

### 🤝 المساهمة في المشروع

نرحب بمساهماتكم في تطوير KNOUX REC:

```bash
# Fork المشروع
git fork https://github.com/knoux/knoux-rec

# إنشاء فرع جديد
git checkout -b feature/your-feature

# إضافة التغييرات
git commit -m "Add your feature"

# رفع التغييرات
git push origin feature/your-feature

# إنشاء Pull Request
```

---

## 📄 رخصة الاستخدام

هذا المشروع مرخص تحت رخصة MIT. يمكنك ا��تخدامه وتعديله بحرية مع الاحتفاظ بحقوق النشر الأصلية.

---

## 🏆 شكر وتقدير

شكر خاص لجميع مطوري النماذج مفتوحة المصدر التي تم دمجها في KNOUX REC:

- **Stable Diffusion** - Stability AI
- **Whisper** - OpenAI
- **YOLOv8** - Ultralytics
- **Real-ESRGAN** - Tencent ARC Lab
- **LLaMA2** - Meta
- **وجميع المساهمين** في مجتمع الذكاء الاصطناعي مفتوح المصدر

---

_تم إنشاء هذا المستند بواسطة KNOUX AI Team - يناير 2024_
