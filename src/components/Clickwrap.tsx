import { useState } from "react";
import { setAgreementCookie } from "../lib/clickwrap";
import "../styles/Clickwrap.css";

interface ClickwrapProps {
	onAccept: () => void;
}

const Clickwrap: React.FC<ClickwrapProps> = ({ onAccept }) => {
	const [isChecked, setIsChecked] = useState(false);

	const handleAccept = () => {
		if (isChecked) {
			setAgreementCookie();
			onAccept();
		}
	};

	return (
		<div className="clickwrap-overlay">
			<div className="clickwrap-container">
				<h2>Disclaimer</h2>
				<div className="disclaimer-box">
					<p>Welcome to Rebar Shield Demo Reference.</p>
					<p>
						This is a demo reference implementation and is not intended for use
						in production and is provided as-is, with the warranties of fitness
						for purpose, merchantability, and all other warranties expressly
						disclaimed.
					</p>
					<p>
						<strong>The code is not audited</strong> and you use this at your
						own risk and Rebar Labs, Inc., its officers, directors, and/or
						shareholders shall have no liability to you. You are solely
						responsible for assessing and understanding this demo reference
						implementation and for any decision you make to run it and/or
						integrate it with any system or network.
					</p>
				</div>
				<div className="agreement-checkbox">
					<input
						type="checkbox"
						id="agree-checkbox"
						checked={isChecked}
						onChange={(e) => setIsChecked(e.target.checked)}
					/>
					<label htmlFor="agree-checkbox">
						I have read and agree to the disclaimer as outlined.
					</label>
				</div>
				<button
					className="accept-button"
					disabled={!isChecked}
					onClick={handleAccept}
				>
					Accept and Continue
				</button>
			</div>
		</div>
	);
};

export default Clickwrap;
