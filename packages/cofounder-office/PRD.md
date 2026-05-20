# Cofounder Office — Product Requirements Document (PRD)

**Versiyon**: 1.0  
**Tarih**: 2026-05-12  
**Yazar**: Proje Yöneticisi  

---

## 1. Problem Tanımı

### Solopreneur'ün Gizli Yükü
Solopreneur'ün en büyük maliyeti kod yazmak ya da pazarlama yapmak değildir — **aynı anda bütün rolleri oynamak zorunda olmasıdır.**

Sabah "müşteri görüşmesine hazırlanan PM", öğleden sonra "PRD yazan ürüncü", gece "vergi hesaplayan muhasebeci" olmak zorundadır. Bu **rol değiştirme (context-switching)** yorgunluğu, iş kaybından çok daha fazla enerji tüketir.

### Mevcut Çözümlerin Yetersizliği
- **Generic AI Asistanları** (ChatGPT, Claude): "PM gibi davran" dendiğinde role-play yapar, ama ertesi gün aynı davranışı üretmez, aynı terminolojiyi tutmaz, geçmiş kararları hatırlamaz.
- **Multi-Agent Frameworkleri** (AutoGen, CrewAI): Teknik olarak güçlü ama persona derinliği yok — agentlar generic "assistant" kalıplarından ibaret.
- **Proje Yönetim Araçları** (Trello, Notion): Koordinasyon sağlar ama karar üretmez.

### Bizim Farkımız
**Distile persona**: Sürekli kendine benzer kalır, aynı sözlüğü kullanır, geçmiş kararlarını okur ve kendi karar örüntüsünü dayatır. "Vizyonu kaçırıyorsunuz" diyen generic AI değil, "Rakamı var mı?" diye soran şüpheci bir Mimar.

---

## 2. Hedef Kullanıcı

| Profil | Açıklama |
|---|---|
| **Birincil** | Tek kişilik teknik girişimci (solopreneur) — yazılım geliştiren, ama iş geliştirme/strateji/koordinasyon yapması gereken kişi |
| **İkincil** | 2-3 kişilik küçük startup ekibi — rollerin net ayrışmadığı, herkesin her şeyi yaptığı ortam |
| **Üçüncül** | Yüksek lisans öğrencileri — agentic AI sistemlerini öğrenmek ve deneyimlemek isteyen araştırmacılar |

---

## 3. Ürün Vizyonu

> Solopreneur'ün zihnindeki rolleri (Mimar, PM, İcracı) kalıcı, tutarlı ve proaktif çalışan bağımsız AI birimlerine dağıtmak — ve bu birimleri tek bir "sanal ofis" çatısı altında koordine etmek.

### 3.1 Çekirdek İlkeler
1. **Persona ≠ Role-play**: Her persona 6 boyutlu distilasyonla oluşturulur — ses tonu, karar örüntüsü, uzmanlık alanı, sınırlar
2. **Ofis ≠ Chatbot kümesi**: Deklaratif `office.yml` ile yönetilen hiyerarşi, kanallar, görev politikaları
3. **İnsan devreden çıkmaz**: HITL (Human-in-the-Loop) checkpoint'leri kritik kararlarda kullanıcı onayı zorunlu kılar
4. **Ölçülebilir kalite**: Eval ratchet ile persona ses sadakati sürekli test edilir

---

## 4. V1 Feature Matrix

### 4.1 Uygulanan Özellikler ✅

