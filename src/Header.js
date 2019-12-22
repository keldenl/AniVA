import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as api from './utils/api';

import './styles/App.css';


export default class Header extends Component {
    constructor(props) { super(props); }

    _handleKeyDown = (e) => {
        if (e.key === 'Enter') { this.searchCharacter(e.target.value); }
    }


    searchCharacter = (charName) => {
        this.setState({ isLoaded: false, hasConflict: false, conflictList: [] })

        var variables = {
            search: charName,
            page: 1,
            perPage: 10
        };

        var query = api.CHARACTER_QUERY;
        var [url, options] = api.prepareFetch(query, variables);

        fetch(url, options).then(api.handleResponse)
                            .then(this.handleCharacterData)
                            .catch(api.handleError);
    }

    findVA(charId) {
        var variables = { id: charId }
        var query = api.VA_QUERY;
        var [url, options] = api.prepareFetch(query, variables);

        fetch(url, options).then(api.handleResponse)
                            .then(this.handleVAData)
                            .catch(api.handleError);
    }

    handleCharacterData = (data) => {
        var characterList = data.data.Page.characters;
        // for (var c of characterList) {  console.log(c.id + ", " + c.name.full) ;}
        var id = characterList[0].id;
        var name = characterList[0].name.full;
        this.setState({ characterId: id, characterName: name })
        this.findVA(id);
    }

    handleVAData = (data) => {
        var vas = [];
        var vaList = data.data.Character.media.edges;
        // console.log(data.data.Character.name.full)

        for (var e of vaList) {
            var currVA = e.voiceActors[0];
            if (currVA && !vas.some(e => e.id === currVA.id)) {
            vas.push({id: currVA.id, name: currVA.name.full, image: e.node.coverImage.large, media: [e.node.title.romaji]});
            } else if (currVA) {
            var va = vas.filter(e => { return e.id === currVA.id});
            va[0].media.push(e.node.title.romaji);
            }
        }

        if (vas.length > 1) {
            this.props.onReturnVA(true, [vas, data.data.Character.name.full]);
        } else {
            this.props.onReturnVA(false, vas[0].id);
        }
    }

    render() {
        return (
            <div className={`header ${this.props.home} ${this.props.conflict}`}>
                <Link to="/" onClick={this.props.onReset}><h2 className="logo">AniVA</h2></Link>
                <div className="sublogo">Created by Kelden. Powered by AniList.</div>
                <span className="search">
                    <input id="queryBox" placeholder="Search Anime Character (e.g. Goku Son)" autoComplete="off" type="text" onKeyDown={this._handleKeyDown} ></input>
                    <button onClick={() => this.searchCharacter(document.getElementById('queryBox').value)}></button>
                </span>
            </div>
          );
    }
}