interface BotonCentrarProps {
    onClick: () => void;
}
//El besto componente
export function BotonCentrar({ onClick }: BotonCentrarProps) {
    return (
        <button
            onClick={onClick}
            className="absolute bottom-8 right-8 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center cursor-pointer"

        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        </button>
    );
}