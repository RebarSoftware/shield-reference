import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
	buildTransaction,
	sendTransaction,
	signPSBT,
	watchTransaction,
} from "./lib/tools";
import { UNISAT, useLaserEyes } from "@omnisat/lasereyes-react";

function App() {
	const [transaction, setTransaction] = useState("");
	const [transactionData, setTransactionData] = useState<any>(null);
	const [signedTransaction, setSignedTransaction] = useState("");
	const [error, setError] = useState("");
	const [recipientAddress, setRecipientAddress] = useState("");
	const [amount, setAmount] = useState<number>(0);
	const [watchedTransaction, setWatchedTransaction] = useState<
		string | undefined
	>(undefined);
	const { connect, connected, isConnecting, publicKey, hasUnisat, signPsbt } =
		useLaserEyes();

	const timerIdRef = useRef<any>(null);

	const handleSubmit = async (publicKey: string) => {
		if (!publicKey) {
			setError("Please connect to UNISAT");
			return;
		}

		const unsignedPSBT = await buildTransaction(
			publicKey,
			recipientAddress,
			amount,
			setTransactionData,
		);
		setTransaction(unsignedPSBT);
	};

	const pollCallback = async () => {
		try {
			await watchTransaction(watchedTransaction, setWatchedTransaction);
		} catch (error) {
			console.error(error);
		}
	};

	const poll = () => {
		pollCallback();
		timerIdRef.current = setInterval(pollCallback, 5000);
	};

	useEffect(() => {
		if (!watchedTransaction) return;
		poll();

		return () => {
			clearInterval(timerIdRef.current);
		};
	}, [watchedTransaction]);

	return (
		<>
			<div className="container">
				<h1>Rebar Shield Demo Reference</h1>
				<div className="description">
					<p>
						This is an open source reference implementation of the Rebar Shield
						protocol.
					</p>
					<p>
						The code is available on{" "}
						<a href="https://github.com/rebarsoftware/rebar-shield-reference">
							GitHub
						</a>
						.
					</p>
					<br />
					<p>
						For more information on the protocol, please visit{" "}
						<a href="https://docs.rebarlabs.io">https://docs.rebarlabs.io</a>.
					</p>

					<div className="warning">
						<p>
							Be advised, this is a demo reference implementation and is not
							intended for production use.
						</p>
						<p>
							Currently only supporting Unisat Wallet in this reference, however
							shield is wallet agnostic.
						</p>
						<p>
							<strong>Note:</strong> this reference implementation is not
							audited, use at your own risk!
						</p>
					</div>
				</div>

				<div className="wallet-section">
					{hasUnisat ? (
						<button
							onClick={() => {
								connect(UNISAT);
							}}
							disabled={connected || isConnecting}
						>
							{connected ? "Connected" : "Connect UNISAT Wallet"}
						</button>
					) : (
						<p className="wallet-message">Please download UNISAT wallet</p>
					)}
				</div>

				<div className="form-container">
					<div className="input-group">
						<label htmlFor="recipientAddress">Recipient Address:</label>
						<input
							id="recipientAddress"
							type="text"
							value={recipientAddress}
							onChange={(e) => setRecipientAddress(e.target.value)}
							placeholder="Enter recipient's Bitcoin address"
						/>
					</div>

					<div className="input-group">
						<label htmlFor="amount">Amount (in satoshis):</label>
						<input
							id="amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(Number(e.target.value))}
							placeholder="Enter amount to send"
							min="1"
						/>
					</div>

					<button
						onClick={() => handleSubmit(publicKey)}
						disabled={!connected || isConnecting}
					>
						Build Transaction
					</button>
				</div>

				{transactionData && (
					<div className="result">
						<h2>Feerate Info:</h2>
						<p>Payment Address: {transactionData.paymentAddress}</p>
						<p>FeeRate: {transactionData.feeRate} SAT/vB</p>
						<p>Fee: {transactionData.fee} SATS</p>
						<p>HashPercent: {transactionData.hashPercent}%</p>
					</div>
				)}

				{error && <div className="error">{error}</div>}

				{transaction && (
					<div className="result">
						<h2>Unsigned PSBT:</h2>
						<textarea readOnly value={transaction} rows={8} />
						<p className="info">You can now use a wallet to sign this PSBT.</p>

						<button
							onClick={async () => {
								await signPSBT(transaction, signPsbt, setSignedTransaction);
							}}
						>
							Sign Transaction
						</button>
					</div>
				)}

				{signedTransaction && !watchedTransaction && (
					<div className="result">
						<h2>Transaction Ready to Send!</h2>
						<textarea readOnly value={signedTransaction} rows={4} />
						<button
							onClick={async () => {
								await sendTransaction(signedTransaction, setWatchedTransaction);
							}}
						>
							Send Transaction
						</button>
					</div>
				)}

				{watchedTransaction && (
					<div className="result">
						<h2>Transaction Sent!</h2>
						<p className="tx-id">ID: {watchedTransaction}</p>
						<p className="status">Status: In Mempool</p>
						<p>This transaction should not be present in the public mempool.</p>
						<p>
							However, when confirmed you will be able to see it on the block
							explorer
						</p>
						<a
							href={`https://mempool.space/tx/${watchedTransaction}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							View on Mempool
						</a>
					</div>
				)}
			</div>
		</>
	);
}

export default App;
