import { triggerWinnerConfetti } from './efektler.js';

// =========================================================================
// 🏴‍☠️ BİLGİ HARİTALAMA (METADATA) YARDIMCILARI
// =========================================================================

// Sanji'nin vuramadığı kadın karakterler listesi
function isKadin(isim) {
    const kadinlar = ["Big Mom", "Boa Hancock", "Smoothie", "Nico Robin", "Nami", "Yamato"];
    return kadinlar.includes(isim);
}

// 3'lü takım sinerjisi için tayfa/grup eşleştirmeleri
function getTayfa(isim) {
    const tayfalar = {
        // Hasır Şapka Korsanları
        "Monkey D. Luffy": "Hasır Şapka", "Roronoa Zoro": "Hasır Şapka", "Sanji": "Hasır Şapka",
        "Jinbe": "Hasır Şapka", "Franky": "Hasır Şapka", "Nico Robin": "Hasır Şapka",
        "Brook": "Hasır Şapka", "Chopper": "Hasır Şapka", "Nami": "Hasır Şapka", "Usopp": "Hasır Şapka",
        
        // Beyazsakal Korsanları
        "Whitebeard": "Beyazsakal", "Marco": "Beyazsakal", "Jozu": "Beyazsakal", 
        "Vista": "Beyazsakal", "Portgas D. Ace": "Beyazsakal",
        
        // Canavar Korsanları
        "Kaido": "Canavar", "King": "Canavar", "Queen": "Canavar", "Jack": "Canavar", "Yamato": "Canavar",
        
        // Koca Ana Korsanları
        "Big Mom": "Koca Ana", "Katakuri": "Koca Ana", "Smoothie": "Koca Ana", "Cracker": "Koca Ana",
        
        // Devrim Ordusu
        "Monkey D. Dragon": "Devrimci", "Sabo": "Devrimci", "Bartholomew Kuma": "Devrimci", "Emporio Ivankov": "Devrimci",
        
        // Denizciler & Dünya Hükümeti
        "Monkey D. Garp": "Denizci", "Sengoku": "Denizci", "Akainu": "Denizci", 
        "Kizaru": "Denizci", "Fujitora": "Denizci", "Ryokugyu": "Denizci", 
        "Rob Lucci": "Denizci", "Magellan": "Denizci", "Koby": "Denizci", "Smoker": "Denizci"
    };
    return tayfalar[isim] || "Diğerleri";
}

// =========================================================================
// 🧠 SİNERJİ VE BONUS MOTORU
// =========================================================================
function takimSinerjileriniHesapla(takim, oyuncuAdi) {
    // Orijinal takımı bozmamak için derin kopyalama yapıyoruz
    let buffliTakim = takim.filter(c => c).map(c => ({ ...c }));
    let raporlar = [];

    if (buffliTakim.length === 0) return { buffliTakim, raporlar };

    // 1. ASL (Ace, Sabo, Luffy) Kardeşlik Bonusu
    const isimler = buffliTakim.map(c => c.isim);
    const hasLuffy = isimler.includes("Monkey D. Luffy");
    const hasAce = isimler.includes("Portgas D. Ace");
    const hasSabo = isimler.includes("Sabo");

    if (hasLuffy && hasAce && hasSabo) {
        raporlar.push(`🔥 <b>${oyuncuAdi}</b> için <b>ASL Kardeşliği</b> Aktif! (Luffy, Ace, Sabo +%20 Güç Kazandı!)`);
        buffliTakim = buffliTakim.map(c => {
            if (["Monkey D. Luffy", "Portgas D. Ace", "Sabo"].includes(c.isim)) {
                c.guc = c.guc * 1.20;
                c.seviye = Math.min(100, c.seviye + 3); // Seviyeye de küçük bir kardeşlik jesti
            }
            return c;
        });
    }

    // 2. 3'lü Tayfa Sinerjisi (Aynı gruptan en az 3 kişi)
    let tayfaSayilari = {};
    buffliTakim.forEach(c => {
        let t = getTayfa(c.isim);
        if (t !== "Diğerleri") {
            tayfaSayilari[t] = (tayfaSayilari[t] || 0) + 1;
        }
    });

    Object.keys(tayfaSayilari).forEach(tayfaAdi => {
        if (tayfaSayilari[tayfaAdi] >= 3) {
            raporlar.push(`⚓ <b>${oyuncuAdi}</b> için <b>${tayfaAdi} Sinerjisi</b> Aktif! (En az 3 ${tayfaAdi} üyesi +%15 Güç Kazandı!)`);
            buffliTakim = buffliTakim.map(c => {
                if (getTayfa(c.isim) === tayfaAdi) {
                    c.guc = c.guc * 1.15;
                }
                return c;
            });
        }
    });

    return { buffliTakim, raporlar };
}

