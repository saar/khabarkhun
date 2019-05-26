import {takeEvery, call, put} from "redux-saga/effects";
import  {DATA_LOADED} from "../constants/action-types";

export default function* watcherSaga() {
  yield takeEvery("DATA_REQUESTED", workerSaga);
}

function* workerSaga() {
  try {
    const payload = yield call(getData);
    yield put({type: DATA_LOADED, payload});
  } catch (e) {
    yield put({type: "API_ERRORED", payload: e});
  }
}

function getData() {
  return fetch("http://198.23.143.225:3900/api/posts").then(response =>
    response.json()
  );
}
