import {
    BarSeriesOption,
    EChartsOption,
    GridComponentOption,
    LineSeriesOption,
    PieSeriesOption,
    RadarSeriesOption,
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
    ChartCustomHeaderOptions,
    ChartCustomLegends,
    ChartCustomTarget,
    ChartData,
    ChartExtendedOptions,
    ChartGraphicsOptions,
    ChartLegendOptions,
    ChartPosition,
    ChartResizeConfig,
    ChartSeriesOptions,
    ChartTitleOptions,
    GaugeChartOptions,
    RadarChartIndicator,
    RadarChartOptions
} from '../models/ds-chart.model';
import {
    creatDatasetZoom,
    createAxis,
    createGraphics,
    createGrid,
    createLegend,
    createMarkLine,
    createRadar,
    createTitle,
    creatTooltip,
    getSeriesData,
    mapToSeriesData,
    RICH_TEXT_TEMPLATES
} from '../utils/charts';
import { deepMerge } from '../utils/object-utils';

export class BaseChartBuilder {
    options: ChartExtendedOptions = {} as ChartExtendedOptions;

    /*
     *  Custom legends size which is used in the chart component
     *  to calculate the chart size
     */
    protected customLegendsSize = { bottom: '20%', side: '20%' };

    /*
     *  Chart resize config that is used to configure the % resize on different
     *  container sizes (in px)
     */
    protected chartResizeMap: ChartResizeConfig = [
        { containerPixelWidth: 1000, chartPercentageWidth: 95 }
    ];

    constructor() {
        this.options.id = crypto.randomUUID();
    }

    withTitle(
        title: string,
        position: ChartPosition = 'center-top',
        options: ChartTitleOptions = {}
    ): this {
        this.options.title = createTitle(title, position, options);
        return this;
    }

    withLegend(position: ChartPosition = 'right-middle', options: ChartLegendOptions = {}) {
        this.options.legend = createLegend(position, options);
        return this;
    }

    withTooltip(options: TooltipComponentOption = {}) {
        this.options.tooltip = creatTooltip(options);
        return this;
    }

    withGrid(options: GridComponentOption = {}) {
        this.options.grid = createGrid(options);
        return this;
    }

    withGraphics(options: ChartGraphicsOptions = {}) {
        this.options.graphic = createGraphics(options);
        return this;
    }

    withCategoryXAxis(data: ChartCategoryAxisData, options: ChartAxisOptions = {}) {
        this.options.xAxis = createAxis('category', data, options) as XAXisComponentOption;
        return this;
    }

    withValueXAxis(options: ChartAxisOptions = {}) {
        this.options.xAxis = createAxis('value', null, options) as XAXisComponentOption;
        return this;
    }

    withCategoryYAxis(data: ChartCategoryAxisData, options: ChartAxisOptions = {}) {
        this.options.yAxis = createAxis('category', data, options) as YAXisComponentOption;
        return this;
    }

    withValueYAxis(options: ChartAxisOptions = {}) {
        this.options.yAxis = createAxis('value', null, options) as YAXisComponentOption;
        return this;
    }

    withDataZoom(axis: ChartAxisZoom = 'x', options?: ChartAxisZoomOptions) {
        this.options.dataZoom = creatDatasetZoom(axis, options);
        return this;
    }

    withCustomLegend(legends: ChartCustomLegends) {
        this.options.legend = {
            show: false
        };
        if (legends.data?.length > 0) {
            legends.position = legends.position || 'side';
            legends.size = legends.size || this.customLegendsSize[legends.position];
            this.options.customLegends = legends;
        }
        return this;
    }

    withCustomHeader(header: ChartCustomHeaderOptions) {
        this.options.customHeader = header;
        return this;
    }

    withResizeConfig(config: ChartResizeConfig) {
        this.options.chartResizeConfig = config;
        return this;
    }

    withTarget(options: ChartCustomTarget) {
        this.options.customTarget = options;
        return this;
    }

