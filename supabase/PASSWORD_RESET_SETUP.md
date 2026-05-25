# Zibidi — Şifremi unuttum

## Uygulama akışı

1. **Sign in** → **Forgot password?**
2. E-posta gir → reset linki gönderilir
3. Maildeki linke tıkla → `/auth/callback` → `/auth/reset-password`
4. Yeni şifre + tekrar → kaydet → ana sayfa

## Supabase ayarları

### URL Configuration

- **Site URL:** canlı domain veya `http://localhost:3000`
- **Redirect URLs** (ekle):
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/reset-password`
  - Prod domain için aynı yollar

### Email template — **Reset Password**

Supabase → Authentication → Email Templates → **Reset Password**

1. **Subject:** `Zibidi — reset your password`
2. **Body:** `supabase/email-templates/reset-password.html` içeriğini kopyala-yapıştır
3. Şablonda **mutlaka** kalsın: `{{ .ConfirmationURL }}` (buton + yedek link)
4. OTP şablonundaki gibi: iOS koyu tema, SF Pro, logo, `#f0355d` vurgular (isim, etiket, buton, link)

### `.env.local` (isteğe bağlı)

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Prod’da Vercel URL otomatik; yoksa `NEXT_PUBLIC_SITE_URL` kullan.

## Test

1. Kayıtlı bir hesapla **Forgot password?** → e-posta
2. Gelen maildeki linke tıkla
3. Yeni şifre kaydet
4. Yeni şifreyle **Sign in**
