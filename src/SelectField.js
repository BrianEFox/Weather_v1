import React, { Component } from "react";
import "./styles/SelectField.css";

class SelectField extends Component {
  render() {    
    return (
      <div className="inputWrapper">
        <p>{this.props.title}</p>
        <select
          className="selectField"
          onChange={this.props.onChange}
          value={this.props.value}
        >
          <option className="hidden" key={'select'} value='' disabled>{'-- select --'}</option>
          {this.props.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))};
        </select>
      </div>
    );
  }
}

export default SelectField;
