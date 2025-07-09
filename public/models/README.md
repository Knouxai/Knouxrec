# 🧠 KNOUX REC - 100% Local AI Models

## نماذج الذكاء الاصطناعي المحلية - بدون APIs خارجية

هذا المجلد يحتوي على جميع نماذج الذكاء الاصطناعي المحلية المستخدمة في KNOUX REC. **جميع النماذج تعمل محلياً بدون الحاجة لإنترنت أو APIs خارجية.**

---

## 📁 النماذج المتاحة

### 🧠 النماذج الأساسية للذكاء العام

| النموذج    | الحجم | الوصف                     | الاستخدام الأساسي        | القوالب المرتبطة          |
| ---------- | ----- | ------------------------- | ------------------------ | ------------------------- |
| `gpt4all/` | 120MB | نموذج توليد النصوص المحلي | معالجة النصوص والكتابة   | Business, News, Education |
| `llama2/`  | 3.5GB | نموذج لغوي متقدم          | التوصيات الذكية والتحليل | For You, Education        |
| `whisper/` | 85MB  | تحويل الكلام إلى نص       | تفريغ الصوت والترجمة     | News, Vlog, Education     |

### 🎨 نماذج الصور والرسوم

| النموذج             | الحجم | الوصف                  | الاستخدام الأساسي        | القوالب المرتبطة          |
| ------------------- | ----- | ---------------------- | ------------------------ | ------------------------- |
| `stable_diffusion/` | 2.5GB | توليد الصور من النص    | إنشاء الصور والتأثيرات   | Birthday, Festival, Intro |
| `real_esrgan/`      | 150MB | تحسين جودة الصور       | ترقية دقة الصور          | Wedding, Vlog             |
| `u2net/`            | 95MB  | إزالة الخلفية الأساسية | معالجة الصور السريعة     | جميع القوالب              |
| `modnet/`           | 180MB | إزالة الخلفية المتقدمة | إزالة خلفية عالية الجودة | Vlog, Business            |
| `sam/`              | 650MB | قص دقيق للكائنات       | التحديد والقص الذكي      | أدوات متقدمة              |

### 🎬 نماذج الفيديو والحركة

| النموذج         | الحجم | الوصف                         | الاستخدام الأساسي   | القوالب المرتبطة   |
| --------------- | ----- | ----------------------------- | ------------------- | ------------------ |
| `videocrafter/` | 4.2GB | توليد الفيديو من النص         | إنشاء فيديو كامل    | Intro, Outro       |
| `animatediff/`  | 2.8GB | إنشاء الحركة والرسوم المتحركة | تأثيرات متحركة      | Birthday, Festival |
| `simswap/`      | 320MB | تبديل الوجوه                  | تأثيرات الوجوه      | أدوات الفيديو      |
| `yolo/`         | 45MB  | اكتشاف الكائنات               | تحليل محتوى الفيديو | Vlog, For You      |

### 🎵 نماذج الصوت

| النموذج      | الحجم | الوصف               | الاستخدام الأساسي      | القوالب المرتبطة |
| ------------ | ----- | ------------------- | ---------------------- | ---------------- |
| `bark_tts/`  | 180MB | تحويل النص إلى كلام | توليد الأصوات الطبيعية | Business, News   |
| `spleeter/`  | 150MB | فصل مصادر الصوت     | إزالة الصوت والكاريوكي | أدوات الصوت      |
| `sovits/`    | 220MB | تحويل وتغيير الصوت  | تعديل طبيعة الصوت      | أدوات الصوت      |
| `sadtalker/` | 580MB | الصور المتحدثة      | أفاتار وصور ناطقة      | أدوات AI متقدمة  |

### 📊 نماذج التحليل والكشف

| النموذج                | الحجم | الوصف                | الاستخدام الأساسي         |
| ---------------------- | ----- | -------------------- | ------------------------- |
| `face_detection/`      | 10MB  | اكتشاف الوجوه        | تحديد الوجوه في الصور     |
| `selfie_segmentation/` | 15MB  | تقطيع الصورة الشخصية | إزالة خلفية الصور الشخصية |

---

## 🔗 ربط النماذج بالقوالب والأدوات

### 📋 ربط القوالب بالنماذج

| القالب        | النموذج الأساسي  | النماذج المساعدة              | استهلاك الذاكرة | وقت التحميل |
| ------------- | ---------------- | ----------------------------- | --------------- | ----------- |
| **For You**   | LLaMA2           | GPT4All, YOLO                 | 3.5GB           | 4.2s        |
| **Education** | LLaMA2           | GPT4All, Whisper              | 3.6GB           | 4.5s        |
| **Birthday**  | Stable Diffusion | AnimateDiff, VideoCrafter     | 5.3GB           | 9.3s        |
| **Festival**  | Stable Diffusion | AnimateDiff, VideoCrafter     | 5.3GB           | 9.3s        |
| **Intro**     | VideoCrafter     | AnimateDiff, Stable Diffusion | 7.0GB           | 11.3s       |
| **Outro**     | VideoCrafter     | Stable Diffusion, GPT4All     | 6.7GB           | 10.8s       |
| **Vlog**      | YOLO             | Whisper, MODNet, Real-ESRGAN  | 315MB           | 3.4s        |
| **Wedding**   | Real-ESRGAN      | MODNet, Stable Diffusion      | 330MB           | 3.6s        |
| **News**      | Whisper          | GPT4All, LLaMA2, Bark TTS     | 3.7GB           | 6.3s        |
| **Business**  | Bark TTS         | GPT4All, LLaMA2               | 300MB           | 4.7s        |

