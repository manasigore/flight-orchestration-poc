import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { SelectChangeEvent } from "@mui/material/Select";

type Flight = {
  id: string;
  flightNumber: string;
  status: string;
  departureTime: string;
  arrivalTime: string;
  createdAt: string;
  updatedAt: string;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "On-Time":
      return {
        backgroundColor: "#e6f4ea",
        color: "#1e8e3e",
        border: "1px solid #1e8e3e",
      };
    case "Delayed":
      return {
        backgroundColor: "#fce8e6",
        color: "#d93025",
        border: "1px solid #d93025",
      };
    case "Wifi-Down":
      return {
        backgroundColor: "#f3e8fd",
        color: "#8430ce",
        border: "1px solid #8430ce",
        animation: "pulse 2s infinite",
      };
    default:
      return {
        backgroundColor: "#f5f5f5",
        color: "text.secondary",
      };
  }
};

const FlightsList: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expandedFlight, setExpandedFlight] = useState<string | false>(false);
  const [form, setForm] = useState<Omit<Flight, "createdAt" | "updatedAt">>({
    id: "",
    flightNumber: "",
    status: "",
    departureTime: "",
    arrivalTime: "",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  useEffect(() => {
    fetchAllFlights();
  }, [refresh]);

  const handleAccordionChange =
    (flightId: string) =>
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedFlight(isExpanded ? flightId : false);
    };

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
      // setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateTimeForInput = (isoString: string) => {
    return isoString.substring(0, 16); // Format for datetime-local input
  };

  const formatDateTimeForAPI = (localDateTime: string) => {
    return new Date(localDateTime).toISOString();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      departureTime: formatDateTimeForAPI(form.departureTime),
      arrivalTime: formatDateTimeForAPI(form.arrivalTime),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:3000/flights", {
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
      // alert(err.message);
      // setError(err.message);
    }
  };

  const handleEdit = (flight: Flight) => {
    const formData = {
      id: flight.id,
      flightNumber: flight.flightNumber,
      status: flight.status,
      departureTime: formatDateTimeForInput(flight.departureTime),
      arrivalTime: formatDateTimeForInput(flight.arrivalTime),
    };
    setForm(formData);
    setEditingFlight(flight);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    try {
      if (
        !form.id ||
        !form.status ||
        !form.departureTime ||
        !form.arrivalTime
      ) {
        alert("All fields are required");
        return;
      }

      const payload = {
        id: form.id,
        flightNumber: form.flightNumber,
        status: form.status,
        departureTime: formatDateTimeForAPI(form.departureTime),
        arrivalTime: formatDateTimeForAPI(form.arrivalTime),
        updatedAt: new Date().toISOString(),
        createdAt: editingFlight?.createdAt,
      };

      console.log("Update payload:", payload);

      const res = await fetch(`http://localhost:3000/flights/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update flight");
      }

      setOpenDialog(false);
      setEditingFlight(null);
      setForm({
        id: "",
        flightNumber: "",
        status: "",
        departureTime: "",
        arrivalTime: "",
      });
      setRefresh((prev) => prev + 1);
    } catch (err: any) {
      console.error("Update error:", err);
      // alert(err.message);
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
    <>
      <Paper sx={{ maxWidth: "600px", mb: 2, p: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Flights
        </Typography>
        <TableContainer>
          <Table>
            <TableBody>
              {flights.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell sx={{ p: 1, width: "100%" }}>
                    <Accordion
                      expanded={expandedFlight === flight.id}
                      onChange={handleAccordionChange(flight.id)}
                      sx={{ width: "100%" }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          "& .MuiAccordionSummary-content": {
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            pr: 2,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold" }}>
                            {flight.flightNumber}
                          </Typography>
                          <Typography
                            sx={{
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              minWidth: "90px",
                              textAlign: "center",
                              ...getStatusStyle(flight.status),
                              "@keyframes pulse": {
                                "0%": { opacity: 1 },
                                "50%": { opacity: 0.6 },
                                "100%": { opacity: 1 },
                              },
                            }}
                          >
                            {flight.status}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            <Typography>
                              <strong>Departure:</strong>{" "}
                              {new Date(flight.departureTime).toLocaleString()}
                            </Typography>
                            <Typography>
                              <strong>Arrival:</strong>{" "}
                              {new Date(flight.arrivalTime).toLocaleString()}
                            </Typography>
                            <Typography>
                              <strong>Status:</strong> {flight.status}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(flight)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => deleteFlight(flight.id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editingFlight ? "Edit Flight" : "Create Flight"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Flight Number"
              name="flightNumber"
              value={form.flightNumber}
              onChange={handleChange}
              disabled={!!editingFlight}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="On-Time">On-Time</MenuItem>
                <MenuItem value="Delayed">Delayed</MenuItem>
                <MenuItem value="Wifi-Down">Wifi-Down</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Departure Time"
              name="departureTime"
              type="datetime-local"
              value={form.departureTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Arrival Time"
              name="arrivalTime"
              type="datetime-local"
              value={form.arrivalTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editingFlight ? handleUpdate : handleCreate}
            variant="contained"
          >
            {editingFlight ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FlightsList;
