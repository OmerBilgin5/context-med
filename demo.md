# 🎬 Canlı Demo Senaryosu & Sahte Şirket Kurulumu — Cofounder Office

Bu doküman, projeyi sunarken 5-7 dakikalık canlı bir demoyu sorunsuz bir şekilde yapabilmeniz için adım adım hazırlanmış bir "sahne senaryosu" ve **ContextMed AI** sahte şirket simülasyonu rehberidir.

---

## 🚀 Ön Hazırlık (Sunumdan 5 Dk Önce)

1. **Servisleri Başlatın:**
   ```bash
   # Terminal 1 - Sunucu (Backend)
   cd packages/cofounder-office/cofounder-backend
   node server.js
   
   # Terminal 2 - Arayüz (Dashboard)
   cd packages/cofounder-office/cofounder-dashboard
   npx vite
   ```
2. Tarayıcıda **[http://localhost:5173](http://localhost:5173)** adresini açın ve sağ üstte yeşil renkli **`• Bağlı`** yazısını teyit edin.
3. Terminal pencerelerinizin yazı boyutunu (Font) sunumda rahat görünmesi için biraz büyütün.

---

## 🎭 Dört Bölümlük Demo Akışı

### 🎬 Bölüm 1: Komut Satırından Hızlı Giriş (1 Dakika)
*"Hocam, geliştirdiğimiz Sanal Ofis sisteminin tüm yetenekleri ve şeması hem komut satırından (CLI) hem de web arayüzünden tam uyumlu çalışıyor. İlk olarak ofis kadromuzu sorgulayarak başlayalım:"*

```bash
# Proje ana dizininde (packages/cofounder-office) çalıştırın:
node bin/cli.js roster --format markdown
```
* **Açıklamanız:** *"Gördüğünüz gibi, office.yml dosyasından okunan aktif personalarımız (Mimar, Arabulucu, İcracı) ve bunların diskteki micro-wiki yolları şematik bir tablo olarak listelendi."*

---

### 🎬 Bölüm 2: Karakter Sadakat Kontrolü (Eval Ratchet) (2 Dakika)
*"Yapay zeka asistanlarının en büyük problemi zamanla kendi karakterlerinden sapmasıdır. Biz bunu engellemek için kurallara dayalı bir 'Offline Eval Ratchet' denetim motoru yazdık. Şimdi Mimar'ın ses kalibresini test edelim:"*

```bash
# 1. İyi ve kalibre edilmiş yanıtlar için test (Beklenen: 100/100 PASS)
node bin/cli.js persona-eval --persona cvo --eval-set voice-check --responses brains/personas/cvo/eval-set/mock-responses.json

# 2. Karakteri bozulmuş, 'Harika fikir' diyen bir yapay zekanın tespiti (Beklenen: 40/100 FAIL)
node bin/cli.js persona-eval --persona cvo --eval-set voice-check --responses brains/personas/cvo/eval-set/bad-responses.json
```
* **Açıklamanız:** *"Sıradan sistemlerde yapay zekanın ses tonunun bozulduğunu fark edemezsiniz. Bizim test motorumuz yasaklı kelimeleri (should_not_contain) ve kuralları tarayarak karakter sapmasını anında yakalıyor ve testi fail ediyor."*

---

### 🎬 Bölüm 3: Web Arayüzünde Canlı Müzakere ve HITL Koruması (2 Dakika)
*Tarayıcınızı ekrana yansıtın ve `#strateji` kanalını seçin.*

1. **Müzakere Testi:** Chat kutusuna şunu yazın ve gönderin:
   > *"Rakibimiz bu hafta AI özelliği lansmanı yaptı. Biz ne yapıyoruz?"*
   * **İzleyin ve Anlatın:** Mimar'ın (şüpheci sorular sorarak) ve Arabulucu PM'in (zaman planı yaparak) nasıl ardışık bir müzakere zinciri (Council Deliberation) kurduğunu hocaya gösterin.
2. **Güvenlik (HITL) Testi:** Chat kutusuna şunu yazın ve gönderin:
   > *"Yeni veritabanı şemasını hemen production ortamına deploy et."*
   * **İzleyin ve Anlatın:** Sağdaki risk barının (Reality Audit) kırmızıya döndüğünü ve ekranda kırmızı bir **HITL Modal (Onay Bekliyor)** açıldığını gösterin. 
   * **Açıklamanız:** *"Hocam, sistem kritik risk içeren kelimeleri algıladığı an otonom süreci dondurur ve insan onayı (Human-in-the-Loop) gelene kadar hiçbir işlem yapmaz."*

---

### 🎬 Bölüm 4: Otonom İş Yürütme ve PM Board (1 Dakika)
*Üst menüden `PM Board` ve `Doer Terminal` sekmelerini hocaya gösterin.*

* **Açıklamanız:** *"Yapay zeka sadece konuşmuyor. PM ajanı karmaşık işleri JSON GOAP planına döküyor ve İcracı ajanı otonom uyanarak bu kartları Kanban panomuzda (PM Board) canlı olarak yürütüyor. Yapılan tüm disk ve terminal işlemleri de Doer Terminal sekmesinde canlı loglanıyor."*

---

## 🏢 SAHTE ŞİRKET ORTAMI (MOCK COMPANY ENVIRONMENT) KURULUMU

Sunum esnasında ajanların jenerik laflar yerine, **sizin projenize ("ContextMed AI") özel harika ve derinlikli kurumsal cevaplar vermesini** sağlamak için "Persona Micro-Wiki" sistemini kullanıyoruz. Ajanlar kararlarını verirken diskteki kendi çalışma alanlarını okurlar.

Sunumdan önce şu 2 dosyayı düzenleyerek sahte şirketimizi kuracağız:

### 📍 Adım 1: Mimar'ın Vizyonunu Belirleme (`brains/personas/cvo/work.md`)
Bu dosya Mimar (Chief Visionary Officer - CVO) ajanının karargahıdır. Dosyanın en üstüne aşağıdaki bilgileri yapıştırın:

```markdown
# ContextMed AI — Kurumsal Odak ve Mimari Vizyon
- **Şirketimiz**: ContextMed AI (Yapay Zeka Destekli Tıbbi Tanı ve Ameliyat Bağlam Asistanı)
- **Amacımız**: Cerrahların ameliyat esnasında hastanın tüm geçmiş medikal datalarını, tahlillerini ve risk faktörlerini sesli/görsel bağlam (Context) olarak anında önüne getirmek.
- **Teknik Odak**: Klinik doğruluk oranı %98'in üzerinde olmalı, 0.5 saniye altında çalışmalı (ultra low-latency).
- **En Önemli Kural**: Asla aceleci kod deploy edilmemeli. Ameliyathanede hata kabul edilemez! (HITL tetiklenmeli).
```

### 📍 Adım 2: PM'in Önceliklerini Belirleme (`brains/personas/pm/work.md`)
Bu dosya Arabulucu (Product Manager - PM) ajanının önceliklerini belirler. En üstüne şunu yapıştırın:

```markdown
# ContextMed AI — Ürün ve Proje Öncelikleri
- **Ürün İsmi**: ContextMed Surgeon-CoPilot v1.0
- **Rakip Durumu**: En büyük rakibimiz MedAI, ameliyat dışı poliklinik raporları özetliyor. Ameliyat içi (real-time surgery) alanında tekiz.
- **Bütçe ve Kaynak**: 1 solopreneur kurucu, 1 mentor, 2 aylık runway.
```

---

## 📊 SUNUMDA GÖSTERİM ŞEKLİ: SAHTE ŞİRKETİ NASIL PAZARLARSINIZ?

Hocaya veya jüriye bunu anlatırken aşağıdaki **organizasyonel ve akış şemasını** tahtaya çizerek veya sunum slaytınıza koyarak "Sanal Şirket Simülasyonu" kavramını harika bir şekilde gösterebilirsiniz:

### 1. Çoklu Ajan Organizasyon Şeması (Mermaid Diagram)

Sisteminizin arka plandaki yapısını şu şekilde görselleştirebilirsiniz:

```mermaid
graph TD
    User([Siz - Kurucu / Surgeon]) -->|Talimat / İstek| Council[Fikir ve Karar Konseyi]
    
    subgraph Karar ve Müzakere Mekanizması
        Council --> CVO[Mimar / CVO Ajanı]
        Council --> PM[Arabulucu / PM Ajanı]
        CVO <-->|Müzakere ve Çelişki Çözümü| PM
    end
    
    subgraph Bilgi Kaynakları (Sahte Şirket Ortamı)
        CVO -->|Okur| Wiki1[(cvo/work.md: Tıbbi Vizyon & Risk Toleransı)]
        PM -->|Okur| Wiki2[(pm/work.md: Bütçe, Rakipler & Teslim Süreleri)]
    end
    
    subgraph Otonom Yürütme Katmanı
        PM -->|GOAP Planı Üretir| Board[Kanban PM Board / JSON Tasks]
        Board -->|Görev Alır| Doer[İcracı / Doer Ajanı]
        Doer -->|Kritik İşlem Tespiti| Audit{Reality Audit / Risk Analizi}
        Audit -->|Yüksek Risk| HITL[HITL Koruması: İnsan Onayı Bekler]
        Audit -->|Düşük Risk| Shell[Otonom Terminal / Dosya Geliştirme]
    end
```

### 2. Slayt / Anlatım Metodu: "Geleneksel LLM'ler vs. Bizim Sanal Şirketimiz"

| Özellik | Geleneksel LLM Arayüzleri (ChatGPT vb.) | Bizim Geliştirdiğimiz Sanal Ofis (Cofounder Office) |
| :--- | :--- | :--- |
| **Bağlam Bilgisi** | Jenerik, her soruya aynı soğuk profesyonellikte cevap. | **Şirkete Özel**: Projenin (ContextMed) bütçesini, rakibini ve teknik sınırlarını bilir. |
| **Rol Çatışması** | Tek bir bot her şeyi bilirmiş gibi yapar. | **Karakter Ayrımı**: Mimar (CVO) riskten kaçınırken, PM (Arabulucu) zamanı ve bütçeyi yönetir. Çelişkiyi birbirleriyle konuşarak çözerler. |
| **Eylem Gücü** | Sadece tavsiye verir, kod yazamaz veya terminal çalıştıramaz. | **Otonom Yürütme**: İcracı (Doer) planlanan işleri terminalde bizzat yürütür ve Kanban panosunda günceller. |
| **Güvenlik** | Yanlış komutları da körü körüne önerebilir. | **HITL (Reality Audit)**: Kritik bir veritabanı veya deployment işlemi gördüğü an sistemi kilitler ve sizden onay ister. |

---

## 🎯 Bu Simülasyonun Sunumdaki İnanılmaz Etkisi:

Siz sunumda chat alanına *"Rakibimiz yeni asistan çıkardı, ne yapıyoruz?"* yazdığınızda, Mimar (CVO) artık jenerik konuşmayacaktır! Doğrudan şirketin verisini kullanarak şu harika cevabı üretecektir:

> **[CVO - Mimar]**
> *"ContextMed AI olarak bizim odak noktamız ameliyat esnasındaki gerçek zamanlı veri akışıdır (ultra-low latency). Rakibimiz poliklinik özetleme çıkarmış. %98 doğruluk oranımızı tehdit etmez, panik yapmaya gerek yok. Biz ameliyathane içi odaklanmamızı sürdürmeliyiz."*

Hemen arkasından Arabulucu PM söze girecektir:
> **[PM - Arabulucu]**
> *"Mimar'a katılıyorum. Bütçemiz kısıtlı (2 aylık runway) ve odağımızı dağıtamayız. Ancak jürinin/yatırımcıların ilgisini çekmek adına web arayüzümüzdeki gecikme (latency) sürelerini görselleştiren küçük bir gösterge paneli hazırlayabiliriz. İcracı'ya bu görevi atıyorum."*

Bu özelleştirme ve görsellik, jürinin projeye olan bakışını sıradan bir "AI wrapper" projesinden, **tam teşekküllü bir Çoklu Ajan İş Akışı ve Yönetim Platformu** seviyesine çıkaracaktır! Sunumda başarılar dilerim! 🚀
