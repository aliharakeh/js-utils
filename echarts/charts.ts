import {
    BarSeriesOption,
    DataZoomComponentOption,
    ECharts,
    GridComponentOption,
    init,
    LegendComponentOption,
    RadarComponentOption,
    TitleComponentOption,
    TooltipComponentOption,
    XAXisComponentOption,
    YAXisComponentOption
} from 'echarts';
import { COLORS } from '../generated/colors';
import {
    ChartAxisOptions,
    ChartAxisZoom,
    ChartAxisZoomOptions,
    ChartCategoryAxisData,
    ChartCustomLegendData,
    ChartCustomTarget,
    ChartData,
    ChartExtendedOptions,
    ChartGraphicsOptions,
    ChartPosition,
    ChartPositionData,
    PositionBox,
    RadarChartIndicator
} from '../models/ds-chart.model';
import { zipArrays } from './array-utils';
import { deepMerge } from './object-utils';

export const RICH_TEXT_TEMPLATES = {
    label: {
        width: 120,
        align: 'left',
        fontSize: 16
    },
    value: {
        width: 60,
        align: 'right',
        padding: [0, 0, 0, 20],
        fontSize: 16
    }
};

export function creatPosition(position: ChartPosition): PositionBox {
    switch (position) {
        case 'left-top':
            return { left: 'left', top: 'top' };
        case 'right-top':
            return { right: 'left', top: 'top' };
        case 'center-top':
            return { left: 'center', top: 'top' };
        case 'center-middle':
            return { left: 'center', top: 'middle' };
        case 'left-middle':
            return { left: 'left', top: 'middle' };
        case 'right-middle':
            return { right: 'left', top: 'middle' };
        case 'left-bottom':
            return { left: 'left', top: 'bottom' };
        case 'center-bottom':
            return { left: 'center', top: 'bottom' };
        case 'right-bottom':
            return { right: 'left', top: 'bottom' };
        default:
            return position as PositionBox;
    }
}

export function getPositionOrientation(position: ChartPosition): 'horizontal' | 'vertical' {
    if (typeof position === 'string') {
        return position.startsWith('center') ? 'horizontal' : 'vertical';
    }
    return position.left === 'center' ? 'horizontal' : 'vertical';
}

export function createTitle(
    text: string,
    position: ChartPosition,
    options: TitleComponentOption
): TitleComponentOption {
    const title = {
        show: true,
        text,
        ...creatPosition(position),
        ...options
    };
    // add rich templates
    ['textStyle', 'subtextStyle'].forEach(key => {
        title[key] = deepMerge(
            {
                rich: RICH_TEXT_TEMPLATES
            },
            title[key] || {}
        );
    });
    return title;
}

export function createLegend(
    position: ChartPosition,
    options: LegendComponentOption
): LegendComponentOption {
    const legend = {
        show: true,
        type: 'scroll',
        icon: 'circle',
        ...creatPosition(position),
        orient: getPositionOrientation(position),
        ...options
    };
    // add rich templates
    legend['textStyle'] = deepMerge<any>(
        {
            rich: RICH_TEXT_TEMPLATES
        },
        legend['textStyle'] || {}
    );
    return legend;
}

export function createAxis(
    type: 'value' | 'category',
    data: ChartCategoryAxisData,
    options: ChartAxisOptions
): XAXisComponentOption | YAXisComponentOption {
    return {
        show: true,
        type,
        data,
        ...options
    };
}

export function creatTooltip(options: TooltipComponentOption): TooltipComponentOption {
    return {
        show: true,
        trigger: 'item',
        confine: true,
        ...options
    };
}

export function createGrid(options: GridComponentOption): GridComponentOption {
    return {
        show: false,
        containLabel: true,
        right: 0,
        left: '1%',
        top: '4%',
        bottom: '4%',
        ...options
    };
}

export function createGraphics(options: ChartGraphicsOptions): ChartGraphicsOptions {
    return options;
}

