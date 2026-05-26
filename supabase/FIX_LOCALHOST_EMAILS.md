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
