import { Dispatch, SetStateAction } from "react";

export interface UserContextProps {
    user: any;
    setUser: Dispatch<SetStateAction<any>>;
}