export function creatDatasetZoom(
    axis: ChartAxisZoom,
    options?: ChartAxisZoomOptions
): DataZoomComponentOption[] {
    const xOptions = options?.hasOwnProperty('x') ? options['x'] : ({} as DataZoomComponentOption);
    const xZoom: DataZoomComponentOption = {
        id: 'dataZoomX',
        type: 'inside',
        xAxisIndex: [0],
        filterMode: 'empty',
        ...xOptions
    };
    const yOptions = options?.hasOwnProperty('y') ? options['y'] : ({} as DataZoomComponentOption);
    const yZoom: DataZoomComponentOption = {
        id: 'dataZoomY',
        type: 'inside',
        yAxisIndex: [0],
        filterMode: 'empty',
        ...yOptions
    };
    return axis === 'x' ? [xZoom] : axis === 'y' ? [yZoom] : [xZoom, yZoom];
}

export function mapToSeriesData(data: (ChartData | number)[]) {
    return data.map(d => {
        if (!d || typeof d === 'number') {
            return { value: (d as number) || 0 };
        }
        return {
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color }
        };
    });
}

// this is to fix the issue when the round border style only applies to the last series data
// as it has a value > 0, whereas it is not applied to the last other visible series when this
// data is 0 and hidden
export function setBarDynamicRoundCorners(options: any) {
    const series = options.series as BarSeriesOption[];
    const data = series.map(s => s.data);
    if (!data || data.length === 0) {
        return;
    }
    const itemStyle = {
        borderRadius: [5, 5, 0, 0]
    };
    for (let dataIndex = 0; dataIndex < data[0].length; dataIndex++) {
        const topToBottomBarData = data.map(d => d[dataIndex]).reverse();
        const firstNonEmptyIndex = topToBottomBarData.findIndex(d =>
            // @ts-ignore
            typeof d === 'number' ? d > 0 : d.value > 0
        );
        const lastIndex = topToBottomBarData.length - 1;
        const seriesIndex = lastIndex - (firstNonEmptyIndex === -1 ? 0 : firstNonEmptyIndex);
        const seriesData = data[seriesIndex][dataIndex];
        if (typeof seriesData === 'number') {
            data[seriesIndex][dataIndex] = { value: seriesData, itemStyle };
        } else {
            seriesData['itemStyle'] = deepMerge(seriesData['itemStyle'], itemStyle);
        }
    }
}

export function getSeriesData(seriesData: any[]) {
    return seriesData.map(d => (typeof d === 'object' ? d.value : d));
}

export function createMarkLine(options: ChartCustomTarget) {
    const { target, distance, unit } = options;
    return {
        silent: true,
        symbol: 'none',
        animation: false,
        data: [
            {
                yAxis: target,
                label: {
                    show: true,
                    position: 'start',
                    formatter: `{value|${target + (unit ?? '%')}}`,
                    padding: [4, -20],
                    rich: {
                        value: {
                            backgroundColor: '#000',
                            borderRadius: 15,
                            padding: [8, 7, 5, 8],
                            color: '#FFF'
                        }
                    },
                    distance: (distance ?? 20) * -1
                },
                lineStyle: {
                    type: 'dashed',
                    color: '#000'
                }
            }
        ]
    };
}

export function createRadar(indicators: RadarChartIndicator[], options: RadarComponentOption) {
    return deepMerge<RadarComponentOption>(
        {
            indicator: indicators,
            center: ['50%', '50%'],
            axisName: {
                color: '#000',
                backgroundColor: '#fff',
                borderRadius: 3,
                padding: [3, 5]
            },
            splitArea: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: COLORS['neutral-300']
                }
            }
        },
        options
    ) as RadarComponentOption;
}

export class DsEcharts {
    public chart: ECharts;
    public toggledLegends = new Set<string>();
    public disabledLegends: (ChartCustomLegendData & { index: number })[] = [];

    constructor(public chartContainer: HTMLElement, public options: ChartExtendedOptions) {
        this.chart = init(this.chartContainer);
        this.options = options;
        this.setOptions(options);
    }

    setOptions(...params: Parameters<ECharts['setOption']>) {
        this.chart.setOption(...params);
    }

    get<T = any>(key: string) {
        return this.chart.getOption()[key] as T;
    }

