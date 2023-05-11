import { UserContext } from "@/contexts/UserContext";
import { IClient } from "@/interfaces/IClient";
import { IProject } from "@/interfaces/IProject";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faEdit, faKey, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Swal, { SweetAlertResult } from "sweetalert2";

export default function Projects()
{
    const router = useRouter();
    const {clientId} = router.query;
    const {user} = useContext(UserContext);
    const [client, setClient] = useState<IClient>({});
    const [loading, setLoading] = useState<boolean>(false);

    const columns: TableColumn<IProject>[] = [
        {
            name: "ID",
            selector: (project: IProject) => project.id ?? "",
            grow: 0
        },
        {
            name: "Título",
            selector: (project: IProject) => project.title ?? "",
        },
        {
            name: "Credenciais",
            cell: (project: IProject) => (
                <>
                    <Link href={`/clients/${clientId}/projects/${project.id}/credentials`} className="btn btn-sm btn-primary border-0 shadow-sm">
                        <FontAwesomeIcon icon={faKey} fixedWidth /> Credenciais
                    </Link>
                </>
            ),
        },
        {
            name: "",
            cell: (project: IProject) => (
                <>
                    { (user?.role == "Admin" || user?.role == "Manager") && (
                    <Link href={`/clients/${clientId}/projects/${project.id}`} className="btn btn-sm btn-outline-primary border-0 shadow-sm me-2">
                        <FontAwesomeIcon icon={faEdit} fixedWidth />
                    </Link>
                    ) }
                    { user?.role == "Admin" && (
                    <button className="btn btn-sm btn-outline-danger border-0 shadow-sm" onClick={() => deleteProject(project)}>
                        <FontAwesomeIcon icon={faTrash} fixedWidth />
                    </button>
                    ) }
                </>
            ),
            grow: 0,
        }
    ];

    useEffect(() => {
        if(router.isReady){
            loadClient();
        }
    }, [router.isReady]);

    const loadClient = () => {
        setLoading(true);

        PrivateApi.get(`/client/${clientId}?with[]=projects`).then((res: AxiosResponse) => {
            let data: IClient = res.data;
            setClient(data);
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante a obtenção dos dados do cliente";

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

    const deleteProject = (project: IProject) => {
        Swal.fire({
            icon: "question",
            title: "Tem certeza?",
            html: `Tem certeza que deseja excluir o projeto <b>${project.title}</b> e todos os dados relacionados (como credenciais)? <b>Importante:</b> essa ação é <u>irreversível</u>.`,
            showCancelButton: true,
            cancelButtonText: "Não",
            confirmButtonText: "Sim"
        }).then((result: SweetAlertResult) => {
            if(result.isConfirmed){
                PrivateApi.delete(`/project/${project.id}`).then((res: AxiosResponse) => {
                    Swal.fire({
                        icon: "success",
                        title: "Sucesso",
                        html: `O projeto <b>${project.title}</b> e todos os dados relacionados foram excluídos com sucesso.`
                    }).then((res: SweetAlertResult) => {
                        loadClient();
                    });
                }).catch((error: Error | AxiosError) => {
                    let message: string = "Ocorreu um erro durante a exclusão do projeto";

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
                <title>Projetos</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex flex-row justify-content-between align-items-center">
                            <div>
                                <h1>
                                    <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push("/clients")}>
                                        <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                                    </button> Projetos do Cliente &quot;{client.name ?? ""}&quot;
                                </h1>
                            </div>
                            { (user?.role == "Admin" || user?.role == "Manager") && (
                            <div>
                                <Link href={`/clients/${clientId}/projects/new`} className="btn btn-primary border-0 shadow-sm">
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
                                    <DataTable columns={columns} data={client.projects ?? []} pagination />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}