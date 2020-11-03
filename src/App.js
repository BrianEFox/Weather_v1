import React, { Component } from "react";
import EditableSection from "./EditableSection";
import WeatherCard from "./WeatherCard";
import "./styles/App.css";

const DATA_FILE = 'test-data.json';
const LABEL_ALL_LOCATIONS = 'All Locations';
const LABEL_NO_DATA = 'No weather info';
const WARNING_BAD_DATA = 'Warning: some weather data could not be loaded. Please check: ' + DATA_FILE + '.';
const ERROR_INVALID_DATE = 'The End Date cannot be earlier than the Start Date.';
const ERROR_INVALID_DATA_FILE = 'Error: There was a problem loading the weather data. Please check: ' + DATA_FILE + '.';
const DEBUG = true;

class App extends Component {
  constructor() {
    super();
    this.state = {
      // Pre-processed data from input file
      locationDateToWeatherDataMap: new Map(),
      availableLocations: [],
      // User-input values
      startDate: null,
      endDate: null,
      location: '',
      // Computed display values
      displayDays: [],
      displayLocations: [],
      filteredLocationDateToWeatherDataMap: new Map(),
      warningMessage: null,
      errorMessage: null,
    }

    this.loadInputData();
  }

  loadInputData() {
    fetch(DATA_FILE)
    .then(response => response.text())
    .then(data => {
      const weatherData = JSON.parse(data)
      const locations = [LABEL_ALL_LOCATIONS];
      const locationDateToWeatherDataMap = new Map();
      let warningsFound = false;
      weatherData.forEach((item) => {
        // Slot all of the weather data into location + day buckets for faster searching and easier day-handling
        const date = new Date(item.date);
        if (!isNaN(date.getTime()) && item.town && item.weather) {
          const locationDateKey = this.getLocationDateKey(item.town, date);
          let weatherData = locationDateToWeatherDataMap.get(locationDateKey);
          if (!weatherData) {
            weatherData = [];
            locationDateToWeatherDataMap.set(locationDateKey, weatherData);
          }
          weatherData.push(
            {
              "date": date,
              "location": item.town,
              "weather": item.weather
            }
          );

          if (!locations.includes(item.town)) {
            locations.push(item.town);
          }
        } else {
          warningsFound = true;
          if (DEBUG) {
            console.log('Bad data: ', JSON.stringify(item));
          }
        }
      });

      const warningMessage = warningsFound && locationDateToWeatherDataMap.size > 0 ? WARNING_BAD_DATA : null;
console.log('warningMessage=', warningMessage);
console.log('warningsFound=', warningsFound);
console.log('locationDateToWeatherDataMap.size=', locationDateToWeatherDataMap.size);

      const errorMessage = locationDateToWeatherDataMap.size === 0 ? ERROR_INVALID_DATA_FILE : null;
      this.setState({
        availableLocations: locations,
        locationDateToWeatherDataMap,
        warningMessage,
        errorMessage,
      });
    })
    .catch(error => {
      if (DEBUG) {
        console.log(error)
      }
      this.setState({
        errorMessage: ERROR_INVALID_DATA_FILE
      });
    });
  }

  getLocationDateKey(location, date) {
    const dateKey = date.toLocaleDateString([], {day: '2-digit', month:'2-digit', year: 'numeric'});
    return location + '_' + dateKey;
  }

  handleStartDateChange = date => {
    this.setState({
      startDate: date
    }, this.showWeatherIfInputComplete);
  }

  handleEndDateChange = date => {
    this.setState({
      endDate: date
    }, this.showWeatherIfInputComplete);
  }

  handleLocationChange = event => {
    let displayLocations = [event.target.value];
    if (event.target.value === LABEL_ALL_LOCATIONS) {
      displayLocations = this.state.availableLocations.slice(1);
    }
    this.setState({
      location: event.target.value,
      displayLocations,
    }, this.showWeatherIfInputComplete);    
  }

