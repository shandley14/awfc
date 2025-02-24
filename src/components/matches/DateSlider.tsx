import React from 'react';
import { addDays, format } from 'date-fns';
import DatePicker from './DatePicker';

interface DateSliderProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<string | Date>>; // ✅ Ensure it's a state setter function
}

const DateSlider: React.FC<DateSliderProps> = ({ date, setDate }) => {
  const handlePrevDay = () => {
    setDate((prev) => format(addDays(new Date(prev), -1), "yyyy-MM-dd")); // ✅ Proper state setter function
  };

  const handleNextDay = () => {
    setDate((prev) => format(addDays(new Date(prev), 1), "yyyy-MM-dd")); // ✅ Proper state setter function
  };

  return (
    <div className="date-slider flex items-center space-x-2 mt-4">
      {/* Left Arrow */}
      <button
        onClick={handlePrevDay}
        className="px-3 py-1 border rounded hover:bg-gray-200"
      >
        &lt;
      </button>

      {/* DatePicker in the center */}
      <DatePicker date={date} setDate={(newDate) => setDate(newDate)} /> {/* ✅ Ensure correct type */}
      
      {/* Right Arrow */}
      <button
        onClick={handleNextDay}
        className="px-3 py-1 border rounded hover:bg-gray-200"
      >
        &gt;
      </button>
    </div>
  );
};

export default DateSlider;
