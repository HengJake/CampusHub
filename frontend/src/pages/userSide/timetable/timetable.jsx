// Timetable component
import { Container } from "@chakra-ui/react";
import "./timetable.scss";

function Timetable() {
  return (
    <Container className="timetable-container" maxW="container.xl">
      <h1 className="timetable-title">Timetable</h1>
      <div className="timetable-content">
        {/* Timetable content goes here */}
        <p>This is where the timetable will be displayed.</p>
      </div>
    </Container>
  );
}

export default Timetable;
