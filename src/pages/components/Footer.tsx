import { Button } from "@/components/ui/button";

export default function Footer() {
    return (
        <div className="w-full bg-[#214662] text-[#F8F5F1]">
            <div className="container mx-auto px-8 py-12 flex flex-col md:flex-row items-start md:items-start justify-between gap-8">
                {/* Left: Project Identity */}
                <div className="flex flex-col gap-3 max-w-md">
                    <h2 className="text-lg font-semibold tracking-tight">
                        PharmaCard
                    </h2>
                    <p className="text-sm text-[#B4C4D0] leading-relaxed">
                        A capstone project from 12-3 Hosea titled
                        <span className="italic">
                            {" "}
                            “Near-Field Communication Identification System:
                            Addressing the Philippines’ Reliance on Paper-Based
                            Prescriptions”
                        </span>
                    </p>
                </div>

                {/* Right: Contact & Actions */}
                <div className="flex">
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="link"
                            className="text-sm text-[#E1DFE1] p-0 hover:underline"
                            asChild
                        >
                            <a href="mailto:pharmacardcapstone@gmail.com">
                                Email Us
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom strip */}
            <div className="border-t border-[#B4C4D0]/30">
                <div className="container mx-auto px-8 py-4 text-xs text-[#B4C4D0] flex flex-col md:flex-row items-center justify-between gap-2">
                    <span>© 2025 PharmaCard. All rights reserved.</span>
                    <span>Educational use only</span>
                </div>
            </div>
        </div>
    );
}
