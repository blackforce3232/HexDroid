# HexDroid Mesaj Gecikmesi Araştırması

## İlk optimizasyon paketi — cihaz doğrulaması bekleniyor

12 Ekim cihaz kayıtlarında canlı mesaj işleme ortalaması yaklaşık 1 ms iken kuyruk
beklemesi 29 saniye ortalamaya, 30,5 saniye maksimuma ulaştı. Nick listesi
oluşturma/sıralama süresi 10 saniyelik pencerelerde yaklaşık 5–6 saniyeydi.
Bu duvar saati ölçümüdür, CPU yüzdesi değildir. Aktif kullanıcı scripti yoktu.

Uygulanan değişiklikler:

- Sıralama anahtarları karşılaştırma başına değil, farklı gösterim başına bir kez
  hesaplanıyor. Aynı rank/casefold hesapları, tekrar temizleme ve kararlı sıralama
  korunuyor. Kalıcı önbellek yok; sunucunun yetki/harf eşleme kuralları her çağrıda okunur.
- NAMES tamamlanınca zaten oluşturulup yayımlanmış liste yeniden sıralanmadan döndürülüyor.
- Nick değişiminde yalnız taşınan üyeliğin bulunduğu kanallar ve henüz ekran listesi
  olmayan üyelik tabloları yeniden oluşturuluyor. Yetki taşıma mantığı değişmedi.
- QUIT sırasında üyelik kaldırma ve AGE çağrıları korunuyor; üye bulunmayan,
  ekran listesinde de ilgili nick olmayan kanallar tekrar sıralanmıyor.
- Olay kuyruğu, Main üzerinde sıralı işleme, geçmiş olay korumaları, kick/mod işlemesi,
  metadata ve özel sohbet işlemleri değiştirilmedi. Zamanlayıcılı liste yenileme yok.

Yeni [NickListOrderingTest.kt](app/src/test/java/com/boxlabs/hexdroid/NickListOrderingTest.kt)
testleri eski karşılaştırıcıyla farklı PREFIX/CASEMAPPING kurallarında aynı sonucu,
eşit anahtarlarda kararlılığı ve anahtarların bir kez hesaplanmasını denetler.
Liste girdileriyle yetki/nick/üyelik değişimi ve boş liste durumları da kapsanır.
Bu testler tam ViewModel olay entegrasyonu testi değildir; çoklu ağ, geçmiş olayları,
AGE ve yeniden bağlanma yan etkileri için cihaz doğrulaması hâlâ gereklidir.
Yerel JVM testleri çalıştırılmadı; GitHub Actions test/derleme sonucu bekleniyor.

### Yeni APK kabul kontrolü

1. CI'da testDebugUnitTest ve assembleRelease görevlerini çalıştır.
2. Aynı cihaz, kanallar, nick paneli ve geçmiş ayarlarıyla 3–5 dakika ölçüm al.
3. Kuyruk gecikmesinin sürekli büyümediğini ve nick listesi sürelerinin azaldığını kontrol et.
4. İkinci istemciyle giriş → op/voice verme → yetki alma → nick değiştirme → kick
   sırasını dene. Listede simge, konum ve üyelik doğru kalmalı; yeniden giriş de çalışmalı.
5. Birden fazla ortak kanaldaki kullanıcı QUIT edince hepsinden silinmeli; ilgisiz
   kanal ve aynı nickin bulunduğu başka ağ etkilenmemeli.
6. Yalnız harf büyüklüğü değişen nick, özel sohbet penceresinin ad değiştirmesi,
   bağlantı kesip yeniden bağlanma ve geçmiş oynatımı davranışlarını kontrol et.
7. Mesaj yazarken ve listeyi kaydırırken akıcılığı kontrol et; kuyruk ölçümü gerçek
   çizim süresini ölçmez. Yetersizse ikinci aşama ayrı değerlendirilir.

## Yeni ölçüm katmanı — 12 Ekim 2026

