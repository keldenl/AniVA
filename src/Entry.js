import React, { Component } from "react";
import { Redirect } from "react-router";
import { Helmet } from "react-helmet";

import * as api from "./utils/api";
import * as loader from "./utils/loader";
import * as sort from "./utils/sort";

import Header from "./Header";
import Conflict from "./Conflict";

import "./styles/Entry.css";

export class Entry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      bgImg: "",
      vaId: this.props.match.params.id,
      vaName: "",
      sortMethod: this.props.sort,
      entryData: {},
      characterList: [],
      roleCount: {},
      newSearch: false,
      hasConflict: false,
      characterName: "",
      conflictList: [],
    };
  }

  findEntry = (vaId) => {
    var variables = { id: vaId };
    var query = api.ENTRY_QUERY;
    var [url, options] = api.prepareFetch(query, variables);

    fetch(url, options)
      .then(api.handleResponse)
      .then(this.handleEntryData)
      .catch(api.handleError);
  };

  findAdditionalEntry(pageNum) {
    var variables = { id: this.state.vaId, page: pageNum };
    var query = api.ADDITIONAL_ENTRY_QUERY;
    var [url, options] = api.prepareFetch(query, variables);

    fetch(url, options)
      .then(api.handleResponse)
      .then(this.handleAdditionalEntryData)
      .catch(api.handleError);
  }

  handleEntryData = (data) => {
    const vaName = data.data.Staff.name;
    this.setState({
      isLoaded: false,
      entryData: data.data.Staff,
      characterList: data.data.Staff.characters.edges,
      vaName: `${vaName.first} ${vaName.last}`,
    });

    if (data.data.Staff.characters.pageInfo.hasNextPage) {
      this.findAdditionalEntry(
        data.data.Staff.characters.pageInfo.currentPage + 1
      );
    } else {
      this.finishLoad();
    }
  };

  handleAdditionalEntryData = (data) => {
    var updatedEntryData = this.state.entryData;
    for (var c of data.data.Staff.characters.edges) {
      updatedEntryData.characters.edges.push(c);
    }

    this.setState({
      entryData: updatedEntryData,
      characterList: updatedEntryData.characters.edges,
    });

    if (data.data.Staff.characters.pageInfo.hasNextPage) {
      this.findAdditionalEntry(
        data.data.Staff.characters.pageInfo.currentPage + 1
      );
    } else {
      this.finishLoad();
    }
  };

  finishLoad = () => {
    // count each role
    let roleCount = {
      total: 0,
      main: 0,
      supporting: 0,
    };
    this.state.characterList.map((character) =>
      character.role === "MAIN" ? roleCount.main++ : roleCount.supporting++
    );
    roleCount.total = roleCount.main + roleCount.supporting;
    this.sortCharacters("MAGIC");
    this.setState({ isLoaded: true, newSearch: false, roleCount });
  };

  sortCharacters = (SORT_METHOD) => {
    if (this.state.characterList.length > 1) {
      // When sorting by ROLE, also sort by POPULARITY of media
      if (SORT_METHOD == "ROLE") {
        this.sortCharacters("POPULARITY");
      }
      var sortedList = this.state.characterList.sort((a, b) => {
        switch (SORT_METHOD) {
          case "POPULARITY":
            return sort.sortPopularity(a, b);
          case "ROLE":
            return sort.sortRole(a, b);
          case "MAGIC":
            return sort.sortMagic(a, b);
        }
      });
      const mostPopularMedia = sortedList[0].media[0];
      const { coverImage, bannerImage } = mostPopularMedia;
      //   console.log(coverImage.extraLarge);
      //   console.log(bannerImage);
      this.setState({
        sortMethod: SORT_METHOD,
        characterList: sortedList,
        bgImg: bannerImage || coverImage.extraLarge,
      });
    } else {
      // No sort needed
      this.setState({ sortMethod: SORT_METHOD });
    }
  };

  /* Header Functions */
  onConflictClick = (vaId) => {
    this.setState({
      vaId: vaId,
      hasConflict: false,
      conflictList: [],
    });
  };

  onVALoaded = (conflict, data) => {
    if (!conflict) {
      if (data != this.state.vaId) {
        this.setState({
          vaId: data,
          hasConflict: false,
          conflictList: [],
        });
      } else {
        alert("That character is voiced by this person!");
      }
    } else {
      this.setState({
        hasConflict: true,
        conflictList: data[0],
        characterName: data[1],
      });
    }
  };

  componentDidMount() {
    this.findEntry(this.state.vaId);

    if (this.state.isLoaded) {
      this.sortCharacters("MAGIC");
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.vaId !== nextState.vaId) {
      this.setState({
        newSearch: true,
      });

      this.findEntry(nextState.vaId);
      if (this.state.isLoaded) {
        this.sortCharacters("MAGIC");
      }
    }
  }

  render() {
    // Remove root styles
    document.getElementById("root").style.backgroundColor = "transparent";

    var vaData = this.state.entryData;
    var va =
      this.state.isLoaded && !this.state.newSearch ? (
        <VAContainer data={vaData} stats={this.state.roleCount} />
      ) : (
        loader.VA_PROFILE
      );

    var characters = this.state.isLoaded
      ? this.state.characterList.map((char, i) => (
          <EntryCharacter key={i} data={char} />
        ))
      : loader.ENTRY_CHARACTER;

    var conflict = this.state.hasConflict && (
      <Conflict
        onClick={this.onConflictClick}
        data={this.state.conflictList}
        character={this.state.characterName}
      />
    );

    var conflictClass = this.state.hasConflict ? "conflict" : "";

    if (this.state.newSearch && this.state.isLoaded) {
      return <Redirect push to={`/va/${this.state.vaId}`} />;
    }

    // {this.state.isLoaded ? `${this.state.vaName} - `:''}
    // ${this.state.vaName}

    // Helmet variables
    const voiceActorName = this.state.entryData.name;
    let url = "https://animeva.moe/va/" + this.props.match.params.id;
    let title =
      (this.state.isLoaded
        ? `${voiceActorName.last}, ${voiceActorName.first} - `
        : "") + "animeVA.moe";
    let description = this.state.isLoaded
      ? `Learn what famous anime characters ${voiceActorName.first} ${voiceActorName.last} has voiced! animeVA is the world's smartest and most intuitive anime voice actor database yet. You'll be shocked when you realize your favorite characters are voiced by the same person!`
      : `animeVA is the world's smartest and most intuitive anime voice actor database yet. You'll be shocked when you realize your favorite characters are voiced by the same person!`;
    let logo = require(`./img/logo.png`);

    return (
      <div>
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
        <div className="header-wrapper">
          <Header conflict={conflictClass} onReturnVA={this.onVALoaded} />
        </div>
        {conflict}
        <div
          className="entry-bg"
          style={{ backgroundImage: `url(${this.state.bgImg})` }}
        ></div>
        <div className="dark-overlay"></div>
        <div className={`sidebar ${conflictClass}`}>{va}</div>
        <div className={`entry-container ${conflictClass}`}>
          <div>
            {/* <select
              className="sort"
              value={this.state.sortMethod}
              onChange={(e) => this.sortCharacters(e.target.value)}
            >
              <option value="MAGIC">Sort By: Magic</option>
              <option value="POPULARITY">Sort By: Anime Popularity</option>
              <option value="ROLE">Sort By: Role</option>
            </select> */}
            <div className="entry-char-container">{characters}</div>
          </div>
        </div>
      </div>
    );
  }
}

