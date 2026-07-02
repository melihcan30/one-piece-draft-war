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
        // data-winner="1" eklendi
        htmlResult += `<div class="match-final-result" data-winner="1"><span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 1. Oyuncu Gauntlet Savaşını Kazandı! Denizin Hakimi Oldu!</span></div>`;
    } else if (idx2 < t2.length) {
        // data-winner="2" eklendi
        htmlResult += `<div class="match-final-result" data-winner="2"><span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 2. Oyuncu Gauntlet Savaşını Kazandı! Denizin Hakimi Oldu!</span></div>`;
    } else {
        // data-winner="0" eklendi
        htmlResult += `<div class="match-final-result" data-winner="0"><span style='color:#f1c40f; font-size:1.2em; font-weight:bold;'>🤝 Beraberlik!</span></div>`;
    }

    resultDisplay.innerHTML = htmlResult;
}

// 2. MOD: MATCHUP
export function runMatchupBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    let p1Wins = 0;
    let p2Wins = 0;
    
    // 5 Slot için döngü
    for (let i = 0; i < 5; i++) {
        let c1 = p1Takim[i];
        let c2 = p2Takim[i];
        
        if (!c1 || !c2) continue; // Boş slot varsa atla
        
        let p1Power = c1.power || c1.guc || 0;
        let p2Power = c2.power || c2.guc || 0;
        
        // Eğer önceki turda haki yemiş ve bayılmışsa gücü 0 kabul edilir
        if (c1.isFainted) p1Power = 0;
        if (c2.isFainted) p2Power = 0;

        let diff = Math.abs(p1Power - p2Power);

        // HAKİ KONTROLÜ (Güç farkı 15'ten büyükse ve karakterler baygın değilse)
        if (diff > 15 && p1Power > 0 && p2Power > 0) {
            resultDisplay.innerHTML += `<div class="haki-clash" style="color: red; font-weight: bold; margin: 10px 0;">⚡ HAKİ ÇARPIŞMASI! Güç farkı: ${diff} ⚡</div>`;
            
            let nextIndex = i + 1; 
            if (p1Power > p2Power && p2Takim[nextIndex]) {
                p2Takim[nextIndex].isFainted = true;
                p2Takim[nextIndex].power = 0;
                p2Takim[nextIndex].guc = 0; // İki ihtimali de sıfırlıyoruz
                resultDisplay.innerHTML += `<div class="faint-text">Sarsıcı Haki! 2. Oyuncunun sıradaki savaşçısı bayıldı!</div>`;
            } else if (p2Power > p1Power && p1Takim[nextIndex]) {
                p1Takim[nextIndex].isFainted = true;
                p1Takim[nextIndex].power = 0;
                p1Takim[nextIndex].guc = 0;
                resultDisplay.innerHTML += `<div class="faint-text">Sarsıcı Haki! 1. Oyuncunun sıradaki savaşçısı bayıldı!</div>`;
            }
        }

        // Raunt Kazananını Belirleme
        if (p1Power > p2Power) {
            p1Wins++;
            resultDisplay.innerHTML += `<div>Raunt ${i+1}: 1. Oyuncu kazandı! (${c1.isim || c1.name} vs ${c2.isim || c2.name})</div>`;
        } else if (p2Power > p1Power) {
            p2Wins++;
            resultDisplay.innerHTML += `<div>Raunt ${i+1}: 2. Oyuncu kazandı! (${c2.isim || c2.name} vs ${c1.isim || c1.name})</div>`;
        } else {
            resultDisplay.innerHTML += `<div>Raunt ${i+1}: Berabere!</div>`;
        }
    }

    // MAÇ SONUCU VE KESİN KAZANAN ETİKETİ
    resultDisplay.innerHTML += `<hr><div><b>Skor:</b> 1. Oyuncu: ${p1Wins} - 2. Oyuncu: ${p2Wins}</div>`;
    
    if (p1Wins > p2Wins) {
        resultDisplay.innerHTML += `<div class="match-final-result" data-winner="1">Maçı 1. Oyuncu Kazandı!</div>`;
    } else if (p2Wins > p1Wins) {
        resultDisplay.innerHTML += `<div class="match-final-result" data-winner="2">Maçı 2. Oyuncu Kazandı!</div>`;
    } else {
        resultDisplay.innerHTML += `<div class="match-final-result" data-winner="0">Maç Berabere!</div>`;
    }
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
        // data-winner="1" eklendi
        htmlResult += `<div class="match-final-result" data-winner="1"><span style='color:#2ecc71; font-size:1.2em; font-weight:bold;'>🏆 Sinerji Savaşını 1. Oyuncu Kazandı! (%${Math.round(p1Sans)} şansla)</span></div>`;
    } else {
        // data-winner="2" eklendi
        htmlResult += `<div class="match-final-result" data-winner="2"><span style='color:#e74c3c; font-size:1.2em; font-weight:bold;'>🏆 Sinerji Savaşını 2. Oyuncu Kazandı! (%${Math.round(100 - p1Sans)} şansla)</span></div>`;
    }

    resultDisplay.innerHTML = htmlResult;
}