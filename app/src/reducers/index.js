import {ARTICLE_LOADED, ARTICLES_LOADED} from "../constants/action-types";

const initialState = {
  article: {},
  articles: [],
  requestSent:false
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
      case ARTICLE_LOADED:
      return  {
        article: action.payload
      };
    case ARTICLES_LOADED :
      return Object.assign({}, state, {
        articles: state.articles.concat(action.payload),
        requestSent: false
      });
    default:
      return state;
  }
}

export default rootReducer

