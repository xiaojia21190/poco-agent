"use client";

import * as React from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  initialStep?: number;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => React.ReactNode;
  showFooter?: boolean;
  showCompleteButton?: boolean;
}

export function Stepper({
  children,
  initialStep = 1,
  currentStep: currentStepProp,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps,
  nextButtonProps,
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  renderStepIndicator,
  showFooter = true,
  showCompleteButton = true,
  className,
  ...rest
}: StepperProps) {
  const [internalStep, setInternalStep] = React.useState<number>(initialStep);
  const isControlled = typeof currentStepProp === "number";
  const currentStep = isControlled ? currentStepProp : internalStep;
  const [direction, setDirection] = React.useState<number>(0);

  const stepsArray = React.Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  React.useEffect(() => {
    if (!isControlled) {
      setInternalStep(initialStep);
    }
  }, [initialStep, isControlled]);

  const updateStep = React.useCallback(
    (newStep: number) => {
      if (!isControlled) {
        setInternalStep(newStep);
      }
      if (newStep > totalSteps) {
        onFinalStepCompleted();
      } else {
        onStepChange(newStep);
      }
    },
    [isControlled, onFinalStepCompleted, onStepChange, totalSteps],
  );

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  const { className: backButtonClassName, ...backButtonRest } =
    backButtonProps ?? {};
  const { className: nextButtonClassName, ...nextButtonRest } =
    nextButtonProps ?? {};
  const showNextButton = !isLastStep || showCompleteButton;

  return (
    <div className={cn("w-full", className)} {...rest}>
      <div className={cn("space-y-4", stepCircleContainerClassName)}>
        <div
          className={cn(
            "flex w-full items-center gap-3",
            stepContainerClassName,
          )}
        >
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={(clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && (
                  <StepConnector isComplete={currentStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={cn("space-y-2", contentClassName)}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && showFooter && (
          <div className={cn("", footerClassName)}>
            <div
              className={cn(
                "mt-4 flex",
                currentStep !== 1 ? "justify-between" : "justify-end",
              )}
            >
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className={cn(
                    "rounded px-2 py-1 text-sm text-muted-foreground transition hover:text-foreground",
                    "disabled:pointer-events-none disabled:opacity-50",
                    backButtonClassName,
                  )}
                  {...backButtonRest}
                >
                  {backButtonText}
                </button>
              )}
              {showNextButton && (
                <button
                  type="button"
                  onClick={isLastStep ? handleComplete : handleNext}
                  className={cn(
                    "flex items-center justify-center rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90",
                    "disabled:pointer-events-none disabled:opacity-50",
                    nextButtonClassName,
                  )}
                  {...nextButtonRest}
                >
                  {isLastStep ? "Complete" : nextButtonText}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: React.ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = "",
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = React.useState<number>(0);

  return (
    <motion.div
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: "spring", duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(height) => setParentHeight(height)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: React.ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: SlideTransitionProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "-100%" : "100%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "50%" : "-50%",
    opacity: 0,
  }),
};

interface StepProps {
  children: React.ReactNode;
  className?: string;
}

export function Step({ children, className }: StepProps) {
  return <div className={cn("px-0", className)}>{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
}: StepIndicatorProps) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
        ? "inactive"
        : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={cn(
        "relative outline-hidden focus:outline-none",
        disableStepIndicators ? "cursor-default" : "cursor-pointer",
      )}
      animate={status}
      initial={false}
      aria-disabled={disableStepIndicators}
    >
      <motion.div
        variants={indicatorVariants}
        transition={{ duration: 0.3 }}
        className="flex h-8 w-8 items-center justify-center rounded-full font-semibold"
      >
        {status === "complete" ? (
          <CheckIcon className="h-4 w-4 text-primary-foreground" />
        ) : status === "active" ? (
          <div className="h-3 w-3 rounded-full bg-primary-foreground" />
        ) : (
          <span className="text-sm text-muted-foreground">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

const indicatorVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: "var(--muted)",
  },
  active: {
    scale: 1,
    backgroundColor: "var(--primary)",
  },
  complete: {
    scale: 1,
    backgroundColor: "var(--primary)",
  },
};

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  const lineVariants: Variants = {
    incomplete: { width: 0, backgroundColor: "transparent" },
    complete: { width: "100%", backgroundColor: "var(--primary)" },
  };

  return (
    <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-border">
      <motion.div
        className="absolute left-0 top-0 h-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
