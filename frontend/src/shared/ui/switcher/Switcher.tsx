interface Props {
  enabled: boolean;
  setEnabled: () => void;
}

export const Switcher = ({ enabled, setEnabled }: Props) => {
  return (
    <div>
      <label
        htmlFor="toggle4"
        className="flex cursor-pointer select-none items-center"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="toggle4"
            className="sr-only"
            onChange={() => {
              setEnabled();
            }}
          />
          <div
            className={`block h-6 w-11 rounded-full ${enabled ? 'bg-purple-900' : 'bg-[#E4E7EC]'}`}
          ></div>
          <div
            className={`absolute left-[2px] top-[2px] flex h-5 w-5 items-center justify-center rounded-full bg-white transition ${
              enabled && '!right-1 !translate-x-full'
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};
