import React, { useState, useRef, useEffect } from 'react';
import Label from '../label/label';

interface Option {
  value: string;
  label: string | null;
}

interface Props {
  selectedOptions: Option[];
  options: Option[];
  setOptions: (newOptions: Option[]) => void;
  label?: string;
}

export const MultiSelect = ({
  options,
  selectedOptions,
  setOptions,
  label,
}: Props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="w-full flex flex-col">
      {label && <Label htmlFor="multiselect">{label}</Label>}

      <div className="relative inline-block">
        <button
          type="button"
          ref={trigger}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="min-h-11 w-full inline-flex items-center gap-2.5 bg-primary 
            px-3 py-1.5 font-medium hover:bg-opacity-95 border text-gray-800 border-gray-300
    focus:border-gray-400 focus:ring-gray-300 rounded-[22px]
    dark:border-gray-700 dark:text-white/90 dark:focus:border-gray-500"
        >
          <div className="grow flex gap-2 flex-wrap">
            {selectedOptions.map((option, index) => (
              <div
                key={option.value}
                className="bg-[#F2F4F7] rounded-full border border-[#E4E7EC] px-3 py-1 flex gap-1 
                items-center grow-0"
              >
                {option.label}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    const newOptions = selectedOptions.filter(
                      (_, i) => i !== index
                    );
                    setOptions(newOptions);
                  }}
                  className="flex items-center justify-center rounded-full text-gray-400 transition-colors 
                  hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 
                  dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          <svg
            className={`fill-current duration-200 ease-linear basis-5  ${
              dropdownOpen && 'rotate-180'
            }`}
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.564864 0.879232C0.564864 0.808624 0.600168 0.720364 0.653125 0.667408C0.776689 0.543843 0.970861 0.543844 1.09443 0.649756L5.82517 5.09807C5.91343 5.18633 6.07229 5.18633 6.17821 5.09807L10.9089 0.649756C11.0325 0.526192 11.2267 0.543844 11.3502 0.667408C11.4738 0.790972 11.4562 0.985145 11.3326 1.10871L6.60185 5.55702C6.26647 5.85711 5.73691 5.85711 5.41917 5.55702L0.670776 1.10871C0.600168 1.0381 0.564864 0.967492 0.564864 0.879232Z"
              fill=""
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.4719 0.229332L6.00169 4.48868L10.5171 0.24288C10.9015 -0.133119 11.4504 -0.0312785 11.7497 0.267983C12.1344 0.652758 12.0332 1.2069 11.732 1.50812L11.7197 1.52041L6.97862 5.9781C6.43509 6.46442 5.57339 6.47872 5.03222 5.96853C5.03192 5.96825 5.03252 5.96881 5.03222 5.96853L0.271144 1.50833C0.123314 1.3605 -5.04223e-08 1.15353 -3.84322e-08 0.879226C-2.88721e-08 0.660517 0.0936127 0.428074 0.253705 0.267982C0.593641 -0.0719548 1.12269 -0.0699964 1.46204 0.220873L1.4719 0.229332ZM5.41917 5.55702C5.73691 5.85711 6.26647 5.85711 6.60185 5.55702L11.3326 1.10871C11.4562 0.985145 11.4738 0.790972 11.3502 0.667408C11.2267 0.543844 11.0325 0.526192 10.9089 0.649756L6.17821 5.09807C6.07229 5.18633 5.91343 5.18633 5.82517 5.09807L1.09443 0.649756C0.970861 0.543844 0.776689 0.543843 0.653125 0.667408C0.600168 0.720364 0.564864 0.808624 0.564864 0.879232C0.564864 0.967492 0.600168 1.0381 0.670776 1.10871L5.41917 5.55702Z"
              fill=""
            />
          </svg>
        </button>
        <div
          ref={dropdown}
          onFocus={() => {
            setDropdownOpen(true);
          }}
          onBlur={() => setDropdownOpen(false)}
          className={`absolute left-0 top-full z-40 mt-2 w-full rounded-[22px] border border-stroke bg-white py-3 shadow-card dark:border-strokedark dark:bg-boxdark ${
            dropdownOpen === true ? 'block' : 'hidden'
          }`}
        >
          <ul className="flex flex-col">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className="flex py-2 px-5 font-medium hover:bg-whiter hover:text-primary 
                  dark:hover:bg-meta-4 cursor-pointer"
                  onClick={() => {
                    if (
                      !selectedOptions.some((opt) => opt.value === option.value)
                    ) {
                      const newOptions = [...selectedOptions, option];
                      setOptions(newOptions);
                    }
                    setDropdownOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
