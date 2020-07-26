import React from 'react';
import './App.scss';
import ActionComponent from './components/ActionComponent';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";



function App() {
  return (

    <Router>
      <div className="app">
        <div>
          <Switch>
            <Route exact path="/">
              <ActionComponent />
            </Route>
          </Switch>
        </div> </div></Router>

  );
}

export default App;
