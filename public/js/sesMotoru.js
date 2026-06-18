export const sesler = {
    spin: new Audio('sounds/wheel-spin.mp3'),
    select: new Audio('sounds/character-select.mp3'),
    haki: new Audio('sounds/haki-blast.mp3'),
    victory: new Audio('sounds/victory.mp3')
};

// Ses çalma fonksiyonu (Aynı ses üst üste binerse sıfırlayıp baştan çalar)
export function sesCal(sesAdi, loop = false) {
    const ses = sesler[sesAdi];
    if (!ses) return;
    
    ses.currentTime = 0; // Sesi başa sar
    ses.loop = loop;
    
    // Tarayıcıların "kullanıcı etkileşimi olmadan ses çalamazsın" politikasını aşmak için catch ekliyoruz
    ses.play().catch(e => {
        console.log("Ses çalma tarayıcı tarafından engellendi (Butona basılınca düzelecek):", e);
    });
}

// Ses durdurma fonksiyonu
export function sesDurdur(sesAdi) {
    const ses = sesler[sesAdi];
    if (!ses) return;
    ses.pause();
    ses.currentTime = 0;
}