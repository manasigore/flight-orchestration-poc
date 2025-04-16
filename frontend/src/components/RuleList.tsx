import React, { useEffect, useState } from "react";

type Rule = {
  id: string;
  name: string;
  messageTemplate: string;
  isActive: boolean;
  condition: {
    status?: string;
    beforeDepartureMins?: number;
  };
  createdAt: string;
  updatedAt: string;
};

export const RuleList: React.FC = () => {
  const [rules, setRule] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<
    Partial<Rule> & {
      condition?: { status?: string; beforeDepartureMins?: number };
    }
  >({});

  useEffect(() => {
    fetch("http://localhost:3000/rules")
      .then((res) => res.json())
      .then((data) => setRule(data))
      .catch((err) => setError(err.message));
  }, [refresh]);

  const deleteRule = async (id: string) => {
    if (!window.confirm(`Delete rule "${id}"?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/rules/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRefresh((prev) => prev + 1);
      } else {
        alert("Failed to delete rule");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEditing = (rule: Rule) => {
    setEditingId(rule.id);
    setEditForm({ ...rule, condition: { ...rule.condition } });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === "status" || name === "beforeDepartureMins") {
      setEditForm((prev) => ({
        ...prev,
        condition: {
          ...prev.condition!,
          [name]: name === "beforeDepartureMins" ? Number(value) : value,
        },
      }));
    } else if (name === "isActive") {
      setEditForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const saveEdit = async () => {
    const updated = {
      ...(editForm as Rule),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`http://localhost:3000/rules/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setEditingId(null);
        setEditForm({});
        setRefresh((prev) => prev + 1);
      } else {
        alert("Failed to update rule");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>📋 Active Automation</h2>
      {error && <p style={{ color: "red" }}>Failed to load rules: {error}</p>}
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {rules.map((rule) => (
          <li key={rule.id}>
            {editingId === rule.id ? (
              <>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                />
                <br />
                <textarea
                  name="messageTemplate"
                  value={editForm.messageTemplate}
                  onChange={handleEditChange}
                />
                <br />
                <input
                  name="status"
                  placeholder="Trigger Status"
                  value={editForm.condition?.status || ""}
                  onChange={handleEditChange}
                />
                <input
                  name="beforeDepartureMins"
                  type="number"
                  value={editForm.condition?.beforeDepartureMins || 0}
                  onChange={handleEditChange}
                />
                <br />
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editForm.isActive}
                    onChange={handleEditChange}
                  />{" "}
                  Active
                </label>
                <br />
                <button onClick={saveEdit}>💾 Save</button>
                <button onClick={cancelEdit}>✖ Cancel</button>
              </>
            ) : (
              <>
                <strong>{rule.name}</strong> ({rule.id})<br />
                Template: <code>{rule.messageTemplate}</code>
                <br />
                Status: {rule.condition.status || "Any"}
                <br />
                Trigger: {rule.condition.beforeDepartureMins} mins before
                departure
                <br />
                Active: {rule.isActive ? "✅" : "❌"}
                <br />
                <button onClick={() => startEditing(rule)}>✏ Edit</button>
                <button onClick={() => deleteRule(rule.id)}>🗑 Delete</button>
              </>
            )}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};
