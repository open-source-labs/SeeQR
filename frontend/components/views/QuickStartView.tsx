import {
  Button,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import styled from 'styled-components';
import logo from '../../../assets/logo/seeqr_dock.png';
import { greyPrimary, greenPrimary, textColor } from '../../style-variables';

interface QuickStartViewProps {
  show: boolean;
}
// welcome page container w/o sidebar
const PageContainer = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  width: auto;
`;
// title: "welcome to SeeQR"
const StyledTypographyTitle = styled(Typography)`
  font-size: clamp(2rem, 35vw, 3rem);
`;
// each stepper component
const StyledStepper = styled(Stepper)`
  margin: 60px 10px 20px 0px;
`;
// stepButton with all elements inside
const StyledStepButton = styled(StepButton)`
  padding-top: 25px;
  & :hover {
    background-color: ${greyPrimary};
    transition: 200ms ease-in-out;
  }
`;
// Text label or stepper root
const StyledStepLabel = styled(StepLabel)`
  padding: 0 1% 4%;
  border-radius: 8px;
  width: 10vw;
  & .MuiStepLabel-label {
    font-size: clamp(1rem, 1.28vw, 1.3rem);
  }
`;
// container for the text instructions and navBtn
const StepContent = styled.div`
  min-height: 30vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;
// text instructions div
const StyledTypographyInstructions = styled.div`
  min-height: 25vw;
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  text-align: center;
  width: 50vw;
`;
// step list ul
const StepList = styled.ul`
  text-align: left;
  font-size: 0.9em;
  list-style: circle;
  & li {
    margin-top: 7px;
  }
`;
// container div for btn back & btn next
const NavButtons = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 15px;
  text-align: center;
`;
// back & reset Btn style
const StyledButton = styled(Button)`
  color: ${textColor};
  border-width: 1px;
  border-color: ${greenPrimary};
  border-radius: 10px;
  width: 150px;
  margin-top: 8px;
`;
// logo img
const StyledImg = styled.img`
  margin-top: 10px;
  margin-bottom: -32px;
  width: 20vh;
  height: 20vh;
  max-height: 300px;
  max-width: 300px;
`;
// array to hold all the steps
const steps: string[] = [
  'Set Up Servers and Permissions',
  'Import/ Export a Database',
  'Create New Queries',
  'Saving/Loading Queries',
  'Compare Queries',
];
// func to help get step instructions and render it
function getStepContent(step: number): JSX.Element | string {
  switch (step) {
    case 0:
      return (
        <StyledTypographyInstructions>
          <strong>Step 1:</strong>
          <StepList>
            <li>
              Install PostgreSQL and/or MySQL servers (for Mac, use Homebrew)
            </li>
            <li> Run server(s) in the background</li>
            <li>Ensure that PATH is enabled</li>
            <li>
              MySQL username defaults to &quot;root&quot; and postgres username
              defaults to &quot;postgres&quot;
            </li>
            <li>
              MySQL and postgres password will be your password to log into
              mySQL and postgres database
            </li>
            <li>
              Ports for PostgresSQL and MySQL are defaulted to &quot;5432&quot;
              and &quot;3306&quot;, respectively
            </li>
            <li>Enable full permissions for database manipulation</li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 1:
      return (
        <StyledTypographyInstructions>
          <strong>Step 2:</strong>
          <StepList>
            <li>
              To import a database, select the file upload icon in the sidebar
            </li>
            <li>Enter a unique name for your database</li>
            <li>
              Click the green &quot;Import File&quot; button and select a .sql
              file
            </li>
            <li>Select your imported database on the sidebar to view</li>
            <li>
              To view each table, click the name of the table in the top tabs
              bar
            </li>
            <li>
              The chart will include column names, types, and if they are
              nullable
            </li>
            <li>
              To export a database, select the file download icon next to the
              database name
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 2:
      return (
        <StyledTypographyInstructions>
          <strong>Step 3:</strong>
          <StepList>
            <li>Select which database you want to query with</li>
            <li>Select the &quot;QUERIES&quot; tab in the sidebar</li>
            <li>Give the query a label and a group</li>
            <li>
              Optionally: You can change the database from the
              &quot;Database&quot; dropdown
            </li>
            <li>
              Use the brush icon on the top-right to automatically format the
              query
            </li>
            <li>
              Use the previous queries dropdown to view and select previously
              inputted queries
            </li>
            <li>Select &quot;RUN QUERY&quot; button to execute</li>
            <li>
              The planning time, execution time, and actual total time now show
            </li>
            <li>The results from the query are in the table below</li>
            <li>
              Select the &quot;Execution Plan&quot; button to view the analysis
              of running the query
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 3:
      return (
        <StyledTypographyInstructions>
          <strong>Step 4:</strong>
          <StepList>
            <li>
              To save a query, click the folder icon in the &quot;QUERIES&quot;
              tab
            </li>
            <li>
              Designate a save file location and click &quot;Select Path&quot;
            </li>
            <li>
              Click the save icon in the query group drop-down to save queries
              automatically to designated file location
            </li>
            <li>
              To import a query file, click the import icon, select the file you
              wish to upload (.json) in your local file system and click
              &quot;Upload&quot;
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 4:
      return (
        <StyledTypographyInstructions>
          <strong>Step 5:</strong>
          <StepList>
            <li>Select the checkboxes in the query group drop-down</li>
            <li>
              Click the chart icon at the top of the sidebar to compare selected
              queries
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    default:
      return 'Unknown step';
  }
}

function QuickStartView({ show }: QuickStartViewProps): JSX.Element | null {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  if (!show) return null;
  const totalSteps = (): number => steps.length;

  // count completed steps number
  const completedSteps = (): number => Object.keys(completed).length;

  // check if it is the last step
  const isLastStep = (): boolean => activeStep === totalSteps() - 1;

  // check if all steps are completed
  const allStepsCompleted = (): boolean => completedSteps() === totalSteps();

  // func to handle next btn
  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  // func to handle back btn
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // func to set activeStep
  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };
  // func to handle each complete step btn
  const handleComplete = () => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };
  // handle reset btn after all steps completed
  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };
  // render components
  return (
    <PageContainer>
      <StyledTypographyTitle align="center">
        Welcome to SeeQR
      </StyledTypographyTitle>
      <StyledImg className="logo-img" src={logo} alt="SeeQR Logo" />
      <StyledStepper alternativeLabel nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StyledStepButton onClick={handleStep(index)}>
              <StyledStepLabel className="stepper">{label}</StyledStepLabel>
            </StyledStepButton>
          </Step>
        ))}
      </StyledStepper>
      <div>
        {allStepsCompleted() ? (
          <StepContent>
            <StyledTypographyInstructions className="step-instructions">
              <strong>All Steps Completed</strong>
              <p>You&apos;re ready to use SeeQR!</p>
            </StyledTypographyInstructions>
            <NavButtons>
              <StyledButton
                variant="outlined"
                onClick={handleReset}
                className="step-btn"
                id="step-reset-btn"
              >
                RESET
              </StyledButton>
            </NavButtons>
          </StepContent>
        ) : (
          <StepContent>
            {getStepContent(activeStep)}
            <NavButtons>
              {activeStep === 0 ? undefined : (
                <StyledButton
                  variant="outlined"
                  onClick={handleBack}
                  className="step-btn"
                  id="step-back-btn"
                >
                  BACK
                </StyledButton>
              )}

              {activeStep !== steps.length &&
                (completed[activeStep] ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    className="step-btn"
                    id="step-next-btn"
                    sx={{ mt: 1, borderRadius: '10px', width: 150 }}
                  >
                    NEXT
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    className="step-btn"
                    id="step-complete-next-btn"
                    onClick={handleComplete}
                    sx={{ mt: 1, borderRadius: '10px', width: 150 }}
                  >
                    {completedSteps() === totalSteps() - 1 ? 'FINISH' : 'NEXT'}
                  </Button>
                ))}
            </NavButtons>
          </StepContent>
        )}
      </div>
    </PageContainer>
  );
}

export default QuickStartView;
