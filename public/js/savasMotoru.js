// --- BÜYÜK PASİF YETENEK MOTORU (İSİM DÜZELTMESİ YAPILDI) ---
const KADIN_KARAKTERLER = ["Nami", "Nico Robin", "Boa Hancock", "Big Mom", "Charlotte Linlin"];
const KILIC_USTALARI = ["Roronoa Zoro", "Dracule Mihawk", "Silvers Rayleigh", "Shanks", "Kozuki Oden", "Trafalgar Law", "Killer", "Vista", "Shiryu", "Brook"]; 
const DENIZCI_VE_HUKUMET = ["Monkey D. Garp", "Sengoku", "Akainu", "Aokiji", "Kizaru", "Fujitora", "Ryokugyu", "Smoker", "Koby", "Rob Lucci", "Magellan"];
const KORSANLAR = ["Monkey D. Luffy", "Roronoa Zoro", "Sanji", "Nami", "Usopp", "Chopper", "Nico Robin", "Franky", "Brook", "Jinbe", "Gol D. Roger", "Whitebeard", "Shanks", "Kaido", "Big Mom", "Buggy", "Eustass Kid", "Trafalgar Law", "Boa Hancock", "Blackbeard", "Marco", "King", "Katakuri", "Crocodile"];

function pasifYetenekleriUygula(takim1, takim2, aktifMod, savasLoglari) {
    // Her karaktere başlangıç state'i yükle
    const karakterleriHazirla = (takim) => {
        takim.forEach(k => {
            k.aktifGuc = k.guc || k.temelGuc;
            k.debuffKorumasi = (k.isim === "Akainu" || k.isim === "Kaido"); 
            k.ilkDebuffEngellendi = false; 
            k.kadinMi = KADIN_KARAKTERLER.includes(k.isim);
            k.kilicUstasiMi = KILIC_USTALARI.includes(k.isim);
        });
    };

    karakterleriHazirla(takim1);
    karakterleriHazirla(takim2);

    // Debuff Mekanizması
    const debuffVur = (hedef, yuzde, kaynakIsmi) => {
        if (hedef.debuffKorumasi) {
            savasLoglari.push(`🛡️ [Mutlak Koruma] ${hedef.isim}, ${kaynakIsmi} etkisini yok saydı!`);
            return 0;
        }
        if (hedef.isim === "Kizaru" && !hedef.ilkDebuffEngellendi) {
            hedef.ilkDebuffEngellendi = true;
            savasLoglari.push(`✨ [Işık Hızı] Kizaru, ${kaynakIsmi} etkisinden anında sıyrıldı!`);
            return 0;
        }
        if (hedef.isim === "Franky" && !hedef.ilkDebuffEngellendi) {
            hedef.ilkDebuffEngellendi = true;
            savasLoglari.push(`🦾 [Süper Zırh] Franky, ${kaynakIsmi} etkisini göğsünde durdurdu!`);
            return 0;
        }
        if (hedef.isim === "Buggy" && hedef.buggyKilicKorumasi && KILIC_USTALARI.includes(kaynakIsmi)) {
            if(kaynakIsmi !== "Dracule Mihawk") return 0; 
        }

        let dusus = hedef.aktifGuc * yuzde;
        hedef.aktifGuc -= dusus;
        return dusus; 
    };

    const takimiIsle = (dostTakim, dusmanTakim, takimNo) => {
        dostTakim.forEach(karakter => {
            
            if (karakter.isim.includes("Luffy")) {
                // --- 1. Denizlerdeki En Korkunç Güç ---
                
                // Takımdaki herkese (kendisi hariç takım arkadaşlarına) %15 güç ver
                dostTakim.forEach(dost => {
                    if (dost.isim !== karakter.isim) {
                        dost.aktifGuc *= 1.15;
                    }
                });
                savasLoglari.push(`🌊 [Denizlerdeki En Korkunç Güç] Luffy etrafındakilere ilham vererek takım arkadaşlarının gücünü %15 artırdı!`);

                // Rakipte seviyesi 92 ve üstü olan biri varsa Luffy'nin gücü %15 artar
                if (dusmanTakim.some(k => k.seviye >= 92)) {
                    karakter.aktifGuc *= 1.15;
                    savasLoglari.push(`👑 [Sarsılmaz İrade] Karşısındaki güçlü rakipler Luffy'nin iradesini tetikledi! Luffy'nin gücü %15 arttı.`);
                }

                // --- 2. Güneş Tanrısı - Joyboy ---
                
                // Takımdaki korsan sayısına göre gücünü artır (Kendisi de bir korsan olduğu için onu da sayar)
                let korsanSayisi = dostTakim.filter(k => k.taraf === "korsan").length;
                if (korsanSayisi > 0) {
                    let ekstraGucCarpani = 1 + (korsanSayisi * 0.05);
                    karakter.aktifGuc *= ekstraGucCarpani;
                    savasLoglari.push(`☀️ [Güneş Tanrısı] Takımdaki korsanlar Joyboy'un ritmine katıldı! Luffy'nin gücü %${korsanSayisi * 5} arttı.`);
                }

                // Tüm takımı (kendisi dahil) debuff'lara karşı korumalı hale getir
                dostTakim.forEach(dost => {
                    dost.debuffKorumasi = true;
                });
                savasLoglari.push(`🛡️ [Joyboy'un Özgürlüğü] Luffy tüm takımını negatif etkilere karşı koruma altına aldı!`);
            }

            if (karakter.isim === "Roronoa Zoro") {
                karakter.gauntletYorulmaz = true; 
            }

            if (karakter.isim === "Sanji") {
                if (dusmanTakim.some(k => k.kadinMi)) {
                    karakter.aktifGuc = 0;
                    savasLoglari.push(`💔 Sanji kadınlara vuramaz! Sanji elendi.`);
                } else if (dostTakim.some(k => k.kadinMi && k.isim !== "Sanji")) {
                    karakter.aktifGuc *= 1.10;
                    savasLoglari.push(`🔥 [Şövalye Ruhu] Sanji takımındaki kadınlar için gücünü %10 artırdı!`);
                }
            }

            if (karakter.isim === "Nami" && dusmanTakim.length > 0) {
                let enGuclu = dusmanTakim.reduce((max, c) => (c.aktifGuc > max.aktifGuc) ? c : max);
                debuffVur(enGuclu, 0.10, "Mirage Tempo");
                savasLoglari.push(`☁️ [Mirage Tempo] Nami, ${enGuclu.isim} karakterinin gücünü %10 azalttı.`);
            }

            if (karakter.isim === "Usopp") {
                let dostToplam = dostTakim.reduce((sum, c) => sum + c.aktifGuc, 0);
                let dusmanToplam = dusmanTakim.reduce((sum, c) => sum + c.aktifGuc, 0);
                if (dostToplam < dusmanToplam) {
                    karakter.aktifGuc *= 1.25;
                    savasLoglari.push(`🤥 [Tanrı Usopp] Usopp blöf yaptı ve kendi gücünü %25 artırdı!`);
                }
            }

            if (karakter.isim === "Chopper") {
                let luffyVar = dostTakim.some(k => k.isim === "Monkey D. Luffy");
                dostTakim.forEach(k => k.aktifGuc *= luffyVar ? 1.15 : 1.10);
                savasLoglari.push(`💊 [Doktor] Chopper takıma +%${luffyVar ? 15 : 10} şifa verdi!`);
            }

            if (karakter.isim === "Nico Robin") {
                dusmanTakim.sinerjiYariYariya = true; 
                savasLoglari.push(`🌸 [Arkeolog] Robin rakibin sinerjisini %50 zayıflattı!`);
            }

            if (karakter.isim === "Franky") {
                dusmanTakim.forEach(k => debuffVur(k, 0.05, "Radical Beam"));
                savasLoglari.push(`⭐ [Süper] Franky rakip takımı %5 zayıflattı!`);
            }

            if (karakter.isim === "Jinbe") {
                dostTakim.filter(k => k.etiketler && (k.etiketler.includes("Kaptan") || k.etiketler.includes("Lider")))
                         .forEach(k => k.aktifGuc *= 1.12);
                savasLoglari.push(`🌊 [Birinci Oğul] Jinbe kaptanların gücünü %12 artırdı!`);
            }

            if (karakter.isim === "Shanks") {
                dusmanTakim.forEach(k => {
                    let dusus = k.seviye >= 95 ? 0.03 : (k.seviye >= 90 ? 0.06 : (k.seviye >= 80 ? 0.09 : 0.15));
                    debuffVur(k, dusus, "Fatih Hakisi");
                });
                savasLoglari.push(`👑 [Haki] Shanks rakibin iradesini kırdı!`);
            }

            if (karakter.isim === "Dracule Mihawk" && dusmanTakim.some(k => k.kilicUstasiMi)) {
                karakter.aktifGuc *= 1.20;
                savasLoglari.push(`🦅 [Dünyanın En Güçlüsü] Mihawk, kılıç ustalarına karşı gücünü %20 artırdı!`);
            }

            if (karakter.isim === "Buggy") {
                karakter.buggyKilicKorumasi = true; 
                let sans = (Math.random() * 0.40) - 0.10; 
                karakter.aktifGuc += karakter.aktifGuc * sans;
                savasLoglari.push(`🤡 [Şans İlahı] Buggy'nin gücü rastgele değişti!`);
            }

            if (karakter.isim === "Gol D. Roger") {
                dostTakim.forEach(k => k.aktifGuc *= 1.12);
                if (dusmanTakim.some(k => DENIZCI_VE_HUKUMET.includes(k.isim))) {
                    karakter.aktifGuc *= 1.12;
                    savasLoglari.push(`☠️ [Korsanlar Kralı] Roger takımını ve kendini coşturdu!`);
                }
            }

            if (karakter.isim === "Whitebeard") {
                dusmanTakim.forEach(k => debuffVur(k, 0.08, "Gura Gura"));
                savasLoglari.push(`🌍 [Deprem] Whitebeard rakip takımı %8 sarstı!`);
            }

            if (karakter.isim === "Monkey D. Dragon") {
                dusmanTakim.denizciSinerjiIptal = true; 
                if (dostTakim.mevcutPasHakki < 5) { 
                    dostTakim.ekstraPasHakki = true;
                    savasLoglari.push(`🌪️ [Devrim] Dragon Hükümet sinerjilerini bozdu! (+1 Pas Hakkı)`);
                } else {
                    savasLoglari.push(`🌪️ [Devrim] Dragon Hükümet sinerjilerini bozdu! (Pas hakkı dolu)`);
                }
            }

            if (karakter.isim === "Monkey D. Garp") {
                if (dusmanTakim.some(k => k.isim === "Monkey D. Luffy" || k.isim === "Portgas D. Ace")) {
                    karakter.aktifGuc *= 0.88; 
                    savasLoglari.push(`👴 [Merhamet] Garp torunlarını görünce gücü %12 düştü...`);
                } else if (dusmanTakim.some(k => KORSANLAR.includes(k.isim))) {
                    karakter.aktifGuc *= 1.12;
                }
            }

            if (karakter.isim === "Kaido" && (aktifMod === "GAUNTLET" || aktifMod === "MATCHUP")) {
                karakter.aktifGuc *= 1.12;
                savasLoglari.push(`🐉 [Canavar] Kaido 1v1 savaşta gücünü %12 artırdı!`);
            }

            if (karakter.isim === "Big Mom" || karakter.isim === "Charlotte Linlin") {
                dusmanTakim.filter(k => k.seviye < karakter.seviye).forEach(k => {
                    let calinan = debuffVur(k, 0.05, "Soul Pocus");
                    karakter.aktifGuc += calinan;
                });
                savasLoglari.push(`🍬 [Ruh Pocusu] Big Mom zayıflardan ruh çaldı!`);
            }

            if (karakter.isim === "Blackbeard") {
                if (dusmanTakim.some(k => k.etiketler && k.etiketler.includes("Meyve_Kullanicisi"))) {
                    karakter.aktifGuc *= 1.25;
                    savasLoglari.push(`🌑 [Karanlık Girdap] Karasakal, Şeytan Meyvesi kullanıcılarına karşı gücünü %25 artırdı!`);
                }
            }

            if (karakter.isim === "Sengoku") {
                dostTakim.filter(k => DENIZCI_VE_HUKUMET.includes(k.isim)).forEach(k => k.aktifGuc *= 1.12);
                dusmanTakim.sinerjiKilitli = true; 
                savasLoglari.push(`☸️ [Buda] Sengoku denizcileri coşturdu ve rakip sinerjisini kilitledi!`);
            }

            if (karakter.isim === "Akainu") {
                dusmanTakim.filter(k => KORSANLAR.includes(k.isim)).forEach(k => debuffVur(k, 0.05, "Magma"));
                savasLoglari.push(`🌋 [Mutlak Adalet] Akainu korsanları %5 eritti!`);
            }

            if (karakter.isim === "Aokiji" && dusmanTakim.length > 0) {
                let enZayif = dusmanTakim.reduce((min, c) => (c.aktifGuc < min.aktifGuc) ? c : min);
                debuffVur(enZayif, 0.15, "Ice Age");
                savasLoglari.push(`❄️ [Buz Çağı] Aokiji, ${enZayif.isim} karakterini dondurdu!`);
            }

            if (karakter.isim === "Kizaru") {
                karakter.aktifGuc *= 1.07;
            }

            if (karakter.isim === "Silvers Rayleigh") {
                dostTakim.filter(k => k.seviye < 90).forEach(k => k.aktifGuc *= 1.15);
                savasLoglari.push(`🕶️ [Kara Kral] Rayleigh gençleri eğitti! (+%15)`);
            }

            if (karakter.isim === "Kozuki Oden") {
                if (karakter.rol === "Savaşçı" || karakter.rol === "Tank") karakter.aktifGuc *= 1.12;
                if (dusmanTakim.some(k => k.isim === "Kaido")) {
                    karakter.aktifGuc *= 1.15;
                    savasLoglari.push(`⚔️ [İntikam] Oden, Kaido'ya karşı öfkeyle doldu!`);
                }
            }

            if (karakter.isim === "Sabo") {
                if (dostTakim.some(k => k.isim === "Monkey D. Luffy")) karakter.aktifGuc *= 1.12;
                dusmanTakim.forEach(k => debuffVur(k, 0.05, "Alev Pençesi"));
                savasLoglari.push(`🔥 [Miras] Sabo düşmanları alevlerle sardı!`);
            }

            if (karakter.isim === "Boa Hancock") {
                if (dostTakim.some(k => k.isim === "Monkey D. Luffy")) {
                    karakter.aktifGuc *= 1.15;
                }
                dusmanTakim.forEach(k => {
                    if (!k.kadinMi && k.isim !== "Monkey D. Luffy") debuffVur(k, 0.10, "Aşk Oku");
                });
                savasLoglari.push(`🏹 [Mero Mero] Hancock erkekleri taşa çevirdi!`);
            }

            if (karakter.isim === "Eustass Kid") {
                let hurdaSayisi = dusmanTakim.filter(k => k.kilicUstasiMi || k.isim === "Franky").length;
                karakter.aktifGuc += (karakter.aktifGuc * (0.08 * hurdaSayisi));
                if(hurdaSayisi > 0) savasLoglari.push(`🧲 [Manyetik] Kid rakiplerin metallerini çekti!`);
            }

            if (karakter.isim === "Trafalgar Law" && dusmanTakim.length > 0 && dostTakim.length > 0) {
                let enGucluDusman = dusmanTakim.reduce((max, c) => (c.aktifGuc > max.aktifGuc) ? c : max);
                let enZayifDost = dostTakim.reduce((min, c) => (c.aktifGuc < min.aktifGuc) ? c : min);
                
                let calinan = debuffVur(enGucluDusman, 0.10, "ROOM: Shambles");
                enZayifDost.aktifGuc += calinan;
                savasLoglari.push(`🔵 [Shambles] Law, ${enGucluDusman.isim}'den çaldığı gücü ${enZayifDost.isim}'e aktardı!`);
            }
        });
    };

    takimiIsle(takim1, takim2, 1);
    takimiIsle(takim2, takim1, 2);

    takim1.forEach(k => k.guc = k.aktifGuc);
    takim2.forEach(k => k.guc = k.aktifGuc);
    
    return { takim1Duzenlenmis: takim1, takim2Duzenlenmis: takim2 };
}

