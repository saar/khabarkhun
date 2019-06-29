import React from "react";
import ArticleList from "./ArticleList";
import {Route, Switch} from "react-router-dom";
import sidebarItems from "./sidebarItems.json";
import ArticlePage from "./ArticlePage";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./App.scss";

export default function App() {

  return (
    <React.Fragment>
      <Header/>
      <div className="wrapper">
        <div className="sidebar-wrapper d-block">
          <Sidebar
            items={sidebarItems}
          />
        </div>
        <div className="main-wrapper">
          <main className="container">
            <Switch>
              <Route path="/article/:id" component={ArticlePage}/>
              <Route exact path="/" component={ArticleList}/>
            </Switch>
          </main>
        </div>
      </div>
    </React.Fragment>
  );
}
