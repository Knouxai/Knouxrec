# دليل المساهمة في KNOUX REC

شكراً لاهتمامك بالمساهمة في KNOUX REC! نرحب بجميع أنواع المساهمات من المجتمع.

## 🤝 أنواع المساهمات المرحب بها

### 🐛 الإبلاغ عن الأخطاء

- استخدم قوالب GitHub Issues
- قدم وصفاً مفصلاً للمشكلة
- أرفق لقطات شاشة إذا أمكن
- اذكر نسخة المتصفح ونظام التشغيل

### ✨ اقتراح مميزات جديدة

- ابحث أولاً في Issues الموجودة
- اشرح الحاجة للميزة الجديدة
- قدم أمثلة على حالات الاستخدام
- ارسم مخططات أو نماذج أولية إذا أمكن

### 🔧 إصلاح الأخطاء

- ابدأ بـ Issues ��لمُعلّمة "good first issue"
- اتبع إرشادات الكود أدناه
- أضف اختبارات للإصلاحات الجديدة
- حدّث التوثيق إذا لزم الأمر

### 📚 تحسين التوثيق

- إصلاح الأخطاء الإملائية والنحوية
- إضافة أمثلة وضوحاً
- ترجمة التوثيق للغات أخرى
- تحسين README وملفات المساعدة

## 🚀 إعداد بيئة التطوير

### المتطلبات الأساسية

```bash
# Node.js 18+
node --version

# Git
git --version

# محرر نصوص (VSCode مُوصى به)
```

### خطوات الإعداد

```bash
# 1. Fork المشروع على GitHub
# 2. استنسخ نسختك المحلية
git clone https://github.com/yourusername/knoux-rec.git
cd knoux-rec

# 3. أضف المستودع الأصلي كـ upstream
git remote add upstream https://github.com/Knouxai/knoux-rec.git

# 4. ثبت التبعيات
npm install

# 5. ابدأ خادم التطوير
npm run dev
```

### إعداد VSCode (اختياري)

