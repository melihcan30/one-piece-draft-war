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
    { id: 1, isim: "Gol D. Roger", guc: 5564800000, taraf: "korsan", seviye: 100, tayfa: "Roger Korsanları", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Kral_Hakisi", "Kilic_Ustasi", "Efsane"] },
    { id: 2, isim: "Whitebeard", guc: 5046000000, taraf: "korsan", seviye: 100, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Efsane"] },
    { id: 3, isim: "Monkey D. Garp", guc: 5000000000, taraf: "denizci", seviye: 100, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Efsane"] },
    { id: 4, isim: "Kaido", guc: 4611100000, taraf: "korsan", seviye: 97, tayfa: "Canavar", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Yonko"] },
    { id: 5, isim: "Shanks", guc: 4048900000, taraf: "korsan", seviye: 99, tayfa: "Kızıl Saç", cinsiyet: "erkek", etiketler: ["Kral_Hakisi", "Kilic_Ustasi", "Yonko"] },
    { id: 6, isim: "Dracule Mihawk", guc: 3590000000, taraf: "korsan", seviye: 99, tayfa: "Cross Guild", cinsiyet: "erkek", etiketler: ["Kilic_Ustasi", "Unvan_En_Guclu"] },
    { id: 7, isim: "Sengoku", guc: 5000000000, taraf: "denizci", seviye: 98, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Efsane"] },
    { id: 8, isim: "Monkey D. Dragon", guc: 5000000000, taraf: "devrimci", seviye: 99, tayfa: "Devrimci", cinsiyet: "erkek", etiketler: ["D_Iradesi"] },
    { id: 9, isim: "Big Mom", guc: 4388000000, taraf: "korsan", seviye: 95, tayfa: "Koca Ana", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Yonko"] },
    { id: 10, isim: "Blackbeard", guc: 3996000000, taraf: "korsan", seviye: 99, tayfa: "Karasakal", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Meyve_Kullanicisi", "Yonko", "Karanlik"] },
    { id: 11, isim: "Akainu", guc: 5000000000, taraf: "denizci", seviye: 98, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Mutlak_Adalet"] },
    { id: 12, isim: "Monkey D. Luffy", guc: 3000000000, taraf: "korsan", seviye: 98, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Meyve_Kullanicisi", "Kral_Hakisi", "Supernova", "Yonko", "ASL"] },
    { id: 13, isim: "Aokiji", guc: 3000000000, taraf: "korsan", seviye: 95, tayfa: "Karasakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 14, isim: "Silvers Rayleigh", guc: 2500000000, taraf: "korsan", seviye: 98, tayfa: "Roger Korsanları", cinsiyet: "erkek", etiketler: ["Kral_Hakisi", "Kilic_Ustasi", "Efsane", "Sag_Kol"] },
    { id: 15, isim: "Kozuki Oden", guc: 1500000000, taraf: "korsan", seviye: 94, tayfa: "Wano", cinsiyet: "erkek", etiketler: ["Kral_Hakisi", "Kilic_Ustasi"] },
    { id: 16, isim: "Kizaru", guc: 3000000000, taraf: "denizci", seviye: 94, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 17, isim: "Fujitora", guc: 3000000000, taraf: "denizci", seviye: 91, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kilic_Ustasi"] },
    { id: 18, isim: "Ryokugyu", guc: 3000000000, taraf: "denizci", seviye: 88, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 19, isim: "Benn Beckman", guc: 2200000000, taraf: "korsan", seviye: 94, tayfa: "Kızıl Saç", cinsiyet: "erkek", etiketler: ["Sag_Kol"] },
    { id: 20, isim: "Sabo", guc: 602000000, taraf: "devrimci", seviye: 92, tayfa: "Devrimci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "ASL"] },
    { id: 21, isim: "Roronoa Zoro", guc: 1111000000, taraf: "korsan", seviye: 90, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Kilic_Ustasi", "Kral_Hakisi", "Sag_Kol", "Supernova"] },
    { id: 22, isim: "Yamato", guc: 1000000000, taraf: "korsan", seviye: 90, tayfa: "Wano", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi"] },
    { id: 23, integrations: null, isim: "Trafalgar Law", guc: 3000000000, taraf: "korsan", seviye: 88, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Meyve_Kullanicisi", "Kilic_Ustasi", "Supernova"] },
    { id: 24, isim: "Eustass Kid", guc: 3000000000, taraf: "korsan", seviye: 88, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Supernova"] },
    { id: 25, isim: "Marco", guc: 1374000000, taraf: "korsan", seviye: 88, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Sag_Kol"] },
    { id: 26, isim: "King", guc: 1390000000, taraf: "korsan", seviye: 88, tayfa: "Canavar", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Sag_Kol", "Ates_Uretici"] },
    { id: 27, isim: "Katakuri", guc: 1057000000, taraf: "korsan", seviye: 90, tayfa: "Koca Ana", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi", "Sag_Kol"] },
    { id: 28, isim: "Sanji", guc: 1032000000, taraf: "korsan", seviye: 90, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Ascı", "Kadin_Zaafi"] },
    { id: 29, isim: "Shiryu", guc: 1100000000, taraf: "korsan", seviye: 87, tayfa: "Karasakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kilic_Ustasi"] },
    { id: 30, isim: "Rob Lucci", guc: 1000000000, taraf: "denizci", seviye: 85, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 31, isim: "Crocodile", guc: 1965000000, taraf: "korsan", seviye: 89, tayfa: "Cross Guild", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 32, isim: "Boa Hancock", guc: 1659000000, taraf: "korsan", seviye: 90, tayfa: "Kuşak Korsanları", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi"] },
    { id: 33, isim: "Queen", guc: 1320000000, taraf: "korsan", seviye: 87, tayfa: "Canavar", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Siborg"] },
    { id: 34, isim: "Smoothie", guc: 932000000, taraf: "korsan", seviye: 85, tayfa: "Koca Ana", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi"] },
    { id: 35, isim: "Jinbe", guc: 1100000000, taraf: "korsan", seviye: 85, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Balikadam"] },
    { id: 36, isim: "Jozu", guc: 800000000, taraf: "korsan", seviye: 86, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 37, isim: "Vista", guc: 770000000, taraf: "korsan", seviye: 86, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["Kilic_Ustasi"] },
    { id: 38, isim: "Cracker", guc: 860000000, taraf: "korsan", seviye: 81, tayfa: "Koca Ana", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 39, isim: "Jack", guc: 1000000000, taraf: "korsan", seviye: 85, tayfa: "Canavar", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 40, isim: "Doflamingo", guc: 340000000, taraf: "korsan", seviye: 78, tayfa: "Donquixote", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kral_Hakisi"] },
    { id: 41, isim: "Bartholomew Kuma", guc: 296000000, taraf: "devrimci", seviye: 88, tayfa: "Devrimci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Siborg"] },
    { id: 42, isim: "Magellan", guc: 1000000000, taraf: "denizci", seviye: 89, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Zehir"] },
    { id: 43, isim: "Portgas D. Ace", guc: 550000000, taraf: "korsan", seviye: 85, tayfa: "Beyazsakal", cinsiyet: "erkek", etiketler: ["D_Iradesi", "Meyve_Kullanicisi", "ASL"] },
    { id: 44, integrations: null, isim: "Enel", guc: 500000000, taraf: "korsan", seviye: 82, tayfa: "Gods", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Elektrik"] },
    { id: 45, isim: "Killer", guc: 200000000, taraf: "korsan", seviye: 75, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Kilic_Ustasi", "Supernova"] },
    { id: 46, isim: "Koby", guc: 500000000, taraf: "denizci", seviye: 85, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Gelecegin_Amirali"] },
    { id: 47, isim: "Emporio Ivankov", guc: 400000000, taraf: "devrimci", seviye: 89, tayfa: "Devrimci", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi"] }, // Sanji kuralları için kadın kabul edildi
    { id: 48, isim: "Franky", guc: 394000000, taraf: "korsan", seviye: 76, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Siborg"] },
    { id: 49, isim: "Nico Robin", guc: 930000000, taraf: "korsan", seviye: 73, tayfa: "Hasır Şapka", cinsiyet: "kadin", etiketler: ["Meyve_Kullanicisi"] },
    { id: 50, isim: "Brook", guc: 383000000, taraf: "korsan", seviye: 77, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Kilic_Ustasi"] },
    { id: 51, isim: "Urouge", guc: 108000000, taraf: "korsan", seviye: 75, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 52, isim: "X Drake", guc: 222000000, taraf: "korsan", seviye: 75, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 53, isim: "Capone Bege", guc: 350000000, taraf: "korsan", seviye: 77, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 54, isim: "Basil Hawkins", guc: 320000000, taraf: "korsan", seviye: 69, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 55, isim: "Scratchmen Apoo", guc: 350000000, taraf: "korsan", seviye: 68, tayfa: "Supernova", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Supernova"] },
    { id: 56, isim: "Smoker", guc: 100000000, taraf: "denizci", seviye: 68, tayfa: "Denizci", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi"] },
    { id: 57, isim: "Chopper", guc: 1000, taraf: "korsan", seviye: 65, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Doktor"] },
    { id: 58, isim: "Nami", guc: 366000000, taraf: "korsan", seviye: 65, tayfa: "Hasır Şapka", cinsiyet: "kadin", etiketler: ["Rotaci"] },
    { id: 59, isim: "Buggy", guc: 3189000000, taraf: "korsan", seviye: 55, tayfa: "Cross Guild", cinsiyet: "erkek", etiketler: ["Meyve_Kullanicisi", "Efsanevi_Sans"] },
    { id: 60, isim: "Usopp", guc: 500000000, taraf: "korsan", seviye: 50, tayfa: "Hasır Şapka", cinsiyet: "erkek", etiketler: ["Tanri"] }
];