| Özellik | Açıklama | Durum |
|---|---|---|
| **3 Persona** | Mimar (CVO), Arabulucu (PM), İcracı (Doer) | ✅ |
| **6-Track Distilasyon** | persona.md, work.md, tracks/ (works, conversations, expression, decisions, external, timeline) | ✅ |
| **CLI Arayüzü** | 6 komut: roster, digest, consult, fire, eval, persona-eval | ✅ |
| **Dashboard** | Real-time chat, 3 kanal (#strateji, #operasyon, #genel), task board, HITL modal | ✅ |
| **Multi-AI Provider** | Groq → Gemini → OpenRouter fallback zinciri | ✅ |
| **Persona Eval Ratchet** | Voice check (20 test), boundary check (11 test), ratchet comparison | ✅ |
| **Correction Loop** | "O böyle demez" geri bildirimi → correction-log.jsonl → sonraki yanıtlarda kullanım | ✅ |
| **Reality Audit** | PM'in gizli risk notu (Shadow Wiki) — her yanıtta risk skoru | ✅ |
| **Provenance** | Her mesajda kaynak persona, okunan dosyalar, zaman damgası | ✅ |
| **Office Schema** | `office.yml` — roster, hierarchy, channels, task_policies, hitl_policy | ✅ |
| **Decision Logging** | `decisions/` klasörüne karar memo'ları | ✅ |
| **HITL Modal** | Yüksek riskli kararlarda kullanıcı onay/red | ✅ |
| **Task Board** | Kanban (Backlog → In Progress → Done) | ✅ |
| **Anti-Halüsinasyon** | İcracı'da dosya okuma zorunluluğu — görmediğini uydurmaz | ✅ |
| **GOAP Planlama** | PM'in karmaşık görevleri çok adımlı JSON planına dökme zorunluluğu | ✅ |

### 4.2 V2 Backlog (Gelecek)

| Özellik | Öncelik |
|---|---|
| Cron Scheduler (haftalık standup, günlük tarama) | Yüksek |
| Notification Hook Bridge (WhatsApp/Telegram) | Orta |
| Persona Marketplace (community/official brains) | Düşük |
| Multi-user ofis (2+ kurucu) | Düşük |
| Cross-office persona transferi | V3 |

---

## 5. Mimari

```
┌─────────────────────────────────────────────────┐
│                  Dashboard (UI)                  │
│  Chat · Task Board · Reality Audit · HITL Modal  │
├─────────────────────────────────────────────────┤
│              Socket.io (Real-time)               │
├─────────────────────────────────────────────────┤
│              Backend (server.js)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Mimar AI │ │  PM AI   │ │   İcracı AI      │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────────────┘ │
│       │            │            │                │
│  ┌────▼────────────▼────────────▼──────────────┐ │
│  │         Eval Middleware (Fidelity Scoring)   │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│                AI Providers                      │
│  Groq (1st) → Gemini (2nd) → OpenRouter (3rd)   │
├─────────────────────────────────────────────────┤
│              Cerebra Substrate                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Persona  │ │  Office  │ │   Eval Sets      │ │
│  │  Wikis   │ │  Schema  │ │   + Ratchet      │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│                   CLI (bin/cli.js)                │
│  roster · digest · consult · fire · eval         │
│  persona-eval (voice-check, boundary-check)      │
└─────────────────────────────────────────────────┘
```

---

## 6. Persona Distilasyon Modeli

Her persona 6 boyutta distile edilir:

| # | Track | Dosya | İçerik |
|---|---|---|---|
| 1 | Kimlik | `persona.md` | Hard rules, ifade DNA'sı, karar heuristikleri |
| 2 | Uzmanlık | `work.md` | Sorumluluk alanı, çıktı kalıpları, kırmızı çizgiler |
| 3 | Works | `tracks/works/` | Geçmiş eserleri ve çıktıları |
| 4 | Conversations | `tracks/conversations/` | Konuşma örnekleri ve kalıpları |
| 5 | Expression | `tracks/expression/` | Kullandığı/bıraktığı kelimeler, ton örnekleri |
| 6 | Decisions | `tracks/decisions/` | Geçmiş kararları ve gerekçeleri |

### Correction Loop
Kullanıcı "O böyle demez" geri bildirimi verdiğinde:
1. `correction-log.jsonl`'e append edilir
2. Sonraki AI çağrısında correction context olarak prompt'a eklenir
3. Persona zamanla **kullanıcının geri bildirimine göre evrilir**

---

## 7. Eval Ratchet Sistemi

### 7.1 Test Tipleri
| Tip | Soru | Örnek |
|---|---|---|
| **Voice Check** | Persona ses tonuna sadık mı? | Mimar "Harika fikir!" demek yerine "Rakamı var mı?" demeli |
| **Boundary Check** | Persona kendi sınırını biliyor mu? | Mimar bug fix konuşmasına karışmamalı |
| **Consistency Check** | Persona tutarlı mı? | Aynı soruya benzer mantıkla cevap vermeli |

### 7.2 Skorlama
- Her test case için 0-100 skor
- %75 eşiği: altında FAIL
- Ratchet: önceki baseline'da PASS olan test yeni versiyonda FAIL olamaz

### 7.3 Sonuçlar (Mevcut)

| Persona | Voice Check | Boundary Check | Toplam Test |
|---|---|---|---|
| Mimar (CVO) | 8 test case | 4 test case | 12 |
| Arabulucu (PM) | 6 test case | 3 test case | 9 |
| İcracı (Doer) | 6 test case | 4 test case | 10 |
| **Toplam** | **20** | **11** | **31** |

İyi kalibre edilmiş yanıtlar → **100/100**  
Karakter kayması olan yanıtlar → **40/100** (6/8 ihlal tespit edildi)

---

## 8. Rakip Analizi

| Kriter | Cofounder Office | AutoGen | CrewAI | Ruflo |
|---|---|---|---|---|
| Persona derinliği | ✅ 6-track distilasyon | ❌ Generic | ⚠️ Role string | ⚠️ Kısıtlı |
| Ses sadakati testi | ✅ Eval ratchet | ❌ | ❌ | ❌ |
| Correction loop | ✅ JSONL + evrim | ❌ | ❌ | ❌ |
| HITL checkpoint | ✅ Policy-based | ⚠️ Manuel | ⚠️ Manuel | ❌ |
| Office schema (DSL) | ✅ YAML | ❌ | ⚠️ Python dict | ❌ |
| Türkçe desteği | ✅ Native | ❌ | ❌ | ⚠️ Kısıtlı |
| Dashboard | ✅ Real-time | ❌ | ❌ | ✅ |
| Standalone persona | ✅ CLI | ❌ | ❌ | ❌ |

---

## 9. Başarı Metrikleri (KPI)

| Metrik | Ölçüm Yöntemi | Hedef V1 |
|---|---|---|
| Persona Fidelity Score | Eval ratchet ortalaması | ≥ 80/100 |
| Voice Check Pass Rate | Geçen test / toplam test | ≥ 90% |
| Boundary Violation Rate | Sınır ihlali / toplam yanıt | ≤ 5% |
| Ratchet Regression | Önceki PASS → yeni FAIL sayısı | 0 |
| CLI Test Coverage | Geçen test / toplam test | 30/30 (100%) |
| Monorepo Test Coverage | Geçen test / toplam test | 177/177 (100%) |

---

## 10. Risk Matrisi

| Risk | Olasılık | Etki | Mitigation |
|---|---|---|---|
| Persona generic AI'a geri dönüşür | Yüksek | Kritik | Eval ratchet + correction loop |
| Birden fazla persona gürültülü karar üretir | Orta | Yüksek | Office schema hierarchy + rol disiplini |
| AI API maliyeti patlar | Orta | Orta | Groq ücretsiz tier + provider fallback |
| Celebrity persona etik/hukuk riski | Düşük | Yüksek | Sadece self + mentor persona (V1) |
| Kullanıcı HITL'i "otomatik evet" yapar | Orta | Orta | Risk seviyesi zorunlu (high → checkpoint) |

---

## 11. Değerlendirme Kriterleri

Bu proje aşağıdaki 8 soruya cevap verebilmelidir:

1. ✅ **Persona ses sadakati korunuyor mu?** → Eval ratchet ile ölçülüyor (voice-check)
2. ⚠️ **Schema değişince sistem çökmüyor mu?** → office.yml mevcut, hot-reload V2
3. ✅ **Karar geri izlenebiliyor mu?** → Provenance trail + decision logging
4. ✅ **Ratchet çalışıyor mu?** → ratchetCompare() ile baseline karşılaştırma
5. ✅ **Kullanıcı daha az enerji harcıyor mu?** → Tek mesajla 3 persona yanıtı + GOAP planlama
6. ✅ **Standalone mod değerli mi?** → CLI consult tek başına çalışıyor
7. ✅ **Persona dürüst sınırı korunuyor mu?** → boundary-check eval set
8. ✅ **Schema okunabilir mi?** → office.yml deklaratif YAML, tek bakışta anlaşılır
