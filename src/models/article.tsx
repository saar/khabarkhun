declare module "KhabarkhunTypes" {
    export interface Article {
        id: string;
        sourceUrl: URL;
        title: string;
        excerpt: string;
        content?: Content;
        images?: URL;
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