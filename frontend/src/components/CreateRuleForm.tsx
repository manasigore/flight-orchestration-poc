import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";

export const CreateRuleForm: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    messageTemplate: "",
    status: "",
    beforeDepartureMins: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: uuidv4(),
      name: form.name,
      messageTemplate: form.messageTemplate,
      condition: {
        status: form.status || undefined,
        beforeDepartureMins: form.beforeDepartureMins
          ? parseInt(form.beforeDepartureMins)
          : undefined,
      },
      isActive: form.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:3000/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setForm({
          name: "",
          messageTemplate: "",
          status: "",
          beforeDepartureMins: "",
          isActive: true,
        });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create rule");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create Rule
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Rule Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Message Template"
            name="messageTemplate"
            value={form.messageTemplate}
            onChange={handleChange}
            multiline
            rows={3}
            required
            helperText="Use {flightNumber} as a placeholder"
          />
          <TextField
            fullWidth
            label="Trigger Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            helperText="Leave empty to match any status"
          />
          <TextField
            fullWidth
            label="Minutes before departure"
            name="beforeDepartureMins"
            type="number"
            value={form.beforeDepartureMins}
            onChange={handleChange}
            helperText="Leave empty to ignore timing"
          />
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
            }
            label="Active"
          />
          <Button type="submit" variant="contained" color="primary">
            Create Rule
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
