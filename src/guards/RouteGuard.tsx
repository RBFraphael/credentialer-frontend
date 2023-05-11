import { UserContext } from "@/contexts/UserContext";
import { IComponentProps } from "@/interfaces/IComponentProps";
import { PrivateApi } from "@/services/ApiService";
import { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

export default function RouteGuard({children}: IComponentProps)
{
    const router = useRouter();
    const { user, setUser } = useContext(UserContext);

    const [isPublicRoute, setIsPublicRoute] = useState<boolean>(false);
    const [authorized, setAuthorized] = useState<boolean>(false);

    const publicRoutes = [
        "login"
    ];

    useEffect(() => {
        let isPublic: boolean = publicRoutes.filter((route: string) => router.pathname.indexOf(route) > -1).length > 0;
        let isHome: boolean = router.pathname == "/";
        let savedToken: string|null = localStorage.getItem("access_token");

        if(isHome && savedToken){
            router.push("/dashboard");
        } else if(isPublic){
            if(savedToken){
                router.push("/dashboard");
            } else {
                setIsPublicRoute(true);
            }
        } else {
            if(!savedToken){
                router.push("/login");
            } else {
                if(user == null){
                    PrivateApi.get("/auth/me").then((res: AxiosResponse) => {
                        setUser(res.data);
                    });
                    setAuthorized(true);
                } else {
                    setAuthorized(true);
                }
            }
        }
    }, [router.pathname]);

    return (
        <>
            {
                (authorized || isPublicRoute) && children
            }
        </>
    );
}