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
      bgLoaded: true,
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
    if (this.state.bgLoaded) {
      const randNum = (Math.floor(Math.random() * 75));
      this.setState({ bgImg: require(`./img/${randNum}-alt.png`), bgLoaded: false});
      let homeBg = document.getElementsByClassName('home-bg')[0];
      homeBg.style.filter = 'blur(25px)';
  
      var image = new Image();
      image.onload = (() => { 
        this.setState({ bgImg: require(`./img/${randNum}.png`), bgLoaded: true});
        homeBg.style.filter = 'none';
      });
      image.src = require(`./img/${randNum}.png`);
    }
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
    let homeBg = document.getElementsByClassName('home-bg')[0];
    if (homeBg) {
      if (this.state.isHome) {
        homeBg.style.backgroundImage = `url(${this.state.bgImg})`;
      } else {
        homeBg.style.backgroundImage = "";
      }
    }



    return (
      <div className="app-container">
        <div className="home-bg"></div>
        <div className={`app ${homeClass}`}>
          <Header home={homeClass} conflict={conflictClass} onReturnVA={this.onVALoaded} onReset={this.resetHome}/>
          { conflict }
        </div>
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