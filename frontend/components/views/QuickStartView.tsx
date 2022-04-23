import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import {
  Stepper,
  Step,
  StepButton,
  StepLabel,
  Button,
  Typography,
} from '@material-ui/core';
import logo from '../../../assets/logo/seeqr_dock.png';

interface QuickStartViewProps {
  show: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      marginRight: theme.spacing(1),
    },
    backButton: {
      marginRight: theme.spacing(1),
    },
    completed: {
      display: 'inline-block',
    },
    instructions: {
      marginBottom: theme.spacing(3),
    },
    image: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(-4),
      width: '20vh',
      height: '20vh',
      maxHeight: '300px',
      maxWidth: '300px',
    },
    stepper: {
      fontSize: '50px',
    },
  })
);

const PageContainer = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  width: auto;
`;

const StyledStepper = styled(Stepper)`
  margin: 70px 0px 20px 0px;
  background: transparent;
`;

const StyledStepLabel = styled(StepLabel)`
  width: 14vw;
  & .MuiStepLabel-label {
    font-size: clamp(1rem, 1.28vw, 1.5rem);
  }
`;

const StyledTypographyInstructions = styled.div`
  font-size: clamp(1rem, 2.2vw, 1.3rem);
  text-align: center;
`;

const StyledTypographyTitle = styled(Typography)`
  font-size: clamp(5rem, 40vw, 5rem);
`;

const NavButtons = styled.div`
  margin: 15px auto;
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StepList = styled.ul`
  text-align: left;
  font-size: 0.9em;

  & li {
    margin-top: 7px;
  }
`;

function getSteps() {
  return ['Import a Database', 'Create New Queries', 'Saving/Loading Queries', 'Compare Queries'];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return (
        <StyledTypographyInstructions>
          <strong>Step 1:</strong>
          <StepList>
            <li>To import a database, select the + icon in the sidebar.</li>
            <li>Enter a name for your database.</li>
            <li>
              Click the green &quot;Import File&quot; button and select a .sql
              file.
            </li>
            <li>Select your imported database on the sidebar to view table information.</li>
        
            <li>
              To view each table, click the name of the table in the top tabs
              bar.
            </li>
            <li>
              The chart will include column names, types, and if they are
              nullable.
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 1:
      return (
        <StyledTypographyInstructions>
          <strong>Step 2:</strong>
          <StepList>
            <li>Select which database you want to create a query in.</li>
            <li>
              Go into the queries tab by selecting the &quot;QUERIES&quot; tab
              in the sidebar.
            </li>
            <li>
              Select the + icon in the sidebar and give the query a label and a group on the
              right side.
            </li>
            <li>
              Optionally: You can change the database to create the query in
              from the &quot;Database&quot; dropdown.
            </li>
            <li>
              Use the &quot;Auto-Format&quot; button on the top-left to
              automatically format the query.
            </li>
            <li>Select the &quot;RUN QUERY&quot; button to execute.</li>
            <li>
              The planning time, execution time, and actual total time now show.
            </li>
            <li>The results from the query are in the table below.</li>
            <li>
              Select the &quot;Execution Plan&quot; button to view the analysis
              of running the query.
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
      case 2: 
        return (
        <StyledTypographyInstructions>
          <strong>Step 3:</strong>
          <StepList>
            <li>To save a query, declare a file location by clicking the &quot;Designate Save Location&quot; button in the queries tab</li>
            <li>Then, save queries individually by clicking the &quot;Save Query&quot; button</li>
            <li>To load data into SeeQR just click the &quot;Import Query&quot; button, select the file you wish to upload in your local file system and click &quot;Upload&quot;</li>
          </StepList>
        </StyledTypographyInstructions>
        )
    case 3:
      return (
        <StyledTypographyInstructions>
          <strong>Step 4:</strong>
          <StepList>
            <li>Select the checkbox of the queries inside the groups you would like to compare.</li>
            <li>Then, click the Chart Icon at the top of the sidebar.</li>
            <li>Feel free to continually select and deselect queries to compare.</li>
          </StepList>
        </StyledTypographyInstructions>
      );
    default:
      return 'Unknown step';
  }
}

const QuickStartView = ({ show }: QuickStartViewProps) => {
  if (!show) return null;
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(new Set<number>());
  const [skipped, setSkipped] = useState(new Set<number>());
  const steps = getSteps();

  const totalSteps = () => getSteps().length;

  const isStepOptional = (step: number) => step === null;

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const skippedSteps = () => skipped.size;

  const completedSteps = () => completed.size;

  const allStepsCompleted = () =>
    completedSteps() === totalSteps() - skippedSteps();

  const isLastStep = () => activeStep === totalSteps() - 1;

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed
          // find the first step that has been completed
          steps.findIndex((step, i) => !completed.has(i))
        : activeStep + 1;

    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);
    setCompleted(newCompleted);

    if (completed.size !== totalSteps() - skippedSteps()) {
      handleNext();
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted(new Set<number>());
    setSkipped(new Set<number>());
  };

  const isStepSkipped = (step: number) => skipped.has(step);

  function isStepComplete(step: number) {
    return completed.has(step);
  }

  return (
    <PageContainer>
      <StyledTypographyTitle align="center">
        Welcome to SeeQR
      </StyledTypographyTitle>
      <img className={classes.image} src={logo} alt="Logo" />
      <StyledStepper alternativeLabel nonLinear activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const buttonProps: { optional?: React.ReactNode } = {};
          if (isStepOptional(index)) {
            buttonProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepButton
                onClick={handleStep(index)}
                completed={isStepComplete(index)}
                {...buttonProps}
              >
                <StyledStepLabel className={classes.stepper}>
                  {label}
                </StyledStepLabel>
              </StepButton>
            </Step>
          );
        })}
      </StyledStepper>
      <div>
        {allStepsCompleted() ? (
          <div>
            <StyledTypographyInstructions className={classes.instructions}>
              All steps completed - you&apos;re ready to use SeeQr!
            </StyledTypographyInstructions>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <StepContent>
            {getStepContent(activeStep)}
            <NavButtons>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.button}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
              >
                Next
              </Button>
              {isStepOptional(activeStep) && !completed.has(activeStep) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSkip}
                  className={classes.button}
                >
                  Skip
                </Button>
              )}
              {activeStep !== steps.length &&
                (completed.has(activeStep) ? (
                  <Typography variant="caption" className={classes.completed}>
                    Step
                    {` ${activeStep + 1} `}
                    already completed
                  </Typography>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleComplete}
                  >
                    {completedSteps() === totalSteps() - 1
                      ? 'Finish'
                      : 'Complete Step'}
                  </Button>
                ))}
            </NavButtons>
          </StepContent>
        )}
      </div>
    </PageContainer>
  );
};

export default QuickStartView;
