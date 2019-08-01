import reducer from "./reducer";
import {ArticleState} from "./types";
import {like} from "./action";

/**
 * FIXTURES
 */
const getInitialState = (initial?: Partial<ArticleState>) => reducer(initial as ArticleState, {} as any);


/**
 * STORIES
 */
describe('Article Stories', () => {
    describe('initial state', () => {
        it('should match a snapshot', () => {
            const initialState = getInitialState();
            expect(initialState).toMatchSnapshot();
        });
    });

    describe('like', () => {
        it('should increment likes count and mark as liked', () => {
            const initialState = getInitialState();
            const state = reducer(initialState, like());
            expect(state.like).toHaveProperty("likes", 1);
            expect(state.like).toHaveProperty("liked", true);
        });
    });


});

