import { UserContext } from "@/contexts/UserContext";
import { faArrowRightFromBracket, faCircleUser, faUserGroup, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import Link from "next/link";
import { useContext } from "react";

export default function Dashboard()
{
    const {user} = useContext(UserContext);

    return (
        <>
            <Head>
                <title>Dashboard - Credentialer</title>
            </Head>

            <main className="container-fluid">
                <div className="row mb-5">
                    <div className="col-12">
                        <h1>Dashboard</h1>
                        <hr />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                        <Link href="/clients" className="btn btn-light btn-lg border-0 shadow-sm p-4 d-block fw-bold pb-3">
                            <FontAwesomeIcon icon={faUserTie} size="3x" fixedWidth className="mb-3" />
                            <br />
                            Clientes
                        </Link>
                    </div>
                    { user?.role == "Admin" && (
                    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                        <Link href="/users" className="btn btn-light btn-lg border-0 shadow-sm p-4 d-block fw-bold pb-3">
                            <FontAwesomeIcon icon={faUserGroup} size="3x" fixedWidth className="mb-3" />
                            <br />
                            Usuários
                        </Link>
                    </div>
                    ) }
                    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                        <Link href="/my-account" className="btn btn-light btn-lg border-0 shadow-sm p-4 d-block fw-bold pb-3">
                            <FontAwesomeIcon icon={faCircleUser} size="3x" fixedWidth className="mb-3" />
                            <br />
                            Minha Conta
                        </Link>
                    </div>
                    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                        <Link href="/logout" className="btn btn-light btn-lg border-0 shadow-sm p-4 d-block fw-bold pb-3">
                            <FontAwesomeIcon icon={faArrowRightFromBracket} size="3x" fixedWidth className="mb-3" />
                            <br />
                            Sair
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
