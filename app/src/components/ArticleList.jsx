import React, {Component } from "react";
import {connect} from "react-redux";
import {articlesRequested} from "../actions/index";
import Article from "./Article";
import "./ArticleList.scss";

export class ArticleList extends Component {

  componentDidMount() {
    const newParameters = this.props.location.search || "";
    console.log("cdm-newParameters",newParameters)
    this.props.articlesRequested(newParameters);
    window.addEventListener('scroll', this.handleOnScroll);
  }

  componentDidUpdate(prevProps) {
    const newParameters = this.props.location.search;
    const newPathName = this.props.location.pathname;
    if (newParameters !== prevProps.location.search && (newPathName === "/pwa" || newPathName === "/article/category" || newPathName === "/")) {
      this.props.articlesRequested(newParameters);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleOnScroll);
  }

  handleOnScroll = () => {
    let scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    let scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
    let clientHeight = document.documentElement.clientHeight || window.innerHeight;
    let scrolledToBottom = Math.ceil(scrollTop + clientHeight + 1000) >= scrollHeight;

    if (scrolledToBottom) {
      if (this.props.requestSent) {
        return;
      }
      let parameters = this.getPage();
      this.props.history.push(parameters);
    }
  };

  getPage = () => {
    let {pathname, search} = this.props.location;
    let pageNo = 0;
    let category;
    let patternNo = /p=(\d+)/i;
    let patternWord = /category=(\w+)/i;
    let match = patternNo.exec(search);
    if (match) {
      pageNo = match[1];
    }
    match = patternWord.exec(search);
    if (match) {
      category = match[1];
    }
    pageNo++;
    return (category) ? (pathname + `?category=${category}&p=${pageNo}&continue=true`) : (pathname + `?p=${pageNo}&continue=true`);
  };

  render() {
    const getLoading = () => {
    if (this.props.requestSent) {
      return (
        <div className="data-loading">
          <i className="fa fa-circle-o-notch fa-spin fa-4x"/>
        </div>
      );
    }
  };
    return (
      <div className="p-3 rounded">
        <div className="header">
          <div className="title">
            <i className="material-icons" style={{background: "#e91e63"}}>public</i>
            <h2>
              دسته خبر
            </h2>

          </div>
        </div>
        {this.props.articles.map(article => (
          <Article article={article} key={article._id}/>
        ))}
        {getLoading()}
      </div>

    );
  }
}

function mapStateToProps(state) {
  return {
    articles: state.articles,
    requestSent: state.requestSent
  };
}

export default connect(mapStateToProps, {articlesRequested})(ArticleList);
