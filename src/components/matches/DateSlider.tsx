import React from 'react';
import { addDays } from 'date-fns';
import DatePicker from './DatePicker';

interface DateSliderProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

const DateSlider: React.FC<DateSliderProps> = ({ date, setDate }) => {
  const handlePrevDay = () => {
    setDate(addDays(date, -1));
  };

  const handleNextDay = () => {
    setDate(addDays(date, 1));
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
      <DatePicker date={date} setDate={setDate} />

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
