import { useState, useEffect } from "react";
import Header from "./components/Header";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig";
import { toast } from "sonner";

// type InputMode = "search" | "link";

export default function Prescription() {
    // Default to LINK since search is not implemented
    // const [mode, setMode] = useState<InputMode>("link");
    const [value, setValue] = useState("");

    const [prescription, setPrescription] = useState<any>(null);

    const displayValue = (value?: string) =>
        value && value.trim() !== "" ? value : "NOT SPECIFIED";

    const prescriptions = prescription?.mainPrescription || [];
    const latestIndex = prescriptions.length - 1;
    const latestRx = latestIndex >= 0 ? prescriptions[latestIndex] : null;
    const previousRx =
        latestIndex > 0 ? prescriptions.slice(0, latestIndex) : [];

    // 🔗 Extract ID (same as CheckoutRx)
    const extractPrescriptionId = (input: string) => {
        if (!input) return null;

        let decoded = input.trim();
        try {
            decoded = decodeURIComponent(decoded);
        } catch {}

        if (
            !decoded.includes("/") &&
            !decoded.includes("?") &&
            !decoded.includes("=")
        ) {
            return decoded;
        }

        const match = decoded.match(/[?&]pid=([^&]+)/);
        return match ? match[1] : null;
    };

    const fetchPrescription = async () => {
        const pid = extractPrescriptionId(value);

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
        } catch (error) {
            console.error("Error fetching prescription:", error);
        }
    };

    console.log(prescription);

    useEffect(() => {
        // Runs once on page load
        const search = window.location.search;

        if (!search) return;

        let decoded = search;

        try {
            decoded = decodeURIComponent(search);
        } catch {
            // ignore decode errors
        }

        const match = decoded.match(/[?&]pid=([^&]+)/);
        if (!match) return;

        const pid = match[1];

        // Fetch automatically
        (async () => {
            try {
                const ref = doc(db, "prescriptions", pid);
                const snap = await getDoc(ref);

                if (!snap.exists()) return;

                const data = snap.data();
                const latest =
                    data.mainPrescription?.[data.mainPrescription.length - 1];

                setPrescription({
                    id: snap.id,
                    ...data,
                    latestPrescription: latest,
                });
            } catch (err) {
                toast.error("Auto-fetch failed, try again later");
            }
        })();
    }, []);

    return (
        <div className="w-full min-h-screen bg-[#F8F5F1] text-[#214662] flex flex-col items-center">
            <Header />

            <div className="container flex-1 flex flex-col items-center px-4">
                {/* Toggle (Search disabled for now) */}
                <div className="mt-10 flex bg-[#E1DFE1] rounded-lg p-1">
                    <button
                        disabled
                        className="px-4 py-2 text-sm rounded-md text-gray-400 cursor-not-allowed"
                    >
                        Search
                    </button>

                    <button className="px-4 py-2 text-sm rounded-md bg-white text-[#214662] shadow">
                        Link
                    </button>
                </div>

                {/* Input */}
                <div className="w-full max-w-md mt-8 relative">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Paste prescription link"
                        className="
                            w-full border rounded-md
                            px-4 py-3 pr-14 text-sm
                            bg-white
                            focus:outline-none focus:ring-1 focus:ring-[#214662]
                        "
                    />

                    {/* 🔥 FIX: Button now works */}
                    <button
                        onClick={fetchPrescription}
                        className="
                            absolute right-2 top-1/2 -translate-y-1/2
                            w-9 h-9 rounded-full
                            bg-[#214662] text-white
                            flex items-center justify-center
                            hover:bg-[#214662]/90
                            transition
                        "
                        aria-label="Continue"
                    >
                        <i className="fa-solid fa-angle-right text-base"></i>
                    </button>
                </div>

                {/* Prescription View */}
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

                                    {/* Additional Display */}
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500">
                                            Additional Instructions
                                        </p>
                                        <p className="font-medium">
                                            {latestRx.additionalInstructions ||
                                                "NOT SPECIFIED"}
                                        </p>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">
                                            Approximate Price
                                        </p>
                                        <p className="font-medium">
                                            {latestRx.approximatePrice ||
                                                "NOT SPECIFIED"}
                                        </p>
                                    </div>

                                    <hr className="my-6" />

                                    {/* Patient Info */}
                                    <div className="flex gap-6 items-start">
                                        {/* Patient Image */}
                                        <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {prescription.patientImage ? (
                                                <img
                                                    src={
                                                        prescription.patientImage
                                                    }
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
                                                {prescription.patientAddress ||
                                                    "—"}
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
                                            .map(
                                                (oldRx: any, index: number) => (
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
                                                                    {
                                                                        oldRx.prescribedBy
                                                                    }
                                                                </h2>
                                                                <p className="text-sm text-gray-500">
                                                                    {
                                                                        oldRx.hospitalName
                                                                    }
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
                                                                            key={
                                                                                i
                                                                            }
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

                                                        {/* Additional Display */}
                                                        <div className="mt-4">
                                                            <p className="text-xs text-gray-500">
                                                                Additional
                                                                Instructions
                                                            </p>
                                                            <p className="font-medium">
                                                                {oldRx.additionalInstructions ||
                                                                    "NOT SPECIFIED"}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2">
                                                            <p className="text-xs text-gray-500">
                                                                Approximate
                                                                Price
                                                            </p>
                                                            <p className="font-medium">
                                                                {oldRx.approximatePrice ||
                                                                    "NOT SPECIFIED"}
                                                            </p>
                                                        </div>

                                                        <div className="mt-4 flex justify-between text-sm text-gray-400">
                                                            <span>
                                                                Issued on{" "}
                                                                {oldRx.createdAt
                                                                    ? oldRx
                                                                          .createdAt
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
                                                ),
                                            )}
                                    </>
                                )}
                            </>
                        );
                    })()}
            </div>
        </div>
    );
}
