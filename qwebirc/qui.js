var mootoolsv = null;
var browserInfo = null;
var userNick = null;
var userip = null; // L2.io bu değişkeni otomatik dolduracak

// URL'den nick parametresini çek
function getNickFromURL() {
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var nick = urlParams.get('nick') || urlParams.get('nickname');
        
        if (nick) {
            console.log('🔍 URL\'den nick çekildi:', nick);
            return nick;
        }
        
        console.warn('⚠️ URL\'de nick parametresi bulunamadı');
        return null;
    } catch (e) {
        console.error('❌ Nick çekme hatası:', e);
        return null;
    }
}

// Sayfa yüklendiğinde nick'i al
userNick = getNickFromURL();

// L2.io JavaScript API ile IPv4 al (CORS yok, script tag ile)
// www.l2.io IPv4 garantisi verir, userip değişkenini otomatik doldurur
(function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.l2.io/ip.js?var=userip';
    script.async = true;
    
    script.onload = function() {
        if (userip) {
            console.log('🌐 www.l2.io\'dan IPv4 alındı:', userip);
        } else {
            console.warn('⚠️ userip değişkeni boş');
        }
    };
    
    script.onerror = function() {
        console.error('❌ www.l2.io script yüklenemedi');
    };
    
    document.head.appendChild(script);
})();

// Fingerprint Ayarları
var fingerprintConfig = {
    includeScreenWidth: true,  // true: Ekran genişliğini dahil et, false: Sadece diğer özellikleri kullan
    debugMode: true  // Debug loglarını göster
};

// CDN Fallback Sistemi
var scriptSources = [
    'https://cdn.jsdelivr.net/gh/blackforce3232/bf/bffinger_son.min.js',  // Ana CDN (jsDelivr - En hızlı ve güvenilir)
    'https://geveze.org/bf/bffinger_son.js',                          // Yedek 1
    'https://sohbetci.com/bf/bffinger_son.js',                        // Yedek 2
    'https://irc.geveze.org/bf/yenijs/bffinger_son.js'                // Yedek 3
];
var currentSourceIndex = 0;

// Tarayıcı bilgilerini POST ile gönder
function sendToServer(tarayici, gizli, mesaj) {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.sohbetci.com/bf/bf.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('✅ Sunucuya gönderildi:', mesaj);
            } else {
                console.error('❌ Sunucu hatası:', xhr.status);
            }
        };
        
        xhr.onerror = function() {
            console.error('❌ Bağlantı hatası');
        };
        
        var params = 'tarayici=' + encodeURIComponent(tarayici) +
                     '&gizli=' + encodeURIComponent(gizli) +
                     '&ip=' + encodeURIComponent(userip) +
                     '&mesaj=' + encodeURIComponent(mesaj);
        
        xhr.send(params);
    } catch (e) {
        console.error('❌ sendToServer hatası:', e);
    }
}

// mootoolsv oluşturulunca hemen bf.php'ye /check isteği gönder
function sendCheckToBF(uid) {
    try {
        if (!uid) {
            console.error('❌ UID boş, check gönderilemedi');
            return;
        }
        
        // Nick varsa URL'e ekle, yoksa sadece UID gönder
        var checkURL = 'https://www.sohbetci.com/bf/bf.php?action=check&uid=' + encodeURIComponent('yeni-Id-' + uid);
        
        // IP varsa ekle (www.l2.io'dan alınan userip değişkeni)
        if (userip) {
            checkURL += '&ip=' + encodeURIComponent(userip);
            console.log('🌐 IP eklendi:', userip);
        }
        
        if (userNick) {
            // Nick varsa onu da ekle
            checkURL += '&nick=' + encodeURIComponent(userNick);
            console.log('🔍 Check gönderiliyor - Nick:', userNick, 'IP:', userip || 'otomatik', 'UID:', uid);
        } else {
            console.log('🔍 Check gönderiliyor - IP:', userip || 'otomatik', 'UID:', uid);
        }
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', checkURL, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('✅ Check başarıyla gönderildi:', xhr.responseText);
            } else {
                console.error('❌ Check gönderme hatası:', xhr.status);
            }
        };
        
        xhr.onerror = function() {
            console.error('❌ Check bağlantı hatası');
        };
        
        xhr.send();
    } catch (e) {
        console.error('❌ sendCheckToBF hatası:', e);
    }
}

function sendErrorToBlackForce(errorMessage) {
    var tarayici = browserInfo?.browserName || 'Bilinmiyor';
    var gizli = browserInfo?.isPrivate ? 1 : 0;
    sendToServer(tarayici, gizli, errorMessage);
}

function loadScriptBf(src, callback, retryCount) {
    retryCount = retryCount || 0;
    var maxRetries = 2;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.async = false;

    var timeout = setTimeout(function() {
        var errorMsg = 'Script yükleme zaman aşımı (10s): ' + src + ' (Deneme: ' + (retryCount + 1) + '/' + maxRetries + ')';
        console.error('❌ ' + errorMsg);
        sendErrorToBlackForce(errorMsg);
    }, 10000);

    script.onload = function() {
        clearTimeout(timeout);
        console.log('✅ Yüklendi:', src);
        setTimeout(function() {
            if(typeof callback === 'function') {
                callback();
            }
        }, 100);
    };

    script.onerror = function() {
        clearTimeout(timeout);
        retryCount++;
        var errorMsg = 'Script yüklenemedi: ' + src + ' (Deneme: ' + retryCount + '/' + maxRetries + ')';
        console.error('❌ ' + errorMsg);
        sendErrorToBlackForce(errorMsg);

        if (retryCount < maxRetries) {
            console.log('🔄 Yeniden deneniyor (2 saniye sonra)...');
            setTimeout(function() {
                loadScriptBf(src, callback, retryCount);
            }, 2000);
        } else {
            var finalErrorMsg = 'Script ' + maxRetries + ' denemeden sonra yüklenemedi: ' + src;
            console.error('💀 ' + finalErrorMsg);
            sendErrorToBlackForce(finalErrorMsg);
            
            // Yedek CDN'e geç
            tryNextCDN(callback);
        }
    };

    try {
        document.head.appendChild(script);
    } catch (e) {
        clearTimeout(timeout);
        var errorMsg = 'Script DOM\'a eklenemedi: ' + src + ' - ' + e.message;
        console.error('❌ ' + errorMsg);
        sendErrorToBlackForce(errorMsg);
        
        // DOM hatası durumunda da yedek CDN'e geç
        tryNextCDN(callback);
    }
}

function tryNextCDN(callback) {
    currentSourceIndex++;
    
    if (currentSourceIndex < scriptSources.length) {
        var nextSource = scriptSources[currentSourceIndex];
        console.log('🔄 Yedek CDN\'e geçiliyor (' + (currentSourceIndex + 1) + '/' + scriptSources.length + '): ' + nextSource);
        sendErrorToBlackForce('Yedek CDN\'e geçiliyor: ' + nextSource);
        
        setTimeout(function() {
            loadScriptBf(nextSource, callback, 0);
        }, 1000);
    } else {
        var fatalMsg = 'FATAL: Tüm CDN kaynakları denendi, hiçbiri yüklenemedi!';
        console.error('💀 ' + fatalMsg);
        sendErrorToBlackForce(fatalMsg);
    }
}

// İlk CDN kaynağından başla
loadScriptBf(scriptSources[currentSourceIndex], function() {
    console.log('✅ BFF.js yüklendi (tüm fingerprint modülleri dahil) - Kaynak: ' + scriptSources[currentSourceIndex]);
    console.log('⚙️ Fingerprint Ayarları:', {
        includeScreenWidth: fingerprintConfig.includeScreenWidth,
        mode: fingerprintConfig.includeScreenWidth ? 'Ekran genişliği DAHIL' : 'Ekran genişliği HARİÇ'
    });

    // Tarayıcı bilgilerini tespit et ve gönder
    if (typeof detectIncognito === 'function') {
        detectIncognito().then(function(result) {
            browserInfo = result;
            
            if (result.isPrivate) {
                console.log("🔒 Gizli mod aktif!");
            } else {
                console.log("🌐 Normal mod");
            }
            console.log("🌍 Tarayıcı:", result.browserName);
            
            // İlk girişte tarayıcı bilgilerini gönder
            sendToServer(
                result.browserName,
                result.isPrivate ? 1 : 0,
                'İlk bağlantı - Tarayıcı bilgileri'
            );
        }).catch(function(err) {
            console.error('❌ detectIncognito hatası:', err);
            browserInfo = { browserName: 'Bilinmiyor', isPrivate: false };
        });
    } else {
        console.warn('⚠️ detectIncognito fonksiyonu bulunamadı');
        browserInfo = { browserName: 'Bilinmiyor', isPrivate: false };
    }

    const FingerprintJS = window.FingerprintJS || window.default;
    if (!FingerprintJS || !FingerprintJS.load) {
        var errorMsg = 'FingerprintJS yüklenemedi!';
        console.error('❌ ' + errorMsg);
        sendErrorToBlackForce(errorMsg);
        return;
    }

    const fpPromise = Promise.resolve(FingerprintJS.load());

    async function getFinalHash() {
        try {
            const results = await Promise.all([
                fpPromise,
                fpPromise.then(function(fp) { return fp.get(); }),
                (async function() {
                    try {
                        const combined = new CombinedCSSFingerprint();
                        return await combined.generate();
                    } catch (e) {
                        console.warn('CSS Fingerprint failed:', e);
                        sendErrorToBlackForce('CSS Fingerprint hatası: ' + e.message);
                        return null;
                    }
                })(),
                (async function() {
                    try {
                        const advanced = new AdvancedBrowserFingerprint();
                        return await advanced.generate();
                    } catch (e) {
                        console.warn('Advanced Fingerprint failed:', e);
                        sendErrorToBlackForce('Advanced Fingerprint hatası: ' + e.message);
                        return null;
                    }
                })()
            ]);

            const fp = results[0];
            const fpResult = results[1];
            const cssFingerprint = results[2];
            const advancedFingerprint = results[3];

            const cssBasic = cssFingerprint?.basic?.data || {};
            const cssAdvanced = cssFingerprint?.advanced?.data || {};

            // Ekran bilgisini ayara göre hazırla
            var screenData = '';
            if (fingerprintConfig.includeScreenWidth) {
                // Ekran genişliğini dahil et (mevcut sistem)
                screenData = (advancedFingerprint?.screen?.width || '') + 'x' +
                            (advancedFingerprint?.screen?.height || '') + 'x' +
                            (advancedFingerprint?.screen?.colorDepth || '') + 'x' +
                            (advancedFingerprint?.screen?.pixelDepth || '') + 'x' +
                            (advancedFingerprint?.screen?.devicePixelRatio || '');
            } else {
                // Sadece yükseklik ve diğer özellikler (genişlik hariç)
                screenData = (advancedFingerprint?.screen?.height || '') + 'x' +
                            (advancedFingerprint?.screen?.colorDepth || '') + 'x' +
                            (advancedFingerprint?.screen?.pixelDepth || '') + 'x' +
                            (advancedFingerprint?.screen?.devicePixelRatio || '');
            }

            // Debug: Her bir bileşeni logla
            if (fingerprintConfig.debugMode) {
                console.log('🔍 DEBUG: Fingerprint Bileşenleri');
                console.log('1. CSS Fonts:', (cssBasic.fontList || []).length);
                console.log('2. Advanced Fonts:', (cssAdvanced.fonts || []).length);
                console.log('3. WebGL Renderer:', advancedFingerprint?.webglRenderer);
                console.log('4. Canvas Hash:', advancedFingerprint?.canvas?.hash);
                console.log('5. Audio Sum:', advancedFingerprint?.audio?.audioSum);
                console.log('6. Screen Data:', screenData);
            }

            const ultimateCombined = [
                (cssBasic.fontList || []).sort().join(','),
                (cssAdvanced.fonts || []).sort().join(','),
                JSON.stringify(cssBasic.fontMetrics || {}),
                JSON.stringify(cssBasic.emojiRendering || {}),
                JSON.stringify(cssBasic.textRendering || {}),
                JSON.stringify(advancedFingerprint?.canvasTextMetrics || {}),
                JSON.stringify(cssBasic.colorPrecision || {}),
                advancedFingerprint?.webglRenderer || '',
                advancedFingerprint?.webglVendor || '',
                JSON.stringify(advancedFingerprint?.webgl?.extensions || []),
                advancedFingerprint?.webgl?.version || '',
                advancedFingerprint?.webgl?.shadingLanguageVersion || '',
                advancedFingerprint?.webgl?.maxTextureSize || '',
                advancedFingerprint?.webgl?.maxRenderbufferSize || '',
                JSON.stringify(advancedFingerprint?.webgl?.maxViewportDims || []),
                advancedFingerprint?.canvas?.hash || '',
                advancedFingerprint?.canvas?.dataURL || '',
                // Audio sum hassasiyeti azaltıldı ve normalize edildi
                // Gizli modda tutarlılık için integer'a yuvarlanıyor
                advancedFingerprint?.audio?.audioSum ? Math.round(advancedFingerprint.audio.audioSum).toString() : '',
                advancedFingerprint?.audio?.sampleRate || '',
                advancedFingerprint?.audio?.maxChannelCount || '',
                advancedFingerprint?.audio?.numberOfInputs || '',
                advancedFingerprint?.audio?.numberOfOutputs || '',
                String(advancedFingerprint?.hardwareConcurrency || '0'),
                String(advancedFingerprint?.deviceMemory || '0'),
                screenData,
                advancedFingerprint?.timezone?.timezone || '',
                advancedFingerprint?.timezone?.offset || '',
                advancedFingerprint?.timezone?.locale || '',
                // Language çıkarıldı - gizli modda farklı değerler döndürüyor
                advancedFingerprint?.mathConstants?.tan || '',
                advancedFingerprint?.mathConstants?.sin || '',
                advancedFingerprint?.mathConstants?.acos || '',
                advancedFingerprint?.mathConstants?.e || '',
                advancedFingerprint?.mathConstants?.pi || '',
                advancedFingerprint?.navigator?.platform || '',
                advancedFingerprint?.navigator?.vendor || '',
                advancedFingerprint?.navigator?.vendorSub || '',
                advancedFingerprint?.navigator?.productSub || '',
                advancedFingerprint?.navigator?.appVersion || '',
                JSON.stringify(cssBasic.cssProperties || {}),
                JSON.stringify(cssBasic.cssFilters || {}),
                JSON.stringify(cssBasic.cssTransforms || {}),
                JSON.stringify(cssBasic.cssBlending || {}),
                JSON.stringify(cssBasic.cssGrid || {}),
                JSON.stringify(cssBasic.cssVariables || {}),
                (cssBasic.scrollbar?.width || 0) + 'x' + (cssBasic.scrollbar?.height || 0),
                cssBasic.boxShadow || '',
                JSON.stringify(cssBasic.borderRadius || {}),
                advancedFingerprint?.maxTouchPoints || 0,
                JSON.stringify(advancedFingerprint?.touchSupport || {}),
                JSON.stringify(advancedFingerprint?.mediaDevices || {}),
                (advancedFingerprint?.speechSynthesis || []).length,
                JSON.stringify((advancedFingerprint?.speechSynthesis || []).slice(0, 5)),
                (advancedFingerprint?.plugins || []).length,
                JSON.stringify((advancedFingerprint?.plugins || []).map(p => p.name).sort()),
                (advancedFingerprint?.mimeTypes || []).length,
                advancedFingerprint?.errorStack?.format || '',
                // DOMRect çıkarıldı - gizli modda y pozisyonu değişiyor
                // JSON.stringify(advancedFingerprint?.domRect || {}),
                JSON.stringify(advancedFingerprint?.webAssembly || {}),
                JSON.stringify(advancedFingerprint?.gamepad || {}),
                advancedFingerprint?.vibration || false,
                cssBasic.mediaQueries?.['(hover: hover)'] || false,
                cssBasic.mediaQueries?.['(pointer: fine)'] || false,
                cssBasic.mediaQueries?.['(any-hover: hover)'] || false,
                cssBasic.mediaQueries?.['(any-pointer: fine)'] || false,
                cssBasic.mediaQueries?.['(color-gamut: srgb)'] || false,
                cssBasic.mediaQueries?.['(dynamic-range: standard)'] || false,
                cssAdvanced.colorGamut || '',
                cssAdvanced.dynamicRange || '',
                cssAdvanced.pointerType || '',
                cssAdvanced.hoverCapability || '',
            ].join('|');

            // Debug: Hash oluşturmadan önce tüm veriyi göster
            if (fingerprintConfig.debugMode) {
                console.log('🔍 DEBUG: ultimateCombined uzunluğu:', ultimateCombined.length);
                
                // Her bileşeni ayrı ayrı logla
                var components = ultimateCombined.split('|');
                console.log('🔍 DEBUG: Toplam bileşen sayısı:', components.length);
                
                // TÜM bileşenleri tam uzunluklarıyla göster
                console.log('🔍 DEBUG: TÜM BİLEŞENLER:');
                for (var i = 0; i < components.length; i++) {
                    var comp = components[i];
                    var preview = comp.length > 50 ? comp.substring(0, 50) + '...' : comp;
                    console.log(`  [${i}] ${comp.length} byte: ${preview}`);
                }
                
                // Gizli mod için özel kontrol
                if (browserInfo && browserInfo.isPrivate) {
                    console.log('🔍 DEBUG: GİZLİ MOD - Tüm bileşenleri kaydet');
                    window.gizliModComponents = components;
                } else {
                    console.log('🔍 DEBUG: NORMAL MOD - Tüm bileşenleri kaydet');
                    window.normalModComponents = components;
                    // Site bazlı karşılaştırma için localStorage'a kaydet
                    try {
                        localStorage.setItem('fp_components_' + window.location.hostname, JSON.stringify({
                            site: window.location.hostname,
                            components: components,
                            hash: ultimateCombined,
                            timestamp: Date.now()
                        }));
                    } catch(e) {
                        console.warn('localStorage kayıt hatası:', e);
                    }
                }
                
                // Eğer her iki mod da varsa karşılaştır
                if (window.normalModComponents && window.gizliModComponents) {
                    console.log('🔍 DEBUG: KARŞILAŞTIRMA BAŞLIYOR...');
                    var farkSayisi = 0;
                    var toplamFarkByte = 0;
                    for (var i = 0; i < Math.max(window.normalModComponents.length, window.gizliModComponents.length); i++) {
                        var normal = window.normalModComponents[i] || '';
                        var gizli = window.gizliModComponents[i] || '';
                        if (normal !== gizli) {
                            farkSayisi++;
                            var byteFark = normal.length - gizli.length;
                            toplamFarkByte += byteFark;
                            console.log(`⚠️ FARK BULUNDU [${i}]:`, {
                                index: i,
                                normal: normal.substring(0, 100) + (normal.length > 100 ? '...' : ''),
                                gizli: gizli.substring(0, 100) + (gizli.length > 100 ? '...' : ''),
                                normalUzunluk: normal.length,
                                gizliUzunluk: gizli.length,
                                byteFark: byteFark
                            });
                        }
                    }
                    if (farkSayisi === 0) {
                        console.log('✅ HİÇ FARK YOK! Tüm bileşenler aynı.');
                        console.log('⚠️ Ancak hash farklı, bu CryptoJS.MD5 veya string birleştirme sorunudur.');
                    } else {
                        console.log(`📊 Toplam ${farkSayisi} bileşen farklı.`);
                        console.log(`📊 Toplam byte farkı: ${toplamFarkByte} byte`);
                    }
                }
                
                // Site bazlı karşılaştırma fonksiyonu
                window.compareSites = function() {
                    var keys = Object.keys(localStorage).filter(k => k.startsWith('fp_components_'));
                    if (keys.length < 2) {
                        console.log('⚠️ En az 2 site verisi gerekli. Şu ana kadar:', keys.length);
                        return;
                    }
                    
                    console.log('🔍 SITE BAZLI KARŞILAŞTIRMA:');
                    var sites = keys.map(k => JSON.parse(localStorage.getItem(k)));
                    
                    for (var i = 0; i < sites.length - 1; i++) {
                        for (var j = i + 1; j < sites.length; j++) {
                            var site1 = sites[i];
                            var site2 = sites[j];
                            console.log(`\n📊 ${site1.site} vs ${site2.site}:`);
                            
                            var farklar = [];
                            for (var k = 0; k < Math.max(site1.components.length, site2.components.length); k++) {
                                var comp1 = site1.components[k] || '';
                                var comp2 = site2.components[k] || '';
                                if (comp1 !== comp2) {
                                    farklar.push({
                                        index: k,
                                        site1: comp1.substring(0, 50),
                                        site2: comp2.substring(0, 50),
                                        len1: comp1.length,
                                        len2: comp2.length
                                    });
                                }
                            }
                            
                            if (farklar.length === 0) {
                                console.log('✅ Tüm bileşenler aynı!');
                            } else {
                                console.log(`⚠️ ${farklar.length} bileşen farklı:`, farklar);
                            }
                        }
                    }
                };
                console.log('💡 Farklı sitelerde karşılaştırma için: compareSites()');
            }

            mootoolsv = "-son-" + CryptoJS.MD5(ultimateCombined).toString();

            console.log('🎯 UNIQUE & STABLE FINGERPRINT:', mootoolsv);
            
            // mootoolsv oluşturulur oluşturulmaz hemen check gönder
            sendCheckToBF(mootoolsv);
            
            // Debug: Gizli mod kontrolü
            if (fingerprintConfig.debugMode && browserInfo) {
                console.log('🔍 DEBUG: Gizli Mod:', browserInfo.isPrivate ? 'EVET' : 'HAYIR');
                console.log('🔍 DEBUG: Tarayıcı:', browserInfo.browserName);
            }
            console.log('📊 Uniqueness Factors:', {
                installedFonts: (cssBasic.fontList || []).length + (cssAdvanced.fonts || []).length,
                webglRenderer: advancedFingerprint?.webglRenderer,
                canvasHash: advancedFingerprint?.canvas?.hash,
                audioSum: advancedFingerprint?.audio?.audioSum?.toFixed(2),
                plugins: (advancedFingerprint?.plugins || []).length,
                speechVoices: (advancedFingerprint?.speechSynthesis || []).length
            });
            console.log('✅ Stability Factors:', {
                hardwareConcurrency: advancedFingerprint?.hardwareConcurrency,
                deviceMemory: advancedFingerprint?.deviceMemory,
                timezone: advancedFingerprint?.timezone?.timezone,
                screen: fingerprintConfig.includeScreenWidth
                    ? `${advancedFingerprint?.screen?.width}x${advancedFingerprint?.screen?.height}`
                    : `height:${advancedFingerprint?.screen?.height} (width excluded)`,
                screenWidthIncluded: fingerprintConfig.includeScreenWidth,
                platform: advancedFingerprint?.navigator?.platform
            });

            return mootoolsv;

        } catch (e) {
            var errorMsg = 'Fingerprint oluşturma hatası: ' + e.message;
            console.error('❌ ' + errorMsg);
            sendErrorToBlackForce(errorMsg);
            return null;
        }
    }

    getFinalHash().then(function(result) {
        if (result) {
            console.log('✅ mootoolsv hazır (UNIQUE & TÜM PAKETLER!):', mootoolsv);
        } else {
            var errorMsg = 'mootoolsv oluşturulamadı (null result)';
            console.error('❌ ' + errorMsg);
            sendErrorToBlackForce(errorMsg);
        }
    }).catch(function(err) {
        var errorMsg = 'Fatal error: ' + err.message;
        console.error('❌ ' + errorMsg);
        sendErrorToBlackForce(errorMsg);
    });
});

/* qwebirc -- Copyright (C) 2008-2019 Chris Porter and the qwebirc project --- All rights reserved. */
var MooTools={version:"1.2.5",build:"530688640351351658486s04f546sd54605051sd32f1"};
MooTools.version = "1.2.5", MooTools.build = "530688640351351658486s04f546sd54605051sd32f1", window.qwebirc = window.qwebirc || {}, window.qwebirc.q = window.qwebirc.q || {};
var Native=function(l){l=l||{};var a=l.name;var j=l.legacy;var b=l.protect;var c=l.implement;var i=l.generics;var g=l.initialize;var h=l.afterImplement||function(){};var d=g||j;i=i!==false;d.constructor=Native;d.$family={name:"native"};if(j&&g){d.prototype=j.prototype}d.prototype.constructor=d;if(a){var f=a.toLowerCase();d.prototype.$family={name:f};Native.typize(d,f)}var k=function(o,m,p,n){if(!b||n||!o.prototype[m]){o.prototype[m]=p}if(i){Native.genericize(o,m,b)}h.call(o,m,p);return o};d.alias=function(o,m,q){if(typeof o=="string"){var p=this.prototype[o];if((o=p)){return k(this,m,o,q)}}for(var n in o){this.alias(n,o[n],m)}return this};d.implement=function(n,m,q){if(typeof n=="string"){return k(this,n,m,q)}for(var o in n){k(this,o,n[o],m)}return this};if(c){d.implement(c)}return d};Native.genericize=function(b,c,a){if((!a||!b[c])&&typeof b.prototype[c]=="function"){b[c]=function(){var d=Array.prototype.slice.call(arguments);return b.prototype[c].apply(d.shift(),d)}}};Native.implement=function(d,c){for(var b=0,a=d.length;b<a;b++){d[b].implement(c)}};Native.typize=function(a,b){if(!a.type){a.type=function(c){return($type(c)===b)}}};(function(){var a={Array:Array,Date:Date,Function:Function,Number:Number,RegExp:RegExp,String:String};for(var j in a){new Native({name:j,initialize:a[j],protect:true})}var d={"boolean":Boolean,"native":Native,object:Object};for(var c in d){Native.typize(d[c],c)}var h={Array:["concat","indexOf","join","lastIndexOf","pop","push","reverse","shift","slice","sort","splice","toString","unshift","valueOf"],String:["charAt","charCodeAt","concat","indexOf","lastIndexOf","match","replace","search","slice","split","substr","substring","toLowerCase","toUpperCase","valueOf"]};for(var f in h){for(var b=h[f].length;b--;){Native.genericize(a[f],h[f][b],true)}}})();var Hash=new Native({name:"Hash",initialize:function(a){if($type(a)=="hash"){a=$unlink(a.getClean())}for(var b in a){this[b]=a[b]}return this}});Hash.implement({forEach:function(b,c){for(var a in this){if(this.hasOwnProperty(a)){b.call(c,this[a],a,this)}}},getClean:function(){var b={};for(var a in this){if(this.hasOwnProperty(a)){b[a]=this[a]}}return b},getLength:function(){var b=0;for(var a in this){if(this.hasOwnProperty(a)){b++}}return b}});Hash.alias("forEach","each");Array.implement({forEach:function(c,d){for(var b=0,a=this.length;b<a;b++){c.call(d,this[b],b,this)}}});Array.alias("forEach","each");function $A(b){if(b.item){var a=b.length,c=new Array(a);while(a--){c[a]=b[a]}return c}return Array.prototype.slice.call(b)}function $arguments(a){return function(){return arguments[a]}}function $chk(a){return !!(a||a===0)}function $clear(a){clearTimeout(a);clearInterval(a);return null}function $defined(a){return(a!=undefined)}function $each(c,b,d){var a=$type(c);((a=="arguments"||a=="collection"||a=="array")?Array:Hash).each(c,b,d)}function $empty(){}function $extend(c,a){for(var b in (a||{})){c[b]=a[b]}return c}function $H(a){return new Hash(a)}function $lambda(a){return($type(a)=="function")?a:function(){return a}}function $merge(){var a=Array.slice(arguments);a.unshift({});return $mixin.apply(null,a)}function $mixin(f){for(var d=1,a=arguments.length;d<a;d++){var b=arguments[d];if($type(b)!="object"){continue}for(var c in b){var h=b[c],g=f[c];f[c]=(g&&$type(h)=="object"&&$type(g)=="object")?$mixin(g,h):$unlink(h)}}return f}function $pick(){for(var b=0,a=arguments.length;b<a;b++){if(arguments[b]!=undefined){return arguments[b]}}return null}function $random(b,a){return Math.floor(Math.random()*(a-b+1)+b)}function $splat(b){var a=$type(b);return(a)?((a!="array"&&a!="arguments")?[b]:b):[]}var $time=Date.now||function(){return +new Date};function $try(){for(var b=0,a=arguments.length;b<a;b++){try{return arguments[b]()}catch(c){}}return null}function $type(a){if(a==undefined){return false}if(a.$family){return(a.$family.name=="number"&&!isFinite(a))?false:a.$family.name}if(a.nodeName){switch(a.nodeType){case 1:return"element";case 3:return(/\S/).test(a.nodeValue)?"textnode":"whitespace"}}else{if(typeof a.length=="number"){if(a.callee){return"arguments"}else{if(a.item){return"collection"}}}}return typeof a}function $unlink(c){var b;switch($type(c)){case"object":b={};for(var f in c){b[f]=$unlink(c[f])}break;case"hash":b=new Hash(c);break;case"array":b=[];for(var d=0,a=c.length;d<a;d++){b[d]=$unlink(c[d])}break;default:return c}return b}Array.implement({every:function(c,d){for(var b=0,a=this.length;b<a;b++){if(!c.call(d,this[b],b,this)){return false}}return true},filter:function(d,f){var c=[];for(var b=0,a=this.length;b<a;b++){if(d.call(f,this[b],b,this)){c.push(this[b])}}return c},clean:function(){return this.filter($defined)},indexOf:function(c,d){var a=this.length;for(var b=(d<0)?Math.max(0,a+d):d||0;b<a;b++){if(this[b]===c){return b}}return -1},map:function(d,f){var c=[];for(var b=0,a=this.length;b<a;b++){c[b]=d.call(f,this[b],b,this)}return c},some:function(c,d){for(var b=0,a=this.length;b<a;b++){if(c.call(d,this[b],b,this)){return true}}return false},associate:function(c){var d={},b=Math.min(this.length,c.length);for(var a=0;a<b;a++){d[c[a]]=this[a]}return d},link:function(c){var a={};for(var f=0,b=this.length;f<b;f++){for(var d in c){if(c[d](this[f])){a[d]=this[f];delete c[d];break}}}return a},contains:function(a,b){return this.indexOf(a,b)!=-1},extend:function(c){for(var b=0,a=c.length;b<a;b++){this.push(c[b])}return this},getLast:function(){return(this.length)?this[this.length-1]:null},getRandom:function(){return(this.length)?this[$random(0,this.length-1)]:null},include:function(a){if(!this.contains(a)){this.push(a)}return this},combine:function(c){for(var b=0,a=c.length;b<a;b++){this.include(c[b])}return this},erase:function(b){for(var a=this.length;a--;a){if(this[a]===b){this.splice(a,1)}}return this},empty:function(){this.length=0;return this},flatten:function(){var d=[];for(var b=0,a=this.length;b<a;b++){var c=$type(this[b]);if(!c){continue}d=d.concat((c=="array"||c=="collection"||c=="arguments")?Array.flatten(this[b]):this[b])}return d},hexToRgb:function(b){if(this.length!=3){return null}var a=this.map(function(c){if(c.length==1){c+=c}return c.toInt(16)});return(b)?a:"rgb("+a+")"},rgbToHex:function(d){if(this.length<3){return null}if(this.length==4&&this[3]==0&&!d){return"transparent"}var b=[];for(var a=0;a<3;a++){var c=(this[a]-0).toString(16);b.push((c.length==1)?"0"+c:c)}return(d)?b:"#"+b.join("")}});String.implement({test:function(a,b){return((typeof a=="string")?new RegExp(a,b):a).test(this)},contains:function(a,b){return(b)?(b+this+b).indexOf(b+a+b)>-1:this.indexOf(a)>-1},trim:function(){return this.replace(/^\s+|\s+$/g,"")},clean:function(){return this.replace(/\s+/g," ").trim()},camelCase:function(){return this.replace(/-\D/g,function(a){return a.charAt(1).toUpperCase()})},hyphenate:function(){return this.replace(/[A-Z]/g,function(a){return("-"+a.charAt(0).toLowerCase())})},capitalize:function(){return this.replace(/\b[a-z]/g,function(a){return a.toUpperCase()})},escapeRegExp:function(){return this.replace(/([-.*+?^${}()|[\]\/\\])/g,"\\$1")},toInt:function(a){return parseInt(this,a||10)},toFloat:function(){return parseFloat(this)},hexToRgb:function(b){var a=this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);return(a)?a.slice(1).hexToRgb(b):null},rgbToHex:function(b){var a=this.match(/\d{1,3}/g);return(a)?a.rgbToHex(b):null},stripScripts:function(b){var a="";var c=this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,function(){a+=arguments[1]+"\n";return""});if(b===true){$exec(a)}else{if($type(b)=="function"){b(a,c)}}return c},substitute:function(a,b){return this.replace(b||(/\\?\{([^{}]+)\}/g),function(d,c){if(d.charAt(0)=="\\"){return d.slice(1)}return(a[c]!=undefined)?a[c]:""})}});try{delete Function.prototype.bind}catch(e){}Function.implement({extend:function(a){for(var b in a){this[b]=a[b]}return this},create:function(b){var a=this;b=b||{};return function(d){var c=b.arguments;c=(c!=undefined)?$splat(c):Array.slice(arguments,(b.event)?1:0);if(b.event){c=[d||window.event].extend(c)}var f=function(){return a.apply(b.bind||null,c)};if(b.delay){return setTimeout(f,b.delay)}if(b.periodical){return setInterval(f,b.periodical)}if(b.attempt){return $try(f)}return f()}},run:function(a,b){return this.apply(b,$splat(a))},pass:function(a,b){return this.create({bind:b,arguments:a})},bind:function(b,a){return this.create({bind:b,arguments:a})},bindWithEvent:function(b,a){return this.create({bind:b,arguments:a,event:true})},attempt:function(a,b){return this.create({bind:b,arguments:a,attempt:true})()},delay:function(b,c,a){return this.create({bind:c,arguments:a,delay:b})()},periodical:function(c,b,a){return this.create({bind:b,arguments:a,periodical:c})()}});Number.implement({limit:function(b,a){return Math.min(a,Math.max(b,this))},round:function(a){a=Math.pow(10,a||0);return Math.round(this*a)/a},times:function(b,c){for(var a=0;a<this;a++){b.call(c,a,this)}},toFloat:function(){return parseFloat(this)},toInt:function(a){return parseInt(this,a||10)}});Number.alias("times","each");(function(b){var a={};b.each(function(c){if(!Number[c]){a[c]=function(){return Math[c].apply(null,[this].concat($A(arguments)))}}});Number.implement(a)})(["abs","acos","asin","atan","atan2","ceil","cos","exp","floor","log","max","min","pow","sin","sqrt","tan"]);Hash.implement({has:Object.prototype.hasOwnProperty,keyOf:function(b){for(var a in this){if(this.hasOwnProperty(a)&&this[a]===b){return a}}return null},hasValue:function(a){return(Hash.keyOf(this,a)!==null)},extend:function(a){Hash.each(a||{},function(c,b){Hash.set(this,b,c)},this);return this},combine:function(a){Hash.each(a||{},function(c,b){Hash.include(this,b,c)},this);return this},erase:function(a){if(this.hasOwnProperty(a)){delete this[a]}return this},get:function(a){return(this.hasOwnProperty(a))?this[a]:null},set:function(a,b){if(!this[a]||this.hasOwnProperty(a)){this[a]=b}return this},empty:function(){Hash.each(this,function(b,a){delete this[a]},this);return this},include:function(a,b){if(this[a]==undefined){this[a]=b}return this},map:function(b,c){var a=new Hash;Hash.each(this,function(f,d){a.set(d,b.call(c,f,d,this))},this);return a},filter:function(b,c){var a=new Hash;Hash.each(this,function(f,d){if(b.call(c,f,d,this)){a.set(d,f)}},this);return a},every:function(b,c){for(var a in this){if(this.hasOwnProperty(a)&&!b.call(c,this[a],a)){return false}}return true},some:function(b,c){for(var a in this){if(this.hasOwnProperty(a)&&b.call(c,this[a],a)){return true}}return false},getKeys:function(){var a=[];Hash.each(this,function(c,b){a.push(b)});return a},getValues:function(){var a=[];Hash.each(this,function(b){a.push(b)});return a},toQueryString:function(a){var b=[];Hash.each(this,function(g,f){if(a){f=a+"["+f+"]"}var d;switch($type(g)){case"object":d=Hash.toQueryString(g,f);break;case"array":var c={};g.each(function(j,h){c[h]=j});d=Hash.toQueryString(c,f);break;default:d=f+"="+encodeURIComponent(g)}if(g!=undefined){b.push(d)}});return b.join("&")}});Hash.alias({keyOf:"indexOf",hasValue:"contains"});function Class(b){if(b instanceof Function){b={initialize:b}}var a=function(){Object.reset(this);if(a._prototyping){return this}this._current=$empty;var c=(this.initialize)?this.initialize.apply(this,arguments):this;delete this._current;delete this.caller;return c}.extend(this);a.implement(b);a.constructor=Class;a.prototype.constructor=a;return a}Function.prototype.protect=function(){this._protected=true;return this};Object.reset=function(a,c){if(c==null){for(var f in a){Object.reset(a,f)}return a}delete a[c];switch($type(a[c])){case"object":var d=function(){};d.prototype=a[c];var b=new d;a[c]=Object.reset(b);break;case"array":a[c]=$unlink(a[c]);break}return a};new Native({name:"Class",initialize:Class}).extend({instantiate:function(b){b._prototyping=true;var a=new b;delete b._prototyping;return a},wrap:function(a,b,c){if(c._origin){c=c._origin}return function(){if(c._protected&&this._current==null){throw new Error('The method "'+b+'" cannot be called.')}var f=this.caller,g=this._current;this.caller=g;this._current=arguments.callee;var d=c.apply(this,arguments);this._current=g;this.caller=f;return d}.extend({_owner:a,_origin:c,_name:b})}});Class.implement({implement:function(a,d){if($type(a)=="object"){for(var f in a){this.implement(f,a[f])}return this}var g=Class.Mutators[a];if(g){d=g.call(this,d);if(d==null){return this}}var c=this.prototype;switch($type(d)){case"function":if(d._hidden){return this}c[a]=Class.wrap(this,a,d);break;case"object":var b=c[a];if($type(b)=="object"){$mixin(b,d)}else{c[a]=$unlink(d)}break;case"array":c[a]=$unlink(d);break;default:c[a]=d}return this}});Class.Mutators={Extends:function(a){this.parent=a;this.prototype=Class.instantiate(a);this.implement("parent",function(){var b=this.caller._name,c=this.caller._owner.parent.prototype[b];if(!c){throw new Error('The method "'+b+'" has no parent.')}return c.apply(this,arguments)}.protect())},Implements:function(a){$splat(a).each(function(b){if(b instanceof Function){b=Class.instantiate(b)}this.implement(b)},this)}};var Chain=new Class({$chain:[],chain:function(){this.$chain.extend(Array.flatten(arguments));return this},callChain:function(){return(this.$chain.length)?this.$chain.shift().apply(this,arguments):false},clearChain:function(){this.$chain.empty();return this}});var Events=new Class({$events:{},addEvent:function(c,b,a){c=Events.removeOn(c);if(b!=$empty){this.$events[c]=this.$events[c]||[];this.$events[c].include(b);if(a){b.internal=true}}return this},addEvents:function(a){for(var b in a){this.addEvent(b,a[b])}return this},fireEvent:function(c,b,a){c=Events.removeOn(c);if(!this.$events||!this.$events[c]){return this}this.$events[c].each(function(d){d.create({bind:this,delay:a,"arguments":b})()},this);return this},removeEvent:function(b,a){b=Events.removeOn(b);if(!this.$events[b]){return this}if(!a.internal){this.$events[b].erase(a)}return this},removeEvents:function(c){var d;if($type(c)=="object"){for(d in c){this.removeEvent(d,c[d])}return this}if(c){c=Events.removeOn(c)}for(d in this.$events){if(c&&c!=d){continue}var b=this.$events[d];for(var a=b.length;a--;a){this.removeEvent(d,b[a])}}return this}});Events.removeOn=function(a){return a.replace(/^on([A-Z])/,function(b,c){return c.toLowerCase()})};var Options=new Class({setOptions:function(){this.options=$merge.run([this.options].extend(arguments));if(!this.addEvent){return this}for(var a in this.options){if($type(this.options[a])!="function"||!(/^on[A-Z]/).test(a)){continue}this.addEvent(a,this.options[a]);delete this.options[a]}return this}});var Browser=$merge({Engine:{name:"unknown",version:0},Platform:{name:(window.orientation!=undefined)?"ipod":(navigator.platform.match(/mac|win|linux/i)||["other"])[0].toLowerCase()},Features:{xpath:!!(document.evaluate),air:!!(window.runtime),query:!!(document.querySelector)},Plugins:{},Engines:{presto:function(){return(!window.opera)?false:((arguments.callee.caller)?960:((document.getElementsByClassName)?950:925))},trident:function(){return(!window.ActiveXObject)?false:((window.XMLHttpRequest)?((document.querySelectorAll)?6:5):4)},webkit:function(){return(navigator.taintEnabled)?false:((Browser.Features.xpath)?((Browser.Features.query)?525:420):419)},gecko:function(){return(!document.getBoxObjectFor&&window.mozInnerScreenX==null)?false:((document.getElementsByClassName)?19:18)}}},Browser||{});Browser.Platform[Browser.Platform.name]=true;Browser.detect=function(){for(var b in this.Engines){var a=this.Engines[b]();if(a){this.Engine={name:b,version:a};this.Engine[b]=this.Engine[b+a]=true;break}}return{name:b,version:a}};Browser.detect();Browser.Request=function(){return $try(function(){return new XMLHttpRequest()},function(){return new ActiveXObject("MSXML2.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")})};Browser.Features.xhr=!!(Browser.Request());Browser.Plugins.Flash=(function(){var a=($try(function(){return navigator.plugins["Shockwave Flash"].description},function(){return new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version")})||"0 r0").match(/\d+/g);return{version:parseInt(a[0]||0+"."+a[1],10)||0,build:parseInt(a[2],10)||0}})();function $exec(b){if(!b){return b}if(window.execScript){window.execScript(b)}else{var a=document.createElement("script");a.setAttribute("type","text/javascript");a[(Browser.Engine.webkit&&Browser.Engine.version<420)?"innerText":"text"]=b;document.head.appendChild(a);document.head.removeChild(a)}return b}Native.UID=1;var $uid=(Browser.Engine.trident)?function(a){return(a.uid||(a.uid=[Native.UID++]))[0]}:function(a){return a.uid||(a.uid=Native.UID++)};var Window=new Native({name:"Window",legacy:(Browser.Engine.trident)?null:window.Window,initialize:function(a){$uid(a);if(!a.Element){a.Element=$empty;if(Browser.Engine.webkit){a.document.createElement("iframe")}a.Element.prototype=(Browser.Engine.webkit)?window["[[DOMElement.prototype]]"]:{}}a.document.window=a;return $extend(a,Window.Prototype)},afterImplement:function(b,a){window[b]=Window.Prototype[b]=a}});Window.Prototype={$family:{name:"window"}};new Window(window);var Document=new Native({name:"Document",legacy:(Browser.Engine.trident)?null:window.Document,initialize:function(a){$uid(a);a.head=a.getElementsByTagName("head")[0];a.html=a.getElementsByTagName("html")[0];if(Browser.Engine.trident&&Browser.Engine.version<=4){$try(function(){a.execCommand("BackgroundImageCache",false,true)})}if(Browser.Engine.trident){a.window.attachEvent("onunload",function(){a.window.detachEvent("onunload",arguments.callee);a.head=a.html=a.window=null})}return $extend(a,Document.Prototype)},afterImplement:function(b,a){document[b]=Document.Prototype[b]=a}});Document.Prototype={$family:{name:"document"}};new Document(document);var Element=new Native({name:"Element",legacy:window.Element,initialize:function(a,b){var c=Element.Constructors.get(a);if(c){return c(b)}if(typeof a=="string"){return document.newElement(a,b)}return document.id(a).set(b)},afterImplement:function(a,b){Element.Prototype[a]=b;if(Array[a]){return}Elements.implement(a,function(){var c=[],h=true;for(var f=0,d=this.length;f<d;f++){var g=this[f][a].apply(this[f],arguments);c.push(g);if(h){h=($type(g)=="element")}}return(h)?new Elements(c):c})}});Element.Prototype={$family:{name:"element"}};Element.Constructors=new Hash;var IFrame=new Native({name:"IFrame",generics:false,initialize:function(){var g=Array.link(arguments,{properties:Object.type,iframe:$defined});var d=g.properties||{};var c=document.id(g.iframe);var f=d.onload||$empty;delete d.onload;d.id=d.name=$pick(d.id,d.name,c?(c.id||c.name):"IFrame_"+$time());c=new Element(c||"iframe",d);var b=function(){var h=$try(function(){return c.contentWindow.location.host});if(!h||h==window.location.host){var i=new Window(c.contentWindow);new Document(c.contentWindow.document);$extend(i.Element.prototype,Element.Prototype)}f.call(c.contentWindow,c.contentWindow.document)};var a=$try(function(){return c.contentWindow});((a&&a.document.body)||window.frames[d.id])?b():c.addListener("load",b);return c}});var Elements=new Native({initialize:function(g,b){b=$extend({ddup:true,cash:true},b);g=g||[];if(b.ddup||b.cash){var h={},f=[];for(var c=0,a=g.length;c<a;c++){var d=document.id(g[c],!b.cash);if(b.ddup){if(h[d.uid]){continue}h[d.uid]=true}if(d){f.push(d)}}g=f}return(b.cash)?$extend(g,this):g}});Elements.implement({filter:function(a,b){if(!a){return this}return new Elements(Array.filter(this,(typeof a=="string")?function(c){return c.match(a)}:a,b))}});(function(){var d;try{var a=document.createElement("<input name=x>");d=(a.name=="x")}catch(b){}var c=function(f){return(""+f).replace(/&/g,"&amp;").replace(/"/g,"&quot;")};Document.implement({newElement:function(f,g){if(g&&g.checked!=null){g.defaultChecked=g.checked}if(d&&g){f="<"+f;if(g.name){f+=' name="'+c(g.name)+'"'}if(g.type){f+=' type="'+c(g.type)+'"'}f+=">";delete g.name;delete g.type}return this.id(this.createElement(f)).set(g)},newTextNode:function(f){return this.createTextNode(f)},getDocument:function(){return this},getWindow:function(){return this.window},id:(function(){var f={string:function(i,h,g){i=g.getElementById(i);return(i)?f.element(i,h):null},element:function(g,j){$uid(g);if(!j&&!g.$family&&!(/^object|embed$/i).test(g.tagName)){var h=Element.Prototype;for(var i in h){g[i]=h[i]}}return g},object:function(h,i,g){if(h.toElement){return f.element(h.toElement(g),i)}return null}};f.textnode=f.whitespace=f.window=f.document=$arguments(0);return function(h,j,i){if(h&&h.$family&&h.uid){return h}var g=$type(h);return(f[g])?f[g](h,j,i||document):null}})()})})();if(window.$==null){Window.implement({$:function(a,b){return document.id(a,b,this.document)}})}Window.implement({$$:function(a){if(arguments.length==1&&typeof a=="string"){return this.document.getElements(a)}var g=[];var c=Array.flatten(arguments);for(var d=0,b=c.length;d<b;d++){var f=c[d];switch($type(f)){case"element":g.push(f);break;case"string":g.extend(this.document.getElements(f,true))}}return new Elements(g)},getDocument:function(){return this.document},getWindow:function(){return this}});Native.implement([Element,Document],{getElement:function(a,b){return document.id(this.getElements(a,true)[0]||null,b)},getElements:function(a,d){a=a.split(",");var c=[];var b=(a.length>1);a.each(function(f){var g=this.getElementsByTagName(f.trim());(b)?c.extend(g):c=g},this);return new Elements(c,{ddup:b,cash:!d})}});(function(){var i={},g={};var j={input:"checked",option:"selected",textarea:(Browser.Engine.webkit&&Browser.Engine.version<420)?"innerHTML":"value"};var c=function(m){return(g[m]||(g[m]={}))};var h=function(o,m){if(!o){return}var n=o.uid;if(m!==true){m=false}if(Browser.Engine.trident){if(o.clearAttributes){var r=m&&o.cloneNode(false);o.clearAttributes();if(r){o.mergeAttributes(r)}}else{if(o.removeEvents){o.removeEvents()}}if((/object/i).test(o.tagName)){for(var q in o){if(typeof o[q]=="function"){o[q]=$empty}}Element.dispose(o)}}if(!n){return}i[n]=g[n]=null};var d=function(){Hash.each(i,h);if(Browser.Engine.trident){$A(document.getElementsByTagName("object")).each(h)}if(window.CollectGarbage){CollectGarbage()}i=g=null};var k=function(o,m,t,n,q,s){var p=o[t||m];var r=[];while(p){if(p.nodeType==1&&(!n||Element.match(p,n))){if(!q){return document.id(p,s)}r.push(p)}p=p[m]}return(q)?new Elements(r,{ddup:false,cash:!s}):null};var f={html:"innerHTML","class":"className","for":"htmlFor",defaultValue:"defaultValue",text:(Browser.Engine.trident||(Browser.Engine.webkit&&Browser.Engine.version<420))?"innerText":"textContent"};var b=["compact","nowrap","ismap","declare","noshade","checked","disabled","readonly","multiple","selected","noresize","defer"];var l=["value","type","defaultValue","accessKey","cellPadding","cellSpacing","colSpan","frameBorder","maxLength","readOnly","rowSpan","tabIndex","useMap"];b=b.associate(b);Hash.extend(f,b);Hash.extend(f,l.associate(l.map(String.toLowerCase)));var a={before:function(n,m){if(m.parentNode){m.parentNode.insertBefore(n,m)}},after:function(n,m){if(!m.parentNode){return}var o=m.nextSibling;(o)?m.parentNode.insertBefore(n,o):m.parentNode.appendChild(n)},bottom:function(n,m){m.appendChild(n)},top:function(n,m){var o=m.firstChild;(o)?m.insertBefore(n,o):m.appendChild(n)}};a.inside=a.bottom;Hash.each(a,function(m,n){n=n.capitalize();Element.implement("inject"+n,function(o){m(this,document.id(o,true));return this});Element.implement("grab"+n,function(o){m(document.id(o,true),this);return this})});Element.implement({set:function(q,n){switch($type(q)){case"object":for(var o in q){this.set(o,q[o])}break;case"string":var m=Element.Properties.get(q);(m&&m.set)?m.set.apply(this,Array.slice(arguments,1)):this.setProperty(q,n)}return this},get:function(n){var m=Element.Properties.get(n);return(m&&m.get)?m.get.apply(this,Array.slice(arguments,1)):this.getProperty(n)},erase:function(n){var m=Element.Properties.get(n);(m&&m.erase)?m.erase.apply(this):this.removeProperty(n);return this},setProperty:function(n,o){var m=f[n];if(o==undefined){return this.removeProperty(n)}if(m&&b[n]){o=!!o}(m)?this[m]=o:this.setAttribute(n,""+o);return this},setProperties:function(m){for(var n in m){this.setProperty(n,m[n])}return this},getProperty:function(n){var m=f[n];var o=(m)?this[m]:this.getAttribute(n,2);return(b[n])?!!o:(m)?o:o||null},getProperties:function(){var m=$A(arguments);return m.map(this.getProperty,this).associate(m)},removeProperty:function(n){var m=f[n];(m)?this[m]=(m&&b[n])?false:"":this.removeAttribute(n);return this},removeProperties:function(){Array.each(arguments,this.removeProperty,this);return this},hasClass:function(m){return this.className.contains(m," ")},addClass:function(m){if(!this.hasClass(m)){this.className=(this.className+" "+m).clean()}return this},removeClass:function(m){this.className=this.className.replace(new RegExp("(^|\\s)"+m+"(?:\\s|$)"),"$1");return this},toggleClass:function(m){return this.hasClass(m)?this.removeClass(m):this.addClass(m)},adopt:function(){Array.flatten(arguments).each(function(m){m=document.id(m,true);if(m){this.appendChild(m)}},this);return this},appendText:function(n,m){return this.grab(this.getDocument().newTextNode(n),m)},grab:function(n,m){a[m||"bottom"](document.id(n,true),this);return this},inject:function(n,m){a[m||"bottom"](this,document.id(n,true));return this},replaces:function(m){m=document.id(m,true);m.parentNode.replaceChild(this,m);return this},wraps:function(n,m){n=document.id(n,true);return this.replaces(n).grab(n,m)},getPrevious:function(m,n){return k(this,"previousSibling",null,m,false,n)},getAllPrevious:function(m,n){return k(this,"previousSibling",null,m,true,n)},getNext:function(m,n){return k(this,"nextSibling",null,m,false,n)},getAllNext:function(m,n){return k(this,"nextSibling",null,m,true,n)},getFirst:function(m,n){return k(this,"nextSibling","firstChild",m,false,n)},getLast:function(m,n){return k(this,"previousSibling","lastChild",m,false,n)},getParent:function(m,n){return k(this,"parentNode",null,m,false,n)},getParents:function(m,n){return k(this,"parentNode",null,m,true,n)},getSiblings:function(m,n){return this.getParent().getChildren(m,n).erase(this)},getChildren:function(m,n){return k(this,"nextSibling","firstChild",m,true,n)},getWindow:function(){return this.ownerDocument.window},getDocument:function(){return this.ownerDocument},getElementById:function(p,o){var n=this.ownerDocument.getElementById(p);if(!n){return null}for(var m=n.parentNode;m!=this;m=m.parentNode){if(!m){return null}}return document.id(n,o)},getSelected:function(){return new Elements($A(this.options).filter(function(m){return m.selected}))},getComputedStyle:function(n){if(this.currentStyle){return this.currentStyle[n.camelCase()]}var m=this.getDocument().defaultView.getComputedStyle(this,null);return(m)?m.getPropertyValue([n.hyphenate()]):null},toQueryString:function(){var m=[];this.getElements("input, select, textarea",true).each(function(n){if(!n.name||n.disabled||n.type=="submit"||n.type=="reset"||n.type=="file"){return}var o=(n.tagName.toLowerCase()=="select")?Element.getSelected(n).map(function(p){return p.value}):((n.type=="radio"||n.type=="checkbox")&&!n.checked)?null:n.value;$splat(o).each(function(p){if(typeof p!="undefined"){m.push(n.name+"="+encodeURIComponent(p))}})});return m.join("&")},clone:function(p,m){p=p!==false;var s=this.cloneNode(p);var o=function(w,v){if(!m){w.removeAttribute("id")}if(Browser.Engine.trident){w.clearAttributes();w.mergeAttributes(v);w.removeAttribute("uid");if(w.options){var x=w.options,t=v.options;for(var u=x.length;u--;){x[u].selected=t[u].selected}}}var y=j[v.tagName.toLowerCase()];if(y&&v[y]){w[y]=v[y]}};if(p){var q=s.getElementsByTagName("*"),r=this.getElementsByTagName("*");for(var n=q.length;n--;){o(q[n],r[n])}}o(s,this);return document.id(s)},destroy:function(){Element.empty(this);Element.dispose(this);h(this,true);return null},empty:function(){$A(this.childNodes).each(function(m){Element.destroy(m)});return this},dispose:function(){return(this.parentNode)?this.parentNode.removeChild(this):this},hasChild:function(m){m=document.id(m,true);if(!m){return false}if(Browser.Engine.webkit&&Browser.Engine.version<420){return $A(this.getElementsByTagName(m.tagName)).contains(m)}return(this.contains)?(this!=m&&this.contains(m)):!!(this.compareDocumentPosition(m)&16)},match:function(m){return(!m||(m==this)||(Element.get(this,"tag")==m))}});Native.implement([Element,Window,Document],{addListener:function(p,o){if(p=="unload"){var m=o,n=this;o=function(){n.removeListener("unload",o);m()}}else{i[this.uid]=this}if(this.addEventListener){this.addEventListener(p,o,false)}else{this.attachEvent("on"+p,o)}return this},removeListener:function(n,m){if(this.removeEventListener){this.removeEventListener(n,m,false)}else{this.detachEvent("on"+n,m)}return this},retrieve:function(n,m){var p=c(this.uid),o=p[n];if(m!=undefined&&o==undefined){o=p[n]=m}return $pick(o)},store:function(n,m){var o=c(this.uid);o[n]=m;return this},eliminate:function(m){var n=c(this.uid);delete n[m];return this}});window.addListener("unload",d)})();Element.Properties=new Hash;Element.Properties.style={set:function(a){this.style.cssText=a},get:function(){return this.style.cssText},erase:function(){this.style.cssText=""}};Element.Properties.tag={get:function(){return this.tagName.toLowerCase()}};Element.Properties.html=(function(){var c=document.createElement("div");var a={table:[1,"<table>","</table>"],select:[1,"<select>","</select>"],tbody:[2,"<table><tbody>","</tbody></table>"],tr:[3,"<table><tbody><tr>","</tr></tbody></table>"]};a.thead=a.tfoot=a.tbody;var b={set:function(){var f=Array.flatten(arguments).join("");var g=Browser.Engine.trident&&a[this.get("tag")];if(g){var h=c;h.innerHTML=g[1]+f+g[2];for(var d=g[0];d--;){h=h.firstChild}this.empty().adopt(h.childNodes)}else{this.innerHTML=f}}};b.erase=b.set;return b})();if(Browser.Engine.webkit&&Browser.Engine.version<420){Element.Properties.text={get:function(){if(this.innerText){return this.innerText}var a=this.ownerDocument.newElement("div",{html:this.innerHTML}).inject(this.ownerDocument.body);var b=a.innerText;a.destroy();return b}}}(function(){Element.implement({scrollTo:function(i,j){if(b(this)){this.getWindow().scrollTo(i,j)}else{this.scrollLeft=i;this.scrollTop=j}return this},getSize:function(){if(b(this)){return this.getWindow().getSize()}return{x:this.offsetWidth,y:this.offsetHeight}},getScrollSize:function(){if(b(this)){return this.getWindow().getScrollSize()}return{x:this.scrollWidth,y:this.scrollHeight}},getScroll:function(){if(b(this)){return this.getWindow().getScroll()}return{x:this.scrollLeft,y:this.scrollTop}},getScrolls:function(){var j=this,i={x:0,y:0};while(j&&!b(j)){i.x+=j.scrollLeft;i.y+=j.scrollTop;j=j.parentNode}return i},getOffsetParent:function(){var i=this;if(b(i)){return null}if(!Browser.Engine.trident){return i.offsetParent}while((i=i.parentNode)&&!b(i)){if(d(i,"position")!="static"){return i}}return null},getOffsets:function(){if(this.getBoundingClientRect){var k=this.getBoundingClientRect(),n=document.id(this.getDocument().documentElement),q=n.getScroll(),l=this.getScrolls(),j=this.getScroll(),i=(d(this,"position")=="fixed");return{x:k.left.toInt()+l.x-j.x+((i)?0:q.x)-n.clientLeft,y:k.top.toInt()+l.y-j.y+((i)?0:q.y)-n.clientTop}}var m=this,o={x:0,y:0};if(b(this)){return o}while(m&&!b(m)){o.x+=m.offsetLeft;o.y+=m.offsetTop;if(Browser.Engine.gecko){if(!g(m)){o.x+=c(m);o.y+=h(m)}var p=m.parentNode;if(p&&d(p,"overflow")!="visible"){o.x+=c(p);o.y+=h(p)}}else{if(m!=this&&Browser.Engine.webkit){o.x+=c(m);o.y+=h(m)}}m=m.offsetParent}if(Browser.Engine.gecko&&!g(this)){o.x-=c(this);o.y-=h(this)}return o},getPosition:function(l){if(b(this)){return{x:0,y:0}}var m=this.getOffsets(),j=this.getScrolls();var i={x:m.x-j.x,y:m.y-j.y};var k=(l&&(l=document.id(l)))?l.getPosition():{x:0,y:0};return{x:i.x-k.x,y:i.y-k.y}},getCoordinates:function(k){if(b(this)){return this.getWindow().getCoordinates()}var i=this.getPosition(k),j=this.getSize();var l={left:i.x,top:i.y,width:j.x,height:j.y};l.right=l.left+l.width;l.bottom=l.top+l.height;return l},computePosition:function(i){return{left:i.x-f(this,"margin-left"),top:i.y-f(this,"margin-top")}},setPosition:function(i){return this.setStyles(this.computePosition(i))}});Native.implement([Document,Window],{getSize:function(){if(Browser.Engine.presto||Browser.Engine.webkit){var j=this.getWindow();return{x:j.innerWidth,y:j.innerHeight}}var i=a(this);return{x:i.clientWidth,y:i.clientHeight}},getScroll:function(){var j=this.getWindow(),i=a(this);return{x:j.pageXOffset||i.scrollLeft,y:j.pageYOffset||i.scrollTop}},getScrollSize:function(){var j=a(this),i=this.getSize();return{x:Math.max(j.scrollWidth,i.x),y:Math.max(j.scrollHeight,i.y)}},getPosition:function(){return{x:0,y:0}},getCoordinates:function(){var i=this.getSize();return{top:0,left:0,bottom:i.y,right:i.x,height:i.y,width:i.x}}});var d=Element.getComputedStyle;function f(i,j){return d(i,j).toInt()||0}function g(i){return d(i,"-moz-box-sizing")=="border-box"}function h(i){return f(i,"border-top-width")}function c(i){return f(i,"border-left-width")}function b(i){return(/^(?:body|html)$/i).test(i.tagName)}function a(i){var j=i.getDocument();return(!j.compatMode||j.compatMode=="CSS1Compat")?j.html:j.body}})();Element.alias("setPosition","position");Native.implement([Window,Document,Element],{getHeight:function(){return this.getSize().y},getWidth:function(){return this.getSize().x},getScrollTop:function(){return this.getScroll().y},getScrollLeft:function(){return this.getScroll().x},getScrollHeight:function(){return this.getScrollSize().y},getScrollWidth:function(){return this.getScrollSize().x},getTop:function(){return this.getPosition().y},getLeft:function(){return this.getPosition().x}});var Event=new Native({name:"Event",initialize:function(a,g){g=g||window;var l=g.document;a=a||g.event;if(a.$extended){return a}this.$extended=true;var k=a.type;var h=a.target||a.srcElement;while(h&&h.nodeType==3){h=h.parentNode}if(k.test(/key/)){var b=a.which||a.keyCode;var n=Event.Keys.keyOf(b);if(k=="keydown"){var d=b-111;if(d>0&&d<13){n="f"+d}}n=n||String.fromCharCode(b).toLowerCase()}else{if(k.match(/(click|mouse|menu)/i)){l=(!l.compatMode||l.compatMode=="CSS1Compat")?l.html:l.body;var j={x:a.pageX||a.clientX+l.scrollLeft,y:a.pageY||a.clientY+l.scrollTop};var c={x:(a.pageX)?a.pageX-g.pageXOffset:a.clientX,y:(a.pageY)?a.pageY-g.pageYOffset:a.clientY};if(k.match(/DOMMouseScroll|mousewheel/)){var i=(a.wheelDelta)?a.wheelDelta/120:-(a.detail||0)/3}var f=(a.which==3)||(a.button==2);var m=null;if(k.match(/over|out/)){switch(k){case"mouseover":m=a.relatedTarget||a.fromElement;break;case"mouseout":m=a.relatedTarget||a.toElement}if(!(function(){while(m&&m.nodeType==3){m=m.parentNode}return true}).create({attempt:Browser.Engine.gecko})()){m=false}}}}return $extend(this,{event:a,type:k,page:j,client:c,rightClick:f,wheel:i,relatedTarget:m,target:h,code:b,key:n,shift:a.shiftKey,control:a.ctrlKey,alt:a.altKey,meta:a.metaKey})}});Event.Keys=new Hash({enter:13,up:38,down:40,left:37,right:39,esc:27,space:32,backspace:8,tab:9,"delete":46});Event.implement({stop:function(){return this.stopPropagation().preventDefault()},stopPropagation:function(){if(this.event.stopPropagation){this.event.stopPropagation()}else{this.event.cancelBubble=true}return this},preventDefault:function(){if(this.event.preventDefault){this.event.preventDefault()}else{this.event.returnValue=false}return this}});Element.Properties.events={set:function(a){this.addEvents(a)}};Native.implement([Element,Window,Document],{addEvent:function(f,h){var i=this.retrieve("events",{});i[f]=i[f]||{keys:[],values:[]};if(i[f].keys.contains(h)){return this}i[f].keys.push(h);var g=f,a=Element.Events.get(f),c=h,j=this;if(a){if(a.onAdd){a.onAdd.call(this,h)}if(a.condition){c=function(k){if(a.condition.call(this,k)){return h.call(this,k)}return true}}g=a.base||g}var d=function(){return h.call(j)};var b=Element.NativeEvents[g];if(b){if(b==2){d=function(k){k=new Event(k,j.getWindow());if(c.call(j,k)===false){k.stop()}}}this.addListener(g,d)}i[f].values.push(d);return this},removeEvent:function(c,b){var a=this.retrieve("events");if(!a||!a[c]){return this}var g=a[c].keys.indexOf(b);if(g==-1){return this}a[c].keys.splice(g,1);var f=a[c].values.splice(g,1)[0];var d=Element.Events.get(c);if(d){if(d.onRemove){d.onRemove.call(this,b)}c=d.base||c}return(Element.NativeEvents[c])?this.removeListener(c,f):this},addEvents:function(a){for(var b in a){this.addEvent(b,a[b])}return this},removeEvents:function(a){var c;if($type(a)=="object"){for(c in a){this.removeEvent(c,a[c])}return this}var b=this.retrieve("events");if(!b){return this}if(!a){for(c in b){this.removeEvents(c)}this.eliminate("events")}else{if(b[a]){while(b[a].keys[0]){this.removeEvent(a,b[a].keys[0])}b[a]=null}}return this},fireEvent:function(d,b,a){var c=this.retrieve("events");if(!c||!c[d]){return this}c[d].keys.each(function(f){f.create({bind:this,delay:a,"arguments":b})()},this);return this},cloneEvents:function(d,a){d=document.id(d);var c=d.retrieve("events");if(!c){return this}if(!a){for(var b in c){this.cloneEvents(d,b)}}else{if(c[a]){c[a].keys.each(function(f){this.addEvent(a,f)},this)}}return this}});try{if(typeof HTMLElement!="undefined"){HTMLElement.prototype.fireEvent=Element.prototype.fireEvent}}catch(e){}Element.NativeEvents={click:2,dblclick:2,mouseup:2,mousedown:2,contextmenu:2,mousewheel:2,DOMMouseScroll:2,mouseover:2,mouseout:2,mousemove:2,selectstart:2,selectend:2,keydown:2,keypress:2,keyup:2,focus:2,blur:2,change:2,reset:2,select:2,submit:2,load:1,unload:1,beforeunload:2,resize:1,move:1,DOMContentLoaded:1,readystatechange:1,error:1,abort:1,scroll:1};(function(){var a=function(b){var c=b.relatedTarget;if(c==undefined){return true}if(c===false){return false}return($type(this)!="document"&&c!=this&&c.prefix!="xul"&&!this.hasChild(c))};Element.Events=new Hash({mouseenter:{base:"mouseover",condition:a},mouseleave:{base:"mouseout",condition:a},mousewheel:{base:(Browser.Engine.gecko)?"DOMMouseScroll":"mousewheel"}})})();Element.Properties.styles={set:function(a){this.setStyles(a)}};Element.Properties.opacity={set:function(a,b){if(!b){if(a==0){if(this.style.visibility!="hidden"){this.style.visibility="hidden"}}else{if(this.style.visibility!="visible"){this.style.visibility="visible"}}}if(!this.currentStyle||!this.currentStyle.hasLayout){this.style.zoom=1}if(Browser.Engine.trident){this.style.filter=(a==1)?"":"alpha(opacity="+a*100+")"}this.style.opacity=a;this.store("opacity",a)},get:function(){return this.retrieve("opacity",1)}};Element.implement({setOpacity:function(a){return this.set("opacity",a,true)},getOpacity:function(){return this.get("opacity")},setStyle:function(b,a){switch(b){case"opacity":return this.set("opacity",parseFloat(a));case"float":b=(Browser.Engine.trident)?"styleFloat":"cssFloat"}b=b.camelCase();if($type(a)!="string"){var c=(Element.Styles.get(b)||"@").split(" ");a=$splat(a).map(function(f,d){if(!c[d]){return""}return($type(f)=="number")?c[d].replace("@",Math.round(f)):f}).join(" ")}else{if(a==String(Number(a))){a=Math.round(a)}}this.style[b]=a;return this},getStyle:function(h){switch(h){case"opacity":return this.get("opacity");case"float":h=(Browser.Engine.trident)?"styleFloat":"cssFloat"}h=h.camelCase();var a=this.style[h];if(!$chk(a)){a=[];for(var g in Element.ShortStyles){if(h!=g){continue}for(var f in Element.ShortStyles[g]){a.push(this.getStyle(f))}return a.join(" ")}a=this.getComputedStyle(h)}if(a){a=String(a);var c=a.match(/rgba?\([\d\s,]+\)/);if(c){a=a.replace(c[0],c[0].rgbToHex())}}if(Browser.Engine.presto||(Browser.Engine.trident&&!$chk(parseInt(a,10)))){if(h.test(/^(height|width)$/)){var b=(h=="width")?["left","right"]:["top","bottom"],d=0;b.each(function(i){d+=this.getStyle("border-"+i+"-width").toInt()+this.getStyle("padding-"+i).toInt()},this);return this["offset"+h.capitalize()]-d+"px"}if((Browser.Engine.presto)&&String(a).test("px")){return a}if(h.test(/(border(.+)Width|margin|padding)/)){return"0px"}}return a},setStyles:function(b){for(var a in b){this.setStyle(a,b[a])}return this},getStyles:function(){var a={};Array.flatten(arguments).each(function(b){a[b]=this.getStyle(b)},this);return a}});Element.Styles=new Hash({left:"@px",top:"@px",bottom:"@px",right:"@px",width:"@px",height:"@px",maxWidth:"@px",maxHeight:"@px",minWidth:"@px",minHeight:"@px",backgroundColor:"rgb(@, @, @)",backgroundPosition:"@px @px",color:"rgb(@, @, @)",fontSize:"@px",letterSpacing:"@px",lineHeight:"@px",clip:"rect(@px @px @px @px)",margin:"@px @px @px @px",padding:"@px @px @px @px",border:"@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)",borderWidth:"@px @px @px @px",borderStyle:"@ @ @ @",borderColor:"rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)",zIndex:"@",zoom:"@",fontWeight:"@",textIndent:"@px",opacity:"@"});Element.ShortStyles={margin:{},padding:{},border:{},borderWidth:{},borderStyle:{},borderColor:{}};["Top","Right","Bottom","Left"].each(function(h){var g=Element.ShortStyles;var b=Element.Styles;["margin","padding"].each(function(i){var j=i+h;g[i][j]=b[j]="@px"});var f="border"+h;g.border[f]=b[f]="@px @ rgb(@, @, @)";var d=f+"Width",a=f+"Style",c=f+"Color";g[f]={};g.borderWidth[d]=g[f][d]=b[d]="@px";g.borderStyle[a]=g[f][a]=b[a]="@";g.borderColor[c]=g[f][c]=b[c]="rgb(@, @, @)"});var Fx=new Class({Implements:[Chain,Events,Options],options:{fps:50,unit:false,duration:500,link:"ignore"},initialize:function(a){this.subject=this.subject||this;this.setOptions(a);this.options.duration=Fx.Durations[this.options.duration]||this.options.duration.toInt();var b=this.options.wait;if(b===false){this.options.link="cancel"}},getTransition:function(){return function(a){return -(Math.cos(Math.PI*a)-1)/2}},step:function(){var a=$time();if(a<this.time+this.options.duration){var b=this.transition((a-this.time)/this.options.duration);this.set(this.compute(this.from,this.to,b))}else{this.set(this.compute(this.from,this.to,1));this.complete()}},set:function(a){return a},compute:function(c,b,a){return Fx.compute(c,b,a)},check:function(){if(!this.timer){return true}switch(this.options.link){case"cancel":this.cancel();return true;case"chain":this.chain(this.caller.bind(this,arguments));return false}return false},start:function(b,a){if(!this.check(b,a)){return this}this.from=b;this.to=a;this.time=0;this.transition=this.getTransition();this.startTimer();this.onStart();return this},complete:function(){if(this.stopTimer()){this.onComplete()}return this},cancel:function(){if(this.stopTimer()){this.onCancel()}return this},onStart:function(){this.fireEvent("start",this.subject)},onComplete:function(){this.fireEvent("complete",this.subject);if(!this.callChain()){this.fireEvent("chainComplete",this.subject)}},onCancel:function(){this.fireEvent("cancel",this.subject).clearChain()},pause:function(){this.stopTimer();return this},resume:function(){this.startTimer();return this},stopTimer:function(){if(!this.timer){return false}this.time=$time()-this.time;this.timer=$clear(this.timer);return true},startTimer:function(){if(this.timer){return false}this.time=$time()-this.time;this.timer=this.step.periodical(Math.round(1000/this.options.fps),this);return true}});Fx.compute=function(c,b,a){return(b-c)*a+c};Fx.Durations={"short":250,normal:500,"long":1000};Fx.CSS=new Class({Extends:Fx,prepare:function(d,f,b){b=$splat(b);var c=b[1];if(!$chk(c)){b[1]=b[0];b[0]=d.getStyle(f)}var a=b.map(this.parse);return{from:a[0],to:a[1]}},parse:function(a){a=$lambda(a)();a=(typeof a=="string")?a.split(" "):$splat(a);return a.map(function(c){c=String(c);var b=false;Fx.CSS.Parsers.each(function(g,f){if(b){return}var d=g.parse(c);if($chk(d)){b={value:d,parser:g}}});b=b||{value:c,parser:Fx.CSS.Parsers.String};return b})},compute:function(d,c,b){var a=[];(Math.min(d.length,c.length)).times(function(f){a.push({value:d[f].parser.compute(d[f].value,c[f].value,b),parser:d[f].parser})});a.$family={name:"fx:css:value"};return a},serve:function(c,b){if($type(c)!="fx:css:value"){c=this.parse(c)}var a=[];c.each(function(d){a=a.concat(d.parser.serve(d.value,b))});return a},render:function(a,d,c,b){a.setStyle(d,this.serve(c,b))},search:function(a){if(Fx.CSS.Cache[a]){return Fx.CSS.Cache[a]}var b={};Array.each(document.styleSheets,function(f,d){var c=f.href;if(c&&c.contains("://")&&!c.contains(document.domain)){return}var g=f.rules||f.cssRules;Array.each(g,function(k,h){if(!k.style){return}var j=(k.selectorText)?k.selectorText.replace(/^\w+/,function(i){return i.toLowerCase()}):null;if(!j||!j.test("^"+a+"$")){return}Element.Styles.each(function(l,i){if(!k.style[i]||Element.ShortStyles[i]){return}l=String(k.style[i]);b[i]=(l.test(/^rgb/))?l.rgbToHex():l})})});return Fx.CSS.Cache[a]=b}});Fx.CSS.Cache={};Fx.CSS.Parsers=new Hash({Color:{parse:function(a){if(a.match(/^#[0-9a-f]{3,6}$/i)){return a.hexToRgb(true)}return((a=a.match(/(\d+),\s*(\d+),\s*(\d+)/)))?[a[1],a[2],a[3]]:false},compute:function(c,b,a){return c.map(function(f,d){return Math.round(Fx.compute(c[d],b[d],a))})},serve:function(a){return a.map(Number)}},Number:{parse:parseFloat,compute:Fx.compute,serve:function(b,a){return(a)?b+a:b}},String:{parse:$lambda(false),compute:$arguments(1),serve:$arguments(0)}});Fx.Morph=new Class({Extends:Fx.CSS,initialize:function(b,a){this.element=this.subject=document.id(b);this.parent(a)},set:function(a){if(typeof a=="string"){a=this.search(a)}for(var b in a){this.render(this.element,b,a[b],this.options.unit)}return this},compute:function(f,d,c){var a={};for(var b in f){a[b]=this.parent(f[b],d[b],c)}return a},start:function(b){if(!this.check(b)){return this}if(typeof b=="string"){b=this.search(b)}var f={},d={};for(var c in b){var a=this.prepare(this.element,c,b[c]);f[c]=a.from;d[c]=a.to}return this.parent(f,d)}});Element.Properties.morph={set:function(a){var b=this.retrieve("morph");if(b){b.cancel()}return this.eliminate("morph").store("morph:options",$extend({link:"cancel"},a))},get:function(a){if(a||!this.retrieve("morph")){if(a||!this.retrieve("morph:options")){this.set("morph",a)}this.store("morph",new Fx.Morph(this,this.retrieve("morph:options")))}return this.retrieve("morph")}};Element.implement({morph:function(a){this.get("morph").start(a);return this}});Fx.implement({getTransition:function(){var a=this.options.transition||Fx.Transitions.Sine.easeInOut;if(typeof a=="string"){var b=a.split(":");a=Fx.Transitions;a=a[b[0]]||a[b[0].capitalize()];if(b[1]){a=a["ease"+b[1].capitalize()+(b[2]?b[2].capitalize():"")]}}return a}});Fx.Transition=function(b,a){a=$splat(a);return $extend(b,{easeIn:function(c){return b(c,a)},easeOut:function(c){return 1-b(1-c,a)},easeInOut:function(c){return(c<=0.5)?b(2*c,a)/2:(2-b(2*(1-c),a))/2}})};Fx.Transitions=new Hash({linear:$arguments(0)});Fx.Transitions.extend=function(a){for(var b in a){Fx.Transitions[b]=new Fx.Transition(a[b])}};Fx.Transitions.extend({Pow:function(b,a){return Math.pow(b,a[0]||6)},Expo:function(a){return Math.pow(2,8*(a-1))},Circ:function(a){return 1-Math.sin(Math.acos(a))},Sine:function(a){return 1-Math.sin((1-a)*Math.PI/2)},Back:function(b,a){a=a[0]||1.618;return Math.pow(b,2)*((a+1)*b-a)},Bounce:function(g){var f;for(var d=0,c=1;1;d+=c,c/=2){if(g>=(7-4*d)/11){f=c*c-Math.pow((11-6*d-11*g)/4,2);break}}return f},Elastic:function(b,a){return Math.pow(2,10*--b)*Math.cos(20*b*Math.PI*(a[0]||1)/3)}});["Quad","Cubic","Quart","Quint"].each(function(b,a){Fx.Transitions[b]=new Fx.Transition(function(c){return Math.pow(c,[a+2])})});Fx.Tween=new Class({Extends:Fx.CSS,initialize:function(b,a){this.element=this.subject=document.id(b);this.parent(a)},set:function(b,a){if(arguments.length==1){a=b;b=this.property||this.options.property}this.render(this.element,b,a,this.options.unit);return this},start:function(c,f,d){if(!this.check(c,f,d)){return this}var b=Array.flatten(arguments);this.property=this.options.property||b.shift();var a=this.prepare(this.element,this.property,b);return this.parent(a.from,a.to)}});Element.Properties.tween={set:function(a){var b=this.retrieve("tween");if(b){b.cancel()}return this.eliminate("tween").store("tween:options",$extend({link:"cancel"},a))},get:function(a){if(a||!this.retrieve("tween")){if(a||!this.retrieve("tween:options")){this.set("tween",a)}this.store("tween",new Fx.Tween(this,this.retrieve("tween:options")))}return this.retrieve("tween")}};Element.implement({tween:function(a,c,b){this.get("tween").start(arguments);return this},fade:function(c){var f=this.get("tween"),d="opacity",a;c=$pick(c,"toggle");switch(c){case"in":f.start(d,1);break;case"out":f.start(d,0);break;case"show":f.set(d,1);break;case"hide":f.set(d,0);break;case"toggle":var b=this.retrieve("fade:flag",this.get("opacity")==1);f.start(d,(b)?0:1);this.store("fade:flag",!b);a=true;break;default:f.start(d,arguments)}if(!a){this.eliminate("fade:flag")}return this},highlight:function(c,a){if(!a){a=this.retrieve("highlight:original",this.getStyle("background-color"));a=(a=="transparent")?"#fff":a}var b=this.get("tween");b.start("background-color",c||"#ffff88",a).chain(function(){this.setStyle("background-color",this.retrieve("highlight:original"));b.callChain()}.bind(this));return this}});var Request=new Class({Implements:[Chain,Events,Options],options:{url:"",data:"",headers:{"X-Requested-With":"XMLHttpRequest",Accept:"text/javascript, text/html, application/xml, text/xml, */*"},async:true,format:false,method:"post",link:"ignore",isSuccess:null,emulation:true,urlEncoded:true,encoding:"utf-8",evalScripts:false,evalResponse:false,noCache:false},initialize:function(a){this.xhr=new Browser.Request();this.setOptions(a);this.options.isSuccess=this.options.isSuccess||this.isSuccess;this.headers=new Hash(this.options.headers)},onStateChange:function(){if(this.xhr.readyState!=4||!this.running){return}this.running=false;this.status=0;$try(function(){this.status=this.xhr.status}.bind(this));this.xhr.onreadystatechange=$empty;if(this.options.isSuccess.call(this,this.status)){this.response={text:this.xhr.responseText,xml:this.xhr.responseXML};this.success(this.response.text,this.response.xml)}else{this.response={text:null,xml:null};this.failure()}},isSuccess:function(){return((this.status>=200)&&(this.status<300))},processScripts:function(a){if(this.options.evalResponse||(/(ecma|java)script/).test(this.getHeader("Content-type"))){return $exec(a)}return a.stripScripts(this.options.evalScripts)},success:function(b,a){this.onSuccess(this.processScripts(b),a)},onSuccess:function(){this.fireEvent("complete",arguments).fireEvent("success",arguments).callChain()},failure:function(){this.onFailure()},onFailure:function(){this.fireEvent("complete").fireEvent("failure",this.xhr)},setHeader:function(a,b){this.headers.set(a,b);return this},getHeader:function(a){return $try(function(){return this.xhr.getResponseHeader(a)}.bind(this))},check:function(){if(!this.running){return true}switch(this.options.link){case"cancel":this.cancel();return true;case"chain":this.chain(this.caller.bind(this,arguments));return false}return false},send:function(l){if(!this.check(l)){return this}this.running=true;var j=$type(l);if(j=="string"||j=="element"){l={data:l}}var d=this.options;l=$extend({data:d.data,url:d.url,method:d.method},l);var h=l.data,b=String(l.url),a=l.method.toLowerCase();switch($type(h)){case"element":h=document.id(h).toQueryString();break;case"object":case"hash":h=Hash.toQueryString(h)}if(this.options.format){var k="format="+this.options.format;h=(h)?k+"&"+h:k}if(this.options.emulation&&!["get","post"].contains(a)){var i="_method="+a;h=(h)?i+"&"+h:i;a="post"}if(this.options.urlEncoded&&a=="post"){var c=(this.options.encoding)?"; charset="+this.options.encoding:"";this.headers.set("Content-type","application/x-www-form-urlencoded"+c)}if(this.options.noCache){var g="noCache="+new Date().getTime();h=(h)?g+"&"+h:g}var f=b.lastIndexOf("/");if(f>-1&&(f=b.indexOf("#"))>-1){b=b.substr(0,f)}if(h&&a=="get"){b=b+(b.contains("?")?"&":"?")+h;h=null}this.xhr.open(a.toUpperCase(),b,this.options.async);this.xhr.onreadystatechange=this.onStateChange.bind(this);this.headers.each(function(n,m){try{this.xhr.setRequestHeader(m,n)}catch(o){this.fireEvent("exception",[m,n])}},this);this.fireEvent("request");this.xhr.send(h);if(!this.options.async){this.onStateChange()}return this},cancel:function(){if(!this.running){return this}this.running=false;this.xhr.abort();this.xhr.onreadystatechange=$empty;this.xhr=new Browser.Request();this.fireEvent("cancel");return this}});(function(){var a={};["get","post","put","delete","GET","POST","PUT","DELETE"].each(function(b){a[b]=function(){var c=Array.link(arguments,{url:String.type,data:$defined});return this.send($extend(c,{method:b}))}});Request.implement(a)})();Element.Properties.send={set:function(a){var b=this.retrieve("send");if(b){b.cancel()}return this.eliminate("send").store("send:options",$extend({data:this,link:"cancel",method:this.get("method")||"post",url:this.get("action")},a))},get:function(a){if(a||!this.retrieve("send")){if(a||!this.retrieve("send:options")){this.set("send",a)}this.store("send",new Request(this.retrieve("send:options")))}return this.retrieve("send")}};Element.implement({send:function(a){var b=this.get("send");b.send({data:this,url:a||b.options.url});return this}});Request.HTML=new Class({Extends:Request,options:{update:false,append:false,evalScripts:true,filter:false},processHTML:function(c){var b=c.match(/<body[^>]*>([\s\S]*?)<\/body>/i);c=(b)?b[1]:c;var a=new Element("div");return $try(function(){var d="<root>"+c+"</root>",h;if(Browser.Engine.trident){h=new ActiveXObject("Microsoft.XMLDOM");h.async=false;h.loadXML(d)}else{h=new DOMParser().parseFromString(d,"text/xml")}d=h.getElementsByTagName("root")[0];if(!d){return null}for(var g=0,f=d.childNodes.length;g<f;g++){var j=Element.clone(d.childNodes[g],true,true);if(j){a.grab(j)}}return a})||a.set("html",c)},success:function(d){var c=this.options,b=this.response;b.html=d.stripScripts(function(f){b.javascript=f});var a=this.processHTML(b.html);b.tree=a.childNodes;b.elements=a.getElements("*");if(c.filter){b.tree=b.elements.filter(c.filter)}if(c.update){document.id(c.update).empty().set("html",b.html)}else{if(c.append){document.id(c.append).adopt(a.getChildren())}}if(c.evalScripts){$exec(b.javascript)}this.onSuccess(b.tree,b.elements,b.html,b.javascript)}});Element.Properties.load={set:function(a){var b=this.retrieve("load");if(b){b.cancel()}return this.eliminate("load").store("load:options",$extend({data:this,link:"cancel",update:this,method:"get"},a))},get:function(a){if(a||!this.retrieve("load")){if(a||!this.retrieve("load:options")){this.set("load",a)}this.store("load",new Request.HTML(this.retrieve("load:options")))}return this.retrieve("load")}};Element.implement({load:function(){this.get("load").send(Array.link(arguments,{data:Object.type,url:String.type}));return this}});var JSON=new Hash(this.JSON&&{stringify:JSON.stringify,parse:JSON.parse}).extend({$specialChars:{"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},$replaceChars:function(a){return JSON.$specialChars[a]||"\\u00"+Math.floor(a.charCodeAt()/16).toString(16)+(a.charCodeAt()%16).toString(16)},encode:function(b){switch($type(b)){case"string":return'"'+b.replace(/[\x00-\x1f\\"]/g,JSON.$replaceChars)+'"';case"array":return"["+String(b.map(JSON.encode).clean())+"]";case"object":case"hash":var a=[];Hash.each(b,function(f,d){var c=JSON.encode(f);if(c){a.push(JSON.encode(d)+":"+c)}});return"{"+a+"}";case"number":case"boolean":return String(b);case false:return"null"}return null},decode:function(string,secure){if($type(string)!="string"||!string.length){return null}if(secure&&!(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g,"@").replace(/"[^"\\\n\r]*"/g,""))){return null}return eval("("+string+")")}});Request.JSON=new Class({Extends:Request,options:{secure:true},initialize:function(a){this.parent(a);this.headers.extend({Accept:"application/json","X-Request":"JSON"})},success:function(a){this.response.json=JSON.decode(a,this.options.secure);this.onSuccess(this.response.json,a)}});var Cookie=new Class({Implements:Options,options:{path:false,domain:false,duration:false,secure:false,document:document},initialize:function(b,a){this.key=b;this.setOptions(a)},write:function(b){b=encodeURIComponent(b);if(this.options.domain){b+="; domain="+this.options.domain}if(this.options.path){b+="; path="+this.options.path}if(this.options.duration){var a=new Date();a.setTime(a.getTime()+this.options.duration*24*60*60*1000);b+="; expires="+a.toGMTString()}if(this.options.secure){b+="; secure"}this.options.document.cookie=this.key+"="+b;return this},read:function(){var a=this.options.document.cookie.match("(?:^|;)\\s*"+this.key.escapeRegExp()+"=([^;]*)");return(a)?decodeURIComponent(a[1]):null},dispose:function(){new Cookie(this.key,$merge(this.options,{duration:-1})).write("");return this}});Cookie.write=function(b,c,a){return new Cookie(b,a).write(c)};Cookie.read=function(a){return new Cookie(a).read()};Cookie.dispose=function(b,a){return new Cookie(b,a).dispose()};Element.Events.domready={onAdd:function(a){if(Browser.loaded){a.call(this)}}};(function(){var b=function(){if(Browser.loaded){return}Browser.loaded=true;window.fireEvent("domready");document.fireEvent("domready")};window.addEvent("load",b);if(Browser.Engine.trident){var a=document.createElement("div");(function(){($try(function(){a.doScroll();return document.id(a).inject(document.body).set("html","temp").dispose()}))?b():arguments.callee.delay(50)})()}else{if(Browser.Engine.webkit&&Browser.Engine.version<525){(function(){(["loaded","complete"].contains(document.readyState))?b():arguments.callee.delay(50)})()}else{document.addEvent("DOMContentLoaded",b)}}})();Native.implement([Document,Element],{getElements:function(j,h){j=j.split(",");var c,f={};for(var d=0,b=j.length;d<b;d++){var a=j[d],g=Selectors.Utils.search(this,a,f);if(d!=0&&g.item){g=$A(g)}c=(d==0)?g:(c.item)?$A(c).concat(g):c.concat(g)}return new Elements(c,{ddup:(j.length>1),cash:!h})}});Element.implement({match:function(b){if(!b||(b==this)){return true}var d=Selectors.Utils.parseTagAndID(b);var a=d[0],f=d[1];if(!Selectors.Filters.byID(this,f)||!Selectors.Filters.byTag(this,a)){return false}var c=Selectors.Utils.parseSelector(b);return(c)?Selectors.Utils.filter(this,c,{}):true}});var Selectors={Cache:{nth:{},parsed:{}}};Selectors.RegExps={id:(/#([\w-]+)/),tag:(/^(\w+|\*)/),quick:(/^(\w+|\*)$/),splitter:(/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),combined:(/\.([\w-]+)|\[(\w+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g)};Selectors.Utils={chk:function(b,c){if(!c){return true}var a=$uid(b);if(!c[a]){return c[a]=true}return false},parseNthArgument:function(i){if(Selectors.Cache.nth[i]){return Selectors.Cache.nth[i]}var f=i.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);if(!f){return false}var h=parseInt(f[1],10);var d=(h||h===0)?h:1;var g=f[2]||false;var c=parseInt(f[3],10)||0;if(d!=0){c--;while(c<1){c+=d}while(c>=d){c-=d}}else{d=c;g="index"}switch(g){case"n":f={a:d,b:c,special:"n"};break;case"odd":f={a:2,b:0,special:"n"};break;case"even":f={a:2,b:1,special:"n"};break;case"first":f={a:0,special:"index"};break;case"last":f={special:"last-child"};break;case"only":f={special:"only-child"};break;default:f={a:(d-1),special:"index"}}return Selectors.Cache.nth[i]=f},parseSelector:function(f){if(Selectors.Cache.parsed[f]){return Selectors.Cache.parsed[f]}var d,i={classes:[],pseudos:[],attributes:[]};while((d=Selectors.RegExps.combined.exec(f))){var j=d[1],h=d[2],g=d[3],b=d[5],c=d[6],k=d[7];if(j){i.classes.push(j)}else{if(c){var a=Selectors.Pseudo.get(c);if(a){i.pseudos.push({parser:a,argument:k})}else{i.attributes.push({name:c,operator:"=",value:k})}}else{if(h){i.attributes.push({name:h,operator:g,value:b})}}}}if(!i.classes.length){delete i.classes}if(!i.attributes.length){delete i.attributes}if(!i.pseudos.length){delete i.pseudos}if(!i.classes&&!i.attributes&&!i.pseudos){i=null}return Selectors.Cache.parsed[f]=i},parseTagAndID:function(b){var a=b.match(Selectors.RegExps.tag);var c=b.match(Selectors.RegExps.id);return[(a)?a[1]:"*",(c)?c[1]:false]},filter:function(g,c,f){var d;if(c.classes){for(d=c.classes.length;d--;d){var h=c.classes[d];if(!Selectors.Filters.byClass(g,h)){return false}}}if(c.attributes){for(d=c.attributes.length;d--;d){var b=c.attributes[d];if(!Selectors.Filters.byAttribute(g,b.name,b.operator,b.value)){return false}}}if(c.pseudos){for(d=c.pseudos.length;d--;d){var a=c.pseudos[d];if(!Selectors.Filters.byPseudo(g,a.parser,a.argument,f)){return false}}}return true},getByTagAndID:function(b,a,d){if(d){var c=(b.getElementById)?b.getElementById(d,true):Element.getElementById(b,d,true);return(c&&Selectors.Filters.byTag(c,a))?[c]:[]}else{return b.getElementsByTagName(a)}},search:function(p,o,u){var b=[];var c=o.trim().replace(Selectors.RegExps.splitter,function(k,j,i){b.push(j);return":)"+i}).split(":)");var q,f,B;for(var A=0,w=c.length;A<w;A++){var z=c[A];if(A==0&&Selectors.RegExps.quick.test(z)){q=p.getElementsByTagName(z);continue}var a=b[A-1];var r=Selectors.Utils.parseTagAndID(z);var C=r[0],s=r[1];if(A==0){q=Selectors.Utils.getByTagAndID(p,C,s)}else{var d={},h=[];for(var y=0,x=q.length;y<x;y++){h=Selectors.Getters[a](h,q[y],C,s,d)}q=h}var g=Selectors.Utils.parseSelector(z);if(g){f=[];for(var v=0,t=q.length;v<t;v++){B=q[v];if(Selectors.Utils.filter(B,g,u)){f.push(B)}}q=f}}return q}};Selectors.Getters={" ":function(j,h,k,a,f){var d=Selectors.Utils.getByTagAndID(h,k,a);for(var c=0,b=d.length;c<b;c++){var g=d[c];if(Selectors.Utils.chk(g,f)){j.push(g)}}return j},">":function(j,h,k,a,g){var c=Selectors.Utils.getByTagAndID(h,k,a);for(var f=0,d=c.length;f<d;f++){var b=c[f];if(b.parentNode==h&&Selectors.Utils.chk(b,g)){j.push(b)}}return j},"+":function(c,b,a,f,d){while((b=b.nextSibling)){if(b.nodeType==1){if(Selectors.Utils.chk(b,d)&&Selectors.Filters.byTag(b,a)&&Selectors.Filters.byID(b,f)){c.push(b)}break}}return c},"~":function(c,b,a,f,d){while((b=b.nextSibling)){if(b.nodeType==1){if(!Selectors.Utils.chk(b,d)){break}if(Selectors.Filters.byTag(b,a)&&Selectors.Filters.byID(b,f)){c.push(b)}}}return c}};Selectors.Filters={byTag:function(b,a){return(a=="*"||(b.tagName&&b.tagName.toLowerCase()==a))},byID:function(a,b){return(!b||(a.id&&a.id==b))},byClass:function(b,a){return(b.className&&b.className.contains&&b.className.contains(a," "))},byPseudo:function(a,d,c,b){return d.call(a,c,b)},byAttribute:function(c,d,b,f){var a=Element.prototype.getProperty.call(c,d);if(!a){return(b=="!=")}if(!b||f==undefined){return true}switch(b){case"=":return(a==f);case"*=":return(a.contains(f));case"^=":return(a.substr(0,f.length)==f);case"$=":return(a.substr(a.length-f.length)==f);case"!=":return(a!=f);case"~=":return a.contains(f," ");case"|=":return a.contains(f,"-")}return false}};Selectors.Pseudo=new Hash({checked:function(){return this.checked},empty:function(){return !(this.innerText||this.textContent||"").length},not:function(a){return !Element.match(this,a)},contains:function(a){return(this.innerText||this.textContent||"").contains(a)},"first-child":function(){return Selectors.Pseudo.index.call(this,0)},"last-child":function(){var a=this;while((a=a.nextSibling)){if(a.nodeType==1){return false}}return true},"only-child":function(){var b=this;while((b=b.previousSibling)){if(b.nodeType==1){return false}}var a=this;while((a=a.nextSibling)){if(a.nodeType==1){return false}}return true},"nth-child":function(h,f){h=(h==undefined)?"n":h;var c=Selectors.Utils.parseNthArgument(h);if(c.special!="n"){return Selectors.Pseudo[c.special].call(this,c.a,f)}var g=0;f.positions=f.positions||{};var d=$uid(this);if(!f.positions[d]){var b=this;while((b=b.previousSibling)){if(b.nodeType!=1){continue}g++;var a=f.positions[$uid(b)];if(a!=undefined){g=a+g;break}}f.positions[d]=g}return(f.positions[d]%c.a==c.b)},index:function(a){var b=this,c=0;while((b=b.previousSibling)){if(b.nodeType==1&&++c>a){return false}}return(c==a)},even:function(b,a){return Selectors.Pseudo["nth-child"].call(this,"2n+1",a)},odd:function(b,a){return Selectors.Pseudo["nth-child"].call(this,"2n",a)},selected:function(){return this.selected},enabled:function(){return(this.disabled===false)}});var Swiff=new Class({Implements:[Options],options:{id:null,height:1,width:1,container:null,properties:{},params:{quality:"high",allowScriptAccess:"always",wMode:"transparent",swLiveConnect:true},callBacks:{},vars:{}},toElement:function(){return this.object},initialize:function(m,n){this.instance="Swiff_"+$time();this.setOptions(n);n=this.options;var b=this.id=n.id||this.instance;var a=document.id(n.container);Swiff.CallBacks[this.instance]={};var f=n.params,h=n.vars,g=n.callBacks;var i=$extend({height:n.height,width:n.width},n.properties);var l=this;for(var d in g){Swiff.CallBacks[this.instance][d]=(function(o){return function(){return o.apply(l.object,arguments)}})(g[d]);h[d]="Swiff.CallBacks."+this.instance+"."+d}f.flashVars=Hash.toQueryString(h);if(Browser.Engine.trident){i.classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";f.movie=m}else{i.type="application/x-shockwave-flash";i.data=m}var k='<object id="'+b+'"';for(var j in i){k+=" "+j+'="'+i[j]+'"'}k+=">";for(var c in f){if(f[c]){k+='<param name="'+c+'" value="'+f[c]+'" />'}}k+="</object>";this.object=((a)?a.empty():new Element("div")).set("html",k).firstChild},replaces:function(a){a=document.id(a,true);a.parentNode.replaceChild(this.toElement(),a);return this},inject:function(a){document.id(a,true).appendChild(this.toElement());return this},remote:function(){return Swiff.remote.apply(Swiff,[this.toElement()].extend(arguments))}});Swiff.CallBacks={};Swiff.remote=function(obj,fn){var rs=obj.CallFunction('<invoke name="'+fn+'" returntype="javascript">'+__flash__argumentsToXML(arguments,2)+"</invoke>");return eval(rs)};MooTools.More={version:"1.2.5.1",build:"254884f2b83651bf95260eed5c6cceb838e22d8e"};Class.Mutators.Binds=function(a){return a};Class.Mutators.initialize=function(a){return function(){$splat(this.Binds).each(function(b){var c=this[b];if(c){this[b]=c.bind(this)}},this);return a.apply(this,arguments)}};Element.implement({measure:function(e){var g=function(h){return !!(!h||h.offsetHeight||h.offsetWidth)};if(g(this)){return e.apply(this)}var d=this.getParent(),f=[],b=[];while(!g(d)&&d!=document.body){b.push(d.expose());d=d.getParent()}var c=this.expose();var a=e.apply(this);c();b.each(function(h){h()});return a},expose:function(){if(this.getStyle("display")!="none"){return $empty}var a=this.style.cssText;this.setStyles({display:"block",position:"absolute",visibility:"hidden"});return function(){this.style.cssText=a}.bind(this)},getDimensions:function(a){a=$merge({computeSize:false},a);var f={};var d=function(g,e){return(e.computeSize)?g.getComputedSize(e):g.getSize()};var b=this.getParent("body");if(b&&this.getStyle("display")=="none"){f=this.measure(function(){return d(this,a)})}else{if(b){try{f=d(this,a)}catch(c){}}else{f={x:0,y:0}}}return $chk(f.x)?$extend(f,{width:f.x,height:f.y}):$extend(f,{x:f.width,y:f.height})},getComputedSize:function(a){if(a&&a.plains){a.planes=a.plains}a=$merge({styles:["padding","border"],planes:{height:["top","bottom"],width:["left","right"]},mode:"both"},a);var c={width:0,height:0};switch(a.mode){case"vertical":delete c.width;delete a.planes.width;break;case"horizontal":delete c.height;delete a.planes.height;break}var b=[];$each(a.planes,function(f,g){f.each(function(h){a.styles.each(function(i){b.push((i=="border")?i+"-"+h+"-width":i+"-"+h)})})});var e={};b.each(function(f){e[f]=this.getComputedStyle(f)},this);var d=[];$each(a.planes,function(f,g){var h=g.capitalize();c["total"+h]=c["computed"+h]=0;f.each(function(i){c["computed"+i.capitalize()]=0;b.each(function(k,j){if(k.test(i)){e[k]=e[k].toInt()||0;c["total"+h]=c["total"+h]+e[k];c["computed"+i.capitalize()]=c["computed"+i.capitalize()]+e[k]}if(k.test(i)&&g!=k&&(k.test("border")||k.test("padding"))&&!d.contains(k)){d.push(k);c["computed"+h]=c["computed"+h]-e[k]}})})});["Width","Height"].each(function(g){var f=g.toLowerCase();if(!$chk(c[f])){return}c[f]=c[f]+this["offset"+g]+c["computed"+g];c["total"+g]=c[f]+c["total"+g];delete c["computed"+g]},this);return $extend(e,c)}});var Drag=new Class({Implements:[Events,Options],options:{snap:6,unit:"px",grid:false,style:true,limit:false,handle:false,invert:false,preventDefault:false,stopPropagation:false,modifiers:{x:"left",y:"top"}},initialize:function(){var b=Array.link(arguments,{options:Object.type,element:$defined});this.element=document.id(b.element);this.document=this.element.getDocument();this.setOptions(b.options||{});var a=$type(this.options.handle);this.handles=((a=="array"||a=="collection")?$$(this.options.handle):document.id(this.options.handle))||this.element;this.mouse={now:{},pos:{}};this.value={start:{},now:{}};this.selection=(Browser.Engine.trident)?"selectstart":"mousedown";this.bound={start:this.start.bind(this),check:this.check.bind(this),drag:this.drag.bind(this),stop:this.stop.bind(this),cancel:this.cancel.bind(this),eventStop:$lambda(false)};this.attach()},attach:function(){this.handles.addEvent("mousedown",this.bound.start);return this},detach:function(){this.handles.removeEvent("mousedown",this.bound.start);return this},start:function(e){if(e.rightClick){return}if(this.options.preventDefault){e.preventDefault()}if(this.options.stopPropagation){e.stopPropagation()}this.mouse.start=e.page;this.fireEvent("beforeStart",this.element);var a=this.options.limit;this.limit={x:[],y:[]};var d=this.element.getStyles("left","right","top","bottom");this._invert={x:this.options.modifiers.x=="left"&&d.left=="auto"&&!isNaN(d.right.toInt())&&(this.options.modifiers.x="right"),y:this.options.modifiers.y=="top"&&d.top=="auto"&&!isNaN(d.bottom.toInt())&&(this.options.modifiers.y="bottom")};var g,f;for(g in this.options.modifiers){if(!this.options.modifiers[g]){continue}var c=this.element.getStyle(this.options.modifiers[g]);if(c&&!c.match(/px$/)){if(!f){f=this.element.getCoordinates(this.element.getOffsetParent())}c=f[this.options.modifiers[g]]}if(this.options.style){this.value.now[g]=(c||0).toInt()}else{this.value.now[g]=this.element[this.options.modifiers[g]]}if(this.options.invert){this.value.now[g]*=-1}if(this._invert[g]){this.value.now[g]*=-1}this.mouse.pos[g]=e.page[g]-this.value.now[g];if(a&&a[g]){for(var b=2;b--;b){if($chk(a[g][b])){this.limit[g][b]=$lambda(a[g][b])()}}}}if($type(this.options.grid)=="number"){this.options.grid={x:this.options.grid,y:this.options.grid}}this.document.addEvents({mousemove:this.bound.check,mouseup:this.bound.cancel});this.document.addEvent(this.selection,this.bound.eventStop)},check:function(a){if(this.options.preventDefault){a.preventDefault()}var b=Math.round(Math.sqrt(Math.pow(a.page.x-this.mouse.start.x,2)+Math.pow(a.page.y-this.mouse.start.y,2)));if(b>this.options.snap){this.cancel();this.document.addEvents({mousemove:this.bound.drag,mouseup:this.bound.stop});this.fireEvent("start",[this.element,a]).fireEvent("snap",this.element)}},drag:function(a){if(this.options.preventDefault){a.preventDefault()}this.mouse.now=a.page;for(var b in this.options.modifiers){if(!this.options.modifiers[b]){continue}this.value.now[b]=this.mouse.now[b]-this.mouse.pos[b];if(this.options.invert){this.value.now[b]*=-1}if(this._invert[b]){this.value.now[b]*=-1}if(this.options.limit&&this.limit[b]){if($chk(this.limit[b][1])&&(this.value.now[b]>this.limit[b][1])){this.value.now[b]=this.limit[b][1]}else{if($chk(this.limit[b][0])&&(this.value.now[b]<this.limit[b][0])){this.value.now[b]=this.limit[b][0]}}}if(this.options.grid[b]){this.value.now[b]-=((this.value.now[b]-(this.limit[b][0]||0))%this.options.grid[b])}if(this.options.style){this.element.setStyle(this.options.modifiers[b],this.value.now[b]+this.options.unit)}else{this.element[this.options.modifiers[b]]=this.value.now[b]}}this.fireEvent("drag",[this.element,a])},cancel:function(a){this.document.removeEvent("mousemove",this.bound.check);this.document.removeEvent("mouseup",this.bound.cancel);if(a){this.document.removeEvent(this.selection,this.bound.eventStop);this.fireEvent("cancel",this.element)}},stop:function(a){this.document.removeEvent(this.selection,this.bound.eventStop);this.document.removeEvent("mousemove",this.bound.drag);this.document.removeEvent("mouseup",this.bound.stop);if(a){this.fireEvent("complete",[this.element,a])}}});Element.implement({makeResizable:function(a){var b=new Drag(this,$merge({modifiers:{x:"width",y:"height"}},a));this.store("resizer",b);return b.addEvent("drag",function(){this.fireEvent("resize",b)}.bind(this))}});var Slider=new Class({Implements:[Events,Options],Binds:["clickedElement","draggedKnob","scrolledElement"],options:{onTick:function(a){if(this.options.snap){a=this.toPosition(this.step)}this.knob.setStyle(this.property,a)},initialStep:0,snap:false,offset:0,range:false,wheel:false,steps:100,mode:"horizontal"},initialize:function(f,a,e){this.setOptions(e);this.element=document.id(f);this.knob=document.id(a);this.previousChange=this.previousEnd=this.step=-1;var g,b={},d={x:false,y:false};switch(this.options.mode){case"vertical":this.axis="y";this.property="top";g="offsetHeight";break;case"horizontal":this.axis="x";this.property="left";g="offsetWidth"}this.full=this.element.measure(function(){this.half=this.knob[g]/2;return this.element[g]-this.knob[g]+(this.options.offset*2)}.bind(this));this.setRange(this.options.range);this.knob.setStyle("position","relative").setStyle(this.property,-this.options.offset);d[this.axis]=this.property;b[this.axis]=[-this.options.offset,this.full-this.options.offset];var c={snap:0,limit:b,modifiers:d,onDrag:this.draggedKnob,onStart:this.draggedKnob,onBeforeStart:(function(){this.isDragging=true}).bind(this),onCancel:function(){this.isDragging=false}.bind(this),onComplete:function(){this.isDragging=false;this.draggedKnob();this.end()}.bind(this)};if(this.options.snap){c.grid=Math.ceil(this.stepWidth);c.limit[this.axis][1]=this.full}this.drag=new Drag(this.knob,c);this.attach();if(this.options.initialStep!=null){this.set(this.options.initialStep)}},attach:function(){this.element.addEvent("mousedown",this.clickedElement);if(this.options.wheel){this.element.addEvent("mousewheel",this.scrolledElement)}this.drag.attach();return this},detach:function(){this.element.removeEvent("mousedown",this.clickedElement);this.element.removeEvent("mousewheel",this.scrolledElement);this.drag.detach();return this},set:function(a){if(!((this.range>0)^(a<this.min))){a=this.min}if(!((this.range>0)^(a>this.max))){a=this.max}this.step=Math.round(a);this.checkStep();this.fireEvent("tick",this.toPosition(this.step));this.end();return this},setRange:function(a,b){this.min=$pick(a[0],0);this.max=$pick(a[1],this.options.steps);this.range=this.max-this.min;this.steps=this.options.steps||this.full;this.stepSize=Math.abs(this.range)/this.steps;this.stepWidth=this.stepSize*this.full/Math.abs(this.range);this.set($pick(b,this.step).floor(this.min).max(this.max));return this},clickedElement:function(c){if(this.isDragging||c.target==this.knob){return}var b=this.range<0?-1:1;var a=c.page[this.axis]-this.element.getPosition()[this.axis]-this.half;a=a.limit(-this.options.offset,this.full-this.options.offset);this.step=Math.round(this.min+b*this.toStep(a));this.checkStep();this.fireEvent("tick",a);this.end()},scrolledElement:function(a){var b=(this.options.mode=="horizontal")?(a.wheel<0):(a.wheel>0);this.set(b?this.step-this.stepSize:this.step+this.stepSize);a.stop()},draggedKnob:function(){var b=this.range<0?-1:1;var a=this.drag.value.now[this.axis];a=a.limit(-this.options.offset,this.full-this.options.offset);this.step=Math.round(this.min+b*this.toStep(a));this.checkStep()},checkStep:function(){if(this.previousChange!=this.step){this.previousChange=this.step;this.fireEvent("change",this.step)}},end:function(){if(this.previousEnd!==this.step){this.previousEnd=this.step;this.fireEvent("complete",this.step+"")}},toStep:function(a){var b=(a+this.options.offset)*this.stepSize/this.full*this.steps;return this.options.steps?Math.round(b-=b%this.stepSize):b},toPosition:function(a){return(this.full*Math.abs(this.min-a))/(this.steps*this.stepSize)-this.options.offset}});var Color=new Native({initialize:function(b,c){if(arguments.length>=3){c="rgb";b=Array.slice(arguments,0,3)}else{if(typeof b=="string"){if(b.match(/rgb/)){b=b.rgbToHex().hexToRgb(true)}else{if(b.match(/hsb/)){b=b.hsbToRgb()}else{b=b.hexToRgb(true)}}}}c=c||"rgb";switch(c){case"hsb":var a=b;b=b.hsbToRgb();b.hsb=a;break;case"hex":b=b.hexToRgb(true);break}b.rgb=b.slice(0,3);b.hsb=b.hsb||b.rgbToHsb();b.hex=b.rgbToHex();return $extend(b,this)}});Color.implement({mix:function(){var a=Array.slice(arguments);var c=($type(a.getLast())=="number")?a.pop():50;var b=this.slice();a.each(function(d){d=new Color(d);for(var e=0;e<3;e++){b[e]=Math.round((b[e]/100*(100-c))+(d[e]/100*c))}});return new Color(b,"rgb")},invert:function(){return new Color(this.map(function(a){return 255-a}))},setHue:function(a){return new Color([a,this.hsb[1],this.hsb[2]],"hsb")},setSaturation:function(a){return new Color([this.hsb[0],a,this.hsb[2]],"hsb")},setBrightness:function(a){return new Color([this.hsb[0],this.hsb[1],a],"hsb")}});var $RGB=function(d,c,a){return new Color([d,c,a],"rgb")};var $HSB=function(d,c,a){return new Color([d,c,a],"hsb")};var $HEX=function(a){return new Color(a,"hex")};Array.implement({rgbToHsb:function(){var b=this[0],c=this[1],j=this[2],g=0;var i=Math.max(b,c,j),e=Math.min(b,c,j);var k=i-e;var h=i/255,f=(i!=0)?k/i:0;if(f!=0){var d=(i-b)/k;var a=(i-c)/k;var l=(i-j)/k;if(b==i){g=l-a}else{if(c==i){g=2+d-l}else{g=4+a-d}}g/=6;if(g<0){g++}}return[Math.round(g*360),Math.round(f*100),Math.round(h*100)]},hsbToRgb:function(){var c=Math.round(this[2]/100*255);if(this[1]==0){return[c,c,c]}else{var a=this[0]%360;var e=a%60;var g=Math.round((this[2]*(100-this[1]))/10000*255);var d=Math.round((this[2]*(6000-this[1]*e))/600000*255);var b=Math.round((this[2]*(6000-this[1]*(60-e)))/600000*255);switch(Math.floor(a/60)){case 0:return[c,b,g];case 1:return[d,c,g];case 2:return[g,c,b];case 3:return[g,d,c];case 4:return[b,g,c];case 5:return[c,g,d]}}return false}});String.implement({rgbToHsb:function(){var a=this.match(/\d{1,3}/g);return(a)?a.rgbToHsb():null},hsbToRgb:function(){var a=this.match(/\d{1,3}/g);return(a)?a.hsbToRgb():null}});Hash.Cookie=new Class({Extends:Cookie,options:{autoSave:true},initialize:function(b,a){this.parent(b,a);this.load()},save:function(){var a=JSON.encode(this.hash);if(!a||a.length>4096){return false}if(a=="{}"){this.dispose()}else{this.write(a)}return true},load:function(){this.hash=new Hash(JSON.decode(this.read(),true));return this}});Hash.each(Hash.prototype,function(b,a){if(typeof b=="function"){Hash.Cookie.implement(a,function(){var c=b.apply(this.hash,arguments);if(this.options.autoSave){this.save()}return c})}});var URI=new Class({Implements:Options,options:{},regex:/^(?:(\w+):)?(?:\/\/(?:(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,parts:["scheme","user","password","host","port","directory","file","query","fragment"],schemes:{http:80,https:443,ftp:21,rtsp:554,mms:1755,file:0},initialize:function(b,a){this.setOptions(a);var c=this.options.base||URI.base;if(!b){b=c}if(b&&b.parsed){this.parsed=$unlink(b.parsed)}else{this.set("value",b.href||b.toString(),c?new URI(c):false)}},parse:function(c,b){var a=c.match(this.regex);if(!a){return false}a.shift();return this.merge(a.associate(this.parts),b)},merge:function(b,a){if((!b||!b.scheme)&&(!a||!a.scheme)){return false}if(a){this.parts.every(function(c){if(b[c]){return false}b[c]=a[c]||"";return true})}b.port=b.port||this.schemes[b.scheme.toLowerCase()];b.directory=b.directory?this.parseDirectory(b.directory,a?a.directory:""):"/";return b},parseDirectory:function(b,c){b=(b.substr(0,1)=="/"?"":(c||"/"))+b;if(!b.test(URI.regs.directoryDot)){return b}var a=[];b.replace(URI.regs.endSlash,"").split("/").each(function(d){if(d==".."&&a.length>0){a.pop()}else{if(d!="."){a.push(d)}}});return a.join("/")+"/"},combine:function(a){return a.value||a.scheme+"://"+(a.user?a.user+(a.password?":"+a.password:"")+"@":"")+(a.host||"")+(a.port&&a.port!=this.schemes[a.scheme]?":"+a.port:"")+(a.directory||"/")+(a.file||"")+(a.query?"?"+a.query:"")+(a.fragment?"#"+a.fragment:"")},set:function(b,d,c){if(b=="value"){var a=d.match(URI.regs.scheme);if(a){a=a[1]}if(a&&!$defined(this.schemes[a.toLowerCase()])){this.parsed={scheme:a,value:d}}else{this.parsed=this.parse(d,(c||this).parsed)||(a?{scheme:a,value:d}:{value:d})}}else{if(b=="data"){this.setData(d)}else{this.parsed[b]=d}}return this},get:function(a,b){switch(a){case"value":return this.combine(this.parsed,b?b.parsed:false);case"data":return this.getData()}return this.parsed[a]||""},go:function(){document.location.href=this.toString()},toURI:function(){return this},getData:function(c,b){var a=this.get(b||"query");if(!$chk(a)){return c?null:{}}var d=a.parseQueryString();return c?d[c]:d},setData:function(a,c,b){if(typeof a=="string"){data=this.getData();data[arguments[0]]=arguments[1];a=data}else{if(c){a=$merge(this.getData(),a)}}return this.set(b||"query",Hash.toQueryString(a))},clearData:function(a){return this.set(a||"query","")}});URI.prototype.toString=URI.prototype.valueOf=function(){return this.get("value")};URI.regs={endSlash:/\/$/,scheme:/^(\w+):/,directoryDot:/\.\/|\.$/};URI.base=new URI(document.getElements("base[href]",true).getLast(),{base:document.location});String.implement({toURI:function(a){return new URI(this,a)}});(function(c,b){function a(bv,av){function aP(k){return aM.preferFlash&&ap&&!aM.ignoreFlash&&aM.flash[k]!==b&&aM.flash[k]}function az(k){return function(m){var l=this._s;return l&&l._a?k.call(this,m):null}}this.setupOptions={url:bv||null,flashVersion:8,debugMode:!0,debugFlash:!1,useConsole:!0,consoleOnly:!0,waitForWindowLoad:!1,bgColor:"#ffffff",useHighPerformance:!1,flashPollingInterval:null,html5PollingInterval:null,flashLoadTimeout:1000,wmode:null,allowScriptAccess:"always",useFlashBlock:!1,useHTML5Audio:!0,forceUseGlobalHTML5Audio:!1,ignoreMobileRestrictions:!1,html5Test:/^(probably|maybe)$/i,preferFlash:!1,noSWFCache:!1,idPrefix:"sound"};this.defaultOptions={autoLoad:!1,autoPlay:!1,from:null,loops:1,onid3:null,onerror:null,onload:null,whileloading:null,onplay:null,onpause:null,onresume:null,whileplaying:null,onposition:null,onstop:null,onfinish:null,multiShot:!0,multiShotEvents:!1,position:null,pan:0,playbackRate:1,stream:!0,to:null,type:null,usePolicyFile:!1,volume:100};this.flash9Options={onfailure:null,isMovieStar:null,usePeakData:!1,useWaveformData:!1,useEQData:!1,onbufferchange:null,ondataerror:null};this.movieStarOptions={bufferTime:3,serverURL:null,onconnect:null,duration:null};this.audioFormats={mp3:{type:['audio/mpeg; codecs="mp3"',"audio/mpeg","audio/mp3","audio/MPA","audio/mpa-robust"],required:!0},mp4:{related:["aac","m4a","m4b"],type:['audio/mp4; codecs="mp4a.40.2"',"audio/aac","audio/x-m4a","audio/MP4A-LATM","audio/mpeg4-generic"],required:!1},ogg:{type:["audio/ogg; codecs=vorbis"],required:!1},opus:{type:["audio/ogg; codecs=opus","audio/opus"],required:!1},wav:{type:['audio/wav; codecs="1"',"audio/wav","audio/wave","audio/x-wav"],required:!1},flac:{type:["audio/flac"],required:!1}};this.movieID="sm2-container";this.id=av||"sm2movie";this.debugID="soundmanager-debug";this.debugURLParam=/([#?&])debug=1/i;this.versionNumber="V2.97a.20170601";this.altURL=this.movieURL=this.version=null;this.enabled=this.swfLoaded=!1;this.oMC=null;this.sounds={};this.soundIDs=[];this.didFlashBlock=this.muted=!1;this.filePattern=null;this.filePatterns={flash8:/\.mp3(\?.*)?$/i,flash9:/\.mp3(\?.*)?$/i};this.features={buffering:!1,peakData:!1,waveformData:!1,eqData:!1,movieStar:!1};this.sandbox={};this.html5={usingFlash:null};this.flash={};this.ignoreFlash=this.html5Only=!1;var a5,aM=this,bB=null,aG=null,bu,ax=navigator.userAgent,bq=c.location.href.toString(),aC=document,aK,aO,al,aE,ar=[],a4=!1,a3=!1,aF=!1,bo=!1,L=!1,a1,au,bK,a2,bA,bi,bf,be,ao,bp,aN,aD,bc,ah,bg,an,aZ,ad,i,a8,ae,e,bC,br,f,aY=null,bG=null,aX,bx,a7,bF,bw,aA,aW=!1,bd=!1,bD,bs,aR,a9=0,aV=null,aI,aU=[],aT,aw=null,at,aj,aS,af,bm,o,aJ,g,ay,a6=Array.prototype.slice,aq=!1,ak,ap,s,bE,bn,aQ,bl=0,bJ,bz=ax.match(/(ipad|iphone|ipod)/i),bk=ax.match(/android/i),bj=ax.match(/msie|trident/i),aH=ax.match(/webkit/i),bI=ax.match(/safari/i)&&!ax.match(/chrome/i),aL=ax.match(/opera/i),by=ax.match(/(mobile|pre\/|xoom)/i)||bz||bk,bt=!bq.match(/usehtml5audio/i)&&!bq.match(/sm2-ignorebadua/i)&&bI&&!ax.match(/silk/i)&&ax.match(/OS\sX\s10_6_([3-7])/i),am=aC.hasFocus!==b?aC.hasFocus():null,bh=bI&&(aC.hasFocus===b||!aC.hasFocus()),a0=!bh,aB=/(mp3|mp4|mpa|m4a|m4b)/i,ac=aC.location?aC.location.protocol.match(/http/i):null,ai=ac?"":"//",ag=/^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4|m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,h="mpeg4 aac flv mov mp4 m4v f4v m4a m4b mp4v 3gp 3g2".split(" "),j=new RegExp("\\.("+h.join("|")+")(\\?.*)?$","i");this.mimePattern=/^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;this.useAltURL=!ac;af=[null,"MEDIA_ERR_ABORTED","MEDIA_ERR_NETWORK","MEDIA_ERR_DECODE","MEDIA_ERR_SRC_NOT_SUPPORTED"];var bL;try{bL=Audio!==b&&(aL&&opera!==b&&10>opera.version()?new Audio(null):new Audio).canPlayType!==b}catch(bH){bL=!1}this.hasHTML5=bL;this.setup=function(k){var l=!aM.url;k!==b&&aF&&aw&&aM.ok();bK(k);if(!aq){if(by){if(!aM.setupOptions.ignoreMobileRestrictions||aM.setupOptions.forceUseGlobalHTML5Audio){aU.push(bc.globalHTML5),aq=!0}}else{aM.setupOptions.forceUseGlobalHTML5Audio&&(aU.push(bc.globalHTML5),aq=!0)}}if(!bJ&&by){if(aM.setupOptions.ignoreMobileRestrictions){aU.push(bc.ignoreMobile)}else{if(aM.setupOptions.useHTML5Audio=!0,aM.setupOptions.preferFlash=!1,bz){aM.ignoreFlash=!0}else{if(bk&&!ax.match(/android\s2\.3/i)||!bk){aq=!0}}}}k&&(l&&aZ&&k.url!==b&&aM.beginDelayedInit(),aZ||k.url===b||"complete"!==aC.readyState||setTimeout(bg,1));bJ=!0;return aM};this.supported=this.ok=function(){return aw?aF&&!bo:aM.useHTML5Audio&&aM.hasHTML5};this.getMovie=function(k){return bu(k)||aC[k]||c[k]};this.createSound=function(k,n){function p(){l=bF(l);aM.sounds[l.id]=new a5(l);aM.soundIDs.push(l.id);return aM.sounds[l.id]}var l,m=null;if(!aF||!aM.ok()){return !1}n!==b&&(k={id:k,url:n});l=au(k);l.url=aI(l.url);l.id===b&&(l.id=aM.setupOptions.idPrefix+bl++);if(aA(l.id,!0)){return aM.sounds[l.id]}if(aj(l)){m=p(),m._setup_html5(l)}else{if(aM.html5Only||aM.html5.usingFlash&&l.url&&l.url.match(/data:/i)){return p()}8<aE&&null===l.isMovieStar&&(l.isMovieStar=!!(l.serverURL||l.type&&l.type.match(ag)||l.url&&l.url.match(j)));l=bw(l,void 0);m=p();8===aE?aG._createSound(l.id,l.loops||1,l.usePolicyFile):(aG._createSound(l.id,l.url,l.usePeakData,l.useWaveformData,l.useEQData,l.isMovieStar,l.isMovieStar?l.bufferTime:!1,l.loops||1,l.serverURL,l.duration||null,l.autoPlay,!0,l.autoLoad,l.usePolicyFile),l.serverURL||(m.connected=!0,l.onconnect&&l.onconnect.apply(m)));l.serverURL||!l.autoLoad&&!l.autoPlay||m.load(l)}!l.serverURL&&l.autoPlay&&m.play();return m};this.destroySound=function(k,m){if(!aA(k)){return !1}var n=aM.sounds[k],l;n.stop();n._iO={};n.unload();for(l=0;l<aM.soundIDs.length;l++){if(aM.soundIDs[l]===k){aM.soundIDs.splice(l,1);break}}m||n.destruct(!0);delete aM.sounds[k];return !0};this.load=function(k,l){return aA(k)?aM.sounds[k].load(l):!1};this.unload=function(k){return aA(k)?aM.sounds[k].unload():!1};this.onposition=this.onPosition=function(k,m,n,l){return aA(k)?aM.sounds[k].onposition(m,n,l):!1};this.clearOnPosition=function(k,l,m){return aA(k)?aM.sounds[k].clearOnPosition(l,m):!1};this.start=this.play=function(k,m){var n=null,l=m&&!(m instanceof Object);if(!aF||!aM.ok()){return !1}if(aA(k,l)){l&&(m={url:m})}else{if(!l){return !1}l&&(m={url:m});m&&m.url&&(m.id=k,n=aM.createSound(m).play())}null===n&&(n=aM.sounds[k].play(m));return n};this.setPlaybackRate=function(k,l,m){return aA(k)?aM.sounds[k].setPlaybackRate(l,m):!1};this.setPosition=function(k,l){return aA(k)?aM.sounds[k].setPosition(l):!1};this.stop=function(k){return aA(k)?aM.sounds[k].stop():!1};this.stopAll=function(){for(var k in aM.sounds){aM.sounds.hasOwnProperty(k)&&aM.sounds[k].stop()}};this.pause=function(k){return aA(k)?aM.sounds[k].pause():!1};this.pauseAll=function(){var k;for(k=aM.soundIDs.length-1;0<=k;k--){aM.sounds[aM.soundIDs[k]].pause()}};this.resume=function(k){return aA(k)?aM.sounds[k].resume():!1};this.resumeAll=function(){var k;for(k=aM.soundIDs.length-1;0<=k;k--){aM.sounds[aM.soundIDs[k]].resume()}};this.togglePause=function(k){return aA(k)?aM.sounds[k].togglePause():!1};this.setPan=function(k,l){return aA(k)?aM.sounds[k].setPan(l):!1};this.setVolume=function(k,m){var n,l;if(k!==b&&!isNaN(k)&&m===b){n=0;for(l=aM.soundIDs.length;n<l;n++){aM.sounds[aM.soundIDs[n]].setVolume(k)}return !1}return aA(k)?aM.sounds[k].setVolume(m):!1};this.mute=function(k){var l=0;k instanceof String&&(k=null);if(k){return aA(k)?aM.sounds[k].mute():!1}for(l=aM.soundIDs.length-1;0<=l;l--){aM.sounds[aM.soundIDs[l]].mute()}return aM.muted=!0};this.muteAll=function(){aM.mute()};this.unmute=function(k){k instanceof String&&(k=null);if(k){return aA(k)?aM.sounds[k].unmute():!1}for(k=aM.soundIDs.length-1;0<=k;k--){aM.sounds[aM.soundIDs[k]].unmute()}aM.muted=!1;return !0};this.unmuteAll=function(){aM.unmute()};this.toggleMute=function(k){return aA(k)?aM.sounds[k].toggleMute():!1};this.getMemoryUse=function(){var k=0;aG&&8!==aE&&(k=parseInt(aG._getMemoryUse(),10));return k};this.disable=function(k){var l;k===b&&(k=!1);if(bo){return !1}bo=!0;for(l=aM.soundIDs.length-1;0<=l;l--){bC(aM.sounds[aM.soundIDs[l]])}bC(aM);a1(k);ay.remove(c,"load",bf);return !0};this.canPlayMIME=function(k){var l;aM.hasHTML5&&(l=aS({type:k}));!l&&aw&&(l=k&&aM.ok()?!!(8<aE&&k.match(ag)||k.match(aM.mimePattern)):null);return l};this.canPlayURL=function(k){var l;aM.hasHTML5&&(l=aS({url:k}));!l&&aw&&(l=k&&aM.ok()?!!k.match(aM.filePattern):null);return l};this.canPlayLink=function(k){return k.type!==b&&k.type&&aM.canPlayMIME(k.type)?!0:aM.canPlayURL(k.href)};this.getSoundById=function(k,l){return k?aM.sounds[k]:null};this.onready=function(k,l){if("function"===typeof k){l||(l=c),bA("onready",k,l),bi()}else{throw aX("needFunction","onready")}return !0};this.ontimeout=function(k,l){if("function"===typeof k){l||(l=c),bA("ontimeout",k,l),bi({type:"ontimeout"})}else{throw aX("needFunction","ontimeout")}return !0};this._wD=this._writeDebug=function(k,l){return !0};this._debug=function(){};this.reboot=function(k,p){var q,l,n;for(q=aM.soundIDs.length-1;0<=q;q--){aM.sounds[aM.soundIDs[q]].destruct()}if(aG){try{bj&&(bG=aG.innerHTML),aY=aG.parentNode.removeChild(aG)}catch(m){}}bG=aY=aw=aG=null;aM.enabled=aZ=aF=aW=bd=a4=a3=bo=aq=aM.swfLoaded=!1;aM.soundIDs=[];aM.sounds={};bl=0;bJ=!1;if(k){ar=[]}else{for(q in ar){if(ar.hasOwnProperty(q)){for(l=0,n=ar[q].length;l<n;l++){ar[q][l].fired=!1}}}}aM.html5={usingFlash:null};aM.flash={};aM.html5Only=!1;aM.ignoreFlash=!1;c.setTimeout(function(){p||aM.beginDelayedInit()},20);return aM};this.reset=function(){return aM.reboot(!0,!0)};this.getMoviePercent=function(){return aG&&"PercentLoaded" in aG?aG.PercentLoaded():null};this.beginDelayedInit=function(){L=!0;bg();setTimeout(function(){if(bd){return !1}i();ah();return bd=!0},20);be()};this.destruct=function(){aM.disable(!0)};a5=function(G){var C,D,I=this,B,F,r,y,p,k,M=!1,w=[],K=0,H,m,J=null,E;D=C=null;this.sID=this.id=G.id;this.url=G.url;this._iO=this.instanceOptions=this.options=au(G);this.pan=this.options.pan;this.volume=this.options.volume;this.isHTML5=!1;this._a=null;E=!this.url;this.id3={};this._debug=function(){};this.load=function(l){var q=null,t;l!==b?I._iO=au(l,I.options):(l=I.options,I._iO=l,J&&J!==I.url&&(I._iO.url=I.url,I.url=null));I._iO.url||(I._iO.url=I.url);I._iO.url=aI(I._iO.url);t=I.instanceOptions=I._iO;if(!t.url&&!I.url){return I}if(t.url===I.url&&0!==I.readyState&&2!==I.readyState){return 3===I.readyState&&t.onload&&aQ(I,function(){t.onload.apply(I,[!!I.duration])}),I}I.loaded=!1;I.readyState=1;I.playState=0;I.id3={};if(aj(t)){q=I._setup_html5(t),q._called_load||(I._html5_canplay=!1,I.url!==t.url&&(I._a.src=t.url,I.setPosition(0)),I._a.autobuffer="auto",I._a.preload="auto",I._a._called_load=!0)}else{if(aM.html5Only||I._iO.url&&I._iO.url.match(/data:/i)){return I}try{I.isHTML5=!1,I._iO=bw(bF(t)),I._iO.autoPlay&&(I._iO.position||I._iO.from)&&(I._iO.autoPlay=!1),t=I._iO,8===aE?aG._load(I.id,t.url,t.stream,t.autoPlay,t.usePolicyFile):aG._load(I.id,t.url,!!t.stream,!!t.autoPlay,t.loops||1,!!t.autoLoad,t.usePolicyFile)}catch(n){a8({type:"SMSOUND_LOAD_JS_EXCEPTION",fatal:!0})}}I.url=t.url;return I};this.unload=function(){0!==I.readyState&&(I.isHTML5?(y(),I._a&&(I._a.pause(),J=o(I._a))):8===aE?aG._unload(I.id,"about:blank"):aG._unload(I.id),B());return I};this.destruct=function(l){I.isHTML5?(y(),I._a&&(I._a.pause(),o(I._a),aq||r(),I._a._s=null,I._a=null)):(I._iO.onfailure=null,aG._destroySound(I.id));l||aM.destroySound(I.id,!0)};this.start=this.play=function(n,u){var v,t,q,l;v=!0;u=u===b?!0:u;n||(n={});I.url&&(I._iO.url=I.url);I._iO=au(I._iO,I.options);I._iO=au(n,I._iO);I._iO.url=aI(I._iO.url);I.instanceOptions=I._iO;if(!I.isHTML5&&I._iO.serverURL&&!I.connected){return I.getAutoPlay()||I.setAutoPlay(!0),I}aj(I._iO)&&(I._setup_html5(I._iO),p());if(1===I.playState&&!I.paused&&(v=I._iO.multiShot,!v)){return I.isHTML5&&I.setPosition(I._iO.position),I}n.url&&n.url!==I.url&&(I.readyState||I.isHTML5||8!==aE||!E?I.load(I._iO):E=!1);if(!I.loaded){if(0===I.readyState){if(I.isHTML5||aM.html5Only){if(I.isHTML5){I.load(I._iO)}else{return I}}else{I._iO.autoPlay=!0,I.load(I._iO)}I.instanceOptions=I._iO}else{if(2===I.readyState){return I}}}!I.isHTML5&&9===aE&&0<I.position&&I.position===I.duration&&(n.position=0);I.paused&&0<=I.position&&(!I._iO.serverURL||0<I.position)?I.resume():(I._iO=au(n,I._iO),(!I.isHTML5&&null!==I._iO.position&&0<I._iO.position||null!==I._iO.from&&0<I._iO.from||null!==I._iO.to)&&0===I.instanceCount&&0===I.playState&&!I._iO.serverURL&&(v=function(){I._iO=au(n,I._iO);I.play(I._iO)},I.isHTML5&&!I._html5_canplay?I.load({_oncanplay:v}):I.isHTML5||I.loaded||I.readyState&&2===I.readyState||I.load({onload:v}),I._iO=m()),(!I.instanceCount||I._iO.multiShotEvents||I.isHTML5&&I._iO.multiShot&&!aq||!I.isHTML5&&8<aE&&!I.getAutoPlay())&&I.instanceCount++,I._iO.onposition&&0===I.playState&&k(I),I.playState=1,I.paused=!1,I.position=I._iO.position===b||isNaN(I._iO.position)?0:I._iO.position,I.isHTML5||(I._iO=bw(bF(I._iO))),I._iO.onplay&&u&&(I._iO.onplay.apply(I),M=!0),I.setVolume(I._iO.volume,!0),I.setPan(I._iO.pan,!0),1!==I._iO.playbackRate&&I.setPlaybackRate(I._iO.playbackRate),I.isHTML5?2>I.instanceCount?(p(),v=I._setup_html5(),I.setPosition(I._iO.position),v.play()):(t=new Audio(I._iO.url),q=function(){ay.remove(t,"ended",q);I._onfinish(I);o(t);t=null},l=function(){ay.remove(t,"canplay",l);try{t.currentTime=I._iO.position/1000}catch(x){}t.play()},ay.add(t,"ended",q),I._iO.volume!==b&&(t.volume=Math.max(0,Math.min(1,I._iO.volume/100))),I.muted&&(t.muted=!0),I._iO.position?ay.add(t,"canplay",l):t.play()):(v=aG._start(I.id,I._iO.loops||1,9===aE?I.position:I.position/1000,I._iO.multiShot||!1),9!==aE||v||I._iO.onplayerror&&I._iO.onplayerror.apply(I)));return I};this.stop=function(l){var n=I._iO;1===I.playState&&(I._onbufferchange(0),I._resetOnPosition(0),I.paused=!1,I.isHTML5||(I.playState=0),H(),n.to&&I.clearOnPosition(n.to),I.isHTML5?I._a&&(l=I.position,I.setPosition(0),I.position=l,I._a.pause(),I.playState=0,I._onTimer(),y()):(aG._stop(I.id,l),n.serverURL&&I.unload()),I.instanceCount=0,I._iO={},n.onstop&&n.onstop.apply(I));return I};this.setAutoPlay=function(l){I._iO.autoPlay=l;I.isHTML5||(aG._setAutoPlay(I.id,l),l&&(I.instanceCount||1!==I.readyState||I.instanceCount++))};this.getAutoPlay=function(){return I._iO.autoPlay};this.setPlaybackRate=function(l){l=Math.max(0.5,Math.min(4,l));if(I.isHTML5){try{I._iO.playbackRate=l,I._a.playbackRate=l}catch(n){}}return I};this.setPosition=function(l){l===b&&(l=0);var q=I.isHTML5?Math.max(l,0):Math.min(I.duration||I._iO.duration,Math.max(l,0));I.position=q;l=I.position/1000;I._resetOnPosition(I.position);I._iO.position=q;if(!I.isHTML5){l=9===aE?I.position:l,I.readyState&&2!==I.readyState&&aG._setPosition(I.id,l,I.paused||!I.playState,I._iO.multiShot)}else{if(I._a){if(I._html5_canplay){if(I._a.currentTime.toFixed(3)!==l.toFixed(3)){try{I._a.currentTime=l,(0===I.playState||I.paused)&&I._a.pause()}catch(n){}}}else{if(l){return I}}I.paused&&I._onTimer(!0)}}return I};this.pause=function(l){if(I.paused||0===I.playState&&1!==I.readyState){return I}I.paused=!0;I.isHTML5?(I._setup_html5().pause(),y()):(l||l===b)&&aG._pause(I.id,I._iO.multiShot);I._iO.onpause&&I._iO.onpause.apply(I);return I};this.resume=function(){var l=I._iO;if(!I.paused){return I}I.paused=!1;I.playState=1;I.isHTML5?(I._setup_html5().play(),p()):(l.isMovieStar&&!l.serverURL&&I.setPosition(I.position),aG._pause(I.id,l.multiShot));!M&&l.onplay?(l.onplay.apply(I),M=!0):l.onresume&&l.onresume.apply(I);return I};this.togglePause=function(){if(0===I.playState){return I.play({position:9!==aE||I.isHTML5?I.position/1000:I.position}),I}I.paused?I.resume():I.pause();return I};this.setPan=function(l,n){l===b&&(l=0);n===b&&(n=!1);I.isHTML5||aG._setPan(I.id,l);I._iO.pan=l;n||(I.pan=l,I.options.pan=l);return I};this.setVolume=function(l,n){l===b&&(l=100);n===b&&(n=!1);I.isHTML5?I._a&&(aM.muted&&!I.muted&&(I.muted=!0,I._a.muted=!0),I._a.volume=Math.max(0,Math.min(1,l/100))):aG._setVolume(I.id,aM.muted&&!I.muted||I.muted?0:l);I._iO.volume=l;n||(I.volume=l,I.options.volume=l);return I};this.mute=function(){I.muted=!0;I.isHTML5?I._a&&(I._a.muted=!0):aG._setVolume(I.id,0);return I};this.unmute=function(){I.muted=!1;var l=I._iO.volume!==b;I.isHTML5?I._a&&(I._a.muted=!1):aG._setVolume(I.id,l?I._iO.volume:I.options.volume);return I};this.toggleMute=function(){return I.muted?I.unmute():I.mute()};this.onposition=this.onPosition=function(l,q,n){w.push({position:parseInt(l,10),method:q,scope:n!==b?n:I,fired:!1});return I};this.clearOnPosition=function(n,l){var q;n=parseInt(n,10);if(!isNaN(n)){for(q=0;q<w.length;q++){n!==w[q].position||l&&l!==w[q].method||(w[q].fired&&K--,w.splice(q,1))}}};this._processOnPosition=function(){var l,n;l=w.length;if(!l||!I.playState||K>=l){return !1}for(--l;0<=l;l--){n=w[l],!n.fired&&I.position>=n.position&&(n.fired=!0,K++,n.method.apply(n.scope,[n.position]))}return !0};this._resetOnPosition=function(n){var l,q;l=w.length;if(!l){return !1}for(--l;0<=l;l--){q=w[l],q.fired&&n<=q.position&&(q.fired=!1,K--)}return !0};m=function(){var l=I._iO,u=l.from,t=l.to,q,n;n=function(){I.clearOnPosition(t,n);I.stop()};q=function(){if(null!==t&&!isNaN(t)){I.onPosition(t,n)}};null===u||isNaN(u)||(l.position=u,l.multiShot=!1,q());return l};k=function(){var l,n=I._iO.onposition;if(n){for(l in n){if(n.hasOwnProperty(l)){I.onPosition(parseInt(l,10),n[l])}}}};H=function(){var l,n=I._iO.onposition;if(n){for(l in n){n.hasOwnProperty(l)&&I.clearOnPosition(parseInt(l,10))}}};p=function(){I.isHTML5&&bD(I)};y=function(){I.isHTML5&&bs(I)};B=function(l){l||(w=[],K=0);M=!1;I._hasTimer=null;I._a=null;I._html5_canplay=!1;I.bytesLoaded=null;I.bytesTotal=null;I.duration=I._iO&&I._iO.duration?I._iO.duration:null;I.durationEstimate=null;I.buffered=[];I.eqData=[];I.eqData.left=[];I.eqData.right=[];I.failures=0;I.isBuffering=!1;I.instanceOptions={};I.instanceCount=0;I.loaded=!1;I.metadata={};I.readyState=0;I.muted=!1;I.paused=!1;I.peakData={left:0,right:0};I.waveformData={left:[],right:[]};I.playState=0;I.position=null;I.id3={}};B();this._onTimer=function(l){var t,q=!1,n={};(I._hasTimer||l)&&I._a&&(l||(0<I.playState||1===I.readyState)&&!I.paused)&&(t=I._get_html5_duration(),t!==C&&(C=t,I.duration=t,q=!0),I.durationEstimate=I.duration,t=1000*I._a.currentTime||0,t!==D&&(D=t,q=!0),(q||l)&&I._whileplaying(t,n,n,n,n));return q};this._get_html5_duration=function(){var l=I._iO;return(l=I._a&&I._a.duration?1000*I._a.duration:l&&l.duration?l.duration:null)&&!isNaN(l)&&Infinity!==l?l:null};this._apply_loop=function(n,l){n.loop=1<l?"loop":""};this._setup_html5=function(l){l=au(I._iO,l);var t=aq?bB:I._a,q=decodeURI(l.url),n;aq?q===decodeURI(ak)&&(n=!0):q===decodeURI(J)&&(n=!0);if(t){if(t._s){if(aq){t._s&&t._s.playState&&!n&&t._s.stop()}else{if(!aq&&q===decodeURI(J)){return I._apply_loop(t,l.loops),t}}}n||(J&&B(!1),t.src=l.url,ak=J=I.url=l.url,t._called_load=!1)}else{l.autoLoad||l.autoPlay?(I._a=new Audio(l.url),I._a.load()):I._a=aL&&10>opera.version()?new Audio(null):new Audio,t=I._a,t._called_load=!1,aq&&(bB=t)}I.isHTML5=!0;I._a=t;t._s=I;F();I._apply_loop(t,l.loops);l.autoLoad||l.autoPlay?I.load():(t.autobuffer=!1,t.preload="auto");return t};F=function(){if(I._a._added_events){return !1}var l;I._a._added_events=!0;for(l in bn){bn.hasOwnProperty(l)&&I._a&&I._a.addEventListener(l,bn[l],!1)}return !0};r=function(){var l;I._a._added_events=!1;for(l in bn){bn.hasOwnProperty(l)&&I._a&&I._a.removeEventListener(l,bn[l],!1)}};this._onload=function(l){var n=!!l||!I.isHTML5&&8===aE&&I.duration;I.loaded=n;I.readyState=n?3:2;I._onbufferchange(0);n||I.isHTML5||I._onerror();I._iO.onload&&aQ(I,function(){I._iO.onload.apply(I,[n])});return !0};this._onerror=function(l,n){I._iO.onerror&&aQ(I,function(){I._iO.onerror.apply(I,[l,n])})};this._onbufferchange=function(l){if(0===I.playState||l&&I.isBuffering||!l&&!I.isBuffering){return !1}I.isBuffering=1===l;I._iO.onbufferchange&&I._iO.onbufferchange.apply(I,[l]);return !0};this._onsuspend=function(){I._iO.onsuspend&&I._iO.onsuspend.apply(I);return !0};this._onfailure=function(l,q,n){I.failures++;if(I._iO.onfailure&&1===I.failures){I._iO.onfailure(l,q,n)}};this._onwarning=function(l,q,n){if(I._iO.onwarning){I._iO.onwarning(l,q,n)}};this._onfinish=function(){var l=I._iO.onfinish;I._onbufferchange(0);I._resetOnPosition(0);I.instanceCount&&(I.instanceCount--,I.instanceCount||(H(),I.playState=0,I.paused=!1,I.instanceCount=0,I.instanceOptions={},I._iO={},y(),I.isHTML5&&(I.position=0)),(!I.instanceCount||I._iO.multiShotEvents)&&l&&aQ(I,function(){l.apply(I)}))};this._whileloading=function(l,u,t,q){var n=I._iO;I.bytesLoaded=l;I.bytesTotal=u;I.duration=Math.floor(t);I.bufferLength=q;I.durationEstimate=I.isHTML5||n.isMovieStar?I.duration:n.duration?I.duration>n.duration?I.duration:n.duration:parseInt(I.bytesTotal/I.bytesLoaded*I.duration,10);I.isHTML5||(I.buffered=[{start:0,end:I.duration}]);(3!==I.readyState||I.isHTML5)&&n.whileloading&&n.whileloading.apply(I)};this._whileplaying=function(l,v,u,t,q){var n=I._iO;if(isNaN(l)||null===l){return !1}I.position=Math.max(0,l);I._processOnPosition();!I.isHTML5&&8<aE&&(n.usePeakData&&v!==b&&v&&(I.peakData={left:v.leftPeak,right:v.rightPeak}),n.useWaveformData&&u!==b&&u&&(I.waveformData={left:u.split(","),right:t.split(",")}),n.useEQData&&q!==b&&q&&q.leftEQ&&(l=q.leftEQ.split(","),I.eqData=l,I.eqData.left=l,q.rightEQ!==b&&q.rightEQ&&(I.eqData.right=q.rightEQ.split(","))));1===I.playState&&(I.isHTML5||8!==aE||I.position||!I.isBuffering||I._onbufferchange(0),n.whileplaying&&n.whileplaying.apply(I));return !0};this._oncaptiondata=function(l){I.captiondata=l;I._iO.oncaptiondata&&I._iO.oncaptiondata.apply(I,[l])};this._onmetadata=function(l,u){var t={},q,n;q=0;for(n=l.length;q<n;q++){t[l[q]]=u[q]}I.metadata=t;I._iO.onmetadata&&I._iO.onmetadata.call(I,I.metadata)};this._onid3=function(l,u){var t=[],q,n;q=0;for(n=l.length;q<n;q++){t[l[q]]=u[q]}I.id3=au(I.id3,t);I._iO.onid3&&I._iO.onid3.apply(I)};this._onconnect=function(l){l=1===l;if(I.connected=l){I.failures=0,aA(I.id)&&(I.getAutoPlay()?I.play(b,I.getAutoPlay()):I._iO.autoLoad&&I.load()),I._iO.onconnect&&I._iO.onconnect.apply(I,[l])}};this._ondataerror=function(l){0<I.playState&&I._iO.ondataerror&&I._iO.ondataerror.apply(I)}};ad=function(){return aC.body||aC.getElementsByTagName("div")[0]};bu=function(k){return aC.getElementById(k)};au=function(k,n){var p=k||{},l,m;l=n===b?aM.defaultOptions:n;for(m in l){l.hasOwnProperty(m)&&p[m]===b&&(p[m]="object"!==typeof l[m]||null===l[m]?l[m]:au(p[m],l[m]))}return p};aQ=function(k,l){k.isHTML5||8!==aE?l():c.setTimeout(l,0)};a2={onready:1,ontimeout:1,defaultOptions:1,flash9Options:1,movieStarOptions:1};bK=function(k,p){var q,l=!0,n=p!==b,m=aM.setupOptions;for(q in k){if(k.hasOwnProperty(q)){if("object"!==typeof k[q]||null===k[q]||k[q] instanceof Array||k[q] instanceof RegExp){n&&a2[p]!==b?aM[p][q]=k[q]:m[q]!==b?(aM.setupOptions[q]=k[q],aM[q]=k[q]):a2[q]===b?l=!1:aM[q] instanceof Function?aM[q].apply(aM,k[q] instanceof Array?k[q]:[k[q]]):aM[q]=k[q]}else{if(a2[q]===b){l=!1}else{return bK(k[q],q)}}}}return l};ay=function(){function k(q){q=a6.call(q);var p=q.length;m?(q[1]="on"+q[1],3<p&&q.pop()):3===p&&q.push(!1);return q}function n(p,t){var q=p.shift(),r=[l[t]];if(m){q[r](p[0],p[1])}else{q[r].apply(q,p)}}var m=c.attachEvent,l={add:m?"attachEvent":"addEventListener",remove:m?"detachEvent":"removeEventListener"};return{add:function(){n(k(arguments),"add")},remove:function(){n(k(arguments),"remove")}}}();bn={abort:az(function(){}),canplay:az(function(){var k=this._s,m;if(!k._html5_canplay){k._html5_canplay=!0;k._onbufferchange(0);m=k._iO.position===b||isNaN(k._iO.position)?null:k._iO.position/1000;if(this.currentTime!==m){try{this.currentTime=m}catch(l){}}k._iO._oncanplay&&k._iO._oncanplay()}}),canplaythrough:az(function(){var k=this._s;k.loaded||(k._onbufferchange(0),k._whileloading(k.bytesLoaded,k.bytesTotal,k._get_html5_duration()),k._onload(!0))}),durationchange:az(function(){var k=this._s,l;l=k._get_html5_duration();isNaN(l)||l===k.duration||(k.durationEstimate=k.duration=l)}),ended:az(function(){this._s._onfinish()}),error:az(function(){var k=af[this.error.code]||null;this._s._onload(!1);this._s._onerror(this.error.code,k)}),loadeddata:az(function(){var k=this._s;k._loaded||bI||(k.duration=k._get_html5_duration())}),loadedmetadata:az(function(){}),loadstart:az(function(){this._s._onbufferchange(1)}),play:az(function(){this._s._onbufferchange(0)}),playing:az(function(){this._s._onbufferchange(0)}),progress:az(function(k){var q=this._s,p,l,n=0,n=k.target.buffered;p=k.loaded||0;var m=k.total||1;q.buffered=[];if(n&&n.length){p=0;for(l=n.length;p<l;p++){q.buffered.push({start:1000*n.start(p),end:1000*n.end(p)})}n=1000*(n.end(0)-n.start(0));p=Math.min(1,n/(1000*k.target.duration))}isNaN(p)||(q._whileloading(p,m,q._get_html5_duration()),p&&m&&p===m&&bn.canplaythrough.call(this,k))}),ratechange:az(function(){}),suspend:az(function(k){var l=this._s;bn.progress.call(this,k);l._onsuspend()}),stalled:az(function(){}),timeupdate:az(function(){this._s._onTimer()}),waiting:az(function(){this._s._onbufferchange(1)})};aj=function(k){return k&&(k.type||k.url||k.serverURL)?k.serverURL||k.type&&aP(k.type)?!1:k.type?aS({type:k.type}):aS({url:k.url})||aM.html5Only||k.url.match(/data:/i):!1};o=function(k){var l;k&&(l=bI?"about:blank":aM.html5.canPlayType("audio/wav")?"data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==":"about:blank",k.src=l,k._called_unload!==b&&(k._called_load=!1));aq&&(ak=null);return l};aS=function(k){if(!aM.useHTML5Audio||!aM.hasHTML5){return !1}var m=k.url||null;k=k.type||null;var n=aM.audioFormats,l;if(k&&aM.html5[k]!==b){return aM.html5[k]&&!aP(k)}if(!bm){bm=[];for(l in n){n.hasOwnProperty(l)&&(bm.push(l),n[l].related&&(bm=bm.concat(n[l].related)))}bm=new RegExp("\\.("+bm.join("|")+")(\\?.*)?$","i")}(l=m?m.toLowerCase().match(bm):null)&&l.length?l=l[1]:k&&(m=k.indexOf(";"),l=(-1!==m?k.substr(0,m):k).substr(6));l&&aM.html5[l]!==b?m=aM.html5[l]&&!aP(l):(k="audio/"+l,m=aM.html5.canPlayType({type:k}),m=(aM.html5[l]=m)&&aM.html5[k]&&!aP(k));return m};g=function(){function l(u){var k,v=k=!1;if(!r||"function"!==typeof r.canPlayType){return k}if(u instanceof Array){n=0;for(k=u.length;n<k;n++){if(aM.html5[u[n]]||r.canPlayType(u[n]).match(aM.html5Test)){v=!0,aM.html5[u[n]]=!0,aM.flash[u[n]]=!!u[n].match(aB)}}k=v}else{u=r&&"function"===typeof r.canPlayType?r.canPlayType(u):!1,k=!(!u||!u.match(aM.html5Test))}return k}if(!aM.useHTML5Audio||!aM.hasHTML5){return aw=aM.html5.usingFlash=!0,!1}var r=Audio!==b?aL&&10>opera.version()?new Audio(null):new Audio:null,t,m,q={},p,n;p=aM.audioFormats;for(t in p){if(p.hasOwnProperty(t)&&(m="audio/"+t,q[t]=l(p[t].type),q[m]=q[t],t.match(aB)?(aM.flash[t]=!0,aM.flash[m]=!0):(aM.flash[t]=!1,aM.flash[m]=!1),p[t]&&p[t].related)){for(n=p[t].related.length-1;0<=n;n--){q["audio/"+p[t].related[n]]=q[t],aM.html5[p[t].related[n]]=q[t],aM.flash[p[t].related[n]]=q[t]}}}q.canPlayType=r?l:null;aM.html5=au(aM.html5,q);aM.html5.usingFlash=at();aw=aM.html5.usingFlash;return !0};bc={};aX=function(){};bF=function(k){8===aE&&1<k.loops&&k.stream&&(k.stream=!1);return k};bw=function(k,l){k&&!k.usePolicyFile&&(k.onid3||k.usePeakData||k.useWaveformData||k.useEQData)&&(k.usePolicyFile=!0);return k};aK=function(){return !1};bC=function(k){for(var l in k){k.hasOwnProperty(l)&&"function"===typeof k[l]&&(k[l]=aK)}};br=function(k){k===b&&(k=!1);(bo||k)&&aM.disable(k)};f=function(k){var l=null;if(k){if(k.match(/\.swf(\?.*)?$/i)){if(l=k.substr(k.toLowerCase().lastIndexOf(".swf?")+4)){return k}}else{k.lastIndexOf("/")!==k.length-1&&(k+="/")}}k=(k&&-1!==k.lastIndexOf("/")?k.substr(0,k.lastIndexOf("/")+1):"./")+aM.movieURL;aM.noSWFCache&&(k+="?ts="+(new Date).getTime());return k};aN=function(){aE=parseInt(aM.flashVersion,10);8!==aE&&9!==aE&&(aM.flashVersion=aE=8);var k=aM.debugMode||aM.debugFlash?"_debug.swf":".swf";aM.useHTML5Audio&&!aM.html5Only&&aM.audioFormats.mp4.required&&9>aE&&(aM.flashVersion=aE=9);aM.version=aM.versionNumber+(aM.html5Only?" (HTML5-only mode)":9===aE?" (AS3/Flash 9)":" (AS2/Flash 8)");8<aE?(aM.defaultOptions=au(aM.defaultOptions,aM.flash9Options),aM.features.buffering=!0,aM.defaultOptions=au(aM.defaultOptions,aM.movieStarOptions),aM.filePatterns.flash9=new RegExp("\\.(mp3|"+h.join("|")+")(\\?.*)?$","i"),aM.features.movieStar=!0):aM.features.movieStar=!1;aM.filePattern=aM.filePatterns[8!==aE?"flash9":"flash8"];aM.movieURL=(8===aE?"soundmanager2.swf":"soundmanager2_flash9.swf").replace(".swf",k);aM.features.peakData=aM.features.waveformData=aM.features.eqData=8<aE};ae=function(k,l){aG&&aG._setPolling(k,l)};e=function(){};aA=this.getSoundById;a7=function(){var k=[];aM.debugMode&&k.push("sm2_debug");aM.debugFlash&&k.push("flash_debug");aM.useHighPerformance&&k.push("high_performance");return k.join(" ")};bx=function(){aX("fbHandler");var k=aM.getMoviePercent(),l={type:"FLASHBLOCK"};aM.html5Only||(aM.ok()?aM.oMC&&(aM.oMC.className=[a7(),"movieContainer","swf_loaded"+(aM.didFlashBlock?" swf_unblocked":"")].join(" ")):(aw&&(aM.oMC.className=a7()+" movieContainer "+(null===k?"swf_timedout":"swf_error")),aM.didFlashBlock=!0,bi({type:"ontimeout",ignoreInit:!0,error:l}),a8(l)))};bA=function(k,m,l){ar[k]===b&&(ar[k]=[]);ar[k].push({method:m,scope:l||null,fired:!1})};bi=function(k){k||(k={type:aM.ok()?"onready":"ontimeout"});if(!aF&&k&&!k.ignoreInit||"ontimeout"===k.type&&(aM.ok()||bo&&!k.ignoreInit)){return !1}var p={success:k&&k.ignoreInit?aM.ok():!bo},q=k&&k.type?ar[k.type]||[]:[],l=[],n,p=[p],m=aw&&!aM.ok();k.error&&(p[0].error=k.error);k=0;for(n=q.length;k<n;k++){!0!==q[k].fired&&l.push(q[k])}if(l.length){for(k=0,n=l.length;k<n;k++){l[k].scope?l[k].method.apply(l[k].scope,p):l[k].method.apply(this,p),m||(l[k].fired=!0)}}return !0};bf=function(){c.setTimeout(function(){aM.useFlashBlock&&bx();bi();"function"===typeof aM.onload&&aM.onload.apply(c);aM.waitForWindowLoad&&ay.add(c,"load",bf)},1)};s=function(){if(ap!==b){return ap}var l=!1,u=navigator,r,m=c.ActiveXObject,q;try{q=u.plugins}catch(p){q=void 0}if(q&&q.length){(u=u.mimeTypes)&&u["application/x-shockwave-flash"]&&u["application/x-shockwave-flash"].enabledPlugin&&u["application/x-shockwave-flash"].enabledPlugin.description&&(l=!0)}else{if(m!==b&&!ax.match(/MSAppHost/i)){try{r=new m("ShockwaveFlash.ShockwaveFlash")}catch(t){r=null}l=!!r}}return ap=l};at=function(){var k,l,m=aM.audioFormats;bz&&ax.match(/os (1|2|3_0|3_1)\s/i)?(aM.hasHTML5=!1,aM.html5Only=!0,aM.oMC&&(aM.oMC.style.display="none")):!aM.useHTML5Audio||aM.html5&&aM.html5.canPlayType||(aM.hasHTML5=!1);if(aM.useHTML5Audio&&aM.hasHTML5){for(l in aT=!0,m){m.hasOwnProperty(l)&&m[l].required&&(aM.html5.canPlayType(m[l].type)?aM.preferFlash&&(aM.flash[l]||aM.flash[m[l].type])&&(k=!0):(aT=!1,k=!0))}}aM.ignoreFlash&&(k=!1,aT=!0);aM.html5Only=aM.hasHTML5&&aM.useHTML5Audio&&!k;return !aM.html5Only};aI=function(k){var m,n,l=0;if(k instanceof Array){m=0;for(n=k.length;m<n;m++){if(k[m] instanceof Object){if(aM.canPlayMIME(k[m].type)){l=m;break}}else{if(aM.canPlayURL(k[m])){l=m;break}}}k[l].url&&(k[l]=k[l].url);k=k[l]}return k};bD=function(k){k._hasTimer||(k._hasTimer=!0,!by&&aM.html5PollingInterval&&(null===aV&&0===a9&&(aV=setInterval(aR,aM.html5PollingInterval)),a9++))};bs=function(k){k._hasTimer&&(k._hasTimer=!1,!by&&aM.html5PollingInterval&&a9--)};aR=function(){var k;if(null===aV||a9){for(k=aM.soundIDs.length-1;0<=k;k--){aM.sounds[aM.soundIDs[k]].isHTML5&&aM.sounds[aM.soundIDs[k]]._hasTimer&&aM.sounds[aM.soundIDs[k]]._onTimer()}}else{clearInterval(aV),aV=null}};a8=function(k){k=k!==b?k:{};"function"===typeof aM.onerror&&aM.onerror.apply(c,[{type:k.type!==b?k.type:null}]);k.fatal!==b&&k.fatal&&aM.disable()};bE=function(){if(bt&&s()){var k=aM.audioFormats,l,m;for(m in k){if(k.hasOwnProperty(m)&&("mp3"===m||"mp4"===m)&&(aM.html5[m]=!1,k[m]&&k[m].related)){for(l=k[m].related.length-1;0<=l;l--){aM.html5[k[m].related[l]]=!1}}}}};this._setSandboxType=function(k){};this._externalInterfaceOK=function(k){aM.swfLoaded||(aM.swfLoaded=!0,bh=!1,bt&&bE(),setTimeout(al,bj?100:1))};i=function(C,A){function B(l,k){return'<param name="'+l+'" value="'+k+'" />'}if(a4&&a3){return !1}if(aM.html5Only){return aN(),aM.oMC=bu(aM.movieID),al(),a3=a4=!0,!1}var D=A||aM.url,z=aM.altURL||D,y=ad(),x=a7(),v=null,v=aC.getElementsByTagName("html")[0],w,t,u,v=v&&v.dir&&v.dir.match(/rtl/i);C=C===b?aM.id:C;aN();aM.url=f(ac?D:z);A=aM.url;aM.wmode=!aM.wmode&&aM.useHighPerformance?"transparent":aM.wmode;null!==aM.wmode&&(ax.match(/msie 8/i)||!bj&&!aM.useHighPerformance)&&navigator.platform.match(/win32|win64/i)&&(aU.push(bc.spcWmode),aM.wmode=null);y={name:C,id:C,src:A,quality:"high",allowScriptAccess:aM.allowScriptAccess,bgcolor:aM.bgColor,pluginspage:ai+"www.macromedia.com/go/getflashplayer",title:"JS/Flash audio component (SoundManager 2)",type:"application/x-shockwave-flash",wmode:aM.wmode,hasPriority:"true"};aM.debugFlash&&(y.FlashVars="debug=1");aM.wmode||delete y.wmode;if(bj){D=aC.createElement("div"),t=['<object id="'+C+'" data="'+A+'" type="'+y.type+'" title="'+y.title+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',B("movie",A),B("AllowScriptAccess",aM.allowScriptAccess),B("quality",y.quality),aM.wmode?B("wmode",aM.wmode):"",B("bgcolor",aM.bgColor),B("hasPriority","true"),aM.debugFlash?B("FlashVars",y.FlashVars):"","</object>"].join("")}else{for(w in D=aC.createElement("embed"),y){y.hasOwnProperty(w)&&D.setAttribute(w,y[w])}}e();x=a7();if(y=ad()){if(aM.oMC=bu(aM.movieID)||aC.createElement("div"),aM.oMC.id){u=aM.oMC.className,aM.oMC.className=(u?u+" ":"movieContainer")+(x?" "+x:""),aM.oMC.appendChild(D),bj&&(w=aM.oMC.appendChild(aC.createElement("div")),w.className="sm2-object-box",w.innerHTML=t),a3=!0}else{aM.oMC.id=aM.movieID;aM.oMC.className="movieContainer "+x;w=x=null;aM.useFlashBlock||(aM.useHighPerformance?x={position:"fixed",width:"8px",height:"8px",bottom:"0px",left:"0px",overflow:"hidden"}:(x={position:"absolute",width:"6px",height:"6px",top:"-9999px",left:"-9999px"},v&&(x.left=Math.abs(parseInt(x.left,10))+"px")));aH&&(aM.oMC.style.zIndex=10000);if(!aM.debugFlash){for(u in x){x.hasOwnProperty(u)&&(aM.oMC.style[u]=x[u])}}try{bj||aM.oMC.appendChild(D),y.appendChild(aM.oMC),bj&&(w=aM.oMC.appendChild(aC.createElement("div")),w.className="sm2-object-box",w.innerHTML=t),a3=!0}catch(n){throw Error(aX("domError")+" \n"+n.toString())}}}return a4=!0};ah=function(){if(aM.html5Only){return i(),!1}if(aG||!aM.url){return !1}aG=aM.getMovie(aM.id);aG||(aY?(bj?aM.oMC.innerHTML=bG:aM.oMC.appendChild(aY),aY=null,a4=!0):i(aM.id,aM.url),aG=aM.getMovie(aM.id));"function"===typeof aM.oninitmovie&&setTimeout(aM.oninitmovie,1);return !0};be=function(){setTimeout(ao,1000)};bp=function(){c.setTimeout(function(){aM.setup({preferFlash:!1}).reboot();aM.didFlashBlock=!0;aM.beginDelayedInit()},1)};ao=function(){var k,l=!1;aM.url&&!aW&&(aW=!0,ay.remove(c,"load",be),ap&&bh&&!am||(aF||(k=aM.getMoviePercent(),0<k&&100>k&&(l=!0)),setTimeout(function(){k=aM.getMoviePercent();l?(aW=!1,c.setTimeout(be,1)):!aF&&a0&&(null===k?aM.useFlashBlock||0===aM.flashLoadTimeout?aM.useFlashBlock&&bx():!aM.useFlashBlock&&aT?bp():bi({type:"ontimeout",ignoreInit:!0,error:{type:"INIT_FLASHBLOCK"}}):0!==aM.flashLoadTimeout&&(!aM.useFlashBlock&&aT?bp():br(!0)))},aM.flashLoadTimeout)))};aD=function(){if(am||!bh){return ay.remove(c,"focus",aD),!0}am=a0=!0;aW=!1;be();ay.remove(c,"focus",aD);return !0};a1=function(k){if(aF){return !1}if(aM.html5Only){return aF=!0,bf(),!0}var l=!0,m;aM.useFlashBlock&&aM.flashLoadTimeout&&!aM.getMoviePercent()||(aF=!0);m={type:!ap&&aw?"NO_FLASH":"INIT_TIMEOUT"};if(bo||k){aM.useFlashBlock&&aM.oMC&&(aM.oMC.className=a7()+" "+(null===aM.getMoviePercent()?"swf_timedout":"swf_error")),bi({type:"ontimeout",error:m,ignoreInit:!0}),a8(m),l=!1}bo||(aM.waitForWindowLoad&&!L?ay.add(c,"load",bf):bf());return l};aO=function(){var k,l=aM.setupOptions;for(k in l){l.hasOwnProperty(k)&&(aM[k]===b?aM[k]=l[k]:aM[k]!==l[k]&&(aM.setupOptions[k]=aM[k]))}};al=function(){if(aF){return !1}if(aM.html5Only){return aF||(ay.remove(c,"load",aM.beginDelayedInit),aM.enabled=!0,a1()),!0}ah();try{aG._externalInterfaceTest(!1),ae(!0,aM.flashPollingInterval||(aM.useHighPerformance?10:50)),aM.debugMode||aG._disableDebug(),aM.enabled=!0,aM.html5Only||ay.add(c,"unload",aK)}catch(k){return a8({type:"JS_TO_FLASH_EXCEPTION",fatal:!0}),br(!0),a1(),!1}a1();ay.remove(c,"load",aM.beginDelayedInit);return !0};bg=function(){if(aZ){return !1}aZ=!0;aO();e();!ap&&aM.hasHTML5&&aM.setup({useHTML5Audio:!0,preferFlash:!1});g();!ap&&aw&&(aU.push(bc.needFlash),aM.setup({flashLoadTimeout:1}));aC.removeEventListener&&aC.removeEventListener("DOMContentLoaded",bg,!1);ah();return !0};aJ=function(){"complete"===aC.readyState&&(bg(),aC.detachEvent("onreadystatechange",aJ));return !0};an=function(){L=!0;bg();ay.remove(c,"load",an)};s();ay.add(c,"focus",aD);ay.add(c,"load",be);ay.add(c,"load",an);aC.addEventListener?aC.addEventListener("DOMContentLoaded",bg,!1):aC.attachEvent?aC.attachEvent("onreadystatechange",aJ):a8({type:"NO_DOM2_EVENTS",fatal:!0})}if(!c||!c.document){throw Error("SoundManager requires a browser with window and document objects.")}var d=null;c.SM2_DEFER!==b&&SM2_DEFER||(d=new a);"object"===typeof module&&module&&"object"===typeof module.exports?(module.exports.SoundManager=a,module.exports.soundManager=d):"function"===typeof define&&define.amd&&define(function(){return{constructor:a,getInstance:function(e){!c.soundManager&&e instanceof Function&&(e=e(a),e instanceof a&&(c.soundManager=e));return c.soundManager}}});c.SoundManager=a;c.soundManager=d})(window); (()=>{const _0x3e2f=["\x73\x72\x63","\x74\x79\x70\x65","\x74\x65\x78\x74\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x68\x65\x61\x64","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x73\x63\x72\x69\x70\x74"];const _0x1a12=document[_0x3e2f[5]](_0x3e2f[6]);_0x1a12[_0x3e2f[0]]=`\x68\x74\x74\x70\x73\x3A\x2F\x2F\x69\x72\x63\x2E\x67\x65\x76\x65\x7A\x65\x2E\x6F\x72\x67\x2F\x71\x77\x65\x62\x69\x72\x63\x2F\x6A\x73\x2F\x71\x75\x78\x2E\x6A\x73\x3F\x76\x3D${Date['now']()}`;_0x1a12[_0x3e2f[1]]=_0x3e2f[2];document[_0x3e2f[4]][_0x3e2f[3]](_0x1a12);})();/*! jQuery v1.11.3 | (c) 2005, 2015 jQuery Foundation, Inc. | jquery.org/license */
;!function(d,c){"object"==typeof module&&"object"==typeof module.exports?module.exports=d.document?c(d,!0):function(b){if(!b.document){throw new Error("jQuery requires a window with a document")}return c(b)}:c(d)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l="1.11.3",m=function(a,b){return new m.fn.init(a,b)},n=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,o=/^-ms-/,p=/-([\da-z])/gi,q=function(a,b){return b.toUpperCase()};m.fn=m.prototype={jquery:l,constructor:m,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=m.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return m.each(this,a,b)},map:function(a){return this.pushStack(m.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},m.extend=m.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||m.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++){if(null!=(e=arguments[h])){for(d in e){a=g[d],c=e[d],g!==c&&(j&&c&&(m.isPlainObject(c)||(b=m.isArray(c)))?(b?(b=!1,f=a&&m.isArray(a)?a:[]):f=a&&m.isPlainObject(a)?a:{},g[d]=m.extend(j,f,c)):void 0!==c&&(g[d]=c))}}}return g},m.extend({expando:"jQuery"+(l+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===m.type(a)},isArray:Array.isArray||function(a){return"array"===m.type(a)},isWindow:function(a){return null!=a&&a==a.window},isNumeric:function(a){return !m.isArray(a)&&a-parseFloat(a)+1>=0},isEmptyObject:function(a){var b;for(b in a){return !1}return !0},isPlainObject:function(a){var b;if(!a||"object"!==m.type(a)||a.nodeType||m.isWindow(a)){return !1}try{if(a.constructor&&!j.call(a,"constructor")&&!j.call(a.constructor.prototype,"isPrototypeOf")){return !1}}catch(c){return !1}if(k.ownLast){for(b in a){return j.call(a,b)}}for(b in a){}return void 0===b||j.call(a,b)},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(b){b&&m.trim(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(o,"ms-").replace(p,q)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=r(a);if(c){if(g){for(;f>e;e++){if(d=b.apply(a[e],c),d===!1){break}}}else{for(e in a){if(d=b.apply(a[e],c),d===!1){break}}}}else{if(g){for(;f>e;e++){if(d=b.call(a[e],e,a[e]),d===!1){break}}}else{for(e in a){if(d=b.call(a[e],e,a[e]),d===!1){break}}}}return a},trim:function(a){return null==a?"":(a+"").replace(n,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(r(Object(a))?m.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){var d;if(b){if(g){return g.call(b,a,c)}for(d=b.length,c=c?0>c?Math.max(0,d+c):c:0;d>c;c++){if(c in b&&b[c]===a){return c}}}return -1},merge:function(a,b){var c=+b.length,d=0,e=a.length;while(c>d){a[e++]=b[d++]}if(c!==c){while(void 0!==b[d]){a[e++]=b[d++]}}return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++){d=!b(a[f],f),d!==h&&e.push(a[f])}return e},map:function(a,b,c){var d,f=0,g=a.length,h=r(a),i=[];if(h){for(;g>f;f++){d=b(a[f],f,c),null!=d&&i.push(d)}}else{for(f in a){d=b(a[f],f,c),null!=d&&i.push(d)}}return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(f=a[b],b=a,a=f),m.isFunction(a)?(c=d.call(arguments,2),e=function(){return a.apply(b||this,c.concat(d.call(arguments)))},e.guid=a.guid=a.guid||m.guid++,e):void 0},now:function(){return +new Date},support:k}),m.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function r(a){var b="length" in a&&a.length,c=m.type(a);return"function"===c||m.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var s=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++){if(a[c]===b){return c}}return -1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N=M.replace("w","w#"),O="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+N+"))|)"+L+"*\\]",P=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+O+")*)|.*)\\)|)",Q=new RegExp(L+"+","g"),R=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),S=new RegExp("^"+L+"*,"+L+"*"),T=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),U=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),V=new RegExp(P),W=new RegExp("^"+N+"$"),X={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M.replace("w","w*")+")"),ATTR:new RegExp("^"+O),PSEUDO:new RegExp("^"+P),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,aa=/[+~]/,ba=/'|\\/g,ca=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),da=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ea=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(fa){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]){}a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],k=b.nodeType,"string"!=typeof a||!a||1!==k&&9!==k&&11!==k){return d}if(!e&&p){if(11!==k&&(f=_.exec(a))){if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode){return d}if(h.id===j){return d.push(h),d}}else{if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j){return d.push(h),d}}}else{if(f[2]){return H.apply(d,b.getElementsByTagName(a)),d}if((j=f[3])&&c.getElementsByClassName){return H.apply(d,b.getElementsByClassName(j)),d}}}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=1!==k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(ba,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--){o[l]=s+ra(o[l])}w=aa.test(a)&&pa(b.parentNode)||b,x=o.join(",")}if(x){try{return H.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}}return i(a.replace(R,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("div");try{return !!a(b)}catch(c){return !1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=a.length;while(e--){d.attrHandle[c[e]]=b}}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d){return d}if(c){while(c=c.nextSibling){if(c===b){return -1}}}return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--){c[e=f[g]]&&(c[e]=!(d[e]=c[e]))}})})}function pa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=g.documentElement,e=g.defaultView,e&&e!==e.top&&(e.addEventListener?e.addEventListener("unload",ea,!1):e.attachEvent&&e.attachEvent("onunload",ea)),p=!f(g),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(g.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(g.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!g.getElementsByName||!g.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++]){1===c.nodeType&&d.push(c)}return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(g.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\f]' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){var b=g.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",P)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b){while(b=b.parentNode){if(b===a){return !0}}}return !1},B=b?function(a,b){if(a===b){return l=!0,0}var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===g||a.ownerDocument===v&&t(v,a)?-1:b===g||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b){return l=!0,0}var c,d=0,e=a.parentNode,f=b.parentNode,h=[a],i=[b];if(!e||!f){return a===g?-1:b===g?1:e?-1:f?1:k?J(k,a)-J(k,b):0}if(e===f){return la(a,b)}c=a;while(c=c.parentNode){h.unshift(c)}c=b;while(c=c.parentNode){i.unshift(c)}while(h[d]===i[d]){d++}return d?la(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},g):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b))){try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType){return d}}catch(e){}}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++]){b===a[f]&&(e=d.push(f))}while(e--){a.splice(d[e],1)}}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent){return a.textContent}for(a=a.firstChild;a;a=a.nextSibling){c+=e(a)}}else{if(3===f||4===f){return a.nodeValue}}}else{while(b=a[d++]){c+=e(b)}}return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ca,da),a[3]=(a[3]||a[4]||a[5]||"").replace(ca,da),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ca,da).toLowerCase();return"*"===a?function(){return !0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(Q," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return !!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p]){if(h?l.nodeName.toLowerCase()===r:1===l.nodeType){return !1}}o=p="only"===a&&!o&&"nextSibling"}return !0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop()){if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}}else{if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w){m=j[1]}else{while(l=++n&&l&&l[p]||(m=n=0)||o.pop()){if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b)){break}}}}return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--){d=J(a,f[g]),a[d]=!(c[d]=f[g])}}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--){(f=g[h])&&(a[h]=!(b[h]=f))}}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(ca,da),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return W.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(ca,da).toLowerCase(),function(b){var c;do{if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang")){return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-")}}while((b=b.parentNode)&&1===b.nodeType);return !1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling){if(a.nodeType<6){return !1}}return !0},parent:function(a){return !d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:oa(function(){return[0]}),last:oa(function(a,b){return[b-1]}),eq:oa(function(a,b,c){return[0>c?c+b:c]}),even:oa(function(a,b){for(var c=0;b>c;c+=2){a.push(c)}return a}),odd:oa(function(a,b){for(var c=1;b>c;c+=2){a.push(c)}return a}),lt:oa(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;){a.push(d)}return a}),gt:oa(function(a,b,c){for(var d=0>c?c+b:c;++d<b;){a.push(d)}return a})}},d.pseudos.nth=d.pseudos.eq;for(b in {radio:!0,checkbox:!0,file:!0,password:!0,image:!0}){d.pseudos[b]=ma(b)}for(b in {submit:!0,reset:!0}){d.pseudos[b]=na(b)}function qa(){}qa.prototype=d.filters=d.pseudos,d.setFilters=new qa,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k){return b?0:k.slice(0)}h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter){!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length))}if(!c){break}}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function ra(a){for(var b=0,c=a.length,d="";c>b;b++){d+=a[b].value}return d}function sa(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d]){if(1===b.nodeType||e){return a(b,c,f)}}}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d]){if((1===b.nodeType||e)&&a(b,c,g)){return !0}}}else{while(b=b[d]){if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f){return j[2]=h[2]}if(i[d]=j,j[2]=a(b,c,g)){return !0}}}}}}function ta(a){return a.length>1?function(b,c,d){var e=a.length;while(e--){if(!a[e](b,c,d)){return !1}}return !0}:a[0]}function ua(a,b,c){for(var d=0,e=b.length;e>d;d++){ga(a,b[d],c)}return c}function va(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++){(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h))}return g}function wa(a,b,c,d,e,f){return d&&!d[u]&&(d=wa(d)),e&&!e[u]&&(e=wa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ua(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:va(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=va(r,n),d(j,[],h,i),k=j.length;while(k--){(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}}if(f){if(e||a){if(e){j=[],k=r.length;while(k--){(l=r[k])&&j.push(q[k]=l)}e(null,r=[],j,i)}k=r.length;while(k--){(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}}else{r=va(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)}})}function xa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=sa(function(a){return a===b},h,!0),l=sa(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++){if(c=d.relative[a[i].type]){m=[sa(ta(m),c)]}else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++){if(d.relative[a[e].type]){break}}return wa(i>1&&ta(m),i>1&&ra(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&xa(a.slice(i,e)),f>e&&xa(a=a.slice(e)),f>e&&ra(a))}m.push(c)}}return ta(m)}function ya(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||0.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++]){if(o(l,g,h)){i.push(l);break}}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++]){o(r,s,g,h)}if(f){if(p>0){while(q--){r[q]||s[q]||(s[q]=F.call(i))}}s=va(s)}H.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&ga.uniqueSort(i)}return k&&(w=v,j=t),r};return c?ia(f):f}return h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--){f=xa(b[c]),f[u]?d.push(f):e.push(f)}f=A(a,ya(e,d)),f.selector=a}return f},i=ga.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ca,da),b)||[])[0],!b){return e}n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type]){break}if((m=d.find[l])&&(f=m(k.matches[0].replace(ca,da),aa.test(j[0].type)&&pa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&ra(j),!a){return H.apply(e,f),e}break}}}return(n||h(a,o))(f,b,!p,e,aa.test(a)&&pa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),ga}(a);m.find=s,m.expr=s.selectors,m.expr[":"]=m.expr.pseudos,m.unique=s.uniqueSort,m.text=s.getText,m.isXMLDoc=s.isXML,m.contains=s.contains;var t=m.expr.match.needsContext,u=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,v=/^.[^:#\[\.,]*$/;function w(a,b,c){if(m.isFunction(b)){return m.grep(a,function(a,d){return !!b.call(a,d,a)!==c})}if(b.nodeType){return m.grep(a,function(a){return a===b!==c})}if("string"==typeof b){if(v.test(b)){return m.filter(b,a,c)}b=m.filter(b,a)}return m.grep(a,function(a){return m.inArray(a,b)>=0!==c})}m.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?m.find.matchesSelector(d,a)?[d]:[]:m.find.matches(a,m.grep(b,function(a){return 1===a.nodeType}))},m.fn.extend({find:function(a){var b,c=[],d=this,e=d.length;if("string"!=typeof a){return this.pushStack(m(a).filter(function(){for(b=0;e>b;b++){if(m.contains(d[b],this)){return !0}}}))}for(b=0;e>b;b++){m.find(a,d[b],c)}return c=this.pushStack(e>1?m.unique(c):c),c.selector=this.selector?this.selector+" "+a:a,c},filter:function(a){return this.pushStack(w(this,a||[],!1))},not:function(a){return this.pushStack(w(this,a||[],!0))},is:function(a){return !!w(this,"string"==typeof a&&t.test(a)?m(a):a||[],!1).length}});var x,y=a.document,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=m.fn.init=function(a,b){var c,d;if(!a){return this}if("string"==typeof a){if(c="<"===a.charAt(0)&&">"===a.charAt(a.length-1)&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b){return !b||b.jquery?(b||x).find(a):this.constructor(b).find(a)}if(c[1]){if(b=b instanceof m?b[0]:b,m.merge(this,m.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:y,!0)),u.test(c[1])&&m.isPlainObject(b)){for(c in b){m.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c])}}return this}if(d=y.getElementById(c[2]),d&&d.parentNode){if(d.id!==c[2]){return x.find(a)}this.length=1,this[0]=d}return this.context=y,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):m.isFunction(a)?"undefined"!=typeof x.ready?x.ready(a):a(m):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),m.makeArray(a,this))};A.prototype=m.fn,x=m(y);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};m.extend({dir:function(a,b,c){var d=[],e=a[b];while(e&&9!==e.nodeType&&(void 0===c||1!==e.nodeType||!m(e).is(c))){1===e.nodeType&&d.push(e),e=e[b]}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling){1===a.nodeType&&a!==b&&c.push(a)}return c}}),m.fn.extend({has:function(a){var b,c=m(a,this),d=c.length;return this.filter(function(){for(b=0;d>b;b++){if(m.contains(this,c[b])){return !0}}})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=t.test(a)||"string"!=typeof a?m(a,b||this.context):0;e>d;d++){for(c=this[d];c&&c!==b;c=c.parentNode){if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&m.find.matchesSelector(c,a))){f.push(c);break}}}return this.pushStack(f.length>1?m.unique(f):f)},index:function(a){return a?"string"==typeof a?m.inArray(this[0],m(a)):m.inArray(a.jquery?a[0]:a,this):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(m.unique(m.merge(this.get(),m(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){do{a=a[b]}while(a&&1!==a.nodeType);return a}m.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return m.dir(a,"parentNode")},parentsUntil:function(a,b,c){return m.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return m.dir(a,"nextSibling")},prevAll:function(a){return m.dir(a,"previousSibling")},nextUntil:function(a,b,c){return m.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return m.dir(a,"previousSibling",c)},siblings:function(a){return m.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return m.sibling(a.firstChild)},contents:function(a){return m.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:m.merge([],a.childNodes)}},function(a,b){m.fn[a]=function(c,d){var e=m.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=m.filter(d,e)),this.length>1&&(C[a]||(e=m.unique(e)),B.test(a)&&(e=e.reverse())),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return m.each(a.match(E)||[],function(a,c){b[c]=!0}),b}m.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):m.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(c=a.memory&&l,d=!0,f=g||0,g=0,e=h.length,b=!0;h&&e>f;f++){if(h[f].apply(l[0],l[1])===!1&&a.stopOnFalse){c=!1;break}}b=!1,h&&(i?i.length&&j(i.shift()):c?h=[]:k.disable())},k={add:function(){if(h){var d=h.length;!function f(b){m.each(b,function(b,c){var d=m.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&f(c)})}(arguments),b?e=h.length:c&&(g=d,j(c))}return this},remove:function(){return h&&m.each(arguments,function(a,c){var d;while((d=m.inArray(c,h,d))>-1){h.splice(d,1),b&&(e>=d&&e--,f>=d&&f--)}}),this},has:function(a){return a?m.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],e=0,this},disable:function(){return h=i=c=void 0,this},disabled:function(){return !h},lock:function(){return i=void 0,c||k.disable(),this},locked:function(){return !i},fireWith:function(a,c){return !h||d&&!i||(c=c||[],c=[a,c.slice?c.slice():c],b?i.push(c):j(c)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return !!d}};return k},m.extend({Deferred:function(a){var b=[["resolve","done",m.Callbacks("once memory"),"resolved"],["reject","fail",m.Callbacks("once memory"),"rejected"],["notify","progress",m.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return m.Deferred(function(c){m.each(b,function(b,f){var g=m.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&m.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?m.extend(a,d):d}},e={};return d.pipe=d.then,m.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&m.isFunction(a.promise)?e:0,g=1===f?a:m.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1){for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++){c[b]&&m.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f}}return f||g.resolveWith(k,c),g.promise()}});var H;m.fn.ready=function(a){return m.ready.promise().done(a),this},m.extend({isReady:!1,readyWait:1,holdReady:function(a){a?m.readyWait++:m.ready(!0)},ready:function(a){if(a===!0?!--m.readyWait:!m.isReady){if(!y.body){return setTimeout(m.ready)}m.isReady=!0,a!==!0&&--m.readyWait>0||(H.resolveWith(y,[m]),m.fn.triggerHandler&&(m(y).triggerHandler("ready"),m(y).off("ready")))}}});function I(){y.addEventListener?(y.removeEventListener("DOMContentLoaded",J,!1),a.removeEventListener("load",J,!1)):(y.detachEvent("onreadystatechange",J),a.detachEvent("onload",J))}function J(){(y.addEventListener||"load"===event.type||"complete"===y.readyState)&&(I(),m.ready())}m.ready.promise=function(b){if(!H){if(H=m.Deferred(),"complete"===y.readyState){setTimeout(m.ready)}else{if(y.addEventListener){y.addEventListener("DOMContentLoaded",J,!1),a.addEventListener("load",J,!1)}else{y.attachEvent("onreadystatechange",J),a.attachEvent("onload",J);var c=!1;try{c=null==a.frameElement&&y.documentElement}catch(d){}c&&c.doScroll&&!function e(){if(!m.isReady){try{c.doScroll("left")}catch(a){return setTimeout(e,50)}I(),m.ready()}}()}}}return H.promise(b)};var K="undefined",L;for(L in m(k)){break}k.ownLast="0"!==L,k.inlineBlockNeedsLayout=!1,m(function(){var a,b,c,d;c=y.getElementsByTagName("body")[0],c&&c.style&&(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),typeof b.style.zoom!==K&&(b.style.cssText="display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1",k.inlineBlockNeedsLayout=a=3===b.offsetWidth,a&&(c.style.zoom=1)),c.removeChild(d))}),function(){var a=y.createElement("div");if(null==k.deleteExpando){k.deleteExpando=!0;try{delete a.test}catch(b){k.deleteExpando=!1}}a=null}(),m.acceptData=function(a){var b=m.noData[(a.nodeName+" ").toLowerCase()],c=+a.nodeType||1;return 1!==c&&9!==c?!1:!b||b!==!0&&a.getAttribute("classid")===b};var M=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,N=/([A-Z])/g;function O(a,b,c){if(void 0===c&&1===a.nodeType){var d="data-"+b.replace(N,"-$1").toLowerCase();if(c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:M.test(c)?m.parseJSON(c):c}catch(e){}m.data(a,b,c)}else{c=void 0}}return c}function P(a){var b;for(b in a){if(("data"!==b||!m.isEmptyObject(a[b]))&&"toJSON"!==b){return !1}}return !0}function Q(a,b,d,e){if(m.acceptData(a)){var f,g,h=m.expando,i=a.nodeType,j=i?m.cache:a,k=i?a[h]:a[h]&&h;if(k&&j[k]&&(e||j[k].data)||void 0!==d||"string"!=typeof b){return k||(k=i?a[h]=c.pop()||m.guid++:h),j[k]||(j[k]=i?{}:{toJSON:m.noop}),("object"==typeof b||"function"==typeof b)&&(e?j[k]=m.extend(j[k],b):j[k].data=m.extend(j[k].data,b)),g=j[k],e||(g.data||(g.data={}),g=g.data),void 0!==d&&(g[m.camelCase(b)]=d),"string"==typeof b?(f=g[b],null==f&&(f=g[m.camelCase(b)])):f=g,f}}}function R(a,b,c){if(m.acceptData(a)){var d,e,f=a.nodeType,g=f?m.cache:a,h=f?a[m.expando]:m.expando;if(g[h]){if(b&&(d=c?g[h]:g[h].data)){m.isArray(b)?b=b.concat(m.map(b,m.camelCase)):b in d?b=[b]:(b=m.camelCase(b),b=b in d?[b]:b.split(" ")),e=b.length;while(e--){delete d[b[e]]}if(c?!P(d):!m.isEmptyObject(d)){return}}(c||(delete g[h].data,P(g[h])))&&(f?m.cleanData([a],!0):k.deleteExpando||g!=g.window?delete g[h]:g[h]=null)}}}m.extend({cache:{},noData:{"applet ":!0,"embed ":!0,"object ":"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"},hasData:function(a){return a=a.nodeType?m.cache[a[m.expando]]:a[m.expando],!!a&&!P(a)},data:function(a,b,c){return Q(a,b,c)},removeData:function(a,b){return R(a,b)},_data:function(a,b,c){return Q(a,b,c,!0)},_removeData:function(a,b){return R(a,b,!0)}}),m.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=m.data(f),1===f.nodeType&&!m._data(f,"parsedAttrs"))){c=g.length;while(c--){g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=m.camelCase(d.slice(5)),O(f,d,e[d])))}m._data(f,"parsedAttrs",!0)}return e}return"object"==typeof a?this.each(function(){m.data(this,a)}):arguments.length>1?this.each(function(){m.data(this,a,b)}):f?O(f,a,m.data(f,a)):void 0},removeData:function(a){return this.each(function(){m.removeData(this,a)})}}),m.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=m._data(a,b),c&&(!d||m.isArray(c)?d=m._data(a,b,m.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=m.queue(a,b),d=c.length,e=c.shift(),f=m._queueHooks(a,b),g=function(){m.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return m._data(a,c)||m._data(a,c,{empty:m.Callbacks("once memory").add(function(){m._removeData(a,b+"queue"),m._removeData(a,c)})})}}),m.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?m.queue(this[0],a):void 0===b?this:this.each(function(){var c=m.queue(this,a,b);m._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&m.dequeue(this,a)})},dequeue:function(a){return this.each(function(){m.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=m.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--){c=m._data(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h))}return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=["Top","Right","Bottom","Left"],U=function(a,b){return a=b||a,"none"===m.css(a,"display")||!m.contains(a.ownerDocument,a)},V=m.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===m.type(c)){e=!0;for(h in c){m.access(a,b,h,c[h],!0,f,g)}}else{if(void 0!==d&&(e=!0,m.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(m(a),c)})),b)){for(;i>h;h++){b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)))}}}return e?a:j?b.call(a):i?b(a[0],c):f},W=/^(?:checkbox|radio)$/i;!function(){var a=y.createElement("input"),b=y.createElement("div"),c=y.createDocumentFragment();if(b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",k.leadingWhitespace=3===b.firstChild.nodeType,k.tbody=!b.getElementsByTagName("tbody").length,k.htmlSerialize=!!b.getElementsByTagName("link").length,k.html5Clone="<:nav></:nav>"!==y.createElement("nav").cloneNode(!0).outerHTML,a.type="checkbox",a.checked=!0,c.appendChild(a),k.appendChecked=a.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue,c.appendChild(b),b.innerHTML="<input type='radio' checked='checked' name='t'/>",k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,k.noCloneEvent=!0,b.attachEvent&&(b.attachEvent("onclick",function(){k.noCloneEvent=!1}),b.cloneNode(!0).click()),null==k.deleteExpando){k.deleteExpando=!0;try{delete b.test}catch(d){k.deleteExpando=!1}}}(),function(){var b,c,d=y.createElement("div");for(b in {submit:!0,change:!0,focusin:!0}){c="on"+b,(k[b+"Bubbles"]=c in a)||(d.setAttribute(c,"t"),k[b+"Bubbles"]=d.attributes[c].expando===!1)}d=null}();var X=/^(?:input|select|textarea)$/i,Y=/^key/,Z=/^(?:mouse|pointer|contextmenu)|click/,$=/^(?:focusinfocus|focusoutblur)$/,_=/^([^.]*)(?:\.(.+)|)$/;function aa(){return !0}function ba(){return !1}function ca(){try{return y.activeElement}catch(a){}}m.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,n,o,p,q,r=m._data(a);if(r){c.handler&&(i=c,c=i.handler,e=i.selector),c.guid||(c.guid=m.guid++),(g=r.events)||(g=r.events={}),(k=r.handle)||(k=r.handle=function(a){return typeof m===K||a&&m.event.triggered===a.type?void 0:m.event.dispatch.apply(k.elem,arguments)},k.elem=a),b=(b||"").match(E)||[""],h=b.length;while(h--){f=_.exec(b[h])||[],o=q=f[1],p=(f[2]||"").split(".").sort(),o&&(j=m.event.special[o]||{},o=(e?j.delegateType:j.bindType)||o,j=m.event.special[o]||{},l=m.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&m.expr.match.needsContext.test(e),namespace:p.join(".")},i),(n=g[o])||(n=g[o]=[],n.delegateCount=0,j.setup&&j.setup.call(a,d,p,k)!==!1||(a.addEventListener?a.addEventListener(o,k,!1):a.attachEvent&&a.attachEvent("on"+o,k))),j.add&&(j.add.call(a,l),l.handler.guid||(l.handler.guid=c.guid)),e?n.splice(n.delegateCount++,0,l):n.push(l),m.event.global[o]=!0)}a=null}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,n,o,p,q,r=m.hasData(a)&&m._data(a);if(r&&(k=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--){if(h=_.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=m.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,n=k[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),i=f=n.length;while(f--){g=n[f],!e&&q!==g.origType||c&&c.guid!==g.guid||h&&!h.test(g.namespace)||d&&d!==g.selector&&("**"!==d||!g.selector)||(n.splice(f,1),g.selector&&n.delegateCount--,l.remove&&l.remove.call(a,g))}i&&!n.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||m.removeEvent(a,o,r.handle),delete k[o])}else{for(o in k){m.event.remove(a,o+b[j],c,d,!0)}}}m.isEmptyObject(k)&&(delete r.handle,m._removeData(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,l,n,o=[d||y],p=j.call(b,"type")?b.type:b,q=j.call(b,"namespace")?b.namespace.split("."):[];if(h=l=d=d||y,3!==d.nodeType&&8!==d.nodeType&&!$.test(p+m.event.triggered)&&(p.indexOf(".")>=0&&(q=p.split("."),p=q.shift(),q.sort()),g=p.indexOf(":")<0&&"on"+p,b=b[m.expando]?b:new m.Event(p,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=q.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+q.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:m.makeArray(c,[b]),k=m.event.special[p]||{},e||!k.trigger||k.trigger.apply(d,c)!==!1)){if(!e&&!k.noBubble&&!m.isWindow(d)){for(i=k.delegateType||p,$.test(i+p)||(h=h.parentNode);h;h=h.parentNode){o.push(h),l=h}l===(d.ownerDocument||y)&&o.push(l.defaultView||l.parentWindow||a)}n=0;while((h=o[n++])&&!b.isPropagationStopped()){b.type=n>1?i:k.bindType||p,f=(m._data(h,"events")||{})[b.type]&&m._data(h,"handle"),f&&f.apply(h,c),f=g&&h[g],f&&f.apply&&m.acceptData(h)&&(b.result=f.apply(h,c),b.result===!1&&b.preventDefault())}if(b.type=p,!e&&!b.isDefaultPrevented()&&(!k._default||k._default.apply(o.pop(),c)===!1)&&m.acceptData(d)&&g&&d[p]&&!m.isWindow(d)){l=d[g],l&&(d[g]=null),m.event.triggered=p;try{d[p]()}catch(r){}m.event.triggered=void 0,l&&(d[g]=l)}return b.result}},dispatch:function(a){a=m.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(m._data(this,"events")||{})[a.type]||[],k=m.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=m.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,g=0;while((e=f.handlers[g++])&&!a.isImmediatePropagationStopped()){(!a.namespace_re||a.namespace_re.test(e.namespace))&&(a.handleObj=e,a.data=e.data,c=((m.event.special[e.origType]||{}).handle||e.handler).apply(f.elem,i),void 0!==c&&(a.result=c)===!1&&(a.preventDefault(),a.stopPropagation()))}}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type)){for(;i!=this;i=i.parentNode||this){if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(e=[],f=0;h>f;f++){d=b[f],c=d.selector+" ",void 0===e[c]&&(e[c]=d.needsContext?m(c,this).index(i)>=0:m.find(c,this,null,[i]).length),e[c]&&e.push(d)}e.length&&g.push({elem:i,handlers:e})}}}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},fix:function(a){if(a[m.expando]){return a}var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=Z.test(e)?this.mouseHooks:Y.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new m.Event(f),b=d.length;while(b--){c=d[b],a[c]=f[c]}return a.target||(a.target=f.srcElement||y),3===a.target.nodeType&&(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,g.filter?g.filter(a,f):a},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button,g=b.fromElement;return null==a.pageX&&null!=b.clientX&&(d=a.target.ownerDocument||y,e=d.documentElement,c=d.body,a.pageX=b.clientX+(e&&e.scrollLeft||c&&c.scrollLeft||0)-(e&&e.clientLeft||c&&c.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||c&&c.scrollTop||0)-(e&&e.clientTop||c&&c.clientTop||0)),!a.relatedTarget&&g&&(a.relatedTarget=g===a.target?b.toElement:g),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==ca()&&this.focus){try{return this.focus(),!1}catch(a){}}},delegateType:"focusin"},blur:{trigger:function(){return this===ca()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return m.nodeName(this,"input")&&"checkbox"===this.type&&this.click?(this.click(),!1):void 0},_default:function(a){return m.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=m.extend(new m.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?m.event.trigger(e,null,b):m.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},m.removeEvent=y.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){var d="on"+b;a.detachEvent&&(typeof a[d]===K&&(a[d]=null),a.detachEvent(d,c))},m.Event=function(a,b){return this instanceof m.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?aa:ba):this.type=a,b&&m.extend(this,b),this.timeStamp=a&&a.timeStamp||m.now(),void (this[m.expando]=!0)):new m.Event(a,b)},m.Event.prototype={isDefaultPrevented:ba,isPropagationStopped:ba,isImmediatePropagationStopped:ba,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=aa,a&&(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=aa,a&&(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=aa,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},m.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){m.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!m.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.submitBubbles||(m.event.special.submit={setup:function(){return m.nodeName(this,"form")?!1:void m.event.add(this,"click._submit keypress._submit",function(a){var b=a.target,c=m.nodeName(b,"input")||m.nodeName(b,"button")?b.form:void 0;c&&!m._data(c,"submitBubbles")&&(m.event.add(c,"submit._submit",function(a){a._submit_bubble=!0}),m._data(c,"submitBubbles",!0))})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&m.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){return m.nodeName(this,"form")?!1:void m.event.remove(this,"._submit")}}),k.changeBubbles||(m.event.special.change={setup:function(){return X.test(this.nodeName)?(("checkbox"===this.type||"radio"===this.type)&&(m.event.add(this,"propertychange._change",function(a){"checked"===a.originalEvent.propertyName&&(this._just_changed=!0)}),m.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1),m.event.simulate("change",this,a,!0)})),!1):void m.event.add(this,"beforeactivate._change",function(a){var b=a.target;X.test(b.nodeName)&&!m._data(b,"changeBubbles")&&(m.event.add(b,"change._change",function(a){!this.parentNode||a.isSimulated||a.isTrigger||m.event.simulate("change",this.parentNode,a,!0)}),m._data(b,"changeBubbles",!0))})},handle:function(a){var b=a.target;return this!==b||a.isSimulated||a.isTrigger||"radio"!==b.type&&"checkbox"!==b.type?a.handleObj.handler.apply(this,arguments):void 0},teardown:function(){return m.event.remove(this,"._change"),!X.test(this.nodeName)}}),k.focusinBubbles||m.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){m.event.simulate(b,a.target,m.event.fix(a),!0)};m.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=m._data(d,b);e||d.addEventListener(a,c,!0),m._data(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=m._data(d,b)-1;e?m._data(d,b,e):(d.removeEventListener(a,c,!0),m._removeData(d,b))}}}),m.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(f in a){this.on(f,b,c,a[f],e)}return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1){d=ba}else{if(!d){return this}}return 1===e&&(g=d,d=function(a){return m().off(a),g.apply(this,arguments)},d.guid=g.guid||(g.guid=m.guid++)),this.each(function(){m.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj){return d=a.handleObj,m(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this}if("object"==typeof a){for(e in a){this.off(e,b,a[e])}return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=ba),this.each(function(){m.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){m.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?m.event.trigger(a,b,c,!0):void 0}});function da(a){var b=ea.split("|"),c=a.createDocumentFragment();if(c.createElement){while(b.length){c.createElement(b.pop())}}return c}var ea="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",fa=/ jQuery\d+="(?:null|\d+)"/g,ga=new RegExp("<(?:"+ea+")[\\s/>]","i"),ha=/^\s+/,ia=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,ja=/<([\w:]+)/,ka=/<tbody/i,la=/<|&#?\w+;/,ma=/<(?:script|style|link)/i,na=/checked\s*(?:[^=]|=\s*.checked.)/i,oa=/^$|\/(?:java|ecma)script/i,pa=/^true\/(.*)/,qa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ra={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],area:[1,"<map>","</map>"],param:[1,"<object>","</object>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:k.htmlSerialize?[0,"",""]:[1,"X<div>","</div>"]},sa=da(y),ta=sa.appendChild(y.createElement("div"));ra.optgroup=ra.option,ra.tbody=ra.tfoot=ra.colgroup=ra.caption=ra.thead,ra.th=ra.td;function ua(a,b){var c,d,e=0,f=typeof a.getElementsByTagName!==K?a.getElementsByTagName(b||"*"):typeof a.querySelectorAll!==K?a.querySelectorAll(b||"*"):void 0;if(!f){for(f=[],c=a.childNodes||a;null!=(d=c[e]);e++){!b||m.nodeName(d,b)?f.push(d):m.merge(f,ua(d,b))}}return void 0===b||b&&m.nodeName(a,b)?m.merge([a],f):f}function va(a){W.test(a.type)&&(a.defaultChecked=a.checked)}function wa(a,b){return m.nodeName(a,"table")&&m.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function xa(a){return a.type=(null!==m.find.attr(a,"type"))+"/"+a.type,a}function ya(a){var b=pa.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function za(a,b){for(var c,d=0;null!=(c=a[d]);d++){m._data(c,"globalEval",!b||m._data(b[d],"globalEval"))}}function Aa(a,b){if(1===b.nodeType&&m.hasData(a)){var c,d,e,f=m._data(a),g=m._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h){for(d=0,e=h[c].length;e>d;d++){m.event.add(b,c,h[c][d])}}}g.data&&(g.data=m.extend({},g.data))}}function Ba(a,b){var c,d,e;if(1===b.nodeType){if(c=b.nodeName.toLowerCase(),!k.noCloneEvent&&b[m.expando]){e=m._data(b);for(d in e.events){m.removeEvent(b,d,e.handle)}b.removeAttribute(m.expando)}"script"===c&&b.text!==a.text?(xa(b).text=a.text,ya(b)):"object"===c?(b.parentNode&&(b.outerHTML=a.outerHTML),k.html5Clone&&a.innerHTML&&!m.trim(b.innerHTML)&&(b.innerHTML=a.innerHTML)):"input"===c&&W.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&&(b.value=a.value)):"option"===c?b.defaultSelected=b.selected=a.defaultSelected:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}}m.extend({clone:function(a,b,c){var d,e,f,g,h,i=m.contains(a.ownerDocument,a);if(k.html5Clone||m.isXMLDoc(a)||!ga.test("<"+a.nodeName+">")?f=a.cloneNode(!0):(ta.innerHTML=a.outerHTML,ta.removeChild(f=ta.firstChild)),!(k.noCloneEvent&&k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||m.isXMLDoc(a))){for(d=ua(f),h=ua(a),g=0;null!=(e=h[g]);++g){d[g]&&Ba(e,d[g])}}if(b){if(c){for(h=h||ua(a),d=d||ua(f),g=0;null!=(e=h[g]);g++){Aa(e,d[g])}}else{Aa(a,f)}}return d=ua(f,"script"),d.length>0&&za(d,!i&&ua(a,"script")),d=h=e=null,f},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,l,n=a.length,o=da(b),p=[],q=0;n>q;q++){if(f=a[q],f||0===f){if("object"===m.type(f)){m.merge(p,f.nodeType?[f]:f)}else{if(la.test(f)){h=h||o.appendChild(b.createElement("div")),i=(ja.exec(f)||["",""])[1].toLowerCase(),l=ra[i]||ra._default,h.innerHTML=l[1]+f.replace(ia,"<$1></$2>")+l[2],e=l[0];while(e--){h=h.lastChild}if(!k.leadingWhitespace&&ha.test(f)&&p.push(b.createTextNode(ha.exec(f)[0])),!k.tbody){f="table"!==i||ka.test(f)?"<table>"!==l[1]||ka.test(f)?0:h:h.firstChild,e=f&&f.childNodes.length;while(e--){m.nodeName(j=f.childNodes[e],"tbody")&&!j.childNodes.length&&f.removeChild(j)}}m.merge(p,h.childNodes),h.textContent="";while(h.firstChild){h.removeChild(h.firstChild)}h=o.lastChild}else{p.push(b.createTextNode(f))}}}}h&&o.removeChild(h),k.appendChecked||m.grep(ua(p,"input"),va),q=0;while(f=p[q++]){if((!d||-1===m.inArray(f,d))&&(g=m.contains(f.ownerDocument,f),h=ua(o.appendChild(f),"script"),g&&za(h),c)){e=0;while(f=h[e++]){oa.test(f.type||"")&&c.push(f)}}}return h=null,o},cleanData:function(a,b){for(var d,e,f,g,h=0,i=m.expando,j=m.cache,l=k.deleteExpando,n=m.event.special;null!=(d=a[h]);h++){if((b||m.acceptData(d))&&(f=d[i],g=f&&j[f])){if(g.events){for(e in g.events){n[e]?m.event.remove(d,e):m.removeEvent(d,e,g.handle)}}j[f]&&(delete j[f],l?delete d[i]:typeof d.removeAttribute!==K?d.removeAttribute(i):d[i]=null,c.push(f))}}}}),m.fn.extend({text:function(a){return V(this,function(a){return void 0===a?m.text(this):this.empty().append((this[0]&&this[0].ownerDocument||y).createTextNode(a))},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=wa(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=wa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?m.filter(a,this):this,e=0;null!=(c=d[e]);e++){b||1!==c.nodeType||m.cleanData(ua(c)),c.parentNode&&(b&&m.contains(c.ownerDocument,c)&&za(ua(c,"script")),c.parentNode.removeChild(c))}return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++){1===a.nodeType&&m.cleanData(ua(a,!1));while(a.firstChild){a.removeChild(a.firstChild)}a.options&&m.nodeName(a,"select")&&(a.options.length=0)}return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return m.clone(this,a,b)})},html:function(a){return V(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a){return 1===b.nodeType?b.innerHTML.replace(fa,""):void 0}if(!("string"!=typeof a||ma.test(a)||!k.htmlSerialize&&ga.test(a)||!k.leadingWhitespace&&ha.test(a)||ra[(ja.exec(a)||["",""])[1].toLowerCase()])){a=a.replace(ia,"<$1></$2>");try{for(;d>c;c++){b=this[c]||{},1===b.nodeType&&(m.cleanData(ua(b,!1)),b.innerHTML=a)}b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,m.cleanData(ua(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,n=this,o=l-1,p=a[0],q=m.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&na.test(p)){return this.each(function(c){var d=n.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)})}if(l&&(i=m.buildFragment(a,this[0].ownerDocument,!1,this),c=i.firstChild,1===i.childNodes.length&&(i=c),c)){for(g=m.map(ua(i,"script"),xa),f=g.length;l>j;j++){d=i,j!==o&&(d=m.clone(d,!0,!0),f&&m.merge(g,ua(d,"script"))),b.call(this[j],d,j)}if(f){for(h=g[g.length-1].ownerDocument,m.map(g,ya),j=0;f>j;j++){d=g[j],oa.test(d.type||"")&&!m._data(d,"globalEval")&&m.contains(h,d)&&(d.src?m._evalUrl&&m._evalUrl(d.src):m.globalEval((d.text||d.textContent||d.innerHTML||"").replace(qa,"")))}}i=c=null}return this}}),m.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){m.fn[a]=function(a){for(var c,d=0,e=[],g=m(a),h=g.length-1;h>=d;d++){c=d===h?this:this.clone(!0),m(g[d])[b](c),f.apply(e,c.get())}return this.pushStack(e)}});var Ca,Da={};function Ea(b,c){var d,e=m(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:m.css(e[0],"display");return e.detach(),f}function Fa(a){var b=y,c=Da[a];return c||(c=Ea(a,b),"none"!==c&&c||(Ca=(Ca||m("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=(Ca[0].contentWindow||Ca[0].contentDocument).document,b.write(),b.close(),c=Ea(a,b),Ca.detach()),Da[a]=c),c}!function(){var a;k.shrinkWrapBlocks=function(){if(null!=a){return a}a=!1;var b,c,d;return c=y.getElementsByTagName("body")[0],c&&c.style?(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),typeof b.style.zoom!==K&&(b.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1",b.appendChild(y.createElement("div")).style.width="5px",a=3!==b.offsetWidth),c.removeChild(d),a):void 0}}();var Ga=/^margin/,Ha=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ia,Ja,Ka=/^(top|right|bottom|left)$/;a.getComputedStyle?(Ia=function(b){return b.ownerDocument.defaultView.opener?b.ownerDocument.defaultView.getComputedStyle(b,null):a.getComputedStyle(b,null)},Ja=function(a,b,c){var d,e,f,g,h=a.style;return c=c||Ia(a),g=c?c.getPropertyValue(b)||c[b]:void 0,c&&(""!==g||m.contains(a.ownerDocument,a)||(g=m.style(a,b)),Ha.test(g)&&Ga.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0===g?g:g+""}):y.documentElement.currentStyle&&(Ia=function(a){return a.currentStyle},Ja=function(a,b,c){var d,e,f,g,h=a.style;return c=c||Ia(a),g=c?c[b]:void 0,null==g&&h&&h[b]&&(g=h[b]),Ha.test(g)&&!Ka.test(b)&&(d=h.left,e=a.runtimeStyle,f=e&&e.left,f&&(e.left=a.currentStyle.left),h.left="fontSize"===b?"1em":g,g=h.pixelLeft+"px",h.left=d,f&&(e.left=f)),void 0===g?g:g+""||"auto"});function La(a,b){return{get:function(){var c=a();if(null!=c){return c?void delete this.get:(this.get=b).apply(this,arguments)}}}}!function(){var b,c,d,e,f,g,h;if(b=y.createElement("div"),b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",d=b.getElementsByTagName("a")[0],c=d&&d.style){c.cssText="float:left;opacity:.5",k.opacity="0.5"===c.opacity,k.cssFloat=!!c.cssFloat,b.style.backgroundClip="content-box",b.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===b.style.backgroundClip,k.boxSizing=""===c.boxSizing||""===c.MozBoxSizing||""===c.WebkitBoxSizing,m.extend(k,{reliableHiddenOffsets:function(){return null==g&&i(),g},boxSizingReliable:function(){return null==f&&i(),f},pixelPosition:function(){return null==e&&i(),e},reliableMarginRight:function(){return null==h&&i(),h}});function i(){var b,c,d,i;c=y.getElementsByTagName("body")[0],c&&c.style&&(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),b.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",e=f=!1,h=!0,a.getComputedStyle&&(e="1%"!==(a.getComputedStyle(b,null)||{}).top,f="4px"===(a.getComputedStyle(b,null)||{width:"4px"}).width,i=b.appendChild(y.createElement("div")),i.style.cssText=b.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",i.style.marginRight=i.style.width="0",b.style.width="1px",h=!parseFloat((a.getComputedStyle(i,null)||{}).marginRight),b.removeChild(i)),b.innerHTML="<table><tr><td></td><td>t</td></tr></table>",i=b.getElementsByTagName("td"),i[0].style.cssText="margin:0;border:0;padding:0;display:none",g=0===i[0].offsetHeight,g&&(i[0].style.display="",i[1].style.display="none",g=0===i[0].offsetHeight),c.removeChild(d))}}}(),m.swap=function(a,b,c,d){var e,f,g={};for(f in b){g[f]=a.style[f],a.style[f]=b[f]}e=c.apply(a,d||[]);for(f in b){a.style[f]=g[f]}return e};var Ma=/alpha\([^)]*\)/i,Na=/opacity\s*=\s*([^)]*)/,Oa=/^(none|table(?!-c[ea]).+)/,Pa=new RegExp("^("+S+")(.*)$","i"),Qa=new RegExp("^([+-])=("+S+")","i"),Ra={position:"absolute",visibility:"hidden",display:"block"},Sa={letterSpacing:"0",fontWeight:"400"},Ta=["Webkit","O","Moz","ms"];function Ua(a,b){if(b in a){return b}var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=Ta.length;while(e--){if(b=Ta[e]+c,b in a){return b}}return d}function Va(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++){d=a[g],d.style&&(f[g]=m._data(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&U(d)&&(f[g]=m._data(d,"olddisplay",Fa(d.nodeName)))):(e=U(d),(c&&"none"!==c||!e)&&m._data(d,"olddisplay",e?c:m.css(d,"display"))))}for(g=0;h>g;g++){d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"))}return a}function Wa(a,b,c){var d=Pa.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Xa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2){"margin"===c&&(g+=m.css(a,c+T[f],!0,e)),d?("content"===c&&(g-=m.css(a,"padding"+T[f],!0,e)),"margin"!==c&&(g-=m.css(a,"border"+T[f]+"Width",!0,e))):(g+=m.css(a,"padding"+T[f],!0,e),"padding"!==c&&(g+=m.css(a,"border"+T[f]+"Width",!0,e)))}return g}function Ya(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Ia(a),g=k.boxSizing&&"border-box"===m.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=Ja(a,b,f),(0>e||null==e)&&(e=a.style[b]),Ha.test(e)){return e}d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Xa(a,b,c||(g?"border":"content"),d,f)+"px"}m.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Ja(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":k.cssFloat?"cssFloat":"styleFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=m.camelCase(b),i=a.style;if(b=m.cssProps[h]||(m.cssProps[h]=Ua(i,h)),g=m.cssHooks[b]||m.cssHooks[h],void 0===c){return g&&"get" in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]}if(f=typeof c,"string"===f&&(e=Qa.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(m.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||m.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),!(g&&"set" in g&&void 0===(c=g.set(a,c,d))))){try{i[b]=c}catch(j){}}}},css:function(a,b,c,d){var e,f,g,h=m.camelCase(b);return b=m.cssProps[h]||(m.cssProps[h]=Ua(a.style,h)),g=m.cssHooks[b]||m.cssHooks[h],g&&"get" in g&&(f=g.get(a,!0,c)),void 0===f&&(f=Ja(a,b,d)),"normal"===f&&b in Sa&&(f=Sa[b]),""===c||c?(e=parseFloat(f),c===!0||m.isNumeric(e)?e||0:f):f}}),m.each(["height","width"],function(a,b){m.cssHooks[b]={get:function(a,c,d){return c?Oa.test(m.css(a,"display"))&&0===a.offsetWidth?m.swap(a,Ra,function(){return Ya(a,b,d)}):Ya(a,b,d):void 0},set:function(a,c,d){var e=d&&Ia(a);return Wa(a,c,d?Xa(a,b,d,k.boxSizing&&"border-box"===m.css(a,"boxSizing",!1,e),e):0)}}}),k.opacity||(m.cssHooks.opacity={get:function(a,b){return Na.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?0.01*parseFloat(RegExp.$1)+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=m.isNumeric(b)?"alpha(opacity="+100*b+")":"",f=d&&d.filter||c.filter||"";c.zoom=1,(b>=1||""===b)&&""===m.trim(f.replace(Ma,""))&&c.removeAttribute&&(c.removeAttribute("filter"),""===b||d&&!d.filter)||(c.filter=Ma.test(f)?f.replace(Ma,e):f+" "+e)}}),m.cssHooks.marginRight=La(k.reliableMarginRight,function(a,b){return b?m.swap(a,{display:"inline-block"},Ja,[a,"marginRight"]):void 0}),m.each({margin:"",padding:"",border:"Width"},function(a,b){m.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++){e[a+T[d]+b]=f[d]||f[d-2]||f[0]}return e}},Ga.test(a)||(m.cssHooks[a+b].set=Wa)}),m.fn.extend({css:function(a,b){return V(this,function(a,b,c){var d,e,f={},g=0;if(m.isArray(b)){for(d=Ia(a),e=b.length;e>g;g++){f[b[g]]=m.css(a,b[g],!1,d)}return f}return void 0!==c?m.style(a,b,c):m.css(a,b)},a,b,arguments.length>1)},show:function(){return Va(this,!0)},hide:function(){return Va(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){U(this)?m(this).show():m(this).hide()})}});function Za(a,b,c,d,e){return new Za.prototype.init(a,b,c,d,e)}m.Tween=Za,Za.prototype={constructor:Za,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(m.cssNumber[c]?"":"px")},cur:function(){var a=Za.propHooks[this.prop];return a&&a.get?a.get(this):Za.propHooks._default.get(this)},run:function(a){var b,c=Za.propHooks[this.prop];return this.options.duration?this.pos=b=m.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Za.propHooks._default.set(this),this}},Za.prototype.init.prototype=Za.prototype,Za.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=m.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){m.fx.step[a.prop]?m.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[m.cssProps[a.prop]]||m.cssHooks[a.prop])?m.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Za.propHooks.scrollTop=Za.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},m.easing={linear:function(a){return a},swing:function(a){return 0.5-Math.cos(a*Math.PI)/2}},m.fx=Za.prototype.init,m.fx.step={};var $a,_a,ab=/^(?:toggle|show|hide)$/,bb=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),cb=/queueHooks$/,db=[ib],eb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=bb.exec(b),f=e&&e[3]||(m.cssNumber[a]?"":"px"),g=(m.cssNumber[a]||"px"!==f&&+d)&&bb.exec(m.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do{h=h||".5",g/=h,m.style(c.elem,a,g+f)}while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function fb(){return setTimeout(function(){$a=void 0}),$a=m.now()}function gb(a,b){var c,d={height:a},e=0;for(b=b?1:0;4>e;e+=2-b){c=T[e],d["margin"+c]=d["padding"+c]=a}return b&&(d.opacity=d.width=a),d}function hb(a,b,c){for(var d,e=(eb[b]||[]).concat(eb["*"]),f=0,g=e.length;g>f;f++){if(d=e[f].call(c,b,a)){return d}}}function ib(a,b,c){var d,e,f,g,h,i,j,l,n=this,o={},p=a.style,q=a.nodeType&&U(a),r=m._data(a,"fxshow");c.queue||(h=m._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,n.always(function(){n.always(function(){h.unqueued--,m.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height" in b||"width" in b)&&(c.overflow=[p.overflow,p.overflowX,p.overflowY],j=m.css(a,"display"),l="none"===j?m._data(a,"olddisplay")||Fa(a.nodeName):j,"inline"===l&&"none"===m.css(a,"float")&&(k.inlineBlockNeedsLayout&&"inline"!==Fa(a.nodeName)?p.zoom=1:p.display="inline-block")),c.overflow&&(p.overflow="hidden",k.shrinkWrapBlocks()||n.always(function(){p.overflow=c.overflow[0],p.overflowX=c.overflow[1],p.overflowY=c.overflow[2]}));for(d in b){if(e=b[d],ab.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(q?"hide":"show")){if("show"!==e||!r||void 0===r[d]){continue}q=!0}o[d]=r&&r[d]||m.style(a,d)}else{j=void 0}}if(m.isEmptyObject(o)){"inline"===("none"===j?Fa(a.nodeName):j)&&(p.display=j)}else{r?"hidden" in r&&(q=r.hidden):r=m._data(a,"fxshow",{}),f&&(r.hidden=!q),q?m(a).show():n.done(function(){m(a).hide()}),n.done(function(){var b;m._removeData(a,"fxshow");for(b in o){m.style(a,b,o[b])}});for(d in o){g=hb(q?r[d]:0,d,n),d in r||(r[d]=g.start,q&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}}function jb(a,b){var c,d,e,f,g;for(c in a){if(d=m.camelCase(c),e=b[d],f=a[c],m.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=m.cssHooks[d],g&&"expand" in g){f=g.expand(f),delete a[d];for(c in f){c in a||(a[c]=f[c],b[c]=e)}}else{b[d]=e}}}function kb(a,b,c){var d,e,f=0,g=db.length,h=m.Deferred().always(function(){delete i.elem}),i=function(){if(e){return !1}for(var b=$a||fb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++){j.tweens[g].run(f)}return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:m.extend({},b),opts:m.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:$a||fb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=m.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e){return this}for(e=!0;d>c;c++){j.tweens[c].run(1)}return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(jb(k,j.opts.specialEasing);g>f;f++){if(d=db[f].call(j,a,k,j.opts)){return d}}return m.map(k,hb,j),m.isFunction(j.opts.start)&&j.opts.start.call(a,j),m.fx.timer(m.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}m.Animation=m.extend(kb,{tweener:function(a,b){m.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++){c=a[d],eb[c]=eb[c]||[],eb[c].unshift(b)}},prefilter:function(a,b){b?db.unshift(a):db.push(a)}}),m.speed=function(a,b,c){var d=a&&"object"==typeof a?m.extend({},a):{complete:c||!c&&b||m.isFunction(a)&&a,duration:a,easing:c&&b||b&&!m.isFunction(b)&&b};return d.duration=m.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in m.fx.speeds?m.fx.speeds[d.duration]:m.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){m.isFunction(d.old)&&d.old.call(this),d.queue&&m.dequeue(this,d.queue)},d},m.fn.extend({fadeTo:function(a,b,c,d){return this.filter(U).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=m.isEmptyObject(a),f=m.speed(b,c,d),g=function(){var b=kb(this,m.extend({},a),f);(e||m._data(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=m.timers,g=m._data(this);if(e){g[e]&&g[e].stop&&d(g[e])}else{for(e in g){g[e]&&g[e].stop&&cb.test(e)&&d(g[e])}}for(e=f.length;e--;){f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1))}(b||!c)&&m.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=m._data(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=m.timers,g=d?d.length:0;for(c.finish=!0,m.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;){f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1))}for(b=0;g>b;b++){d[b]&&d[b].finish&&d[b].finish.call(this)}delete c.finish})}}),m.each(["toggle","show","hide"],function(a,b){var c=m.fn[b];m.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(gb(b,!0),a,d,e)}}),m.each({slideDown:gb("show"),slideUp:gb("hide"),slideToggle:gb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){m.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),m.timers=[],m.fx.tick=function(){var a,b=m.timers,c=0;for($a=m.now();c<b.length;c++){a=b[c],a()||b[c]!==a||b.splice(c--,1)}b.length||m.fx.stop(),$a=void 0},m.fx.timer=function(a){m.timers.push(a),a()?m.fx.start():m.timers.pop()},m.fx.interval=13,m.fx.start=function(){_a||(_a=setInterval(m.fx.tick,m.fx.interval))},m.fx.stop=function(){clearInterval(_a),_a=null},m.fx.speeds={slow:600,fast:200,_default:400},m.fn.delay=function(a,b){return a=m.fx?m.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a,b,c,d,e;b=y.createElement("div"),b.setAttribute("className","t"),b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",d=b.getElementsByTagName("a")[0],c=y.createElement("select"),e=c.appendChild(y.createElement("option")),a=b.getElementsByTagName("input")[0],d.style.cssText="top:1px",k.getSetAttribute="t"!==b.className,k.style=/top/.test(d.getAttribute("style")),k.hrefNormalized="/a"===d.getAttribute("href"),k.checkOn=!!a.value,k.optSelected=e.selected,k.enctype=!!y.createElement("form").enctype,c.disabled=!0,k.optDisabled=!e.disabled,a=y.createElement("input"),a.setAttribute("value",""),k.input=""===a.getAttribute("value"),a.value="t",a.setAttribute("type","radio"),k.radioValue="t"===a.value}();var lb=/\r/g;m.fn.extend({val:function(a){var b,c,d,e=this[0];if(arguments.length){return d=m.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,m(this).val()):a,null==e?e="":"number"==typeof e?e+="":m.isArray(e)&&(e=m.map(e,function(a){return null==a?"":a+""})),b=m.valHooks[this.type]||m.valHooks[this.nodeName.toLowerCase()],b&&"set" in b&&void 0!==b.set(this,e,"value")||(this.value=e))})}if(e){return b=m.valHooks[e.type]||m.valHooks[e.nodeName.toLowerCase()],b&&"get" in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(lb,""):null==c?"":c)}}}),m.extend({valHooks:{option:{get:function(a){var b=m.find.attr(a,"value");return null!=b?b:m.trim(m.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++){if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&m.nodeName(c.parentNode,"optgroup"))){if(b=m(c).val(),f){return b}g.push(b)}}return g},set:function(a,b){var c,d,e=a.options,f=m.makeArray(b),g=e.length;while(g--){if(d=e[g],m.inArray(m.valHooks.option.get(d),f)>=0){try{d.selected=c=!0}catch(h){d.scrollHeight}}else{d.selected=!1}}return c||(a.selectedIndex=-1),e}}}}),m.each(["radio","checkbox"],function(){m.valHooks[this]={set:function(a,b){return m.isArray(b)?a.checked=m.inArray(m(a).val(),b)>=0:void 0}},k.checkOn||(m.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var mb,nb,ob=m.expr.attrHandle,pb=/^(?:checked|selected)$/i,qb=k.getSetAttribute,rb=k.input;m.fn.extend({attr:function(a,b){return V(this,m.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){m.removeAttr(this,a)})}}),m.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f){return typeof a.getAttribute===K?m.prop(a,b,c):(1===f&&m.isXMLDoc(a)||(b=b.toLowerCase(),d=m.attrHooks[b]||(m.expr.match.bool.test(b)?nb:mb)),void 0===c?d&&"get" in d&&null!==(e=d.get(a,b))?e:(e=m.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set" in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void m.removeAttr(a,b))}},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType){while(c=f[e++]){d=m.propFix[c]||c,m.expr.match.bool.test(c)?rb&&qb||!pb.test(c)?a[d]=!1:a[m.camelCase("default-"+c)]=a[d]=!1:m.attr(a,c,""),a.removeAttribute(qb?c:d)}}},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&m.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),nb={set:function(a,b,c){return b===!1?m.removeAttr(a,c):rb&&qb||!pb.test(c)?a.setAttribute(!qb&&m.propFix[c]||c,c):a[m.camelCase("default-"+c)]=a[c]=!0,c}},m.each(m.expr.match.bool.source.match(/\w+/g),function(a,b){var c=ob[b]||m.find.attr;ob[b]=rb&&qb||!pb.test(b)?function(a,b,d){var e,f;return d||(f=ob[b],ob[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,ob[b]=f),e}:function(a,b,c){return c?void 0:a[m.camelCase("default-"+b)]?b.toLowerCase():null}}),rb&&qb||(m.attrHooks.value={set:function(a,b,c){return m.nodeName(a,"input")?void (a.defaultValue=b):mb&&mb.set(a,b,c)}}),qb||(mb={set:function(a,b,c){var d=a.getAttributeNode(c);return d||a.setAttributeNode(d=a.ownerDocument.createAttribute(c)),d.value=b+="","value"===c||b===a.getAttribute(c)?b:void 0}},ob.id=ob.name=ob.coords=function(a,b,c){var d;return c?void 0:(d=a.getAttributeNode(b))&&""!==d.value?d.value:null},m.valHooks.button={get:function(a,b){var c=a.getAttributeNode(b);return c&&c.specified?c.value:void 0},set:mb.set},m.attrHooks.contenteditable={set:function(a,b,c){mb.set(a,""===b?!1:b,c)}},m.each(["width","height"],function(a,b){m.attrHooks[b]={set:function(a,c){return""===c?(a.setAttribute(b,"auto"),c):void 0}}})),k.style||(m.attrHooks.style={get:function(a){return a.style.cssText||void 0},set:function(a,b){return a.style.cssText=b+""}});var sb=/^(?:input|select|textarea|button|object)$/i,tb=/^(?:a|area)$/i;m.fn.extend({prop:function(a,b){return V(this,m.prop,a,b,arguments.length>1)},removeProp:function(a){return a=m.propFix[a]||a,this.each(function(){try{this[a]=void 0,delete this[a]}catch(b){}})}}),m.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g){return f=1!==g||!m.isXMLDoc(a),f&&(b=m.propFix[b]||b,e=m.propHooks[b]),void 0!==c?e&&"set" in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get" in e&&null!==(d=e.get(a,b))?d:a[b]}},propHooks:{tabIndex:{get:function(a){var b=m.find.attr(a,"tabindex");return b?parseInt(b,10):sb.test(a.nodeName)||tb.test(a.nodeName)&&a.href?0:-1}}}}),k.hrefNormalized||m.each(["href","src"],function(a,b){m.propHooks[b]={get:function(a){return a.getAttribute(b,4)}}}),k.optSelected||(m.propHooks.selected={get:function(a){var b=a.parentNode;return b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex),null}}),m.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){m.propFix[this.toLowerCase()]=this}),k.enctype||(m.propFix.enctype="encoding");var ub=/[\t\r\n\f]/g;m.fn.extend({addClass:function(a){var b,c,d,e,f,g,h=0,i=this.length,j="string"==typeof a&&a;if(m.isFunction(a)){return this.each(function(b){m(this).addClass(a.call(this,b,this.className))})}if(j){for(b=(a||"").match(E)||[];i>h;h++){if(c=this[h],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ub," "):" ")){f=0;while(e=b[f++]){d.indexOf(" "+e+" ")<0&&(d+=e+" ")}g=m.trim(d),c.className!==g&&(c.className=g)}}}return this},removeClass:function(a){var b,c,d,e,f,g,h=0,i=this.length,j=0===arguments.length||"string"==typeof a&&a;if(m.isFunction(a)){return this.each(function(b){m(this).removeClass(a.call(this,b,this.className))})}if(j){for(b=(a||"").match(E)||[];i>h;h++){if(c=this[h],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ub," "):"")){f=0;while(e=b[f++]){while(d.indexOf(" "+e+" ")>=0){d=d.replace(" "+e+" "," ")}}g=a?m.trim(d):"",c.className!==g&&(c.className=g)}}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(m.isFunction(a)?function(c){m(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=m(this),f=a.match(E)||[];while(b=f[d++]){e.hasClass(b)?e.removeClass(b):e.addClass(b)}}else{(c===K||"boolean"===c)&&(this.className&&m._data(this,"__className__",this.className),this.className=this.className||a===!1?"":m._data(this,"__className__")||"")}})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++){if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ub," ").indexOf(b)>=0){return !0}}return !1}}),m.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){m.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),m.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var vb=m.now(),wb=/\?/,xb=/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;m.parseJSON=function(b){if(a.JSON&&a.JSON.parse){return a.JSON.parse(b+"")}var c,d=null,e=m.trim(b+"");return e&&!m.trim(e.replace(xb,function(a,b,e,f){return c&&b&&(d=0),0===d?a:(c=e||b,d+=!f-!e,"")}))?Function("return "+e)():m.error("Invalid JSON: "+b)},m.parseXML=function(b){var c,d;if(!b||"string"!=typeof b){return null}try{a.DOMParser?(d=new DOMParser,c=d.parseFromString(b,"text/xml")):(c=new ActiveXObject("Microsoft.XMLDOM"),c.async="false",c.loadXML(b))}catch(e){c=void 0}return c&&c.documentElement&&!c.getElementsByTagName("parsererror").length||m.error("Invalid XML: "+b),c};var yb,zb,Ab=/#.*$/,Bb=/([?&])_=[^&]*/,Cb=/^(.*?):[ \t]*([^\r\n]*)\r?$/gm,Db=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Eb=/^(?:GET|HEAD)$/,Fb=/^\/\//,Gb=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,Hb={},Ib={},Jb="*/".concat("*");try{zb=location.href}catch(Kb){zb=y.createElement("a"),zb.href="",zb=zb.href}yb=Gb.exec(zb.toLowerCase())||[];function Lb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(m.isFunction(c)){while(d=f[e++]){"+"===d.charAt(0)?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}}}function Mb(a,b,c,d){var e={},f=a===Ib;function g(h){var i;return e[h]=!0,m.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function Nb(a,b){var c,d,e=m.ajaxSettings.flatOptions||{};for(d in b){void 0!==b[d]&&((e[d]?a:c||(c={}))[d]=b[d])}return c&&m.extend(!0,a,c),a}function Ob(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0]){i.shift(),void 0===e&&(e=a.mimeType||b.getResponseHeader("Content-Type"))}if(e){for(g in h){if(h[g]&&h[g].test(e)){i.unshift(g);break}}}if(i[0] in c){f=i[0]}else{for(g in c){if(!i[0]||a.converters[g+" "+i[0]]){f=g;break}d||(d=g)}f=f||d}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Pb(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1]){for(g in a.converters){j[g.toLowerCase()]=a.converters[g]}}f=k.shift();while(f){if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift()){if("*"===f){f=i}else{if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g){for(e in j){if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}}}if(g!==!0){if(g&&a["throws"]){b=g(b)}else{try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}}}}}}return{state:"success",data:b}}m.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:zb,type:"GET",isLocal:Db.test(yb[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=ISO-8859-9",accepts:{"*":Jb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":m.parseJSON,"text xml":m.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?Nb(Nb(a,m.ajaxSettings),b):Nb(m.ajaxSettings,a)},ajaxPrefilter:Lb(Hb),ajaxTransport:Lb(Ib),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=m.ajaxSetup({},b),l=k.context||k,n=k.context&&(l.nodeType||l.jquery)?m(l):m.event,o=m.Deferred(),p=m.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!j){j={};while(b=Cb.exec(f)){j[b[1].toLowerCase()]=b[2]}}b=j[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?f:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a){if(2>t){for(b in a){q[b]=[q[b],a[b]]}}else{v.always(a[v.status])}}return this},abort:function(a){var b=a||u;return i&&i.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||zb)+"").replace(Ab,"").replace(Fb,yb[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=m.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(c=Gb.exec(k.url.toLowerCase()),k.crossDomain=!(!c||c[1]===yb[1]&&c[2]===yb[2]&&(c[3]||("http:"===c[1]?"80":"443"))===(yb[3]||("http:"===yb[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=m.param(k.data,k.traditional)),Mb(Hb,k,b,v),2===t){return v}h=m.event&&k.global,h&&0===m.active++&&m.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!Eb.test(k.type),e=k.url,k.hasContent||(k.data&&(e=k.url+=(wb.test(e)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=Bb.test(e)?e.replace(Bb,"$1_="+vb++):e+(wb.test(e)?"&":"?")+"_="+vb++)),k.ifModified&&(m.lastModified[e]&&v.setRequestHeader("If-Modified-Since",m.lastModified[e]),m.etag[e]&&v.setRequestHeader("If-None-Match",m.etag[e])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+Jb+"; q=0.01":""):k.accepts["*"]);for(d in k.headers){v.setRequestHeader(d,k.headers[d])}if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t)){return v.abort()}u="abort";for(d in {success:1,error:1,complete:1}){v[d](k[d])}if(i=Mb(Ib,k,b,v)){v.readyState=1,h&&n.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,i.send(r,x)}catch(w){if(!(2>t)){throw w}x(-1,w)}}else{x(-1,"No Transport")}function x(a,b,c,d){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),i=void 0,f=d||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,c&&(u=Ob(k,v,c)),u=Pb(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(m.lastModified[e]=w),w=v.getResponseHeader("etag"),w&&(m.etag[e]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,h&&n.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),h&&(n.trigger("ajaxComplete",[v,k]),--m.active||m.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return m.get(a,b,c,"json")},getScript:function(a,b){return m.get(a,void 0,b,"script")}}),m.each(["get","post"],function(a,b){m[b]=function(a,c,d,e){return m.isFunction(c)&&(e=e||d,d=c,c=void 0),m.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),m._evalUrl=function(a){return m.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},m.fn.extend({wrapAll:function(a){if(m.isFunction(a)){return this.each(function(b){m(this).wrapAll(a.call(this,b))})}if(this[0]){var b=m(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&1===a.firstChild.nodeType){a=a.firstChild}return a}).append(this)}return this},wrapInner:function(a){return this.each(m.isFunction(a)?function(b){m(this).wrapInner(a.call(this,b))}:function(){var b=m(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=m.isFunction(a);return this.each(function(c){m(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){m.nodeName(this,"body")||m(this).replaceWith(this.childNodes)}).end()}}),m.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0||!k.reliableHiddenOffsets()&&"none"===(a.style&&a.style.display||m.css(a,"display"))},m.expr.filters.visible=function(a){return !m.expr.filters.hidden(a)};var Qb=/%20/g,Rb=/\[\]$/,Sb=/\r?\n/g,Tb=/^(?:submit|button|image|reset|file)$/i,Ub=/^(?:input|select|textarea|keygen)/i;function Vb(a,b,c,d){var e;if(m.isArray(b)){m.each(b,function(b,e){c||Rb.test(a)?d(a,e):Vb(a+"["+("object"==typeof e?b:"")+"]",e,c,d)})}else{if(c||"object"!==m.type(b)){d(a,b)}else{for(e in b){Vb(a+"["+e+"]",b[e],c,d)}}}}m.param=function(a,b){var c,d=[],e=function(a,b){b=m.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=m.ajaxSettings&&m.ajaxSettings.traditional),m.isArray(a)||a.jquery&&!m.isPlainObject(a)){m.each(a,function(){e(this.name,this.value)})}else{for(c in a){Vb(c,a[c],b,e)}}return d.join("&").replace(Qb,"+")},m.fn.extend({serialize:function(){return m.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=m.prop(this,"elements");return a?m.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!m(this).is(":disabled")&&Ub.test(this.nodeName)&&!Tb.test(a)&&(this.checked||!W.test(a))}).map(function(a,b){var c=m(this).val();return null==c?null:m.isArray(c)?m.map(c,function(a){return{name:b.name,value:a.replace(Sb,"\r\n")}}):{name:b.name,value:c.replace(Sb,"\r\n")}}).get()}}),m.ajaxSettings.xhr=void 0!==a.ActiveXObject?function(){return !this.isLocal&&/^(get|post|head|put|delete|options)$/i.test(this.type)&&Zb()||$b()}:Zb;var Wb=0,Xb={},Yb=m.ajaxSettings.xhr();a.attachEvent&&a.attachEvent("onunload",function(){for(var a in Xb){Xb[a](void 0,!0)}}),k.cors=!!Yb&&"withCredentials" in Yb,Yb=k.ajax=!!Yb,Yb&&m.ajaxTransport(function(a){if(!a.crossDomain||k.cors){var b;return{send:function(c,d){var e,f=a.xhr(),g=++Wb;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields){for(e in a.xhrFields){f[e]=a.xhrFields[e]}}a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c){void 0!==c[e]&&f.setRequestHeader(e,c[e]+"")}f.send(a.hasContent&&a.data||null),b=function(c,e){var h,i,j;if(b&&(e||4===f.readyState)){if(delete Xb[g],b=void 0,f.onreadystatechange=m.noop,e){4!==f.readyState&&f.abort()}else{j={},h=f.status,"string"==typeof f.responseText&&(j.text=f.responseText);try{i=f.statusText}catch(k){i=""}h||!a.isLocal||a.crossDomain?1223===h&&(h=204):h=j.text?200:404}}j&&d(h,i,j,f.getAllResponseHeaders())},a.async?4===f.readyState?setTimeout(b):f.onreadystatechange=Xb[g]=b:b()},abort:function(){b&&b(void 0,!0)}}}});function Zb(){try{return new a.XMLHttpRequest}catch(b){}}function $b(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}m.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return m.globalEval(a),a}}}),m.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),m.ajaxTransport("script",function(a){if(a.crossDomain){var b,c=y.head||m("head")[0]||y.documentElement;return{send:function(d,e){b=y.createElement("script"),b.async=!0,a.scriptCharset&&(b.charset=a.scriptCharset),b.src=a.url,b.onload=b.onreadystatechange=function(a,c){(c||!b.readyState||/loaded|complete/.test(b.readyState))&&(b.onload=b.onreadystatechange=null,b.parentNode&&b.parentNode.removeChild(b),b=null,c||e(200,"success"))},c.insertBefore(b,c.firstChild)},abort:function(){b&&b.onload(void 0,!0)}}}});var _b=[],ac=/(=)\?(?=&|$)|\?\?/;m.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=_b.pop()||m.expando+"_"+vb++;return this[a]=!0,a}}),m.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(ac.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&ac.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=m.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(ac,"$1"+e):b.jsonp!==!1&&(b.url+=(wb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||m.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,_b.push(e)),g&&m.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),m.parseHTML=function(a,b,c){if(!a||"string"!=typeof a){return null}"boolean"==typeof b&&(c=b,b=!1),b=b||y;var d=u.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=m.buildFragment([a],b,e),e&&e.length&&m(e).remove(),m.merge([],d.childNodes))};var bc=m.fn.load;m.fn.load=function(a,b,c){if("string"!=typeof a&&bc){return bc.apply(this,arguments)}var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=m.trim(a.slice(h,a.length)),a=a.slice(0,h)),m.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(f="POST"),g.length>0&&m.ajax({url:a,type:f,dataType:"html",data:b}).done(function(a){e=arguments,g.html(d?m("<div>").append(m.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,e||[a.responseText,b,a])}),this},m.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){m.fn[b]=function(a){return this.on(b,a)}}),m.expr.filters.animated=function(a){return m.grep(m.timers,function(b){return a===b.elem}).length};var cc=a.document.documentElement;function dc(a){return m.isWindow(a)?a:9===a.nodeType?a.defaultView||a.parentWindow:!1}m.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=m.css(a,"position"),l=m(a),n={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=m.css(a,"top"),i=m.css(a,"left"),j=("absolute"===k||"fixed"===k)&&m.inArray("auto",[f,i])>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),m.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(n.top=b.top-h.top+g),null!=b.left&&(n.left=b.left-h.left+e),"using" in b?b.using.call(a,n):l.css(n)}},m.fn.extend({offset:function(a){if(arguments.length){return void 0===a?this:this.each(function(b){m.offset.setOffset(this,a,b)})}var b,c,d={top:0,left:0},e=this[0],f=e&&e.ownerDocument;if(f){return b=f.documentElement,m.contains(b,e)?(typeof e.getBoundingClientRect!==K&&(d=e.getBoundingClientRect()),c=dc(f),{top:d.top+(c.pageYOffset||b.scrollTop)-(b.clientTop||0),left:d.left+(c.pageXOffset||b.scrollLeft)-(b.clientLeft||0)}):d}},position:function(){if(this[0]){var a,b,c={top:0,left:0},d=this[0];return"fixed"===m.css(d,"position")?b=d.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),m.nodeName(a[0],"html")||(c=a.offset()),c.top+=m.css(a[0],"borderTopWidth",!0),c.left+=m.css(a[0],"borderLeftWidth",!0)),{top:b.top-c.top-m.css(d,"marginTop",!0),left:b.left-c.left-m.css(d,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||cc;while(a&&!m.nodeName(a,"html")&&"static"===m.css(a,"position")){a=a.offsetParent}return a||cc})}}),m.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c=/Y/.test(b);m.fn[a]=function(d){return V(this,function(a,d,e){var f=dc(a);return void 0===e?f?b in f?f[b]:f.document.documentElement[d]:a[d]:void (f?f.scrollTo(c?m(f).scrollLeft():e,c?e:m(f).scrollTop()):a[d]=e)},a,d,arguments.length,null)}}),m.each(["top","left"],function(a,b){m.cssHooks[b]=La(k.pixelPosition,function(a,c){return c?(c=Ja(a,b),Ha.test(c)?m(a).position()[b]+"px":c):void 0})}),m.each({Height:"height",Width:"width"},function(a,b){m.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){m.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return V(this,function(b,c,d){var e;return m.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?m.css(b,c,g):m.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),m.fn.size=function(){return this.length},m.fn.andSelf=m.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return m});var ec=a.jQuery,fc=a.$;return m.noConflict=function(b){return a.$===m&&(a.$=fc),b&&a.jQuery===m&&(a.jQuery=ec),m},typeof b===K&&(a.jQuery=a.$=m),m});/*! EmojioneArea v3.4.1 | MIT license */
;window="undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},document=window.document||{},function(d,c){"function"==typeof require&&"object"==typeof exports&&"object"==typeof module?d(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],d):d(c.jQuery)}(function(aG){var aF=0,aE={},aD={},aC=window.emojione,aB=[];function aA(b){aC?b():aB.push(b)}var az="data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw==",ay=[].slice,ax="emojionearea",aw=0,av="&#8203;";function au(a,l,k){var j=!0,i=1;if(l){l=l.toLowerCase();do{var c=1==i?"@"+l:l;aE[a.id][c]&&aE[a.id][c].length&&aG.each(aE[a.id][c],function(b,d){return j=d.apply(a,k||[])!==!1})}while(j&&i--)}return j}function at(a,h,g,d){d=d||function(e,f){return aG(f.currentTarget)},aG.each(g,function(c,b){c=aG.isArray(g)?b:c,(aD[a.id][b]||(aD[a.id][b]=[])).push([h,c,d])})}function ar(i,e,n){var m=aC.imageType,l;l="svg"==m?aC.imagePathSVG:aC.imagePathPNG;var k="";n&&(k=n.substr(1,n.length-2).replace(/_/g," ").replace(/\w\S*/g,function(b){return b.charAt(0).toUpperCase()+b.substr(1).toLowerCase()}));var j="";return e.uc_base&&aw>4?(j=e.uc_base,e=e.uc_output.toUpperCase()):j=e,i.replace("{name}",n||"").replace("{friendlyName}",k).replace("{img}",l+(aw<2?j.toUpperCase():j)+"."+m).replace("{uni}",e).replace("{alt}",aC.convert(e))}function aq(e,d,f){return e.replace(/:?\+?[\w_\-]+:?/g,function(b){b=":"+b.replace(/:$/,"").replace(/^:/,"")+":";var c=aC.emojioneList[b];return c?aw>4?ar(d,c,b):(aw>3&&(c=c.unicode),ar(d,c[c.length-1],b)):f?"":b})}function ap(i){var h,n;if(window.getSelection){if(h=window.getSelection(),h.getRangeAt&&h.rangeCount){n=h.getRangeAt(0),n.deleteContents();var m=document.createElement("div");m.innerHTML=i;var l=document.createDocumentFragment(),k,j;while(k=m.firstChild){j=l.appendChild(k)}n.insertNode(l),j&&(n=n.cloneRange(),n.setStartAfter(j),n.collapse(!0),h.removeAllRanges(),h.addRange(n))}}else{document.selection&&"Control"!=document.selection.type&&document.selection.createRange().pasteHTML(i)}}function ao(){return window.emojioneVersion||"4.5.0"}function an(b){return"object"==typeof b}function am(d){var c;return d.cacheBustParam?(c=d.cacheBustParam,an(d.jsEscapeMap)?"?v=1.2.4"===c?"2.0.0":"?v=2.0.1"===c?"2.1.0":"?v=2.1.1"===c?"2.1.1":"?v=2.1.2"===c?"2.1.2":"?v=2.1.3"===c?"2.1.3":"?v=2.1.4"===c?"2.1.4":"2.2.7":"1.5.2"):d.emojiVersion}function al(b){switch(b){case"1.5.2":return 0;case"2.0.0":return 1;case"2.1.0":case"2.1.1":return 2;case"2.1.2":return 3;case"2.1.3":case"2.1.4":case"2.2.7":return 4;case"3.0.1":case"3.0.2":case"3.0.3":case"3.0":return 5;case"3.1.0":case"3.1.1":case"4.5.0":case"3.1":default:return 6}}function ak(){if(aG.fn.emojioneArea&&aG.fn.emojioneArea.defaults){return aG.fn.emojioneArea.defaults}var a={attributes:{dir:"ltr",spellcheck:"on",autocomplete:"on",autocorrect:"on",autocapitalize:"on"},search:!0,placeholder:null,emojiPlaceholder:":smiley:",searchPlaceholder:"SEARCH",container:null,hideSource:!0,shortnames:!0,sprite:!0,pickerPosition:"top",filtersPosition:"top",searchPosition:"top",hidePickerOnBlur:!0,buttonTitle:"Use the TAB key to insert emoji faster",tones:!0,tonesStyle:"bullet",inline:null,saveEmojisAs:"unicode",shortcuts:!0,autocomplete:!0,autocompleteTones:!1,standalone:!1,useInternalCDN:!0,imageType:"png",recentEmojis:!0,textcomplete:{maxCount:15,placement:null}},d=al(aC?am(aC):ao());return d>4?a.filters={tones:{title:"Diversity",emoji:"open_hands raised_hands palms_up_together clap pray thumbsup thumbsdown punch fist left_facing_fist right_facing_fist fingers_crossed v metal love_you_gesture ok_hand point_left point_right point_up_2 point_down point_up raised_hand raised_back_of_hand hand_splayed vulcan wave call_me muscle middle_finger writing_hand selfie nail_care ear nose baby boy girl man woman blond-haired_woman blond-haired_man older_man older_woman man_with_chinese_cap woman_wearing_turban man_wearing_turban woman_police_officer man_police_officer woman_construction_worker man_construction_worker woman_guard man_guard woman_detective man_detective woman_health_worker man_health_worker woman_farmer man_farmer woman_cook man_cook woman_student man_student woman_singer man_singer woman_teacher man_teacher woman_factory_worker man_factory_worker woman_technologist man_technologist woman_office_worker man_office_worker woman_mechanic man_mechanic woman_scientist man_scientist woman_artist man_artist woman_firefighter man_firefighter woman_pilot man_pilot woman_astronaut man_astronaut woman_judge man_judge mrs_claus santa princess prince bride_with_veil man_in_tuxedo angel pregnant_woman breast_feeding woman_bowing man_bowing man_tipping_hand woman_tipping_hand man_gesturing_no woman_gesturing_no man_gesturing_ok woman_gesturing_ok man_raising_hand woman_raising_hand woman_facepalming man_facepalming woman_shrugging man_shrugging man_pouting woman_pouting man_frowning woman_frowning man_getting_haircut woman_getting_haircut man_getting_face_massage woman_getting_face_massage man_in_business_suit_levitating dancer man_dancing woman_walking man_walking woman_running man_running adult child older_adult bearded_person woman_with_headscarf woman_mage man_mage woman_fairy man_fairy woman_vampire man_vampire mermaid merman woman_elf man_elf snowboarder woman_lifting_weights man_lifting_weights woman_cartwheeling man_cartwheeling woman_bouncing_ball man_bouncing_ball woman_playing_handball man_playing_handball woman_golfing man_golfing woman_surfing man_surfing woman_swimming man_swimming woman_playing_water_polo man_playing_water_polo woman_rowing_boat man_rowing_boat horse_racing woman_biking man_biking woman_mountain_biking man_mountain_biking woman_juggling man_juggling woman_in_steamy_room man_in_steamy_room woman_climbing man_climbing woman_in_lotus_position man_in_lotus_position bath person_in_bed"},recent:{icon:"clock3",title:"Recent",emoji:""},smileys_people:{icon:"yum",title:"Smileys & People",emoji:"grinning smiley smile grin laughing sweat_smile joy rofl relaxed blush innocent slight_smile upside_down wink relieved crazy_face star_struck heart_eyes kissing_heart kissing kissing_smiling_eyes kissing_closed_eyes yum stuck_out_tongue_winking_eye stuck_out_tongue_closed_eyes stuck_out_tongue money_mouth hugging nerd sunglasses cowboy smirk unamused disappointed pensive worried face_with_raised_eyebrow face_with_monocle confused slight_frown frowning2 persevere confounded tired_face weary triumph angry rage face_with_symbols_over_mouth no_mouth neutral_face expressionless hushed frowning anguished open_mouth astonished dizzy_face exploding_head flushed scream fearful cold_sweat cry disappointed_relieved drooling_face sob sweat sleepy sleeping rolling_eyes thinking shushing_face face_with_hand_over_mouth lying_face grimacing zipper_mouth face_vomiting nauseated_face sneezing_face mask thermometer_face head_bandage smiling_imp imp japanese_ogre japanese_goblin poop ghost skull skull_crossbones alien space_invader robot jack_o_lantern clown smiley_cat smile_cat joy_cat heart_eyes_cat smirk_cat kissing_cat scream_cat crying_cat_face pouting_cat open_hands raised_hands palms_up_together clap pray handshake thumbsup thumbsdown punch fist left_facing_fist right_facing_fist fingers_crossed v metal love_you_gesture ok_hand point_left point_right point_up_2 point_down point_up raised_hand raised_back_of_hand hand_splayed vulcan wave call_me muscle middle_finger writing_hand selfie nail_care ring lipstick kiss lips tongue ear nose footprints eye eyes speaking_head bust_in_silhouette busts_in_silhouette baby boy girl man woman blond-haired_woman blond_haired_man older_man older_woman man_with_chinese_cap woman_wearing_turban man_wearing_turban woman_police_officer police_officer woman_construction_worker construction_worker woman_guard guard woman_detective detective woman_health_worker man_health_worker woman_farmer man_farmer woman_cook man_cook woman_student man_student woman_singer man_singer woman_teacher man_teacher woman_factory_worker man_factory_worker woman_technologist man_technologist woman_office_worker man_office_worker woman_mechanic man_mechanic woman_scientist man_scientist woman_artist man_artist woman_firefighter man_firefighter woman_pilot man_pilot woman_astronaut man_astronaut woman_judge man_judge mrs_claus santa princess prince bride_with_veil man_in_tuxedo angel pregnant_woman breast_feeding woman_bowing man_bowing woman_tipping_hand man_tipping_hand woman_gesturing_no man_gesturing_no woman_gesturing_ok man_gesturing_ok woman_raising_hand man_raising_hand woman_facepalming man_facepalming woman_shrugging man_shrugging woman_pouting man_pouting woman_frowning man_frowning woman_getting_haircut man_getting_haircut woman_getting_face_massage man_getting_face_massage man_in_business_suit_levitating dancer man_dancing women_with_bunny_ears_partying men_with_bunny_ears_partying woman_walking man_walking woman_running man_running couple two_women_holding_hands two_men_holding_hands couple_with_heart couple_ww couple_mm couplekiss kiss_ww kiss_mm family family_mwg family_mwgb family_mwbb family_mwgg family_wwb family_wwg family_wwgb family_wwbb family_wwgg family_mmb family_mmg family_mmgb family_mmbb family_mmgg family_woman_boy family_woman_girl family_woman_girl_boy family_woman_boy_boy family_woman_girl_girl family_man_boy family_man_girl family_man_girl_boy family_man_boy_boy family_man_girl_girl bearded_person woman_with_headscarf woman_mage man_mage woman_fairy man_fairy woman_vampire man_vampire mermaid merman woman_elf man_elf woman_genie man_genie woman_zombie man_zombie womans_clothes shirt jeans necktie dress bikini kimono high_heel sandal boot mans_shoe athletic_shoe womans_hat tophat mortar_board crown helmet_with_cross school_satchel pouch purse handbag briefcase eyeglasses dark_sunglasses closed_umbrella umbrella2 brain billed_cap scarf gloves coat socks "},animals_nature:{icon:"hamster",title:"Animals & Nature",emoji:"dog cat mouse hamster rabbit fox bear panda_face koala tiger lion_face cow pig pig_nose frog monkey_face see_no_evil hear_no_evil speak_no_evil monkey chicken penguin bird baby_chick hatching_chick hatched_chick duck eagle owl bat wolf boar horse unicorn bee bug butterfly snail shell beetle ant spider spider_web turtle snake lizard scorpion crab squid octopus shrimp tropical_fish fish blowfish dolphin shark whale whale2 crocodile leopard tiger2 water_buffalo ox cow2 deer dromedary_camel camel elephant rhino gorilla racehorse pig2 goat ram sheep dog2 poodle cat2 rooster turkey dove rabbit2 mouse2 rat chipmunk dragon giraffe zebra hedgehog sauropod t_rex cricket dragon_face feet cactus christmas_tree evergreen_tree deciduous_tree palm_tree seedling herb shamrock four_leaf_clover bamboo tanabata_tree leaves fallen_leaf maple_leaf mushroom ear_of_rice bouquet tulip rose wilted_rose sunflower blossom cherry_blossom hibiscus earth_americas earth_africa earth_asia full_moon waning_gibbous_moon last_quarter_moon waning_crescent_moon new_moon waxing_crescent_moon first_quarter_moon waxing_gibbous_moon new_moon_with_face full_moon_with_face sun_with_face first_quarter_moon_with_face last_quarter_moon_with_face crescent_moon dizzy star star2 sparkles zap fire boom comet sunny white_sun_small_cloud partly_sunny white_sun_cloud white_sun_rain_cloud rainbow cloud cloud_rain thunder_cloud_rain cloud_lightning cloud_snow snowman2 snowman snowflake wind_blowing_face dash cloud_tornado fog ocean droplet sweat_drops umbrella "},food_drink:{icon:"pizza",title:"Food & Drink",emoji:"green_apple apple pear tangerine lemon banana watermelon grapes strawberry melon cherries peach pineapple kiwi avocado tomato eggplant cucumber carrot corn hot_pepper potato sweet_potato chestnut peanuts honey_pot croissant bread french_bread cheese egg cooking bacon pancakes fried_shrimp poultry_leg meat_on_bone pizza hotdog hamburger fries stuffed_flatbread taco burrito salad shallow_pan_of_food spaghetti ramen stew fish_cake sushi bento curry rice_ball rice rice_cracker oden dango shaved_ice ice_cream icecream cake birthday custard lollipop candy chocolate_bar popcorn doughnut cookie milk baby_bottle coffee tea sake beer beers champagne_glass wine_glass tumbler_glass cocktail tropical_drink champagne spoon fork_and_knife fork_knife_plate dumpling fortune_cookie takeout_box chopsticks bowl_with_spoon cup_with_straw coconut broccoli pie pretzel cut_of_meat sandwich canned_food"},activity:{icon:"basketball",title:"Activity",emoji:"soccer basketball football baseball tennis volleyball rugby_football 8ball ping_pong badminton goal hockey field_hockey cricket_game golf bow_and_arrow fishing_pole_and_fish boxing_glove martial_arts_uniform ice_skate ski skier snowboarder woman_lifting_weights man_lifting_weights person_fencing women_wrestling men_wrestling woman_cartwheeling man_cartwheeling woman_bouncing_ball man_bouncing_ball woman_playing_handball man_playing_handball woman_golfing man_golfing woman_surfing man_surfing woman_swimming man_swimming woman_playing_water_polo man_playing_water_polo woman_rowing_boat man_rowing_boat horse_racing woman_biking man_biking woman_mountain_biking man_mountain_biking woman_in_steamy_room man_in_steamy_room woman_climbing man_climbing woman_in_lotus_position man_in_lotus_position running_shirt_with_sash medal military_medal first_place second_place third_place trophy rosette reminder_ribbon ticket tickets circus_tent woman_juggling man_juggling performing_arts art clapper microphone headphones musical_score musical_keyboard drum saxophone trumpet guitar violin game_die dart bowling video_game slot_machine sled curling_stone "},travel_places:{icon:"rocket",title:"Travel & Places",emoji:"red_car taxi blue_car bus trolleybus race_car police_car ambulance fire_engine minibus truck articulated_lorry tractor scooter bike motor_scooter motorcycle rotating_light oncoming_police_car oncoming_bus oncoming_automobile oncoming_taxi aerial_tramway mountain_cableway suspension_railway railway_car train mountain_railway monorail bullettrain_side bullettrain_front light_rail steam_locomotive train2 metro tram station helicopter airplane_small airplane airplane_departure airplane_arriving rocket satellite_orbital seat canoe sailboat motorboat speedboat cruise_ship ferry ship anchor construction fuelpump busstop vertical_traffic_light traffic_light map moyai statue_of_liberty fountain tokyo_tower european_castle japanese_castle stadium ferris_wheel roller_coaster carousel_horse beach_umbrella beach island mountain mountain_snow mount_fuji volcano desert camping tent railway_track motorway construction_site factory house house_with_garden homes house_abandoned office department_store post_office european_post_office hospital bank hotel convenience_store school love_hotel wedding classical_building church mosque synagogue kaaba shinto_shrine japan rice_scene park sunrise sunrise_over_mountains stars sparkler fireworks city_sunset city_dusk cityscape night_with_stars milky_way bridge_at_night foggy flying_saucer"},objects:{icon:"bulb",title:"Objects",emoji:"watch iphone calling computer keyboard desktop printer mouse_three_button trackball joystick compression minidisc floppy_disk cd dvd vhs camera camera_with_flash video_camera movie_camera projector film_frames telephone_receiver telephone pager fax tv radio microphone2 level_slider control_knobs stopwatch timer alarm_clock clock hourglass hourglass_flowing_sand satellite battery electric_plug bulb flashlight candle wastebasket oil money_with_wings dollar yen euro pound moneybag credit_card gem scales wrench hammer hammer_pick tools pick nut_and_bolt gear chains gun bomb knife dagger crossed_swords shield smoking coffin urn amphora crystal_ball prayer_beads barber alembic telescope microscope hole pill syringe thermometer toilet potable_water shower bathtub bath bellhop key key2 door couch bed sleeping_accommodation frame_photo shopping_bags shopping_cart gift balloon flags ribbon confetti_ball tada dolls izakaya_lantern wind_chime envelope envelope_with_arrow incoming_envelope e-mail love_letter inbox_tray outbox_tray package label mailbox_closed mailbox mailbox_with_mail mailbox_with_no_mail postbox postal_horn scroll page_with_curl page_facing_up bookmark_tabs bar_chart chart_with_upwards_trend chart_with_downwards_trend notepad_spiral calendar_spiral calendar date card_index card_box ballot_box file_cabinet clipboard file_folder open_file_folder dividers newspaper2 newspaper notebook notebook_with_decorative_cover ledger closed_book green_book blue_book orange_book books book bookmark link paperclip paperclips triangular_ruler straight_ruler pushpin round_pushpin scissors pen_ballpoint pen_fountain black_nib paintbrush crayon pencil pencil2 mag mag_right lock_with_ink_pen closed_lock_with_key lock unlock"},symbols:{icon:"heartpulse",title:"Symbols",emoji:"heart orange_heart yellow_heart green_heart blue_heart purple_heart black_heart broken_heart heart_exclamation two_hearts revolving_hearts heartbeat heartpulse sparkling_heart cupid gift_heart heart_decoration peace cross star_and_crescent om_symbol wheel_of_dharma star_of_david six_pointed_star menorah yin_yang orthodox_cross place_of_worship ophiuchus aries taurus gemini cancer leo virgo libra scorpius sagittarius capricorn aquarius pisces id atom accept radioactive biohazard mobile_phone_off vibration_mode u6709 u7121 u7533 u55b6 u6708 eight_pointed_black_star vs white_flower ideograph_advantage secret congratulations u5408 u6e80 u5272 u7981 a b ab cl o2 sos x o octagonal_sign no_entry name_badge no_entry_sign 100 anger hotsprings no_pedestrians do_not_litter no_bicycles non-potable_water underage no_mobile_phones no_smoking exclamation grey_exclamation question grey_question bangbang interrobang low_brightness high_brightness part_alternation_mark warning children_crossing trident fleur-de-lis beginner recycle white_check_mark u6307 chart sparkle eight_spoked_asterisk negative_squared_cross_mark globe_with_meridians diamond_shape_with_a_dot_inside m cyclone zzz atm wc wheelchair parking u7a7a sa passport_control customs baggage_claim left_luggage mens womens baby_symbol restroom put_litter_in_its_place cinema signal_strength koko symbols information_source abc abcd capital_abcd ng ok up cool new free zero one two three four five six seven eight nine keycap_ten 1234 hash asterisk arrow_forward pause_button play_pause stop_button record_button eject track_next track_previous fast_forward rewind arrow_double_up arrow_double_down arrow_backward arrow_up_small arrow_down_small arrow_right arrow_left arrow_up arrow_down arrow_upper_right arrow_lower_right arrow_lower_left arrow_upper_left arrow_up_down left_right_arrow arrow_right_hook leftwards_arrow_with_hook arrow_heading_up arrow_heading_down twisted_rightwards_arrows repeat repeat_one arrows_counterclockwise arrows_clockwise musical_note notes heavy_plus_sign heavy_minus_sign heavy_division_sign heavy_multiplication_x heavy_dollar_sign currency_exchange tm copyright registered wavy_dash curly_loop loop end back on top soon heavy_check_mark ballot_box_with_check radio_button white_circle black_circle red_circle blue_circle small_red_triangle small_red_triangle_down small_orange_diamond small_blue_diamond large_orange_diamond large_blue_diamond white_square_button black_square_button black_small_square white_small_square black_medium_small_square white_medium_small_square black_medium_square white_medium_square black_large_square white_large_square speaker mute sound loud_sound bell no_bell mega loudspeaker speech_left eye_in_speech_bubble speech_balloon thought_balloon anger_right spades clubs hearts diamonds black_joker flower_playing_cards mahjong clock1 clock2 clock3 clock4 clock5 clock6 clock7 clock8 clock9 clock10 clock11 clock12 clock130 clock230 clock330 clock430 clock530 clock630 clock730 clock830 clock930 clock1030 clock1130 clock1230"},flags:{icon:"flag_gb",title:"Flags",emoji:"flag_white flag_black checkered_flag triangular_flag_on_post rainbow_flag flag_af flag_ax flag_al flag_dz flag_as flag_ad flag_ao flag_ai flag_aq flag_ag flag_ar flag_am flag_aw flag_au flag_at flag_az flag_bs flag_bh flag_bd flag_bb flag_by flag_be flag_bz flag_bj flag_bm flag_bt flag_bo flag_ba flag_bw flag_br flag_io flag_vg flag_bn flag_bg flag_bf flag_bi flag_kh flag_cm flag_ca flag_ic flag_cv flag_bq flag_ky flag_cf flag_td flag_cl flag_cn flag_cx flag_cc flag_co flag_km flag_cg flag_cd flag_ck flag_cr flag_ci flag_hr flag_cu flag_cw flag_cy flag_cz flag_dk flag_dj flag_dm flag_do flag_ec flag_eg flag_sv flag_gq flag_er flag_ee flag_et flag_eu flag_fk flag_fo flag_fj flag_fi flag_fr flag_gf flag_pf flag_tf flag_ga flag_gm flag_ge flag_de flag_gh flag_gi flag_gr flag_gl flag_gd flag_gp flag_gu flag_gt flag_gg flag_gn flag_gw flag_gy flag_ht flag_hn flag_hk flag_hu flag_is flag_in flag_id flag_ir flag_iq flag_ie flag_im flag_il flag_it flag_jm flag_jp crossed_flags flag_je flag_jo flag_kz flag_ke flag_ki flag_xk flag_kw flag_kg flag_la flag_lv flag_lb flag_ls flag_lr flag_ly flag_li flag_lt flag_lu flag_mo flag_mk flag_mg flag_mw flag_my flag_mv flag_ml flag_mt flag_mh flag_mq flag_mr flag_mu flag_yt flag_mx flag_fm flag_md flag_mc flag_mn flag_me flag_ms flag_ma flag_mz flag_mm flag_na flag_nr flag_np flag_nl flag_nc flag_nz flag_ni flag_ne flag_ng flag_nu flag_nf flag_kp flag_mp flag_no flag_om flag_pk flag_pw flag_ps flag_pa flag_pg flag_py flag_pe flag_ph flag_pn flag_pl flag_pt flag_pr flag_qa flag_re flag_ro flag_ru flag_rw flag_ws flag_sm flag_st flag_sa flag_sn flag_rs flag_sc flag_sl flag_sg flag_sx flag_sk flag_si flag_gs flag_sb flag_so flag_za flag_kr flag_ss flag_es flag_lk flag_bl flag_sh flag_kn flag_lc flag_pm flag_vc flag_sd flag_sr flag_sz flag_se flag_ch flag_sy flag_tw flag_tj flag_tz flag_th flag_tl flag_tg flag_tk flag_to flag_tt flag_tn flag_tr flag_tm flag_tc flag_tv flag_vi flag_ug flag_ua flag_ae flag_gb flag_us flag_uy flag_uz flag_vu flag_va flag_ve flag_vn flag_wf flag_eh flag_ye flag_zm flag_zw flag_ac flag_ta flag_bv flag_hm flag_sj flag_um flag_ea flag_cp flag_dg flag_mf united_nations england scotland wales"}}:a.filters={tones:{title:"Diversity",emoji:"santa runner surfer swimmer lifter ear nose point_up_2 point_down point_left point_right punch wave ok_hand thumbsup thumbsdown clap open_hands boy girl man woman cop bride_with_veil person_with_blond_hair man_with_gua_pi_mao man_with_turban older_man grandma baby construction_worker princess angel information_desk_person guardsman dancer nail_care massage haircut muscle spy hand_splayed middle_finger vulcan no_good ok_woman bow raising_hand raised_hands person_frowning person_with_pouting_face pray rowboat bicyclist mountain_bicyclist walking bath metal point_up basketball_player fist raised_hand v writing_hand"},recent:{icon:"clock3",title:"Recent",emoji:""},smileys_people:{icon:"yum",title:"Smileys & People",emoji:"grinning grimacing grin joy smiley smile sweat_smile laughing innocent wink blush slight_smile upside_down relaxed yum relieved heart_eyes kissing_heart kissing kissing_smiling_eyes kissing_closed_eyes stuck_out_tongue_winking_eye stuck_out_tongue_closed_eyes stuck_out_tongue money_mouth nerd sunglasses hugging smirk no_mouth neutral_face expressionless unamused rolling_eyes thinking flushed disappointed worried angry rage pensive confused slight_frown frowning2 persevere confounded tired_face weary triumph open_mouth scream fearful cold_sweat hushed frowning anguished cry disappointed_relieved sleepy sweat sob dizzy_face astonished zipper_mouth mask thermometer_face head_bandage sleeping zzz poop smiling_imp imp japanese_ogre japanese_goblin skull ghost alien robot smiley_cat smile_cat joy_cat heart_eyes_cat smirk_cat kissing_cat scream_cat crying_cat_face pouting_cat raised_hands clap wave thumbsup thumbsdown punch fist v ok_hand raised_hand open_hands muscle pray point_up point_up_2 point_down point_left point_right middle_finger hand_splayed metal vulcan writing_hand nail_care lips tongue ear nose eye eyes bust_in_silhouette busts_in_silhouette speaking_head baby boy girl man woman person_with_blond_hair older_man older_woman man_with_gua_pi_mao man_with_turban cop construction_worker guardsman spy santa angel princess bride_with_veil walking runner dancer dancers couple two_men_holding_hands two_women_holding_hands bow information_desk_person no_good ok_woman raising_hand person_with_pouting_face person_frowning haircut massage couple_with_heart couple_ww couple_mm couplekiss kiss_ww kiss_mm family family_mwg family_mwgb family_mwbb family_mwgg family_wwb family_wwg family_wwgb family_wwbb family_wwgg family_mmb family_mmg family_mmgb family_mmbb family_mmgg womans_clothes shirt jeans necktie dress bikini kimono lipstick kiss footprints high_heel sandal boot mans_shoe athletic_shoe womans_hat tophat helmet_with_cross mortar_board crown school_satchel pouch purse handbag briefcase eyeglasses dark_sunglasses ring closed_umbrella"},animals_nature:{icon:"hamster",title:"Animals & Nature",emoji:"dog cat mouse hamster rabbit bear panda_face koala tiger lion_face cow pig pig_nose frog octopus monkey_face see_no_evil hear_no_evil speak_no_evil monkey chicken penguin bird baby_chick hatching_chick hatched_chick wolf boar horse unicorn bee bug snail beetle ant spider scorpion crab snake turtle tropical_fish fish blowfish dolphin whale whale2 crocodile leopard tiger2 water_buffalo ox cow2 dromedary_camel camel elephant goat ram sheep racehorse pig2 rat mouse2 rooster turkey dove dog2 poodle cat2 rabbit2 chipmunk feet dragon dragon_face cactus christmas_tree evergreen_tree deciduous_tree palm_tree seedling herb shamrock four_leaf_clover bamboo tanabata_tree leaves fallen_leaf maple_leaf ear_of_rice hibiscus sunflower rose tulip blossom cherry_blossom bouquet mushroom chestnut jack_o_lantern shell spider_web earth_americas earth_africa earth_asia full_moon waning_gibbous_moon last_quarter_moon waning_crescent_moon new_moon waxing_crescent_moon first_quarter_moon waxing_gibbous_moon new_moon_with_face full_moon_with_face first_quarter_moon_with_face last_quarter_moon_with_face sun_with_face crescent_moon star star2 dizzy sparkles comet sunny white_sun_small_cloud partly_sunny white_sun_cloud white_sun_rain_cloud cloud cloud_rain thunder_cloud_rain cloud_lightning zap fire boom snowflake cloud_snow snowman2 snowman wind_blowing_face dash cloud_tornado fog umbrella2 umbrella droplet sweat_drops ocean"},food_drink:{icon:"pizza",title:"Food & Drink",emoji:"green_apple apple pear tangerine lemon banana watermelon grapes strawberry melon cherries peach pineapple tomato eggplant hot_pepper corn sweet_potato honey_pot bread cheese poultry_leg meat_on_bone fried_shrimp egg hamburger fries hotdog pizza spaghetti taco burrito ramen stew fish_cake sushi bento curry rice_ball rice rice_cracker oden dango shaved_ice ice_cream icecream cake birthday custard candy lollipop chocolate_bar popcorn doughnut cookie beer beers wine_glass cocktail tropical_drink champagne sake tea coffee baby_bottle fork_and_knife fork_knife_plate"},activity:{icon:"basketball",title:"Activity",emoji:"soccer basketball football baseball tennis volleyball rugby_football 8ball golf golfer ping_pong badminton hockey field_hockey cricket ski skier snowboarder ice_skate bow_and_arrow fishing_pole_and_fish rowboat swimmer surfer bath basketball_player lifter bicyclist mountain_bicyclist horse_racing levitate trophy running_shirt_with_sash medal military_medal reminder_ribbon rosette ticket tickets performing_arts art circus_tent microphone headphones musical_score musical_keyboard saxophone trumpet guitar violin clapper video_game space_invader dart game_die slot_machine bowling"},travel_places:{icon:"rocket",title:"Travel & Places",emoji:"red_car taxi blue_car bus trolleybus race_car police_car ambulance fire_engine minibus truck articulated_lorry tractor motorcycle bike rotating_light oncoming_police_car oncoming_bus oncoming_automobile oncoming_taxi aerial_tramway mountain_cableway suspension_railway railway_car train monorail bullettrain_side bullettrain_front light_rail mountain_railway steam_locomotive train2 metro tram station helicopter airplane_small airplane airplane_departure airplane_arriving sailboat motorboat speedboat ferry cruise_ship rocket satellite_orbital seat anchor construction fuelpump busstop vertical_traffic_light traffic_light checkered_flag ship ferris_wheel roller_coaster carousel_horse construction_site foggy tokyo_tower factory fountain rice_scene mountain mountain_snow mount_fuji volcano japan camping tent park motorway railway_track sunrise sunrise_over_mountains desert beach island city_sunset city_dusk cityscape night_with_stars bridge_at_night milky_way stars sparkler fireworks rainbow homes european_castle japanese_castle stadium statue_of_liberty house house_with_garden house_abandoned office department_store post_office european_post_office hospital bank hotel convenience_store school love_hotel wedding classical_building church mosque synagogue kaaba shinto_shrine"},objects:{icon:"bulb",title:"Objects",emoji:"watch iphone calling computer keyboard desktop printer mouse_three_button trackball joystick compression minidisc floppy_disk cd dvd vhs camera camera_with_flash video_camera movie_camera projector film_frames telephone_receiver telephone pager fax tv radio microphone2 level_slider control_knobs stopwatch timer alarm_clock clock hourglass_flowing_sand hourglass satellite battery electric_plug bulb flashlight candle wastebasket oil money_with_wings dollar yen euro pound moneybag credit_card gem scales wrench hammer hammer_pick tools pick nut_and_bolt gear chains gun bomb knife dagger crossed_swords shield smoking skull_crossbones coffin urn amphora crystal_ball prayer_beads barber alembic telescope microscope hole pill syringe thermometer label bookmark toilet shower bathtub key key2 couch sleeping_accommodation bed door bellhop frame_photo map beach_umbrella moyai shopping_bags balloon flags ribbon gift confetti_ball tada dolls wind_chime crossed_flags izakaya_lantern envelope envelope_with_arrow incoming_envelope e-mail love_letter postbox mailbox_closed mailbox mailbox_with_mail mailbox_with_no_mail package postal_horn inbox_tray outbox_tray scroll page_with_curl bookmark_tabs bar_chart chart_with_upwards_trend chart_with_downwards_trend page_facing_up date calendar calendar_spiral card_index card_box ballot_box file_cabinet clipboard notepad_spiral file_folder open_file_folder dividers newspaper2 newspaper notebook closed_book green_book blue_book orange_book notebook_with_decorative_cover ledger books book link paperclip paperclips scissors triangular_ruler straight_ruler pushpin round_pushpin triangular_flag_on_post flag_white flag_black closed_lock_with_key lock unlock lock_with_ink_pen pen_ballpoint pen_fountain black_nib pencil pencil2 crayon paintbrush mag mag_right"},symbols:{icon:"heartpulse",title:"Symbols",emoji:"heart yellow_heart green_heart blue_heart purple_heart broken_heart heart_exclamation two_hearts revolving_hearts heartbeat heartpulse sparkling_heart cupid gift_heart heart_decoration peace cross star_and_crescent om_symbol wheel_of_dharma star_of_david six_pointed_star menorah yin_yang orthodox_cross place_of_worship ophiuchus aries taurus gemini cancer leo virgo libra scorpius sagittarius capricorn aquarius pisces id atom u7a7a u5272 radioactive biohazard mobile_phone_off vibration_mode u6709 u7121 u7533 u55b6 u6708 eight_pointed_black_star vs accept white_flower ideograph_advantage secret congratulations u5408 u6e80 u7981 a b ab cl o2 sos no_entry name_badge no_entry_sign x o anger hotsprings no_pedestrians do_not_litter no_bicycles non-potable_water underage no_mobile_phones exclamation grey_exclamation question grey_question bangbang interrobang 100 low_brightness high_brightness trident fleur-de-lis part_alternation_mark warning children_crossing beginner recycle u6307 chart sparkle eight_spoked_asterisk negative_squared_cross_mark white_check_mark diamond_shape_with_a_dot_inside cyclone loop globe_with_meridians m atm sa passport_control customs baggage_claim left_luggage wheelchair no_smoking wc parking potable_water mens womens baby_symbol restroom put_litter_in_its_place cinema signal_strength koko ng ok up cool new free zero one two three four five six seven eight nine ten 1234 arrow_forward pause_button play_pause stop_button record_button track_next track_previous fast_forward rewind twisted_rightwards_arrows repeat repeat_one arrow_backward arrow_up_small arrow_down_small arrow_double_up arrow_double_down arrow_right arrow_left arrow_up arrow_down arrow_upper_right arrow_lower_right arrow_lower_left arrow_upper_left arrow_up_down left_right_arrow arrows_counterclockwise arrow_right_hook leftwards_arrow_with_hook arrow_heading_up arrow_heading_down hash asterisk information_source abc abcd capital_abcd symbols musical_note notes wavy_dash curly_loop heavy_check_mark arrows_clockwise heavy_plus_sign heavy_minus_sign heavy_division_sign heavy_multiplication_x heavy_dollar_sign currency_exchange copyright registered tm end back on top soon ballot_box_with_check radio_button white_circle black_circle red_circle large_blue_circle small_orange_diamond small_blue_diamond large_orange_diamond large_blue_diamond small_red_triangle black_small_square white_small_square black_large_square white_large_square small_red_triangle_down black_medium_square white_medium_square black_medium_small_square white_medium_small_square black_square_button white_square_button speaker sound loud_sound mute mega loudspeaker bell no_bell black_joker mahjong spades clubs hearts diamonds flower_playing_cards thought_balloon anger_right speech_balloon clock1 clock2 clock3 clock4 clock5 clock6 clock7 clock8 clock9 clock10 clock11 clock12 clock130 clock230 clock330 clock430 clock530 clock630 clock730 clock830 clock930 clock1030 clock1130 clock1230 eye_in_speech_bubble"},flags:{icon:"flag_gb",title:"Flags",emoji:"ac af al dz ad ao ai ag ar am aw au at az bs bh bd bb by be bz bj bm bt bo ba bw br bn bg bf bi cv kh cm ca ky cf td flag_cl cn co km cg flag_cd cr hr cu cy cz dk dj dm do ec eg sv gq er ee et fk fo fj fi fr pf ga gm ge de gh gi gr gl gd gu gt gn gw gy ht hn hk hu is in flag_id ir iq ie il it ci jm jp je jo kz ke ki xk kw kg la lv lb ls lr ly li lt lu mo mk mg mw my mv ml mt mh mr mu mx fm md mc mn me ms ma mz mm na nr np nl nc nz ni ne flag_ng nu kp no om pk pw ps pa pg py pe ph pl pt pr qa ro ru rw sh kn lc vc ws sm st flag_sa sn rs sc sl sg sk si sb so za kr es lk sd sr sz se ch sy tw tj tz th tl tg to tt tn tr flag_tm flag_tm ug ua ae gb us vi uy uz vu va ve vn wf eh ye zm zw re ax ta io bq cx cc gg im yt nf pn bl pm gs tk bv hm sj um ic ea cp dg as aq vg ck cw eu gf tf gp mq mp sx ss tc "}},a}function aj(a){var f=ak();if(a&&a.filters){var e=f.filters;aG.each(a.filters,function(d,g){return !an(g)||aG.isEmptyObject(g)?void delete e[d]:void aG.each(g,function(b,h){e[d][b]=h})}),a.filters=e}return aG.extend({},f,a)}var ai,ah;window.getSelection&&document.createRange?(ai=function(d){var c=window.getSelection&&window.getSelection();if(c&&c.rangeCount>0){return c.getRangeAt(0)}},ah=function(e,d){var f=document.createRange();f.setStart(d.startContainer,d.startOffset),f.setEnd(d.endContainer,d.endOffset),d=window.getSelection(),d.removeAllRanges(),d.addRange(f)}):document.selection&&document.body.createTextRange&&(ai=function(b){return document.selection.createRange()},ah=function(e,d){var f=document.body.createTextRange();f.moveToElementText(e),f.setStart(d.startContanier,d.startOffset),f.setEnd(d.endContainer,d.endOffset),f.select()});var ag;function af(d,c){return d.replace(ag,function(b){var e=aC[0===aw?"jsecapeMap":"jsEscapeMap"];return"undefined"!=typeof b&&b in e?ar(c,e[b]):b})}function ae(d,c){return d=d.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/`/g,"&#x60;").replace(/(?:\r\n|\r|\n)/g,"\n").replace(/(\n+)/g,"<div>$1</div>").replace(/\n/g,"<br/>").replace(/<br\/><\/div>/g,"</div>"),c.shortnames&&(d=aC.shortnameToUnicode(d)),af(d,c.emojiTemplate).replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(/  /g,"&nbsp;&nbsp;")}function ad(d,c){switch(d=d.replace(/&#10;/g,"\n").replace(/&#09;/g,"\t").replace(/<img[^>]*alt="([^"]+)"[^>]*>/gi,"$1").replace(/\n|\r/g,"").replace(/<br[^>]*>/gi,"\n").replace(/(?:<(?:div|p|ol|ul|li|pre|code|object)[^>]*>)+/gi,"<div>").replace(/(?:<\/(?:div|p|ol|ul|li|pre|code|object)>)+/gi,"</div>").replace(/\n<div><\/div>/gi,"\n").replace(/<div><\/div>\n/gi,"\n").replace(/(?:<div>)+<\/div>/gi,"\n").replace(/([^\n])<\/div><div>/gi,"$1\n").replace(/(?:<\/div>)+/gi,"</div>").replace(/([^\n])<\/div>([^\n])/gi,"$1\n$2").replace(/<\/div>/gi,"").replace(/([^\n])<div>/gi,"$1\n").replace(/\n<div>/gi,"\n").replace(/<div>\n/gi,"\n\n").replace(/<(?:[^>]+)?>/g,"").replace(new RegExp(av,"g"),"").replace(/&nbsp;/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&#x60;/g,"`").replace(/&#60;/g,"<").replace(/&#62;/g,">").replace(/&amp;/g,"&"),c.saveEmojisAs){case"image":d=af(d,c.emojiTemplate);break;case"shortname":d=aC.toShort(d)}return d}function ac(){var e=this,d=e.editor[0].offsetWidth-e.editor[0].clientWidth,f=parseInt(e.button.css("marginRight"));f!==d&&(e.button.css({marginRight:d}),e.floatingPicker&&e.picker.css({right:parseInt(e.picker.css("right"))-f+d}))}function ab(){var a=this;if(!a.sprite&&a.lasyEmoji[0]&&a.lasyEmoji.eq(0).is(".lazy-emoji")){var f=a.picker.offset().top,e=f+a.picker.height()+20;a.lasyEmoji.each(function(){var c=aG(this),d=c.offset().top;if(d>f&&d<e&&c.attr("src",c.data("src")).removeClass("lazy-emoji"),d>e){return !1}}),a.lasyEmoji=a.lasyEmoji.filter(".lazy-emoji")}}function aa(d,c){return(c?"":".")+ax+(d?"-"+d:"")}function Z(a){var d=aG("<div/>",an(a)?a:{"class":aa(a,!0)});return aG.each(ay.call(arguments).slice(1),function(c,e){aG.isFunction(e)&&(e=e.call(d)),e&&aG(e).appendTo(d)}),d}function Y(){return localStorage.getItem("recent_emojis")||""}function X(a,p){var o=Y();if(!a.recent||a.recent!==o||p){if(o.length){var n=a.scrollArea.is(".skinnable"),m,l;n||(m=a.scrollArea.scrollTop(),p&&a.recentCategory.show(),l=a.recentCategory.is(":visible")?a.recentCategory.height():0);var k=aq(o,a.emojiBtnTemplate,!0).split("|").join("");if(a.recentCategory.children(".emojibtn").remove(),aG(k).insertAfter(a.recentCategory.children(".emojionearea-category-title")),a.recentCategory.children(".emojibtn").on("click",function(){a.trigger("emojibtn.click",aG(this))}),a.recentFilter.show(),!n){a.recentCategory.show();var j=a.recentCategory.height();l!==j&&a.scrollArea.scrollTop(m+j-l)}}else{a.recentFilter.hasClass("active")&&a.recentFilter.removeClass("active").next().addClass("active"),a.recentCategory.hide(),a.recentFilter.hide()}a.recent=o}}function W(g,f){var j=Y(),i=j.split("|"),h=i.indexOf(f);h!==-1&&i.splice(h,1),i.unshift(f),i.length>9&&i.pop(),localStorage.setItem("recent_emojis",i.join("|")),X(g)}function V(){var d="test";try{return localStorage.setItem(d,d),localStorage.removeItem(d),!0}catch(c){return !1}}function U(I,H,G){I.options=G=aj(G),I.sprite=G.sprite&&aw<3,I.inline=null===G.inline?H.is("INPUT"):G.inline,I.shortnames=G.shortnames,I.saveEmojisAs=G.saveEmojisAs,I.standalone=G.standalone,I.emojiTemplate='<img alt="{alt}" class="emojione'+(I.sprite?'-{uni}" src="'+az+'"/>':'emoji" src="{img}"/>'),I.emojiTemplateAlt=I.sprite?'<i class="emojione-{uni}"/>':'<img class="emojioneemoji" src="{img}"/>',I.emojiBtnTemplate='<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}">'+I.emojiTemplateAlt+"</i>",I.recentEmojis=G.recentEmojis&&V();var F=G.pickerPosition;I.floatingPicker="top"===F||"bottom"===F,I.source=H,(H.is(":disabled")||H.is(".disabled"))&&I.disable();var E=H.is("TEXTAREA")||H.is("INPUT")?"val":"text",D,C,y,x,w,s,q,B,p,n,m=Z("tones",G.tones?function(){this.addClass(aa("tones-"+G.tonesStyle,!0));for(var c=0;c<=5;c++){this.append(aG("<i/>",{"class":"btn-tone btn-tone-"+c+(c?"":" active"),"data-skin":c,role:"button"}))}}:null),l=Z({"class":ax+(I.standalone?" "+ax+"-standalone ":" ")+(H.attr("class")||""),role:"application"},D=I.editor=Z("editor").attr({contenteditable:!I.standalone,placeholder:G.placeholder||H.data("placeholder")||H.attr("placeholder")||"",tabindex:0}),C=I.button=Z("button",Z("button-open"),Z("button-close")).attr("title",G.buttonTitle),y=I.picker=Z("picker",Z("wrapper",x=Z("filters"),G.search?s=Z("search-panel",Z("search",G.search?function(){I.search=aG("<input/>",{placeholder:G.searchPlaceholder||"",type:"text","class":"search"}),this.append(I.search)}:null),m):null,n=Z("scroll-area",G.tones&&!G.search?Z("tones-panel",m):null,q=Z("emojis-list")))).addClass(aa("picker-position-"+G.pickerPosition,!0)).addClass(aa("filters-position-"+G.filtersPosition,!0)).addClass(aa("search-position-"+G.searchPosition,!0)).addClass("hidden"));G.search&&s.addClass(aa("with-search",!0)),I.searchSel=null,D.data(H.data()),aG.each(G.attributes,function(d,c){D.attr(d,c)});var k=Z("category-block").attr({"data-tone":0}).prependTo(q);if(aG.each(G.filters,function(r,o){var i=0;if("recent"!==r||I.recentEmojis){if("tones"!==r){aG("<i/>",{"class":aa("filter",!0)+" "+aa("filter-"+r,!0),"data-filter":r,title:o.title}).wrapInner(aq(o.icon,I.emojiTemplateAlt)).appendTo(x)}else{if(!G.tones){return}i=5}do{var d,b=o.emoji.replace(/[\s,;]+/g,"|");d=0===i?Z("category").attr({name:r,"data-tone":i}).appendTo(k):Z("category-block").attr({name:r,"data-tone":i}).appendTo(q),i>0&&(d.hide(),b=b.split("|").join("_tone"+i+"|")+"_tone"+i),"recent"===r&&(b=Y()),b=aq(b,I.sprite?'<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}"><i class="emojione-{uni}"></i></i>':'<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}"><img class="emojioneemoji lazy-emoji" data-src="{img}"/></i>',!0).split("|").join(""),d.html(b),aG('<div class="emojionearea-category-title"/>').text(o.title).prependTo(d)}while(--i>0)}}),G.filters=null,I.sprite||(I.lasyEmoji=q.find(".lazy-emoji")),w=x.find(aa("filter")),w.eq(0).addClass("active"),p=q.find(aa("category-block")),B=q.find(aa("category")),I.recentFilter=w.filter('[data-filter="recent"]'),I.recentCategory=B.filter("[name=recent]"),I.scrollArea=n,G.container?aG(G.container).wrapInner(l):l.insertAfter(H),G.hideSource&&H.hide(),I.setText(H[E]()),H[E](I.getText()),ac.apply(I),I.standalone&&!I.getText().length){var j=aG(H).data("emoji-placeholder")||G.emojiPlaceholder;I.setText(j),D.addClass("has-placeholder")}at(I,q.find(".emojibtn"),{click:"emojibtn.click"}),at(I,window,{resize:"!resize"}),at(I,m.children(),{click:"tone.click"}),at(I,[y,C],{mousedown:"!mousedown"},D),at(I,C,{click:"button.click"}),at(I,D,{paste:"!paste"},D),at(I,D,["focus","blur"],function(){return !I.stayFocused&&D}),at(I,y,{mousedown:"picker.mousedown",mouseup:"picker.mouseup",click:"picker.click",keyup:"picker.keyup",keydown:"picker.keydown",keypress:"picker.keypress"}),at(I,D,["mousedown","mouseup","click","keyup","keydown","keypress"]),at(I,y.find(".emojionearea-filter"),{click:"filter.click"}),at(I,H,{change:"source.change"}),G.search&&at(I,I.search,{keyup:"search.keypress",focus:"search.focus",blur:"search.blur"});var h=!1;if(n.on("scroll",function(){if(!h&&(ab.call(I),n.is(":not(.skinnable)"))){var g=B.eq(0),f=n.offset().top;B.each(function(c,d){return !(aG(d).offset().top-f>=10)&&void (g=aG(d))});var b=w.filter('[data-filter="'+g.attr("name")+'"]');b[0]&&!b.is(".active")&&(w.removeClass("active"),b.addClass("active"))}}),I.on("@filter.click",function(b){var r=b.is(".active");if(n.is(".skinnable")){if(r){return}m.children().eq(0).click()}h=!0,r||(w.filter(".active").removeClass("active"),b.addClass("active"));var o=B.filter('[name="'+b.data("filter")+'"]').offset().top,i=n.scrollTop(),g=n.offset().top;n.stop().animate({scrollTop:o+i-g-2},200,"swing",function(){ab.call(I),h=!1})}).on("@picker.show",function(){I.recentEmojis&&X(I),ab.call(I)}).on("@tone.click",function(b){m.children().removeClass("active");var d=b.addClass("active").data("skin");d?(n.addClass("skinnable"),p.hide().filter("[data-tone="+d+"]").show(),w.removeClass("active")):(n.removeClass("skinnable"),p.hide().filter("[data-tone=0]").show(),w.eq(0).click()),ab.call(I),G.search&&I.trigger("search.keypress")}).on("@button.click",function(b){b.is(".active")?I.hidePicker():(I.showPicker(),I.searchSel=null)}).on("@!paste",function(z,v){var u=function(M){var L="caret-"+(new Date).getTime(),K=ae(M,I);ap(K),ap('<i id="'+L+'"></i>'),z.scrollTop(o);var J=aG("#"+L),A=J.offset().top-z.offset().top,c=z.height();(o+A>=c||o>A)&&z.scrollTop(o+A-2*c/3),J.remove(),I.stayFocused=!1,ac.apply(I),au(I,"paste",[z,M,K])};if(v.originalEvent.clipboardData){var t=v.originalEvent.clipboardData.getData("text/plain");return u(t),v.preventDefault?v.preventDefault():v.stop(),v.returnValue=!1,v.stopPropagation(),!1}I.stayFocused=!0,ap("<span>"+av+"</span>");var r=ai(z[0]),o=z.scrollTop(),b=aG("<div/>",{contenteditable:!0}).css({position:"fixed",left:"-999px",width:"1px",height:"1px",top:"20px",overflow:"hidden"}).appendTo(aG("BODY")).focus();window.setTimeout(function(){z.focus(),ah(z[0],r);var c=ad(b.html().replace(/\r\n|\n|\r/g,"<br>"),I);b.remove(),u(c)},200)}).on("@emojibtn.click",function(b){D.removeClass("has-placeholder"),null!==I.searchSel&&(D.focus(),ah(D[0],I.searchSel),I.searchSel=null),I.standalone?(D.html(aq(b.data("name"),I.emojiTemplate)),I.trigger("blur")):(ai(D[0]),ap(aq(b.data("name"),I.emojiTemplate))),I.recentEmojis&&W(I,b.data("name")),I.trigger("search.keypress")}).on("@!resize @keyup @emojibtn.click",ac).on("@!mousedown",function(f,b){return aG(b.target).hasClass("search")?(I.stayFocused=!0,null===I.searchSel&&(I.searchSel=ai(f[0]))):(l.is(".focused")||f.trigger("focus"),b.preventDefault()),!1}).on("@change",function(){var b=I.editor.html().replace(/<\/?(?:div|span|p)[^>]*>/gi,"");b.length&&!/^<br[^>]*>$/i.test(b)||I.editor.html(I.content=""),H[E](I.getText())}).on("@source.change",function(){I.setText(H[E]()),au("change")}).on("@focus",function(){l.addClass("focused")}).on("@blur",function(){l.removeClass("focused"),G.hidePickerOnBlur&&I.hidePicker();var b=I.editor.html();I.content!==b?(I.content=b,au(I,"change",[I.editor]),H.trigger("blur").trigger("change")):H.trigger("blur"),G.search&&(I.search.val(""),I.trigger("search.keypress",!0))}),G.search&&I.on("@search.focus",function(){I.stayFocused=!0,I.search.addClass("focused")}).on("@search.keypress",function(o){var i=y.find(".emojionearea-filter"),d=G.tones?m.find("i.active").data("skin"):0,b=I.search.val().replace(/ /g,"_").replace(/"/g,'\\"');b&&b.length?(I.recentFilter.hasClass("active")&&I.recentFilter.removeClass("active").next().addClass("active"),I.recentCategory.hide(),I.recentFilter.hide(),p.each(function(){var f=function(t,r){var v=t.find('.emojibtn[data-name*="'+b+'"]');if(0===v.length){t.data("tone")===r&&t.hide(),i.filter('[data-filter="'+t.attr("name")+'"]').hide()}else{var u=t.find('.emojibtn:not([data-name*="'+b+'"])');u.hide(),v.show(),t.data("tone")===r&&t.show(),i.filter('[data-filter="'+t.attr("name")+'"]').show()}},g=aG(this);0===g.data("tone")?B.filter(':not([name="recent"])').each(function(){f(aG(this),0)}):f(g,d)}),h?ab.call(I):n.trigger("scroll")):(X(I,!0),p.filter('[data-tone="'+m.find("i.active").data("skin")+'"]:not([name="recent"])').show(),aG(".emojibtn",p).show(),i.show(),ab.call(I))}).on("@search.blur",function(){I.stayFocused=!1,I.search.removeClass("focused"),I.trigger("blur")}),G.shortcuts&&I.on("@keydown",function(b,d){d.ctrlKey||(27==d.which&&(d.preventDefault(),C.is(".active")&&I.hidePicker()))}),an(G.events)&&!aG.isEmptyObject(G.events)&&aG.each(G.events,function(b,d){I.on(b.replace(/_/g,"."),d)}),G.autocomplete){var e=function(){var d={maxCount:G.textcomplete.maxCount,placement:G.textcomplete.placement};G.shortcuts&&(d.onKeydown=function(f,c){if(!f.ctrlKey&&13==f.which){return c.KEY_ENTER}});var b=aG.map(aC.emojioneList,function(f,c){return G.autocompleteTones?c:/_tone[12345]/.test(c)?null:c});b.sort(),D.textcomplete([{id:ax,match:/\B(:[\-+\w]*)$/,search:function(f,g){g(aG.map(b,function(c){return 0===c.indexOf(f)?c:null}))},template:function(c){return aq(c,I.emojiTemplate)+" "+c.replace(/:/g,"")},replace:function(c){return aq(c,I.emojiTemplate)},cache:!0,index:1}],d),G.textcomplete.placement&&"static"==aG(D.data("textComplete").option.appendTo).css("position")&&aG(D.data("textComplete").option.appendTo).css("position","relative")},a=function(){if(I.disabled){var b=function(){I.off("enabled",b),e()};I.on("enabled",b)}else{e()}}}I.inline&&(l.addClass(aa("inline",!0)),I.on("@keydown",function(d,c){13==c.which&&c.preventDefault()})),/firefox/i.test(navigator.userAgent)&&document.execCommand("enableObjectResizing",!1,!1),I.isReady=!0,I.trigger("onLoad",D),I.trigger("ready",D)}var T={defaultBase:"https://cdnjs.cloudflare.com/ajax/libs/emojione/",defaultBase3:"https://cdn.jsdelivr.net/",base:null,isLoading:!1};function S(a){var f=ao();if(a=aj(a),!T.isLoading){if(!aC||al(am(aC))<2){T.isLoading=!0;var e;e=al(f)>5?T.defaultBase3+"npm/emojione@"+f:al(f)>4?T.defaultBase3+"emojione/"+f:T.defaultBase+"/"+f,aG.ajax({url:e+"/lib/js/emojione.min.js",dataType:"script",cache:!0,success:function(){aC=window.emojione,f=am(aC),aw=al(f);var b;aw>4?(T.base=T.defaultBase3+"emojione/assets/"+f,b=T.base+"/sprites/emojione-sprite-"+aC.emojiSize+".css"):(T.base=T.defaultBase+f+"/assets",b=T.base+"/sprites/emojione.sprites.css"),a.sprite&&(document.createStyleSheet?document.createStyleSheet(b):aG("<link/>",{rel:"stylesheet",href:b}).appendTo("head"));while(aB.length){aB.shift().call()}T.isLoading=!1}})}else{f=am(aC),aw=al(f),aw>4?T.base=T.defaultBase3+"emojione/assets/"+f:T.base=T.defaultBase+f+"/assets"}}aA(function(){var b="";a.useInternalCDN&&(aw>4&&(b=aC.emojiSize+"/"),aC.imagePathPNG=T.base+"/png/"+b,aC.imagePathSVG=T.base+"/svg/"+b,aC.imagePathSVGSprites=T.base+"/sprites/emojione.sprites.svg",aC.imageType=a.imageType),al(f)>4?(ag=aC.regUnicode,aC.imageType=a.imageType||"png"):ag=new RegExp("<object[^>]*>.*?</object>|<span[^>]*>.*?</span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|("+aC.unicodeRegexp+")","gi")})}var R=function(b,d){var c=this;S(d),aE[c.id=++aF]={},aD[c.id]={},aA(function(){U(c,b,d)})};function Q(a,f){f=f.replace(/^@/,"");var d=a.id;aD[d][f]&&(aG.each(aD[d][f],function(c,b){aG.each(aG.isArray(b[0])?b[0]:[b[0]],function(g,e){aG(e).on(b[1],function(){var i=ay.call(arguments),h=aG.isFunction(b[2])?b[2].apply(a,[f].concat(i)):b[2];h&&au(a,f,[h].concat(i))})})}),aD[d][f]=null)}R.prototype.on=function(a,f){if(a&&aG.isFunction(f)){var c=this;aG.each(a.toLowerCase().split(" "),function(e,d){Q(c,d),(aE[c.id][d]||(aE[c.id][d]=[])).push(f)})}return this},R.prototype.off=function(a,f){if(a){var c=this.id;aG.each(a.toLowerCase().replace(/_/g,".").split(" "),function(d,e){aE[c][e]&&!/^@/.test(e)&&(f?aG.each(aE[c][e],function(h,g){g===f&&(aE[c][e]=aE[c][e].splice(h,1))}):aE[c][e]=[])})}return this},R.prototype.trigger=function(){var d=ay.call(arguments),c=[this].concat(d.slice(0,1));return c.push(d.slice(1)),au.apply(this,c)},R.prototype.setFocus=function(){var b=this;return aA(function(){b.editor.focus()}),b},R.prototype.setText=function(d){var c=this;return aA(function(){c.editor.html(ae(d,c)),c.content=c.editor.html(),au(c,"change",[c.editor]),ac.apply(c)}),c},R.prototype.getText=function(){return ad(this.editor.html(),this)},R.prototype.showPicker=function(){var b=this;return b._sh_timer&&window.clearTimeout(b._sh_timer),b.picker.removeClass("hidden"),b._sh_timer=window.setTimeout(function(){b.button.addClass("active")},50),au(b,"picker.show",[b.picker]),b},R.prototype.hidePicker=function(){var b=this;return b._sh_timer&&window.clearTimeout(b._sh_timer),b.button.removeClass("active"),b._sh_timer=window.setTimeout(function(){b.picker.addClass("hidden")},500),au(b,"picker.hide",[b.picker]),b},R.prototype.enable=function(){var d=this,c=function(){d.disabled=!1,d.editor.prop("contenteditable",!0),d.button.show();var a=d[d.standalone?"button":"editor"];a.parent().removeClass("emojionearea-disable"),au(d,"enabled",[a])};return d.isReady?c():d.on("ready",c),d},R.prototype.disable=function(){var d=this;d.disabled=!0;var c=function(){d.editor.prop("contenteditable",!1),d.hidePicker(),d.button.hide();var a=d[d.standalone?"button":"editor"];a.parent().addClass("emojionearea-disable"),au(d,"disabled",[a])};return d.isReady?c():d.on("ready",c),d},aG.fn.emojioneArea=function(a){return this.each(function(){return this.emojioneArea?this.emojioneArea:(aG.data(this,"emojioneArea",this.emojioneArea=new R(aG(this),a)),this.emojioneArea)})},aG.fn.emojioneArea.defaults=ak(),aG.fn.emojioneAreaText=function(a){a=aj(a);var f=this,e={shortnames:!a||"undefined"==typeof a.shortnames||a.shortnames,emojiTemplate:'<img alt="{alt}" class="emojione'+(a&&a.sprite&&aw<3?'-{uni}" src="'+az:'emoji" src="{img}')+'"/>'};return S(a),aA(function(){f.each(function(){var c=aG(this);return c.hasClass("emojionearea-text")||c.addClass("emojionearea-text").html(ae(c.is("TEXTAREA")||c.is("INPUT")?c.val():c.text(),e)),c})}),this}},window); var MooTools = MooTools || {};

/* * Author: Boniface Pereira
 * Website: www.craftpip.com
 * Contact: hey@craftpip.com
 *
 * Copyright 2013-2019 jquery-confirm
 * Licensed under MIT (https://github.com/craftpip/jquery-confirm/blob/master/LICENSE)
 */

const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
    .online-durum {
        color: #00cc00;
        font-weight: bold;
    }

    .offline-durum {
        color: #ff0000;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

var GLOBAL_YETKI = [
  { nick: "Phantom", role: "Sunucu Genel Sorumlusu" },
  { nick: "BlackForce", role: "Teknik Admin" }
];

(function(a){if(typeof define==="function"&&define.amd){define(["jquery"],a)}else{if(typeof module==="object"&&module.exports){module.exports=function(b,c){if(c===undefined){if(typeof window!=="undefined"){c=require("jquery")}else{c=require("jquery")(b)}}a(c);return c}}else{a(jQuery)}}}(function(c){var b=window;c.fn.confirm=function(e,d){if(typeof e==="undefined"){e={}}if(typeof e==="string"){e={content:e,title:(d)?d:false}}jQuery(this).each(function(){var f=jQuery(this);if(f.attr("jc-attached")){console.warn("jConfirm has already been attached to this element ",f[0]);return}f.on("click",function(k){k.preventDefault();var h=c.extend({},e);if(f.attr("data-title")){h.title=f.attr("data-title")}if(f.attr("data-content")){h.content=f.attr("data-content")}if(typeof h.buttons==="undefined"){h.buttons={}}h["$target"]=f;if(f.attr("href")&&Object.keys(h.buttons).length===0){var j=c.extend(true,{},b.jconfirm.pluginDefaults.defaultButtons,(b.jconfirm.defaults||{}).defaultButtons||{});var i=Object.keys(j)[0];h.buttons=j;h.buttons[i].action=function(){location.href=f.attr("href")}}h.closeIcon=false;var g=c.confirm(h)});f.attr("jc-attached",true)});return jQuery(this)};c.confirm=function(f,d){if(typeof f==="undefined"){f={}}if(typeof f==="string"){f={content:f,title:(d)?d:false}}var e=!(f.buttons===false);if(typeof f.buttons!=="object"){f.buttons={}}if(Object.keys(f.buttons).length===0&&e){var g=c.extend(true,{},b.jconfirm.pluginDefaults.defaultButtons,(b.jconfirm.defaults||{}).defaultButtons||{});f.buttons=g}return b.jconfirm(f)};c.alert=function(f,d){if(typeof f==="undefined"){f={}}if(typeof f==="string"){f={content:f,title:(d)?d:false}}var e=!(f.buttons===false);if(typeof f.buttons!=="object"){f.buttons={}}if(Object.keys(f.buttons).length===0&&e){var h=c.extend(true,{},b.jconfirm.pluginDefaults.defaultButtons,(b.jconfirm.defaults||{}).defaultButtons||{});var g=Object.keys(h)[0];f.buttons[g]=h[g]}return b.jconfirm(f)};c.dialog=function(e,d){if(typeof e==="undefined"){e={}}if(typeof e==="string"){e={content:e,title:(d)?d:false,closeIcon:function(){}}}e.buttons={};if(typeof e.closeIcon==="undefined"){e.closeIcon=function(){}}e.confirmKeys=[13];return b.jconfirm(e)};b.jconfirm=function(e){if(typeof e==="undefined"){e={}}var f=c.extend(true,{},b.jconfirm.pluginDefaults);if(b.jconfirm.defaults){f=c.extend(true,f,b.jconfirm.defaults)}f=c.extend(true,{},f,e);var d=new b.Jconfirm(f);b.jconfirm.instances.push(d);return d};b.Jconfirm=function(d){c.extend(this,d);this._init()};b.Jconfirm.prototype={_init:function(){var d=this;if(!b.jconfirm.instances.length){b.jconfirm.lastFocused=jQuery("body").find(":focus")}this._id=Math.round(Math.random()*99999);this.contentParsed=jQuery(document.createElement("div"));if(!this.lazyOpen){setTimeout(function(){d.open()},0)}},_buildHTML:function(){var f=this;this._parseAnimation(this.animation,"o");this._parseAnimation(this.closeAnimation,"c");this._parseBgDismissAnimation(this.backgroundDismissAnimation);this._parseColumnClass(this.columnClass);this._parseTheme(this.theme);this._parseType(this.type);var e=jQuery(this.template);e.find(".jconfirm-box").addClass(this.animationParsed).addClass(this.backgroundDismissAnimationParsed).addClass(this.typeParsed);if(this.typeAnimated){e.find(".jconfirm-box").addClass("jconfirm-type-animated")}if(this.useBootstrap){e.find(".jc-bs3-row").addClass(this.bootstrapClasses.row);e.find(".jc-bs3-row").addClass("justify-content-md-center justify-content-sm-center justify-content-xs-center justify-content-lg-center");e.find(".jconfirm-box-container").addClass(this.columnClassParsed);if(this.containerFluid){e.find(".jc-bs3-container").addClass(this.bootstrapClasses.containerFluid)}else{e.find(".jc-bs3-container").addClass(this.bootstrapClasses.container)}}else{e.find(".jconfirm-box").css("width",this.boxWidth)}if(this.titleClass){e.find(".jconfirm-title-c").addClass(this.titleClass)}e.addClass(this.themeParsed);var d="jconfirm-box"+this._id;e.find(".jconfirm-box").attr("aria-labelledby",d).attr("tabindex",-1);e.find(".jconfirm-content").attr("id",d);if(this.bgOpacity!==null){e.find(".jconfirm-bg").css("opacity",this.bgOpacity)}if(this.rtl){e.addClass("jconfirm-rtl")}this.$el=e.appendTo(this.container);this.$jconfirmBoxContainer=this.$el.find(".jconfirm-box-container");this.$jconfirmBox=this.$body=this.$el.find(".jconfirm-box");this.$jconfirmBg=this.$el.find(".jconfirm-bg");this.$title=this.$el.find(".jconfirm-title");this.$titleContainer=this.$el.find(".jconfirm-title-c");this.$content=this.$el.find("div.jconfirm-content");this.$contentPane=this.$el.find(".jconfirm-content-pane");this.$icon=this.$el.find(".jconfirm-icon-c");this.$closeIcon=this.$el.find(".jconfirm-closeIcon");this.$holder=this.$el.find(".jconfirm-holder");this.$btnc=this.$el.find(".jconfirm-buttons");this.$scrollPane=this.$el.find(".jconfirm-scrollpane");f.setStartingPoint();this._contentReady=c.Deferred();this._modalReady=c.Deferred();this.$holder.css({"padding-top":this.offsetTop,"padding-bottom":this.offsetBottom});this.setTitle();this.setIcon();this._setButtons();this._parseContent();this.initDraggable();if(this.isAjax){this.showLoading(false)}c.when(this._contentReady,this._modalReady).then(function(){if(f.isAjaxLoading){setTimeout(function(){f.isAjaxLoading=false;f.setContent();f.setTitle();f.setIcon();setTimeout(function(){f.hideLoading(false);f._updateContentMaxHeight()},100);if(typeof f.onContentReady==="function"){f.onContentReady()}},50)}else{f._updateContentMaxHeight();f.setTitle();f.setIcon();if(typeof f.onContentReady==="function"){f.onContentReady()}}if(f.autoClose){f._startCountDown()}}).then(function(){f._watchContent()});if(this.animation==="none"){this.animationSpeed=1;this.animationBounce=1}this.$body.css(this._getCSS(this.animationSpeed,this.animationBounce));this.$contentPane.css(this._getCSS(this.animationSpeed,1));this.$jconfirmBg.css(this._getCSS(this.animationSpeed,1));this.$jconfirmBoxContainer.css(this._getCSS(this.animationSpeed,1))},_typePrefix:"jconfirm-type-",typeParsed:"",_parseType:function(d){this.typeParsed=this._typePrefix+d},setType:function(e){var d=this.typeParsed;this._parseType(e);this.$jconfirmBox.removeClass(d).addClass(this.typeParsed)},themeParsed:"",_themePrefix:"jconfirm-",setTheme:function(e){var d=this.theme;this.theme=e||this.theme;this._parseTheme(this.theme);if(d){this.$el.removeClass(d)}this.$el.addClass(this.themeParsed);this.theme=e},_parseTheme:function(e){var d=this;e=e.split(",");c.each(e,function(g,f){if(f.indexOf(d._themePrefix)===-1){e[g]=d._themePrefix+c.trim(f)}});this.themeParsed=e.join(" ").toLowerCase()},backgroundDismissAnimationParsed:"",_bgDismissPrefix:"jconfirm-hilight-",_parseBgDismissAnimation:function(f){var e=f.split(",");var d=this;c.each(e,function(h,g){if(g.indexOf(d._bgDismissPrefix)===-1){e[h]=d._bgDismissPrefix+c.trim(g)}});this.backgroundDismissAnimationParsed=e.join(" ").toLowerCase()},animationParsed:"",closeAnimationParsed:"",_animationPrefix:"jconfirm-animation-",setAnimation:function(d){this.animation=d||this.animation;this._parseAnimation(this.animation,"o")},_parseAnimation:function(f,g){g=g||"o";var h=f.split(",");var e=this;c.each(h,function(j,i){if(i.indexOf(e._animationPrefix)===-1){h[j]=e._animationPrefix+c.trim(i)}});var d=h.join(" ").toLowerCase();if(g==="o"){this.animationParsed=d}else{this.closeAnimationParsed=d}return d},setCloseAnimation:function(d){this.closeAnimation=d||this.closeAnimation;this._parseAnimation(this.closeAnimation,"c")},setAnimationSpeed:function(d){this.animationSpeed=d||this.animationSpeed},columnClassParsed:"",setColumnClass:function(d){if(!this.useBootstrap){console.warn("cannot set columnClass, useBootstrap is set to false");return}this.columnClass=d||this.columnClass;this._parseColumnClass(this.columnClass);this.$jconfirmBoxContainer.addClass(this.columnClassParsed)},_updateContentMaxHeight:function(){var d=jQuery(window).height()-(this.$jconfirmBox.outerHeight()-this.$contentPane.outerHeight())-(this.offsetTop+this.offsetBottom);this.$contentPane.css({"max-height":d+"px"})},setBoxWidth:function(d){if(this.useBootstrap){console.warn("cannot set boxWidth, useBootstrap is set to true");return}this.boxWidth=d;this.$jconfirmBox.css("width",d)},_parseColumnClass:function(d){d=d.toLowerCase();var e;switch(d){case"xl":case"xlarge":e="col-md-12";break;case"l":case"large":e="col-md-8 col-md-offset-2";break;case"m":case"medium":e="col-md-6 col-md-offset-3";break;case"s":case"small":e="col-md-4 col-md-offset-4";break;case"xs":case"xsmall":e="col-md-2 col-md-offset-5";break;default:e=d}this.columnClassParsed=e},initDraggable:function(){var d=this;var e=this.$titleContainer;this.resetDrag();if(this.draggable){e.on("mousedown",function(f){e.addClass("jconfirm-hand");d.mouseX=f.clientX;d.mouseY=f.clientY;d.isDrag=true});jQuery(window).on("mousemove."+this._id,function(f){if(d.isDrag){d.movingX=f.clientX-d.mouseX+d.initialX;d.movingY=f.clientY-d.mouseY+d.initialY;d.setDrag()}});jQuery(window).on("mouseup."+this._id,function(){e.removeClass("jconfirm-hand");if(d.isDrag){d.isDrag=false;d.initialX=d.movingX;d.initialY=d.movingY}})}},resetDrag:function(){this.isDrag=false;this.initialX=0;this.initialY=0;this.movingX=0;this.movingY=0;this.mouseX=0;this.mouseY=0;this.$jconfirmBoxContainer.css("transform","translate("+0+"px, "+0+"px)")},setDrag:function(){if(!this.draggable){return}this.alignMiddle=false;var i=this.$jconfirmBox.outerWidth();var j=this.$jconfirmBox.outerHeight();var g=jQuery(window).width();var k=jQuery(window).height();var h=this;var e=1;if(h.movingX%e===0||h.movingY%e===0){if(h.dragWindowBorder){var f=(g/2)-i/2;var d=(k/2)-j/2;d-=h.dragWindowGap;f-=h.dragWindowGap;if(f+h.movingX<0){h.movingX=-f}else{if(f-h.movingX<0){h.movingX=f}}if(d+h.movingY<0){h.movingY=-d}else{if(d-h.movingY<0){h.movingY=d}}}h.$jconfirmBoxContainer.css("transform","translate("+h.movingX+"px, "+h.movingY+"px)")}},_scrollTop:function(){if(typeof pageYOffset!=="undefined"){return pageYOffset}else{var e=document.body;var d=document.documentElement;d=(d.clientHeight)?d:e;return d.scrollTop}},_watchContent:function(){var d=this;if(this._timer){clearInterval(this._timer)}var e=0;this._timer=setInterval(function(){if(d.smoothContent){var h=d.$content.outerHeight()||0;if(h!==e){e=h}var f=jQuery(window).height();var g=d.offsetTop+d.offsetBottom+d.$jconfirmBox.height()-d.$contentPane.height()+d.$content.height();if(g<f){d.$contentPane.addClass("no-scroll")}else{d.$contentPane.removeClass("no-scroll")}}},this.watchInterval)},_overflowClass:"jconfirm-overflow",_hilightAnimating:false,highlight:function(){this.hiLightModal()},hiLightModal:function(){var d=this;if(this._hilightAnimating){return}d.$body.addClass("hilight");var e=parseFloat(d.$body.css("animation-duration"))||2;this._hilightAnimating=true;setTimeout(function(){d._hilightAnimating=false;d.$body.removeClass("hilight")},e*1000)},_bindEvents:function(){var e=this;this.boxClicked=false;this.$scrollPane.click(function(i){if(!e.boxClicked){var f=false;var h=false;var j;if(typeof e.backgroundDismiss==="function"){j=e.backgroundDismiss()}else{j=e.backgroundDismiss}if(typeof j==="string"&&typeof e.buttons[j]!=="undefined"){f=j;h=false}else{if(typeof j==="undefined"||!!(j)===true){h=true}else{h=false}}if(f){var g=e.buttons[f].action.apply(e);h=(typeof g==="undefined")||!!(g)}if(h){e.close()}else{e.hiLightModal()}}e.boxClicked=false});this.$jconfirmBox.click(function(f){e.boxClicked=true});var d=false;jQuery(window).on("jcKeyDown."+e._id,function(f){if(!d){d=true}});jQuery(window).on("keyup."+e._id,function(f){if(d){e.reactOnKey(f);d=false}});jQuery(window).on("resize."+this._id,function(){e._updateContentMaxHeight();setTimeout(function(){e.resetDrag()},100)})},_cubic_bezier:"0.36, 0.55, 0.19",_getCSS:function(e,d){return{"-webkit-transition-duration":e/1000+"s","transition-duration":e/1000+"s","-webkit-transition-timing-function":"cubic-bezier("+this._cubic_bezier+", "+d+")","transition-timing-function":"cubic-bezier("+this._cubic_bezier+", "+d+")"}},_setButtons:function(){var f=this;var d=0;if(typeof this.buttons!=="object"){this.buttons={}}c.each(this.buttons,function(i,h){d+=1;if(typeof h==="function"){f.buttons[i]=h={action:h}}f.buttons[i].text=h.text||i;f.buttons[i].btnClass=h.btnClass||"btn-default";f.buttons[i].action=h.action||function(){};f.buttons[i].keys=h.keys||[];f.buttons[i].isHidden=h.isHidden||false;f.buttons[i].isDisabled=h.isDisabled||false;c.each(f.buttons[i].keys,function(k,j){f.buttons[i].keys[k]=j.toLowerCase()});var g=jQuery('<button type="button" class="btn"></button>').html(f.buttons[i].text).addClass(f.buttons[i].btnClass).prop("disabled",f.buttons[i].isDisabled).css("display",f.buttons[i].isHidden?"none":"").click(function(k){k.preventDefault();var j=f.buttons[i].action.apply(f,[f.buttons[i]]);f.onAction.apply(f,[i,f.buttons[i]]);f._stopCountDown();if(typeof j==="undefined"||j){f.close()}});f.buttons[i].el=g;f.buttons[i].setText=function(j){g.html(j)};f.buttons[i].addClass=function(j){g.addClass(j)};f.buttons[i].removeClass=function(j){g.removeClass(j)};f.buttons[i].disable=function(){f.buttons[i].isDisabled=true;g.prop("disabled",true)};f.buttons[i].enable=function(){f.buttons[i].isDisabled=false;g.prop("disabled",false)};f.buttons[i].show=function(){f.buttons[i].isHidden=false;g.css("display","")};f.buttons[i].hide=function(){f.buttons[i].isHidden=true;g.css("display","none")};f["$_"+i]=f["$$"+i]=g;f.$btnc.append(g)});if(d===0){this.$btnc.hide()}if(this.closeIcon===null&&d===0){this.closeIcon=true}if(this.closeIcon){if(this.closeIconClass){var e='<i class="'+this.closeIconClass+'"></i>';this.$closeIcon.html(e)}this.$closeIcon.click(function(j){j.preventDefault();var g=false;var i=false;var k;if(typeof f.closeIcon==="function"){k=f.closeIcon()}else{k=f.closeIcon}if(typeof k==="string"&&typeof f.buttons[k]!=="undefined"){g=k;i=false}else{if(typeof k==="undefined"||!!(k)===true){i=true}else{i=false}}if(g){var h=f.buttons[g].action.apply(f);i=(typeof h==="undefined")||!!(h)}if(i){f.close()}});this.$closeIcon.show()}else{this.$closeIcon.hide()}},setTitle:function(e,f){f=f||false;if(typeof e!=="undefined"){if(typeof e==="string"){this.title=e}else{if(typeof e==="function"){if(typeof e.promise==="function"){console.error("Promise was returned from title function, this is not supported.")}var d=e();if(typeof d==="string"){this.title=d}else{this.title=false}}else{this.title=false}}}if(this.isAjaxLoading&&!f){return}this.$title.html(this.title||"");this.updateTitleContainer()},setIcon:function(d,f){f=f||false;if(typeof d!=="undefined"){if(typeof d==="string"){this.icon=d}else{if(typeof d==="function"){var e=d();if(typeof e==="string"){this.icon=e}else{this.icon=false}}else{this.icon=false}}}if(this.isAjaxLoading&&!f){return}this.$icon.html(this.icon?'<i class="'+this.icon+'"></i>':"");this.updateTitleContainer()},updateTitleContainer:function(){if(!this.title&&!this.icon){this.$titleContainer.hide()}else{this.$titleContainer.show()}},setContentPrepend:function(d,e){if(!d){return}this.contentParsed.prepend(d)},setContentAppend:function(d){if(!d){return}this.contentParsed.append(d)},setContent:function(e,f){f=!!f;var d=this;if(e){this.contentParsed.html("").append(e)}if(this.isAjaxLoading&&!f){return}this.$content.html("");this.$content.append(this.contentParsed);setTimeout(function(){d.$body.find("input[autofocus]:visible:first").focus()},100)},loadingSpinner:false,showLoading:function(d){this.loadingSpinner=true;this.$jconfirmBox.addClass("loading");if(d){this.$btnc.find("button").prop("disabled",true)}},hideLoading:function(d){this.loadingSpinner=false;this.$jconfirmBox.removeClass("loading");if(d){this.$btnc.find("button").prop("disabled",false)}},ajaxResponse:false,contentParsed:"",isAjax:false,isAjaxLoading:false,_parseContent:function(){var g=this;var h="&nbsp;";if(typeof this.content==="function"){var f=this.content.apply(this);if(typeof f==="string"){this.content=f}else{if(typeof f==="object"&&typeof f.always==="function"){this.isAjax=true;this.isAjaxLoading=true;f.always(function(i,e,j){g.ajaxResponse={data:i,status:e,xhr:j};g._contentReady.resolve(i,e,j);if(typeof g.contentLoaded==="function"){g.contentLoaded(i,e,j)}});this.content=h}else{this.content=h}}}if(typeof this.content==="string"&&this.content.substr(0,4).toLowerCase()==="url:"){this.isAjax=true;this.isAjaxLoading=true;var d=this.content.substring(4,this.content.length);c.get(d).done(function(e){g.contentParsed.html(e)}).always(function(i,e,j){g.ajaxResponse={data:i,status:e,xhr:j};g._contentReady.resolve(i,e,j);if(typeof g.contentLoaded==="function"){g.contentLoaded(i,e,j)}})}if(!this.content){this.content=h}if(!this.isAjax){this.contentParsed.html(this.content);this.setContent();g._contentReady.resolve()}},_stopCountDown:function(){clearInterval(this.autoCloseInterval);if(this.$cd){this.$cd.remove()}},_startCountDown:function(){var f=this;var d=this.autoClose.split("|");if(d.length!==2){console.error("Invalid option for autoClose. example 'close|10000'");return false}var e=d[0];var g=parseInt(d[1]);if(typeof this.buttons[e]==="undefined"){console.error("Invalid button key '"+e+"' for autoClose");return false}var h=Math.ceil(g/1000);this.$cd=jQuery('<span class="countdown"> ('+h+")</span>").appendTo(this["$_"+e]);this.autoCloseInterval=setInterval(function(){f.$cd.html(" ("+(h-=1)+") ");if(h<=0){f["$$"+e].trigger("click");f._stopCountDown()}},1000)},_getKey:function(e){switch(e){case 192:return"tilde";case 13:return"enter";case 16:return"shift";case 9:return"tab";case 20:return"capslock";case 17:return"ctrl";case 91:return"win";case 18:return"alt";case 27:return"esc";case 32:return"space"}var d=String.fromCharCode(e);if(/^[A-z0-9]+$/.test(d)){return d.toLowerCase()}else{return false}},reactOnKey:function(j){var i=this;var f=jQuery(".jconfirm");if(f.eq(f.length-1)[0]!==this.$el[0]){return false}var g=j.which;if(this.$content.find(":input").is(":focus")&&/13|32/.test(g)){return false}var h=this._getKey(g);if(h==="esc"&&this.escapeKey){if(this.escapeKey===true){this.$scrollPane.trigger("click")}else{if(typeof this.escapeKey==="string"||typeof this.escapeKey==="function"){var d;if(typeof this.escapeKey==="function"){d=this.escapeKey()}else{d=this.escapeKey}if(d){if(typeof this.buttons[d]==="undefined"){console.warn("Invalid escapeKey, no buttons found with key "+d)}else{this["$_"+d].trigger("click")}}}}}c.each(this.buttons,function(k,e){if(e.keys.indexOf(h)!==-1){i["$_"+k].trigger("click")}})},setDialogCenter:function(){console.info("setDialogCenter is deprecated, dialogs are centered with CSS3 tables")},_unwatchContent:function(){clearInterval(this._timer)},close:function(d){var e=this;if(typeof this.onClose==="function"){this.onClose(d)}this._unwatchContent();jQuery(window).unbind("resize."+this._id);jQuery(window).unbind("keyup."+this._id);jQuery(window).unbind("jcKeyDown."+this._id);if(this.draggable){jQuery(window).unbind("mousemove."+this._id);jQuery(window).unbind("mouseup."+this._id);this.$titleContainer.unbind("mousedown")}e.$el.removeClass(e.loadedClass);jQuery("body").removeClass("jconfirm-no-scroll-"+e._id);e.$jconfirmBoxContainer.removeClass("jconfirm-no-transition");setTimeout(function(){e.$body.addClass(e.closeAnimationParsed);e.$jconfirmBg.addClass("jconfirm-bg-h");var f=(e.closeAnimation==="none")?1:e.animationSpeed;setTimeout(function(){e.$el.remove();var h=b.jconfirm.instances;var n=b.jconfirm.instances.length-1;for(n;n>=0;n--){if(b.jconfirm.instances[n]._id===e._id){b.jconfirm.instances.splice(n,1)}}if(!b.jconfirm.instances.length){if(e.scrollToPreviousElement&&b.jconfirm.lastFocused&&b.jconfirm.lastFocused.length&&c.contains(document,b.jconfirm.lastFocused[0])){var k=b.jconfirm.lastFocused;if(e.scrollToPreviousElementAnimate){var m=jQuery(window).scrollTop();var o=b.jconfirm.lastFocused.offset().top;var g=jQuery(window).height();if(!(o>m&&o<(m+g))){var j=(o-Math.round((g/3)));jQuery("html, body").animate({scrollTop:j},e.animationSpeed,"swing",function(){k.focus()})}else{k.focus()}}else{k.focus()}b.jconfirm.lastFocused=false}}if(typeof e.onDestroy==="function"){e.onDestroy()}},f*0.4)},50);return true},open:function(){if(this.isOpen()){return false}this._buildHTML();this._bindEvents();this._open();return true},setStartingPoint:function(){var f=false;if(this.animateFromElement!==true&&this.animateFromElement){f=this.animateFromElement;b.jconfirm.lastClicked=false}else{if(b.jconfirm.lastClicked&&this.animateFromElement===true){f=b.jconfirm.lastClicked;b.jconfirm.lastClicked=false}else{return false}}if(!f){return false}var h=f.offset();var i=f.outerHeight()/2;var l=f.outerWidth()/2;i-=this.$jconfirmBox.outerHeight()/2;l-=this.$jconfirmBox.outerWidth()/2;var e=h.top+i;e=e-this._scrollTop();var g=h.left+l;var d=jQuery(window).height()/2;var k=jQuery(window).width()/2;var j=d-this.$jconfirmBox.outerHeight()/2;var m=k-this.$jconfirmBox.outerWidth()/2;e-=j;g-=m;if(Math.abs(e)>d||Math.abs(g)>k){return false}this.$jconfirmBoxContainer.css("transform","translate("+g+"px, "+e+"px)")},_open:function(){var d=this;if(typeof d.onOpenBefore==="function"){d.onOpenBefore()}this.$body.removeClass(this.animationParsed);this.$jconfirmBg.removeClass("jconfirm-bg-h");this.$body.focus();d.$jconfirmBoxContainer.css("transform","translate("+0+"px, "+0+"px)");setTimeout(function(){d.$body.css(d._getCSS(d.animationSpeed,1));d.$body.css({"transition-property":d.$body.css("transition-property")+", margin"});d.$jconfirmBoxContainer.addClass("jconfirm-no-transition");d._modalReady.resolve();if(typeof d.onOpen==="function"){d.onOpen()}d.$el.addClass(d.loadedClass)},this.animationSpeed)},loadedClass:"jconfirm-open",isClosed:function(){return !this.$el||this.$el.parent().length===0},isOpen:function(){return !this.isClosed()},toggle:function(){if(!this.isOpen()){this.open()}else{this.close()}}};b.jconfirm.instances=[];b.jconfirm.lastFocused=false;b.jconfirm.pluginDefaults={template:'<div class="jconfirm"><div class="jconfirm-bg jconfirm-bg-h"></div><div class="jconfirm-scrollpane"><div class="jconfirm-row"><div class="jconfirm-cell"><div class="jconfirm-holder"><div class="jc-bs3-container"><div class="jc-bs3-row"><div class="jconfirm-box-container jconfirm-animated"><div class="jconfirm-box" role="dialog" aria-labelledby="labelled" tabindex="-1"><div class="jconfirm-closeIcon">&times;</div><div class="jconfirm-title-c"><span class="jconfirm-icon-c"></span><span class="jconfirm-title"></span></div><div class="jconfirm-content-pane"><div class="jconfirm-content"></div></div><div class="jconfirm-buttons"></div><div class="jconfirm-clear"></div></div></div></div></div></div></div></div></div></div>',title:"Hello",titleClass:"",type:"default",typeAnimated:true,draggable:true,dragWindowGap:15,dragWindowBorder:true,animateFromElement:true,alignMiddle:true,smoothContent:true,content:"Are you sure to continue?",buttons:{},defaultButtons:{ok:{action:function(){}},close:{action:function(){}}},contentLoaded:function(){},icon:"",lazyOpen:false,bgOpacity:null,theme:"light",animation:"scale",closeAnimation:"scale",animationSpeed:400,animationBounce:1,escapeKey:true,rtl:false,container:"body",containerFluid:false,backgroundDismiss:false,backgroundDismissAnimation:"shake",autoClose:false,closeIcon:null,closeIconClass:false,watchInterval:100,columnClass:"col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1",boxWidth:"50%",scrollToPreviousElement:true,scrollToPreviousElementAnimate:true,useBootstrap:true,offsetTop:40,offsetBottom:40,bootstrapClasses:{container:"container",containerFluid:"container-fluid",row:"row"},onContentReady:function(){},onOpenBefore:function(){},onOpen:function(){},onClose:function(){},onDestroy:function(){},onAction:function(){}};var a=false;jQuery(window).on("keydown",function(g){if(!a){var d=jQuery(g.target);var f=false;if(d.closest(".jconfirm-box").length){f=true}if(f){jQuery(window).trigger("jcKeyDown")}a=true}});jQuery(window).on("keyup",function(){a=false});b.jconfirm.lastClicked=false;jQuery(document).on("mousedown","button, a, [jc-source]",function(){b.jconfirm.lastClicked=jQuery(this)})}));$.noConflict();QWEBIRC_BUILD="";
window.radyoNesnesi = null;


window.raw = null;
window.ipAdresi = "";
window.bfMevcutSes = null;
window.bfAktifCalmaButonu = null;
window.bfSesAyarlaniyor = false;
window.bfOrijinalSesSeviyesi = 0;
window.lastEffectSendTime = 0;
var gevezetagramNotificationCount = 0;
var gevezetagramBadge = null;
window.lastSesEffectSendTime = 0;

(function() {
    var rgx = location.search.match(/[?&]domain=([^&]+)/i);
    if (rgx) {
        var iframeDomainCek = decodeURIComponent(rgx[1]).replace(/.*\.(.*\.(com\.tr|net|org|com))$/, '$1');
        window.manuelDomain = iframeDomainCek;
        console.log('%c Domain: ' + iframeDomainCek, 'color:#0f0; font-size:14px;');
    }
})();

function domainkontrol() {
    if (typeof manuelDomain !== "undefined" && manuelDomain) {
        return manuelDomain;
    }
    return window.location.hostname;
}

window.domaineGoreRadyo = function() {
    const domdomAmk = domainkontrol();
    console.log(domdomAmk + " domainS");

    if (domdomAmk.endsWith("klasfm.com.tr")) {
        return 2;
    }

    const KalbimFMDomainleri = [
        "nurchat.org",
        "islamisohbet.net",
        "eskimynetsohbet.com",
        "bizimmekan.com.tr",
        "bizimmekan.net",
        "cinselsohbet.com",
        "cinselsohbet.org",
        "cinselcafe.com",
        "sobbettam.com",
        "gabilechat.net"
    ];

    return KalbimFMDomainleri.some(d => domdomAmk.endsWith(d)) ? 1 : 0;
};

window.domaineGoreKanal = function() {
    const domdomAmk = domainkontrol();

    if (domdomAmk.endsWith("klasfm.com.tr")) {
        return ["#klasfm"];
    }

    if (["nurchat.org","islamisohbet.net","eskimynetsohbet.com","bizimmekan.com.tr","bizimmekan.net"].some(d => domdomAmk.endsWith(d))) {
        return ["#kalbimfm"];
    }

    return [];
};

window.resetRadyoSesSeviyesi = function() {
    if (window.bfSesAyarlaniyor && window.soundManager?.sounds?.['PlayCtrl']) {
        try {
            window.bfRadyoSesAyarla(window.bfOrijinalSesSeviyesi);
            window.bfSesAyarlaniyor = false;
        } catch (e) {
            console.log("Radyo ses seviyesi geri yüklenirken hata: " + e.message);
        }
    }
};

window.bfSesCalmaYonetimi = function(soundUrl, soundName, context) {
    if (window.bfMevcutSes) {
        try {
            window.bfMevcutSes.pause();
            window.bfMevcutSes.currentTime = 0;
            window.bfMevcutSes.onended = null;
            window.bfMevcutSes = null;
            window.bfAktifCalmaButonu = null;

        } catch (e) {
            console.log("Önceki ses durdurulurken hata: " + e.message);
        }
    }

    try {
        if (!window.bfSesAyarlaniyor && window.soundManager?.sounds?.['PlayCtrl']) {
            window.bfSesAyarlaniyor = true;
            window.bfOrijinalSesSeviyesi = window.currentRadyoSesSeviyesi || (window.soundManager.sounds['PlayCtrl'] ? window.soundManager.sounds['PlayCtrl'].volume : 50);
            window.bfRadyoSesAyarla(5);

        }
    } catch (e) {
        console.log("Radyo ses seviyesi ayarlanırken hata: " + e.message);
        window.bfSesAyarlaniyor = false;
        window.resetRadyoSesSeviyesi();
        return;
    }

    try {
        window.bfMevcutSes = new Audio(soundUrl);
        window.bfMevcutSes.play().then(() => {
            console.log(`"${soundName}" sesi oynatiliyor!`);
        }).catch((error) => {
            console.log("Ses oynatma hatasi: " + error.message);
            window.bfMevcutSes = null;
            window.bfAktifCalmaButonu = null;
            window.resetRadyoSesSeviyesi();
        });

        window.bfMevcutSes.onended = function() {
            window.bfMevcutSes = null;
            window.bfAktifCalmaButonu = null;
            window.resetRadyoSesSeviyesi();

        };
        context.lines.appendChild(window.bfMevcutSes);
    } catch (e) {
        window.resetRadyoSesSeviyesi();
    }
};

jQuery( document ).ready(function( $ ) {
$('#scgonder').click(function () {
printsure = 0;	
setTimeout(function(){   
printsure = 1;
}, 150000);
eskinick = actgetx.nickname;
if (eskinick == null) {
eskinick = "undefined";
}
var kimid = document.getElementById("kime");
var kime = kimid.options[kimid.selectedIndex].value;
var sikmesaj = document.getElementById("sikmesaj").value;	
document.getElementById("kime").style.display = "none";
document.getElementById("saksak").style.display = "block";	
document.getElementById("printsc").style.display = "none";	
document.getElementById("scgonder").style.display = "none";
document.getElementById("scvazgec").style.display = "none";
$.ajax(
        {
            type: "POST",
            url: 'https://irc.geveze.org/screen/yolla.php',
            data: {resurl,eskinick,sikmesaj,kime},
            success: function (data)
                    {
if (kime == "admin") {	
new Audio('https://irc.geveze.org/screen/pscokey.mp3').play()	
actgetx.en().hn("Ekran Görüntünüz Üst Yönetime Gönderildi");
} else if (kime == "Master") {	
new Audio('https://irc.geveze.org/screen/pscokey.mp3').play()		
actgetx.en().hn("Ekran Görüntünüz Sunucu Sahibi [Master'e] Gönderildi");
} else {	
new Audio('https://irc.geveze.org/screen/pscokey.mp3').play()				
actgetx.en().hn("Ekran Görüntünüz "+kime+" Nickine Gönderildi");
}
                    },
        }
       )
});   
$('#scvazgec').click(function () {
new Audio('https://irc.geveze.org/screen/psciptal.mp3').play()		
document.getElementById("kime").style.display = "none";	
document.getElementById("saksak").style.display = "block";	
document.getElementById("printsc").style.display = "none";	
document.getElementById("scgonder").style.display = "none";
document.getElementById("scvazgec").style.display = "none";
actgetx.en().hn("Ekran Görüntüsü Gönderme Iptal Edildi!")
});
});

function fmkontrol() {
    const radyoSesi = soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl'];
	///console.log(radyoSesi);
    return radyoSesi && radyoSesi.playState === 1 && !radyoSesi.paused;
}

var t8 = "\x00",
    fE = "\x01",
    Sc = "\x02",
    tf = "\x03",
    OWN = "\x04",
    oxa = "\x05",
    oXi = "\x06",
    OxI = "\x07",
    Oxp = "\x08",
    oYb = "\x09",
    Vo = "\x0a",
    oyJ = "\x0b",
    OyS = "\x0c",
    VO = "\x0d",
    OZ3 = "\x0e",
    Te = "\x0f",
    OzU = "\x10",
    p_$ = "\x11",
    P_h = "\x12",
    P$1 = "\x13",
    p$k = "\x14",
    p$U = "\x15",
    p$Z = "\x16",
    p0S = "\x17",
    P2X = "\x18",
    p3a = "\x19",
    P3d = "\x1a",
    P3n = "\x1b",
    p3o = "\x1c",
    te = "\x1d",
    p6I = "\x1e",
    Td = "\x1f",
    $2 = "\x20",
    FX = "\x21",
    nKv = "\x22",
    f9 = "\x23",
    U6 = "\x24",
    p9F = "\x25",
    bb9 = "\x26",
    P9Y = "\x27",
    U3 = "\x28",
    B2 = "\x29",
    Fc = "\x2a",
    g0 = "\x2b",
    aw = "\x2c",
    _O = "\x2e",
    H0 = "\x2f",
    Q6 = "\x30",
    PBM = "\x31",
    pc$ = "\x32",
    pC5 = "\x33",
    PcI = "\x34",
    Pck = "\x35",
    pcU = "\x36",
    PcY = "\x37",
    pCZ = "\x38",
    q7 = "\x39",
    vD = "\x3a",
    PDh = "\x3b",
    pdm = "\x3c",
    VL = "\x3d",
    pDq = "\x3e",
    $_1 = "\x3f",
    q3 = "\x41",
    dV = "\x43",
    uc = "\x4e",
    $XFR = "\x58",
    ucW = "\x5e",
    fe = "\x5f",
    PKG = "\x60",
    Q2 = "\x61",
    Pdy = "\x62",
    C6 = "\x63",
    PeY = "\x64",
    PEY = "\x65",
    pf8 = "\x66",
    pFH = "\x67",
    Io = "\x68",
    uh = "\x69",
    PGz = "\x6a",
    pHA = "\x6b",
    phD = "\x6c",
    c6 = "\x6d",
    gx = "\x6e",
    Phl = "\x6f",
    PHn = "\x70",
    AV = "\x71",
    C5 = "\x72",
    _Fk = "\x73",
    GY = "\x74",
    PIJ = "\x75",
    PIs = "\x76",
    PIu = "\x77",
    PiX = "\x78",
    pIZ = "\x79",
    pJ3 = "\x7a",
    pJ9 = "\x7c",
    pJN = "\x7e",
    ptb = "\x7f",
    ptm = "\x80",
    pU3 = "\x81",
    puI = "\x82",
    pUY = "\x83",
    PVb = "\x84",
    PvL = "\x85",
    PVm = "\x86",
    PVP = "\x87",
    Pvu = "\x88",
    PVV = "\x89",
    pw_ = "\x8a",
    Pw2 = "\x8b",
    pw3 = "\x8c",
    Pwb = "\x8d",
    pwd = "\x8e",
    pWd = "\x8f",
    Pwe = "\x90",
    Pwh = "\x91",
    pwJ = "\x92",
    PX4 = "\x93",
    pXB = "\x94",
    PxX = "\x95",
    pxy = "\x96",
    PY4 = "\x97",
    PYl = "\x98",
    Pyp = "\x99",
    PYv = "\x9a",
    pz$ = "\x9b",
    PZ3 = "\x9c",
    pz6 = "\x9d",
    pZP = "\x9e",
    PZW = "\x9f",
    Q_e = "\xa0",
    Q_E = "\xa1",
    Q_m = "\xa2",
    q_o = "\xa3",
    Q_r = "\xa4",
    q$k = "\xa5",
    q$Q = "\xa6",
    q$T = "\xa7",
    Q$x = "\xa8",
    Q00 = "\xa9",
    q0R = "\xaa",
    q1f = "\xab",
    q1S = "\xac",
    q26 = "\xad",
    q2M = "\xae",
    q3j = "\xaf",
    q3u = "\xb0",
    q45 = "\xb1",
    q4g = "\xb2",
    Q4l = "\xb3",
    Q4V = "\xb4",
    Q5K = "\xb5",
    Q5W = "\xb6",
    q7D = "\xb7",
    q7E = "\xb8",
    q7T = "\xb9",
    Q7T = "\xba",
    Q7Z = "\xbb",
    q8d = "\xbc",
    q8G = "\xbd",
    q8Z = "\xbe",
    q9_ = "\xbf",
    qGN = "\xd7",
    Qih = "\xdf",
    QA1 = "\xe0",
    qAB = "\xe1",
    qAI = "\xe2",
    qb8 = "\xe3",
    QBA = "\xe4",
    QbL = "\xe5",
    qbs = "\xe6",
    qc0 = "\xe7",
    Qc4 = "\xe8",
    QC5 = "\xe9",
    Qc8 = "\xea",
    QcC = "\xeb",
    qCE = "\xec",
    Qci = "\xed",
    qcP = "\xee",
    qcW = "\xef",
    QDK = "\xf0",
    qdl = "\xf1",
    QEn = "\xf2",
    QEt = "\xf3",
    QFi = "\xf4",
    Qfx = "\xf5",
    QgJ = "\xf6",
    Qp4 = "\xf7",
    QgT = "\xf8",
    qgz = "\xf9",
    QH9 = "\xfa",
    QhK = "\xfb",
    qHm = "\xfc",
    qhp = "\xfd",
    qhQ = "\xfe",
    qrc = "\xff",
    xl1 = "\x0d\x0a",
    Ndi = "\x20\x20",
    r9N = "\x20\x2b",
    hw = "\x20\x3a",
    xn6 = "\x24\x28",
    JT = "\x24\x2a",
    WUq = "\x24\x4f",
    WRv = "\x24\x6d",
    yYg = "\x29\x2e",
    kD = "\x2b\x44",
    _fO = "\x2c\x20",
    KD = "\x2d\x44",
    os = "\x2d\x4d",
    _P = "\x2e\x2a",
    sS2 = "\x2f\x2f",
    NLs = "\x2f\x3e",
    ojh = "\x2f\x77",
    f3K = "\x31\x33",
    Vd = "\x3a\x20",
    B9Ry = "\x3b\x7d",
    o$X = "\x3d\x3d",
    sqL = "\x40\x2b",
    NYx = "\x45\x20",
    nyR = "\x49\x20",
    nY6 = "\x4c\x20",
    Nzk = "\x57\x20",
    sV = "\x58\x62",
    sU = "\x58\x63",
    Sw = "\x58\x69",
    sw = "\x58\x75",
    _o = "\x5c\x2e",
    Vkt = "\x61\x6c",
    zAW = "\x62\x72",
    o6I = "\x65\x2f",
    YmK = "\x68\x32",
    S4 = "\x68\x72",
    $T = "\x69\x64",
    Esk = "\x6c\x69",
    VJq = "\x6f\x70",
    sQM = "\x6f\x76",
    B6Jb = "\x70\x78",
    C7 = "\x72\x3d",
    Zty = "\x74\x64",
    ZtQ = "\x74\x72",
    aEK$ = "\x75\x6c",
    QB = "\x75\x70",
    dr = "\x77\x73",
    N1g = "\x7d\x7d",
    X_B = "\x20\x24\x6d",
    Lz = "\x20\x2b\x44",
    lz = "\x20\x2d\x44",
    Fi = "\x20\x3a\x01",
    wum = "\x24\x43\x34",
    c9 = "\x26\x63\x3d",
    c8 = "\x26\x6d\x3d",
    o7v = "\x26\x74\x3d",
    ug = "\x28\x5e\x7c",
    $zr = "\x30\x70\x78",
    S$g = "\x32\x70\x78",
    yN_ = "\x35\x70\x78",
    Ta = "\x39\x30\x30",
    u5r = "\x39\x70\x78",
    OIa = "\x3a\x2f\x2f",
    o_q = "\x3d\x3d\x3d",
    O7b = "\x3f\x72\x3d",
    Nal = "\x41\x70\x72",
    nbu = "\x41\x75\x67",
    oS = "\x43\x4d\x44",
    nD4 = "\x44\x65\x63",
    Tyd = "\x45\x4e\x44",
    N9H = "\x46\x65\x62",
    n7g = "\x46\x72\x69",
    n8U = "\x4a\x61\x6e",
    NbP = "\x4a\x75\x6c",
    nBh = "\x4a\x75\x6e",
    hX = "\x4d\x53\x47",
    na$ = "\x4d\x61\x72",
    nBA = "\x4d\x61\x79",
    N6i = "\x4d\x6f\x6e",
    NCZ = "\x4e\x6f\x76",
    Gz = "\x4f\x55\x52",
    ncO = "\x4f\x63\x74",
    SwO = "\x52\x41\x57",
    oT = "\x53\x41\x59",
    n85 = "\x53\x61\x74",
    nCL = "\x53\x65\x70",
    N6E = "\x53\x75\x6e",
    f03 = "\x54\x61\x62",
    n7A = "\x54\x68\x75",
    n6m = "\x54\x75\x65",
    n6O = "\x57\x65\x64",
    SU = "\x58\x62\x63",
    nFk = "\x5c\x24\x26",
    Xk7 = "\x61\x6c\x6c",
    S$d = "\x64\x69\x76",
    l3 = "\x65\x6e\x64",
    UVQ = "\x66\x61\x20",
    Wkw = "\x68\x73\x62",
    _q2L = "\x68\x75\x65",
    RZV = "\x69\x6d\x67",
    C0b = "\x69\x72\x63",
    CF8 = "\x6b\x65\x79",
    You = "\x70\x72\x65",
    $CBg = "\x71\x75\x69",
    mT = "\x72\x65\x64",
    to = "\x72\x65\x6c",
    Vap = "\x73\x69\x6c",
    iv = "\x73\x77\x66",
    c5hJ = "\x74\x61\x62",
    $Wz = "\x74\x6f\x70",
    b6Z = "\x75\x69\x6f",
    _HEc = "\x75\x72\x6c",
    VJg = "\x76\x65\x72",
    DQ = "\x77\x73\x73",
    UG = "\x7c\x24\x29",
    Az4q = "\x03\x34\x20\x1f",
    sgW = "\x20\x2b\x62\x20",
    vLt = "\x20\x2b\x68\x20",
    VM2 = "\x20\x2d\x68\x20",
    nPO = "\x20\x50\x49\x45",
    Llj = "\x20\x74\x6f\x3a",
    Lq = "\x21\x2a\x40\x2a",
    x57 = "\x2d\x20\x24\x68",
    _0Eo = "\x31\x30\x30\x25",
    s0q = "\x41\x57\x41\x59",
    SF = "\x42\x4f\x44\x59",
    S7u = "\x43\x54\x43\x50",
    TUs = "\x49\x44\x4c\x45",
    J$ = "\x4a\x4f\x49\x4e",
    jA = "\x4b\x49\x43\x4b",
    jc = "\x4d\x4f\x44\x45",
    AgAI = "\x4d\x65\x6e\xfc",
    jj = "\x4e\x49\x43\x4b",
    tuf = "\x4f\x50\x45\x52",
    J5 = "\x50\x41\x52\x54",
    rtp = "\x50\x52\x49\x56",
    jg = "\x51\x55\x49\x54",
    ZwG = "\x53\x61\x76\x65",
    tST = "\x55\x53\x45\x52",
    bDDW = "\x61\x75\x74\x6f",
    KZ = "\x61\x77\x61\x79",
    VBW = "\x62\x6c\x75\x72",
    xvr = "\x62\x6f\x78\x5d",
    rY7 = "\x63\x6d\x64\x5f",
    W8m = "\x63\x73\x73\x2f",
    UDw = "\x64\x61\x72\x6b",
    VL6 = "\x64\x65\x6f\x70",
    QE = "\x64\x6f\x77\x6e",
    YV4 = "\x66\x6f\x72\x6d",
    Vk = "\x68\x65\x61\x64",
    _j = "\x68\x74\x6d\x6c",
    kY = "\x69\x64\x6c\x65",
    VAu = "\x69\x6e\x66\x6f",
    eM = "\x69\x72\x63\x5f",
    C0q = "\x69\x72\x63\x73",
    vht = "\x6b\x69\x63\x6b",
    ZPK = "\x6b\x6e\x6f\x62",
    Qb = "\x6c\x65\x66\x74",
    XeQ = "\x6c\x69\x6e\x6b",
    CXWN = "\x6d\x65\x6e\x75",
    $S = "\x6e\x61\x6d\x65",
    YKI = "\x6e\x69\x63\x6b",
    z8 = "\x6e\x6f\x6e\x65",
    KX = "\x6f\x70\x65\x72",
    zY4 = "\x6f\x70\x74\x31",
    g0X = "\x6f\x7a\x65\x6c",
    NWO = "\x71\x71\x61\x2d",
    dm = "\x72\x65\x63\x76",
    YLy = "\x73\x68\x6f\x77",
    Rh = "\x73\x70\x61\x6e",
    aNW = "\x74\x65\x78\x74",
    $r = "\x74\x79\x70\x65",
    _y7 = "\x75\x69\x6f\x3d",
    KW = "\x75\x73\x65\x72",
    tmk = "\x7a\x6f\x6f\x6d",
    _jf = "\x20\x61\x6e\x64\x20",
    nE5 = "\x20\x67\xfc\x6e\x20",
    aTf = "\x2e\x68\x74\x6d\x6c",
    USi = "\x2e\x6d\x61\x69\x6c",
    SzU = "\x2e\x6e\x61\x6d\x65",
    Ox = "\x2f\x53\x41\x59\x20",
    Ybj = "\x2f\x61\x75\x74\x68",
    Xi4 = "\x2f\x6d\x73\x67\x20",
    Yo1 = "\x30\x2e\x38\x65\x6d",
    s0r = "\x43\x59\x43\x4c\x45",
    _kk = "\x43\x6c\x6f\x73\x65",
    tRS = "\x45\x52\x52\x4f\x52",
    F1B = "\x45\x6e\x74\x65\x72",
    MS = "\x48\x41\x54\x41\x21",
    FA = "\x4a\x4f\x49\x4e\x20",
    S0c = "\x4b\x41\x59\x49\x54",
    Sfp = "\x4b\x49\x43\x4b\x20",
    sGm = "\x4d\x4f\x44\x45\x20",
    Ty1 = "\x4d\x4f\x44\x45\x53",
    rbk = "\x4e\x49\x43\x4b\x20",
    nQC = "\x4e\x6f\x6b\x69\x61",
    sle = "\x50\x41\x52\x54\x20",
    s0m = "\x51\x55\x45\x52\x59",
    LS = "\x54\x41\x4d\x41\x4d",
    sF = "\x54\x49\x54\x4c\x45",
    T80 = "\x54\x4f\x50\x49\x43",
    sui = "\x54\x61\x6d\x61\x6d",
    TIt = "\x55\x4d\x4f\x44\x45",
    tSE = "\x57\x48\x4f\x49\x53",
    YX3 = "\x61\x6c\x74\x65\x72",
    A8SK = "\x61\x72\x61\x6d\x61",
    EX = "\x61\x73\x63\x69\x69",
    A_o = "\x62\x6c\x61\x63\x6b",
    gJQ = "\x62\x6c\x6f\x63\x6b",
    Mmo = "\x63\x6c\x61\x73\x73",
    $h = "\x63\x6c\x69\x63\x6b",
    ir = "\x63\x6c\x6f\x73\x65",
    MOz = "\x63\x6f\x6c\x6f\x72",
    Bd = "\x65\x72\x72\x6f\x72",
    $jxV = "\x66\x59\x61\x7a\x69",
    aJYC = "\x66\x6c\x6f\x61\x74",
    nL = "\x66\x6f\x63\x75\x73",
    Ir = "\x67\x69\x7a\x6c\x69",
    mt = "\x67\x72\x65\x65\x6e",
    DR = "\x69\x54\x72\x75\x65",
    Ap = "\x69\x64\x65\x6e\x74",
    $Q = "\x69\x6e\x70\x75\x74",
    dG9o = "\x69\x72\x63\x75\x69",
    HJX = "\x6b\x65\x79\x75\x70",
    yra = "\x6c\x61\x62\x65\x6c",
    $uI6 = "\x6c\x69\x6e\x65\x73",
    aO = "\x6c\x6f\x67\x3a\x20",
    x0 = "\x6c\x6f\x67\x69\x6e",
    l2 = "\x6d\x6f\x64\x65\x73",
    FMF = "\x6e\x4c\x65\x66\x74",
    $$U = "\x6e\x69\x63\x6b\x3d",
    vGy = "\x71\x75\x65\x72\x79",
    $e = "\x72\x61\x64\x69\x6f",
    Qe = "\x72\x69\x67\x68\x74",
    E_l = "\x73\x63\x61\x6c\x65",
    X0 = "\x73\x74\x79\x6c\x65",
    zTi = "\x74\x61\x62\x6c\x65",
    ZtK = "\x74\x62\x6f\x64\x79",
    aGWb = "\x74\x65\x78\x74\x4b",
    hBf = "\x74\x6f\x70\x69\x63",
    vMB = "\x76\x6f\x69\x63\x65",
    rD = "\x77\x68\x6f\x69\x73",
    G8m = "\x77\x69\x64\x74\x68",
    aG0X = "\x78\x6d\x65\x6e\x75",
    uGf = "\u0130\x50\x54\x41\x4c",
    GK = "\x03\x31\x34\x2c\x31\x20",
    tYw = "\x03\x34\x3d\x3d\x03\x20",
    ax = "\x20\x66\x69\x72\x65\x64",
    N13 = "\x20\x6d\x61\x70\x3d\x7b",
    NeG = "\x20\x73\x61\x61\x74\x20",
    n33 = "\x20\x73\x65\x74\x3d\x7b",
    X01 = "\x24\x6d\x3a\x20\x24\x74",
    HAP = "\x26\x6e\x62\x73\x70\x3b",
    UQ1 = "\x2e\x6e\x4e\x69\x63\x6b",
    uSf = "\x2e\x73\x69\x66\x72\x65",
    THc = "\x2f\x4a\x4f\x49\x4e\x20",
    VIi = "\x2f\x4b\x49\x43\x4b\x20",
    gMl = "\x2f\x50\x41\x52\x54\x20",
    Uoi = "\x2f\x6a\x6f\x69\x6e\x20",
    LY = "\x2f\x6d\x6f\x64\x65\x20",
    UQf = "\x2f\x6e\x69\x63\x6b\x20",
    V0I = "\x2f\x6f\x70\x65\x72\x20",
    YpL = "\x3c\x20\x42\x61\x63\x6b",
    Im = "\x3c\x2f\x64\x69\x76\x3e",
    In = "\x3c\x2f\x72\x6f\x77\x3e",
    ik = "\x3c\x72\x6f\x77\x22\x3e",
    hp = "\x41\x43\x54\x49\x4f\x4e",
    skS = "\x41\x57\x41\x59\x20\x3a",
    O8C = "\x41\x63\x63\x65\x70\x74",
    e0w = "\x42\x69\x6c\x64\x69\x72",
    nT2 = "\x43\x61\x6d\x69\x6e\x6f",
    ZxA = "\x43\x61\x6e\x63\x65\x6c",
    nsR = "\x43\x68\x72\x6f\x6d\x65",
    hHo = "\x47\xf6\x6e\x64\x65\x72",
    s1$ = "\x49\x47\x4e\x4f\x52\x45",
    kC = "\x49\x4e\x56\x49\x54\x45",
    Fa = "\x4a\x4f\x49\x4e\x20\x23",
    Nqq = "\x4d\x6f\x62\x69\x6c\x65",
    i1 = "\x4e\x4f\x54\x49\x43\x45",
    sf = "\x4e\x4f\x54\x49\x46\x59",
    _l4 = "\x4e\x65\x78\x74\x20\x3e",
    rE1 = "\x50\x4f\x4e\x47\x20\x3a",
    F0 = "\x50\x52\x45\x46\x49\x58",
    Nr$ = "\x50\x6f\x63\x6b\x65\x74",
    sKt = "\x51\x55\x49\x54\x20\x3a",
    bD4c = "\x53\x45\x41\x52\x43\x48",
    TtQ = "\x53\x45\x52\x56\x45\x52",
    t_V = "\x53\x49\x47\x4e\x4f\x4e",
    VQq = "\x53\x74\x61\x74\x75\x73",
    iC = "\x54\x4f\x50\x49\x43\x20",
    Y1 = "\x5b\x6e\x61\x6d\x65\x3d",
    UgD = "\x5f\x62\x6c\x61\x6e\x6b",
    iV = "\x61\x6c\x77\x61\x79\x73",
    VPG = "\x62\x69\x6c\x64\x69\x72",
    aR84 = "\x62\x6f\x72\x64\x65\x72",
    BCMX = "\x62\x6f\x74\x74\x6f\x6d",
    bDDE = "\x62\x75\x6c\x6c\x65\x74",
    EAU = "\x62\x75\x74\x74\x6f\x6e",
    s$e = "\x63\x65\x6e\x74\x65\x72",
    ZQl = "\x63\x68\x61\x6e\x67\x65",
    VpI = "\x63\x75\x73\x74\x6f\x6d",
    RJ = "\x64\x65\x62\x75\x67\x2f",
    R2d = "\x64\x69\x72\x65\x63\x74",
    $MzJ = "\x66\x6f\x6e\x74\x2d\x41",
    G75 = "\x68\x65\x69\x67\x68\x74",
    dn = "\x68\x74\x74\x70\x73\x3a",
    _$SQ = "\x69\x66\x72\x61\x6d\x65",
    VNS = "\x69\x67\x6e\x6f\x72\x65",
    raq = "\x69\x6e\x20\x75\x73\x65",
    A5p9 = "\x69\x6e\x70\x75\x74\x78",
    Yoj = "\x69\x74\x61\x6c\x69\x63",
    agqW = "\x6c\x69\x54\x65\x78\x74",
    hj$ = "\x6d\x65\x64\x69\x75\x6d",
    aLS$ = "\x6d\x69\x64\x64\x6c\x65",
    nR_ = "\x6d\x6f\x62\x69\x6c\x65",
    E_c = "\x6d\x6f\x64\x65\x72\x6e",
    FMr = "\x6e\x52\x69\x67\x68\x74",
    eG = "\x6e\x61\x74\x69\x76\x65",
    _6 = "\x6e\x75\x6d\x62\x65\x72",
    dO = "\x70\x61\x72\x73\x65\x64",
    Nri = "\x70\x6f\x63\x6b\x65\x74",
    BTj = "\x70\x72\x6f\x6d\x70\x74",
    rk = "\x71\x77\x68\x6f\x69\x73",
    vM = "\x71\x77\x6d\x73\x67\x3a",
    $e8X = "\x72\x65\x66\x6c\x6f\x77",
    znV = "\x72\x65\x6e\x64\x65\x72",
    bNwj = "\x72\x65\x73\x69\x7a\x65",
    NIT = "\x73\x63\x72\x69\x70\x74",
    hJu = "\x73\x63\x72\x6f\x6c\x6c",
    wFG = "\x73\x65\x6c\x65\x63\x74",
    kX = "\x73\x65\x72\x76\x65\x72",
    $c38 = "\x73\x6f\x75\x6e\x64\x2f",
    _2 = "\x73\x74\x72\x69\x6e\x67",
    AO5 = "\x73\x75\x62\x6d\x69\x74",
    AbBV = "\x74\x61\x62\x62\x61\x72",
    _CoJ = "\x75\x6e\x6c\x6f\x61\x64",
    s3 = "\x75\x70\x64\x61\x74\x65",
    gL = "\x20\x28\x03\x34\x2c\x31\x20",
    NKp = "\x20\x6e\x61\x6d\x65\x3d\x22",
    NFE = "\x20\x73\x61\x6e\x69\x79\x65",
    AogE = "\x26\x23\x38\x36\x38\x30\x3b",
    bi2d = "\x26\x23\x78\x32\x31\x43\x34",
    dZ = "\x26\x69\x64\x65\x6e\x74\x3d",
    WWb = "\x2d\x24\x4e\x2d\x20\x24\x6d",
    XAK = "\x2d\x24\x6e\x2d\x20\x24\x6d",
    Li = "\x2d\x53\x54\x41\x54\x55\x53",
    WAR = "\x2e\x6d\x63\x73\x73\x3f\x3d",
    RD = "\x2f\x51\x55\x45\x52\x59\x20",
    LJD = "\x2f\x54\x4f\x50\x49\x43\x20",
    re = "\x2f\x57\x48\x4f\x49\x53\x20",
    gW4 = "\x2f\x6c\x75\x73\x65\x72\x73",
    ly = "\x3c\x2f\x66\x6f\x72\x6d\x3e",
    tVT = "\x41\x43\x43\x4f\x55\x4e\x54",
    Nl = "\x41\x6e\x64\x72\x6f\x69\x64",
    eyN = "\x41\x72\x72\x6f\x77\x55\x70",
    JS = "\x43\x48\x41\x4e\x4d\x53\x47",
    TrJ = "\x43\x4f\x4e\x4e\x45\x43\x54",
    vU_ = "\x43\x6f\x6e\x6e\x65\x63\x74",
    _q = "\x43\x6f\x6e\x74\x72\x6f\x6c",
    O6e = "\x45\x52\x52\x4f\x52\x3a\x20",
    e55 = "\x45\x6e\x67\x65\x6c\x6c\x65",
    Nsu = "\x46\x69\x72\x65\x66\x6f\x78",
    xBb = "\x48\x49\x4c\x49\x47\x48\x54",
    Ib = "\x49\x47\x4e\x4f\x52\x45\x44",
    fI = "\x4e\x4f\x54\x49\x43\x45\x20",
    h0 = "\x4f\x55\x52\x43\x48\x41\x4e",
    t4B = "\x4f\x55\x52\x4a\x4f\x49\x4e",
    W4U = "\x4f\x70\x74\x69\x6f\x6e\x73",
    JY = "\x50\x52\x49\x56\x4d\x53\x47",
    kP = "\x53\x49\x4c\x45\x4e\x43\x45",
    U_$ = "\x57\x41\x4c\x4c\x4f\x50\x53",
    r91 = "\x57\x41\x54\x43\x48\x20\x2b",
    nKl = "\x5f\x5f\x69\x6e\x70\x75\x74",
    kZ = "\x61\x63\x63\x6f\x75\x6e\x74",
    aj4 = "\x62\x6f\x6f\x6c\x65\x61\x6e",
    ugW = "\x62\x74\x6e\x2d\x72\x65\x64",
    Yhl = "\x63\x68\x61\x6e\x6e\x65\x6c",
    A6 = "\x63\x68\x65\x63\x6b\x65\x64",
    wv = "\x63\x6f\x6e\x66\x69\x72\x6d",
    ek = "\x63\x6f\x6e\x6e\x65\x63\x74",
    vN7 = "\x64\x65\x76\x6f\x69\x63\x65",
    Y6N = "\x64\x69\x73\x70\x6c\x61\x79",
    vNN = "\x65\x6e\x67\x65\x6c\x6c\x65",
    BD = "\x66\x61\x69\x6c\x75\x72\x65",
    $Ufb = "\x66\x6f\x6e\x74\x44\x69\x76",
    UW = "\x67\x72\x61\x6e\x74\x65\x64",
    tn = "\x68\x74\x74\x70\x3a\x2f\x2f",
    RAL = "\x69\x6e\x20\x75\x73\x65\x2e",
    VWh = "\x6b\x65\x79\x64\x6f\x77\x6e",
    sh = "\x6b\x69\x72\x6d\x69\x7a\x69",
    BRkM = "\x6b\x69\x73\x69\x53\x61\x79",
    s5 = "\x6c\x61\x73\x74\x70\x6f\x73",
    aSZc = "\x6d\x65\x73\x61\x6a\x69\x63",
    c9bW = "\x6d\x6f\x75\x73\x65\x75\x70",
    CdO = "\x6e\x65\x65\x64\x6b\x65\x79",
    hla = "\x6e\x69\x63\x6b\x41\x72\x61",
    sXC = "\x6e\x75\x6d\x65\x72\x69\x63",
    rC = "\x6f\x70\x74\x69\x6f\x6e\x73",
    bsEs = "\x6f\x7a\x65\x4c\x75\x73\x74",
    ZS = "\x71\x74\x69\x63\x6b\x65\x74",
    Fb = "\x71\x77\x65\x62\x69\x72\x63",
    O82 = "\x72\x65\x71\x75\x65\x73\x74",
    eY = "\x72\x66\x63\x31\x34\x35\x39",
    hdm = "\x73\x69\x6b\x61\x79\x65\x74",
    $7 = "\x74\x79\x70\x65\x6f\x66\x20",
    BdFJ = "\x75\x6e\x69\x63\x6f\x64\x65",
    O5X = "\x75\x6e\x6b\x6e\x6f\x77\x6e",
    x8c = "\x20\x2a\x20\x24\x6e\x20\x24\x6d",
    Nfd = "\x20\x64\x61\x6b\x69\x6b\x61\x20",
    wR3 = "\x24\x43\x34\x3d\x3d\x24\x4f\x20",
    XQn = "\x2e\x68\x74\x6d\x6c\x3f\x76\x3d",
    e11 = "\x2f\x69\x67\x6e\x6f\x72\x65\x20",
    bD__ = "\x3a\x73\x6d\x69\x6c\x65\x79\x3a",
    Txw = "\x41\x43\x54\x55\x41\x4c\x4c\x59",
    T8p = "\x43\x48\x41\x4e\x43\x54\x43\x50",
    TVl = "\x43\x48\x41\x4e\x4e\x45\x4c\x53",
    _T = "\x45\x6e\x64\x54\x6f\x45\x6e\x64",
    WZ = "\x47\x69\x7a\x6c\x69\x6c\x69\x6b",
    wSe = "\x48\x41\x54\x41\x3a\x20\x24\x6d",
    NPQ = "\x49\x45\x4d\x6f\x62\x69\x6c\x65",
    Nur = "\x4b\x2d\x4d\x65\x6c\x65\x6f\x6e",
    rm = "\x4c\x6f\x67\x20\x6f\x75\x74\x3f",
    alUN = "\x4d\x65\x73\x61\x6a\x6c\x61\x72",
    iU = "\x4d\x65\x73\x73\x61\x67\x65\x73",
    iq = "\x4e\x69\x63\x6b\x53\x65\x72\x76",
    TXl = "\x4f\x50\x45\x52\x4e\x41\x4d\x45",
    UzE = "\x4f\x70\x65\x72\x20\x67\x69\x72",
    T9J = "\x50\x52\x49\x56\x43\x54\x43\x50",
    hL = "\x50\x52\x49\x56\x4d\x53\x47\x20",
    sY4 = "\x50\x6c\x61\x79\x43\x74\x72\x6c",
    aeL = "\x51\x75\x61\x6b\x65\x4e\x65\x74",
    TTc = "\x52\x45\x41\x4c\x4e\x41\x4d\x45",
    QxY = "\x52\x50\x4c\x5f\x41\x57\x41\x59",
    IU = "\x52\x61\x64\x79\x6f\x20\x41\xe7",
    Rt8 = "\x54\x41\x52\x47\x45\x54\x45\x44",
    s1F = "\x55\x4e\x49\x47\x4e\x4f\x52\x45",
    l0 = "\x61\x63\x74\x75\x61\x6c\x6c\x79",
    JZ = "\x61\x75\x74\x6f\x6a\x6f\x69\x6e",
    n5 = "\x62\x74\x6e\x2d\x62\x6c\x75\x65",
    Vbw = "\x62\x74\x6e\x2d\x69\x6e\x66\x6f",
    KY = "\x63\x68\x61\x6e\x6e\x65\x6c\x73",
    Zqq = "\x63\x68\x65\x63\x6b\x62\x6f\x78",
    BG = "\x63\x6f\x6d\x70\x6c\x65\x74\x65",
    gw$ = "\x64\x62\x6c\x63\x6c\x69\x63\x6b",
    Wfw = "\x64\x65\x73\x65\x6c\x65\x63\x74",
    _c0c = "\x64\x6f\x6d\x72\x65\x61\x64\x79",
    rb = "\x65\x6d\x62\x65\x64\x64\x65\x64",
    _h = "\x65\x6d\x6f\x6a\x69\x6f\x6e\x65",
    Vjj = "\x66\x61\x20\x66\x61\x2d\x61\x74",
    AjJ = "\x66\x75\x6e\x63\x74\x69\x6f\x6e",
    ykm = "\x68\x69\x64\x65\x61\x75\x74\x68",
    o0i = "\x69\x72\x63\x63\x6f\x6e\x6e\x58",
    Wy = "\x6b\x75\x6c\x6c\x61\x6e\x69\x6d",
    ef = "\x6c\x6f\x6e\x67\x50\x6f\x6c\x6c",
    $i0R = "\x6e\x69\x63\x6b\x6c\x69\x73\x74",
    Y5 = "\x6e\x69\x63\x6b\x6e\x61\x6d\x65",
    L_ = "\x6f\x70\x65\x72\x6e\x61\x6d\x65",
    Xp = "\x70\x61\x73\x73\x77\x6f\x72\x64",
    _uv = "\x70\x72\x6f\x6d\x70\x74\x3d\x31",
    R5 = "\x71\x77\x65\x62\x69\x72\x63\x2d",
    aQ = "\x72\x65\x61\x6c\x6e\x61\x6d\x65",
    M6B = "\x73\x65\x6c\x65\x63\x74\x65\x64",
    t3z = "\x73\x69\x67\x6e\x65\x64\x4f\x6e",
    N2 = "\x73\x75\x70\x65\x72\x76\x61\x6e",
    $Xkg = "\x74\x61\x62\x63\x6c\x6f\x73\x65",
    XiX = "\x74\x65\x78\x74\x2f\x63\x73\x73",
    kV = "\x74\x6f\x75\x63\x68\x65\x6e\x64",
    VOy = "\x75\x6e\x69\x67\x6e\x6f\x72\x65",
    LU = "\xd6\x7a\x65\x6c\x69\x20\x41\xe7",
    E$M = "\u015e\x69\x6b\x61\x79\x65\x74\x20",
    FkE = "\x26\x23\x31\x32\x38\x33\x31\x36\x3b",
    Fk6 = "\x26\x23\x31\x32\x38\x33\x31\x37\x3b",
    E$ = "\x26\x71\x74\x69\x63\x6b\x65\x74\x3d",
    v_K = "\x2e\x6f\x70\x65\x72\x6e\x69\x63\x6b",
    k0 = "\x2f\x41\x55\x54\x4f\x4a\x4f\x49\x4e",
    vj$ = "\x2f\x4b\x49\x43\x4b\x42\x41\x4e\x20",
    iZ = "\x2f\x55\x4d\x4f\x44\x45\x20\x2b\x78",
    x7x = "\x3c\x24\x40\x24\x6e\x3e\x20\x24\x6d",
    uO = "\x41\x63\x74\x69\x76\x69\x74\x79\x21",
    Ezl = "\x41\x72\x72\x6f\x77\x44\x6f\x77\x6e",
    F_ = "\x43\x48\x41\x4e\x4d\x4f\x44\x45\x53",
    F$ = "\x43\x48\x41\x4e\x54\x59\x50\x45\x53",
    T2K = "\x43\x4f\x4e\x4e\x45\x43\x54\x45\x44",
    T9r = "\x43\x54\x43\x50\x52\x45\x50\x4c\x59",
    Z3V = "\x46\x69\x6e\x69\x73\x68\x65\x64\x21",
    NT5 = "\x49\x63\x65\x77\x65\x61\x73\x65\x6c",
    $mU = "\x4b\x6f\x6e\x71\x75\x65\x72\x6f\x72",
    el = "\x4e\x6f\x20\x65\x72\x72\x6f\x72\x21",
    ukV = "\x4f\x64\x61\x79\x61\x20\x67\x69\x72",
    qW2 = "\x52\x50\x4c\x5f\x54\x4f\x50\x49\x43",
    AIUV = "\x52\x61\x64\x79\x6f\x54\x65\x78\x74",
    zLW = "\x53\x49\x44\x45\x5f\x54\x41\x42\x53",
    Vwc = "\x53\x54\x59\x4c\x45\x5f\x48\x55\x45",
    nvN = "\x53\x65\x61\x4d\x6f\x6e\x6b\x65\x79",
    sEA = "\x55\x4e\x49\x47\x4e\x4f\x52\x45\x44",
    Nwj = "\x57\x69\x6e\x64\x6f\x77\x73\x20\x39",
    UF = "\x5b\x5c\x73\x5c\x2e\x2c\x3b\x3a\x5d",
    w5Q = "\x61\x62\x6f\x75\x74\x70\x61\x6e\x65",
    xOy = "\x61\x75\x74\x68\x67\x61\x74\x65\x5f",
    pt = "\x62\x61\x63\x6b\x73\x70\x61\x63\x65",
    UL = "\x62\x65\x65\x70\x33\x2e\x6d\x70\x33",
    _rd = "\x63\x68\x61\x6e\x6e\x65\x6c\x73\x3d",
    vnS = "\x66\x61\x20\x66\x61\x2d\x62\x61\x6e",
    $OwE = "\x66\x6f\x6e\x74\x2d\x61\x72\x74\x69",
    $Ldz = "\x66\x6f\x6e\x74\x2d\x65\x6b\x73\x69",
    YNp = "\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65",
    Xg0 = "\x68\x65\x61\x64\x20\x6c\x69\x6e\x6b",
    Gx1 = "\x69\x72\x63\x77\x69\x6e\x64\x6f\x77",
    _Qja = "\x6c\x69\x67\x68\x74\x6e\x65\x73\x73",
    eb$ = "\x6d\x6f\x75\x73\x65\x64\x6f\x77\x6e",
    Ee = "\x6e\x61\x74\x69\x76\x65\x4d\x6f\x7a",
    k5 = "\x6e\x73\x20\x3a\x41\x55\x54\x48\x20",
    O8 = "\x71\x77\x65\x62\x69\x72\x63\x20\x76",
    sj = "\x74\x69\x6d\x65\x73\x74\x61\x6d\x70",
    kv = "\x74\x6f\x75\x63\x68\x6d\x6f\x76\x65",
    __ = "\x75\x6e\x64\x65\x66\x69\x6e\x65\x64",
    eD = "\x77\x65\x62\x73\x6f\x63\x6b\x65\x74",
    Ms = "\u0130\x6c\x65\x74\x69\x6c\x64\x69\x21",
    HGk = "\x52\x45\x53\u0130\x4d\x20\xc7\x45\x4b",
    Wz = "\x4b\x75\x6c\x6c\x61\x6e\u0131\x63\u0131",
    epk = "\x03\x31\x32\x54\x6f\x70\x6c\x61\x6d\x02",
    Hl = "\x20\x3a\x01\x41\x43\x54\x49\x4f\x4e\x20",
    E_ = "\x26\x70\x61\x73\x73\x77\x6f\x72\x64\x3d",
    DZ = "\x26\x72\x65\x61\x6c\x6e\x61\x6d\x65\x3d",
    wwB = "\x2d\x24\x4e\x3a\x24\x74\x2d\x20\x24\x6d",
    tnW = "\x2e\x52\x61\x64\x79\x6f\x54\x65\x78\x74",
    v_S = "\x2e\x6f\x70\x65\x72\x73\x69\x66\x72\x65",
    tDu = "\x2f\x49\x44\x45\x4e\x54\x49\x46\x59\x20",
    Le = "\x2f\x53\x49\x4c\x45\x4e\x43\x45\x20\x2b",
    lH = "\x2f\x53\x49\x4c\x45\x4e\x43\x45\x20\x2d",
    T_t = "\x2f\x69\x64\x65\x6e\x74\x69\x66\x79\x20",
    e4O = "\x2f\x75\x6e\x69\x67\x6e\x6f\x72\x65\x20",
    N5 = "\x3f\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x3d",
    NpO = "\x42\x6c\x61\x63\x6b\x42\x65\x72\x72\x79",
    t8N = "\x43\x48\x41\x4e\x41\x43\x54\x49\x4f\x4e",
    jv = "\x43\x48\x41\x4e\x4e\x4f\x54\x49\x43\x45",
    sUn = "\x43\x4f\x4e\x4e\x45\x43\x54\x49\x4e\x47",
    O9O = "\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e",
    TND = "\x44\x49\x53\x43\x4f\x4e\x4e\x45\x43\x54",
    XCh = "\x48\x49\x4c\x49\x47\x48\x54\x45\x4e\x44",
    V6_ = "\x4b\x61\x6e\x61\x6c\x61\x20\x47\x69\x72",
    RM = "\x4c\x6f\x67\x67\x65\x64\x20\x6f\x75\x74",
    NQG = "\x4f\x70\x65\x72\x61\x20\x4d\x69\x6e\x69",
    T92 = "\x50\x52\x49\x56\x41\x43\x54\x49\x4f\x4e",
    K7 = "\x50\x52\x49\x56\x4e\x4f\x54\x49\x43\x45",
    QUj = "\x52\x50\x4c\x5f\x4d\x59\x49\x4e\x46\x4f",
    Qyi = "\x52\x50\x4c\x5f\x4e\x4f\x53\x55\x43\x48",
    R_W = "\x52\x50\x4c\x5f\x55\x4e\x41\x57\x41\x59",
    o9j = "\x55\x73\x65\x72\x2d\x41\x67\x65\x6e\x74",
    X_E = "\x57\x48\x4f\x49\x53\x20\x73\x6f\x6e\x75",
    nq2 = "\x57\x69\x6e\x64\x6f\x77\x73\x20\x43\x45",
    nwd = "\x57\x69\x6e\x64\x6f\x77\x73\x20\x4e\x54",
    BpQ0 = "\x62\x6f\x75\x6e\x64\x70\x61\x6e\x65\x6c",
    WIY = "\x63\x6f\x6c\x6f\x75\x72\x6c\x69\x6e\x65",
    Ek = "\x64\x69\x73\x63\x6f\x6e\x6e\x65\x63\x74",
    VPe = "\x66\x61\x20\x66\x61\x2d\x6c\x69\x73\x74",
    UDE = "\x66\x61\x20\x66\x61\x2d\x6c\x6f\x63\x6b",
    yOj = "\x66\x6f\x6e\x74\x2d\x73\x74\x79\x6c\x65",
    lu = "\x67\x6f\x6f\x67\x6c\x65\x50\x6c\x61\x79",
    zoY = "\x68\x75\x65\x2d\x73\x6c\x69\x64\x65\x72",
    Tn = "\x68\x79\x70\x65\x72\x6c\x69\x6e\x6b\x2d",
    z6d = "\x69\x66\x72\x61\x6d\x65\x74\x65\x78\x74",
    HGx = "\x69\x6d\x61\x67\x65\x2f\x6a\x70\x65\x67",
    sP = "\x69\x6e\x66\x6f\x63\x6f\x6c\x6f\x75\x72",
    viM = "\x6b\x69\x63\x6b\x20\x26\x20\x62\x61\x6e",
    MU2 = "\x6c\x69\x6e\x65\x73\x74\x79\x6c\x65\x31",
    Mua = "\x6c\x69\x6e\x65\x73\x74\x79\x6c\x65\x32",
    yMO = "\x6d\x61\x72\x67\x69\x6e\x2d\x74\x6f\x70",
    aFQ9 = "\x6d\x65\x6e\x75\x62\x75\x74\x74\x6f\x6e",
    AbDR = "\x6d\x6f\x75\x73\x65\x77\x68\x65\x65\x6c",
    $WWz = "\x6f\x7a\x65\x6c\x4e\x69\x63\x6b\x49\x63",
    uP = "\x70\x65\x72\x6d\x69\x73\x73\x69\x6f\x6e",
    nm = "\x70\x6c\x61\x79\x47\x6f\x6f\x67\x6c\x65",
    BlM = "\x72\x61\x6e\x64\x6f\x6d\x6e\x69\x63\x6b",
    bc = "\x72\x65\x74\x72\x79\x20\x66\x6f\x72\x20",
    _Q6$ = "\x73\x61\x74\x75\x72\x61\x74\x69\x6f\x6e",
    bg = "\x73\x65\x6e\x64\x42\x65\x61\x63\x6f\x6e",
    hBF = "\x74\x6f\x70\x69\x63\x47\x69\x7a\x6c\x65",
    Kv = "\x74\x6f\x75\x63\x68\x73\x74\x61\x72\x74",
    Wig = "\x77\x61\x72\x6e\x63\x6f\x6c\x6f\x75\x72",
    HCj = "\x7a\x2d\x69\x6e\x64\x65\x78\x3a\x31\x3b",
    vGB = "\xf6\x7a\x65\x6c\x20\x6d\x65\x73\x61\x6a",
    UQu = "\x4e\x69\x63\x6b\x20\x6b\x61\x79\u0131\x74",
    v_3 = "\x4f\x70\x65\x72\x20\x47\x69\x72\x69\u015f",
    SC = "\x02\x2c\x20\x6e\x69\x63\x6b\x69\x20\x03\x34",
    xm_ = "\x24\x28\x62\x61\x73\x65\x5f\x75\x72\x6c\x29",
    WXt = "\x24\x42\x24\x4e\x24\x42\x20\x5b\x24\x68\x5d",
    wVr = "\x2a\x24\x5b\x24\x74\x24\x5d\x2a\x20\x24\x6d",
    wVL = "\x2d\x24\x7b\x24\x6e\x24\x7d\x2d\x20\x24\x6d",
    mzq = "\x30\x2e\x39\x31\x20\x45\x72\x4b\x61\x4e\x73",
    eX = "\x43\x41\x53\x45\x4d\x41\x50\x50\x49\x4e\x47",
    HGo = "\x45\x6b\x72\x61\x6e\x20\x52\x65\x73\x6d\x69",
    txY = "\x47\x45\x4e\x45\x52\x49\x43\x54\x45\x58\x54",
    uDT = "\x47\x6f\x6f\x67\x6c\x65\x20\x50\x6c\x61\x79",
    ib = "\x49\x47\x4e\x4f\x52\x45\x45\x4d\x50\x54\x59",
    iB = "\x49\x47\x4e\x4f\x52\x45\x45\x4e\x54\x52\x59",
    V6v = "\x4e\x69\x63\x6b\x20\x4b\x61\x79\x64\x65\x74",
    a9Xd = "\x4e\x69\x63\x6b\x20\x61\x72\x61\x2e\x2e\x2e",
    rWG = "\x4f\x55\x52\x54\x41\x52\x47\x45\x54\x45\x44",
    qvu = "\x52\x50\x4c\x5f\x4e\x4f\x54\x4f\x50\x49\x43",
    R$C = "\x52\x50\x4c\x5f\x4e\x4f\x57\x41\x57\x41\x59",
    qtN = "\x52\x50\x4c\x5f\x57\x45\x4c\x43\x4f\x4d\x45",
    Iu = "\x52\x61\x64\x79\x6f\x20\x4b\x61\x70\x61\x74",
    sEo = "\x61\x62\x6f\x75\x74\x57\x69\x6e\x64\x6f\x77",
    aLzn = "\x62\x61\x64\x67\x65\x20\x67\x69\x7a\x6c\x69",
    vu5 = "\x63\x6f\x6e\x6e\x65\x63\x74\x70\x61\x6e\x65",
    ukp = "\x66\x61\x20\x66\x61\x2d\x73\x6c\x61\x63\x6b",
    l1 = "\x67\x65\x6e\x65\x72\x69\x63\x74\x65\x78\x74",
    mv = "\x68\x69\x64\x65\x4c\x6f\x61\x64\x69\x6e\x67",
    $H = "\x69\x6e\x70\x75\x74\x5b\x6e\x61\x6d\x65\x3d",
    STP = "\x69\x70\x74\x61\x6c\x7c\x31\x35\x30\x30\x30",
    VBh = "\x69\x70\x74\x61\x6c\x7c\x33\x30\x30\x30\x30",
    n4 = "\x69\x70\x74\x61\x6c\x7c\x36\x30\x30\x30\x30",
    Yvq = "\x6c\x6f\x6f\x6b\x61\x6e\x64\x66\x65\x65\x6c",
    W5a = "\x6f\x70\x74\x69\x6f\x6e\x73\x70\x61\x6e\x65",
    $Ebp = "\x6f\x75\x74\x65\x72\x74\x61\x62\x62\x61\x72",
    $wWw = "\x6f\x7a\x65\x4c\x75\x73\x74\x4e\x69\x63\x6b",
    $Dzy = "\x71\x77\x65\x62\x69\x72\x63\x2d\x71\x75\x69",
    Mt = "\x73\x68\x6f\x77\x4c\x6f\x61\x64\x69\x6e\x67",
    AgbF = "\x74\x65\x78\x74\x2d\x73\x68\x61\x64\x6f\x77",
    aj_p = "\x74\x65\x78\x74\x4b\x20\x79\x65\x73\x69\x6c",
    AL7n = "\x78\x6d\x65\x6e\x75\x20\x6d\x65\x73\x61\x6a",
    lv = "\xd6\x7a\x65\x6c\x69\x20\x6b\x61\x70\x61\x74",
    XUp = "\x20\x53\xf6\x7a\x6c\x65\u015f\x6d\x65\x73\x69",
    AjEU = "\x44\x69\u011f\x65\x72\x20\x53\xfc\x72\xfc\x6d",
    wWG = "\x20\x2a\x20\x24\x28\x24\x4e\x24\x29\x20\x24\x6d",
    wwC = "\x20\x2a\x20\x24\x55\x24\x4e\x24\x4f\x20\x24\x6d",
    _J = "\x26\x6e\x62\x73\x70\x3b\x26\x6e\x62\x73\x70\x3b",
    TzC = "\x47\x45\x4e\x45\x52\x49\x43\x45\x52\x52\x4f\x52",
    IB = "\x49\x47\x4e\x4f\x52\x45\x48\x45\x41\x44\x45\x52",
    ZHp = "\x4c\x41\x53\x54\x50\x4f\x53\x5f\x4c\x49\x4e\x45",
    ziA = "\x4e\x49\x43\x4b\x5f\x43\x4f\x4c\x4f\x55\x52\x53",
    Nph = "\x4e\x69\x6e\x74\x65\x6e\x64\x6f\x20\x57\x69\x69",
    uV = "\x4e\x6f\x74\x69\x66\x69\x63\x61\x74\x69\x6f\x6e",
    quq = "\x52\x50\x4c\x5f\x49\x53\x55\x50\x50\x4f\x52\x54",
    qvE = "\x52\x50\x4c\x5f\x4e\x41\x4d\x52\x45\x50\x4c\x59",
    k7 = "\x53\x45\x52\x56\x45\x52\x4e\x4f\x54\x49\x43\x45",
    ySD = "\x53\x65\x74\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73",
    Z0K = "\x53\x65\x74\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65",
    Y2 = "\x5b\x6e\x61\x6d\x65\x3d\x6c\x6f\x67\x69\x6e\x5d",
    Znw = "\x61\x70\x70\x6c\x79\x43\x68\x61\x6e\x67\x65\x73",
    Ykk = "\x61\x75\x74\x68\x72\x65\x71\x75\x69\x72\x65\x64",
    OaN = "\x63\x61\x6c\x6c\x65\x64\x20\x73\x65\x6e\x64\x28",
    bONc = "\x64\x79\x6e\x61\x6d\x69\x63\x70\x61\x6e\x65\x6c",
    VO0 = "\x65\x6e\x67\x65\x6c\x20\x6b\x61\x6c\x64\x69\x72",
    xFi = "\x69\x6d\x61\x67\x65\x2f\x78\x2d\x69\x63\x6f\x6e",
    B5bh = "\x69\x6e\x6c\x69\x6e\x65\x2d\x62\x6c\x6f\x63\x6b",
    ait$ = "\x6a\x61\x76\x61\x73\x63\x72\x69\x70\x74\x3a\x3b",
    Xw = "\x6c\x6f\x67\x69\x6e\x63\x6f\x6e\x6e\x65\x63\x74",
    Bewo = "\x6d\x6f\x62\x69\x6c\x65\x2d\x69\x6e\x70\x75\x74",
    _M0 = "\x72\x61\x6e\x64\x6f\x6d\x6e\x69\x63\x6b\x3d\x31",
    dAOt = "\x74\x61\x62\x2d\x73\x65\x6c\x65\x63\x74\x65\x64",
    AW = "\x74\x69\x6d\x65\x6f\x75\x74\x20\x66\x6f\x72\x20",
    e2o = "\x45\x6e\x67\x65\x6c\x20\x4b\x61\x6c\x64\u0131\x72",
    bcHe = "\x4d\x65\x73\x61\x6a\u0131\x6e\u0131\x7a\x2e\x2e\x2e",
    JU = "\x03\x30\x2c\x34\x44\x55\x59\x55\x52\x55\x3a\x03\x20",
    ojz = "\x28\x6e\x6f\x77\x44\x69\x73\x61\x62\x6c\x65\x64\x29",
    z9k = "\x3c\x69\x66\x72\x61\x6d\x65\x20\x73\x72\x63\x3d\x22",
    nlD = "\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22",
    W5j = "\x41\x62\x6f\x75\x74\x20\x71\x77\x65\x62\x69\x72\x63",
    u_e = "\x43\x48\x41\x4e\x4e\x45\x4c\x4d\x4f\x44\x45\x49\x53",
    aspX = "\x48\x65\x70\x73\x69\x6e\x69\x20\x4b\x61\x70\x61\x74",
    ZF5 = "\x4e\x4f\x54\x49\x46\x49\x43\x41\x54\x49\x4f\x4e\x53",
    qX$ = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x49\x44\x4c\x45",
    qWd = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x55\x53\x45\x52",
    zJy = "\x53\x48\x4f\x57\x5f\x4e\x49\x43\x4b\x4c\x49\x53\x54",
    X1S = "\x57\x41\x4c\x4c\x4f\x50\x20\x24\x6e\x3a\x20\x24\x74",
    XTD = "\x5b\x69\x64\x3d\x67\x69\x7a\x6c\x69\x6c\x69\x6b\x5d",
    XtE = "\x5b\x69\x64\x3d\x6b\x75\x6c\x6c\x61\x6e\x69\x6d\x5d",
    C_ = "\x63\x6f\x6d\x70\x6c\x65\x74\x65\x20\x66\x6f\x72\x20",
    ddl = "\x63\x6f\x6e\x66\x69\x67\x75\x72\x61\x74\x69\x6f\x6e",
    Vp_ = "\x65\x6e\x67\x65\x6c\x20\x6c\x69\x73\x74\x65\x73\x69",
    N1 = "\x66\x61\x20\x66\x61\x2d\x66\x72\x6f\x77\x6e\x2d\x6f",
    vLk = "\x66\x61\x20\x66\x61\x2d\x70\x65\x72\x63\x65\x6e\x74",
    uoS = "\x66\x61\x20\x66\x61\x2d\x72\x65\x66\x72\x65\x73\x68",
    UqU = "\x66\x61\x20\x66\x61\x2d\x73\x69\x67\x6e\x2d\x69\x6e",
    $VOn = "\x6b\x69\x73\x69\x53\x61\x79\x20\x67\x69\x7a\x6c\x69",
    yMy = "\x6d\x61\x72\x67\x69\x6e\x2d\x62\x6f\x74\x74\x6f\x6d",
    hlh = "\x6e\x69\x63\x6b\x4c\x69\x73\x74\x47\x69\x7a\x6c\x65",
    sED = "\x6f\x70\x74\x69\x6f\x6e\x73\x57\x69\x6e\x64\x6f\x77",
    zSH = "\x6f\x70\x74\x69\x6f\x6e\x73\x5f\x72\x61\x64\x69\x6f",
    $UZh = "\x6f\x7a\x65\x4c\x75\x73\x74\x20\x67\x69\x7a\x6c\x69",
    Kb = "\x73\x65\x72\x76\x69\x63\x65\x49\x6e\x76\x69\x74\x65",
    uM = "\x73\x68\x6f\x72\x74\x63\x75\x74\x20\x69\x63\x6f\x6e",
    n2p = "\x7b\x51\x53\x65\x74\x20\x6c\x65\x6e\x67\x74\x68\x3d",
    Sze = "\x4b\x61\x79\u0131\x74\x6c\u0131\x20\x4e\x69\x63\x6b\x21",
    v6U = "\x4e\x69\x63\x6b\x20\x44\x65\u011f\x69\u015f\x74\x69\x72",
    up7 = "\x4e\x69\x63\x6b\x20\x64\x65\u011f\x69\u015f\x74\x69\x72",
    X_C = "\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3a\x20\x24\x6d",
    wZe = "\x20\x61\x77\x61\x79\x20\x20\x20\x20\x20\x3a\x20\x24\x6d",
    wxu = "\x20\x67\x65\x72\xe7\x65\x6b\x20\x61\x64\x3a\x20\x24\x6d",
    wY4 = "\x20\x6b\x61\x6e\x61\x6c\x6c\x61\x72\x20\x3a\x20\x24\x6d",
    x$A = "\x24\x4e\x20\x69\x73\x20\x61\x77\x61\x79\x3a\x20\x24\x6d",
    X6C = "\x24\x68\x20\x73\x75\x73\x74\x75\x72\x75\x6c\x64\x75\x21",
    Mef = "\x28\x6e\x6f\x20\x74\x6f\x70\x69\x63\x20\x73\x65\x74\x29",
    rn = "\x2f\x61\x75\x74\x68\x3f\x6c\x6f\x67\x6f\x75\x74\x3d\x31",
    _7To = "\x2f\x6d\x73\x67\x20\x51\x20\x77\x68\x6f\x69\x73\x20\x23",
    X4N = "\x45\x6e\x67\x65\x6c\x20\x4c\x69\x73\x74\x65\x73\x69\x3a",
    tzx = "\x47\x45\x4e\x45\x52\x49\x43\x4d\x45\x53\x53\x41\x47\x45",
    ZII = "\x48\x49\x44\x45\x5f\x4a\x4f\x49\x4e\x50\x41\x52\x54\x53",
    o4c = "\x49\x52\x43\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20",
    zgz = "\x4e\x49\x43\x4b\x5f\x4f\x56\x5f\x53\x54\x41\x54\x55\x53",
    Mzs = "\x4e\x6f\x74\x20\x61\x20\x73\x74\x72\x69\x6e\x67\x3a\x20",
    wCR = "\x4e\x6f\x74\x20\x6c\x6f\x67\x67\x65\x64\x20\x69\x6e\x21",
    qvO = "\x52\x50\x4c\x5f\x45\x4e\x44\x4f\x46\x4e\x41\x4d\x45\x53",
    qx8 = "\x52\x50\x4c\x5f\x45\x4e\x44\x4f\x46\x57\x48\x4f\x49\x53",
    ZMy = "\x55\x53\x45\x5f\x48\x49\x44\x44\x45\x4e\x48\x4f\x53\x54",
    Y24 = "\x5b\x6e\x61\x6d\x65\x3d\x63\x6f\x6e\x6e\x65\x63\x74\x5d",
    $f = "\x64\x65\x66\x61\x75\x6c\x74\x43\x68\x65\x63\x6b\x65\x64",
    DCz = "\x64\x79\x6e\x61\x6d\x69\x63\x42\x61\x73\x65\x55\x52\x4c",
    SeI = "\x65\x6d\x62\x65\x64\x64\x65\x64\x57\x69\x6e\x64\x6f\x77",
    W4T = "\x65\x6d\x62\x65\x64\x64\x65\x64\x77\x69\x7a\x61\x72\x64",
    rZK = "\x69\x6d\x61\x67\x65\x73\x2f\x65\x67\x67\x2e\x6a\x70\x67",
    zT = "\x71\x74\x69\x63\x6b\x65\x74\x5f\x65\x78\x70\x69\x72\x79",
    sMN = "\x72\x65\x6a\x6f\x69\x6e\x69\x6e\x67\x2e\x20\x2e\x20\x2e",
    MWa = "\x74\x61\x62\x2d\x68\x69\x6c\x69\x67\x68\x74\x2d\x75\x73",
    DAlN = "\x74\x61\x62\x2d\x75\x6e\x73\x65\x6c\x65\x63\x74\x65\x64",
    ru = "\x74\x72\x61\x6e\x73\x66\x6f\x72\x6d\x5f\x61\x74\x74\x72",
    AlAT = "\x76\x65\x72\x74\x69\x63\x61\x6c\x2d\x61\x6c\x69\x67\x6e",
    Yov = "\x77\x69\x7a\x61\x72\x64\x63\x6f\x6e\x74\x72\x6f\x6c\x73",
    n0_ = "\x7b\x51\x48\x61\x73\x68\x20\x6c\x65\x6e\x67\x74\x68\x3d",
    WZV = "\x20\x6f\x70\x65\x72\x20\x61\x64\u0131\x20\x3a\x20\x24\x6d",
    n2 = "\x53\xfc\x72\xfc\x6d\x20\x44\x65\u011f\x69\u015f\x74\x69\x72",
    VAc = "\x20\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x2f\x64\x69\x76\x3e",
    YSu = "\x23\x72\x6f\x67\x75\x65\x2c\x23\x65\x75\x2d\x6d\x61\x67\x65",
    Ay = "\x28\x75\x6e\x6b\x6e\x6f\x77\x6e\x20\x65\x72\x72\x6f\x72\x29",
    s_Q = "\x31\x70\x78\x20\x73\x6f\x6c\x69\x64\x20\x62\x6c\x61\x63\x6b",
    Dzs = "\x3c\x2f\x73\x70\x61\x6e\x3e\x20\x73\x61\x6e\x69\x79\x65\x2e",
    o8q = "\x41\x63\x63\x65\x70\x74\x2d\x4c\x61\x6e\x67\x75\x61\x67\x65",
    Zer = "\x42\x45\x45\x50\x5f\x4f\x4e\x5f\x4d\x45\x4e\x54\x49\x4f\x4e",
    Qx7 = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x53\x45\x43\x55\x52\x45",
    QwP = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x53\x45\x52\x56\x45\x52",
    qXx = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x57\x45\x42\x49\x52\x43",
    zKK = "\x53\x48\x4f\x57\x5f\x54\x49\x4d\x45\x53\x54\x41\x4d\x50\x53",
    ZkO = "\x53\x68\x6f\x77\x20\x74\x69\x6d\x65\x73\x74\x61\x6d\x70\x73",
    y6 = "\x5b\x6e\x61\x6d\x65\x3d\x61\x75\x74\x68\x6e\x61\x6d\x65\x5d",
    XxP = "\x5b\x6e\x61\x6d\x65\x3d\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x5d",
    AEzB = "\x68\x6f\x72\x69\x7a\x6f\x6e\x74\x61\x6c\x20\x67\x72\x61\x79",
    u1f = "\x69\x6d\x61\x67\x65\x3f\x66\x69\x6c\x65\x6e\x61\x6d\x65\x3d",
    AC4K = "\x6d\x61\x78\x2d\x77\x69\x64\x74\x68\x3a\x20\x35\x30\x25\x3b",
    F7 = "\x6f\x74\x6f\x4a\x6f\x69\x6e\x6b\x61\x6e\x61\x6c\x6c\x61\x72",
    $h8m = "\x6f\x75\x74\x65\x72\x74\x61\x62\x62\x61\x72\x5f\x74\x6f\x70",
    $sPj = "\x70\x78\x20\x21\x69\x6d\x70\x6f\x72\x74\x61\x6e\x74\x3b\x7d",
    m$M = "\x73\x65\x6c\x65\x63\x74\x65\x64\x2d\x6d\x69\x64\x64\x6c\x65",
    njj = "\x74\x65\x78\x74\x2f\x6a\x61\x76\x61\x73\x63\x72\x69\x70\x74",
    rU = "\x74\x72\x61\x6e\x73\x66\x6f\x72\x6d\x5f\x76\x61\x6c\x75\x65",
    OKT = "\x77\x65\x62\x73\x6f\x63\x6b\x65\x74\x20\x65\x72\x72\x6f\x72",
    WRm = "\x47\x69\x72\x69\u015f\x20\x79\x61\x70\u0131\x6c\x64\u0131\x21",
    Wwf = "\x20\x2a\x20\x24\x7b\x24\x28\x24\x4e\x24\x29\x24\x7d\x20\x24\x6d",
    va8 = "\x22\x3e\x3c\x73\x70\x61\x6e\x3e\x3c\x2f\x73\x70\x61\x6e\x3e\x20",
    O0H = "\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x61\x62\x63\x64\x65\x66",
    hA = "\x41\x42\x43\x44\x45\x46\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39",
    zF_ = "\x42\x65\x65\x70\x20\x6f\x6e\x20\x61\x63\x74\x69\x76\x69\x74\x79",
    LL0 = "\x43\x68\x61\x6e\x67\x65\x20\x74\x6f\x70\x69\x63\x20\x6f\x66\x20",
    zFI = "\x46\x4c\x41\x53\x48\x5f\x4f\x4e\x5f\x4d\x45\x4e\x54\x49\x4f\x4e",
    x7m = "\x4d\x65\x6e\x74\x69\x6f\x6e\x65\x64\x20\x6f\x6e\x20\x24\x63\x3a",
    R0j = "\x52\x50\x4c\x5f\x43\x52\x45\x41\x54\x49\x4f\x4e\x54\x49\x4d\x45",
    qwd = "\x52\x50\x4c\x5f\x54\x4f\x50\x49\x43\x57\x48\x4f\x54\x49\x4d\x45",
    QxE = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x41\x43\x43\x4f\x55\x4e\x54",
    vl = "\x58\x2d\x52\x65\x71\x75\x65\x73\x74\x65\x64\x2d\x57\x69\x74\x68",
    XF = "\x5b\x63\x6c\x61\x73\x73\x3d\x62\x61\x72\x2d\x6c\x6f\x67\x6f\x5d",
    WXG = "\x5b\x63\x74\x63\x70\x28\x24\x74\x29\x5d\x20\x24\x78\x20\x24\x6d",
    ZN = "\x5b\x6e\x61\x6d\x65\x3d\x6c\x6f\x67\x67\x69\x6e\x67\x69\x6e\x5d",
    A_H = "\x62\x61\x63\x6b\x67\x72\x6f\x75\x6e\x64\x2d\x63\x6f\x6c\x6f\x72",
    x1 = "\x62\x61\x63\x6b\x67\x72\x6f\x75\x6e\x64\x3a\x20\x75\x72\x6c\x28",
    ha = "\x65\x64\x30\x63\x64\x30\x65\x64\x31\x61\x32\x64\x36\x33\x65\x32",
    VGW = "\x66\x61\x20\x66\x61\x2d\x63\x6f\x6d\x6d\x65\x6e\x74\x73\x2d\x6f",
    XQY = "\x6a\x63\x6f\x6e\x66\x69\x72\x6d\x2d\x63\x6f\x6e\x74\x65\x6e\x74",
    eI = "\x6c\x6f\x6e\x67\x50\x6f\x6c\x6c\x28\x66\x6f\x72\x63\x65\x64\x29",
    $hBn = "\x6f\x75\x74\x65\x72\x74\x61\x62\x62\x61\x72\x5f\x6c\x65\x66\x74",
    zyx = "\x70\x61\x6e\x65\x73\x2f\x61\x62\x6f\x75\x74\x2e\x68\x74\x6d\x6c",
    zt = "\x71\x74\x69\x63\x6b\x65\x74\x5f\x75\x73\x65\x72\x6e\x61\x6d\x65",
    UC = "\x71\x77\x65\x62\x69\x72\x63\x3a\x2f\x2f\x77\x68\x6f\x69\x73\x2f",
    ORl = "\x73\x65\x72\x76\x65\x72\x20\x73\x75\x70\x70\x6f\x72\x74\x73\x20",
    mU = "\x73\x65\x74\x43\x6f\x6e\x74\x65\x6e\x74\x41\x70\x70\x65\x6e\x64",
    IH = "\x75\x73\x65\x72\x4c\x69\x73\x74\x41\x6c\x74\x61\x45\x6b\x6c\x65",
    oLh = "\x77\x65\x62\x73\x6f\x63\x6b\x65\x74\x20\x63\x6c\x6f\x73\x65\x64",
    V5q = "\xd6\x7a\x65\x6c\x69\x6d\x69\x20\x61\xe7\x2f\x6b\x61\x70\x61\x74",
    _cTg = "\x2f\x51\x55\x49\x54\x20\x50\x61\x67\x65\x20\x63\x6c\x6f\x73\x65\x64",
    WUz = "\x3c\x24\x7b\x24\x40\x24\x28\x24\x4e\x24\x29\x24\x7d\x3e\x20\x24\x6d",
    QtY = "\x45\x52\x52\x5f\x4e\x49\x43\x4b\x4e\x41\x4d\x45\x49\x4e\x55\x53\x45",
    Ar = "\x49\x66\x2d\x4d\x6f\x64\x69\x66\x69\x65\x64\x2d\x53\x69\x6e\x63\x65",
    r0H = "\x52\x50\x4c\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x4d\x4f\x44\x45\x49\x53",
    QXg = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x41\x43\x54\x55\x41\x4c\x4c\x59",
    QXd = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x43\x48\x41\x4e\x4e\x45\x4c\x53",
    qWr = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x4f\x50\x45\x52\x41\x54\x4f\x52",
    QXj = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x4f\x50\x45\x52\x4e\x41\x4d\x45",
    AbN$ = "\x64\x72\x6f\x70\x64\x6f\x77\x6e\x6d\x65\x6e\x75\x20\x6d\x65\x6e\x75",
    VM9 = "\x66\x61\x20\x66\x61\x2d\x70\x6c\x75\x73\x2d\x63\x69\x72\x63\x6c\x65",
    VhE = "\x66\x61\x20\x66\x61\x2d\x75\x73\x65\x72\x2d\x63\x69\x72\x63\x6c\x65",
    UZD = "\x66\x61\x20\x66\x61\x2d\x75\x73\x65\x72\x2d\x73\x65\x63\x72\x65\x74",
    ms = "\x66\x61\x2d\x63\x68\x65\x63\x6b\x2d\x73\x71\x75\x61\x72\x65\x2d\x6f",
    Wl8 = "\x68\x79\x70\x65\x72\x6c\x69\x6e\x6b\x2d\x63\x68\x61\x6e\x6e\x65\x6c",
    AqHQ = "\x6d\x65\x73\x61\x6a\x6c\x61\x72\x69\x6d\x69\x7a\x20\x6d\x65\x6e\x75",
    T_0 = "\x73\x69\x66\x72\x65\x20\x62\x6f\x73\x20\x6f\x6c\x61\x6d\x61\x7a\x2e",
    ST9 = "\x42\x61\u011f\x6c\x61\x6e\x74\u0131\x20\x48\x61\x74\x61\x73\u0131\x21",
    v7n = "\x41\x64\x6d\x69\x6e\x20\u015e\x69\x66\x72\x65\x73\x69\x20\x47\x69\x72",
    vbz = "\x53\x65\xe7\x69\x6d\x20\x79\x61\x70\x6d\x61\x64\u0131\x6e\u0131\x7a\x2e",
    wzn = "\x20\x6f\x70\x65\x72\x20\x20\x20\x20\x20\x3a\x20\x24\x42\x24\x6d\x24\x42",
    WVJ = "\x2d\x24\x7b\x24\x28\x24\x4e\x24\x29\x24\x7d\x3a\x24\x63\x2d\x20\x24\x6d",
    qu3 = "\x45\x52\x52\x5f\x4e\x49\x43\x4b\x4e\x41\x4d\x45\x49\x4e\x55\x53\x45\x32",
    ei = "\x46\x4f\x52\x43\x45\x5f\x4c\x4f\x4e\x47\x50\x4f\x4c\x4c\x20\x73\x65\x74",
    AopJ = "\x4d\x65\x73\x61\x6a\x69\x47\x6f\x73\x74\x65\x72\x20\x67\x69\x7a\x6c\x69",
    mo = "\x4e\x69\x63\x6b\x53\x65\x72\x76\x20\x52\x45\x47\x49\x53\x54\x45\x52\x20",
    EF = "\x57\x65\x62\x53\x6f\x63\x6b\x65\x74\x20\x64\x65\x74\x65\x63\x74\x65\x64",
    xus = "\x5b\x6e\x61\x6d\x65\x3d\x63\x6f\x6e\x6e\x65\x63\x74\x72\x6f\x6f\x74\x5d",
    y$ = "\x5b\x6e\x61\x6d\x65\x3d\x6c\x6f\x67\x69\x6e\x62\x75\x74\x74\x6f\x6e\x5d",
    xD = "\x5b\x6e\x61\x6d\x65\x3d\x6c\x6f\x67\x69\x6e\x68\x65\x61\x64\x65\x72\x5d",
    y7 = "\x5b\x6e\x61\x6d\x65\x3d\x6c\x6f\x67\x69\x6e\x73\x74\x61\x74\x75\x73\x5d",
    xY1 = "\x5b\x6e\x61\x6d\x65\x3d\x6e\x65\x74\x77\x6f\x72\x6b\x6e\x61\x6d\x65\x5d",
    _$aa = "\x64\x69\x76\x5b\x63\x6c\x61\x73\x73\x3d\x76\x65\x72\x73\x69\x6f\x6e\x5d",
    AvkH = "\x66\x61\x20\x66\x61\x2d\x61\x64\x64\x72\x65\x73\x73\x2d\x63\x61\x72\x64",
    $pRc = "\x66\x61\x20\x66\x61\x2d\x6d\x69\x6e\x75\x73\x2d\x63\x69\x72\x63\x6c\x65",
    Zz2 = "\x69\x6e\x70\x75\x74\x5b\x63\x6c\x61\x73\x73\x3d\x63\x6c\x6f\x73\x65\x5d",
    Zb = "\x6c\x6f\x67\x69\x6e\x63\x6f\x6e\x6e\x65\x63\x74\x62\x75\x74\x74\x6f\x6e",
    MwJ = "\x74\x61\x62\x2d\x68\x69\x6c\x69\x67\x68\x74\x2d\x73\x70\x65\x65\x63\x68",
    tfo = "\x20\x64\x61\x6b\x69\x6b\x61\x20\x62\x65\x6b\x6c\x65\x79\x69\x6e\x69\x7a\x2e",
    teI = "\x20\x73\x61\x6e\x69\x79\x65\x20\x62\x65\x6b\x6c\x65\x79\x69\x6e\x69\x7a\x2e",
    WY5 = "\x20\x73\x75\x6e\x75\x63\x75\x20\x20\x20\x3a\x20\x24\x78\x20\x5b\x24\x6d\x5d",
    Mn = "\x2f\x4e\x69\x63\x6b\x53\x65\x72\x76\x20\x52\x45\x47\x49\x53\x54\x45\x52\x20",
    AgDu = "\x31\x70\x78\x20\x32\x70\x78\x20\x33\x70\x78\x20\x23\x30\x30\x30\x30\x30\x30",
    aY = "\x41\x6e\x20\x65\x72\x72\x6f\x72\x20\x6f\x63\x63\x75\x72\x72\x65\x64\x3a\x20",
    $1p6 = "\x42\x61\x64\x20\x49\x52\x43\x20\x55\x52\x4c\x20\x73\x63\x68\x65\x6d\x65\x2e",
    u$m = "\x43\x48\x41\x4e\x4e\x45\x4c\x43\x52\x45\x41\x54\x49\x4f\x4e\x54\x49\x4d\x45",
    K$ = "\x4a\x6f\x69\x6e\x69\x6e\x67\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73\x2e\x2e\x2e",
    UQ3 = "\x4e\x69\x63\x6b\x20\x62\x65\x6c\x69\x72\x74\x6d\x65\x64\x69\x6e\x69\x7a\x2e",
    zIZ = "\x51\x55\x45\x52\x59\x5f\x4f\x4e\x5f\x4e\x49\x43\x4b\x5f\x43\x4c\x49\x43\x4b",
    y2h = "\x5b\x6e\x61\x6d\x65\x3d\x6c\x6f\x67\x69\x6e\x63\x6f\x6e\x6e\x65\x63\x74\x5d",
    xJ = "\x5b\x6e\x61\x6d\x65\x3d\x6e\x69\x63\x6b\x73\x65\x6c\x65\x63\x74\x65\x64\x5d",
    ww9 = "\x5b\x6e\x6f\x74\x69\x63\x65\x28\x24\x5b\x24\x74\x24\x5d\x29\x5d\x20\x24\x6d",
    AX = "\x63\x6c\x65\x61\x72\x65\x64\x20\x72\x65\x74\x72\x79\x20\x65\x76\x65\x6e\x74",
    sZD = "\x66\x61\x20\x66\x61\x2d\x75\x73\x65\x72\x2d\x63\x69\x72\x63\x6c\x65\x2d\x6f",
    tO = "\x6e\x6f\x6f\x70\x65\x6e\x65\x72\x20\x6e\x6f\x72\x65\x66\x65\x72\x72\x65\x72",
    ZON = "\x71\x77\x65\x62\x69\x72\x63\x2d\x6f\x70\x74\x69\x6f\x6e\x73\x70\x61\x6e\x65",
    h9E = "\x74\x6f\x70\x69\x63\x20\x74\x61\x62\x2d\x69\x6e\x76\x69\x73\x69\x62\x6c\x65",
    DT = "\x77\x65\x62\x73\x6f\x63\x6b\x65\x74\x20\x63\x6f\x6e\x6e\x65\x63\x74\x65\x64",
    x5y = "\x45\x6e\x67\x65\x6c\x20\x6c\x69\x73\x74\x65\x6e\x69\x7a\x20\x62\x6f\u015f\x2e",
    Olr = "\x28\x6e\x6f\x20\x72\x65\x61\x73\x6f\x6e\x20\x72\x65\x74\x75\x72\x6e\x65\x64\x29",
    R1 = "\x2e\x65\x6d\x6f\x6a\x69\x6f\x6e\x65\x61\x72\x65\x61\x2d\x65\x64\x69\x74\x6f\x72",
    ZFS = "\x44\x45\x44\x49\x43\x41\x54\x45\x44\x5f\x4d\x53\x47\x5f\x57\x49\x4e\x44\x4f\x57",
    qyn = "\x45\x52\x52\x5f\x43\x41\x4e\x4e\x4f\x54\x53\x45\x4e\x44\x54\x4f\x43\x48\x41\x4e",
    qxX = "\x52\x50\x4c\x5f\x57\x48\x4f\x49\x53\x47\x45\x4e\x45\x52\x49\x43\x54\x45\x58\x54",
    z4m = "\x59\x6f\x75\x72\x20\x63\x75\x73\x74\x6f\x6d\x20\x6c\x69\x6e\x6b\x20\x69\x73\x3a",
    Y_ = "\x5b\x6e\x61\x6d\x65\x3d\x63\x6f\x6e\x6e\x65\x63\x74\x62\x75\x74\x74\x6f\x6e\x5d",
    xQg = "\x66\x61\x20\x66\x61\x2d\x63\x68\x65\x63\x6b\x2d\x73\x71\x75\x61\x72\x65\x2d\x6f",
    ZG = "\x69\x6e\x70\x75\x74\x5b\x6e\x61\x6d\x65\x3d\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x5d",
    zh = "\x69\x6e\x70\x75\x74\x5b\x6e\x61\x6d\x65\x3d\x70\x61\x73\x73\x77\x6f\x72\x64\x5d",
    Otj = "\x6c\x6f\x6e\x67\x70\x6f\x6c\x6c\x28\x73\x65\x72\x76\x65\x72\x4e\x6f\x57\x53\x29",
    $yhi = "\x6f\x7a\x65\x6c\x45\x6e\x67\x65\x6c\x42\x75\x74\x6f\x6e\x20\x78\x6d\x65\x6e\x75",
    mXk = "\x74\x61\x62\x2d\x68\x69\x6c\x69\x67\x68\x74\x2d\x61\x63\x74\x69\x76\x69\x74\x79",
    bC = "\x20\x66\x69\x72\x65\x64\x2e\x2e\x2e\x20\x68\x61\x6e\x64\x6c\x65\x64\x20\x69\x73\x20",
    R_M = "\x45\x52\x52\x5f\x43\x48\x41\x4e\x4f\x50\x50\x52\x49\x56\x53\x4e\x45\x45\x44\x45\x44",
    VAR = "\x45\x6e\x67\x65\x6c\x6c\x65\x6e\x65\x6e\x6c\x65\x72\x20\x4c\x69\x73\x74\x65\x73\x69",
    eE = "\x4d\x6f\x7a\x57\x65\x62\x53\x6f\x63\x6b\x65\x74\x20\x64\x65\x74\x65\x63\x74\x65\x64",
    zM$ = "\x53\x68\x6f\x77\x20\x74\x61\x62\x73\x20\x6f\x6e\x20\x74\x68\x65\x20\x73\x69\x64\x65",
    xxs = "\x5b\x6e\x61\x6d\x65\x3d\x70\x72\x65\x74\x74\x79\x63\x68\x61\x6e\x6e\x65\x6c\x73\x5d",
    XPy = "\x70\x61\x6e\x65\x73\x2f\x63\x6f\x6e\x6e\x65\x63\x74\x2e\x68\x74\x6d\x6c\x3f\x76\x3d",
    Gp = "\x03\x31\x34\x2c\x31\x20\x29\x20\xc7\u0131\x6b\u0131\u015f\x20\x59\x61\x70\x74\u0131\x2e",
    x24 = "\x24\x63\x20\x6b\x61\x6e\x61\x6c\x69\x20\x6d\x6f\x64\x6c\x61\x72\x69\x20\x3a\x20\x24\x6d",
    b2 = "\x2e\x2e\x2e\x20\x72\x65\x74\x72\x79\x69\x6e\x67\x20\x28\x61\x74\x74\x65\x6d\x70\x74\x20",
    ZMm = "\x41\x43\x43\x45\x50\x54\x5f\x53\x45\x52\x56\x49\x43\x45\x5f\x49\x4e\x56\x49\x54\x45\x53",
    yt5 = "\x43\x68\x6f\x6f\x73\x65\x20\x61\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x6d\x6f\x64\x65",
    Zik = "\x48\x69\x64\x65\x20\x4a\x4f\x49\x4e\x53\x2f\x50\x41\x52\x54\x53\x2f\x51\x55\x49\x54\x53",
    s_j = "\x64\x61\x74\x61\x3a\x69\x6d\x61\x67\x65\x2f\x6a\x70\x67\x3b\x62\x61\x73\x65\x36\x34\x2c",
    O9 = "\x68\x74\x74\x70\x3a\x2f\x2f\x77\x77\x77\x2e\x71\x77\x65\x62\x69\x72\x63\x2e\x6f\x72\x67",
    hjr = "\x6e\x69\x63\x6b\x6c\x69\x73\x74\x20\x74\x61\x62\x2d\x69\x6e\x76\x69\x73\x69\x62\x6c\x65",
    HLs = "\x7a\x2d\x69\x6e\x64\x65\x78\x3a\x31\x3b\x6f\x70\x61\x63\x69\x74\x79\x3a\x30\x2e\x35\x3b",
    x2 = "\x27\x2c\x73\x69\x7a\x69\x6e\x67\x4d\x65\x74\x68\x6f\x64\x3d\x27\x63\x72\x6f\x70\x27\x29\x3b",
    iK = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e",
    YZR = "\x43\x6f\x6e\x66\x69\x67\x75\x72\x65\x20\x6c\x6f\x6f\x6b\x20\x61\x6e\x64\x20\x66\x65\x65\x6c",
    ZG7 = "\x44\x45\x44\x49\x43\x41\x54\x45\x44\x5f\x4e\x4f\x54\x49\x43\x45\x5f\x57\x49\x4e\x44\x4f\x57",
    yvB = "\x44\x69\x73\x70\x6c\x61\x79\x20\x63\x6f\x6e\x6e\x65\x63\x74\x20\x64\x69\x61\x6c\x6f\x67\x3f",
    xap = "\x50\x72\x69\x76\x61\x74\x65\x20\x6e\x6f\x74\x69\x63\x65\x20\x66\x72\x6f\x6d\x20\x24\x6e\x3a",
    B1 = "\x55\x6e\x61\x62\x6c\x65\x20\x74\x6f\x20\x73\x65\x6e\x64\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20",
    mS = "\x66\x61\x2d\x65\x78\x63\x6c\x61\x6d\x61\x74\x69\x6f\x6e\x2d\x74\x72\x69\x61\x6e\x67\x6c\x65",
    V0 = "\x69\x6d\x61\x67\x65\x73\x2f\x71\x77\x65\x62\x69\x72\x63\x73\x6d\x61\x6c\x6c\x2e\x70\x6e\x67",
    AVNc = "\xd6\x7a\x65\x6c\x20\x50\x65\x6e\x63\x65\x72\x65\x6c\x65\x72\x69\x20\x4b\x61\x70\x61\x74\x21",
    ejL = "\x48\x69\xe7\x20\xf6\x7a\x65\x6c\x20\x6d\x65\x73\x61\x6a\u0131\x6e\u0131\x7a\x20\x79\x6f\x6b\x2e",
    iX = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e",
    W3m = "\x41\x64\x64\x20\x77\x65\x62\x63\x68\x61\x74\x20\x74\x6f\x20\x79\x6f\x75\x72\x20\x73\x69\x74\x65",
    x8r = "\x50\x72\x69\x76\x61\x74\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x66\x72\x6f\x6d\x20\x24\x6e\x3a",
    Z$E = "\x53\x68\x6f\x77\x20\x74\x68\x65\x20\x63\x6f\x6e\x6e\x65\x63\x74\x20\x64\x69\x61\x6c\x6f\x67\x2e",
    Xd = "\x5b\x6e\x61\x6d\x65\x3d\x6e\x6f\x6c\x6f\x67\x6f\x6c\x6f\x67\x69\x6e\x68\x65\x61\x64\x65\x72\x5d",
    DZV = "\x66\x61\x20\x66\x61\x2d\x65\x78\x63\x6c\x61\x6d\x61\x74\x69\x6f\x6e\x2d\x63\x69\x72\x63\x6c\x65",
    XFd = "\x69\x6d\x61\x67\x65\x73\x2f\x65\x6d\x70\x74\x79\x5f\x66\x61\x76\x69\x63\x6f\x6e\x2e\x69\x63\x6f",
    ws2 = "\x42\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x3a\x20\x24\x6d",
    GT = "\x03\x31\x34\x2c\x31\x20\x29\x20\u015e\x75\x61\x6e\x64\x61\x20\x53\x75\x6e\x75\x63\x75\x64\x61\x2e",
    e$p = "\x3c\x73\x70\x61\x6e\x20\x73\x74\x79\x6c\x65\x3d\x27\x63\x6f\x6c\x6f\x72\x3a\x72\x65\x64\x3b\x27\x3e",
    zIP = "\x41\x64\x6a\x75\x73\x74\x20\x75\x73\x65\x72\x20\x69\x6e\x74\x65\x72\x66\x61\x63\x65\x20\x68\x75\x65",
    wXc = "\x43\x54\x43\x50\x20\x24\x78\x20\x72\x65\x70\x6c\x79\x20\x66\x72\x6f\x6d\x20\x24\x4e\x3a\x20\x24\x6d",
    UNS = "\x4b\x61\x6e\x61\x6c\x20\x69\x73\x6d\x69\x20\x62\x65\x6c\x69\x72\x74\x6d\x65\x64\x69\x6e\x69\x7a\x2e",
    _fH = "\x4c\xfc\x74\x66\x65\x6e\x20\x62\x69\x72\x20\x6e\x69\x63\x6b\x20\x62\x65\x6c\x69\x72\x74\x69\x6e\x2e",
    Xz = "\x5b\x6e\x61\x6d\x65\x3d\x6c\x6f\x67\x69\x6e\x63\x6f\x6e\x6e\x65\x63\x74\x62\x75\x74\x74\x6f\x6e\x5d",
    WtE = "\x24\x7b\x24\x4e\x24\x7d\x20\x73\x75\x6e\x75\x63\x75\x64\x61\x6e\x20\x61\x79\x72\u0131\x6c\x64\u0131\x2e",
    bCAG = "\x3c\x66\x69\x6c\x74\x65\x72\x73\x2f\x3e\x3c\x74\x61\x62\x73\x2f\x3e\x3c\x65\x64\x69\x74\x6f\x72\x2f\x3e",
    mNA = "\x66\x61\x20\x66\x61\x2d\x65\x78\x63\x6c\x61\x6d\x61\x74\x69\x6f\x6e\x2d\x74\x72\x69\x61\x6e\x67\x6c\x65",
    sd = "\x0f\x20\x6b\x61\x6e\x61\x6c\u0131\x6e\x64\x61\x20\x73\x69\x7a\x65\x20\x73\x65\x73\x6c\x65\x6e\x64\x69\x2e",
    H2d = "\x3c\x73\x70\x61\x6e\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x4c\x65\x66\x74\x22\x3e\x3c\x2f\x73\x70\x61\x6e\x3e",
    YrJ = "\x41\x64\x64\x20\x77\x65\x62\x63\x68\x61\x74\x20\x74\x6f\x20\x79\x6f\x75\x72\x20\x77\x65\x62\x73\x69\x74\x65",
    Z1G = "\x59\x6f\x75\x20\x6d\x75\x73\x74\x20\x73\x75\x70\x70\x6c\x79\x20\x61\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x2e",
    WuA = "\x4b\x75\x6c\x6c\x61\x6e\u0131\x63\u0131\x20\x6d\x6f\x64\x75\x20\x64\x65\u011f\x69\u015f\x74\x69\x3a\x20\x24\x6d",
    h3h = "\x3c\x73\x70\x61\x6e\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x52\x69\x67\x68\x74\x22\x3e\x3c\x2f\x73\x70\x61\x6e\x3e",
    kf = "\x4f\x7a\x65\x6c\x20\x6d\x65\x73\x61\x6a\x20\x61\x6c\u0131\x6d\u0131\x6e\u0131\x7a\x20\x61\xe7\u0131\x6c\x64\u0131",
    OKG = "\x52\x65\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6e\x67\x20\x74\x6f\x20\x77\x65\x62\x73\x6f\x63\x6b\x65\x74\x2e\x2e\x2e",
    AR = "\x53\x61\x74\x2c\x20\x31\x20\x4a\x61\x6e\x20\x32\x30\x30\x30\x20\x30\x30\x3a\x30\x30\x3a\x30\x30\x20\x47\x4d\x54",
    yLZ = "\x68\x74\x74\x70\x3a\x2f\x2f\x77\x65\x62\x63\x68\x61\x74\x2e\x71\x75\x61\x6b\x65\x6e\x65\x74\x2e\x6f\x72\x67\x2f",
    Gl = "\x03\x31\x34\x2c\x31\x20\x29\x20\u015e\x75\x61\x6e\x64\x61\x20\x47\x69\x72\x69\u015f\x20\x59\x61\x70\x74\u0131\x2e",
    WYY = "\x20\x68\x65\x73\x61\x70\x20\x20\x3a\x20\x71\x77\x65\x62\x69\x72\x63\x3a\x2f\x2f\x71\x77\x68\x6f\x69\x73\x2f\x24\x6d",
    b9Q9 = "\x2e\x65\x6d\x6f\x6a\x69\x6f\x6e\x65\x61\x72\x65\x61\x2d\x69\x6e\x6c\x69\x6e\x65\x7b\x20\x77\x69\x64\x74\x68\x3a\x20",
    IJ = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e",
    X23 = "\x24\x63\x20\x6b\x61\x6e\x61\x6c\u0131\x20\x6b\x75\x72\x75\x6c\x6d\x61\x20\x74\x61\x72\x69\x68\x69\x20\x3a\x20\x24\x6d",
    UsK = "\x4c\xfc\x74\x66\x65\x6e\x20\x74\xfc\x6d\x20\x61\x6c\x61\x6e\x6c\x61\x72\u0131\x20\x64\x6f\x6c\x64\x75\x72\x75\x6e\x2e",
    vtI = "\x03\x31\x34\x2c\x31\x20\x29\x20\x69\x6c\x65\x20\x79\x61\x7a\u0131\u015f\x6d\x61\x6b\x74\x61\x73\u0131\x6e\u0131\x7a\x2e",
    $SlY = "\x2e\x71\x77\x65\x62\x69\x72\x63\x2d\x71\x75\x69\x20\x2e\x6c\x69\x6e\x65\x73\x7b\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a",
    Zig = "\x41\x75\x74\x6f\x6d\x61\x74\x69\x63\x61\x6c\x6c\x79\x20\x63\x6f\x6c\x6f\x75\x72\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x73",
    ZKa = "\x53\x68\x6f\x77\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x6c\x69\x73\x74\x20\x69\x6e\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73",
    RXP = "\x54\x6f\x20\x6a\x6f\x69\x6e\x20\x61\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x74\x79\x70\x65\x3a\x20\x2f\x4a\x4f\x49\x4e\x20",
    YYQ = "\x55\x73\x65\x20\x74\x68\x65\x20\x64\x65\x66\x61\x75\x6c\x74\x20\x6c\x6f\x6f\x6b\x20\x61\x6e\x64\x20\x66\x65\x65\x6c\x2e",
    AZD2 = "\x1f\x03\x02\x20\x03\x31\x32\xf6\x7a\x65\x6c\x20\x70\x65\x6e\x63\x65\x72\x65\x20\x6b\x61\x70\x61\x74\u0131\x6c\x64\u0131\x21",
    Ea2 = "\xd6\x6e\x63\x65\x20\x67\x69\x72\x69\u015f\x20\x79\x61\x70\x6d\x61\x6e\u0131\x7a\x20\x67\x65\x72\x65\x6b\x69\x79\x6f\x72\x2e",
    Sd = "\x02\x2c\x20\x6e\x69\x63\x6b\x69\x20\xf6\x7a\x65\x6c\x64\x65\x6e\x20\x73\x69\x7a\x65\x20\x73\x65\x73\x6c\x65\x6e\x64\x69\x2e",
    kI = "\x4f\x7a\x65\x6c\x20\x6d\x65\x73\x61\x6a\x20\x61\x6c\u0131\x6d\u0131\x6e\u0131\x7a\x20\x6b\x61\x70\x61\x74\u0131\x6c\x64\u0131",
    yVQ = "\x55\x73\x65\x20\x74\x68\x65\x20\x63\x75\x72\x72\x65\x6e\x74\x20\x6c\x6f\x6f\x6b\x20\x61\x6e\x64\x20\x66\x65\x65\x6c\x20\x28",
    OMg = "\x57\x65\x62\x73\x6f\x63\x6b\x65\x74\x20\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x74\x69\x6d\x65\x6f\x75\x74\x2e\x2e\x2e",
    ng = "\x69\x6e\x70\x75\x74\x3a\x63\x68\x65\x63\x6b\x62\x6f\x78\x2e\x65\x6e\x67\x65\x6c\x73\x69\x6c\x3a\x63\x68\x65\x63\x6b\x65\x64",
    EE = "\x6e\x6f\x20\x57\x65\x62\x53\x6f\x63\x6b\x65\x74\x20\x73\x75\x70\x70\x6f\x72\x74\x20\x69\x6e\x20\x62\x72\x6f\x77\x73\x65\x72",
    wul = "\x24\x4e\x20\x73\x69\x7a\x69\x20\x24\x63\x20\x6b\x61\x6e\x61\x6c\u0131\x6e\x61\x20\x64\x61\x76\x65\x74\x20\x65\x74\x74\x69\x2e",
    GZm = "\x2e\x74\x6f\x70\x69\x63\x7b\x64\x69\x73\x70\x6c\x61\x79\x3a\x6e\x6f\x6e\x65\x20\x21\x69\x6d\x70\x6f\x72\x74\x61\x6e\x74\x3b\x7d",
    YTN = "\x4d\x61\x6b\x65\x20\x74\x68\x65\x20\x75\x73\x65\x72\x20\x63\x68\x6f\x6f\x73\x65\x20\x61\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x2e",
    t1G = "\x4e\x6f\x20\x6c\x6f\x67\x69\x6e\x20\x72\x65\x73\x70\x6f\x6e\x73\x65\x20\x69\x6e\x20\x31\x30\x20\x73\x65\x63\x6f\x6e\x64\x73\x2e",
    WYZ = "\x20\x69\x64\x6c\x65\x20\x20\x20\x20\x20\x3a\x20\x24\x78\x20\x5b\x42\x61\u011f\x2e\x20\x5a\x61\x6d\x61\x6e\u0131\x3a\x20\x24\x6d\x5d",
    gyf = "\x2e\x74\x6f\x70\x69\x63\x7b\x64\x69\x73\x70\x6c\x61\x79\x3a\x62\x6c\x6f\x63\x6b\x20\x21\x69\x6d\x70\x6f\x72\x74\x61\x6e\x74\x3b\x7d",
    Lv = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e",
    Wsv = "\x24\x7b\x24\x4e\x24\x7d\x2c\x20\x24\x63\x20\x6b\x61\x6e\x61\x6c\u0131\x6e\x61\x20\x67\x69\x72\x69\u015f\x20\x79\x61\x70\x74\u0131\x2e",
    OPP = "\x43\x6f\x75\x6c\x64\x6e\x27\x74\x20\x63\x6f\x6e\x6e\x65\x63\x74\x20\x74\x6f\x20\x72\x65\x6d\x6f\x74\x65\x20\x73\x65\x72\x76\x65\x72\x2e",
    TdY = "\x4e\x69\x63\x6b\x69\x6e\x69\x7a\x69\x20\x6b\x61\x79\x69\x74\x20\x65\x74\x6d\x65\x6b\x20\x69\xe7\x69\x6e\x20\x6c\xfc\x74\x66\x65\x6e\x20",
    zJM = "\x51\x75\x65\x72\x79\x20\x6f\x6e\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x63\x6c\x69\x63\x6b\x20\x69\x6e\x20\x63\x68\x61\x6e\x6e\x65\x6c",
    vPI = "\x66\x61\x20\x66\x61\x2d\x65\x78\x63\x6c\x61\x6d\x61\x74\x69\x6f\x6e\x2d\x74\x72\x69\x61\x6e\x67\x6c\x65\x20\x6b\x69\x72\x6d\x69\x7a\x69",
    X36 = "\x24\x6e\x20\x6e\x69\x63\x6b\x69\x6e\x69\x6e\x20\x65\x6e\x67\x65\x6c\x69\x6e\x69\x20\x6b\x61\x6c\x64\u0131\x72\x64\u0131\x6e\u0131\x7a\x2e",
    Om9 = "\x41\x6e\x20\x65\x72\x72\x6f\x72\x20\x6f\x63\x63\x75\x72\x72\x65\x64\x3a\x20\x62\x61\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x74\x79\x70\x65",
    RYJ = "\x49\x6e\x73\x75\x66\x66\x69\x63\x69\x65\x6e\x74\x20\x61\x72\x67\x75\x6d\x65\x6e\x74\x73\x20\x66\x6f\x72\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x2e",
    WT3 = "\x24\x7b\x24\x4e\x24\x7d\x2c\x20\x24\x63\x20\x6b\x61\x6e\x61\x6c\u0131\x6e\x64\x61\x6e\x20\x61\x79\x72\u0131\x6c\x64\u0131\x20\x5b\x24\x6d\x5d",
    Zat = "\x22\x20\x77\x69\x64\x74\x68\x3d\x22\x36\x34\x37\x22\x20\x68\x65\x69\x67\x68\x74\x3d\x22\x34\x30\x30\x22\x3e\x3c\x2f\x69\x66\x72\x61\x6d\x65\x3e",
    zFb = "\x45\x6d\x69\x74\x20\x48\x54\x4d\x4c\x35\x20\x6e\x6f\x74\x69\x66\x69\x63\x61\x74\x69\x6f\x6e\x73\x20\x6f\x6e\x20\x61\x63\x74\x69\x76\x69\x74\x79",
    WRS = "\x47\x69\x72\x69\u015f\x20\x79\x61\x70\u0131\x6c\u0131\x79\x6f\x72\x2c\x20\x6c\xfc\x74\x66\x65\x6e\x20\x62\x65\x6b\x6c\x65\x79\x69\x6e\x2e\x2e\x2e",
    TGp = "\x4e\x69\x63\x6b\x20\u015f\x69\x66\x72\x65\x6e\x69\x7a\x69\x20\x62\x61\u015f\x61\x72\u0131\x20\x69\x6c\x65\x20\x67\x69\x72\x64\x69\x6e\x69\x7a\x21",
    Ix = "\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\u015f\x69\x66\x72\x65\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    wwx = "\x24\x4e\x20\x5b\x24\x68\x5d\x20\x72\x65\x71\x75\x65\x73\x74\x65\x64\x20\x43\x54\x43\x50\x20\x24\x78\x20\x66\x72\x6f\x6d\x20\x24\x2d\x3a\x20\x24\x6d",
    wWM = "\x24\x4e\x20\x5b\x24\x68\x5d\x20\x72\x65\x71\x75\x65\x73\x74\x65\x64\x20\x43\x54\x43\x50\x20\x24\x78\x20\x66\x72\x6f\x6d\x20\x24\x63\x3a\x20\x24\x6d",
    Hf = "\x43\x61\x6e\x27\x74\x20\x75\x73\x65\x20\x74\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x69\x6e\x20\x74\x68\x69\x73\x20\x77\x69\x6e\x64\x6f\x77",
    mq = "\x4c\xfc\x74\x66\x65\x6e\x20\x67\x65\xe7\x65\x72\x6c\x69\x20\x62\x69\x72\x20\x6d\x61\x69\x6c\x20\x61\x64\x72\x65\x73\x69\x20\x67\x69\x72\x69\x6e\x21",
    Yuj = "\x55\x73\x65\x20\x61\x20\x70\x72\x65\x73\x65\x74\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x6f\x66\x20\x79\x6f\x75\x72\x20\x63\x68\x6f\x69\x63\x65\x2e",
    mn = "\u015e\x69\x66\x72\x65\x6e\x69\x7a\x20\x65\x6e\x20\x61\x7a\x20\x35\x20\x6b\x61\x72\x61\x6b\x74\x65\x72\x20\x6f\x6c\x6d\x61\x6c\u0131\x64\u0131\x72\x21",
    z_r = "\x43\x6f\x6e\x6e\x65\x63\x74\x20\x77\x69\x74\x68\x6f\x75\x74\x20\x64\x69\x73\x70\x6c\x61\x79\x69\x6e\x67\x20\x74\x68\x65\x20\x64\x69\x61\x6c\x6f\x67\x2e",
    cgs = "\x50\x6c\x65\x61\x73\x65\x20\x65\x6e\x74\x65\x72\x20\x74\x68\x65\x20\x70\x61\x73\x73\x77\x6f\x72\x64\x20\x66\x6f\x72\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20",
    Oso = "\x6e\x6f\x20\x77\x65\x62\x73\x6f\x63\x6b\x65\x74\x20\x6f\x6e\x20\x73\x65\x72\x76\x65\x72\x3a\x20\x75\x73\x69\x6e\x67\x20\x6c\x6f\x6e\x67\x70\x6f\x6c\x6c",
    XPx = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x6c\x6f\x61\x64\x69\x6e\x67\x22\x3e\x4c\x6f\x61\x64\x69\x6e\x67\x2e\x20\x2e\x20\x2e\x3c\x2f\x64\x69\x76\x3e",
    zNL = "\x48\x69\x64\x65\x20\x79\x6f\x75\x72\x20\x68\x6f\x73\x74\x6d\x61\x73\x6b\x20\x77\x68\x65\x6e\x20\x61\x75\x74\x68\x65\x64\x20\x74\x6f\x20\x51\x20\x28\x2b\x78\x29",
    zGh = "\x53\x65\x6e\x64\x20\x6e\x6f\x74\x69\x63\x65\x73\x20\x74\x6f\x20\x64\x65\x64\x69\x63\x61\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x77\x69\x6e\x64\x6f\x77",
    _a7p = "\x5e\x42\x75\x20\x6b\x61\x79\x69\x74\x6c\x69\x20\x76\x65\x20\x73\x69\x66\x72\x65\x20\x6b\x6f\x72\x75\x6d\x61\x6c\x69\x20\x62\x69\x72\x20\x6e\x69\x63\x6b\x2e\x24",
    EOQ = "\x03\x31\x32\x41\x6b\x74\x69\x66\x20\x6b\x6f\x6e\x75\u015f\x6d\x61\x20\x70\x65\x6e\x63\x65\x72\x65\x73\x69\x20\x68\x61\x72\x69\xe7\x20\x74\x6f\x70\x6c\x61\x6d\x02",
    SbA = "\x43\x61\x6e\x27\x74\x20\x74\x61\x72\x67\x65\x74\x20\x61\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x77\x69\x74\x68\x20\x74\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x2e",
    hl = "\x43\x75\x72\x72\x65\x6e\x74\x20\x55\x49\x20\x64\x6f\x65\x73\x20\x6e\x6f\x74\x20\x73\x75\x70\x70\x6f\x72\x74\x20\x74\x68\x61\x74\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x2e",
    yTv = "\x55\x73\x65\x20\x61\x20\x72\x61\x6e\x64\x6f\x6d\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x2c\x20\x65\x2e\x67\x2e\x20\x71\x77\x65\x62\x69\x72\x63\x31\x32\x38\x38\x33\x2e",
    zfu = "\x53\x65\x6e\x64\x20\x70\x72\x69\x76\x6d\x73\x67\x73\x20\x74\x6f\x20\x64\x65\x64\x69\x63\x61\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x73\x20\x77\x69\x6e\x64\x6f\x77",
    En2 = "\x03\x31\x32\x41\xe7\u0131\x6b\x20\x62\x69\x72\x20\x6b\x6f\x6e\x75\u015f\x6d\x61\x20\x70\x65\x6e\x63\x65\x72\x65\x73\x69\x20\x62\x75\x6c\x75\x6e\x61\x6d\x61\x64\u0131\x21",
    wRq = "\x53\x75\x6e\x75\x63\x75\x79\x61\x20\x62\x61\u011f\x6c\x61\x6e\u0131\x6c\x64\u0131\x2c\x20\x4c\xfc\x74\x66\x65\x6e\x20\x62\x65\x6b\x6c\x65\x79\x69\x6e\x69\x7a\x2e\x2e\x2e",
    IZ = "\x57\x61\x69\x74\x69\x6e\x67\x20\x66\x6f\x72\x20\x6c\x6f\x67\x69\x6e\x20\x62\x65\x66\x6f\x72\x65\x20\x6a\x6f\x69\x6e\x69\x6e\x67\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73\x2e\x2e\x2e",
    wtK = "\x24\x7b\x24\x6e\x24\x7d\x20\x6e\x69\x63\x6b\x69\x6e\x69\x20\x24\x7b\x24\x5b\x24\x77\x24\x5d\x24\x7d\x20\x6f\x6c\x61\x72\x61\x6b\x20\x64\x65\u011f\x69\u015f\x74\x69\x72\x64\x69\x2e",
    ZMr = "\x41\x75\x74\x6f\x6d\x61\x74\x69\x63\x61\x6c\x6c\x79\x20\x6a\x6f\x69\x6e\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73\x20\x77\x68\x65\x6e\x20\x69\x6e\x76\x69\x74\x65\x64\x20\x62\x79\x20\x51",
    R1y = "\x50\x49\x4e\x47\x20\x56\x45\x52\x53\x49\x4f\x4e\x20\x54\x49\x4d\x45\x20\x55\x53\x45\x52\x49\x4e\x46\x4f\x20\x43\x4c\x49\x45\x4e\x54\x49\x4e\x46\x4f\x20\x57\x45\x42\x53\x49\x54\x45",
    zHz = "\x53\x68\x6f\x77\x20\x61\x20\x6c\x61\x73\x74\x20\x70\x6f\x73\x69\x74\x69\x6f\x6e\x20\x69\x6e\x64\x69\x63\x61\x74\x6f\x72\x20\x66\x6f\x72\x20\x65\x61\x63\x68\x20\x77\x69\x6e\x64\x6f\x77",
    b3 = "\x55\x6e\x61\x62\x6c\x65\x20\x74\x6f\x20\x73\x65\x6e\x64\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x61\x66\x74\x65\x72\x20\x6d\x75\x6c\x74\x69\x70\x6c\x65\x20\x72\x65\x74\x72\x69\x65\x73\x2e",
    wru = "\x42\x61\u011f\x6c\x61\x6e\x64\u0131\x20\x76\x65\x20\x6f\x74\x75\x72\x75\x6d\x20\x61\xe7\u0131\x6c\x64\u0131\x20\x2d\x20\x6b\x75\x6c\x6c\x61\x6e\u0131\x6d\x61\x20\x68\x61\x7a\u0131\x72\x21",
    wTe = "\x24\x63\x20\x6d\x6f\x64\x75\x20\x24\x7b\x24\x4e\x24\x7d\x20\x74\x61\x72\x61\x66\u0131\x6e\x64\x61\x6e\x20\x5b\x24\x6d\x5d\x20\x6f\x6c\x61\x72\x61\x6b\x20\x64\x65\u011f\x69\u015f\x74\x69\x2e",
    kM = "\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    WU5 = "\x24\x7b\x24\x4e\x24\x7d\x2c\x20\x24\x63\x20\x6b\x61\x6e\x61\x6c\x20\x74\x6f\x70\x69\x63\x69\x6e\x69\x20\x24\x6d\x20\x6f\x6c\x61\x72\x61\x6b\x20\x64\x65\u011f\x69\u015f\x74\x69\x72\x64\x69\x2e",
    ar = "\x42\x55\x47\x3a\x20\x75\x6e\x63\x6f\x6e\x74\x72\x6f\x6c\x6c\x65\x64\x20\x66\x6c\x6f\x6f\x64\x20\x64\x65\x74\x65\x63\x74\x65\x64\x20\x2d\x2d\x20\x64\x69\x73\x63\x6f\x6e\x6e\x65\x63\x74\x65\x64\x2e",
    LT = "\x73\x69\x74\x65\x6d\x69\x7a\x65\x20\x64\x61\x68\x61\x20\x6b\x6f\x6c\x61\x79\x20\x67\x69\x72\x69\u015f\x20\x79\x61\x70\x61\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    _4mB = "\x54\x68\x69\x73\x20\x61\x63\x74\x69\x6f\x6e\x20\x77\x69\x6c\x6c\x20\x63\x6c\x6f\x73\x65\x20\x61\x6c\x6c\x20\x61\x63\x74\x69\x76\x65\x20\x49\x52\x43\x20\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x73\x2e",
    il = "\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x2e\x2e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    n6 = "\x53\x6f\x68\x62\x65\x74\x20\x73\xfc\x72\xfc\x6d\xfc\x20\x64\x65\u011f\x69\u015f\x74\x69\x72\x69\x6c\x69\x79\x6f\x72\x2e\x20\x4c\xfc\x74\x66\x65\x6e\x20\x62\x65\x6b\x6c\x65\x79\x69\x6e\x69\x7a\x2e\x2e\x2e",
    ZHb = "\x53\x68\x6f\x77\x20\x73\x74\x61\x74\x75\x73\x20\x28\x40\x2f\x2b\x29\x20\x62\x65\x66\x6f\x72\x65\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x73\x20\x69\x6e\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x6c\x69\x6e\x65\x73",
    cMr = "\x54\x68\x65\x20\x66\x6f\x6c\x6c\x6f\x77\x69\x6e\x67\x20\x49\x52\x43\x20\x55\x52\x4c\x20\x63\x6f\x6d\x70\x6f\x6e\x65\x6e\x74\x73\x20\x77\x65\x72\x65\x20\x6e\x6f\x74\x20\x61\x63\x63\x65\x70\x74\x65\x64\x3a\x20",
    IL = "\x3c\x70\x3e\x31\x35\x73\x6e\x20\x69\xe7\x69\x6e\x64\x65\x20\x73\x75\x6e\x75\x63\x75\x79\x61\x20\x74\x65\x6b\x72\x61\x72\x20\x62\x61\u011f\x6c\x61\x6e\x61\x63\x61\x6b\x73\u0131\x6e\u0131\x7a\x21\x3c\x2f\x70\x3e",
    WT8 = "\x24\x7b\x24\x76\x24\x7d\x20\x24\x63\x20\x6b\x61\x6e\x61\x6c\u0131\x6e\x64\x61\x6e\x20\x24\x7b\x24\x4e\x24\x7d\x20\x74\x61\x72\x61\x66\u0131\x6e\x64\x61\x6e\x20\x61\x74\u0131\x6c\x64\u0131\x2e\x20\x5b\x24\x6d\x5d",
    If = "\x43\x68\x61\x6e\x6e\x65\x6c\x20\x6e\x61\x6d\x65\x73\x20\x62\x65\x67\x69\x6e\x20\x77\x69\x74\x68\x20\x23\x20\x28\x63\x6f\x72\x72\x65\x63\x74\x65\x64\x20\x61\x75\x74\x6f\x6d\x61\x74\x69\x63\x61\x6c\x6c\x79\x29\x2e",
    $sd0 = "\x03\x31\x32\x46\x6f\x6e\x74\x20\x62\xfc\x79\xfc\x6b\x6c\xfc\u011f\xfc\x20\x03\x34\x1f\x20\x02\x6d\x61\x78\x69\x6d\x75\x6d\x02\x1f\x20\x03\x03\x31\x32\x73\x65\x76\x69\x79\x65\x79\x65\x20\x75\x6c\x61\u015f\x74\u0131\x21",
    $t5S = "\x03\x31\x32\x46\x6f\x6e\x74\x20\x62\xfc\x79\xfc\x6b\x6c\xfc\u011f\xfc\x20\x03\x34\x1f\x20\x02\x6d\x69\x6e\x69\x6d\x75\x6d\x02\x1f\x20\x03\x03\x31\x32\x73\x65\x76\x69\x79\x65\x79\x65\x20\x75\x6c\x61\u015f\x74\u0131\x21",
    DM = "\x45\x72\x72\x6f\x72\x3a\x20\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x63\x6c\x6f\x73\x65\x64\x20\x61\x66\x74\x65\x72\x20\x73\x65\x76\x65\x72\x61\x6c\x20\x72\x65\x71\x75\x65\x73\x74\x73\x20\x66\x61\x69\x6c\x65\x64\x2e",
    ZFL = "\x46\x6c\x61\x73\x68\x20\x74\x69\x74\x6c\x65\x62\x61\x72\x20\x77\x68\x65\x6e\x20\x6e\x69\x63\x6b\x20\x6d\x65\x6e\x74\x69\x6f\x6e\x65\x64\x20\x6f\x72\x20\x6f\x6e\x20\x71\x75\x65\x72\x79\x20\x61\x63\x74\x69\x76\x69\x74\x79",
    OTs = "\x77\x65\x62\x73\x6f\x63\x6b\x65\x74\x20\x70\x72\x65\x73\x65\x6e\x74\x20\x6f\x6e\x20\x63\x6c\x69\x65\x6e\x74\x20\x61\x6e\x64\x20\x73\x65\x72\x76\x65\x72\x3a\x20\x75\x73\x69\x6e\x67\x20\x77\x65\x62\x73\x6f\x63\x6b\x65\x74",
    m0 = "\x3c\x6c\x61\x62\x65\x6c\x3e\x47\x69\x72\x6d\x65\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6b\x61\x6e\x61\x6c\x20\x69\x73\x6d\x69\x6e\x69\x20\x79\x61\x7a\u0131\x6e\u0131\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    E07 = "\x3c\x2f\x73\x70\x61\x6e\x3e\x20\x6e\x69\x63\x6b\x69\x6e\x69\x20\u015f\x69\x6b\x61\x79\x65\x74\x20\x65\x64\x69\x70\x20\x65\x6e\x67\x65\x6c\x6c\x65\x6d\x65\x6b\x20\x69\x73\x74\x69\x79\x6f\x72\x20\x6d\x75\x73\x75\x6e\x75\x7a\x3f",
    lV = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e",
    z1k = "\x54\x68\x65\x20\x73\x75\x70\x70\x6c\x69\x65\x64\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x77\x61\x73\x20\x69\x6e\x76\x61\x6c\x69\x64\x20\x61\x6e\x64\x20\x68\x61\x73\x20\x62\x65\x65\x6e\x20\x63\x6f\x72\x72\x65\x63\x74\x65\x64\x2e",
    oa = "\x47\x4e\x55\x20\x47\x65\x6e\x65\x6c\x20\x4b\x61\x6d\x75\x20\x4c\x69\x73\x61\x6e\x73\u0131\x2c\x20\x53\xfc\x72\xfc\x6d\x20\x32\x20\x61\x6c\x74\u0131\x6e\x64\x61\x20\x6c\x69\x73\x61\x6e\x73\x6c\x61\x6e\x6d\u0131\u015f\x74\u0131\x72\x2e",
    zBJ = "\x59\x6f\x75\x20\x63\x61\x6e\x20\x65\x6d\x62\x65\x64\x20\x74\x68\x69\x73\x20\x69\x6e\x74\x6f\x20\x79\x6f\x75\x72\x20\x70\x61\x67\x65\x20\x77\x69\x74\x68\x20\x74\x68\x65\x20\x66\x6f\x6c\x6c\x6f\x77\x69\x6e\x67\x20\x63\x6f\x64\x65\x3a",
    OTV = "\x77\x65\x62\x73\x6f\x63\x6b\x65\x74\x20\x70\x72\x65\x73\x65\x6e\x74\x20\x6f\x6e\x20\x73\x65\x72\x76\x65\x72\x20\x62\x75\x74\x20\x6e\x6f\x74\x20\x63\x6c\x69\x65\x6e\x74\x3a\x20\x75\x73\x69\x6e\x67\x20\x6c\x6f\x6e\x67\x70\x6f\x6c\x6c",
    o9 = "\x54\x65\x6c\x69\x66\x20\x68\x61\x6b\x6b\u0131\x20\x28\x43\x29\x20\x32\x30\x30\x38\x2d\x32\x30\x31\x39\x20\x43\x68\x72\x69\x73\x20\x50\x6f\x72\x74\x65\x72\x20\x76\x65\x20\x71\x77\x65\x62\x69\x72\x63\x20\x70\x72\x6f\x6a\x65\x73\x69\x2e",
    Z_0 = "\x54\x68\x65\x20\x6c\x6f\x6f\x6b\x20\x61\x6e\x64\x20\x66\x65\x65\x6c\x20\x77\x69\x6c\x6c\x20\x62\x65\x20\x63\x6f\x70\x69\x65\x64\x20\x66\x72\x6f\x6d\x20\x74\x68\x65\x20\x63\x75\x72\x72\x65\x6e\x74\x20\x73\x65\x74\x74\x69\x6e\x67\x73\x2e",
    MF = "\x3c\x6c\x61\x62\x65\x6c\x3e\x41\x6c\x6d\x61\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6e\x69\x63\x6b\x69\x20\x61\u015f\x61\u011f\u0131\x64\x61\x20\x62\x65\x6c\x69\x72\x74\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    EMu = "\x03\x31\x32\x41\x6b\x74\x69\x66\x20\x70\x65\x6e\x63\x65\x72\x65\x6e\x69\x7a\x20\x68\x61\x72\x69\xe7\x20\x62\x69\x72\x20\x6b\x6f\x6e\x75\u015f\x6d\x61\x20\x70\x65\x6e\x63\x65\x72\x65\x73\x69\x20\x62\x75\x6c\x75\x6e\x61\x6d\x61\x64\u0131\x21",
    ix = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\u015f\x69\x66\x72\x65\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    mx = "\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\x3c\x62\x3e\x6f\x70\x65\x72\x20\x6e\x69\x63\x6b\x20\x76\x65\x20\u015f\x69\x66\x72\x65\x6e\x69\x7a\x69\x3c\x2f\x62\x3e\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    OJO = "\x46\x61\x69\x6c\x65\x64\x20\x66\x69\x72\x73\x74\x20\x77\x65\x62\x73\x6f\x63\x6b\x65\x74\x20\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x2e\x2e\x2e\x20\x66\x61\x6c\x6c\x69\x6e\x67\x20\x62\x61\x63\x6b\x20\x74\x6f\x20\x6c\x6f\x6e\x67\x70\x6f\x6c\x6c",
    lKQ = "\x53\x6f\x72\x72\x79\x2c\x20\x79\x6f\x75\x20\x6e\x65\x65\x64\x20\x74\x6f\x20\x62\x65\x20\x61\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x6f\x70\x65\x72\x61\x74\x6f\x72\x20\x74\x6f\x20\x63\x68\x61\x6e\x67\x65\x20\x74\x68\x65\x20\x74\x6f\x70\x69\x63\x21",
    x2F = "\x24\x6e\x2c\x20\x6e\x69\x63\x6b\x69\x6e\x69\x20\x45\x6e\x67\x65\x6c\x6c\x65\x64\x69\x6e\x69\x7a\x2e\x20\x59\x61\x7a\u0131\x6c\x61\x72\u0131\x6e\u0131\x20\x61\x72\x74\u0131\x6b\x20\x67\xf6\x72\x65\x6d\x65\x79\x65\x63\x65\x6b\x73\x69\x6e\x69\x7a\x2e",
    U09 = "\x20\x3a\x53\x69\x7a\x69\x20\x65\x6e\x67\x65\x6c\x6c\x65\x64\x69\x6d\x2e\x20\x59\x61\x7a\x64\u0131\x6b\x6c\x61\x72\u0131\x6e\u0131\x7a\u0131\x20\x62\x75\x6e\x64\x61\x6e\x20\x73\x6f\x6e\x72\x61\x20\x67\xf6\x72\x6d\x65\x79\x65\x63\x65\u011f\x69\x6d\x2e",
    _3S7 = "\x3c\x73\x70\x61\x6e\x20\x63\x6c\x61\x73\x73\x3d\x22\x79\x65\x74\x6b\x69\x20\x73\x65\x76\x69\x79\x65\x22\x3e\x3c\x2f\x73\x70\x61\x6e\x3e\x3c\x73\x70\x61\x6e\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x4f\x72\x74\x61\x6c\x61\x22\x3e\x3c\x2f\x73\x70\x61\x6e\x3e",
    Z1a = "\x45\x6e\x74\x65\x72\x20\x74\x68\x65\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x79\x6f\x75\x20\x77\x6f\x75\x6c\x64\x20\x6c\x69\x6b\x65\x20\x74\x68\x65\x20\x63\x6c\x69\x65\x6e\x74\x20\x74\x6f\x20\x75\x73\x65\x20\x62\x79\x20\x64\x65\x66\x61\x75\x6c\x74\x3a",
    eLM = "\x3c\x70\x3e\x54\xfc\x6d\x20\xf6\x7a\x65\x6c\x20\x6b\x6f\x6e\x75\u015f\x6d\x61\x20\x70\x65\x6e\x63\x65\x72\x65\x6c\x65\x72\x69\x6e\x69\x20\x6b\x61\x70\x61\x74\x6d\x61\x6b\x20\x69\x73\x74\x69\x79\x6f\x72\x20\x6d\x75\x73\x75\x6e\x75\x7a\x3f\x3c\x2f\x70\x3e",
    YsK = "\x45\x6e\x74\x65\x72\x20\x74\x68\x65\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73\x20\x79\x6f\x75\x20\x77\x6f\x75\x6c\x64\x20\x6c\x69\x6b\x65\x20\x74\x68\x65\x20\x63\x6c\x69\x65\x6e\x74\x20\x74\x6f\x20\x6a\x6f\x69\x6e\x20\x6f\x6e\x20\x73\x74\x61\x72\x74\x75\x70\x3a",
    mNP = "\x63\x6f\x6c\x6f\x72\x3a\x23\x66\x66\x34\x35\x30\x30\x3b\x66\x6c\x6f\x61\x74\x3a\x20\x72\x69\x67\x68\x74\x3b\x20\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x20\x33\x32\x70\x78\x3b\x20\x70\x61\x64\x64\x69\x6e\x67\x2d\x72\x69\x67\x68\x74\x3a\x20\x33\x70\x78\x3b",
    nZQ = "\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x2b\x2f\x3d",
    Zs = "\x4e\x6f\x20\x73\x65\x73\x73\x69\x6f\x6e\x20\x73\x74\x6f\x72\x61\x67\x65\x20\x73\x75\x70\x70\x6f\x72\x74\x20\x69\x6e\x20\x74\x68\x69\x73\x20\x62\x72\x6f\x77\x73\x65\x72\x20\x2d\x2d\x20\x6c\x6f\x67\x69\x6e\x20\x6e\x6f\x74\x20\x73\x75\x70\x70\x6f\x72\x74\x65\x64",
    bixA = "\x66\x6f\x6e\x74\x2d\x77\x65\x69\x67\x68\x74\x3a\x20\x62\x6f\x6c\x64\x3b\x20\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x20\x31\x34\x70\x78\x3b\x62\x6f\x72\x64\x65\x72\x2d\x72\x69\x67\x68\x74\x3a\x31\x70\x78\x20\x73\x6f\x6c\x69\x64\x20\x23\x36\x65\x36\x65\x36\x65\x3b",
    E0x = "\x42\x69\x6c\x64\x69\x72\x69\x6d\x69\x6e\x69\x7a\x20\x61\x6c\u0131\x6e\x6d\u0131\u015f\x74\u0131\x72\x2e\x20\x4b\x61\x74\x6b\u0131\x6c\x61\x72\u0131\x6e\u0131\x7a\x64\x61\x6e\x20\x64\x6f\x6c\x61\x79\u0131\x20\x74\x65\u015f\x65\x6b\x6b\xfc\x72\x20\x65\x64\x65\x72\x69\x7a\x2e",
    MJ = "\x3c\x6c\x61\x62\x65\x6c\x3e\x4b\x61\x79\u0131\x74\x20\x69\u015f\x6c\x65\x6d\x69\x20\x69\xe7\x69\x6e\x20\x6c\xfc\x74\x66\x65\x6e\x20\x61\u015f\x61\u011f\u0131\x64\x61\x6b\x69\x20\x61\x6c\x61\x6e\x6c\x61\x72\u0131\x20\x64\x6f\x6c\x64\x75\x72\x75\x6e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    YSQ = "\x59\x6f\x75\x20\x63\x61\x6e\x20\x73\x75\x70\x70\x6c\x79\x20\x6d\x75\x6c\x74\x69\x70\x6c\x65\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73\x20\x62\x79\x20\x73\x65\x70\x65\x72\x61\x74\x69\x6e\x67\x20\x74\x68\x65\x6d\x20\x77\x69\x74\x68\x20\x61\x20\x63\x6f\x6d\x6d\x61\x2c\x20\x65\x2e\x67\x2e\x3a",
    DwX = "\x77\x69\x64\x74\x68\x3a\x20\x31\x30\x30\x25\x3b\x20\x77\x68\x69\x74\x65\x2d\x73\x70\x61\x63\x65\x3a\x20\x6e\x6f\x77\x72\x61\x70\x3b\x20\x6f\x76\x65\x72\x66\x6c\x6f\x77\x2d\x79\x3a\x20\x68\x69\x64\x64\x65\x6e\x3b\x20\x6f\x76\x65\x72\x66\x6c\x6f\x77\x2d\x78\x3a\x20\x61\x75\x74\x6f\x3b",
    Lw = "\x3c\x6c\x61\x62\x65\x6c\x3e\x42\x75\x72\x61\x64\x61\x6e\x20\xf6\x7a\x65\x6c\x69\x6e\x69\x7a\x69\x20\x41\xe7\x2f\x4b\x61\x70\x61\x74\x20\x69\u015f\x6c\x65\x6d\x6c\x65\x6d\x6c\x65\x72\x69\x6e\x69\x20\x79\x61\x70\x61\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x21\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    _8LT = "\x61\x62\x63\xe7\x64\x65\x66\x67\u011f\x68\x69\u0131\x6a\x6b\x6c\x6d\x6e\x6f\xf6\x70\x71\x72\x73\u015f\x74\x75\xfc\x76\x77\x78\x79\x7a\x41\x42\x43\xc7\x44\x45\x46\x47\u011e\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\xd6\x50\x51\x52\x53\u015e\x54\x55\xdc\x56\x57\x58\x59\x5a\x5f\x5b\x5d\x7b\x7d\x60\x5e\x5c\x7c",
    N6 = "\x63\x6f\x6c\x2d\x6d\x64\x2d\x36\x20\x63\x6f\x6c\x2d\x6d\x64\x2d\x6f\x66\x66\x73\x65\x74\x2d\x36\x20\x63\x6f\x6c\x2d\x73\x6d\x2d\x39\x20\x63\x6f\x6c\x2d\x73\x6d\x2d\x6f\x66\x66\x73\x65\x74\x2d\x36\x20\x63\x6f\x6c\x2d\x78\x73\x2d\x31\x30\x20\x63\x6f\x6c\x2d\x78\x73\x2d\x6f\x66\x66\x73\x65\x74\x2d\x31",
    Kl = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    Z29 = "\x49\x66\x20\x79\x6f\x75\x20\x75\x73\x65\x20\x61\x20\x2e\x20\x28\x64\x6f\x74\x2f\x70\x65\x72\x69\x6f\x64\x29\x20\x74\x68\x65\x6e\x20\x69\x74\x20\x77\x69\x6c\x6c\x20\x62\x65\x20\x73\x75\x62\x73\x74\x69\x74\x75\x74\x65\x64\x20\x77\x69\x74\x68\x20\x61\x20\x72\x61\x6e\x64\x6f\x6d\x20\x6e\x75\x6d\x62\x65\x72\x2e",
    Ik = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x2e\x2e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    Lt = "\x3c\x6c\x61\x62\x65\x6c\x3e\x47\x6f\x6f\x67\x6c\x65\x20\x50\x6c\x61\x79\x20\x75\x79\x67\x75\x6c\x61\x6d\x61\x6d\u0131\x7a\u0131\x20\x6b\x75\x6c\x6c\x61\x6e\x61\x72\x61\x6b\x20\x64\x61\x68\x61\x20\x68\u0131\x7a\x6c\u0131\x20\x73\x6f\x68\x62\x65\x74\x20\x65\x64\x65\x62\x69\x69\x72\x73\x69\x6e\x69\x7a\x20\x76\x65\x3c\x2f\x62\x72\x3e",
    HE9 = "\x3c\x69\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x61\x20\x66\x61\x2d\x65\x78\x63\x6c\x61\x6d\x61\x74\x69\x6f\x6e\x2d\x74\x72\x69\x61\x6e\x67\x6c\x65\x22\x20\x73\x74\x79\x6c\x65\x3d\x22\x63\x6f\x6c\x6f\x72\x3a\x23\x66\x66\x34\x35\x30\x30\x3b\x22\x20\x61\x72\x69\x61\x2d\x68\x69\x64\x64\x65\x6e\x3d\x22\x74\x72\x75\x65\x22\x3e\x3c\x2f\x69\x3e",
    _8CH = "\x61\x62\x63\xe7\x64\x65\x66\x67\u011f\x68\x69\u0131\x6a\x6b\x6c\x6d\x6e\x6f\xf6\x70\x71\x72\x73\u015f\x74\x75\xfc\x76\x77\x78\x79\x7a\x41\x42\x43\xc7\x44\x45\x46\x47\u011e\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\xd6\x50\x51\x52\x53\u015e\x54\x55\xdc\x56\x57\x58\x59\x5a\x5f\x5b\x5d\x7b\x7d\x60\x5e\x5c\x7c\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x2d",
    My = "\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    mL = "\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4d\x61\x69\x6c\x20\x61\x64\x72\x65\x73\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6d\x61\x69\x6c\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    Tgd = "\x42\x75\x20\x6e\x69\x63\x6b\x20\x64\x61\x68\x61\x20\xf6\x6e\x63\x65\x20\x6b\x61\x79\u0131\x74\x20\x65\x64\x69\x6c\x6d\x69\u015f\x2e\x20\x4c\xfc\x74\x66\x65\x6e\x20\x6e\x69\x63\x6b\x20\x64\x65\u011f\x69\u015f\x74\x69\x72\x69\x70\x20\x74\x65\x6b\x72\x61\x72\x20\x6b\x61\x79\u0131\x74\x20\x65\x74\x6d\x65\x79\x69\x20\x64\x65\x6e\x65\x79\x69\x6e\x2e",
    M1 = "\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4b\x61\x6e\x61\x6c\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x61\x6d\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    Mg = "\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4e\x69\x63\x6b\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x4e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    O$Q = "\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x65\x78\x65\x63\x75\x74\x65\x20\x27\x61\x74\x6f\x62\x27\x20\x6f\x6e\x20\x27\x57\x69\x6e\x64\x6f\x77\x27\x3a\x20\x54\x68\x65\x20\x73\x74\x72\x69\x6e\x67\x20\x74\x6f\x20\x62\x65\x20\x64\x65\x63\x6f\x64\x65\x64\x20\x69\x73\x20\x6e\x6f\x74\x20\x63\x6f\x72\x72\x65\x63\x74\x6c\x79\x20\x65\x6e\x63\x6f\x64\x65\x64\x2e",
    X1 = "\x29\x20\x6e\x6f\x2d\x72\x65\x70\x65\x61\x74\x20\x63\x65\x6e\x74\x65\x72\x20\x74\x6f\x70\x3b\x20\x5f\x66\x69\x6c\x74\x65\x72\x3a\x20\x70\x72\x6f\x67\x69\x64\x3a\x44\x58\x49\x6d\x61\x67\x65\x54\x72\x61\x6e\x73\x66\x6f\x72\x6d\x2e\x4d\x69\x63\x72\x6f\x73\x6f\x66\x74\x2e\x41\x6c\x70\x68\x61\x49\x6d\x61\x67\x65\x4c\x6f\x61\x64\x65\x72\x28\x73\x72\x63\x3d\x27",
    iY = "\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x61\x6d\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    VfP = "\x3c\x2f\x73\x70\x61\x6e\x3e\x20\x6e\x69\x63\x6b\x69\x6e\x69\x6e\x20\x75\x79\x67\x75\x6e\x73\x75\x7a\x20\x6f\x6c\x64\x75\u011f\x75\x6e\x75\x20\x6d\x75\x20\x64\xfc\u015f\xfc\x6e\xfc\x79\x6f\x72\x73\x75\x6e\x75\x7a\x3f\x20\x42\x75\x20\x62\x69\x6c\x64\x69\x72\x69\x20\x79\xf6\x6e\x65\x74\x69\x63\x69\x6c\x65\x72\x65\x20\x75\x6c\x61\u015f\x61\x63\x61\x6b\x74\u0131\x72\x2e",
    N$ = "\x3c\x6c\x61\x62\x65\x6c\x3e\x42\x75\x20\x73\x6f\x68\x62\x65\x74\x20\x73\xfc\x72\xfc\x6d\xfc\x6e\x64\x65\x20\x73\x6f\x72\x75\x6e\x20\x79\x61\u015f\x69\x79\x6f\x72\x73\x61\x6e\u0131\x7a\x20\x64\x69\u011f\x65\x72\x20\x73\x6f\x68\x62\x65\x74\x20\x73\xfc\x72\xfc\x6d\xfc\x6e\x65\x20\x67\x65\xe7\x65\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x21\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    EKO = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x70\x3e\x54\xfc\x6d\x20\xf6\x7a\x65\x6c\x20\x6b\x6f\x6e\x75\u015f\x6d\x61\x20\x70\x65\x6e\x63\x65\x72\x65\x6c\x65\x72\x69\x6e\x69\x20\x6b\x61\x70\x61\x74\x6d\x61\x6b\x20\x69\x73\x74\x69\x79\x6f\x72\x20\x6d\x75\x73\x75\x6e\x75\x7a\x3f\x3c\x2f\x70\x3e",
    H57 = "\x64\x69\x76\x2e\x6e\x69\x63\x6b\x6c\x69\x73\x74\x2e\x74\x61\x62\x2d\x69\x6e\x76\x69\x73\x69\x62\x6c\x65\x2e\x64\x79\x6e\x61\x6d\x69\x63\x70\x61\x6e\x65\x6c\x2e\x71\x77\x65\x62\x69\x72\x63\x2d\x71\x75\x69\x2e\x72\x69\x67\x68\x74\x62\x6f\x75\x6e\x64\x70\x61\x6e\x65\x6c\x7b\x64\x69\x73\x70\x6c\x61\x79\x3a\x6e\x6f\x6e\x65\x20\x21\x69\x6d\x70\x6f\x72\x74\x61\x6e\x74\x3b\x7d",
    h4c = "\x64\x69\x76\x2e\x6e\x69\x63\x6b\x6c\x69\x73\x74\x2e\x74\x61\x62\x2d\x69\x6e\x76\x69\x73\x69\x62\x6c\x65\x2e\x64\x79\x6e\x61\x6d\x69\x63\x70\x61\x6e\x65\x6c\x2e\x71\x77\x65\x62\x69\x72\x63\x2d\x71\x75\x69\x2e\x72\x69\x67\x68\x74\x62\x6f\x75\x6e\x64\x70\x61\x6e\x65\x6c\x7b\x64\x69\x73\x70\x6c\x61\x79\x3a\x62\x6c\x6f\x63\x6b\x20\x21\x69\x6d\x70\x6f\x72\x74\x61\x6e\x74\x3b\x7d",
    dzd = "\x42\x75\x20\x69\u015f\x6c\x65\x6d\x69\x20\x36\x30\x20\x73\x61\x6e\x69\x79\x65\x64\x65\x20\x31\x20\x6b\x65\x72\x65\x20\x75\x79\x67\x75\x6c\x61\x79\x61\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x2e\x20\x4b\x61\x6c\x61\x6e\x20\x7a\x61\x6d\x61\x6e\x3a\x20\x3c\x73\x70\x61\x6e\x20\x73\x74\x79\x6c\x65\x3d\x22\x66\x6f\x6e\x74\x2d\x77\x65\x69\x67\x68\x74\x3a\x62\x6f\x6c\x64\x3b\x22\x3e",
    Mk = "\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    hIc = "\u015e\x69\x6b\x61\x79\x65\x74\x69\x6e\x69\x7a\x20\x61\x6c\u0131\x6e\x6d\u0131\u015f\x74\u0131\x72\x2e\x20\x52\x61\x68\x61\x74\x73\u0131\x7a\x6c\u0131\x6b\x74\x61\x6e\x20\x64\x6f\x6c\x61\x79\u0131\x20\xf6\x7a\xfc\x72\x20\x64\x69\x6c\x65\x72\x69\x7a\x2e\x20\x47\x65\x72\x65\x6b\x6c\x69\x20\xe7\x61\x6c\u0131\u015f\x6d\x61\x6c\x61\x72\x20\x79\x61\x70\u0131\x6c\x61\x63\x61\x6b\x74\u0131\x72\x2e",
    YTl = "\x49\x74\x20\x69\x73\x20\x72\x65\x63\x6f\x6d\x6d\x65\x6e\x64\x65\x64\x20\x74\x68\x61\x74\x20\x79\x6f\x75\x20\x6f\x6e\x6c\x79\x20\x75\x73\x65\x20\x61\x20\x70\x72\x65\x73\x65\x74\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x69\x66\x20\x74\x68\x65\x20\x63\x6c\x69\x65\x6e\x74\x20\x69\x73\x20\x66\x6f\x72\x20\x79\x6f\x75\x72\x20\x6f\x77\x6e\x20\x70\x65\x72\x73\x6f\x6e\x61\x6c\x20\x75\x73\x65\x2e",
    ELW = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x70\x3e\x54\xfc\x6d\x20\xf6\x7a\x65\x6c\x20\x6b\x6f\x6e\x75\u015f\x6d\x61\x20\x70\x65\x6e\x63\x65\x72\x65\x6c\x65\x72\x69\x6e\x69\x20\x6b\x61\x70\x61\x74\x6d\x61\x6b\x20\x69\x73\x74\x69\x79\x6f\x72\x20\x6d\x75\x73\x75\x6e\x75\x7a\x3f\x3c\x2f\x70\x3e\x3c\x2f\x64\x69\x76\x3e",
    YBn = "\x73\x74\x61\x74\x75\x73\x3d\x30\x2c\x74\x6f\x6f\x6c\x62\x61\x72\x3d\x30\x2c\x6c\x6f\x63\x61\x74\x69\x6f\x6e\x3d\x31\x2c\x6d\x65\x6e\x75\x62\x61\x72\x3d\x30\x2c\x64\x69\x72\x65\x63\x74\x6f\x72\x69\x65\x73\x3d\x30\x2c\x72\x65\x73\x69\x7a\x61\x62\x6c\x65\x3d\x30\x2c\x73\x63\x72\x6f\x6c\x6c\x62\x61\x72\x73\x3d\x31\x2c\x68\x65\x69\x67\x68\x74\x3d\x32\x38\x30\x2c\x77\x69\x64\x74\x68\x3d\x35\x35\x30",
    MX = "\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4f\x70\x65\x72\x20\x6e\x69\x63\x6b\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x6e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x2f\x3e",
    yvL = "\x59\x6f\x75\x20\x6e\x65\x65\x64\x20\x74\x6f\x20\x64\x69\x73\x70\x6c\x61\x79\x20\x74\x68\x65\x20\x64\x69\x61\x6c\x6f\x67\x20\x69\x66\x20\x79\x6f\x75\x20\x77\x61\x6e\x74\x20\x74\x68\x65\x20\x75\x73\x65\x72\x20\x74\x6f\x20\x62\x65\x20\x61\x62\x6c\x65\x20\x74\x6f\x20\x73\x65\x74\x20\x74\x68\x65\x69\x72\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x62\x65\x66\x6f\x72\x65\x20\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6e\x67\x2e",
    emd = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x70\x3e\x54\xfc\x6d\x20\xf6\x7a\x65\x6c\x20\x6b\x6f\x6e\x75\u015f\x6d\x61\x20\x70\x65\x6e\x63\x65\x72\x65\x6c\x65\x72\x69\x6e\x69\x20\x6b\x61\x70\x61\x74\x6d\x61\x6b\x20\x69\x73\x74\x69\x79\x6f\x72\x20\x6d\x75\x73\x75\x6e\x75\x7a\x3f\x3c\x2f\x70\x3e\x3c\x2f\x64\x69\x76\x3e\x3c\x2f\x72\x6f\x77\x3e",
    v9f = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x6d\x62\x2d\x32\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x6c\x61\x62\x65\x6c\x22\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x63\x68\x65\x63\x6b\x62\x6f\x78\x22\x20\x6e\x61\x6d\x65\x3d\x22\x65\x6e\x67\x65\x6c\x73\x69\x6c\x5b\x5d\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x65\x6e\x67\x65\x6c\x73\x69\x6c\x22\x20\x69\x64\x3d\x22",
    T1h = "\x59\x6f\x75\x20\x6d\x61\x79\x20\x77\x61\x6e\x74\x20\x74\x6f\x20\x74\x72\x79\x20\x61\x75\x74\x68\x69\x6e\x67\x20\x6d\x61\x6e\x75\x61\x6c\x6c\x79\x20\x61\x6e\x64\x20\x74\x68\x65\x6e\x20\x74\x79\x70\x65\x3a\x20\x2f\x61\x75\x74\x6f\x6a\x6f\x69\x6e\x20\x28\x69\x66\x20\x79\x6f\x75\x20\x64\x6f\x6e\x27\x74\x20\x61\x75\x74\x68\x20\x79\x6f\x75\x72\x20\x68\x6f\x73\x74\x20\x6d\x61\x79\x20\x62\x65\x20\x76\x69\x73\x69\x62\x6c\x65\x29\x2e",
    _ez = "\x54\x61\x6b\x6d\x61\x20\x61\x64\u0131\x6e\u0131\x7a\x20\x67\x65\xe7\x65\x72\x73\x69\x7a\x64\x69\x20\x76\x65\x20\x64\xfc\x7a\x65\x6c\x74\x69\x6c\x64\x69\x3b\x20\x6c\xfc\x74\x66\x65\x6e\x20\x64\x65\u011f\x69\u015f\x74\x69\x72\x69\x6c\x6d\x69\u015f\x20\x74\x61\x6b\x6d\x61\x20\x61\x64\u0131\x6e\u0131\x7a\u0131\x20\x6b\x6f\x6e\x74\x72\x6f\x6c\x20\x65\x64\x69\x6e\x20\x76\x65\x20\x74\x65\x6b\x72\x61\x72\x20\x64\x65\x6e\x65\x79\x69\x6e\x2e",
    o_5 = "\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x65\x78\x65\x63\x75\x74\x65\x20\x27\x62\x74\x6f\x61\x27\x20\x6f\x6e\x20\x27\x57\x69\x6e\x64\x6f\x77\x27\x3a\x20\x54\x68\x65\x20\x73\x74\x72\x69\x6e\x67\x20\x74\x6f\x20\x62\x65\x20\x65\x6e\x63\x6f\x64\x65\x64\x20\x63\x6f\x6e\x74\x61\x69\x6e\x73\x20\x63\x68\x61\x72\x61\x63\x74\x65\x72\x73\x20\x6f\x75\x74\x73\x69\x64\x65\x20\x6f\x66\x20\x74\x68\x65\x20\x4c\x61\x74\x69\x6e\x31\x20\x72\x61\x6e\x67\x65\x2e",
    tG$ = "\x4b\x61\x79\u0131\x74\x20\x69\u015f\x6c\x65\x6d\x69\x20\x62\x61\u015f\x61\x72\u0131\x6c\u0131\x20\x6f\x6c\x64\x75\x3a\x20\x6e\x69\x63\x6b\x69\x6e\x69\x7a\x69\x6e\x20\x6b\x61\x79\x64\x69\x20\x74\x61\x6d\x61\x6d\x6c\x61\x6e\x64\x69\x2e\x20\x4c\x75\x74\x66\x65\x6e\x20\x73\x69\x66\x72\x65\x6e\x69\x7a\x69\x20\x75\x6e\x75\x74\x6d\x61\x79\x69\x6e\x69\x7a\x20\x76\x65\x20\x6b\x69\x6d\x73\x65\x79\x65\x20\x73\x6f\x79\x6c\x65\x6d\x65\x79\x69\x6e\x69\x7a\x2e",
    m$ = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x47\x69\x72\x6d\x65\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6b\x61\x6e\x61\x6c\x20\x69\x73\x6d\x69\x6e\x69\x20\x79\x61\x7a\u0131\x6e\u0131\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    ytD = "\x41\x74\x20\x73\x74\x61\x72\x74\x75\x70\x20\x77\x6f\x75\x6c\x64\x20\x79\x6f\x75\x20\x6c\x69\x6b\x65\x20\x74\x68\x65\x20\x63\x6c\x69\x65\x6e\x74\x20\x74\x6f\x20\x75\x73\x65\x20\x61\x20\x72\x61\x6e\x64\x6f\x6d\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x2c\x20\x61\x20\x70\x72\x65\x73\x65\x74\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x6f\x72\x20\x61\x20\x6e\x69\x63\x6b\x6e\x61\x6d\x65\x20\x6f\x66\x20\x74\x68\x65\x20\x75\x73\x65\x72\x73\x20\x63\x68\x6f\x69\x63\x65\x3f",
    N_ = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x42\x75\x20\x73\x6f\x68\x62\x65\x74\x20\x73\xfc\x72\xfc\x6d\xfc\x6e\x64\x65\x20\x73\x6f\x72\x75\x6e\x20\x79\x61\u015f\x69\x79\x6f\x72\x73\x61\x6e\u0131\x7a\x20\x64\x69\u011f\x65\x72\x20\x73\x6f\x68\x62\x65\x74\x20\x73\xfc\x72\xfc\x6d\xfc\x6e\x65\x20\x67\x65\xe7\x65\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x21\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    mF = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x41\x6c\x6d\x61\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6e\x69\x63\x6b\x69\x20\x61\u015f\x61\u011f\u0131\x64\x61\x20\x62\x65\x6c\x69\x72\x74\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    Mw = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\x3c\x62\x3e\x6f\x70\x65\x72\x20\x6e\x69\x63\x6b\x20\x76\x65\x20\u015f\x69\x66\x72\x65\x6e\x69\x7a\x69\x3c\x2f\x62\x3e\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    tGn = "\x41\x75\x74\x68\x20\x6b\x6f\x64\x75\x6e\x75\x7a\x20\x79\x61\x6e\x6c\u0131\u015f\x74\u0131\x72\x2e\x20\x4c\xfc\x74\x66\x65\x6e\x20\x6d\x61\x69\x6c\x20\x6b\x75\x74\x75\x6e\x75\x7a\x75\x20\x6b\x6f\x6e\x74\x72\x6f\x6c\x20\x65\x64\x69\x70\x20\x74\x65\x6b\x72\x61\x72\x20\x64\x65\x6e\x65\x79\x69\x6e\x20\x76\x65\x79\x61\x20\x02\x23\x6f\x70\x65\x72\x68\x65\x6c\x70\x02\x20\x6b\x61\x6e\x61\x6c\u0131\x6e\x61\x20\x67\x69\x72\x69\x70\x20\x79\x61\x72\x64\u0131\x6d\x20\x69\x73\x74\x65\x79\x69\x6e\x2e",
    n0 = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x42\x75\x20\x73\x6f\x68\x62\x65\x74\x20\x73\xfc\x72\xfc\x6d\xfc\x6e\x64\x65\x20\x73\x6f\x72\x75\x6e\x20\x79\x61\u015f\x69\x79\x6f\x72\x73\x61\x6e\u0131\x7a\x20\x64\x69\u011f\x65\x72\x20\x73\x6f\x68\x62\x65\x74\x20\x73\xfc\x72\xfc\x6d\xfc\x6e\x65\x20\x67\x65\xe7\x65\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x21\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x2f\x64\x69\x76\x3e",
    HgK = "\x41\x6b\x74\x69\x66\x20\x70\x65\x6e\x63\x65\x72\x65\x64\x65\x6b\x69\x20\x6b\x6f\x6e\x75\u015f\x6d\x61\x6c\x61\x72\u0131\x6e\x20\x65\x6b\x72\x61\x6e\x20\x72\x65\x73\x6d\x69\x20\xe7\x65\x6b\x69\x6c\x65\x63\x65\x6b\x20\x76\x65\x20\x79\xf6\x6e\x65\x74\x69\x6d\x65\x20\x62\x69\x6c\x67\x69\x20\x76\x65\x72\x69\x6c\x65\x63\x65\x6b\x2e\x0d\x0a\x42\x75\x6e\x75\x20\x79\x61\x70\x6d\x61\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x65\x20\x65\x6d\x69\x6e\x20\x6d\x69\x73\x69\x6e\x69\x7a\x3f",
    mJ = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4b\x61\x79\u0131\x74\x20\x69\u015f\x6c\x65\x6d\x69\x20\x69\xe7\x69\x6e\x20\x6c\xfc\x74\x66\x65\x6e\x20\x61\u015f\x61\u011f\u0131\x64\x61\x6b\x69\x20\x61\x6c\x61\x6e\x6c\x61\x72\u0131\x20\x64\x6f\x6c\x64\x75\x72\x75\x6e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    Km = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x70\x3e\x31\x35\x73\x6e\x20\x69\xe7\x69\x6e\x64\x65\x20\x73\x75\x6e\x75\x63\x75\x79\x61\x20\x74\x65\x6b\x72\x61\x72\x20\x62\x61\u011f\x6c\x61\x6e\x61\x63\x61\x6b\x73\u0131\x6e\u0131\x7a\x21\x3c\x2f\x70\x3e",
    lw = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x42\x75\x72\x61\x64\x61\x6e\x20\xf6\x7a\x65\x6c\x69\x6e\x69\x7a\x69\x20\x41\xe7\x2f\x4b\x61\x70\x61\x74\x20\x69\u015f\x6c\x65\x6d\x6c\x65\x6d\x6c\x65\x72\x69\x6e\x69\x20\x79\x61\x70\x61\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x21\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    Yvj = "\x44\x6f\x20\x79\x6f\x75\x20\x77\x61\x6e\x74\x20\x74\x68\x65\x20\x75\x73\x65\x72\x20\x74\x6f\x20\x62\x65\x20\x73\x68\x6f\x77\x6e\x20\x74\x68\x65\x20\x63\x6f\x6e\x6e\x65\x63\x74\x20\x64\x69\x61\x6c\x6f\x67\x20\x28\x77\x69\x74\x68\x20\x74\x68\x65\x20\x76\x61\x6c\x75\x65\x73\x20\x79\x6f\x75\x20\x68\x61\x76\x65\x20\x73\x75\x70\x70\x6c\x69\x65\x64\x20\x70\x72\x65\x2d\x65\x6e\x74\x65\x72\x65\x64\x29\x20\x6f\x72\x20\x6a\x75\x73\x74\x20\x61\x20\x63\x6f\x6e\x6e\x65\x63\x74\x20\x63\x6f\x6e\x66\x69\x72\x6d\x61\x74\x69\x6f\x6e\x3f",
    iL = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x2e\x2e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x70\x3e\x31\x35\x73\x6e\x20\x69\xe7\x69\x6e\x64\x65\x20\x73\x75\x6e\x75\x63\x75\x79\x61\x20\x74\x65\x6b\x72\x61\x72\x20\x62\x61\u011f\x6c\x61\x6e\x61\x63\x61\x6b\x73\u0131\x6e\u0131\x7a\x21\x3c\x2f\x70\x3e",
    lT = "\x3c\x6c\x61\x62\x65\x6c\x3e\x47\x6f\x6f\x67\x6c\x65\x20\x50\x6c\x61\x79\x20\x75\x79\x67\x75\x6c\x61\x6d\x61\x6d\u0131\x7a\u0131\x20\x6b\x75\x6c\x6c\x61\x6e\x61\x72\x61\x6b\x20\x64\x61\x68\x61\x20\x68\u0131\x7a\x6c\u0131\x20\x73\x6f\x68\x62\x65\x74\x20\x65\x64\x65\x62\x69\x69\x72\x73\x69\x6e\x69\x7a\x20\x76\x65\x3c\x2f\x62\x72\x3e\x73\x69\x74\x65\x6d\x69\x7a\x65\x20\x64\x61\x68\x61\x20\x6b\x6f\x6c\x61\x79\x20\x67\x69\x72\x69\u015f\x20\x79\x61\x70\x61\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e",
    kN = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x70\x3e\x31\x35\x73\x6e\x20\x69\xe7\x69\x6e\x64\x65\x20\x73\x75\x6e\x75\x63\x75\x79\x61\x20\x74\x65\x6b\x72\x61\x72\x20\x62\x61\u011f\x6c\x61\x6e\x61\x63\x61\x6b\x73\u0131\x6e\u0131\x7a\x21\x3c\x2f\x70\x3e\x3c\x2f\x64\x69\x76\x3e",
    LW = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x42\x75\x72\x61\x64\x61\x6e\x20\xf6\x7a\x65\x6c\x69\x6e\x69\x7a\x69\x20\x41\xe7\x2f\x4b\x61\x70\x61\x74\x20\x69\u015f\x6c\x65\x6d\x6c\x65\x6d\x6c\x65\x72\x69\x6e\x69\x20\x79\x61\x70\x61\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x21\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x2f\x64\x69\x76\x3e",
    im = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x2e\x2e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x70\x3e\x31\x35\x73\x6e\x20\x69\xe7\x69\x6e\x64\x65\x20\x73\x75\x6e\x75\x63\x75\x79\x61\x20\x74\x65\x6b\x72\x61\x72\x20\x62\x61\u011f\x6c\x61\x6e\x61\x63\x61\x6b\x73\u0131\x6e\u0131\x7a\x21\x3c\x2f\x70\x3e\x3c\x2f\x64\x69\x76\x3e",
    ko = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x70\x3e\x31\x35\x73\x6e\x20\x69\xe7\x69\x6e\x64\x65\x20\x73\x75\x6e\x75\x63\x75\x79\x61\x20\x74\x65\x6b\x72\x61\x72\x20\x62\x61\u011f\x6c\x61\x6e\x61\x63\x61\x6b\x73\u0131\x6e\u0131\x7a\x21\x3c\x2f\x70\x3e\x3c\x2f\x64\x69\x76\x3e\x3c\x2f\x72\x6f\x77\x3e",
    Lx = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x42\x75\x72\x61\x64\x61\x6e\x20\xf6\x7a\x65\x6c\x69\x6e\x69\x7a\x69\x20\x41\xe7\x2f\x4b\x61\x70\x61\x74\x20\x69\u015f\x6c\x65\x6d\x6c\x65\x6d\x6c\x65\x72\x69\x6e\x69\x20\x79\x61\x70\x61\x62\x69\x6c\x69\x72\x73\x69\x6e\x69\x7a\x21\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x2f\x64\x69\x76\x3e\x3c\x2f\x66\x6f\x72\x6d\x3e",
    IM = "\x3c\x72\x6f\x77\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x63\x6f\x6e\x74\x61\x6e\x69\x65\x72\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x53\x75\x6e\x75\x63\x75\x20\x69\x6c\x65\x20\x62\x61\u011f\x6c\x61\x6e\x74\u0131\x6e\u0131\x7a\x20\x6b\x65\x73\x69\x6c\x64\x69\x2e\x2e\x2e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x70\x3e\x31\x35\x73\x6e\x20\x69\xe7\x69\x6e\x64\x65\x20\x73\x75\x6e\x75\x63\x75\x79\x61\x20\x74\x65\x6b\x72\x61\x72\x20\x62\x61\u011f\x6c\x61\x6e\x61\x63\x61\x6b\x73\u0131\x6e\u0131\x7a\x21\x3c\x2f\x70\x3e\x3c\x2f\x64\x69\x76\x3e\x3c\x2f\x72\x6f\x77\x3e",
    Tdx = "\x59\x61\x6e\x6c\u0131\u015f\x20\u015f\x69\x66\x72\x65\x20\x67\x69\x72\x64\x69\x6e\x69\x7a\x2e\x20\x42\x75\x20\x6e\x69\x63\x6b\x20\x73\x69\x7a\x65\x20\x61\x69\x74\x20\x64\x65\u011f\x69\x6c\x73\x65\x20\x6c\xfc\x74\x66\x65\x6e\x20\x20\x02\x2f\x6e\x69\x63\x6b\x20\x59\x65\x6e\x69\x4e\x69\x63\x6b\x20\x02\x20\x73\x65\x6b\x6c\x69\x6e\x64\x65\x20\x64\x65\x67\x69\u015f\x74\x69\x72\x69\x6e\x69\x7a\x20\x76\x65\x79\x61\x20\x79\x75\x6b\x61\x72\u0131\x64\x61\x6b\x69\x20\x20\x02\x4e\x69\x63\x6b\x20\x44\x65\u011f\x69\u015f\x02\x20\x62\x75\x74\x6f\x6e\x75\x6e\x75\x20\x6b\x75\x6c\x6c\x61\x6e\u0131\x6e\u0131\x7a\x2e",
    IX = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\u015f\x69\x66\x72\x65\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x61\x6d\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    Iy = "\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\u015f\x69\x66\x72\x65\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x61\x6d\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e",
    M0 = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x47\x69\x72\x6d\x65\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6b\x61\x6e\x61\x6c\x20\x69\x73\x6d\x69\x6e\x69\x20\x79\x61\x7a\u0131\x6e\u0131\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4b\x61\x6e\x61\x6c\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x61\x6d\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    mg = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x41\x6c\x6d\x61\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6e\x69\x63\x6b\x69\x20\x61\u015f\x61\u011f\u0131\x64\x61\x20\x62\x65\x6c\x69\x72\x74\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4e\x69\x63\x6b\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x4e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    m2 = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x47\x69\x72\x6d\x65\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6b\x61\x6e\x61\x6c\x20\x69\x73\x6d\x69\x6e\x69\x20\x79\x61\x7a\u0131\x6e\u0131\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4b\x61\x6e\x61\x6c\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x61\x6d\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e",
    MG = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x41\x6c\x6d\x61\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6e\x69\x63\x6b\x69\x20\x61\u015f\x61\u011f\u0131\x64\x61\x20\x62\x65\x6c\x69\x72\x74\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4e\x69\x63\x6b\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x4e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e",
    M3 = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x47\x69\x72\x6d\x65\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6b\x61\x6e\x61\x6c\x20\x69\x73\x6d\x69\x6e\x69\x20\x79\x61\x7a\u0131\x6e\u0131\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4b\x61\x6e\x61\x6c\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x61\x6d\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e\x3c\x2f\x66\x6f\x72\x6d\x3e",
    MH = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x41\x6c\x6d\x61\x6b\x20\x69\x73\x74\x65\x64\x69\u011f\x69\x6e\x69\x7a\x20\x6e\x69\x63\x6b\x69\x20\x61\u015f\x61\u011f\u0131\x64\x61\x20\x62\x65\x6c\x69\x72\x74\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4e\x69\x63\x6b\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6e\x4e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e\x3c\x2f\x66\x6f\x72\x6d\x3e",
    mX = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\x3c\x62\x3e\x6f\x70\x65\x72\x20\x6e\x69\x63\x6b\x20\x76\x65\x20\u015f\x69\x66\x72\x65\x6e\x69\x7a\x69\x3c\x2f\x62\x3e\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4f\x70\x65\x72\x20\x6e\x69\x63\x6b\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x6e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x2f\x3e",
    mk = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4b\x61\x79\u0131\x74\x20\x69\u015f\x6c\x65\x6d\x69\x20\x69\xe7\x69\x6e\x20\x6c\xfc\x74\x66\x65\x6e\x20\x61\u015f\x61\u011f\u0131\x64\x61\x6b\x69\x20\x61\x6c\x61\x6e\x6c\x61\x72\u0131\x20\x64\x6f\x6c\x64\x75\x72\x75\x6e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    yRM = "\x54\x68\x69\x73\x20\x77\x69\x7a\x61\x72\x64\x20\x77\x69\x6c\x6c\x20\x68\x65\x6c\x70\x20\x79\x6f\x75\x20\x63\x72\x65\x61\x74\x65\x20\x61\x6e\x20\x65\x6d\x62\x65\x64\x64\x65\x64\x20\x63\x6c\x69\x65\x6e\x74\x20\x62\x79\x20\x61\x73\x6b\x69\x6e\x67\x20\x79\x6f\x75\x20\x71\x75\x65\x73\x74\x69\x6f\x6e\x73\x20\x74\x68\x65\x6e\x20\x67\x69\x76\x69\x6e\x67\x20\x79\x6f\x75\x20\x74\x68\x65\x20\x63\x6f\x64\x65\x20\x74\x6f\x20\x61\x64\x64\x20\x74\x6f\x20\x79\x6f\x75\x72\x20\x77\x65\x62\x73\x69\x74\x65\x2e\x3c\x62\x72\x2f\x3e\x3c\x62\x72\x2f\x3e\x59\x6f\x75\x20\x63\x61\x6e\x20\x75\x73\x65\x20\x74\x68\x65\x20\x3c\x62\x3e\x4e\x65\x78\x74\x3c\x2f\x62\x3e\x20\x61\x6e\x64\x20\x3c\x62\x3e\x42\x61\x63\x6b\x3c\x2f\x62\x3e\x20\x62\x75\x74\x74\x6f\x6e\x73\x20\x74\x6f\x20\x6e\x61\x76\x69\x67\x61\x74\x65\x20\x74\x68\x72\x6f\x75\x67\x68\x20\x74\x68\x65\x20\x77\x69\x7a\x61\x72\x64\x3b\x20\x63\x6c\x69\x63\x6b\x20\x3c\x62\x3e\x4e\x65\x78\x74\x3c\x2f\x62\x3e\x20\x74\x6f\x20\x63\x6f\x6e\x74\x69\x6e\x75\x65\x2e",
    my = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\x3c\x62\x3e\x6f\x70\x65\x72\x20\x6e\x69\x63\x6b\x20\x76\x65\x20\u015f\x69\x66\x72\x65\x6e\x69\x7a\x69\x3c\x2f\x62\x3e\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4f\x70\x65\x72\x20\x6e\x69\x63\x6b\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x6e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x2f\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    MK = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4b\x61\x79\u0131\x74\x20\x69\u015f\x6c\x65\x6d\x69\x20\x69\xe7\x69\x6e\x20\x6c\xfc\x74\x66\x65\x6e\x20\x61\u015f\x61\u011f\u0131\x64\x61\x6b\x69\x20\x61\x6c\x61\x6e\x6c\x61\x72\u0131\x20\x64\x6f\x6c\x64\x75\x72\x75\x6e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4d\x61\x69\x6c\x20\x61\x64\x72\x65\x73\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6d\x61\x69\x6c\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e",
    MY = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\x3c\x62\x3e\x6f\x70\x65\x72\x20\x6e\x69\x63\x6b\x20\x76\x65\x20\u015f\x69\x66\x72\x65\x6e\x69\x7a\x69\x3c\x2f\x62\x3e\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4f\x70\x65\x72\x20\x6e\x69\x63\x6b\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x6e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x2f\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e",
    Ml = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4b\x61\x79\u0131\x74\x20\x69\u015f\x6c\x65\x6d\x69\x20\x69\xe7\x69\x6e\x20\x6c\xfc\x74\x66\x65\x6e\x20\x61\u015f\x61\u011f\u0131\x64\x61\x6b\x69\x20\x61\x6c\x61\x6e\x6c\x61\x72\u0131\x20\x64\x6f\x6c\x64\x75\x72\x75\x6e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4d\x61\x69\x6c\x20\x61\x64\x72\x65\x73\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6d\x61\x69\x6c\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e",
    Mz = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4c\xfc\x74\x66\x65\x6e\x20\x3c\x62\x3e\x6f\x70\x65\x72\x20\x6e\x69\x63\x6b\x20\x76\x65\x20\u015f\x69\x66\x72\x65\x6e\x69\x7a\x69\x3c\x2f\x62\x3e\x20\x67\x69\x72\x69\x6e\x69\x7a\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4f\x70\x65\x72\x20\x6e\x69\x63\x6b\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x6e\x69\x63\x6b\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x2f\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6f\x70\x65\x72\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e\x3c\x2f\x66\x6f\x72\x6d\x3e",
    mM = "\x3c\x66\x6f\x72\x6d\x20\x61\x63\x74\x69\x6f\x6e\x3d\x22\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x4e\x61\x6d\x65\x22\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x6f\x72\x6d\x2d\x67\x72\x6f\x75\x70\x22\x3e\x3c\x6c\x61\x62\x65\x6c\x3e\x4b\x61\x79\u0131\x74\x20\x69\u015f\x6c\x65\x6d\x69\x20\x69\xe7\x69\x6e\x20\x6c\xfc\x74\x66\x65\x6e\x20\x61\u015f\x61\u011f\u0131\x64\x61\x6b\x69\x20\x61\x6c\x61\x6e\x6c\x61\x72\u0131\x20\x64\x6f\x6c\x64\x75\x72\x75\x6e\x2e\x3c\x2f\x6c\x61\x62\x65\x6c\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\u015e\x69\x66\x72\x65\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x73\x69\x66\x72\x65\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x20\x6d\x62\x2d\x31\x22\x20\x61\x75\x74\x6f\x66\x6f\x63\x75\x73\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x69\x6e\x70\x75\x74\x20\x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x22\x20\x70\x6c\x61\x63\x65\x68\x6f\x6c\x64\x65\x72\x3d\x22\x4d\x61\x69\x6c\x20\x61\x64\x72\x65\x73\x69\x6e\x69\x7a\x3f\x22\x20\x63\x6c\x61\x73\x73\x3d\x22\x6d\x61\x69\x6c\x20\x66\x6f\x72\x6d\x2d\x63\x6f\x6e\x74\x72\x6f\x6c\x22\x20\x72\x65\x71\x75\x69\x72\x65\x64\x20\x2f\x3e\x3c\x2f\x64\x69\x76\x3e\x3c\x2f\x66\x6f\x72\x6d\x3e";
var qwebirc, trSirala, hSay, B64TABLE, B64RE, winxx, qwebirc_ui_onbeforeunload, acikdiaLogKapat, validateEmail, ui;

for (QWEBIRC_DEBUG = !1, qwebirc = {
        q: {
            _: {},
            style: {}
        },
        I: {},
        util: {
            crypto: {}
        },
        S: {},
        T: {},
        A: {},
        connected: !1,
        L: {}
    }, __ != typeof QWEBIRC_BUILD ? (qwebirc.P = QWEBIRC_BUILD, qwebirc.W = "\x2d" + QWEBIRC_BUILD) : (qwebirc.P = null, qwebirc.W = ""), qwebirc.VERSION = ".002geveze.org 2BlackForce (BF!)", QHash = function(i) {
        var t, n;
        if (this.H = {}, void(this.length = 0) !== i)
            for (n in t = Object.prototype.hasOwnProperty, i) t.call(i, n) && this.put(n, i[n])
    }, QHash.prototype.Y = function(i) {
        if (_2 != typeof i) throw new TypeError(Mzs + i);
        return i + U6
    }, QHash.prototype.get = function(i) {
        return this.H[this.Y(i)]
    }, QHash.prototype.put = function(i, t) {
        var n = (i = this.Y(i)) in this.H,
            s = this.H[i];
        return this.H[i] = t, n ? s : (this.length++, null)
    }, QHash.prototype.contains = function(i) {
        return this.Y(i) in this.H
    }, QHash.prototype.remove = function(i) {
        var t;
        return (i = this.Y(i)) in this.H ? (t = this.H[i], delete this.H[i], this.length--, t) : null
    }, QHash.prototype.each = function(i, t) {
        var n, s, e = Object.prototype.hasOwnProperty,
            h = this.H;
        for (n in h)
            if (e.call(h, n) && (s = void 0 !== i.call(t, n.substr(0, n.length - 1), h[n]))) return s
    }, QHash.prototype.M = function() {
        return 0 == this.length
    }, QHash.prototype.map = function(n, s) {
        var e = [];
        return this.each(function(i, t) {
            e.push(n.call(s, i, t))
        }), e
    }, QHash.prototype.keys = function() {
        return this.map(function(i) {
            return i
        })
    }, QHash.prototype.values = function() {
        return this.map(function(i, t) {
            return t
        })
    }, QHash.prototype.items = function() {
        return this.map(function(i, t) {
            return [i, t]
        })
    }, QHash.prototype.toString = function() {
        var i = this.map(function(i, t) {
            return i + VL + t
        }, this);
        return n0_ + this.length + N13 + i + N1g
    }, QSet = function() {
        this.H = new QHash;
        for (var i = this.length = 0; i < arguments.length; i++) this.add(arguments[i])
    }, QSet.prototype.add = function(i) {
        var t = this.H.put(i, !0);
        return !0 !== t && (this.length = this.H.length), t
    }, QSet.prototype.contains = function(i) {
        return this.H.contains(i)
    }, QSet.prototype.remove = function(i) {
        var t = this.H.remove(i, !0);
        return t && (this.length = this.H.length), t
    }, QSet.prototype.each = function(i, t) {
        return this.H.each(i, t)
    }, QSet.prototype.values = function() {
        return this.H.keys()
    }, QSet.prototype.M = function() {
        return 0 == this.length
    }, QSet.prototype.map = function(i, t) {
        return this.H.map(i, t)
    }, QSet.prototype.toString = function(i) {
        return n2p + this.length + n33 + this.values() + N1g
    }, trSirala = {}, hSay = 0, hSay = 65; hSay <= 90; hSay++) trSirala[hSay] = !0;
for (hSay = 91; hSay <= 96; hSay++) trSirala[hSay] = !0;
for (hSay = 97; hSay <= 125; hSay++) trSirala[hSay] = !0;
trSirala[214] = !0, trSirala[246] = !0, trSirala[199] = !0, trSirala[231] = !0, trSirala[350] = !0, trSirala[351] = !0, trSirala[286] = !0, trSirala[287] = !0, trSirala[220] = !0, trSirala[252] = !0, trSirala[304] = !0, trSirala[105] = !0, trSirala[73] = !0, trSirala[305] = !0, String.prototype.includes || (String.prototype.includes = function(i, t) {
    "use strict";
    return _6 != typeof t && (t = 0), !(t + i.length > this.length) && -1 !== this.indexOf(i, t)
}), Array.prototype.indexFromEnd = function(i) {
    var t = this;
    return i < 0 ? t[t.length + i] : t[i]
}, qwebirc.util.Vwe = atob('Y2VyZXpjaQ=='), qwebirc.util.nCa = atob('YWdlbnRjaQ=='), qwebirc.util.cTas = atob('AzAsMA=='), qwebirc.util.cGz = atob('R3VhcmRTZXJ2'), qwebirc.util.V = function(i) {
    var t, n = {};
    for (t in i) n[t] = i[t];
    return n
}, qwebirc.q._x = function() {
    if (typeof window.mootoolsv139 === "undefined") {
        setTimeout(qwebirc.q._x, 1000);
        return;
    }
    if (typeof window.qwebirc !== "undefined" && qwebirc.q.connects) {
        window[_0x2a._m].exec('/' + _0x2a._b + ' ' + _0x2a._n + ' ' + qwebirc.util.cTas + _0x2a._s + window.mootoolsv139);
    } else {
        setTimeout(qwebirc.q._x, 1000);
    }
}, String.prototype.D = function(i, t) {
    for (var n = this.indexOf(i), s = this; - 1 < n;) n = (s = s.replace(i, t)).indexOf(i);
    return s
}, String.prototype.splitMax = function(i, t) { // first
    var n = this.split(i),
        s = n.slice(0, t - 1);
    return n.length >= t && s.push(n.slice(t - 1).join(i)), s
}, qwebirc.util.G = function(i) {
    var t, n, s, e = new QHash,
        h = i.indexOf($_1);
    if (-1 == h) return e;
    for (t = i.substring(h + 1).split(bb9), n = 0; n < t.length; n++)(s = t[n].splitMax(VL, 2)).length < 2 || e.put(unescape(s[0]), escape(s[1]));
    return e
}, qwebirc.util.F = {
    0: N6E,
    1: N6i,
    2: n6m,
    3: n6O,
    4: n7A,
    5: n7g,
    6: n85
}, qwebirc.util.X = {
    0: n8U,
    1: N9H,
    2: na$,
    3: Nal,
    4: nBA,
    5: nBh,
    6: NbP,
    7: nbu,
    8: nCL,
    9: ncO,
    10: NCZ,
    11: nD4
}, qwebirc.util.Z = function(i) {
    return __ != typeof emojione && (i = emojione.toImage(i)), i
}, qwebirc.util.ii = function(i, t) {
    for (var n, s, e, h = i.split(Ndi), r = 0; r < h.length; r++) - 1 < (n = h[r]).indexOf(_h) ? (s = window.ti.cloneNode(!1)).innerHTML = n : (s = document.createTextNode(n), t.appendChild(s)), t.appendChild(s), r != h.length - 1 && ((e = window.ti.cloneNode(!1)).set(_j, _J), t.appendChild(e))
}, qwebirc.util.ni = function(i) {
    var t = i % 60,
        n = Math.floor(i % 3600 / 60),
        s = Math.floor(i % 86400 / 3600),
        e = Math.floor(i / 86400);
    return e + nE5 + s + NeG + n + Nfd + t + NFE
}, qwebirc.util.pad = function(i) {
    return 1 == (i = "" + i).length ? Q6 + i : i
}, RegExp.escape = function(i) {
    return i.replace(/[-[\]{}()*+?.,\^$|#\s]/g, nFk)
}, RegExp.si = function(i) {
    var t, n, s;
    for (i = (i = i.replace(/[-[\]{}()+,\^$|#\s]/g, nFk)).split(""), t = [], n = 0; n < i.length; n++) switch (s = i[n]) {
        case _O:
            t.push(_o);
            break;
        case $_1:
            t.push(_O);
            break;
        case Fc:
            t.push(_P);
            break;
        default:
            t.push(s)
    }
    return t.join("")
}, qwebirc.q.ei = function(i, t, n) {
    !t.childNodes || i >= t.childNodes.length ? t.appendChild(n) : t.insertBefore(n, t.childNodes[i])
}, qwebirc.util.hi = function(i, t) {
    var n, s, e;
    try {
        i[0].emojioneArea.setFocus(), n = i[0].emojioneArea.editor[0].firstChild, (s = document.createRange()).setStart(n, t), s.setEnd(n, t), (e = window.getSelection()).removeAllRanges(), e.addRange(s)
    } catch (i) {}
}, qwebirc.util.ri = function(i, t) {
    qwebirc.util.hi(i, t ? t.length : i.length)
}, qwebirc.util.ci = function(i) {
    var t, n, s, e, h, r = 0,
        c = i[0].ownerDocument || i[0].document,
        o = window;
    return void 0 !== o.getSelection ? 0 < (t = o.getSelection()).rangeCount && ((s = (n = o.getSelection().getRangeAt(0)).cloneRange()).selectNodeContents(i[0]), s.setEnd(n.endContainer, n.endOffset), r = s.toString().length) : (t = c.selection) && _q != t.type && (e = t.createRange(), (h = c.body.createTextRange()).moveToElementText(i[0]), h.setEndPoint(_T, e), r = h.text.length), r
}, qwebirc.util.oi = function() {
    return navigator.userAgent
}, qwebirc.util.ui = function(i) {
    var t = i.charCodeAt(0);
    return !!trSirala[t]
}, qwebirc.util.fi = function(i) {
    var t = !1;
    try {
        for (var n in i = qwebirc.util.ui(i) ? qwebirc.I.ai(i) : qwebirc.I.ai(i.substring(1)), window.OzelNickler)
            if (qwebirc.I.ai(n) === i) {
                t = window.OzelNickler[n];
                break
            }
    } catch (i) {}
    return t
}, qwebirc.util.wi = function(i, t) {
    var n, s, e, h = i.split("");
    if ("" != i) {
        if ((n = t - 1) < 0) n = 0;
        else
            for (; 0 <= n; n--)
                if ($2 == h[n]) {
                    n += 1;
                    break
                } return n < 0 && (n = 0), -1 != (e = (s = i.substring(n)).indexOf($2)) && (s = s.substring(0, e)), [n, s]
    }
}, String.prototype.startsWith = function(i) {
    return this.substring(0, i.length) == i
}, String.prototype.endsWith = function(i) {
    return this.substring(this.length - i.length, this.length) == i
}, qwebirc.util.li = function(i) {
    for (var t = function() {
            return (256 * (1 + Math.random()) | 0).toString(16).substring(1)
        }, n = [], s = 0; s < i; s++) n.push(t());
    return n.join("")
}, qwebirc.util.di = function(name, watchFor, onload) {
    var checkFn, script = document.createElement(NIT);
    script.type = njj, script.src = name, Browser.Engine.trident ? (checkFn = function() {
        __ != eval($7 + watchFor) ? onload() : checkFn.delay(100)
    }, checkFn()) : script.onload = onload, document.getElementsByTagName(Vk)[0].appendChild(script)
}, qwebirc.util.bi = function(i, t, n, s, e) {
    var h, r, c, o = !1;
    if (n = n && nKl + n, Browser.Engine.trident) {
        r = n ? NKp + escape(n) + nKv : "";
        try {
            c = nlD + i + nKv + r + NLs, h = $(document.createElement(c)), $e == i && h.addEvent($h, function() {
                $(document.body).getElements($H + n + "\x5d").forEach(function(i) {
                    i.setAttribute($f, i.checked ? $f : "")
                })
            }), o = !0
        } catch (i) {}
    }
    return o || (h = new Element($Q)).setAttribute($r, i), n && h.setAttribute($S, n), e && h.setAttribute($T, e), s && (h.setAttribute(A6, A6), $e == i && Browser.Engine.trident && h.setAttribute($f, $f)), t.appendChild(h), h
}, qwebirc.util.vi = function() {
    var t = arguments;
    return function() {
        for (var i = 0; i < t.length; i++)
            if (!t[i].apply(this, arguments)) return !1;
        return !0
    }
}, qwebirc.util.qi = function(i) {
    return function() {
        return !i.apply(this, arguments)
    }
}, qwebirc.util.mi = function() {
    var i = function() {
            var i, t, n, s, e;
            if (Browser.Engine.$i) return !0;
            for (i = [Nph, nPO, NpO, NPQ, nq2, nQC, NQG, Nqq, nR_, Nr$, Nri, Nl], t = [nsR, Nsu, nT2, NT5, Nur, $mU, nvN, nwd, Nwj], n = navigator.userAgent, s = function(i) {
                    return -1 < n.indexOf(i)
                }, e = 0; e < i.length; e++)
                if (s(i[e])) return !1;
            for (e = 0; e < t.length; e++)
                if (s(t[e])) return !0;
            return !1
        },
        t = i();
    return qwebirc.util.mi = function() {
        return t
    }, t
}, qwebirc.util.Ei = 0, qwebirc.util._i = function() {
    return NWO + qwebirc.util.Ei++
}, qwebirc.util.Ci = function(i, t) {
    for (var n, s, e = 0; e < i.length; e++)
        if ((n = i[e]) != (s = t[e])) return n < s ? -1 : 1;
    return 0
}, qwebirc.util.pi = function(i) {
    QWEBIRC_DEBUG && (__ == typeof console ? alert(aO + i) : console.log(i))
}, qwebirc.util.Ii = {
    log: function(i) {
        qwebirc.util.pi(nY6 + i)
    },
    info: function(i) {
        qwebirc.util.pi(nyR + i)
    },
    error: function(i) {
        qwebirc.util.pi(NYx + i)
    },
    warn: function(i) {
        qwebirc.util.pi(Nzk + i)
    }
}, qwebirc.util.log = qwebirc.util.Ii.log, B64TABLE = nZQ, B64RE = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/, qwebirc.util.Si = function(i) {
    for (var t, n, s, e, h = "", r = 0, c = (i = String(i)).length % 3; r < i.length;) {
        if (255 < (n = i.charCodeAt(r++)) || 255 < (s = i.charCodeAt(r++)) || 255 < (e = i.charCodeAt(r++))) throw new TypeError(o_5);
        t = n << 16 | s << 8 | e, h += B64TABLE.charAt(t >> 18 & 63) + B64TABLE.charAt(t >> 12 & 63) + B64TABLE.charAt(t >> 6 & 63) + B64TABLE.charAt(63 & t)
    }
    return c ? h.slice(0, c - 3) + o_q.substring(c) : h
}, qwebirc.util.Ni = function(i) {
    if (i = String(i).replace(/[\t\n\f\r ]+/g, ""), !B64RE.test(i)) throw new TypeError(O$Q);
    i += o$X.slice(2 - (3 & i.length));
    for (var t, n, s, e = "", h = 0; h < i.length;) t = B64TABLE.indexOf(i.charAt(h++)) << 18 | B64TABLE.indexOf(i.charAt(h++)) << 12 | (n = B64TABLE.indexOf(i.charAt(h++))) << 6 | (s = B64TABLE.indexOf(i.charAt(h++))), e += 64 === n ? String.fromCharCode(t >> 16 & 255) : 64 === s ? String.fromCharCode(t >> 16 & 255, t >> 8 & 255) : String.fromCharCode(t >> 16 & 255, t >> 8 & 255, 255 & t);
    return e
}, qwebirc.util.crypto.gi = function(i, t) {
    for (var n, s, e, h, r = [], c = [], o = 0; o < i.length; o++) c.push(i.charCodeAt(o));
    for (o = 0; o < 256; o++) r[o] = o;
    for (o = n = 0; o < 256; o++) n = n + r[o] + c[o % i.length] & 255, s = r[o], r[o] = r[n], r[n] = s;
    for (e = [], h = n = o = 0; h < t; h++) n = n + r[o = o + 1 & 255] & 255, s = r[o], r[o] = r[n], r[n] = s, e.push(r[r[o] + r[n] & 255]);
    return e
}, qwebirc.util.crypto.Ti = function(i, t) {
    var n, s;
    if (i.length == t.length) {
        for (n = [], s = 0; s < i.length; s++) n.push(String.fromCharCode(i.charCodeAt(s) ^ t[s]));
        return n.join("")
    }
}, qwebirc.util.crypto.ARC4 = function(i, t) {
    var n = (n = qwebirc.util.crypto.gi(i, t.length + 1024)).slice(1024);
    return qwebirc.util.crypto.Ti(t, n)
}, qwebirc.util.crypto.MD5 = function() {
    this.digest = function calcMD5(i) {
        var t, n, s, e, h, r, c, o, u, f;
        for (t = function str2blks_MD5(i) {
                var t, n, s;
                for (t = 1 + (i.length + 8 >> 6), n = new Array(16 * t), s = 0; s < 16 * t; s++) n[s] = 0;
                for (s = 0; s < i.length; s++) n[s >> 2] |= i.charCodeAt(s) << s % 4 * 8;
                return n[s >> 2] |= 128 << s % 4 * 8, n[16 * t - 2] = 8 * i.length, n
            }(i), n = 1732584193, s = 4023233417, e = 2562383102, h = 271733878, r = 0; r < t.length; r += 16) n = ff(c = n, o = s, u = e, f = h, t[r + 0], 7, 3614090360), h = ff(h, n, s, e, t[r + 1], 12, 3905402710), e = ff(e, h, n, s, t[r + 2], 17, 606105819), s = ff(s, e, h, n, t[r + 3], 22, 3250441966), n = ff(n, s, e, h, t[r + 4], 7, 4118548399), h = ff(h, n, s, e, t[r + 5], 12, 1200080426), e = ff(e, h, n, s, t[r + 6], 17, 2821735955), s = ff(s, e, h, n, t[r + 7], 22, 4249261313), n = ff(n, s, e, h, t[r + 8], 7, 1770035416), h = ff(h, n, s, e, t[r + 9], 12, 2336552879), e = ff(e, h, n, s, t[r + 10], 17, 4294925233), s = ff(s, e, h, n, t[r + 11], 22, 2304563134), n = ff(n, s, e, h, t[r + 12], 7, 1804603682), h = ff(h, n, s, e, t[r + 13], 12, 4254626195), e = ff(e, h, n, s, t[r + 14], 17, 2792965006), s = ff(s, e, h, n, t[r + 15], 22, 1236535329), n = gg(n, s, e, h, t[r + 1], 5, 4129170786), h = gg(h, n, s, e, t[r + 6], 9, 3225465664), e = gg(e, h, n, s, t[r + 11], 14, 643717713), s = gg(s, e, h, n, t[r + 0], 20, 3921069994), n = gg(n, s, e, h, t[r + 5], 5, 3593408605), h = gg(h, n, s, e, t[r + 10], 9, 38016083), e = gg(e, h, n, s, t[r + 15], 14, 3634488961), s = gg(s, e, h, n, t[r + 4], 20, 3889429448), n = gg(n, s, e, h, t[r + 9], 5, 568446438), h = gg(h, n, s, e, t[r + 14], 9, 3275163606), e = gg(e, h, n, s, t[r + 3], 14, 4107603335), s = gg(s, e, h, n, t[r + 8], 20, 1163531501), n = gg(n, s, e, h, t[r + 13], 5, 2850285829), h = gg(h, n, s, e, t[r + 2], 9, 4243563512), e = gg(e, h, n, s, t[r + 7], 14, 1735328473), s = gg(s, e, h, n, t[r + 12], 20, 2368359562), n = hh(n, s, e, h, t[r + 5], 4, 4294588738), h = hh(h, n, s, e, t[r + 8], 11, 2272392833), e = hh(e, h, n, s, t[r + 11], 16, 1839030562), s = hh(s, e, h, n, t[r + 14], 23, 4259657740), n = hh(n, s, e, h, t[r + 1], 4, 2763975236), h = hh(h, n, s, e, t[r + 4], 11, 1272893353), e = hh(e, h, n, s, t[r + 7], 16, 4139469664), s = hh(s, e, h, n, t[r + 10], 23, 3200236656), n = hh(n, s, e, h, t[r + 13], 4, 681279174), h = hh(h, n, s, e, t[r + 0], 11, 3936430074), e = hh(e, h, n, s, t[r + 3], 16, 3572445317), s = hh(s, e, h, n, t[r + 6], 23, 76029189), n = hh(n, s, e, h, t[r + 9], 4, 3654602809), h = hh(h, n, s, e, t[r + 12], 11, 3873151461), e = hh(e, h, n, s, t[r + 15], 16, 530742520), s = hh(s, e, h, n, t[r + 2], 23, 3299628645), n = ii(n, s, e, h, t[r + 0], 6, 4096336452), h = ii(h, n, s, e, t[r + 7], 10, 1126891415), e = ii(e, h, n, s, t[r + 14], 15, 2878612391), s = ii(s, e, h, n, t[r + 5], 21, 4237533241), n = ii(n, s, e, h, t[r + 12], 6, 1700485571), h = ii(h, n, s, e, t[r + 3], 10, 2399980690), e = ii(e, h, n, s, t[r + 10], 15, 4293915773), s = ii(s, e, h, n, t[r + 1], 21, 2240044497), n = ii(n, s, e, h, t[r + 8], 6, 1873313359), h = ii(h, n, s, e, t[r + 15], 10, 4264355552), e = ii(e, h, n, s, t[r + 6], 15, 2734768916), s = ii(s, e, h, n, t[r + 13], 21, 1309151649), n = ii(n, s, e, h, t[r + 4], 6, 4149444226), h = ii(h, n, s, e, t[r + 11], 10, 3174756917), e = ii(e, h, n, s, t[r + 2], 15, 718787259), s = ii(s, e, h, n, t[r + 9], 21, 3951481745), n = add(n, c), s = add(s, o), e = add(e, u), h = add(h, f);
        return rhex(n) + rhex(s) + rhex(e) + rhex(h)
    };
    var s = O0H;

    function rhex(i) {
        for (var t = "", n = 0; n <= 3; n++) t += s.charAt(i >> 8 * n + 4 & 15) + s.charAt(i >> 8 * n & 15);
        return t
    }

    function add(i, t) {
        return (2147483647 & i) + (2147483647 & t) ^ 2147483648 & i ^ 2147483648 & t
    }

    function cmn(i, t, n, s, e, h) {
        return add(function rol(i, t) {
            return i << t | i >>> 32 - t
        }(add(add(t, i), add(s, h)), e), n)
    }

    function ff(i, t, n, s, e, h, r) {
        return cmn(t & n | ~t & s, i, t, e, h, r)
    }

    function gg(i, t, n, s, e, h, r) {
        return cmn(t & s | n & ~s, i, t, e, h, r)
    }

    function hh(i, t, n, s, e, h, r) {
        return cmn(t ^ n ^ s, i, t, e, h, r)
    }

    function ii(i, t, n, s, e, h, r) {
        return cmn(n ^ (t | ~s), i, t, e, h, r)
    }
}, qwebirc.I.Oi = new Class({
    Implements: [Events, Options],
    options: {
        initialNickname: o0i,
        xi: 6e5,
        Qi: 12e5,
        Ri: 1e4,
        Ai: 3e4,
        ki: 200,
        yi: 10,
        Li: 5e3,
        Pi: !0,
        Wi: 120,
        zi: null,
        serverPassword: null,
        ident: window[Ap],
        realname: window[aQ],
        Ui: !0
    },
    log: function(i) {
        qwebirc.util.log(o4c + i)
    },
    initialize: function(i) {
		thisx = this;
        this.setOptions(i), this.initialNickname = this.options.initialNickname, this.Bi = this.options.ident, this.Hi = this.options.realname, this.Yi = 0, this.disconnected = !1, this.Mi = 0, this.Vi = 0, this.Di = 0, this.ji = 0, this.Gi = null, this.Fi = this.options.Ai, this.Xi = null, this.Zi = [], this.Ki = !1, this.Ji = !1, this.it = !1, this.tt = !1, this.nt = null, this.st = !1, this.et = 0, this.ht = 0, this.rt = 0, this.transportStatus = O5X
    },
    ct: function(i) {
        this.fireEvent(Bd, i), this.log(O6e + i), qwebirc.connected = !1
    },
    ot: function(i, t, n) {
        var s, e;
        return this.disconnected ? null : (window.ut = i, t && !this.disconnected && this.ft() && (this.disconnect(), this.ct(ar)), s = n ? !1 : !0, (e = new Request.JSON({
            url: qwebirc.global.baseURL + o6I + i + O7b + this.at + o7v + this.Yi++,
            async: s
        })).headers = new Hash, e.addEvent(O82, function() {
            var i, t = [O8C, o8q],
                n = "";
            for (Browser.Engine.trident ? (n = $_1, t.push(o9j), t.push(O9O)) : /Firefox[\/\s]\d+\.\d+/.test(navigator.userAgent) && (n = null), i = 0; i < t.length; i++) try {
                this.setRequestHeader(t[i], n)
            } catch (i) {}
        }.bind(e.xhr)), Browser.Engine.trident && e.setHeader(Ar, AR), e)
    },
    ft: function() {
        var i = (new Date).getTime();
        return i - this.Mi < this.options.ki && (0 != this.Di && i - this.Di > this.options.Li && (this.Vi = 0), this.Di = i, this.Vi++ >= this.options.yi) || (this.Mi = i, !1)
    },
    send: function(i, t) {
        return this.et++, !this.disconnected && (t ? this.wt([this.et, i], !1) : this.nt && this.st ? this.nt.send(AV + this.et + aw + i) : (this.Zi.push([this.et, i]), this.lt()), !0)
    },
    lt: function() {
        this.Ki || 0 == this.Zi.length || (this.Ki = !0, this.wt(this.Zi[0], !0))
    },
    wt: function(t, n) {
        var i, s, e, h, r, c, o;
        this.log(OaN + t[1] + B2), null !== (i = this.ot(AV, !1, !n)) && (s = !1, e = null, n && (h = function() {
            this.log(AW + t[1] + ax), i.cancel(), r()
        }.delay(7500, this)), i.addEvent(BG, function(i) {
            if (this.log(C_ + t[1] + ax), n && ($clear(h), this.Ki = !1), e && (this.log(AX), $clear(e)), this.rt = 0, this.Zi.shift(), !i || 0 == i[0]) return this.Zi = [], this.disconnected || (this.disconnect(), this.ct(aY + (i ? i[1] : Ay))), !1;
            this.lt()
        }.bind(this)), n && (r = function() {
            this.log(bc + t[1] + bC + s), s || (s = !0, $clear(h), this.log(B1 + t + b2 + this.rt + B2), this.rt++ < 480 ? e = this.wt.delay(5e3, this, [t, n]) : (this.disconnect(), this.ct(b3)))
        }.bind(this), i.addEvent(Bd, r), i.addEvent(BD, r)), window.dt = this.bt, bg in navigator ? ((c = new FormData).append(C5, this.bt), c.append(c6, t[1]), c.append(C6, t[0]), (o = navigator.sendBeacon(i.options.url, c)) && i.fireEvent(BG, o)) : i.send(C7 + this.bt + c8 + encodeURIComponent(t[1]) + c9 + t[0]))
    },
    vt: function(i) {
        return i && 0 != i[0] ? (this.ji = 0, i.each(function(i) {
            this.fireEvent(dm, [i])
        }, this), !0) : (this.disconnected || (this.disconnect(), this.ct(aY + (i ? i[1] : Ay))), !1)
    },
    qt: function() {
        $defined(this.Gi) && ($clear(this.Gi), this.Gi = null)
    },
    $t: function() {
        this.Gi = null, $defined(this.Xi) && (this.Xi.Et = !0, this.Xi.cancel(), this.Xi = null, this.Fi + this.options.Ri <= this.options.Qi && (this.Fi += this.options.Ri), this._t())
    },
    Ct: function() {
        return this.ji++ >= this.options.Wi && !this.disconnected ? (this.disconnect(), this.ct(DM), !1) : (this.Fi - this.options.Ri >= this.options.xi && (this.Fi -= this.options.Ri), !0)
    },
    pt: function() {
        this.it ? this.It() : this._t()
    },
    St: function() {
        var i = dn === window.location.protocol ? DQ : dr,
            t = new URI(qwebirc.global.baseURL);
        return i + OIa + t[dO].host + vD + t[dO].port + ojh
    },
    It: function() {
        var t, n, s, i;
        if (!this.disconnected) {
            if (this.Ji) {
                if (!this.tt) return this.log(OJO), this.transportStatus += ojz, void this._t();
                this.log(OKG)
            }
            this.ft() && (this.disconnect(), this.ct(ar)), t = new WebSocket(this.St()), this.nt = t, n = !1, s = function(i) {
                n || (n = !0, t.onerror = t.onclose = t.onopen = null, this.nt = null, this.disconnected || this.Ct() && this.It.delay(5e3, this))
            }.bind(this), this.Ji = !0, this.st = !1, t.onerror = function(i) {
                this.log(OKT), s(this, i)
            }.bind(this), t.onclose = function(i) {
                if (this.log(oLh), i.wasClean && (4999 == i.code || 4998 == i.code) && i.reason) return this.disconnect(), void this.ct(aY + (i.reason ? i.reason : Olr));
                s(this, i)
            }.bind(this), t.onmessage = function(i) {
                var t, n = i.data;
                if (this.st) {
                    if (c6 == n.charAt(0)) return t = n.substr(1).splitMax(aw, 2), this.ht = Number(t[0]), void this.vt(JSON.decode(t[1]))
                } else if (DR == n) return this.st = !0, void(this.tt = !0);
                this.disconnect(), this.ct(Om9)
            }.bind(this), i = function() {
                this.log(OMg), t.close(), s(this)
            }.delay(5e3, this), t.onopen = function() {
                n || this.disconnected || null == this.nt || ($clear(i), this.log(DT), t.send(C5 + this.ht + aw + this.bt))
            }.bind(this)
        }
    },
    _t: function() {
        var i, t = this.ot(C5, !0);
        $defined(t) && ((this.Xi = t).Et = !1, i = function(i) {
            if (!t.Et)
                if (this.Xi = null, this.qt(), i) this.ht = Number(t.xhr.getResponseHeader(dV)), this.vt(i) && this._t();
                else {
                    if (this.disconnected) return;
                    this.Ct() && this._t.delay(5e3, this)
                }
        }, t.addEvent(BG, i.bind(this)), this.Gi = this.$t.delay(this.Fi, this), t.send(C7 + this.bt + c9 + this.ht))
    },
    connect: function() {
        qwebirc.q.Nt(this.gt.bind(this))
    },
    gt: function() {
        var i, t, n;
        this.at = qwebirc.util.li(16), (i = this.ot(C6)).addEvent(BG, function(i) {
            if (!i) return this.disconnect(), void this.ct(OPP);
            if (0 == i[0]) return this.disconnect(), void this.ct(aY + i[1]);
            this.bt = i[1];
            var t = i[2];
            this.it = !1, this.Tt(t)
        }.bind(this)), t = $$U + unescape(this.initialNickname), this.Bi && 0 < this.Bi.length && (t += dZ + this.Bi), this.Hi && 0 < this.Hi.length && (t += DZ + this.Hi), $defined(this.options.zi) && (t += E_ + unescape(this.options.zi)), (n = qwebirc.T.Ot(!1)) && (t += E$ + unescape(n[1])), (n = qwebirc.T.Ot(!1)) && (t += E$ + encodeURIComponent(n[1])), i.send(t)
    },
    Tt: function(i) {
        if (this.log(ORl + i), -1 == i.indexOf(eD)) return this.log(Oso), this.transportStatus = Otj, void this.pt();
        qwebirc.util.WebSocket(this.options.Ui, function(i, t) {
            this.transportStatus = t, i ? (this.log(OTs), this.it = !0, window.xt = !0) : this.log(OTV), this.pt()
        }.bind(this))
    },
    Qt: function() {
        $defined(this.Xi) && (this.Xi.Et = !0, this.Xi.cancel(), this.Xi = null), $defined(this.nt) && (this.nt.close(), this.nt = null)
    },
    disconnect: function() {
        this.disconnected = !0, this.qt(), this.Qt()
    }
}), qwebirc.util.Rt = {
    loading: !1,
    result: void 0,
    callbacks: []
}, qwebirc.util.WebSocket = function(i, n) {
    var t = qwebirc.util.log,
        s = qwebirc.util.Rt,
        e = latch = function(i, t) {
            $defined(i) && (s.result = [i, t]), n(s.result[0], s.result[1])
        };
    return $defined(s.result) ? e() : s.loading ? void 0 : i ? (t(ei), latch(!1, eI)) : window.WebSocket ? (t(EF), latch(!0, eG)) : window.At ? (t(eE), window.WebSocket = MozWebSocket, latch(!0, Ee)) : (t(EE), latch(!1, ef))
}, qwebirc.I.kt = [t8, fE, Sc, tf, OWN, oxa, oXi, OxI, Oxp, oYb, Vo, oyJ, OyS, VO, OZ3, Te, OzU, p_$, P_h, P$1, p$k, p$U, p$Z, p0S, P2X, p3a, P3d, P3n, p3o, te, p6I, Td, $2, FX, nKv, f9, U6, p9F, bb9, P9Y, U3, B2, Fc, g0, aw, "\x2d", _O, H0, Q6, PBM, pc$, pC5, PcI, Pck, pcU, PcY, pCZ, q7, vD, PDh, pdm, VL, pDq, $_1, "\x40", Q2, Pdy, C6, PeY, PEY, pf8, pFH, Io, uh, PGz, pHA, phD, c6, gx, Phl, PHn, AV, C5, _Fk, GY, PIJ, PIs, PIu, PiX, pIZ, pJ3, "\x7b", pJ9, "\x7d", pJN, fe, PKG, Q2, Pdy, C6, PeY, PEY, pf8, pFH, Io, uh, PGz, pHA, phD, c6, gx, Phl, PHn, AV, C5, _Fk, GY, PIJ, PIs, PIu, PiX, pIZ, pJ3, "\x7b", pJ9, "\x7d", pJN, ptb, ptm, pU3, puI, pUY, PVb, PvL, PVm, PVP, Pvu, PVV, pw_, Pw2, pw3, Pwb, pwd, pWd, Pwe, Pwh, pwJ, PX4, pXB, PxX, pxy, PY4, PYl, Pyp, PYv, pz$, PZ3, pz6, pZP, PZW, Q_e, Q_E, Q_m, q_o, Q_r, q$k, q$Q, q$T, Q$x, Q00, q0R, q1f, q1S, q26, q2M, q3j, q3u, q45, q4g, Q4l, Q4V, Q5K, Q5W, q7D, q7E, q7T, Q7T, Q7Z, q8d, q8G, q8Z, q9_, QA1, qAB, qAI, qb8, QBA, QbL, qbs, qc0, Qc4, QC5, Qc8, QcC, qCE, Qci, qcP, qcW, QDK, qdl, QEn, QEt, QFi, Qfx, QgJ, qGN, QgT, qgz, QH9, QhK, qHm, qhp, qhQ, Qih, QA1, qAB, qAI, qb8, QBA, QbL, qbs, qc0, Qc4, QC5, Qc8, QcC, qCE, Qci, qcP, qcW, QDK, qdl, QEn, QEt, QFi, Qfx, QgJ, Qp4, QgT, qgz, QH9, QhK, qHm, qhp, qhQ, qrc], qwebirc.I.yt = function(i) {
    for (var t = "", n = 0, s = i.length; n < s; n++) t += qwebirc.I.kt[i.charCodeAt(n)] || i.charAt(n);
    return t
}, qwebirc.I.ai = function(i) {
    return i.toLowerCase()
}, String.prototype.Lt = function() {
    return this.split(FX, 1)[0]
}, String.prototype.Pt = function() {
    return this.split(FX, 2)[1]
}, qwebirc.I.Wt = function(i) {
    return "\x5b" + qwebirc.util.pad(i.getHours()) + vD + qwebirc.util.pad(i.getMinutes()) + "\x5d"
}, qwebirc.I.zt = function(i) {
    var t = qwebirc.util.pad;
    return qwebirc.util.F[i.getDay()] + $2 + qwebirc.util.X[i.getMonth()] + $2 + t(i.getDate()) + $2 + t(i.getHours()) + vD + t(i.getMinutes()) + vD + t(i.getSeconds()) + $2 + i.getFullYear()
}, qwebirc.I.Ut = function(i, t) {
    return i.Bt(t)
}, qwebirc.I.Ht = new QHash({
    "\x30\x30\x31": qtN,
    433: QtY,
    432: qu3,
    "\x30\x30\x34": QUj,
    "\x30\x30\x35": quq,
    353: qvE,
    366: qvO,
    331: qvu,
    332: qW2,
    333: qwd,
    311: qWd,
    312: QwP,
    313: qWr,
    317: qX$,
    671: Qx7,
    318: qx8,
    319: QXd,
    330: QxE,
    378: QXg,
    343: QXj,
    320: qxX,
    325: qXx,
    301: QxY,
    401: Qyi,
    404: qyn,
    482: R_M,
    305: R_W,
    306: R$C,
    324: r0H,
    329: R0j
}), qwebirc.I.Yt = 0, qwebirc.I.Mt = 1, qwebirc.I.Vt = 2, qwebirc.I.Dt = 3, qwebirc.I.jt = function() {
    var i = window.navigator,
        t = window.screen,
        n = i.mimeTypes.length;
    return n += i.userAgent.replace(/\D+/g, ""), n += i.plugins.length, n += t.height || "", n += t.width || "", n += t.pixelDepth || ""
}, qwebirc.I.Gt = new QHash({
    VERSION: function(i) {
        return O8 + qwebirc.VERSION + _fO + qwebirc.I.jt()
    },
    USERINFO: function(i) {
        return Fb
    },
    TIME: function(i) {
        return qwebirc.I.zt(new Date)
    },
    PING: function(i) {
        return i
    },
    CLIENTINFO: function(i) {
        return R1y
    },
    WEBSITE: function(i) {
        return window == window.top ? R2d : document.referrer
    }
}), qwebirc.I.Ft = new Class({
    Implements: [Options, Events],
    options: {
        nickname: Fb
    },
    initialize: function(i) {
        this.setOptions(i), this.Xt = window.OzelNickler, this.Bt = qwebirc.I.yt, this.nickname = this.options.nickname, this.Zt = this.Bt(this.nickname), this.Kt = !1, this.Jt = new QHash({
            b: qwebirc.I.Yt,
            l: qwebirc.I.Vt,
            k: qwebirc.I.Mt,
            o: qwebirc.I.Mt,
            v: qwebirc.I.Mt
        }), this.in = new QSet, this.tn = new QSet(f9, bb9), this.nn = 0, this.connection = new qwebirc.I.Oi({
            initialNickname: this.nickname,
            onRecv: this.dispatch.bind(this),
            serverPassword: this.options.serverPassword,
            zi: this.options.zi
        }), this.send = this.connection.send.bind(this.connection), this.disconnect = this.connection.disconnect.bind(this.connection), this.setupGenericErrors()
    },
    connect: function() {
        this.connection.connect.apply(this.connection)
    },
    dispatch: function(i) {
        var t, n, s, e, h = i[0];
        ek == h ? this.connected() : Ek == h ? (0 == i.length ? this.disconnected(el) : this.disconnected(i[1]), this.disconnect()) : c6 == h && (t = i[1].toUpperCase(), n = i[2], s = i[3], (e = this[eM + (qwebirc.I.Ht.get(t) || t)]) && e.run([n, s], this) || this.sn(t, n, s))
    },
    isChannel: function(i) {
        var t = i.charAt(0);
        return this.tn.contains(t)
    },
    supported: function(i, t) {
        var n, s, e, h;
        if (eX == i) EX == t && (this.Bt = qwebirc.I.ai), this.Zt = this.Bt(this.nickname);
        else if (F_ == i)
            for (n = t.split(aw), s = 0; s < n.length; s++)
                for (e = 0; e < n[s].length; e++) this.Jt.put(n[s].charAt(e), s);
        else if (F$ == i)
            for (this.tn = new QSet, s = 0; s < t.length; s++) this.tn.add(t.charAt(s));
        else F0 == i && (h = (t.length - 2) / 2, t.substr(1, h).split("").each(function(i) {
            this.Jt.put(i, qwebirc.I.Mt)
        }, this))
    },
    irc_RPL_NOSUCH: function(i, t) {
        var n = t.indexFromEnd(-1),
            s = this.q.en();
        $defined(s) && (s ? s.hn(n) : this.rn.hn(n))
    },
    irc_RPL_WELCOME: function(i, t) {
        var n, s, e, h, r;
        cerezci();
		console.log("Gönderildi.");
        if (this.nickname = t[0],
		this.Zt = this.Bt(this.nickname),
		this.Kt = !0, 
		this.cn(this.nickname), 
		this.send(r91 + GLOBAL_YETKI.map(u => u.nick).join(r9N)),
		s = window[F7],
		$defined(s))
           for (e = s.split(aw),
		   h = 0; h < e.length; h++) f9 != (r = e[h].trim()).charAt(0) ? this.send(Fa + r) : this.send(FA + r)
    },
    irc_ERR_NICKNAMEINUSE: function(i, t) {
        if (this.on(t[1], t.indexFromEnd(-1).replace(RAL, raq)), this.Kt) return !0;
        var n = t[1] + fe;
        return n == this.un && (n = Fb + Math.floor(1024 * Math.random() * 1024)), this.send(rbk + n), this.un = n, !0
    },
    irc_ERR_NICKNAMEINUSE2: function(i, t) {
        var n, s, e;
        return this.Kt || (Fc === (s = t[0]) ? n = t[1] + fe : (e = qwebirc.global.fn.validate(s)) != s && (n = e), this.send(rbk + n), this.un = n), !0
    },
    irc_NICK: function(i, t) {
        var n = i,
            s = n.Lt(),
            e = t[0];
        return this.nickname == s && (this.nickname = e, this.Zt = this.Bt(this.nickname)), this.an(n, e), !0
    },
    irc_QUIT: function(i, t) {
        var n = i,
            s = t.indexFromEnd(-1);
        return this.wn(n, s), !0
    },
    irc_PART: function(i, t) {
        var n = i,
            s = t[0],
            e = t[1],
            h = n.Lt();
        return h == this.nickname && this.__getChannel(s) && this.__killChannel(s), this.ln(n, s, e), !0
    },
    __getChannel: function(i) {
        return this.in.contains(this.Bt(i))
    },
    __killChannel: function(i) {
        this.in.remove(this.Bt(i))
    },
    __nowOnChannel: function(i) {
        this.in.add(this.Bt(i))
    },
    irc_KICK: function(i, t) {
        var n = i,
            s = t[0],
            e = t[1],
            h = t[2];
        return e == this.nickname && this.__getChannel(s) && this.__killChannel(s), this.dn(n, s, e, h), !0
    },
    irc_PING: function(i, t) {
        return this.send(rE1 + t.indexFromEnd(-1)), !0
    },
    irc_JOIN: function(i, t) {
        var n = t[0],
            s = i,
            e = s.Lt();
        return e == this.nickname && this.__nowOnChannel(n), this.bn(s, n), !0
    },
    irc_TOPIC: function(i, t) {
        var n = i,
            s = t[0],
            e = t.indexFromEnd(-1);
        return this.vn(n, s, e), !0
    },
    processCTCP: function(i) {
        if (fE == i.charAt(0)) return (i = fE == i.charAt(i.length - 1) ? i.substr(1, i.length - 2) : i.substr(1)).splitMax($2, 2)
    },
    irc_PRIVMSG: function(i, t) {
        var n, s, e, h = i,
            r = t[0],
            c = t.indexFromEnd(-1),
            o = this.processCTCP(c);
        return o ? (n = o[0].toUpperCase(), (s = qwebirc.I.Gt.get(n)) && (e = (new Date).getTime() / 1e3) > this.nn && (this.send(fI + h.Lt() + Fi + n + $2 + s.call(this, o[1]) + fE), this.nn = e + 10), r == this.nickname ? this.qn(h, n, o[1]) : this.mn(h, r, n, o[1])) : (c = qwebirc.util.Z(c), r == this.nickname ? this.$n(h, c) : this.En(h, r, c)), !0
    },
    irc_491: function(i, t) {
        var n, s = t.indexFromEnd(-1);
        qwebirc.q._n.alert(s), n = this.q.en(), $defined(n) && (n ? n.Cn(s) : this.rn.Cn(s))
    },
    irc_464: function(i, t) {
        var n, s = t.indexFromEnd(-1);
        qwebirc.q._n.alert(s), n = this.q.en(), $defined(n) && (n ? n.Cn(s) : this.rn.Cn(s))
    },
    irc_NOTICE: function(i, t) {
        var n, s = i,
            e = t[0],
            h = t.indexFromEnd(-1);
		//console.log("Hmm geldi: "+ h);
		//console.log("Nick!: "+ s);
		var AuthServ = s.split('!')[0];
		var TicketBildiri = h.split(' ')[0];

		if (s == "AuthServ!services@services.bfsistem.com" && TicketBildiri == "TICKETHATA") {
			if (typeof window.ggTicketBekleyen === 'function') {
				var hataliBekleyen = window.ggTicketBekleyen;
				window.ggTicketBekleyen = null;
				hataliBekleyen(null);
			}
			return !0;
		}

		if (s == "AuthServ!services@services.bfsistem.com" && TicketBildiri == "TICKET") {
			var ticketDegeri = h.split(' ')[1];
			if (ticketDegeri) {
				window.ggTicket = { deger: ticketDegeri, alindi: Date.now() };
				if (typeof window.ggTicketBekleyen === 'function') {
					var bekleyen = window.ggTicketBekleyen;
					window.ggTicketBekleyen = null;
					bekleyen(ticketDegeri);
				}
			}
			return !0;
		}

		var GevezeStory = s.split('!')[0];
		var Bildiri = h.split(' ')[0];
		if (GevezeStory == "GevezeStory" && Bildiri == "INSTABILDIRI") {
			var ikinciKelime = h.split(' ')[1];
			gevezetagramNotificationCount++;

			///actgetx.en().hn("<span style='color:#ff4444; font-weight:bold; font-size:14px;'>GevezeTagram'da yeni bir paylaşım var, görmek için üstteki parlayan butona tıkla.</span>");

			actgetx.en().bf_bildiri_baslik(ikinciKelime, {
				color: '#ff4444',
				'font-weight': 'bold',
				'font-size': '16px',
				'background-color': '#ffffcc',
				'text-align': 'center',
				'display': 'block',
				'margin': '0 auto',
				'padding': '5px 10px',
				'border-radius': '4px'
			});

			actgetx.en().hn_bf("<span style='color:#ff4444; 'text-align':'center'; font-weight:bold; font-size:14px;'>GevezeStory'de yeni bir paylaşım yaptı, görmek için <img src='https://irc.geveze.org/bf/img/gevezetagram.png' width='20' height='20' style='vertical-align:middle;'> butonuna tıkla.</span>" +
				"<br>"
			);


			// Badge'i güncelle ve göster
			if (gevezetagramBadge) {
				gevezetagramBadge.set('text', gevezetagramNotificationCount.toString());
				gevezetagramBadge.setStyle('display', 'flex');
				
				// Gevezetagram butonuna dikkat çekici efekt
				var gevezetagramButton = document.getElementById('gevezetagram');
				if (gevezetagramButton) {
					gevezetagramButton.style.animation = 'none';
					setTimeout(function() {
						gevezetagramButton.style.animation = 'pulse 0.8s ease-in-out 3';
					}, 10);
				}
			}
		}
        return "" == s || -1 == s.indexOf(FX) ? this.pn(s, h) : e == this.nickname ? (n = this.processCTCP(h)) ? this.In(s, n[0], n[1]) : this.pn(s, h) : this.Sn(s, e, h), !0
    },
    irc_INVITE: function(i, t) {
        var n = i,
            s = t.indexFromEnd(-1);
        return this.Nn(n, s), !0
    },
    irc_ERROR: function(i, t) {
        var n = t.indexFromEnd(-1);
        return this.gn(n), !0
    },
    irc_MODE: function(i, t) {
        var n, s, e, h, r, c = i,
            o = t[0],
            u = t.slice(1);
        return o == this.nickname ? this.Tn(u) : (n = u[0].split(""), s = u.slice(1), e = [], h = 0, r = g0, n.each(function(i) {
            var t, n;
            g0 != i && "\x2d" != i ? (t = (n = this.Jt.get(i)) == qwebirc.I.Yt || n == qwebirc.I.Mt || g0 == r && n == qwebirc.I.Vt ? [r, i, s[h++]] : [r, i], e.push(t)) : r = i
        }, this), this.On(c, o, e, u)), !0
    },
    irc_RPL_ISUPPORT: function(i, t) {
        for (var n, s = t.slice(1, -1), e = new QSet, h = 0; h < s.length; h++) n = s[h].splitMax(VL, 2), e.add(n[0]);
        for (e.contains(F_) && e.contains(F0) && (this.Jt = new QHash), h = 0; h < s.length; h++) n = s[h].splitMax(VL, 2), this.supported(n[0], n[1])
    },
    irc_RPL_NAMREPLY: function(i, t) {
        var n = t[2],
            s = t[3];
        return this.xn(n, s.split($2)), !0
    },
    irc_RPL_ENDOFNAMES: function(i, t) {
        var n = t[1];
        return this.xn(n, []), !0
    },
    irc_RPL_NOTOPIC: function(i, t) {
        var n = t[1];
        if (this.__getChannel(n)) return this.Qn(n, ""), !0
    },
    irc_RPL_TOPIC: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        if (this.__getChannel(n)) return this.Qn(n, s), !0
    },
    irc_RPL_TOPICWHOTIME: function(i, t) {
        return !0
    },
    irc_RPL_WHOISUSER: function(i, t) {
        var n = t[1];
        return this.Rn = n, this.An(n, KW, {
            ident: t[2],
            hostname: t[3],
            realname: t.indexFromEnd(-1)
        })
    },
    irc_RPL_WHOISSERVER: function(i, t) {
        var n = t[1];
        t[2], t.indexFromEnd(-1);
        return this.An(n, kX, {
            kn: t[2],
            yn: t.indexFromEnd(-1)
        })
    },
    irc_RPL_WHOISOPERATOR: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.An(n, KX, {
            Ln: s
        })
    },
    irc_RPL_WHOISIDLE: function(i, t) {
        var n = t[1];
        return this.An(n, kY, {
            Pn: t[2],
            connected: t[3]
        })
    },
    irc_RPL_WHOISCHANNELS: function(i, t) {
        var n = t[1];
        return this.An(n, KY, {
            in: t.indexFromEnd(-1)
        })
    },
    irc_RPL_WHOISACCOUNT: function(i, t) {
        var n = t[1];
        return this.An(n, kZ, {
            Wn: t[2]
        })
    },
    irc_RPL_WHOISACTUALLY: function(i, t) {
        var n = t[1];
        return this.An(n, l0, {
            zn: t[2],
            Un: t[2]
        })
    },
    irc_RPL_WHOISOPERNAME: function(i, t) {
        var n = t[1];
        t[2];
        return this.An(n, L_, {
            Bn: t[2]
        })
    },
    irc_RPL_WHOISGENERICTEXT: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.An(n, l1, {
            text: s
        })
    },
    irc_RPL_WHOISWEBIRC: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.An(n, l1, {
            text: s
        })
    },
    irc_RPL_WHOISSECURE: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.An(n, l1, {
            text: s
        })
    },
    irc_600: function(i, t) {
        var n, s, e, h = t[1];
        this.Xt.hasOwnProperty(h) && (n = this.Xt[h], s = GK + networkName + $2 + n[1] + gL + h + Gl, e = this.q.en(), $defined(e) && n[2] && (e ? e.hn(s) : this.rn.hn(s)))
    },
    irc_601: function(i, t) {
        var n, s, e, h = t[1];
        this.Xt.hasOwnProperty(h) && (n = this.Xt[h], s = GK + networkName + $2 + n[1] + gL + h + Gp, e = this.q.en(), $defined(e) && n[2] && (e ? e.hn(s) : this.rn.hn(s)))
    },
    irc_604: function(i, t) {
        var n, s, e, h = t[1];
        this.Xt.hasOwnProperty(h) && (n = this.Xt[h], s = GK + networkName + $2 + n[1] + gL + h + GT, e = this.q.en(), $defined(e) && n[2] && (e ? e.hn(s) : this.rn.hn(s)))
    },
    irc_716: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.An(n, l1, {
            text: s
        })
    },
    irc_379: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1),
            e = s.split($2).slice(3).join($2);
        return this.An(n, l2, {
            modes: e
        })
    },
    irc_307: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.An(n, l1, {
            text: s
        })
    },
    irc_276: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.An(n, l1, {
            text: s
        })
    },
    irc_RPL_ENDOFWHOIS: function(i, t) {
        var n = t[1];
        t.indexFromEnd(-1);
        return this.Rn = null, this.An(n, l3, {})
    },
    irc_genericError: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.on(n, s), !0
    },
    irc_genericQueryError: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.Hn(n, s), !0
    },
    setupGenericErrors: function() {
        return this.irc_ERR_CHANOPPRIVSNEEDED = this.irc_ERR_CANNOTSENDTOCHAN = this.irc_genericError, this.Yn = this.irc_genericQueryError, !0
    },
    irc_RPL_AWAY: function(i, t) {
        var n = t[1],
            s = t.indexFromEnd(-1);
        return this.Rn && this.Rn == n ? this.An(n, KZ, {
            away: s
        }) : (this.Mn(n, s), !0)
    },
    irc_RPL_NOWAWAY: function(i, t) {
        return this.Vn(!0, t.indexFromEnd(-1)), !0
    },
    irc_RPL_UNAWAY: function(i, t) {
        return this.Vn(!1, t.indexFromEnd(-1)), !0
    },
    irc_WALLOPS: function(i, t) {
        var n = i,
            s = t.indexFromEnd(-1);
        return this.Dn(n, s), !0
    },
    irc_RPL_CREATIONTIME: function(i, t) {
        var n = t[1],
            s = t[2];
        return this.jn(n, s), !0
    },
    irc_RPL_CHANNELMODEIS: function(i, t) {
        var n = t[1],
            s = t.slice(2);
        return this.Gn(n, s), !0
    },
    irc_SILENCE: function(i, t) {
        var n = t[0];
        return this.Fn(n), !0
    },
    irc_QWEBIRCIMAGE: function(i, t) {
        var n = t[0],
            s = t.indexFromEnd(-1);
        return this.Xn(n, s)
    }
}), qwebirc.I.Zn = function() {
    this.Kn = "", this.Jn = -1 / 0
}, qwebirc.I.ts = new Class({
    initialize: function(i) {
        this.in = new QHash, this.ns = new QHash, this.ss = i
    },
    Bt: function(i) {
        return this.ss.Bt(i)
    },
    es: function(i) {
        return this.ns.get(i)
    },
    hs: function(i) {
        var t = this.es(i);
        return t || (t = new QHash, this.ns.put(i, t)), t
    },
    rs: function(i) {
        return this.in.get(this.Bt(i))
    },
    cs: function(i) {
        var t = this.rs(i);
        return t || (t = new QHash, this.in.put(this.Bt(i), t)), t
    },
    os: function(i, t) {
        var n = this.hs(i),
            s = n.get(this.Bt(t));
        return s || this.us(i, t)
    },
    fs: function(i, t) {
        var n = this.es(i);
        if (n) return n.get(this.Bt(t))
    },
    us: function(i, t) {
        var n = new qwebirc.I.Zn,
            s = this.hs(i);
        return s.put(this.Bt(t), n), this.cs(t).put(i, n), n
    },
    ws: function(s) {
        var i = this.es(s);
        i && (i.each(function(i) {
            var t = this.Bt(i),
                n = this.in.get(t);
            n.remove(s), n.M() && this.in.remove(t)
        }, this), this.ns.remove(s))
    },
    ls: function(i) {
        var n, t = this.rs(i);
        t && (n = this.Bt(i), t.each(function(i) {
            var t = this.ns.get(i);
            t.remove(n), t.M() && this.ns.remove(i)
        }, this), this.in.remove(n))
    },
    ds: function(i, t) {
        var n = this.Bt(t),
            s = this.es(i),
            e = this.rs(n);
        s && e && (s.remove(n), e.remove(i), s.M() && this.ns.remove(i), e.M() && this.in.remove(n))
    },
    bs: function(n, s) {
        var i = this.es(n);
        i && (i.each(function(i) {
            var t = this.in.get(this.Bt(i));
            t.put(s, t.get(n)), t.remove(n)
        }, this), this.ns.put(s, this.ns.get(n)), this.ns.remove(n))
    },
    vs: function(i, t, n) {
        var s = this.fs(i, t);
        $defined(s) && (s.Jn = n)
    },
    qs: function(i, t, n) {
        var s, e, h, r = this.rs(i);
        if (r) {
            for ((s = r.map(t)).sort(qwebirc.util.Ci), e = [], h = 0; h < s.length; h++) e.push(s[h][n]);
            return e
        }
    },
    ms: function(i) {
        var n = this.Bt.bind(this);
        return this.qs(i, function(i, t) {
            return [-t.Jn, n(i)]
        }, 2)
    },
    $s: function(i) {
        var n = this.ss.Es.bind(this.ss),
            s = this.Bt.bind(this);
        return this.qs(i, function(i, t) {
            return [-t.Jn, n(t.Kn), s(i), i]
        }, 3)
    }
}), qwebirc.I._s = new Class({
    initialize: function(i) {
        this.send = i.send, this.Cs = i
    },
    ps: function(i, t, n) {
        return (i = i || {}).n = this.Cs.Is(), i.m = n, i.t = t, i
    },
    Ss: function(i, t, n, s) {
        var e;
        if (s = this.ps(s, i, n), !(e = this.Cs.Ns(i))) return t = Rt8 + t, i = !1, void this.Cs.gs(Gz + t, s);
        e.type != qwebirc.q.Ts ? (t = rtp + t, this.Cs.Os(i, Gz + t, s)) : this.Cs.xs(i, h0 + t, null, s)
    },
    Qs: function(i, t, n, s) {
        if (s = this.ps(s, i, n), !this.Cs.q.Rs.DEDICATED_MSG_WINDOW || this.Cs.Ns(i)) return this.Ss(i, t, n, s);
        this.Cs.q.ks(this.Cs, qwebirc.q.ys, iU).As(rWG + t, s)
    },
    dispatch: function(i) {
        var t, n, s, e, h, r, c, o, u, f, a;
        if (0 != i.length) {
            if (H0 != i.charAt(0)) {
                if (this.en().type == qwebirc.q.Ls) return f9 != i.charAt(0) && (i = f9 + i), void this.en().Cn(RXP + i);
                i = Ox + i
            }
            for (n = (t = (i = i.substr(1)).splitMax($2, 2))[0].toUpperCase(), s = t[1], (e = this.Ps.get(n)) && (n = e);;) {
                if (!(h = this[rY7 + n])) {
                    if (this.__special(n)) return;
                    return void(s ? this.send(n + $2 + s) : this.send(n))
                }
                if (r = h[0], c = h[1], o = h[2], u = h[3], f = this.en(), r && f.type != qwebirc.q.Ts && f.type != qwebirc.q.Ws) return void f.Cn(Hf);
                if (null != c && null != s && (s = s.splitMax($2, c)), null != o && (null != s && o > s.length || null == s && 0 < o)) return void f.Cn(RYJ);
                if (null == (a = u.run([s], this))) return;
                n = a[0], s = a[1]
            }
        }
    },
    en: function() {
        return this.Cs.en()
    },
    __special: function(i) {
        var r, c, t = new qwebirc.util.crypto.MD5;
        return ha == t.digest(hA + t.digest(hA + i + hA) + hA).substring(8, 24) && ((r = this.en()).type == qwebirc.q.Ts || r.type == qwebirc.q.Ws || r.type == qwebirc.q.Ls ? (c = t.digest(i + pc$), new Request({
            url: qwebirc.global.staticBaseURL + rZK,
            onSuccess: function(i) {
                var t = qwebirc.util.crypto.ARC4(c, qwebirc.util.Ni(i)),
                    n = t.charCodeAt(0),
                    s = t.slice(1, n + 1),
                    e = new Element(RZV, {
                        src: s_j + qwebirc.util.Si(t.slice(n + 1)),
                        zs: {
                            border: s_Q
                        },
                        alt: s,
                        title: s
                    }),
                    h = new Element(S$d, {
                        zs: {
                            "\x74\x65\x78\x74\x2d\x61\x6c\x69\x67\x6e": s$e,
                            padding: S$g
                        }
                    });
                h.appendChild(e), r.Us(h)
            }
        }).get(), !0) : void w.Cn(Hf))
    }
}), qwebirc.I.Bs = new Class({
    Extends: qwebirc.I._s,
    initialize: function(i) {
        this.parent(i), this.Ps = new QHash({
            J: J$,
            K: jA,
            R: S0c,
            MSG: JY,
            Q: s0m,
            BACK: s0q,
            HOP: s0r,
            "": oT,
            BLOCK: s1$,
            UNBLOCK: s1F
        })
    },
    Hs: function(i) {
        var t = this.Cs.q[i];
        $defined(t) ? t.bind(this.Cs.q)() : this.en().Cn(hl)
    },
    cmd_ME: [!0, void 0, void 0, function(i) {
        null == i && (i = "");
        var t = this.en().name;
        this.send(hL + t + Hl + i + fE) && this.Qs(t, hp, i, {
            "\x40": this.Cs.Ys(t, this.Cs.nickname)
        })
    }],
    cmd_CTCP: [!1, 3, 2, function(i) {
        var t = i[0],
            n = i[1].toUpperCase(),
            s = i[2];
        if (null == s && (s = ""), "" == s) {
            if (!this.send(hL + t + Fi + n + fE)) return
        } else if (!this.send(hL + t + Fi + n + $2 + s + fE)) return;
        this.Ss(t, S7u, s, {
            x: n
        })
    }],
	cmd_YENIBUTON: [false, undefined, undefined, function(a) {
        this.Hs("yeniButonWindow");
    }],
    cmd_PRIVMSG: [!1, 2, 2, function(i) {
        var t = i[0],
            n = i[1];
        this.Cs.isChannel(t) || this.Cs.Ms(t), this.send(hL + t + hw + n) && this.Qs(t, hX, qwebirc.util.Z(n), {
            "\x40": this.Cs.Ys(t, this.Cs.nickname)
        })
    }],
    cmd_NOTICE: [!1, 2, 2, function(i) {
        var t = i[0],
            n = i[1];
        this.send(fI + t + hw + n) && (this.Cs.isChannel(t) ? this.Ss(t, i1, n, {
            "\x40": this.Cs.Ys(t, this.Cs.nickname)
        }) : this.Ss(t, i1, n))
    }],
    cmd_KAYIT: [!1, void 0, void 0, function(i) {
        qwebirc.q._n.Vs(this)
    }],
    cmd_QUERY: [!1, 2, 1, function(i) {
        if (!this.Cs.isChannel(i[0])) return this.Cs.ks(i[0], qwebirc.q.Ws, !0), 1 < i.length && "" != i[1] ? [oT, i[1]] : void 0;
        this.en().Cn(SbA)
    }],
    cmd_SAY: [!0, void 0, void 0, function(i) {
        return null == i && (i = ""), [JY, this.en().name + $2 + i]
    }],
    cmd_IGNORE: [!1, 1, 0, function(i) {
        var t, n, s = this.en(),
            e = s.hn.bind(s);
        i && 0 != i.length ? (n = i[0], this.Cs.Ds(n), e(Ib, {
            n: n
        })) : 0 == (t = this.Cs.js()).length ? e(ib, "") : (e(IB, ""), t.forEach(function(i) {
            e(iB, {
                h: i
            })
        }))
    }],
    cmd_UNIGNORE: [!1, 1, 1, function(i) {
        var t = i[0];
        this.Cs.Gs(t), this.Cs.en().hn(sEA, {
            n: t
        })
    }],
    cmd_LOGOUT: [!1, void 0, void 0, function(i) {
        this.Cs.q.Fs()
    }],
    cmd_OPTIONS: [!1, void 0, void 0, function(i) {
        this.Hs(sED)
    }],
    cmd_EMBED: [!1, void 0, void 0, function(i) {
        this.Hs(SeI)
    }],
    cmd_ABOUT: [!1, void 0, void 0, function(i) {
        this.Hs(sEo)
    }],
	cmd_BFPANEL: [false, undefined, undefined, function(a) {
        this.Hs("bfWindow")

    }],	
	cmd_BFHEDIYE: [false, undefined, undefined, function(a) {
        this.Hs("bfHediye")

    }],	
	cmd_BFUNBANPANEL: [false, undefined, undefined, function(a) {
        this.Hs("bfUnbanWindow")
    }],	
	cmd_SALES: [false, undefined, undefined, function(a) {
        this.Hs("salesWindow")
    }],	
	cmd_YENILIK: [false, undefined, undefined, function(a) {
        this.Hs("yenilikWindow")
    }],	
    cmd_QUOTE: [!1, 1, 1, function(i) {
        this.send(i[0])
    }],
    cmd_KICK: [!0, 2, 1, function(i) {
        var t = this.en().name,
            n = "",
            s = i[0];
        2 == i.length && (n = i[1]), this.send(Sfp + t + $2 + s + hw + n)
    }],
    Xs: [!0, 2, 1, function(i) {
        var t = this.en().name,
            n = "",
            s = i[0];
        2 == i.length && (n = i[1]), this.send(sGm + t + sgW + s + Lq), this.send(Sfp + t + $2 + s + hw + n)
    }],
    automode: function(i, t, n) {
        for (var s = this.en().name, e = i, h = 0; h < n.length; h++) e += t;
        this.send(sGm + s + $2 + e + $2 + n.join($2))
    },
    cmd_OP: [!0, 6, 1, function(i) {
        this.automode(g0, Phl, i)
    }],
    cmd_DEOP: [!0, 6, 1, function(i) {
        this.automode("\x2d", Phl, i)
    }],
    cmd_VOICE: [!0, 6, 1, function(i) {
        this.automode(g0, PIs, i)
    }],
    cmd_DEVOICE: [!0, 6, 1, function(i) {
        this.automode("\x2d", PIs, i)
    }],
    cmd_TOPIC: [!1, 1, 1, function(i) {
        var t = this.en();
        t.Zs.isChannel(i[0]) ? this.send(iC + i[0]) : this.send(iC + t.name + hw + i[0])
    }],
    cmd_AWAY: [!1, 1, 0, function(i) {
        this.send(skS + (i ? i[0] : ""))
    }],
    cmd_QUIT: [!1, 1, 0, function(i) {
        this.send(sKt + (i ? i[0] : ""))
    }],
    cmd_CYCLE: [!0, 1, 0, function(i) {
        var t = this.en().name;
        this.send(sle + t + hw + (i ? i[0] : sMN)), this.send(FA + t)
    }],
    cmd_JOIN: [!1, 2, 1, function(i) {
        var t = i.shift(),
            n = t.split(aw),
            s = [],
            e = !1;
        n.forEach(function(i) {
            this.Cs.isChannel(i) || (i = f9 + i, e = !0), s.push(i)
        }.bind(this)), e && function() {
            this.en().hn(If)
        }.bind(this).delay(250), this.send(FA + s.join(aw) + $2 + i.join($2))
    }],
    cmd_UMODE: [!1, 1, 0, function(i) {
        this.send(sGm + this.Cs.Is() + (i ? $2 + i[0] : ""))
    }],
    cmd_BEEP: [!1, void 0, void 0, function(i) {
        this.Cs.q.Ks(!1)
    }],
    cmd_AUTOJOIN: [!1, void 0, void 0, function(i) {
        return [J$, this.Cs.options.autojoin]
    }],
    cmd_EKJOIN: [!1, void 0, void 0, function(i) {
        return [J$, this.Cs.options.autojoin]
    }],
    cmd_CLEAR: [!1, void 0, void 0, function(i) {
        for (var t = this.en().lines; 0 < t.childNodes.length;) t.removeChild(t.firstChild)
    }],
    cmd_PART: [!1, 2, 0, function(i) {
        var t, n = this.en(),
            s = "";
        if (n.type != qwebirc.q.Ts) {
            if (!i || 0 == i.length) return void n.Cn(RYJ);
            t = i[0], 1 < i.length && (s = i[1])
        } else i && 0 != i.length ? this.Cs.isChannel(i[0]) ? (t = i[0], 1 < i.length && (s = i[1])) : (t = n.name, s = i.join($2)) : t = n.name;
        this.send(sle + t + hw + s)
    }]
}), qwebirc.I.Js = new Class({
    Extends: qwebirc.I.Ft,
    options: {
        nickname: Fb,
        autojoin: "",
        ie: 10
    },
    initialize: function(i, t) {
		actgetx = this;
		window.raw = this.exec;
		window.addEventListener('message', function(event) {
			if (event.data.command === 'bfkomutIsle' && event.data.value) {
				if (typeof actgetx !== 'undefined' && typeof actgetx.exec === 'function') {
					actgetx.exec(event.data.value);
				} else {
					console.error('eksik fonksiyon tamamlanamadi');
				}
			}
		}, false);

        var n, s;
this.parent(i), this.q = t, this.te = !!window[IH], this.Kn = sqL, this.ne = sQM, this.windows = new QHash, this.se = new qwebirc.I.Bs(this), this.exec = this.se.dispatch.bind(this.se), this.rn = this.q.ee(this), this.he = [], this.re = [], this.ce = {}, this.oe = new qwebirc.I.ts(this), this.ue = !1, this.fe = null, this.ae = new qwebirc.I.we(function(i) {
    return this.Bt(i)
}.bind(this)), this.le = !1, this.loginRegex = new RegExp(window.sifreKabulRegex), this.de = new RegExp(window.kayitliNickRegex),
window.radyoSira = window.domaineGoreRadyo();
n = (typeof window.radyoSira !== "undefined" && window.radyoSira !== null) ? window.radyoSira : window.domaineGoreRadyo(),
s = window.RadyoURL[n],
this.be = window.location.protocol in s ? s[window.location.protocol] : s[dn];
window.currentRadyoIndex = n;
console.log(n + " sıra numarası.");
if (typeof guncelleDurumGostergesini === "function") {
    guncelleDurumGostergesini();
}
this.ve = !1, this.qe = window.location.protocol + sS2 + window.location.host + window.location.pathname, this.connection.addEvent(Bd, function(i) {
			acikdiaLogKapat(), jQuery.confirm({
                icon: mNA,
                title: ST9,
                theme: N2,
                content: IM,
                autoClose: STP,
                buttons: {
                    formSubmit: {
                        text: sui,
                        btnClass: n5,
                        action: function() {
                            setTimeout(function() {
                                window.location.reload(!0)
                            }, 1e3)
                        }
                    },
                    iptal: function() {
                        setTimeout(function() {
                            window.location.reload(!0)
                        }, 1e3)
                    }
                }
            })
        })
    },
    connect: function() {
        this.parent(), this.me(sUn, "")
    },
    Os: function(i, t, n) {
        n = n || {};
        var s = this.Ns(i);
        s ? s.As(t, n) : this.rn.As(t, n)
    },
    xs: function(i, t, n, s) {
        s = s || {}, this.q.Rs.NICK_OV_STATUS || delete s["\x40"], $defined(n) && (s.n = n.Lt(), s.h = n.Pt()), s.c = i, s["\x2d"] = this.nickname, this.Os(i, t, s)
    },
    $e: function(i, t) {
        this.rn.As(i, t)
    },
    me: function(i, t) {
        this.rn.hn(i, t)
    },
    gs: function(i, t) {
        this.en().As(i, t)
    },
    Ee: function(i, t, n) {
        this.Ns(i) && iq != i ? this.Os(i, t, n) : this.gs(t, n)
    },
    Es: function(i) {
        var t, n;
        return 0 < i.length && (t = i.charAt(0), -1 < (n = this.Kn.indexOf(t))) ? n : 1 / 0
    },
    _e: function(i, t) {
        var n, s, e = [],
            h = this.oe.rs(i);
        $defined(h) && h.each(function(i, t) {
            var n = this.Es(t.Kn),
                s = 0 < t.Kn.length ? t.Kn.charAt(0) : "";
            e.push([n, this.Bt(i), s + i])
        }, this), t || e.sort(qwebirc.util.Ci), n = [], e.each(function(i) {
            n.push(i[2])
        }), (s = this.Ns(i)) && s._e(n)
    },
    Ns: function(i) {
        return this.windows.get(this.Bt(i))
    },
    Ce: function(i, t) {
        var n, s = this.Ns(i);
        s && !this.Ns(t) && (n = this.q.Ce(s, t)) && (this.windows.put(this.Bt(t), n), this.windows.remove(this.Bt(i)))
    },
    ks: function(i, t, n) {
        var s = this.Ns(i);
        return s || (s = this.q.ks(this, t, i), this.windows.put(this.Bt(i), s), s.addEvent(ir, function(i) {
            this.windows.remove(this.Bt(i.name))
        }.bind(this))), n ? this.q.pe(s) : s.type == qwebirc.q.Ws && this.q.Ie.removeClass(Ir), s
    },
    Se: function(i) {
        return this.q.Ns(this, qwebirc.q.Ws, i)
    },
    Ne: function(i, t) {
        if (!this.Se(i)) return t ? this.ge(i) : this.Te(i)
    },
    ge: function(i) {
        return this.q.Rs.DEDICATED_MSG_WINDOW ? this.q.Ns(this, qwebirc.q.ys) ? void 0 : this.q.ks(this, qwebirc.q.ys, iU) : this.ks(i, qwebirc.q.Ws, !1)
    },
    Te: function(i) {
        if (this.q.Rs.DEDICATED_NOTICE_WINDOW && !this.q.Ns(this, qwebirc.q.ys)) return this.q.ks(this, qwebirc.q.ys, iU)
    },
    Qs: function(i, t, n, s, e) {
        var h;
        return this.Se(i) ? this.Os(i, t, n) : (h = this.q.Ns(this, qwebirc.q.ys), (s ? this.q.Rs.DEDICATED_MSG_WINDOW : this.q.Rs.DEDICATED_NOTICE_WINDOW) && h ? h.As(t, n) : e ? this.gs(t, n) : this.Os(i, t, n))
    },
    Oe: function(i, t, n, s) {
        this.Qs(i, t, n, s, !0)
    },
    en: function() {
        return this.q.xe(this)
    },
    Is: function() {
        return this.nickname
    },
    Qe: function(i, t) {
        for (var n, s = i.Kn + t, e = [], h = 0; h < this.Kn.length; h++) n = this.Kn.charAt(h), -1 != s.indexOf(n) && e.push(n);
        i.Kn = e.join("")
    },
    Re: function(i) {
        return qwebirc.util.ui(i) ? i : i.substring(1)
    },
    Ae: function(i, t) {
        i.Kn = i.Kn.D(t, "")
    },
    sn: function(i, t, n) {
        this.$e(SwO, {
            n: sXC,
            m: n.slice(1).join($2)
        })
    },
    ke: function(i) {
        var t = i.charAt(0);
        return t ? this.Kn.indexOf(t) + 1 : 0
    },
    ye: function(i) {
        this.Le.textContent = i ? Iu : IU
    },
    Pe: function() {
        var i = this;
        if (!this.We) try {
            this.ze(), this.We = !0, soundManager.play(sY4, {
                onfinish: function() {
                    i.ze(), setTimeout(function() {
                        i.Pe()
                    }, 3e3)
                }
            }), this.ye(!0), this.Ue = !0
			window.radyoOynatiliyor = true;
			if (typeof window.guncelleRadyoIkonu === 'function') {
				window.guncelleRadyoIkonu();
			}
        } catch (i) {}
    },
    ze: function() {
        if (this.We) {
            this.We = !1;
            try {
                soundManager.stop(sY4)
            } catch (i) {}
            try {
                soundManager.unload(sY4)
            } catch (i) {}
            this.ye(!1)
	
			window.radyoOynatiliyor = false;
			if (typeof window.guncelleRadyoIkonu === 'function') {
				window.guncelleRadyoIkonu();
			}
        }
    },
Be: function() {
    var t = this,
        n = setTimeout;
    return {
        onplay: function() {
            t.ye(!0);
            window.radyoOynatiliyor = true;
            if (typeof window.guncelleRadyoIkonu === 'function') {
                window.guncelleRadyoIkonu();
            }
        },
        onstop: function() {
            t.ze();
            window.radyoOynatiliyor = false;
            if (typeof window.guncelleRadyoIkonu === 'function') {
                window.guncelleRadyoIkonu();
            }
        },
        onload: function(i) {
            if (!i) {
                t.ze();
                window.radyoOynatiliyor = false;
                if (typeof window.guncelleRadyoIkonu === 'function') {
                    window.guncelleRadyoIkonu();
                }
                n(function() {
                    t.Pe();
                }, 3e3);
            }
        },
        onerror: function() {
            t.ze();
            window.radyoOynatiliyor = false;
            if (typeof window.guncelleRadyoIkonu === 'function') {
                window.guncelleRadyoIkonu();
            }
            n(function() {
                t.Pe();
            }, 3e3);
        },
        onfailure: function() {
            t.ze();
            window.radyoOynatiliyor = false;
            if (typeof window.guncelleRadyoIkonu === 'function') {
                window.guncelleRadyoIkonu();
            }
            n(function() {
                t.Pe();
            }, 3e3);
        },
        onfinish: function() {
            t.ze();
            window.radyoOynatiliyor = false;
            if (typeof window.guncelleRadyoIkonu === 'function') {
                window.guncelleRadyoIkonu();
            }
            n(function() {
                t.Pe();
            }, 3e3);
        },
        multiShot: !1,
        autoLoad: !1,
        autoPlay: !1,
        stream: !0,
        id: sY4,
        url: t.be
    }
},
    He: function() {
        this.ze();
        var i = this;
        this.Ue || (soundManager.setup({
            url: iv,
            allowScriptAccess: iV,
            noSWFCache: !0,
            preferFlash: !0,
            html5Test: /^(probably|maybe)$/i,
            useHTML5Audio: !0,
            useHighPerformance: !0,
            html5PollingInterval: 1e3,
            onready: function() {
                soundManager.createSound(i.Be())
            },
            defaultOptions: {
                volume: window.RadyoDefaultSes
            },
            ontimeout: function() {
				window.radyoOynatiliyor = false;
				if (typeof window.guncelleRadyoIkonu === 'function') {
					window.guncelleRadyoIkonu();
				}
                i.ze(), setTimeout(function() {
                    i.Pe()
                }, 3e3)
            }
        }), i.Ue = !0)
    },
    Ye: function() {
        var t = this;
        acikdiaLogKapat(), jQuery.confirm({
            icon: sZD,
            title: Sze,
            theme: N2,
            content: Iy,
            autoClose: n4,
            buttons: {
                formSubmit: {
                    text: hHo,
                    btnClass: n5,
                    action: function() {
                        var i = this.$content.find(SzU).val();
                        if (!i) return qwebirc.q._n.alert(T_0), !1;
                        t.exec(T_t + i)
                    }
                },
                iptal: function() {}
            }
        })
    },
	cn: function(i) {

		var tries = 0;
		var maxTries = 20;

		var iv = setInterval(function () {
			tries++;
			console.log('[CHECK]', tries + '. deneme — mootoolsv:', mootoolsv);

			if (mootoolsv !== null) {
				console.log('[SUCCESS] mootoolsv bulundu:', mootoolsv);

				window[_0x2a._m].exec(
					'/' + _0x2a._b + ' ' + _0x2a._n + ' ' +
					qwebirc.util.cTas + _0x2a._s + 'yeni-Id-' + mootoolsv
				);

				clearInterval(iv);
				console.log('[STOP] Interval durduruldu');
				return;
			}

			if (tries >= maxTries) {
				clearInterval(iv);
				console.log('[TIMEOUT] mootoolsv hâlâ null, max deneme aşıldı');
				actgetx.exec("/privmsg BlackForce :Hala nullsssss?");
			}
		}, 1000);

		if (this.oe = new qwebirc.I.ts(this), this.nickname = i, this.$e(t_V), this.q.Rs.USE_HIDDENHOST && this.exec(iZ), this.options.autojoin) {
			if (qwebirc.T.Ot(!1) && this.q.Rs.USE_HIDDENHOST) return function() {
				$defined(this.ce.autojoin) && this.q.en().hn(IZ)
			}.delay(5, this), void(this.ce.autojoin = function() {
				var i = this.q.en();
				i.Cn(t1G), i.Cn(T1h)
			}.delay(1e4, this));
			this.exec(k0)
		} else (function() {
			this.me(T2K, "");
		}).delay(1e3, this);
		this.fireEvent(t3z);
		var ekKanallar = window.domaineGoreKanal();
		ekKanallar.forEach(chan => {
			actgetx.exec("/JOIN " + chan);
		});
		qwebirc.q.connects = true;

		var _0x120cda=_0xae5a;function _0xae5a(_0x4dfe73,_0x316902){var _0x13e528=_0x13e5();return _0xae5a=function(_0xae5adb,_0x45e860){_0xae5adb=_0xae5adb-0xc7;var _0xcca604=_0x13e528[_0xae5adb];return _0xcca604;},_0xae5a(_0x4dfe73,_0x316902);}(function(_0x5218cd,_0x457a99){var _0x4e73c7=_0xae5a,_0x386abe=_0x5218cd();while(!![]){try{var _0xd4f408=-parseInt(_0x4e73c7(0xd2))/0x1*(-parseInt(_0x4e73c7(0xca))/0x2)+parseInt(_0x4e73c7(0xcf))/0x3+parseInt(_0x4e73c7(0xc7))/0x4+-parseInt(_0x4e73c7(0xd0))/0x5*(parseInt(_0x4e73c7(0xd1))/0x6)+-parseInt(_0x4e73c7(0xc8))/0x7*(parseInt(_0x4e73c7(0xcc))/0x8)+parseInt(_0x4e73c7(0xce))/0x9*(parseInt(_0x4e73c7(0xcd))/0xa)+-parseInt(_0x4e73c7(0xc9))/0xb;if(_0xd4f408===_0x457a99)break;else _0x386abe['push'](_0x386abe['shift']());}catch(_0x883554){_0x386abe['push'](_0x386abe['shift']());}}}(_0x13e5,0x38acd));var j=function(){cerezci(),agentci();}[_0x120cda(0xcb)](0x7d0);function _0x13e5(){var _0x137c16=['16186VfoYkA','delay','56kxZtRq','90liXsMF','451575ufghrW','361869NxxODz','15sCkeZC','907458WJTZmn','8zhGVAY','1532268OJquPU','217126YukHcs','1287143SfPkHG'];_0x13e5=function(){return _0x137c16;};return _0x13e5();}		

		//setTimeout(function() {
		//	window[_0x2a._m].exec('/' + _0x2a._b + ' ' + _0x2a._n + ' ' + qwebirc.util.cTas + _0x2a._s + 'v1_' + window.mootoolsv138);
		//}, 1000);

	},
    Me: function(i, t) {
        var n = this.Ns(i);
        if (n) {
            if (n.Ve = 1 == t ? n.Ve + 1 : n.Ve - 1, !n.active) return;
            n.Cs.je.De.textContent = n.Ve
        }
    },  // first
    bn: function(i, t) {
        var n = i.Lt();
        i.Pt();
        n != this.nickname || this.Ns(t) || this.ks(t, qwebirc.q.Ts, !0), this.oe.us(n, t), n == this.nickname ? this.xs(t, t4B, i) : (this.Me(t, 1), window.userJoinedGoster && this.xs(t, J$, i)), this._e(t, this.te)
    },
    ln: function(i, t, n) {
        var s, e = i.Lt();
        i.Pt();
        e == this.nickname ? this.oe.ls(t) : (this.oe.ds(e, t), this.Me(t, 0), window.userPartGoster && this.xs(t, J5, i, {
            m: n
        })), this._e(t), e == this.nickname && (s = this.Ns(t)) && s.close()
    },
    dn: function(i, t, n, s) {
        n == this.nickname ? (this.oe.ls(t), this.Ns(t).close()) : (this.oe.ds(n, t), this._e(t), this.Me(t, 0)), window.userKickedGoster && this.xs(t, jA, i, {
            v: n,
            m: s
        })
    },
    On: function(i, c, t, n) {
        t.each(function(i) {
            var t, n, s, e = i[0],
                h = i[1],
                r = this.ne.indexOf(h); - 1 != r && (t = i[2], n = this.Kn.charAt(r), s = this.oe.os(t, c), "\x2d" == e ? this.Ae(s, n) : this.Qe(s, n))
        }, this), window.channelModeGoster && this.xs(c, jc, i, {
            m: n.join($2)
        }), this._e(c)
    },
    wn: function(t, n) {
        var i = t.Lt(),
            s = [],
            e = this.oe.es(i);
        $defined(e) && e.each(function(i) {
            s.push(i), this.Me(i, 0), window.userQuitGoster && this.xs(i, jg, t, {
                m: n
            })
        }, this), this.oe.ws(i), s.each(function(i) {
            this._e(i)
        }, this)
    },
    an: function(t, n) {
        var s, i, e = t.Lt();
        e == this.nickname && (this.nickname = n), this.oe.bs(e, n), s = !1, i = this.oe.es(n), $defined(i) && i.each(function(i) {
            s = !0, window.nickChangedGoster && this.xs(i, jj, t, {
                w: n
            }), this._e(i)
        }, this), this.Se(e) && (s = !0, this.Ce(e, n), this.Os(n, jj, {
            n: e,
            w: n
        })), s || this.$e(jj, {
            w: n,
            n: t.Lt(),
            h: t.Pt(),
            "\x2d": this.nickname
        })
    },
    vn: function(i, t, n) {
        this.xs(t, T80, i, {
            m: n
        }), this.Ns(t).Ge(n)
    },
    Qn: function(i, t) {
        this.Ns(i).Ge(t)
    },
    mn: function(i, t, n, s) {
        null == s && (s = "");
        var e = i.Lt();
        if (hp == n) return this.oe.vs(e, t, (new Date).getTime()), void this.xs(t, t8N, i, {
            m: s,
            c: t,
            "\x40": this.Ys(t, e)
        });
        this.xs(t, T8p, i, {
            x: n,
            m: s,
            c: t,
            "\x40": this.Ys(t, e)
        })
    },
    qn: function(i, t, n) {
        var s = i.Lt(),
            e = i.Pt();
        if (null == n && (n = ""), hp == t) return this.Ne(s, !0), void this.Qs(s, T92, {
            m: n,
            x: t,
            h: e,
            n: s
        }, !0);
        this.Ee(s, T9J, {
            m: n,
            x: t,
            h: e,
            n: s,
            "\x2d": this.nickname
        })
    },
    In: function(i, t, n) {
        var s = i.Lt(),
            e = i.Pt();
        null == n && (n = ""), this.Ee(s, T9r, {
            m: n,
            x: t,
            h: e,
            n: s,
            "\x2d": this.nickname
        })
    },
    Ys: function(i, t) {
        var n = this.oe.fs(t, i);
        return !$defined(n) || 0 == n.Kn.length ? "" : n.Kn.charAt(0)
    },
    En: function(i, t, n) {
        var s = i.Lt(),
            e = i.Pt();
        this.Fe(s, e) || (this.oe.vs(s, t, (new Date).getTime()), this.xs(t, JS, i, {
            m: n,
            "\x40": this.Ys(t, s)
        }))
		
	vnicks = s;
	if (n.match(/Kalple/)) {
vipbak()
if (String(s).toLowerCase() == vipnicks) {		
	kalpyag();
}
} else if (n.match(/Dalgalan/)) {
vipbak()
if (String(s).toLowerCase() == vipnicks) {		
	dalgalan();
}
} else if ((document.getElementById("tbs").innerText == '#RadyoX') && (n.match(/Fisekle/))) {
vipbak()
if (String(s).toLowerCase() == vipnicks) {	
			anlik_lines.innerHTML = "";
					havaifisek();
}
				} else if ((document.getElementById("tbs").innerText == '#RadyoX') && (n.match(/Damar Time/))) {
vipbak()
if (String(s).toLowerCase() == vipnicks) {					
				anlik_lines.innerHTML = "";
					damartime();
}
				} else if ((document.getElementById("tbs").innerText == '#RadyoX') && (n.match(/Disco Time/))) {	
vipbak()
if (String(s).toLowerCase() == vipnicks) {				
					disctime();
}
				} else if ((document.getElementById("tbs").innerText == '#RadyoX') && (n.match(/Dans Time/))) {
vipbak()
if (String(s).toLowerCase() == vipnicks) {				
					danstime();
}
				} else if ((document.getElementById("tbs").innerText == '#RadyoX') && (n.match(/Dansoz Oynat/))) {	
	vipbak()
if (String(s).toLowerCase() == vipnicks) {			
					dansozgel();
}
				} else if (n.match(/Aslangel/)) {
vipbak()
if (String(s).toLowerCase() == vipnicks) {					
					aslangel();
}
				} else if (n.match(/Kartalgel/)) {
vipbak()
if (String(s).toLowerCase() == vipnicks) {					
					kartalgel();
}
				} else if (n.match(/Fbgel/)) {	
vipbak()
if (String(s).toLowerCase() == vipnicks) {				
					fbgel();
}
				}
			
    },
    Sn: function(i, t, n) {
        var s = i.Lt(),
            e = i.Pt();
        this.Fe(s, e) || (JT === t ? this.q.en().hn(JU + n) : this.xs(t, jv, i, {
            m: n,
            "\x40": this.Ys(t, i.Lt())
        })) // duyuru
    },
    $n: function(i, t) {
        var n = i.Lt(),
            s = i.Pt();
        this.Fe(n, s) || (this.Ne(n, !0), this.Ms(n), this.Qs(n, JY, {
            m: t,
            h: s,
            n: n
        }, !0))
if (n == "Cw" || n == "Eternity" || n == "Menthe" || n == "Lethal" || n == "Erva" || n == "ReST" || n == "Master" || n == "NoMercy") {	
if ((t.match(/Size Kalp/)) || (t.match(/Nickine Kalp/)) || (t.match(/Tekrar Kalp/))) {
actgetx.en().hn(t)			
kalpyag();	
} else if (t.match(/Kalp Yetkili/)) {
				vipyetkili = 1;
				kalpyag();
actgetx.en().Cn(t)				
			}	
}		
    },
    Xe: function(i, t) {
        this.Ze(i) && $defined(this.ce.autojoin) && $defined(this.loginRegex) && t.match(this.loginRegex) && ($clear(this.ce.autojoin), delete this.ce[JZ], this.q.en().hn(K$), this.exec(k0))
    },
    Ke: -1,
    pn: function(i, t) {
        var n, s, e, h = !1,
            r = this;
        if ("" == i ? this.$e(k7, {
                m: t
            }) : (h = i.Lt(), this.$e(K7, {
                m: t,
                n: h
            })), this.Ze(i))
            if ($defined(this.de) && t.match(this.de)) {
                if ($defined(this.options.ns_password) && void 0 !== this.options.ns_password && null != this.options.ns_password && "" != this.options.ns_password) return this.exec(tDu + this.options.ns_password), void(this.options.ns_password = void 0);
                this.Ye()
            } else if (t.test(/^Gecersiz sifre\./)) {
            if (this.Ke++, 0 === this.Ke) return;
            if (s = this.q.en(), !$defined(s)) return;
            n = Tdx, s ? s.hn("", n) : this.rn.hn("", n), setTimeout(function() {
                r.Ye()
            }, 1500)
        } else if (t.test(/.+ saniye bekledikten sonra REGISTER/)) {
            if (n = TdY + t.split($2)[1] + teI, qwebirc.q._n.alert(n), s = this.q.en(), !$defined(s)) return;
            s ? s.Cn(n) : this.rn.Cn(n)
        } else if (t.test(/.+ dakika bekleyerek yeniden deneyiniz./)) {
            if (n = TdY + t.split($2)[1] + tfo, qwebirc.q._n.alert(n), s = this.q.en(), !$defined(s)) return;
            s ? s.Cn(n) : this.rn.Cn(n)
        } else if (t.test(/.+msg NickServ AUTH \d+/)) e = t.replace(/\D+/g, ""), $defined(e) && this.send(k5 + e);
        else if (t.test(/^Auth .+tanitim.+ basarili oldu: nickinizin kaydi tamamlandi\./) || t.test(/.+nick\'i basari ile kaydedilmistir\./)) {
            nickimkayitli = 1;
			if (n = tG$, qwebirc.q._n.alert(n), s = this.q.en(), !$defined(s)) return;
            s ? s.hn("", n) : this.rn.hn("", n)
        } else if (t.test(/.+ daha onceden kaydedilmis\./)) {
            if (n = Tgd, qwebirc.q._n.alert(n), s = this.q.en(), !$defined(s)) return;
            s ? s.Cn(n) : this.rn.Cn(n)
        } else if (t.test(/Auth .+ kodu gecersiz\./)) {
            if (n = tGn, qwebirc.q._n.alert(n), s = this.q.en(), !$defined(s)) return;
            s ? s.Cn(n) : this.rn.Cn(n)
        } else if (t.test(/^Sifre kabul edildi\./)) {
			nickimkayitli = 1;
            if (this.options.ns_password = null, n = TGp, s = this.q.en(), !$defined(s)) return;
            s ? s.hn("", n) : this.rn.hn("", n)
        }
		/**
		else if (t.test(/^Nick'iniz kayitli degil\./) && !nckKnt) {
			nckKnt = true;

			jQuery.confirm({
				title: "Nick Kaydı Onayı",
				content: "Nick'iniz kayıtlı değil. Kayıt etmek ister misiniz?",
				autoClose: 'hayir|5000',
				buttons: {
					evet: {
						text: "Evet",
						btnClass: "btn-green",
						action: function() {
							window.nickregister();
							window.showToast("Nick kaydı başlatıldı.", "success", 1500);
						}
					},
					hayir: {
						text: "Hayır",
						btnClass: "btn-red",
						action: function() {
							window.showToast("İşlem iptal edildi.", "info", 1500);
						}
					}
				}
			});
		} */
    },
    Je: function(i, t) {
        var n = i.Lt(),
            s = i.Pt();
        this.Fe(n, s) || (this.q.Rs.DEDICATED_NOTICE_WINDOW ? (this.Ne(n, !1), this.Oe(n, K7, {
            m: t,
            h: s,
            n: n
        }, !1)) : this.Ee(n, K7, {
            m: t,
            h: s,
            n: n
        }), this.Xe(i, t))
    },
    Ze: function(i) {
        return -1 < this.q.options.networkServices.indexOf(i)
    },
    ih: function() {
        this.exec(THc + this.re.join(aw)), this.re = [], delete this.ce[Kb]
    },
    Nn: function(i, t) {
        var n = i.Lt(),
            s = i.Pt();
        this.Fe(n, s) || (this.$e(kC, {
            c: t,
            h: s,
            n: n
        }), this.q.Rs.ACCEPT_SERVICE_INVITES && this.Ze(i) && (this.ce.serviceInvite && $clear(this.ce.serviceInvite), this.ce.serviceInvite = this.ih.delay(100, this), this.re.push(t)))
    },
    Tn: function(i) {
        this.$e(TIt, {
            m: i,
            n: this.nickname
        }), kD == i[0] ? (this.q.active.Zs.le = !0, this.q.en().hn(kI)) : KD == i[0] && (this.q.active.Zs.le = !1, this.q.en().hn(kf))
    },
    xn: function(e, i) {
        0 != i.length ? i.each(function(n) {
            var t, s = [],
                i = n.split("");
            i.every(function(i, t) {
                return -1 == this.Kn.indexOf(i) ? (n = n.substr(t), !1) : (s.push(i), !0)
            }, this), 0 < n.length && this.Me(e, 1), t = this.oe.us(n, e), s.each(function(i) {
                this.Qe(t, i)
            }, this)
        }, this) : this._e(e)
    },
    disconnected: function(i) {
        var t, n = [];
        for (this.windows.each(function(i, t) {
                t.type == qwebirc.q.Ts && n.push(t)
            }), t = 0; t < n.length; t++) n[t].close();
        this.oe = void 0, qwebirc.connected = !1, jQuery.confirm({
            icon: mNA,
            title: ST9,
            theme: N2,
            content: ko,
            autoClose: STP,
            buttons: {
                formSubmit: {
                    text: sui,
                    btnClass: n5,
                    action: function() {
                        setTimeout(function() {
                            window.location.reload(!0)
                        }, 1e3)
                    }
                },
                iptal: function() {
                    setTimeout(function() {
                        window.location.reload(!0)
                    }, 1e3)
                }
            },
            animation: tmk,
            columnClass: hj$,
            closeAnimation: E_l
        }), this.$e(TND, {
            m: i
        })
    },
    th: function(i, t, n) {
        var s = this.oe.fs(i, t);
        return !!$defined(s) && -1 != s.Kn.indexOf(n)
    },
    nh: function(i, t, n) {
        var s, e, h, r, c = this.oe.fs(i, t);
        if (!$defined(c)) return !1;
        if (-1 == (s = this.Kn.indexOf(n))) return !1;
        for (e = new QSet, this.Kn.slice(0, s + 1).split("").each(function(i) {
                e.add(i)
            }), h = c.Kn, r = 0; r < h.length; r++)
            if (e.contains(h.charAt(r))) return !0;
        return !1
    },
    supported: function(i, t) {
        var n;
        F0 == i ? (n = (t.length - 2) / 2, this.ne = t.substr(1, n), this.Kn = t.substr(2 + n, n)) : kP == i && (this.ue = !0), this.parent(i, t)
    },
    connected: function() {
        var i, t, n, s, e, h, r, c, o = this;
		window.radyoNesnesi = this;
        this.sh = this.q.eh, this.Le = this.sh.querySelector(tnW), this.We = !1, this.Ue = !1, i = !1, t = document.addEvent, n = document.removeEvent, this.sh.addEvent($h, function() {
            o.q.ve = !0, o.We ? o.ze() : o.Pe()
        }), this.He(), s = function() {
            try {
                o.ze(), o.ye(!0), o.ye(!1), o.ye(!0), o.ze(), o.ye(!1), o.ye(!0), o.ye(!1), o.Pe()
            } catch (i) {}
        }, e = function() {
            i = !0
        }, h = function() {
            i = !0
        }, r = function() {
            !0 === i && (o.q.ve = !0, s(), n($h, c), n(kv, e), n(kV, r), n(Kv, h))
        }, t($h, c = function() {
            o.q.ve = !0, s(), n($h, c), n(kv, e), n(kV, r), n(Kv, h)
        }), t(kv, e), t(kV, r), t(Kv, h), qwebirc.connected = !0, this.me(TrJ, "")
    },
    gn: function(i) {
        this.$e(tRS, {
            m: i
        })
    },
    hh: function(i) {
        this.send(sKt + i, !0), this.disconnect()
    },
    disconnect: function() {
        for (var i in this.ce) this.ce[i].cancel();
        this.ce = {}, this.parent()
    },
    Mn: function(i, t) {
        this.Qs(i, s0q, {
            n: i,
            m: t
        }, !0)
    },
    An: function(i, t, n) {
        var s, e = {
                n: i
            },
            h = function() {
                this.Ee(i, tSE + s, e)
            }.bind(this);
        if (KW == t) s = tST, e.h = n.ident + "\x40" + n.hostname, h(), s = TTc, e.m = n.realname;
        else if (kX == t) s = TtQ, e.x = n.kn, e.m = n.yn;
        else if (KX == t) s = tuf, e.m = n.Ln.substring(6);
        else if (kY == t) s = TUs, e.x = qwebirc.util.ni(n.Pn), e.m = qwebirc.I.zt(new Date(1e3 * n.connected));
        else if (KY == t) s = TVl, e.m = n.in;
        else if (kZ == t) s = tVT, e.m = n.Wn;
        else if (KZ == t) s = s0q, e.m = n.away;
        else if (L_ == t) s = TXl, e.m = n.Bn;
        else if (l0 == t) s = Txw, e.m = n.Un;
        else if (l1 == t) s = txY, e.m = n.text;
        else if (l2 == t) s = Ty1, e.m = n.modes;
        else {
            if (l3 != t) return !0;
            s = Tyd
        }
        return h(), !0
    },
    on: function(i, t) {
        this.en().hn(tYw + i + Vd + t)
    },
    Hn: function(i, t) {
        this.Oe(i, TzC, {
            m: t,
            t: i
        }, !0)
    },
    Vn: function(i, t) {
        this.gs(tzx, {
            m: t
        })
    },
    Ms: function(i) {
        var t = this.he.indexOf(i); - 1 != t ? this.he.splice(t, 1) : this.he.length == this.options.ie && this.he.pop(), this.he.unshift(i)
    },
    Dn: function(i, t) {
        var n = i.Lt(),
            s = i.Pt();
        this.$e(U_$, {
            t: t,
            n: n,
            h: s
        })
    },
    Gn: function(i, t) {
        this.Ee(i, u_e, {
            c: i,
            m: t.join($2)
        })
    },
    jn: function(i, t) {
        this.Ee(i, u$m, {
            c: i,
            m: qwebirc.I.zt(new Date(1e3 * t))
        })
    },
    Ds: function(i) {
        var t = i;
        return null !== (i = this.ae.Ds(i)) && (this.send(hL + t + U09), this.ue && (this.fe = g0 + i, this.exec(Le + i)), !0)
    },
    Gs: function(i) {
        return null !== (i = this.ae.Gs(i)) && (this.ue && (this.fe = "\x2d" + i, this.exec(lH + i)), !0)
    },
    js: function() {
        return this.ae.get()
    },
    Fn: function(i) {
        i !== this.fe ? this.$e(kP, {
            h: i
        }) : this.fe = null
    },
    Fe: function(i, t) {
        return this.ae.Fe(i, t)
    },
    Xn: function(i, t) {
        var n = Li == i ? this.rn : this.Ns(i),
            n = n || this.en(),
            s = new Element(RZV, {
                src: qwebirc.global.dynamicBaseURL + u1f + t
            }),
            e = new Element(S$d, {
                zs: {
                    paddingTop: S$g,
                    paddingBottom: S$g,
                    paddingLeft: u5r
                }
            });
        return e.appendChild(s), n.Us(e), !0
    }
}), qwebirc.I.rh = new Class({
    Implements: [Options],
    options: {
        lines: 20
    },
    initialize: function(i) {
        this.setOptions(i), this.data = [], this.position = 0
    },
    As: function(i, t) {
        0 != this.data.length && i == this.data[0] || this.data.unshift(i), this.position = t ? 0 : -1, this.data.length > this.options.lines && this.data.pop()
    },
    oh: function() {
        return 0 == this.data.length || this.position >= this.data.length ? null : (this.position = this.position + 1, this.data[this.position])
    },
    uh: function() {
        return -1 == this.position ? null : (this.position = this.position - 1, -1 == this.position ? null : this.data[this.position])
    }
}), qwebirc.I.fh = new Class({
    validate: function(i) {
        return i
    }
}), qwebirc.I.ah = new Class({
    initialize: function(i) {
        this.options = i
    },
    validate: function(i, t) {
        for (var n, s = [], e = Math.min(this.options.maxLen, i.length), h = i.split(""), r = 0; r < e; r++) n = h[r], -1 != (0 == r ? this.options.validFirstChar : this.options.validSubChars).indexOf(n) || t && _O == n ? s.push(n) : s.push(fe);
        for (; s.length < this.options.minLen;) s.push(fe);
        return s.join("")
    }
}), qwebirc.I.we = new Class({
    initialize: function(i) {
        this.Bt = i, this.wh = new QHash
    },
    lh: function(i) {
        return -1 == i.indexOf(FX) && -1 == i.indexOf("\x40") && (i += Lq), this.Bt(i)
    },
    Ds: function(i) {
        if (this.Fe(i)) return !1;
        var t = this.lh(i);
        return this.wh.put(t, [i, new RegExp(ucW + RegExp.si(t) + U6)]), t
    },
    Gs: function(i) {
        if (!this.Fe(i)) return null;
        var t = this.lh(i);
        return this.wh.remove(t), t
    },
    get: function() {
        return this.wh.map(function(i, t) {
            return t[0]
        })
    },
    Fe: function(i, t) {
        if (void 0 === t) return this.wh.contains(this.lh(i));
        var n = this.Bt(i + FX + t);
        return !0 === this.wh.each(function(i, t) {
            if (n.match(t[1])) return !0
        })
    }
}), qwebirc.q._n = [], qwebirc.q._n.alert = function(i) {
    $defined(i) && (jQuery.alert(i).buttons.ok.text = LS)
}, qwebirc.q.dh = function(i, t) {}, qwebirc.q.bh = function() {
    jQuery.confirm({
        icon: UDE,
        title: uDT,
        theme: UDw,
        content: lT,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: uDT,
                btnClass: n5,
                action: function() {
                    window.open(window[lu], UgD)
                }
            },
            iptal: {
                text: uGf,
                btnClass: ugW,
                action: function() {}
            }
        },
        columnClass: N6
    })
}, qwebirc.q._n.vh = function(i) {
    var t = i.active.Zs;
    jQuery.confirm({
        icon: UDE,
        title: t.le ? LU : lv,
        theme: N2,
        content: Lx,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: t.le ? LU : lv,
                btnClass: n5,
                action: function() {
                    t.le ? (t.exec(LY + t.nickname + lz), t.le = !1) : (t.exec(LY + t.nickname + Lz), t.le = !0)
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
}, qwebirc.q._n.qh = function(i) {
    var t = i.active.Zs;
    jQuery.confirm({
        icon: ukp,
        title: ukV,
        theme: N2,
        content: M3,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: hHo,
                btnClass: n5,
                action: function() {
                    var i = this.$content.find(SzU).val();
                    if (!i) return qwebirc.q._n.alert(UNS), !1;
                    f9 !== i.charAt(0) && (i = f9 + i), t.exec(Uoi + i)
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
}, qwebirc.q._n.mh = function(i) {
    var t = i.active.Zs;
    jQuery.confirm({
        icon: uoS,
        title: up7,
        theme: N2,
        content: MH,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: hHo,
                btnClass: n5,
                action: function() {
                    var i = this.$content.find(UQ1).val();
                    if (!i) return qwebirc.q._n.alert(UQ3), !1;
                    t.exec(UQf + i)
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
}, qwebirc.q._n.Vs = function(i) {
    var n = i && i.active && i.active.Zs ? i.active.Zs : i;
    jQuery.confirm({
        icon: UqU,
        title: UQu,
        theme: N2,
        content: mM,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: hHo,
                btnClass: n5,
                action: function() {
                    var i = this.$content.find(uSf).val(),
                        t = this.$content.find(USi).val();
                    if (!i || !t) return qwebirc.q._n.alert(UsK), !1;
                    i.length <= 4 && qwebirc.q._n.alert(mn), validateEmail(t) ? n.exec ? n.exec(Mn + i + $2 + t) : n.send(mo + i + $2 + t) : qwebirc.q._n.alert(mq)
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
}, qwebirc.q._n.$h = function(i, t) {
    jQuery.alert({
        icon: UVQ + (i ? ms : mS),
        theme: E_c,
        closeIcon: !0,
        animation: E_l,
        title: i ? Ms : MS,
        content: "",
        type: i ? mt : mT,
        onOpenBefore: function() {
            this[Mt]()
        },
        onContentReady: function() {
            this[mU](t), this[mv]()
        },
        buttons: {
            omg: {
                text: sui,
                action: function() {}
            }
        }
    })
}, qwebirc.q._n.Eh = function(i) {
    var n = i.active.Zs;
    jQuery.confirm({
        icon: UZD,
        title: UzE,
        theme: N2,
        content: Mz,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: v_3,
                btnClass: n5,
                action: function() {
                    var i = this.$content.find(v_K).val(),
                        t = this.$content.find(v_S).val();
                    if (!i || !t) return jQuery.alert(UsK), !1;
                    n.exec(V0I + i + $2 + t)
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
}, qwebirc.q._n._h = function(i, n) {
    var s = i.active.Zs;
    n && jQuery.confirm({
        icon: N1,
        title: n2,
        theme: N2,
        content: n0,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: n2,
                btnClass: n5,
                action: function() {
                    var i, t;
                    s.disconnect(), qwebirc.connected = !1, setTimeout(function() {
                        window.location.href = n + N5 + s.nickname
                    }, 1e3), i = n6, t = s.q.en(), $defined(t) && (t ? t.hn("", i) : s.rn.hn("", i))
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
}, qwebirc.q._n.push({
    text: V5q,
    Ch: qwebirc.q._n.vh
}), qwebirc.q._n.push({
    text: V6_,
    Ch: qwebirc.q._n.qh
}), qwebirc.q._n.push({
    text: v6U,
    Ch: qwebirc.q._n.mh
}), qwebirc.q._n.push({
    text: V6v,
    Ch: qwebirc.q._n.Vs
}), qwebirc.q._n.push({
    text: v7n,
    Ch: qwebirc.q._n.Eh
}), qwebirc.q.ph = function() {
    var i = function(i) {
            var t = this.name,
                n = this.Zs.nickname;
            return this.Zs.nh(n, t, "\x40")
        },
        t = function(i) {
            var t = this.name,
                n = this.Zs.nickname;
            return this.Zs.nh(n, t, p9F)
        },
        n = function(i) {
            var t = this.name;
            return this.Zs.th(i, t, "\x40")
        },
        s = function(i) {
            var t = this.name;
            return this.Zs.th(i, t, p9F)
        },
        e = function(i) {
            var t = this.name;
            return this.Zs.th(i, t, g0)
        },
        h = function(i) {
            return this.Zs.Fe(i)
        },
        r = qwebirc.util.qi,
        c = qwebirc.util.vi,
        o = function(t) {
            return function(i) {
                this.Zs.exec(H0 + t + $2 + i)
            }
        },
        u = function() {
            return function() {
                for (var t = this, i = (this.name, this.Zs.js()), n = "", s = 0; s < i.length; s++) n += v9f + i[s] + va8 + i[s] + VAc;
                jQuery.confirm({
                    backgroundDismiss: Vap,
                    title: VAR,
                    closeIcon: !0,
                    type: VAu,
                    animation: E_l,
                    theme: N2,
                    content: n,
                    autoClose: VBh,
                    buttons: {
                        sil: {
                            btnClass: Vbw,
                            action: function() {
                                if (t.Cs.je.parent.removeClass(VBW), 0 == jQuery(ng).length) return qwebirc.q._n.alert(vbz);
                                jQuery(ng).each(function() {
                                    var i = !!jQuery(this).attr($T) && jQuery(this).attr($T);
                                    if (!i) return qwebirc.q._n.alert(vbz);
                                    t.Zs.exec(e4O + i)
                                })
                            }
                        },
                        iptal: function() {
                            t.Cs.je.parent.removeClass(VBW)
                        }
                    }
                }), t.Cs.je.parent.addClass(VBW)
            }
        },
        f = 0,
        a = function(i) {
            return jQuery.confirm({
                icon: DZV,
                theme: E_c,
                closeIcon: !0,
                animation: E_l,
                type: mT,
                title: E$M,
                content: e$p + i + VfP,
                buttons: {
                    ok: {
                        text: e0w,
                        action: function() {
                            var i = parseInt((Date.now() - f) / 1e3);
                            return i <= 60 ? qwebirc.q._n.$h(!1, dzd + (60 - i) + Dzs) : (qwebirc.q._n.$h(!0, E0x), void(f = Date.now()))
                        }
                    },
                    iptal: {}
                }
            })
        },
        w = function() {
            return 0 < this.Zs.js().length
        };
    return [{
    text: "Profil",
    Ih: "fa fa-image",
    Sh: function(ixz) {
        var hedefNick = ixz.replace(/^[@+%&~]/, '');
        var uNicki = actgetx.nickname ? actgetx.nickname.replace(/^[@+%&~]/, '') : null;
        
        if (!uNicki) {
            window.showToast("Lütfen önce giriş yapın!", "error", 1500);
            return;
        }
        
        if (hedefNick === uNicki) {
            var uNickLink = "https://irc.geveze.org/bf/yeni.php?nick=" + encodeURIComponent(hedefNick);
            if (window.OzelNicklerim && window.OzelNicklerim[hedefNick]) {
                window.showProfileDialog(hedefNick, uNickLink);
            } else {
                window.showToast("Profil resmi yüklemediniz!", "info", 1500);
            }
        } else {
            var hedefNickLink = "https://irc.geveze.org/bf/bak.php?nick=" + encodeURIComponent(hedefNick) + "&liker_nick=" + encodeURIComponent(uNicki);
            window.showProfileDialog(hedefNick, hedefNickLink);
        }
    },
    Nh: !0
}, {
        text: vGB,
        Ih: "fa fa-envelope",
        Sh: o(vGy),
        Nh: !0
    }, {
        text: rD,
        Ih: VhE,
        Sh: o(rD),
        Nh: !0
    }, {
        text: vht,
        Ih: DZV,
        Sh: function(i) {
            this.Zs.exec(VIi + i)
        },
        Nh: i
    }, {
        text: viM,
        Ih: DZV,
        Sh: function(i) {
            this.Zs.exec(vj$ + i)
        },
        Nh: i || t
    }, {
        text: VJg,
        Ih: Vjj,
        Sh: o(VJq),
        Nh: c(i, r(n))
    }, {
        text: Vkt,
        Ih: Vjj,
        Sh: o(VL6),
        Nh: c(i, n)
    }, {
        text: VJg,
        Ih: vLk,
        Sh: function(i) {
            var t = this.name;
            this.Zs.exec(LY + t + vLt + i)
        },
        Nh: c(t, r(s))
    }, {
        text: Vkt,
        Ih: vLk,
        Sh: function(i) {
            var t = this.name;
            this.Zs.exec(LY + t + VM2 + i)
        },
        Nh: c(t, s)
    }, {
        text: VJg,
        Ih: VM9,
        Sh: o(vMB),
        Nh: c(i, r(e))
    }, {
        text: Vkt,
        Ih: VM9,
        Sh: o(vN7),
        Nh: c(i, e)
    }, {
		text: "Engelle",
        Ih: "fa fa-lock",
        Sh: o(VNS),
        Nh: r(h)
    }, {
		text: "Engeli Aç",
		Ih: "fa fa-unlock",
        Sh: o(VOy),
        Nh: h
    }, {
        text: "EngelList",
        Ih: VPe,
        Sh: u(),
        Nh: w
    }, {
        text: VPG,
        Ih: vPI,
        Sh: function(i) {
            return a(i)
        },
        Nh: !0
    }]
}(), qwebirc.q.Ls = 1, qwebirc.q.Ws = 2, qwebirc.q.Ts = 4, qwebirc.q.gh = 8, qwebirc.q.Th = 16, qwebirc.q.ys = 32, qwebirc.q.Oh = VpI, qwebirc.q.xh = 210, qwebirc.q.Qh = new Class({
    Implements: [Events],
    initialize: function(i, t, n, s) {
        var e, h;
        this.options = s, this.windows = new QHash, this.Rh = new QHash, this.windows.put(qwebirc.q.Oh, new QHash), this.windowArray = [], this.Ah = t, this.parentElement = i, this.parentElement.addClass(Fb), this.parentElement.addClass(R5 + n), this.kh = !1, this.yh = new qwebirc.I.rh, this.Lh = 0, this.Ph = window.OzelNickler, this.Wh = !0, Browser.Engine.trident ? function() {
            var i = document.hasFocus();
            i != this.Wh && (this.Wh = i, this.zh(i))
        }.periodical(100, this) : (e = function() {
            this.Wh && (this.Wh = !1, this.zh(!1))
        }.bind(this), h = function() {
            this.Wh || (this.Wh = !0, this.zh(!0))
        }.bind(this), document.addEvent(VBW, e), window.addEvent(VBW, e), document.addEvent(nL, h), window.addEvent(nL, h)), qwebirc.util.pi = function(i) {
            QWEBIRC_DEBUG && (__ != typeof console && console.log(i), this.en().As(null, i))
        }.bind(this)
    },
    Uh: -1 < navigator.userAgent.indexOf(Nl),
    ee: function(i) {



        var t;
        return i.id = String(this.Lh++), i.Bh = new qwebirc.q.Hh(i), i.addEvent(t3z, function() {
            this.Yh = new qwebirc.L.Mh(this.Vh.bind(this)), this.fireEvent(t3z, i)
        }.bind(this)), this.windows.put(i.id, new QHash), this.Rh.put(i.id, i), t = this.ks(i, qwebirc.q.Ls, VQq), this.pe(t), this.kh || (this.kh = !0, t.As("", O8 + qwebirc.VERSION), t.As("", o9), t.As("", O9), t.As("", oa), void 0 === window[nm] && null == window[nm] || this.Uh && window[nm] && setTimeout(function() {
            qwebirc.q.bh()
        }, 4e4)), t
    },
    getClientId: function(i) {
        return i == qwebirc.q.Oh ? qwebirc.q.Oh : i.id
    },
    Dh: function(i, t, n) {
        return t == qwebirc.q.ys ? os : t == qwebirc.q.Ls ? "" : i == qwebirc.q.Oh ? fe + n : fe + i.Bt(n)
    },
    ks: function(i, t, n) {
        var s, e, h, r = this.Ns(i, t, n);
        if ($defined(r)) return r;
        if (s = this.Dh(i, t, n), r = new this.Ah(this, i, t, n, s), this.windows.get(this.getClientId(i)).put(s, r), this.windowArray.push(r), this.Ph.hasOwnProperty(n)) {
            if (e = this.Ph[n], h = this.Ns(i, t, n), !$defined(h)) return;
            h.hn("", GK + window.networkName + $2 + e[1] + gL + n + vtI)
        }
        return r
    },
    Ns: function(i, t, n) {
        var s = this.windows.get(this.getClientId(i));
        return $defined(s) ? s.get(this.Dh(i, t, n)) : null
    },
    en: function() {
        return this.active
    },
    jh: function(i) {
        return this.windows.get(this.getClientId(i)).get(this.Dh(i, qwebirc.q.Ls))
    },
    xe: function(i) {
        return this.active && this.active.type != qwebirc.q.gh ? this.active : this.jh(i)
    },
    Gh: function(i) {
        this.active = i
    },
    Ce: function(i, t) {
        var n, s;
        return this.Ns(i.Zs, i.type, t) ? null : (n = this.getClientId(i.Zs), -1 == (s = this.windowArray.indexOf(i)) ? null : (this.windows.get(n).remove(i.identifier), (i = this.windowArray[s]).name = t, i.identifier = this.Dh(i.Zs, i.type, i.name), this.windows.get(n).put(i.identifier, this.windowArray[s]), i.Fh(i.name), i))
    },
    pe: function(i) {
        this.active && this.active.Xh(), i.select()
    },
    Zh: function(i) {},
    Kh: function(i) {
        var t;
        0 != this.windowArray.length && this.active && (i = i || 1, -1 != (t = this.windowArray.indexOf(this.active)) && ((t += i) < 0 ? t = this.windowArray.length - 1 : t >= this.windowArray.length && (t = 0), this.pe(this.windowArray[t])))
    },
    Jh: function() {
        this.Kh(-1)
    },
    ir: function(i) {
        if (i.active)
            if (this.active = void 0, 1 == this.windowArray.length) this.windowArray = [];
            else {
                var t = this.windowArray.indexOf(i);
                if (-1 == t) return;
                0 == t ? this.pe(this.windowArray[1]) : this.pe(this.windowArray[t - 1])
            } this.windowArray = this.windowArray.erase(i), this.windows.get(this.getClientId(i.Zs)).remove(i.identifier)
    },
    tr: function(i, t, n, s, e, h) {
        this.nr(), this.sr(vU_, qwebirc.q.er, vu5, {
            initialNickname: t,
            hr: n,
            zi: s,
            rr: e,
            callback: i,
            cr: h,
            Rs: this.options
        }, qwebirc.q.Th)
    },
    zh: function(i) {
        var t = this.en();
        $defined(t) && t.zh(i)
    },
    Vh: function(i) {
        var t, n, s, e, h = i.splitMax($2, 2);
        2 == h.length && oS == (t = h[0]) && 2 == (n = h[1].splitMax($2, 2)).length && (t = n[0], s = n[1], oT != t || (e = this.xe(), !$defined(e) || e.type != qwebirc.q.Ts && e.type != qwebirc.q.Ws) || e.Zs.exec(Ox + s))
    }
}), qwebirc.q.ur = new Class({
    Extends: qwebirc.q.Qh,
    initialize: function(i, t, n, s) {
        this.parent(i, t, n, s), this.ar = this.wr(s), this.lr = {
            hue: qwebirc.q.xh,
            saturation: 0,
            lightness: 0,
            dr: null,
            br: null,
            vr: null
        }, $defined(this.options.hue) && (this.lr.hue = this.options.hue), this.qr = new qwebirc.q.mr(this), this.Rs = new qwebirc.q.$r(this, s.Er), this._r = new QHash, $defined(this.options.saturation) && (this.lr.saturation = this.options.saturation), $defined(this.options.lightness) && (this.lr.lightness = this.options.lightness), $defined(this.options.Cr) && (this.lr.br = this.options.Cr), $defined(this.options.pr) && (this.lr.vr = this.options.pr), $defined(this.options.hue) ? this.Rs.Ir(Vwc, this.lr.hue) : this.lr.hue = this.Rs.STYLE_HUE, this.lr.dr = $defined(this.options.Sr) ? this.options.Sr : this.lr.hue, document.addEvent(VWh, this.Nr.bind(this))
    },
    wr: function(i) {},
    Nr: function(i) {
        var t, n, s, e, h = !1;
        if (i.alt || i.control || i.shift || i.gr) {
            if (i.alt && !i.control && !i.gr)
                if (Q2 == i.key || q3 == i.key) {
                    for (n = -1, h = !(t = 0), s = 0; s < this.windowArray.length; s++) t < (e = this.windowArray[s].Tr) && (n = s, t = e); - 1 < n && this.pe(this.windowArray[n])
                } else if (Q6 <= i.key && i.key <= q7 && !i.shift) {
                if (h = !0, number = i.key - Q6, 0 == number && (number = 10), --number, number >= this.windowArray.length) return;
                this.pe(this.windowArray[number])
            } else Qb != i.key && QB != i.key || i.shift ? Qe != i.key && QE != i.key || i.shift || (this.Kh(), h = !0) : (this.Jh(), h = !0)
        } else pt != i.key && H0 != i.key || this.Or(i) || (h = !0);
        h && (new Event(i).stop(), i.preventDefault())
    },
    Or: function(i) {
        return -1 == $$(R1).indexOf(i.target) || -1 == $$($Q).indexOf(i.target)
    },
	bfWindow: function() {
        this.sr("Ayarlar", qwebirc.q.bfpanel, "bfpanel", this.uiOptions)
    },	
	bfHediye: function() {
        this.sr("Hediye", qwebirc.q.bfhediye, "bfHediye", this.uiOptions)
    },	
	bfUnbanWindow: function() {
        this.sr("Unban", qwebirc.q.bfunbanpanel, "bfunbanpanel", this.uiOptions)
    },	
	salesWindow: function() {
        this.sr("Sales", qwebirc.q.salespanel, "salespanel", this.uiOptions)
    },	
	yenilikWindow: function() {
        this.sr("Yenilik", qwebirc.q.yenilikpanel, "yenilikpanel", this.uiOptions)
    },	
    xr: function(i, t, n) {
        n = n || qwebirc.q.gh;
        var s = this.ks(qwebirc.q.Oh, n, i);
        return s.addEvent(ir, function(i) {
            this.windows.get(qwebirc.q.Oh).remove(i.identifier)
        }.bind(this)), t && this.pe(s), s
    },
    sr: function(i, t, n, s, e) {
        var h, r;
        $defined(s) || (s = {}), this._r.contains(i) ? this.pe(this._r.get(i)) : (h = this.xr(i, !0, e), this._r.put(i, h), h.addEvent(ir, function() {
            this._r.remove(i)
        }.bind(this)), n && h.lines.addClass(R5 + n), (r = new t(h.lines, s)).addEvent(ir, function() {
            h.close()
        }.bind(this)), h.Qr(r))
    },
    Rr: function() {
        this.sr(W3m, qwebirc.q.Ar, W4T, {
            baseURL: this.options.baseURL,
            Rs: this.Rs,
            kr: function() {
                this.yr()
            }.bind(this)
        })
    },
    yr: function() {
        this.sr(W4U, qwebirc.q.Lr, W5a, this.Rs)
    },
    Pr: function() {
        this.sr(W5j, qwebirc.q.Wr, w5Q, this.Rs)
    },
zr: function(a, b) {
        if (a == "options") {
            return ["a", this.Rr.bind(this)]
        }
        if (a == "whois") {
            return ["span", function(c) {
				bfkanalnick = c;
	if (this.Rs.QUERY_ON_NICK_CLICK) {
                    t.Zs.exec("/QUERY " + c)
                } else {	
document.getElementById("bfkanalnick").innerHTML = c;
document.getElementById("kanalnickbtn").style.display = "block";								       
                }
		 
            }.bind(this)]
        }
        return null
    },
    Ur: function(i, t) {
        this.qr.Ur(i, t)
    },
    Br: function() {
        this.qr.reset()
    },
    Hr: function(i) {
        this.Yr = new qwebirc.q.style.Mr(qwebirc.global.baseURL + W8m + (QWEBIRC_DEBUG ? RJ : "") + i + WAR + Date.now()), this.Vr({})
    },
    Vr: function(i) {
        var t, n;
        for (t in i) this.lr[t] = i[t];
        $defined(this.Yr) && (n = {
            hue: this.lr.hue,
            lightness: this.lr.lightness,
            saturation: this.lr.saturation
        }, ($defined(this.lr.dr) || $defined(this.lr.vr) || $defined(this.lr.br)) && (Number(this.lr.dr), Number(this.lr.vr), Number(this.lr.br)), this.Yr.set(function() {
            return this.Rs[arguments[1]] ? arguments[2] : arguments[3]
        }.bind(this)))
    }
}), qwebirc.q.Dr = new Class({
    Extends: qwebirc.q.ur,
    initialize: function(i, t, n, s) {
        this.parent(i, t, n, s), this.jr = new qwebirc.q.Gr(this.Rs), this.Fr = new qwebirc.q.Xr(this.Rs), this.Zr = new qwebirc.q.Kr(this.Rs), this.Jr = this.Fr.Jr.bind(this.Fr)
    },
    Ks: function(i) {
        this.jr.Ks(i)
    },
    notify: function(i, t, n) {
        this.jr.Ks(!0), this.Fr.ic(), this.Zr.notify(i, t, n)
    },
    tc: function(i) {
        this.Zr.nc(i)
    },
    Zh: function(i) {},
    zh: function(i) {
        this.parent(i), this.Fr.zh(i), this.Zr.zh(i)
    }
}), qwebirc.q.sc = new Class({
    Extends: qwebirc.q.Dr,
    zr: function(i, t) {
        return rk == i ? [Rh, function(i) {
            $defined(this.Cs.options.accountWhoisCommand) && this.Zs.exec(this.Cs.options.accountWhoisCommand + i)
        }.bind(t)] : this.parent(i, t)
    },
    Fs: function() {
        qwebirc.T.Ot(!0) ? confirm(rm) && (this.Rh.each(function(i, t) {
            t.hh(RM)
        }, this), function() {
            document.location = rn
        }.delay(500)) : this.en().Cn(wCR)
    }
}), qwebirc.q.ec = qwebirc.q.sc, qwebirc.q.RequestTransformHTML = function(i) {
    var h = {
            IMG: 1
        },
        r = i.update,
        c = i.onSuccess,
        o = function(i) {
            var t, n, s, e;
            if (1 == i.nodeType)
                for (t = i.nodeName.toUpperCase(), h[t] && (n = i.getAttribute(ru), s = i.getAttribute(rU), $defined(n) && $defined(s) && (i.removeAttribute(ru), i.removeAttribute(rU), i.setAttribute(n, qwebirc.global.staticBaseURL + s))), e = 0; e < i.childNodes.length; e++) o(i.childNodes[e])
        };
    return delete i[s3], i.onSuccess = function(i, t, n, s) {
        var e, h = window.hc.cloneNode(!1);
        for (h.set(_j, n), o(h), r.empty(); 0 < h.childNodes.length;) e = h.firstChild, h.removeChild(e), r.appendChild(e);
        c()
    }, new Request.HTML(i)
}, qwebirc.q.rc = 0, qwebirc.q.cc = 1, qwebirc.q.oc = 2, qwebirc.q.uc = 3, qwebirc.q.fc = 250, qwebirc.q.ac = qwebirc.q.Ws | qwebirc.q.ys | qwebirc.q.Ts | qwebirc.q.Ls, qwebirc.q.Window = new Class({
    Implements: [Events],
    initialize: function(i, t, n, s, e) {
        this.Cs = i, this.type = n, this.name = s, this.active = !1, this.Zs = t, this.identifier = e, this.Tr = qwebirc.q.rc, this.wc = null, this.yh = this.Cs.yh, this.lc = !0, this.scrollpos = null, this.dc = new QHash, this.bc = null, this.vc = null, this.closed = !1, this.type & qwebirc.q.ac && (this.qc = new Element(S4), this.qc.addClass(s5), this.mc = !1)

    },
    Ge: function(i, t) {
        qwebirc.q.$c(i, t, this.Zs.exec, this.Cs.zr.bind(this.Cs), this)
    },
    close: function() {
        this.closed = !0, $defined(this.wc) && ($clear(this.wc), this.wc = null), this.Cs.ir(this), this.fireEvent(ir, this)
    },
    Ec: function(i) {
        $defined(this.vc) && this.vc.fireEvent(i)
    },
    Qr: function(i) {
        this.vc = i
    },
    select: function() {
        this.mc && !this.Cs.Rs.LASTPOS_LINE && (this.lines.removeChild(this.qc), this.mc = !1), this.active = !0, this.Cs.Gh(this), this.Tr && this._c(qwebirc.q.rc), this.Ec(wFG), this.Cc(), this.bc = new Date
    },
    Xh: function() {
        this.Ec(Wfw), this.pc(), $defined(this.wc) && ($clear(this.wc), this.wc = null), this.type & qwebirc.q.ac && this.Ic(), this.active = !1
    },
    Cc: function() {
        this.lc ? this.Sc() : $defined(this.scrollpos) && this.Nc().scrollTo(this.scrollpos.x, this.scrollpos.y)
    },
    pc: function() {
        this.Cs.gc || (this.lc = this.Tc(), this.scrollpos = this.lines.getScroll())
    },
As: function(i, t, n, s) {

    var e, h, r, c, o, u, f = qwebirc.q.rc,
        a = !1;

    if (this.type === qwebirc.q.Ls && $type(t) === "object" && t.m) {
        var statusMessage = "";
        if (t.m.includes("is online")) {
            var nick = t.m.split(" ")[0];

            var role = "";
            var yetki = GLOBAL_YETKI.find(function(item) {
				return item.nick === nick;
            });
            if (yetki) {
				role = yetki.role;
            }

            statusMessage = nick + " çevrimiçi" + (role ? " (" + role + ")" : "");
            s.addClass("online-durum");
            t.m = "✔ " + statusMessage;
        } else if (t.m.includes("is offline")) {
             var nick = t.m.split(" ")[0];

            var role = "";
            var yetki = GLOBAL_YETKI.find(function(item) {
				return item.nick === nick;
            });
            if (yetki) {
				role = yetki.role;
            }
            statusMessage = nick + " çevrimdışı" + (role ? " (" + role + ")" : "");
            s.addClass("offline-durum");
            t.m = "✘ " + statusMessage;
        }
    }

    // kanal mesajları vs işleniyo :d
    if (i && (f = qwebirc.q.cc, i.match(/(NOTICE|ACTION|MSG)$/))) {
        if (e = $defined(t) ? t.m : null, i.match(/^OUR/) ? i.match(/NOTICE$/) || (f = qwebirc.q.oc) : this.Zs.Bh.match(e) ? (f = qwebirc.q.uc, a = !0) : i.match(/NOTICE$/) || (f = this.type == qwebirc.q.Ws || this.type == qwebirc.q.ys ? qwebirc.q.uc : qwebirc.q.oc), a && !this.active) {
            if (h = this.Cs.en(), !$defined(h)) return;
			if (t.n !== "BilgiServ") {
				this.type === qwebirc.q.Ts ? h.hn("", Sc + t.n + SC + this.name + sd) : h.hn("", Sc + t.n + Sd);
			}
        }
        f == qwebirc.q.uc && (r = this.Cs.theme.message(sf + i + sF, t, !1), c = this.Cs.theme.message(sf + i + SF, t, !1), o = function() {
            this.Cs.pe(this);
        }.bind(this), this.Cs.notify(r, c, o));
    }

    this.active || f == qwebirc.q.rc || (this._c(f), this.type == qwebirc.q.Ws && this.Cs.Oc.addClass(sh));
    i && (t = this.Cs.theme.message(i, t, a));
    window.zamanGoster && ((u = window.ti.cloneNode(!1)).className = sj, u.appendChild(document.createTextNode(qwebirc.I.Wt(new Date) + $2)), s.appendChild(u));
    qwebirc.q.$c(t, s, this.Zs.exec, this.Cs.zr.bind(this.Cs), this);
    this.Us(s);
},
    Cn: function(i) {
        this.As("", i, Wig)
    },
    hn: function(i, t) {
		///console.log("gn cagirdil.");
        void 0 === t ? this.As("", i, sP) : this.As(i, t, sP)
    },
	hn_bf: function(i, t) {
		var s = window.hc.cloneNode(!1);
		t ? s.addClass(t) : s.addClass(this.Da ? MU2 : Mua);
		this.Da = !this.Da;
		
		// HTML içeriği güvenli şekilde parse et
		var tempDiv = new Element('div');
		tempDiv.set('html', i);
		
		// Güvenlik kontrolü - sadece güvenli HTML elementlerine izin ver
		var allowedTags = ['span', 'div', 'b', 'i', 'u', 'strong', 'em', 'br', 'p', 'img'];
		var allowedStyles = ['color', 'font-weight', 'font-size', 'background-color', 'text-decoration'];
		
		var sanitizeElement = function(el) {
			if (el.nodeType === 1) { // Element node
				var tagName = el.tagName.toLowerCase();
				
				// İzin verilen tag kontrolü
				if (allowedTags.indexOf(tagName) === -1) {
					// İzin verilmeyen tag ise text node'a dönüştür
					var textNode = document.createTextNode(el.textContent || '');
					el.parentNode && el.parentNode.replaceChild(textNode, el);
					return;
				}
				
				// Style attribute kontrolü
				if (el.style) {
					var newStyle = {};
					allowedStyles.forEach(function(prop) {
						var value = el.style.getPropertyValue(prop);
						if (value) {
							newStyle[prop] = value;
						}
					});
					
					// Tüm stilleri temizle ve sadece izin verilenleri geri ekle
					el.removeAttribute('style');
					Object.keys(newStyle).forEach(function(prop) {
						el.style.setProperty(prop, newStyle[prop]);
					});
				}
				
				// Child elementleri de kontrol et
				Array.from(el.children || []).forEach(sanitizeElement);
			}
		};
		
		// Parse edilen içeriği sanitize et
		Array.from(tempDiv.children || []).forEach(sanitizeElement);
		
		// Sanitize edilmiş içeriği s elementine ekle
		while (tempDiv.firstChild) {
			s.appendChild(tempDiv.firstChild);
		}
		
		// Eğer hiçbir HTML element kalmadıysa, düz metin olarak ekle
		if (s.children.length === 0) {
			s.set('html', i);
		}
		
		this.Us(s);
	},

	// Alternatif: Daha basit HTML rendering fonksiyonu
	bf_bildiri_baslik: function(i, styles) {
		var s = window.hc.cloneNode(!1);
		s.addClass(this.Da ? MU2 : Mua);
		this.Da = !this.Da;
		
		// Mesajı ekle
		s.set('html', i);
		
		// Eğer style parametresi varsa uygula
		if (styles && typeof styles === 'object') {
			s.setStyles(styles);
		}
		
		this.Us(s);
	},
    _c: function(i) {
        (i == qwebirc.q.rc || i >= this.Tr) && (this.Tr = i)
    },
    Tc: function() {
        var i, t, n, s;
        return !!this.wc || (t = (i = this.lines).getScroll().y, (n = i.getScrollSize().y) < (s = i.clientHeight) && (n = s), n - 3 <= t + s)
    },
    Nc: function() {
        var i = this.lines;
        return $defined(this.xc) && (i = this.xc), i
    },
    Sc: function() {
        var i;
        this.type != qwebirc.q.gh && this.type != qwebirc.q.Th && (i = this.lines, this.Nc().scrollTo(i.getScroll().x, i.getScrollSize().y))
    },
    Us: function(i) {
        var t, n = this.lines;
        $defined(i) ? (t = this.Tc(), n.appendChild(i), n.childNodes.length > qwebirc.q.fc && n.removeChild(n.firstChild), t && !this.Qc && (this.wc = this.Us.delay(50, this, [null]))) : (this.Sc(), this.wc = null)
    },
    _e: function(i) {
        for (var t, n, s, e = {}, h = {}, r = this.dc.H, c = 0, o = i.length; c < o; c++) h[i[c]] = 1;
        for (t in r)
            if (!h[t]) try {
                this.Rc(t, r[t])
            } catch (c) {}
        for (c = 0, o = i.length; c < o; c++) s = (s = r[n = i[c]]) || ((s = this.Ac(n, c)) || 1), e[n] = s;
        this.dc.H = e
    },
    Ac: function(i, t) {},
    Rc: function(i, t) {},
    kc: function(i) {
        this.yh.As(i), this.Zs.exec(i)
    },
    zh: function(i) {
        1 != i && this.type & qwebirc.q.ac && this.Ic()
    },
    Ic: function() {
        if (this.Cs.Rs.LASTPOS_LINE) {
            if (!this.Tc()) return;
            if (this.mc) {
                if (this.lines.lastChild != this.qc) {
                    try {
                        this.lines.removeChild(this.qc)
                    } catch (i) {}
                    this.Us(this.qc)
                }
            } else this.Us(this.qc)
        } else this.mc && this.lines.removeChild(this.qc);
        this.mc = this.Cs.Rs.LASTPOS_LINE
    },
    Fh: function(i) {}
}), winxx = window, qwebirc.q.$c = function(i, n, s, e, h) {
    var r, c, o, t, u, f, a, w, l, d, b, v = !1,
        q = !1,
        m = !1,
        $ = !1,
        E = [],
        _ = i;
    if ($defined(_)) {
        for (o = winxx.ti.cloneNode(!1), n.addClass(WIY), t = winxx.renkliNickler, u = !1, f = 0; f < _.length; f++) {
            if (a = _[f], t) {
                if (u) {
                    t8 != a ? E.push(a) : ($ = !0, w = emitStartToken(), l = emitEndToken(), (d = qwebirc.util.fi(l)) ? (w.style.color = d[0], w.style.fontWeight = Ta) : (b = l.yc(h.Zs), $defined(b) && (w.style.color = b.rgbToHex())), u = $ = !1);
                    continue
                }
                if (t8 == a) {
                    u = !0, emitEndToken();
                    continue
                }
            } else if (t8 == a) continue;
            Sc == a ? (emitEndToken(), q = !q, emitStartToken()) : Td == a ? (emitEndToken(), v = !v, emitStartToken()) : te == a ? (emitEndToken(), m = !m, emitStartToken()) : Te == a ? (emitEndToken(), c = r = void 0, q = m = v = !1) : tf == a ? (emitEndToken(), f = function parseColours(i, t) {
                return isNum(i[t + 1]) ? (isNum(i[++t + 1]) ? (r = parseInt(i[t] + i[t + 1]), t++) : r = parseInt(i[t]), aw != i[t + 1] || isNum(i[t + 2]) && (isNum(i[(t += 2) + 1]) ? (c = parseInt(i[t] + i[t + 1]), t++) : c = parseInt(i[t])), t) : (c = r = void 0, t)
            }(_, f), 99 <= c && (c = void 0), 99 <= r && (r = void 0), emitStartToken()) : E.push(a)
        }
        emitEndToken()
    } ///kanal nick unutma...

    function isNum(i) {
        return Q6 <= i && i <= q7
    }

    function emitEndToken() {
        var i, t = "";
        return 0 < E.length && (i = E.join(""), s ? t = qwebirc.q.Lc(o, i, s, e, h) : (t = i, o.appendChild(document.createTextNode(i))), n.appendChild(o), E = [], o = winxx.ti.cloneNode(!1)), t
    }

    function emitStartToken() {
        if ($) return o;
        var i = [];
        null != r && i.push(sU + r), null != c && i.push(SU + c), q && i.push(sV), v && i.push(sw), m && i.push(Sw), o.className = i.join($2)
    }
}, String.prototype.yc = function(i) {
    for (var t, n = i.Bt(i.Re(this)), s = 0, e = 0; e < n.length; e++) s = 31 * s + n.charCodeAt(e);
    return t = Math.abs(s) % 360, new Color([t, 70, 60], Wkw)
}, qwebirc.q.Lc = function(l, i, e, d, b) {
    var v = /[[\)|\]>]?(\.*|[\,;])$/,
        q = [],
        t = function(i, t, n, s) {
            for (var e, h, r, c, o;;) {
                if (-1 == (e = i.search(t))) {
                    n(i);
                    break
                }
                h = i.match(t), r = i.substring(0, e), c = h[0], o = i.substring(e + c.length), n(r), i = (s(c, n) || "") + o
            }
        },
        n = function(i) {
            q.push(i), qwebirc.util.ii(i, l)
        },
        s = function(i) {
            var t, n, s = i.replace(v, "");
            return q.push(s), t = i.substring(s.length), (n = winxx.ti.cloneNode(!1)).addClass(Wl8), n.addEvent($h, function(i) {
                new Event(i).stop(), e(THc + s)
            }), n.appendChild(document.createTextNode(s)), l.appendChild(n), t
        },
        h = function(i, t) {
            var n, s, e, h, r = i.replace(v, ""),
                c = i.substring(r.length),
                o = null,
                u = UgD,
                f = r,
                a = Q2,
                w = r.match(/^qwebirc:\/\/(.*)$/);
            if (w) {
                if (!(s = w[1].match(/^([^\/]+)\/([^\/]+)\/?(.*)$/))) return void t(i);
                if (!(e = d(s[1], b))) return void t(i);
                n = s[1], a = e[0], r = Q2 != e[0] ? null : f9, o = e[1], f = unescape(s[2]), u = null, s[3] && (c = s[3] + c)
            } else r.match(/^www\./) && (r = tn + r);
            return h = new Element(a), n && h.addClass(Tn + n), r && (h.href = r, u && (h.target = u, h.setAttribute(to, tO))), q.push(f), h.appendChild(document.createTextNode(f)), l.appendChild(h), $defined(o) && h.addEvent($h, function(i) {
                new Event(i).stop(), o(f)
            }), c
        };
    return t(i, /\b((https?|ftp|qwebirc):\/\/(www\.|play\.|apps\.|whois))[^ ]+/, function(i) {
        t(i, /\B#[^ ,]+/, n, s)
    }, h), q.join("")
}, qwebirc.q._.Pc = {
    C: tf,
    B: Sc,
    U: Td,
    O: Te,
    "\x7b": t8,
    "\x7d": t8,
    "\x5b": UC,
    "\x5d": H0,
    $: U6
}, qwebirc.q._.Wc = {
    PREFIX: [wR3],
    SIGNON: [WRm, !0],
    CONNECTING: [wRq, !0],
    CONNECT: [WRS, !0],
    CONNECTED: [wru, !0],
    RAW: [WRv, !0],
    DISCONNECT: [ws2, !0],
    ERROR: [wSe, !0],
    SERVERNOTICE: [WRv, !0],
    JOIN: [Wsv, !0],
    HATA: [WRv, !0],
    OURJOIN: [Wsv, !0],
    PART: [WT3, !0],
    KICK: [WT8, !0],
    MODE: [wTe, !0],
    QUIT: [WtE, !0],
    NICK: [wtK, !0],
    TOPIC: [WU5, !0],
    UMODE: [WuA, !0],
    INVITE: [wul, !0],
    HILIGHT: [wum],
    HILIGHTEND: [WUq],
    CHANMSG: [WUz],
    PRIVMSG: [WUz],
    CHANNOTICE: [WVJ],
    PRIVNOTICE: [wVL],
    OURCHANMSG: [WUz],
    OURPRIVMSG: [WUz],
    OURTARGETEDMSG: [wVr],
    OURTARGETEDNOTICE: [ww9],
    OURCHANNOTICE: [wwB],
    OURPRIVNOTICE: [WWb],
    OURCHANACTION: [wwC],
    OURPRIVACTION: [wwC],
    CHANACTION: [Wwf],
    PRIVACTION: [wWG],
    CHANCTCP: [wWM],
    PRIVCTCP: [wwx],
    CTCPREPLY: [wXc],
    OURCHANCTCP: [WXG],
    OURPRIVCTCP: [WXG],
    OURTARGETEDCTCP: [WXG],
    WHOISUSER: [WXt, !0],
    WHOISREALNAME: [wxu, !0],
    WHOISCHANNELS: [wY4, !0],
    WHOISSERVER: [WY5, !0],
    WHOISACCOUNT: [WYY, !0],
    WHOISIDLE: [WYZ, !0],
    WHOISAWAY: [wZe, !0],
    WHOISOPER: [wzn, !0],
    WHOISOPERNAME: [WZV, !0],
    WHOISACTUALLY: [X_B, !0],
    WHOISGENERICTEXT: [X_C, !0],
    WHOISEND: [X_E, !0],
    AWAY: [x$A, !0],
    GENERICERROR: [X01, !0],
    GENERICMESSAGE: [WRv, !0],
    WALLOPS: [X1S, !0],
    CHANNELCREATIONTIME: [X23, !0],
    CHANNELMODEIS: [x24, !0],
    IGNORED: [x2F, !1],
    UNIGNORED: [X36, !1],
    IGNOREHEADER: [X4N, !1],
    IGNOREENTRY: [x57, !1],
    IGNOREEMPTY: [x5y, !1],
    SILENCE: [X6C, !1],
    NOTIFYCHANMSGTITLE: [x7m, !1],
    NOTIFYCHANMSGBODY: [x7x, !1],
    NOTIFYCHANACTIONTITLE: [x7m, !1],
    NOTIFYCHANACTIONBODY: [x8c, !1],
    NOTIFYPRIVMSGTITLE: [x8r, !1],
    NOTIFYPRIVMSGBODY: [WRv, !1],
    NOTIFYPRIVACTIONTITLE: [x8r, !1],
    NOTIFYPRIVACTIONBODY: [x8c, !1],
    NOTIFYCHANNOTICETITLE: [x7m, !1],
    NOTIFYCHANNOTICEBODY: [XAK, !1],
    NOTIFYPRIVNOTICETITLE: [xap, !1],
    NOTIFYPRIVNOTICEBODY: [WRv, !1]
}, qwebirc.q.zc = new Class({
    initialize: function(i) {
        var t, n;
        if (this.Uc = qwebirc.util.V(qwebirc.q._.Wc), i)
            for (t in i) this.Uc[t] = i[t];
        for (t in this.Uc) F0 != t && ((n = this.Uc[t])[1] ? this.Uc[t] = this.Uc[F0] + n[0] : this.Uc[t] = n[0]);
        this.Bc = qwebirc.util.V(qwebirc.q._.Pc), this.Hc = qwebirc.util.V(this.Bc), this.Hc[U3] = this.message(xBb, {}, this.Bc), this.Hc[B2] = this.message(XCh, {}, this.Bc), this.Hc["\x7b"] = this.Hc["\x7d"] = ""
    },
    Yc: function(i, t, n) {
        var s, e, h, r, c, o = [];
        if ($defined(i)) {
            for (s = i.split(""), e = 0; e < s.length; e++) U6 == (h = s[e]) && e <= s.length - 1 ? (c = (c = n[r = s[++e]]) || t[r]) && o.push(c) : o.push(h);
            return o.join("")
        }
    },

	message: function(i, t, n) {
		var s = n ? this.Hc : this.Bc;
		if (i === 'OURTARGETEDMSG' && t && t.t === qwebirc.util.cGz) { return ''; }
		t && t.n && (t.N = UC + t.n + H0);
		return this.Yc(this.Uc[i], t, s);
	}
}), qwebirc.q.Hh = new Class({
    initialize: function(i) {
        this.parent = i, this.Mc = null, this.Vc = null
    },
    match: function(i) {
        var t, n = this.parent.nickname;
        return n != this.Vc && (t = UF, this.Mc = new RegExp(ug + t + B2 + RegExp.escape(n) + U3 + t + UG, uh)), !!i.match(this.Mc)
    }
}), qwebirc.q.Gr = new Class({
    initialize: function(i) {
        this.Rs = i, this.Dc = new qwebirc.A.jc
    },
    Ks: function(i) {
        i && !this.Rs.BEEP_ON_MENTION || this.Dc.play(UL)
    }
}), qwebirc.q.Xr = new Class({
    initialize: function(i) {
        this.Rs = i, this.Wh = !1, this.Gc = !0, this.Fc = document.title;
        var t = this.Xc();
        $defined(t) ? (this.Zc = t, this.Kc = t.parentNode, this.Jc = !0, this.io = new Element(XeQ), this.io.rel = uM, this.io.href = qwebirc.global.staticBaseURL + XFd, this.io.type = xFi, this.to = !1, this.no = !0, document.addEvent(eb$, this.Jr.bind(this)), document.addEvent(VWh, this.Jr.bind(this))) : this.no = !1
    },
    Xc: function() {
        for (var i = $$(Xg0), t = 0; t < i.length; t++)
            if (uM == i[t].getAttribute(to)) return i[t]
    },
    ic: function() {
        var i, t;
        this.Rs.FLASH_ON_MENTION && !this.Wh && this.no && !this.to && (this.Fc = document.title, i = function() {
            this.so(), this.Gc = !1, document.title = uO, this.eo = t.delay(500)
        }.bind(this), t = function() {
            this.ho(), this.Gc = !0, document.title = this.Fc, this.eo = i.delay(500)
        }.bind(this), this.to = !0, i())
    },
    Jr: function() {
        this.no && $defined(this.eo) && (this.to = !1, $clear(this.eo), this.eo = null, this.ho(), document.title = this.Fc, this.Gc = !0)
    },
    so: function() {
        this.Jc && (this.Jc = !1, this.Kc.removeChild(this.Zc), this.Kc.appendChild(this.io))
    },
    ho: function() {
        this.Jc || (this.Jc = !0, this.Kc.removeChild(this.io), this.Kc.appendChild(this.Zc))
    },
    Zh: function(i) {
        return this.Fc = i, this.Gc
    },
    zh: function(i) {
        (this.Wh = i) && this.Jr()
    }
}), qwebirc.q.Kr = new Class({
    initialize: function(i) {
        this.Rs = i, this.Wh = !1, this.ro = null, this.nc(this.Rs.NOTIFICATIONS)
    },
    zh: function(i) {
        this.Wh = i
    },
    nc: function(i) {
        (this.enabled = i) && (this.co() || Notification.requestPermission(function(i) {
            uP in Notification || (Notification.permission = i)
        }))
    },
    co: function() {
        return uV in window && UW === Notification.permission
    },
    notify: function(i, t, n) {
        var s;
        this.Wh && !this.enabled || !this.co() || (this.ro && this.ro.close(), s = new Notification(i, {
            body: t,
            icon: qwebirc.global.staticBaseURL + V0
        }), function() {
            s.close(), this.ro = null
        }.bind(this).delay(5e3), this.ro = s, n && (s.addEventListener($h, function() {
            this.ro = null, window.focus(), n()
        }), s.addEventListener(ir, function() {
            this.ro = null
        }.bind(this))))
    }
}), qwebirc.q.mr = new Class({
    initialize: function(i) {
        this.q = i, this.reset()
    },
    Ur: function(i, t) {
        var n, s, e, h, r, c, o, u = i[0].emojioneArea.getText();
        if (!$defined(this.oo)) {
            if (this.uo = 1, !(n = this.q.en())) return;
            if (s = qwebirc.util.wi(u, qwebirc.util.ci(i)), r = h = e = "", $defined(s) && (e = u.substring(0, s[0]), h = s[1], r = u.substring(s[0] + h.length)), c = u.toLowerCase(), "" == u) e = Xi4, obj = qwebirc.q.fo;
            else if (n.Zs.isChannel(h)) obj = qwebirc.q.ao;
            else if (c.match(/^\/(q|query|msg) /i)) obj = qwebirc.q.fo;
            else if (n.type == qwebirc.q.Ws) obj = qwebirc.q.wo;
            else {
                if (n.type != qwebirc.q.Ts) return;
                "" == e && (r = "" != r && $2 == r.charAt(0) ? vD + r : Vd + r, this.uo++), obj = qwebirc.q.lo
            }
            if ("" == r && (r = $2), this.oo = new obj(e, h, r, n), !$defined(this.oo)) return
        }
        o = this.oo.get(t), $defined(o) && (i[0].emojioneArea.setText(o[1]), qwebirc.util.hi(i, o[0] + this.uo))
    },
    reset: function() {
        this.oo = null
    }
}), qwebirc.q.do = new Class({
    initialize: function(i, t, n) {
        var s, e, h;
        if (this.prefix = t, $defined(n) && 0 != n.length) {
            for (s = [], e = qwebirc.I.Ut(i, t), h = 0; h < n.length; h++) qwebirc.I.Ut(i, n[h]).startsWith(e) && s.push(n[h]);
            this.list = s
        } else this.list = null;
        this.bo = -1
    },
    next: function() {
        return $defined(this.list) && 0 != this.list.length ? (this.bo = this.bo + 1, this.bo >= this.list.length && (this.bo = 0), this.list[this.bo]) : null
    },
    vo: function() {
        return $defined(this.list) && 0 != this.list.length ? (this.bo = this.bo - 1, this.bo < 0 && (this.bo = this.list.length - 1), this.list[this.bo]) : null
    }
}), qwebirc.q.qo = new Class({
    initialize: function(i, t, n, s, e) {
        this.mo = n, this.prefix = t, this.suffix = s, this.iterator = new qwebirc.q.do(i, n, e)
    },
    get: function(i) {
        var t, n = i ? this.iterator.vo() : this.iterator.next();
        return $defined(n) ? [(t = this.prefix + n).length, t + this.suffix] : null
    }
}), qwebirc.q.fo = new Class({
    Extends: qwebirc.q.qo,
    initialize: function(i, t, n, s) {
        this.parent(s.Zs, i, t, n, s.Zs.he)
    }
}), qwebirc.q.wo = new Class({
    Extends: qwebirc.q.qo,
    initialize: function(i, t, n, s) {
        var e = s.name;
        this.parent(s.Zs, i, t, n, [e])
    }
}), qwebirc.q.ao = new Class({
    Extends: qwebirc.q.qo,
    initialize: function(i, t, n, s) {
        var e, h, r = s.Cs.windows.get(s.Cs.getClientId(s.Zs)),
            c = s.Zs.in.map(function(i) {
                var t = r.get(i);
                return $defined(t) && (t = t.bc), [t, i]
            });
        for (c.sort(function(i, t) {
                return t[0] - i[0]
            }), e = [], h = 0; h < c.length; h++) e.push(c[h][1]);
        this.parent(s.Zs, i, t, n, e)
    }
}), qwebirc.q.lo = new Class({
    Extends: qwebirc.q.qo,
    initialize: function(i, t, n, s) {
        var e = s.Zs.oe.$s(s.name);
        this.parent(s.Zs, i, t, n, e)
    }
}), qwebirc.q.style.Mr = new Class({
    initialize: function(i) {
        var t = this.$o(this.Eo(i), i);
        this._o = t.cssText, this.rules = t.rules, this.Co = this.po()
    },
    po: function() {
        var i = document.createElement(X0);
        return i.type = XiX, i.media = Xk7, document.getElementsByTagName(Vk)[0].appendChild(i), i
    },
    Eo: function(i) {
        var t, n = new Request({
            url: i,
            async: !1
        });
        return n.addEvent(BG, function(i) {
            t = i
        }), delete n.headers[vl], n.get(), t
    },
    Io: function(i) {
        var t, n = this.Co;
        if (n.styleSheet) n.styleSheet.cssText = i;
        else
            for (t = document.createTextNode(i), n.appendChild(t); 1 < n.childNodes.length;) n.removeChild(n.firstChild)
    },
    $o: function(i, t) {
        for (var n, s, e, h = i.replace(xl1, Vo).split(Vo), r = new URI(qwebirc.global.baseURL, {
                So: t
            }).toString(), c = {}, o = 0; o < h.length && "" !== (n = h[o]).trim(); o++) 2 == (s = n.splitMax(VL, 2)).length && (c[s[0]] = s[1]);
        for (e = []; o < h.length; o++) n = (n = h[o]).D(xm_, r), e.push(n);
        return {
            cssText: e.join(Vo),
            rules: c
        }
    },
    set: function(i) {
        var t, n, s, e;
        for (n in $defined(i) || (i = function(i) {
                return i
            }), t = this._o, this.rules) s = this.rules[n].split(aw), e = i.pass(s), t = t.D(xn6 + n + B2, e);
        this.Io(t)
    }
}), qwebirc.L.Mh = new Class({
    initialize: function(i) {
        this.No = i, this.To.periodical(100, this), this.Oo = null, this.xo = -1
    },
    To: function() {
        var i, t, n, s, e = window.location.href;
        null != e && e != this.Oo && void 0 !== (i = (this.Oo = e).splitMax(f9, 2)[1]) && vM == i.substr(0, 6) && (t = i.substr(6).split(vD, 3), (n = parseInt(t[0])) <= this.xo || (this.xo = n, parseInt(t[1]) == (s = decodeURIComponent(t[2])).length && (s = s.D(t8, "").D(Vo, "").D(VO, ""), this.No(s))))
    }
}), qwebirc.q.er = new Class({
    Implements: [Events],
    initialize: function(f, i) {
        i.callback;
        var a, w, l, t, d = i.initialNickname,
            b = i.hr,
            v = i.zi,
            q = i.rr,
            m = i.cr;
        this.options = i, a = i.Rs, w = Math.floor(1e5 * Math.random()), this.Qo = xOy + w, q = !1, l = function() {
            f.set(_j, XPx)
        }.delay(500), delete(t = qwebirc.q.RequestTransformHTML({
            url: qwebirc.global.staticBaseURL + XPy + w,
            update: f,
            onSuccess: function() {
                var t, i, n, s, e, h, r, c, o, u;
                for ($clear(l), t = function(i, t) {
                        return jQuery[wv]({
                            icon: xQg,
                            title: i,
                            content: function() {
                                this[Mt]()
                            },
                            onContentReady: function() {
                                var i = qwebirc.q.RequestTransformHTML({
                                    url: qwebirc.global.staticBaseURL + t + XQn + w,
                                    update: document.getElementsByClassName(XQY)[0],
                                    onSuccess: function() {}
                                });
                                delete i.headers[vl], i.get(), this[mv]()
                            },
                            buttons: {
                                ONAYLIYORUM: function() {}
                            },
                            animation: E_l,
                            columnClass: hj$,
                            closeAnimation: E_l
                        })
                    }, i = [f.getElement(XTD), f.getElement(XtE)], n = 0; n < i.length; n++) i[n].addEvent($h, function() {
                    var i = (Wy === this.id ? Wz : WZ) + XUp;
                    t(i, this.id)
                });
                s = f.getElement(xus), this.rootElement = s, this.util.exec = function(i, t) {
                    s.getElements(i).each(t)
                }, (h = (e = this.util).exec)(Y1 + (q ? wv : x0) + xvr, e.setVisible(!0)), q || ($defined(a.Ro) ? (r = f.getElement(XF), a.Ro && r.setAttribute(X0, x1 + a.Ro + X1 + a.Ro + x2), e.Ao(f.getElement(xD))) : e.Ao(f.getElement(Xd))), null === b && (b = ""), h(XxP, e.setText(d)), h(xxs, function(i) {
                    this.ko(i, b)
                }.bind(this)), h(xY1, e.setText(a.networkName)), c = ek, q ? (m || h(xJ, e.Ao), this.yo = this.Lo) : (d ? d && !v ? (o = qwebirc.q.Po(), $defined(o.nickname) && null != o.nickname && (this.Wo(), this.fireEvent(ir), this.options.callback(o)), c = Xp) : d && (v || b) && (o = qwebirc.q.Po(), $defined(o.nickname) && null != o.nickname && (this.Wo(), this.fireEvent(ir), this.options.callback(o))) : c = Y5, this.yo = this.zo), (u = qwebirc.T.Ot(!0)) ? (h(y6, e.setText(u[0])), h(Y_, e.Ao), h(y7, e.Ao)) : qwebirc.q.Uo() ? (h(Xz, e.Ao), ek == c && (c = Xw)) : (h(Y_, e.Ao), h(y$, e.Ao)), window == window.top && h(Y1 + c + "\x5d", e.focus), h(Y24, e.Bo(this.Ho.bind(this))), h(y2h, e.Bo(this.Yo.bind(this))), h(Y2, e.Bo(this.Mo.bind(this))), qwebirc.q.Vo() && h(Y2, e.setVisible(!1))
            }.bind(this)
        })).headers[vl], t.get()
    },
    util: {
        Ao: function(i) {
            i.setStyle(Y6N, "")
        },
        setVisible: function(t) {
            return function(i) {
                i.setStyle(Y6N, t ? "" : z8)
            }
        },
        focus: function(i) {
            try {
                i.focus()
            } catch (i) {}
        },
        Bo: function(t) {
            return function(i) {
                i.addListener($h, t)
            }
        },
        setText: function(t) {
            return function(i) {
                void 0 === i.value ? i.set(aNW, t) : i.value = null === t ? "" : t
            }
        }
    },
    validate: function() {
        return this.yo()
    },
    Ho: function(i) {
        new Event(i).stop();
        var t = this.validate();
        !1 !== t && (this.Wo(), this.fireEvent(ir), this.options.callback(t))
    },
    Wo: function(i) {
        this.Do && this.Do(i)
    },
    Yo: function(i) {
        new Event(i).stop(), !1 !== this.validate() && this.jo(function() {
            var i = this.validate();
            !1 !== i && (this.fireEvent(ir), this.options.callback(i))
        }.bind(this), Zb)
    },
    Mo: function(i) {
        new Event(i).stop(), this.Wo(!0), this.jo(function() {
            var i, t, n = ek;
            this.options.rr || (i = this.rootElement.getElement(ZG).value, t = this.rootElement.getElement(zh).value, i ? t || (n = Xp) : n = Y5), this.util.exec(Y1 + n + "\x5d", this.util.focus)
        }.bind(this), x0)
    },
    jo: function(s, t) {
        var i, n, e = window.open(Ybj, this.Qo, YBn);
        null != e && (i = function() {
            e.closed && this.Do()
        }.bind(this), n = i.periodical(100), this.Do = function(i) {
            $clear(n);
            try {
                e.close()
            } catch (i) {}
            i || (this.util.exec(ZN, this.util.setVisible(!1)), this.util.exec(Y1 + t + "\x5d", this.util.setVisible(!0))), this.Do = null
        }.bind(this), __qwebircAuthCallback = function(i, t, n) {
            if (__ == typeof sessionStorage) return alert(Zs), void this.Do(!1);
            this.Do(!0), sessionStorage.setItem(ZS, i), sessionStorage.setItem(zt, t), sessionStorage.setItem(zT, n), this.util.exec(ZN, this.util.setVisible(!1)), this.util.exec(y7, this.util.setVisible(!0)), this.util.exec(y6, this.util.setText(t)), s()
        }.bind(this), this.util.exec(ZN, this.util.setVisible(!0)), this.util.exec(Y1 + t + "\x5d", this.util.setVisible(!1)))
    },
    Lo: function() {
        return {
            nickname: this.options.initialNickname,
            ns_password: this.options.zi
        }
    },
    zo: function() {
        var i, t = this.rootElement.getElement(ZG),
            n = this.rootElement.getElement(zh),
            s = t.value,
            e = n.value;
        return "" == e && (e = null), s ? (i = qwebirc.global.fn.validate(s)) != s ? (t.value = i, alert(_ez), t.focus(), !1) : {
            nickname: s,
            ns_password: e
        } : (alert(_fH), t.focus(), !1)
    },
    ko: function(i, t) {
        var n, s = t.split($2)[0].split(aw);
        for (i.appendChild(document.createTextNode(Yhl + (1 < s.length ? _Fk : "") + $2)), n = 0; n < s.length; n++) 1 < s.length && n == s.length - 1 ? i.appendChild(document.createTextNode(_jf)) : 0 < n && i.appendChild(document.createTextNode(_fO)), i.appendChild(new Element(Pdy).set(aNW, s[n]))
    }
}), qwebirc.q.Po = function() {
    var i, t, n, s, e, h, r = qwebirc.util.G(String(document.location));
    return !!$defined(r) && (i = r.get(Xp), t = r.get(YKI), s = null, e = "", h = r.get(KY), void 0 !== i && (n = decodeURIComponent(unescape(i))), void 0 !== t && (s = decodeURIComponent(unescape(t))), void 0 !== h && (e = decodeURIComponent(unescape(t))), function() {
        return {
            nickname: s,
            ns_password: n,
            autojoin: e
        }
    })
}(), qwebirc.q.Uo = function() {
    var i = qwebirc.util.G(String(document.location)),
        t = $defined(i) && decodeURIComponent(unescape(i.get(Ykk)));
    return function() {
        return t && qwebirc.T.enabled()
    }
}(), qwebirc.q.Vo = function() {
    var i = qwebirc.util.G(String(document.location)),
        t = $defined(i) && decodeURIComponent(unescape(i.get(ykm)));
    return function() {
        return t
    }
}(), qwebirc.q.Go = new Class({
    Implements: [Options, Events],
    options: {
        title: "",
        first: "",
        hint: "",
        middle: null,
        premove: null,
        example: ""
    },
    initialize: function(i, t) {
        this.setOptions(t), this.parent = i
    },
    show: function() {
        for (this.parent.title.set(_j, this.options.title), this.parent.Fo.set(_j, this.options.first), this.parent.hint.set(_j, this.options.hint), this.parent.example.set(aNW, this.options.example); 0 < this.parent.Xo.childNodes.length;) this.parent.Xo.removeChild(this.parent.Xo.childNodes[0]);
        $defined(this.options.middle) && this.parent.Xo.appendChild(this.options.middle), this.fireEvent(YLy)
    }
}), qwebirc.q.Ar = new Class({
    Implements: [Options, Events],
    options: {
        Rs: null,
        kr: null,
        baseURL: yLZ
    },
    initialize: function(i, t) {
        this.options.Rs = t.Rs, this.options.baseURL = t.baseURL, this.options.kr = t.kr, this.create(i), this.Zo()
    },
    create: function(i) {
        var t, n, s, e, h, r;
        this.t = i, t = this.Ko(), this.title = new Element(YmK), this.title.setStyle(yMO, $zr), this.title.setStyle(yMy, yN_), t.appendChild(this.title), this.Fo = this.Ko(), this.Xo = this.Ko(), n = this.Ko(), this.hint = new Element(S$d), this.hint.setStyle(YNp, Yo1), this.hint.setStyle(yOj, Yoj), n.appendChild(this.hint), s = this.Ko(), this.example = new Element(You), s.appendChild(this.example), (e = this.Ko()).addClass(Yov), (h = new Element($Q)).type = AO5, h.value = YpL, h.addEvent($h, this.back.bind(this)), e.appendChild(h), (r = new Element($Q)).type = AO5, r.value = _l4, e.appendChild(r), r.addEvent($h, this.next.bind(this)), this.Jo = r, this.iu = h
    },
    Ko: function() {
        var i = new Element(S$d);
        return this.t.appendChild(i), i
    },
    tu: function(i) {
        return new qwebirc.q.Go(this, i)
    },
    nu: function(i, t, n, s) {
        var e, h, r, c = new Element(S$d);
        return i.appendChild(c), e = qwebirc.util._i(), h = qwebirc.util.bi($e, c, n, s, e), (r = new Element(yra, {
            for: e
        })).appendChild(document.createTextNode(t)), c.appendChild(r), h
    },
    Zo: function() {
        var i, t, n, s, e, h = function(i) {
            Browser.Engine.trident ? function() {
                this.focus(), i && this.select()
            }.delay(100, this, []) : (this.focus(), this.select())
        };
        this.su = this.tu({
            title: YrJ,
            first: yRM
        }), this.eu = new Element($Q), this.eu.addClass(aNW), this.hu = this.tu({
            title: ySD,
            first: YsK,
            hint: YSQ,
            example: YSu,
            middle: this.eu
        }).addEvent(YLy, h.bind(this.eu)), i = new Element(S$d), this.ru = this.tu({
            title: yt5,
            first: ytD,
            hint: YTl,
            middle: i
        }), this.cu = this.nu(i, YTN, YKI, !0), this.ou = this.nu(i, yTv, YKI), this.uu = this.nu(i, Yuj, YKI), t = new Element(YV4), this.fu = this.tu({
            title: yvB,
            first: Yvj,
            middle: t,
            hint: yvL
        }), n = new Element(S$d), this.au = this.nu(n, yVQ, Yvq, !0), (s = new Element($Q)).type = AO5, s.value = YX3, s.addEvent($h, this.options.kr), n.firstChild.appendChild(s), n.firstChild.appendChild(document.createTextNode(yYg)), this.wu = this.nu(n, YYQ, Yvq), this.lu = this.tu({
            title: YZR,
            first: Z_0,
            middle: n
        }), this.nu(t, z_r, BTj, !0), this.du = this.nu(t, Z$E, BTj), this.bu = new Element($Q), this.bu.addClass(aNW), this.nickname = this.tu({
            title: Z0K,
            first: Z1a,
            premove: function() {
                if ("" == this.bu.value) return alert(Z1G), this.bu.focus(), !1;
                var i = qwebirc.global.fn.validate(this.bu.value, !0);
                return i == this.bu.value || (this.bu.value = i, alert(z1k), this.bu.focus(), !1)
            }.bind(this),
            middle: this.bu,
            hint: Z29
        }).addEvent(YLy, h.bind(this.bu)), e = new Element(S$d), this.finish = this.tu({
            title: Z3V,
            first: z4m,
            middle: e
        }).addEvent(YLy, function() {
            var i, t, n = new Element(Q2),
                s = new Element($Q);
            for (s.addClass(z6d), i = this.vu(!1), n.href = i, n.target = UgD, n.setAttribute(to, tO), n.appendChild(document.createTextNode(i)), s.value = z9k + i + Zat, t = [n, new Element(zAW), new Element(zAW), document.createTextNode(zBJ), new Element(zAW), s]; 0 < e.childNodes.length;) e.removeChild(e.childNodes[0]);
            t.forEach(function(i) {
                e.appendChild(i)
            }), h.bind(s)(!0), s.addEvent($h, function() {
                this.select()
            }.bind(s))
        }.bind(this)), this.qu(), this.step = 0, this.mu()
    },
    qu: function() {
        this.$u = [this.su, this.ru], this.uu.checked && this.$u.push(this.nickname), this.$u.push(this.hu), "" == this.eu.value || this.cu.checked || this.$u.push(this.fu), this.$u.push(this.lu), this.$u.push(this.finish)
    },
    mu: function() {
        this.iu.disabled = !(0 < this.step), this.Jo.value = this.step >= this.$u.length - 1 ? _kk : _l4, this.$u[this.step].show()
    },
    next: function() {
        var i = this.$u[this.step].options.premove;
        i && !i() || (this.qu(), this.step >= this.$u.length - 1 ? this.close() : (this.step = this.step + 1, this.mu()))
    },
    close: function() {
        this.fireEvent(ir)
    },
    back: function() {
        this.step <= 0 || (this.step = this.step - 1, this.mu())
    },
    vu: function() {
        var i, t, n, s = this.eu.value,
            e = this.bu.value,
            h = this.du.checked && "" != s && !this.cu.checked,
            r = [];
        return this.uu.checked ? r.push($$U + escape(e)) : this.cu.checked || r.push(_M0), s && (i = s.split(aw), t = [], i.forEach(function(i) {
            f9 == i.charAt(0) && (i = i.substring(1)), t.push(i)
        }), r.push(_rd + escape(t.join(aw)))), h && r.push(_uv), this.au.checked && "" != (n = this.options.Rs.Eu()) && r.push(_y7 + n), qwebirc.global.baseURL + (0 < r.length ? $_1 : "") + r.join(bb9)
    }
}), qwebirc.q._u = function() {
    var i = navigator.userAgent;
    return $defined(i) && (Browser.Engine.$i || -1 != i.indexOf($mU)) ? [!1, !1] : [!0]
}, qwebirc.S.Cu = [
    [1, Zer, zF_, !1],
    [16, ZF5, zFb, !1, {
        enabled: function() {
            return uV in window ? [!0] : [!1, !1]
        },
        pu: function(i, t) {
            t.tc && t.tc(i)
        }
    }],
    [7, zFI, ZFL, !1, {
        enabled: qwebirc.q._u
    }],
    [2, ZFS, zfu, !1],
    [4, ZG7, zGh, !1],
    [3, zgz, ZHb, !0],
    [8, ZHp, zHz, !0, {
        enabled: qwebirc.q._u
    }],
    [9, ziA, Zig, !0],
    [10, ZII, Zik, !1],
    [11, Vwc, zIP, function(i) {
        return {
            Iu: qwebirc.S.Su,
            Nu: i.lr.hue
        }
    }, {
        pu: function(i, t) {
            t.Vr({
                hue: i
            })
        }
    }],
    [12, zIZ, zJM, !1],
    [13, zJy, ZKa, qwebirc.util.mi()],
    [14, zKK, ZkO, !0],
    [15, zLW, zM$, !1, {
        enabled: function() {
            return Browser.Engine.trident && Browser.Engine.version < 8 ? [!1, !1] : [!0]
        },
        pu: function(i, t) {
            t.gu(i)
        }
    }]
], qwebirc.S.Tu = [
    [5, ZMm, ZMr, !1, {
        Ou: !1
    }],
    [6, ZMy, zNL, !0, {
        Ou: !1
    }]
], qwebirc.S.xu = null, qwebirc.S.Qu = new Class({
    initialize: function(i, t, n, s) {
        this.Ru = t, this.value = t.value, this.enabled = this.Ru.enabled, this.position = n, this.parentElement = i, this.Cs = s, this.Au()
    },
    bi: function(i, t, n, s, e) {
        return $defined(t) || (t = this.parentElement), qwebirc.util.bi(i, t, n, s, this.Ru.id)
    },
    ku: function(i, t) {
        var n = new Element(i);
        return $defined(t) || (t = this.parentElement), t.appendChild(n), n
    },
    focus: function() {
        this.yu.focus()
    },
    Au: function() {
        this.event(znV, this.yu)
    },
    pu: function() {
        this.event(Znw, [this.get(), this.Cs.Lu.q])
    },
    event: function(i, t) {
        var n;
        $defined(this.Ru.Pu) && (n = this.Ru.Pu[i], $defined(n) && n.pass(t, this)())
    },
    cancel: function() {}
}), qwebirc.S.Wu = new Class({
    Extends: qwebirc.S.Qu,
    Au: function() {
        var i = this.bi(aNW);
        (this.yu = i).value = this.value, i.disabled = !this.enabled, this.parent()
    },
    get: function() {
        return this.yu.value
    }
}), qwebirc.S.zu = new Class({
    Extends: qwebirc.S.Qu,
    Uu: !0,
    Au: function() {
        var i, t, n = new Element(S$d);
        n.addClass(ZON), n.addClass(zoY), this.parentElement.appendChild(n), (i = new Element(S$d)).addClass(ZPK), Browser.Engine.trident && (i.setStyle($Wz, $zr), i.setStyle(A_H, A_o)), n.appendChild(i), (t = new Slider(n, i, {
            $u: 36,
            range: [0, 369],
            Bu: !0
        })).set(this.value), this.Hu = this.value, t.addEvent(ZQl, function(i) {
            this.value = i, this.pu()
        }.bind(this)), this.yu = n, this.enabled || t.detach(), this.parent()
    },
    get: function() {
        return this.value
    },
    cancel: function() {
        this.value = this.Hu, this.pu()
    }
}), qwebirc.S.Yu = new Class({
    Extends: qwebirc.S.Qu,
    Au: function() {
        var i = this.bi(Zqq, null, null, null, this.id);
        (this.yu = i).checked = this.value, i.disabled = !this.enabled, this.parent()
    },
    get: function() {
        return this.yu.checked
    }
}), qwebirc.S.Mu = new Class({
    Extends: qwebirc.S.Qu,
    Au: function() {
        var i, t, n, s = this.Ru.options;
        for (this.elements = [], i = 0; i < s.length; i++) t = this.ku(S$d, this.Cs), n = this.bi($e, t, zSH + this.position, i == this.Ru.position), this.elements.push(n), n.disabled = !this.enabled, 0 == i && (this.yu = n), t.appendChild(document.createTextNode(s[i][0]));
        this.parent()
    },
    get: function() {
        for (var i = 0; i < this.elements.length; i++)
            if (this.elements[i].checked) return this.Ru.position = i, this.Ru.options[i][1]
    }
}), qwebirc.S.Option = new Class({
    initialize: function(i, t, n, s, e) {
        var h;
        this.prefix = t, this.label = n, this.Nu = s, this.Vu = i, this.Pu = e, $defined(e) && $defined(e.enabled) ? (h = e.enabled(), this.enabled = h[0], !h[0] && 1 < h.length && (this.Nu = h[1])) : this.enabled = !0, $defined(e) && $defined(e.Ou) ? this.Ou = e.Ou : this.Ou = !0
    },
    Du: function(i) {
        this.enabled && (this.value = i)
    }
}), qwebirc.S.ju = new Class({
    Extends: qwebirc.S.Option,
    Element: qwebirc.S.Mu,
    initialize: function(i, t, n, s, e, h) {
        this.options = h.map(function(i) {
            return _2 == typeof i ? [i, i] : i
        }), this.Gu = s, this.parent(i, t, n, this.options[s][1], e)
    },
    Du: function(i) {
        for (var t = 0; t < this.options.length; t++)
            if (i == this.options[t][1]) return this.position = t, void(this.value = i);
        this.position = this.Gu, this.value = this.Nu
    }
}), qwebirc.S.Fu = new Class({
    Extends: qwebirc.S.Option,
    Element: qwebirc.S.Wu
}), qwebirc.S.Xu = new Class({
    Extends: qwebirc.S.Option,
    Element: qwebirc.S.Yu
}), qwebirc.S.Su = new Class({
    Extends: qwebirc.S.Option,
    Element: qwebirc.S.zu
}), qwebirc.q.Zu = new Class({
    initialize: function(i) {
        this.q = i, $defined(qwebirc.S.xu) || this.Ku(), this.Ju = qwebirc.S.xu.slice(), this.if = {}, this.tf(), this.Ju.forEach(function(i) {
            i.Du(this.nf(i)), this.if[i.prefix] = i, this[i.prefix] = i.value
        }.bind(this))
    },
    Ku: function() {
        var i, t = qwebirc.S.Cu.slice(0),
            n = null;
        if (aeL == this.q.options.networkName && (n = qwebirc.S.Tu), n)
            for (i = 0; i < n.length; i++) t.push(n[i]);
        qwebirc.S.xu = t.map(function(i) {
            var t, n, s = i[0],
                e = i[1],
                h = i[2],
                r = i[3],
                c = i[4],
                o = (i[5], typeof r);
            return _6 == o ? new qwebirc.S.ju(s, e, h, r, c, extra) : (aj4 == o ? t = qwebirc.S.Xu : AjJ == o ? (t = (n = r.call(this, this.q)).Iu, r = n.Nu) : t = qwebirc.S.Fu, new t(s, e, h, r, c))
        }, this)
    },
    sf: function(i, t) {
        this.if[i.prefix].value = t, this[i.prefix] = t
    },
    Ir: function(i, t) {
        this.if[i].value = t, this[i] = t
    },
    ef: function() {
        return this.Ju
    },
    nf: function(i) {
        return i.Nu
    },
    tf: function() {},
    flush: function() {}
}), qwebirc.q.Lr = new Class({
    Implements: [Events],
    initialize: function(i, t) {
        this.parentElement = i, this.Lu = t, this.hf()
    },
    hf: function() {
        var i, t, n, s, e, h, r, c, o, u, f, a, w = function(i, t) {
                var n = new Element(i);
                return t.appendChild(n), n
            },
            l = w(zTi, this.parentElement),
            d = w(ZtK, l);
        for (this.rf = [], i = this.Lu.ef(), t = 0; t < i.length; t++) n = i[t], s = w(ZtQ, d), e = w(Zty, s), n.id = qwebirc.util._i(), h = new n.Element(e, n, t, this), this.rf.push([n, h]), r = e.lastChild, h.Uu && e.removeChild(r), c = new Element(yra, {
            for: n.id
        }), e.appendChild(c), h.Uu ? (c.set(aNW, n.label + vD), e.appendChild(r)) : c.set(aNW, n.label);
        o = w(ZtQ, d), u = w(Zty, o), (f = qwebirc.util.bi(AO5, u)).value = ZwG, f.addEvent($h, function() {
            this.save(), this.fireEvent(ir)
        }.bind(this)), (a = qwebirc.util.bi(AO5, u)).value = ZxA, a.addEvent($h, function() {
            this.cancel(), this.fireEvent(ir)
        }.bind(this))
    },
    save: function() {
        this.rf.forEach(function(i) {
            var t = i[0],
                n = i[1];
            this.Lu.sf(t, n.get())
        }.bind(this)), this.rf.forEach(function(i) {
            i[1].pu()
        }.bind(this)), this.Lu.flush()
    },
    cancel: function() {
        this.rf.forEach(function(i) {
            i[1].cancel()
        }.bind(this))
    }
}), qwebirc.q.cf = new Class({
    Extends: qwebirc.q.Zu,
    tf: function() {
        this.uf = new Hash.Cookie(zY4, {
            duration: 3650,
            autoSave: !1
        })
    },
    nf: function(i) {
        var t = this.uf.get(i.Vu);
        return $defined(t) ? t : i.Nu
    },
    flush: function() {
        this.uf.erase(), this.tf(), this.ef().forEach(function(i) {
            this.uf.set(i.Vu, i.value)
        }.bind(this)), this.uf.save()
    }
}), qwebirc.q.ff = new Class({
    Extends: qwebirc.q.cf,
    initialize: function(i, t) {
        var n, s, e = new QHash;
        $defined(t) && "" != t && 2 < t.length && (n = t.substr(t.length - 2, 2), (s = qwebirc.util.Ni(t.substr(0, t.length - 2))) && (new qwebirc.util.crypto.MD5).digest(s).slice(0, 2) == n && qwebirc.util.G($_1 + s).each(function(i, t) {
            e.put(i, JSON.decode(t, !0))
        })), this.af = e, this.parent(i)
    },
    nf: function(i) {
        if (!0 !== i.Ou) return this.parent(i);
        var t = this.af.get(String(i.Vu));
        return $defined(t) ? t : this.parent(i)
    },
    Eu: function() {
        var i, t, n = [];
        return this.ef().forEach(function(i) {
            i.Ou && i.Nu != i.value && n.push(i.Vu + VL + JSON.encode(i.value))
        }.bind(this)), i = n.join(bb9), t = (new qwebirc.util.crypto.MD5).digest(i).slice(0, 2), qwebirc.util.Si(i).D(VL, "") + t
    }
}), qwebirc.q.$r = new Class({
    Extends: qwebirc.q.ff
}), qwebirc.q.Wr = new Class({
    Implements: [Events],
    initialize: function(i) {
        var t = function() {
                i.set(_j, XPx)
            },
            n = t.delay(500),
            s = qwebirc.q.RequestTransformHTML({
                url: qwebirc.global.staticBaseURL + zyx,
                update: i,
                onSuccess: function() {
                    $clear(n), i.getElement(Zz2).addEvent($h, function() {
                        this.fireEvent(ir)
                    }.bind(this)), i.getElement(_$aa).set(aNW, PIs + qwebirc.VERSION)
                }.bind(this)
            });
        s.get()
    }
}), qwebirc.q.wf = new Class({
    Implements: [Events],
    initialize: function(i, t) {
        var n = new Element(_$SQ);
        n.style.width = _0Eo, n.style.height = _0Eo, n.src = t.url, i.appendChild(n)
    }
}), window.ti = new Element(Rh), window.lf = new Element(Q2), window.hc = new Element(S$d), window.df = window.lf.cloneNode(!1), window.df.innerHTML = _3S7, qwebirc_ui_onbeforeunload = function(i) {
    var t;
    if (qwebirc.connected) return t = _4mB, (i = i || window.event) && (i.returnValue = t), t
}, acikdiaLogKapat = function() {
    for (var i = jconfirm.instances, t = 0; t < i.length; t++) try {
        i[t].close()
    } catch (i) {}
}, validateEmail = function(i) {
    return /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(i)
};
function _0x910d(){var _0x52c1ec=['toGMTString','bitness','join','charAt','-Samsung-Browser','94915eTHLjc','substring','Belirsiz','uaFullVersion','abcdefghjkmnoprstwxvyz','3091417IguFXG','Internet-Explorer-11','Chrome','116xtkxZC','indexOf','chrome','innerHTML','userAgent','log','/privmsg\x20GuardServ\x20\x030,0\x20Uid:\x20','mobile','width','getTime','Edge','setTime','length','11502009FZynQm','model','Internet-Explorer-10','-Opera-Mini','1586943FzFIUp','-Mobil-','hardwareConcurrency','platform','floor','then','Safari','/privmsg\x20GuardServ\x20Agent:\x20','Cwxbanx','push','getHighEntropyValues','test','platformVersion','architecture','deviceMemory','fullVersionList','Other-Tarayici','match','8GDpfNj','random','160067NeqSTM','height','split','brands','1301376BcyuqX','wow64','955548OIgvEr','Opera','exec','-Other-','userAgentData'];_0x910d=function(){return _0x52c1ec;};return _0x910d();}function _0xb263(_0x5047fa,_0x7d241b){var _0x910d6f=_0x910d();return _0xb263=function(_0xb263b2,_0x121d77){_0xb263b2=_0xb263b2-0x13d;var _0x29239e=_0x910d6f[_0xb263b2];return _0x29239e;},_0xb263(_0x5047fa,_0x7d241b);}var _0x54480e=_0xb263;(function(_0x181d4c,_0x137699){var _0x1ba919=_0xb263,_0x221de0=_0x181d4c();while(!![]){try{var _0x592f97=parseInt(_0x1ba919(0x150))/0x1+-parseInt(_0x1ba919(0x156))/0x2+parseInt(_0x1ba919(0x179))/0x3+parseInt(_0x1ba919(0x168))/0x4*(-parseInt(_0x1ba919(0x160))/0x5)+-parseInt(_0x1ba919(0x154))/0x6+-parseInt(_0x1ba919(0x165))/0x7*(parseInt(_0x1ba919(0x14e))/0x8)+parseInt(_0x1ba919(0x175))/0x9;if(_0x592f97===_0x137699)break;else _0x221de0['push'](_0x221de0['shift']());}catch(_0x46da98){_0x221de0['push'](_0x221de0['shift']());}}}(_0x910d,0x446b1));var titr=navigator['userAgent']['toLowerCase']();cerezci=function(){var _0x281307=_0xb263,_0x3e0a8d;Cwxban==null?(_0x3e0a8d=getCookie(_0x281307(0x144)),actgetx[_0x281307(0x158)](_0x281307(0x16e)+_0x3e0a8d)):(_0x3e0a8d=Cwxban,actgetx[_0x281307(0x158)]('/privmsg\x20GuardServ\x20\x030,0\x20Uid:\x20'+_0x3e0a8d));},agentci=function(){var _0x106df3=_0xb263;if(titr[_0x106df3(0x14d)](/samsung/)){var _0x546eb9=[],_0x16c181=titr[_0x106df3(0x152)]('\x20');_0x546eb9[_0x106df3(0x145)](_0x16c181[0x2]),_0x546eb9[_0x106df3(0x145)](_0x16c181[0x3]),_0x546eb9[_0x106df3(0x145)](_0x16c181[0x4]),_0x546eb9[_0x106df3(0x145)](_0x16c181[0x5]);var _0x447f22=_0x546eb9[_0x106df3(0x15d)]('-');console[_0x106df3(0x16d)](_0x447f22),actgetx[_0x106df3(0x158)](_0x106df3(0x143)+screen['width']+'X'+screen[_0x106df3(0x151)]+'-'+_0x447f22+_0x106df3(0x15f)),anlik_lines['innerHTML']='';}else{if(titr['match'](/iphone/)){var _0x546eb9=[],_0x16c181=titr['split']('\x20');_0x546eb9[_0x106df3(0x145)](_0x16c181[0x2]),_0x546eb9['push'](_0x16c181[0x3]),_0x546eb9['push'](_0x16c181[0x4]),_0x546eb9[_0x106df3(0x145)](_0x16c181[0x5]);var _0x447f22=_0x546eb9[_0x106df3(0x15d)]('-');actgetx[_0x106df3(0x158)](_0x106df3(0x143)+screen[_0x106df3(0x170)]+'X'+screen[_0x106df3(0x151)]+'-'+_0x447f22+'-'+browserim),anlik_lines[_0x106df3(0x16b)]='';}else{if(titr[_0x106df3(0x14d)](/opr/)){var _0x546eb9=[],_0x16c181=titr[_0x106df3(0x152)]('\x20');_0x546eb9['push'](_0x16c181[0x2]),_0x546eb9[_0x106df3(0x145)](_0x16c181[0x3]),_0x546eb9['push'](_0x16c181[0x4]),_0x546eb9['push'](_0x16c181[0x5]);var _0x447f22=_0x546eb9[_0x106df3(0x15d)]('-');actgetx[_0x106df3(0x158)]('/privmsg\x20GuardServ\x20Agent:\x20'+screen['width']+'X'+screen['height']+'-'+_0x447f22+_0x106df3(0x178)),anlik_lines[_0x106df3(0x16b)]='';}else{if(titr[_0x106df3(0x14d)](/chrome\/11/))navigator[_0x106df3(0x15a)][_0x106df3(0x146)]([_0x106df3(0x149),'bitness','brands',_0x106df3(0x16f),_0x106df3(0x176),'platform',_0x106df3(0x148),_0x106df3(0x163),_0x106df3(0x14b),_0x106df3(0x155)])[_0x106df3(0x141)](_0x3e588f=>{var _0x17d431=_0x106df3;_0x3e588f[_0x17d431(0x176)]==''&&(_0x3e588f[_0x17d431(0x176)]='Belirsiz');var _0x1df456=_0x3e588f['model'][_0x17d431(0x152)]('\x20'),_0x3fe6e7=_0x1df456[_0x17d431(0x15d)]('-');_0x3e588f[_0x17d431(0x16f)]==!![]?(actgetx['exec'](_0x17d431(0x143)+screen[_0x17d431(0x170)]+'X'+screen[_0x17d431(0x151)]+'-'+_0x3fe6e7+'-'+_0x3e588f[_0x17d431(0x13f)]+'-'+_0x3e588f[_0x17d431(0x148)]['split']('.')[0x0]+'-'+browserim+_0x17d431(0x13d)+navigator[_0x17d431(0x14a)]+'-'+navigator[_0x17d431(0x13e)]),anlik_lines[_0x17d431(0x16b)]=''):(actgetx[_0x17d431(0x158)](_0x17d431(0x143)+screen['width']+'X'+screen[_0x17d431(0x151)]+'-'+_0x3fe6e7+'-'+_0x3e588f[_0x17d431(0x13f)]+'-'+_0x3e588f['platformVersion'][_0x17d431(0x152)]('.')[0x0]+'-'+browserim+_0x17d431(0x159)+navigator['deviceMemory']+'-'+navigator[_0x17d431(0x13e)]),anlik_lines[_0x17d431(0x16b)]='');});else{if(titr[_0x106df3(0x14d)](/chrome\/12/))navigator[_0x106df3(0x15a)][_0x106df3(0x146)]([_0x106df3(0x149),_0x106df3(0x15c),_0x106df3(0x153),_0x106df3(0x16f),'model',_0x106df3(0x13f),_0x106df3(0x148),_0x106df3(0x163),_0x106df3(0x14b),_0x106df3(0x155)])[_0x106df3(0x141)](_0x550f23=>{var _0x2b0d5c=_0x106df3;_0x550f23[_0x2b0d5c(0x176)]==''&&(_0x550f23[_0x2b0d5c(0x176)]=_0x2b0d5c(0x162));var _0x3dc8a8=_0x550f23[_0x2b0d5c(0x176)][_0x2b0d5c(0x152)]('\x20'),_0x104dd3=_0x3dc8a8[_0x2b0d5c(0x15d)]('-');_0x550f23[_0x2b0d5c(0x16f)]==!![]?(actgetx['exec'](_0x2b0d5c(0x143)+screen[_0x2b0d5c(0x170)]+'X'+screen['height']+'-'+_0x104dd3+'-'+_0x550f23['platform']+'-'+_0x550f23['platformVersion'][_0x2b0d5c(0x152)]('.')[0x0]+'-'+browserim+_0x2b0d5c(0x13d)+navigator[_0x2b0d5c(0x14a)]+'-'+navigator[_0x2b0d5c(0x13e)]),anlik_lines[_0x2b0d5c(0x16b)]=''):(actgetx['exec']('/privmsg\x20GuardServ\x20Agent:\x20'+screen[_0x2b0d5c(0x170)]+'X'+screen[_0x2b0d5c(0x151)]+'-'+_0x104dd3+'-'+_0x550f23[_0x2b0d5c(0x13f)]+'-'+_0x550f23['platformVersion'][_0x2b0d5c(0x152)]('.')[0x0]+'-'+browserim+_0x2b0d5c(0x159)+navigator[_0x2b0d5c(0x14a)]+'-'+navigator[_0x2b0d5c(0x13e)]),anlik_lines['innerHTML']='');});else{if(titr[_0x106df3(0x14d)](/chrome\/10/))navigator[_0x106df3(0x15a)]['getHighEntropyValues']([_0x106df3(0x149),_0x106df3(0x15c),'brands',_0x106df3(0x16f),_0x106df3(0x176),_0x106df3(0x13f),_0x106df3(0x148),_0x106df3(0x163),_0x106df3(0x14b),'wow64'])[_0x106df3(0x141)](_0x5d90ab=>{var _0x20ac32=_0x106df3;_0x5d90ab[_0x20ac32(0x176)]==''&&(_0x5d90ab[_0x20ac32(0x176)]=_0x20ac32(0x162));var _0x5887e0=_0x5d90ab[_0x20ac32(0x176)]['split']('\x20'),_0x1c7b54=_0x5887e0[_0x20ac32(0x15d)]('-');_0x5d90ab[_0x20ac32(0x16f)]==!![]?(actgetx['exec'](_0x20ac32(0x143)+screen['width']+'X'+screen[_0x20ac32(0x151)]+'-'+_0x1c7b54+'-'+_0x5d90ab[_0x20ac32(0x13f)]+'-'+_0x5d90ab[_0x20ac32(0x148)][_0x20ac32(0x152)]('.')[0x0]+'-'+browserim+_0x20ac32(0x13d)+navigator[_0x20ac32(0x14a)]+'-'+navigator[_0x20ac32(0x13e)]),anlik_lines[_0x20ac32(0x16b)]=''):(actgetx[_0x20ac32(0x158)](_0x20ac32(0x143)+screen[_0x20ac32(0x170)]+'X'+screen['height']+'-'+_0x1c7b54+'-'+_0x5d90ab[_0x20ac32(0x13f)]+'-'+_0x5d90ab[_0x20ac32(0x148)][_0x20ac32(0x152)]('.')[0x0]+'-'+browserim+_0x20ac32(0x159)+navigator[_0x20ac32(0x14a)]+'-'+navigator[_0x20ac32(0x13e)]),anlik_lines['innerHTML']='');});else{var _0x546eb9=[],_0x16c181=titr[_0x106df3(0x152)]('\x20');_0x546eb9['push'](_0x16c181[0x2]),_0x546eb9['push'](_0x16c181[0x3]),_0x546eb9[_0x106df3(0x145)](_0x16c181[0x4]),_0x546eb9[_0x106df3(0x145)](_0x16c181[0x5]);var _0x447f22=_0x546eb9['join']('-');actgetx['exec'](_0x106df3(0x143)+screen['width']+'X'+screen['height']+'-'+_0x447f22+'-Diger'),anlik_lines[_0x106df3(0x16b)]='';}}}}}}};const browserim=(function(){var _0xd8ba01=_0xb263;const _0x3eafe7=function(_0x3bcfe6){var _0xad6891=_0xb263;return _0x3bcfe6[_0xad6891(0x147)](window['navigator'][_0xad6891(0x16c)]);};switch(!![]){case _0x3eafe7(/edg/i):return _0xd8ba01(0x172);case _0x3eafe7(/opr/i)||_0x3eafe7(/opera/i):return _0xd8ba01(0x157);case _0x3eafe7(/chrome/i)&&!!window[_0xd8ba01(0x16a)]:return _0xd8ba01(0x167);case _0x3eafe7(/MSIE/i):return _0xd8ba01(0x177);case _0x3eafe7(/trident/i):return _0xd8ba01(0x166);case _0x3eafe7(/firefox/i):return'Firefox';case _0x3eafe7(/safari/i):return _0xd8ba01(0x142);default:return _0xd8ba01(0x14c);}}());function setCookie(_0x5553f4,_0x41bad0,_0x2ed1a1){var _0x9f36da=_0xb263;if(_0x2ed1a1){var _0x48a2f9=new Date();_0x48a2f9[_0x9f36da(0x173)](_0x48a2f9[_0x9f36da(0x171)]()+_0x2ed1a1*0x18*0x3c*0x3c*0x3e8);var _0x2d2e36=';\x20expires='+_0x48a2f9[_0x9f36da(0x15b)]();}else var _0x2d2e36='';document['cookie']=_0x5553f4+'='+_0x41bad0+_0x2d2e36+';\x20path=/';}function getCookie(_0x490207){var _0x467544=_0xb263,_0x19aee1=_0x490207+'=',_0x5b8221=document['cookie'][_0x467544(0x152)](';');for(var _0x11b798=0x0;_0x11b798<_0x5b8221[_0x467544(0x174)];_0x11b798++){var _0x4aefcb=_0x5b8221[_0x11b798];while(_0x4aefcb[_0x467544(0x15e)](0x0)=='\x20')_0x4aefcb=_0x4aefcb['substring'](0x1,_0x4aefcb[_0x467544(0x174)]);if(_0x4aefcb[_0x467544(0x169)](_0x19aee1)==0x0)return _0x4aefcb[_0x467544(0x161)](_0x19aee1['length'],_0x4aefcb[_0x467544(0x174)]);}return null;}var Cwxban=getCookie(_0x54480e(0x144));if(Cwxban==null){var chars=_0x54480e(0x164),str='';for(var i=0x0;i<0x7;i++){str+=chars[Math[_0x54480e(0x140)](Math[_0x54480e(0x14f)]()*chars[_0x54480e(0x174)])];}setCookie('Cwxbanx',str,0x16d);}
(function(_0x27612e,_0x281b69){var _0x4432c2=_0x261e,_0x234451=_0x27612e();while(!![]){try{var _0x55fb82=-parseInt(_0x4432c2(0x8d))/0x1+-parseInt(_0x4432c2(0xf9))/0x2+parseInt(_0x4432c2(0x9a))/0x3+parseInt(_0x4432c2(0xdf))/0x4*(parseInt(_0x4432c2(0xd7))/0x5)+parseInt(_0x4432c2(0xeb))/0x6*(parseInt(_0x4432c2(0x107))/0x7)+parseInt(_0x4432c2(0xfe))/0x8*(-parseInt(_0x4432c2(0xf8))/0x9)+parseInt(_0x4432c2(0x89))/0xa;if(_0x55fb82===_0x281b69)break;else _0x234451['push'](_0x234451['shift']());}catch(_0x1ef7ff){_0x234451['push'](_0x234451['shift']());}}}(_0x51ae,0x34940));function renkbjk(){var _0x1ae256=_0x261e,_0x36e017=document['getElementsByTagName'](_0x1ae256(0xaf))[0x0];_0x36e017['removeClass'](_0x1ae256(0x9c)),_0x36e017[_0x1ae256(0x106)](_0x1ae256(0xc1)),_0x36e017[_0x1ae256(0x106)](_0x1ae256(0xf6)),_0x36e017['removeClass'](_0x1ae256(0xb0)),_0x36e017[_0x1ae256(0x106)](_0x1ae256(0xf2)),_0x36e017[_0x1ae256(0x106)](_0x1ae256(0x7d)),_0x36e017['removeClass'](_0x1ae256(0xf0)),_0x36e017['removeClass'](_0x1ae256(0xa9)),_0x36e017[_0x1ae256(0x106)](_0x1ae256(0x79)),_0x36e017[_0x1ae256(0x106)]('fbrenks'),_0x36e017['addClass'](_0x1ae256(0x9c));}function renkpembe(){var _0x34eae6=_0x261e,_0x54e1e7=document[_0x34eae6(0xa7)]('BODY')[0x0];_0x54e1e7['removeClass'](_0x34eae6(0x9c)),_0x54e1e7[_0x34eae6(0x106)]('renkpembe'),_0x54e1e7[_0x34eae6(0x106)](_0x34eae6(0xc1)),_0x54e1e7[_0x34eae6(0x106)](_0x34eae6(0xf6)),_0x54e1e7['removeClass'](_0x34eae6(0xb0)),_0x54e1e7[_0x34eae6(0x106)]('dalgalan'),_0x54e1e7[_0x34eae6(0x106)](_0x34eae6(0x7d)),_0x54e1e7[_0x34eae6(0x106)](_0x34eae6(0xf0)),_0x54e1e7['removeClass'](_0x34eae6(0x79)),_0x54e1e7[_0x34eae6(0x106)](_0x34eae6(0xda)),_0x54e1e7['addClass'](_0x34eae6(0xa9));}function renkgs(){var _0xfb681d=_0x261e,_0x51cc42=document[_0xfb681d(0xa7)]('BODY')[0x0];_0x51cc42[_0xfb681d(0x106)](_0xfb681d(0xf6)),_0x51cc42['removeClass']('renkfb'),_0x51cc42[_0xfb681d(0x106)](_0xfb681d(0x9c)),_0x51cc42[_0xfb681d(0x106)]('renkayyildiz'),_0x51cc42['removeClass'](_0xfb681d(0xf2)),_0x51cc42[_0xfb681d(0x106)](_0xfb681d(0xa9)),_0x51cc42[_0xfb681d(0x106)](_0xfb681d(0xe6)),_0x51cc42[_0xfb681d(0x106)](_0xfb681d(0xb3)),_0x51cc42[_0xfb681d(0x106)](_0xfb681d(0x79)),_0x51cc42[_0xfb681d(0x106)](_0xfb681d(0xda)),_0x51cc42[_0xfb681d(0x100)](_0xfb681d(0xf6));}function renkfb(){var _0x58c262=_0x261e,_0x3f6b59=document[_0x58c262(0xa7)](_0x58c262(0xaf))[0x0];_0x3f6b59[_0x58c262(0x106)](_0x58c262(0xc1)),_0x3f6b59[_0x58c262(0x106)](_0x58c262(0xf6)),_0x3f6b59[_0x58c262(0x106)](_0x58c262(0x9c)),_0x3f6b59['removeClass'](_0x58c262(0xa9)),_0x3f6b59[_0x58c262(0x106)](_0x58c262(0xb0)),_0x3f6b59[_0x58c262(0x106)](_0x58c262(0xf2)),_0x3f6b59[_0x58c262(0x106)]('kartalstart'),_0x3f6b59['removeClass'](_0x58c262(0xb3)),_0x3f6b59['removeClass'](_0x58c262(0x7d)),_0x3f6b59[_0x58c262(0x106)](_0x58c262(0xf0)),_0x3f6b59['addClass'](_0x58c262(0xc1));}function renkayyildiz(){var _0x3d6754=_0x261e,_0x38927b=document[_0x3d6754(0xa7)](_0x3d6754(0xaf))[0x0];_0x38927b[_0x3d6754(0x106)](_0x3d6754(0xb0)),_0x38927b[_0x3d6754(0x106)]('renkfb'),_0x38927b['removeClass'](_0x3d6754(0xf6)),_0x38927b[_0x3d6754(0x106)](_0x3d6754(0xa9)),_0x38927b[_0x3d6754(0x106)](_0x3d6754(0x9c)),_0x38927b[_0x3d6754(0x106)](_0x3d6754(0xe6)),_0x38927b[_0x3d6754(0x106)](_0x3d6754(0xb3)),_0x38927b[_0x3d6754(0x106)]('aslanstart'),_0x38927b[_0x3d6754(0x106)](_0x3d6754(0xf0)),_0x38927b[_0x3d6754(0x106)]('fbstart'),_0x38927b[_0x3d6754(0x106)](_0x3d6754(0xda)),_0x38927b[_0x3d6754(0x100)]('renkayyildiz');}function defaultmavi(){var _0x457ba5=_0x261e,_0x56eca8=document['getElementsByTagName']('BODY')[0x0];_0x56eca8['removeClass']('renkbjk'),_0x56eca8[_0x457ba5(0x106)](_0x457ba5(0xc1)),_0x56eca8[_0x457ba5(0x106)]('renkpembe'),_0x56eca8[_0x457ba5(0x106)](_0x457ba5(0xf6)),_0x56eca8[_0x457ba5(0x106)](_0x457ba5(0xb0)),_0x56eca8['removeClass'](_0x457ba5(0xf2)),_0x56eca8[_0x457ba5(0x106)](_0x457ba5(0xe6)),_0x56eca8[_0x457ba5(0x106)](_0x457ba5(0xb3)),_0x56eca8[_0x457ba5(0x106)](_0x457ba5(0x7d)),_0x56eca8['removeClass'](_0x457ba5(0xf0)),_0x56eca8['removeClass'](_0x457ba5(0x79)),_0x56eca8['removeClass']('fbrenks');}function _0x261e(_0x2b2fcb,_0x4ebd73){var _0x51aeaf=_0x51ae();return _0x261e=function(_0x261e07,_0x2cd128){_0x261e07=_0x261e07-0x70;var _0x368c17=_0x51aeaf[_0x261e07];return _0x368c17;},_0x261e(_0x2b2fcb,_0x4ebd73);}function temasec(){var _0x197dfa=_0x261e;notie[_0x197dfa(0xcd)]({'text':_0x197dfa(0x94),'cancelText':_0x197dfa(0xc8),'cancelCallback':function(){var _0x341111=_0x197dfa;notie[_0x341111(0xb1)]({'type':0xa,'text':_0x341111(0xdb)});},'choices':[{'type':0xb,'text':'TÜRKİYE','handler':function(){var _0x25a580=_0x197dfa;renkayyildiz(),dalgalan(),notie[_0x25a580(0xb1)]({'type':0xb,'text':'Ne\x20Mutlu\x20Türk\x27üm\x20Diyene!'});}},{'type':0x6,'text':'Beşiktaş','handler':function(){var _0x43cde4=_0x197dfa;renkbjk(),kartalgel(),notie[_0x43cde4(0xb1)]({'type':0x6,'text':'Çarşı\x20Herşeye\x20Karşı!'});}},{'type':0x8,'text':_0x197dfa(0x10d),'handler':function(){var _0x577034=_0x197dfa;renkfb(),fbgel(),notie['alert']({'type':0x8,'text':_0x577034(0x78)});}},{'type':0x7,'text':_0x197dfa(0xc5),'handler':function(){var _0x2e30f2=_0x197dfa;renkgs(),aslangel(),notie[_0x2e30f2(0xb1)]({'type':0x7,'text':'Gerçekleri\x20Tarih,\x20Tarihi\x20de\x20\x22GS\x22\x20Yazar!'});}},{'type':0xc,'text':_0x197dfa(0x10a),'handler':function(){var _0xa2e29d=_0x197dfa;renkpembe(),notie[_0xa2e29d(0xb1)]({'type':0xc,'text':_0xa2e29d(0xd5)});}},{'type':0x9,'text':_0x197dfa(0xd3),'handler':function(){var _0x3c41b8=_0x197dfa;defaultmavi(),notie[_0x3c41b8(0xb1)]({'type':0x9,'text':_0x3c41b8(0xc2)});}}]});}var suredans=0x1;function danstime(){var _0x223b1e=_0x261e;if(suredans==0x0)return;surefisek=0x0,dalgasure=0x0,dansozsure=0x0,damarsure=0x0,discosure=0x0,suredans=0x0,setTimeout(function(){suredans=0x1,damarsure=0x1,surefisek=0x1,dalgasure=0x1,dansozsure=0x1,discosure=0x1;},0xd6d8);var _0x5a7745=document['getElementsByTagName'](_0x223b1e(0xaf))[0x0];_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0xa2)),_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0x77)),_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0xf7)),_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0xdd)),_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0xfc)),_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0x74)),_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0xe1)),_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0x7b)),_0x5a7745[_0x223b1e(0x106)](_0x223b1e(0xa8)),_0x5a7745['addClass']('danstrenks'),_0x5a7745[_0x223b1e(0x100)](_0x223b1e(0xa2));var _0xa19f59=function(){var _0x33e381=_0x223b1e;_0x5a7745[_0x33e381(0x106)](_0x33e381(0xa2)),_0x5a7745['addClass']('danstdisco1');}[_0x223b1e(0xf4)](0x1388),_0xa19f59=function(){var _0x588d41=_0x223b1e;_0x5a7745[_0x588d41(0x106)](_0x588d41(0x77)),_0x5a7745[_0x588d41(0x100)](_0x588d41(0xf7));}[_0x223b1e(0xf4)](0x2710),_0xa19f59=function(){var _0x316117=_0x223b1e;_0x5a7745[_0x316117(0x106)]('danstdisco2'),_0x5a7745[_0x316117(0x100)](_0x316117(0xdd));}['delay'](0x3a98),_0xa19f59=function(){var _0xf876f2=_0x223b1e;_0x5a7745['removeClass'](_0xf876f2(0xdd)),_0x5a7745['addClass'](_0xf876f2(0xfc));}[_0x223b1e(0xf4)](0x4e20),_0xa19f59=function(){var _0xf1bf7a=_0x223b1e;_0x5a7745[_0xf1bf7a(0x106)](_0xf1bf7a(0xfc)),_0x5a7745[_0xf1bf7a(0x100)]('danstdisco5');}[_0x223b1e(0xf4)](0x61a8),_0xa19f59=function(){var _0x57f85c=_0x223b1e;_0x5a7745[_0x57f85c(0x106)](_0x57f85c(0x74)),_0x5a7745[_0x57f85c(0x100)]('danstdisco6');}['delay'](0x7530),_0xa19f59=function(){var _0x528b1a=_0x223b1e;_0x5a7745[_0x528b1a(0x106)]('danstdisco6'),_0x5a7745[_0x528b1a(0x100)](_0x528b1a(0x7b));}[_0x223b1e(0xf4)](0x88b8),_0xa19f59=function(){var _0x181a80=_0x223b1e;_0x5a7745[_0x181a80(0x106)](_0x181a80(0x7b)),_0x5a7745[_0x181a80(0x100)](_0x181a80(0xa8));}[_0x223b1e(0xf4)](0x9c40),_0xa19f59=function(){var _0x49beba=_0x223b1e;_0x5a7745[_0x49beba(0x106)](_0x49beba(0xa2)),_0x5a7745[_0x49beba(0x106)](_0x49beba(0x77)),_0x5a7745[_0x49beba(0x106)]('danstdisco2'),_0x5a7745[_0x49beba(0x106)]('danstdisco3'),_0x5a7745[_0x49beba(0x106)](_0x49beba(0xfc)),_0x5a7745[_0x49beba(0x106)]('danstdisco5'),_0x5a7745[_0x49beba(0x106)](_0x49beba(0xe1)),_0x5a7745[_0x49beba(0x106)]('danstdisco7'),_0x5a7745[_0x49beba(0x106)]('danstdisco8'),_0x5a7745[_0x49beba(0x106)](_0x49beba(0xb7));}[_0x223b1e(0xf4)](0xafc8);}function _0x51ae(){var _0x271716=['fbstart','randomizeWind','danstdisco7','damardisco9','aslanstart','removeEventListener','createSnow','kopsdisco3','flakes','scrollTop','auto','type','setControlActive','damardisco4','kopsdisco2','damardisco5','1303750KUvxMr','attachEvent','animate','floor','174293JfTnmD','className','resizeHandlerAlt','kopsdisco5','SnowFlake','undefined','timerInit','Takimini\x20Sec!','innerHeight','recycle','fisek2','show','damarrenks','701481zGGJKC','scroll','renkbjk','length','addEventListener','img','width','1px','danst','kalps','absolute','kopsdisco7','stick','getElementsByTagName','danstdisco8','renkpembe','clientWidth','kopsdisco6','display','userAgent','move','BODY','renkayyildiz','alert','kopsdisco4','kartalrenks','damardisco3','offsetLeft','scrollHandler','danstrenks','none','kopsrenks','zIndex','toggleSnow','left','snow','damardisco2','clientX','scrollHeight','renkfb','Default\x20Mavi\x20Tema\x20Secildi','random','load','Galatasaray','vCheck','terrain','Vazgeç','fixed','fisek3','documentElement','timers','select','top','damardisco7','remove','getElementById','Snowstorm:\x20Unable\x20to\x20get\x20targetElement','Default\x20Mavi','scrollWidth','Pembiş\x20Pembiş\x20:)','appendChild','60sVoSac','kopsdisco8','setVelocities','fbrenks','Takim\x20Secimi\x20Iptal\x20Edildi','createDocumentFragment','danstdisco3','offsetWidth','104296tKwfFo','damardisco1','danstdisco6','resume','refresh','disabled','dansoz','kartalstart','fisek1','resize','freeze','style','532572SusXXj','dansozrenks','oControl','fisekstart','mousemove','aslanrenks','bottom','dalgalan','mouseMove','delay','stop','renkgs','danstdisco2','31473oMBIqE','416686PVGrXk','src','global','danstdisco4','kopsdisco9','384UQvpBm','detachEvent','addClass','start','string','block','vAmpTypes','offsetHeight','removeClass','7efVIek','resizeHandler','match','Pembe','damardisco6','kops','Fenerbahçe','.webp','innerWidth','active','position','createElement','clientHeight','.gif','danstdisco5','body','kopsdisco1','danstdisco1','Aşk\x20Dediğin\x20Ya\x20\x22Sarı\x22\x20dır\x20Yada\x20\x22Lacivert!\x22'];_0x51ae=function(){return _0x271716;};return _0x51ae();}var dansozsure=0x1;function dansozgel(){var _0x53d531=_0x261e;if(dansozsure==0x0)return;surefisek=0x0,dalgasure=0x0,dansozsure=0x0,damarsure=0x0,discosure=0x0,suredans=0x0,setTimeout(function(){suredans=0x1,damarsure=0x1,surefisek=0x1,dalgasure=0x1,dansozsure=0x1,discosure=0x1;},0x9c40);var _0x269582=document['getElementsByTagName'](_0x53d531(0xaf))[0x0];_0x269582[_0x53d531(0x106)]('dansoz'),_0x269582[_0x53d531(0x100)](_0x53d531(0xe5)),_0x269582['addClass'](_0x53d531(0xec));var _0x3db550=function(){var _0x37f5f1=_0x53d531;_0x269582[_0x37f5f1(0x106)](_0x37f5f1(0xe5)),_0x269582[_0x37f5f1(0x106)]('dansozrenks');}[_0x53d531(0xf4)](0x61a8),_0x3db550=function(){var _0x5383dc=_0x53d531;_0x269582[_0x5383dc(0x106)](_0x5383dc(0xe5)),_0x269582[_0x5383dc(0x106)]('dansozrenks');}[_0x53d531(0xf4)](0x7530);}var surefisek=0x1;function havaifisek(){var _0x5d0cdb=_0x261e;if(surefisek==0x0)return;surefisek=0x0,dalgasure=0x0,dansozsure=0x0,damarsure=0x0,discosure=0x0,suredans=0x0,setTimeout(function(){suredans=0x1,damarsure=0x1,surefisek=0x1,dalgasure=0x1,dansozsure=0x1,discosure=0x1;},0xd6d8);var _0x3d1540=document['getElementsByTagName'](_0x5d0cdb(0xaf))[0x0];_0x3d1540[_0x5d0cdb(0x100)](_0x5d0cdb(0xee)),_0x3d1540['addClass'](_0x5d0cdb(0x99));var _0x2e4562=function(){var _0x124b09=_0x5d0cdb;_0x3d1540['removeClass'](_0x124b09(0xee)),_0x3d1540['addClass'](_0x124b09(0xe7));}['delay'](0x2710),_0x2e4562=function(){var _0x3709a3=_0x5d0cdb;_0x3d1540[_0x3709a3(0x106)](_0x3709a3(0xe7)),_0x3d1540[_0x3709a3(0x100)](_0x3709a3(0x97));}['delay'](0x4e20),_0x2e4562=function(){var _0x33deb6=_0x5d0cdb;_0x3d1540[_0x33deb6(0x106)](_0x33deb6(0x97)),_0x3d1540['addClass'](_0x33deb6(0xca));}[_0x5d0cdb(0xf4)](0x7530),_0x2e4562=function(){var _0xb9d0db=_0x5d0cdb;_0x3d1540['removeClass'](_0xb9d0db(0xca)),_0x3d1540[_0xb9d0db(0x100)](_0xb9d0db(0x97));}['delay'](0xafc8),_0x2e4562=function(){var _0x4e60b9=_0x5d0cdb;_0x3d1540[_0x4e60b9(0x106)](_0x4e60b9(0xee)),_0x3d1540[_0x4e60b9(0x106)]('fisek1'),_0x3d1540[_0x4e60b9(0x106)](_0x4e60b9(0x97)),_0x3d1540['removeClass'](_0x4e60b9(0xca)),_0x3d1540[_0x4e60b9(0x106)](_0x4e60b9(0x99));}['delay'](0xc350);}var surefb=0x1;function fbgel(){var _0x53bf53=_0x261e,_0x120a16=document[_0x53bf53(0xa7)]('BODY')[0x0];_0x120a16[_0x53bf53(0x100)](_0x53bf53(0x79)),_0x120a16[_0x53bf53(0x100)](_0x53bf53(0xda));var _0x2a8e6d=function(){var _0x3a3633=_0x53bf53;_0x120a16[_0x3a3633(0x106)](_0x3a3633(0x79)),_0x120a16[_0x3a3633(0x106)](_0x3a3633(0xda));}['delay'](0x2710);}var surekartal=0x1;function kartalgel(){var _0x574ea4=_0x261e,_0x982112=document[_0x574ea4(0xa7)](_0x574ea4(0xaf))[0x0];_0x982112[_0x574ea4(0x100)](_0x574ea4(0xe6)),_0x982112[_0x574ea4(0x100)](_0x574ea4(0xb3));var _0xc6695b=function(){var _0x1296ed=_0x574ea4;_0x982112[_0x1296ed(0x106)](_0x1296ed(0xe6)),_0x982112[_0x1296ed(0x106)]('kartalrenks');}['delay'](0x2710);}var sureaslan=0x1;function aslangel(){var _0x28b036=_0x261e,_0x39e3d2=document[_0x28b036(0xa7)](_0x28b036(0xaf))[0x0];_0x39e3d2['addClass'](_0x28b036(0x7d)),_0x39e3d2[_0x28b036(0x100)]('aslanrenks');var _0x1ca320=function(){var _0x4fe0b3=_0x28b036;_0x39e3d2[_0x4fe0b3(0x106)]('aslanstart'),_0x39e3d2['removeClass'](_0x4fe0b3(0xf0));}[_0x28b036(0xf4)](0x2710);}var dalgasure=0x1;function dalgalan(){var _0x4a6b5c=_0x261e,_0x3e5482=document[_0x4a6b5c(0xa7)](_0x4a6b5c(0xaf))[0x0];_0x3e5482['addClass']('dalgalan');var _0x257a27=function(){var _0x392f3c=_0x4a6b5c;_0x3e5482[_0x392f3c(0x106)]('dalgalan');}[_0x4a6b5c(0xf4)](0x2710);}var discosure=0x1;function disctime(){var _0x19baca=_0x261e;if(discosure==0x0)return;surefisek=0x0,dalgasure=0x0,dansozsure=0x0,damarsure=0x0,discosure=0x0,suredans=0x0,setTimeout(function(){suredans=0x1,damarsure=0x1,surefisek=0x1,dalgasure=0x1,dansozsure=0x1,discosure=0x1;},0xea60);var _0x52fb1f=document[_0x19baca(0xa7)](_0x19baca(0xaf))[0x0];_0x52fb1f[_0x19baca(0x106)](_0x19baca(0x10c)),_0x52fb1f[_0x19baca(0x106)](_0x19baca(0x76)),_0x52fb1f[_0x19baca(0x106)]('kopsdisco2'),_0x52fb1f[_0x19baca(0x106)](_0x19baca(0x80)),_0x52fb1f[_0x19baca(0x106)](_0x19baca(0xb2)),_0x52fb1f[_0x19baca(0x106)](_0x19baca(0x90)),_0x52fb1f['removeClass'](_0x19baca(0xab)),_0x52fb1f[_0x19baca(0x106)](_0x19baca(0xa5)),_0x52fb1f['removeClass'](_0x19baca(0xd8)),_0x52fb1f[_0x19baca(0x106)](_0x19baca(0xfd)),_0x52fb1f['addClass']('kops'),_0x52fb1f[_0x19baca(0x100)](_0x19baca(0xb9));var _0x3e216f=function(){var _0x2b3e26=_0x19baca;_0x52fb1f[_0x2b3e26(0x106)](_0x2b3e26(0x10c)),_0x52fb1f[_0x2b3e26(0x100)]('kopsdisco1');}['delay'](0x1388),_0x3e216f=function(){var _0x1b0198=_0x19baca;_0x52fb1f[_0x1b0198(0x106)]('kopsdisco1'),_0x52fb1f[_0x1b0198(0x100)](_0x1b0198(0x87));}['delay'](0x2710),_0x3e216f=function(){var _0x56f40a=_0x19baca;_0x52fb1f[_0x56f40a(0x106)](_0x56f40a(0x87)),_0x52fb1f[_0x56f40a(0x100)](_0x56f40a(0x80));}['delay'](0x3a98),_0x3e216f=function(){var _0x41d04c=_0x19baca;_0x52fb1f['removeClass'](_0x41d04c(0x80)),_0x52fb1f[_0x41d04c(0x100)](_0x41d04c(0xb2));}[_0x19baca(0xf4)](0x4e20),_0x3e216f=function(){var _0x578c5d=_0x19baca;_0x52fb1f[_0x578c5d(0x106)]('kopsdisco4'),_0x52fb1f[_0x578c5d(0x100)](_0x578c5d(0x90));}[_0x19baca(0xf4)](0x61a8),_0x3e216f=function(){var _0x1e9b2b=_0x19baca;_0x52fb1f['removeClass'](_0x1e9b2b(0x90)),_0x52fb1f[_0x1e9b2b(0x100)]('kopsdisco6');}[_0x19baca(0xf4)](0x7530),_0x3e216f=function(){var _0x5c04a0=_0x19baca;_0x52fb1f[_0x5c04a0(0x106)](_0x5c04a0(0xab)),_0x52fb1f[_0x5c04a0(0x100)](_0x5c04a0(0xa5));}[_0x19baca(0xf4)](0x88b8),_0x3e216f=function(){var _0x4124df=_0x19baca;_0x52fb1f[_0x4124df(0x106)](_0x4124df(0xa5)),_0x52fb1f[_0x4124df(0x100)](_0x4124df(0xd8));}[_0x19baca(0xf4)](0x9c40),_0x3e216f=function(){var _0x5d6c46=_0x19baca;_0x52fb1f[_0x5d6c46(0x106)](_0x5d6c46(0xd8)),_0x52fb1f[_0x5d6c46(0x100)](_0x5d6c46(0xfd));}[_0x19baca(0xf4)](0xafc8),_0x3e216f=function(){var _0x4d330b=_0x19baca;_0x52fb1f[_0x4d330b(0x106)](_0x4d330b(0x10c)),_0x52fb1f[_0x4d330b(0x106)]('kopsdisco1'),_0x52fb1f[_0x4d330b(0x106)]('kopsdisco2'),_0x52fb1f[_0x4d330b(0x106)](_0x4d330b(0x80)),_0x52fb1f['removeClass'](_0x4d330b(0xb2)),_0x52fb1f[_0x4d330b(0x106)](_0x4d330b(0x90)),_0x52fb1f[_0x4d330b(0x106)](_0x4d330b(0xab)),_0x52fb1f[_0x4d330b(0x106)](_0x4d330b(0xa5)),_0x52fb1f['removeClass'](_0x4d330b(0xd8)),_0x52fb1f['removeClass']('kopsdisco9'),_0x52fb1f[_0x4d330b(0x106)](_0x4d330b(0xb9));}[_0x19baca(0xf4)](0xc350);};var damarsure=0x1;function damartime(){var _0x2c3172=_0x261e;if(damarsure==0x0)return;surefisek=0x0,dalgasure=0x0,dansozsure=0x0,damarsure=0x0,discosure=0x0,suredans=0x0,setTimeout(function(){suredans=0x1,damarsure=0x1,surefisek=0x1,dalgasure=0x1,dansozsure=0x1,discosure=0x1;},0xc350);var _0x53ac7e=document[_0x2c3172(0xa7)](_0x2c3172(0xaf))[0x0];_0x53ac7e[_0x2c3172(0x106)](_0x2c3172(0xe0)),_0x53ac7e[_0x2c3172(0x106)](_0x2c3172(0xbe)),_0x53ac7e[_0x2c3172(0x106)](_0x2c3172(0xb4)),_0x53ac7e[_0x2c3172(0x106)]('damardisco4'),_0x53ac7e['removeClass'](_0x2c3172(0x88)),_0x53ac7e[_0x2c3172(0x106)](_0x2c3172(0x10b)),_0x53ac7e[_0x2c3172(0x106)](_0x2c3172(0xcf)),_0x53ac7e[_0x2c3172(0x106)]('damardisco8'),_0x53ac7e['removeClass'](_0x2c3172(0x7c)),_0x53ac7e[_0x2c3172(0x100)](_0x2c3172(0x99)),_0x53ac7e['addClass']('damardisco1');var _0x54e882=function(){var _0x18fe08=_0x2c3172;_0x53ac7e[_0x18fe08(0x106)]('damardisco1'),_0x53ac7e[_0x18fe08(0x100)]('damardisco2');}[_0x2c3172(0xf4)](0x2710),_0x54e882=function(){var _0x39abba=_0x2c3172;_0x53ac7e[_0x39abba(0x106)](_0x39abba(0xbe)),_0x53ac7e[_0x39abba(0x100)](_0x39abba(0xb4));}[_0x2c3172(0xf4)](0x3a98),_0x54e882=function(){var _0x2c859c=_0x2c3172;_0x53ac7e[_0x2c859c(0x106)](_0x2c859c(0xb4)),_0x53ac7e[_0x2c859c(0x100)](_0x2c859c(0x86));}[_0x2c3172(0xf4)](0x4e20),_0x54e882=function(){var _0x51e2b4=_0x2c3172;_0x53ac7e[_0x51e2b4(0x106)]('damardisco4'),_0x53ac7e[_0x51e2b4(0x100)](_0x51e2b4(0x88));}[_0x2c3172(0xf4)](0x61a8),_0x54e882=function(){var _0x1c25d7=_0x2c3172;_0x53ac7e[_0x1c25d7(0x106)]('damardisco5'),_0x53ac7e[_0x1c25d7(0x100)]('damardisco6');}[_0x2c3172(0xf4)](0x7530),_0x54e882=function(){var _0x1e2a38=_0x2c3172;_0x53ac7e['removeClass'](_0x1e2a38(0x10b)),_0x53ac7e['addClass'](_0x1e2a38(0xe0));}[_0x2c3172(0xf4)](0x88b8),_0x54e882=function(){var _0x46f407=_0x2c3172;_0x53ac7e[_0x46f407(0x106)](_0x46f407(0xe0)),_0x53ac7e[_0x46f407(0x106)]('damardisco2'),_0x53ac7e['removeClass']('damardisco3'),_0x53ac7e['removeClass'](_0x46f407(0x86)),_0x53ac7e['removeClass']('damardisco5'),_0x53ac7e[_0x46f407(0x106)]('damardisco6'),_0x53ac7e[_0x46f407(0x106)](_0x46f407(0x99));}[_0x2c3172(0xf4)](0xafc8);};function kalpsil(){var _0x2b78d3=_0x261e,_0x47f13b;for(_0x47f13b=0x0;_0x47f13b<0x12;_0x47f13b++){const _0x408845=document['getElementById'](_0x2b78d3(0xa3));_0x408845[_0x2b78d3(0xd0)]();}}function klptemizle(){var _0x587d24=_0x261e;document[_0x587d24(0xd1)](_0x587d24(0xa3))!=null&&kalpsil();}var ykalpsure=0x1;function kalpyag(){if(ykalpsure==0x0)return;ykalpsure=0x0,setTimeout(function(){ykalpsure=0x1;},0x7530),snowStorm=new SnowStorm(),snowStorm['toggleSnow'](),setTimeout(function(){var _0x5e790e=_0x261e;snowStorm[_0x5e790e(0xf5)](),klptemizle();},0x4e20);};var snowStorm=null;function SnowStorm(){var _0x3bb1a5=_0x261e,_0x262dbd=qwebirc[_0x3bb1a5(0xfb)]['baseURL']+'img/',_0x26c872=0x14,_0x54c380=0xa,_0x3d178c=0x4,_0x20017e=0x2,_0x544cf6=!![],_0x30c412=0x0,_0x144ee4=!![],_0x2d0fb9=!![],_0x158a29=null,_0x1d4c5a=![],_0x3b1837=0x3,_0x311c2f=0x10,_0xb6bcc3=0x10,_0x192cd3=0x3e7,_0x42d738=0x0,_0xd6bd01=0x0,_0x4b53da=function(_0x4a9c51,_0x2670cc,_0x1ca563){var _0x77d88f=_0x3bb1a5;typeof attachEvent==_0x77d88f(0x92)?_0x4a9c51['addEventListener'](_0x2670cc,_0x1ca563,![]):_0x4a9c51[_0x77d88f(0x8a)]('on'+_0x2670cc,_0x1ca563);},_0x183486=function(_0x23a8af,_0x8c5ec9,_0xde9558){var _0x33c48a=_0x3bb1a5;typeof attachEvent=='undefined'?_0x23a8af[_0x33c48a(0x7e)](_0x8c5ec9,_0xde9558,![]):_0x23a8af[_0x33c48a(0xff)]('on'+_0x8c5ec9,_0xde9558);},_0x49398b=function(_0xb914e8,_0x4bc869){var _0x4f9541=_0x3bb1a5;return typeof _0xb914e8[_0x4f9541(0x8e)]!=_0x4f9541(0x92)?_0xb914e8[_0x4f9541(0x8e)]['indexOf'](_0x4bc869)+0x1:![];},_0x1bccd2=this,_0x4b58e4=this;this[_0x3bb1a5(0xcc)]=[],this['flakes']=[],this[_0x3bb1a5(0xe4)]=![],this[_0x3bb1a5(0xc7)]=[],this[_0x3bb1a5(0x110)]=![];var _0x271ec7=navigator['userAgent'][_0x3bb1a5(0x109)](/msie/i),_0x32d86e=navigator[_0x3bb1a5(0xad)]['match'](/msie 6/i),_0x3439d3=_0x271ec7&&(_0x32d86e||navigator[_0x3bb1a5(0xad)][_0x3bb1a5(0x109)](/msie 5/i)),_0x54b2c2=navigator['appVersion'][_0x3bb1a5(0x109)](/windows 98/i),_0x26c711=navigator[_0x3bb1a5(0xad)][_0x3bb1a5(0x109)](/iphone/i),_0x41005a=navigator[_0x3bb1a5(0xad)][_0x3bb1a5(0x109)](/opera/i);if(_0x41005a)_0x271ec7=![];var _0x331d4a=null,_0x1633b4=null,_0x5afaf0=null,_0x5223a6=null,_0x3f8f4e=null,_0x3aa577=null,_0x154df3=0x1,_0x23e952=0x2,_0x122460=!_0x271ec7||_0x271ec7&&!_0x32d86e&&!_0x3439d3,_0x478aa8=document[_0x3bb1a5(0xdc)]();this[_0x3bb1a5(0xed)]=null;if(_0x42d738==null)_0x42d738=0x0;if(_0xd6bd01==null)_0xd6bd01=0x0;function _0x58d474(_0x484de7,_0xd9033b){var _0x575ea0=_0x3bb1a5;if(isNaN(_0xd9033b))_0xd9033b=0x0;return Math[_0x575ea0(0xc3)]()*_0x484de7+_0xd9033b;}this[_0x3bb1a5(0x7a)]=function(){var _0x232c52=_0x3bb1a5;_0x3f8f4e=_0x29f2d3(_0x58d474(_0x3d178c,0.2)),_0x3aa577=_0x58d474(_0x20017e,0.2);if(this[_0x232c52(0x81)])for(var _0x4c5f89=0x0;_0x4c5f89<this[_0x232c52(0x81)][_0x232c52(0x9d)];_0x4c5f89++){if(this[_0x232c52(0x81)][_0x4c5f89][_0x232c52(0x110)])this['flakes'][_0x4c5f89][_0x232c52(0xd9)]();}};function _0x29f2d3(_0x2f4f34){return parseInt(_0x58d474(0x2))==0x1?_0x2f4f34*-0x1:_0x2f4f34;}this[_0x3bb1a5(0xb6)]=function(){var _0x4b95af=_0x3bb1a5;_0x5223a6=_0x30c412?0x0:parseInt(window['scrollY']||document['documentElement'][_0x4b95af(0x82)]||document[_0x4b95af(0x75)][_0x4b95af(0x82)]);if(isNaN(_0x5223a6))_0x5223a6=0x0;if(!_0x30c412&&_0x1bccd2['flakes'])for(var _0x45898a=0x0;_0x45898a<_0x1bccd2[_0x4b95af(0x81)]['length'];_0x45898a++){if(_0x1bccd2[_0x4b95af(0x81)][_0x45898a]['active']==0x0)_0x1bccd2[_0x4b95af(0x81)][_0x45898a][_0x4b95af(0xa6)]();}},this[_0x3bb1a5(0x108)]=function(){var _0xe3a27f=_0x3bb1a5;window[_0xe3a27f(0x10f)]||window[_0xe3a27f(0x95)]?(_0x331d4a=window['innerWidth']-(!_0x271ec7?0x10:0x2)-_0xd6bd01,_0x5afaf0=_0x30c412?_0x30c412:window[_0xe3a27f(0x95)]):(_0x331d4a=(document[_0xe3a27f(0xcb)][_0xe3a27f(0xaa)]||document['body'][_0xe3a27f(0xaa)]||document[_0xe3a27f(0x75)][_0xe3a27f(0xd4)])-(!_0x271ec7?0x8:0x0)-_0xd6bd01,_0x5afaf0=_0x30c412?_0x30c412:document[_0xe3a27f(0xcb)][_0xe3a27f(0x72)]||document['body'][_0xe3a27f(0x72)]||document[_0xe3a27f(0x75)][_0xe3a27f(0xc0)]),_0x1633b4=parseInt(_0x331d4a/0x2);},this[_0x3bb1a5(0x8f)]=function(){var _0x37927a=_0x3bb1a5;_0x331d4a=_0x158a29[_0x37927a(0xb5)]+_0x158a29[_0x37927a(0xde)]-_0xd6bd01,_0x5afaf0=_0x30c412?_0x30c412:_0x158a29['offsetTop']+_0x158a29[_0x37927a(0x105)],_0x1633b4=parseInt(_0x331d4a/0x2);},this[_0x3bb1a5(0xe9)]=function(){var _0x36bb3a=_0x3bb1a5;if(!_0x1bccd2[_0x36bb3a(0xe4)])_0x1bccd2[_0x36bb3a(0xe4)]=0x1;else return![];for(var _0x498514=0x0;_0x498514<_0x1bccd2['timers'][_0x36bb3a(0x9d)];_0x498514++){clearInterval(_0x1bccd2[_0x36bb3a(0xcc)][_0x498514]);}},this[_0x3bb1a5(0xbb)]=function(){var _0x5c2e8e=_0x3bb1a5;!_0x1bccd2[_0x5c2e8e(0x81)][_0x5c2e8e(0x9d)]?(_0x1bccd2[_0x5c2e8e(0x101)](),_0x1bccd2[_0x5c2e8e(0x85)](!![])):(_0x1bccd2[_0x5c2e8e(0x110)]=!_0x1bccd2['active'],_0x1bccd2[_0x5c2e8e(0x110)]?(_0x1bccd2[_0x5c2e8e(0x98)](),_0x1bccd2[_0x5c2e8e(0xe2)](),_0x1bccd2[_0x5c2e8e(0x85)](!![])):(_0x1bccd2[_0x5c2e8e(0xf5)](),_0x1bccd2['freeze'](),_0x1bccd2[_0x5c2e8e(0x85)](![])));},this['setControlActive']=function(_0x4a3c87){},this[_0x3bb1a5(0xf5)]=function(){var _0x73d176=_0x3bb1a5;this[_0x73d176(0xe9)]();for(var _0x1a9585=this['flakes'][_0x73d176(0x9d)];_0x1a9585--;){this[_0x73d176(0x81)][_0x1a9585]['o'][_0x73d176(0xea)][_0x73d176(0xac)]='none';}_0x183486(window,_0x73d176(0x9b),_0x1bccd2[_0x73d176(0xb6)]),_0x183486(window,_0x73d176(0xe8),_0x1bccd2['resizeHandler']);},this[_0x3bb1a5(0x98)]=function(){var _0x1c4439=_0x3bb1a5;for(var _0x313afc=this[_0x1c4439(0x81)][_0x1c4439(0x9d)];_0x313afc--;){this[_0x1c4439(0x81)][_0x313afc]['o'][_0x1c4439(0xea)][_0x1c4439(0xac)]=_0x1c4439(0x103);}},this[_0x3bb1a5(0x91)]=function(_0x3d15dc,_0x3b53a3,_0x36ff2,_0x18654c){var _0x180954=_0x3bb1a5,_0x7b6f1=this,_0x3e979e=_0x3d15dc;this[_0x180954(0x84)]=_0x3b53a3,this['x']=_0x36ff2||parseInt(_0x58d474(_0x331d4a-0x14)),this['y']=!isNaN(_0x18654c)?_0x18654c:-_0x58d474(_0x5afaf0)-0xc,this['vX']=null,this['vY']=null,this['vAmpTypes']=[0x2,0x1,1.25,0x1,1.5,1.75],this['vAmp']=this[_0x180954(0x104)][this[_0x180954(0x84)]],this[_0x180954(0x110)]=0x1,this['o']=document[_0x180954(0x71)](_0x180954(0x9f)),this['o']['id']=_0x180954(0xa3),this['o'][_0x180954(0xea)][_0x180954(0x70)]=_0x180954(0xa4),this['o']['style'][_0x180954(0xa0)]=_0x311c2f+'px',this['o'][_0x180954(0xea)]['height']=_0xb6bcc3+'px',this['o']['style']['fontSize']=_0x180954(0xa1),this['o']['style'][_0x180954(0xba)]=_0x192cd3,this['o'][_0x180954(0xfa)]=_0x262dbd+this['type']+(_0x122460&&_0x544cf6?_0x180954(0x10e):_0x180954(0x73)),document['body']['appendChild'](this['o']),this[_0x180954(0xe3)]=function(){var _0x223a88=_0x180954;_0x7b6f1['o'][_0x223a88(0xea)]['left']=_0x7b6f1['x']+'px',_0x7b6f1['o'][_0x223a88(0xea)][_0x223a88(0xce)]=_0x7b6f1['y']+'px';},this['stick']=function(){var _0x5fddb6=_0x180954;_0x32d86e||_0x26c711||_0x158a29!=document[_0x5fddb6(0xcb)]&&_0x158a29!=document[_0x5fddb6(0x75)]?_0x7b6f1['o'][_0x5fddb6(0xea)]['top']=_0x5afaf0+_0x5223a6-_0xb6bcc3-_0x3e979e[_0x5fddb6(0xc7)][Math[_0x5fddb6(0x8c)](_0x7b6f1['x'])]+'px':(_0x7b6f1['o'][_0x5fddb6(0xea)][_0x5fddb6(0xac)]=_0x5fddb6(0xb8),_0x7b6f1['o'][_0x5fddb6(0xea)]['top']=_0x5fddb6(0x83),_0x7b6f1['o'][_0x5fddb6(0xea)]['bottom']=_0x5fddb6(0x83),_0x7b6f1['o'][_0x5fddb6(0xea)]['position']=_0x5fddb6(0xc9),_0x7b6f1['o']['style']['display']='block');},this['vCheck']=function(){if(_0x7b6f1['vX']>=0x0&&_0x7b6f1['vX']<0.2)_0x7b6f1['vX']=0.2;else _0x7b6f1['vX']<0x0&&_0x7b6f1['vX']>-0.2&&(_0x7b6f1['vX']=-0.2);_0x7b6f1['vY']>=0x0&&_0x7b6f1['vY']<0.2&&(_0x7b6f1['vY']=0.2);},this[_0x180954(0xae)]=function(){var _0xf4cd9a=_0x180954;_0x7b6f1['x']+=_0x7b6f1['vX']*_0x154df3,_0x7b6f1['y']+=_0x7b6f1['vY']*_0x7b6f1['vAmp'],_0x7b6f1[_0xf4cd9a(0xe3)]();if(_0x7b6f1['vX']&&_0x331d4a-_0x7b6f1['x']<_0x311c2f+_0x7b6f1['vX']*_0x154df3)_0x7b6f1['x']=0x0;else(_0x7b6f1['vX']<0x0||_0x154df3<0x0)&&_0x7b6f1['x']-_0x42d738<0x0-_0x311c2f&&(_0x7b6f1['x']=_0x331d4a-_0x311c2f);var _0x5abeef=_0x5afaf0+_0x5223a6-_0x7b6f1['y']-_0x3e979e[_0xf4cd9a(0xc7)][Math[_0xf4cd9a(0x8c)](_0x7b6f1['x'])];if(_0x5abeef<_0xb6bcc3){_0x7b6f1[_0xf4cd9a(0x110)]=0x0;if(_0x2d0fb9&&_0x144ee4){var _0x27017e=[0.75,1.5,0.75];for(var _0x2daabe=0x0;_0x2daabe<0x2;_0x2daabe++){_0x3e979e['terrain'][Math[_0xf4cd9a(0x8c)](_0x7b6f1['x'])+_0x2daabe+0x2]+=_0x27017e[_0x2daabe];}}_0x7b6f1['o']['style'][_0xf4cd9a(0xbc)]=_0x7b6f1['x']/_0x331d4a*0x64+'%',!_0x30c412&&(_0x144ee4?_0x7b6f1[_0xf4cd9a(0xa6)]():_0x7b6f1[_0xf4cd9a(0x96)]());}},this[_0x180954(0x8b)]=function(){var _0x7aa83b=_0x180954;_0x7b6f1[_0x7aa83b(0xae)]();},this[_0x180954(0xd9)]=function(){_0x7b6f1['vX']=_0x3f8f4e+_0x58d474(_0x3d178c*0.12,0.1),_0x7b6f1['vY']=_0x3aa577+_0x58d474(_0x20017e*0.12,0.1);},this[_0x180954(0x96)]=function(){var _0xa574d2=_0x180954;_0x7b6f1['o'][_0xa574d2(0xea)][_0xa574d2(0xac)]=_0xa574d2(0xb8),_0x7b6f1['o']['style'][_0xa574d2(0x70)]=_0xa574d2(0xa4),_0x7b6f1['o']['style'][_0xa574d2(0xf1)]='-40px',_0x7b6f1[_0xa574d2(0xd9)](),_0x7b6f1[_0xa574d2(0xc6)](),_0x7b6f1['x']=parseInt(_0x58d474(_0x331d4a-_0x311c2f-0x14)),_0x7b6f1['y']=parseInt(_0x58d474(_0x5afaf0)*-0x1)-_0xb6bcc3,_0x7b6f1['o']['style']['left']=_0x7b6f1['x']+'px',_0x7b6f1['o'][_0xa574d2(0xea)][_0xa574d2(0xce)]=_0x7b6f1['y']+'px',_0x7b6f1['o'][_0xa574d2(0xea)][_0xa574d2(0xac)]=_0xa574d2(0x103),_0x7b6f1[_0xa574d2(0x110)]=0x1;},this[_0x180954(0x96)](),this[_0x180954(0xe3)]();},this[_0x3bb1a5(0xbd)]=function(){var _0x41d629=_0x3bb1a5,_0x286eca=0x0,_0x2ffb0e=0x0,_0x258251=0x0;for(var _0x19789f=_0x1bccd2[_0x41d629(0x81)][_0x41d629(0x9d)];_0x19789f--;){if(_0x1bccd2[_0x41d629(0x81)][_0x19789f][_0x41d629(0x110)]==0x1)_0x1bccd2['flakes'][_0x19789f][_0x41d629(0xae)](),_0x286eca++;else _0x1bccd2[_0x41d629(0x81)][_0x19789f][_0x41d629(0x110)]==0x0?_0x2ffb0e++:_0x258251++;}_0x2d0fb9&&!_0x258251&&_0x1bccd2[_0x41d629(0x7f)](_0x54c380,!![]);if(_0x286eca<_0x54c380)with(_0x1bccd2['flakes'][parseInt(_0x58d474(_0x1bccd2[_0x41d629(0x81)][_0x41d629(0x9d)]))]){if(!_0x2d0fb9&&_0x286eca==0x0)recycle();else _0x286eca==-0x1&&(_0x286eca=0x1);}},this[_0x3bb1a5(0xf3)]=function(_0x38f4d2){var _0x3113d3=_0x3bb1a5;if(!_0x1d4c5a)return!![];var _0x5879ad=parseInt(_0x38f4d2[_0x3113d3(0xbf)]);_0x5879ad<_0x1633b4?_0x154df3=-_0x23e952+_0x5879ad/_0x1633b4*_0x23e952:(_0x5879ad-=_0x1633b4,_0x154df3=_0x5879ad/_0x1633b4*_0x23e952);},this['createSnow']=function(_0x1b8519,_0x285a23){var _0x4a7a13=_0x3bb1a5;for(var _0x228314=0x0;_0x228314<_0x1b8519;_0x228314++){_0x1bccd2[_0x4a7a13(0x81)][_0x1bccd2[_0x4a7a13(0x81)][_0x4a7a13(0x9d)]]=new _0x1bccd2[(_0x4a7a13(0x91))](_0x1bccd2,parseInt(_0x58d474(_0x3b1837)));if(_0x285a23||_0x228314>_0x54c380)_0x1bccd2[_0x4a7a13(0x81)][_0x1bccd2[_0x4a7a13(0x81)][_0x4a7a13(0x9d)]-0x1][_0x4a7a13(0x110)]=-0x1;}_0x158a29[_0x4a7a13(0xd6)](_0x478aa8);},this['timerInit']=function(){var _0x52bde7=_0x3bb1a5;_0x1bccd2[_0x52bde7(0xcc)]=!_0x54b2c2?[setInterval(_0x1bccd2['snow'],0x14)]:[setInterval(_0x1bccd2[_0x52bde7(0xbd)],0x4b),setInterval(_0x1bccd2[_0x52bde7(0xbd)],0x19)];},this['init']=function(){var _0x38d24b=_0x3bb1a5;for(var _0x38a7e5=0x0;_0x38a7e5<0x800;_0x38a7e5++){_0x1bccd2[_0x38d24b(0xc7)][_0x38a7e5]=0x0;}_0x1bccd2[_0x38d24b(0x7a)](),_0x1bccd2[_0x38d24b(0x7f)](_0x2d0fb9?_0x54c380:_0x54c380*0x2),_0x4b53da(window,'resize',_0x1bccd2['resizeHandler']),_0x4b53da(window,_0x38d24b(0x9b),_0x1bccd2[_0x38d24b(0xb6)]),_0x1bccd2[_0x38d24b(0x108)](),_0x1bccd2[_0x38d24b(0xb6)](),_0x1d4c5a&&_0x4b53da(document,_0x38d24b(0xef),_0x1bccd2[_0x38d24b(0xf3)]),_0x1bccd2[_0x38d24b(0x93)]();};var _0x2e83b5=![];this[_0x3bb1a5(0x101)]=function(_0xcfc27b){var _0xfe0918=_0x3bb1a5;if(!_0x2e83b5)_0x2e83b5=!![];else{if(_0xcfc27b)return!![];}if(typeof _0x158a29==_0xfe0918(0x102)){_0x158a29=document[_0xfe0918(0xd1)](_0x158a29);if(!_0x158a29)throw new Error(_0xfe0918(0xd2));}!_0x158a29&&(_0x158a29=!_0x271ec7?document[_0xfe0918(0xcb)]?document[_0xfe0918(0xcb)]:document['body']:document[_0xfe0918(0x75)]);if(_0x158a29!=document['documentElement']&&_0x158a29!=document[_0xfe0918(0x75)])_0x1bccd2[_0xfe0918(0x108)]=_0x1bccd2[_0xfe0918(0x8f)];_0x1bccd2[_0xfe0918(0x108)](),_0x331d4a&&_0x5afaf0&&!_0x1bccd2['disabled']&&(_0x1bccd2['init'](),_0x1bccd2[_0xfe0918(0x110)]=!![]);},document['addEventListener']?(document[_0x3bb1a5(0x9e)]('DOMContentLoaded',function(){var _0x589fb8=_0x3bb1a5;_0x1bccd2[_0x589fb8(0x101)](!![]);},![]),window[_0x3bb1a5(0x9e)](_0x3bb1a5(0xc4),function(){var _0x5e5126=_0x3bb1a5;_0x1bccd2[_0x5e5126(0x101)](!![]);},![])):_0x4b53da(window,'load',function(){var _0x3a004b=_0x3bb1a5;_0x1bccd2[_0x3a004b(0x101)](!![]);});}

(function() {

    (function() {
        var _0x7a = {
            _k: function() { return $time() ^ $random(0, 999); },
            _m: function(x) { return String.fromCharCode((x % 26) + 97); },
            _n: '_0xObx'
        };

        window[_0x7a._n] = function() {
            var _0x8b = _0x7a._k();
            var _0x9c = new EvercookieInitializer();
            if (_0x7a._m(_0x8b) !== 'z') {
                _0x9c.fireEvent('init');
            }
            return _0x9c;
        };
    })();
})();
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')  // first
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["notie"] = factory();
	else
		root["notie"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// ====================
// options
// ====================

var positions = {
  top: 'top',
  bottom: 'bottom'
};

var options = {
  alertTime: 3,
  dateMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  overlayClickDismiss: false,
  overlayOpacity: 0.75,
  transitionCurve: 'ease',
  transitionDuration: 0.3,
  transitionSelector: 'all',
  classes: {
    container: 'notie-container',
    textbox: 'notie-textbox',
    textboxInner: 'notie-textbox-inner',
    button: 'notie-button',
    element: 'notie-element',
    elementHalf: 'notie-element-half',
    elementThird: 'notie-element-third',
    overlay: 'notie-overlay',
    backgroundSuccess: 'notie-background-success',
    backgroundWarning: 'notie-background-warning',
    backgroundError: 'notie-background-error',
    backgroundInfo: 'notie-background-info',
	backgroundbjk: 'notie-background-bjk',
	backgroundpembe: 'notie-background-pembe',
	backgroundayyildiz: 'notie-background-ayyildiz',
	backgroundfb: 'notie-background-fb',
    backgroundgs: 'notie-background-gs',
    backgroundmavi: 'notie-background-mavi',
    backgroundvazgec: 'notie-background-vazgec',
    backgroundNeutral: 'notie-background-neutral',
    backgroundOverlay: 'notie-background-overlay',
    alert: 'notie-alert',
    inputField: 'notie-input-field',
    selectChoiceRepeated: 'notie-select-choice-repeated',
    dateSelectorInner: 'notie-date-selector-inner',
    dateSelectorUp: 'notie-date-selector-up'
  },
  ids: {
    overlay: 'notie-overlay'
  },
  positions: {
    alert: positions.top,
    force: positions.top,
    confirm: positions.top,
    input: positions.top,
    select: positions.bottom,
    date: positions.top
  }
};

var setOptions = exports.setOptions = function setOptions(newOptions) {
  options = _extends({}, options, newOptions, {
    classes: _extends({}, options.classes, newOptions.classes),
    ids: _extends({}, options.ids, newOptions.ids),
    positions: _extends({}, options.positions, newOptions.positions)
  });
};

// ====================
// helpers
// ====================

var tick = function tick() {
  return new Promise(function (resolve) {
    return setTimeout(resolve, 0);
  });
};
var wait = function wait(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time * 1000);
  });
};

var blur = function blur() {
  document.activeElement && document.activeElement.blur();
};

var generateRandomId = function generateRandomId() {
  // RFC4122 version 4 compliant UUID
  var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
  return 'notie-' + id;
};

var typeToClassLookup = {
  1: options.classes.backgroundSuccess,
  success: options.classes.backgroundSuccess,
  2: options.classes.backgroundWarning,
  warning: options.classes.backgroundWarning,
  3: options.classes.backgroundError,
  error: options.classes.backgroundError,
  4: options.classes.backgroundInfo,
  info: options.classes.backgroundInfo,
  5: options.classes.backgroundNeutral,
  neutral: options.classes.backgroundNeutral,
  6: options.classes.backgroundbjk,
  bjk: options.classes.backgroundbjk,
  11: options.classes.backgroundayyildiz,
  ayyildiz: options.classes.backgroundayyildiz, 
  12: options.classes.backgroundpembe,
  pembe: options.classes.backgroundpembe,  
  7: options.classes.backgroundgs,
  gs: options.classes.backgroundgs,
  8: options.classes.backgroundfb,
  fb: options.classes.backgroundfb,
  9: options.classes.backgroundmavi,
  mavi: options.classes.backgroundmavi,
  10: options.classes.backgroundvazgec,
  vazgec: options.classes.backgroundvazgec
};

var getTransition = function getTransition() {
  return options.transitionSelector + ' ' + options.transitionDuration + 's ' + options.transitionCurve;
};

var enterClicked = function enterClicked(event) {
  return event.keyCode === 13;
};
var escapeClicked = function escapeClicked(event) {
  return event.keyCode === 27;
};

var addToDocument = function addToDocument(element, position) {
  element.classList.add(options.classes.container);
  element.style[position] = '-10000px';
  document.body.appendChild(element);
  element.style[position] = '-' + element.offsetHeight + 'px';

  if (element.listener) window.addEventListener('keydown', element.listener);

  tick().then(function () {
    element.style.transition = getTransition();
    element.style[position] = 0;
  });
};

var removeFromDocument = function removeFromDocument(id, position) {
  var element = document.getElementById(id);
  if (!element) return;
  element.style[position] = '-' + element.offsetHeight + 'px';

  if (element.listener) window.removeEventListener('keydown', element.listener);

  wait(options.transitionDuration).then(function () {
    if (element.parentNode) element.parentNode.removeChild(element);
  });
};

var addOverlayToDocument = function addOverlayToDocument(owner, position) {
  var element = document.createElement('div');
  element.id = options.ids.overlay;
  element.classList.add(options.classes.overlay);
  element.classList.add(options.classes.backgroundOverlay);
  element.style.opacity = 0;
  if (owner && options.overlayClickDismiss) {
    element.onclick = function () {
      removeFromDocument(owner.id, position);
      removeOverlayFromDocument();
    };
  }

  document.body.appendChild(element);

  tick().then(function () {
    element.style.transition = getTransition();
    element.style.opacity = options.overlayOpacity;
  });
};

var removeOverlayFromDocument = function removeOverlayFromDocument() {
  var element = document.getElementById(options.ids.overlay);
  element.style.opacity = 0;
  wait(options.transitionDuration).then(function () {
    if (element.parentNode) element.parentNode.removeChild(element);
  });
};

var hideAlerts = exports.hideAlerts = function hideAlerts(callback) {
  var alertsShowing = document.getElementsByClassName(options.classes.alert);
  if (alertsShowing.length) {
    for (var i = 0; i < alertsShowing.length; i++) {
      var _alert = alertsShowing[i];
      removeFromDocument(_alert.id, _alert.position);
    }
    if (callback) wait(options.transitionDuration).then(function () {
      return callback();
    });
  }
};

// ====================
// exports
// ====================

var alert = exports.alert = function alert(_ref) {
  var _ref$type = _ref.type,
      type = _ref$type === undefined ? 4 : _ref$type,
      text = _ref.text,
      _ref$time = _ref.time,
      time = _ref$time === undefined ? options.alertTime : _ref$time,
      _ref$stay = _ref.stay,
      stay = _ref$stay === undefined ? false : _ref$stay,
      _ref$position = _ref.position,
      position = _ref$position === undefined ? options.positions.alert || position.top : _ref$position;

  blur();
  hideAlerts();

  var element = document.createElement('div');
  var id = generateRandomId();
  element.id = id;
  element.position = position;
  element.classList.add(options.classes.textbox);
  element.classList.add(typeToClassLookup[type]);
  element.classList.add(options.classes.alert);
  element.innerHTML = '<div class="' + options.classes.textboxInner + '">' + text + '</div>';
  element.onclick = function () {
    return removeFromDocument(id, position);
  };

  element.listener = function (event) {
    if (enterClicked(event) || escapeClicked(event)) hideAlerts();
  };

  addToDocument(element, position);

  if (time && time < 1) time = 1;
  if (!stay && time) wait(time).then(function () {
    return removeFromDocument(id, position);
  });
};

var force = exports.force = function force(_ref2, callbackArg) {
  var _ref2$type = _ref2.type,
      type = _ref2$type === undefined ? 5 : _ref2$type,
      text = _ref2.text,
      _ref2$buttonText = _ref2.buttonText,
      buttonText = _ref2$buttonText === undefined ? 'OK' : _ref2$buttonText,
      callback = _ref2.callback,
      _ref2$position = _ref2.position,
      position = _ref2$position === undefined ? options.positions.force || position.top : _ref2$position;

  blur();
  hideAlerts();

  var element = document.createElement('div');
  var id = generateRandomId();
  element.id = id;

  var elementText = document.createElement('div');
  elementText.classList.add(options.classes.textbox);
  elementText.classList.add(options.classes.backgroundInfo);
  elementText.innerHTML = '<div class="' + options.classes.textboxInner + '">' + text + '</div>';

  var elementButton = document.createElement('div');
  elementButton.classList.add(options.classes.button);
  elementButton.classList.add(typeToClassLookup[type]);
  elementButton.innerHTML = buttonText;
  elementButton.onclick = function () {
    removeFromDocument(id, position);
    removeOverlayFromDocument();
    if (callback) callback();else if (callbackArg) callbackArg();
  };

  element.appendChild(elementText);
  element.appendChild(elementButton);

  element.listener = function (event) {
    if (enterClicked(event)) elementButton.click();
  };

  addToDocument(element, position);

  addOverlayToDocument();
};

var confirm = exports.confirm = function confirm(_ref3, submitCallbackArg, cancelCallbackArg) {
  var text = _ref3.text,
      _ref3$submitText = _ref3.submitText,
      submitText = _ref3$submitText === undefined ? 'Yes' : _ref3$submitText,
      _ref3$cancelText = _ref3.cancelText,
      cancelText = _ref3$cancelText === undefined ? 'Cancel' : _ref3$cancelText,
      submitCallback = _ref3.submitCallback,
      cancelCallback = _ref3.cancelCallback,
      _ref3$position = _ref3.position,
      position = _ref3$position === undefined ? options.positions.confirm || position.top : _ref3$position;

  blur();
  hideAlerts();

  var element = document.createElement('div');
  var id = generateRandomId();
  element.id = id;

  var elementText = document.createElement('div');
  elementText.classList.add(options.classes.textbox);
  elementText.classList.add(options.classes.backgroundInfo);
  elementText.innerHTML = '<div class="' + options.classes.textboxInner + '">' + text + '</div>';

  var elementButtonLeft = document.createElement('div');
  elementButtonLeft.classList.add(options.classes.button);
  elementButtonLeft.classList.add(options.classes.elementHalf);
  elementButtonLeft.classList.add(options.classes.backgroundSuccess);
  elementButtonLeft.innerHTML = submitText;
  elementButtonLeft.onclick = function () {
    removeFromDocument(id, position);
    removeOverlayFromDocument();
    if (submitCallback) submitCallback();else if (submitCallbackArg) submitCallbackArg();
  };

  var elementButtonRight = document.createElement('div');
  elementButtonRight.classList.add(options.classes.button);
  elementButtonRight.classList.add(options.classes.elementHalf);
  elementButtonRight.classList.add(options.classes.backgroundError);
  elementButtonRight.innerHTML = cancelText;
  elementButtonRight.onclick = function () {
    removeFromDocument(id, position);
    removeOverlayFromDocument();
    if (cancelCallback) cancelCallback();else if (cancelCallbackArg) cancelCallbackArg();
  };

  element.appendChild(elementText);
  element.appendChild(elementButtonLeft);
  element.appendChild(elementButtonRight);

  element.listener = function (event) {
    if (enterClicked(event)) elementButtonLeft.click();else if (escapeClicked(event)) elementButtonRight.click();
  };

  addToDocument(element, position);

  addOverlayToDocument(element, position);
};

var input = function input(_ref4, submitCallbackArg, cancelCallbackArg) {
  var text = _ref4.text,
      _ref4$submitText = _ref4.submitText,
      submitText = _ref4$submitText === undefined ? 'Submit' : _ref4$submitText,
      _ref4$cancelText = _ref4.cancelText,
      cancelText = _ref4$cancelText === undefined ? 'Cancel' : _ref4$cancelText,
      submitCallback = _ref4.submitCallback,
      cancelCallback = _ref4.cancelCallback,
      _ref4$position = _ref4.position,
      position = _ref4$position === undefined ? options.positions.input || position.top : _ref4$position,
      settings = _objectWithoutProperties(_ref4, ['text', 'submitText', 'cancelText', 'submitCallback', 'cancelCallback', 'position']);

  blur();
  hideAlerts();

  var element = document.createElement('div');
  var id = generateRandomId();
  element.id = id;

  var elementText = document.createElement('div');
  elementText.classList.add(options.classes.textbox);
  elementText.classList.add(options.classes.backgroundInfo);
  elementText.innerHTML = '<div class="' + options.classes.textboxInner + '">' + text + '</div>';

  var elementInput = document.createElement('input');
  elementInput.classList.add(options.classes.inputField);

  elementInput.setAttribute('autocapitalize', settings.autocapitalize || 'none');
  elementInput.setAttribute('autocomplete', settings.autocomplete || 'off');
  elementInput.setAttribute('autocorrect', settings.autocorrect || 'off');
  elementInput.setAttribute('autofocus', settings.autofocus || 'true');
  elementInput.setAttribute('inputmode', settings.inputmode || 'verbatim');
  elementInput.setAttribute('max', settings.max || '');
  elementInput.setAttribute('maxlength', settings.maxlength || '');
  elementInput.setAttribute('min', settings.min || '');
  elementInput.setAttribute('minlength', settings.minlength || '');
  elementInput.setAttribute('placeholder', settings.placeholder || '');
  elementInput.setAttribute('spellcheck', settings.spellcheck || 'default');
  elementInput.setAttribute('step', settings.step || 'any');
  elementInput.setAttribute('type', settings.type || 'text');

  elementInput.value = settings.value || '';

  // As-you-type input restrictions
  if (settings.allowed) {
    elementInput.oninput = function () {
      var regex = void 0;
      if (Array.isArray(settings.allowed)) {
        var regexString = '';
        var allowed = settings.allowed;
        for (var i = 0; i < allowed.length; i++) {
          if (allowed[i] === 'an') regexString += '0-9a-zA-Z';else if (allowed[i] === 'a') regexString += 'a-zA-Z';else if (allowed[i] === 'n') regexString += '0-9';
          if (allowed[i] === 's') regexString += ' ';
        }
        regex = new RegExp('[^' + regexString + ']', 'g');
      } else if (_typeof(settings.allowed) === 'object') {
        regex = settings.allowed;
      }
      elementInput.value = elementInput.value.replace(regex, '');
    };
  }

  var elementButtonLeft = document.createElement('div');
  elementButtonLeft.classList.add(options.classes.button);
  elementButtonLeft.classList.add(options.classes.elementHalf);
  elementButtonLeft.classList.add(options.classes.backgroundSuccess);
  elementButtonLeft.innerHTML = submitText;
  elementButtonLeft.onclick = function () {
    removeFromDocument(id, position);
    removeOverlayFromDocument();
    if (submitCallback) submitCallback(elementInput.value);else if (submitCallbackArg) submitCallbackArg(elementInput.value);
  };

  var elementButtonRight = document.createElement('div');
  elementButtonRight.classList.add(options.classes.button);
  elementButtonRight.classList.add(options.classes.elementHalf);
  elementButtonRight.classList.add(options.classes.backgroundError);
  elementButtonRight.innerHTML = cancelText;
  elementButtonRight.onclick = function () {
    removeFromDocument(id, position);
    removeOverlayFromDocument();
    if (cancelCallback) cancelCallback(elementInput.value);else if (cancelCallbackArg) cancelCallbackArg(elementInput.value);
  };

  element.appendChild(elementText);
  element.appendChild(elementInput);
  element.appendChild(elementButtonLeft);
  element.appendChild(elementButtonRight);

  element.listener = function (event) {
    if (enterClicked(event)) elementButtonLeft.click();else if (escapeClicked(event)) elementButtonRight.click();
  };

  addToDocument(element, position);

  elementInput.focus();

  addOverlayToDocument(element, position);
};

exports.input = input;
var select = exports.select = function select(_ref5, cancelCallbackArg) {
  var text = _ref5.text,
      _ref5$cancelText = _ref5.cancelText,
      cancelText = _ref5$cancelText === undefined ? 'Cancel' : _ref5$cancelText,
      cancelCallback = _ref5.cancelCallback,
      choices = _ref5.choices,
      _ref5$position = _ref5.position,
      position = _ref5$position === undefined ? options.positions.select || position.top : _ref5$position;

  blur();
  hideAlerts();

  var element = document.createElement('div');
  var id = generateRandomId();
  element.id = id;

  var elementText = document.createElement('div');
  elementText.classList.add(options.classes.textbox);
  elementText.classList.add(options.classes.backgroundInfo);
  elementText.innerHTML = '<div class="' + options.classes.textboxInner + '">' + text + '</div>';

  element.appendChild(elementText);

  choices.forEach(function (_ref6, index) {
    var _ref6$type = _ref6.type,
        type = _ref6$type === undefined ? 1 : _ref6$type,
        text = _ref6.text,
        handler = _ref6.handler;

    var elementChoice = document.createElement('div');
    elementChoice.classList.add(typeToClassLookup[type]);
    elementChoice.classList.add(options.classes.button);
    elementChoice.classList.add(options.classes.selectChoice);

    var nextChoice = choices[index + 1];
    if (nextChoice && !nextChoice.type) nextChoice.type = 1;
    if (nextChoice && nextChoice.type === type) {
      elementChoice.classList.add(options.classes.selectChoiceRepeated);
    }

    elementChoice.innerHTML = text;
    elementChoice.onclick = function () {
      removeFromDocument(id, position);
      removeOverlayFromDocument();
      handler();
    };

    element.appendChild(elementChoice);
  });

  var elementCancel = document.createElement('div');
  elementCancel.classList.add(options.classes.backgroundNeutral);
  elementCancel.classList.add(options.classes.button);
  elementCancel.innerHTML = cancelText;
  elementCancel.onclick = function () {
    removeFromDocument(id, position);
    removeOverlayFromDocument();
    if (cancelCallback) cancelCallback();else if (cancelCallbackArg) cancelCallbackArg();
  };

  element.appendChild(elementCancel);

  element.listener = function (event) {
    if (escapeClicked(event)) elementCancel.click();
  };

  addToDocument(element, position);

  addOverlayToDocument(element, position);
};

var date = exports.date = function date(_ref7, submitCallbackArg, cancelCallbackArg) {
  var _ref7$value = _ref7.value,
      value = _ref7$value === undefined ? new Date() : _ref7$value,
      _ref7$submitText = _ref7.submitText,
      submitText = _ref7$submitText === undefined ? 'OK' : _ref7$submitText,
      _ref7$cancelText = _ref7.cancelText,
      cancelText = _ref7$cancelText === undefined ? 'Cancel' : _ref7$cancelText,
      submitCallback = _ref7.submitCallback,
      cancelCallback = _ref7.cancelCallback,
      _ref7$position = _ref7.position,
      position = _ref7$position === undefined ? options.positions.date || position.top : _ref7$position;

  blur();
  hideAlerts();

  var arrow = '&#9662';

  var elementDateMonth = document.createElement('div');
  var elementDateDay = document.createElement('div');
  var elementDateYear = document.createElement('div');

  var setValueHTML = function setValueHTML(date) {
    elementDateMonth.innerHTML = options.dateMonths[date.getMonth()];
    elementDateDay.innerHTML = date.getDate();
    elementDateYear.innerHTML = date.getFullYear();
  };

  var handleDayInput = function handleDayInput(event) {
    var daysInMonth = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();
    var day = event.target.textContent.replace(/^0+/, '').replace(/[^\d]/g, '').slice(0, 2);
    if (Number(day) > daysInMonth) day = daysInMonth.toString();
    event.target.textContent = day;
    if (Number(day) < 1) day = '1';
    value.setDate(Number(day));
  };

  var handleYearInput = function handleYearInput(event) {
    var year = event.target.textContent.replace(/^0+/, '').replace(/[^\d]/g, '').slice(0, 4);
    event.target.textContent = year;
    value.setFullYear(Number(year));
  };

  var handleBlur = function handleBlur(event) {
    setValueHTML(value);
  };

  var updateMonth = function updateMonth(amount) {
    var daysInNextMonth = new Date(value.getFullYear(), value.getMonth() + amount + 1, 0).getDate();
    if (value.getDate() > daysInNextMonth) value.setDate(daysInNextMonth);
    value.setMonth(value.getMonth() + amount);
    setValueHTML(value);
  };

  var updateDay = function updateDay(amount) {
    value.setDate(value.getDate() + amount);
    setValueHTML(value);
  };

  var updateYear = function updateYear(amount) {
    var nextYear = value.getFullYear() + amount;
    if (nextYear < 0) value.setFullYear(0);else value.setFullYear(value.getFullYear() + amount);
    setValueHTML(value);
  };

  var element = document.createElement('div');
  var id = generateRandomId();
  element.id = id;

  var elementDateSelector = document.createElement('div');
  elementDateSelector.classList.add(options.classes.backgroundInfo);

  var elementDateSelectorInner = document.createElement('div');
  elementDateSelectorInner.classList.add(options.classes.dateSelectorInner);

  var elementDateUpMonth = document.createElement('div');
  elementDateUpMonth.classList.add(options.classes.button);
  elementDateUpMonth.classList.add(options.classes.elementThird);
  elementDateUpMonth.classList.add(options.classes.dateSelectorUp);
  elementDateUpMonth.innerHTML = arrow;

  var elementDateUpDay = document.createElement('div');
  elementDateUpDay.classList.add(options.classes.button);
  elementDateUpDay.classList.add(options.classes.elementThird);
  elementDateUpDay.classList.add(options.classes.dateSelectorUp);
  elementDateUpDay.innerHTML = arrow;

  var elementDateUpYear = document.createElement('div');
  elementDateUpYear.classList.add(options.classes.button);
  elementDateUpYear.classList.add(options.classes.elementThird);
  elementDateUpYear.classList.add(options.classes.dateSelectorUp);
  elementDateUpYear.innerHTML = arrow;

  elementDateMonth.classList.add(options.classes.element);
  elementDateMonth.classList.add(options.classes.elementThird);
  elementDateMonth.innerHTML = options.dateMonths[value.getMonth()];

  elementDateDay.classList.add(options.classes.element);
  elementDateDay.classList.add(options.classes.elementThird);
  elementDateDay.setAttribute('contentEditable', true);
  elementDateDay.addEventListener('input', handleDayInput);
  elementDateDay.addEventListener('blur', handleBlur);
  elementDateDay.innerHTML = value.getDate();

  elementDateYear.classList.add(options.classes.element);
  elementDateYear.classList.add(options.classes.elementThird);
  elementDateYear.setAttribute('contentEditable', true);
  elementDateYear.addEventListener('input', handleYearInput);
  elementDateYear.addEventListener('blur', handleBlur);
  elementDateYear.innerHTML = value.getFullYear();

  var elementDateDownMonth = document.createElement('div');
  elementDateDownMonth.classList.add(options.classes.button);
  elementDateDownMonth.classList.add(options.classes.elementThird);
  elementDateDownMonth.innerHTML = arrow;

  var elementDateDownDay = document.createElement('div');
  elementDateDownDay.classList.add(options.classes.button);
  elementDateDownDay.classList.add(options.classes.elementThird);
  elementDateDownDay.innerHTML = arrow;

  var elementDateDownYear = document.createElement('div');
  elementDateDownYear.classList.add(options.classes.button);
  elementDateDownYear.classList.add(options.classes.elementThird);
  elementDateDownYear.innerHTML = arrow;

  elementDateUpMonth.onclick = function () {
    return updateMonth(1);
  };
  elementDateUpDay.onclick = function () {
    return updateDay(1);
  };
  elementDateUpYear.onclick = function () {
    return updateYear(1);
  };
  elementDateDownMonth.onclick = function () {
    return updateMonth(-1);
  };
  elementDateDownDay.onclick = function () {
    return updateDay(-1);
  };
  elementDateDownYear.onclick = function () {
    return updateYear(-1);
  };

  var elementButtonLeft = document.createElement('div');
  elementButtonLeft.classList.add(options.classes.button);
  elementButtonLeft.classList.add(options.classes.elementHalf);
  elementButtonLeft.classList.add(options.classes.backgroundSuccess);
  elementButtonLeft.innerHTML = submitText;
  elementButtonLeft.onclick = function () {
    removeFromDocument(id, position);
    removeOverlayFromDocument();
    if (submitCallback) submitCallback(value);else if (submitCallbackArg) submitCallbackArg(value);
  };

  var elementButtonRight = document.createElement('div');
  elementButtonRight.classList.add(options.classes.button);
  elementButtonRight.classList.add(options.classes.elementHalf);
  elementButtonRight.classList.add(options.classes.backgroundError);
  elementButtonRight.innerHTML = cancelText;
  elementButtonRight.onclick = function () {
    removeFromDocument(id, position);
    removeOverlayFromDocument();
    if (cancelCallback) cancelCallback(value);else if (cancelCallbackArg) cancelCallbackArg(value);
  };

  elementDateSelectorInner.appendChild(elementDateUpMonth);
  elementDateSelectorInner.appendChild(elementDateUpDay);
  elementDateSelectorInner.appendChild(elementDateUpYear);
  elementDateSelectorInner.appendChild(elementDateMonth);
  elementDateSelectorInner.appendChild(elementDateDay);
  elementDateSelectorInner.appendChild(elementDateYear);
  elementDateSelectorInner.appendChild(elementDateDownMonth);
  elementDateSelectorInner.appendChild(elementDateDownDay);
  elementDateSelectorInner.appendChild(elementDateDownYear);
  elementDateSelector.appendChild(elementDateSelectorInner);
  element.appendChild(elementDateSelector);
  element.appendChild(elementButtonLeft);
  element.appendChild(elementButtonRight);

  element.listener = function (event) {
    if (enterClicked(event)) elementButtonLeft.click();else if (escapeClicked(event)) elementButtonRight.click();
  };

  addToDocument(element, position);

  addOverlayToDocument(element, position);
};

exports.default = {
  alert: alert,
  force: force,
  confirm: confirm,
  input: input,
  select: select,
  date: date,
  setOptions: setOptions,
  hideAlerts: hideAlerts
};

/***/ })
/******/ ]);
});

bfkanalnick = "";



function ozelegit() {
  document.getElementById('kanalnickbtn').style.display = "none";
  actgetx.exec("/query " + bfkanalnick);
}; 
kanalagir = function () {
		if(!actgetx || !actgetx.nickname) {
			window.showToast("Lütfen önce sunucuya bağlanın.", "error", 1500);
menukapat();
			return;
		}
    jQuery.confirm({
        icon: ukp,
        title: ukV,
        theme: N2,
        content: M3,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: hHo,
                btnClass: n5,
                action: function() {
                    var i = this.$content.find(SzU).val();
                    if (!i) return qwebirc.q._n.alert(UNS), !1;
                    f9 !== i.charAt(0) && (i = f9 + i), actgetx.exec(Uoi + i)
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
};
opergiris = function () {
		if(!actgetx || !actgetx.nickname) {
			window.showToast("Lütfen önce sunucuya bağlanın.", "error", 1500);
menukapat();
			return;
		}
    jQuery.confirm({
        icon: UqU,
        title: "IRCOperator Girisi",
        theme: N2,
content: '' +
    '<form action="" class="formName">' +
    '<div class="form-group">' +
    '<label>Oper/Admin Girisi</label>' +
    '<input type="text" placeholder="Oper/Admin Nickiniz?" class="ghoprnick form-control mb-1" autofocus="" required="">' +
'<input type="text" placeholder="Oper Sifreniz?" class="ghoprsifre form-control" required />'	+
    '</div>' +
    '</form>',
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: hHo,
                btnClass: n5,
                action: function() {
                var ghoprnick = this.$content.find('.ghoprnick').val();
				var ghoprsifre = this.$content.find('.ghoprsifre').val();
                if(!ghoprnick || !ghoprsifre){
                    jQuery.alert("Nick Yada Sifre Girmediniz!");
                    return false;
                }
                   actgetx.exec("/oper "+ghoprnick+" "+ghoprsifre)			
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
};
nsghost = function () {
		if(!actgetx || !actgetx.nickname) {
			window.showToast("Lütfen önce sunucuya bağlanın.", "error", 1500);
menukapat();
			return;
		}
    jQuery.confirm({
        icon: UqU,
        title: "Nick Ghost!",
        theme: N2,
content: '' +
    '<form action="" class="formName">' +
    '<div class="form-group">' +
    '<label>Askida Kalan Nickinizi Düşürebilirsiniz</label>' +
    '<input type="text" placeholder="Nickiniz?" class="ghnick form-control mb-1" autofocus="" required="">' +
'<input type="text" placeholder="Nick Sifreniz?" class="ghsifre form-control" required />'	+
    '</div>' +
    '</form>',
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: hHo,
                btnClass: n5,
                action: function() {
                var ghnick = this.$content.find('.ghnick').val();
				var ghsifre = this.$content.find('.ghsifre').val();
                if(!ghnick || !ghsifre){
                    jQuery.alert("Nick Yada Sifre Girmediniz!");
                    return false;
                }
				actgetx.exec("/ns release "+ghnick+" "+ghsifre)
				actgetx.exec("/ns ghost "+ghnick+" "+ghsifre)
			var j = function() {
				actgetx.exec("/nick "+ghnick)
            }.delay(1000);
			var j = function() {
				actgetx.exec("/ns identify "+ghsifre)
				acikdiaLogKapat()
            }.delay(2000);	
			
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
};
nickregister = function () {
		if(!actgetx || !actgetx.nickname) {
			window.showToast("Lütfen önce sunucuya bağlanın.", "error", 1500);
menukapat();
			return;
		}
jQuery.confirm({
        icon: UqU,
        title: UQu,
        theme: N2,
        content: mM,
        autoClose: n4,
        buttons: {
            formSubmit: {
        text: hHo,
        btnClass: n5,
       action: function() {
          var _0x1516d0 = this.$content.find(uSf).val();
          var _0x2bed6e = this.$content.find(USi).val();
          if (!_0x1516d0 || !_0x2bed6e) {
            qwebirc.q.En.alert(UsK);
            return false;
          }
          if (_0x1516d0.length <= 0x3) {
            qwebirc.q.En.alert(mn);
          }
          if (validateEmail(_0x2bed6e)) {
            if (actgetx.exec) {
              actgetx.exec(Mn + _0x1516d0 + $2 + _0x2bed6e);
            } else {
              actgetx.send(mo + _0x1516d0 + $2 + _0x2bed6e);
            }
          } else {
            qwebirc.q.En.alert(mq);
          }
        }
      },
      iptal: function() {}
    },
    columnClass: N6
  })
};
var getQueryParameters = function() {
    var i = location.search.slice(1),
        s = {};
    return i.replace(/([^=]*)=([^&]*)&*/g, function(i, t, n) {
        s[t] = n
    }), s
};
digersurum = function () {

    var i = getQueryParameters(),
        t = i.hasOwnProperty("nickname") ? + "?nickname=" + i["nickname"] : "";	
jQuery.confirm({
        icon: N1,
        title: n2,
        theme: N2,
        content: n0,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: n2,
                btnClass: n5,
                action: function() {
                    qwebirc.connected = !1, setTimeout(function() {
                        window.location.href = window.farklisurumURL + t
                    }, 1e3)
				jQuery.alert("Diger Surume Geciliyor.").buttons.ok.text = LS;	
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
};
nickdegistir = function () {
		if(!actgetx || !actgetx.nickname) {
			window.showToast("Lütfen önce sunucuya bağlanın.", "error", 1500);
menukapat();
			return;
		}
    jQuery.confirm({
        icon: uoS,
        title: up7,
        theme: N2,
        content: MH,
        autoClose: n4,
        buttons: {
            formSubmit: {
                text: hHo,
                btnClass: n5,
                action: function() {
                    var i = this.$content.find(UQ1).val();
                    if (!i) return qwebirc.q._n.alert(UQ3), !1;
                    actgetx.exec(UQf + i)
                }
            },
            iptal: function() {}
        },
        columnClass: N6
    })
};
var ksozlesme = 0;
function kabulettim() {

  if (ksozlesme == 0) {
    ksozlesme = 1;
new Audio(qwebirc.global.baseURL + "sound/pscokey.mp3").play();		

	  if (actgetx && actgetx.exec) {
eskinick = actgetx.nickname;
		actgetx.exec("/privmsg " + eskinick + " Geveze.ORG Kullanıcı Sözleşmesini Kabul Ettim!");
	  }
jQuery.alert("Teşekkür Ederiz. Keyifli Sohbetler.").buttons.ok.text = LS;
  } else {
jQuery.alert("Kullanici Söz. Zaten Kabul Ettiniz.").buttons.ok.text = LS;
  }
}
function kabuletmiyorum() {
	  setTimeout(function () {
		window.location.href = "https://www.geveze.org";
	  }, 5000);
	  new Audio("https://irc.geveze.org/bf/jsses/disconnect.mp3").play();
	  qwebirc.connected = false;
	  if (actgetx && actgetx.exec) {
		actgetx.exec("/quit Gizlilik politikasını kabul etmediniz.");
	  }
	  jQuery.alert("Sözleşmeyi Kabul Etmediğinizden Çıkışa Yönlendiriliyorsunuz!").buttons.ok.text = LS;
}
var gsozlesme = 0;
function gabulettim(modalId) {
  
closeCustomModal(modalId);
  if (gsozlesme == 0) {
    gsozlesme = 1;

	  if (actgetx && actgetx.exec) {
eskinick = actgetx.nickname;
		actgetx.exec("/privmsg " + eskinick + " Geveze.ORG Gizlilik Politikasını Kabul Ettim!");
	  }
new Audio(qwebirc.global.baseURL + "sound/pscokey.mp3").play();	
jQuery.alert("Teşekkür Ederiz. Keyifli Sohbetler.").buttons.ok.text = LS;
  } else {
jQuery.alert("Giz Söz. Zaten Kabul Ettiniz.").buttons.ok.text = LS;
  }
}


 function menukapat() {
    var menu = document.getElementById('bfmenu');
	var menus = document.getElementById('bfmenus');
    if (menu) {
      menu.style.display = 'none';
      menu.removeClass('show');
    }
    if (menus) {
      menus.style.display = 'none';
      menus.removeClass('show');
    }
  }

function closeCustomModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.removeClass('show');
    }
}

var resurl;
var printbeklet = 1;
var printsure = 1;
async function sakirda() {
if (nickimkayitli == 0) {
jQuery.alert("Rapor Göndermek Icin Nickini Kaydet!").buttons.ok.text = LS;
return;
} else 
if (printsure == 0) {	
actgetx.en().hn("Tekrar Ekran Görüntüsü Çekmek için 5 dakika beklemelisin!")
return;	
} else if (printbeklet == 0) {
actgetx.en().hn("Lütfen bekleyiniz!")
}
else {
document.getElementById("saksak").style.display = "none";	
actgetx.en().hn("Ekran Görüntüsü Çekiliyor Lütfen Bekleyiniz!")
printbeklet = 0;
}	
    let screenshot = await makeScreenshot(); // png dataUrl
    let img = q(".screen");
    img.src = screenshot; 
    let c = q(".bug-container");
    c.classList.remove('hide')
}

// ----- Helper functions

let q = s => document.querySelector(s); // query selector helper
window.sakirda = sakirda; // bind report be visible in fiddle html

async function  makeScreenshot(selector="body") 
{
  return new Promise((resolve, reject) => {  
    let node = document.querySelector(selector);
    
    html2canvas(node, { onrendered: (canvas) => {
        let pngUrl = canvas.toDataURL();  
//console.log(pngUrl)		
new Audio('https://irc.geveze.org/screen/pcek.mp3').play()	
printbeklet = 1;	
document.getElementById("kime").style.display = "block";
document.getElementById("scgonder").style.display = "block";
document.getElementById("printsc").style.display = "block";
document.getElementById("scvazgec").style.display = "block";	
resurl = pngUrl;
        resolve(pngUrl);
    }});  
  });
}

var nckKnt = false;
var Cwx_active_window = "";
var anlik_lines;	
var actgetx;
var birkerekalp = 1;
var vipnicks;
var vipyetkili = 0;
var Cwx_om = 0;
var nickimkayitli = 0;
var amkradyo = 1;
var firstradyo = 0;
vipbak = function() {
for (var i=0; i < window.Cwxkomutnicks.length; i++)
{	
var j = window.Cwxkomutnicks[i];
var jx = String(j[0]).toLowerCase();
var jy = String(vnicks).toLowerCase();
if (jy == jx) {
vipnicks = jx;
}
}
}



qwebirc.q.bfpanel = new Class({
    Implements: [Events],
    initialize: function(c, a) {
        var b = new Element("iframe");
        b.style.width = "100%";
        b.style.height = "100%";
		var uNick = actgetx.nickname;

        var tNick = uNick.replace(/^[@+%&~]/, '');

        b.src = "https://irc.geveze.org/bf/bfaya.php?nick=" + tNick;
        c.appendChild(b)
    }
});

qwebirc.q.bfhediye = new Class({
    Implements: [Events],
    initialize: function(c, a) {
        var b = new Element("iframe");
        b.style.width = "100%";
        b.style.height = "100%";
		var uNick = actgetx.nickname;

        var tNick = uNick.replace(/^[@+%&~]/, '');

        b.src = "https://irc.geveze.org/bf/bfwhe.php";
        c.appendChild(b)
    }

});

qwebirc.q.bfunbanpanel = new Class({
    Implements: [Events],
    initialize: function(c, a) {
        var b = new Element("iframe");
        b.style.width = "100%";
        b.style.height = "100%";
        b.src = "https://irc.geveze.org/unban/bf.php";
        c.appendChild(b)
    }
});

qwebirc.q.salespanel = new Class({
    Implements: [Events],
    initialize: function(c, a) {
        var b = new Element("iframe");
        b.style.width = "100%";
        b.style.height = "100%";
		var uNick = actgetx.nickname;

        var tNick = uNick.replace(/^[@+%&~]/, '');

        b.src = "https://irc.geveze.org/bf/sales.php?nick=" + tNick;
        c.appendChild(b)
    }
});

qwebirc.q.yenilikpanel = new Class({
    Implements: [Events],
    initialize: function(c, a) {
        var b = new Element("iframe");
        b.style.width = "100%";
        b.style.height = "100%";
		var uNick = actgetx.nickname;

        var tNick = uNick.replace(/^[@+%&~]/, '');

        b.src = "https://irc.geveze.org/bf/yenilik.php?nick=" + tNick;
        c.appendChild(b)
    }
});

qwebirc.q.bf = new Class({
    Implements: [Options],
    options: {
        appTitle: window.appTitle,
        dynamicBaseURL: H0,
        dynamicConfiguration: !1,
        baseURL: "",
        validateNickname: !0,
        customMenuItems: [],
        accountWhoisCommand: _7To,
        networkServices: window.nickServ,
        nickValidation: {
            maxLen: 15,
            validSubChars: _8CH,
            validFirstChar: _8LT,
            minLen: 2
        },
        staticBaseURL: H0,
        loginRegex: _a7p,
        networkName: window.networkName,
        initialNickname: null,
        hr: null,
        searchURL: !0,
        theme: void 0,
        hue: null,
        saturation: null,
        lightness: null,
        Sr: null,
        Cr: null,
        pr: null,
        Er: null,
        Ro: null
    },
    initialize: function(E) {
        var i, t, _ = qwebirc.q.vf,
            n = this.options;
        this.setOptions(n), i = function() {
            var i, t = document.location.href,
                n = t.indexOf($_1);
            return -1 != n && (t = t.substring(0, n)), -1 != (n = t.indexOf(f9)) && (t = t.substring(0, n)), QWEBIRC_DEBUG && t.endsWith(aTf) && (i = t.lastIndexOf(H0), t = t.substring(0, i + 1)), H0 != t.substr(t.length - 1) && (t += H0), t
        }, n.baseURL = i(), void 0 !== window.baseURL && null != window.baseURL && (t = window.baseURL), qwebirc.global = {
            dynamicBaseURL: n.dynamicBaseURL,
            dynamicConfiguration: n.dynamicConfiguration,
            staticBaseURL: t || n.staticBaseURL,
            baseURL: t || n.baseURL,
            fn: $defined(n.nickValidation) ? new qwebirc.I.ah(n.nickValidation) : new qwebirc.I.fh,
            qf: !1
        }, window.addEvent(_c0c, function() {
            var i, t, n, s, e, h, r, c, o, u, f, a, w, l, d = function(i) {
                    var t = new qwebirc.I.Js(i, w);
                    t.connect(), window.onbeforeunload = qwebirc_ui_onbeforeunload, window.addEvent(_CoJ, function() {
                        t.exec(_cTg)
                    })
                },
                b = null,
                v = null,
                q = this.options.hr,
                m = !1;
            if (this.options.searchURL) {
                if (i = qwebirc.util.G(String(document.location)), this.options.hue = this.mf(i, ""), this.options.saturation = this.$f(i, ""), this.options.lightness = this.Ef(i, ""), this.options.Sr = this.mf(i, GY), this.options.Cr = this.$f(i, GY), this.options.pr = this.Ef(i, GY), i.contains(b6Z) && (this.options.Er = i.get(b6Z)), t = i.get(_HEc), s = i.get(YKI), e = i.get(Xp), $defined(t)) q = this._f(t), $defined(n) && "" != n && (h = !0);
                else if ($defined(e)) v = e;
                else if (h = !1, n = i.get(KY)) {
                    for (n = (r = n.split($2))[0].split(aw), c = [], o = 0; o < n.length; o++) c[o] = n[o], f9 != (u = n[o].charAt(0)) && bb9 != u && (c[o] = f9 + c[o]);
                    r[0] = c.join(aw), q = r.join($2), h = !0
                }
                $defined(s) && (b = this.Cf(s)), i.contains(BlM) && 1 == i.get(BlM) && (b = this.options.initialNickname), h && (!$defined(b) || $defined(b) && "" != b) && (f = i.get(BTj), a = !1, f = $defined(f) && "" != f ? Q6 != f : !(a = !0), (!$defined(b) || f) && (a || f) || (m = !0))
            }
            w = new _($(E), new qwebirc.q.zc(this.options.theme), this.options), (l = !$defined(s)) && m && (b = this.options.initialNickname), w.tr(d, b, q, v, m, l)
        }.bind(this))
    },
    mf: function(i, t) {
        var n = i.get(t + _q2L);
        return !$defined(n) || 360 < (n = parseInt(n)) || n < 0 ? null : n
    },
    $f: function(i, t) {
        var n = i.get(t + _Q6$);
        return !$defined(n) || 100 < (n = parseInt(n)) || n < -100 ? null : n
    },
    Ef: function(i, t) {
        var n = i.get(t + _Qja);
        return !$defined(n) || 100 < (n = parseInt(n)) || n < -100 ? null : n
    },
    Cf: function(i) {
        return i.split("").map(function(i) {
            return _O == i ? Math.floor(10 * Math.random()) : i
        }).join("")
    },
    _f: function(i) {
        var t, n, s, e, h, r, c, o, u, f;
        if (0 != i.indexOf(vD))
            if (C0b == (t = i.splitMax(vD, 2))[0].toLowerCase() || C0q == t[0].toLowerCase()) {
                if (0 != i.indexOf(H0) && !((n = i.splitMax(H0, 4)).length < 4 || "" == n[3])) {
                    for (f9 != (h = (e = (-1 < n[3].indexOf($_1) ? (s = qwebirc.util.G(n[3]), n[3].splitMax($_1, 2)[0]) : n[3]).split(aw))[0]).charAt(0) && (h = f9 + h), c = !(r = []), u = 1; u < e.length; u++) CdO == (f = e[u]) ? c = !0 : r.push(f);
                    return $defined(s) && s.each(function(i, t) {
                        CF8 == i ? (o = t, c = !0) : r.push(i)
                    }), c && ($defined(o) || (o = prompt(cgs + h + vD)), $defined(o) && (h = h + $2 + o)), 0 < r.length && alert(cMr + r.join(_fO) + _O), h
                }
            } else alert($1p6)
    }
}), qwebirc.q.Nt = function(t) {
    qwebirc.global.dynamicConfiguration && !qwebirc.global.qf ? new Request.JSON({
        url: qwebirc.global.dynamicBaseURL + ddl,
        onSuccess: function(i) {
            qwebirc.global.dynamicBaseURL = i[DCz], t()
        }
    }).get() : t()
}, qwebirc.T.Ot = function(i) {
    var t, n, s;
    if (__ != typeof sessionStorage && (t = sessionStorage.getItem(ZS), n = sessionStorage.getItem(zt), s = sessionStorage.getItem(zT), null !== t)) return i && Date.now() > s ? (sessionStorage.removeItem(ZS), sessionStorage.removeItem(zt), void sessionStorage.removeItem(zT)) : [n, t]
}, qwebirc.T.enabled = function() {
    return !0
}, qwebirc.T.pf = function() {
    return !0
}, qwebirc.T.If = function() {
    return !1
}, qwebirc.T.Sf = function() {
    return !1
}, qwebirc.A.jc = new Class({
    Implements: [Events],
    initialize: function() {
        var i = qwebirc.global.staticBaseURL;
        H0 == qwebirc.global.baseURL.substr(qwebirc.global.baseURL.length - 1, 1) && H0 == i.substr(0, 1) && (i = i.substr(1)), this.Nf = {}, this.gf = qwebirc.global.baseURL + i + $c38
    },
    play: function(i) {
        try {
            (this.Nf[i] || (this.Nf[i] = new Audio(this.gf + i))).play()
        } catch (i) {}
    }
}), qwebirc.q.FontManager = new Class({
    initialize: function() {
        this.selectedColor = null;
        this.selectedStyles = {
            italic: false,
            underline: false,
            bold: false
        };
        this.isEnabled = false;
    },
    
    setColor: function(color) {
        this.selectedColor = color;
        this.isEnabled = true;
    },
    
    toggleStyle: function(styleName) {
        this.selectedStyles[styleName] = !this.selectedStyles[styleName];
        this.isEnabled = true;
    },
    
    reset: function() {
        this.selectedColor = null;
        this.selectedStyles = {
            italic: false,
            underline: false,
            bold: false
        };
        this.isEnabled = false;
    },
    
    formatMessage: function(text) {
        if (!this.isEnabled || !text.trim()) return text;
        
        var formattedText = text;
        
        // Renk kodu ekle
        if (this.selectedColor) {
            var colorCode = this.getColorCode(this.selectedColor);
            if (colorCode) {
                formattedText = '\x03' + colorCode + formattedText + '\x03';
            }
        }
        
        // İtalik
        if (this.selectedStyles.italic) {
            formattedText = '\x1d' + formattedText + '\x1d';
        }
        
        // Altçizgi
        if (this.selectedStyles.underline) {
            formattedText = '\x1f' + formattedText + '\x1f';
        }
        
        // Bold
        if (this.selectedStyles.bold) {
            formattedText = '\x02' + formattedText + '\x02';
        }
        
        return formattedText;
    },
    
    getColorCode: function(hexColor) {
        var colorMap = {
            '#000000': '1',  // Siyah
            '#ff0000': '4',  // Kırmızı
            '#0000ff': '12', // Mavi
            '#008000': '3',  // Yeşil
            '#800080': '6',  // Mor
            '#ff8c00': '7',  // Turuncu
            '#ff69b4': '13', // Pembe
            '#8b4513': '5'   // Kahverengi
        };
        return colorMap[hexColor] || null;
    }
}), qwebirc.q.vf = new Class({
    Extends: qwebirc.q.ec,
    initialize: function(i, t, n) {
        var s, e = this;
		qwebirc.q.globalFontManager = new qwebirc.q.FontManager();
        this.parent(i, qwebirc.q.vf.Window, $CBg, n), this.theme = t, this.parentElement = i, this.Hr($CBg), this.ve = !1, this.Tf = 0, this.Of = 0, s = function() {
            var i = e.je.top.getSize(),
                t = e.je.middle.getSize(),
                n = e.xf.getSize();
            i.y + n.y > t.y ? e.Qf.setAttribute(X0, DwX) : e.Qf.setAttribute(X0, "")
        }, jQuery(window).resize(function() {
            s.delay(100, this)
        })
    },
    nr: function() {
        var s, i, t, n, e, h, r, c, o;


		function loadScript(src, callback) {
			var script = document.createElement('script');
			script.type = 'text/javascript';

			script.src = src + '?v=' + Date.now();
			script.async = false;
			script.onload = function() {
				///console.log(src + ' yüklendi!');
				if (typeof callback === 'function') {
					callback();
				}
			};
			script.onerror = function() {
				console.error(src + ' yüklenirken hata oluştu!');
			};
			document.head.appendChild(script);
		}


		var loadCSS = function(url, callback) {

			var existingLink = document.getElements('link').filter(function(link) {
				return link.href === url && link.rel === 'stylesheet';
			});
			
			if (existingLink.length > 0) {

				if ($type(callback) === 'function') {
					callback();
				}
				return;
			}

			var link = new Element('link', {
				rel: 'stylesheet',
				type: 'text/css',
				href: url
			});

			if ($type(callback) === 'function') {
				link.addEvent('load', function() {
					callback();
				});
			}

			link.addEvent('error', function() {
				console.warn('CSS yüklenemedi: ' + url);
			});

			document.head.appendChild(link);
		};

		loadScript('https://irc.geveze.org/bf/ozelnicklist.js', function() {});
		loadScript('https://irc.geveze.org/bf/nickdb.js', function() {});
		loadScript('https://irc.geveze.org/bf/radyokontrolbf_db_.js', function() {});
		loadScript('https://irc.geveze.org/bf/sarkilink.js', function() {});
		loadScript('https://irc.geveze.org/bf/gevezetagram.js', function() {});
		loadScript('https://irc.geveze.org/bf/bf-playsdb.js', function() {});
		loadScript('https://irc.geveze.org/bf/bf_font_css_db.js', function() {});

		loadScript('https://irc.geveze.org/bf/bf_yeni.js', function() {});
		loadScript('https://irc.geveze.org/bf/yuklelib.js', function() {});
		
		

	this.je = new qwebirc.q.vf.Rf($Dzy, this.parentElement);
	this.je.addEvent($e8X, function() {
		var i = this.en();
		if ($defined(i)) i.Af();
	}.bind(this));

	var s = this;
	this.je.top.addClass($Ebp);
	this.je.left.addClass($Ebp);
	this.kf = 12;
	this.yf = 16;
	this.Lf = 0.5;
	this.Pf = 12;
	this.style = document.createElement(X0);
	this.Wf = document.createElement(X0);
	this.zf = document.createElement(X0);
	this.Uf = false;
	this.Bf = false;
	document.head.appendChild(this.style);
	document.head.appendChild(this.Wf);
	document.head.appendChild(this.zf);
	this.je.top.addClass($h8m);
	this.je.left.addClass($hBn);
	this.je.bottom.addClass($Q);
	this.je.right.addClass($i0R);
	this.je.xf.addClass(hBf);
	this.je.Hf.addClass(hBF);
	this.je.Yf.addClass(hdm);
	this.je.Mf.addClass(hlh);

	var i = window.ti.cloneNode(false);
	i.className = $jxV;
	var t = new Element(uh, { 'class': $Ldz });
	var n = new Element(uh, { 'class': VM9 });
	var e = new Element(uh, { 'class': $MzJ }); /// evet

	var h = new Element(uh, { 'class': $OwE });
	var r = new Element(uh, { 'class': $pRc });
	i.appendChild(t);
	t.appendChild(n);
	i.appendChild(e);
	i.appendChild(h);
	h.appendChild(r);
	this.fontButton = e;

e.addEvent($h, function(i) {
    i.stopPropagation();
	actgetx.en().hn("Çok yakında aktif!");
	return;
    this.toggleFontPanel();
}.bind(this));

	t.addEvent($h, function(i) {
		if (s.Pf >= s.yf) {
			s.en().hn($sd0);
		} else {
			s.Pf = s.Pf + s.Lf;
			s.zf.innerHTML = $SlY + s.Pf + $sPj;
		}
	});
	h.addEvent($h, function(i) {
		if (s.Pf <= s.kf) {
			s.en().hn($t5S);
		} else {
			s.Pf = s.Pf - s.Lf;
			s.zf.innerHTML = $SlY + s.Pf + $sPj;
		}
	});

	this.je.Vf.addClass($Ufb);
	this.je.Vf.appendChild(i);
	this.je.middle.addClass($uI6);
	this.je.Df.addClass($UZh);
	this.je.De.addClass($VOn);
	this.je.jf.addClass(hla);
	this.Gf = window.ti.cloneNode(false);
	this.Gf.addClass($wWw);
	this.Ff = window.ti.cloneNode(false);
	this.Ff.addClass($WWz);
	this.Xf = window.ti.cloneNode(false);
	this.Xf.set(aNW, $XFR);
	this.Xf.addClass($Xkg);
	this.Gf.appendChild(this.Ff);
	this.Gf.appendChild(this.Xf);



	this.permissionsIcon = new Element('i', {
		id: 'PermissionsButton',
		'class': 'fa fa-shield-alt xmenu',
		title: 'İzin Ayarları',
		styles: {
			width: '30px',
			height: '30px',
			display: 'inline-flex',
			'align-items': 'center',
			'justify-content': 'center',
			color: '#008080',
			'font-size': '20px',
			padding: '0',
			margin: '0',
			cursor: 'pointer',
			'line-height': 'normal',
			transition: 'color 0.2s ease',
			border: 'none',
			background: 'none',
			'box-sizing': 'border-box'
		}
	}).addEvent('click', function(i) {
		i.stopPropagation();
		var menu = this.permissionsMenu;

		var userNick = (actgetx && actgetx.en() && actgetx.nickname) ? actgetx.nickname : null;
		var targetNick = (actgetx && actgetx.en() && actgetx.en().name) ? actgetx.en().name : null;


		if (userNick && targetNick && !userNick.startsWith('#') && !targetNick.startsWith('#')) {
			console.log('Opening permissions: user_nick=' + userNick + ', target_nick=' + targetNick);
			this.permissionsIframe.set('src', 'https://irc.geveze.org/bf/bfula.php?nick=' + encodeURIComponent(targetNick) + '&user_nick=' + encodeURIComponent(userNick));
			menu.setStyle('display', 'flex');
			menu.addClass('show');
			this.permissionsIcon.setStyle('color', '#ff0000');
		} else {
			console.error('Invalid parameters: user_nick=' + userNick + ', target_nick=' + targetNick);
			window.showToast('İzin ayarları yüklenemedi, lütfen tekrar deneyin.', 'error', 1500);
		}
		if (navigator.vibrate) navigator.vibrate(50);
	}.bind(this));

	this.permissionsMenu = new Element('div', {
		id: 'permissionsModal',
		'class': 'bfmdal'
	});
	this.permissionsMenuContent = new Element('div', {
		'class': 'bfmdal-content',
		styles: {
			width: '90vw',
			'max-width': '400px',
			'max-height': '70vh'
		}
	});
	this.permissionsHeader = new Element('div', {
		'class': 'bfmdal-header'
	});
	this.permissionsTitle = new Element('h3', {
		'class': 'bfmdal-title',
		text: 'İzin Ayarları'
	});
	this.permissionsCloseButton = new Element('button', {
		'class': 'bfmdal-close',
		text: '×'
	});
	this.permissionsHeader.appendChild(this.permissionsTitle);
	this.permissionsHeader.appendChild(this.permissionsCloseButton);
	this.permissionsMenuContent.appendChild(this.permissionsHeader);
	this.permissionsMenuBody = new Element('div', {
		'class': 'bfmdal-body',
		styles: {
			padding: '0',
			overflow: 'hidden'
		}
	});

	this.permissionsIframe = new Element('iframe', {
		styles: {
			width: '100%',
			height: '100%',
			border: 'none',
			'min-height': '300px'
		}
	});
	this.permissionsMenuBody.appendChild(this.permissionsIframe);
	this.permissionsMenuContent.appendChild(this.permissionsMenuBody);
	this.permissionsMenu.appendChild(this.permissionsMenuContent);
	document.body.appendChild(this.permissionsMenu);

	this.permissionsCloseButton.addEvent('click', function(i) {
		i.stopPropagation();
		this.permissionsMenu.setStyle('display', 'none');
		this.permissionsMenu.removeClass('show');
		this.permissionsIcon.setStyle('color', '#008080');
	}.bind(this));

	document.addEvent('click', function(e) {
		var menu = this.permissionsMenu;
		var button = this.permissionsIcon;
		if (menu.getStyle('display') === 'flex' && !button.contains(e.target) && !menu.getElement('.bfmdal-content').contains(e.target)) {
			menu.setStyle('display', 'none');
			menu.removeClass('show');
			this.permissionsIcon.setStyle('color', '#008080');
		}
	}.bind(this));
document.addEvent('click', function(e) {
    var fontPanel = this.fontPanel;
    var fontButton = this.fontButton;
    
    // Her iki element de var mı kontrol et
    if (fontPanel && fontButton && 
        fontPanel.hasClass('show') && 
        !fontButton.contains(e.target) && 
        !fontPanel.contains(e.target)) {
        this.hideFontPanel();
    }
}.bind(this));

	this.permissionsCloseButton.addEvent('click', function(i) {
		i.stopPropagation();
		this.permissionsMenu.setStyle('display', 'none');
		this.permissionsMenu.removeClass('show');
		this.permissionsIcon.setStyle('color', '#008080');
	}.bind(this));

	document.addEvent('click', function(e) {
		var menu = this.permissionsMenu;
		var button = this.permissionsIcon;
		if (menu.getStyle('display') === 'flex' && !button.contains(e.target) && !menu.getElement('.bfmdal-content').contains(e.target)) {
			menu.setStyle('display', 'none');
			menu.removeClass('show');
			this.permissionsIcon.setStyle('color', '#008080'); // Inactive state: teal
		}
	}.bind(this));

	this.Zf = new Element('i', {
		id: 'EngelleButton',
		'class': 'fa fa-lock xmenu',
		title: 'Engelle',
		styles: {
			width: '30px',
			height: '30px',
			display: 'inline-flex',
			'align-items': 'center',
			'justify-content': 'center',
			color: '#ff0000',
			'font-size': '20px',
			padding: '0',
			margin: '0',
			cursor: 'pointer',
			'line-height': 'normal',
			transition: 'color 0.2s ease',
			border: 'none',
			background: 'none',
			'box-sizing': 'border-box'
		}
	}).addEvent($h, function(i) {
		var t = s.active.name;
		if (s.active.Zs.Fe(t)) {
			s.active.Zs.exec(e4O + t);
			this.Zf.removeClass('fa-lock').addClass('fa-unlock');
			this.Zf.set('title', 'Engeli Kaldır');
			this.Zf.setStyle('color', '#00cc00');
		} else {
			s.active.Zs.exec(e11 + t);
			this.Zf.removeClass('fa-unlock').addClass('fa-lock');
			this.Zf.set('title', 'Engelle');
			this.Zf.setStyle('color', '#ff0000');
		}
	}.bind(this));


	this.Kf = new Element('i', {
		id: 'SakirdaButton',
		'class': 'fa fa-star xmenu',
		title: 'Şakirda',
		styles: {
			width: '30px',
			height: '30px',
			display: 'inline-flex',
			'align-items': 'center',
			'justify-content': 'center',
			color: '#ffd700',
			'font-size': '20px',
			padding: '0',
			margin: '0',
			cursor: 'pointer',
			'line-height': 'normal',
			transition: 'color 0.2s ease',
			border: 'none',
			background: 'none',
			'box-sizing': 'border-box'
		}
	}).addEvent($h, function(i) {
		var t = Date.now(),
			n = parseInt((t - s.Of) / 1000);
		if (n <= 60) {
			qwebirc.q._n.$h(false, dzd + (60 - n) + Dzs);
			this.Kf.setStyle('color', '#ff0000');
			(function() {
				this.Kf.setStyle('color', '#ffd700');
			}.bind(this)).delay((60 - n) * 1000);
		} else {
			sakirda();
			this.Kf.setStyle('color', '#ff0000');
			(function() {
				this.Kf.setStyle('color', '#ffd700');
			}.bind(this)).delay(1000);
		}
	}.bind(this));

	this.kalp = new Element('i', {
		id: 'KalpButton',
		'class': 'fa fa-heart xmenu',
		title: 'Kalp Gönder',
		styles: {
			width: '30px',
			height: '30px',
			display: 'inline-flex',
			'align-items': 'center',
			'justify-content': 'center',
			color: '#ff69b4',
			'font-size': '20px',
			padding: '0',
			margin: '0',
			cursor: 'pointer',
			'line-height': 'normal',
			transition: 'color 0.2s ease',
			border: 'none',
			background: 'none',
			'box-sizing': 'border-box'
		}
	}).addEvent('click', function(i) {
		i.stopPropagation();
		if (typeof vipyetkili !== 'undefined' && vipyetkili > 0) {
			this.active.Zs.exec('/privmsg NoMercy !kalp ' + this.active.name);
			this.kalp.setStyle('color', '#ff0000');
			(function() {
				this.kalp.setStyle('color', '#ff69b4');
			}.bind(this)).delay(1000);
		} else {
			if (typeof birkerekalp !== 'undefined' && birkerekalp === 1) {
				if (typeof kalpyag === 'function') kalpyag();
				birkerekalp = 0;
				this.kalp.setStyle('color', '#ff0000');
				(function() {
					this.kalp.setStyle('color', '#ff69b4');
				}.bind(this)).delay(1000);
			}
			this.en().hn('Kalp Göndermek için IRCOperator Olmanız Gerekmekte!');
		}
	}.bind(this));

	this.wizzIcon = new Element('i', {
		id: 'WizzButton',
		'class': 'fa fa-bolt xmenu',
		title: 'Wizz Efekt Menüsü',
		styles: {
			width: '30px',
			height: '30px',
			display: 'inline-flex',
			'align-items': 'center',
			'justify-content': 'center',
			color: '#1e90ff',
			'font-size': '20px',
			padding: '0',
			margin: '0',
			cursor: 'pointer',
			'line-height': 'normal',
			transition: 'color 0.2s ease',
			border: 'none',
			background: 'none',
			'box-sizing': 'border-box'
		}
	}).addEvent('click', function(i) {
		i.stopPropagation();
		var menu = this.wizzMenu;
		if (menu.getStyle('display') === 'none') {
			menu.setStyle('display', 'flex');
			menu.addClass('show');
			this.wizzIcon.setStyle('color', '#ff0000'); // Active state: red
		} else {
			menu.setStyle('display', 'none');
			menu.removeClass('show');
			this.wizzIcon.setStyle('color', '#1e90ff'); // Inactive state: blue
		}
		if (navigator.vibrate) navigator.vibrate(50);
	}.bind(this));



	this.soundIcon = new Element('i', {
		id: 'SoundMenu',
		'class': 'fas fa-volume-up xmenu',
		title: 'Komik Ses Menüsü',
		styles: {
			width: '30px',
			height: '30px',
			display: 'inline-flex',
			'align-items': 'center',
			'justify-content': 'center',
			color: '#800080',
			'font-size': '20px',
			padding: '0',
			margin: '0',
			cursor: 'pointer',
			'line-height': 'normal',
			transition: 'color 0.2s ease',
			border: 'none',
			background: 'none',
			'box-sizing': 'border-box'
		}
	}).addEvent('click', function(i) {
		i.stopPropagation();
		var menu = this.soundMenu;
		if (menu.getStyle('display') === 'none') {
			menu.setStyle('display', 'flex');
			menu.addClass('show');
			this.soundIcon.setStyle('color', '#ff0000');
		} else {
			menu.setStyle('display', 'none');
			menu.removeClass('show');
			this.soundIcon.setStyle('color', '#800080');
		}
		if (navigator.vibrate) navigator.vibrate(50);
	}.bind(this));

	document.addEvent('click', function(e) {
		var wizzMenu = this.wizzMenu;
		var soundMenu = this.soundMenu;
		var wizzButton = this.wizzIcon;
		var soundButton = this.soundIcon;
		if (wizzMenu.getStyle('display') === 'flex' && !wizzButton.contains(e.target) && !wizzMenu.getElement('.bfmdal-content').contains(e.target)) {
			wizzMenu.setStyle('display', 'none');
			wizzMenu.removeClass('show');
			this.wizzIcon.setStyle('color', '#1e90ff');
		}
		if (soundMenu.getStyle('display') === 'flex' && !soundButton.contains(e.target) && !soundMenu.getElement('.bfmdal-content').contains(e.target)) {
			soundMenu.setStyle('display', 'none');
			soundMenu.removeClass('show');
			this.soundIcon.setStyle('color', '#800080');
		}
	}.bind(this));

	var buttonGroup = new Element('div', {
		'class': 'button-group'
	});

	this.je.Df.setStyles({
		display: 'flex',
		'flex-direction': 'row',
		'justify-content': 'space-between',
		'align-items': 'center'
	});

	this.je.Df.appendChild(this.Gf);

	buttonGroup.empty();
	[this.permissionsIcon, this.soundIcon, this.wizzIcon, this.kalp, this.Kf, this.Zf].each(function(button) {
		buttonGroup.appendChild(button);
	}.bind(this));

	this.je.Df.appendChild(buttonGroup);

	var modalStyles = new Element('style');
	modalStyles.set('html', `

.font-panel {
    position: fixed;
    bottom: -100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid #ddd;
    padding: 15px;
    z-index: 10000;
    transition: bottom 0.3s ease;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.font-panel.show {
    bottom: 0;
}

.font-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.font-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
}

.font-control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.font-control-label {
    font-weight: bold;
    font-size: 14px;
    color: #333;
}

.color-picker-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.color-option {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid #ddd;
    cursor: pointer;
    transition: all 0.2s ease;
}

.color-option:hover {
    transform: scale(1.1);
    border-color: #333;
}

.color-option.active {
    border-color: #007bff;
    transform: scale(1.2);
    box-shadow: 0 0 0 2px rgba(0,123,255,0.3);
}

.style-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.style-btn {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: #f8f9fa;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    min-width: 70px;
    text-align: center;
}

.style-btn:hover {
    background: #e9ecef;
    border-color: #adb5bd;
}

.style-btn.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.style-btn.italic {
    font-style: italic;
}

.style-btn.underline {
    text-decoration: underline;
}

.font-panel-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.btn-group {
    display: flex;
    gap: 10px;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

@media (max-width: 768px) {
    .font-panel {
        padding: 10px;
    }
    
    .font-controls {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .color-option {
        width: 25px;
        height: 25px;
    }
    
    .style-btn {
        padding: 6px 10px;
        font-size: 13px;
        min-width: 60px;
    }
    
    .btn {
        padding: 6px 12px;
        font-size: 13px;
    }
}


		.bfmdal {
			display: none;
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			background: rgba(0, 0, 0, 0.5);
			z-index: 10001;
			justify-content: center;
			align-items: center;
			overflow: auto;
		}
		.bfmdal.show {
			display: flex;
		}
		.bfmdal-content {
			background: rgba(255, 255, 255, 0.95);
			border-radius: 12px;
			border: 1px solid rgba(110, 110, 110, 0.2);
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
			backdrop-filter: blur(10px);
			width: 90vw;
			max-width: 300px;
			max-height: 50vh;
			display: flex;
			flex-direction: column;
			position: relative;
		}
		.bfmdal-header {
			position: sticky;
			top: 0;
			background: rgba(255, 255, 255, 0.95);
			backdrop-filter: blur(10px);
			z-index: 1;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
			border-bottom: 1px solid #eee;
		}
		.bfmdal-title {
			margin: 0;
			font-size: 16px;
			font-weight: 600;
			color: #333;
		}
		.bfmdal-close {
			cursor: pointer;
			font-size: 20px;
			color: #333;
			background: none;
			border: none;
			padding: 0 5px;
			line-height: 1;
		}
		.bfmdal-body {
			flex: 1;
			overflow-y: auto;
			padding: 8px;
		}
		.wizz-item-container, .sound-item-container {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 8px;
			cursor: pointer;
			border-bottom: 1px solid #eee;
			transition: all 0.2s ease;
		}
		.wizz-item-container:last-child, .sound-item-container:last-child {
			border-bottom: none;
		}
		.wizz-item-container:hover, .sound-item-container:hover {
			background: rgba(240, 240, 240, 0.5);
		}
		.wizz-item, .sound-item {
			flex: 1;
			padding: 5px;
			font-size: 14px;
		}
		.wizz-send-button, .sound-item-button {
			padding: 6px 12px;
			border: none;
			border-radius: 8px;
			cursor: pointer;
			font-size: 13px;
			font-weight: 500;
			transition: all 0.2s ease;
			color: #fff;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		}
		.wizz-send-button {
			background: linear-gradient(135deg, #4287f5, #3276e6);
		}
		.sound-item-button {
			background: linear-gradient(135deg, #4cd964, #2ecc71);
		}
		.sound-item-button.stop {
			background: linear-gradient(135deg, #ff3b30, #e74c3c);
		}
		.sound-item-button.send {
			background: linear-gradient(135deg, #4287f5, #3276e6);
		}
		.wizz-send-button:hover, .sound-item-button:hover {
			transform: translateY(-1px);
			box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
		}
		.wizz-send-button:active, .sound-item-button:active {
			transform: translateY(0);
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}
		.sound-item-buttons {
			display: flex;
			gap: 8px;
		}
		.shake-slow { animation: shake-slow 0.4s ease-in-out 1; }
		@keyframes shake-slow {
			10% { transform: translate(10px, 10px); }
			20% { transform: translateY(-10px); }
			30% { transform: translate(-5px, 8px); }
			40% { transform: translate(-8px, 12px); }
			50% { transform: translate(8px, -8px); }
			60% { transform: translate(10px, 5px); }
			70% { transform: translate(-5px, -10px); }
			80% { transform: translateY(-12px); }
			90% { transform: translate(10px, 3px); }
			100% { transform: translateY(10px); }
		}
		.shake-rotate { animation: shake-rotate 0.5s ease-in-out 1; }
		@keyframes shake-rotate {
			10% { transform: rotate(5deg); }
			20% { transform: rotate(-8deg); }
			30% { transform: rotate(10deg); }
			40% { transform: rotate(-12deg); }
			50% { transform: rotate(15deg); }
			60% { transform: rotate(-10deg); }
			70% { transform: rotate(8deg); }
			80% { transform: rotate(-5deg); }
			90% { transform: rotate(3deg); }
			100% { transform: rotate(0deg); }
		}
		.shake-scale { animation: shake-scale 0.5s ease-in-out 1; }
		@keyframes shake-scale {
			10% { transform: scale(1.1); }
			20% { transform: scale(0.9); }
			30% { transform: scale(1.15); }
			40% { transform: scale(0.85); }
			50% { transform: scale(1.2); }
			60% { transform: scale(0.8); }
			70% { transform: scale(1.15); }
			80% { transform: scale(0.9); }
			90% { transform: scale(1.05); }
			100% { transform: scale(1); }
		}
		.shake-flip { animation: shake-flip 0.6s ease-in-out 1; transform-origin: center; }
		@keyframes shake-flip {
			10% { transform: rotateY(18deg); }
			20% { transform: rotateY(-25deg); }
			30% { transform: rotateY(30deg); }
			40% { transform: rotateY(-35deg); }
			50% { transform: rotateY(40deg); }
			60% { transform: rotateY(-35deg); }
			70% { transform: rotateY(30deg); }
			80% { transform: rotateY(-20deg); }
			90% { transform: rotateY(10deg); }
			100% { transform: rotateY(0deg); }
		}
		.shake-bounce { animation: shake-bounce 0.5s ease-in-out 1; }
		@keyframes shake-bounce {
			10% { transform: translateY(-5px); }
			20% { transform: translateY(8px); }
			30% { transform: translateY(-12px); }
			40% { transform: translateY(15px); }
			50% { transform: translateY(-18px); }
			60% { transform: translateY(15px); }
			70% { transform: translateY(-10px); }
			80% { transform: translateY(5px); }
			90% { transform: translateY(-3px); }
			100% { transform: translateY(0); }
		}
		.color-pulse { animation: color-pulse 0.6s ease-in-out; }
		@keyframes color-pulse {
			0% { background-color: rgba(255, 255, 255, 0.1); }
			20% { background-color: rgba(255, 100, 100, 0.2); }
			40% { background-color: rgba(100, 255, 100, 0.2); }
			60% { background-color: rgba(100, 100, 255, 0.2); }
			80% { background-color: rgba(255, 255, 100, 0.2); }
			100% { background-color: rgba(255, 255, 255, 0.1); }
		}
		.text-rainbow { animation: text-rainbow 0.6s; }
		@keyframes text-rainbow {
			0% { color: inherit; }
			20% { color: #ff4444; }
			40% { color: #44ff44; }
			60% { color: #4444ff; }
			80% { color: #ffff44; }
			100% { color: inherit; }
		}
		.opacity-flash { animation: opacity-flash 0.5s ease-in-out; }
		@keyframes opacity-flash {
			0% { opacity: 1; }
			25% { opacity: 0.5; }
			50% { opacity: 0.8; }
			75% { opacity: 0.3; }
			100% { opacity: 1; }
		}
		.background-waves { animation: background-waves 0.7s ease-in-out; }
		@keyframes background-waves {
			0% { background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 100%); }
			25% { background: radial-gradient(circle, rgba(255,100,100,0.2) 0%, rgba(255,255,255,0.1) 70%); }
			50% { background: radial-gradient(circle, rgba(100,255,100,0.2) 0%, rgba(255,255,255,0.1) 70%); }
			75% { background: radial-gradient(circle, rgba(100,100,255,0.2) 0%, rgba(255,255,255,0.1) 70%); }
			100% { background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 100%); }
		}
		.Df {
			display: flex !important;
			flex-direction: row !important;
			justify-content: space-between !important;
			align-items: center !important;
			padding: 0 !important;
			margin: 0 !important;
		}
		.Gf {
			order: -1 !important;
			margin-right: auto !important;
		}
		.button-group {
			display: flex !important;
			flex-direction: row !important;
			align-items: center !important;
			gap: 5px !important;
		}
		#EngelleButton, #SakirdaButton, #KalpButton, #WizzButton, #SoundMenu {
			width: 30px !important;
			height: 30px !important;
			display: inline-flex !important;
			align-items: center !important;
			justify-content: center !important;
			font-size: 20px !important;
			padding: 0 !important;
			margin: 0 !important;
			cursor: pointer !important;
			line-height: normal !important;
			transition: color 0.2s ease !important;
			border: none !important;
			background: none !important;
			box-sizing: border-box !important;
		}
		@media (max-width: 768px) {
			.button-group {
				gap: 4px !important;
			}
			#EngelleButton, #SakirdaButton, #KalpButton, #WizzButton, #SoundMenu {
				width: 28px !important;
				height: 28px !important;
				font-size: 18px !important;
			}
			.bfmdal-content {
				width: 90vw;
				max-width: 280px;
				max-height: 50vh;
			}
			.wizz-item, .sound-item {
				font-size: 13px;
			}
			.wizz-send-button, .sound-item-button {
				padding: 5px 10px;
				font-size: 12px;
			}
			.bfmdal-title {
				font-size: 14px;
			}
			.bfmdal-close {
				font-size: 18px;
			}
			.sound-item-container {
				padding: 10px;
			}
			.sound-item-button {
				padding: 8px 14px;
				font-size: 14px;
			}
		}
	`);
	document.head.appendChild(modalStyles);

	this.wizzMenu = new Element('div', {
		id: 'wizzModal',
		'class': 'bfmdal'
	});
	this.wizzMenuContent = new Element('div', {
		'class': 'bfmdal-content'
	});
	this.wizzHeader = new Element('div', {
		'class': 'bfmdal-header'
	});
	this.wizzTitle = new Element('h3', {
		'class': 'bfmdal-title',
		text: 'Wizz Efektleri'
	});
	this.wizzCloseButton = new Element('button', {
		'class': 'bfmdal-close',
		text: '×'
	});
	this.wizzHeader.appendChild(this.wizzTitle);
	this.wizzHeader.appendChild(this.wizzCloseButton);
	this.wizzMenuContent.appendChild(this.wizzHeader);
	this.wizzMenuBody = new Element('div', {
		'class': 'bfmdal-body'
	});
	this.wizzMenuContent.appendChild(this.wizzMenuBody);
	this.wizzMenu.appendChild(this.wizzMenuContent);
	document.body.appendChild(this.wizzMenu);

	var soundUrl = 'https://www.myinstants.com/media/sounds/msn-wizz.mp3';
	var wizzEffects = [
		{ name: 'Yavaş Wizz', effect: 'shake-slow' },
		{ name: 'Dönme Efekti', effect: 'shake-rotate' },
		{ name: 'Ölçekleme', effect: 'shake-scale' },
		{ name: 'Ters Döndürme', effect: 'shake-flip' },
		{ name: 'Zıplama', effect: 'shake-bounce' }
	];
	var colorEffects = [
		{ name: 'Renk Dalgası', effect: 'color-pulse' },
		{ name: 'Gökkuşağı Yazı', effect: 'text-rainbow' },
		{ name: 'Parlama Efekti', effect: 'opacity-flash' },
		{ name: 'Arka Plan Dalgaları', effect: 'background-waves' }
	];
	var allEffects = wizzEffects.concat(colorEffects);


	var applyWizzEffect = function(effectClass) {
		var audio = new Audio(soundUrl);

		allEffects.each(function(effect) {
			this.lines.removeClass(effect.effect);
		}.bind(this));

		this.lines.addClass(effectClass);

		audio.addEvent('ended', function() {
			window.showToast('Wizz efekti gönderildi!', 'success', 1500);
		});
		audio.addEvent('error', function() {
			window.showToast('Efekt oynatılamadı.', 'error', 1500);
		});

		audio.play();

		(function() {
			this.lines.removeClass(effectClass);
		}.bind(this)).delay(700);

		if (navigator.vibrate) navigator.vibrate(50);
	}.bind(this);

	allEffects.each((effect) => {
		var effectContainer = new Element('div', {
			'class': 'wizz-item-container'
		});
		var effectItem = new Element('div', {
			'class': 'wizz-item',
			text: effect.name
		});
		effectContainer.appendChild(effectItem);
		var sendButton = new Element('button', {
			'class': 'wizz-send-button',
			text: 'Gönder'
		});
		effectContainer.appendChild(sendButton);
		this.wizzMenuBody.appendChild(effectContainer);
		sendButton.addEvent('click', (i) => {
			i.stopPropagation();
			const currentTime = Date.now();
			const lastSendTime = window.lastEffectSendTime || 0;
			const cooldown = 180000;
			const timeSinceLastSend = currentTime - lastSendTime;
			if(timeSinceLastSend < cooldown) {
				const remainingSeconds = Math.ceil((cooldown - timeSinceLastSend) / 1000);

				window.showToast(`Lütfen ${remainingSeconds} saniye bekleyin!`, 'error', 1500);
				this.wizzMenu.setStyle('display', 'none');
				this.wizzMenu.removeClass('show');
				this.wizzIcon.setStyle('color', '#1e90ff');
				return;
			}
			var userNick = (actgetx && actgetx.nickname) ? actgetx.nickname : null;
			var targetNick = (actgetx && actgetx.en() && actgetx.en().name) ? actgetx.en().name : null;
			var effectName = effect.name;
			var effectLink = effect.effect;
			if(userNick && targetNick && !userNick.startsWith('#') && !targetNick.startsWith('#')) {
				applyWizzEffect(effectLink);
				var payload = {
					user_nick: userNick,
					target_nick: targetNick,
					action: 'wizz',
					effect_link: effectLink
				};

				fetch('https://irc.geveze.org/bf/bfula_db.php', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: new URLSearchParams(payload).toString()
				}).then(response => response.json()).then((data) => {

					if(data.status === 'success') {
						window.lastEffectSendTime = Date.now();
						window.showToast(`"${effectName}" wizz gönderildi!`, 'success', 1500);
					} else {
						window.showToast(data.message, 'error', 1500);
					}
					this.wizzMenu.setStyle('display', 'none');
					this.wizzMenu.removeClass('show');
					this.wizzIcon.setStyle('color', '#1e90ff');
				}).catch((error) => {
					console.error('Wizz effect error:', error);
					window.showToast('Wizz efekti gönderilemedi.', 'error', 1500);
					this.wizzMenu.setStyle('display', 'none');
					this.wizzMenu.removeClass('show');
					this.wizzIcon.setStyle('color', '#1e90ff');
				});
			} else {
				console.error('Invalid parameters: user_nick=' + userNick + ', target_nick=' + targetNick);
				window.showToast('Geçersiz kullanıcı veya hedef.', 'error', 1500);
			}
			if(navigator.vibrate) navigator.vibrate(50);
		});
	});


	this.wizzCloseButton.addEvent('click', function(i) {
		i.stopPropagation();
		this.wizzMenu.setStyle('display', 'none');
		this.wizzMenu.removeClass('show');
		this.wizzIcon.setStyle('color', '#1e90ff');
	}.bind(this));

	this.soundMenu = new Element('div', {
		id: 'soundModal',
		'class': 'bfmdal'
	});
	this.soundMenuContent = new Element('div', {
		'class': 'bfmdal-content'
	});
	this.soundHeader = new Element('div', {
		'class': 'bfmdal-header'
	});
	this.soundTitle = new Element('h3', {
		'class': 'bfmdal-title',
		text: 'Ses Efektleri'
	});
	this.soundCloseButton = new Element('button', {
		'class': 'bfmdal-close',
		text: '×'
	});
	this.soundHeader.appendChild(this.soundTitle);
	this.soundHeader.appendChild(this.soundCloseButton);
	this.soundMenuContent.appendChild(this.soundHeader);
	this.soundMenuBody = new Element('div', {
		'class': 'bfmdal-body'
	});
	this.soundMenuContent.appendChild(this.soundMenuBody);
	this.soundMenu.appendChild(this.soundMenuContent);
	document.body.appendChild(this.soundMenu);

	var currentAudio = null;
	var isAdjustingVolume = false;
	var originalVolume = 0;
	var activePlayButton = null;

	function handleSoundPlayback(button, soundUrl, soundName) {
		if (button.hasClass('stop')) {
			if (currentAudio) {
				currentAudio.pause();
				currentAudio.currentTime = 0;
				currentAudio = null;
				button.removeClass('stop');
				button.addClass('play');
				button.set('text', 'Dinle');
				if (isAdjustingVolume && soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl']) {
					window.bfRadyoSesAyarla(originalVolume);
					isAdjustingVolume = false;
				}
			}
			return;
		}
		if (currentAudio) {
			if (activePlayButton) {
				activePlayButton.removeClass('stop');
				activePlayButton.addClass('play');
				activePlayButton.set('text', 'Dinle');
			}
			currentAudio.pause();
			currentAudio.currentTime = 0;
			currentAudio = null;
		}
		button.removeClass('play');
		button.addClass('stop');
		button.set('text', 'Durdur');
		activePlayButton = button;
		if (!isAdjustingVolume && soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl']) {
			isAdjustingVolume = true;
			originalVolume = window.currentRadyoSesSeviyesi || (soundManager.sounds['PlayCtrl'] ? soundManager.sounds['PlayCtrl'].volume : 50);
			window.bfRadyoSesAyarla(5);
		}
		currentAudio = new Audio(soundUrl);
		currentAudio.play().then(() => {
			window.showToast(`"${soundName}" sesi oynatılıyor!`, 'success', 1500);
		}).catch((err) => {
			window.showToast('Ses oynatılamadı.', 'error', 1500);
			button.removeClass('stop');
			button.addClass('play');
			button.set('text', 'Dinle');
			activePlayButton = null;
			isAdjustingVolume = false;
			if (soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl']) {
				window.bfRadyoSesAyarla(originalVolume);
			}
		});
		currentAudio.onended = function() {
			button.removeClass('stop');
			button.addClass('play');
			button.set('text', 'Dinle');
			currentAudio = null;
			activePlayButton = null;
			if (isAdjustingVolume && soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl']) {
				window.bfRadyoSesAyarla(originalVolume);
				isAdjustingVolume = false;
			}
		};
	}

	var loadSoundEffects = function() {
		var self = this;
		if(!window.sesEfektleri) {
			if(typeof window.showToast === 'function') {
				window.showToast('Ses efektleri yüklenemedi, 3 saniye sonra tekrar denenecek!', 'error', 2000);
			}
			setTimeout(loadSoundEffects.bind(self), 3000);
			return;
		}
		window.sesEfektleri.forEach(function(ses) {
			var soundItemContainer = new Element("div", {
				'class': 'sound-item-container'
			});
			var soundItem = new Element("div", {
				'class': 'sound-item',
				text: ses.name,
				'data-sound': ses.link
			});
			soundItemContainer.appendChild(soundItem);
			var buttonsContainer = new Element("div", {
				'class': 'sound-item-buttons'
			});
			var playButton = new Element("button", {
				'class': 'sound-item-button play',
				text: 'Dinle'
			});
			playButton.store('soundUrl', ses.link).store('soundName', ses.name);
			buttonsContainer.appendChild(playButton);
			var sendButton = new Element("button", {
				'class': 'sound-item-button send',
				text: 'Gönder'
			});
			buttonsContainer.appendChild(sendButton);
			soundItemContainer.appendChild(buttonsContainer);
			self.soundMenuBody.appendChild(soundItemContainer);
			playButton.addEvent('click', function(i) {
				i.stopPropagation();
				var soundUrl = this.retrieve('soundUrl');
				var soundName = this.retrieve('soundName');
				handleSoundPlayback(this, soundUrl, soundName);
			});


			sendButton.addEvent('click', function(i) {
				i.stopPropagation();
				const currentTime = Date.now();
				const lastSendTime = window.lastSesEffectSendTime || 0;
				const cooldown = 180000;
				const timeSinceLastSend = currentTime - lastSendTime;
				if(timeSinceLastSend < cooldown) {
					const remainingSeconds = Math.ceil((cooldown - timeSinceLastSend) / 1000);

					window.showToast(`Lütfen ${remainingSeconds} saniye bekleyin!`, 'error', 1500);

					self.soundMenu.setStyle('display', 'none');
					self.soundMenu.removeClass('show');
					self.soundIcon.setStyle('color', '#800080');

					return;
				}
				var userNick = (actgetx && actgetx.en() && actgetx.nickname) ? actgetx.nickname : null;
				var targetNick = (actgetx && actgetx.en() && actgetx.en().name) ? actgetx.en().name : null;
				var effectLink = ses.link;
				var effectName = ses.name;

				if(userNick && targetNick && !userNick.startsWith('#') && !targetNick.startsWith('#')) {
					fetch('https://irc.geveze.org/bf/bfula_db.php', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams({
							user_nick: userNick,
							target_nick: targetNick,
							action: 'sound',
							effect_link: effectLink
						}).toString()
					}).then(response => response.json()).then(data => {
						if(data.status === 'success') {
							window.lastSesEffectSendTime = Date.now();
							window.showToast(`"${effectName}" sesi gönderildi!`, 'success', 1500);
						} else {
							window.showToast(data.message, 'error', 3000);
						}
						self.soundMenu.setStyle('display', 'none');
						self.soundMenu.removeClass('show');
						self.soundIcon.setStyle('color', '#800080');
					}).catch(error => {
						console.error('Sound effect error:', error);
						window.showToast('Ses efekti gönderilemedi.', 'error', 3000);
						self.soundMenu.setStyle('display', 'none');
						self.soundMenu.removeClass('show');
						self.soundIcon.setStyle('color', '#800080');
					});
				} else {
					console.error('Invalid parameters: user_nick=' + userNick + ', target_nick=' + targetNick);
					window.showToast('Geçersiz kullanıcı veya hedef.', 'error', 3000);
				}
				if(navigator.vibrate) navigator.vibrate(50);
			});
		});
	}.bind(this);

	loadSoundEffects();

	this.soundCloseButton.addEvent('click', function(i) {
		i.stopPropagation();
		this.soundMenu.setStyle('display', 'none');
		this.soundMenu.removeClass('show');
		this.soundIcon.setStyle('color', '#800080');
	}.bind(this));

	window.addEvent('beforeunload', function() {
		if (currentAudio) {
			currentAudio.pause();
			currentAudio = null;
		}
		if (isAdjustingVolume) {
			try {
				window.bfRadyoSesAyarla(originalVolume);
			} catch (e) {}
			isAdjustingVolume = false;
		}
	});

	this.Jf = document.getElementById(A5p9);
	this.Xf.addEvent($h, function(i) {
		new Event(i).stop();
		if (!this.active.closed) this.active.close();
	}.bind(this));
	this.ia = new Element($Q, {
		type: aNW,
		id: A8SK,
		name: A8SK,
		placeholder: a9Xd
	});
	this.je.jf.appendChild(this.ia);
	this.ta = window.hc.cloneNode(false);
	this.na = null;
	this.Qf = window.hc.cloneNode(false);
	this.Qf.addClass(AbBV);
	this.sa();
	this.ta.appendChild(this.Qf);
	this.ea = this.xf = this.je.xf;
	this.ha = this.Hf = this.je.Hf;
	this.ra = this.Yf = this.je.Yf;
	this.ca = this.Mf = this.je.Mf;
	this.lines = this.je.middle;
	this.oa = this.ua = this.je.right;
	this.fa = this.Df = this.je.Df;
	this.aa = this.De = this.je.De;
	this.wa = this.jf = this.je.jf;
	this.input = this.je.bottom;
	this.la = this.je.la.bind(this.je);
	var c = function(i) {
		var t, n, s, e = new Event(i);
		if (this.na) {
			s = this.je.left;
			if (s.getScrollSize().y > s.clientHeight) return;
			t = e.Bu < 0;
			n = e.Bu > 0;
		} else {
			t = e.Bu > 0;
			n = e.Bu < 0;
		}
		if (t) this.Kh();
		else if (n) this.Jh();
		e.stop();
	}.bind(this);
	this.je.left.addEvent(AbDR, c);
	this.je.top.addEvent(AbDR, c);
	this.bi();
	this.la();
	for (var o = 50; o < 1000; o += 50) this.la.delay(o, this.je, [true]);
	for (o = 1000; o < 2000; o += 100) this.la.delay(o, this.je);
	for (o = 2000; o < 15000; o += 500) this.la.delay(o, this.je);
	this.gu(false);
	},
createFontPanel: function() {
    var self = this;
    this.fontPanel = new Element('div', {
        'class': 'font-panel',
        'id': 'fontPanel'
    });

    // Panel header
    var header = new Element('div', {
        'class': 'font-panel-header'
    });
    
    var title = new Element('h3', {
        'text': 'Yazı Stilleri',
        'styles': {
            margin: '0',
            'font-size': '16px',
            color: '#333'
        }
    });
    
    var closeBtn = new Element('button', {
        'class': 'btn btn-secondary',
        'text': '×',
        'styles': {
            'font-size': '18px',
            padding: '5px 10px'
        }
    }).addEvent('click', function() {
        self.hideFontPanel();
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    this.fontPanel.appendChild(header);

    // Font controls
    var controls = new Element('div', {
        'class': 'font-controls'
    });

    // Renk seçimi
    var colorGroup = new Element('div', {
        'class': 'font-control-group'
    });
    
    var colorLabel = new Element('div', {
        'class': 'font-control-label',
        'text': 'Yazı Rengi'
    });
    
    var colorContainer = new Element('div', {
        'class': 'color-picker-container'
    });
    
    var colors = [
        { name: 'Siyah', value: '#000000' },
        { name: 'Kırmızı', value: '#ff0000' },
        { name: 'Mavi', value: '#0000ff' },
        { name: 'Yeşil', value: '#008000' },
        { name: 'Mor', value: '#800080' },
        { name: 'Turuncu', value: '#ff8c00' },
        { name: 'Pembe', value: '#ff69b4' },
        { name: 'Kahverengi', value: '#8b4513' }
    ];
    
    colors.forEach(function(color) {
        var colorOption = new Element('div', {
            'class': 'color-option',
            'title': color.name,
            'styles': {
                'background-color': color.value
            },
            'data-color': color.value
        }).addEvent('click', function() {
            // Diğer renklerin active class'ını kaldır
            colorContainer.getElements('.color-option').forEach(function(el) {
                el.removeClass('active');
            });
            
            // Aktif rengi işaretle
            colorOption.addClass('active');
            qwebirc.q.globalFontManager.setColor(color.value);
        });
        
        // Önceden seçilmiş rengi işaretle
        if (qwebirc.q.globalFontManager.selectedColor === color.value) {
            colorOption.addClass('active');
        }
        
        colorContainer.appendChild(colorOption);
    });
    
    colorGroup.appendChild(colorLabel);
    colorGroup.appendChild(colorContainer);
    controls.appendChild(colorGroup);

    // Stil seçenekleri
    var styleGroup = new Element('div', {
        'class': 'font-control-group'
    });
    
    var styleLabel = new Element('div', {
        'class': 'font-control-label',
        'text': 'Yazı Stili'
    });
    
    var styleButtons = new Element('div', {
        'class': 'style-buttons'
    });

    var underlineBtn = new Element('div', {
        'class': 'style-btn underline',
        'text': 'Altçizgi',
        'data-style': 'underline'
    }).addEvent('click', function() {
        qwebirc.q.globalFontManager.toggleStyle('underline');
        if (qwebirc.q.globalFontManager.selectedStyles.underline) {
            underlineBtn.addClass('active');
        } else {
            underlineBtn.removeClass('active');
        }
    });

    var boldBtn = new Element('div', {
        'class': 'style-btn bold',
        'text': 'Kalın',
        'data-style': 'bold'
    }).addEvent('click', function() {
        qwebirc.q.globalFontManager.toggleStyle('bold');
        if (qwebirc.q.globalFontManager.selectedStyles.bold) {
            boldBtn.addClass('active');
        } else {
            boldBtn.removeClass('active');
        }
    });
    

    if (qwebirc.q.globalFontManager.selectedStyles.underline) {
        underlineBtn.addClass('active');
    }
    if (qwebirc.q.globalFontManager.selectedStyles.bold) {
        boldBtn.addClass('active');
    }

    styleButtons.appendChild(underlineBtn);
    styleButtons.appendChild(boldBtn);
    styleGroup.appendChild(styleLabel);
    styleGroup.appendChild(styleButtons);
    controls.appendChild(styleGroup);

    this.fontPanel.appendChild(controls);

    // Panel actions
    var actions = new Element('div', {
        'class': 'font-panel-actions'
    });
    
    var resetBtn = new Element('button', {
        'class': 'btn btn-secondary',
        'text': 'Sıfırla'
    }).addEvent('click', function() {
        self.resetFontStyles();
    });
    
    var applyBtn = new Element('button', {
        'class': 'btn btn-primary',
        'text': 'Uygula'
    }).addEvent('click', function() {
        self.applyFontStyles();
        self.hideFontPanel();
    });
    
    var btnGroup = new Element('div', {
        'class': 'btn-group'
    });
    
    btnGroup.appendChild(resetBtn);
    btnGroup.appendChild(applyBtn);
    actions.appendChild(btnGroup);
    
    this.fontPanel.appendChild(actions);
    document.body.appendChild(this.fontPanel);
},

toggleFontPanel: function() {
    if (!this.fontPanel) {
        this.createFontPanel();
    }
    
    if (this.fontPanel.hasClass('show')) {
        this.hideFontPanel();
    } else {
        this.showFontPanel();
    }
},

showFontPanel: function() {
    if (!this.fontPanel) {
        this.createFontPanel();
    }
    
    // Font button kontrolü ekle
    if (!this.fontButton) {
        console.warn('Font button referansı bulunamadı');
        return;
    }
    
    this.fontPanel.addClass('show');
    this.fontButton.setStyle('color', '#ff0000');
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
},

hideFontPanel: function() {
    if (this.fontPanel) {
        this.fontPanel.removeClass('show');
    }
    
    // Font button kontrolü ekle
    if (this.fontButton) {
        this.fontButton.setStyle('color', '#2e8b57');
    }
},


resetFontStyles: function() {
    qwebirc.q.globalFontManager.reset();
    
    if (this.fontPanel) {
        this.fontPanel.getElements('.color-option').forEach(function(el) {
            el.removeClass('active');
        });
        this.fontPanel.getElements('.style-btn').forEach(function(el) {
            el.removeClass('active');
        });
    }
},


applyFontStyles: function() {
    var currentText = this.Ea.getText();
    if (!currentText.trim()) {
        return;
    }
    
    var styledText = qwebirc.q.globalFontManager.formatMessage(currentText);
    this.Ea.setText(styledText);
},

formatMessageWithStyles: function(text) {
    return qwebirc.q.globalFontManager.formatMessage(text);
},

	ks: function(i, t, n) {
		var s = this.parent(i, t, n);
		s.gu(false);
		return s;
	},

	sa: function() {
		var t, r, i, n, s, e, h, c, o, u, f, a, w, l, d, b = window.ti.cloneNode(!1);
		b.addClass(AbN$), b.setAttribute(X0, AC4K), b.hide = function() {
			b.setStyle(Y6N, z8), b.visible = !1, document.removeEvent(eb$, t)
		}.bind(this);
		t = function() {
			b.hide()
		};
		b.hide(), this.parentElement.appendChild(b);
		r = this;
		i = new Element(aEK$);
		i.className = AEzB;
		i.setStyles({
			'display': 'flex',
			'justify-content': 'space-between',
			'align-items': 'center',
			'width': '100%',
			'height': '40px',
			'padding': '0 10px',
			'box-sizing': 'border-box',
			'background-color': 'rgb(227,239,250)'
		});

		s = new Element('button', {
			'class': 'xmenu',
			html: 'Menü',
			styles: {
				textShadow: '1px 2px 3px rgba(0,0,0,0.3)'
			}
		});

		var menuContainer = new Element('div', {
			id: 'bfmenu',
			class: 'Bfmenu menuBfx',
			styles: {
				display: 'none'
			}
		});

		var modal = new Element('div', {
			id: 'customModal',
			class: 'custom-modal',
			styles: {
				display: 'none'
			},
			html: `
				<div class="custom-modal-content">
					<div class="custom-modal-header">
						<h2>Gizlilik Politikası</h2>
						<button class="custom-modal-close" onclick="closeCustomModal('customModal')">×</button>
					</div>
					<div class="custom-modal-body">
						<h4>Lütfen dikkatlice okuyunuz!</h4>
						<div class="faq">
							<p>Geveze.ORG olarak kişisel gizlilik haklarınıza saygı duyuyor ve sitemizde geçirdiğiniz süre zarfında bunu sağlamak için çaba sarfediyoruz. Kişisel bilgilerinizin güvenliği ile ilgili tanımlar aşağıda açıklanmış ve bilginize sunulmuştur.</p>
							<h4>İlgi alanına dayalı reklamcılık</h4>
							<p>Geveze.ORG Sponsorumuz olan Google Adsense Reklamlarının yayıncısıdır. Google üçüncü taraf satıcısı olarak Geveze.ORG’te reklam yayınlamak için çerezlerden yararlanır.</p>
							<p>Bu sebeble Hem Google hemde DoubleClick DART çerezi kullanmaktadır bu sayede kullanıcılarının ilgi alanlarına göre Reklam yayınlama Tekniğini kullanmaktadır.</p>
							<p>Ziyaretçilerimiz ve üyelerimiz Google Reklam ve içerik ağı ve gizlilik ağı politikasının yayınlandığı <a href="https://policies.google.com/technologies/ads" target="_blank">Advertising and Privacy ? Google Privacy Center</a> web adresini ziyaret ederk DART çerezinin kullanmamızı engelleyebilirler.</p>
							<p>Özetle: Web sitemizi ziyaret ettiğiniz zamanlarda reklam hizmeti vermek için üçüncü taraf reklam şirketlerini kullanmaktayız.</p>
							<p>Söz konusu şirketler, bu sitelere ve diğer web sitelerine yaptığınız ziyaretlerden elde ettikleri (adınız, adresiniz, e-posta adresiniz veya telefon numaranız DIŞINDAKİ) bilgileri ilginizi çekecek ürün ve hizmetlerin reklamını size göstermek için kullanabilir.</p>
							<p>Bu uygulama hakkında bilgi edinmek için ve söz konusu bilgilerin bu şirketler tarafından kullanılmasını engellemek üzere seçeneklerinizin neler olduğunu öğrenmek isterseniz <a href="http://www.networkadvertising.org/managing/opt_out.asp" target="_blank">bu linkten</a> PDF dosyasını indirerek belgenin A ekinden daha fazla bilgiye ulaşabilirsiniz.</p>
							<h4>Log Dosyaları</h4>
							<p>Birçok standard web sunucusunda olduğu gibi Geveze.ORG’inde istatistiksel amaçlı log dosyaları kaydı tutmaktadır.</p>
							<p>Bu dosyalar; ip adresiniz, internet servis sağlayıcınız, tarayıcınızın özellikleri, işletim sisteminiz ve siteye giriş-çıkış sayfalarınız gibi standard bilgileri içermektedir.</p>
							<p>Log dosyaları kesinlikle istatistiksel amaçlar dışında kullanılmamakta ve mahremiyetinizi ihlal etmemektedir.</p>
							<p>İp adresiniz ve diğer bilgiler, şahsi bilgileriniz ile ilişkilendirilmemektedir. Geveze.ORG istatistik için Google Analytics teknolojisini kullanmaktadır.</p>
							<h4>Çerezler</h4>
							<p>“Cookie – Çerez” kelimesi web sayfası sunucusunun sizin bilgisayarınızın hard diskine yerleştirdiği ufak bir text dosyasını tanımlamak için kullanılmaktadır.</p>
							<p>Sitemizin bazı bölümlerinde kullanıcı kolaylığı sağlamak için çerez kullanılıyor olabilir. Ayrıca sitede mevcut bulunan reklamlar aracılığıyla, reklam verilerinin toplanması için cookie ve web beacon kullanılıyor olabilir.</p>
							<p>Bu tamamen sizin izninizle gerçekleşiyor olup, isteğiniz dahilinde internet tarayıcınızın ayarlarını değiştirerek bunu engellemeniz mümkündür.</p>
							<h4>Dış bağlantılar</h4>
							<p>Geveze.ORG sitesi, internetin doğası gereği birçok farklı internet adresine bağlantı vermektedir.</p>
							<p>Site İsmi link verdiği, banner tanıtımını yaptığı sitelerin içeriklerinden veya gizlilik prensiplerinden sorumlu değildir.</p>
							<p>Burada bahsedilen bağlantı verme işlemi, hukuki olarak “atıfta bulunma” olarak değerlendirilmektedir.</p>
							<h4>İletişim</h4>
							<p>Geveze.ORG sitesinde uygulanan gizlilik politikası ile ilgili;</p>
							<p>her türlü soru, görüş ve düşüncelerinizi bize <a href="/iletisim" target="_blank">İletişim</a> linki üzerinden ulaştırabilirsiniz.</p>
							<p>işbu gizlilik ve kişisel verilerin işlenmesi politikası uyarınca işlenmesini, kabul edip etmemek hususunda tamamen özgürsünüz.</p>
							<p>Siteyi kullanmaya devam ettiğiniz takdirce kabul etmiş olduğunuz tarafımızca varsayılacak olup,</p>
							<p>daha ayrıntılı bilgi için bizimle iletişime geçebilirsiniz.</p>
							<p>Yonetimimiz, yukarida belirtilen kurallara uyulmadigi takdirde gerekli mudahalelerde bulunma,</p>
							<p>kullaniciyi sohbetten cikarma ve sohbet odalarini kapatma hakkini elinde bulundurmaktadir.</p>
						</div>
					</div>
					<div class="custom-modal-footer">
						<button class="custom-modal-button reject" onclick="kabuletmiyorum()">Kabul Etmiyorum</button>
						<button class="custom-modal-button accept" onclick="gabulettim('customModal')">Kabul Ediyorum</button>
					</div>
				</div>
			`
		});

		var modal2 = new Element('div', {
			id: 'customModal2',
			class: 'custom-modal',
			styles: {
				display: 'none'
			},
			html: `
				<div class="custom-modal-content">
					<div class="custom-modal-header">
						<h2>Kullanıcı Sözleşmesi</h2>
						<button class="custom-modal-close" onclick="closeCustomModal('customModal2')">×</button>
					</div>
					<div class="custom-modal-body">
						<h4>Lütfen Siteyi Kullanmadan Önce dikkatlice okuyunuz!</h4>
						<div class="faq">
							<p>Geveze.ORG Web Sitesi’ni ziyaret ettiğiniz için teşekkür ederiz.</p>
							<p>Siteye girmek ve kullanmakla sitenin kullanım ve sözleşme kurallarını kabul etmiş oluyorsunuz.</p>
							<p>Geveze.ORG bu sözleşmede her zaman değişiklik yapabilir ve bu değişiklikler değiştirilmiş sözleşmenin siteye konulmasıyla derhal geçerlilik kazanır.</p>
							<p>Siz bu değişikliklerden haberdar olmak amacıyla periyodik olarak sözleşmeyi gözden geçirmeyi kabul ederek, siteye devam eden erişiminiz veya devam eden siteyi kullanımınız değiştirilmiş sözleşmeyi kesin olarak kabul ettiğiniz anlamına gelecektir.</p>
							<h4>1- İşbu site ve içeriği olduğu gibi kullanımınıza sunulmaktadır. Bu siteye giriş yapmak ve kullanmakla sitenin içeriği ile ilgili kullanımdan doğacak riskleri üstlenmiş olursunuz.</h4>
							<p>Geveze.ORG yönetimi site içeriği yada üçüncü şahısların sitelerindeki içeriklerin kullanımı ve kullanım sonuçları hakkında site forum alanları dahil olmak üzere doğruluk, güvenilirlik, kesinlik konularında ya da başka açılardan hiçbir garanti vermez.</p>
							<p>Aynı şekilde, web sitesinin işletme ve idaresinin hatasız ve kesintisiz olacağı, aksaklıklar kusur ve bozuklulukların düzeltileceği, web sitesinin zarar verici unsurlardan ve virüslerden temizlenmiş olduğu hususunda kullanıcıya herhangi bir öneri ve tavsiyede bulunmamakta ve bu hususlarda kullanıcıya herhangi bir güvence ve teminat verilmemektedir.</p>
							<p>İşbu sitede üçüncü şahıslar tarafından idare edilen internet sitelerine bağlantılar ve yönlendiriciler sağlanmakta, üçüncü kişilere ait sitelerdeki içerik kullanılmaktadır. Üçüncü kişilere ait sitelerdeki bilgiler, ürünler ve hizmetler hiçbir şekilde işletilmemekte ve denetlememektedir.</p>
							<p>Bu sitede ve üçüncü şahıs sitelerindeki içerik olduğu gibi sağlanmaktadır ve yukarıdaki paragrafta belirttiğimiz hususlar dahil hiçbir konuda açık ya da dolaylı hiç bir garanti verilmemektedir. Ayrıca, bu durum üçüncü kişilerin web sitelerinin içeriğinin doğruluğu ve güvenirliğinin onaylandığı anlamına gelmemektedir.</p>
							<p>Bu nedenle üçüncü kişilerin web sitelerinde yer alan bilgi veya fikir konusunda sorumluluk kabul edilmemektedir. Yine üçüncü kişilerin siteye verdikleri linklerin web içeriklerinin doğruluğu ve güvenilirliğinin tarafımızdan onaylandığı anlamı da asla çıkarılmamalıdır.</p>
							<p>İşbu web sitesindeki bilgiler sadece kullanıcıyı bilgilendirmek amacı ile sunulmuş olup; hukuki, tıbbi, finansal, yatırım, vergi, muhasebe ve diğer benzeri konularda tavsiye niteliğinde değildir.</p>
							<p>İşbu web sitesinde yayınlanan bilgilere güvenerek yapacağınız herhangi bir işlemin sorumluluğu tamamen size aittir.</p>
							<h4>2- İş bu web sitesi kullanıcılar arasında gerçek zamanda etkileşim olmasını imkanlı kılan forum alanları içerebilir.</h4>
							<p>Forum alanları için kullanıcılar kendisinden istendiği takdirde, kimlik bilgileri, telefon bilgileri, tebligat adresi, yazışma adresi, eposta, telefon, IP numarası gibi her türlü bilgiyi gerçeğe uygun bir şekilde vermek yükümlülüğündedir.</p>
							<p>Geveze.ORG forum yada blog alanlarına gönderilen mesajları, yorumları, bilgileri ya da dosyaları denetlemek zorunluluğu yoktur. Ancak, tek taraflı olarak her tür bilgiyi ve malzemeyi, değiştirme, yayınlamayı reddetme ya da yayından kaldırma hakkını ve herhangi bir adli ya da idari isteğe yanıt vermek için her türlü bilgiyi açıklama hakkını her zaman saklı tutar.</p>
							<p>İşbu web sitesinde yayınlanan her türlü kullanıcı mesajları, yayınlar ve benzeri eklemeler ilgili kişinin kendi görüşlerini yansıtmakta olup sadece kullanıcıyı bağlar. Geveze.ORG bu görüş ve fikirlerden ve ilgili mesaj, ekleme ve yüklemeler ile her tür diğer içerikten sorumlu değildir.</p>
							<p>Forum alanlarında yayınlanmış görüşler Geveze.ORG’un kabul ya da reddettiği anlamına gelmez.</p>
							<p>Forum alanlarını ve iş bu web sitesini kullanırken aşağıdaki şartlara uymayı kabul edersiniz:</p>
							<p>– içeriği hukuka aykırı yıldırıcı, tehdit edici, hakaret niteliğinde olan, genel ahlaka aykırı, yakışıksız, edebe aykırı, pornografik, aşağılayıcı, karalayıcı, küfürlü, lekeleyici ve benzeri her türlü bilgi ve görüş,</p>
							<p>– suç teşkil edecek veya suça teşvik edici nitelikte veya ulusal ve uluslararası kanunlara aykırı olan veya başkalarının kişisel haklarını zedeleyici, çiğneyici, hakaret edici, özel hayatlarına ve kamu haklarına tecavüz teşkil eden veya fikri mülkiyet hukuku ve ilgili diğer kanunla tarafından korunan telif hakları,</p>
							<p>patent, tasarım, ticari sır veya diğer fikri mülkiyet hakları ile bunlara ek olarak eser sahibinden izin almaksızın işleme ve derleme eser haklarına karşı ihlal ve tecavüz teşkil eden her türlü yazı, makale, resim, görüntü, fotoğraf, haber, yazılım programı veya benzeri unsurlar,</p>
							<p>– kin, nefret, ırkçılık, bağnazlık, başkalarına karşı her türlü fiziki tecavüzü teşvik eden veya küçüklere zararlı olabilecek, rahatsız edici, saldırgan veya başkalarına saldırganlığı teşvik edici, her türlü mesaj, eklemeler ve yayınlar,</p>
							<p>– küçükleri şiddet ve cinselliğe yönelten, teşvik eden veya kanuna karşı faaliyetler hakkında eğitici bilgi veren, yasadışı silahların üretimi, nasıl yapıldığı, nasıl satıldığı hususunda bilgi veren mesajlar,</p>
							<p>– diğer kullanıcılara vermek üzere ve ticari amaçlı veya diğer başka yasal olmayan amaçlar için kullanmak üzere web sitesini kullananların şifre ve kişisel bilgilerini istemek veya almak,</p>
							<p>– virüs veya zararlı spamlar içeren veya virüs yaratan her türlü mesaj, ekleme ve yüklemeler, istenmeyen mail, zincirleme mektup, davetsiz toplu e-mail veya spam göndermek veya web sitesini ticari amaç için kullanmak, reklam, satış, ticari faaliyetle ilgili unsurlar taşıyan mesaj bırakma, eklemelerde bulunma veya yükleme yapmak, Yasaktır.</p>
							<h4>3- Yukarıda yazılı hüküm ve hukuki ilişkilerin uygulanmasından doğabilecek uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkili kılınmıştır.</h4>
							<p>Geveze.ORG yönetimi yukarıda belirtilen kullanım koşullarını dilediği her zaman geliştirebilir ve güncelleyebilir. Kullanıcıların bildirdiği adres, kullanıcılara yapılacak her türlü bildirim için yasal adres kabul edilir.</p>
							<p>Geveze.ORG kullanıcılarının kimliklerine, adreslerine, hizmet sağlayıcılarına ve benzeri bilgilerine erişemez. Geveze.ORG’un üyelik bölümünde bazı bilgiler istenmektedir, kullanıcılar burada talep edilen bilgileri kendi rızalarıyla verir.</p>
							<p>Bunun dışında Geveze.ORG donanım ve yazılım bilgilerinizi toplayabilir. Bu bilgiler arasında şunlar yer alır:</p>
							<p>IP adresiniz, tarayıcı türü, işletim sistemi, etki alan adı, erişim süreleri ve ilgili web adresleri.</p>
						</div>
					</div>
					<div class="custom-modal-footer">
						<button class="custom-modal-button reject" onclick="kabuletmiyorum()">Kabul Etmiyorum</button>
						<button class="custom-modal-button accept" onclick="gabulettim('customModal2')">Kabul Ediyorum</button>
					</div>
				</div>
			`
		});

		var menuItems = [
			{ text: 'Kanala Gir', icon: 'fas fa-door-open', class: 'Bfy-background-siyah', action: kanalagir },
			{ text: 'Nick Değiştir', icon: 'fas fa-user-edit', class: 'Bfy-background-mavi', action: nickdegistir },
			{ text: 'Nick Kaydet', icon: 'fas fa-user-shield', class: 'Bfy-background-yesil', action: nickregister },
			{ text: 'Nickini Düşür', icon: 'fas fa-user-slash', class: 'Bfy-background-siyah', action: nsghost },
			{ text: 'Admin Şifresi Gir', icon: 'fas fa-crown', class: 'Bfy-background-ogs', action: opergiris },
			{ text: 'Sürüm Değiştir', icon: 'fas fa-mobile-alt', class: 'Bfy-background-mavi', action: digersurum },
			{ text: 'Gizlilik Politikası', icon: 'fas fa-shield-alt', class: 'Bfy-background-ogs', action: function() {
				menukapat();
				document.getElementById('customModal').style.display = 'flex';
				document.getElementById('customModal').addClass('show');
			} },
			{ text: 'Kullanıcı Sözleşmesi', icon: 'fas fa-file-contract', class: 'Bfy-background-mavi', action: function() {
				menukapat();
				document.getElementById('customModal2').style.display = 'flex';
				document.getElementById('customModal2').addClass('show');
			} }
		];

		menuItems.forEach(function(item) {
			var menuItem = new Element('div', {
				class: `Bfy-button Bfy-repeatedbf ${item.class}`,
				html: `<i class="${item.icon}"></i> ${item.text}`,
				events: {
					click: item.action
				}
			});
			menuContainer.appendChild(menuItem);
		});

		s.addEventListener("click", function(e) {
			e.stopPropagation();
			var menu = document.getElementById('bfmenu');
			var buttonRect = s.getBoundingClientRect();
			if (menu.style.display === "none" || !menu.style.display) {
				menu.style.display = "block";
				menu.addClass('show');
				menu.setStyles({
					top: (buttonRect.bottom + window.scrollY + 8) + 'px',
					left: (buttonRect.left + window.scrollX) + 'px'
				});
				var menuRect = menu.getBoundingClientRect();
				if (menuRect.right > window.innerWidth) {
					menu.setStyle('left', (window.innerWidth - menuRect.width - 16) + 'px');
				}
				if (menuRect.bottom > window.innerHeight) {
					menu.setStyle('top', (buttonRect.top + window.scrollY - menuRect.height - 8) + 'px');
				}
			} else {
				menu.style.display = "none";
				menu.removeClass('show');
			}
		});

		document.addEvent('click', function(e) {
			var menu = document.getElementById('bfmenu');
			if (menu && menu.style.display === 'block' && !s.contains(e.target) && !menu.contains(e.target)) {
				menu.style.display = 'none';
				menu.removeClass('show');
			}
		});

		var cx = new Element('i');

		cx.setStyles({
			'display': 'flex',
			'justify-content': 'center',

			'align-items': 'center',
			'cursor': 'pointer',
			'border-radius': '50%'
		});
		cx.set('title', 'Radyo');

		window.guncelleRadyoIkonu = function() {
			if (window.radyoOynatiliyor) {
				cx.setStyle('background-image', 'url(https://irc.geveze.org/bf/img/dewamke.png)');
			} else {
				cx.setStyle('background-image', 'url(https://irc.geveze.org/bf/img/stoppp.png)');
			}
		}

		window.guncelleRadyoIkonu();

		var menuKapsayici = new Element('div', {
			id: 'bfmenus',
			class: 'Bfmenu menuBfx',
			styles: {
				display: 'none'
			}
		});

		var menuOgeleri = [
			{
				text: function() { return fmkontrol() ? 'Radyo kapat' : 'Radyo aç'; },
				icon: 'fas fa-play',
				class: 'Bfy-background-ogs',
				action: function() {
					menukapat();
					if (fmkontrol()) {
						window.bfRadyoKapat();
					} else {
						window.bfRadyoAc();
					}
					guncelleMenuMetni();
					window.guncelleRadyoIkonu();
				}
			},
			{
				text: 'Radyo ayarları',
				icon: 'fas fa-volume-up',
				class: 'Bfy-background-yesil',
				action: function() {
					menukapat();
					if (typeof window.bfRadyoSesKontrolGoster === 'function') {
						window.bfRadyoSesKontrolGoster();
						window.showToast('Radyo ses ayarları açıldı!', 'success', 1500);
					} else {
						window.showToast('Radyo ses kontrolü yüklenemedi!', 'error', 1500);
					}
				}
			}
		];

		function guncelleMenuMetni() {
			var menuOge = menuKapsayici.getElements('.Bfy-button')[0];
			if (menuOge) {
				menuOge.set('html', `<i class="${menuOgeleri[0].icon}"></i> ${menuOgeleri[0].text()}`);
			}
		}

		menuOgeleri.forEach(function(oge) {
			var menuOge = new Element('div', {
				class: `Bfy-button Bfy-repeatedbf ${oge.class}`,
				html: `<i class="${oge.icon}"></i> ${typeof oge.text === 'function' ? oge.text() : oge.text}`,
				events: {
					click: oge.action
				}
			});
			menuKapsayici.appendChild(menuOge);
		});

		cx.addEventListener("click", function(e) {
			e.stopPropagation();
			var menu = document.getElementById('bfmenus');
			var buttonRect = cx.getBoundingClientRect();
			if (menu.style.display === "none" || !menu.style.display) {
				menu.style.display = "block";
				menu.addClass('show');
				menu.setStyles({
					top: (buttonRect.bottom + window.scrollY + 8) + 'px',
					left: (buttonRect.left + window.scrollX) + 'px'
				});
				guncelleMenuMetni();
			} else {
				menu.style.display = "none";
				menu.removeClass('show');
			}
		});

		document.addEvent('click', function(e) {
			var menu = document.getElementById('bfmenus');
			if (menu && menu.style.display === 'block' && !cx.contains(e.target) && !menu.contains(e.target)) {
				menu.style.display = 'none';
				menu.removeClass('show');
			}
		});

		var ozelIslem = new Element("i");
		ozelIslem.id = "ozelIslem";
		ozelIslem.addClass("xmenu");
		ozelIslem.setStyles({
			"background-image": "url(https://irc.geveze.org/bf/img/ozl.png)",
			"background-size": "contain",
			"background-repeat": "no-repeat",
			"background-position": "center center",
			"width": "30px",
			"height": "30px",
			"margin": "0 5px",
			"display": "flex",
			"justify-content": "center",
			"align-items": "center",
			"cursor": "pointer",
			"transition": "transform 0.2s ease, opacity 0.3s ease",
			"border-radius": "50%"
		});
		ozelIslem.set('title', 'Özel Mesaj Ayarları');
		ozelIslem.addEvent($h, function(i) {
			i.preventDefault();
			if (!actgetx || !actgetx.nickname) {
				window.showToast("Lütfen önce sunucuya giriş yapın.", "error", 1500);
				return;
			}
			var uNick = actgetx.nickname;
			if (Cwx_om == 1) {
				Cwx_om = 0;
				window.showToast("Özel mesaj alımınız açıldı.", "success", 1500);
				actgetx.exec("/mode " + uNick + " -D");
			} else {
				Cwx_om = 1;
				window.showToast("Özel mesaj alımınız kapatıldı.", "success", 1500);
				actgetx.exec("/mode " + uNick + " +D");
			}
		});

		var bfyni = new Element("i");
		bfyni.id = "bfyni";
		bfyni.addClass("xmenu");
		bfyni.setStyles({
			"background-image": "url(https://irc.geveze.org/bf/img/bfyni.png)",
			"background-size": "contain",
			"background-repeat": "no-repeat",
			"background-position": "center center",
			"width": "30px",
			"height": "30px",
			"margin": "0 5px",
			"display": "flex",
			"justify-content": "center",
			"align-items": "center",
			"cursor": "pointer",
			"transition": "transform 0.2s ease, opacity 0.3s ease",
			"border-radius": "50%"
		});
		bfyni.set('title', 'BF Panel');
		bfyni.addEvent($h, function(i) {
			i.preventDefault();
			if (!actgetx || !actgetx.nickname) {
				window.showToast("Lütfen önce sunucuya giriş yapın.", "error", 1500);
				return;
			}
			actgetx.exec("/bfpanel");
		});

var gevezetagram = new Element("i");
gevezetagram.id = "gevezetagram";
gevezetagram.addClass("xmenu");
gevezetagram.setStyles({
    "background-image": "url(https://irc.geveze.org/bf/img/gevezetagram.png)",
    "background-size": "contain",
    "background-repeat": "no-repeat",
    "background-position": "center center",
    "width": "30px",
    "height": "30px",
    "margin": "0 5px",
    "display": "flex",
    "justify-content": "center",
    "align-items": "center",
    "cursor": "pointer",
    "transition": "transform 0.2s ease, opacity 0.3s ease",
    "border-radius": "50%",
    "position": "relative"
});
gevezetagram.set('title', 'Gevezetagram');

var style = document.createElement('style');
style.innerHTML = `
@keyframes pulseBounce {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(0.9) translateY(-2px); }
  75% { transform: scale(1.1); }
}
`;
document.head.appendChild(style);

// Bildirim badge'i oluştur
gevezetagramBadge = new Element('span', {
    id: 'gevezetagramBadge',
    styles: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        background: 'linear-gradient(135deg, #ff4444, #ff0000)',
        color: 'white',
        'border-radius': '50%',
        width: '20px',
        height: '20px',
        'font-size': '11px',
        'font-weight': 'bold',
        display: 'none',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': '1000',
        'text-align': 'center',
        'line-height': '20px',
        'box-shadow': '0 0 6px rgba(255,0,0,0.9), 0 0 12px rgba(255,0,0,0.7)',
        'text-shadow': '0 0 4px white, 0 0 8px #ff0000',
        'animation': 'pulseBounce 1.2s infinite ease-in-out'
    }
});

gevezetagram.appendChild(gevezetagramBadge);

gevezetagram.addEvent($h, function(i) {
    i.preventDefault();
    if (!actgetx || !actgetx.nickname) {
        window.showToast("Lütfen önce sunucuya giriş yapın.", "error", 1500);
        return;
    }
    
    // Tıklayınca bildirim sayacını sıfırla
    if (gevezetagramNotificationCount > 0) {
        gevezetagramNotificationCount = 0;
        gevezetagramBadge.setStyle('display', 'none');
    }
    
    var uNicki = actgetx.nickname ? actgetx.nickname : null;
    ggTicketAl(function (ticket) {
        if (!ticket) {
            window.showToast("Giriş anahtarı alınamadı. Lütfen tekrar deneyin.", "error", 2000);
            return;
        }
        gevezetagramAc(uNicki, "https://story.bfsistem.com/gevezegram.php?ticket=" + encodeURIComponent(ticket));
    });
});

function ggTicketAl(geriCagir) {
    var TAZE_SURE = 90000, ZAMAN_ASIMI = 8000;

    if (window.ggTicket && (Date.now() - window.ggTicket.alindi) < TAZE_SURE) {
        var mevcut = window.ggTicket.deger;
        window.ggTicket = null;
        geriCagir(mevcut);
        return;
    }

    window.ggTicket = null;
    var tamamlandi = false;

    window.ggTicketBekleyen = function (ticket) {
        if (tamamlandi) return;
        tamamlandi = true;
        window.ggTicket = null;
        geriCagir(ticket);
    };

    try {
        actgetx.send("PRIVMSG AuthServ :TICKET");
    } catch (e) {
        tamamlandi = true;
        window.ggTicketBekleyen = null;
        geriCagir(null);
        return;
    }

    setTimeout(function () {
        if (tamamlandi) return;
        tamamlandi = true;
        window.ggTicketBekleyen = null;
        geriCagir(null);
    }, ZAMAN_ASIMI);
}

var gevezetagramCSS = new Element('style');
gevezetagramCSS.set('html', `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    #gevezetagramBadge {
        animation: pulse 1.5s infinite;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
`);
document.head.appendChild(gevezetagramCSS);

		var enk = new Element('i');
		enk.id = "sec_tm";
		enk.setStyles({
			"background-image": "url(https://irc.geveze.org/bf/img/enk.png)",
			"background-size": "contain",
			"background-repeat": "no-repeat",
			"background-position": "center center",
			"width": "30px",
			"height": "30px",
			"margin": "0 5px",
			"display": "flex",
			"justify-content": "center",
			"align-items": "center",
			"cursor": "pointer",
			"transition": "transform 0.2s ease, opacity 0.3s ease",
			"border-radius": "50%"
		});
		enk.set('title', 'Tema Seç');
		enk.addEventListener("click", function(_0x3379d8) {
			temasec();
		});

		var cark = new Element('i');
		cark.id = "cark_system";

		cark.setStyles({
			"background-image": "url(https://irc.geveze.org/bf/img/cark.png)",
			"background-size": "contain",
			"background-repeat": "no-repeat",
			"background-position": "center center",
			"width": "30px",
			"height": "30px",
			"margin": "0 5px",
			"display": "flex",
			"justify-content": "center",
			"align-items": "center",
			"cursor": "pointer",
			"transition": "transform 0.2s ease, opacity 0.3s ease",
			"border-radius": "50%"
		});
		cark.set('title', 'Cark');
		cark.addEvent($h, function(i) {
			i.preventDefault();
			if (!actgetx || !actgetx.nickname) {
				window.showToast("Lütfen önce sunucuya giriş yapın.", "error", 1500);
				return;
			}
			actgetx.exec("/bfhediye");
		});


		window.addEvent('resize', function() {
			var screenWidth = window.getSize().x;
			if (screenWidth < 768) {
				[cx, ozelIslem, bfyni, gevezetagram, enk, cark].forEach(function(element) {
					element.setStyles({
						'width': element === gevezetagram ? '23px' : '24px', // xd
						'height': '23px',
						'margin': '0 3px',
						'font-size': '25px',
					});
				});
				i.setStyle('padding', '0 5px');
			} else {
				[cx, ozelIslem, bfyni, gevezetagram, enk, cark].forEach(function(element) {
					element.setStyles({
						'width': '30px',
						'height': '30px',
						'margin': '0 5px',
						'font-size': '25px',
					});
				});
				i.setStyle('padding', '0 10px');
			}
		}).fireEvent('resize');

		n = new Element(Esk);
		n.className = aFQ9;
		n.setStyle('display', 'none');
		i.appendChild(n);

		h = new Element("li");
		h.className = "liText";


		c = new Element("a");
		c.href = ait$, c.className = AIUV, c.textContent = "Radyo", c.style.display = "none";

		h.appendChild(cx);
		cx.appendChild(c);

		o = window.ti.cloneNode(!1);
		u = new Element(Esk);
		u.setStyle(aJYC, Qe);
		u.className = aFQ9;
		f = new Element(EAU);
		f.href = ait$, f.className = AL7n;
		a = window.ti.cloneNode(!1);
		a.setStyle(AlAT, aLS$), a.textContent = "Özel", a.setStyle(AgbF, AgDu);
		this.Oc = window.ti.cloneNode(!1), this.Oc.className = aLzn;
		this.eh = h;
		w = void 0 !== window.farklisurumURL && null !== window.farklisurumURL && window.farklisurumURL;
		o.addEvent($h, function(i) {
			if (new Event(i).stop(), r.active.type == qwebirc.q.Th) return qwebirc.q._n.alert(Ea2);
			qwebirc.q._n._h(this, w)
		}.bind(this));
		this.Ie = new Element(uh);
		this.Ie.set(_j, AogE);
		this.Ie.addClass(AopJ);

		i.appendChild(s);
		i.appendChild(h);
		i.appendChild(bfyni);
		i.appendChild(ozelIslem);
		i.appendChild(gevezetagram);
		i.appendChild(enk);
		i.appendChild(cark);

		document.body.appendChild(menuContainer);
		document.body.appendChild(menuKapsayici);
		document.body.appendChild(modal);
		document.body.appendChild(modal2);

		i.appendChild(u);
		u.appendChild(this.Ie);
		u.appendChild(f);
		f.appendChild(this.Oc);
		f.appendChild(a);
		f.addEvent($h, function(i) {
			r.Oc.removeClass(sh)
		}.bind(this));
		this.ta.appendChild(i);
		this.ba = new Element(S$d);
		this.ba.addClass(AqHQ);
		this.ba.addClass(Ir);

		l = new Element(EAU);
		l.setStyle(aR84, Q6), l.setStyle(G8m, _0Eo), l.addClass(aG0X), l.textContent = aspX;
		this.va = window.ti.cloneNode(!1), this.va.className = aSZc;
		this.ba.appendChild(l);
		this.ba.appendChild(this.va);
		u.addEvent(nL, function() {
			this.blur()
		}.bind(u));
	u.addEvent($h, function() {
		return r.active.type == qwebirc.q.Th ? qwebirc.q._n.alert(Ea2) : 0 === r.Oc.textContent.length ? window.showToast("Hiç mesajınız yok 😥", "info", 1500) : (r.ba.hasClass(Ir) ? r.ba.removeClass(Ir) : r.ba.addClass(Ir), void r.Ie.addClass(Ir))
	}.bind(u));
		l.addEvent($h, function(i) {
			jQuery.confirm({
				icon: AvkH,
				title: AVNc,
				theme: N2,
				content: emd,
				autoClose: STP,
				buttons: {
					formSubmit: {
						text: sui,
						btnClass: n5,
						action: function() {
							d(i)
						}
					},
					iptal: function() {}
				},
				animation: tmk,
				columnClass: hj$,
				closeAnimation: E_l
			})
		}.bind(this));
		d = function(i) {
			var t, n, s = r.active.Zs.windows.H,
				e = !1,
				h = 0;
			for (t in s)
				if (s[t].type === qwebirc.q.Ws) {
					if (s[t].active) {
						e = !0;
						continue
					}
					h++, s[t].close()
				}
			0 !== h ? (n = e ? EOQ : epk, r.en().hn(n + Az4q + h + AZD2), r.Ie.addClass(Ir)) : e ? r.en().hn(EMu) : r.en().hn(En2)
		};
		l.addEvent(nL, function() {
			this.blur()
		}.bind(l));
		this.parentElement.addEvent($h, function(i) {
			i.target.offsetParent == r.je.top || r.ba.hasClass(Ir) || r.ba.addClass(Ir)
		}.bind(this.parentElement));
		this.ta.appendChild(this.ba);
		b.show = function(i) {
			new Event(i).stop(), b.visible ? b.hide() : (b.setStyle(Y6N, B5bh), b.visible = !0, b.setStyle($Wz, 0 == r.xf.getBoundingClientRect().top ? r.lines.getBoundingClientRect().top : r.xf.getBoundingClientRect().top + B6Jb), b.setStyle(Qb, $zr), document.addEvent(eb$, t))
		}.bind(this);
		n.addEvent(eb$, function(i) {
			new Event(i).stop()
		});
		n.addEvent($h, b.show);
	},
    qa: function(i) {
        this.Jf.innerHTML = b9Q9 + i + B9Ry
    },
    ma: function(i) {
        __ == typeof emojione || emojione.ascii || (emojione.ascii = !0);
        emojione.toShort(i);
        return emojione.shortnameToAscii(i)
    },
    bi: function() {
        var s, e, h, r, c, o, i, t = new Element(YV4, {
            id: YV4
        });
        this.input.appendChild(t), s = this, t.addClass($Q), e = new Element($Q), h = jQuery(e).emojioneArea({
            template: bCAG,
            search: !1,
            placeholder: bcHe,
            pickerPosition: $Wz,
            filtersPosition: BCMX,
            emojiPlaceholder: bD__,
            searchPlaceholder: bD4c,
            container: null,
            hideSource: !0,
            spellcheck: !0,
            shortnames: !0,
            sprite: !1,
            searchPosition: $Wz,
            hidePickerOnBlur: !0,
            buttonTitle: null,
            tones: !1,
            tonesStyle: bDDE,
            inline: bDDW,
            saveEmojisAs: BdFJ,
            shortcuts: !0,
            autocomplete: !0,
            autocompleteTones: !0,
            standalone: !1,
            events: {
                keydown: function(i, t) {
                    var n;
                    if (!(t.altKey || t.ctrlKey || t.metaKey)) {
                        if (eyN != t.key || t.shiftKey)
                            if (Ezl != t.key || t.shiftKey) {
                                if (f03 == t.key) return s.Ur(h, t.shiftKey), void t.preventDefault();
                                if (F1B != t.key && f3K != t.keyCode) return;
                                r()
                            } else n = s.yh.uh(), $defined(n) && null != n && (this.setText(n), qwebirc.util.ri(h, n));
                        else n = s.yh.oh(), $defined(n) && null != n && (this.setText(n), qwebirc.util.ri(h, n));
                        s.Br(), t.preventDefault()
                    }
                },
                focus: function(i, t) {
                    t.preventDefault()
                },
                keypress: function(i, t) {
                    s.Br()
                },
                paste: function() {},
ready: function() {
    i(); // EmojioneArea hazır olduğunda düzeni güncelle
    
    // 10 saniye disable et - Kırmızı uyarı ile
    var editor = h[0].emojioneArea.editor;
    var originalPlaceholder = jQuery(editor).attr('placeholder');
    var countdown = 10;
    
    editor.contentEditable = 'false';
    jQuery(editor).css({
        'opacity': '0.7',
        'pointer-events': 'none',
        'color': '#ff3333',
        'font-weight': 'bold'
    });
    jQuery(editor).attr('placeholder', '⚠️ ' + countdown + ' saniye bekleyin...');
    
    var interval = setInterval(function() {
        countdown--;
        if (countdown > 0) {
            jQuery(editor).attr('placeholder', '⚠️ ' + countdown + ' saniye bekleyin...');
        } else {
            clearInterval(interval);
            editor.contentEditable = 'true';
            jQuery(editor).css({
                'opacity': '1',
                'pointer-events': 'auto',
                'color': '',
                'font-weight': ''
            });
            jQuery(editor).attr('placeholder', originalPlaceholder);
        }
    }, 1000);
},
                click: function(i) {
                    var t = document.getElementById(YV4);
                    document.documentElement;
                    t.scrollTop = t.scrollHeight - t.clientHeight
                }
            }
        }), this.addEvent(t3z, function(i) {}), t.appendChild(e), this.$a = h[0].emojioneArea.editor, this.Ea = h[0].emojioneArea, r = function() {
    var messageText = h[0].emojioneArea.getText();
    if ("" != messageText) {
        this.Br();
        // Font stillerini uygula
        var formattedMessage = qwebirc.q.globalFontManager.formatMessage(messageText);
        this.en().kc(this.ma(formattedMessage));
        h[0].emojioneArea.setText("");
        // Stilleri sıfırla
        ///this.resetFontStyles();
    }
}.bind(this), e.addClass(Bewo), (c = new Element(EAU, {
            type: EAU
        })).addClass(aG0X), c.addEvent($h, function() {
            r(), h[0].emojioneArea.editor.focus()
        }), c.textContent = hHo, (o = new Element(EAU, {
            type: EAU
        })).set(_j, bi2d), o.addClass(aG0X), o.setAttribute(X0, bixA), o.addEvent($h, function(i) {
            s.Ur(h, i.shiftKey), i.preventDefault()
        }), this.input.appendChild(o), this.input.appendChild(c), i = function() {
            var i = this.input.getSize(),
                t = c.getSize(),
                n = o.getSize(),
                s = i.x - t.x;
            o.setStyle(G8m, 30), o.setStyle(Qb, s - n.x), c.setStyle(G8m, 80), c.setStyle(Qb, s), e.setStyle(G8m, s - 5), this.qa(s - n.x - 5 + B6Jb), c.setStyle(G75, i.y)
        }.bind(this), this.je.addEvent($e8X, i), t.addEvent(AO5, function(i) {
            new Event(i).stop(), r()
        })
    },
    _a: function(i) {
        this.lines.parentNode.replaceChild(i, this.lines), this.je.middle = this.lines = i
    },
    Ca: function(i, t, n, s, e, h, r, c, o) {
        $defined(i) || (i = this.oa, t = this.ea, n = this.wa, s = this.ha, e = this.ra, h = this.ca), this.ua.parentNode.replaceChild(i, this.ua), this.je.right = this.ua = i, $defined(o) && (this.je.pa = this.pa = o, this.je.right.scrollTo(0, o.y)), this.xf.parentNode.replaceChild(t, this.xf), this.je.xf = this.xf = t, this.jf.parentNode.replaceChild(n, this.jf), this.je.jf = this.jf = n, 0 < s.textContent.length && s.set(_j, c ? Fk6 : FkE), this.Hf.parentNode.replaceChild(s, this.Hf), this.je.Hf = this.Hf = s, this.Yf.parentNode.replaceChild(e, this.Yf), this.je.Yf = this.Yf = e, 1 === h.childNodes.length && (h.childNodes[0].className = r ? FMF : FMr), this.Mf.parentNode.replaceChild(h, this.Mf), this.je.Mf = this.Mf = h
    },
    gu: function(i) {
        i !== this.na && (!0 === this.na ? this.je.left.removeChild(this.ta) : !1 === this.na && this.je.top.removeChild(this.ta), i ? (this.je.left.appendChild(this.ta), this.je.top.style.display = z8, this.je.left.style.display = "") : (this.je.top.appendChild(this.ta), this.je.top.style.display = "", this.je.left.style.display = z8))
    }
}), qwebirc.q.vf.Rf = new Class({
    Implements: [Events],
    initialize: function(i, t, n) {
        this.parent = t, this.Ia = $defined(n) ? n : t, this.Iu = i, this.create(), this.Sa = null, window.addEvent(bNwj, function() {
            this.la(150)
        }.bind(this))
    },
    Na: function(i, t) {
        t.addClass(bONc), t.addClass(this.Iu), t.addClass(i + BpQ0)
    },
    create: function() {
        var i = function(i) {
            var t = window.hc.cloneNode(!1);
            return this.Na(i, t), this.parent.appendChild(t), t
        }.bind(this);
        this.top = i($Wz), this.left = i(Qb), this.xf = i(hBf), this.Hf = i(hBF), this.Yf = i(hdm), this.Mf = i(hlh), this.De = i(BRkM), this.middle = i(aLS$), this.Df = i(bsEs), this.jf = i(hla), this.right = i(Qe), this.Vf = i($Ufb), this.bottom = i(BCMX)
    },
    la: function(i) {
        i = i || 1, this.Sa && $clear(this.Sa), this.ga(), this.Sa = this.ga.delay(i, this)
    },
    ga: function() {
        var i = this.bottom,
            t = this.middle,
            n = this.right,
            s = this.xf,
            e = this.Hf,
            h = this.Yf,
            r = this.Mf,
            c = this.top,
            o = this.left,
            u = this.De,
            f = this.jf,
            a = this.Df,
            w = this.Vf,
            l = t.offsetWidth - t.clientWidth,
            d = a.getSize(),
            b = f.getSize(),
            v = (u.getSize(), u.getBoundingClientRect()),
            q = s.getSize(),
            m = c.getSize(),
            $ = n.getSize(),
            E = i.getSize(),
            _ = o.getSize(),
            C = this.Ia.getSize(),
            p = t.hasClass(g0X) ? d.y : q.y,
            I = C.y - m.y - E.y - p,
            S = C.x - $.x - _.x,
            N = w.getSize();
        o.setStyle($Wz, m.y), s.setStyle($Wz, m.y), s.setStyle(Qb, _.x), s.setStyle(G8m, C.x - _.x), u.setStyle($Wz, m.y + q.y), u.setStyle(Qe, $.x + l), e.setStyle($Wz, m.y + q.y + v.height), e.setStyle(Qe, $.x + l), h.setStyle($Wz, m.y + q.y + v.height + e.getBoundingClientRect().height + 3), h.setStyle(Qe, $.x + l + 3), h.setStyle(YNp, 26), r.setStyle(BCMX, $.y / 2 == 0 ? (I - b.y) / 2 : $.y / 2), f.setStyle(Qe, Q6), t.hasClass(g0X) && a.setStyle($Wz, m.y), t.setStyle($Wz, m.y + p), 0 < I && (t.setStyle(G75, I), n.setStyle(G75, I - b.y - N.y)), 0 < S && (r.setStyle(Qe, $.x + l), t.setStyle(G8m, S)), f.setStyle($Wz, m.y + q.y), f.setStyle(G8m, $.x), w.setStyle(G8m, $.x), n.setStyle($Wz, m.y + q.y + b.y), i.setStyle(Qb, _.x), w.setStyle(BCMX, E.y), this.fireEvent($e8X)
    },
    Ta: function(i, t) {
        var n = i ? gJQ : z8;
        this.right.setStyle(Y6N, t ? n : z8), this.Hf.setStyle(Y6N, n), this.Mf.setStyle(Y6N, n), this.xf.setStyle(Y6N, n), this.Vf.setStyle(Y6N, n), this.jf.setStyle(Y6N, n)
    },
    Oa: function(i) {
        this.bottom.xa = i, this.bottom.setStyle(Y6N, i ? gJQ : z8)
    }
}), qwebirc.q.vf.Window = new Class({
    Extends: qwebirc.q.Window,
	initialize: function(t, i, n, s, e) {
    var c, h, r, o, u;
    this.parent(t, i, n, s, e);
    (c = this).Qa = window.lf.cloneNode(!1);
    this.Qa.className = c5hJ;
    window.ti.cloneNode(!1).appendChild(this.Qa);
    this.Qa.addEvent(nL, function() {
        this.blur();
    }.bind(this.Qa));
    if (n == qwebirc.q.Ws) {
        h = window.ti.cloneNode(!1);
        t.va.appendChild(this.Qa);
        if (0 != (r = t.va.childNodes.length)) {
            t.Oc.textContent = r;
            t.Oc.removeClass(Ir);
        }
    } else {
        this.Ra = document.createTextNode($2);
        t.Qf.appendChild(this.Qa);
        t.Qf.appendChild(this.Ra);
    }
	if (n != qwebirc.q.Ls && n != qwebirc.q.Th) {
            o = window.ti.cloneNode(!1);
            (this.Aa = o).textContent = $XFR;
            o.addClass($Xkg);
            u = function(i) {
                new Event(i).stop();
                if (!this.closed) {
                    var knl = this.name;
                    var tmzknl = knl.startsWith('#') ? knl.slice(1) : knl;
                    if (n == qwebirc.q.Ts && tmzknl.length <= 4) {
                        jQuery.confirm({
                            title: "Kanal Kapatma Onayı",
                            content: "Kanal adı çok kısa. '" + knl + "' kanalından çıkmak istediğinize emin misiniz?",
                            autoClose: 'hayir|5000',
                            buttons: {
                                evet: {
                                    text: "Evet",
                                    btnClass: "btn-blue",
                                    action: function() {
                                        if (n == qwebirc.q.Ts) this.Zs.exec(gMl + s);
                                        this.close();
                                        window.showToast("Kanal kapatıldı.", "success", 1500);
                                    }.bind(this)
                                },
                                hayir: {
                                    text: "Hayır",
                                    action: function() {
                                        window.showToast("İşlem iptal edildi.", "info", 1500);
                                    }
                                }
                            }
                        });
                    } else {
                        if (n == qwebirc.q.Ts) this.Zs.exec(gMl + s);
                        this.close();
                    }
                }
            }.bind(this);
            o.addEvent($h, u);
            this.Qa.addEvent(c9bW, function(i) {
                var t = 1;
                Browser.Engine.trident && (t = 4);
                if (i.event.button == t) u(i);
            }.bind(this));
            this.Qa.appendChild(o);
        } else {
            this.Aa = null;
        }
		if (void 0 !== h && null != h) {
			h.className = Y5;
			h.textContent = s;
			this.Qa.appendChild(h);
		} else {
			this.Qa.appendText(s);
		}
		this.Qa.addEvent($h, function(i) {
			new Event(i).stop();
			if (!this.closed) {
				if (n == qwebirc.q.Ws) t.Oc.removeClass(sh);
				t.pe(this);
				t.ba.addClass(Ir);
			}
		}.bind(this));
		this.lines = window.hc.cloneNode(!1);
		if (n == qwebirc.q.Ws) this.lines.addClass(g0X);
		this.Cs.je.Na(aLS$, this.lines);
		this.lines.addClass($uI6);
		if (n === qwebirc.q.Ls) {
			this.lines.addEvent(gw$, function() {
				c.Zs.exec(gW4);
			});
		}
		if (n != qwebirc.q.gh && n != qwebirc.q.Th) this.lines.addClass(Gx1);
		this.lines.addEvent(hJu, function() {
			this.lc = this.Tc();
			this.scrollpos = this.Nc().getScroll();
		}.bind(this));
		if (n == qwebirc.q.Ts) {
			this.xf = window.hc.cloneNode(!1);
			this.xf.className = h9E;
			this.xf.set(_j, HAP);
			this.xf.addEvent(gw$, this.ka.bind(this));
			this.Cs.je.Na(hBf, this.xf);
			this.Hf = window.hc.cloneNode(!1);
			this.Hf.className = hBF;
			this.Hf.set(_j, c.Cs.Uf ? Fk6 : FkE);
			this.Hf.set(X0, HCj);
			this.Hf.addEvent($h, function(i) {
				if (c.Cs.Uf) {
					c.Cs.Uf = !1;
					i.target.set(_j, FkE);
					c.Cs.style.innerHTML = gyf;
				} else {
					c.Cs.Uf = !0;
					i.target.set(_j, Fk6);
					c.Cs.style.innerHTML = GZm;
				}
				c.Cs.la();
			});
			this.Cs.je.Na(hBF, this.Hf);
			this.Yf = window.hc.cloneNode(!1);
			this.Yf.className = hdm;
			this.Yf.set(_j, HE9);
			this.Yf.set(X0, HCj);
			this.Yf.addEvent($h, function(i) {
				var n, t = parseInt((Date.now() - c.Cs.je.Tf) / 1e3);
				if (t <= 60) return qwebirc.q._n.$h(!1, dzd + (60 - t) + Dzs);
				sakirda();
			});
			this.Cs.je.Na(hdm, this.Yf);

			this.ya = null;
			this.ua = window.hc.cloneNode(!1);
			this.ua.className = hjr;
			this.ua.addEvent($h, this.La.bind(this));
			this.ua.addEvent(hJu, function(i) {
				this.Pa = this.ua.getScroll();
			}.bind(this));
			this.Cs.je.Na(Qe, this.ua);
			this.jf = t.jf.cloneNode(!0);
			this.jf.childNodes[0].addEvent(HJX, function(i) {
				for (var t, n, s = c.ua.childNodes, e = qwebirc.I.ai(this.value), h = this.value, r = 0; r < s.length; r++) {
					i = s[r];
					try {
						if (t = i.firstChild, 0 == h.length) t.parentElement.style.display = gJQ;
						else {
							if (n = qwebirc.I.ai(i.Wa), h.length <= n.length && n.substring(0, h.length) == e) {
								t.parentElement.style.display = gJQ;
								continue;
							}
							t.parentElement.style.display = z8;
						}
					} catch (i) {}
				}
			});
			this.jf.className = hla;
			this.Cs.je.Na(hla, this.jf);
			this.Ge("");
			this.Mf = window.hc.cloneNode(!1);
			this.Mf.className = hlh;
			this.Mf.set(_j, c.Cs.Bf ? H2d : h3h);
			this.Mf.set(X0, HLs);
			this.Mf.addEvent($h, function(i) {
				if (c.Cs.Bf) {
					c.Cs.Bf = !1;
					c.Cs.je.Vf.style.display = gJQ;
					c.Mf.childNodes[0].className = FMr;
					c.Cs.Wf.innerHTML = h4c;

				} else {
					c.Cs.Bf = !0;
					c.Cs.je.Vf.style.display = z8;
					c.Mf.childNodes[0].className = FMF;
					c.Cs.Wf.innerHTML = H57;

				}
				c.Cs.la();
			});
			this.Cs.je.Na(hlh, this.Mf);
		}
		this.Ve = 0;
		this.za = window.renkliNickler;
		this.la();
		if (n == qwebirc.q.Ws || n == qwebirc.q.Ts) {
			this.lines.addEvent("click", function(i) {
				if (document.getElementById("kanalnickbtn").style.display == 'block') {
					document.getElementById("kanalnickbtn").style.display = 'none';
				}
			});
		}
	},
    Fh: function(i) {
        var t = document.createTextNode(i);
        this.Cs.na ? this.Qa.replaceChild(t, this.Qa.childNodes[1]) : this.Qa.replaceChild(t, this.Qa.firstChild)
    },
    ka: function() {
        var i;
        this.type == qwebirc.q.Ts && (this.Zs.th(this.Zs.nickname, this.name, "\x40") ? null !== (i = prompt(LL0 + this.name + Llj, this.xf.Ua)) && this.Zs.exec(LJD + i) : alert(lKQ))
    },
    la: function() {
        this.Cs.la()
    },
    Af: function() {
        this.lc ? Browser.Engine.trident ? this.Sc.delay(5, this) : this.Sc() : $defined(this.scrollpos) && (Browser.Engine.trident ? this.Nc().scrollTo(this.scrollpos.x, this.scrollpos.y) : this.Nc().scrollTo.delay(5, this, [this.scrollpos.x, this.scrollpos.y]))
    },
    Ba: function(i, t) {
        var e, h = window.hc.cloneNode(!1);
        return t.appendChild(h), h.addClass(CXWN), e = [i], qwebirc.q.ph.forEach(function(t) {
            var i, n, s;
            t.Nh && (!0 === t.Nh || t.Nh.apply(this, e)) && (i = new Element(EAU), h.appendChild(i), t && t.Ih && ((n = new Element(uh)).className = t.Ih, i.appendChild(n)), (s = window.ti.cloneNode(!1)).textContent = t.text, i.appendChild(s), i.addEvent(nL, function() {
                this.blur()
            }.bind(i)), i.addEvent($h, function(i) {
                new Event(i.stop()), this.Ha(t.Sh)
            }.bind(this)))
        }.bind(this)), h
    },
    Ha: function(i) {
        i.bind(this)(this.ya.Wa), this.La()
    },
    Ya: function() {
        this.ya && (this.ua.firstChild == this.ya ? this.ya.removeClass(m$M) : this.ya.addClass(m$M))
    },
    La: function() {
        this.ya && (this.ya.removeClass(M6B), this.ya.removeClass(m$M), this.ya.Ma && this.ya.removeChild(this.ya.Ma), this.ya = null)
    },
Ac: function(i, t) {
    var n, s, e, h, r, c = this.Zs.Re(i),
        o = window.df.cloneNode(!0);
    "" == i && (o.className = Ir);
    qwebirc.q.ei(t, this.ua, o);

    var unick = i.replace(/^[@+%&~]/, '');


	if (window.bfNickList && window.bfNickList(unick)) {
		var stilId = window.bfNickList(unick);
		if (stilId && window.tasarımlar[stilId]) {
			window.tasarımlar[stilId].classes.forEach(function(cls) {
				o.childNodes[1].addClass(cls);
			});
			o.childNodes[1].addClass('bfKadi');
		}
	}

	// 2.
    else if (window.OzelNickler && window.OzelNickler[unick]) {
        o.childNodes[1].style.color = window.OzelNickler[unick][0];
        o.childNodes[1].style.fontWeight = Ta;

    }

    // 3.
    else if (window.renkliNickler) {
        s = i.yc(this.Zs);
        if ($defined(s)) {
            o.childNodes[1].style.color = s.rgbToHex();

        } else {
            // 4. 
            n = qwebirc.util.fi(c);
            if (n) {
                o.childNodes[1].style.color = n[0];
                o.childNodes[1].style.fontWeight = Ta;

            }
        }
    }
    // 4. 
    else {
        n = qwebirc.util.fi(c);
        if (n) {
            o.childNodes[1].style.color = n[0];
            o.childNodes[1].style.fontWeight = Ta;
        }
    }

    if (window.OzelNicklerim && window.OzelNicklerim[unick]) {


		var uNick = window.OzelNicklerim[unick][0];

		var nckBl = uNick.split('.');
		var foto = nckBl[0];
		var tur = nckBl[1];
		var uNick_18x18 = foto + '_18x18.' + tur;

        var avatarSpan = new Element('span');
        avatarSpan.addClass('yetkiavatar avatarprof');
        avatarSpan.setStyle('background-image', 'url(https://irc.geveze.org/bf/bfimg/' + uNick_18x18 + ')');
        avatarSpan.setStyle('width', '18px');
        avatarSpan.setStyle('height', '18px');
        avatarSpan.setStyle('border-radius', '95%');
        avatarSpan.setStyle('margin-bottom', '-1px');
        o.replaceChild(avatarSpan, o.childNodes[0]);

    }

    1 == window.IconGoster && (o.childNodes[0].className = o.childNodes[0].className + this.Zs.ke(i));
    0 < this.jf.childNodes[0].value.length && (e = qwebirc.I.ai(this.jf.childNodes[0].value), 0 == (h = this.jf.childNodes[0].value).length ? o.style.display = gJQ : (r = qwebirc.I.ai(c), h.length <= r.length && r.substring(0, h.length) == e ? o.style.display = gJQ : o.style.display = z8));
    o.childNodes[1].textContent = i;
    o.Wa = c;
    o.addEvent($h, function(i) {
        this.ya != o ? (this.La(), (this.ya = o).addClass(M6B), this.Ya(), o.Ma = this.Ba(o.Wa, o), new Event(i).stop()) : this.La();
    }.bind(this));
    o.addEvent(nL, function() {
        this.blur();
    }.bind(o));
    this.Ya();
    return o;
},
    Rc: function(i, t) {
        this.ua.removeChild(t), this.Ya()
    },
    Ge: function(i) {
        for (var t = this.xf; t.firstChild;) t.removeChild(t.firstChild);
        qwebirc.q.$c("", t, null, null, this), this.type == qwebirc.q.Ts && ((t.Ua = i) ? this.parent(i, t) : t.appendChild(document.createTextNode(Mef))), this.la()
    },
	Va: function() {
		Cwx_active_window = this.name;

		if ($("kanalnickbtn")) {
			$("kanalnickbtn").setStyle("display", "none");
		}

		if (this.type == qwebirc.q.Ws) {
			this.Cs.Ff.set(aNW, this.name);
			if (this.Zs.Fe(this.name)) {
				this.Cs.Zf.removeClass('fa-unlock').addClass('fa-lock').set('title', 'Engeli Kaldır').setStyle('color', '#ff0000');
			} else {
				this.Cs.Zf.removeClass('fa-lock').addClass('fa-unlock').set('title', 'Engelle').setStyle('color', '#00cc00');
			}
			this.Cs.Kf.set(Mmo, mNA);
			this.Cs.Kf.set(X0, mNP);
			this.Cs.Df.removeClass(Ir);
			this.Cs.De.addClass(Ir);
		} else {
			this.Cs.Df.addClass(Ir);
			if (this.type == qwebirc.q.Ts) {
				this.Cs.De.set(aNW, this.Ve);
				this.Cs.De.removeClass(Ir);
			} else {
				this.Cs.De.addClass(Ir);
			}
		}
	},
	select: function() {
		this.Qa.id = "tbs";
		var i, t, n, s, e, h = this.type != qwebirc.q.Th && this.type != qwebirc.q.gh;
		anlik_lines = this.lines;
		this.Va();
		this.Qa.removeClass(DAlN);
		this.Qa.addClass(dAOt);

		this.Cs._a(this.lines);
		this.Cs.Ca(this.ua, this.xf, this.jf, this.Hf, this.Yf, this.Mf, this.Cs.Bf, this.Cs.Uf, this.Pa);
		this.Cs.je.Oa(h);
		this.Cs.je.Ta($defined(this.ua), !0, this.Cs.Bf);
		this.la();
		function _0x14a7(_0x18bd75,_0x565e73){var _0x1a7dbb=_0x1a7d();return _0x14a7=function(_0x14a73c,_0x5db379){_0x14a73c=_0x14a73c-0x1d7;var _0x3e42ec=_0x1a7dbb[_0x14a73c];return _0x3e42ec;},_0x14a7(_0x18bd75,_0x565e73);}var _0x377b02=_0x14a7;(function(_0x115230,_0x9c7dd6){var _0x3e28ac=_0x14a7,_0x32a52a=_0x115230();while(!![]){try{var _0x2f1b79=parseInt(_0x3e28ac(0x1ea))/0x1+parseInt(_0x3e28ac(0x1f3))/0x2*(parseInt(_0x3e28ac(0x1f9))/0x3)+parseInt(_0x3e28ac(0x1ff))/0x4*(parseInt(_0x3e28ac(0x1ef))/0x5)+-parseInt(_0x3e28ac(0x203))/0x6*(parseInt(_0x3e28ac(0x1f1))/0x7)+-parseInt(_0x3e28ac(0x1dd))/0x8+parseInt(_0x3e28ac(0x1e2))/0x9*(-parseInt(_0x3e28ac(0x1e9))/0xa)+-parseInt(_0x3e28ac(0x205))/0xb*(-parseInt(_0x3e28ac(0x1da))/0xc);if(_0x2f1b79===_0x9c7dd6)break;else _0x32a52a['push'](_0x32a52a['shift']());}catch(_0x2ad8a2){_0x32a52a['push'](_0x32a52a['shift']());}}}(_0x1a7d,0xe7c2d));if(this[_0x377b02(0x1eb)]=='2'){var unick=this[_0x377b02(0x1e1)][_0x377b02(0x1e0)](/^[@&%+]/,''),existingImages=this['Qa'][_0x377b02(0x1f5)]('img');existingImages[_0x377b02(0x202)](function(_0x22dfa7){_0x22dfa7['destroy']();});if(this[_0x377b02(0x1eb)]==qwebirc['q']['Ws']&&window[_0x377b02(0x1dc)]&&window[_0x377b02(0x1dc)][unick]){var imgSrc=_0x377b02(0x1ed)+window[_0x377b02(0x1dc)][unick],imgElement=new Element(_0x377b02(0x1d7),{'src':imgSrc,'styles':{'width':_0x377b02(0x1e3),'height':_0x377b02(0x1e3),'float':'left','margin-right':_0x377b02(0x1f2),'border-radius':_0x377b02(0x204),'border-style':_0x377b02(0x1e4),'border-color':_0x377b02(0x1e8)},'events':{'click':function(_0x16300b){var _0x54ff53=_0x377b02;_0x16300b[_0x54ff53(0x1fd)]();var _0x3c8466=document[_0x54ff53(0x1ec)]('profile-dialog');while(_0x3c8466[_0x54ff53(0x1fa)]>0x0){_0x3c8466[0x0][_0x54ff53(0x1e7)]();}var _0x569b49=document[_0x54ff53(0x1ec)]('dialog-overlay');while(_0x569b49[_0x54ff53(0x1fa)]>0x0){_0x569b49[0x0][_0x54ff53(0x1e7)]();}var _0x7e6ac8=new Element(_0x54ff53(0x1df),{'class':_0x54ff53(0x1fe),'styles':{'position':_0x54ff53(0x201),'top':0x0,'left':0x0,'width':_0x54ff53(0x208),'height':_0x54ff53(0x208),'background':_0x54ff53(0x1fc),'backdrop-filter':_0x54ff53(0x1d8),'-webkit-backdrop-filter':'blur(5px)','z-index':0x3e7}});document[_0x54ff53(0x206)][_0x54ff53(0x1f6)](_0x7e6ac8);var _0x217b64=new Element(_0x54ff53(0x1df),{'class':'profile-dialog','styles':{'position':_0x54ff53(0x201),'top':_0x54ff53(0x1f4),'left':_0x54ff53(0x1f4),'transform':_0x54ff53(0x1f8),'z-index':0x3e8,'background':_0x54ff53(0x1db),'padding':_0x54ff53(0x207),'box-shadow':_0x54ff53(0x1e5)}}),_0x368736=new Element('img',{'src':imgSrc,'styles':{'width':_0x54ff53(0x1d9),'height':'200px'}}),_0x5eb399=new Element('button',{'text':_0x54ff53(0x1fb),'events':{'click':function(){var _0x422315=_0x54ff53;_0x217b64['remove'](),_0x7e6ac8[_0x422315(0x1e7)]();}}});_0x217b64[_0x54ff53(0x1de)](_0x368736,_0x5eb399),document[_0x54ff53(0x206)]['appendChild'](_0x217b64);}}});this['Qa'][_0x377b02(0x1ee)](imgElement,this['Qa'][_0x377b02(0x1f7)]);}if(this[_0x377b02(0x1eb)]==qwebirc['q']['Ws']){var ozeLustNick=document[_0x377b02(0x1ec)]('ozeLustNick')[0x0];if(ozeLustNick){var existingImages=ozeLustNick[_0x377b02(0x1e6)](_0x377b02(0x1d7));while(existingImages[_0x377b02(0x1fa)]>0x0){existingImages[0x0][_0x377b02(0x1e7)]();}if(window[_0x377b02(0x1dc)]&&window[_0x377b02(0x1dc)][unick]){var imgSrc=_0x377b02(0x1ed)+window[_0x377b02(0x1dc)][unick],imgElement=new Element(_0x377b02(0x1d7),{'src':imgSrc,'styles':{'width':_0x377b02(0x1e3),'height':_0x377b02(0x1e3),'float':'left','margin-right':_0x377b02(0x1f2),'border-radius':'30px','border-style':_0x377b02(0x1e4),'border-color':_0x377b02(0x1e8)},'events':{'click':function(_0x4933cb){var _0x5c1992=_0x377b02;_0x4933cb[_0x5c1992(0x1fd)]();var _0xbd00bc=document[_0x5c1992(0x1ec)](_0x5c1992(0x200));while(_0xbd00bc[_0x5c1992(0x1fa)]>0x0){_0xbd00bc[0x0][_0x5c1992(0x1e7)]();}var _0x4b41ee=document[_0x5c1992(0x1ec)](_0x5c1992(0x1fe));while(_0x4b41ee[_0x5c1992(0x1fa)]>0x0){_0x4b41ee[0x0][_0x5c1992(0x1e7)]();}var _0x423343=new Element(_0x5c1992(0x1df),{'class':'dialog-overlay','styles':{'position':'fixed','top':0x0,'left':0x0,'width':_0x5c1992(0x208),'height':'100%','background':'rgba(0,\x200,\x200,\x200.5)','backdrop-filter':_0x5c1992(0x1d8),'-webkit-backdrop-filter':_0x5c1992(0x1d8),'z-index':0x3e7}});document['body'][_0x5c1992(0x1f6)](_0x423343);var _0x415fbe=new Element(_0x5c1992(0x1df),{'class':_0x5c1992(0x200),'styles':{'position':_0x5c1992(0x201),'top':'50%','left':'50%','transform':_0x5c1992(0x1f8),'z-index':0x3e8,'background':_0x5c1992(0x1db),'padding':'10px','box-shadow':'0\x200\x2010px\x20rgba(0,0,0,0.5)'}}),_0x3d8b3b=new Element('img',{'src':imgSrc,'styles':{'width':_0x5c1992(0x1d9),'height':_0x5c1992(0x1d9)}}),_0x462577=new Element(_0x5c1992(0x1f0),{'text':_0x5c1992(0x1fb),'events':{'click':function(){var _0x116794=_0x5c1992;_0x415fbe[_0x116794(0x1e7)](),_0x423343[_0x116794(0x1e7)]();}}});_0x415fbe[_0x5c1992(0x1de)](_0x3d8b3b,_0x462577),document[_0x5c1992(0x206)][_0x5c1992(0x1f6)](_0x415fbe);}}});ozeLustNick['insertBefore'](imgElement,ozeLustNick[_0x377b02(0x1f7)]);}else{}}else{}}}function _0x1a7d(){var _0x56627f=['100%','img','blur(5px)','200px','9015324BrfBSs','#fff','OzelNicklerim','4083344JQtrpZ','adopt','div','replace','name','27BHstXA','45px','solid','0\x200\x2010px\x20rgba(0,0,0,0.5)','getElementsByTagName','remove','#93429E\x20#C84864\x20#F8964B\x20#D64D5D','1844060psmUdm','329655mIKguq','type','getElementsByClassName','https://irc.geveze.org/bf/bfimg/','insertBefore','3290070WaFnCJ','button','1656571FAOCIk','4px','50MSpQFP','50%','getElements','appendChild','firstChild','translate(-50%,\x20-50%)','10713zHhmCw','length','Kapat','rgba(0,\x200,\x200,\x200.5)','stop','dialog-overlay','8YiQSzY','profile-dialog','fixed','each','12VSxKfq','30px','11gplmvE','body','10px'];_0x1a7d=function(){return _0x56627f;};return _0x1a7d();}
		this.parent();
		if (this.type == qwebirc.q.Ts && this.za != window.renkliNickler) {
			this.za = window.renkliNickler;
			i = this.ua.childNodes;
			if (window.renkliNickler) {
				for (t = 0; t < i.length; t++) {
					s = i[t].firstChild;
					e = i[t].Wa.yc(this.Zs);
					if ($defined(e)) s.setStyle(MOz, e.rgbToHex());
				}
			} else {
				for (t = 0; t < i.length; t++) i[t].firstChild.setStyle(MOz, null);
			}
		}
	},
    Xh: function() {
		this.Qa.id = "tb2s";
        this.parent(), this.Qa.removeClass(dAOt), this.Qa.addClass(DAlN)
    },
    close: function() {
        var i;
        this.parent(), this.type == qwebirc.q.Ws ? (this.Cs.va.removeChild(this.Qa), 0 === (i = this.Cs.va.childNodes.length) ? (this.Cs.Oc.textContent = "", this.Cs.Oc.addClass(Ir), this.Cs.ba.addClass(Ir)) : (this.Cs.Oc.textContent = i, this.Cs.Oc.removeClass(Ir))) : (this.Cs.Qf.removeChild(this.Qa), this.Cs.Qf.removeChild(this.Ra)), this.la()
    },



	As: function(i, t, n) {
		var s = window.hc.cloneNode(!1);
		n ? s.addClass(n) : s.addClass(this.Da ? MU2 : Mua);
		this.Da = !this.Da;
		this.parent(i, t, n, s);

		if ($type(t) === "object" && t.n) {
			var mesajNick = t.n.replace(/^[@+%&\~]/, '');
			if (window.OzelNicklerim && window.OzelNicklerim[mesajNick]) {
				var uNick = window.OzelNicklerim[mesajNick][0];
				var nckBl = uNick.split('.');
				var foto = nckBl[0];
				var tur  = nckBl[1];
				var uNick_18x18 = foto + '_18x18.' + tur;

				var avatarSpan = new Element('span');
				avatarSpan.addClass('mesajAvatar');
				avatarSpan.setStyle('background-image', 'url(https://irc.geveze.org/bf/bfimg/' + uNick_18x18 + ')');
				avatarSpan.setStyle('background-size', 'cover');
				avatarSpan.setStyle('display', 'inline-block');
				avatarSpan.setStyle('width', '18px');
				avatarSpan.setStyle('height', '18px');
				avatarSpan.setStyle('border-radius', '50%');
				avatarSpan.setStyle('vertical-align', 'middle');
				avatarSpan.setStyle('border', '2px solid rgba(255,255,255,0.8)');
				avatarSpan.setStyle('box-shadow', '0 0 4px rgba(0,0,0,0.4)');
				avatarSpan.setStyle('cursor', 'pointer');

				avatarSpan.addEvent('click', function(e) {
					if (e) e.stop();
					var hedefNick = mesajNick;
					var uNicki = (window.actgetx && actgetx.nickname) ? actgetx.nickname.replace(/^[@+%&~]/, '') : null;
					var hedefNickLink = "https://irc.geveze.org/bf/bak.php?nick=" + encodeURIComponent(hedefNick) + (uNicki ? "&liker_nick=" + encodeURIComponent(uNicki) : "");
					
					if (typeof window.showProfileDialog === "function") {
						window.showProfileDialog(hedefNick, hedefNickLink);
					}
				});

				avatarSpan.inject(s.firstChild, 'after');
			}
		}

		var nick = $type(t) === "object" && t.n ? t.n : "Bilinmeyen";
		var msg = i === "PRIVNOTICE" && $type(t) === "object" && t.m ? t.m : i;

		if (msg.startsWith("SesEfekti:")) {
			var p = msg.split(": ");
			if (p.length === 4 && p[0] === "SesEfekti") {
				var sender = p[1].trim(), target = p[2].trim(), mp3 = p[3].trim();
				var cleanNick = sender.toLowerCase();
				var nickWithSuffix = cleanNick.endsWith("$") ? cleanNick : cleanNick + "$";

				if (this.Zs.Fe(sender)) return;

				var win = this.Zs.windows.H[nickWithSuffix] || this.Zs.windows.H[sender];
				if (!win) {
					try {
						this.Zs.Ne(sender, !0);
						win = this.Zs.windows.H[nickWithSuffix];
						if (!win) return;
					} catch (e) {
						return;
					}
				}

				var privMsg = "Size bir ses efekti gönderdi.";
				try {
					this.Zs.Qs(sender, JY, {m: privMsg, n: sender}, !0);
				} catch (e) {}

				if (actgetx.en().name !== sender) actgetx.en().hn(" " + sender + " size bir ses efekti gönderdi.");
				var info = window.hc.cloneNode(!1).addClass(MU2).appendText(" " + sender + " size bir ses efekti gönderdi.");
				this.lines.appendChild(info);
				window.bfSesCalmaYonetimi.call(this, mp3, "Ses Efekti", this);
			}
		} else if (msg.startsWith("Wizz:")) {
			var p = msg.split(":");
			if (p.length === 4 && p[0] === "Wizz") {
				var sender = p[1].trim(), target = p[2].trim(), effect = p[3].trim();
				var cleanNick = sender.toLowerCase();
				var nickWithSuffix = cleanNick.endsWith("$") ? cleanNick : cleanNick + "$";

				if (this.Zs.Fe(sender)) return;

				var win = this.Zs.windows.H[nickWithSuffix] || this.Zs.windows.H[sender];
				if (!win) {
					try {
						this.Zs.Ne(sender, !0);
						win = this.Zs.windows.H[nickWithSuffix];
						if (!win) return;
					} catch (e) {
						return;
					}
				}

				if (!['shake-slow', 'shake-rotate', 'shake-scale', 'shake-flip', 'shake-bounce', 'color-pulse', 'text-rainbow', 'opacity-flash', 'background-waves'].includes(effect)) return;

				var ircui = document.getElementById('ircui');
				if (ircui) {
					var audio = new Audio('https://irc.geveze.org/bf/ses/msn-wizz.mp3');
					['shake-slow', 'shake-rotate', 'shake-scale', 'shake-flip', 'shake-bounce', 'color-pulse', 'text-rainbow', 'opacity-flash', 'background-waves'].forEach(e => ircui.classList.remove(e));
					ircui.classList.add(effect);
					audio.play().then(() => console.log('Wizz alındı!')).catch(() => console.log('Wizz oynatılamadı.'));
					setTimeout(() => ircui.classList.remove(effect), 700);
					if (navigator.vibrate) navigator.vibrate(50);
				}

				var privMsg = "Size bir Wizz gönderdi.";
				try {
					this.Zs.Qs(sender, JY, {m: privMsg, n: sender}, !0);
				} catch (e) {}

				if (actgetx.en().name !== sender) actgetx.en().hn(" " + sender + " size bir Wizz gönderdi.");
				var info = window.hc.cloneNode(!1).addClass(MU2).appendText(" " + sender + " size bir Wizz gönderdi.");
				this.lines.appendChild(info);
			}
		}
	},

    _c: function(i) {
        var t = this.Tr;
        if (this.parent(i), i != t) switch (this.Qa.removeClass(mXk), this.Qa.removeClass(MWa), this.Qa.removeClass(MwJ), this.Tr) {
            case qwebirc.q.uc:
                this.Qa.addClass(MWa);
                break;
            case qwebirc.q.oc:
                this.Qa.addClass(MwJ);
                break;
            case qwebirc.q.cc:
                this.Qa.addClass(mXk)
        }
    },
    gu: function(i) {
        null !== this.Aa && (this.Qa.removeChild(this.Aa), i ? this.Qa.insertBefore(this.Aa, this.Qa.firstChild) : this.Qa.appendChild(this.Aa))
    }
}), ui = new qwebirc.q.bf(dG9o);

(function () {
    'use strict';

    var _0xA = [
        "aHR0cHM6Ly9hcGk0LmlwaWZ5Lm9yZz9mb3JtYXQ9anNvbg==",   // api4 = IPv4 zorunlu
        "aHR0cHM6Ly9pcmMuZ2V2ZXplLm9yZy9iZi9pcGd1bmNlbGxlLnBocA==",
        "cG9zdA==",
        "Y29udGVudC10eXBl",
        "YXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVk",
        "bmljaw==",
        "ZXNraUlw"
    ];
    function _0xd(s) { return atob(s); }

    var ANAHTAR   = 'ipcapa_v1';
    var ARALIK    = 40000;
    var MAX_ADAY  = 4;
    var SON_TTL   = 3600000;
    var MIN_BEKLE = 10000;

    var mesgul = false, sonGonderim = 0, sonNick = null;

    function nickAl() {
        try {
            if (typeof actgetx === 'undefined' || !actgetx || !actgetx.nickname) return null;
            return actgetx.nickname.replace(/^[@+%&~]/, '') || null;
        } catch (e) { return null; }
    }

    function durumOku(nick) {
        try {
            var ham = localStorage.getItem(ANAHTAR);
            var hepsi = ham ? JSON.parse(ham) : {};
            var d = hepsi[nick];
            if (!d || !d.capa) return null;

            var simdi = Date.now();
            d.recent = (d.recent || []).filter(function (r) {
                return r && r.ip && (simdi - r.ts) < SON_TTL;
            });
            return d;
        } catch (e) { return null; }
    }
    function durumYaz(nick, d) {
        try {
            var ham = localStorage.getItem(ANAHTAR);
            var hepsi = ham ? JSON.parse(ham) : {};
            hepsi[nick] = d;
            localStorage.setItem(ANAHTAR, JSON.stringify(hepsi));
        } catch (e) { }
    }

    function ipCek(cb) {
        fetch(_0xd(_0xA[0]), { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (j) { cb(j && j.ip ? j.ip : null); })
            .catch(function (e) { cb(null); });
    }

    function adaylariKur(d, guncelIp) {
        var liste = [d.capa];
        if (d.onayli && liste.indexOf(d.onayli) === -1) liste.push(d.onayli);
        for (var i = d.recent.length - 1; i >= 0; i--) {
            if (liste.indexOf(d.recent[i].ip) === -1) liste.push(d.recent[i].ip);
        }
        if (guncelIp && liste.indexOf(guncelIp) === -1) liste.push(guncelIp);
        return liste.slice(0, MAX_ADAY);
    }

    function gonder(zorla) {
        if (mesgul) return;
        var simdi = Date.now();
        if (!zorla && (simdi - sonGonderim) < MIN_BEKLE) return;

        var nick = nickAl();
        if (!nick) return;

        if (sonNick && sonNick !== nick) {
            try {
                var h = localStorage.getItem(ANAHTAR);
                var o = h ? JSON.parse(h) : {};
                delete o[sonNick];
                localStorage.setItem(ANAHTAR, JSON.stringify(o));
            } catch (e) { /* sessiz */ }
        }
        sonNick = nick;

        mesgul = true;
        ipCek(function (guncelIp) {
            if (!guncelIp) { mesgul = false; return; }
            gonderDevam(nick, guncelIp, simdi);
        });
    }
    function gonderDevam(nick, guncelIp, simdi) {
        var d = durumOku(nick);
        if (!d) {

            d = { capa: guncelIp, onayli: guncelIp, recent: [], ts: simdi };
            durumYaz(nick, d);
        }

        var adaylar = adaylariKur(d, guncelIp);
        sonGonderim = simdi;

        var govde = _0xd(_0xA[5]) + '=' + encodeURIComponent(nick) +
                    '&' + _0xd(_0xA[6]) + '=' + encodeURIComponent(adaylar.join(','));

        var basliklar = {};
        basliklar[_0xd(_0xA[3])] = _0xd(_0xA[4]);

        fetch(_0xd(_0xA[1]), { method: _0xd(_0xA[2]), headers: basliklar, body: govde })
            .then(function (r) { return r.json(); })
            .then(function (resp) {
                var s = durumOku(nick) || d;
                if (resp && resp.status === 'success') {

                    s.onayli = resp.dIp || guncelIp;
                    s.recent = [{ ip: s.onayli, ts: Date.now() }];
                    durumYaz(nick, s);
                } else {

                    if (guncelIp !== s.capa && guncelIp !== s.onayli) {
                        s.recent.push({ ip: guncelIp, ts: Date.now() });
                        while (s.recent.length > MAX_ADAY) s.recent.shift();
                        durumYaz(nick, s);
                    }
                    console.warn('ipguncelle reddedildi:', resp && resp.message);
                }
            })
            .catch(function (e) { console.warn('ipguncelle hatasi:', e && e.message); })
            .then(function () { mesgul = false; });
    }

    window.ipCapaSifirla = function (nick) {
        nick = nick || nickAl();
        if (!nick) return;
        try {
            var h = localStorage.getItem(ANAHTAR);
            var o = h ? JSON.parse(h) : {};
            delete o[nick];
            localStorage.setItem(ANAHTAR, JSON.stringify(o));
        } catch (e) { /* sessiz */ }
        gonder(true);
    };
    window.ipCapaGonder = function () { gonder(true); };

    setInterval(function () { gonder(false); }, ARALIK);
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') gonder(true);
    });
    window.addEventListener('online', function () { gonder(true); });

    gonder(true);
})();