// =========================================================================
// 🧠 SİNERJİ VE BONUS MOTORU (Takım İnceleme)
// =========================================================================
export function takimSinerjileriniHesapla(takim, oyuncuAdi) {
    // --- YENİ EKLENEN KİLİT MEKANİZMASI ---
    if (takim.sinerjiKilitli) {
        return { buffliTakim: takim, raporlar: [`⚓ <b>${oyuncuAdi}:</b> Rakibin baskısıyla sinerji kilitlendi!`] };
    }
    // Robin/Dragon için zayıflatma
    let sinerjiCarpani = takim.sinerjiYariYariya ? 0.5 : 1.0;
    
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

    let k1Multiplier = 1;
    let k2Multiplier = 1;

    // --- LASTİK VS ELEKTRİK (Luffy vs Enel) ---
    if (k1.isim === "Monkey D. Luffy" && k2.isim === "Enel") k1Multiplier *= 2.0;
    if (k2.isim === "Monkey D. Luffy" && k1.isim === "Enel") k2Multiplier *= 2.0;


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

    // 🌟 PASİFLERİ UYGULA VE ADIM ADIM EKRANA YAZDIR
    let pasifLoglari = [];
    pasifYetenekleriUygula(t1, t2, "GAUNTLET", pasifLoglari);

    if (pasifLoglari.length > 0) {
        htmlResult += `<b style="color: #f1c40f;">✨ AKTİF PASİF YETENEKLER</b><br>`;
        // KUTU YERİNE SPAN KULLANIYORUZ: Böylece sistem her pasifi tek bir adım (tıklama) olarak algılar
        pasifLoglari.forEach(log => {
            htmlResult += `<span style="background: rgba(241, 196, 15, 0.15); border-left: 3px solid #f1c40f; padding: 4px 8px; color: #d4af37; display: inline-block; margin-bottom: 4px;">${log}</span><br>`;
        });
        htmlResult += `<br>`;
    }

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
            if (!k1.gauntletYorulmaz) {
                t1[idx1].seviye = Math.max(1, t1[idx1].seviye - 5); 
            }
            idx2++; 
        } else {
            if (!sonuc.ozelMesaj) htmlResult += `<span style='color:#e74c3c; font-weight:bold;'>${k2.isim} kazandı!</span> (%${sonuc.sans} şans)<br>`;
            if (!k2.gauntletYorulmaz) {
                t2[idx2].seviye = Math.max(1, t2[idx2].seviye - 5);
            }
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

// 2. MOD: MATCHUP (Birebir Kapışma - Pasifler Eklendi)
export function runMatchupBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    let p1Wins = 0;
    let p2Wins = 0;
    
    const s1 = takimSinerjileriniHesapla(p1Takim, "1. Oyuncu");
    const s2 = takimSinerjileriniHesapla(p2Takim, "2. Oyuncu");

    // Orijinal dizilimi bozmamak (boş slotları korumak) için kopyalıyoruz
    let t1 = s1.buffliTakim.map(c => c ? {...c} : null);
    let t2 = s2.buffliTakim.map(c => c ? {...c} : null);

    let htmlResult = `<b>⚔️ MATCHUP SAVAŞ RAPORU ⚔️</b><br><br>`;
    htmlResult += getSinerjiHTML(s1, s2);
    
    // 🌟 PASİFLERİ UYGULA (Sadece dolu slotları motora gönderiyoruz)
    let doluT1 = t1.filter(c => c !== null);
    let doluT2 = t2.filter(c => c !== null);
    let pasifLoglari = [];
    pasifYetenekleriUygula(doluT1, doluT2, "MATCHUP", pasifLoglari);

    if (pasifLoglari.length > 0) {
        htmlResult += `<b style="color: #f1c40f;">✨ AKTİF PASİF YETENEKLER</b><br>`;
        pasifLoglari.forEach(log => {
            htmlResult += `<span style="background: rgba(241, 196, 15, 0.15); border-left: 3px solid #f1c40f; padding: 4px 8px; color: #d4af37; display: inline-block; margin-bottom: 4px;">${log}</span><br>`;
        });
        htmlResult += `<br>`;
    }

    for (let i = 0; i < 5; i++) {
        let c1 = t1[i];
        let c2 = t2[i];
        
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

// 3. MOD: SYNERGY (Sinerji ve Pasiflerin Toplam Güç Savaşı)
export function runSynergyBattle(p1Takim, p2Takim, turnDisplay, resultDisplay) {
    turnDisplay.textContent = "⚔️ Savaş Başladı! Sinerji Gücü Ölçülüyor...";
    
    const s1 = takimSinerjileriniHesapla(p1Takim, "1. Oyuncu");
    const s2 = takimSinerjileriniHesapla(p2Takim, "2. Oyuncu");

    let t1 = s1.buffliTakim.filter(c => c !== null);
    let t2 = s2.buffliTakim.filter(c => c !== null);

    let htmlResult = `<b>Sinerji ve Pasif Bonusları Dahil Toplam Ödüller:</b><br><br>`;
    htmlResult += getSinerjiHTML(s1, s2);

    // 🌟 PASİFLERİ UYGULA (Toplam Güce Etki Edecek)
    let pasifLoglari = [];
    pasifYetenekleriUygula(t1, t2, "SYNERGY", pasifLoglari);

    if (pasifLoglari.length > 0) {
        htmlResult += `<b style="color: #f1c40f;">✨ AKTİF PASİF YETENEKLER</b><br>`;
        pasifLoglari.forEach(log => {
            htmlResult += `<span style="background: rgba(241, 196, 15, 0.15); border-left: 3px solid #f1c40f; padding: 4px 8px; color: #d4af37; display: inline-block; margin-bottom: 4px;">${log}</span><br>`;
        });
        htmlResult += `<br>`;
    }

    // Pasifler uygulandıktan sonraki YENİ güçleri topluyoruz
    let p1Toplam = t1.reduce((sum, char) => sum + (char ? char.guc : 0), 0);
    let p2Toplam = t2.reduce((sum, char) => sum + (char ? char.guc : 0), 0);

    // Kaptan (Seviye 90+) bonusu
    if (p1Takim[0] && p1Takim[0].seviye >= 90) p1Toplam += 500000000;
    if (p2Takim[0] && p2Takim[0].seviye >= 90) p2Toplam += 500000000;

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