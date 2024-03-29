import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";

import * as api from './utils/api';
import Header from './Header';
import Conflict from './Conflict';
import logo from './img/logo.png';

import './styles/App.css';

function importAll(r) {
  let images = {};
  r.keys().map((item) => { images[item.replace('./', '')] = r(item); });
  return images;
}

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
      vaId: -1,
      funFactData: {},
      images: []
    }
  }

  componentDidMount() {
    this.setState({ images: importAll(require.context('./img/', false, /\.(png|jpe?g|svg)$/)) }, this.updateBgImg);
    this.findFunFact();
  }

  updateBgImg = () => {
    if (this.state.bgLoaded && this.state.images) {
      const randNum = (Math.floor(Math.random() * 75));
      const imgAlt = this.state.images[`${randNum}-alt.png`].default;
      const imgDef = this.state.images[`${randNum}.png`].default;
      this.setState({
        bgImg: imgAlt, bgLoaded: false
      });
      let homeBg = document.getElementsByClassName('home-bg')[0];
      homeBg.style.filter = 'blur(25px)';

      var image = new Image();
      image.onload = (() => {
        this.setState({ bgImg: imgDef, bgLoaded: true });
        homeBg.style.filter = 'none';
      });
      image.src = imgDef;
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
    if (this.state.isHome) { this.updateBgImg(); this.findFunFact(); }
    else { window.location.reload(); }
  }

  findFunFact = () => {
    this.setState({ funFactData: {} });
    var variables = {};
    var query = api.FUN_FACT_QUERY;
    var [url, options] = api.prepareFetch(query, variables);

    fetch(url, options).then(api.handleResponse)
      .then(this.handleFactData)
      .catch(api.handleError);
  }

  handleFactData = (data) => {
    var randNum = (Math.floor(Math.random() * 30));
    var randVA = data.data.Page.staff[randNum];
    while (randVA.characters.nodes.length < 2) {
      randNum = (Math.floor(Math.random() * 30));
      randVA = data.data.Page.staff[randNum];
    }

    const randCharOne = (Math.floor(Math.random() * (randVA.characters.nodes.length)));
    var randCharTwo = (Math.floor(Math.random() * (randVA.characters.nodes.length)));
    while (randCharTwo === randCharOne) {
      randCharTwo = (Math.floor(Math.random() * (randVA.characters.nodes.length)));
    }

    const charOne = randVA.characters.nodes[randCharOne];
    const charTwo = randVA.characters.nodes[randCharTwo];

    const fact = `${randVA.name.full} voiced both ${charOne.name.full} from ${charOne.media.nodes[0].title.romaji} and ${charTwo.name.full} from ${charTwo.media.nodes[0].title.romaji}?`;

    const factData = {
      text: fact,
      id: randVA.id,
    }

    this.setState({ funFactData: factData })
  }

  render() {
    var conflict = (this.state.hasConflict) && <Conflict onClick={this.onConflictClick} data={this.state.conflictList} character={this.state.characterName} />;

    var homeClass = this.state.isHome ? "home" : "";
    var conflictClass = this.state.hasConflict ? "conflict" : "";

    if (this.state.isLoaded) { return <Redirect push to={`/va/${this.state.vaId}`} />; }
    if (this.state.isHome) {
      document.querySelector('body').style.background = "none";
      document.getElementById('root').style.backgroundColor = "rgba(0,0,0,0.6)";
    }


    // Background image loading
    let homeBg = document.getElementsByClassName('home-bg')[0];
    if (homeBg) {
      if (this.state.isHome) {
        homeBg.style.backgroundImage = `url(${this.state.bgImg})`;
        document.getElementById('root').style.backgroundColor = "rgba(0,0,0,0.6)";
      } else {
        homeBg.style.backgroundImage = "";
        document.getElementById('root').style.backgroundColor = "rgba(0,0,0,0)";
      }
    }

    // Helmet variables
    let url = "https://animeva.moe/";
    let title = "animeVA.moe - Anime Voice Actor Database";
    let description = "Find and discover anime character voice actors with animeVA, the world'&#039;'s smartest and most intuitive anime voice actor database yet. You'll be shocked when you realize your favorite characters are voiced by the same person!";

    return (
      <div className="app-container">
        <Helmet>
          {/* General tags */}
          <title>{title}</title>
          <meta name="description" content={description} />
          {/* OpenGraph tags */}
          <meta name="og:url" content={url} />
          <meta name="og:title" content={title} />
          <meta name="og:description" content={description} />
          <meta name="og:image" content={logo} />
          <meta name="og:type" content="website" />
          {/* Twitter Card tags */}
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={logo} />
          <meta name="twitter:card" content="summary" />
        </Helmet>

        <div className="home-bg"></div>
        <div className={`app ${homeClass}`}>
          <Header home={homeClass} conflict={conflictClass} onReturnVA={this.onVALoaded} onReset={this.resetHome} />
          <Link to={`/va/${this.state.funFactData.id}`}>
            {this.state.isHome &&
              <div className="fun-fact-container">
                <h3> Did you know that...</h3>
                <p>{Object.keys(this.state.funFactData).length > 0 ? this.state.funFactData.text : <i>This fact is gonna blow your mind!</i>}</p>
              </div>
            }
          </Link>
          {conflict}
        </div>
      </div>
    );
  }
}