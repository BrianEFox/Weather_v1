import React, { Component } from "react";
import "./styles/WeatherCard.css";

class WeatherCard extends Component {
  render() {
    const { date, location, weather } = this.props;
    if (date) {
      const dateObj = new Date(date);
      const time = dateObj.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
      let weatherClass = "sunny";
      if (weather === "Rainy") {
        weatherClass = "rainy";
      } else if (weather === "Partly Cloudy") {
        weatherClass = "partly-cloudy";
      } else if (weather === "Cloudy") {
        weatherClass = "cloudy";
      }
      return (
        <div className="weather-card" key={date + location}>
          <div className="weather-datetime">{time}</div>
          <div
            className={"weather-forecast " + weatherClass}
            title={weather}
          ></div>
          <div className="weather-text">{weather}</div>
        </div>
      );
    }
    return <div></div>;
  }
}

export default WeatherCard;
