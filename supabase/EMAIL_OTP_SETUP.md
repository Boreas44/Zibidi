# Supabase — 6 haneli e-posta doğrulama (kod, link değil)

Blogify kayıt akışı **6 haneli OTP** kullanır. Mailde **link değil kod** gelmesi için şablonları aşağıdaki gibi ayarla.

## Önemli kural

Şablonda **`{{ .ConfirmationURL }}` veya “Confirm your mail” linki OLMAMALI**.  
Sadece **`{{ .Token }}`** kullan. İkisi birlikte olursa Supabase çoğu zaman **magic link** gönderir.

Kayıt kodu **`signInWithOtp`** ile gider → **Magic Link** e-posta şablonunu düzenlemen gerekir.

---

## 1. Authentication → Providers → Email

- Email açık
- **Confirm email** açık (önerilir)

## 2. Authentication → Email Templates → **Magic Link**

Bu şablon kayıt doğrulama kodunu gönderir.

**Subject:** `Blogify — doğrulama kodunuz`

**Body (örnek):**

```html
<h2>Hesabını doğrula</h2>
<p>Kayıt kodun:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">{{ .Token }}</p>
<p>Bu kod kısa süre geçerlidir. Kodu kimseyle paylaşma.</p>
```

`{{ .Token }}` = 6 haneli kod.

**Şablondan sil:** `{{ .ConfirmationURL }}`, “Click here”, “Confirm your signup” gibi link metinleri.

## 3. (İsteğe bağlı) Confirm signup şablonu

Eski `signUp` akışını kullanırsan aynı kural: yalnızca `{{ .Token }}`, link yok.

## 4. URL Configuration

- Site URL: `http://localhost:3000` (prod’da kendi domain)
- Redirect URLs: `http://localhost:3000/auth/callback`

## 5. Storage — profil fotoğrafı

SQL Editor’da çalıştır: `supabase/migrations/004_avatars_storage.sql`

## 6. SMTP (production)

Varsayılan Supabase maili sınırlıdır. Canlıda **Project Settings → Auth → SMTP** ile kendi mail sunucunu bağla.

## Test

1. Magic Link şablonunu kaydet (yukarıdaki gibi)
2. Uygulamada **Create account** → e-posta, ad, şifre → **Send verification code**
3. Mailde **6 hane** görünmeli (tıklanacak link olmamalı)
4. Kodu gir → **Verify & create account**
5. Profil → **Edit profile** → kamera ikonu ile fotoğraf yükle
