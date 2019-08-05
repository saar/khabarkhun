declare module "KhabarkhunTypes" {
    export interface Article {
        _id: string;
        sourceUrl: URL;
        title: string;
        excerpt: string;
        content?: Content;
        image?: URL;
        publicationDate?: Date;
        tags: Tag[];
        like: {
            dislikes: number;
            likes: number;
            liked: boolean;
            disliked: boolean
        };
        lastScraped?: Date;
        updatedAt: Date;
        createdAt: Date;
    }
}