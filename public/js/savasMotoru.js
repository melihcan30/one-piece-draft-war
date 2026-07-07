// =========================================================================
// 🧠 SİNERJİ VE BONUS MOTORU (Takım İnceleme)
// =========================================================================
export function takimSinerjileriniHesapla(takim, oyuncuAdi) {
    // Orijinal takımı bozmamak için derin kopyalama yapıyoruz
    let buffliTakim = takim.filter(c => c).map(c => ({ ...c }));
    let raporlar = [];

    if (buffliTakim.length === 0) return { buffliTakim, raporlar };

    const isimler = buffliTakim.map(c => c.isim);

    // 1. 🔥 ASL Kardeşlik Bonusu (Luffy, Ace, Sabo bir aradaysa)
    if (isimler.includes("Monkey D. Luffy") && isimler.includes("Portgas D. Ace") && isimler.includes("Sabo")) {
        raporlar.push(`🔥 <b>${oyuncuAdi}:</b> ASL Kardeşliği! <i>(Luffy, Ace, Sabo +%20 Güç)</i>`);
        buffliTakim.forEach(c => {
            if (["Monkey D. Luffy", "Portgas D. Ace", "Sabo"].includes(c.isim)) {
                c.guc *= 1.20;
            }
        });
    }

    // 2. 🌪️ D.'nin İradesi Bonusu (Takımda 3 veya daha fazla D. karakteri varsa)
    const dCount = buffliTakim.filter(c => c.etiketler && c.etiketler.includes("D_Iradesi")).length;
    if (dCount >= 3) {
        raporlar.push(`🌪️ <b>${oyuncuAdi}:</b> D.'nin İradesi! <i>(Tüm D. karakterleri +%10 Güç)</i>`);
        buffliTakim.forEach(c => {
            if (c.etiketler && c.etiketler.includes("D_Iradesi")) {
                c.guc *= 1.10;
            }
        });
    }

    // 3. ⚓ Grup/Tayfa Sinerjisi (Korsan Tayfaları, Denizciler veya Devrimciler için 3'lü eşleşme)
    let tayfaSayilari = {};
    buffliTakim.forEach(c => {
        if (c.tayfa && c.tayfa !== "Diğerleri") {
            tayfaSayilari[c.tayfa] = (tayfaSayilari[c.tayfa] || 0) + 1;
        }
    });

    Object.keys(tayfaSayilari).forEach(tayfaAdi => {
        if (tayfaSayilari[tayfaAdi] >= 3) {
            raporlar.push(`⚓ <b>${oyuncuAdi}:</b> ${tayfaAdi} Sinerjisi! <i>(En az 3 ${tayfaAdi} üyesi +%15 Güç)</i>`);
            buffliTakim.forEach(c => {
                if (c.tayfa === tayfaAdi) {
                    c.guc *= 1.15;
                }
            });
        }
    });

    return { buffliTakim, raporlar };
}

// Görsel Sinerji Paneli Oluşturucu Yardımcı Fonksiyon
function getSinerjiHTML(s1, s2) {
    let html = "";
    if (s1.raporlar.length > 0 || s2.raporlar.length > 0) {
        html += `<div style="background-color: rgba(46, 204, 113, 0.15); border: 1px solid #2ecc71; border-left: 5px solid #2ecc71; padding: 12px; margin-bottom: 15px; border-radius: 5px; font-size: 0.95em;">`;
        html += `<b style="color: #2ecc71; font-size: 1.1em;">✨ TAKIM SİNERJİLERİ AKTİF!</b><br><br>`;
        if (s1.raporlar.length > 0) html += s1.raporlar.join("<br>") + "<br>";
        if (s2.raporlar.length > 0) html += s2.raporlar.join("<br>") + "<br>";
        html += `</div>`;
    }
    console.log("Sinerji HTML Oluştu:", html);
    return html;
}

