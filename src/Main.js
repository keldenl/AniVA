import React from 'react'
import { Route, Switch } from 'react-router-dom'
import App from './App'
import {Entry} from './Entry';
// require("history").createBrowserHistory
// require("history").createBrowserHistory
// import {history} from 'createBrowserHistory'
import ReactGA from 'react-ga'


export default function Main() {
    // componentDidMount() {
	// 	ReactGA.pageview(window.location.pathname)
    // }
    // const history = history.createHistory()

    // history.listen(location => {
    //     console.log(location);
    //     ReactGA.set({ page: location.pathname })
    //     ReactGA.pageview(location.pathname)
    // })

    return (
        <Switch>
            <Route exact path="/" component={App} />
            <Route path="/va/:id" component={Entry} />
        </Switch>
    );
}