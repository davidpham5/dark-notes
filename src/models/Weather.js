import React, { Component } from "react";

const basePath = `https://api.darksky.net/forecast/`;
const darkSkyKey = process.env.REACT_APP_darksky_API_KEY;
class Weather extends Component {
  constructor(props) {
    super(props);
    this.state = {
      forecast: null,
    };
    this.showWeather = this.showWeather.bind(this);
  }

  showWeather(location) {
    const { lat, long } = location;
    const url = `${basePath}${darkSkyKey}/${lat},${long}`;

    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((resp) => {
        return resp;
      })
      .catch((error) => error);
  }

  componentDidMount() {
    // before rendering
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location) {
      this.showWeather(nextProps.location)
        .then((resp) => {
          return this.setState({ forecast: resp });
        })
        .catch((error) => error);
    }
  }

  render() {
    if (!this.state.forecast) {
      return null;
    }
    const { forecast } = this.state;
    if (!forecast.currently) {
      return false;
    }

    function formatAMPM(date) {
      const d = new Date(date * 1000);
      const formattedTime = d.toLocaleString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
      if (formattedTime === "12:00 AM") {
        return `${d.toDateString()}  'MidNight`;
      } else if (formattedTime === "12:00 PM") {
        return "Noon";
      } else {
        return formattedTime;
      }
    }
    return (
      <div>
        <ul>
          <li>
            <h3>
              <div className="icon-group--summary">
                Currently {forecast.currently.temperature}
                &nbsp;
                <i className={`climacon ${forecast.currently.icon}`} />
                <div>{forecast.currently.summary}</div>
              </div>
              <div>{forecast.hourly.summary}</div>
            </h3>
          </li>
        </ul>
        <ul>
          {forecast.hourly.data.map((temp) => {
            return (
              <li className="forecast--time-temp" key={temp.time}>
                <span className="forecast--time">{formatAMPM(temp.time)}</span>
                <span className="forecast--temp">
                  {temp.temperature} <i className="climacon fahrenheit"></i>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default Weather;
