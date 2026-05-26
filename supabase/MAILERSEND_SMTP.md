# Zibidi — MailerSend + Supabase SMTP

Mailler Supabase Auth üzerinden gider; **Zibidi kodunda veya Vercel env’de değişiklik gerekmez.** Ayarlar sadece [MailerSend](https://app.mailersend.com/) ve Supabase Dashboard’da.

---

## Bölüm A — MailerSend

### 1. Hesap

1. [app.mailersend.com](https://app.mailersend.com/) → kayıt / giriş  
2. Ücretsiz planda günlük/aylık kota vardır; auth testi için genelde yeter.

### 2. Domain ekle

1. **Domains** → **Add domain**  
2. Kendi domain’in varsa (ör. `senindomain.com`) ekle → DNS kayıtlarını (SPF, DKIM) domain sağlayıcında tanımla → **Verify**.  
3. Henüz domain yoksa: MailerSend’in **trial / test domain** seçeneğini kullan (dashboard’da gösterilir; sadece doğrulanmış adrese mail gidebilir).

### 3. SMTP kullanıcısı oluştur

1. **Emails** → **Domains** → domain yanında **Manage**  
2. Aşağı kaydır → **SMTP** → **Generate new user**  
3. İsim ver (ör. `zibidi-supabase`) → **Save user**  
4. Şunları kopyala (bir daha tam gösterilmeyebilir):

| Alan | Değer (MailerSend) |
|------|---------------------|
| Server / Host | `smtp.mailersend.net` |
| Port | `587` (alternatif: `2525`) |
| Username | `MS_…` (otomatik üretilir) |
| Password | SMTP şifresi |

Kaynak: [MailerSend SMTP relay](https://www.mailersend.com/help/smtp-relay)

**Not:** API token değil — **SMTP username + password** kullan.

### 4. Gönderen adresi

Doğrulanmış domain’den bir adres seç, örnek:

- `noreply@senindomain.com`  
- veya `auth@senindomain.com`

Bu adres Supabase’te **Sender email** olacak.

---

## Bölüm B — Supabase

### 1. Custom SMTP aç

1. [Supabase Dashboard](https://supabase.com/dashboard) → projen  
2. **Authentication** → **SMTP** (veya **Project Settings** → **Auth** → **SMTP Settings**)  
3. **Enable custom SMTP** açık

### 2. Formu doldur

| Supabase alanı | Değer |
|----------------|--------|
| **Sender email** | `noreply@senindomain.com` (MailerSend’de doğrulanmış domain) |
| **Sender name** | `Zibidi` |
| **Host** | `smtp.mailersend.net` |
| **Port** | `587` |
| **Username** | MailerSend SMTP username |
| **Password** | MailerSend SMTP password |
| **Minimum TLS** | TLS 1.2 (varsa) |

**Save.**

Supabase rehberi: [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

### 3. Rate limits (SMTP sonrası)

**Authentication** → **Rate Limits** → email / OTP limitlerini ihtiyacına göre artır (yeni SMTP’de genelde saatte ~30 ile başlar).

### 4. URL Configuration (mail linkleri)

| Alan | Değer |
|------|--------|
| **Site URL** | `https://zibidi.vercel.app` |
| **Redirect URLs** | `https://zibidi.vercel.app/auth/callback`, `…/auth/reset-password` (+ localhost geliştirme için) |

### 5. E-posta şablonları (zaten repoda)

Şablonlar Supabase’te kalır; SMTP sadece **göndereni** değiştirir.

| Şablon | Dosya |
|--------|--------|
| Kayıt OTP | `supabase/email-templates/magic-link-otp.html` → **Magic Link** |
| Şifre sıfırlama | `supabase/email-templates/reset-password.html` → **Reset Password** |

Detay: `supabase/email-templates/README.md`

---

## Bölüm C — Test

1. **~1 saat önce** “email rate limit exceeded” aldıysan, built-in kota dolmuş olabilir — SMTP kaydettikten sonra **yeni** istek dene.  
2. [https://zibidi.vercel.app](https://zibidi.vercel.app) → **Forgot password?** veya kayıt → kod / link.  
3. MailerSend → **Activity** / **Emails** → gönderim logu.  
4. Supabase → **Authentication** → **Logs** → hata yok mu.  
5. Gelen kutusu + **spam** klasörü.

### Sık hatalar

| Hata | Çözüm |
|------|--------|
| SMTP authentication failed | SMTP user/password (API key değil); şifreyi MailerSend’de yenile |
| Sender not verified | Sender email, doğrulanmış domain ile aynı domain’de olmalı |
| Hâlâ rate limit | SMTP kaydedildi mi; Save sonrası yeni mail iste |
| Link localhost | Site URL = `https://zibidi.vercel.app` (`FIX_LOCALHOST_EMAILS.md`) |

---

## Özet — kaç yer değişir?

| Yer | Değişiklik |
|-----|------------|
| MailerSend | Domain + SMTP user |
| Supabase | SMTP form + Rate limits + Site URL |
| Vercel / `.env.local` | **Yok** (SMTP secret’ları Supabase’te) |
| Zibidi Git kodu | **Yok** |

---

## Checklist

- [ ] MailerSend domain doğrulandı  
- [ ] SMTP user oluşturuldu  
- [ ] Supabase custom SMTP kaydedildi  
- [ ] Site URL = `https://zibidi.vercel.app`  
- [ ] Rate limits güncellendi  
- [ ] Canlı siteden test maili geldi  
