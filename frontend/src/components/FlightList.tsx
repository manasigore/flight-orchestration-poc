import React, { useEffect, useState } from "react";

type Flight = {
  id: string;
  flightNumber: string;
  status: string;
  departureTime: string;
  arrivalTime: string;
  createdAt: string;
  updatedAt: string;
};

export const FlightList: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Flight, "createdAt" | "updatedAt">>({
    id: "",
    flightNumber: "",
    status: "",
    departureTime: "",
    arrivalTime: "",
  });

  useEffect(() => {
    fetchAllFlights();
  }, [refresh]);

  const fetchAllFlights = async () => {
    try {
      const res = await fetch("http://localhost:3000/flights");
      const data = await res.json();
      {
        Array.isArray(flights) &&
          flights.map((f) => <li key={f.id}>{f.flightNumber}</li>);
      }
      setFlights(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:3001/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setForm({
          id: "",
          flightNumber: "",
          status: "",
          departureTime: "",
          arrivalTime: "",
        });
        setRefresh((prev) => prev + 1);
      } else {
        const err = await res.json();
        alert(`Failed to create flight: ${err.error}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteFlight = async (id: string) => {
    if (!window.confirm(`Delete flight "${id}"?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/flights/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRefresh((prev) => prev + 1);
      } else {
        alert("Failed to delete flight");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>✈️ Flight Management</h2>

      <form onSubmit={handleCreate}>
        <input
          name="id"
          value={form.id}
          onChange={handleChange}
          placeholder="Flight ID"
          required
        />
        <input
          name="flightNumber"
          value={form.flightNumber}
          onChange={handleChange}
          placeholder="Flight Number"
          required
        />
        <input
          name="status"
          value={form.status}
          onChange={handleChange}
          placeholder="Status (e.g., Delayed)"
        />
        <input
          name="departureTime"
          value={form.departureTime}
          onChange={handleChange}
          placeholder="Departure Time (ISO)"
        />
        <input
          name="arrivalTime"
          value={form.arrivalTime}
          onChange={handleChange}
          placeholder="Arrival Time (ISO)"
        />
        <button type="submit">➕ Add Flight</button>
      </form>

      <hr />

      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {flights.map((f) => (
          <li key={f.id}>
            <strong>{f.flightNumber}</strong> ({f.status})<br />
            Departs: {f.departureTime}
            <br />
            Arrives: {f.arrivalTime}
            <br />
            <button onClick={() => deleteFlight(f.id)}>🗑 Delete</button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};
