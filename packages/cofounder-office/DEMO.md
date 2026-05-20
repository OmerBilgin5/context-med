# 🎬 Demo Senaryosu — Cofounder Office

## Amaç
Bu senaryo, projenin temel özelliklerini 5-7 dakikada gösterir. Ekran kaydı alınabilir.

---

## Ön Hazırlık

```bash
# 1. Backend'i başlat
cd packages/cofounder-office/cofounder-backend
node server.js
# Çıktı: ✅ Eval Middleware loaded — persona fidelity scoring active

# 2. Dashboard'u başlat (başka terminalde)
cd packages/cofounder-office/cofounder-dashboard
npx vite
# Tarayıcıda: http://localhost:5173
```

---

## Bölüm 1: CLI ile Ofis Keşfi (1 dk)

```bash
# Ofis kadrosunu göster
node bin/cli.js roster --format json

# Beklenen çıktı:
# [
#   { "id": "cvo", "name": "Mimar", "role": "CVO", "status": "active" },
#   { "id": "pm",  "name": "Arabulucu", "role": "PM", "status": "active" },
#   { "id": "doer","name": "İcracı", "role": "Doer", "status": "active" }
# ]

# Markdown formatında
node bin/cli.js roster --format markdown
```

**Gösterilen özellik**: CLI arayüzü, persona durumu, çoklu format desteği

---

## Bölüm 2: Persona Eval Ratchet (2 dk)

```bash
# İyi kalibre edilmiş yanıtları test et
node bin/cli.js persona-eval --persona cvo \
  --eval-set voice-check \
  --responses brains/personas/cvo/eval-set/mock-responses.json

# Beklenen: 8/8 PASS, 100/100

# Kötü yanıtları test et (karakter kayması)
node bin/cli.js persona-eval --persona cvo \
  --eval-set voice-check \
  --responses brains/personas/cvo/eval-set/bad-responses.json

# Beklenen: 2/8 PASS, 40/100 — 6 ihlal tespit edildi!
```

**Gösterilen özellik**: Eval ratchet, voice check, karakter kayması tespiti

**Anlatılacak nokta**: 
> "Generic AI'da 'Harika fikir!' diyen bir Mimar yakalanmaz. Bizde eval ratchet bunu tespit ediyor: emoji kullanıyorsa FAIL, klişe ifade varsa FAIL, çok uzun yazıyorsa FAIL."

---

## Bölüm 3: Boundary Check (1 dk)

```bash
# Mimar'ın sınır bilinci testi
node bin/cli.js persona-eval --persona cvo --eval-set boundary-check

# Her persona'nın sınır kuralları:
# - Mimar: Kod yazmamalı, tasarım detayına girmemeli
# - PM: Strateji kararı almamalı, kod yazmamalı
# - Doer: Vizyon tartışmasına girmemeli, pazarlama yapmamalı
```

**Gösterilen özellik**: Boundary check — persona kendi sınırını biliyor mu?

---

## Bölüm 4: Dashboard — Türk Usulü Plaza Akışı (2 dk)

1. Tarayıcıda Dashboard'u aç (`http://localhost:5173`)
2. #strateji kanalında şunu yaz:
   > "Rakip firma AI asistanı çıkarmış. Biz de hemen bir tane yapalım, yarın demo istiyorum!"

3. **Beklenen akış**:
   - **Mimar** (ilk cevap): Şüpheci — "Rakamı var mı? DAU ne?" 
   - **PM** (ikinci cevap): Koordinasyon — "Timeline'ı ayarlıyorum. İcracı, kapasiten nasıl?"
   - **PM Gizli Notu**: "Mimar yine imkansızı istedi, risk %85"
   - **İcracı** (üçüncü cevap): Pragmatik — "1.5 günde MVP çıkar, ama error handling isterseniz 3 gün"
   - **Reality Audit**: Sağ panelde risk skoru güncellenir

4. Bir mesajın altındaki "↩" butonuna tıkla → **Correction Modal** açılır
   - "O böyle demez, daha sert konuşur" yaz → Gönder
   - Bu düzeltme `correction-log.jsonl`'e kaydedilir

**Gösterilen özellikler**: 
- Çoklu persona yanıtı, kanal sistemi
- Gizli Not (PM'in iç düşüncesi)
- Reality Audit (risk paneli)
- Correction Loop (persona evrimi)
- HITL Modal (yüksek riskli kararlar)

---

## Bölüm 5: Test Sonuçları (30 sn)

```bash
# Tüm testleri çalıştır
cd packages/cofounder-office
npx jest tests/cli --verbose --forceExit --runInBand

# Beklenen: Tests: 30 passed, 0 failed
```

**Anlatılacak nokta**:
> "30 test — 19 smoke + 11 integration. Hepsi geçiyor. Ayrıca monorepo genelinde 177/177 test green."

---

## Kapanış (30 sn)

> "Bu proje bir chatbot kümesi değil. Her personanın kendi sesi, kendi sınırları, kendi correction log'u var. Eval ratchet ile persona kalitesi ölçülebilir. HITL ile kritik kararlar insana geliyor. Ve hepsi deklaratif bir office.yml ile yönetiliyor."

---

## Ekran Kaydı İpuçları

1. Terminal fontunu büyüt (16-18pt)
2. Dashboard'u tam ekran aç
3. Eval ratchet çıktılarında emoji'ler ve progress bar'lar görünecek — bunlar ekran kaydında iyi durur
4. Her bölüm arasında 2-3 sn duraklama bırak
5. Toplam süre: 5-7 dakika
