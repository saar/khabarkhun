import {ARTICLE_LOADED, ARTICLES_LOADED, REQUEST_SEND, TOGGLE_SIDEBAR} from "../constants/action-types";

const initialState = {
  article: {},
  articles: [],
  requestSent: false,
  isSidebar: true
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case ARTICLE_LOADED:
      return {
        article: action.payload,
        articles: state.articles,
        requestSent: state.requestSent,
        isSidebar: state.isSidebar
      };
    case REQUEST_SEND:
      return Object.assign({}, state, {
        article: state.article,
        articles: state.articles,
        requestSent: true,
        isSidebar: state.isSidebar
      });
    case ARTICLES_LOADED:
      return Object.assign({}, state, {
        article: state.article,
        articles: state.articles.concat(action.payload),
        requestSent: false,
        isSidebar: state.isSidebar
      });
    case TOGGLE_SIDEBAR:
      return Object.assign({}, state, {
        article: state.article,
        articles: state.articles,
        requestSent: state.requestSent,
        isSidebar: !state.isSidebar
      });
    default:
      return state;
  }
}

export default rootReducer

