import {
    addDays,
    addMonths,
    addYears,
    endOfMonth,
    endOfWeek,
    endOfYear,
    getDay,
    getDaysInMonth,
    getWeekOfMonth,
    getWeeksInMonth,
    setDate,
    setMonth,
    setYear,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subMonths
} from 'date-fns';
import { arrayOfLength } from '../utils/array-utils';

export type DsDateType = 'primary' | 'secondary';

export class DsCalendarDateConfig {
    /* sunday = 0, monday = 1, ... */
    startOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1;
    nbOfYears: number = 9;
}

export class DsCalendarDate {
    public day: number;
    public monthWeek: number;
    public month: number;
    public year: number;

    public days: number[] = [];
    public weeks: number[] = [];
    public months: number[] = this.getMonths();
    public years: number[] = [];

    public secondary_day: number;
    public secondary_monthWeek: number;
    public secondary_month: number;
    public secondary_year: number;

    public secondary_days: number[] = [];
    public secondary_weeks: number[] = [];
    public secondary_months: number[] = this.getMonths();
    public secondary_years: number[] = [];

    constructor(
        public date: Date,
        public secondaryDate?: Date,
        public config: DsCalendarDateConfig = new DsCalendarDateConfig()
    ) {
        this.updateData('all', 'primary');
        if (secondaryDate) {
            this.updateData('all', 'secondary');
        }
    }

    updateData(updateSource: 'day' | 'week' | 'month' | 'year' | 'all', dateType: DsDateType) {
        const date = this._getDate(dateType);

        // always update current day & week
        this._setProp('day', date.getDate(), dateType);
        this._setProp(
            'monthWeek',
            getWeekOfMonth(date, {
                weekStartsOn: this.config.startOfWeek
            }) - 1,
            dateType
        );

        // update days/weeks/month/year only on all or if we change any of month or year
        if (['all', 'month', 'year'].includes(updateSource)) {
            this._setProp('days', this.getDays(dateType), dateType);
            this._setProp('weeks', this.getWeeks(dateType), dateType);
            this._setProp('month', this.date.getMonth(), dateType);
            this._setProp('year', this.date.getFullYear(), dateType);
        }

        // we only update the years on all or if the current date year in not included
        const years = this._getProp('years', dateType);
        if (updateSource === 'all' || !years.includes(date.getFullYear())) {
            this._setProp('years', this.getYears(dateType), dateType);
        }
    }

    setDate(date: Date, dateType: DsDateType = 'primary') {
        this._setDate(date, dateType);
        this.updateData('all', dateType);
    }

    setDay(dayOfMonth: number, dateType: DsDateType = 'primary') {
        this._setProp('day', dayOfMonth, dateType);
        this._setDate(setDate(this._getDate(dateType), dayOfMonth), dateType);
        this.updateData('day', dateType);
    }

    setMonthWeek(monthWeek: number, dateType: DsDateType = 'primary') {
        const daysDiff = (monthWeek - this._getProp('monthWeek', dateType)) * 7;
        this._setProp('monthWeek', monthWeek, dateType);
        this._setDate(addDays(this._getDate(dateType), daysDiff), dateType);
        this.updateData('week', dateType);
    }

    setMonth(month: number, dateType: DsDateType = 'primary') {
        this._setProp('month', month, dateType);
        this._setDate(setMonth(this._getDate(dateType), month), dateType);
        this.updateData('month', dateType);
    }

    setYear(year: number, dateType: DsDateType = 'primary') {
        this._setProp('year', year, dateType);
        this._setDate(setYear(this._getDate(dateType), year), dateType);
        this.updateData('year', dateType);
    }

    updateByDays(negativeOrPositiveDays: number, dateType: DsDateType = 'primary') {
        this._setDate(addDays(this._getDate(dateType), negativeOrPositiveDays), dateType);
        this.updateData('all', dateType);
    }

