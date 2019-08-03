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
            const initialState = getInitialState({like: {liked: false, likes: 25, dislikes: 30, disliked: false}});
            const state = reducer(initialState, like());
            expect(state.like).toHaveProperty("likes", 26);
            expect(state.like).toHaveProperty("liked", true);
        });
    });


});