**Aşağıdaki eski bulgular tarihsel notlardır.** Eski toplam gecikme ölçümü tek başına
Main üzerindeki belirli bir işlemin kök neden olduğunu kanıtlamaz. Bu değişiklik
yalnızca ölçüm ekler; olay sırası, dispatcher, nick sıralaması ve bildirim davranışı değişmez.

### Logcat kullanımı

GitHub Actions ile bu değişiklikleri içeren APK'yı derleyip telefona kur.
Android Studio Logcat filtre alanında **tag:HexDroidLatency** kullan; Info seviyesini
göster (eski uyarılar yerine artık Info özetleri yazılır). Yoğun kanallarda 2–3 dakika
kal; gecikmenin görüldüğü zamanın öncesini ve sonrasını kapsayan özetleri sakla.
Nick paneli açık/kapalı denemelerini ayrı yap; kanal sayısını ve yaklaşık kullanıcı
sayısını ayrıca not et. Ham IRC logunu açmak gerekli değildir.

Yaklaşık 10 saniyede bir, yalnızca örnek toplanan metrikler yazılır. Raporlama Main
dışındadır ve ViewModel kapanınca iptal edilir. Boş pencerelerde satır üretilmez.
Telefonun uykuya girmesi veya zamanlayıcı gecikmesi nedeniyle gerçek pencere uzayabilir.
Özetler bütün bağlantıları birlikte kapsar; nick, kanal, ağ kimliği ve mesaj içeriği içermez.

| Log alanı / metrik | Anlamı |
|---|---|
| window_ms | Gerçek raporlama aralığı |
| count, avg_ms, max_ms | Örnek sayısı, aşağı yuvarlanan ortalama ve en büyük süre |
| p95_upper_ms | Histogramdaki yaklaşık yüzde 95 üst sınırı; kesin percentile değildir |
| core_prepare.ChatLive / ChatHistory | Socket satırı okunduktan olay nesnesindeki üretim zaman damgasına kadar |
| queue_wait.ChatLive / ChatHistory | Üretim zaman damgasından kolektöre ulaşmaya kadar; gönderimde bekleme ve kolektör zamanlaması da dahil |
| main_wait.* | Kolektöre girişten Main üzerindeki işleyicinin başlamasına kadar |
| handler.* | Olay işleyicisinin çalışma süresi; erken dönüşler ve hatalı çıkışlar dahil, hata bildirimi hariç |
| read_to_handler.ChatLive / ChatHistory | Eski toplam gecikmenin karşılığı; socket okuma → işleyici başlangıcı |
| nicklist.lt100 / 100to999 / ge1000 | Kullanıcı sayısı grubuna göre nick listesi oluşturma ve sıralama süresi |

Süreler monotonic saatle milisaniye olarak ölçülür; 0 ms, işin bedava olduğunu değil
ölçüm çözünürlüğünden kısa olabileceğini gösterir. Histogram sınırları 0, 1, 2, 4, 8,
16, 32, 64, 100, 250, 500, 1000, 2000, 4000, 8000 ve 16000 ms'dir. Son kovayı
aşan yüzde 95 için gözlenen maksimum üst sınır olarak kullanılır. Örnek listesi tutulmaz.

### Kapsam ve yorumlama sınırları

- Hazırlık ve kuyruk ayrımı yalnızca normal gelen sohbet mesajı üretim yolunda vardır.
  Yerel echo, relay veya birleştirilmiş multiline gibi diğer üretim yolları bu zaman
  damgaları yoksa bu metriklere dahil edilmez; işleyici ve Main bekleme süreleri yine ölçülür.
- Olay türleri release küçültmesinden etkilenmeyen sabit etiketlerdir. Sohbet, NAMES,
  giriş/çıkış, QUIT, nick değişimi, bazı MODE olayları, WHOX ve NOTICE ayrılır;
  diğer olaylar Other altında toplanır.
- Nick listesi süresi olay işleyicisinin içinde olabilir; bu iki süre toplanmamalıdır.
- Kuyruk beklemesinin büyümesi, önceki yavaş olayların veya önceki Main beklemelerinin
  birikmesi olabilir. Yalnızca son mesajın Main beklemesine bakarak UI yükü dışlanamaz.
