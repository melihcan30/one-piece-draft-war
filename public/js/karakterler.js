export const anaRenkler = [
    "#c0392b", // Hazine Kırmızısı
    "#d35400", // Meyve Turuncusu
    "#f39c12", // Berries Sarısı
    "#27ae60", // Korsan Yeşili
    "#16a085", // Fırtına Cam Göbeği
    "#2980b9", // Okyanus Mavisi
    "#8e44ad", // Gizemli Mor
    "#b33939"  // Poneglyph Bordosu
];

export let karakterler = [
    { id: 1, isim: "Gol D. Roger", tier: "Legendary", guc: 5564800000, taraf: "korsan", seviye: 100, tayfa: "Roger Korsanları", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Kral_Hakisi", "Kilic_Ustasi", "Efsane"], pasif: {
    isim: "Korsanlar Kralı",
    aciklama: "Tüm takımının gücünü +%12 artırır. Rakipte 'Denizci' veya 'Dünya Hükümeti' varsa onlara karşı ekstra +%12 güç kazanır."} },
    { id: 2, isim: "Whitebeard", tier: "Legendary", guc: 5046000000, taraf: "korsan", seviye: 100, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Efsane"], pasif: {
    isim: "Dünyanın En Güçlü Adamı",
    aciklama: "Savaş başında rakibin toplam gücünü -%8 azaltır. Kendi takımından elenen her karakter için gücü +%10 artar."} },
    { id: 3, isim: "Monkey D. Garp", tier: "Legendary", guc: 5000000000, taraf: "denizci", seviye: 100, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Efsane"], pasif: {
    isim: "Denizcilerin Kahramanı",
    aciklama: "Rakipteki 'Korsan' karakterlere karşı +%12 güç kazanır. Ancak rakipte 'Luffy' veya 'Ace' varsa gücü -%12 düşer."} },
    { id: 4, isim: "Kaido", tier: "Legendary", guc: 4611100000, taraf: "korsan", seviye: 97, tayfa: "Canavar", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Yonko"], pasif: {
    isim: "En Güçlü Canavar",
    aciklama: "Gauntlet ve Matchup modlarında (bire bir) gücü +%12 artar. Rakiplerden gelen tüm güç azaltma (debuff) etkilerini yok sayar."} },
    { id: 5, isim: "Shanks", tier: "Legendary", guc: 4048900000, taraf: "korsan", seviye: 99, tayfa: "Kızıl Saç", cinsiyet: "erkek", etiketler: ["Kral_Hakisi", "Kilic_Ustasi", "Yonko"], pasif: {
    isim: "Muazzam Fatih Hakisi",
    aciklama: "Rakiplerin gücünü seviyelerine göre düşürür: 95-100 arası -%3, 90-95 arası -%6, 80-90 arası -%9, 80 altı -%15."} },
    { id: 6, isim: "Dracule Mihawk", tier: "Legendary", guc: 3590000000, taraf: "korsan", seviye: 99, tayfa: "Cross Guild", cinsiyet: "erkek", etiketler: ["Kilic_Ustasi", "Unvan_En_Guclu"], pasif: {
    isim: "Dünyanın En Güçlü Kılıç Ustası",
    aciklama: "Rakip takımda 'Kılıç Ustası' etiketine sahip bir karakter varsa, onlara karşı mutlak üstünlükle +%20 güç kazanır."} },
    { id: 7, isim: "Sengoku", tier: "Legendary", guc: 5000000000, taraf: "denizci", seviye: 98, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Efsane"], pasif: {
    isim: "Stratejist Buda",
    aciklama: "Kendi takımındaki Denizcilerin gücünü +%12 artırır. Rakibin en yüksek sinerji bonusunu savaş başında etkisiz hale getirir."} },
    { id: 8, isim: "Monkey D. Dragon", tier: "Legendary", guc: 5000000000, taraf: "devrimci", seviye: 99, tayfa: "Devrimci", cinsiyet: "erkek", etiketler: ["D_Iradesi"], pasif: {
    isim: "Dünyanın En Çok Aranan Suçlusu",
    aciklama: "Rakipteki 'Denizci' ve 'Dünya Hükümeti' sinerji bonuslarını %50 zayıflatır. Savaş başında takıma +1 Pas Hakkı kazandırır."} },
    { id: 9, isim: "Big Mom", tier: "Legendary", guc: 4388000000, taraf: "korsan", seviye: 95, tayfa: "Koca Ana", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Yonko"], pasif: {
    isim: "Ruh Pocusu",
    aciklama: "Seviyesi kendisinden düşük olan tüm rakiplerin temel gücünün %5'ini çalarak kendi gücüne ekler."} },
    { id: 10, isim: "Blackbeard", tier: "Epic", guc: 3996000000, taraf: "korsan", seviye: 99, tayfa: "Karasakal", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Meyve_Kullanicisi", "Yonko", "Karanlik"], pasif: {
    isim: "Karanlık Meyvesi (Yami Yami no Mi)",
    aciklama: "Rakip takımda 'Meyve Kullanıcısı' varsa onlara karşı mutlak avantaj sağlayarak gücünü +%25 artırır."} 
    },
    { id: 11, isim: "Akainu", tier: "Epic", guc: 5000000000, taraf: "denizci", seviye: 98, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Mutlak_Adalet"], pasif: {
    isim: "Mutlak Adalet",
    aciklama: "Rakipten gelen hiçbir güç azaltma etkisinden etkilenmez. Rakipteki tüm Korsanların gücünü ekstra -%5 azaltır."} },
    { id: 12, isim: "Monkey D. Luffy", tier: "Epic", guc: 3000000000, taraf: "korsan", seviye: 98, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Meyve_Kullanicisi", "Kral_Hakisi", "Supernova", "Yonko", "ASL"], pasif: {
    isim: "Denizlerdeki En Korkunç Güç & Güneş Tanrısı",
    aciklama: "Takıma +%15 güç verir, rakiplerde 92+ seviye varsa kendi gücü +%15 artar. Takımdaki her korsan için gücü +%5 artar ve tüm takımı debufflara karşı korur."} },
    { id: 13, isim: "Aokiji", tier: "Epic", guc: 3000000000, taraf: "korsan", seviye: 95, tayfa: "Karasakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"], pasif: {
    isim: "Buz Çağı",
    aciklama: "Savaş başında soğuk dalgasıyla rakip takımın en güçsüz karakterini dondurarak gücünü doğrudan -%15 düşürür."} },
    { id: 14, isim: "Silvers Rayleigh", tier: "Legendary", guc: 2500000000, taraf: "korsan", seviye: 98, tayfa: "Roger Korsanları", cinsiyet: "erkek", etiketler: ["Kral_Hakisi", "Kilic_Ustasi", "Efsane", "Sag_Kol"], pasif: {
    isim: "Kara Kral'ın Rehberliği",
    aciklama: "Takımında yer alan ve seviyesi 90'ın altında olan tüm genç karakterleri eğiterek onların gücünü +%15 artırır."} },
    { id: 15, isim: "Kozuki Oden", tier: "Epic", guc: 1500000000, taraf: "korsan", seviye: 94, tayfa: "Wano", cinsiyet: "erkek", etiketler: ["Kral_Hakisi", "Kilic_Ustasi"], pasif: {
    isim: "Korkusuz Samuray",
    aciklama: "Savaşçı/Tank rolüne atanırsa gücü +%12 artar. Rakip takımda 'Kaido' varsa Kaido'ya karşı ekstra +%15 daha güçlü vurur."} },
    { id: 16, isim: "Kizaru", tier: "Epic", guc: 3000000000, taraf: "denizci", seviye: 94, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"], pasif: {
    isim: "Işık Hızı Tekmesi",
    aciklama: "Rakibin ilk atağından veya debuff etkisinden tamamen sıyrılır. Bu hız avantajıyla kendi gücünü anında +%7 artırır."} },
    { id: 17, isim: "Fujitora", tier: "Epic", guc: 3000000000, taraf: "denizci", seviye: 91, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kilic_Ustasi"] },
    { id: 18, isim: "Ryokugyu", tier: "Epic", guc: 3000000000, taraf: "denizci", seviye: 88, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 19, isim: "Benn Beckman", tier: "Epic", guc: 2200000000, taraf: "korsan", seviye: 94, tayfa: "Kızıl Saç", cinsiyet: "erkek", etiketler: ["Sag_Kol"] },
    { id: 20, isim: "Sabo", tier: "Rare", guc: 602000000, taraf: "devrimci", seviye: 92, tayfa: "Devrimci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "ASL"], pasif: {
    isim: "Alevlerin Mirası",
    aciklama: "Takımında 'Luffy' varsa gücü +%12 artar. Savaş başında düşman hattına saldırdığı alevlerle rakip takımın toplam gücünü -%5 çeker."} },
    { id: 21, isim: "Roronoa Zoro", tier: "Rare", guc: 1111000000, taraf: "korsan", seviye: 90, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Kilic_Ustasi", "Kral_Hakisi", "Sag_Kol", "Supernova"], pasif: {
    isim: "Cehennem Kralı",
    aciklama: "Gauntlet modunda kazandığı maçlardan sonra uygulanan 5 birimlik güç düşüşünden etkilenmez. Gücü asla azalmaz."} 
    },
    { id: 22, isim: "Yamato", tier: "Rare", guc: 1000000000, taraf: "korsan", seviye: 90, tayfa: "Wano", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi"] },
    { id: 23, integrations: null, isim: "Trafalgar Law", tier: "Epic", guc: 3000000000, taraf: "korsan", seviye: 88, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Meyve_Kullanicisi", "Kilic_Ustasi", "Supernova"], pasif: {
    isim: "ROOM: Shambles",
    aciklama: "Rakip takımın en güçlü karakterinin gücünü %10 azaltır ve bu çaldığı gücü kendi takımındaki en güçsüz karaktere aktarır."} },
    { id: 24, isim: "Eustass Kid", tier: "Epic", guc: 3000000000, taraf: "korsan", seviye: 88, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Supernova"], pasif: {
    isim: "Manyetik Hurda Kralı",
    aciklama: "Rakip takımdaki her 'Kılıç Ustası' veya 'Siborg' karakter başına metalleri çalarak kendi gücünü +%8 artırır."} },
    { id: 25, isim: "Marco", tier: "Rare", guc: 1374000000, taraf: "korsan", seviye: 88, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Sag_Kol"] },
    { id: 26, isim: "King", tier: "Rare", guc: 1390000000, taraf: "korsan", seviye: 88, tayfa: "Canavar", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Sag_Kol", "Ates_Uretici"] },
    { id: 27, isim: "Katakuri", tier: "Rare", guc: 1057000000, taraf: "korsan", seviye: 90, tayfa: "Koca Ana", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Sag_Kol"] },
    { id: 28, isim: "Sanji", tier: "Rare", guc: 1032000000, taraf: "korsan", seviye: 90, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Ascı", "Kadin_Zaafi"], pasif: {
    isim: "Şövalye Ruhu ve Aşçı Desteği",
    aciklama: "Rakipte kadın varsa doğrudan elenir. Kendi takımında kadın varsa +%10 güç kazanır."} 
    },
    { id: 29, isim: "Shiryu", tier: "Rare", guc: 1100000000, taraf: "korsan", seviye: 87, tayfa: "Karasakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kilic_Ustasi"] },
    { id: 30, isim: "Rob Lucci", tier: "Rare", guc: 1000000000, taraf: "denizci", seviye: 85, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 31, isim: "Crocodile", tier: "Rare", guc: 1965000000, taraf: "korsan", seviye: 89, tayfa: "Cross Guild", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 32, isim: "Boa Hancock", tier: "Rare", guc: 1659000000, taraf: "korsan", seviye: 90, tayfa: "Kuşak Korsanları", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi"], pasif: {
    isim: "Aşk Okları",
    aciklama: "Rakipteki tüm erkeklerin gücünü -%10 düşürür (Luffy hariç). Luffy kendi takımındaysa Hancock ekstra +%15 güç kazanır."} },
    { id: 33, isim: "Queen", tier: "Rare", guc: 1320000000, taraf: "korsan", seviye: 87, tayfa: "Canavar", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Siborg"] },
    { id: 34, isim: "Smoothie", tier: "Rare", guc: 932000000, taraf: "korsan", seviye: 85, tayfa: "Koca Ana", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi"] },
    { id: 35, isim: "Jinbe", tier: "Rare", guc: 1100000000, taraf: "korsan", seviye: 85, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Balikadam"], pasif: {
    isim: "Denizin Birinci Oğlu",
    aciklama: "Takımdaki 'Kaptan' veya 'Lider' etiketli karakterlerin gücünü doğrudan +%12 artırır."} },
    { id: 36, isim: "Jozu", tier: "Rare", guc: 800000000, taraf: "korsan", seviye: 86, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 37, isim: "Vista", tier: "Rare", guc: 770000000, taraf: "korsan", seviye: 86, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["Kilic_Ustasi"] },
    { id: 38, isim: "Cracker", tier: "Rare", guc: 860000000, taraf: "korsan", seviye: 81, tayfa: "Koca Ana", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 39, isim: "Jack", tier: "Rare", guc: 1000000000, taraf: "korsan", seviye: 85, tayfa: "Canavar", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 40, isim: "Doflamingo", tier: "Rare", guc: 340000000, taraf: "korsan", seviye: 78, tayfa: "Donquixote", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi"] },
    { id: 41, isim: "Bartholomew Kuma", tier: "Rare", guc: 296000000, taraf: "devrimci", seviye: 88, tayfa: "Devrimci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Siborg"] },
    { id: 42, isim: "Magellan", tier: "Rare", guc: 1000000000, taraf: "denizci", seviye: 89, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Zehir"] },
    { id: 43, isim: "Portgas D. Ace", tier: "Rare", guc: 550000000, taraf: "korsan", seviye: 85, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Meyve_Kullanicisi", "ASL"] },
    { id: 44, integrations: null, isim: "Enel", tier: "Rare", guc: 500000000, taraf: "korsan", seviye: 82, tayfa: "Gods", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Elektrik"] },
    { id: 45, isim: "Killer", tier: "Common", guc: 200000000, taraf: "korsan", seviye: 75, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Kilic_Ustasi", "Supernova"] },
    { id: 46, isim: "Koby", tier: "Rare", guc: 500000000, taraf: "denizci", seviye: 85, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Gelecegin_Amirali"] },
    { id: 47, isim: "Emporio Ivankov", tier: "Rare", guc: 400000000, taraf: "devrimci", seviye: 89, tayfa: "Devrimci", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi"] }, // Sanji kuralları için kadın kabul edildi
    { id: 48, isim: "Franky", tier: "Common", guc: 394000000, taraf: "korsan", seviye: 76, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Siborg"], pasif: {
    isim: "Süper Siborg",
    aciklama: "Sahneye çıktığı an yaptığı şovla savaş başında rakip takımdaki tüm karakterlerin gücünü %5 düşürür."} },
    { id: 49, isim: "Nico Robin", tier: "Common", guc: 930000000, taraf: "korsan", seviye: 73, tayfa: "Hasır Şapka", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi"], pasif: {
    isim: "Zayıf Nokta Analizi",
    aciklama: "Rakip takımın aktif olan en güçlü sinerji bonusunu tespit edip %50 oranında zayıflatır."} 
    },
    { id: 50, isim: "Brook", tier: "Common", guc: 383000000, taraf: "korsan", seviye: 77, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kilic_Ustasi"], pasif: {
    isim: "Ölümsüz Melodi",
    aciklama: "Brook elense bile pasif etkisi devam eder; takımdaki diğer karakterlere savaş sonuna kadar +%10 güç verir."} },
    { id: 51, isim: "Urouge", tier: "Common", guc: 108000000, taraf: "korsan", seviye: 75, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 52, isim: "X Drake", tier: "Common", guc: 222000000, taraf: "korsan", seviye: 75, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 53, isim: "Capone Bege", tier: "Common", guc: 350000000, taraf: "korsan", seviye: 77, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 54, isim: "Basil Hawkins", tier: "Common", guc: 320000000, taraf: "korsan", seviye: 69, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 55, isim: "Scratchmen Apoo", tier: "Common", guc: 350000000, taraf: "korsan", seviye: 68, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 56, isim: "Smoker", tier: "Common", guc: 100000000, taraf: "denizci", seviye: 68, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 57, isim: "Chopper", tier: "Common", guc: 1000, taraf: "korsan", seviye: 65, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Doktor"], pasif: {
    isim: "Mürettebat Doktoru",
    aciklama: "Savaş başında tüm takıma +%10 güç verir. Takımda Luffy varsa Monster Point'e geçer ve bu bonus +%15 olur."} 
    },
    { id: 58, isim: "Nami", tier: "Common", guc: 366000000, taraf: "korsan", seviye: 65, tayfa: "Hasır Şapka", cinsiyet: "kadin", etiketler: ["Rotaci"], pasif: {
    isim: "Mirage Tempo",
    aciklama: "Rakip takımın en yüksek güce sahip karakterinin temel gücünü %10 azaltır."} 
    },
    { id: 59, isim: "Buggy", tier: "Common", guc: 3189000000, taraf: "korsan", seviye: 55, tayfa: "Cross Guild", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Efsanevi_Sans"], pasif: {
    isim: "Şans İlahı",
    aciklama: "Maç başında gücü rastgele -%10 ile +%30 arası değişir. Rakipteki kılıç ustalarından hasar almaz (Mihawk hariç)."} },
    { id: 60, isim: "Usopp", tier: "Common", guc: 500000000, taraf: "korsan", seviye: 50, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Tanri"], pasif: {
    isim: "Tanrı Usopp'un Blöfü",
    aciklama: "Takımın toplam gücü rakip takımdan düşükse, Usopp muazzam bir blöf ile kendi gücünü %25 artırır."} 
    }
];

