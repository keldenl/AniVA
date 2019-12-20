import React, { Component } from 'react';
import {Entry, Conflict} from './Entry';
import './App.css';
import { thisExpression } from '@babel/types';

var CHARACTER_QUERY = `
query ($search: String, $page: Int, $perPage: Int) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    characters (search: $search) {
      id
      name { full }
    }
  }
}
`;

var VA_QUERY = `      
query ($id: Int) {
  Character(id: $id) {
    id
    name { full }
    media {
      edges {
        node {
          id
          title {
            romaji
          }
          coverImage { large }
        }
        characterRole
        voiceActors(language: JAPANESE) {
          name { full }
          id
        }
      }
    }
  }    
}
`;

var ENTRY_QUERY = `
query ($id: Int) {
  Staff (id: $id) {
    name { first last }
    image {
      large
    }
    description (asHtml: true)
    characters {
      pageInfo {
        currentPage
        lastPage
        hasNextPage
      }
      edges {
        node {
          name { first last }
          image { medium }
          favourites
        }
        role
        media {
          title { romaji }
          popularity
        }
      }
      
    }
  }
}
`;

var ADDITIONAL_ENTRY_QUERY = `
query ($id: Int, $page: Int) {
  Staff (id: $id) {
    characters (page: $page) {
      pageInfo {
        currentPage
        lastPage
        hasNextPage
      }
      edges {
        node {
          name { first last }
          image { medium }
          favourites
        }
        role
        media {
          title { romaji }
          popularity
        }
      }
      
    }
  }
}`;


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHome: true,
      isLoaded: false,
      hasConflict: false,
      conflictList: [],
      characterId: -1,
      characterName: "",
      vaId: -1,
      entryData: {}
    }
  }

  componentDidMount() {
    // this.searchCharacter('naruto');
  }

  _handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.searchCharacter(e.target.value);
      console.log(e);
    }
  }

  searchCharacter(charName) {
    console.log(charName);
    this.setState({ isLoaded: false, hasConflict: false, conflictList: [] })
    var variables = {
      search: charName,
      page: 1,
      perPage: 10
    };

    var query = CHARACTER_QUERY;
    var [url, options] = prepareFetch(query, variables);

    fetch(url, options).then(handleResponse)
                        .then(this.handleCharacterData)
                        .catch(handleError);
  }

  findVA(charId) {
    var variables = { id: charId }
    console.log(variables.id);
    var query = VA_QUERY;
    var [url, options] = prepareFetch(query, variables);
  
    fetch(url, options).then(handleResponse)
                       .then(this.handleVAData)
                       .catch(handleError);
  }

  findEntry(vaId) {
    var variables = { id: vaId }
    var query = ENTRY_QUERY;
    var [url, options] = prepareFetch(query, variables);
  
    fetch(url, options).then(handleResponse)
                       .then(this.handleEntryData)
                       .catch(handleError);
  }

  findAddtionalEntry(pageNum) {
    var variables = { id: this.state.vaId, page: pageNum }
    var query = ADDITIONAL_ENTRY_QUERY;
    var [url, options] = prepareFetch(query, variables);
  
    fetch(url, options).then(handleResponse)
                       .then(this.handleAdditionalEntryData)
                       .catch(handleError);
  }

  onConflictClick = (vaId) => {
    this.setState({ 
      vaId: vaId
    });

    this.findEntry(vaId);
  }

  handleCharacterData = (data) => {
    console.log(data);
    var characterList = data.data.Page.characters;
    for (var c of characterList) {
      console.log(c.id + ", " + c.name.full);
    }
  
    var id = characterList[0].id;
    var name = characterList[0].name.full;
    this.setState({ characterId: id, characterName: name })
    this.findVA(id);
  }

  handleVAData = (data) => {
    console.log(data);

    var vas = [];
    var vaList = data.data.Character.media.edges;
    for (var e of vaList) {
      var currVA = e.voiceActors[0];
      // console.log(e);
      if (currVA && !vas.some(e => e.id === currVA.id)) {
        vas.push({id: currVA.id, name: currVA.name.full, image: e.node.coverImage.large, media: [e.node.title.romaji]});
      } else if (currVA) {
        var va = vas.filter(e => { return e.id === currVA.id});
        va[0].media.push(e.node.title.romaji);
      }
    }
  
    console.log(vas);

    if (vas.length > 1) {
      this.setState({ isHome: false, hasConflict: true, conflictList: vas });
    } else {
      this.setState({ vaId: vas[0].id });
      this.findEntry(vas[0].id);
    }
  }

  handleAdditionalEntryData = (data) => {
    var updatedEntryData = this.state.entryData;
    for (var c of data.data.Staff.characters.edges) {
      updatedEntryData.characters.edges.push(c);
    }

    this.setState({ entryData: updatedEntryData });

    if (data.data.Staff.characters.pageInfo.hasNextPage) {
      this.findAddtionalEntry(data.data.Staff.characters.pageInfo.currentPage + 1);
      console.log("CONTINUE TO FETCH MORE CHARACTERS");
    } else {
      this.setState({ isHome: false, isLoaded: true, hasConflict: false, conflictList: [] });
    }
  }

  handleEntryData = (data) => {
    console.log(data);
    this.setState({ entryData: data.data.Staff });
    if (data.data.Staff.characters.pageInfo.hasNextPage) {
      this.findAddtionalEntry(data.data.Staff.characters.pageInfo.currentPage + 1);
      console.log("NEED TO FETCH MORE CHARACTERS");
    } else {
      this.setState({ isHome: false, isLoaded: true, hasConflict: false, conflictList: []  });
    }
  }
  

  render() {
    var entry = (!this.state.isHome && this.state.isLoaded && !this.state.hasConflict) && <Entry data={this.state.entryData}/>;

    var conflict = (!this.state.isHome && this.state.hasConflict) && <Conflict onClick={this.onConflictClick} data={this.state.conflictList} character={this.state.characterName}/>;

    var homeClass = this.state.isHome ? "home" : "";
    var conflictClass = this.state.hasConflict ? "conflict" : "";

    return (
      <div className={`app ${homeClass}`}>
        <div className={`header ${homeClass} ${conflictClass}`}>
          <h2 className="logo" onClick={() => this.setState({ isHome: true })}>AniVA</h2>
          <div className="sublogo">Created by Kelden. Powered by AniList.</div>
          <span className="search">
            <input id="queryBox" placeholder="Search Anime Character (e.g. Goku Son)" autoComplete="off" type="text" onKeyDown={this._handleKeyDown} ></input>
            <button onClick={() => this.searchCharacter(document.getElementById('queryBox').value)}></button>
          </span>
        </div>
        {/* <p className="App-intro">
          Character ID is {this.state.characterId} <br/>
          Voice Actor ID is {this.state.vaId}
        </p>
        <hr/> */}
        { entry } { conflict }
      </div>
    );
  }
}


function prepareFetch(query, variables) {
    // Define the config we'll need for our Api request
    var url = 'https://graphql.anilist.co',
      options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          body: JSON.stringify({
              query: query,
              variables: variables
          })
      };

    return [url, options];
}

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
  console.log(data);
}

function handleError(error) {
    alert('An unknown error has occured. Please try again with another character!');
    console.error(error);
}

export default App;