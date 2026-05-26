# Zibidi — Vercel + Supabase (canlı)

Bu rehber: projeyi Vercel’e almak, Supabase’te **OTP maili** ve **şifre sıfırlama maili** dahil tüm auth ayarlarını tamamlamak.

---

## Bölüm 1 — Vercel’e deploy

### 1. GitHub hazır mı?

Repo: `https://github.com/Boreas44/Zibidi` (push edilmiş olmalı).

### 2. Vercel’de proje oluştur

1. [vercel.com](https://vercel.com) → giriş (GitHub ile)
2. **Add New…** → **Project**
3. **Import** → `Boreas44/Zibidi` seç
4. Framework: **Next.js** (otomatik)
5. **Deploy**’a basmadan önce **Environment Variables** ekle:

| Name | Value | Ortam |
|------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` key | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | Canlı site adresin (aşağıya bak) | **Production** zorunlu |

**`NEXT_PUBLIC_SITE_URL` örnekleri:**

- İlk deploy: `https://zibidi.vercel.app` (Vercel’in verdiği domain)
- Özel domain: `https://senindomain.com` (sonradan bağlarsan bunu güncelle)

> Şifre sıfırlama maillerindeki link bu URL’ye gider. Yanlış olursa reset çalışmaz.

6. **Deploy** → bitince site URL’ini kopyala.

### 3. Özel domain (isteğe bağlı)

Vercel → Project → **Settings** → **Domains** → domain ekle → DNS’i Vercel’e yönlendir → `NEXT_PUBLIC_SITE_URL` ve Supabase URL’lerini yeni domain ile güncelle.

---

## Bölüm 2 — Supabase (canlı URL’ler)

[Supabase Dashboard](https://supabase.com/dashboard) → projen.

### A) SQL migration’lar (bir kez)

SQL Editor’da sırayla çalıştır (henüz yapmadıysan):

1. `supabase/migrations/001_posts.sql`
2. `supabase/migrations/003_auth_profiles.sql`
3. `supabase/migrations/004_avatars_storage.sql` (profil fotoğrafı için)

### B) URL Configuration

**Authentication** → **URL Configuration**

| Alan | Değer |
|------|--------|
| **Site URL** | `https://SENIN-VERCEL-DOMAIN.vercel.app` (veya özel domain) |
| **Redirect URLs** | Her satırı **Add URL** ile ekle |

Redirect listesi (localhost + canlı):

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
https://SENIN-VERCEL-DOMAIN.vercel.app/auth/callback
https://SENIN-VERCEL-DOMAIN.vercel.app/auth/reset-password
```

Özel domain varsa `https://senindomain.com/auth/callback` ve `.../auth/reset-password` de ekle.

**Save.**

### C) E-posta şablonu — Kayıt OTP (Magic Link)

**Authentication** → **Email Templates** → **Magic Link**

| Alan | Değer |
|------|--------|
| **Subject** | `Zibidi — your verification code` |
| **Body** | `supabase/email-templates/magic-link-otp.html` dosyasının **tamamı** |

Kontrol:

- Body’de **`{{ .Token }}`** var
- Body’de **`{{ .ConfirmationURL }}` yok** (link maili olmasın)

İsteğe bağlı: **Confirm signup** şablonunu da aynı HTML ile güncelle.

Detay: `supabase/EMAIL_OTP_SETUP.md`

### D) E-posta şablonu — Şifre sıfırlama (Reset Password) ✅

**Authentication** → **Email Templates** → **Reset Password**

| Alan | Değer |
|------|--------|
| **Subject** | `Zibidi — reset your password` |
| **Body** | `supabase/email-templates/reset-password.html` dosyasının **tamamı** |

Kontrol:

- **`{{ .ConfirmationURL }}`** var (buton + yedek link)
- OTP şablonunu buraya yapıştırma (o mailde kod değil link gerekir)

**Save.**

Detay: `supabase/PASSWORD_RESET_SETUP.md`

### E) Auth providers

**Authentication** → **Providers** → **Email** → enabled.

Geliştirmede e-posta onayı kapalıysa canlıda da politikanı bilin; reset ve OTP yine çalışır.

### F) SMTP (isteğe bağlı, önerilir)

Ücretsiz Supabase maili sınırlıdır. Canlıda:

**Authentication** → **SMTP** → örn. [MailerSend](https://app.mailersend.com/) (`supabase/MAILERSEND_SMTP.md`).

Şablonlar yine Dashboard’da; sadece gönderen adres değişir. Vercel env’e SMTP şifresi ekleme.

---

## Bölüm 3 — Vercel env’i Supabase ile eşle

Deploy sonrası Vercel → **Settings** → **Environment Variables**:

1. `NEXT_PUBLIC_SITE_URL` = Supabase **Site URL** ile **aynı** (https, sondaki `/` yok)
2. Değiştirdiysen **Redeploy** (Deployments → … → Redeploy)

---

## Bölüm 4 — Canlı test listesi

- [ ] Ana sayfa açılıyor
- [ ] Kayıt → mailde **6 haneli kod** (link değil)
- [ ] Kod ile hesap oluşuyor
- [ ] Giriş / çıkış
- [ ] **Forgot password?** → mail geliyor
- [ ] Maildeki **Reset password** → Vercel sitesinde yeni şifre sayfası
- [ ] Yeni şifreyle giriş
- [ ] Post oluşturma (girişli)
- [ ] Profil fotoğrafı (storage migration yapıldıysa)

---

## Sık hatalar

| Belirti | Çözüm |
|---------|--------|
| `redirect URL not allowed` | Supabase Redirect URLs’e canlı `.../auth/callback` eklendi mi? |
| Reset link localhost’a gidiyor | Vercel’de `NEXT_PUBLIC_SITE_URL` + Supabase Site URL canlı domain |
| Mailde kod yok, link var | Yanlış şablon: **Magic Link** OTP HTML ile güncellenmeli |
| Reset maili default / çirkin | **Reset Password** şablonuna `reset-password.html` yapıştırılmamış |
| Supabase env eksik | Vercel’de URL + anon key, sonra redeploy |

---

## Özet (5 dakika)

1. Vercel import + 3 env variable + deploy  
2. Supabase SQL (3 migration)  
3. Supabase URL Configuration (canlı + local redirect)  
4. **Magic Link** → `magic-link-otp.html`  
5. **Reset Password** → `reset-password.html`  
6. `NEXT_PUBLIC_SITE_URL` = canlı domain → redeploy  
7. Forgot password + kayıt test