// Çarkı görsel olarak dengeli dizmek için özel fonksiyon
function carkiDengeliDiz(liste) {
    const legendaries = liste.filter(c => c.tier === 'Legendary');
    const epics = liste.filter(c => c.tier === 'Epic');
    const rares = liste.filter(c => c.tier === 'Rare');
    const commons = liste.filter(c => c.tier === 'Common');
    
    // Eğer tier girilmemiş karakter varsa patlamaması için yedek
    const others = liste.filter(c => !c.tier); 

    const dizilmis = [];
    const toplamKarakter = liste.length;

    // Farklı havuzlardan sırayla çekerek homojen bir dağılım yaratıyoruz
    for (let i = 0; i < toplamKarakter; i++) {
        if (legendaries.length > 0 && i % 5 === 0) dizilmis.push(legendaries.shift());
        else if (commons.length > 0) dizilmis.push(commons.shift());
        else if (rares.length > 0) dizilmis.push(rares.shift());
        else if (epics.length > 0) dizilmis.push(epics.shift());
        else if (legendaries.length > 0) dizilmis.push(legendaries.shift());
        else if (others.length > 0) dizilmis.push(others.shift());
    }
    return dizilmis;
}

// Orijinal diziyi ezip, dışarıya dengeli dizilmiş halini aktarıyoruz
karakterler = carkiDengeliDiz(karakterler);