import { Button } from "@/components/ui/button";

export default function Header() {
    return (
        <>
            {/* Header */}
            <div className="w-full bg-[#214662] text-[#F8F5F1] shadow-md flex items-center justify-between">
                <div className="container mx-auto p-4 flex md:flex-row items-center md:items-start justify-between gap-8">
                    <div>
                        <p className="text-lg md:text-xl text-[#B4C4D0]">
                            PharmaCard
                        </p>
                    </div>

                    {/* Right (future actions) */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="link"
                            className="text-sm text-[#E1DFE1]"
                        >
                            View Prescription
                        </Button>
                        <Button
                            variant="secondary"
                            className="text-sm text-[#214662]"
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
