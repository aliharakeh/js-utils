export type DsBaseSelectionData = {
    icon?: string;
    disabled?: boolean;
};

export type DsSelectionData<T> = {
    label: string;
    selected: boolean;
    disabled: boolean;
    hidden: boolean;
    data: T;
};

export class DsSelection<K extends number | string, D extends DsBaseSelectionData> {
    // data
    private readonly key: string;
    private mapData: Map<K, DsSelectionData<D>> = new Map();

    // cache reference to data used in for loops
    private cachedValues: DsSelectionData<D>[];
    private selectionCount = 0;
    private hiddenCount = 0;

    // label
    private labelSeparator = ', ';
    private currentValue = '';
    private readonly getLabel: (data: D) => string;

    constructor(key: string, getLabel: (data: D) => string) {
        this.key = key;
        this.getLabel = getLabel;
    }

    updateData(data: D[]) {
        const selected = new Set();
        const hidden = new Set();
        if (this.mapData.size > 0) {
            for (let [k, d] of this.mapData.entries()) {
                if (d.selected) {
                    selected.add(k);
                }
                if (d.hidden) {
                    hidden.add(k);
                }
            }
            this.clear();
        }
        data.forEach(d => {
            const k = d[this.key];
            this.add(d, selected.has(k), hidden.has(k));
        });
    }

    options() {
        if (!this.cachedValues) {
            this.cachedValues = Array.from(this.mapData.values()).filter(v => !v.hidden);
        }
        return this.cachedValues;
    }

    info() {
        return {
            size: this.mapData.size,
            selectedCount: this.selectionCount,
            hiddenCount: this.hiddenCount
        };
    }

    value() {
        return this.currentValue;
    }

    has(key: K) {
        return this.mapData.has(key);
    }

    contains(search: string) {
        return this.options().some(v => v.label.toLowerCase().includes(search));
    }

    add(data: D, selected = false, hidden = false) {
        const label = this.getLabel(data);
        this.mapData.set(data[this.key], {
            label: label,
            selected: selected,
            disabled: !!data.disabled,
            hidden: hidden,
            data: data
        });
        if (selected) {
            this.selectionCount++;
        }
        if (hidden) {
            this.hiddenCount++;
        }
        this.clearCache();
    }

    delete(data: D) {
        if (!this.has(data[this.key])) {
            return;
        }
        const mapData = this.mapData.get(data[this.key]);
        if (mapData.selected) {
            this.selectionCount--;
        }
        if (mapData.hidden) {
            this.hiddenCount--;
        }
        this.mapData.delete(data[this.key]);
        this.clearCache();
    }

    show(key: K) {
        if (this.has(key)) {
            this.mapData.get(key).hidden = false;
            this.hiddenCount--;
            this.clearCache();
        }
    }

    hide(key: K) {
        if (this.has(key)) {
            this.mapData.get(key).hidden = true;
            this.hiddenCount++;
            this.clearCache();
        }
    }

    select(key: K) {
        if (this.has(key)) {
            this._select(this.mapData.get(key));
        }
    }

    unselect(key: K) {
        if (this.has(key)) {
            this._unselect(this.mapData.get(key));
        }
    }

    selectMany(keys: K[], clearSelection = false) {
        if (clearSelection) {
            this.clearSelection();
        }
        keys.forEach(key => this.select(key));
    }

    hideMany(keys: K[]) {
        keys.forEach(key => {
            if (this.has(key)) {
                this.mapData.get(key).hidden = true;
            }
        });
        this.clearCache();
    }

    toggle(key: K) {
        const data = this.mapData.get(key);
        if (!data || data.disabled) {
            return;
        }
        data.selected ? this._unselect(data) : this._select(data);
    }

    toggleVisibility(key: K) {
        this.has(key) ? this.hide(key) : this.show(key);
    }

    getSelected(): { selected: D[]; keys: K[] } {
        const keys = [];
        const selected = [];
        for (let [key, d] of this.mapData.entries()) {
            if (!d.disabled && d.selected) {
                keys.push(key);
                selected.push(d.data);
            }
        }
        return { selected, keys };
    }

    isSelected(key: K) {
        return !!this.mapData.get(key)?.selected;
    }

    clear() {
        this.selectionCount = 0;
        this.hiddenCount = 0;
        this.cachedValues = null;
        this.mapData.clear();
    }

    clearSelection() {
        this.selectionCount = 0;
        this.currentValue = '';
        this.mapData.forEach(v => (v.selected = false));
    }

    clearCache() {
        if (this.cachedValues) {
            this.cachedValues = null;
        }
    }

    private _select(data: DsSelectionData<D>) {
        if (data.disabled || data.selected) {
            return;
        }
        data.selected = true;
        this.selectionCount++;
        this._updateValue(data.label);
    }

    private _unselect(data: DsSelectionData<D>) {
        if (!data.selected) {
            return;
        }
        data.selected = false;
        this.selectionCount--;
        this._updateValue(data.label, true);
    }

    private _updateValue(label: string, remove = false) {
        if (!remove) {
            const labelSeparator = this.selectionCount === 1 ? '' : this.labelSeparator;
            this.currentValue += labelSeparator + label;
        } else {
            this.currentValue = this.currentValue
                .split(this.labelSeparator)
                .filter(l => l !== label)
                .join(this.labelSeparator);
        }
    }
}