    getAllSeriesData() {
        return zipArrays(...this.get('series').map(s => getSeriesData(s.data)));
    }

    getAxisData(axis: 'xAxis' | 'yAxis', axisIndex = 0) {
        const axisData = this.chart.getOption()[axis]?.[axisIndex]?.data as any[];
        return axisData?.map(d => (typeof d === 'object' ? d.value : d));
    }

    getDataValues(axis: 'xAxis' | 'yAxis') {
        const data = this.getAxisData(axis);
        if (data) {
            return data;
        }
        // no axis data so we consider that the data is inside the series
        const seriesData = this.getAllSeriesData().map(values =>
            values.map(v => (Array.isArray(v) ? v[axis === 'xAxis' ? 0 : 1] : v))
        );
        // multi series data
        if (seriesData[0].length > 1) {
            return seriesData;
        }
        // single series data
        return seriesData.map(d => d[0]);
    }

    getDataPosition(xValue: number | string, yValue: number | string, axisIndex = 0) {
        return {
            x: xValue ? this.chart.convertToPixel({ xAxisIndex: axisIndex }, xValue) : 0,
            y: yValue ? this.chart.convertToPixel({ yAxisIndex: axisIndex }, yValue) : 0
        };
    }

    getDataPositions() {
        const xAxisData = this.getDataValues('xAxis');
        const yAxisData = this.getDataValues('yAxis');
        const removedDataIndexes = this.disabledLegends.map(l => l.index);
        const isStacked = Array.isArray(yAxisData[0]);
        return xAxisData.map((xValue, i) => {
            const yData = yAxisData[i];
            const lastYAxisValue = isStacked
                ? yData[yData.lenght - 1] // last value in stacked bar
                : yData;
            const { x: xPosition, y: yPosition } = this.getDataPosition(xValue, lastYAxisValue);
            return {
                xPosition,
                yPosition,
                xValue,
                yValue: isStacked ? yData.filter((_, i) => !removedDataIndexes.includes(i)) : yData
            };
        }) as ChartPositionData[];
    }

    addCustomGraphics() {
        const { graphicsTemplate } = this.options.customHeader;
        const positionData = this.getDataPositions();
        this.chart.setOption({
            graphic: {
                elements: positionData.map(data => createGraphics(graphicsTemplate(data)))
            }
        });
    }

    addCustomHtmlHeaderTemplate() {
        const { htmlTemplate } = this.options.customHeader;
        const selector = `ds-chart__header-item-${this.options.id}`;
        const positionData = this.getDataPositions();
        let count = 0;
        // @ts-ignore
        for (const child of this.chartContainer.children) {
            if (child.className === selector) {
                count++;
            }
        }
        if (count === 0) {
            for (let _ of positionData) {
                const item = document.createElement('div');
                item.classList.add(selector);
                this.chartContainer.appendChild(item);
            }
        }
        let index = 0;
        // @ts-ignore
        for (const child of this.chartContainer.children) {
            if (child.className === selector) {
                const d = positionData[index++];
                child.innerHTML = htmlTemplate(d) ?? '';
                child.style.position = 'absolute';
                child.style.left = `${d.xPosition}px`;
                child.style.top = `0px`;
                child.style.transform = `translateX(-50%)`;
            }
        }
    }

    addTargetItem() {
        const { target, htmlTemplate } = this.options.customTarget;
        const selector = `ds-chart__target-item-${this.options.id}`;
        const item = this.chartContainer.querySelector(`.${selector}`) as HTMLDivElement;
        if (item) {
            const d = this.getDataPosition(0, target);
            item.innerHTML = htmlTemplate({
                xValue: 0,
                yValue: target,
                xPosition: d.x,
                yPosition: d.y
            });
            item.style.position = 'absolute';
            item.style.left = `${d.x}px`;
            item.style.top = `${d.y}px`;
            item.style.transform = `translateY(-55%)`;
        } else {
            const targetItem = document.createElement('div');
            targetItem.classList.add(selector);
            this.chartContainer.appendChild(targetItem);
        }
    }
}
