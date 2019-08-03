declare module "KhabarkhunTypes" {
    export type Story = {
        id: string;
        title: string;
        related?: Story[];
        topics?: Topic[];
    }
}