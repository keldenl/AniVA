import React, { Component } from 'react';
import { Redirect } from 'react-router';

import * as api from './utils/api';
import * as loader from './utils/loader';
import * as sort from './utils/sort';

import Header from './Header';
import Conflict from './Conflict';

import './styles/Entry.css';

export class Entry extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,            
            vaId: this.props.match.params.id,
            sortMethod: this.props.sort,
            entryData: {},
            characterList: [],
            newSearch: false,
            hasConflict: false,
            characterName: "",
            conflictList: []
        };
    }

    findEntry = (vaId) => {
        var variables = { id: vaId }
        var query = api.ENTRY_QUERY;
        var [url, options] = api.prepareFetch(query, variables);
    
        fetch(url, options).then(api.handleResponse)
                        .then(this.handleEntryData)
                        .catch(api.handleError);
    }

    findAddtionalEntry(pageNum) {
        var variables = { id: this.state.vaId, page: pageNum }
        var query = api.ADDITIONAL_ENTRY_QUERY;
        var [url, options] = api.prepareFetch(query, variables);
    
        fetch(url, options).then(api.handleResponse)
                        .then(this.handleAdditionalEntryData)
                        .catch(api.handleError);
    }

    handleEntryData = (data) => {
        // console.log(data.data.Staff.characters.edges)
        this.setState({ isLoaded: false, entryData: data.data.Staff, characterList: data.data.Staff.characters.edges });
        // console.log(this.state);
        if (data.data.Staff.characters.pageInfo.hasNextPage) {
          this.findAddtionalEntry(data.data.Staff.characters.pageInfo.currentPage + 1);
          // console.log("NEED TO FETCH MORE CHARACTERS");
        } else {
            this.sortCharacters("MAGIC");
            this.setState({ isLoaded: true, newSearch: false });
        }
      }
      

    handleAdditionalEntryData = (data) => {
        var updatedEntryData = this.state.entryData;
        for (var c of data.data.Staff.characters.edges) {
            updatedEntryData.characters.edges.push(c);
        }

        this.setState({ entryData: updatedEntryData, characterList: updatedEntryData.characters.edges });

        if (data.data.Staff.characters.pageInfo.hasNextPage) {
            this.findAddtionalEntry(data.data.Staff.characters.pageInfo.currentPage + 1);
            // console.log("CONTINUE TO FETCH MORE CHARACTERS");
        } else {
            this.sortCharacters("MAGIC");
            this.setState({ isLoaded: true, newSearch: false });
        }
    }

    sortCharacters = (SORT_METHOD) => {
        // console.log(this.state.characterList);
        if (this.state.characterList.length < 2) {
            // console.log("don't need to sort!")
            this.setState({ sortMethod: SORT_METHOD });
        } else {
            // When sorting by ROLE, also sort by POPULARITY of media
            if (SORT_METHOD == "ROLE") { this.sortCharacters("POPULARITY"); }
            var sortedList = this.state.characterList.sort((a,b) => {
                switch (SORT_METHOD) {
                    case "POPULARITY": return sort.sortPopularity(a,b);
                    case "ROLE": return sort.sortRole(a,b);
                    case "MAGIC": return sort.sortMagic(a,b);
                }
            });

            this.setState({ sortMethod: SORT_METHOD, characterList: sortedList });     
        }
    }


    /* Header Functions */
    onConflictClick = (vaId) => { 
        this.setState({ 
            vaId: vaId, 
            hasConflict: false,
            conflictList: []
        }); 
    }

    onVALoaded = (conflict, data) => {
        // console.log(!conflict);
        // console.log(data+"");
        // console.log(this.state.vaId);
        if (!conflict) { 
            if (data != this.state.vaId) {
                this.setState({ 
                    vaId: data,
                    hasConflict: false,
                    conflictList: []
                });
            } else {
                alert("That character is voiced by this person!")
            }
        }
        else {
            this.setState({
                hasConflict: true,
                conflictList: data[0],
                characterName: data[1]
            });
        }
    }

    componentDidMount() {
        // console.log("MOUNTING!!");
        // console.log(this.state);
        this.findEntry(this.state.vaId);

        if (this.state.isLoaded) {
            this.sortCharacters("MAGIC");
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.vaId !== nextState.vaId) {
            this.setState({
                newSearch: true
            });
            // console.log("UPDATE!!");
            // console.log(this.state);
            // console.log(nextState);
            this.findEntry(nextState.vaId);
            if (this.state.isLoaded) {
                this.sortCharacters("MAGIC");
            }
        }
    }

    render() {
        //document.querySelector('body').style.backgroundImage = "";
        //document.querySelector('body').background = "black!important";
        document.getElementById('root').style.backgroundColor = "rgba(0,0,0,0)";



        var e = this.state.entryData;
        var va = this.state.isLoaded && !this.state.newSearch ? <div className="va-container">
            <div className="va-image" style={{backgroundImage:`url(${e.image.large})`}}></div>
            <div className="va-info">
                <h1 className="va-name">{e.name.last}, {e.name.first}</h1>
                <span className="va-desc" dangerouslySetInnerHTML={{__html: e.description}}></span>
            </div>
        </div> : loader.VA_PROFILE;

        var characters = (this.state.isLoaded) ? this.state.characterList.map((char, i) => <EntryCharacter key={i} data={char}/>) : loader.ENTRY_CHARACTER;

        var conflict = (this.state.hasConflict) && <Conflict onClick={this.onConflictClick} data={this.state.conflictList} character={this.state.characterName}/>;

        var conflictClass = this.state.hasConflict ? "conflict" : "";
        // console.log(this.state);
        if (this.state.newSearch && this.state.isLoaded) {
            // console.log("REDIRECT!");
            return <Redirect push to={`/va/${this.state.vaId}`} />; 
        }

        return (
            <div>
                <Header conflict={conflictClass} onReturnVA={this.onVALoaded}/>
                {conflict}
                <div className={`sidebar ${conflictClass}`}>
                    {va}
                </div>
                <div className={`entry-container ${conflictClass}`}>
                    <div>
                        <select className="sort" value={this.state.sortMethod} onChange={e => this.sortCharacters(e.target.value)}>
                            <option value="MAGIC">Sort By: Magic</option>
                            <option value="POPULARITY">Sort By: Anime Popularity</option>
                            <option value="ROLE">Sort By: Role</option>
                        </select>
                        <div className="entry-char-container">
                            {characters}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class EntryCharacter extends Component {
    constructor(props) { super(props); }

    render() {
        var last = (this.props.data.node.name.last) ? this.props.data.node.name.last + ", " : "";
        var media = this.props.data.media.map((m, i) => `${m.title.romaji}${this.props.data.media[i+1] ? ', ' : ''}`);
        // // console.log(media);

        return (
            <a target="_blank" className="entry-char" style={{textDecoration: 'none', color: 'inherit'}}key={this.props.data.node.name.first} href={this.props.data.node.siteUrl}>
            {/* <div className="entry-char" key={this.props.data.node.name.first}> */}
                <div className="entry-char-image" style={{backgroundImage:`url(${this.props.data.node.image.medium})`}}></div>
                <div className="entry-char-info">
                    <h2 className="entry-char-name">{last}{this.props.data.node.name.first}</h2>
                    <span className={`entry-char-role ${this.props.data.role}`}>{this.props.data.role}</span>
                    <p className="entry-char-media">{media}</p>
                </div>
            {/* </div> */}
            </a>
        );
    }
}