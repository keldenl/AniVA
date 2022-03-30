import React, { Component } from "react";

import { Link } from "react-router-dom";

import * as api from "./utils/api";

import logo from './img/logo.png';
import loadingImg from './img/loading.gif';

import "./styles/App.css";

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      activeSuggestion: 0, // The active selection's index
      suggestionList: [],
      showSuggestions: false,
      userInput: "",
      scrollDownwards: true,
    };
    this.timer = null;
    // this.returnString = "";
    // this.allPage = 1;
  }

  handleCheck = () => {
    // Clears running timer and starts a new one each time the user types
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.searchCharacter();
    }, 1000);
  };

  onChange = (e) => {
    this.setState({
      userInput: e.currentTarget.value,
      isLoaded: false,
    });
  };

  _handleKeyDown = (e) => {
    if (e.key === "Enter" && this.state.isLoaded) {
      this.onClick(this.state.suggestionList[this.state.activeSuggestion]);
    } else if (e.keyCode === 38) {
      // Up arrow
      e.preventDefault();
      if (this.state.activeSuggestion === 0) {
        return;
      }
      this.setState({
        activeSuggestion: this.state.activeSuggestion - 1,
        scrollDownwards: false,
      });
    } else if (e.keyCode === 40) {
      // Down arrow
      e.preventDefault();
      if (this.state.activeSuggestion < this.state.suggestionList.length - 1) {
        this.setState({
          activeSuggestion: this.state.activeSuggestion + 1,
          scrollDownwards: true,
        });
      }
    }
  };

  onClick = (c) => {
    //console.log(c);
    this.setState({ characterId: c.id, characterName: c.name });
    this.findVA(c.id);
  };

  // // For testing purposes only
  // getAllVA = (pageNum) => {
  //     var variables = {
  //         page: pageNum
  //     };

  //     var query = api.ALL_VA_QUERY;
  //     var [url, options] = api.prepareFetch(query, variables);

  //     fetch(url, options).then(api.handleResponse)
  //                         .then(this.handleAllVAData)
  //                         .catch(this.handleError);
  // }

  // handleAllVAData = (data) => {
  //     console.log(data.data.Page.staff);
  //     for (var d of data.data.Page.staff) {
  //         if (d.characters.edges.length > 0) {
  //             console.log(d.favourites)
  //             this.returnString += `"/va/${d.id}",`
  //         } else {
  //             console.log(d.id + " is not a voice actor")
  //         }
  //     }
  //     console.log(this.returnString);

  //     this.allPage++;
  //     if (this.allPage <= 100) {
  //         this.getAllVA(this.allPage);
  //     }
  // }

  searchCharacter = () => {
    var charName = this.state.userInput;
    if (charName.trim() == "") {
      this.setState({ suggestionList: [] });
    } else {
      this.setState({ isLoaded: false, hasConflict: false, conflictList: [] });

      var variables = {
        search: charName,
        page: 1,
        perPage: 20,
      };

      var query = api.CHARACTER_QUERY;
      var [url, options] = api.prepareFetch(query, variables);

      fetch(url, options)
        .then(api.handleResponse)
        .then(this.handleCharacterData)
        .catch(this.handleError);
    }
  };

  findVA(charId) {
    var variables = { id: charId };
    var query = api.VA_QUERY;
    var [url, options] = api.prepareFetch(query, variables);

    fetch(url, options)
      .then(api.handleResponse)
      .then(this.handleVAData)
      .catch(api.handleError);
  }

  handleError = (error) => {
    console.error(error);
    this.setState({ suggestionList: [], activeSuggestion: 0, isLoaded: true });
  };

  handleCharacterData = (data) => {
    if (data.data.Page) {
      var updatedList = data.data.Page.characters.filter((c) => {
        return c.media.nodes.length > 0;
      });
      this.setState({
        suggestionList: updatedList,
        activeSuggestion: 0,
        isLoaded: true,
      });
    } else {
      this.setState({
        suggestionList: [],
        activeSuggestion: 0,
        isLoaded: true,
      });
    }
  };

  handleVAData = (data) => {
    var vas = [];
    var vaList = data.data.Character.media.edges;
    var success = 0; // Need at least 1 valid voice actor

    for (var e of vaList) {
      var currVA = e.voiceActors[0];
      if (currVA && !vas.some((e) => e.id === currVA.id)) {
        success++;
        vas.push({
          id: currVA.id,
          name: currVA.name.full,
          image: e.node.coverImage.large,
          media: [e.node.title.romaji],
        });
      } else if (currVA) {
        success++;
        var va = vas.filter((e) => {
          return e.id === currVA.id;
        });
        va[0].media.push(e.node.title.romaji);
      }
    }

    if (success > 0) {
      if (vas.length > 1) {
        this.props.onReturnVA(true, [vas, data.data.Character.name.full]);
      } else {
        this.props.onReturnVA(false, vas[0].id);
      }
    } else {
      alert(
        `ERROR: ${data.data.Character.name.full} isn't voiced in Japanese. Please try again with another character.\nAniVA plans to add non-japanese voice actors in the near future.`
      );
    }
  };

  // componentDidMount() {
  //     this.getAllVA(this.allPage);
  // }

  componentWillUpdate(prevProps, prevState) {
    if (prevState.userInput !== this.state.userInput) {
      this.handleCheck();
    }
  }

  componentDidUpdate() {
    if (this.props.home && this.searchInput) {
      this.searchInput.focus();
    } else if (this.props.conflict) {
      this.searchInput.blur();
    }

    let el = document.querySelector(".suggestion-active");

    if (el) {
      // Check if the new active element is visible or not
      var rect = el.getBoundingClientRect();
      var elemTop = rect.top;
      var elemBottom = rect.bottom;

      var container = el.parentElement.getBoundingClientRect();
      var containerTop = container.top;
      var containerBottom = container.bottom;

      var isVisible = elemTop >= containerTop && elemBottom <= containerBottom;
      if (!isVisible) {
        el.scrollIntoView(!this.state.scrollDownwards);
      }
    }
  }

  render() {
    // All Autocomplete code
    if (this.state.showSuggestions && this.state.userInput) {
      if (this.state.suggestionList.length && this.state.isLoaded) {
        var suggestionsListComponent = (
          <ul className="suggestions">
            {this.state.suggestionList.map((suggestion, index) => {
              let className;
              let media = suggestion.media.nodes[0];
              let mediaYear = media.seasonYear ? `(${media.seasonYear})` : "";

              // Flag the active suggestion with a class
              if (index === this.state.activeSuggestion) {
                className = "suggestion-active";
              }

              return (
                <li
                  className={className}
                  key={suggestion.id}
                  onMouseDown={() => this.onClick(suggestion)}
                >
                  <div
                    className="suggestion-img"
                    style={{
                      backgroundImage: `url(${suggestion.image.medium})`,
                    }}
                  />
                  <div className="suggestion-info">
                    <p className="suggestion-title">{suggestion.name.full}</p>
                    <p>
                      {media.title.romaji} {mediaYear}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        );
      } else {
        let loading = (
          <span>
            <em> Looking for that character...</em>
            <img className="loading-image" src={loadingImg} />
          </span>
        );
        var suggestionsListComponent = (
          <div className="no-suggestions">
            {this.state.isLoaded ? "No character found" : loading}
          </div>
        );
      }
    }

    return (
      <div className={`header ${this.props.home} ${this.props.conflict}`}>
        {/* <h2 className="logo">animeVA</h2> */}
        <Link to="/" onClick={this.props.onReset}>
          <img className="logo" src={logo} />
        </Link>
        <div className="sublogo">
          Created by{" "}
          <a target="_blank" href="http://keldenl.com">
            Kelden
          </a>
          . Powered by{" "}
          <a target="_blank" href="http://anilist.co/">
            AniList
          </a>
          .
        </div>
        <span className="search">
          <input
            id="queryBox"
            placeholder="Search Anime Character (e.g. Goku Son)"
            autoComplete="off"
            type="text"
            onFocus={() => this.setState({ showSuggestions: true })}
            onBlur={() => this.setState({ showSuggestions: false })}
            onChange={this.onChange}
            onKeyDown={this._handleKeyDown}
            ref={(input) => (this.searchInput = input)}
          ></input>
          {suggestionsListComponent}
        </span>
      </div>
    );
  }
}
