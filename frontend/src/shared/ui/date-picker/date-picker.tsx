'use client';

import { Calendar, DateObject } from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/analog_time_picker';
import 'react-multi-date-picker/styles/colors/purple.css';
import 'react-multi-date-picker/styles/colors/analog_time_picker_purple.css';
import './date-picker.css';

import { useState, useRef, useEffect } from 'react';

interface DateTimePickerProps {
  value: Date | Date[] | null;
  onChange: (date: Date | Date[] | null) => void;
  label?: string;
  withTime?: boolean;
  format?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  range?: boolean;
}

const months = [
  ['Tháng 1'],
  ['Tháng 2'],
  ['Tháng 3'],
  ['Tháng 4'],
  ['Tháng 5'],
  ['Tháng 6'],
  ['Tháng 7'],
  ['Tháng 8'],
  ['Tháng 9'],
  ['Tháng 10'],
  ['Tháng 11'],
  ['Tháng 12'],
];
const weekDays = [
  ['Chủ nhật', 'CN'],
  ['Thứ Hai', 'T2'],
  ['Thứ Ba', 'T3'],
  ['Thứ Tư', 'T4'],
  ['Thứ Năm', 'T5'],
  ['Thứ Sáu', 'T6'],
  ['Thứ Bảy', 'T7'],
];

export const DateTimePicker = ({
  value,
  onChange,
  label,
  withTime = true,
  format,
  disabled = false,
  className,
  placeholder = 'Chọn ngày',
  range = false,
}: DateTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef<Date | Date[] | null>(null);

  const getFormattedValue = () => {
    if (!value) return '';

    const dateFormat = format ?? (withTime ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY');

    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      if (value.length === 1) {
        return new DateObject(value[0]).format(dateFormat);
      }
      return `${new DateObject(value[0]).format(dateFormat)} — ${new DateObject(value[1]).format(dateFormat)}`;
    } else {
      return new DateObject(value).format(dateFormat);
    }
  };

  const formattedValue = getFormattedValue();
  const now = new Date();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isOnlyTimeChanged = (newDate: any, oldDate: any): boolean => {
    if (!withTime || !newDate || !oldDate) return false;

    if (Array.isArray(newDate) && Array.isArray(oldDate)) {
      if (newDate.length !== oldDate.length) return false;

      for (let i = 0; i < newDate.length; i++) {
        const newD = new DateObject(newDate[i]);
        const oldD = new DateObject(oldDate[i]);

        if (
          newD.day !== oldD.day ||
          newD.month.number !== oldD.month.number ||
          newD.year !== oldD.year
        ) {
          return false;
        }
      }
      return true;
    } else if (!Array.isArray(newDate) && !Array.isArray(oldDate)) {
      const newD = new DateObject(newDate);
      const oldD = new DateObject(oldDate);

      return (
        newD.day === oldD.day &&
        newD.month.number === oldD.month.number &&
        newD.year === oldD.year &&
        (newD.hour !== oldD.hour || newD.minute !== oldD.minute)
      );
    }

    return false;
  };

  const handleDateChange = (date: any) => {
    const timeOnlyChanged = isOnlyTimeChanged(date, prevValueRef.current);

    if (date) {
      prevValueRef.current = Array.isArray(date)
        ? (date.map((d) => d?.toDate?.() ?? null).filter(Boolean) as Date[])
        : (date?.toDate?.() ?? null);
    } else {
      prevValueRef.current = null;
    }

    if (!date) {
      onChange(null);
    } else if (Array.isArray(date)) {
      const dateArray = date
        .map((d) => d?.toDate?.() ?? null)
        .filter(Boolean) as Date[];
      onChange(dateArray.length > 0 ? dateArray : null);
    } else {
      const d = date?.toDate?.() ?? null;
      onChange(d);
    }

    if (range && Array.isArray(date) && date.length >= 2) {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full relative h-full">
      {label && (
        <label className="h-8 text-sm font-semibold text-gray-700 flex items-center">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="text"
          value={formattedValue}
        readOnly
        placeholder={placeholder}
        className={`h-11 w-full appearance-none rounded-full border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-gray-400 focus:outline-hidden focus:ring-1 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-gray-500 ${value ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 dark:text-gray-400'} ${className}`}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div ref={calendarContainerRef} className="absolute z-50 mt-2">
          <Calendar
            value={value}
            months={months}
            weekDays={weekDays}
            onChange={handleDateChange}
            format={format ?? (withTime ? 'DD-MM-YYYY HH:mm' : 'DD-MM-YYYY')}
            plugins={[...(withTime ? [<TimePicker key="time-picker" />] : [])]}
            maxDate={now}
            className="bg-opacity-90 bg-purple-900"
            range={range}
            rangeHover={range}
          />
        </div>
      )}
    </div>
  );
};
