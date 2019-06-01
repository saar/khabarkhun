import {takeEvery, call, put} from "redux-saga/effects";
import  {ARTICLES_REQUESTED, ARTICLES_LOADED, API_ERRORED} from "../constants/action-types";

export default function* articleWatch() {
  yield takeEvery(ARTICLES_REQUESTED, fetchArticles);
}

function* fetchArticles() {
  try {
    const payload = yield call(getArticles);
    yield put({type: ARTICLES_LOADED, payload});
  } catch (e) {
    yield put({type: API_ERRORED, payload: e});
  }
}

function getArticles() {
  return fetch("http://198.23.143.225:9090/api/article").then(response =>
    response.json()
  );
}
