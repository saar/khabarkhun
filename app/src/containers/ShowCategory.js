import React, {Component} from "react";
import {connect} from "react-redux";
import {articlesCategoryRequested} from "../actions/index";
import ArticleList from "../components/ArticleList";

export class ShowCategory extends Component {
  componentDidMount() {
    const parameters = this.props.location.search || "";
    const category = (this.props.location.pathname).replace("/article/category/","") || "بین‌الملل";
    this.props.articlesCategoryRequested(category, parameters);
  }

  componentDidUpdate(prevProps) {
    const parameters = this.props.location.search || "";
    const category = (this.props.location.pathname).replace("/article/category/","") || "بین‌الملل";
    if ((this.props.location.pathname !== prevProps.location.pathname) || (prevProps.location.search !== parameters)) {
      this.props.articlesCategoryRequested(category, parameters);
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

export default connect(mapStateToProps, {articlesCategoryRequested})(ShowCategory);
