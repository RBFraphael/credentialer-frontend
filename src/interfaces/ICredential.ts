import { IFile } from "./IFile";
import { IProject } from "./IProject";

export interface ICredential {
    id?: number;
    project_id?: number;
    title?: string;
    type?: string;
    info?: string;
    gateway?: string;
    port?: string;
    user?: string;
    password?: string;
    project?: IProject;
    files?: IFile[];
}