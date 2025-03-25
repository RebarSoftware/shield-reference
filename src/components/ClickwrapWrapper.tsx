import { useEffect, useState } from "react";
import { checkAgreementCookie } from "../lib/clickwrap";
import Clickwrap from "./Clickwrap";

interface ClickwrapWrapperProps {
	children: React.ReactNode;
}

const ClickwrapWrapper: React.FC<ClickwrapWrapperProps> = ({ children }) => {
	const [showClickwrap, setShowClickwrap] = useState(true);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check if user has already agreed
		const hasAgreed = checkAgreementCookie();
		setShowClickwrap(!hasAgreed);
		setIsLoading(false);
	}, []);

	const handleAccept = () => {
		setShowClickwrap(false);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<>{showClickwrap ? <Clickwrap onAccept={handleAccept} /> : children}</>
	);
};

export default ClickwrapWrapper;
