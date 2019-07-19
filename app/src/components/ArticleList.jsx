import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import Article from "./Article";
import "./ArticleList.scss";

export function ArticleList(props) {
  const {requestSend, articles} = props;
  const handleOnScroll = () => {
    // console.log("handleOnScroll");
    let scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    let scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
    let clientHeight = document.documentElement.clientHeight || window.innerHeight;
    let scrolledToBottom = Math.ceil(scrollTop + clientHeight + 1000) >= scrollHeight;

    if (scrolledToBottom) {
      if (requestSend) {
        return;
      }
      let parameters = getPage();
      // console.log("parameters",parameters);
      props.history.push(parameters);
    }
  };
  const getPage = () => {
    let {pathname, search} = props.location;
    let pageNo = 0;
    let patternNo = /p=(\d+)/i;
    let match = patternNo.exec(search);
    if (match) {
      pageNo = match[1];
    }
    pageNo++;
    return (`${pathname}?p=${pageNo}&continue=true`);
  };

  useEffect(() => {
    // console.log("addEventListener");
    window.addEventListener('scroll', handleOnScroll);
    return () => {
      // console.log("removeEventListener");
      window.removeEventListener('scroll', handleOnScroll);
    };
  }, [articles]);


  const getLoading = () => {
    if (requestSend) {
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
      {articles.map(article => (
        <Article article={article} key={article._id}/>
      ))}
      {getLoading()}
    </div>
  );
}

export default withRouter(ArticleList);
