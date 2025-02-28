const FrequencySelector = ({ dataFrequency, onFrequencyChange }) => {
  return (
    <div className="data-frequency">
      <label htmlFor="frequency">Select Data Frequency: </label>
      <select id="frequency" value={dataFrequency.current} onChange={(e) => onFrequencyChange(e.target.value)}>
        <option value="Daily">Daily</option>
        <option value="Monthly">Monthly</option>
        <option value="Yearly">Yearly</option>
      </select>
    </div>
  );
};

export default FrequencySelector;
