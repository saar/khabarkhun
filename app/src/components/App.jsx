import React from "react";
import className from "classnames";
import ArticleList from "./ArticleList";
import {Route, Switch} from "react-router-dom";
import sidebarItems from "./sidebarItems.json";
import ArticlePage from "./ArticlePage";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./App.scss";
import connect from "react-redux/es/connect/connect";

const App = (props) => {
  let sidebarClassName = className({
    "sidebar-wrapper": true,
    "d-block": true,
    hide: !props.isSidebar
  });

  return (
    <React.Fragment>
      <Header/>
      <div className="wrapper">
        <div className={sidebarClassName}>
          <Sidebar
            items={sidebarItems}
          />
        </div>
        <div className="main-wrapper">
          <main className="container">
            <Switch>
              <Route exact path="/article/category/:category" component={ArticleList}/>
              <Route exact path="/article/:id" component={ArticlePage}/>
              <Route exact path="/" component={ArticleList}/>
              <Route exact path="/pwa" component={ArticleList}/>
              <Route exact path="/article" component={ArticleList}/>
            </Switch>
          </main>
        </div>
      </div>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    isSidebar: state.isSidebar
  };
}

export default connect(mapStateToProps)(App);
