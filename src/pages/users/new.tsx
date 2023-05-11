import { randomPassword } from "@/helpers/passwords";
import { IUser } from "@/interfaces/IUser";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faEye, faEyeSlash, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";

export default function NewUser()
{
    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(true);
    const [userData, setUserData] = useState<IUser>({});
    const [userRoles, setUserRoles] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        setSubmitting(true);

        let payload: IUser = {
            ...userData
        };

        PrivateApi.post("/user", payload).then((res: AxiosResponse) => {
            Swal.fire({
                icon: "success",
                title: "Sucesso",
                html: `O usuário <b>${userData.name}</b> foi adicionado com sucesso.`
            }).then(() => {
                router.push("/users");
            });
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante o cadastro do usuário";

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
    };

    useEffect(() => {
        loadUserRoles();

        setUserData({
            ...userData,
            password: randomPassword(16)
        });
    }, []);

    const loadUserRoles = () => {
        PrivateApi.get("/user/roles").then((res: AxiosResponse) => {
            let data: any[] = res.data;
            setUserRoles(data);
        });
    }

    return (
        <>
            <Head>
                <title>Novo Usuário</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <h1>
                            <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push("/users")}>
                                <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                            </button> Novo Usuário
                        </h1>
                        <hr />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <form onSubmit={onSubmit}>
                                    <div className="row mb-4">
                                        <div className="col-12 col-lg-6 mb-4">
                                            <div className="form-floating">
                                                <input type="text" name="name" id="name" className="form-control border-0 shadow-sm" placeholder=" " required value={userData.name ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setUserData({...userData, name: e.target.value})} />
                                                <label htmlFor="name">Nome *</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6 mb-4">
                                            <div className="form-floating">
                                                <input type="email" name="email" id="email" className="form-control border-0 shadow-sm" placeholder=" " required value={userData.email ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setUserData({...userData, email: e.target.value})} />
                                                <label htmlFor="email">Endereço de E-mail *</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6 mb-4">
                                            <div className="form-floating">
                                                <input type={showPassword ? "text" : "password"} name="password" id="password" className="form-control border-0 shadow-sm" placeholder=" " required value={userData.password ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setUserData({...userData, password: e.target.value})} />
                                                <label htmlFor="password">Senha *</label>
                                                <div className="pw-toggle">
                                                    { showPassword ? (
                                                    <button type="button" className="btn border-0" onClick={() => setShowPassword(false)}>
                                                        <FontAwesomeIcon icon={faEyeSlash} fixedWidth />
                                                    </button>
                                                    ) : (
                                                    <button type="button" className="btn border-0" onClick={() => setShowPassword(true)}>
                                                        <FontAwesomeIcon icon={faEye} fixedWidth />
                                                    </button>
                                                    ) }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6 mb-4">
                                            <div className="form-floating">
                                                <Select options={userRoles} name="role" id="role" placeholder="" className="react-select-container" classNamePrefix="react-select" onChange={(option: any) => setUserData({...userData, role: option.value})} value={userRoles.filter((option) => option.value == userData.role)[0] ?? null} required />
                                                <label htmlFor="role" className="mb-2">Nível de Acesso</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            { submitting ? (
                                                <div className="spinner-border text-success" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            ) : (
                                                <button type="submit" className="btn btn-success shadow-sm">
                                                    <FontAwesomeIcon icon={faSave} fixedWidth /> Adicionar Usuário
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}