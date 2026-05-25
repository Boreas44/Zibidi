# Zibidi — E-posta OTP (6 haneli kod)

## Link geliyor, kod gelmiyor mu?

Kod tarafı hazır (`signInWithOtp`). Mail **Supabase şablonundan** çıkar.

1. Dashboard → **Authentication** → **Email Templates** → **Magic Link** (Confirm signup değil!)
2. Body’den sil: `{{ .ConfirmationURL }}`, tüm `<a href=...>` onay linkleri
3. Body’de kalsın: `{{ .Token }}`
4. Kaydet → yeni kayıt dene

Detaylı rehber ve kendi tasarımın: **`supabase/email-templates/README.md`**

Hızlı test: `otp-only-minimal.html` → Magic Link Body’ye yapıştır.

---

## Hazır Zibidi tasarımı

**Subject:** `Zibidi — your verification code`

**Body:** `supabase/email-templates/magic-link-otp.html` dosyasının tamamını kopyala → Magic Link şablonuna yapıştır.

Kendi tasarımın için aynı dosyayı düzenle veya yeni `.html` oluştur; `{{ .Token }}` satırını silme.

---

## Logo in email

- Cloudinary logo + marka rengi `#f0355d` — `magic-link-otp.html`
- Yerel yedek: `public/LOGO_Z.png` (sitede kullanım için)

## Diğer ayarlar

- **Authentication → URL Configuration:** Site = canlı URL (prod) veya local test; Redirect `http://localhost:3000/auth/callback`
- **Confirm signup** şablonunu da aynı OTP HTML ile güncelle (yedek)
- **SMTP:** Production’da Project Settings → Auth → SMTP
- **SQL:** `004_avatars_storage.sql` (avatar)

## Test

1. Magic Link şablonunu kaydet
2. Create account → Send verification code
3. Mailde **6 hane**, link yok
4. Kodu gir → Verify & create account
