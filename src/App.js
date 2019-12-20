import React, { Component } from 'react';
import { Redirect } from 'react-router';

import Header from './Header';
import Conflict from './Conflict';

import './styles/App.css';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHome: true,
      isLoaded: false,
      hasConflict: false,
      conflictList: [],
      characterId: -1,
      characterName: "",
      vaId: -1
    }
  }

  onConflictClick = (vaId) => { this.setState({ vaId: vaId, isLoaded: true }); }

  onVALoaded = (conflict, data) => {
    if (!conflict) { this.setState({ vaId: data, isLoaded: true }) }
    else {
      this.setState({
        isHome: false,
        hasConflict: true,
        conflictList: data[0],
        characterName: data[1]
      })
    }
  }

  render() {
    var conflict = (this.state.hasConflict) && <Conflict onClick={this.onConflictClick} data={this.state.conflictList} character={this.state.characterName}/>;

    var homeClass = this.state.isHome ? "home" : "";
    var conflictClass = this.state.hasConflict ? "conflict" : "";

    if (this.state.isLoaded) { return <Redirect push to={`/va/${this.state.vaId}`} />; }

    return (
      <div className={`app ${homeClass}`}>
        <Header home={homeClass} conflict={conflictClass} onReturnVA={this.onVALoaded}/>
        { conflict }
        {/* <p className="App-intro">
          Character ID is {this.state.characterId} <br/>
          Voice Actor ID is {this.state.vaId}
        </p>
        <hr/> */}
        {/* { entry } { conflict } */}
      </div>
    );
  }
}