- Socket okunmadan önceki ağ/sunucu gecikmesi ve mesajın gerçekten çizildiği an ölçülmez.
- Ölçümler tamamlanan işlemlerde kaydedilir. Devam eden uzun bir iş bir sonraki pencereye
  düşebilir; farklı metriklerin yüzde 95 veya maksimum değerleri birbirine eklenmemelidir.

### Doğrulama

Histogram toplama, sıfırlama, yüzde 95 sınırı, taşma kovası, negatif süre reddi ve eşzamanlı
kayıtlar için [LatencyMetricsTest.kt](app/src/test/java/com/boxlabs/hexdroid/LatencyMetricsTest.kt)
eklendi. Yerelde Java PATH/JAVA_HOME tanımlı olmadığı ve build GitHub Actions'ta alındığı
için testler burada çalıştırılmadı. CI'da testDebugUnitTest görevi ve ardından mevcut release
derlemesi çalıştırılmalı; yalnız assembleRelease birim testleri çalıştırmaz.

## Durum

HexDroid mesajları bazı durumlarda telefonda 4–8 saniye gecikmeli gösteriyor. mIRC aynı mesajları daha erken gösteriyor.

Ölçüm Logcat etiketi:

```text
HexDroidLatency
```

Örnek ölçümler:

```text
event_queue_delay=4435ms ... history=false
event_queue_delay=6000ms ... history=false
event_queue_delay=8168ms ... history=false
```

## Kesinleşen bulgular

- Mesajlar `history=false` olarak geliyor. Gecikmenin ana nedeni playback/history kuyruğu değil.
- Gecikme aynı anda birden fazla kanalda görülüyor: `#Geveze`, `#mobil`, `#Radyo`, `#Klasfm` vb.
- Gecikme 4–8 saniyeye kadar yükseliyor. Bu, ortak event kuyruğunda birikmeye işaret ediyor.
- Socket satırının okunduğu zaman [`IrcCore.kt`](app/src/main/java/com/boxlabs/hexdroid/IrcCore.kt) içinde `SystemClock.elapsedRealtime()` ile ölçülüyor.
- Ölçüm mesajla birlikte `ChatMessage.ingressElapsedMs` alanında taşınıyor.
- Mesaj [`IrcViewModel.kt`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt) içinde işlendiğinde `event_queue_delay` hesaplanıyor.
- `history=false` olması, mesajın UnrealIRCd 3.2’den canlı akışta geldiğini gösteriyor.
- Saatlerin mesajın ekrana geldiği zamanı göstermesi beklenen davranış: UnrealIRCd 3.2 `server-time` desteği sunmadığı için `timeMs` yoksa uygulama `System.currentTimeMillis()` kullanıyor. Bu durum gecikmenin nedeni değil; yalnızca gerçek sunucu gönderim saatinin görülememesine neden oluyor.

## En güçlü neden

Mevcut event tüketim akışı:

```text
IrcCore socket read
        |
        v
EVENT_DRAIN_BUFFER_CAPACITY = 65536
        |
        v
IrcViewModel.collect
        |
        v
withContext(Dispatchers.Main.immediate)
        |
        v
handleEvent()
        |
        +-- _state.update
        +-- BufferLog insert/dedup/sort
        +-- unread/highlight hesapları
        +-- nick/kanal state işlemleri
        +-- notification değerlendirmesi
        +-- AGE/E2E kontrolleri
        +-- log başlatma/yazma işleri
        +-- Compose state invalidation
```

Bütün event’ler Main üzerinde seri işlendiği için chat yoğunlaştığında socket okuyucu mesajları hızlıca buffer’a koyuyor, ancak `handleEvent()` yetişemiyor. Sonuç olarak mesajlar ekrana ulaşmadan önce 4–8 saniye bekliyor.

İlgili noktalar:

- [`EVENT_DRAIN_BUFFER_CAPACITY`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt:844)
- [`client.events().buffer(...).collect`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt:5296)
- [`Dispatchers.Main.immediate`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt:5306)
- [`handleEvent()`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt:5307)
- [`append()`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt:11439)