// =========================================================================
// ⚔️ DÖVÜŞ MOTORU & ÖZEL DURUMLAR
// =========================================================================
export function hibritDovus(k1, k2) {
    if (!k1 || k1.seviye === 0 || k1.guc === 0) return { kazanan: k2, kaybeden: k1, sans: 100, mesaj: "" };
    if (!k2 || k2.seviye === 0 || k2.guc === 0) return { kazanan: k1, kaybeden: k2, sans: 100, mesaj: "" };

    // --- SANJI ÖZEL ZAFİYETİ (Prensip Meselesi) ---
    if (k1.isim === "Sanji" && isKadin(k2.isim)) {
        return { kazanan: k2, kaybeden: k1, sans: 100, mesaj: `💔 Sanji, ${k2.isim} karşısında eridi! (Kadınlara asla vurmaz!)` };
    }
    if (k2.isim === "Sanji" && isKadin(k1.isim)) {
        return { kazanan: k1, kaybeden: k2, sans: 100, mesaj: `💔 Sanji, ${k1.isim} karşısında eridi! (Kadınlara asla vurmaz!)` };
    }

    const maxOdul = 5564800000;
    
    const k1Skor = (k1.seviye * 0.85) + ((k1.guc / maxOdul) * 15);
    const k2Skor = (k2.seviye * 0.85) + ((k2.guc / maxOdul) * 15);

    const toplamSkor = k1Skor + k2Skor;
    const k1KazanmaSansı = (k1Skor / toplamSkor) * 100;

    const zar = Math.random() * 100;

    if (zar <= k1KazanmaSansı) {
        return { kazanan: k1, kaybeden: k2, sans: Math.round(k1KazanmaSansı), mesaj: "" };
    } else {
        return { kazanan: k2, kaybeden: k1, sans: Math.round(100 - k1KazanmaSansı), mesaj: "" };
    }
}

// 1. MOD: GAUNTLET
export function runGauntletBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Bitti! Gauntlet Sonucu:";
    
    // Sinerjileri hesapla ve uygula
    const p1SinerjiRaporu = takimSinerjileriniHesapla(p1Takim, "1. Oyuncu");
    const p2SinerjiRaporu = takimSinerjileriniHesapla(p2Takim, "2. Oyuncu");

    let t1 = p1SinerjiRaporu.buffliTakim;
    let t2 = p2SinerjiRaporu.buffliTakim;

    let htmlResult = `<b>🏴‍☠️ GAUNTLET ELEME RAPORU 🏴‍☠️</b><br>`;
    
    // Aktif sinerjileri ekrana yazdır
    let tumSinerjiler = [...p1SinerjiRaporu.raporlar, ...p2SinerjiRaporu.raporlar];
    if (tumSinerjiler.length > 0) {
        htmlResult += `<div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 5px; margin: 10px 0;">${tumSinerjiler.join("<br>")}</div>`;
    }
    htmlResult += `<br>`;
    
    let idx1 = 0;
    let idx2 = 0;
    let raunt = 1;

    if (t1.length === 0 && t2.length === 0) {
        resultDisplay.innerHTML = "İki takımda da savaşacak korsan bulunamadı!";
        return;
    }

    while (idx1 < t1.length && idx2 < t2.length) {
        let k1 = t1[idx1];
        let k2 = t2[idx2];
        
        let sonuc = hibritDovus(k1, k2);
        htmlResult += `⏱️ <b>Seri ${raunt}:</b> ${k1.isim} (S${k1.seviye}) vs ${k2.isim} (S${k2.seviye}) ➔ `;
        
        if (sonuc.mesaj) {
            // Sanji zafiyeti gibi özel bir mesaj varsa basıyoruz
            htmlResult += `<span style='color:#f1c40f; font-weight:bold;'>${sonuc.mesaj}</span><br>`;
        }

        if (sonuc.kazanan.id === k1.id) {
            if(!sonuc.mesaj) htmlResult += `<span style='color:#2ecc71; font-weight:bold;'>${k1.isim} kazandı!</span> (%${sonuc.sans} şans)<br>`;
            t1[idx1].seviye = Math.max(1, t1[idx1].seviye - 5); 
            idx2++; 
        } else {
            if(!sonuc.mesaj) htmlResult += `<span style='color:#e74c3c; font-weight:bold;'>${k2.isim} kazandı!</span> (%${sonuc.sans} şans)<br>`;
            t2[idx2].seviye = Math.max(1, t2[idx2].seviye - 5);
            idx1++; 
        }
        raunt++;
    }

    htmlResult += "<br>";

    if (idx1 < t1.length) {
        htmlResult += `<span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 1. Oyuncu Gauntlet Savaşını Kazandı! Denizin Hakimi Oldu!</span>`;
        resultDisplay.innerHTML = htmlResult;
        triggerWinnerConfetti(1);
    } else if (idx2 < t2.length) {
        htmlResult += `<span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 2. Oyuncu Gauntlet Savaşını Kazandı! Denizin Hakimi Oldu!</span>`;
        resultDisplay.innerHTML = htmlResult;
        triggerWinnerConfetti(2);
    } else {
        htmlResult += `<span style='color:#f1c40f; font-size:1.2em; font-weight:bold;'>🤝 Beraberlik!</span>`;
        resultDisplay.innerHTML = htmlResult;
        triggerWinnerConfetti(0);
    }

    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.style.display = "inline-block";
}

