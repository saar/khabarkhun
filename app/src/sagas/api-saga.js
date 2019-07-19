import {takeEvery, call, put} from "redux-saga/effects";
import {
  ARTICLES_REQUESTED,
  ARTICLES_LOADED,
  ARTICLE_REQUESTED,
  ARTICLE_LOADED,
  API_ERRORED,
  REQUEST_SEND
} from "../constants/action-types";

export default function* articleWatch() {
  yield takeEvery(ARTICLE_REQUESTED, fetchArticle);
  yield takeEvery(ARTICLES_REQUESTED, fetchArticles);
}

function* fetchArticle(action) {
  try {
    const payload = yield call(getArticle, {id: action.payload});
    yield put({type: ARTICLE_LOADED, payload});
  } catch (e) {
    yield put({type: API_ERRORED, payload: e});
  }
}

function* fetchArticles(action) {
  try {
    yield put({type: REQUEST_SEND, payload:true});
    let data = yield call(getArticles, {params: action.payload});
    let reset = !action.payload;
    let payload = {data, reset};
    yield put({type: REQUEST_SEND, payload:false});
    yield put({type: ARTICLES_LOADED, payload});
  } catch (e) {
    yield put({type: API_ERRORED, payload: e});
  }
}

const getArticle = (params) => {
  return fetch(`/api/article/${params.id}`).then(response =>
    response.json()
  );
};

function getArticles(params) {
  return fetch(`/api/article/${params.params}`).then(response =>
    response.json()
  );
}

