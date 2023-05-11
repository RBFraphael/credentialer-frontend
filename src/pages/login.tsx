import { PublicApi } from "@/services/ApiService";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import Image from "next/image";
import { FormEvent, useContext, useState } from "react";
import Swal from "sweetalert2";
import axios, { AxiosError, AxiosResponse } from "axios";

import LogoLight from "../assets/logo-light.svg";
import Background from "../assets/login-background.jpg";
import { UserContext } from "@/contexts/UserContext";
import { ILoginCredentials } from "@/interfaces/ILoginCredentials";
import { useRouter } from "next/router";

export default function Login()
{
    const router = useRouter();
    const [credentials, setCredentials] = useState<ILoginCredentials>({});
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { setUser } = useContext(UserContext);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        setSubmitting(true);

        PublicApi.post("/auth/login", credentials).then((res: AxiosResponse) => {
            let data: any = res.data;

            localStorage.setItem("access_token", data.access_token);
            setUser(data.user);

            router.push("/dashboard");
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante o login.";

            if(axios.isAxiosError(error)){
                message = error.response?.data?.message ?? message;
            }

            Swal.fire({
                icon: "error",
                title: "Erro",
                text: message
            });
        }).finally(() => {
            setSubmitting(false);
        });
    }

    return (
        <>
            <Head>
                <title>Login - Credentialer</title>
            </Head>
            <main id="login" style={{backgroundImage:`url('${Background.src}')`}}>
                <div className="container-fluid position-relative">
                    <div className="row vh-100">
                        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 col-xxl-3 align-self-center">
                            <div className="px-5 mb-4 text-center">
                                <Image src={LogoLight} className="img-fluid" alt="Credentialer Logo" />
                            </div>
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <form onSubmit={onSubmit}>
                                        <h3 className="mb-3">Login</h3>

                                        <div className="form-floating mb-2">
                                            <input type="email" name="email" id="email" className="form-control shadow-sm border-0" required placeholder=" " value={credentials.email ?? ""} onChange={(e: any) => setCredentials({...credentials, email: e.target.value})} />
                                            <label htmlFor="email">Endereço de E-mail</label>
                                        </div>

                                        <div className="form-floating mb-3">
                                            <input type="password" name="password" id="password" className="form-control shadow-sm border-0" required placeholder=" " value={credentials.password ?? ""} onChange={(e: any) => setCredentials({...credentials, password: e.target.value})} />
                                            <label htmlFor="password">Senha</label>
                                        </div>

                                        { submitting ? (
                                            <div className="spinner-border text-success" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        ) : (
                                            <button type="submit" className="btn btn-success shadow-sm">
                                                <FontAwesomeIcon icon={faLock} fixedWidth /> Entrar
                                            </button>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}