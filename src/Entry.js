import React, { Component } from 'react';
import './Entry.css';
import { brotliCompress } from 'zlib';

export class Entry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortMethod: "MAGIC",
            characterList: this.props.data.characters.edges
        };
    }

    sortPopularity(a, b) {
        var aPopularity = (a.media.length !== 0) ? a.media[0].popularity : 0;
        var bPopularity = (b.media.length !== 0) ? b.media[0].popularity : 0;
        
        if (a.media.length > 1) {
            a.media.sort((x, y) => y.popularity - x.popularity);
            aPopularity = a.media[0].popularity;
        } else if (b.media.length > 1) {
            b.media.sort((x, y) => y.popularity - x.popularity);
            bPopularity = b.media[0].popularity;
        } 

        return  bPopularity - aPopularity;
    }

    sortRole(a, b) {
        // Add case for background
        var aRole = (a.role == "MAIN") ? 1 : 0;
        var bRole = (b.role == "MAIN") ? 1 : 0;
        return bRole - aRole;
    }

    sortMagic(a, b) {
        var aPopularity = (a.media.length !== 0) ? a.media[0].popularity : 0;
        var bPopularity = (b.media.length !== 0) ? b.media[0].popularity : 0;

        // Add case for background
        var aRole = (a.role == "MAIN") ? 3 : 1;
        var bRole = (b.role == "MAIN") ? 3 : 1;
        
        // Use the most popular media the character is in
        if (a.media.length > 1) {
            a.media.sort((x, y) => y.popularity - x.popularity);
            aPopularity = a.media[0].popularity;
        } else if (b.media.length > 1) {
            b.media.sort((x, y) => y.popularity - x.popularity);
            bPopularity = b.media[0].popularity;
        }
        
        // Add # of favorites * 10 to the score
        aPopularity += a.node.favourites * 10;
        bPopularity += b.node.favourites * 10;

        return  (bPopularity * bRole) - (aPopularity * aRole);
    }

    sortCharacters = (SORT_METHOD) => {
        // console.log(this.state.characterList);
        if (this.state.characterList.length < 2) {
            this.setState({ sortMethod: SORT_METHOD });
        } else {
            // When sorting by ROLE, also sort by POPULARITY of media
            if (SORT_METHOD == "ROLE") { this.sortCharacters("POPULARITY"); }
            var sortedList = this.state.characterList.sort((a,b) => {
                switch (SORT_METHOD) {
                    case "POPULARITY": return this.sortPopularity(a,b);
                    case "ROLE": return this.sortRole(a,b);
                    case "MAGIC": return this.sortMagic(a,b);
                }
            });

            // console.log(sortedList);
            this.setState({ sortMethod: SORT_METHOD, characterList: sortedList });
        }
    }

    componentDidMount() {
        this.sortCharacters("MAGIC");
    }

    render() {
        var e = this.props.data;
        console.log(e);
        var characters = this.state.characterList.map((char, i) => <EntryCharacter key={i} data={char}/>);

        return (
            <div>
                <div className="sidebar">
                    <div className="va-container">
                        <div className="va-image" style={{backgroundImage:`url(${e.image.large})`}}></div>
                        <div className="va-info">
                            <h1 className="va-name">{e.name.last}, {e.name.first}</h1>
                            <span className="va-desc" dangerouslySetInnerHTML={{__html: e.description}}></span>
                        </div>
                    </div>
                </div>
                <div className="entry-container">
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
        // console.log(media);

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

export class Conflict extends Component {
    handleOnClick = (id) => { this.props.onClick(id); }

    render() {
        console.log(this.props.data);
        var vaBlocks = this.props.data.map(va => <ConflictBox key={va.name} name={va.name} image={va.image} media={va.media} id={va.id} onClick={this.handleOnClick}/>);

        return (
            <div className="conflict-container">
                <h2>Whoops... it looks like {this.props.character} has been voiced by multiple people! Please select the anime you're referring to!</h2>
                {vaBlocks}
            </div>
        );
    };
}

const ConflictBox = (props) => {
    return (
        <div className="conflict-box" onClick={ () => props.onClick(props.id) }>
            <div className="conflict-image" style={{backgroundImage:`url(${props.image})`}}></div>
            <div className="conflict-info">
                <p className="conflict-name" >{props.name}</p>
                {props.media.map(m => <p key={m} className="conflict-media">{m}</p>)}
            </div>
        </div>
    );
}