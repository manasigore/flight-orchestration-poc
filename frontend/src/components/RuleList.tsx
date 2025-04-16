import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  TextField,
  Button,
  Switch,
  Box,
  Stack,
  FormControlLabel,
} from "@mui/material";

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
      isActive: Boolean(editForm.isActive),
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
    <Paper sx={{ maxWidth: "600px", mb: 2, p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Automation Rules
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          Failed to load rules: {error}
        </Typography>
      )}
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {rules.map((rule) => (
          <ListItem
            key={rule.id}
            sx={{
              flexDirection: "column",
              alignItems: "stretch",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              mb: 1,
              p: 2,
            }}
          >
            {editingId === rule.id ? (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                />
                <TextField
                  fullWidth
                  label="Message Template"
                  name="messageTemplate"
                  multiline
                  rows={2}
                  value={editForm.messageTemplate}
                  onChange={handleEditChange}
                />
                <TextField
                  fullWidth
                  label="Trigger Status"
                  name="status"
                  value={editForm.condition?.status || ""}
                  onChange={handleEditChange}
                />
                <TextField
                  fullWidth
                  label="Minutes before departure"
                  name="beforeDepartureMins"
                  type="number"
                  value={editForm.condition?.beforeDepartureMins || 0}
                  onChange={handleEditChange}
                />
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={editForm.isActive}
                      onChange={handleEditChange}
                    />
                  }
                  label="Active"
                />
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button variant="outlined" onClick={saveEdit}>
                    Save
                  </Button>
                  <Button onClick={cancelEdit}>Cancel</Button>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ width: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  {rule.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID: {rule.id}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Message: <code>{rule.messageTemplate}</code>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Status: {rule.condition.status || "Any"}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Trigger: {rule.condition.beforeDepartureMins} mins before
                  departure
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Active: {rule.isActive ? "✅" : "❌"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button variant="outlined" onClick={() => startEditing(rule)}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => deleteRule(rule.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
