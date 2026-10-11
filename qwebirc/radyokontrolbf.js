(function() {
    // Ses seviyesini takip etmek için global bir değişken
    window.currentRadyoSesSeviyesi = window.RadyoDefaultSes || 50;
    // Seçilen radyo indeksini takip et (varsayılan: 0)
    window.currentRadyoIndex = 0;
    // Radyonun çalışma durumu
    window.radyoOynatiliyor = false;
    // Tema (açık/koyu)
    window.radyoTema = 'light';

    // CSS Stillerini ekle
    function stilEkle() {
        const stil = `
        /* Radyo Kontrol Ana Stilleri */
        .radyo-dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 9998;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .radyo-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: var(--radyo-bg, #fff);
            color: var(--radyo-text, #333);
            width: 320px;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            opacity: 0;
            transition: all 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .radyo-dialog.active {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .radyo-dialog-overlay.active {
            opacity: 1;
        }
        
        .radyo-dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--radyo-border, #eee);
        }
        
        .radyo-dialog-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            color: var(--radyo-title, #333);
        }
        
        .radyo-tema-toggle {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: var(--radyo-icon, #555);
            padding: 5px;
            border-radius: 50%;
            transition: background 0.2s ease;
        }
        
        .radyo-tema-toggle:hover {
            background: var(--radyo-hover-bg, rgba(0,0,0,0.05));
        }
        
        .radyo-now-playing {
            text-align: center;
            margin: 15px 0;
            font-weight: 500;
            font-size: 14px;
            background: var(--radyo-now-playing-bg, linear-gradient(135deg, #4287f5, #9850e6));
            color: #fff;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            animation: pulseEffect 2s infinite;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
        }
        
        .radyo-wave {
            display: inline-flex;
            align-items: flex-end;
            gap: 2px;
            height: 24px;
            margin-right: 8px;
        }
        
        .radyo-wave span {
            display: inline-block;
            width: 3px;
            background-color: #fff;
            border-radius: 3px;
            animation: sound-wave 1.2s infinite ease-in-out;
        }
        
        .radyo-wave span:nth-child(1) { height: 12px; animation-delay: 0.2s; }
        .radyo-wave span:nth-child(2) { height: 18px; animation-delay: 0.5s; }
        .radyo-wave span:nth-child(3) { height: 14px; animation-delay: 0.8s; }
        .radyo-wave span:nth-child(4) { height: 20px; animation-delay: 0.1s; }
        
        @keyframes sound-wave {
            0%, 100% { transform: scaleY(0.5); }
            50% { transform: scaleY(1); }
        }
        
        .radyo-stations {
            margin: 20px 0;
        }
        
        .radyo-station-buttons {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 8px;
        }
        
        .radyo-station-button {
            flex: 1;
            padding: 12px 8px;
            border: none;
            border-radius: 10px;
            background: var(--radyo-button-bg, linear-gradient(to bottom, #f0f0f0, #e6e6e6));
            color: var(--radyo-button-text, #333);
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }
        
        .radyo-station-button:hover {
            background: var(--radyo-button-hover-bg, linear-gradient(to bottom, #e8e8e8, #d9d9d9));
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .radyo-station-button.active {
            background: var(--radyo-active-bg, linear-gradient(135deg, #4287f5, #3276e6));
            color: #fff;
            box-shadow: 0 4px 12px rgba(66, 135, 245, 0.3);
        }
        
        .radyo-station-button.active::after {
            content: '';
            position: absolute;
            top: 5px;
            right: 5px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 0 5px rgba(255,255,255,0.8);
            animation: blink 1.5s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .radyo-volume-container {
            margin: 20px 0;
        }
        
        .radyo-volume-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: var(--radyo-label, #555);
        }
        
        .radyo-volume-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            background: var(--radyo-slider-bg, #ddd);
            border-radius: 10px;
            outline: none;
            margin: 12px 0;
        }
        
        .radyo-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--radyo-slider-thumb, #4287f5);
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        }
        
        .radyo-volume-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .radyo-volume-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--radyo-slider-thumb, #4287f5);
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
            border: none;
        }
        
        .radyo-volume-slider::-moz-range-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .radyo-controls {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 20px;
        }
        
        .radyo-control-button {
            flex: 1;
            padding: 12px 16px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .radyo-play-button {
            background: var(--radyo-play-bg, linear-gradient(135deg, #4cd964, #2ecc71));
            color: #fff;
            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
        }
        
        .radyo-play-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(46, 204, 113, 0.4);
        }
        
        .radyo-stop-button {
            background: var(--radyo-stop-bg, linear-gradient(135deg, #ff3b30, #e74c3c));
            color: #fff;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
        
        .radyo-stop-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(231, 76, 60, 0.4);
        }
        
        .radyo-close-button {
            background: var(--radyo-close-bg, linear-gradient(135deg, #8e8e93, #7d7d82));
            color: #fff;
            margin-top: 15px;
            display: block;
            width: 100%;
            box-shadow: 0 4px 12px rgba(142, 142, 147, 0.3);
            padding: 10px 16px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .radyo-close-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(142, 142, 147, 0.4);
        }

        .radyo-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            max-width: 80%;
            text-align: center;
        }
        
        .radyo-toast.show {
            opacity: 1;
        }

        .radyo-toast.success {
            background: rgba(46, 204, 113, 0.9);
        }
        
        .radyo-toast.error {
            background: rgba(231, 76, 60, 0.9);
        }
        
        .radyo-toast.warning {
            background: rgba(241, 196, 15, 0.9);
            color: #333;
        }
        
        /* Koyu tema stilleri */
        .radyo-dark-theme {
            --radyo-bg: #1e1e2e;
            --radyo-text: #e0e0e0;
            --radyo-title: #fff;
            --radyo-border: #3a3a4a;
            --radyo-icon: #a0a0b0;
            --radyo-hover-bg: rgba(255,255,255,0.1);
            --radyo-now-playing-bg: linear-gradient(135deg, #3a3a9e, #7c46c9);
            --radyo-button-bg: linear-gradient(to bottom, #2a2a3a, #252535);
            --radyo-button-text: #e0e0e0;
            --radyo-button-hover-bg: linear-gradient(to bottom, #323242, #2a2a3a);
            --radyo-active-bg: linear-gradient(135deg, #4560db, #2a4cc9);
            --radyo-slider-bg: #3a3a4a;
            --radyo-slider-thumb: #4560db;
            --radyo-label: #a0a0b0;
            --radyo-play-bg: linear-gradient(135deg, #34b95b, #28a745);
            --radyo-stop-bg: linear-gradient(135deg, #e63c30, #d32f2f);
            --radyo-close-bg: linear-gradient(135deg, #6a6a75, #5a5a65);
        }
        
        /* Light theme */
        .radyo-light-theme {
            --radyo-bg: #ffffff;
            --radyo-text: #333333;
            --radyo-title: #222222;
            --radyo-border: #eeeeee;
            --radyo-icon: #555555;
            --radyo-hover-bg: rgba(0,0,0,0.05);
            --radyo-now-playing-bg: linear-gradient(135deg, #4287f5, #9850e6);
            --radyo-button-bg: linear-gradient(to bottom, #f0f0f0, #e6e6e6);
            --radyo-button-text: #333333;
            --radyo-button-hover-bg: linear-gradient(to bottom, #e8e8e8, #d9d9d9);
            --radyo-active-bg: linear-gradient(135deg, #4287f5, #3276e6);
            --radyo-slider-bg: #dddddd;
            --radyo-slider-thumb: #4287f5;
            --radyo-label: #555555;
            --radyo-play-bg: linear-gradient(135deg, #4cd964, #2ecc71);
            --radyo-stop-bg: linear-gradient(135deg, #ff3b30, #e74c3c);
            --radyo-close-bg: linear-gradient(135deg, #8e8e93, #7d7d82);
        }
        
        /* Mobil için düzenlemeler */
        @media (max-width: 480px) {
            .radyo-dialog {
                width: 90%;
                padding: 16px;
            }
            
            .radyo-station-buttons {
                flex-direction: column;
            }
            
            .radyo-controls {
                flex-direction: column;
            }
            
            .radyo-dialog-title {
                font-size: 16px;
            }
        }
        
        /* Animasyonlar */
        @keyframes pulseEffect {
            0% { box-shadow: 0 0 0 0 rgba(66, 135, 245, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(66, 135, 245, 0); }
            100% { box-shadow: 0 0 0 0 rgba(66, 135, 245, 0); }
        }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = stil;
        document.head.appendChild(styleElement);
    }

    // Radyo isimleri eşleştirmesi (RadyoURL dizisi ile aynı sırayla)
    const radyoIsimleri = [
        { name: "GevezeFM", url: RadyoURL[0]["https:"] },
        { name: "KalbimFM", url: RadyoURL[1]["https:"] },
        { name: "KlasFM", url: RadyoURL[2]["https:"] }
    ];

    // Toast mesajını gösterme fonksiyonu
    window.showToast = function(message, type = 'default', duration = 3000) {
        // Varsa eski toast'u kaldır
        let oldToast = document.querySelector('.radyo-toast');
        if (oldToast) {
            oldToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `radyo-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Göster
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Gizle ve kaldır
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    };

    // Radyo akışını değiştiren fonksiyon
    window.bfRadyoDegistir = function(index) {
        console.log('bfRadyoDegistir çağrıldı, index:', index);
        if (index >= 0 && index < radyoIsimleri.length) {
            // Mevcut radyo akışını durdur
            if (soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl']) {
                soundManager.destroySound('PlayCtrl');
            }

            // Yeni radyo akışını oluştur
            soundManager.createSound({
                id: 'PlayCtrl',
                url: radyoIsimleri[index].url,
                autoLoad: true,
                autoPlay: true,
                volume: window.currentRadyoSesSeviyesi,
                onplay: function() {
                    window.radyoOynatiliyor = true;
                    guncelleDurumGostergesini();
                },
                onstop: function() {
                    window.radyoOynatiliyor = false;
                    guncelleDurumGostergesini();
                }
            });

            // Seçilen radyo indeksini güncelle
            window.currentRadyoIndex = index;
            window.radyoOynatiliyor = true;
            guncelleDurumGostergesini();
            window.showToast(`${radyoIsimleri[index].name} radyosu çalıyor`, 'success', 2000);
        } else {
            window.showToast('Geçersiz radyo seçimi!', 'error', 2000);
        }
    };



window.bfRadyoSesAyarla = function(sesSeviyesi) {
    if (soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl']) {
        var radyoSesi = soundManager.sounds['PlayCtrl'];
        radyoSesi.setVolume(sesSeviyesi);
        window.currentRadyoSesSeviyesi = sesSeviyesi;
        
        // Ses seviyesi göstergesi
        const volumeValue = document.getElementById('radyo-volume-value');
        if (volumeValue) {
            volumeValue.textContent = sesSeviyesi;
        }
        
        // Ses kaydırıcısını güncelle
        const volumeSlider = document.querySelector('.radyo-volume-slider');
        if (volumeSlider) {
            volumeSlider.value = sesSeviyesi;
        }
        
        return true;
    } else {
        window.showToast('Radyo şu anda çalmıyor veya hazır değil!', 'error', 2000);
        return false;
    }
};

    // Radyoyu açma fonksiyonu
    window.bfRadyoAc = function() {
        if (soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl']) {
            var radyoSesi = soundManager.sounds['PlayCtrl'];
            radyoSesi.play();
            radyoSesi.setVolume(window.currentRadyoSesSeviyesi);
            window.radyoOynatiliyor = true;
            guncelleDurumGostergesini();
            window.showToast(`${radyoIsimleri[window.currentRadyoIndex].name} radyosu açıldı`, 'success', 2000);
        } else {
            // Radyo yoksa, son seçilen radyo ile başlat
            window.bfRadyoDegistir(window.currentRadyoIndex);
        }
    };

    // Radyoyu kapatma fonksiyonu
    window.bfRadyoKapat = function() {
        if (soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl']) {
            var radyoSesi = soundManager.sounds['PlayCtrl'];
            radyoSesi.stop();
            window.radyoOynatiliyor = false;
            guncelleDurumGostergesini();
            window.showToast('Radyo kapatıldı', 'success', 2000);
        } else {
            window.showToast('Radyo zaten kapalı veya yüklenmedi', 'warning', 2000);
        }
    };

    // Durum göstergesini güncelleme
function guncelleDurumGostergesini() {
    const nowPlaying = document.getElementById('radyo-now-playing');
    const waveContainer = document.getElementById('radyo-wave-container');
    const stationButtons = document.querySelectorAll('.radyo-station-button');

    // soundManager ile radyo durumunu kontrol et
    const radyoSesi = soundManager && soundManager.sounds && soundManager.sounds['PlayCtrl'];
    window.radyoOynatiliyor = radyoSesi && !radyoSesi.paused && radyoSesi.playState === 1;

    if (nowPlaying) {
        if (window.radyoOynatiliyor) {
            nowPlaying.innerHTML = `
                <div class="radyo-wave" id="radyo-wave-container">
                    <span></span><span></span><span></span><span></span>
                </div>
                ${radyoIsimleri[window.currentRadyoIndex].name} çalıyor`;
        } else {
            nowPlaying.textContent = 'Radyo Kapalı';
        }
    }

    // Aktif radyo istasyonunu vurgula
    if (stationButtons) {
        stationButtons.forEach((button, index) => {
            if (index === window.currentRadyoIndex && window.radyoOynatiliyor) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}

    // Tema değiştirme fonksiyonu
    function temaDegistir() {
        const dialog = document.querySelector('.radyo-dialog');
        const temaToggle = document.getElementById('radyo-tema-toggle');
        
        if (window.radyoTema === 'light') {
            window.radyoTema = 'dark';
            dialog.classList.remove('radyo-light-theme');
            dialog.classList.add('radyo-dark-theme');
            temaToggle.textContent = '☀️';
        } else {
            window.radyoTema = 'light';
            dialog.classList.remove('radyo-dark-theme');
            dialog.classList.add('radyo-light-theme');
            temaToggle.textContent = '🌙';
        }
    }

    // Ses kontrol diyalogunu gösteren fonksiyon
    window.bfRadyoSesKontrolGoster = function() {
        // CSS Stili ekle
        stilEkle();
        
        // Eski diyalog varsa kaldır
        const oldDialog = document.querySelector('.radyo-dialog');
        const oldOverlay = document.querySelector('.radyo-dialog-overlay');
        
        if (oldDialog) oldDialog.remove();
        if (oldOverlay) oldOverlay.remove();

        // Overlay oluştur
        const overlay = document.createElement('div');
        overlay.className = 'radyo-dialog-overlay';
        document.body.appendChild(overlay);

        // Diyalog oluştur
        const dialog = document.createElement('div');
        dialog.className = `radyo-dialog ${window.radyoTema === 'dark' ? 'radyo-dark-theme' : 'radyo-light-theme'}`;
        document.body.appendChild(dialog);

        // Başlık ve tema değişimi
        const header = document.createElement('div');
        header.className = 'radyo-dialog-header';
        
        const title = document.createElement('h3');
        title.className = 'radyo-dialog-title';
        title.textContent = 'Radyo Kontrol';
        
        const temaButton = document.createElement('button');
        temaButton.className = 'radyo-tema-toggle';
        temaButton.id = 'radyo-tema-toggle';
        temaButton.textContent = window.radyoTema === 'dark' ? '☀️' : '🌙';
        temaButton.addEventListener('click', temaDegistir);
        
        header.appendChild(title);
        header.appendChild(temaButton);
        dialog.appendChild(header);

        // Şu anda çalan bilgisi
        const nowPlaying = document.createElement('div');
        nowPlaying.className = 'radyo-now-playing';
        nowPlaying.id = 'radyo-now-playing';
        dialog.appendChild(nowPlaying);

        // Radyo istasyonları
        const stationsContainer = document.createElement('div');
        stationsContainer.className = 'radyo-stations';
        
        const stationsLabel = document.createElement('div');
        stationsLabel.className = 'radyo-volume-label';
        stationsLabel.textContent = 'Radyo İstasyonları';
        stationsContainer.appendChild(stationsLabel);
        
        const stationButtons = document.createElement('div');
        stationButtons.className = 'radyo-station-buttons';
        
        radyoIsimleri.forEach((radyo, index) => {
            const button = document.createElement('button');
            button.className = 'radyo-station-button';
            button.textContent = radyo.name;
            button.addEventListener('click', () => {
                window.bfRadyoDegistir(index);
            });
            stationButtons.appendChild(button);
        });
        
        stationsContainer.appendChild(stationButtons);
        dialog.appendChild(stationsContainer);

        // Ses ayarı
        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'radyo-volume-container';
        
        const volumeLabel = document.createElement('div');
        volumeLabel.className = 'radyo-volume-label';
        volumeLabel.innerHTML = `Ses Seviyesi: <span id="radyo-volume-value">${window.currentRadyoSesSeviyesi}</span>`;
        volumeContainer.appendChild(volumeLabel);
        
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = 0;
        volumeSlider.max = 100;
        volumeSlider.value = window.currentRadyoSesSeviyesi;
        volumeSlider.className = 'radyo-volume-slider';
        volumeSlider.addEventListener('input', () => {
            window.bfRadyoSesAyarla(parseInt(volumeSlider.value));
        });
        
        volumeContainer.appendChild(volumeSlider);
        dialog.appendChild(volumeContainer);

        // Kontrol butonları
        const controls = document.createElement('div');
        controls.className = 'radyo-controls';
        
        const playButton = document.createElement('button');
        playButton.className = 'radyo-control-button radyo-play-button';
        playButton.innerHTML = '<span>▶</span> Radyo Aç';
        playButton.addEventListener('click', window.bfRadyoAc);
        
        const stopButton = document.createElement('button');
        stopButton.className = 'radyo-control-button radyo-stop-button';
        stopButton.innerHTML = '<span>■</span> Radyo Kapat';
        stopButton.addEventListener('click', window.bfRadyoKapat);
        
        controls.appendChild(playButton);
        controls.appendChild(stopButton);
        dialog.appendChild(controls);

        // Kapat butonu
        const closeButton = document.createElement('button');
        closeButton.className = 'radyo-close-button';
        closeButton.textContent = 'Kapat';
        closeButton.addEventListener('click', () => {
            dialog.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                dialog.remove();
                overlay.remove();
            }, 300);
        });
        dialog.appendChild(closeButton);

        // Animasyon ile göster
        setTimeout(() => {
            overlay.classList.add('active');
            dialog.classList.add('active');
        }, 10);

        // Dinlenme durumunu güncelle
        guncelleDurumGostergesini();
        
        // Overlay tıklama ile kapatma
        overlay.addEventListener('click', () => {
            dialog.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                dialog.remove();
                overlay.remove();
            }, 300);
        });
    };

    // Sayfa yüklendiğinde stili ekle
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        stilEkle();
    } else {
        document.addEventListener('DOMContentLoaded', stilEkle);
    }
})();