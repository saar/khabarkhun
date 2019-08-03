// types.d.ts
import {ActionType, StateType} from 'typesafe-actions';

/*todo  */
export type identifier = string;


declare module 'KhabarkhunTypes' {
    export type Store = StateType<typeof import('./index').default>;
    export type RootAction = ActionType<typeof import('./index').default>;
    export type RootState = StateType<ReturnType<typeof import('./index').default>>;
}

declare module 'typesafe-actions' {
    interface Types {
        RootAction: ActionType<typeof import('./index').default>;
    }
}