import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type FormEvent, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router";

import {
  isSearchType,
  searchPath,
  SearchTypes,
  type SearchType,
} from "#/helpers/searchOptions";

export { SearchTypes, type SearchType };

const SEARCH_OPTION_VALUES = Object.values(SearchTypes);

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
    <Form className={className} onSubmit={submit}>
      <Form.Group className="mb-0">
        <InputGroup size={size}>
          <DropdownButton
            variant="secondary"
            title={intl.formatMessage({
              id: SEARCH_OPTION_MESSAGE_IDS[searchOption],
            })}
            id="search-option-dropdown"
            onSelect={(eventKey) => {
              if (eventKey && isSearchType(eventKey)) {
                setSearchOption(eventKey);
              }
            }}
          >
            {SEARCH_OPTION_VALUES.map((option) => (
              <Dropdown.Item
                key={option}
                eventKey={option}
                active={searchOption === option}
              >
                {intl.formatMessage({ id: SEARCH_OPTION_MESSAGE_IDS[option] })}
              </Dropdown.Item>
            ))}
          </DropdownButton>

          <Form.Control
            aria-label={intl.formatMessage({ id: "search.input.ariaLabel" })}
            placeholder={intl.formatMessage({
              id: SEARCH_PLACEHOLDER_MESSAGE_IDS[searchOption],
            })}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />

          <Button
            variant="primary"
            type="submit"
            aria-label={intl.formatMessage({ id: "search.button.ariaLabel" })}
          >
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}
