// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import { useState, useEffect } from "react";

const API_URL =
  "https://azurlane.koumakan.jp/w/api.php?origin=*&action=query&list=categorymembers&cmtitle=Category%3ABattleships&cmlimit=500&format=json&fbclid=IwAR22KHRVpAZhhI8yEFElj0rFB8QMv5YOqwh90NHwskgzbOF8KM3qd5PxLdk";

export default function App() {
  const [data, setData] = useState();

  useEffect(() => {
    (async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      console.log(data);
    })();
  }, []);
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}