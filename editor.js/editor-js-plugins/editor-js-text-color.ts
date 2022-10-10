import {API, InlineTool} from '@editorjs/editorjs';
import {convertToHex, createButtons} from './editor-js-utils';

export default class EditorJsTextColor implements InlineTool {
    private _state: boolean;
    private button: any;
    private api: API;
    private tag: string;
    private class: string;
    private colorPicker: HTMLInputElement;
    private wrapper: HTMLDivElement;
    private COLORS = [
        '#e8d30e',
        '#de0c35',
        '#50e712',
        '#1250e8',
        '#10e5e0',
        '#e8d30e',
        '#de0c35',
        '#50e712',
        '#1250e8',
        '#10e5e0',
        '#e8d30e',
        '#de0c35',
        '#50e712',
        '#1250e8',
        '#10e5e0',
        '#e8d30e',
        '#e8d30e',
        '#e8d30e',
        '#e8d30e',
        '#e8d30e',
        '#e8d30e',
        '#e8d30e',
    ];

    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {
            span: true
        };
    }

    get state() {
        return this._state;
    }

    set state(state) {
        this._state = state;
        this.button.classList.toggle(this.api.styles.inlineToolButtonActive, state);
    }

    constructor({api}) {
        this.api = api;
        this.button = null;
        this._state = false;
        this.tag = 'SPAN';
        this.class = 'ce-marker';
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = '<svg width="20" height="18"><path d="M10.458 12.04l2.919 1.686-.781 1.417-.984-.03-.974 1.687H8.674l1.49-2.583-.508-.775.802-1.401zm.546-.952l3.624-6.327a1.597 1.597 0 0 1 2.182-.59 1.632 1.632 0 0 1 .615 2.201l-3.519 6.391-2.902-1.675zm-7.73 3.467h3.465a1.123 1.123 0 1 1 0 2.247H3.273a1.123 1.123 0 1 1 0-2.247z"/></svg>';
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }

    surround(range: Range) {
        if (this.state) {
            this.unwrap(range);
            return;
        }
        this.wrap(range);
    }

    wrap(range: Range) {
        const selectedText = range.extractContents();
        const selectionWrapper = document.createElement(this.tag);
        selectionWrapper.classList.add(this.class);
        selectionWrapper.appendChild(selectedText);
        range.insertNode(selectionWrapper);
        this.api.selection.expandToTag(selectionWrapper);
    }

    unwrap(range: Range) {
        const selectionWrapper = this.api.selection.findParentTag(this.tag, this.class);
        const text = range.extractContents();
        selectionWrapper.remove();
        range.insertNode(text);
    }

    checkState() {
        const selectionWrapper = this.api.selection.findParentTag(this.tag);
        this.state = !!selectionWrapper;
        if (this.state) {
            this.showActions(selectionWrapper);
        } else {
            this.hideActions();
        }
        return this.state;
    }

    renderActions() {
        const colors = this.COLORS.map(c => {
            const div = document.createElement('div');
            div.style.width = '15px';
            div.style.height = '15px';
            div.style.backgroundColor = c;
            return div;
        });
        this.wrapper = createButtons((color: HTMLElement, e) => {
            this.colorPicker.value = convertToHex(color.style.backgroundColor);
            this.colorPicker.dispatchEvent(new Event('change'));
        }, colors);

        this.colorPicker = document.createElement('input');
        this.colorPicker.style.width = '100%';
        this.colorPicker.type = 'color';

        this.wrapper.appendChild(this.colorPicker);
        this.wrapper.hidden = true;
        this.wrapper.style.width = '260px';

        return this.wrapper;
    }

    showActions(selectionWrapper) {
        const {color} = selectionWrapper.style;
        this.wrapper.hidden = false;
        this.colorPicker.value = color ? convertToHex(color) : this.COLORS[0];
        this.colorPicker.onchange = () => {
            selectionWrapper.style.color = this.colorPicker.value;
        };
    }

    hideActions() {
        this.wrapper.hidden = true;
        this.colorPicker.onchange = null;
    }
}
