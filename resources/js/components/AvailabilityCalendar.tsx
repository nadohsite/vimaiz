import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface TimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface DayAvailability {
    date: string;
    day_of_week: number;
    slots: TimeSlot[];
}

interface Props {
    availabilities: DayAvailability[];
    onSelectSlot?: (date: string, slot: TimeSlot) => void;
}

export default function AvailabilityCalendar({ availabilities, onSelectSlot }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; slot: TimeSlot } | null>(null);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getAvailabilityForDate = (day: number): DayAvailability | undefined => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return availabilities.find(a => a.date === dateStr);
    };

    const handleSlotClick = (date: string, slot: TimeSlot) => {
        if (slot.is_available) {
            setSelectedSlot({ date, slot });
            onSelectSlot?.(date, slot);
        }
    };

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-neutral-50"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const availability = getAvailabilityForDate(day);
            const hasSlots = availability && availability.slots.length > 0;
            const availableSlots = availability?.slots.filter(s => s.is_available).length || 0;
            const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));

            days.push(
                <div
                    key={day}
                    className={`h-24 border border-neutral-200 p-2 ${isPast ? 'bg-neutral-50 text-neutral-400' : 'bg-white hover:bg-neutral-50'
                        } ${hasSlots && !isPast ? 'cursor-pointer' : ''}`}
                >
                    <div className="font-medium text-sm mb-1">{day}</div>
                    {hasSlots && !isPast && (
                        <div className="text-xs">
                            <span className={`inline-block px-2 py-0.5 rounded ${availableSlots > 0 ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                {availableSlots} slots
                            </span>
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900">Availability</h3>
                <div className="flex items-center gap-4">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-neutral-900 min-w-[140px] text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-neutral-600 py-2">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-neutral-100 rounded"></div>
                    <span>Fully Booked</span>
                </div>
            </div>
        </div>
    );
}
