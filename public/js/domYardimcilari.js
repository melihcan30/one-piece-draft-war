export function byId(id) {
    return document.getElementById(id);
}

export function all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}

export function setText(element, text) {
    if (element) element.textContent = text;
}

export function setHtml(element, html) {
    if (element) element.innerHTML = html;
}

export function replaceClass(element, oldClass, newClass) {
    if (element) element.classList.replace(oldClass, newClass);
}

export function showAsFlex(element) {
    replaceClass(element, 'display-none', 'display-flex');
}

export function hideFromFlex(element) {
    replaceClass(element, 'display-flex', 'display-none');
}

export function showAsBlock(element) {
    replaceClass(element, 'display-none', 'display-block');
}

export function hideFromBlock(element) {
    replaceClass(element, 'display-block', 'display-none');
}

export function setDisabled(elements, disabled) {
    elements.filter(Boolean).forEach(element => {
        element.disabled = disabled;
    });
}

