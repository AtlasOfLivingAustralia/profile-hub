import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type FormEvent, useState, ViewTransition } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router";

import {
  isSearchType,
  type SearchType,
  SearchTypes,
  searchPath,
} from "#/helpers/searchOptions";

import styles from "./Search.module.css";

export { type SearchType, SearchTypes };

const SEARCH_OPTION_VALUES = Object.values(SearchTypes);

/** Shared element between the home hero and the /opus/search field. */
const SEARCH_FIELD_TRANSITION = "search-field";

const SEARCH_OPTION_MESSAGE_IDS: Record<SearchType, string> = {
  [SearchTypes.scientificName]: "search.option.scientificName",
  [SearchTypes.commonName]: "search.option.commonName",
  [SearchTypes.containingText]: "search.option.containingText",
};

const SEARCH_PLACEHOLDER_MESSAGE_IDS: Record<SearchType, string> = {
  [SearchTypes.scientificName]: "search.placeholder.scientificName",
  [SearchTypes.commonName]: "search.placeholder.commonName",
  [SearchTypes.containingText]: "search.placeholder.containingText",
};

type SearchProps = {
  /** Override collection slug; defaults to route param when present. */
  slug?: string | null;
  /** Initial search option. */
  initialType?: SearchType;
  /** Initial term shown in the input. */
  initialTerm?: string;
  /** Compact sizing for header usage. */
  size?: "sm" | "lg";
  /** Called instead of navigating (e.g. already on the search page). */
  onSearch?: (term: string, type: SearchType) => void;
  className?: string;
};

export function Search({
  slug: slugProp,
  initialType = SearchTypes.scientificName,
  initialTerm = "",
  size,
  onSearch,
  className,
}: SearchProps) {
  const intl = useIntl();
  const navigate = useNavigate();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const slug = slugProp === undefined ? routeSlug : slugProp;

  const [searchOption, setSearchOption] = useState<SearchType>(initialType);
  const [term, setTerm] = useState(initialTerm);
  const [syncedFrom, setSyncedFrom] = useState({ initialType, initialTerm });

  if (
    syncedFrom.initialType !== initialType ||
    syncedFrom.initialTerm !== initialTerm
  ) {
    setSyncedFrom({ initialType, initialTerm });
    setSearchOption(initialType);
    setTerm(initialTerm);
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = term.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed, searchOption);
      return;
    }

    navigate(searchPath({ term: trimmed, type: searchOption, slug }));
  }

  return (
    <ViewTransition
      name={SEARCH_FIELD_TRANSITION}
      default="none"
      share="search-field-share"
    >
      <Form className={className} onSubmit={submit}>
        <Form.Group className="mb-0">
          <InputGroup size={size}>
            <Dropdown
              onSelect={(eventKey) => {
                if (eventKey && isSearchType(eventKey)) {
                  setSearchOption(eventKey);
                }
              }}
            >
              <Dropdown.Toggle
                variant="secondary"
                className={styles.typeToggle}
                id="search-option-dropdown"
              >
                {intl.formatMessage({
                  id: SEARCH_OPTION_MESSAGE_IDS[searchOption],
                })}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {SEARCH_OPTION_VALUES.map((option) => (
                  <Dropdown.Item
                    key={option}
                    eventKey={option}
                    active={searchOption === option}
                  >
                    {intl.formatMessage({
                      id: SEARCH_OPTION_MESSAGE_IDS[option],
                    })}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Form.Control
              aria-label={intl.formatMessage({ id: "search.input.ariaLabel" })}
              placeholder={intl.formatMessage({
                id: SEARCH_PLACEHOLDER_MESSAGE_IDS[searchOption],
              })}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />

            <Button
              className={styles.searchButton}
              variant="primary"
              type="submit"
              aria-label={intl.formatMessage({
                id: "search.button.ariaLabel",
              })}
            >
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </InputGroup>
        </Form.Group>
      </Form>
    </ViewTransition>
  );
}
