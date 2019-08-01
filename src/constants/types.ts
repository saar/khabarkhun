
export interface Tag {
    related: Tag[],
    topics: Topic[],
}

export interface Topic {
    articles: Article[],
}

export interface Article {
    like: Like,
}

export interface Like {
    dislikes: number,
    likes: number,
}



