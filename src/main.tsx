import { createRoot } from "react-dom/client";
import HomePage from "./components/HomePage";

const root = createRoot(document.getElementById("root")!);
root.render(<HomePage />);