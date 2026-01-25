import Header from "./components/Header";
import Footer from "./components/Footer";
import { Button } from "@/components/ui/button";
import rfcimage from "../assets/images/rfc.webp";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);

    // Fetch user data
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
            }
        });

        return () => unsubscribe();
    }, []);

    const handleWritePrescription = () => {
        if (!userData) {
            navigate("/login");
            return;
        }

        if (userData.role !== "Doctor") {
            toast.warning("You don't have permission to access this.");
            return;
        }

        navigate("/write-prescription");
    };

    const handlePharmacistAccess = () => {
        if (!userData) {
            navigate("/login");
            return;
        }

        if (userData.role !== "Pharmacist") {
            toast.warning("You don't have permission to access this.");
            return;
        }

        navigate("/checkout-rx");
    };

    return (
        <>
            {/* Whole Container */}
            <div className="w-full min-h-screen bg-[#F8F5F1] text-[#214662] flex flex-col items-center justify-start">
                {/* Header Here */}
                <Header />

                {/* Banner */}
                <div className="w-full bg-gradient-to-b from-[#B4C4D0] to-[#F8F5F1] flex items-center justify-center flex-col py-24 px-4 md:px-0">
                    {/* First Card */}
                    <div className="flex flex-col items-center justify-center gap-4 text-center max-w-xl px-4 md:px-0">
                        <h1 className="text-4xl font-bold text-[#214662]">
                            Smart Prescription Management
                        </h1>
                        <p className="text-sm text-[#214662]/80">
                            PharmaCard allows doctors to digitally issue
                            prescriptions and enables pharmacists to instantly
                            verify them using NFC cards.
                        </p>
                    </div>

                    {/* Buttons Card Div*/}
                    <div className="flex items-center justify-center gap-8 mt-12">
                        <Button
                            variant="default"
                            className="bg-[#214662] text-white hover:bg-[#214662]/80"
                            onClick={handleWritePrescription}
                        >
                            Write Prescription
                        </Button>

                        <Button
                            variant="default"
                            className="bg-[#214662] text-white hover:bg-[#214662]/80"
                            onClick={handlePharmacistAccess}
                        >
                            Pharmacist Access
                        </Button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="container flex flex-col items-center justify-center py-8">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <h1 className="text-2xl font-bold text-[#214662]">
                            How PharmaCard Works
                        </h1>

                        {/* Card Section */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-center justify-center gap-2 max-w-xs text-center">
                                <div className="w-16 h-16 bg-[#214662]/10 rounded-full flex items-center justify-center">
                                    <span className="text-[#214662] font-bold">
                                        1
                                    </span>
                                </div>
                                <h2 className="text-lg font-semibold text-[#214662]">
                                    Digital Prescription
                                </h2>
                                <p className="text-sm text-[#214662]/80">
                                    Doctors create prescriptions digitally.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col items-center justify-center gap-2 max-w-xs text-center">
                                <div className="w-16 h-16 bg-[#214662]/10 rounded-full flex items-center justify-center">
                                    <span className="text-[#214662] font-bold">
                                        2
                                    </span>
                                </div>
                                <h2 className="text-lg font-semibold text-[#214662]">
                                    NFC Card Verification
                                </h2>
                                <p className="text-sm text-[#214662]/80">
                                    Pharmacists verify prescriptions instantly.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col items-center justify-center gap-2 max-w-xs text-center">
                                <div className="w-16 h-16 bg-[#214662]/10 rounded-full flex items-center justify-center">
                                    <span className="text-[#214662] font-bold">
                                        3
                                    </span>
                                </div>
                                <h2 className="text-lg font-semibold text-[#214662]">
                                    Secure & Efficient
                                </h2>
                                <p className="text-sm text-[#214662]/80">
                                    Secure digital transactions and faster
                                    processing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Displayer with Image */}
                <div className="container flex flex-col md:flex-row items-start md:justify-center gap-12 mt-16 mb-24 md:px-0 px-8">
                    {/* Text */}
                    <div className="flex flex-col gap-6 md:w-1/2">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                            Why is PharmaCard better than traditional
                            prescribing?
                        </h1>

                        <p className="text-sm md:text-base text-[#214662]/80 leading-relaxed">
                            PharmaCard improves the traditional prescription
                            workflow by minimizing manual errors, improving
                            verification speed, and providing a secure digital
                            reference for both doctors and pharmacists.
                        </p>

                        <p className="text-sm md:text-base text-[#214662]/80 leading-relaxed">
                            By digitizing prescriptions and linking them through
                            NFC cards, PharmaCard enables faster validation
                            while ensuring accuracy and accountability across
                            healthcare providers.
                        </p>
                    </div>

                    {/* Image */}
                    <div className="flex justify-center">
                        <img
                            src={rfcimage}
                            alt="PharmaCard NFC"
                            className="w-full max-w-md rounded-xl shadow-lg object-contain"
                        />
                    </div>
                </div>

                {/* Last Card Box */}
                <div className="container mx-auto flex items-center justify-center px-4 mb-16">
                    <h1 className="text-center text-2xl md:text-3xl font-semibold text-[#214662] max-w-2xl leading-relaxed">
                        “A smarter way to issue and verify prescriptions.”
                    </h1>
                </div>

                {/* Flex Grow LOl! */}
                <div className="flex flex-grow"></div>

                {/* Footer Here */}
                <Footer />
            </div>
        </>
    );
}
