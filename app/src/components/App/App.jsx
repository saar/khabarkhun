import React from "react";
import {connect} from "react-redux";
import className from "classnames";
import {Route, Switch} from "react-router-dom";
import sidebarItems from "../Sidebar/sidebarItems.json";
import ArticlePage from "../ArticlePage";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import "./App.scss";
import ShowArticles from "../../containers/ShowArticles";
import ShowCategory from "../../containers/ShowCategory";

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
              <Route exact path="/article/category/:category" component={ShowCategory}/>
              <Route exact path="/article/:id" component={ArticlePage}/>
              <Route exact path="/" component={ShowArticles}/>
              <Route exact path="/pwa" component={ShowArticles}/>
              <Route exact path="/article" component={ShowArticles}/>
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
