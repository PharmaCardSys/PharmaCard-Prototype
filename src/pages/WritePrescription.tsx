import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import Header from "./components/Header";
import rxlogo from "../assets/images/rx-logo.png";
import { db } from "../firebase/firebaseconfig"; // adjust path if needed
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    arrayUnion,
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

        try {
            // Build prescription list
            const prescriptionList = medicines.map((med) => ({
                medicineName: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
            }));

            // Create prescription document
            const prescriptionRef = await addDoc(
                collection(db, "prescriptions"),
                {
                    hospitalName,
                    hospitalLogo, // base64
                    patientName,
                    patientAge,
                    patientSex,
                    patientAddress,
                    patientImage, // base64

                    prescriptionList,

                    prescribedBy: `${user.name} ${user.middleName} ${user.lastName}`,
                    prescribedId: user.uid,

                    createdAt: serverTimestamp(),
                },
            );

            // Push prescription ID to user document
            await updateDoc(doc(db, "users", user.uid), {
                createdPrescription: arrayUnion(prescriptionRef.id),
            });

            alert("Prescription created successfully!");
        } catch (error) {
            console.error("Error creating prescription:", error);
            alert("Failed to create prescription");
        }
    };

    useEffect(() => {
        if (!user) return;

        if (user.role !== "Doctor") {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="w-full min-h-screen bg-[#F8F5F1] text-[#214662] flex flex-col items-center">
            <Header />

            {/* Action Buttons */}
            <div className="container flex gap-4 mt-8">
                <Button className="bg-[#214662] text-white">
                    LOAD TEMPLATE
                </Button>
                <Button className="bg-[#214662] text-white">
                    SAVE TEMPLATE
                </Button>
            </div>

            <div className="container flex md:flex-row flex-col md:gap-8 gap-4 items-start px-0 md:px-0">
                {/* Prescription Sheet */}
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
                            <img
                                src={rxlogo}
                                alt="Rx Logo"
                                className="w-20 h-20"
                            />

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
                                <span className="text-sm">Upload Photo</span>
                            </div>
                        )}
                    </div>

                    {/* Patient Inputs */}
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="FULL NAME"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                        />

                        <input
                            type="number"
                            placeholder="AGE"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value)}
                            className="w-1/2 border rounded p-2 text-sm"
                        />

                        <select
                            value={patientSex}
                            onChange={(e) => setPatientSex(e.target.value)}
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
                            onChange={(e) => setPatientAddress(e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-end">
                        <Button
                            className="bg-[#214662] text-white"
                            onClick={handleCreatePrescription}
                        >
                            CREATE PRESCRIPTION
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
