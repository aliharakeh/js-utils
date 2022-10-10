import {API, InlineTool} from '@editorjs/editorjs';
import {createButtons, getRangeParentBlockNode} from './editor-js-utils';

export default class EditorJsTextAlign implements InlineTool {
    private api: API;
    private tag;
    private class;
    private _state: boolean;
    private textAlign = 'left';
    private options = [
        {
            textAlign: 'left',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" id="Layer" height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m10 23h28c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"></path><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m10 45h28c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"></path></svg>'
        },
        {
            textAlign: 'center',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" id="Layer" height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m46 23c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"></path><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m46 45c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"></path></svg>'
        },
        {
            textAlign: 'right',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" id="Layer" height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m54 19h-28c-1.104 0-2 .896-2 2s.896 2 2 2h28c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m54 41h-28c-1.104 0-2 .896-2 2s.896 2 2 2h28c1.104 0 2-.896 2-2s-.896-2-2-2z"></path></svg>'
        },
        {
            textAlign: 'justify',
            icon: '<svg viewBox="0 0 64 64" width="20" height="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="M 52.867 19 L 10.914 19 C 9.26 19 7.918 19.896 7.918 21 C 7.918 22.104 9.26 23 10.914 23 L 52.867 23 C 54.522 23 55.863 22.104 55.863 21 C 55.863 19.896 54.522 19 52.867 19 Z" style=""></path><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"></path><path d="M 52.779 41 L 11.113 41 C 9.469 41 8.136 41.896 8.136 43 C 8.136 44.104 9.469 45 11.113 45 L 52.779 45 C 54.421 45 55.754 44.104 55.754 43 C 55.754 41.896 54.421 41 52.779 41 Z"></path></svg>'
        }
    ];
    protected buttonsWrapper: HTMLDivElement;

    constructor({ api }) {
        this.api = api;
        this.tag = 'DIV';
        this.class = 'ce-text-align';
    }

    static get isInline() {
        return true;
    }

    static get sanitize() {
        return { div: true };
    }

    get state() {
        return this._state;
    }

    set state(state) {
        this._state = state;
        const btnIndex = this.options.findIndex(o => o.textAlign === this.textAlign);
        if (this.buttonsWrapper) {
            const btn = this.buttonsWrapper.querySelectorAll('div')[btnIndex];
            btn.classList.toggle(this.api.styles.inlineToolButtonActive, state);
        }
    }

    render() {
        this.buttonsWrapper = createButtons(
            (option, _, btn) => this.textAlign = option.textAlign,
            this.options,
            'icon',
            this.api.styles.inlineToolButton,
            this.api.styles.inlineToolButtonActive
        );
        return this.buttonsWrapper;
    }

    surround(range: Range) {
        if (!range) return;
        if (this.state) {
            const selectionWrapper = this.api.selection.findParentTag(this.tag, this.class);
            selectionWrapper.style.textAlign = this.textAlign;
        }
        else {
            const parentBlock = getRangeParentBlockNode(range);
            const div = document.createElement('DIV');
            div.style.textAlign = this.textAlign;
            div.className = this.class;
            div.innerHTML = parentBlock.innerHTML;
            parentBlock.innerHTML = '';
            parentBlock.appendChild(div);
        }
    }

    checkState() {
        const selectionWrapper = this.api.selection.findParentTag(this.tag, this.class);
        if (selectionWrapper) {
            this.textAlign = selectionWrapper.style.textAlign;
        }
        this.state = !!selectionWrapper;
        return this.state;
    }
}
