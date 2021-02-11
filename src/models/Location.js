import React, { Component } from "react";
import Weather from "./Weather";
const googleapisKey = process.env.REACT_APP_googleapis_API_KEY;

class Location extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "",
      searchTerm: "",
    };
    this.getLocation = this.getLocation.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  onSearchChange(event) {
    this.setState({
      searchTerm: event.target.value,
    });
    this.getLocation(this.state.searchTerm);
  }

  getLocation(event) {
    const loc = event.target.value;
    this.setState({ searchTerm: loc });
    const encodedAddress = encodeURIComponent(loc);
    const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleapisKey}&libraries=places,geometry`;

    return fetch(geocodeURL)
      .then((response) => {
        return response.json();
      })
      .then((resp) => {
        this.setState({
          location: resp.results[0].formatted_address,
          place: {
            lat: resp.results[0].geometry.location.lat,
            long: resp.results[0].geometry.location.lng,
          },
        });
      })
      .catch((error) => error);
  }

  componentDidMount() {}

  render() {
    const { location, searchTerm, place } = this.state;
    return (
      <div>
        <LocationInput onChange={this.getLocation} value={searchTerm} />
        {location ? (
          <ul>
            <li>{location}</li>
          </ul>
        ) : (
          ""
        )}
        <Weather location={place} />
      </div>
    );
  }
}

const LocationInput = ({ onChange, value }) => {
  return (
    <form action="" className="form-group">
      <label htmlFor="search">How's Weather there?</label>
      <input type="text" id="search" onChange={onChange} value={value} />
    </form>
  );
};

export default Location;
