export function hibritDovus(k1, k2) {
    if (!k1 || k1.seviye === 0 || k1.guc === 0) return { kazanan: k2, kaybeden: k1, sans: 100 };
    if (!k2 || k2.seviye === 0 || k2.guc === 0) return { kazanan: k1, kaybeden: k2, sans: 100 };

    const maxOdul = 5564800000;
    
    const k1Skor = (k1.seviye * 0.85) + ((k1.guc / maxOdul) * 15);
    const k2Skor = (k2.seviye * 0.85) + ((k2.guc / maxOdul) * 15);

    const toplamSkor = k1Skor + k2Skor;
    const k1KazanmaSansı = (k1Skor / toplamSkor) * 100;

    const zar = Math.random() * 100;

    if (zar <= k1KazanmaSansı) {
        return { kazanan: k1, kaybeden: k2, sans: Math.round(k1KazanmaSansı) };
    } else {
        return { kazanan: k2, kaybeden: k1, sans: Math.round(100 - k1KazanmaSansı) };
    }
}

// 1. MOD: GAUNTLET
export function runGauntletBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Başladı! Hamleler İnceleniyor...";
    
    let t1 = p1Takim.filter(c => c && c.guc > 0).map(c => ({ ...c }));
    let t2 = p2Takim.filter(c => c && c.guc > 0).map(c => ({ ...c }));

    let htmlResult = `<b>🏴‍☠️ GAUNTLET ELEME RAPORU 🏴‍☠️</b><br><br>`;
    
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
        
        if (sonuc.kazanan.id === k1.id) {
            htmlResult += `<span style='color:#2ecc71; font-weight:bold;'>${k1.isim} kazandı!</span> (%${sonuc.sans} şans)<br>`;
            t1[idx1].seviye = Math.max(1, t1[idx1].seviye - 5); 
            idx2++; 
        } else {
            htmlResult += `<span style='color:#e74c3c; font-weight:bold;'>${k2.isim} kazandı!</span> (%${sonuc.sans} şans)<br>`;
            t2[idx2].seviye = Math.max(1, t2[idx2].seviye - 5);
            idx1++; 
        }
        raunt++;
    }

    htmlResult += "<br>";

    if (idx1 < t1.length) {
        htmlResult += `<span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 1. Oyuncu Gauntlet Savaşını Kazandı! Denizin Hakimi Oldu!</span>`;
    } else if (idx2 < t2.length) {
        htmlResult += `<span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 2. Oyuncu Gauntlet Savaşını Kazandı! Denizin Hakimi Oldu!</span>`;
    } else {
        htmlResult += `<span style='color:#f1c40f; font-size:1.2em; font-weight:bold;'>🤝 Beraberlik!</span>`;
    }

    resultDisplay.innerHTML = htmlResult;
}

// 2. MOD: MATCHUP
export function runMatchupBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Başladı! Düellolar İnceleniyor...";
    
    let p1Galibiyet = 0;
    let p2Galibiyet = 0;
    let detaylarHtml = "<b>🏴‍☠️ DÜELLO SONUÇLARI 🏴‍☠️</b><br><br>";

    for (let i = 0; i < 5; i++) {
        let p1Char = p1Takim[i];
        let p2Char = p2Takim[i];
        
        if (!p1Char && !p2Char) {
            detaylarHtml += `🥊 <b>Raunt ${i + 1}:</b> Boş Slot vs Boş Slot ➔ <span style='color:#7f8c8d;'>Savaş Yok</span><br>`;
            continue;
        }

        let k1 = p1Char ? { ...p1Char } : { isim: "Boş Slot", guc: 0, seviye: 0 };
        let k2 = p2Char ? { ...p2Char } : { isim: "Boş Slot", guc: 0, seviye: 0 };

        const sonuc = hibritDovus(k1, k2);
        detaylarHtml += `🥊 <b>Raunt ${i + 1}:</b> ${k1.isim} <b>vs</b> ${k2.isim} ➔ `;

        if (sonuc.kazanan.isim === k1.isim && k1.isim !== "Boş Slot") {
            p1Galibiyet++;
            detaylarHtml += `<span style='color:#2ecc71; font-weight:bold;'>1. Oyuncu Kazandı</span> (%${sonuc.sans} şansla)<br>`;
        } else if (sonuc.kazanan.isim === k2.isim && k2.isim !== "Boş Slot") {
            p2Galibiyet++;
            detaylarHtml += `<span style='color:#e74c3c; font-weight:bold;'>2. Oyuncu Kazandı</span> (%${sonuc.sans} şansla)<br>`;
        } else {
            detaylarHtml += `<span style='color:#f1c40f;'>Savaş Yok</span><br>`;
        }
    }

    let genelSkorHtml = `<br><b>📊 GENEL SKOR: 1. Oyuncu [ ${p1Galibiyet} - ${p2Galibiyet} ] 2. Oyuncu</b><br><br>`;
    
    if (p1Galibiyet > p2Galibiyet) {
        genelSkorHtml += `<span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 1. Oyuncu Karşılaşmayı Üstünlükle Kazandı!</span>`;
    } else if (p2Galibiyet > p1Galibiyet) {
        genelSkorHtml += `<span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 2. Oyuncu Karşılaşmayı Üstünlükle Kazandı!</span>`;
    } else {
        genelSkorHtml += `<span style='color:#f1c40f; font-size:1.2em; font-weight:bold;'>🤝 Skor Eşit, Beraberlik!</span>`;
    }
    
    resultDisplay.innerHTML = detaylarHtml + genelSkorHtml;
}

// 3. MOD: ROLE SYNERGY
export function runSynergyBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Başladı! Sinerji Gücü Ölçülüyor...";
    
    let p1Toplam = p1Takim.reduce((sum, char) => sum + (char ? char.guc : 0), 0);
    let p2Toplam = p2Takim.reduce((sum, char) => sum + (char ? char.guc : 0), 0);

    if (p1Takim[0] && p1Takim[0].seviye >= 90) p1Toplam += 500000000;
    if (p2Takim[0] && p2Takim[0].seviye >= 90) p2Toplam += 500000000;

    let htmlResult = `<b>Sinerji ve Rol Bonusları Dahil Toplam Ödüller:</b><br>`;
    htmlResult += `🔴 1. Oyuncu: ${p1Toplam.toLocaleString('tr-TR')} ฿<br>`;
    htmlResult += `🔵 2. Oyuncu: ${p2Toplam.toLocaleString('tr-TR')} ฿<br><br>`;

    if (p1Toplam === 0 && p2Toplam === 0) {
        resultDisplay.innerHTML = "İki tarafta da kimse yok!";
        return;
    }

    const toplamSinerji = p1Toplam + p2Toplam;
    const p1Sans = (p1Toplam / toplamSinerji) * 100;
    const zar = Math.random() * 100;

    if (zar <= p1Sans) {
        htmlResult += `<span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 Sinerji Savaşını 1. Oyuncu Kazandı! (%${Math.round(p1Sans)} şansla)</span>`;
    } else {
        htmlResult += `<span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 Sinerji Savaşını 2. Oyuncu Kazandı! (%${Math.round(100 - p1Sans)} şansla)</span>`;
    }

    resultDisplay.innerHTML = htmlResult;
}