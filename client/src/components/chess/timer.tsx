interface TimerProps {
  time: number;
  isActive: boolean;
}

export default function Timer({ time, isActive }: TimerProps) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className={`text-2xl font-mono font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
