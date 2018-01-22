import React, { Component } from 'react';
import cN from 'classnames';
import Filters from '../../../../elections_2018/shared/Components/Filters';
import Popup from "../Popup";
import s from './Graphic.css';
import Row from "../Row";

export default class Graphic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: [],
      nameFilter: '',
      show: 9,
      availableItems: 0,
      items: [],
      camara: null,
      popupItem: 0,
      popupOpen: false,
      nameItem: 0,
      nameOpen: false,
      nameMounted: false
    };

    this.numberOfRows = 20;
    this.numberOfColumns = 20;

    this.items = [];
  }

  partidos = ['Afros', 'Indígenas', 'Farc', 'Opción Ciudadana', 'Polo', 'Coalición Colombia', 'Alianza Verde', 'Lista De La Decencia', 'Liberal', 'La U', 'Cambio Radical', 'Mira', 'Conservador', 'Centro Democrático', 'Otros'];

  componentWillMount() {
    const { data } = this.props;

    this.items = data.sort(function (a, b) {
      let keyA = a.posicionIz_der1A100 || 50,
        keyB = b.posicionIz_der1A100 || 50;
      // Compare the 2 dates
      keyA = (typeof keyA === 'string' || !keyA) ? 50 : keyA;
      keyB = (typeof keyB === 'string' || !keyB) ? 50 : keyB;
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });

    this.setPositions();

    window.addEventListener('resize', this.setPositions);
  }

  setPositions = () => {
    const { width } = this.props;
    this.numberOfColumns = Math.round(width / 25);
    this.numberOfRows = Math.round(this.items.length / this.numberOfColumns);
    this.size = 25;
    let x = 0, y = -this.size;
    let rowIndex = -1;

    this.items = this.items.map((item) => {
      if (rowIndex >= this.numberOfRows) {
        y = 0;
        x += this.size;
        rowIndex = 0;
      } else {
        y += this.size;
        rowIndex += 1;
      }
      item.x = x;
      item.y = y;
      return item;
    });
  };

  componentDidMount() {
    this.filterItems(this.state.filter);
  }

  getPeople() {
    // Get the data from the attribute
    const { items } = this.state;

    // Loop through the data
    return items
      .map((item, index) => {

        return (
          <Row
            key={item.id}
            {...item}
            showName={this.handleNameShow.bind(false, index)}
            hideName={this.handleHideName}
            onClick={this.handlePersonClick.bind(false, index)}
          />
        )
      });
  }

  filterItems(filter) {
    const items = this.items.map((item) => {
      item.hidden = false;

      for (let j = 0; j < filter.length; j += 1) {
        const filterItem = filter[j];
        if (!filterItem) continue;
        if (filterItem.which === null) continue;
        if (item[filterItem.column] !== filterItem.which) {
          item.hidden = true;
        }
      }

      const customFilters = tarjetones_2018_data.filters;
      if (typeof customFilters) {
        for (let j = 0; j < customFilters.length; j += 1) {
          const filterItem = customFilters[j];
          if (!filterItem) continue;
          if (!filterItem.hasOwnProperty("only")) continue;

          if (typeof filterItem.only === 'object') {
            if (filterItem.only.indexOf(item[filterItem.column]) === -1) return;
          } else {
            if (item[filterItem.column] !== filterItem.only) return;
          }
        }
      }
      return item;
    });

    this.setState({ items: items.clean(undefined), filter, availableItems: items.clean(undefined).length });
  }

  handleFilterUpdate = newFilters => {
    this.filterItems(newFilters);
  };

  handleNameUpdate = newName => {
    this.setState({ nameFilter: newName });
  };

  handleCameraChange = camara => {
    const filter = this.state.filter;
    let found = false;

    for (let i = 0; i < filter.length; i += 1) {
      const filterItem = filter[i];
      if (filterItem.column === 'camara') {
        found = true;
        filterItem.which = camara;
      }
    }

    if (!found) {
      filter.push({
        column: "camara",
        which: camara
      });
    }
    this.setState({ camara });
    this.filterItems(filter);
  };

  handlePersonClick = index => {
    if (this.state.popupOpen) return;
    this.setState({ popupOpen: true, popupItem: index });
  };

  handleClosePopup = () => {
    this.setState({ popupOpen: false });
  };

  handleNameShow = index => {
    this.setState({ nameOpen: true, nameItem: index });
    setTimeout(() => {
      this.setState({ nameMounted: true })
    }, 30)
  };

  handleHideName = () => {
    this.setState({ nameMounted: false });
    setTimeout(() => {
      this.setState({ nameOpen: false });
    }, 200)
  };

  render() {
    const { camara, popupOpen, popupItem, nameOpen, nameItem, nameMounted } = this.state;
    const { data } = this.props;
    const people = this.getPeople();
    return (
      <div className={s.root}>
        <header className={s.buttons}>
          <button className={cN(s.btn, { [s.btnActive]: !camara })}
                  onClick={this.handleCameraChange.bind(false, null)}>
            Congreso
          </button>
          <button className={cN(s.btn, { [s.btnActive]: camara === 'Cámara' })}
                  onClick={this.handleCameraChange.bind(false, 'Cámara')}>
            Cámara
          </button>
          <button className={cN(s.btn, { [s.btnActive]: camara === 'Senado' })}
                  onClick={this.handleCameraChange.bind(false, 'Senado')}>
            Senado
          </button>
        </header>
        <Filters
          data={data}
          filter={this.state.filter}
          onFilterUpdate={this.handleFilterUpdate}
          onNameUpdate={this.handleNameUpdate}
        />

        <div className={s.inner}>
          <svg className={s.items} width={this.numberOfColumns * this.size}
               height={(this.numberOfRows + 1) * this.size}>
            {people}
          </svg>

          {nameOpen ?
            <div className={cN(s.name, { [s.mounted]: nameMounted })}
                 style={{ top: `${this.items[nameItem].y}px`, left: `${this.items[nameItem].x}px` }}>
              <div className={s.photo} style={{ backgroundImage: `url(${this.items[nameItem].foto})` }} />
              <div className={s.nameBox}>
                <h4>{this.items[nameItem].name}</h4>
                <span>{this.items[nameItem].partido}</span>
              </div>
            </div>

            : undefined}
        </div>

        {popupOpen ?
          <Popup {...data[popupItem]} close={this.handleClosePopup} />
          : undefined}

        <div className={s.izqDer} style={{ width: `${(this.numberOfColumns - 1) * this.size}px` }}>
          <div className={s.izqDerInner} />
          <div className={s.izqDer__text}>
            <span>Izq</span>
            <span>Derecha</span>
          </div>
        </div>

        <div className={s.legenda}>
          <ul className={s.list}>
            {this.partidos.map((partido) => {
              return (
                <li className={s.item}>
                  <div className={s.circle} data-partido={partido} />
                  {partido}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    )
  }
}