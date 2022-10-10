import {API, InlineTool, SanitizerConfig} from '@editorjs/editorjs';

export interface InlineToolConfig {
    css: string;
    tag: string;
    icon: string;
    sanitize: SanitizerConfig;
    iconDefaultClass?: string;
    iconActiveClass?: string;
    modifySelectionWrapper?: (element: HTMLElement) => void;
}

export const createGenericInlineTool = (config: InlineToolConfig) => {
    return class GenericInlineTool extends EditorJsInlineToolBase {

        constructor({ api }) {
            super({ api });
            this.tag = config.tag;
            this.css = config.css;
            this.icon = config.icon;
            if (config.iconDefaultClass) this.iconDefaultClass = config.iconDefaultClass;
            if (config.iconActiveClass) this.iconActiveClass = config.iconActiveClass;
        }

        static override get sanitize() {
            return config.sanitize;
        }

        override modifySelectionWrapper(element: HTMLElement) {
            if (config.modifySelectionWrapper) {
                config.modifySelectionWrapper(element);
            }
        }

    };
};

class EditorJsInlineToolBase implements InlineTool {
    protected api: API;
    protected button: HTMLElement;
    protected css: string;
    protected tag: string;
    protected iconDefaultClass: string;
    protected iconActiveClass: string;
    protected icon: string;
    protected actionsWrapper: HTMLElement;
    private _state: boolean;

    constructor({ api }) {
        this.api = api;
        this.iconDefaultClass = this.api.styles.inlineToolButton;
        this.iconActiveClass = this.api.styles.inlineToolButtonActive;
    }

    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {};
    }

    private get state() {
        return this._state;
    }

    private set state(state) {
        this._state = state;
        this.button.classList.toggle(this.iconActiveClass, state);
    }

    render() {
        this.button = document.createElement('button');
        this.button.classList.add(this.iconDefaultClass);
        this.button.innerHTML = this.icon;
        return this.button;
    }

    surround(range: Range) {
        if (!range) {
            return;
        }
        if (this.state) {
            this.unwrap(range);
            return;
        }
        this.wrap(range);
    }

    checkState() {
        const selectionWrapper = this.api.selection.findParentTag(this.tag);
        this.state = !!selectionWrapper;
        if (this.state) {
            this.showActions(selectionWrapper);
        }
        else {
            this.hideActions();
        }
        return this.state;
    }

    renderActions() {
        return null;
    }

    protected showActions(selectionWrapper) {
        if (this.actionsWrapper) {
            this.actionsWrapper.hidden = false;
        }
    }

    protected hideActions() {
        if (this.actionsWrapper) {
            this.actionsWrapper.hidden = true;
        }
    }

    protected modifySelectionWrapper(element: HTMLElement) {}

    private wrap(range: Range) {
        let selectionWrapper = document.createElement(this.tag);
        selectionWrapper.classList.add(this.css);
        this.modifySelectionWrapper(selectionWrapper);
        selectionWrapper.appendChild(range.extractContents());
        range.insertNode(selectionWrapper);
        this.api.selection.expandToTag(selectionWrapper);
    }

    private unwrap(range: Range) {
        const selectionWrapper = this.api.selection.findParentTag(this.tag, this.css);
        const text = range.extractContents();
        selectionWrapper.remove();
        range.insertNode(text);
    }
}
