import React, { useState } from "react";

export const CreateRuleForm: React.FC = () => {
  const [form, setForm] = useState({
    id: "",
    name: "",
    status: "",
    beforeDepartureMins: "",
    messageTemplate: "",
    isActive: true,
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const inputValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: inputValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.id || !form.name || !form.messageTemplate) {
      setError(
        "Please fill in all required fields: ID, Name, and Message Template."
      );
      return;
    }

    const beforeMins = Number(form.beforeDepartureMins);
    if (form.beforeDepartureMins && (isNaN(beforeMins) || beforeMins < 0)) {
      setError('Please enter a valid number for "Minutes before departure".');
      return;
    }

    const rulePayload = {
      id: form.id,
      name: form.name,
      condition: {
        status: form.status || undefined,
        beforeDepartureMins: form.beforeDepartureMins ? beforeMins : undefined,
      },
      messageTemplate: form.messageTemplate,
      isActive: form.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:3000/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rulePayload),
      });

      if (res.ok) {
        setSuccess(true);
        setError(null);
        setForm({
          id: "",
          name: "",
          status: "",
          beforeDepartureMins: "",
          messageTemplate: "",
          isActive: true,
        });
      } else {
        const err = await res.json();
        setError(err.message || "Unknown error");
        setSuccess(false);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Create Automation</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="id"
          value={form.id}
          onChange={handleChange}
          placeholder="Rule ID"
          required
        />
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Rule Name"
          required
        />
        <input
          name="status"
          value={form.status}
          onChange={handleChange}
          placeholder="Trigger Status (e.g., Delayed)"
        />
        <input
          name="beforeDepartureMins"
          type="number"
          value={form.beforeDepartureMins}
          onChange={handleChange}
          placeholder="Minutes before departure"
        />
        <textarea
          name="messageTemplate"
          value={form.messageTemplate}
          onChange={handleChange}
          placeholder="Message Template"
          required
        />
        <label>
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          Active
        </label>

        <button type="submit">Create Automation</button>
      </form>

      {success && (
        <p style={{ color: "green" }}>✅ Automation created successfully!</p>
      )}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}
    </div>
  );
};
