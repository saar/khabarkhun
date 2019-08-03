declare module "KhabarkhunTypes" {
    export type Tag = {
        title: string;
        related: Tag[];
    }
}