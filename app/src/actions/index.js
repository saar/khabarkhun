import {ADD_ARTICLE, ARTICLES_REQUESTED} from '../constants/action-types'

export function addArticle(payload) {
  return {type: ADD_ARTICLE, payload}
};

export function articlesRequested() {
  return { type: ARTICLES_REQUESTED };
}
