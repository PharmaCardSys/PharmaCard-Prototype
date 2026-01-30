import { useState } from "react";
import Header from "./components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig";
import type { User } from "firebase/auth";
import { useEffect } from "react";

interface Props {
    user?: User & {
        role: "Doctor" | "Pharmacist";
        name: string;
        createdAt: unknown;
        email: string | null;
        lastName: string;
        middleName: string;
    };
}

export default function CheckoutRx({ user }: Props) {
    if (!user) return null;

    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const [prescriptionLink, setPrescriptionLink] = useState("");
    const [prescription, setPrescription] = useState<any>(null);
    const [validated, setValidated] = useState<boolean>(false);

    const displayValue = (value?: string) => {
        return value && value.trim() !== "" ? value : "NOT SPECIFIED";
    };

    const prescriptions = prescription?.mainPrescription || [];
    const latestIndex = prescriptions.length - 1;

    const latestRx = latestIndex >= 0 ? prescriptions[latestIndex] : null;

    const previousRx =
        latestIndex > 0 ? prescriptions.slice(0, latestIndex) : [];

    // Link Function
    const extractPrescriptionId = (input: string) => {
        if (!input) return null;

        let decoded = input.trim();

        // 1️⃣ Decode NFC / URL-encoded strings (pid%3D → pid=)
        try {
            decoded = decodeURIComponent(decoded);
        } catch {
            // ignore decode errors
        }

        // 2️⃣ Plain Firestore ID pasted
        if (
            !decoded.includes("/") &&
            !decoded.includes("?") &&
            !decoded.includes("=")
        ) {
            return decoded;
        }

        // 3️⃣ Normal query param ?pid=XXXX
        const match = decoded.match(/[?&]pid=([^&]+)/);
        if (match) return match[1];

        return null;
    };

    const fetchPrescription = async () => {
        const pid = extractPrescriptionId(prescriptionLink);

        if (!pid) {
            console.warn("No prescription ID found");
            return;
        }

        try {
            const ref = doc(db, "prescriptions", pid);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                console.warn("Prescription not found");
                return;
            }

            const data = snap.data();
            const latest =
                data.mainPrescription?.[data.mainPrescription.length - 1];

            setPrescription({
                id: snap.id,
                ...data,
                latestPrescription: latest,
            });

            setValidated(!!latest?.status);

            setOpen(false); // close modal
        } catch (error) {
            console.error("Error fetching prescription:", error);
        }
    };

    const handleValidatePrescription = async () => {
        if (!prescription?.id || !latestRx) return;

        try {
            const ref = doc(db, "prescriptions", prescription.id);

            const updatedPrescriptions = [...prescriptions];

            updatedPrescriptions[latestIndex] = {
                ...latestRx,
                status: true,
                validatedAt: new Date(),
            };

            await updateDoc(ref, {
                mainPrescription: updatedPrescriptions,
            });

            setPrescription((prev: any) => ({
                ...prev,
                mainPrescription: updatedPrescriptions,
                latestPrescription: updatedPrescriptions[latestIndex],
            }));

            setValidated(true);
        } catch (error) {
            console.error("Failed to validate prescription:", error);
        }
    };

    useEffect(() => {
        if (!user) return;

        if (user.role !== "Pharmacist") {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="w-full min-h-screen bg-[#F8F5F1] text-[#214662] flex flex-col items-center">
            <Header />

            {/* Modal Overlay */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white w-full max-w-md mx-4 rounded-xl shadow-lg p-6 z-10">
                        <h2 className="text-lg font-semibold mb-2 text-center">
                            Prescription Link
                        </h2>

                        <p className="text-sm text-gray-500 text-center mb-4">
                            Paste the prescription link provided by the RFC Card
                            or the doctor.
                        </p>

                        <input
                            type="text"
                            placeholder="https://example.com/prescription/..."
                            value={prescriptionLink}
                            onChange={(e) =>
                                setPrescriptionLink(e.target.value)
                            }
                            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#214662]"
                        />

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    navigate(-1);
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                className="bg-[#214662] text-white"
                                onClick={fetchPrescription}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {prescription &&
                prescription.latestPrescription &&
                (() => {
                    return (
                        <>
                            <div className="container max-w-4xl bg-white mt-8 p-6 rounded-lg shadow-md">
                                {/* Doctor Info */}
                                <div className="flex justify-center items-start gap-4 mb-4">
                                    {/* Hospital Logo */}
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                        {latestRx.hospitalLogo ? (
                                            <img
                                                src={latestRx.hospitalLogo}
                                                alt="Hospital Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <i className="fa-solid fa-hospital text-gray-400"></i>
                                        )}
                                    </div>

                                    {/* Doctor Info */}
                                    <div className="text-center">
                                        <h2 className="text-lg font-semibold">
                                            Dr. {latestRx.prescribedBy}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {latestRx.hospitalName}
                                        </p>
                                    </div>
                                </div>

                                <hr className="my-4" />

                                {/* Prescription List */}
                                <div className="flex gap-4">
                                    {/* RX Icon */}
                                    <div className="flex flex-col items-center">
                                        <span className="text-5xl font-bold text-[#214662]">
                                            ℞
                                        </span>
                                    </div>

                                    {/* Medicines */}
                                    <div className="flex-1 space-y-4">
                                        {latestRx.prescriptionList.map(
                                            (med: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
                                                >
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Medicine
                                                        </p>
                                                        <p className="font-medium text-gray-800">
                                                            {displayValue(
                                                                med.medicineName,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Dosage
                                                        </p>
                                                        <p className="font-medium text-gray-800">
                                                            {displayValue(
                                                                med.dosage,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Frequency
                                                        </p>
                                                        <p className="font-medium text-gray-800">
                                                            {displayValue(
                                                                med.frequency,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Duration
                                                        </p>
                                                        <p className="font-medium text-gray-800">
                                                            {displayValue(
                                                                med.duration,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <hr className="my-6" />

                                {/* Patient Info */}
                                <div className="flex gap-6 items-start">
                                    {/* Patient Image */}
                                    <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {prescription.patientImage ? (
                                            <img
                                                src={prescription.patientImage}
                                                alt="Patient"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <i className="fa-solid fa-user text-4xl text-gray-300"></i>
                                        )}
                                    </div>

                                    {/* Patient Details */}
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-semibold">
                                                Name:
                                            </span>{" "}
                                            {prescription.patientName}
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Age:
                                            </span>{" "}
                                            {prescription.patientAge}
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Sex:
                                            </span>{" "}
                                            {prescription.patientSex}
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Address:
                                            </span>{" "}
                                            {prescription.patientAddress || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex mt-6 items-center justify-between">
                                    {/* Status */}
                                    <div
                                        className={`text-sm font-semibold px-3 py-1 border rounded-md ${
                                            latestRx.status
                                                ? "text-green-600 border-green-500"
                                                : "text-yellow-600 border-yellow-500"
                                        }`}
                                    >
                                        Status:{" "}
                                        {latestRx.status
                                            ? "VALIDATED"
                                            : "PENDING"}
                                    </div>

                                    {/* Date */}
                                    <p className="text-sm text-gray-400">
                                        Issued on{" "}
                                        {latestRx.createdAt
                                            ? latestRx.createdAt.toDate
                                                ? latestRx.createdAt
                                                      .toDate()
                                                      .toLocaleDateString()
                                                : new Date(
                                                      latestRx.createdAt,
                                                  ).toLocaleDateString()
                                            : "—"}
                                    </p>
                                </div>
                            </div>

                            {!validated && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white mt-4 mb-4"
                                    onClick={handleValidatePrescription}
                                >
                                    VALIDATE
                                </Button>
                            )}

                            {/* Line */}
                            <div className="container max-w-4xl border-b border-gray-300 my-12 flex justify-center items-center relative">
                                <p className="absolute bg-[#F8F5F1] px-4 -top-3 text-gray-500 text-sm">
                                    Previous Prescriptions
                                </p>
                            </div>
                            {previousRx.length > 0 && (
                                <>
                                    {previousRx
                                        .slice()
                                        .reverse()
                                        .map((oldRx: any, index: number) => (
                                            <div
                                                key={index}
                                                className="container max-w-4xl bg-white p-6 rounded-lg shadow-md mb-8 opacity-80"
                                            >
                                                {/* Doctor Info */}
                                                <div className="flex justify-center items-start gap-4 mb-4">
                                                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                                                        {oldRx.hospitalLogo ? (
                                                            <img
                                                                src={
                                                                    oldRx.hospitalLogo
                                                                }
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <i className="fa-solid fa-hospital text-gray-400"></i>
                                                        )}
                                                    </div>

                                                    <div className="text-center">
                                                        <h2 className="text-lg font-semibold">
                                                            Dr.{" "}
                                                            {oldRx.prescribedBy}
                                                        </h2>
                                                        <p className="text-sm text-gray-500">
                                                            {oldRx.hospitalName}
                                                        </p>
                                                    </div>
                                                </div>

                                                <hr className="my-4" />

                                                <div className="flex gap-4">
                                                    <span className="text-5xl font-bold text-[#214662]">
                                                        ℞
                                                    </span>

                                                    <div className="flex-1 space-y-4">
                                                        {oldRx.prescriptionList.map(
                                                            (
                                                                med: any,
                                                                i: number,
                                                            ) => (
                                                                <div
                                                                    key={i}
                                                                    className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
                                                                >
                                                                    <div>
                                                                        <p className="text-xs text-gray-500">
                                                                            Medicine
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {displayValue(
                                                                                med.medicineName,
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-gray-500">
                                                                            Dosage
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {displayValue(
                                                                                med.dosage,
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-gray-500">
                                                                            Frequency
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {displayValue(
                                                                                med.frequency,
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-gray-500">
                                                                            Duration
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {displayValue(
                                                                                med.duration,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex justify-between text-sm text-gray-400">
                                                    <span>
                                                        Issued on{" "}
                                                        {oldRx.createdAt
                                                            ? oldRx.createdAt
                                                                  .toDate
                                                                ? oldRx.createdAt
                                                                      .toDate()
                                                                      .toLocaleDateString()
                                                                : new Date(
                                                                      oldRx.createdAt,
                                                                  ).toLocaleDateString()
                                                            : "—"}
                                                    </span>

                                                    <span
                                                        className={
                                                            oldRx.status
                                                                ? "text-green-600"
                                                                : "text-yellow-600"
                                                        }
                                                    >
                                                        {oldRx.status
                                                            ? "VALIDATED"
                                                            : "PENDING"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </>
                            )}
                        </>
                    );
                })()}
        </div>
    );
}
