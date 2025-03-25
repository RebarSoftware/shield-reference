import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LaserEyesProvider } from "@omnisat/lasereyes-react";
import ClickwrapWrapper from "./components/ClickwrapWrapper";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClickwrapWrapper>
			<LaserEyesProvider
				config={{
					network: "mainnet" as any,
				}}
			>
				<App />
			</LaserEyesProvider>
		</ClickwrapWrapper>
	</StrictMode>,
);
