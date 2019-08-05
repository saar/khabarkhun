import {Article} from "KhabarkhunTypes";
import {call, put} from "redux-saga/effects";
import {likeAction} from "./action";

function* like(action: ReturnType<typeof likeAction.request>): Generator {
    try {
        const response: Article = yield call(API.article.like, action.payload);
        yield put(likeAction.success(response));
    } catch (err) {
        yield put(likeAction.failure(err));
    }
}


