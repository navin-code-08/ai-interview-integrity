import React, { useEffect, useState } from "react";

function Dashboard() {

  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/candidates")
      .then(res => res.json())
      .then(data => setCandidates(data));
  }, []);

  return (
    <div style={{textAlign:"center"}}>

      <h1>HR Dashboard</h1>

      <table border="1" style={{margin:"auto"}}>

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Interview Time</th>
            <th>Risk Score</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {candidates.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.interview_time || "N/A"}</td>
              <td>{c.risk_score || "N/A"}</td>
              <td>{c.status || "Pending"}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Dashboard;