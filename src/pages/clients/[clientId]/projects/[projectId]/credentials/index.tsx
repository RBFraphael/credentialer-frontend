import { UserContext } from "@/contexts/UserContext";
import { ICredential } from "@/interfaces/ICredential";
import { IProject } from "@/interfaces/IProject";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faEdit, faEye, faKey, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Swal, { SweetAlertResult } from "sweetalert2";

export default function Credentials()
{
    const router = useRouter();
    const {clientId, projectId} = router.query;
    const {user} = useContext(UserContext);

    const [project, setProject] = useState<IProject>({});

    const [loading, setLoading] = useState<boolean>(false);

    const columns: TableColumn<ICredential>[] = [
        {
            name: "ID",
            selector: (credential: ICredential) => credential.id ?? "",
            grow: 0
        },
        {
            name: "Título",
            selector: (credential: ICredential) => credential.title ?? "",
        },
        {
            name: "Tipo",
            selector: (credential: ICredential) => credential.type ?? "",
            grow: 0
        },
        {
            name: "",
            cell: (credential: ICredential) => (
                <>
                    <Link href={`/clients/${clientId}/projects/${projectId}/credentials/${credential.id}`} className="btn btn-sm btn-primary border-0 shadow-sm me-2">
                        <FontAwesomeIcon icon={faEye} fixedWidth />
                    </Link>
                    { (user?.role == "Admin" || user?.role == "Manager") && (
                    <Link href={`/clients/${clientId}/projects/${projectId}/credentials/${credential.id}/edit`} className="btn btn-sm btn-outline-primary border-0 shadow-sm me-2">
                        <FontAwesomeIcon icon={faEdit} fixedWidth />
                    </Link>
                    ) }
                    { user?.role == "Admin" && (
                    <button className="btn btn-sm btn-outline-danger border-0 shadow-sm" onClick={() => deleteCredential(credential)}>
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
            loadProject();
        }
    }, [router.isReady]);

    const loadProject = () => {
        setLoading(true);

        PrivateApi.get(`/project/${projectId}?with[]=client&with[]=credentials`).then((res: AxiosResponse) => {
            let data: IProject = res.data;
            setProject(data);
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante a obtenção dos dados do projeto";

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

    const deleteCredential = (credential: ICredential) => {
        Swal.fire({
            icon: "question",
            title: "Tem certeza?",
            html: `Tem certeza que deseja excluir a credencial <b>${credential.title}</b> e todos os dados relacionados (como arquivos)? <b>Importante:</b> essa ação é <u>irreversível</u>.`,
            showCancelButton: true,
            cancelButtonText: "Não",
            confirmButtonText: "Sim"
        }).then((result: SweetAlertResult) => {
            if(result.isConfirmed){
                PrivateApi.delete(`/credential/${credential.id}`).then((res: AxiosResponse) => {
                    Swal.fire({
                        icon: "success",
                        title: "Sucesso",
                        html: `A credencial <b>${credential.title}</b> e todos os dados relacionados foram excluídos com sucesso.`
                    }).then((res: SweetAlertResult) => {
                        loadProject();
                    });
                }).catch((error: Error | AxiosError) => {
                    let message: string = "Ocorreu um erro durante a exclusão da credencial";

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
                <title>Credenciais</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex flex-row justify-content-between align-items-center">
                            <div>
                                <h1>
                                    <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push(`/clients/${clientId}/projects`)}>
                                        <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                                    </button> Credenciais do Projeto &quot;{project.title ?? ""}&quot;
                                </h1>
                            </div>
                            { (user?.role == "Admin" || user?.role == "Manager") && (
                            <div>
                                <Link href={`/clients/${clientId}/projects/${projectId}/credentials/new`} className="btn btn-primary border-0 shadow-sm">
                                    <FontAwesomeIcon icon={faPlus} fixedWidth /> Adic. Nova
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
                                    <DataTable columns={columns} data={project.credentials ?? []} pagination />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}