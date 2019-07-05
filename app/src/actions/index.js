import {ARTICLE_REQUESTED, ARTICLES_REQUESTED, TOGGLE_SIDEBAR} from '../constants/action-types'

export function articleRequested(id) {
  return {type: ARTICLE_REQUESTED, payload: id};
}

export function articlesRequested(params) {
  return {type: ARTICLES_REQUESTED, payload: params};
}

export function toggleSidebar() {
  return {type: TOGGLE_SIDEBAR};
}
