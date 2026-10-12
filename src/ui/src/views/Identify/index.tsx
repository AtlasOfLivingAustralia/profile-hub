import { FormattedMessage } from "react-intl";
import { useOutletContext } from "react-router";

import type { CollectionOutletContext } from "../Collection";

export function Component() {
  const { collection } = useOutletContext<CollectionOutletContext>();

  return (
    <section className="py-2">
      <h1 className="h3 mb-3">
        <FormattedMessage id="view.identify.title" />
      </h1>
      {collection.keybaseKeyId ? (
        <p className="text-body-secondary mb-0">
          <FormattedMessage id="view.identify.comingSoon" />
        </p>
      ) : (
        <p className="text-body-secondary mb-0">
          <FormattedMessage id="view.identify.unavailable" />
        </p>
      )}
    </section>
  );
}
