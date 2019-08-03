import {dislike, like} from "./action";
import {LikeReducer} from "./reducer";
import {createStore} from "redux";
import {LikeState} from "./types";

/**
 * FIXTURES
 */
const getInitialState = (initial?: Partial<LikeState>) => LikeReducer(initial as LikeState, {} as any);



/**
 * STORIES
 */
describe('Like Stories', () => {
    describe('initial state', () => {
        it('should match a snapshot', () => {
            const initialState = getInitialState();
            expect(initialState).toMatchSnapshot();
        });
    });

    describe('like', () => {
        it('should increment likes count and mark as liked', () => {
            const initialState = getInitialState();
            expect(initialState.likes).toEqual(0);
            expect(initialState.liked).toEqual(false);
            const state = LikeReducer(initialState, like());
            expect(state.likes).toEqual(1);
            expect(state.liked).toEqual(true);
        });
    });
    describe('dislike', () => {
        it('should increment dislikes count and mark as disliked', () => {
            const initialState = getInitialState();
            expect(initialState.dislikes).toEqual(0);
            expect(initialState.disliked).toEqual(false);
            const state = LikeReducer(initialState, dislike());
            expect(state.dislikes).toEqual(1);
            expect(state.disliked).toEqual(true);
        });
    });


});

