import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import Header from "./components/Header";
import { db } from "../firebase/firebaseconfig";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    arrayUnion,
    getDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export default function WritePrescription({ user }: Props) {
    if (!user) return null;

    const [medicines, setMedicines] = useState<Medicine[]>([
        { name: "", dosage: "", frequency: "", duration: "" },
    ]);
    const [patientImage, setPatientImage] = useState<string | null>(null);
    const [hospitalLogo, setHospitalLogo] = useState<string | null>(null);
    const [hospitalName, setHospitalName] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    const [patientSex, setPatientSex] = useState("");
    const [patientAddress, setPatientAddress] = useState("");
    const navigate = useNavigate();
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");
    const [open, setOpen] = useState(false);
    const [prescriptionLink, setPrescriptionLink] = useState("");
    // const [rx, setRx] = useState<any | null>(null); I dont what this does lol!
    const [previousPrescriptions, setPreviousPrescriptions] = useState<any[]>(
        [],
    );
    const [hasLoadedExisting, setHasLoadedExisting] = useState(false);
    const isUpdateMode = hasLoadedExisting;

    const extractPrescriptionId = (input: string) => {
        if (!input) return null;

        let decoded = input.trim();

        // Decode NFC / URL-encoded strings (pid%3D → pid=)
        try {
            decoded = decodeURIComponent(decoded);
        } catch {
            // ignore decode errors
        }

        // Plain Firestore ID pasted
        if (
            !decoded.includes("/") &&
            !decoded.includes("?") &&
            !decoded.includes("=")
        ) {
            return decoded;
        }

        // Normal query param ?pid=XXXX
        const match = decoded.match(/[?&]pid=([^&]+)/);
        if (match) return match[1];

        return null;
    };

    const fetchPrescription = async () => {
        const pid = extractPrescriptionId(prescriptionLink);

        if (!pid) {
            toast.error("Invalid prescription link");
            return;
        }

        try {
            const ref = doc(db, "prescriptions", pid);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                toast.error("Prescription not found");
                return;
            }

            const data = snap.data();

            if (!data.mainPrescription || data.mainPrescription.length === 0) {
                toast.error("No prescriptions found");
                return;
            }

            const main = data.mainPrescription;

            if (!Array.isArray(main) || main.length === 0) return;

            // newest → oldest
            const orderedPrescriptions = [...main].sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() ?? 0;
                const bTime = b.createdAt?.toMillis?.() ?? 0;
                return bTime - aTime;
            });

            //  latest prescription (highest index / newest)
            // setRx(orderedPrescriptions[0]);

            // ALL previous prescriptions (can be many)
            setPreviousPrescriptions(orderedPrescriptions.reverse());

            setHasLoadedExisting(true);

            // hydrate patient details (THIS IS THE MISSING PART)
            setPatientName(data.patientName ?? "");
            setPatientAge(data.patientAge ?? "");
            setPatientSex(data.patientSex ?? "");
            setPatientAddress(data.patientAddress ?? "");
            setPatientImage(data.patientImage ?? null);

            toast.success("Prescription loaded");
            setOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load prescription");
        }
    };

    const addMedicine = () => {
        setMedicines([
            ...medicines,
            { name: "", dosage: "", frequency: "", duration: "" },
        ]);
    };

    const removeMedicine = (index: number) => {
        if (medicines.length === 1) return; // prevent deleting last card
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const updateMedicine = (
        index: number,
        field: keyof Medicine,
        value: string,
    ) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const base64 = await fileToBase64(file);
        setPatientImage(base64);
    };

    const handleHospitalLogoUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const base64 = await fileToBase64(file);
        setHospitalLogo(base64);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
    };

    const handleCreatePrescription = async () => {
        if (!user) return;

        // Validations
        if (!hasRequiredPatientInfo) {
            toast.error(
                "Please complete patient name, age, and sex before creating a prescription.",
            );
            return;
        }

        if (!hasAtLeastOneMedicine) {
            toast.error(
                "Please add at least one medicine before creating a prescription.",
            );
            return;
        }

        try {
            const prescriptionEntry = {
                hospitalName,
                hospitalLogo,
                prescribedBy: `${user.name} ${user.middleName} ${user.lastName}`,
                prescribedId: user.uid,
                status: false,
                createdAt: Date.now(),
                prescriptionList: medicines.map((med) => ({
                    medicineName: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    duration: med.duration,
                })),
            };

            const prescriptionRef = await addDoc(
                collection(db, "prescriptions"),
                {
                    patientName,
                    patientAge,
                    patientSex,
                    patientAddress,
                    patientImage,
                    mainPrescription: [prescriptionEntry],
                },
            );

            await updateDoc(doc(db, "users", user.uid), {
                createdPrescription: arrayUnion(prescriptionRef.id),
            });

            const link = `${window.location.origin}/prescription?pid=${prescriptionRef.id}`;
            setGeneratedLink(link);
            setShowLinkModal(true);

            toast.success("Prescription created successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create prescription");
        }
    };

    // helper
    const hasAtLeastOneMedicine = medicines.some(
        (med) =>
            med.name.trim() !== "" ||
            med.dosage.trim() !== "" ||
            med.frequency.trim() !== "" ||
            med.duration.trim() !== "",
    );
    const hasRequiredPatientInfo =
        patientName.trim() !== "" &&
        patientAge.trim() !== "" &&
        patientSex.trim() !== "";

    const handleUpdatePrescription = async () => {
        if (!user) return;

        try {
            const pid = extractPrescriptionId(prescriptionLink);
            if (!pid) {
                toast.error("Invalid prescription ID");
                return;
            }

            // BLOCK empty prescription updates
            if (!hasAtLeastOneMedicine) {
                toast.error(
                    "Unable to update prescription: No medicines added.",
                );
                return;
            }

            const prescriptionEntry = {
                hospitalName,
                hospitalLogo,
                prescribedBy: `${user.name} ${user.middleName} ${user.lastName}`,
                prescribedId: user.uid,
                status: false,
                createdAt: Date.now(),
                prescriptionList: medicines.map((med) => ({
                    medicineName: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    duration: med.duration,
                })),
            };

            await updateDoc(doc(db, "prescriptions", pid), {
                // update patient info (editable)
                patientName,
                patientAge,
                patientSex,
                patientAddress,
                patientImage,

                // append new prescription (immutable history)
                mainPrescription: arrayUnion(prescriptionEntry),
            });

            toast.success("Prescription updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update prescription");
        }
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(generatedLink);
        toast.success("Prescription link copied!");
    };

    const handleCreateNew = () => {
        setMedicines([{ name: "", dosage: "", frequency: "", duration: "" }]);
        setPatientImage(null);
        setHospitalLogo(null);
        setHospitalName("");
        setPatientName("");
        setPatientAge("");
        setPatientSex("");
        setPatientAddress("");
        setPreviousPrescriptions([]);
        setHasLoadedExisting(false);
        setPrescriptionLink("");
        toast.success("Successfully cleared the prescription form!");
    };

    useEffect(() => {
        if (!user) return;

        if (user.role !== "Doctor") {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <>
            <div className="w-full min-h-screen bg-[#F8F5F1] text-[#214662] flex flex-col items-center">
                <Header />

                {/* Action Buttons */}
                <div className="container flex gap-4 mt-8">
                    <Button
                        className="bg-[#214662] text-white"
                        onClick={() => setOpen(true)}
                    >
                        UPDATE AN EXISTING PRESCRIPTION
                    </Button>
                    {/* <Button className="bg-[#214662] text-white">
                        SAVE TEMPLATE
                    </Button> */}
                    {hasLoadedExisting && (
                        <Button
                            className="bg-[#214662] text-white hover:bg-[#7896AB]"
                            onClick={handleCreateNew}
                        >
                            CLEAR PRESCRIPTION
                        </Button>
                    )}
                </div>

                <div className="container flex md:flex-row flex-col md:gap-8 gap-4 items-start px-0 md:px-0">
                    {/* Prescription Sheet */}
                    <div className="container max-w-4xl flex flex-col">
                        <div className="container max-w-4xl bg-white mt-6 p-6 rounded-lg shadow-md">
                            {/* Doctor Info */}
                            <div className="flex justify-center items-start flex-row md:gap-8 gap-2">
                                {/* Circle */}
                                <div className="relative md:w-14 w-12 md:h-14 h-12 border rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleHospitalLogoUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        title="Upload hospital logo"
                                    />

                                    {hospitalLogo ? (
                                        <img
                                            src={hospitalLogo}
                                            alt="Hospital Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <i className="fa-solid fa-camera text-gray-500 text-sm"></i>
                                    )}
                                </div>

                                {/* Information */}
                                <div className="mb-4 text-center">
                                    <h2 className="text-lg font-semibold">
                                        Dr. {user.name} {user.middleName}{" "}
                                        {user.lastName}
                                    </h2>
                                    <input
                                        type="text"
                                        placeholder="Hospital / Clinic Name"
                                        value={hospitalName}
                                        onChange={(e) =>
                                            setHospitalName(e.target.value)
                                        }
                                        className="
                                    text-sm text-gray-500 text-center
                                    bg-transparent
                                    placeholder-gray-400
                                    outline-none
                                    w-full max-w-md
                                    px-2
                                    border-b border-transparent
                                    focus:border-gray-300
                                    transition
                                "
                                    />
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="flex flex-row w-full">
                                {/* Prescription Header */}
                                <div className="flex flex-col items-center justify-start mr-4">
                                    {/* RX Icon */}
                                    <div className="flex flex-col items-center">
                                        <span className="text-6xl font-bold text-[#214662]">
                                            ℞
                                        </span>
                                    </div>

                                    <button
                                        onClick={addMedicine}
                                        className="w-8 h-8 rounded-full bg-[#214662] text-white text-xl flex items-center justify-center hover:bg-[#214662]/80"
                                        title="Add medicine"
                                    >
                                        <i className="fa-solid fa-plus text-[18px]"></i>
                                    </button>
                                </div>

                                {/* Medicine Cards */}
                                <div className="space-y-4 flex-1">
                                    {medicines.map((med, index) => (
                                        <div
                                            key={index}
                                            className="relative border rounded-lg p-4 pt-6 grid grid-cols-1 md:grid-cols-2 gap-3"
                                        >
                                            {/* Remove Button (edge-aligned) */}
                                            {medicines.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        removeMedicine(index)
                                                    }
                                                    className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#E1DFE1] text-[#214662] flex items-center justify-center text-lg font-bold shadow hover:bg-red-500 hover:text-white transition"
                                                    title="Remove medicine"
                                                >
                                                    <i className="fa-solid fa-minus"></i>
                                                </button>
                                            )}

                                            <input
                                                type="text"
                                                placeholder="MEDICINE NAME"
                                                className="border rounded p-2 text-sm uppercase"
                                                value={med.name}
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        index,
                                                        "name",
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                            />

                                            <input
                                                type="text"
                                                placeholder="DOSAGE (E.G. 500MG)"
                                                className="border rounded p-2 text-sm uppercase"
                                                value={med.dosage}
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        index,
                                                        "dosage",
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                            />

                                            <input
                                                type="text"
                                                placeholder="FREQUENCY (E.G. 2X A DAY)"
                                                className="border rounded p-2 text-sm uppercase"
                                                value={med.frequency}
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        index,
                                                        "frequency",
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                            />

                                            <input
                                                type="text"
                                                placeholder="DURATION (E.G. 7 DAYS)"
                                                className="border rounded p-2 text-sm uppercase"
                                                value={med.duration}
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        index,
                                                        "duration",
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {hasLoadedExisting &&
                            previousPrescriptions.length > 0 && (
                                <div className="container max-w-4xl border-b border-gray-300 my-12 flex justify-center items-center relative">
                                    <p className="absolute bg-[#F8F5F1] px-4 -top-3 text-gray-500 text-sm">
                                        Previous Prescriptions
                                    </p>
                                </div>
                            )}

                        {/* Display only cant input / cant edit */}
                        {hasLoadedExisting &&
                            previousPrescriptions.map(
                                (rx: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="container max-w-4xl bg-white p-6 rounded-lg shadow-md mb-6"
                                    >
                                        {/* Doctor Info */}
                                        <div className="flex justify-center items-start gap-4">
                                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                {rx.hospitalLogo ? (
                                                    <img
                                                        src={rx.hospitalLogo}
                                                        alt="Hospital Logo"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <i className="fa-solid fa-hospital text-gray-400"></i>
                                                )}
                                            </div>

                                            <div className="text-center">
                                                <h2 className="text-lg font-semibold">
                                                    Dr. {rx.prescribedBy}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                    {rx.hospitalName}
                                                </p>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        <div className="flex gap-4">
                                            <span className="text-5xl font-bold text-[#214662]">
                                                ℞
                                            </span>

                                            <div className="flex-1 space-y-4">
                                                {rx.prescriptionList.map(
                                                    (med: any, i: number) => (
                                                        <div
                                                            key={i}
                                                            className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
                                                        >
                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Medicine
                                                                </p>
                                                                <p className="font-medium">
                                                                    {
                                                                        med.medicineName
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Dosage
                                                                </p>
                                                                <p className="font-medium">
                                                                    {med.dosage}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Frequency
                                                                </p>
                                                                <p className="font-medium">
                                                                    {
                                                                        med.frequency
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Duration
                                                                </p>
                                                                <p className="font-medium">
                                                                    {
                                                                        med.duration
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex mt-6 items-center justify-between">
                                            {/* Status */}
                                            <div
                                                className={`text-sm font-semibold px-3 py-1 border rounded-md ${
                                                    rx.status
                                                        ? "text-green-600 border-green-500"
                                                        : "text-yellow-600 border-yellow-500"
                                                }`}
                                            >
                                                Status:{" "}
                                                {rx.status
                                                    ? "VALIDATED"
                                                    : "PENDING"}
                                            </div>

                                            {/* Date */}
                                            <p className="text-sm text-gray-400">
                                                Issued on{" "}
                                                {rx.createdAt
                                                    ? rx.createdAt.toDate
                                                        ? rx.createdAt
                                                              .toDate()
                                                              .toLocaleDateString()
                                                        : new Date(
                                                              rx.createdAt,
                                                          ).toLocaleDateString()
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                    </div>

                    {/* Side Profile Patient Details */}
                    <div className="w-full md:w-1/2 bg-white md:mt-6 mt-0 p-6 rounded-lg shadow-md mr-0 md:mr-6 mb-6 md:mb-0">
                        <h3 className="text-lg font-semibold mb-4">
                            Patient Details
                        </h3>

                        {/* Patient Image Placeholder */}
                        <div className="w-full h-60 bg-gray-100 rounded-lg flex items-center justify-center mb-4 border relative overflow-hidden">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                title="Upload patient photo"
                            />

                            {/* Image preview or placeholder */}
                            {patientImage ? (
                                <img
                                    src={patientImage}
                                    alt="Patient"
                                    className="w-60 h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <i className="fa-solid fa-camera text-4xl mb-2"></i>
                                    <span className="text-sm">
                                        Upload Photo
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Patient Inputs */}
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="FULL NAME"
                                value={patientName}
                                onChange={(e) =>
                                    setPatientName(e.target.value.toUpperCase())
                                }
                                className="w-full border rounded p-2 text-sm"
                            />

                            <input
                                type="number"
                                placeholder="AGE"
                                value={patientAge}
                                onChange={(e) =>
                                    setPatientAge(e.target.value.toUpperCase())
                                }
                                className="w-1/2 border rounded p-2 text-sm"
                            />

                            <select
                                value={patientSex}
                                onChange={(e) =>
                                    setPatientSex(e.target.value.toUpperCase())
                                }
                                className="w-1/2 border rounded p-2 text-sm text-gray-600"
                            >
                                <option value="">SEX</option>
                                <option value="MALE">MALE</option>
                                <option value="FEMALE">FEMALE</option>
                            </select>

                            <input
                                type="text"
                                placeholder="ADDRESS (optional)"
                                value={patientAddress}
                                onChange={(e) =>
                                    setPatientAddress(
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                className="w-full border rounded p-2 text-sm"
                            />
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={
                                    isUpdateMode
                                        ? handleUpdatePrescription
                                        : handleCreatePrescription
                                }
                                className={
                                    isUpdateMode
                                        ? "bg-[#214662] text-white hover:bg-[#7896AB]"
                                        : "bg-[#214662] text-white"
                                }
                            >
                                {isUpdateMode
                                    ? "UPDATE PRESCRIPTION"
                                    : "CREATE PRESCRIPTION"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showLinkModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/30"
                            onClick={() => setShowLinkModal(false)}
                        />

                        {/* Modal */}
                        <div className="relative bg-white w-full max-w-md mx-4 rounded-xl shadow-lg p-6 z-10">
                            <h2 className="text-lg font-semibold text-center mb-2">
                                Prescription Created
                            </h2>

                            <p className="text-sm text-gray-500 text-center mb-4">
                                Share this link with the patient or pharmacist
                                to verify the prescription.
                            </p>

                            {/* Link Box */}
                            <div className="bg-[#F8F5F1] border rounded-lg p-3 text-sm break-all text-[#214662]">
                                {generatedLink}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowLinkModal(false)}
                                >
                                    Close
                                </Button>

                                <Button
                                    className="bg-[#214662] text-white"
                                    onClick={handleCopyLink}
                                >
                                    Copy Link
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
        </>
    );
}
