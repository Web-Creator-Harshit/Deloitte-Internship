interface WorkflowStepsProps {
  currentStep: number;
}

export function WorkflowSteps({ currentStep }: WorkflowStepsProps) {
  const steps = [
    { number: 1, title: "Upload Files" },
    { number: 2, title: "Preview & Convert" },
    { number: 3, title: "Download Results" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4 sm:space-x-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.number <= currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {step.number}
              </div>
              <span className={`text-sm font-medium ${
                step.number <= currentStep ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-slate-200 mx-4 sm:mx-8 w-16 sm:w-24" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
