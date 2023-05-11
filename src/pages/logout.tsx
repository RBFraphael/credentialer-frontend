import { useContext } from "react";
import { useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { useRouter } from "next/router";

export default function Logout()
{
    const { setUser } = useContext(UserContext);
    const router = useRouter();

    useEffect(() => {
        setUser(null);
        localStorage.removeItem("access_token");
        router.push("/");
    }, []);

    return (
        <></>
    );
}