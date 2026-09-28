interface Props {
  text: string
}

export const ErrorComponent = ({ text }: Props) => (
  <p className="text-xs text-rose-500 dark:text-rose-400 animate-fade-in">{text}</p>
)
