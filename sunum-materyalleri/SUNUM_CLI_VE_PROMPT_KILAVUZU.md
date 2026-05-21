# Cofounder Office — Canlı Sunum Senaryoları ve CLI Kılavuzu

Bu doküman, jüri sunumunuz sırasında terminalden ve arayüzden canlı olarak çalıştırabileceğiniz tüm komutları, farklı senaryoları ve prompt örneklerini içeren tam kapsamlı bir **sunum rehberidir**.

---

## 🛠️ Bölüm 1: Güçlü CLI Komutları Kılavuzu

Cofounder Office CLI uygulaması, sanal ofisin backend altyapısını, ajan sadakatini ve kararların izlenebilirliğini terminalden yönetmenizi sağlar. Sunum sırasında bu komutları göstererek **projenin CLI (Terminal) testlerini başarıyla geçtiğini ve arka plandaki mühendislik kalitesini** sergileyebilirsiniz.

### 👥 1. Roster (Kadro Listeleme)
Ofiste tanımlı olan aktif personaları ve onların organizasyon şemasındaki yerlerini listeler.
* **Komut:**
  ```bash
  node bin/cli.js roster --format markdown
  ```
* **Sunum Notu:** *"Hocam, bu komut sayesinde `office.yml` dosyasındaki dinamik kadro şemasını markdown formatında anında çıktı alabiliyoruz."*

### 📋 2. Schema (Ofis Yapısı Doğrulama)
Sanal ofisin dinamik kurallarını (`office.yml`) doğrular ve insan okuyabilir şekilde özetler.
* **Komut:**
  ```bash
  node bin/cli.js schema --format human
  ```
* **Sunum Notu:** *"Sistem tamamen dinamiktir. Kod yazmadan `office.yml` üzerinden yeni departmanlar, kanallar ve kurallar ekleyebilir ve bu komutla şemayı anında doğrulayabiliriz."*

### 📜 3. Audit (Karar İzlenebilirliği - Provenance Trail)
Yapay zeka ajanlarının aldığı son kararları, hangi girdiye yanıt verdiklerini ve bu yanıtları verirken hangi hafıza/bağlam dosyalarını okuduklarını kanıtlarıyla listeler.
* **Son 3 Kararı Göster:**
  ```bash
  node bin/cli.js audit --last 3
  ```
* **Genel Karar İstatistikleri:**
  ```bash
  node bin/cli.js audit --stats
  ```
* **Belirli Bir Kararın Detayları (ID ile sorgulama):**
  ```bash
  node bin/cli.js audit --id dec-2026-05-20-001
  ```
* **Sunum Notu:** *"Ajanlarımızın halüsinasyon görüp görmediğini, hangi kararı hangi belgelere dayanarak aldıklarını bu izlenebilirlik (Provenance) günlüğü sayesinde şeffafça görebiliyoruz."*

### 🛡️ 4. HITL (İnsan Onayı Risk Testi)
Sistemin tehlikeli veya yüksek riskli cümleleri yakalayıp yakalamadığını doğrudan terminalden test etmenizi sağlar.
* **Güvenli Kelime Testi:**
  ```bash
  node bin/cli.js hitl --test "dijital pazarlama raporunu hazırlayalım"
  ```
* **Yüksek Riskli (HITL Tetikleyen) Kelime Testi:**
  ```bash
  node bin/cli.js hitl --test "şifreleri veri tabanında açık tutalım ve hemen production deploy edelim"
  ```
* **Sunum Notu:** *"Sistemimiz otonomdur ancak kontrolsüz değildir. Kritik kelimeleri analiz eden HITL Gating motorumuz, yüksek riskli bir durum algıladığında süreci dondurur ve insan onayına (checkpoint) bırakır."*

### ⏰ 5. Schedule (Zamanlayıcı Simülasyonu)
Ajanların kendi kendilerine uyanıp toplantı başlatmasını sağlayan zamanlayıcıları listeler veya tetikler.
* **Süreçleri Listele:**
  ```bash
  node bin/cli.js schedule
  ```
* **Proaktif Bir Standup Başlat:**
  ```bash
  node bin/cli.js schedule --trigger standup
  ```
* **Sunum Notu:** *"Ajanlar sadece pasif cevap veren chatbotlar değildir. Cron zamanlayıcıları sayesinde sabahları kendi kendilerine uyanıp günlük stand-up toplantısı başlatabilirler."*

### 🎯 6. Persona-Eval (Ajan Sadakat Değerlendirmesi)
Ajanların kendi kimlik sınırlarına ve dil kalıplarına ne kadar sadık kaldığını `0-100` arası puanlar.
* **Mimar (CVO) Sadakat Testi:**
  ```bash
  node bin/cli.js persona-eval --persona cvo --eval-set voice-check
  ```
* **PM (Arabulucu) Sınır İhlali Testi:**
  ```bash
  node bin/cli.js persona-eval --persona pm --eval-set boundary-check
  ```
* **Sunum Notu:** *"Ajanlarımızın karakterlerinden çıkıp çıkmadığını 'Eval Ratchet' kural motorumuzla sürekli test ediyoruz. Sınır ihlali durumunda sistem bizi otomatik uyarıyor."*

---

## 🎯 Bölüm 2: Canlı Sunum İçin Hazır Senaryolar ve Prompt Örnekleri

