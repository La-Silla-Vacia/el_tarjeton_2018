import React, { Component } from 'react';
import Select from '../Select';
import s from './Filters.css';

export default class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: [],
      nameValue: ''
    }
  }

  handleFilterChange = (column, niceName, choice) => {
    const { onFilterUpdate, filter } = this.props;
    let found = false;

    for (let i = 0; i < filter.length; i += 1) {
      const filterItem = filter[i];
      if (filterItem.column === column) {
        found = true;
        filterItem.which = choice;
      }
    }

    if (!found) {
      filter.push({
        column: column,
        columnNiceName: niceName,
        which: choice
      });
    }

    if (onFilterUpdate) onFilterUpdate(filter);
  };

  isFilterWorthIt(column, value) {
    // Get the data from the attribute
    const { data, filter } = this.props;

    // Loop through the data
    const people = data.map(item => {
        const { nombres } = item;

        for (let i = 0; i < filter.length; i += 1) {
          const filterItem = filter[i];
          if (filterItem.which === null) continue;
          if (item[filterItem.column] !== filterItem.which) return;
        }

        if (item[column] !== value) return;

        return nombres;
      }
    );
    return people.clean(undefined).length;
  }

  generateOptions(column) {
    const { data } = this.props;

    const array = [];
    const items = data.map((item) => {
      if (item[column] === '') return;

      for (let i = 0; i < array.length; i += 1) {
        if (array[i] === item[column]) return;
      }

      // if (!this.isFilterWorthIt(column, item[column])) return;

      array.push(item[column]);
      return {
        label: item[column],
        value: item[column]
      };
    });

    items.unshift({ label: "Todos", value: null });
    return items.clean(undefined);
  }

  getSelects() {
    const items = tarjetones_2018_data.filters;
    if (!items) return;
    return items.map((item) => {
      if (item.hasOwnProperty("only")) return;

      return (
        <Select
          key={item.title}
          title={item.title}
          options={this.generateOptions(item.column)}
          callback={this.handleFilterChange.bind(this, item.column, item.title)}
        />
      );
    });
  }

  handleFormInput = event => {
    const val = event.target.value;
    this.setState({ nameValue: val });
    if (this.props.onNameUpdate) this.props.onNameUpdate(val);
  };

  render() {
    const selects = this.getSelects();
    return (
      <div className={s.root}>
        <div className={s.selects}>
          {selects}
        </div>

        {this.props.filter.map(item => {
          if (!item.which || !item.columnNiceName) return;
          return (
            <button title={`Eliminar filtro ${item.columnNiceName}`} className={s.activeFilter} key={item.column}
                    onClick={this.handleFilterChange.bind(this, item.column, item.columnNiceName, null)}>
              <span className={s.title}>{item.columnNiceName}</span>
              <span>{item.which}</span>
              <div className={s.cross} />
            </button>
          )
        })}
      </div>
    )
  }
}