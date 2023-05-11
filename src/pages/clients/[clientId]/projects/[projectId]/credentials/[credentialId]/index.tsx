import { UserContext } from "@/contexts/UserContext";
import { ICredential } from "@/interfaces/ICredential";
import { IFile } from "@/interfaces/IFile";
import { IProject } from "@/interfaces/IProject";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faCopy, faExternalLinkAlt, faEye, faEyeSlash, faPlus, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import Swal from "sweetalert2";

export default function Credential()
{
    const router = useRouter();
    const {clientId, projectId, credentialId} = router.query;
    const [credential, setCredential] = useState<ICredential>({});
    const [passwordCopied, setPasswordCopied] = useState<boolean>(false);

    useEffect(() => {
        if(router.isReady){
            loadCredential();
        }
    }, [router.isReady]);

    const loadCredential = () => {
        PrivateApi.get(`/credential/${credentialId}?with[]=files&with[]=project.client`).then((res: AxiosResponse) => {
            let data: ICredential = res.data;
            setCredential(data);
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante o carregamento dos dados da credencial";

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

    const copyPassword = () => {
        if(typeof navigator !== "undefined"){
            navigator.clipboard.writeText(credential.password ?? "");
            setPasswordCopied(true);

            setTimeout(() => {
                setPasswordCopied(false);
            }, 5000);
        }
    };

    return (
        <>
            <Head>
                <title>Dados da Credencial</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <h1>
                            <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push(`/clients/${clientId}/projects/${projectId}/credentials`)}>
                                <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                            </button> Dados da Credencial &quot;{credential.title}&quot;
                        </h1>
                        <hr />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-stripper table-hover">
                                        <tbody>
                                            <tr>
                                                <th>Cliente:</th>
                                                <td>{ credential.project?.client?.name ?? "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>Projeto:</th>
                                                <td>{ credential.project?.title ?? "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>Título:</th>
                                                <td>{ credential.title ?? "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>Tipo:</th>
                                                <td>{ credential.type ?? "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>Informações Adicionais:</th>
                                                <td>{ credential.info ?? "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>
                                                { (() => {
                                                    switch(credential.type){
                                                        case "FTP": case "SFTP": case "SSH": case "Database":
                                                            return "Host";
                                                        case "VPN":
                                                            return "Gateway";
                                                        default:
                                                            return "Link de Acesso";
                                                    }
                                                })() }:
                                                </th>
                                                <td>{ credential.gateway ?? "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>Porta:</th>
                                                <td>{ credential.port ?? "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>Usuário:</th>
                                                <td>{ credential.user ?? "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>Senha:</th>
                                                <td>{ credential.password ? (
                                                    <>
                                                        <span className="me-2">
                                                            {credential.password}
                                                        </span>
                                                        <button className="btn btn-primary btn-sm border-0 shadow-sm me-2" onClick={copyPassword}>
                                                            <FontAwesomeIcon icon={faCopy} fixedWidth />
                                                        </button>
                                                        { passwordCopied && (
                                                            <span className="text-success">Copiado!</span>
                                                        ) }
                                                    </>
                                                ) : "Não disponível" }</td>
                                            </tr>
                                            <tr>
                                                <th>Arquivos:</th>
                                                <td>
                                                    { (credential.files && credential.files?.length > 0) ? (
                                                        <ul className="list-unstyled">
                                                            { credential.files.map((file: IFile, index: number) => (
                                                                <li key={index}>
                                                                    <Link href={file.url ?? ""} target="blank" className="text-decoration-none">
                                                                        <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth /> { file.name ?? "" }
                                                                    </Link>
                                                                </li>
                                                            ) ) }
                                                        </ul>
                                                    ) : "Não disponível" }
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}