## Önerilen fix stratejisi

### 1. Sadece buffer kapasitesini artırma

Önerilmiyor. Buffer zaten `65536`; büyütmek yalnızca daha fazla mesajın bellekte beklemesini sağlar ve gecikmeyi çözmez.

### 2. Düşük riskli ilk optimizasyon

`ChatMessage` işleme yolunda:

- Mesajı mümkün olan en kısa yoldan buffer state’ine ekle.
- Log yazımını `Dispatchers.IO` üzerinde bırak.
- Notification hazırlığını mesaj ekrana girdikten sonra ayrı coroutine’e taşı.
- AGE/E2E ve pahalı metadata işlerini mesajın kritik render yolundan ayır.

Bu yaklaşım kullanıcıya mesajı hızlı gösterir, ikincil işlemleri sonradan tamamlar.

### 3. Bağlantı başına seri event dispatcher

En güvenli orta vadeli çözüm budur:

- Her IRC bağlantısı kendi seri event dispatcher’ında çalışır.
- Aynı bağlantının event sırası korunur.
- Chat event’leri tek tek ama Main dışında işlenebilir.
- `StateFlow` thread-safe güncellemeleri korunur.
- UI yalnızca state değişikliklerini toplar.

Ancak [`handleEvent()`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt:5307) içinde Main-thread varsayımı olan bütün kodlar gözden geçirilmeden doğrudan `Dispatchers.Default` kullanmak risklidir. Özellikle şu yapılar kontrol edilmelidir:

- bağlantı başına mutable map’ler
- nick listesi map’leri
- AGE bridge state’i
- pending request map’leri
- unread ve buffer state güncellemeleri
- script callback’leri

### 4. Alternatif: ChatMessage için tek seri worker

İlk deneme için daha kontrollü seçenek:

- Sadece `ChatMessage` event’leri bağlantı başına bir `Channel`/worker’a aktarılır.
- Worker sıralı çalışır.
- `handleEvent()` içindeki yalnızca chat’e özgü ağır işlemler ayrıştırılır.
- JOIN/PART/MODE/WHOIS gibi state-sensitive event’ler mevcut Main akışında kalır.

Bu, tüm event sistemini aynı anda değiştirmeden gecikmeyi azaltabilir; ancak chat ile nick listesi state’i arasındaki sıralama dikkatle korunmalıdır.

## Şu an yapılmaması gereken değişiklik

Bu taslak doğrudan kullanılmamalı:

```kotlin
if (ev is IrcEvent.ChatMessage) {
    withContext(Dispatchers.Default) { handleEvent(netId, ev) }
}
```

Çünkü `handleEvent()` yalnızca mesaj çizmez; shared mutable state, buffer, nicklist, notification, AGE ve script işlemleri de yapar. Bu yaklaşım yarış koşullarına yol açabilir.

## Sonraki sohbet için çalışma planı

1. [`IrcViewModel.kt`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt) içindeki `handleEvent()` ve `ChatMessage` branch’ini ayrıntılı incele.
2. Chat mesajının kritik render yolunu, log/notification/AGE gibi ikincil işlerden ayır.
3. Önce düşük riskli optimizasyonu uygula.
4. GitHub Actions ile `assembleRelease` çalıştır.
5. Yeni APK ile aynı kanallarda tekrar ölçüm al.
6. `event_queue_delay` değerleri 0–100 ms seviyesine düşmezse bağlantı başına seri worker/dispatcher tasarımına geç.

## Build notu

Ölçüm eklenirken oluşan geçici build hatası giderildi:

- [`SystemClock`](app/src/main/java/com/boxlabs/hexdroid/IrcCore.kt:22) import’u çift olmuştu; fazla import kaldırıldı.
- `ingressElapsedMs`, `handleMessageCommand()` üzerinden taşınacak şekilde düzenlendi.
- `git diff --check` başarılıydı.

Yeni sohbet bu dosyadan devam etmelidir.
