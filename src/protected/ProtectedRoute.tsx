import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import React, { useEffect, useState } from "react";

interface AppUser extends User {
    role: "Doctor" | "Pharmacist";
    name: string;
    createdAt: unknown;
    lastName: string;
    middleName: string;
}

interface ProtectedRouteProps {
    children: React.ReactElement<any>;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setLoading(false);
                return;
            }

            const ref = doc(db, "users", firebaseUser.uid);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                setLoading(false);
                return;
            }

            setUser({
                ...firebaseUser,
                ...(snap.data() as Omit<AppUser, keyof User>),
            });

            setLoading(false);
        });

        return () => unsub();
    }, []);

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return React.cloneElement(children, { user });
}
