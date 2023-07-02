"use client";
import React, {ReactNode, startTransition, useEffect, useState} from "react";
import {getUser, refresh} from "@/lib/api";
import {usePathname, useRouter} from "next/navigation";
import {Loader2} from "lucide-react";

export const LoginProvider = ({children}: { children: ReactNode }):React.JSX.Element => {
    const [loading, setLoading] = useState(true)
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname === '/login') {
            setLoading(false);
        }
        getUser()
            .then((user) => {
                if (!user) {
                    refresh().then((done) => {
                        if (!done) {
                            router.replace('/login');
                        } else {
                            startTransition(() => {
                                setLoading(false);
                            });
                        }
                    }).catch(() => {
                        router.replace('/login');
                    });
                } else {
                    startTransition(() => {
                        setLoading(false);
                    });
                }
            })
            .catch(() => {
                router.replace('/login');
            });
    }, [pathname, router]);
    return loading ?  <Loader2 className="absolute top-[48vh] left-[48vw] h-28 w-28 animate-spin" /> : <>{children}</>
}
