import type { IntlShape } from "react-intl";
import { type ErrorResponse, isRouteErrorResponse } from "react-router";

function getErrorMessage(error: unknown, intl: IntlShape): string {
  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return intl.formatMessage({ id: "error.network.unavailable" });
    }
    if (error.message) {
      if (error.message in intl.messages) {
        return intl.formatMessage({ id: error.message });
      }
      return error.message;
    }
    return error.toString();
  }

  if (isRouteErrorResponse(error)) {
    const data = (error as ErrorResponse).data;
    if (typeof data === "string") {
      if (data in intl.messages) {
        return intl.formatMessage({ id: data });
      }
      return data;
    }
    return intl.formatMessage({ id: "error.unknown" });
  }

  if (typeof error === "string") {
    if (error in intl.messages) {
      return intl.formatMessage({ id: error });
    }
    return error;
  }

  return intl.formatMessage({ id: "error.unknown" });
}

export default getErrorMessage;
