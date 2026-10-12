import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "./SearchableDropdown.module.css";

export type SearchableDropdownProps<T> = {
  id: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getOptionKey: (option: T) => string;
  getOptionLabel: (option: T) => string;
  /** Extra text matched by the search, such as an identifier. */
  getOptionDescription?: (option: T) => string;
  renderOption?: (option: T) => ReactNode;
  placeholder?: string;
  emptyMessage: ReactNode;
  disabled?: boolean;
  maxResults?: number;
};

export function SearchableDropdown<T>({
  id,
  options,
  value,
  onChange,
  getOptionKey,
  getOptionLabel,
  getOptionDescription,
  renderOption,
  placeholder,
  emptyMessage,
  disabled = false,
  maxResults = 10,
}: SearchableDropdownProps<T>) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedLabel = value ? getOptionLabel(value) : "";
  const needle = hasTyped ? query.trim().toLowerCase() : "";

  const matches = useMemo(() => {
    const source = needle
      ? options.filter((option) => {
          const description = getOptionDescription?.(option) ?? "";
          return `${getOptionLabel(option)} ${description}`
            .toLowerCase()
            .includes(needle);
        })
      : options;
    return source.slice(0, maxResults);
  }, [getOptionDescription, getOptionLabel, maxResults, needle, options]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setHasTyped(false);
        setQuery("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openMenu() {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(0);
  }

  function select(option: T) {
    onChange(option);
    setOpen(false);
    setHasTyped(false);
    setQuery("");
  }

  function onInputChange(next: string) {
    setQuery(next);
    setHasTyped(true);
    setOpen(true);
    setActiveIndex(0);
    if (value && next !== getOptionLabel(value)) {
      onChange(null);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setActiveIndex((index) => {
        if (matches.length === 0) return 0;
        const step = event.key === "ArrowDown" ? 1 : -1;
        return (index + step + matches.length) % matches.length;
      });
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setHasTyped(false);
      setQuery("");
      return;
    }
    if (event.key === "Enter" && open) {
      event.preventDefault();
      const option = matches[activeIndex];
      if (option) select(option);
    }
  }

  const displayValue = hasTyped ? query : selectedLabel;
  const activeOption = matches[activeIndex];

  return (
    <div className={styles.root} ref={rootRef}>
      <input
        id={id}
        className={`form-control ${styles.input}`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && activeOption ? `${listId}-option-${activeIndex}` : undefined
        }
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onFocus={openMenu}
        onClick={openMenu}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul id={listId} className={styles.menu} role="listbox">
          {matches.length === 0 ? (
            <li className={styles.empty}>{emptyMessage}</li>
          ) : (
            matches.map((option, index) => {
              const key = getOptionKey(option);
              const selected = value ? getOptionKey(value) === key : false;
              return (
                <li key={key} role="presentation">
                  <button
                    id={`${listId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={selected || index === activeIndex}
                    className={styles.option}
                    data-active={index === activeIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(option)}
                  >
                    {renderOption
                      ? renderOption(option)
                      : getOptionLabel(option)}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
