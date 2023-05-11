import { UserContext } from "@/contexts/UserContext";
import { IClient } from "@/interfaces/IClient";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faEdit, faLightbulb, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Swal, { SweetAlertResult } from "sweetalert2";

export default function Clients()
{
    const router = useRouter();
    const {user} = useContext(UserContext);

    const [clients, setClients] = useState<Array<any>>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const columns: TableColumn<IClient>[] = [
        {
            name: "ID",
            selector: (client: IClient) => client.id ?? "",
            grow: 0
        },
        {
            name: "Nome",
            selector: (client: IClient) => client.name ?? "",
        },
        {
            name: "Projetos",
            cell: (client: IClient) => (
                <>
                    <Link href={`/clients/${client.id}/projects`} className="btn btn-sm btn-primary border-0 shadow-sm">
                        <FontAwesomeIcon icon={faLightbulb} fixedWidth /> Projetos
                    </Link>
                </>
            ),
        },
        {
            name: "",
            cell: (client: IClient) => (
                    <>
                        { (user?.role == "Admin" || user?.role == "Manager") && (
                        <Link href={`/clients/${client.id}`} className="btn btn-sm btn-outline-primary border-0 shadow-sm me-2">
                            <FontAwesomeIcon icon={faEdit} fixedWidth />
                        </Link>
                        ) }
                        { (user?.role == "Admin") && (
                        <button className="btn btn-sm btn-outline-danger border-0 shadow-sm" onClick={() => deleteClient(client)}>
                            <FontAwesomeIcon icon={faTrash} fixedWidth />
                        </button>
                        ) }
                    </>
            ),
            grow: 0,
        }
    ];

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = () => {
        setLoading(true);

        PrivateApi.get("/client").then((res: AxiosResponse) => {
            let data: any = res.data;
            setClients(data);
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante a listagem dos clientes";

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

    const deleteClient = (client: IClient) => {
        Swal.fire({
            icon: "question",
            title: "Tem certeza?",
            html: `Tem certeza que deseja excluir o cliente <b>${client.name}</b> e todos os dados relacionados (como projetos e credenciais)? <b>Importante:</b> essa ação é <u>irreversível</u>.`,
            showCancelButton: true,
            cancelButtonText: "Não",
            confirmButtonText: "Sim"
        }).then((result: SweetAlertResult) => {
            if(result.isConfirmed){
                PrivateApi.delete(`/client/${client.id}`).then((res: AxiosResponse) => {
                    Swal.fire({
                        icon: "success",
                        title: "Sucesso",
                        html: `O cliente <b>${client.name}</b> e todos os dados relacionados foram excluídos com sucesso.`
                    }).then((res: SweetAlertResult) => {
                        loadClients();
                    });
                }).catch((error: Error | AxiosError) => {
                    let message: string = "Ocorreu um erro durante a exclusão do cliente";

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
                <title>Clientes</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex flex-row justify-content-between align-items-center">
                            <div>
                                <h1>
                                    <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push("/dashboard")}>
                                        <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                                    </button> Clientes
                                </h1>
                            </div>
                            { (user?.role == "Admin" || user?.role == "Manager") && (
                            <div>
                                <Link href="/clients/new" className="btn btn-primary border-0 shadow-sm">
                                    <FontAwesomeIcon icon={faPlus} fixedWidth /> Adic. Novo
                                </Link>
                            </div>
                            ) }
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
                                    <DataTable columns={columns} data={clients} pagination />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}