// =========================================================================
// ⚔️ HİBRİT DÖVÜŞ MOTORU & ÖZEL PASİFLER (Zafiyetler)
// =========================================================================
export function hibritDovus(k1, k2) {
    if (!k1 || k1.seviye === 0 || k1.guc === 0) return { kazanan: k2, kaybeden: k1, sans: 100 };
    if (!k2 || k2.seviye === 0 || k2.guc === 0) return { kazanan: k1, kaybeden: k2, sans: 100 };

    // --- SANJI ÖZEL ZAFİYETİ ---
    if (k1.isim === "Sanji" && k2.cinsiyet === "kadin") {
        return { kazanan: k2, kaybeden: k1, sans: 100, ozelMesaj: `💔 Sanji, ${k2.isim} karşısında eridi! (Kadınlara vuramaz!)` };
    }
    if (k2.isim === "Sanji" && k1.cinsiyet === "kadin") {
        return { kazanan: k1, kaybeden: k2, sans: 100, ozelMesaj: `💔 Sanji, ${k1.isim} karşısında eridi! (Kadınlara vuramaz!)` };
    }

    let k1Multiplier = 1;
    let k2Multiplier = 1;

    // --- LASTİK VS ELEKTRİK (Luffy vs Enel) ---
    if (k1.isim === "Monkey D. Luffy" && k2.isim === "Enel") k1Multiplier *= 2.0;
    if (k2.isim === "Monkey D. Luffy" && k1.isim === "Enel") k2Multiplier *= 2.0;

    // --- KARANLIK MEYVESİ AVANTAJI ---
    if (k1.isim === "Blackbeard" && k2.etiketler && k2.etiketler.includes("Meyve_Kullanicisi")) k1Multiplier *= 1.25;
    if (k2.isim === "Blackbeard" && k1.etiketler && k1.etiketler.includes("Meyve_Kullanicisi")) k2Multiplier *= 1.25;

    const maxOdul = 5564800000;
    
    const k1Skor = ((k1.seviye * 0.85) + ((k1.guc / maxOdul) * 15)) * k1Multiplier;
    const k2Skor = ((k2.seviye * 0.85) + ((k2.guc / maxOdul) * 15)) * k2Multiplier;

    const toplamSkor = k1Skor + k2Skor;
    const k1KazanmaSansı = (k1Skor / toplamSkor) * 100;

    const zar = Math.random() * 100;

    if (zar <= k1KazanmaSansı) {
        return { kazanan: k1, kaybeden: k2, sans: Math.round(k1KazanmaSansı) };
    } else {
        return { kazanan: k2, kaybeden: k1, sans: Math.round(100 - k1KazanmaSansı) };
    }
}

// =========================================================================
// 🏆 OYUN MODLARI ÇALIŞTIRICILARI
// =========================================================================

// 1. MOD: GAUNTLET
export function runGauntletBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Başladı! Sinerjiler ve Hamleler İnceleniyor...";
    
    const s1 = takimSinerjileriniHesapla(p1Takim, "1. Oyuncu");
    const s2 = takimSinerjileriniHesapla(p2Takim, "2. Oyuncu");

    let t1 = s1.buffliTakim.filter(c => c && c.guc > 0);
    let t2 = s2.buffliTakim.filter(c => c && c.guc > 0);

    let htmlResult = `<b>🏴‍☠️ GAUNTLET ELEME RAPORU 🏴‍☠️</b><br><br>`;
    
    // Sinerji Panelini Ekle
    htmlResult += getSinerjiHTML(s1, s2);

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
        
        if (sonuc.ozelMesaj) {
            htmlResult += `<span style='color:#f1c40f;'>[PASİF] ${sonuc.ozelMesaj}</span><br>`;
        }

        if (sonuc.kazanan.id === k1.id) {
            if (!sonuc.ozelMesaj) htmlResult += `<span style='color:#2ecc71; font-weight:bold;'>${k1.isim} kazandı!</span> (%${sonuc.sans} şans)<br>`;
            t1[idx1].seviye = Math.max(1, t1[idx1].seviye - 5); 
            idx2++; 
        } else {
            if (!sonuc.ozelMesaj) htmlResult += `<span style='color:#e74c3c; font-weight:bold;'>${k2.isim} kazandı!</span> (%${sonuc.sans} şans)<br>`;
            t2[idx2].seviye = Math.max(1, t2[idx2].seviye - 5);
            idx1++; 
        }
        raunt++;
    }

    htmlResult += "<br>";

    if (idx1 < t1.length) {
        htmlResult += `<div class="match-final-result" data-winner="1"><span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 1. Oyuncu Gauntlet Savaşını Kazandı! Denizin Hakimi Oldu!</span></div>`;
    } else if (idx2 < t2.length) {
        htmlResult += `<div class="match-final-result" data-winner="2"><span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 2. Oyuncu Gauntlet Savaşını Kazandı! Denizin Hakimi Oldu!</span></div>`;
    } else {
        htmlResult += `<div class="match-final-result" data-winner="0"><span style='color:#f1c40f; font-size:1.2em; font-weight:bold;'>🤝 Beraberlik!</span></div>`;
    }

    resultDisplay.innerHTML = htmlResult;
}

