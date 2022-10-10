import {createSettingsButtons} from './editor-js-utils';
import {BlockTool} from '@editorjs/editorjs';

export default class EditorJsDivider implements BlockTool {
    private _data: any;
    private _wrapper: any;
    private _api: any;
    private _CSS: any;
    private readonly COLORS = [
        { label: 'L', colorClass: 'bg-gray-200' },
        { label: 'D', colorClass: 'bg-gray-800' }
    ];
    private readonly SIZES = [
        { label: '1x', fontSize: 1 },
        { label: '2x', fontSize: 2 },
        { label: '3x', fontSize: 3 },
        { label: '4x', fontSize: 4 },
        { label: '5x', fontSize: 5 }
    ];

    constructor({ data, api, _ }) {
        this._data = data;
        this._api = api;
        this._CSS = {
            block: this._api.styles.block,
            divider: 'ce-divider'
        };
        this._data.color = this._data.color || this.COLORS[0];
        this._data.size = this._data.size || this.SIZES[0];
    }

    render() {
        return this._createDivider();
    }

    renderSettings() {
        return createSettingsButtons((data, _) => {
            if (data.colorClass) {
                this._data.color = data;
            }
            else {
                this._data.size = data;
            }
            this._createDivider(false);
        }, [...this.COLORS, ...this.SIZES], 'label');
    }

    _createDivider(init = true) {
        if (init) {
            this._wrapper = document.createElement('div');
            this._wrapper.style.boderRadius = '99px';
            this._wrapper.classList.add(this._CSS.block);
        }
        else {
            this._wrapper.innerHTML = '';
        }
        const divider = document.createElement('div');
        divider.classList.add(this._CSS.divider, this._data.color.colorClass);
        divider.style.height = this._data.size.fontSize + 'px';
        this._wrapper.appendChild(divider);
        return this._wrapper;
    }

    save(blockContent) {
        return this._data;
    }

    static get toolbox() {
        return {
            title: 'Divider',
            icon: '<svg width="19" height="4" viewBox="0 0 19 4" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 0H7a1.25 1.25 0 1 1 0 2.5H1.25a1.25 1.25 0 1 1 0-2.5zM11 0h5.75a1.25 1.25 0 0 1 0 2.5H11A1.25 1.25 0 0 1 11 0z"></path></svg>'
        };
    }
}
