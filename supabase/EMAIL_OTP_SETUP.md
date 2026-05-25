# Supabase — 6 haneli e-posta doğrulama

Blogify kayıt akışı **6 haneli OTP** kullanır. Supabase Dashboard’da şunları ayarla:

## 1. Authentication → Providers → Email

- Email açık
- **Confirm email** açık (kayıt için zorunlu)
- Geliştirme için: **Secure email change** isteğe bağlı

## 2. Authentication → Email Templates → **Confirm signup**

Magic Link yerine OTP göndermek için şablonu güncelle:

**Subject:** `Blogify — doğrulama kodunuz`

**Body (örnek):**

```html
<h2>Hesabını doğrula</h2>
<p>Kayıt kodun:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">{{ .Token }}</p>
<p>Bu kod 1 saat geçerlidir. Kodu kimseyle paylaşma.</p>
```

`{{ .Token }}` = 6 haneli kod (Supabase otomatik üretir).

## 3. URL Configuration

- Site URL: `http://localhost:3000` (prod’da kendi domain)
- Redirect URLs: `http://localhost:3000/auth/callback`

## 4. SMTP (production)

Varsayılan Supabase maili sınırlıdır. Canlıda **Project Settings → Auth → SMTP** ile kendi mail sunucunu bağla (Resend, SendGrid, vb.).

## Test

1. Uygulamada **Create account** → e-posta, ad, şifre → **Send verification code**
2. Gelen maildeki 6 haneyi gir → **Verify & create account**