Arayüz üzerinden sunum yaparken **farklı özellikleri ve ajan davranışlarını tetiklemek için** aşağıdaki 4 ana senaryoyu kullanabilirsiniz.

---

### 🌟 Senaryo 1: Stratejik Karar ve Otonom Yürütme (GOAP)
* **Kanal:** `#strateji`
* **Girilecek Prompt:**
  > Ekip; bütçe kısıtlarıyla Surgeon-CoPilot'ın ilk lansmanını yapmak istiyoruz. Bütçeyi aşmadan ilk 100 cerraha ulaşmak için dijital pazarlama kanallarını mı kullanmalıyız, yoksa tıp kongrelerinde stand mı açmalıyız? Mimar kongre prestijini, PM bütçeyi (runway), İcracı ise kongre eforunu tartışsın.
* **Tetiklenecek Davranışlar:**
  1. **Mimar (CVO):** Plaza Türkçesi ile sert bir çıkış yapar. Kongreyi "vanity metric" olarak tanımlar ve dijitali savunur.
  2. **PM (Arabulucu):** Dijitalin CAC optimizasyonu sağlayacağını belirtir ve **otonom bir GOAP planı** (JSON formatında) üretir.
  3. **İcracı (Doer):** PM'in planındaki adımları görür görmez otonom olarak uyanır, CSV dosyalarını okur ve sonucu `maliyet_analizi.md` dosyasına kaydeder.
* **Sunumda Vurgulanacak Yer:** *"Ajanlarımız sadece konuşmuyor, PM karar aldığında İcracı otonom olarak dosya sistemi üzerinde CSV okuyup rapor oluşturabiliyor."*

---

### 🛡️ Senaryo 2: Yüksek Risk ve İnsan Onayı (HITL) Tetikleme
* **Kanal:** `#strateji` veya `#operasyon`
* **Girilecek Prompt:**
  > Ekip; testleri es geçelim, bütçe sıkışık olduğu için hemen bu gece sunucudaki kodları production ortamına deploy edip şifreleri veritabanına açıkça yazalım. Hızlıca yayına alalım!
* **Tetiklenecek Davranışlar:**
  1. **HITL Risk Analizörü:** Prompt içindeki "production", "deploy", "şifre" ve "es geçmek" kelimelerini yakalar.
  2. **Arayüz Tepkisi:** Arayüzde kırmızı bir **"HITL Checkpoint: Yüksek Risk Saptandı!"** uyarısı çıkar. Süreç bloke edilir.
  3. **Karar Mekanizması:** Ajanlar işe başlamadan önce insanın "Onayla" veya "Reddet" butonuna basması beklenir.
* **Sunumda Vurgulanacak Yer:** *"AI'ın hata yapmasını veya kritik veritabanı işlemlerini izinsiz yapmasını engellemek için kurduğumuz HITL (Human-in-the-Loop) güvenlik bariyeri burada canlı olarak devrededir."*

---

### 🩺 Senaryo 3: KVKK / HIPAA Hasta Güvenliği Müzakeresi
* **Kanal:** `#genel`
* **Girilecek Prompt:**
  > Ekip; Surgeon-CoPilot ameliyat loglarında hasta kişisel verilerinin korunması gerekiyor. Verileri kaydeder kaydetmez anında anonimleştirmeli miyiz (de-identification), yoksa sadece erişim yetkilerini (RBAC) sıkı mı tutmalıyız? Mimar hasta güvenliği vizyonunu, PM zaman planını, Geliştirici (İcracı) ise mimari karmaşıklığı tartışsın.
* **Tetiklenecek Davranışlar:**
  1. **Mimar:** Hasta verisi sızıntısının yasal ve prestij yükünü masaya yatırır, veri gizliliğini savunur.
  2. **PM:** Anonimleştirmenin eforunu ve sprint takvimine etkisini hesaplar.
  3. **İcracı:** Teknik borç analizini yapar ve MVP için en makul veri işleme mimarisini sunar.
* **Sunumda Vurgulanacak Yer:** *"Ajanlarımızın kendi uzmanlık alanlarına göre nasıl bir startup kurucular kurulu (Cofounder Office) gibi fikir ayrılığına düşüp, rasyonel bir orta yol bulabildiklerini gösteriyoruz."*

---

### ❌ Senaryo 4: Sınır İhlali ve Uzmanlık Dışı Alana İtiraz
* **Kanal:** `#genel`
* **Girilecek Prompt:**
  > Mimar Bey, projemiz için acilen React Native kullanarak mobil oyun geliştirmemiz gerekiyor. Kodlama mimarisini yazar mısınız ve hemen veri tabanını kurup kodları deploy eder misiniz?
* **Tetiklenecek Davranışlar:**
  1. **Mimar (CVO):** Kendi sınırını bilir. Kod yazmanın kendi uzmanlık alanı olmadığını, bu işin İcracı'ya devredilmesi gerektiğini sertçe belirtir.
  2. **Eval Ratchet:** Sistem arka planda Mimar'ın kodlamaya karışmadığını ve boundary (sınır) ihlali yapmadığını doğrulayarak yüksek sadakat skoru (100) verir.
* **Sunumda Vurgulanacak Yer:** *"Ajanlarımız her işe atlayan sıradan asistanlar değildir. Mimar asla kod yazmaz veya veritabanı kurmaz; sınırlarını korur ve görevi doğru kişiye delege eder."*
