import { IClient } from "./IClient";
import { ICredential } from "./ICredential";

export interface IProject {
    id?: number;
    client_id?: number;
    title?: string;
    client?: IClient;
    credentials?: ICredential[];
}