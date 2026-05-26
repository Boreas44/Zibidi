# Mail linkleri hâlâ localhost ise

## 1. Supabase — Site URL (en kritik)

**Authentication → URL Configuration**

| Alan | Değer |
|------|--------|
| **Site URL** | `https://zibidi.vercel.app` |

Redirect listesi yetmez. **Site URL** ayrı bir kutudur; `http://localhost:3000` kaldıysa maillerde localhost görünür.

**Save** → yeni mail iste (eski mailler değişmez).

## 2. Vercel — Production env

| Key | Production değeri |
|-----|------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://zibidi.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://….supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |

Sonra **Redeploy**.

## 3. Nereden test ediyorsun?

| İstek nereden? | Maildeki link |
|----------------|---------------|
| `http://localhost:3000` (npm run dev) | localhost — normal |
| `https://zibidi.vercel.app` | zibidi.vercel.app — olmalı |

Şifre sıfırlamayı **canlı siteden** dene; local’den değil.

## 4. Kod (deploy sonrası)

Server Actions artık isteğin host’unu kullanır (`zibidi.vercel.app` üzerinden gelen istek → canlı URL).

Değişikliklerin etkisi için Git push + Vercel deploy gerekir.

---

## “Email rate limit exceeded”

Supabase’in **varsayılan (ücretsiz) mail servisi** projeye saatte çok az mail izin verir (genelde **saatte ~2–4** auth maili — kayıt OTP, resend, şifre sıfırlama **hepsi aynı kotadan** düşer).

**Ne yap:**

1. **~1 saat bekle** — kota sıfırlanır.
2. Testte **Resend code** / forgot password’u art arda spam’leme.
3. Canlı için: custom SMTP → adım adım: **`supabase/MAILERSEND_SMTP.md`** (MailerSend) veya [Supabase SMTP rehberi](https://supabase.com/docs/guides/auth/auth-smtp).
4. İsteğe bağlı: **Authentication → Rate Limits** → email limitlerini SMTP sonrası artır.

Bu Zibidi kodu hatası değil; Supabase proje kotası.