    protected getDefaultOptions(): EChartsOption {
        return {
            xAxis: {
                show: false,
                axisLabel: {
                    color: COLORS['neutral-400']
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: COLORS['neutral-300']
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: COLORS['neutral-300']
                    }
                }
            },
            yAxis: {
                show: false,
                axisLabel: {
                    color: COLORS['neutral-400']
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: COLORS['neutral-300']
                    }
                }
            },
            // @ts-ignore
            series: this.options.series.map(() => ({
                label: {
                    rich: RICH_TEXT_TEMPLATES
                }
            }))
        };
    }

    build() {
        // always create a grid if there is not & set the chart boundaries
        if (!this.options.grid || this.options.grid['show'] === undefined) {
            this.options.grid = createGrid({ show: false });
        }

        // we reduce the chart size to add custom header labels in the resulting free space
        if (this.options.customHeader) {
            this.options.grid = deepMerge(this.options.grid, {
                top: this.options.customHeader.size
            });
        }

        // if custom target is set, add a mark line to the first series
        if (this.options.customTarget) {
            const { target } = this.options.customTarget;
            const series = this.options.series[0];
            series['markLine'] = createMarkLine(this.options.customTarget);
            const maxValue = Math.max(...getSeriesData(series.data));
            if (this.options.yAxis['type'] === 'value' && target > maxValue) {
                this.options.yAxis['max'] = target;
            }
        }

        // if chartResizeConfig is not set, use the default one
        if (!this.options.chartResizeConfig) {
            this.options.chartResizeConfig = this.chartResizeMap;
        }

        const chartOptions = this.getDefaultOptions();
        return deepMerge(chartOptions, this.options);
    }
}

export class LineChartBuilder extends BaseChartBuilder {
    withSeries(data: LineSeriesOption['data'], options: ChartSeriesOptions<LineSeriesOption> = {}) {
        this.options.series = [
            {
                type: 'line',
                name: 'line',
                data,
                ...options
            }
        ];
        return this;
    }
}

export class BarChartBuilder extends BaseChartBuilder {
    withSeries(data: BarSeriesOption['data'], options: ChartSeriesOptions<BarSeriesOption> = {}) {
        this.options.series = [
            {
                type: 'bar',
                name: 'bar',
                data,
                ...options
            }
        ];
        return this;
    }

    override getDefaultOptions() {
        const chartOptions = super.getDefaultOptions();
        if (this.options.series) {
            const styles = {
                barWidth: 25,
                itemStyle: {
                    borderRadius: [5, 5, 0, 0]
                }
            };
            chartOptions['series'] = deepMerge(
                // @ts-ignore
                this.options.series.map(() => styles),
                chartOptions['series']
            );
        }
        return chartOptions;
    }
}

export class StackBarChartBuilder extends BaseChartBuilder {
    withSeries(
        stackData: { name: string; data: (ChartData | number)[] }[],
        options: ChartSeriesOptions<BarSeriesOption> = {}
    ) {
        this.options.series = stackData.map(st => {
            return {
                type: 'bar',
                name: st.name,
                stack: 'stack',
                data: mapToSeriesData(st.data),
                ...options
            } as BarSeriesOption;
        });
        return this;
    }

    override getDefaultOptions() {
        const chartOptions = super.getDefaultOptions();
        if (this.options.series) {
            const styles = {
                barWidth: 25
            };
            chartOptions['series'] = deepMerge(
                // @ts-ignore
                this.options.series.map(() => styles),
                chartOptions['series']
            );
            // setBarDynamicRoundCorners(this.options);
        }
        return chartOptions;
    }
}

export class PieChartBuilder extends BaseChartBuilder {
    constructor() {
        super();
        this.customLegendsSize = { bottom: '30%', side: '50%' };
        this.chartResizeMap = [
            { containerPixelWidth: 500, chartPercentageWidth: 70 },
            { containerPixelWidth: 600, chartPercentageWidth: 60 },
            { containerPixelWidth: 700, chartPercentageWidth: 55 },
            { containerPixelWidth: 800, chartPercentageWidth: 50 }
        ];
    }

    withSeries(data: ChartData[], options: ChartSeriesOptions<PieSeriesOption> = {}) {
        this.options.series = [
            {
                type: 'pie',
                name: 'pie',
                label: {
                    show: false
                },
                labelLine: {
                    show: false
                },
                data: mapToSeriesData(data).sort((a, b) => b.value - a.value),
                ...options
            }
        ];
        return this;
    }

