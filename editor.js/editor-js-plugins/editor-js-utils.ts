const SettingButton = {
    default: 'cdx-settings-button',
    active: 'cdx-settings-button--active'
};

/** A util to create a group of buttons */
function createButtons(action: (d: any, e: MouseEvent, btn: HTMLElement) => void, content: any[], contentKey = '', btnClass = '', btnActiveClass = ''): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className += 'flex flex-row flex-wrap items-center justify-center gap-2';
    content.forEach(d => {
        const button = _createButton(contentKey ? d[contentKey] : d, btnClass);
        button.addEventListener('click', (e) => {
            _toggleSettingsButton(wrapper, button, btnActiveClass);
            action(d, e, wrapper);
        });
        wrapper.appendChild(button);
    });
    return wrapper;
}

/** A util to create a group of settings buttons */
function createSettingsButtons(action: (d: any, e: MouseEvent, btn: HTMLElement) => void, content: any[], contentKey = '') {
    return createButtons(action, content, contentKey, SettingButton.default, SettingButton.active);
}

/** A util to create a button */
function _createButton(content: HTMLElement | string, btnClass= ''): HTMLDivElement {
    const button = document.createElement('div');
    button.className = btnClass;
    button.innerHTML = content instanceof HTMLElement ? content.outerHTML : content;
    return button;
}

/** Clear the active state of the other buttons and toggle it for the clicked button */
function _toggleSettingsButton(wrapper: HTMLElement, button: HTMLDivElement, btnActiveClass): void {
    if (!btnActiveClass) {
        return;
    }
    wrapper.querySelectorAll('div').forEach(b => b.classList.remove(btnActiveClass));
    button.classList.toggle(btnActiveClass);
}

/** Convert rgb to hex */
function convertToHex(rgbColor) {
    const rgb = rgbColor.match(/(\d+)/g);
    let hexr = parseInt(rgb[0]).toString(16);
    let hexg = parseInt(rgb[1]).toString(16);
    let hexb = parseInt(rgb[2]).toString(16);
    hexr = hexr.length === 1 ? '0' + hexr : hexr;
    hexg = hexg.length === 1 ? '0' + hexg : hexg;
    hexb = hexb.length === 1 ? '0' + hexb : hexb;
    return '#' + hexr + hexg + hexb;
}

/** Keep going up the dom tree till you find the first block level element */
function getRangeParentBlockNode(range: Range): HTMLElement {
    let parent: HTMLElement = range.commonAncestorContainer as HTMLElement;
    while (parent.nodeName.toLowerCase() === '#text' || window.getComputedStyle(parent).display.includes('inline')) {
        parent = parent.parentElement;
    }
    return parent;
}

export {
    createButtons,
    createSettingsButtons,
    convertToHex,
    getRangeParentBlockNode
};
