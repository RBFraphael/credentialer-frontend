import { UserContext } from "@/contexts/UserContext";
import { IClient } from "@/interfaces/IClient";
import { IProject } from "@/interfaces/IProject";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function EditProject()
{
    const {user} = useContext(UserContext);

    const router = useRouter();
    const {clientId, projectId} = router.query;

    const [client, setClient] = useState<IClient>({});
    const [project, setProject] = useState<IProject>({});

    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if(router.isReady && user && user?.role !== "Admin" && user?.role !== "Manager"){
            router.push(`/clients/${clientId}/projects`);
        }
    }, [user, router.isReady]);

    useEffect(() => {
        if(router.isReady){
            loadClient();
            loadProject();
        }
    }, [router.isReady]);

    const loadClient = () => {
        PrivateApi.get(`/client/${clientId}`).then((res: AxiosResponse) => {
            let data: IClient = res.data;
            setClient(data);
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante o carregamento dos dados do cliente";

            if(axios.isAxiosError(error)){
                message = error.response?.data?.message ?? message;
            }

            Swal.fire({
                icon: "error",
                title: "Erro",
                text: message
            });
        });
    };

    const loadProject = () => {
        PrivateApi.get(`/project/${projectId}`).then((res: AxiosResponse) => {
            let data: IProject = res.data;
            setProject(data);
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante o carregamento dos dados do projeto";

            if(axios.isAxiosError(error)){
                message = error.response?.data?.message ?? message;
            }

            Swal.fire({
                icon: "error",
                title: "Erro",
                text: message
            });
        });
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        setSubmitting(true);

        let payload: IProject = {
            ...project,
            client_id: client.id
        };

        PrivateApi.put(`/project/${projectId}`, payload).then((res: AxiosResponse) => {
            Swal.fire({
                icon: "success",
                title: "Sucesso",
                html: `O projeto <b>${project.title}</b> foi atualizado com sucesso.`
            }).then(() => {
                router.push(`/clients/${clientId}/projects`);
            });
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante a atualização do projeto";

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

    return (
        <>
            <Head>
                <title>Editar Projeto</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <h1>
                            <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push(`/clients/${clientId}/projects`)}>
                                <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                            </button> Editar Projeto
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
                                        <div className="col-12 mb-4">
                                            <div className="form-floating">
                                                <input type="text" name="name" id="name" className="form-control border-0 shadow-sm" placeholder=" " required value={project.title ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setProject({...project, title: e.target.value})} />
                                                <label htmlFor="name">Título *</label>
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
                                                    <FontAwesomeIcon icon={faSave} fixedWidth /> Salvar Alterações
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