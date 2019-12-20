import React from 'react'
import { Route, Switch } from 'react-router-dom'
import App from './App'
import {Entry} from './Entry';

export default function Main() {
    return (
        <Switch>
            <Route exact path="/" component={App} />
            <Route path="/va/:id" component={Entry} />
        </Switch>
    )
}