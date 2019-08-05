declare module "KhabarkhunTypes" {
    export interface Content {
        _id: string;
        url: string;
        title?: string;

        excerpt?: string;
        content?: string;
        image?: string;
        updatedAt?: Date;
        createdAt?: Date;
    }
}