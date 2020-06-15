import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import GameSelectionPage from "./gameSelectionPage/GameSelectionPage";
import App from './App';
import NotFound from './NotFound';

const Router = () => {
  
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={GameSelectionPage} />
        <Route path="/game/:gameslug" component={App} />        
        <Route exact path="/game/" component={App} />        
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default Router;