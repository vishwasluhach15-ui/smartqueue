import "./index.css";
import { useState } from "react";

function App() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  // Add new token
  const addToken = () => {
    const newToken = queue.length + 1;
    setQueue([...queue, newToken]);
  };

  // Move to next
  const nextToken = () => {
    if (queue.length === 0) return;

    setCurrent(queue[0]);
    setQueue(queue.slice(1));
  };

  return (
    <div className="container">
      <h1>Smart Queue System 🚀</h1>

      {/* Current Token */}
      <div className="current">
        <h2>Current Token</h2>
        <p>{current ? current : "None"}</p>
      </div>

      {/* Buttons */}
      <div className="buttons">
        <button onClick={addToken}>Generate Token</button>
        <button onClick={nextToken}>Next</button>
      </div>

      {/* Queue List */}
      <div className="queue">
        <h2>Queue List</h2>
        {queue.length === 0 ? (
          <p>No people in queue</p>
        ) : (
          queue.map((q, i) => <div key={i} className="token">{q}</div>)
        )}
      </div>
    </div>
  );
}

export default App;