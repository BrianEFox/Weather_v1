import React, { Component } from "react";
import "./styles/SelectField.css";

class SelectField extends Component {
  buildOptions() {
    const options = [];
    options.push(<option className="hidden" key={-1} value='' disabled>{'-- select --'}</option>);
    for (const [index, value] of this.props.options.entries()) {
      options.push(<option key={index} value={value}>{value}</option>);
    }
    return options;
  }

  render() {    
    return (
      <div className="inputWrapper">
        <p>{this.props.title}</p>
        <select
          className="selectField"
          onChange={this.props.onChange}
          value={this.props.value}
        >
          {this.buildOptions()}
        </select>
      </div>
    );
  }
}

export default SelectField;
