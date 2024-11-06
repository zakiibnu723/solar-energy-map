import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/colors/teal.css';

const DateRangePicker = ({ startDate, endDate, setStartDate, setEndDate, initialStartDate, initialEndDate, datePickerFormat, dataFrequency }) => {
  return (
    <div className="date-picker">
      <label>Time range: </label>
      <div className="time-range">
        <DatePicker
          value={startDate}
          onChange={setStartDate}
          onlyShowInRange={true}
          minDate={initialStartDate}
          maxDate={initialEndDate}
          format={datePickerFormat}
          select={dataFrequency.current === 'Daily'}
          onlyMonthPicker={dataFrequency.current === 'Monthly'}
          onlyYearPicker={dataFrequency.current === 'Yearly'}
        />
        <label className="arrow-date">
          <svg viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 512 512"><path d="M160 128.4 192.3 96 352 256 192.3 416 160 383.6 287.3 256z" fill="#ffffff" class="fill-000000"></path></svg>
        </label>
        <DatePicker
          value={endDate}
          onChange={setEndDate}
          onlyShowInRange={true}
          minDate={initialStartDate}
          maxDate={initialEndDate}
          className='custom-popper'
          format={datePickerFormat}
          select={dataFrequency.current === 'Daily'}
          onlyMonthPicker={dataFrequency.current === 'Monthly'}
          onlyYearPicker={dataFrequency.current === 'Yearly'}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