const VAContainer = (props) => {
  const { main, supporting, total } = props.stats;
  const { first, last } = props.data.name;
  const isMale = props.data.gender === "Male";
  return (
    <div className="va-container">
      <div
        className="va-image"
        style={{ backgroundImage: `url(${props.data.image.large})` }}
      ></div>
      <div className="va-info">
        <h4 className="va-role">Voice {isMale ? "Actor" : "Actress"} </h4>
        <h1 className="va-name">
          {first} {last}
        </h1>
        <p className="va-desc">
          <span>{`${total} Appearances`}</span>
          <span>{`${main} Main`}</span>
          <span>{`${supporting} Supporting`}</span>
        </p>
      </div>
    </div>
  );
};

class EntryCharacter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var last = this.props.data.node.name.last
      ? this.props.data.node.name.last + ", "
      : "";
    var media = this.props.data.media.map(
      (m, i) => `${m.title.romaji}${this.props.data.media[i + 1] ? ", " : ""}`
    );

    return (
      <a
        target="_blank"
        className="entry-char"
        style={{ textDecoration: "none", color: "inherit" }}
        key={this.props.data.node.name.first}
        href={this.props.data.node.siteUrl}
      >
        <div
          className="entry-char-image"
          style={{
            backgroundImage: `url(${this.props.data.node.image.medium})`,
          }}
        >
          <span className={`entry-char-role ${this.props.data.role}`}>
            {this.props.data.role}
          </span>
        </div>
        <div className="entry-char-info">
          <h2 className="entry-char-name">
            {last}
            {this.props.data.node.name.first}
          </h2>
          <p className="entry-char-media">{media}</p>
        </div>
        {/* </div> */}
      </a>
    );
  }
}