    override getDefaultOptions() {
        const chartOptions = super.getDefaultOptions();
        if (this.options.title) {
            chartOptions['title'] = deepMerge(
                {
                    textStyle: { fontWeight: 'bold', fontSize: '24px' },
                    subtextStyle: { fontWeight: 'bold', fontSize: '18px' }
                },
                chartOptions['title']
            );
        }
        if (this.options.series) {
            const styles = {
                radius: ['70%', '90%']
            };
            chartOptions['series'] = deepMerge(
                // @ts-ignore
                this.options.series.map(() => styles),
                chartOptions['series']
            );
        }
        return chartOptions;
    }
}

export class GaugeChartBuilder extends BaseChartBuilder {
    withSeries(data: { data: ChartData; target?: ChartData }, options: GaugeChartOptions = {}) {
        const sharedOptions: any = {
            type: 'gauge',
            center: ['50%', '65%'],
            startAngle: 200,
            endAngle: -20,
            min: options.min ?? 0,
            max: options.max ?? 100,
            splitNumber: options.splitNumber ?? 10,
            pointer: {
                show: false
            },
            anchor: {
                show: false
            },
            title: {
                show: false
            }
        };
        this.options.series = [
            {
                ...sharedOptions,
                name: data.data?.name ?? 'gauge1',
                itemStyle: {
                    color: data.data?.color ?? COLORS['blue-600']
                },
                progress: {
                    show: true,
                    width: options.progressWidth ?? 30
                },
                axisLine: {
                    lineStyle: {
                        width: options.progressWidth ?? 30
                    }
                },
                axisTick: {
                    distance: options.axis?.tickDistance ? options.axis?.tickDistance + 7 : -45,
                    splitNumber: 5,
                    lineStyle: {
                        width: 2,
                        color: COLORS['neutral-400']
                    }
                },
                splitLine: {
                    distance: options.axis?.tickDistance ?? -52,
                    length: 14,
                    lineStyle: {
                        width: 3,
                        color: COLORS['neutral-400']
                    }
                },
                axisLabel: {
                    distance: options.axis?.distance ?? -20,
                    fontFamily: options.label?.fontFamily ?? 'Inter',
                    color: COLORS['neutral-400'],
                    fontSize: 14
                },
                detail: {
                    offsetCenter: options.label?.offset ?? [0, '-10%'],
                    fontFamily: options.label?.fontFamily ?? 'Inter',
                    fontSize: options.label?.fontSize ?? 80,
                    fontWeight: options.label?.fontWeight ?? 'bolder',
                    formatter: options.label?.formatter ?? '{value}%',
                    color: options.label?.color ?? 'inherit'
                },
                data: [
                    {
                        value: data.data.value
                    }
                ]
            }
        ];
        if (data.target) {
            this.options.series.push({
                ...sharedOptions,
                name: data.target?.name ?? 'gauge2',
                itemStyle: {
                    color: data.target?.color ?? COLORS['neutral-400']
                },
                progress: {
                    show: true,
                    width: options.targetWidth ?? 8
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                detail: {
                    show: false
                },
                data: [
                    {
                        value: data.target.value
                    }
                ]
            });
        }
        return this;
    }

    override getDefaultOptions() {
        return {};
    }
}

export class RadarChartBuilder extends BaseChartBuilder {
    withIndicators(indicators: RadarChartIndicator[], options: RadarChartOptions = {}) {
        this.options.radar = createRadar(indicators, options);
        return this;
    }

    withSeries(data: RadarSeriesOption['data']) {
        this.options.series = [
            {
                type: 'radar',
                tooltip: {
                    trigger: 'item'
                },
                data: data
            }
        ];
        return this;
    }
}

export class DsChartBuilder {
    static LineChart(): LineChartBuilder {
        return new LineChartBuilder();
    }

    static BarChart(): BarChartBuilder {
        return new BarChartBuilder();
    }

    static StackBarChart(): StackBarChartBuilder {
        return new StackBarChartBuilder();
    }

    static PieChart(): PieChartBuilder {
        return new PieChartBuilder();
    }

    static GaugeChart(): GaugeChartBuilder {
        return new GaugeChartBuilder();
    }

    static RadarChart(): RadarChartBuilder {
        return new RadarChartBuilder();
    }
}
