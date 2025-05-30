import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Radio } from "antd";
import AssignTrainingSteps from "../../../../pages/AssignTrainingSteps";

function AssignTrainings() {
  const location = useLocation();
  const [selection, setSelection] = useState("department");
  const [showSteps, setShowSteps] = useState(false);
  const program = location.state?.program;


  const handleNext = () => {
    setShowSteps(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Assign Trainings for: {program?.generalInfo?.title}</h2>
      <Radio.Group onChange={(e) => setSelection(e.target.value)} value={selection}>
        <Radio value="department">Department Level</Radio>
        <Radio value="org">Organization Level</Radio>
      </Radio.Group>
      <div style={{ marginTop: 20 }}>
        <Button type="primary" onClick={handleNext}>
          Next
        </Button>
      </div>

      {showSteps && <AssignTrainingSteps program={program} assignmentLevel={selection}/>}
    </div>
  );
}

export default AssignTrainings;