// 2. MOD: MATCHUP
export function runMatchupBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Bitti! Düellolar Tamamlandı:";
    
    const p1Slots = document.getElementById("p1-team").querySelectorAll('.slot');
    const p2Slots = document.getElementById("p2-team").querySelectorAll('.slot');
    
    // Sinerjileri hesapla ve uygula
    const p1SinerjiRaporu = takimSinerjileriniHesapla(p1Takim, "1. Oyuncu");
    const p2SinerjiRaporu = takimSinerjileriniHesapla(p2Takim, "2. Oyuncu");

    let t1Buffed = p1SinerjiRaporu.buffliTakim;
    let t2Buffed = p2SinerjiRaporu.buffliTakim;

    let p1Galibiyet = 0;
    let p2Galibiyet = 0;
    let detaylarHtml = "<b>🏴‍☠️ DÜELLO SONUÇLARI 🏴‍☠️</b><br>";

    let tumSinerjiler = [...p1SinerjiRaporu.raporlar, ...p2SinerjiRaporu.raporlar];
    if (tumSinerjiler.length > 0) {
        detaylarHtml += `<div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 5px; margin: 10px 0;">${tumSinerjiler.join("<br>")}</div>`;
    }
    detaylarHtml += `<br>`;

    for (let i = 0; i < 5; i++) {
        let p1Char = t1Buffed[i];
        let p2Char = t2Buffed[i];
        
        if (!p1Char && !p2Char) {
            detaylarHtml += `🥊 <b>Raunt ${i + 1}:</b> Boş Slot vs Boş Slot ➔ <span style='color:#7f8c8d;'>Savaş Yok</span><br>`;
            continue;
        }

        let k1 = p1Char ? { ...p1Char } : { isim: "Boş Slot", guc: 0, seviye: 0 };
        let k2 = p2Char ? { ...p2Char } : { isim: "Boş Slot", guc: 0, seviye: 0 };

        const sonuc = hibritDovus(k1, k2);
        
        if (sonuc.mesaj) {
            detaylarHtml += `🥊 <b>Raunt ${i + 1}:</b> ${k1.isim} <b>vs</b> ${k2.isim} ➔ <span style='color:#f1c40f; font-weight:bold;'>${sonuc.mesaj}</span><br>`;
        } else {
            detaylarHtml += `🥊 <b>Raunt ${i + 1}:</b> ${k1.isim} <b>vs</b> ${k2.isim} ➔ `;
        }

        if (sonuc.kazanan.isim === k1.isim && k1.isim !== "Boş Slot") {
            p1Galibiyet++;
            if(!sonuc.mesaj) detaylarHtml += `<span style='color:#2ecc71; font-weight:bold;'>1. Oyuncu Kazandı</span> (%${sonuc.sans} şansla)<br>`;
            if (p1Slots[i]) p1Slots[i].style.boxShadow = "0 0 15px rgba(46, 204, 113, 0.6)";
            if (p2Slots[i]) p2Slots[i].style.boxShadow = "0 0 15px rgba(231, 76, 60, 0.6)";
        } else if (sonuc.kazanan.isim === k2.isim && k2.isim !== "Boş Slot") {
            p2Galibiyet++;
            if(!sonuc.mesaj) detaylarHtml += `<span style='color:#e74c3c; font-weight:bold;'>2. Oyuncu Kazandı</span> (%${sonuc.sans} şansla)<br>`;
            if (p2Slots[i]) p2Slots[i].style.boxShadow = "0 0 15px rgba(46, 204, 113, 0.6)";
            if (p1Slots[i]) p1Slots[i].style.boxShadow = "0 0 15px rgba(231, 76, 60, 0.6)";
        } else {
            detaylarHtml += `<span style='color:#f1c40f;'>Savaş Yok</span><br>`;
        }
    }

    let genelSkorHtml = `<br><b>📊 GENEL SKOR: 1. Oyuncu [ ${p1Galibiyet} - ${p2Galibiyet} ] 2. Oyuncu</b><br><br>`;
    
    if (p1Galibiyet > p2Galibiyet) {
        genelSkorHtml += `<span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 1. Oyuncu Karşılaşmayı Üstünlükle Kazandı!</span>`;
        triggerWinnerConfetti(1); 
    } else if (p2Galibiyet > p1Galibiyet) {
        genelSkorHtml += `<span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 2. Oyuncu Karşılaşmayı Üstünlükle Kazandı!</span>`;
        triggerWinnerConfetti(2); 
    } else {
        genelSkorHtml += `<span style='color:#f1c40f; font-size:1.2em; font-weight:bold;'>🤝 Skor Eşit, Beraberlik!</span>`;
        triggerWinnerConfetti(0); 
    }
    
    resultDisplay.innerHTML = detaylarHtml + genelSkorHtml;

    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.style.display = "inline-block";
}

