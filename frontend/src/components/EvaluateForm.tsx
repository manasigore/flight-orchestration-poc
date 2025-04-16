import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

type EvalResult = {
  ruleId: string;
  message: string;
};

export const EvaluateForm: React.FC = () => {
  const [flightId, setFlightId] = useState("");
  const [results, setResults] = useState<EvalResult[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flightId }),
    });

    if (!response.ok) {
      const error = await response.json();
      setResults(null);
      alert(error.error || "Failed to evaluate flight");
      return;
    }

    const data = await response.json();
    setResults(data.results);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Evaluate Flight
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <TextField
            fullWidth
            label="Flight ID"
            variant="outlined"
            value={flightId}
            onChange={(e) => setFlightId(e.target.value)}
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<PlayArrowIcon />}
          >
            Evaluate
          </Button>
        </Box>
      </Box>

      {results && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Results:
          </Typography>
          {results.length === 0 ? (
            <Typography color="text.secondary">
              No matching rules found.
            </Typography>
          ) : (
            <List>
              {results.map((r, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={r.message}
                    secondary={`Rule ID: ${r.ruleId}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}
    </Paper>
  );
};
