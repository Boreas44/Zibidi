# Zibidi — Kendi 2FA / doğrulama mailini tasarlamak

Uygulama kodu e-postayı **Supabase Auth** gönderir. Tasarımı **sen** Supabase Dashboard’da (veya bu klasördeki HTML’i düzenleyip yapıştırarak) yaparsın.

## Hâlâ link geliyorsa (kod gelmiyorsa)

Bu **uygulama hatası değil** — Supabase şablonunda hâlâ link değişkeni vardır.

### Yapılacaklar (sırayla)

1. [Supabase Dashboard](https://supabase.com/dashboard) → projen → **Authentication** → **Email Templates**
2. **Magic Link** şablonunu aç (Zibidi kayıt `signInWithOtp` bunu kullanır; “Confirm signup” değil!)
3. **Body** içinde şunları **tamamen sil**:
   - `{{ .ConfirmationURL }}`
   - `{{ .TokenHash }}` ile yapılmış `<a href="...">` linkleri
   - “Click to confirm”, “Confirm your mail” vb. butonlar
4. Body’de **mutlaka** şu kalsın: `{{ .Token }}` (6 haneli kod)
5. **Save** → yeni bir test kaydı dene (eski mail cache’lenmez; yeni kod iste)

### Hangi şablon?

| Uygulama akışı | Supabase şablonu |
|----------------|------------------|
| Kayıt → “Send verification code” | **Magic Link** → `magic-link-otp.html` |
| Şifremi unuttum | **Reset Password** → `reset-password.html` |
| Eski `signUp` + confirm | Confirm signup |

İkisini de aynı OTP HTML ile güncellemek en güvenlisi.

### Minimal test şablonu

Link sorununu ayıklamak için önce `otp-only-minimal.html` içeriğini Magic Link Body’ye yapıştır. Mailde **sadece 6 rakam** görünmeli. Çalışınca kendi tasarımını (`magic-link-otp.html` veya kendi dosyan) eklersin.

---

## Kendi mail tasarımını nasıl yaparsın?

### Yol 1 — Bu projede HTML düzenle (önerilen)

1. `supabase/email-templates/` altında dosya aç veya kopyala:
   - `magic-link-otp.html` — kayıt / OTP (Magic Link şablonu)
   - `reset-password.html` — şifre sıfırlama (Reset Password şablonu)
   - `otp-only-minimal.html` — sadece kod (test)
2. VS Code / Cursor ile HTML + **inline `style`** düzenle (e-posta istemcileri dış CSS’i çoğu zaman keser).
3. Tarayıcıda önizleme: dosyayı aç, `{{ .Token }}` yerine geçici `482910` yaz.
4. Supabase → **Magic Link** → Body’ye **tüm HTML’i** kopyala-yapıştır.
5. **Subject** örneği: `Zibidi — doğrulama kodunuz`

### Yol 2 — Görsel editör

- [Stripo](https://stripo.email), [BeeFree](https://beefree.io), Figma + HTML export  
- Export’ta **tablo layout** + inline style kullan; Flex/Grid çoğu mailde bozulur.

### Yol 3 — Canlıda kendi domain’inden göndermek

**Project Settings → Auth → SMTP** (Resend, SendGrid, Brevo…). Şablon yine Dashboard’da; sadece gönderen adres `noreply@senindomain.com` olur.

---

## Kullanabileceğin değişkenler (Supabase)

| Değişken | Ne işe yarar |
|----------|----------------|
| `{{ .Token }}` | **6 haneli kod** — Zibidi OTP ekranı bunu bekler |
| `{{ .Email }}` | Kullanıcı e-postası |
| `{{ .Data.display_name }}` | Kayıtta yazılan görünen ad / nickname (`signInWithOtp` metadata) |
| `{{ .SiteURL }}` | Site adresin |
| `{{ .ConfirmationURL }}` | Magic link — **OTP mailinde kullanma** |
| `{{ .TokenHash }}` | Özel link kurmak için — **OTP mailinde kullanma** |

Kural: OTP mailinde **yalnızca** `{{ .Token }}` (ve isteğe bağlı metin). Link değişkeni = mailde tıklanacak link.

---

## Tasarım ipuçları

- Kod kutusu: büyük font (28–36px), `letter-spacing`, monospace
- Arka plan: `#0a0a0a` / kart `#1a1a1a` (uygulama ile uyumlu)
- Marka rengi: `#e85d4a` (Zibidi primary’ye yakın)
- Tek sütun, max ~420px genişlik, `<table role="presentation">`
- Türkçe metin: “Bu kodu uygulamaya gir”, “Kodu paylaşma”

---

## Logo in emails

Kalıcı logo URL (Cloudinary):

`https://res.cloudinary.com/dsnwi9kev/image/upload/v1779743729/ZIBIDILOGO-Photoroom_wb8pvg.png`

Marka rengi (mail vurguları): **#f0355d**

- `f_auto,q_auto` = format ve kalite otomatik (mail istemcileri için iyi)
- Şablonda sabit URL kullanılıyor (`magic-link-otp.html`) — Site URL gerekmez
- Uygulama içi: `public/LOGO_Z.png` ayrıca durabilir

Logo değişirse Cloudinary’de yeni URL alıp şablondaki `src` güncelle.

---

## Test listesi

- [ ] Magic Link şablonu kaydedildi
- [ ] Body’de `{{ .ConfirmationURL }}` yok
- [ ] Body’de `{{ .Token }}` var
- [ ] Yeni kayıt → mailde 6 hane
- [ ] Uygulamada kod girilince “Verify & create account” başarılı

Sorun sürerse: Dashboard’da şablonun **Preview**’ına bak; link satırı görünüyorsa hâlere yanlış şablon veya kaydedilmemiş demektir.