  showWeatherIfInputComplete() {
    if (this.state.startDate && this.state.endDate && this.state.location) {
      if (this.state.endDate.getTime() < this.state.startDate.getTime()) {
        this.setState({
          errorMessage: ERROR_INVALID_DATE
        });
        return;
      }

      let days = [];
      let startDay = new Date(this.state.startDate.toDateString());
      let endDay = new Date(this.state.endDate.toDateString());
      let filteredLocationDateToWeatherDataMap = new Map();

      for (let day = startDay; day.getTime() <= endDay.getTime(); day.setDate(day.getDate() + 1)) {
        days.push(new Date(day));
        // Won't need to filter any days in between start and end days
        const shouldFilterByTime = day.getTime() === startDay.getTime() || day.getTime() === endDay.getTime();
        if (this.state.location === LABEL_ALL_LOCATIONS) {
          this.state.displayLocations.forEach((location) => {
            let locationDateKey = this.getLocationDateKey(location, day);
            if (shouldFilterByTime) {
              const filteredData = this.filterDataByLocationDateKey(locationDateKey);
              filteredLocationDateToWeatherDataMap.set(locationDateKey, filteredData);
            } else {
              filteredLocationDateToWeatherDataMap.set(locationDateKey, this.state.locationDateToWeatherDataMap.get(locationDateKey));
            }
          });
        } else {
          let locationDateKey = this.getLocationDateKey(this.state.location, day);
          if (shouldFilterByTime) {
            const filteredData = this.filterDataByLocationDateKey(locationDateKey);
            filteredLocationDateToWeatherDataMap.set(locationDateKey, filteredData);
          } else {
            filteredLocationDateToWeatherDataMap.set(locationDateKey, this.state.locationDateToWeatherDataMap.get(locationDateKey));
          }
        }
      }

      this.setState({
        displayDays: days,
        filteredLocationDateToWeatherDataMap,
        errorMessage: null,
      });
    }
  }

  filterDataByLocationDateKey(locationDateKey) {
    const unfilteredData = this.state.locationDateToWeatherDataMap.get(locationDateKey);
    return !unfilteredData ? null : unfilteredData.filter(item => {
      const itemTime = new Date(item.date).getTime();
      return (!isNaN(itemTime) && itemTime >= this.state.startDate.getTime() && itemTime <= this.state.endDate.getTime());
    });
  }

  render() {
    return (
      <div className="App">
        <EditableSection
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          location={this.state.location}
          locations={this.state.availableLocations}
          onStartDateChange={this.handleStartDateChange}
          onEndDateChange={this.handleEndDateChange}
          onLocationChange={this.handleLocationChange}
        />
        {this.state.warningMessage && <h5 className="warning">{this.state.warningMessage}</h5>}
        {this.state.errorMessage && <h4 className="error">{this.state.errorMessage}</h4>}
        <div className="editable-section">
          {!this.state.errorMessage && this.state.startDate && this.state.endDate &&
            <table>
              <thead>
                <tr>
                  {this.state.startDate && this.state.endDate && this.state.displayLocations.map((location) => (
                    <th key={location}>{location}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {this.state.displayDays.map((day) => (
                  <React.Fragment key={day.toDateString()}>
                    <tr>
                      <td align="left" className="day-row" colSpan={this.state.displayLocations.length}>
                        {day.toLocaleDateString([], {weekday: 'long', day: '2-digit', month:'short', year: 'numeric'})}
                      </td>
                    </tr>
                    <tr>
                      {this.state.displayLocations.map((location) => {
                        const locationDateKey = this.getLocationDateKey(location, day);
                        const weatherData = this.state.filteredLocationDateToWeatherDataMap.get(locationDateKey);
                        return <td key={locationDateKey} align="center"> 
                          {weatherData
                            ? weatherData.map((item) => (
                                <WeatherCard
                                  key={item.date + item.location}
                                  date={item.date}
                                  weather={item.weather}
                                  location={item.location}
                                />
                              ))
                            : <label className="no-data" key={locationDateKey}>{LABEL_NO_DATA}</label>
                          }
                        </td>
                      })}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          }
        </div>
      </div>
    );
  }
}

export default App;
