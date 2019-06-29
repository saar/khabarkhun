import React, {Component} from "react";
import "./ArticlePage.scss";
import {connect} from "react-redux";
import moment from "moment";
import {articleRequested} from "../actions";

class ArticlePage extends Component {
  state = {
    article: {}
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    this.props.articleRequested(id);
  }


  render() {
    const {article} = this.props;
    let tagItems;
    if (article.tags)
      tagItems = article.tags.map((tag, index) => (
        <li className="tag ml-2 badge badge-dark" key={index}>
          {tag}
        </li>
      ));
    return (
      <div className="row">
        <div className="col blog-main p-3 bg-white">
          <h4 className="blog-post-title pb-3 border-bottom">{article.title}</h4>
          <div className="blog-post">
            <div className="blog-post-meta border-bottom">
              <span>{moment(article.publicationDate).fromNow()}</span>
              <div className="pull-left block">
                <span>{Number.parseInt(article.visitCount) + " بازدید - "}</span>
{/*                <a
                  className="pr-1"
                  href={article.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {article.rss}
                </a>*/}
              </div>
            </div>
            <p>{article.description}</p>
            {(article.fullContent)  &&
              <div
              className="content "
              dangerouslySetInnerHTML={{__html: article.fullContent.content}}
            />}
            <div className="block">
              <ul className="tags list-inline">{tagItems}</ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    article: state.article
  };
}

export default connect(mapStateToProps, {articleRequested})(ArticlePage);
