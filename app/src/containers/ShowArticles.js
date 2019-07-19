import React, {Component} from "react";
import {connect} from "react-redux";
import {articlesRequested} from "../actions";
import {toggleSidebar} from "../actions";
import ArticleList from "../components/ArticleList";

export class ShowArticles extends Component {
  componentDidMount() {
    if (window.innerWidth < 768)
      this.props.toggleSidebar();
    const newParameters = this.props.location.search || "";
    this.props.articlesRequested(newParameters);
  }

  componentDidUpdate(prevProps) {
    const newParameters = this.props.location.search;
    const newPathName = this.props.location.pathname;
    if (newParameters !== prevProps.location.search && (newPathName === "/pwa" || newPathName === "/")) {
      this.props.articlesRequested(newParameters);
    }
  }

  render() {
    return (
    <ArticleList articles={this.props.articles} requestSend={this.props.requestSend} />
    )
  }
}

function mapStateToProps(state) {
  return {
    articles: state.articles,
    requestSend: state.requestSend
  };
}

export default connect(mapStateToProps, {toggleSidebar, articlesRequested})(ShowArticles);
