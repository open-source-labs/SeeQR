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
    root: {
      width: '100%',
    },
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
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(-2),
    },
    title: {
      marginTop: theme.spacing(3),
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
  justify-content: space-evenly;
`;

const StyledStepper = styled(Stepper)`
  margin: 70px 0px 20px 0px;
  background: transparent;
`;

const StyledStepLabel = styled(StepLabel)`
  width: 20vw;
  & .MuiStepLabel-label {
    font-size: 25px;
  }
`;

function getSteps() {
  return ['Import a Database', 'Create New Queries', 'Compare Queries'];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return (
        <Typography>
          <strong>Step 1:</strong>
          <br />
          To import a database, select the + icon in the sidebar.
          <br />
          A modal will appear where you can enter a database name.
          <br />
          Click the green "Import File" button and select a .sql file.
          <br />
          The imported database will now appear on the sidebar.
          <br />
          You can select a database to view table information.
          <br />
          To view each table, click the name of the table in the top tabs bar.
          <br />
          The chart will include column names, types, and if they are nullable.
        </Typography>
      );
    case 1:
      return (
        <Typography>
          <strong>Step 2:</strong>
          <br />
          Select which database you want to create a query in.
          <br />
          Go into the queries tab by selecting the "QUERIES" tab in the sidebar.
          <br />
          Select the + icon in the sidebar and give the query a label on the
          rightside.
          <br />
          Optionally: You can change the database to create the query in from
          the "Database" dropdown.
          <br />
          Write the query script in the designated body. <br />
          Use the "Auto-Format" button on the top-left to automatically format
          the query.
          <br />
          Select the "RUN QUERY" button to execute.
          <br />
          The planning time, execution time, and actual total time now show.
          <br />
          The results from the query are in the table below.
          <br />
          Select the "Execution Plan" button to view the analysis of running the
          query.
        </Typography>
      );
    case 2:
      return (
        <Typography>
          <strong>Step 3:</strong>
          <br />
          To compare queries, select the checkbox of the queries you would like
          to compare.
          <br />
          Then select the Chart Icon at the top of the sidebar.
          <br />
          Feel free to continually select and deselect queries to compare.
        </Typography>
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
    <div className={classes.root}>
      <PageContainer>
        <Typography className={classes.title} align="center" variant="h1">
          Welcome to SeeQr
        </Typography>
        <img
          className={classes.image}
          src={logo}
          alt="Logo"
          width="300px"
          height="300px"
        />
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
              <Typography className={classes.instructions}>
                All steps completed - you&apos;re ready to use SeeQr!
              </Typography>
              <Button onClick={handleReset}>Reset</Button>
            </div>
          ) : (
            <>
              <div>
                <Typography align="center" className={classes.instructions}>
                  {getStepContent(activeStep)}
                </Typography>
                <div>
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
                      <Typography
                        variant="caption"
                        className={classes.completed}
                      >
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
                </div>
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
};

export default QuickStartView;
