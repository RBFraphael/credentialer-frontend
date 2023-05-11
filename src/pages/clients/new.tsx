import { UserContext } from "@/contexts/UserContext";
import { IClient } from "@/interfaces/IClient";
import { IFile } from "@/interfaces/IFile";
import { PrivateApi } from "@/services/ApiService";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Swal from "sweetalert2";

export default function NewClient()
{
    const {user} = useContext(UserContext);

    const router = useRouter();
    const [clientData, setClientData] = useState<IClient>({});
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);

    useEffect(() => {
        if(user && user?.role !== "Admin" && user?.role !== "Manager"){
            router.push("/clients");
        }
    }, [user]);

    const uploadLogo = (e: ChangeEvent<HTMLInputElement>) => {
        let files = e.target.files;
        if(files && files?.length > 0){
            setUploadingLogo(true);

            let payload = new FormData();
            payload.append("file", files[0]);

            PrivateApi.post("/file", payload, {
                headers: {
                    'Content-type': "multipart/form-data"
                }
            }).then((res: AxiosResponse) => {
                let data: IFile = res.data;
                setClientData({
                    ...clientData,
                    logo: data,
                    logo_file_id: data.id
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
            }).finally(() => {
                setUploadingLogo(false);
            });
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        setSubmitting(true);

        let payload: IClient = {
            ...clientData
        };

        PrivateApi.post("/client", payload).then((res: AxiosResponse) => {
            Swal.fire({
                icon: "success",
                title: "Sucesso",
                html: `O cliente <b>${clientData.name}</b> foi adicionado com sucesso.`
            }).then(() => {
                router.push("/clients");
            });
        }).catch((error: Error | AxiosError) => {
            let message: string = "Ocorreu um erro durante o cadastro do cliente";

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
                <title>Novo Cliente</title>
            </Head>

            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <h1>
                            <button className="btn btn-outline-light btn-sm border-0 me-2" onClick={() => router.push("/clients")}>
                                <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                            </button> Novo Cliente
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
                                                <input type="text" name="name" id="name" className="form-control border-0 shadow-sm" placeholder=" " required value={clientData.name ?? ""} onChange={(e: ChangeEvent<HTMLInputElement>) => setClientData({...clientData, name: e.target.value})} />
                                                <label htmlFor="name">Nome *</label>
                                            </div>
                                        </div>
                                        <div className="col-12 mb-4">
                                            <div className="d-flex flex-row">
                                                { clientData.logo && (
                                                    <div className="client-logo me-3 flex-grow-0 flex-shrink-0">
                                                        <Image src={clientData.logo.url ?? ""} alt={clientData.name ?? ""} className="client-logo-preview" width={100} height={100} />
                                                    </div>
                                                ) }
                                                <div className="profile-picture-input flex-grow-1">
                                                    <Form.Group controlId="client_logo">
                                                        <Form.Label>Logo:</Form.Label>
                                                        <Form.Control type="file" onChange={uploadLogo} />
                                                    </Form.Group>
                                                    { uploadingLogo && (
                                                        <div className="progress-bar">
                                                            <div className="inner"></div>
                                                        </div>
                                                    )}
                                                </div>
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
                                                    <FontAwesomeIcon icon={faSave} fixedWidth /> Adicionar Cliente
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