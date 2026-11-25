# النشر على Cloudflare Pages

## الطريقة الأولى: ربط مستودع GitHub (موصى بها)

1. ادخل إلى Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. اختر مستودع `mytechol`.
3. الإعدادات:
   - **Framework preset**: `None`
   - **Build command**: (اتركه فارغاً)
   - **Build output directory**: `/`
   - **Root directory**: `/`
4. اضغط **Save and Deploy**.

كل `push` إلى `main` سيُطلق نشراً تلقائياً.

## الطريقة الثانية: نشر مباشر من الطرفية

```bash
npx wrangler pages deploy . --project-name=mytechol
```

## النطاق المخصص

بعد النشر: **Custom domains** → أضف `mytechol.com` أو `mytechol.dev`.
إن كان النطاق على Cloudflare، تُضاف سجلات DNS تلقائياً.

## ملاحظات

- الموقع ثابت 100% (HTML/CSS/JS) — لا يحتاج Build.
- صفحات الأخطاء: يمكن إضافة `404.html` لاحقاً.
- الترويسات الأمنية: أضف `_headers` في الجذر عند الحاجة.
