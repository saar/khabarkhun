import React, {Component} from "react";
import {connect} from "react-redux";
import {articlesRequested} from "../actions/index";

export class ArticleList extends Component {

  componentDidMount() {
    this.props.articlesRequested();
  }

  render() {
    return (
      <ul className="list-group list-group-flush">
        {this.props.articles.map(el => (
          <li className="list-group-item" key={el.id}>
            {el.rss.title} - {el.title}
          </li>
        ))}
      </ul>
    );
  }
}

function mapStateToProps(state) {
  return {
    articles: state.articles
  };
}

export default connect(mapStateToProps, {articlesRequested})(ArticleList);