### 🛠️ ربط أدوات Toolbox ب��لنماذج

#### 🎬 أدوات الفيديو

- **AI Effects**: YOLO + Stable Diffusion (2.5GB)
- **AI Animation**: AnimateDiff + Stable Diffusion (5.3GB)
- **Text to Video**: VideoCrafter + GPT4All (7.7GB)
- **Background Remover**: MODNet + U-2-Net (275MB)
- **Face Swap**: SimSwap (320MB)

#### 🎵 أدوات الصوت

- **Vocal Remover**: Spleeter (150MB)
- **Voice Change**: So-VITS (220MB)
- **TTS**: Bark TTS (180MB)
- **STT**: Whisper (85MB)

#### 🖼️ أدوات الصور

- **Photo Enhancer**: Real-ESRGAN (150MB)
- **Custom Cutout**: SAM (650MB)
- **Text to Image**: Stable Diffusion (2.5GB)

---

## ⚙️ متطلبات التشغيل

### 💻 الحد الأدنى

- **RAM**: 8GB
- **تخزين**: 20GB
- **معالج**: 4 cores
- **كرت رسوم**: مدمج

### 🚀 للأداء الأمثل

- **RAM**: 16-32GB
- **تخزين**: SSD 50GB
- **معالج**: 8+ cores
- **كرت رسوم**: مخصص (GTX 1660+)

---

## 🔧 إدارة النماذج

### تحميل تلقائي حسب الحاجة

```javascript
// تحميل نماذج قالب معين
await localAIManager.loadTemplateModels("birthday");

// تحميل نماذج أداة معينة
await localAIManager.loadToolModels("ai-effects");
```

### مراقبة استهلاك الذاكرة

```javascript
// الحصول على إحصائيات الاستخدام
const stats = localAIManager.getPerformanceStats();
console.log(`الذاكرة المستخدمة: ${stats.totalMemoryUsage}`);
```

### إلغاء تحميل النماذج غير المستخدمة

```javascript
// تنظيف الذاكرة
await localAIManager.unloadUnusedModels("vlog", "background-remover");
```

---

## 📊 إحصائيات الأداء

### أوقات التحميل النموذجية

- **نماذج صغيرة** (< 100MB): 0.5-2s
- **نماذج متوسطة** (100MB-500MB): 2-5s
- **نماذج كبيرة** (> 1GB): 5-15s

### استهلاك الذاكرة

- **وضع خفيف**: 2-4GB RAM
- **وضع متوازن**: 4-8GB RAM
- **وضع عالي الأداء**: 8-16GB RAM

---

## 🚫 ما تم إزالته (APIs الخارجية)

### ❌ Google Services

- Google Gemini API
- Google Cloud Vision
- Google Speech-to-Text
- Google Translate

### ❌ OpenAI Services

- GPT-3.5/GPT-4 API
- DALL-E API
- Whisper API (الخدمة السحابية)

### ❌ Other External APIs

- Stability AI API
- Hugging Face Inference API
- Azure Cognitive Services
- AWS Rekognition

---

## ✅ ضمانات الخصوصية

🔒 **100% محلي** - جميع العمليات على جهازك  
🚫 **لا APIs خارجية** - لا اتصال بخوادم خارجية  
🚫 **لا إنترنت مطلوب** - يعمل بالكامل أوفلاين  
🔐 **بياناتك آمنة** - لا ترسل معلومات للخارج  
⚡ **أداء سريع** - لا انتظار للاستجابة من خوادم

---

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة:

**1. نفاد الذاكرة**

```bash
# الحل: تفعيل وضع الطاقة المنخفضة
npm run config -- --memory-mode=low
```

**2. بطء في التحميل**

```bash
# الحل: تحميل نماذج محددة فقط
npm run download-models -- --essential-only
```

**3. فشل تحميل نموذج**

```bash
# الحل: إعادة تحميل النماذج
npm run repair-models
```

---

## 📈 التحديثات المستقبلية

### 🎯 الإصدار القادم (v2.0)

- ✨ نماذج أصغر وأسرع
- 🔧 واجهة تحكم محسنة
- 🌐 دعم لغات إضافية
- ⚡ تحسين استهلاك الطاقة

### 🛣️ خارطة الطريق 2024

- **Q1**: تحسين الأداء وتقليل الذاكرة
- **Q2**: نماذج جديدة للتحليل المتقدم
- **Q3**: دعم GPU شامل
- **Q4**: نظام تخصيص متقدم

---

_آخ�� تحديث: يناير 2024 - KNOUX AI Team_
