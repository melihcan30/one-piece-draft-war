export function formatBeri(deger) {
    return `${new Intl.NumberFormat('tr-TR').format(deger)} ฿`;
}

