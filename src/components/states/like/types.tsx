export interface LikeState {
    dislikes: number,
    likes: number,
    liked: boolean,
    disliked: boolean,
}

// export type StoriesAction = ActionType<{ typeof actions }>;

export const initialLikeState: LikeState = {
    dislikes: 0,
    likes: 0,
    liked: false,
    disliked: false,
};