```bash
# ثبت الإضافات المُوصى بها
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

## 📝 إرشادات الكود

### معايير TypeScript/React

```typescript
// ✅ جيد
interface ComponentProps {
  title: string;
  isVisible: boolean;
  onClose: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, isVisible, onClose }) => {
  return (
    <div className="glass-card p-4">
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
};

export default MyComponent;
```

### معايير CSS/Tailwind

```css
/* ✅ استخدم classes من Tailwind */
.glass-card {
  @apply bg-white/10 backdrop-blur-md rounded-xl border border-white/20;
}

/* ❌ تجنب CSS مخصص إلا للضرورة */
.custom-style {
  background: linear-gradient(45deg, #ff0000, #00ff00);
}
```

### معايير AI/ML

```typescript
// ✅ تحقق من تحميل النموذج
const model = await tf.loadGraphModel("/models/my-model/model.json");
if (!model) {
  throw new Error("فشل تحميل النموذج");
}

// ✅ نظف الذاكرة
tensor.dispose();
model.dispose();
```

## 🌿 سير العمل مع Git

### إنشاء فرع جديد

```bash
# احصل على آخر التحديثات
git checkout main
git pull upstream main

# أنشئ فرع للميزة الجديدة
git checkout -b feature/amazing-feature

# أو لإصلاح خطأ
git checkout -b fix/bug-description
```

### تسمية الفروع

- `feature/feature-name` - للمميزات الجديدة
- `fix/bug-description` - لإصلاح الأخطاء
- `docs/section-name` - لتحسين التوثيق
- `refactor/component-name` - لإعادة هيكلة الكود

### رسائل Commit

```bash
# ✅ رسائل واضحة ومفيدة
git commit -m "feat: إضافة أداة تحسين الصور AI"
git commit -m "fix: إصلاح خطأ في تسجيل الصوت"
git commit -m "docs: تحديث دليل الاستخدام"

# ❌ تجنب الرسائل المبهمة
git commit -m "تحديث"
git commit -m "إصلاح"
```

### أنواع رسائل Commit

- `feat:` - ميزة جديدة
- `fix:` - إصلاح خطأ
- `docs:` - تحديث التوثيق
- `style:` - تنسيق الكود
- `refactor:` - إعادة هيكلة
- `test:` - إضافة اختبارات
- `chore:` - مهام الصيانة

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
# جميع الاختبارات
npm test

# اختبارات محددة
npm test -- --grep "VideoProcessor"

# اختبارات مع مراقبة
npm test -- --watch
```

### كتابة اختبارات جديدة

```typescript
// مثال على اختبار مكون
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('يعرض العنوان بشكل صحيح', () => {
  render(<MyComponent title="اختبار" />);
  expect(screen.getByText('اختبار')).toBeInTheDocument();
});
```

## 📋 قائمة مراجعة Pull Request

### قبل إرسال PR

- [ ] اختبار الكود محلياً
- [ ] تشغيل `npm run lint` بدون أخطاء
- [ ] تشغيل `npm run type-check` بنجاح
- [ ] إضافة/تحديث الاختبارات
- [ ] تحديث التوثيق إذا لزم
- [ ] فحص أداء التطبيق

### معلومات PR

- عنوان واضح يصف التغيير
- وصف مفصل للتغييرات
- ربط بـ Issues ذات الصلة
- لقطات شاشة للتغييرات البصرية
- قائمة التحديثات المطلوبة

### مثال على وصف PR

```markdown
## التغييرات

- إضافة أداة جديدة لتحسين الصور باستخدام AI
- تحسين أداء معالجة الصور الكبيرة
- إضافة اختبارات شاملة للأداة الجديدة

## نوع التغيير

- [x] ميزة جديدة
- [ ] إصلاح خطأ
- [ ] تحسين أداء
- [ ] تحديث توثيق

## الاختبارات

- [x] اختبار محلي
- [x] اختبار المتصفحات المختلفة
- [x] اختبار الأداء
- [x] اختبار إمكانية الوصول

## لقطات الشاشة

![قبل](before.png)
![بعد](after.png)
```

## 🏗️ هيكل المشروع

```
knoux-rec/
├── components/          # مكونات React
│   ├── Controls.tsx
│   ├── ToolboxPanel.tsx
│   └── ...
├── services/           # خدمات المعالجة
│   ├── videoProcessor.ts
│   ├── audioProcessor.ts
│   └── ...
├── hooks/              # React Hooks مخصصة
├── types/              # تعريفات TypeScript
├── utils/              # دوال مساعدة
├── workers/            # Web Workers
├── public/models/      # نماذج AI
├── docs/               # التوثيق
└── tests/              # الاختبارات
```

## 🎯 أولويات التطوير

### مستوى عالي 🔴

- إصلاح الأخطاء الحرجة
- مشاكل الأمان
- مشاكل الأداء الكبيرة

### مستوى متوسط 🟡

- مميزات جديدة مطلوبة
- تحسينات UX/UI
- تحسين التوثيق

### مستوى منخفض 🟢

- تحسينا�� الكود
- اختبارات إضافية
- تحسينات طفيفة

## 🤝 مراجعة الكود

### للمراجعين

- كن محترماً وبناءً في التعليقات
- اشرح سبب اقتراحاتك
- قدم أمثلة بديلة عند الإمكان
- راجع الوظائف والأداء والأمان

### للمساهمين

- تقبل الملاحظات بصدر رحب
- اطرح أسئلة عند عدم الوضوح
- حدّث الكود حسب المراجعة
- اشكر المراجعين على وقتهم

## 📞 الحصول على المساعدة

### قنوات التواصل

- **GitHub Issues**: للأخطاء والاقتراحات
- **Discord**: [discord.gg/knoux](https://discord.gg/knoux)
- **البريد الإلكتروني**: dev@knoux.ai
- **التوثيق**: [docs.knoux.ai](https://docs.knoux.ai)

### أسئلة شائعة

**س: كيف أبدأ كمساهم جديد؟**
ج: ابحث عن Issues مُعلّمة "good first issue" وابدأ بها.

**س: هل يمكنني اقتراح مميزات كبيرة؟**
ج: نعم! افتح Issue أولاً لمناقشة الفكرة قبل البدء.

**س: ماذا لو كانت مساهمتي صغيرة؟**
ج: كل مساهمة مهمة، حتى لو كانت إصلاح خطأ إملائي!

## 🏆 نظام التقدير

### شارات المساهمين

- 🥇 **مساهم ذهبي**: 10+ مساهمات مهمة
- 🥈 **مساهم فضي**: 5+ مساهمات
- 🥉 **مساهم برونزي**: أول مساهمة مقبولة

### Hall of Fame

سيتم ذكر أهم المساهمين في:

- README الرئيسي
- صفحة "شكر وتقدير"
- إصدارات الـ release notes

## 📄 الترخيص

بمساهمتك في هذا المشروع، أنت توافق على أن مساهماتك ستكون مرخصة تحت [رخصة MIT](LICENSE).

---

شكراً لك على جعل KNOUX REC أفضل! 🎉

**فريق KNOUX**
