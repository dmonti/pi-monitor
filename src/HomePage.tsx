import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function HomePage() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/info")
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.toString());
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', maxWidth: 480, margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
      <h1>React Homepage</h1>
      <h2>Test Info from Backend API</h2>
      <pre style={{ textAlign: 'left', background: '#f6f8fa', padding: '1em', borderRadius: 4 }}>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<HomePage />);