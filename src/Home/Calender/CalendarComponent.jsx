// CalendarComponent.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarComponent.css';

const CalendarComponent = () => {
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setCalendarDate(newDate);
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={calendarDate}
      />
    </div>
  );
};

export default CalendarComponent;