// 3. MOD: ROLE SYNERGY (Zaten tamamen Sinerji Odaklıydı, buraya da yeni kuralları entegre ettik)
export function runSynergyBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Bitti! Sinerji Sonucu:";
    
    // Yeni dinamik sinerjileri hesapla
    const p1SinerjiRaporu = takimSinerjileriniHesapla(p1Takim, "1. Oyuncu");
    const p2SinerjiRaporu = takimSinerjileriniHesapla(p2Takim, "2. Oyuncu");

    // Güçleri yeni hesaplanan buff'lı takımlar üzerinden topla
    let p1Toplam = p1SinerjiRaporu.buffliTakim.reduce((sum, char) => sum + (char ? char.guc : 0), 0);
    let p2Toplam = p2SinerjiRaporu.buffliTakim.reduce((sum, char) => sum + (char ? char.guc : 0), 0);

    // Eski Kaptan Rolü bonusunu koruyoruz (İlk slotta seviyesi >= 90 bir lider varsa)
    if (p1Takim[0] && p1Takim[0].seviye >= 90) p1Toplam += 500000000;
    if (p2Takim[0] && p2Takim[0].seviye >= 90) p2Toplam += 500000000;

    let htmlResult = `<b>🏴‍☠️ TOPLAM ÖDÜL VE SİNERJİ SAVAŞI 🏴‍☠️</b><br><br>`;
    
    let tumSinerjiler = [...p1SinerjiRaporu.raporlar, ...p2SinerjiRaporu.raporlar];
    if (tumSinerjiler.length > 0) {
        htmlResult += `<div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 5px; margin: 10px 0;">${tumSinerjiler.join("<br>")}</div><br>`;
    }

    htmlResult += `🔴 1. Oyuncu Toplam Güç: ${p1Toplam.toLocaleString('tr-TR')} ฿<br>`;
    htmlResult += `🔵 2. Oyuncu Toplam Güç: ${p2Toplam.toLocaleString('tr-TR')} ฿<br><br>`;

    if (p1Toplam === 0 && p2Toplam === 0) {
        resultDisplay.innerHTML = "İki tarafta da kimse yok!";
        return;
    }

    const toplamSinerji = p1Toplam + p2Toplam;
    const p1Sans = (p1Toplam / toplamSinerji) * 100;
    const zar = Math.random() * 100;

    if (zar <= p1Sans) {
        htmlResult += `<span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 Sinerji Savaşını 1. Oyuncu Kazandı! (%${Math.round(p1Sans)} şansla)</span>`;
        resultDisplay.innerHTML = htmlResult;
        triggerWinnerConfetti(1);
    } else {
        htmlResult += `<span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 Sinerji Savaşını 2. Oyuncu Kazandı! (%${Math.round(100 - p1Sans)} şansla)</span>`;
        resultDisplay.innerHTML = htmlResult;
        triggerWinnerConfetti(2);
    }

    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.style.display = "inline-block";
}