// CertificateView.tsx - Elegant professional certificate design
import React, { useState, useEffect, useRef } from "react";
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";
import { type Certification } from "../types/certification";
import { type Employee } from "../types/employee";
import { type Training } from "../types/training";
import ToastContainer from "../components/ToastContainer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../assets/logo.png";

interface CertificateViewProps {
    certificateId: number;
    onBack: () => void;
}

const CertificateView: React.FC<CertificateViewProps> = ({
    certificateId,
    onBack,
}) => {
    const { toasts, addToast, removeToast } = useToast();

    const [certification, setCertification] = useState<Certification | null>(
        null
    );
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [training, setTraining] = useState<Training | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const certificateRef = useRef<HTMLDivElement>(null);

    // Fetch certificate data
    useEffect(() => {
        const fetchCertificateData = async () => {
            try {
                setLoading(true);
                setError(null);

                const certificationData = await apiService.getCertificationById(
                    certificateId
                );
                setCertification(certificationData);

                if (certificationData.employee_id) {
                    const employeeData = await apiService.getEmployeeById(
                        certificationData.employee_id
                    );
                    setEmployee(employeeData);
                }

                if (certificationData.training_id) {
                    const trainingData = await apiService.getTrainingById(
                        certificationData.training_id
                    );
                    setTraining(trainingData);
                }
            } catch (err) {
                console.error("Error fetching certificate data:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load certificate"
                );
                addToast("Failed to load certificate data", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchCertificateData();
    }, [certificateId, addToast]);

    // Handle download as PDF
    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true);
            addToast("Generating PDF...", "info");

            if (!certificateRef.current) {
                throw new Error("Certificate element not found");
            }

            // Get only the certificate content div inside the preview
            const certificateElement = certificateRef.current.querySelector(
                ".certificate-content"
            ) as HTMLElement;
            if (!certificateElement) {
                throw new Error("Certificate content not found");
            }

            const canvas = await html2canvas(certificateElement, {
                scale: 3,
                backgroundColor: null,
                useCORS: true,
                logging: false,
                width: certificateElement.offsetWidth,
                height: certificateElement.offsetHeight,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: [canvas.width, canvas.height],
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const xPos = 0;
            const yPos = (pdfHeight - imgHeight) / 2;

            pdf.addImage(imgData, "PNG", xPos, yPos, imgWidth, imgHeight);
            pdf.save(
                `Certificate_${certification?.cert_number || certificateId}.pdf`
            );

            addToast("Certificate downloaded successfully!", "success");
        } catch (error) {
            console.error("Error generating PDF:", error);
            addToast("Failed to generate PDF", "error");
        } finally {
            setIsDownloading(false);
        }
    };

    // Handle download as PNG
    const handleDownloadPNG = async () => {
        try {
            setIsDownloading(true);
            addToast("Generating PNG...", "info");

            if (!certificateRef.current) {
                throw new Error("Certificate element not found");
            }

            // Get only the certificate content div inside the preview
            const certificateElement = certificateRef.current.querySelector(
                ".certificate-content"
            ) as HTMLElement;
            if (!certificateElement) {
                throw new Error("Certificate content not found");
            }

            const canvas = await html2canvas(certificateElement, {
                scale: 4,
                backgroundColor: "#ffffff",
                useCORS: true,
                logging: false,
                width: certificateElement.offsetWidth,
                height: certificateElement.offsetHeight,
            });

            const link = document.createElement("a");
            link.download = `Certificate_${
                certification?.cert_number || certificateId
            }.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            addToast("Certificate downloaded successfully!", "success");
        } catch (error) {
            console.error("Error generating PNG:", error);
            addToast("Failed to generate PNG", "error");
        } finally {
            setIsDownloading(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Loading state
    if (loading) {
        return <CertificateViewSkeleton />;
    }

    // Error state
    if (error || !certification) {
        return (
            <div className="min-h-screen p-5 space-y-5">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl mt-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Certificate Not Found
                            </h3>
                            <p className="text-gray-300 mb-6 max-w-md mx-auto">
                                {error ||
                                    "The certificate you're looking for doesn't exist or has been removed."}
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={onBack}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 backdrop-blur-sm border border-amber-500/30 rounded-lg text-white hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <ToastContainer toasts={toasts} onRemove={removeToast} />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-5 space-y-5">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl mb-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 text-gray-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                                title="Go Back"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Certificate Details
                                </h1>
                                <p className="text-gray-300 mt-1">
                                    View and download certification details
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 backdrop-blur-sm border border-amber-500/30 rounded-lg text-white hover:from-amber-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isDownloading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <span>Download PDF</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDownloadPNG}
                                disabled={isDownloading}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 backdrop-blur-sm border border-orange-500/30 rounded-lg text-white hover:from-orange-600 hover:to-amber-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span>Download PNG</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
                    {/* Certificate Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-4">
                                Certificate Preview
                            </h2>
                            <div className="rounded-3xl overflow-hidden shadow-2xl">
                                {/* Elegant Certificate Design */}
                                <div
                                    ref={certificateRef}
                                    className="w-full h-auto aspect-[16/9] "
                                >
                                    {/* Certificate Content */}
                                    <div className="certificate-content relative w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl shadow-inner">
                                        {/* Elegant Border with Gold Accents */}
                                        <div className="absolute inset-4 border-2 border-amber-300/30 rounded-xl">
                                            <div className="absolute -top-1 left-1/4 w-8 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                                            <div className="absolute -top-1 right-1/4 w-8 h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                                            <div className="absolute -bottom-1 left-1/4 w-8 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                                            <div className="absolute -bottom-1 right-1/4 w-8 h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                                        </div>

                                        {/* Certificate Header */}
                                        <div className="relative h-full p-6 flex flex-col">
                                            {/* Top Bar with Logo and Title */}
                                            <div className="flex items-start justify-between mb-8 mt-3">
                                                {/* Logo Section - Keep as is */}
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center p-2">
                                                        <img
                                                            src={logo}
                                                            alt="SkillFlow"
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                const fallback =
                                                                    document.createElement(
                                                                        "div"
                                                                    );
                                                                fallback.className =
                                                                    "w-full h-full flex items-center justify-center";
                                                                fallback.innerHTML = `
                        <div class="text-center">
                            <div class="text-2xl font-bold text-amber-600">SF</div>
                            <div class="text-xs text-gray-600">SkillFlow</div>
                        </div>
                    `;
                                                                e.currentTarget.parentNode?.replaceChild(
                                                                    fallback,
                                                                    e.currentTarget
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            SKILLFLOW
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Professional
                                                            Certification
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Certificate Title - FIXED CENTERING */}
                                                <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                                                    <div className="relative">
                                                        <h1 className="text-4xl font-bold text-gray-800 tracking-wider font-serif">
                                                            CERTIFICATE
                                                        </h1>
                                                        <p className="text-lg text-amber-600 font-medium mt-2 font-serif">
                                                            of Training
                                                            Completion
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Certificate ID - Keep as is */}
                                                <div className="text-right">
                                                    <div className="rounded-lg px-4 py-2">
                                                        <p className="text-xs text-gray-500">
                                                            CERTIFICATE ID
                                                        </p>
                                                        <p className="text-sm font-bold text-gray-800 tracking-wider">
                                                            {
                                                                certification.cert_number
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Main Content - FIXED SPACING */}
                                            <div className="flex-1 flex items-center justify-center py-8">
                                                {" "}
                                                {/* Added py-8 for vertical padding */}
                                                <div className="text-center max-w-3xl">
                                                    {/* Certificate Statement */}
                                                    <div className="mb-10">
                                                        {" "}
                                                        {/* Increased mb-8 to mb-10 */}
                                                        <p className="text-lg text-gray-600 mb-8">
                                                            {" "}
                                                            {/* Increased mb-6 to mb-8 */}
                                                            This is to certify
                                                            that
                                                        </p>
                                                        {/* Recipient Name - FIXED SPACING */}
                                                        <div className="mb-10">
                                                            {" "}
                                                            {/* Increased mb-6 to mb-10 */}
                                                            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">
                                                                {" "}
                                                                {/* Increased mb-3 to mb-4 */}
                                                                {employee
                                                                    ? `${employee.first_name} ${employee.last_name}`
                                                                    : "Employee Name"}
                                                            </h2>
                                                            <div className="h-1 w-64 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 mx-auto rounded-full mb-2"></div>{" "}
                                                            {/* Added mb-2 for spacing */}
                                                        </div>
                                                        {/* Training Details - ADDED MORE SPACING */}
                                                        <p className="text-lg text-gray-600 mb-6">
                                                            {" "}
                                                            {/* Added mb-4 to mb-6 */}
                                                            has successfully
                                                            completed the
                                                            training program
                                                        </p>
                                                        <div className="inline-block px-8 py-4">
                                                            {" "}
                                                            {/* Added mb-6 */}
                                                            <h3 className="text-2xl font-bold text-gray-800">
                                                                {training?.name ||
                                                                    "Training Program"}
                                                            </h3>
                                                        </div>
                                                        <p className="text-gray-600 mb-8">
                                                            {" "}
                                                            {/* Added bottom margin */}
                                                            demonstrating
                                                            exceptional
                                                            proficiency and
                                                            commitment to
                                                            professional
                                                            excellence.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Section */}
                                            <div className="mt-4">
                                                {/* Dates and Signatures */}
                                                <div className="grid grid-cols-2 gap-6 mb-6">
                                                    <div className="text-center">
                                                        <div className="inline-block">
                                                            <p className="text-xs text-gray-500 font-medium mb-1">
                                                                ISSUED ON
                                                            </p>
                                                            <p className="text-lg font-bold text-gray-800">
                                                                {formatDate(
                                                                    certification.issued_date
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-center">
                                                        <div className="inline-block">
                                                            <p className="text-xs text-gray-500 font-medium mb-1">
                                                                EXPIRES ON
                                                            </p>
                                                            <p className="text-lg font-bold text-gray-800">
                                                                {formatDate(
                                                                    certification.expires_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subtle Background Pattern */}
                                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f59e0b' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                                                    backgroundSize:
                                                        "200px 200px",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

// Loading Skeleton
const CertificateViewSkeleton = () => (
    <div className="min-h-screen p-5 space-y-5">
        <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl mb-5 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded-xl w-1/4"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse">
                        <div className="h-6 bg-gray-700/50 rounded-xl w-1/3 mb-4"></div>
                        <div className="aspect-[16/9] bg-gray-700/50 rounded-3xl"></div>
                    </div>
                </div>
                <div>
                    <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 bg-gray-700/50 rounded-xl w-1/4"></div>
                                <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default CertificateView;
