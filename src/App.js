import React, { Component } from 'react';
import { Redirect } from 'react-router';

import Header from './Header';
import Conflict from './Conflict';

import './styles/App.css';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bgImg: "",
      isHome: true,
      isLoaded: false,
      hasConflict: false,
      conflictList: [],
      characterId: -1,
      characterName: "",
      vaId: -1
    }
  }

  componentDidMount() {
    this.updateBgImg();
  }
  
  updateBgImg = () => {
    const randNum = (Math.floor(Math.random() * 75));
    this.setState({ bgImg: require(`./img/${randNum}-alt.png`)});

    var image = new Image();
    image.onload = (() => this.setState({ bgImg: require(`./img/${randNum}.png`)}));
    image.src = require(`./img/${randNum}.png`);
  }

  onConflictClick = (vaId) => { this.setState({ vaId: vaId, isLoaded: true }); }

  onVALoaded = (conflict, data) => {
    if (!conflict) { this.setState({ vaId: data, isLoaded: true }); }
    else {
      this.setState({
        isHome: false,
        hasConflict: true,
        conflictList: data[0],
        characterName: data[1]
      });
    }
  }

  resetHome = () => { 
    if (this.state.isHome) { this.updateBgImg() }
    else { window.location.reload() }
  }

  render() {
    // console.log("rerender")
    // console.log(this.state);

    var conflict = (this.state.hasConflict) && <Conflict onClick={this.onConflictClick} data={this.state.conflictList} character={this.state.characterName}/>;

    var homeClass = this.state.isHome ? "home" : "";
    var conflictClass = this.state.hasConflict ? "conflict" : "";

    if (this.state.isLoaded) { return <Redirect push to={`/va/${this.state.vaId}`} />; }

    // Background image loading
    if (this.state.isHome) {

       //   if (!src) return null;
      //   return <img className="hero" alt={props.alt} src={src} />;
      // };
      // const bgImg = require('./img/' + (Math.floor(Math.random() * 75)) + '.png');
      document.querySelector('body').style.backgroundImage = `url(${this.state.bgImg})`;
    } else {
      document.querySelector('body').style.backgroundImage = "";
    }

    return (
      <div className={`app ${homeClass}`}>
        <Header home={homeClass} conflict={conflictClass} onReturnVA={this.onVALoaded} onReset={this.resetHome}/>
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

const HeroImage = props => {
  const src = useProgressiveImage({ 
    src: props.src,
    fallbackSrc: props.fallbackSrc 
  });
  console.log(src);
  if (!src) return null;
  return <img className="hero" alt={props.alt} src={src} />;
};

function reducer(currentSrc, action) {
  if (action.type === 'main image loaded') {
    return action.src;
  } 
  if (!currentSrc) {
    return action.src;
  }
  return currentSrc;
}

function useProgressiveImage({ src, fallbackSrc }) {
  // const [currentSrc, dispatch] = React.useReducer(reducer, null);
  // React.useEffect(() => {
    const mainImage = new Image();
    const fallbackImage = new Image();

    var loaded = false;

    mainImage.onload = () => {
      dispatch({ type: 'main image loaded', src });
      mainImage.src = src;

      loaded = true;
    };
    fallbackImage.onload = () => {
      dispatch({ type: 'fallback image loaded', src: fallbackSrc });
      fallbackImage.src = fallbackSrc;
      console.log("fallback loaded")
      return fallbackImage;
    };

  // }, [src, fallbackSrc];

  return (loaded) ? mainImage : fallbackImage;
}