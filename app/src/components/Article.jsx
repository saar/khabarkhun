import React from 'react';
import {Link} from "react-router-dom";
import moment from "moment";
import "./Article.scss";

const getImage = (sourceImage, title) => {
  if (sourceImage) {
    return (
      <div className="post-image mr-3 rounded">
        <img
          alt={title}
          className="align-self-start image"
          src={sourceImage}
          data-holder-rendered="true"
        />
      </div>

    );
  }
};

export default function Article({article}) {
  const image = article.enclosures[0] && article.enclosures[0].url;
  return (

    <div className="post media text-muted p-3 pb-0 m-1 mb-3 border rounded border-gray">
      <div className="media-body mb-0 small">
        <Link
          className="title"
          to={`/article/${article._id}`}
          target="_blank"
        >
          {article.title}
        </Link>
        <p className="source d-block text-gray-dark">
          {article.rss.title + " - زمان "}
          {moment(article.publicationDate).fromNow()}{" "}
        </p>
        {article.description && <p className="summary d-none d-sm-inline-block">
          {article.description}
        </p>}
        <div>
          <label>{parseInt(article.likeCount) === 0 ? "" : article.likeCount}</label>
          <i className="material-icons">thumb_up</i>
          <i className="material-icons">thumb_down</i>
        </div>
      </div>
      {getImage(image, article.title)}
    </div>
  );
}
