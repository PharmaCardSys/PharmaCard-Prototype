import type { User } from "firebase/auth";

interface Props {
    user?: User & {
        role: "Doctor" | "Pharmacist";
        name: string;
        createdAt: unknown;
        email: string | null;
    };
}

export default function WritePrescription({ user }: Props) {
    if (!user) return null; // safety guard important for no errors

    console.log(user);

    return (
        <div className="w-full min-h-screen bg-[#F8F5F1] text-[#214662] flex flex-col items-center justify-start">
            Sup
        </div>
    );
}
