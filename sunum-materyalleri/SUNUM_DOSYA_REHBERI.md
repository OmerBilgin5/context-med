# 🗺️ Cofounder-Office Sunum & Dosya Bulucu Rehberi

Hocanın sunum esnasında **"Bana şu özelliğin kodunu aç/göster"** veya **"Ajanların kuralları nerede yazıyor?"** gibi sorularına saniyeler içinde cevap verebilmen için hazırlanmış hızlı dosya haritasıdır.

---

## 🚀 1. Hızlı Arama: Hocanın En Çok Sorabileceği Dosyalar

| Hoca Ne Sorabilir? | Açman Gereken Dosya Yolu | Dosyanın İşlevi |
| :--- | :--- | :--- |
| **"Ajanların kişilik kuralları, dilleri ve kırmızı çizgileri nerede?"** | `packages/cofounder-office/brains/personas/{persona}/persona.md` ve `work.md` | Ajanların (CVO, PM, Doer) kişilik DNA'sı, ifade kuralları ve uzmanlık tanımları burada yaşar. |
| **"Persona ses sadakati (Voice-Check) test case'leri nerede?"** | `packages/cofounder-office/brains/personas/{persona}/eval-set/voice-check.json` | Her persona'nın kendi karakterini koruyup korumadığını denetleyen otomatik test kuralları. |
| **"Ofisin hiyerarşisi, kanalları ve HITL politikası nerede tanımlı?"** | [office.yml](file:///d:/Things/Prompt-Vize/Final/context-med/packages/cofounder-office/brains/cofounder-office/config/office.yml) | Sanal ofisin tüm çalışma kurallarını belirleyen deklaratif şema dosyası. |
| **"Ajanlar arası müzakere (Council) ve Socket.io backend'i nerede?"** | [server.js](file:///d:/Things/Prompt-Vize/Final/context-med/packages/cofounder-office/cofounder-backend/server.js) | Backend sunucusu. Tüm Socket.io kanalları, ajan tetikleyicileri ve AI çağrıları buradadır. |
| **"HITL (İnsan Onayı) güvenlik mekanizmasını nereye yazdın?"** | [hitl-engine.js](file:///d:/Things/Prompt-Vize/Final/context-med/packages/cofounder-office/src/lib/hitl-engine.js) | Yüksek riskli kararları yakalayıp dashboard'da kullanıcı onayına sunan motor. |
| **"API limit aşımı (429) veya çökme durumundaki sigorta nerede?"** | [server.js](file:///d:/Things/Prompt-Vize/Final/context-med/packages/cofounder-office/cofounder-backend/server.js#L75-L120) *(Fallback modülü)* | Gemini veya Groq çöktüğünde devreye giren otomatik "simülasyon" sigortası. |
| **"Her kararın hangi verilerle alındığını (Provenance) nasıl izliyorsun?"** | [provenance.js](file:///d:/Things/Prompt-Vize/Final/context-med/packages/cofounder-office/src/lib/provenance.js) | Kararların arkasındaki dosya yollarını, model bilgisini ve zaman damgasını grafiksel olarak bağlayan motor. |
| **"Kullanıcı geri bildirimleriyle ajanların evrilmesini sağlayan kod nerede?"** | [correction.js](file:///d:/Things/Prompt-Vize/Final/context-med/packages/cofounder-office/src/lib/correction.js) | "O böyle demez" düzeltmelerini toplayan ve LLM prompt'una enjekte eden sistem. |
| **"Otomatik ses sadakati denetimi (Eval Ratchet) nasıl çalışıyor?"** | [eval-engine.js](file:///d:/Things/Prompt-Vize/Final/context-med/packages/cofounder-office/src/lib/eval-engine.js) | Üretilen yanıtları `voice-check.json` ile tarayıp puanlayan rule-based eval motoru. |
| **"Kullanıcı arayüzü (Dashboard) kodları nerede?"** | `packages/cofounder-office/cofounder-dashboard/` altındaki `index.html`, `main.js`, `style.css` | Real-time kanalları, Kanban tahtasını ve terminali gösteren modern arayüz. |

---

## 📁 2. Proje Klasör Yapısı ve Haritası

```
packages/cofounder-office/
├── brains/                                ← BİLGİ VE KİŞİLİK DEPOSU (SUBSTRATE)
│   ├── personas/
│   │   ├── cvo/ (Mimar)                   ← Mimar Ajanının Hafızası
│   │   │   ├── persona.md                 ← Karar kuralları ve ifade tarzı
│   │   │   ├── work.md                    ← Sorumluluk alanı ve kırmızı çizgiler
│   │   │   ├── correction-log.md          ← Kullanıcıdan aldığı lokal düzeltmeler
│   │   │   ├── tracks/                    ← 6 Boyutlu Distilasyon Kayıtları (Expression, Decisions vb.)
│   │   │   └── eval-set/                  ← Otomatik Ses ve Sınır Denetim Testleri
│   │   ├── pm/ (Arabulucu)                ← Arabulucu (PM) Ajanının Hafızası
│   │   └── doer/ (İcracı)                 ← İcracı (Doer) Ajanının Hafızası
│   └── cofounder-office/
│       ├── config/office.yml              ← Ofis hiyerarşi ve kanal kuralları (DSL)
│       └── decisions/                     ← Alınan kararların kaydedildiği yer
│
├── src/                                   ← SİSTEM MOTORLARI VE CLI
│   ├── commands/                          ← CLI Komutları (roster, digest, consult, persona-eval)
│   └── lib/
│       ├── schema-loader.js               ← office.yml şemasını parse/validate eden kod
│       ├── scheduler.js                   ← Zamanlanmış görevlerin (cron) motoru
│       ├── provenance.js                  ← Karar geri izlenebilirlik motoru
│       ├── hitl-engine.js                 ← İnsan onayı denetim motoru
│       ├── eval-engine.js                 ← Ses sadakati test motoru
│       └── correction.js                  ← Kullanıcı düzeltme döngüsü motoru
│
├── cofounder-backend/                     ← REAL-TIME APIS & AI SUNUCUSU
│   ├── server.js                          ← Express + Socket.io + AI Fallback Zinciri
│   └── .env                               ← API Anahtarları (.env.example şablonu)
│
└── cofounder-dashboard/                   ← KULLANICI ARAYÜZÜ (DASHBOARD)
    ├── index.html                         ← Dashboard HTML iskeleti
    ├── main.js                            ← Frontend Socket.io ve Kanban mantığı
    └── style.css                          ← Gözü yormayan Slate & Sapphire koyu mod CSS'i
```

---

## 💡 3. Hoca Sorarsa Ne Cevap Vermelisin? (Quick FAQ)

### 💬 Soru 1: "Neden projede bu kadar çok alt paket var (Packages altında 20+ klasör)?"
> **Cevap:** *"Hocam, projemiz modüler bir **Monorepo** mimarisine sahiptir. Her bir paket (`context-core`, `context-wiki`, `context-hoop`) bağımsız birer mikro-servis veya kütüphane gibi tasarlanmıştır. Bu sayede projenin medikal analiz modülleri ile sanal ofis yönetim modülünü (`cofounder-office`) birbirini bozmayacak şekilde tamamen izole ve ölçeklenebilir şekilde geliştirdik."*

### 💬 Soru 2: "Cofounder-Office'in sıradan çoklu chatbot sistemlerinden farkı nedir?"
> **Cevap:** *"Sıradan sistemlerde yapay zekaya sadece 'Sen PM gibi davran' denir ve bu geçici bir role-play'dir. Bizim sistemimizde ise her ajanın **6-Track Distilasyon Hafızası** vardır. Kendilerine has ifade DNA'ları, karar şemaları ve kırmızı çizgileri kalıcı Markdown dosyalarından okunur. Ayrıca her ajanın ses sadakati otomatik **Eval Ratchet** testleriyle sürekli denetlenir. En önemlisi, kararların arkasındaki veri izlenebilirliği (Provenance) ve yüksek riskli işlemlerde insan onayını şart koşan **HITL (Human-in-the-loop) Güvenlik Katmanı** mevcuttur."*

### 💬 Soru 3: "Sistemin karar alma sürecinde insanı tamamen devre dışı mı bırakıyorsunuz?"
> **Cevap:** *"Hayır hocam. Amacımız insanı devreden çıkarmak değil, solopreneur'ün üzerindeki rol değiştirme (context-switching) yükünü azaltmaktır. Ajanlar kendi aralarında müzakere eder, planı hazırlar ve taslağı çıkarır. Ancak `office.yml` dosyasında tanımlanan kritik kararlar (örn: kod dağıtımı, mali etki) tetiklendiğinde sistem durur ve kullanıcı onay vermeden (`HITL Checkpoint`) hiçbir işlem yapmaz."*
