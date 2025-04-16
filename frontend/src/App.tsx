import "./App.css";
import { EvaluateForm } from "./components/EvaluateForm";
import { CreateRuleForm } from "./components/CreateRuleForm";
import { RuleList } from "./components/RuleList";
import FlightsList from "./components/FlightList";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function App() {
  return (
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mt: 4, mb: 6 }}
      >
        Flight Messaging Orchestration
      </Typography>

      <Box sx={{ mb: 6 }}>
        <EvaluateForm />
      </Box>

      <Grid container spacing={4}>
        <Grid>
          <RuleList />
        </Grid>
        <Grid>
          <Box sx={{ mb: 4 }}>
            <CreateRuleForm />
          </Box>
          <FlightsList />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
