import {ARTICLE_REQUESTED, ARTICLES_REQUESTED} from '../constants/action-types'

export function articleRequested(id) {
  return {type: ARTICLE_REQUESTED, payload: id};
}

export function articlesRequested(params) {
  return {type: ARTICLES_REQUESTED, payload: params};
}
