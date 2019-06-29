import React, {Component} from "react";
import {connect} from "react-redux";
import {articlesRequested} from "../actions/index";
import Article from "./Article";
import "./ArticleList.scss";

export class ArticleList extends Component {

  componentDidMount() {
    const newParameters = this.props.location.search || "";
    this.props.articlesRequested(newParameters);
    window.addEventListener('scroll', this.handleOnScroll);
  }

  componentDidUpdate(prevProps) {
    const newParameters = this.props.location.search;
    const newPathName = this.props.location.pathname;
    if (newParameters !== prevProps.location.search && (newPathName === "/article" || newPathName === "/")) {
      this.props.articlesRequested(newParameters);
      console.log("didUpdate", newParameters);
    }
    console.log("newParameters",newParameters);
    console.log("prevProps.location.search", prevProps.location.search );
  }

  componentWillUnmount() {
    console.log("removeEventListener");
    window.removeEventListener('scroll', this.handleOnScroll);
  }

  handleOnScroll = () => {
    console.log("handleOnScroll");
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
