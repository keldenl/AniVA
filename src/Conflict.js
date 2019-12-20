import React, { Component } from 'react';
import './styles/Conflict.css';

export default class Conflict extends Component {
    handleOnClick = (id) => { this.props.onClick(id); }
  
    render() {
        // console.log(this.props.data);
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