    updateByWeeks(negativeOrPositiveWeeks: number, dateType: DsDateType = 'primary') {
        this._setDate(addDays(this._getDate(dateType), negativeOrPositiveWeeks * 7), dateType);
        this.updateData('all', dateType);
    }

    updateByMonths(negativeOrPositiveMonths: number, dateType: DsDateType = 'primary') {
        this._setDate(addMonths(this._getDate(dateType), negativeOrPositiveMonths), dateType);
        this.updateData('all', dateType);
    }

    updateByYears(negativeOrPositiveYears: number, dateType: DsDateType = 'primary') {
        this._setDate(addYears(this._getDate(dateType), negativeOrPositiveYears), dateType);
        this.updateData('all', dateType);
    }

    getMonthName(monthIndex: number) {
        return MONTHS[monthIndex];
    }

    getWeekDayName(dayIndex: number, dateType: DsDateType = 'primary') {
        const clone = new Date(this._getDate(dateType));
        clone.setDate(dayIndex);
        return WEEKDAYS[getDay(clone)];
    }

    getWeekRange(dateType: DsDateType = 'primary') {
        return [
            startOfWeek(this._getDate(dateType), { weekStartsOn: this.config.startOfWeek }),
            endOfWeek(this._getDate(dateType), { weekStartsOn: this.config.startOfWeek })
        ];
    }

    getMonthRange(dateType: DsDateType = 'primary') {
        return [startOfMonth(this._getDate(dateType)), endOfMonth(this._getDate(dateType))];
    }

    getYearRange(dateType: DsDateType = 'primary') {
        return [startOfYear(this._getDate(dateType)), endOfYear(this._getDate(dateType))];
    }

    get12MonthsRange(dateType: DsDateType = 'primary') {
        const date11MonthsAgo = subMonths(this._getDate(dateType), 11);
        date11MonthsAgo.setDate(1);
        return [date11MonthsAgo, this._getDate(dateType)];
    }

    getPeriodRange() {
        return [this.date, this.secondaryDate];
    }

    getDays(dateType: DsDateType = 'primary'): number[] {
        return arrayOfLength(getDaysInMonth(this._getDate(dateType)), (_, i) => i + 1);
    }

    getWeeks(dateType: DsDateType = 'primary'): number[] {
        const weeksInMonth = getWeeksInMonth(this._getDate(dateType), {
            weekStartsOn: this.config.startOfWeek
        });
        return arrayOfLength(weeksInMonth);
    }

    getMonths(): number[] {
        return arrayOfLength(12);
    }

    getYears(dateType: DsDateType = 'primary'): number[] {
        return arrayOfLength(
            this.config.nbOfYears,
            (_, i) => this._getDate(dateType).getFullYear() - i
        ).reverse();
    }

    reset(initSecondaryDate: boolean = false) {
        this.date = new Date();
        this.updateData('all', 'primary');
        if (this.secondaryDate || initSecondaryDate) {
            this.secondaryDate = new Date();
            this.updateData('all', 'secondary');
        }
    }

    clone() {
        return new DsCalendarDate(this.date, this.secondaryDate, this.config);
    }

    private _getProp(field: string, dateType: DsDateType = 'primary') {
        const prop = (dateType === 'secondary' ? 'secondary_' : '') + field;
        return this[prop];
    }

    private _setProp(field: string, value: any, dateType: DsDateType = 'primary') {
        const prop = (dateType === 'secondary' ? 'secondary_' : '') + field;
        this[prop] = value;
    }

    private _setDate(date: Date, dateType: DsDateType = 'primary') {
        if (dateType === 'primary') {
            this.date = date;
        } else {
            this.secondaryDate = date;
        }
    }

    private _getDate(dateType: DsDateType = 'primary') {
        if (dateType === 'primary') {
            return this.date;
        }
        return this.secondaryDate;
    }
}

export const MONTHS = [
    'Jan.',
    'Fev.',
    'Mar.',
    'Avr.',
    'Mai.',
    'Juin',
    'Juil.',
    'Aoù.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Déc.'
];

export const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'TH', 'Fr', 'Sa'];
