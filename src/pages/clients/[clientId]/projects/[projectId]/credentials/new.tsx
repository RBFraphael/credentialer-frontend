import { UserContext } from "@/contexts/UserContext";
import { ICredential } from "@/interfaces/ICredential";
import { IFile } from "@/interfaces/IFile";
import { IProject } from "@/interfaces/IProject";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faExternalLinkAlt, faEye, faEyeSlash, faPlus, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import Swal from "sweetalert2";

export default function NewCredential()
{
    const {user} = useContext(UserContext);

    const router = useRouter();
    const {clientId, projectId} = router.query;
    const [project, setProject] = useState<IProject>({});
    const [credential, setCredential] = useState<ICredential>({});
    const [showPassword, setShowPassword] = useState<boolean>(true);
    const [types, setTypes] = useState<any[]>([]);

    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if(router.isReady && user && user?.role !== "Admin" && user?.role !== "Manager"){
            router.push(`/clients/${clientId}/projects/${projectId}/credentials`);
        }
    }, [user, router.isReady]);

    useEffect(() => {
        if(router.isReady){
            loadProject();
            loadCredentialTypes();
        }
    }, [router.isReady]);

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

    const loadCredentialTypes = () => {
        PrivateApi.get("/credential/types").then((res: AxiosResponse) => {
            let data = res.data;
            setTypes(data);
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante o carregamento dos tipos de credenciais";

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

    const onChangeType = (selectedOption: any) => {
        let type = selectedOption.value;

        let port = "";
        switch(type){
            case "FTP":
                port = "21";
                break;
            case "SFTP": case "SSH":
                port = "22";
                break;
            case "Database":
                port = "3306";
                break;
            default:
                port = credential.port ?? "";
                break;
        }

        setCredential({
            ...credential,
            type: type,
            port: port
        });
    };

    const addFile = () => {
        let credentialFiles = credential.files ?? [];
        credentialFiles.push({});
        setCredential({
            ...credential,
            files: credentialFiles
        });
    }

    const uploadFile = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        let files = e.target.files;
        if(files && files?.length > 0){
            let payload = new FormData();
            payload.append("file", files[0]);

            PrivateApi.post("/file", payload, {
                headers: {
                    'Content-type': "multipart/form-data"
                }
            }).then((res: AxiosResponse) => {
                let data: IFile = res.data;
                
                let credentialFiles = credential.files ?? [{}];
                credentialFiles[index] = data;
                setCredential({
                    ...credential,
                    files: credentialFiles
                });
            }).catch((error: Error | AxiosError) => {
                let message: string = "Ocorreu um erro durante o upload do logo";

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
    }

    const removeFile = (index: number) => {
        let credentialFiles = credential.files ?? [];
        credentialFiles.splice(index, 1);
        setCredential({
            ...credential,
            files: credentialFiles
        });
    }

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        setSubmitting(true);

        let payload: any = {
            ...credential,
            project_id: project.id,
            files: credential.files?.filter((file: IFile) => {
                return file.id ? true : false;
            }).map((file: IFile) => file.id)
        };

        PrivateApi.post("/credential", payload).then((res: AxiosResponse) => {
            Swal.fire({
                icon: "success",
                title: "Sucesso",
                html: `A credencial <b>${credential.title}</b> foi adicionada com sucesso.`
            }).then(() => {
                router.push(`/clients/${clientId}/projects/${projectId}/credentials`);
            });
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante o cadastro da credencial";

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
                <title>Nova Credencial</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <h1>
                            <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push(`/clients/${clientId}/projects/${projectId}/credentials`)}>
                                <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                            </button> Nova Credencial do Projeto &quot;{project.title}&quot;
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
                                                <input type="text" name="name" id="name" className="form-control border-0 shadow-sm" placeholder=" " required value={credential.title ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setCredential({...credential, title: e.target.value})} />
                                                <label htmlFor="name">Título *</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6 mb-4">
                                            <div className="form-floating">
                                                <Select options={types} name="role" id="role" placeholder="" className="react-select-container" classNamePrefix="react-select" onChange={onChangeType} value={types.filter((option) => option.value == credential.type)[0] ?? null} required />
                                                <label htmlFor="role" className="mb-2">Tipo *</label>
                                            </div>
                                        </div>
                                        <div className="col-12 mb-4">
                                            <div className="form-floating">
                                                <textarea name="info" id="info" style={{height:"10rem",resize:"none"}} className="form-control border-0 shadow-sm" placeholder=" " value={credential.info ?? ""} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCredential({...credential, info: e.target.value})}></textarea>
                                                <label htmlFor="info">Informações Adicionais</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-8">
                                            <div className="form-floating">
                                                <input type="text" name="gateway" id="gateway" className="form-control border-0 shadow-sm" placeholder=" " required value={credential.gateway ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setCredential({...credential, gateway: e.target.value})} />
                                                <label htmlFor="gateway">
                                                    { (() => {
                                                        switch(credential.type){
                                                            case "FTP": case "SFTP": case "SSH": case "Database":
                                                                return "Host";
                                                            case "VPN":
                                                                return "Gateway";
                                                            default:
                                                                return "Link de Acesso";
                                                        }
                                                    })() } *
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-4 mb-4">
                                            <div className="form-floating">
                                                <input type="text" name="port" id="port" className="form-control border-0 shadow-sm" placeholder=" " value={credential.port ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setCredential({...credential, port: e.target.value})} />
                                                <label htmlFor="port">Porta</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6 mb-4">
                                            <div className="form-floating">
                                                <input type="text" name="user" id="user" className="form-control border-0 shadow-sm" placeholder=" " required value={credential.user ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setCredential({...credential, user: e.target.value})} />
                                                <label htmlFor="user">Usuário *</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6 mb-4">
                                            <div className="form-floating">
                                                <input type={showPassword ? "text" : "password"} name="password" id="password" className="form-control border-0 shadow-sm" placeholder=" " value={credential.password ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setCredential({...credential, password: e.target.value})} />
                                                <label htmlFor="password">Senha</label>
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
                                        <div className="col-12 mb-4">
                                            <p>Arquivos:</p>
                                            { credential.files?.map((file: IFile, index: number) => (
                                                <div className="row py-3 border-bottom" key={index}>
                                                    <div className="col-12">
                                                        <div className="d-flex flex-column-reverse flex-lg-row align-items-center mb-2">
                                                            { file.url && (
                                                            <div className="mb-3 mb-lg-0 me-lg-3 flex-grow-0">
                                                                <Link href={file.url ?? ""} target="_blank" className="text-center d-block text-decoration-none">
                                                                    <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth size="2x" className="mb-2" />
                                                                    <p className="m-0 fw-bold">{ file.name ?? "" }</p>
                                                                </Link>
                                                            </div>
                                                            ) }
                                                            <div className="flex-grow-1">
                                                                <Form.Group controlId="client_logo">
                                                                    <Form.Label>{ file.url ? "Alterar Arquivo" : "Selecionar Arquivo" }:</Form.Label>
                                                                    <Form.Control type="file" onChange={(e: ChangeEvent<HTMLInputElement>) => uploadFile(e, index)} />
                                                                </Form.Group>
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            <button type="button" className="btn btn-outline-danger border-0 shadow-sm btn-sm" onClick={() => removeFile(index)}>
                                                                <FontAwesomeIcon icon={faTrash} fixedWidth /> Remover
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) }
                                            <div className="text-end mt-3">
                                                <button type="button" className="btn btn-primary border-0 shadow-sm btn-sm" onClick={() => addFile()}>
                                                    <FontAwesomeIcon icon={faPlus} fixedWidth /> Adicionar
                                                </button>
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
                                                    <FontAwesomeIcon icon={faSave} fixedWidth /> Adicionar Credencial
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