import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

export default function Header() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [openMenu, setOpenMenu] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setUserData(null);
                return;
            }

            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            if (snap.exists()) {
                setUserData(snap.data());
                setIsLoggedIn(true);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        setUserData(null);
        setIsLoggedIn(false);
        setOpenMenu(false);
        navigate("/login");
        toast.success("Signed out successfully");
    };

    return (
        <>
            {/* Header */}
            <div className="w-full bg-[#214662] text-[#F8F5F1] shadow-md flex items-center justify-between">
                <div className="container mx-auto p-4 flex md:flex-row items-center md:items-start justify-between gap-8">
                    <div>
                        <p
                            className="text-lg md:text-xl text-[#B4C4D0] cursor-pointer font-semibold"
                            onClick={() => navigate("/")}
                        >
                            PharmaCard
                        </p>
                    </div>

                    {/* Right (future actions) */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="link"
                            className="text-sm text-[#E1DFE1]"
                            onClick={() => navigate("/prescription")}
                        >
                            View Prescription
                        </Button>

                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setOpenMenu((prev) => !prev)}
                                    className="w-9 h-9 rounded-full bg-[#B4C4D0] flex items-center justify-center text-[#214662] font-semibold"
                                    title="Profile"
                                >
                                    {userData?.name?.charAt(0) ?? "U"}
                                </button>

                                {openMenu && (
                                    <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg border border-gray-200">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 rounded-md py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button
                                variant="secondary"
                                className="text-sm text-[#214662]"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
