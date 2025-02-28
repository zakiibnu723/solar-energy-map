const Header = ({ displayData }) => {
  const prov_name = displayData?.prov_name;
  const kab_name = displayData?.kab_name;

  if (kab_name) {
    return (
      <div className="header">
        <h1>{kab_name}</h1>
        <h4>{prov_name}</h4>
        <div className="longlat">
          <p>Latitude: {displayData?.latitude}</p>
          <p>|</p>
          <p>Longitude: {displayData?.longitude}</p>
        </div>
      </div>
    );
  } else if (prov_name) {
    return (
      <div className="header">
        <h1>{prov_name}</h1>
        <p>Total Regency: {displayData?.num_kab}</p>
      </div>
    );
  } else {
    return <div>No data available</div>;
  }
};

export default Header;
