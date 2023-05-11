import { IFile } from "./IFile";
import { IProject } from "./IProject";

export interface IClient {
    id?: number;
    name?: string;
    logo_file_id?: number | null;
    logo?: IFile | null;
    projects?: IProject[] | null;
}