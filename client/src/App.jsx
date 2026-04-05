import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
  fetch("https://habit-tracker-wbl6.onrender.com/test-db")
    .then(res => res.json())
    .then(data => {
      console.log("DATA FROM BACKEND:", data); // 👈 ADD THIS
      setData(data);
    })
    .catch(err => console.error(err));
}, []);

  return (
    <div>
      <h1>DB Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
console.log("DATA FROM BACKEND:", data);

export default App;