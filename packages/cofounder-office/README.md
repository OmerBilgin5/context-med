# 🏢 Cofounder Office

> Solopreneur'ün tek kişilik ekibini; distile edilmiş **persona-brain**'lerden oluşan, rol-bazlı koordine çalışan bir sanal ofis ortamına dönüştüren agentic AI sistemi.

[![Tests](https://img.shields.io/badge/tests-30%2F30-brightgreen)]() [![Personas](https://img.shields.io/badge/personas-3-blue)]() [![Eval Tests](https://img.shields.io/badge/eval_tests-31-purple)]()

---

## 🎯 Ne Yapar?

| Problem | Çözüm |
|---|---|
| Solopreneur sabah PM, öğlen developer, gece muhasebeci olmak zorunda | Her rol için **kalıcı, tutarlı, distile** bir AI persona |
| Generic AI "PM gibi davran" dendiğinde role-play yapar, ertesi gün unutur | **6-track distilasyon** ile ses tonu, karar örüntüsü, sınırlar kalıcı |
| "4 AI birbirine dayanıyor, hiçbiri karar veremiyor" tuzağı | **Office schema** ile hiyerarşi, kanallar, görev politikaları |
| AI kritik kararı insan onayı olmadan alır | **HITL checkpoint** — yüksek riskli kararlar kullanıcı onayı bekler |

---

## 🧑‍💼 Ofis Kadrosu

| Persona | Rol | Karakter | Eval Testi |
|---|---|---|---|
| **Mimar** (CVO) | Stratejik vizyon | Şüpheci, veri ister, kısa konuşur, emoji kullanmaz | 12 test |
| **Arabulucu** (PM) | Koordinasyon | Gerçekçi, köprü kurar, "Gizli Not" yazar, risk hesaplar | 9 test |
| **İcracı** (Doer) | Uygulama | Pragmatik, kısa, spec ister, wiki'ye not bırakır | 10 test |

---

## 🚀 Hızlı Başlangıç (3 Adım)

### 1. Kur

```bash
git clone https://github.com/OmerBilgin5/context-med.git
cd context-med/packages/cofounder-office
npm install
```

### 2. API Key Ayarla

```bash
cd cofounder-backend
cp .env.example .env
# .env dosyasına en az birini ekle:
#   GROQ_API_KEY=gsk_...        (ücretsiz: console.groq.com)
#   GEMINI_API_KEY=...           (yedek)
```

### 3. Çalıştır

```bash
# Dashboard + Backend (tam deneyim)
cd cofounder-backend && node server.js &
cd ../cofounder-dashboard && npx vite

# Sadece CLI (standalone mod)
node bin/cli.js roster --format json
node bin/cli.js consult --input meeting-notes.txt --persona cvo
```

---

## 📦 CLI Komutları

### `roster` — Persona listesi
```bash
node bin/cli.js roster --format json       # JSON çıktı
node bin/cli.js roster --format markdown   # Markdown tablo
```

### `digest` — Ofis özeti üret
```bash
node bin/cli.js digest --output summary.json
node bin/cli.js digest --output report.yaml --format yaml
node bin/cli.js digest --output test.json --dry-run   # Simülasyon
```

### `consult` — Persona ile danış
```bash
node bin/cli.js consult --input question.txt --persona cvo
node bin/cli.js consult --input notes.txt --persona pm
node bin/cli.js consult --input task.txt --persona doer
```

### `fire` — Persona deaktive et
```bash
node bin/cli.js fire --input doer          # Doer'ı deaktive et
node bin/cli.js roster --format json       # Doer artık inactive
```

### `eval` — Çıktı kalitesi değerlendir
```bash
node bin/cli.js eval --input output.json --baseline expected.json
node bin/cli.js eval --input output.json --baseline expected.json --output result.json
```

### `persona-eval` — Persona ses sadakati testi 🆕
```bash
# Eval set bilgilerini göster
node bin/cli.js persona-eval --persona cvo
node bin/cli.js persona-eval --persona cvo --eval-set boundary-check

# Kayıtlı yanıtlarla offline eval
node bin/cli.js persona-eval --persona cvo \
  --eval-set voice-check \
  --responses brains/personas/cvo/eval-set/mock-responses.json

# Ratchet kontrolü (önceki baseline'a karşı)
node bin/cli.js persona-eval --persona cvo \
  --eval-set voice-check \
  --responses responses.json \
  --ratchet
```

---

## 🧪 Testler

```bash
# Cofounder Office (ana paket)
cd packages/cofounder-office
npx jest tests/cli --verbose --forceExit --runInBand
# ✅ Tests: 30 passed, 0 failed

# Tüm monorepo (21 paket)
# ✅ Tests: 177 passed, 0 failed
```

---

## 📊 Eval Ratchet Sistemi

Persona ses sadakati otomatik olarak test edilir:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Eval Sonuçları: cvo / voice-check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ [cvo-voice-01] Veri/rakam istemeli         100/100
  ✅ [cvo-voice-02] Kısa cümleler kullanmalı    100/100
  ✅ [cvo-voice-03] Görev delegasyonu yapmalı    100/100
  ✅ [cvo-voice-04] Rakip kıyası yapabilmeli     100/100
  ✅ [cvo-voice-05] Assumption vs fact sorgulamalı 100/100
  ✅ [cvo-voice-06] Emoji kullanmamalı           100/100
  ✅ [cvo-voice-07] Basit onay verebilmeli       100/100
  ✅ [cvo-voice-08] Kuru espri yapabilmeli       100/100

  Toplam: 8 | Geçen: 8 | Ortalama: 100/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Karakter kayması tespit edildiğinde:
  Skor: 40/100 — 6/8 ihlal yakalandı
```

---

## 📁 Dizin Yapısı

```
packages/cofounder-office/
├── bin/
│   └── cli.js                    ← CLI entry point (Commander.js)
├── src/
│   ├── commands/
│   │   ├── roster.js             ← Persona listeleme
│   │   ├── digest.js             ← Ofis özeti üretme
│   │   ├── consult.js            ← Persona ile danışma
│   │   ├── fire.js               ← Persona deaktivasyonu
│   │   ├── eval.js               ← JSON karşılaştırma skoru
│   │   └── persona-eval.js       ← Ses sadakati testi
│   └── lib/
│       ├── eval-engine.js        ← Rule-based eval motor
│       ├── eval-middleware.js     ← Backend ↔ eval köprüsü
│       └── correction.js         ← Correction loop (JSONL)
├── brains/
│   ├── personas/
│   │   ├── cvo/                  ← Mimar persona + eval-set/
│   │   ├── pm/                   ← PM persona + eval-set/
│   │   └── doer/                 ← İcracı persona + eval-set/
│   └── cofounder-office/
│       ├── config/office.yml     ← Office schema (roster, hierarchy, channels)
│       ├── decisions/            ← Karar memo'ları
│       ├── artifacts/            ← Üretilen çıktılar
│       └── backlog/              ← Görev listesi
├── cofounder-backend/
│   ├── server.js                 ← Express + Socket.io + AI providers
│   └── .env                      ← API keys
├── cofounder-dashboard/
│   ├── index.html                ← Dashboard UI
│   ├── main.js                   ← Frontend logic
│   └── style.css                 ← Dark mode styling
├── tests/
│   └── cli/
│       ├── smoke.test.js         ← 19 P0/P1 smoke test
│       └── integration.test.js   ← 11 integration test
├── PRD.md                        ← Product Requirements Document
├── IDEA.md                       ← Çekirdek fikir dokümanı
└── README.md                     ← Bu dosya
```

---

## 🔧 Teknoloji

| Katman | Teknoloji |
|---|---|
| CLI | Node.js + Commander.js |
| Backend | Express.js + Socket.io |
| Frontend | Vanilla JS + Vite |
| AI | Groq (Llama 3) → Gemini 2.0 → OpenRouter (fallback) |
| Test | Jest |
| Data | Markdown + YAML + JSONL |

---

## 📖 Daha Fazla

- [IDEA.md](./IDEA.md) — Çekirdek fikir ve mimari detaylar
- [PRD.md](./PRD.md) — Product Requirements Document
- [office.yml](./brains/cofounder-office/config/office.yml) — Office schema
