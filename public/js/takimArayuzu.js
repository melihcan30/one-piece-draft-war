import { all, byId, setHtml, setText } from './domYardimcilari.js';
import { formatBeri } from './format.js';

export function getTeamId(playerNumber) {
    return playerNumber === 1 ? "p1-team" : "p2-team";
}

export function getTeamSlots(playerNumber) {
    return all('.slot', byId(getTeamId(playerNumber)));
}

export function hasAvailableSlot(playerNumber) {
    return getTeamSlots(playerNumber).some(slot => slot.dataset.filled === "false");
}

export function updateRoleOptions(selectElement, activePlayer) {
    if (!selectElement) return;

    selectElement.innerHTML = "";

    getTeamSlots(activePlayer).forEach((slot, index) => {
        if (slot.dataset.filled !== "false") return;

        const roleName = slot.querySelector(".role-badge").textContent.replace(":", "");
        const option = document.createElement("option");
        option.value = index;
        option.textContent = roleName;
        selectElement.appendChild(option);
    });
}

export function fillTeamSlot(playerNumber, slotIndex, character) {
    const slot = getTeamSlots(playerNumber)[slotIndex];
    if (!slot || slot.dataset.filled !== "false") return false;

    slot.dataset.filled = "true";

    const wantedText = slot.querySelector(".wanted-text");
    if (wantedText) {
        wantedText.textContent = character.taraf === "denizci" ? "CROSS GUILD" : "WANTED";
    }

    setHtml(
        slot.querySelector(".char-name"),
        `${character.isim}<br><span style="color: #f39c12; font-size:0.85em; font-weight: bold;">${formatBeri(character.guc)}</span>`
    );

    return true;
}

export function applyKnockedOutSlot(playerNumber, slotIndex) {
    const slot = getTeamSlots(playerNumber)[slotIndex];
    if (!slot) return;

    slot.dataset.filled = "true";
    setText(slot.querySelector(".char-name"), "BAYGIN (0)");
    setText(slot.querySelector(".wanted-text"), "BAYILDI");
}

export function resetTeamSlots() {
    all('.slot').forEach(slot => {
        slot.dataset.filled = "false";
        slot.style.boxShadow = "none";
        setText(slot.querySelector(".wanted-text"), "WANTED");
        setText(slot.querySelector(".char-name"), "BOS");
    });
}

export function countEmptySlots() {
    return all('.slot[data-filled="false"]').length;
}

export function updatePowerDisplay(playerNumber, value) {
    setText(byId(`p${playerNumber}-power`), formatBeri(value));
}

