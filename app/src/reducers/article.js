import {ARTICLE_LOADED} from "../constants/action-types";

const article = (state = {}, action) => {
  switch (action.type) {
    case ARTICLE_LOADED:
      return action.payload;
    default:
      return state;
  }
};

export default article;
