import { IComponentProps } from "@/interfaces/IComponentProps";
import { UserContextProps } from "@/interfaces/IUserContextProps";
import { createContext, useState } from "react";

const UserContext = createContext<UserContextProps>({
    user: null,
    setUser: () => {}
});

const UserContextProvider = ({children}: IComponentProps) => {
    const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
}

export { UserContext, UserContextProvider };
