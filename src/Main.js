import React from 'react'
import { Route, Switch } from 'react-router-dom'
import App from './App'
import {Entry} from './Entry';
// require("history").createBrowserHistory
import createHistory from 'history/createBrowserHistory'
import ReactGA from 'react-ga'


export default function Main() {
    // componentDidMount() {
	// 	ReactGA.pageview(window.location.pathname)
    // }
    const history = createHistory()

    history.listen(location => {
        console.log(location);
        ReactGA.set({ page: location.pathname })
        ReactGA.pageview(location.pathname)
    })

    return (
        <Switch history={history}>
            <Route exact path="/" component={App} />
            <Route path="/va/:id" component={Entry} />
        </Switch>
    );
}