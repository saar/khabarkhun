declare module "KhabarkhunTypes" {
    export type Story = {
        _id: string;
        title: string;
        related?: Story[];
        topics?: Topic[];
    }
}