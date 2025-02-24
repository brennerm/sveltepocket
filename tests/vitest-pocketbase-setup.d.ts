import Pocketbase from 'pocketbase';
export declare const AUTHORS: {
    id: string;
    name: string;
}[];
export declare const POSTS: {
    id: string;
    title: string;
    author: string;
    published: boolean;
}[];
export declare const USERS: {
    id: any;
    email: string;
    password: string;
    passwordConfirm: string;
}[];
export declare const pbtest: import("vitest").TestAPI<{
    pb: Pocketbase;
}>;
