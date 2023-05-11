import { UserContext } from "@/contexts/UserContext";
import { IUser } from "@/interfaces/IUser";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Swal, { SweetAlertResult } from "sweetalert2";

export default function Users()
{
    const router = useRouter();
    const {user} = useContext(UserContext);

    const [users, setUsers] = useState<Array<any>>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const columns: TableColumn<IUser>[] = [
        {
            name: "ID",
            selector: (user: IUser) => user.id ?? "",
            grow: 0
        },
        {
            name: "Nome",
            selector: (user: IUser) => user.name ?? "",
        },
        {
            name: "E-mail",
            selector: (user: IUser) => user.email ?? "",
        },
        {
            name: "Acesso",
            selector: (user: IUser) => user.role ?? "",
            grow: 0
        },
        {
            name: "",
            cell: (user: IUser) => (
                <>
                    <Link href={`/users/${user.id}`} className="btn btn-sm btn-outline-primary border-0 shadow-sm me-2">
                        <FontAwesomeIcon icon={faEdit} fixedWidth />
                    </Link>
                    <button className="btn btn-sm btn-outline-danger border-0 shadow-sm" onClick={() => deleteUser(user)}>
                        <FontAwesomeIcon icon={faTrash} fixedWidth />
                    </button>
                </>
            ),
            grow: 0,
        }
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if(user !== null){
            validatePermission();
        }
    }, [user]);

    const validatePermission = () => {
        if(user?.role !== "Admin"){
            router.push("/");
        }
    };

    const loadUsers = () => {
        setLoading(true);

        PrivateApi.get("/user").then((res: AxiosResponse) => {
            let data: any = res.data;
            setUsers(data);
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante a listagem dos usuários";

            if(axios.isAxiosError(error)){
                message = error.response?.data?.message ?? message;
            }

            Swal.fire({
                icon: "error",
                title: "Erro",
                text: message
            });
        }).finally(() => {
            setLoading(false);
        });
    };

    const deleteUser = (user: IUser) => {
        Swal.fire({
            icon: "question",
            title: "Tem certeza?",
            html: `Tem certeza que deseja excluir o usuário <b>${user.name}</b>? <b>Importante:</b> essa ação é <u>irreversível</u>.`,
            showCancelButton: true,
            cancelButtonText: "Não",
            confirmButtonText: "Sim"
        }).then((result: SweetAlertResult) => {
            if(result.isConfirmed){
                PrivateApi.delete(`/user/${user.id}`).then((res: AxiosResponse) => {
                    Swal.fire({
                        icon: "success",
                        title: "Sucesso",
                        html: `O usuário <b>${user.name}</b> foi excluído com sucesso.`
                    }).then((res: SweetAlertResult) => {
                        loadUsers();
                    });
                }).catch((error: Error | AxiosError) => {
                    let message: string = "Ocorreu um erro durante a exclusão do usuário";

                    if(axios.isAxiosError(error)){
                        message = error.response?.data?.message ?? message;
                    }

                    Swal.fire({
                        icon: "error",
                        title: "Erro",
                        text: message
                    });
                });
            }
        });
    };

    return (
        <>
            <Head>
                <title>Usuários</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex flex-row justify-content-between align-items-center">
                            <div>
                                <h1>
                                    <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push("/dashboard")}>
                                        <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                                    </button> Usuários
                                </h1>
                            </div>
                            <div>
                                <Link href="/users/new" className="btn btn-primary border-0 shadow-sm">
                                    <FontAwesomeIcon icon={faPlus} fixedWidth /> Adic. Novo
                                </Link>
                            </div>
                        </div>
                        <hr />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                { loading ? (
                                    <div className="progress-bar">
                                        <div className="inner"></div>
                                    </div>
                                ) : (
                                    <DataTable columns={columns} data={users} pagination />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}