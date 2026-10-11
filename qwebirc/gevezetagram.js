(function() {
    // CSS stillerini entegre et
    var stilElementi = new Element("style", {
        type: "text/css",
        id: "qweb-gevezetagram-styles"
    });
    var cssText = `
        .qweb-gevezetagram-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .qweb-gevezetagram-overlay.show {
            opacity: 1;
        }
        .qweb-gevezetagram-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: #fff;
            border-radius: 12px;
            max-width: 95vw;
            max-height: 90vh;
            width: 90vw;
            height: 90vh;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .qweb-gevezetagram-dialog.show {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        .qweb-gevezetagram-drag-handle-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 8px;
            background: #fafafa;
            border-bottom: 1px solid #f0f0f0;
            height: 32px;
            cursor: move;
        }
        .qweb-gevezetagram-drag-handle {
            height: 4px;
            background: #ccc;
            border-radius: 3px;
            width: 40px;
            cursor: grab;
            margin: 0 auto;
        }
        .qweb-gevezetagram-close {
            background: none;
            border: none;
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
            color: #666;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        .qweb-gevezetagram-close:hover {
            color: #333;
            background: #f0f0f0;
        }
        .qweb-gevezetagram-content {
            flex: 1;
            overflow: hidden;
            position: relative;
            background: #fff;
        }
        .qweb-gevezetagram-iframe {
            border: none;
            width: 100%;
            height: calc(100% - 0px);
            display: block;
        }
        .qweb-gevezetagram-dialog.surukleniyor {
            transition: none;
        }
        
        /* Tablet */
        @media (max-width: 768px) {
            .qweb-gevezetagram-dialog {
                width: 95vw;
                height: 85vh;
                max-height: 85vh;
            }
            .qweb-gevezetagram-drag-handle {
                display: block;
            }
        }
        
        /* Mobile */
        @media (max-width: 480px) {
            .qweb-gevezetagram-dialog {
                width: 100vw;
                height: 90vh;
                max-height: 90vh;
                border-radius: 12px 12px 0 0;
                top: auto;
                bottom: 0;
                transform: translate(-50%, 100%) scale(1);
            }
            .qweb-gevezetagram-dialog.show {
                transform: translate(-50%, 0) scale(1);
            }
            .qweb-gevezetagram-drag-handle {
                display: block;
                width: 60px;
            }
            .qweb-gevezetagram-drag-handle-container {
                justify-content: center;
                padding: 8px;
                position: relative;
            }
            .qweb-gevezetagram-close {
                position: absolute;
                right: 8px;
                top: 4px;
            }
        }
        
        /* iOS & Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
            .qweb-gevezetagram-iframe {
                height: calc(100% - 20px); /* Extra space for iOS */
            }
            .qweb-gevezetagram-dialog {
                max-height: 85vh; /* Slightly smaller for iOS */
            }
        }
    `;
    stilElementi.set("text", cssText);

    // Stilleri sadece bir kez ekle
    if (!document.getElementById("qweb-gevezetagram-styles")) {
        document.getElementsByTagName("head")[0].appendChild(stilElementi);
    }
    
    // Aktif dialog ve overlay referansları
    let aktifDialog = null;
    let aktifOverlay = null;
    // Radyo ses seviyesini saklamak için değişken
    let bfSesTagramSeviyesiYdk = null;

    // Gevezetagram dialogunu açan fonksiyon
    window.gevezetagramAc = function(nick, url) {
        // Mevcut dialog varsa kapat
        if (aktifDialog) {
            dialogKapat(aktifDialog, aktifOverlay);
        }

        // Radyo ses seviyesini kaydet ve %3'e çek
        try {
            if (typeof window.currentRadyoSesSeviyesi !== 'undefined') {
                bfSesTagramSeviyesiYdk = window.currentRadyoSesSeviyesi; // Mevcut ses seviyesini kaydet
                if (typeof window.bfRadyoSesAyarla === 'function' && window.bfRadyoSesAyarla(3)) {
                    window.showToast && window.showToast("Radyo ses seviyesi %3'e düşürüldü", "info", 2000);
                }
            }
        } catch (e) {
            console.error("Radyo ses seviyesi ayarlanırken hata:", e);
            window.showToast && window.showToast("Radyo ses ayarı hatası: " + e.message, "error", 3000);
        }

        // Overlay oluştur
        const overlay = new Element("div", {
            "class": "qweb-gevezetagram-overlay"
        });
        
        // Dialog oluştur
        const dialog = new Element("div", {
            "class": "qweb-gevezetagram-dialog"
        });

        // Sürükleme çubuğu ve kapatma düğmesi için konteyner
        const dragContainer = new Element("div", {
            "class": "qweb-gevezetagram-drag-handle-container"
        });

        // Mobil için sürükleme çubuğu
        const suruklemeCubugu = new Element("div", {
            "class": "qweb-gevezetagram-drag-handle"
        });

        // Kapatma düğmesi
        const kapatmaDugmesi = new Element("button", {
            "class": "qweb-gevezetagram-close",
            "html": "×",
            "events": {
                "click": function(e) {
                    e.preventDefault();
                    dialogKapat(dialog, overlay);
                }
            }
        });

        // Content container
        const contentContainer = new Element("div", {
            "class": "qweb-gevezetagram-content"
        });

        // Iframe oluştur
        const iframe = new Element("iframe", {
            "class": "qweb-gevezetagram-iframe",
            "src": url,
            "allow": "camera; microphone; fullscreen",
            "loading": "lazy"
        });

        // Dialog'a elemanları ekle
        dragContainer.adopt(suruklemeCubugu, kapatmaDugmesi);
        contentContainer.adopt(iframe);
        dialog.adopt(dragContainer, contentContainer);

        // Overlay ve dialog'u sayfaya ekle
        document.body.adopt(overlay, dialog);

        // Aktif dialog ve overlay'i güncelle
        aktifDialog = dialog;
        aktifOverlay = overlay;

        // Görsel efektleri etkinleştirmek için küçük bir gecikme
        setTimeout(function() {
            overlay.addClass("show");
            dialog.addClass("show");
        }, 10);

        // Overlay tıklama ile kapatma
        overlay.addEvent("click", function(e) {
            if (e.target === overlay) {
                dialogKapat(dialog, overlay);
            }
        });

        // ESC tuşu ile kapatma
        document.addEvent("keydown", function(e) {
            if (e.key === "Escape" && aktifDialog) {
                dialogKapat(aktifDialog, aktifOverlay);
            }
        });

        // Sürükleme işlevselliği
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let dialogRect, screenWidth, screenHeight;

        // Touch ve Mouse sürükleme olayları
        const dragStart = function(e) {
            if (e.type === 'touchstart') {
                if (e.touches.length > 1) return; // Multi-touch engelle
                e = e.touches[0];
            }
            
            // Mobil cihazlarda sadece sürükleme çubuğundan sürükleme
            if (window.innerWidth <= 480 && e.target !== suruklemeCubugu && !suruklemeCubugu.contains(e.target)) {
                return;
            }

            e.preventDefault();
            isDragging = true;
            dialog.addClass("surukleniyor");
            
            dialogRect = dialog.getBoundingClientRect();
            screenWidth = window.innerWidth;
            screenHeight = window.innerHeight;
            
            startX = e.clientX;
            startY = e.clientY;
            
            // Dialog pozisyonunu hesapla
            const dialogStyle = window.getComputedStyle(dialog);
            const matrix = new WebKitCSSMatrix(dialogStyle.transform);
            
            startLeft = matrix.m41 + dialogRect.width/2;
            startTop = matrix.m42 + dialogRect.height/2;
            
            if (window.innerWidth <= 480) {
                startTop = screenHeight - dialogRect.height/2;
            }
            
            // Sürükleme olaylarını ekle
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
        };

        const dragMove = function(e) {
            if (!isDragging) return;
            
            if (e.type === 'touchmove') {
                if (e.touches.length > 1) return;
                e = e.touches[0];
            }
            
            e.preventDefault();
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            // Dialog sınırları içinde kal
            newLeft = Math.max(dialogRect.width/2, Math.min(newLeft, screenWidth - dialogRect.width/2));
            
            if (window.innerWidth > 480) {
                newTop = Math.max(dialogRect.height/2, Math.min(newTop, screenHeight - dialogRect.height/2));
                dialog.style.transform = `translate(${newLeft - dialogRect.width/2}px, ${newTop - dialogRect.height/2}px)`;
            } else {
                // Mobilde sadece yatayda sürükleme
                dialog.style.transform = `translate(${newLeft - dialogRect.width/2}px, 0)`;
            }
        };

        const dragEnd = function() {
            if (!isDragging) return;
            isDragging = false;
            dialog.removeClass("surukleniyor");
            
            // Olay dinleyicilerini kaldır
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        };

        // MooTools ile drag olaylarını ekle
        dragContainer.addEvent('mousedown', dragStart);
        dragContainer.addEvent('touchstart', dragStart);
    };

    // Dialog kapatma fonksiyonu
    function dialogKapat(dialog, overlay) {
        if (!dialog || !overlay) return;
        
        dialog.removeClass("show");
        overlay.removeClass("show");

        // Animasyon tamamlanana kadar bekle
        setTimeout(() => {
            // Radyo ses seviyesini eski haline getir
            try {
                if (bfSesTagramSeviyesiYdk !== null && 
                    typeof window.bfRadyoSesAyarla === 'function' && 
                    window.bfRadyoSesAyarla(bfSesTagramSeviyesiYdk)) {
                    window.showToast && window.showToast("Radyo ses seviyesi geri yüklendi", "info", 2000);
                }
            } catch (e) {
                console.error("Radyo ses seviyesi geri yüklenirken hata:", e);
                window.showToast && window.showToast("Radyo ses ayarı hatası: " + e.message, "error", 3000);
            }

            // Dialog ve overlay'i kaldır
            dialog.destroy();
            overlay.destroy();
            aktifDialog = null;
            aktifOverlay = null;
            bfSesTagramSeviyesiYdk = null;
        }, 300);
    }
})();