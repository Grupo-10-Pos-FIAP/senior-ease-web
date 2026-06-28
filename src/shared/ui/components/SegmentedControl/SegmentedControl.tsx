import "./SegmentedControl.css";

interface SegmentedControlOption<T extends string | number> {
  value: T;
  label: string;
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string | number> {
  name: string;
  value: T;
  options: SegmentedControlOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  labelledBy?: string;
}

export function SegmentedControl<T extends string | number>({
  name,
  value,
  options,
  onChange,
  ariaLabel,
  labelledBy,
}: SegmentedControlProps<T>) {
  const groupProps = labelledBy
    ? { "aria-labelledby": labelledBy }
    : { "aria-label": ariaLabel ?? name };

  return (
    <div className="segmented-control" role="radiogroup" {...groupProps}>
      {options.map((option) => {
        const id = `${name}-${String(option.value)}`;
        const isActive = option.value === value;
        const radioAriaLabel = option.ariaLabel ?? option.label;

        return (
          <label
            key={id}
            htmlFor={id}
            className={`segmented-control__option ${isActive ? "segmented-control__option--active" : ""}`}
          >
            <input
              type="radio"
              id={id}
              name={name}
              value={String(option.value)}
              checked={isActive}
              onChange={() => {
                onChange(option.value);
              }}
              className="segmented-control__input"
              aria-label={radioAriaLabel}
            />
            <span className="segmented-control__label" aria-hidden="true">
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
