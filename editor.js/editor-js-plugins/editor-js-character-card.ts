import {API, BlockTool} from '@editorjs/editorjs';

export default class EditorJsCharacterCard implements BlockTool {
    private data: any;
    private wrapper: HTMLDivElement;
    private api: API;
    private css: any;

    constructor({ data, api, _ }) {
        this.data = data;
        this.api = api;
        this.css = this.api.styles.block;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add(this.css);
        const el = document.createElement('editor-js-table');
        this.wrapper.appendChild(el);
        return this.wrapper;
    }

    save(blockContent) {
        return this.data;
    }

    static get toolbox() {
        return {
            title: 'Character Card',
            icon: '<svg width="19" height="4" viewBox="0 0 19 4" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 0H7a1.25 1.25 0 1 1 0 2.5H1.25a1.25 1.25 0 1 1 0-2.5zM11 0h5.75a1.25 1.25 0 0 1 0 2.5H11A1.25 1.25 0 0 1 11 0z"></path></svg>'
        };
    }
}
