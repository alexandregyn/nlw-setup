interface ProgressBarProsp {
  progress: number
}

export const ProgressBar = ({ progress }: ProgressBarProsp) => {
  const progressStyles = {
    width: `${progress}%`
  }

  return (
    <div className="h-3 rounded-xl bg-zinc-700 w-full mt-4">
      <div 
        role="progressbar"
        aria-label="Progresso de hábotps completados nesse dia"
        aria-valuenow={progress}
        className="h-3 rounded-xl bg-violet-600 transition-all duration-500"
        style={progressStyles}
      />
    </div>
  );
}