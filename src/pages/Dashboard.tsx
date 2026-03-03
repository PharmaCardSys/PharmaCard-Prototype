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
import logo from "../assets/images/logo.png";

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
                            PharmaCard Digital Prescription Management
                        </h1>
                        <p className="text-sm text-[#214662]/80">
                            PharmaCard allows individuals to store and view
                            their prescriptions digitally. It helps doctors
                            reduce errors in writing prescriptions and enables
                            pharmacists to read prescriptions more easily and
                            accurately.
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
                            How to obtain and use PharmaCard
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
                                    Obtaining A Card
                                </h2>
                                <p className="text-sm text-[#214662]/80">
                                    You may register for a PharmaCard by
                                    submitting the required documents to any
                                    hospital that has adopted the PharmaCard
                                    system.
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
                                    Prescribing By A Doctor
                                </h2>
                                <p className="text-sm text-[#214662]/80">
                                    During check-ups, simply present your
                                    PharmaCard to your doctor so they can encode
                                    a new prescription into the system database.
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
                                    Submitting To A Pharmacist
                                </h2>
                                <p className="text-sm text-[#214662]/80">
                                    After the card is returned, users may scan
                                    it using their phone to view their
                                    prescription or present it at a pharmacy to
                                    claim their medication.
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
                            How does PharmaCard benefit its users?
                        </h1>

                        <p className="text-sm md:text-base text-[#214662]/80 leading-relaxed">
                            A study conducted by Hodkinson et al. (2020) found
                            that prescribing errors were the largest source of
                            preventable medication harm, accounting for 58% of
                            cases. This is supported by the findings of Abunales
                            et al. (2025) at the Philippine General Hospital,
                            where prescribing errors accounted for 99.1% of
                            recorded medication errors, with 1.17% resulting in
                            harm.
                        </p>

                        <p className="text-sm md:text-base text-[#214662]/80 leading-relaxed">
                            This capstone project aims to address this issue by
                            developing a prototype prescription card system
                            designed to minimize prescribing errors. Based on
                            our quantitative findings, no prescription coding
                            errors were observed during testing. However, the
                            website may still be improved to reduce the current
                            4% lag rate, which may affect workflow efficiency.
                        </p>

                        <p className="text-sm md:text-base text-[#214662]/80 leading-relaxed">
                            Source:
                            <br />
                            Abunales, J. L., OrdoñEz, J. R. V., Salandanan, S.
                            B. B., Ayran, C. M. G., & Reyes-Abaya, R. (2025).
                            Evaluation of Medication Errors among Inpatients in
                            a Tertiary Government Hospital's Pulmonary Medicine
                            Service: A Cross-sectional Retrospective Study. Acta
                            medica Philippina, 59(9), 40–61.
                            <br />
                            <a href="https://doi.org/10.47895/amp.vi0.10684">
                                https://doi.org/10.47895/amp.vi0.10684
                            </a>
                        </p>

                        <p className="text-sm md:text-base text-[#214662]/80 leading-relaxed">
                            Hodkinson, A., Tyler, N., Ashcroft, D. M., Keers, R.
                            N., Khan, K., Phipps, D., Abuzour, A., Bower, P.,
                            Avery, A., Campbell, S., & Panagioti, M. (2020).
                            Preventable medication harm across health care
                            settings: a systematic review and meta-analysis. BMC
                            medicine, 18(1), 313.
                            <br />
                            <a href="https://doi.org/10.1186/s12916-020-01774-9">
                                https://doi.org/10.1186/s12916-020-01774-9
                            </a>
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
                <div className="w-full px-4 mb-16">
                    <div className="mx-auto max-w-3xl">
                        <div className="px-5 py-8 sm:px-8 sm:py-10 flex flex-col items-center text-center gap-5">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#214662] leading-snug">
                                “Reliable Prescriptions. Simpler Management.”
                            </h1>

                            <div className="w-full flex justify-center">
                                <img
                                    src={logo}
                                    alt="PharmaCard Logo"
                                    className="w-[220px] sm:w-[260px] md:w-[320px] h-auto object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flex Grow LOl! */}
                <div className="flex flex-grow"></div>

                {/* Footer Here */}
                <Footer />
            </div>
        </>
    );
}
