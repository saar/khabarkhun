import {DeepReadonly} from "utility-types";
import {StoryState} from "../story/types";
// import {ActionType} from "typesafe-actions";


export type StoriesState = DeepReadonly<{
    stories: StoryState[];
}>


export const initialStoriesState: StoriesState = {
    stories: []
};

