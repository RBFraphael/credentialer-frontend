import { UserContext } from "@/contexts/UserContext";
import { IComponentProps } from "@/interfaces/IComponentProps";
import { useContext } from "react";
import LogoLight from "../assets/logo-light.svg";
import Image from "next/image";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "react-bootstrap";
import Link from "next/link";

export default function Panel({children}: IComponentProps)
{
    const { user } = useContext(UserContext);

    return (
        <>
            { user == null ? (
                children
            ) : (
                <div className="panel">
                    <header className="container-fluid p-3 bg-primary shadow">
                        <div className="row align-items-center">
                            <div className="col-4">
                                <Link href="/">
                                    <Image src={LogoLight} className="logo" alt="Credentialer Logo" />
                                </Link>
                            </div>
                            <div className="col-8">
                                <div className="d-flex flex-row align-items-center justify-content-end">
                                    <div className="welcome text-end me-2">
                                        <p className="text-light m-0">Olá, { user.name }!</p>
                                    </div>
                                    <div>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="outline-light" id="user-menu">
                                                <FontAwesomeIcon icon={faUser} fixedWidth />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="border-0 shadow-sm">
                                                <Dropdown.Item className="p-0">
                                                    <Link href="/my-account" className="text-dark d-block text-decoration-none px-3 py-1">Minha Conta</Link>
                                                </Dropdown.Item>
                                                <Dropdown.Item className="p-0">
                                                    <Link href="/logout" className="text-dark d-block text-decoration-none px-3 py-1">Sair</Link>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="p-3">
                        { children }
                    </main>
                </div>
            )}
        </>
    );
}
