# Zibidi

Next.js 16 blog uygulaması — TypeScript, Tailwind, shadcn/ui, Supabase.

## Önemli: `.js` dosyası yok, bu normal

Bu proje **TypeScript** (`.ts` / `.tsx`) ile yazılır. Kaynak kodda `.js` dosyası olmaz; Next.js çalışırken derlenmiş çıktı `.next/` klasöründe oluşur.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

## Supabase + hesap

1. `.env.example` → `.env.local` kopyala ve anahtarları doldur.
2. Supabase SQL Editor’da sırayla çalıştır:
   - `supabase/migrations/001_posts.sql`
   - `supabase/migrations/003_auth_profiles.sql`
3. **Authentication → URL Configuration**: Site URL `http://localhost:3000`, Redirect `http://localhost:3000/auth/callback`
4. İsteğe bağlı: Email provider’da “Confirm email” kapatabilirsin (geliştirme için).
5. `npm run dev` yeniden başlat.

- **Kayıt ol** / **Giriş yap**: sağ üst veya sidebar hesap alanı
- **Kayıt**: e-postana **6 haneli kod** gider → panelde doğrula  
  - Şablon / kendi mail tasarımı: `supabase/email-templates/README.md`  
  - Hızlı kurulum: `supabase/EMAIL_OTP_SETUP.md`
  - Şifremi unuttum: `supabase/PASSWORD_RESET_SETUP.md`
- Profil fotoğrafı: stock yok; adının baş harfleri (ör. `JD`)
- Post atmak için giriş gerekli

## Sorun giderme

| Sorun | Çözüm |
|--------|--------|
| Sayfa açılmıyor / build hatası | `npm install` sonra `npm run dev` |
| Port meşgul | Eski terminali kapat veya `npx kill-port 3000` |
| Eski hata görünüyor | `.next` sil: `Remove-Item -Recurse -Force .next` (PowerShell) |
| GitHub’dan çekince eksik dosya | Tüm değişiklikleri commit + push et (`components/home-page.tsx`, `lib/supabase/`, vb.) |