// 2. MOD: MATCHUP
export function runMatchupBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    let p1Wins = 0;
    let p2Wins = 0;
    
    const s1 = takimSinerjileriniHesapla(p1Takim, "1. Oyuncu");
    const s2 = takimSinerjileriniHesapla(p2Takim, "2. Oyuncu");

    let htmlResult = `<b>⚔️ MATCHUP SAVAŞ RAPORU ⚔️</b><br><br>`;
    
    // Sinerji Panelini Ekle
    htmlResult += getSinerjiHTML(s1, s2);
    
    for (let i = 0; i < 5; i++) {
        let c1 = s1.buffliTakim[i];
        let c2 = s2.buffliTakim[i];
        
        if (!c1 || !c2) continue; 
        
        let p1Guc = c1.guc || 0;
        let p2Guc = c2.guc || 0;
        let rauntNotu = "";

        if (c1.isim === "Sanji" && c2.cinsiyet === "kadin") {
            p1Guc = -1;
            rauntNotu = " 💔 <span style='color:#f1c40f;'>(Sanji kadınlara vuramaz!)</span>";
        } else if (c2.isim === "Sanji" && c1.cinsiyet === "kadin") {
            p2Guc = -1;
            rauntNotu = " 💔 <span style='color:#f1c40f;'>(Sanji kadınlara vuramaz!)</span>";
        }

        if (p1Guc > p2Guc) {
            p1Wins++;
            htmlResult += `⏱️ <b>Raunt ${i+1}:</b> <span style='color:#2ecc71;'>1. Oyuncu kazandı!</span> (${c1.isim} vs ${c2.isim})${rauntNotu}<br>`;
        } else if (p2Guc > p1Guc) {
            p2Wins++;
            htmlResult += `⏱️ <b>Raunt ${i+1}:</b> <span style='color:#e74c3c;'>2. Oyuncu kazandı!</span> (${c2.isim} vs ${c1.isim})${rauntNotu}<br>`;
        } else {
            htmlResult += `⏱️ <b>Raunt ${i+1}:</b> Berabere! (${c1.isim} vs ${c2.isim})<br>`;
        }
    }

    htmlResult += `<br><div><b>Skor:</b> 1. Oyuncu: ${p1Wins} - 2. Oyuncu: ${p2Wins}</div><br>`;
    
    if (p1Wins > p2Wins) {
        htmlResult += `<div class="match-final-result" data-winner="1"><span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 1. Oyuncu Matchup Savaşını Kazandı!</span></div>`;
    } else if (p2Wins > p1Wins) {
        htmlResult += `<div class="match-final-result" data-winner="2"><span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 2. Oyuncu Matchup Savaşını Kazandı!</span></div>`;
    } else {
        htmlResult += `<div class="match-final-result" data-winner="0"><span style='color:#f1c40f; font-size:1.2em; font-weight:bold;'>🤝 Matchup Berabere Bitti!</span></div>`;
    }

    resultDisplay.innerHTML = htmlResult;
}

// 3. MOD: ROLE SYNERGY
export function runSynergyBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Başladı! Sinerji Gücü Ölçülüyor...";
    
    const s1 = takimSinerjileriniHesapla(p1Takim, "1. Oyuncu");
    const s2 = takimSinerjileriniHesapla(p2Takim, "2. Oyuncu");

    let p1Toplam = s1.buffliTakim.reduce((sum, char) => sum + (char ? char.guc : 0), 0);
    let p2Toplam = s2.buffliTakim.reduce((sum, char) => sum + (char ? char.guc : 0), 0);

    if (p1Takim[0] && p1Takim[0].seviye >= 90) p1Toplam += 500000000;
    if (p2Takim[0] && p2Takim[0].seviye >= 90) p2Toplam += 500000000;

    let htmlResult = `<b>Sinerji ve Rol Bonusları Dahil Toplam Ödüller:</b><br><br>`;
    
    // Sinerji Panelini Ekle
    htmlResult += getSinerjiHTML(s1, s2);

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
        htmlResult += `<div class="match-final-result" data-winner="1"><span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 Sinerji Savaşını 1. Oyuncu Kazandı! (%${Math.round(p1Sans)} şansla)</span></div>`;
    } else {
        htmlResult += `<div class="match-final-result" data-winner="2"><span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 Sinerji Savaşını 2. Oyuncu Kazandı! (%${Math.round(100 - p1Sans)} şansla)</span></div>`;
    }

    resultDisplay.innerHTML = htmlResult;
}