import { toast } from "sonner";
import { useErrorStore } from "@/store/errorStore";
import { AxiosError } from "axios";
import type {
  ErrorType,
  RedirectRule,
  ValidationErrorResponse,
} from "@/shared/types/error";
import type { FailedResponse } from "@/shared/types/api";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export const handleRequestError = (
  error: ErrorType | FailedResponse,
  options: {
    showToast?: boolean;
    toastMessage?: string;
    storeError?: (message: string) => void;
    redirectRules?: RedirectRule | RedirectRule[];
  } = {},
) => {
  const { showToast = true, toastMessage, storeError, redirectRules } = options;
  const { setError } = useErrorStore.getState();
  console.log(error);

  setError(error);

  const isFailedResponse = (err: any): err is FailedResponse => {
    return (err as FailedResponse).success === false;
  };

  const errorData = isFailedResponse(error)
    ? error
    : (error.response?.data as ValidationErrorResponse);

  // Try to get the most specific error message
  const errorMessage =
    errorData?.detail ||
    errorData?.title ||
    (!isFailedResponse(error) ? (error as AxiosError).message : "") ||
    toastMessage ||
    "An error occurred";

  const errorStatus =
    (!isFailedResponse(error)
      ? error.status || error.response?.status
      : error.status) ||
    errorData?.status ||
    500;

  if (
    errorData?.errorCode === "VALIDATION_FAILED" &&
    errorData?.validationErrors
  ) {
    if (showToast) {
      const allErrors = Object.entries(errorData.validationErrors).map(
        ([field, errors]) => {
          const cleanField = field.charAt(0).toUpperCase() + field.slice(1);
          return `${cleanField}: ${Array.isArray(errors) ? errors.join(", ") : errors}`;
        },
      );
      toast.error(errorData.title || "Validation Error", {
        description: allErrors.join("\n"),
        duration: 5000,
      });
    }
  } else {
    if (storeError) {
      storeError(errorMessage);
    }

    if (showToast) {
      toast.error(errorMessage);
    }
  }

  const handleRedirectRule = (rule: RedirectRule) => {
    if (errorStatus === rule.status) {
      location.replace(
        rule.path + "?returnUrl=" + encodeURIComponent(location.pathname),
      );
    }
  };

  if (redirectRules && Array.isArray(redirectRules))
    redirectRules.forEach(handleRedirectRule);
  else if (redirectRules) handleRedirectRule(redirectRules);
};

/**
 * Map API validation errors to React Hook Form errors
 * @param error - The error from the API
 * @param setError - React Hook Form's setError function
 * @param options - Optional configuration for mapping
 * @returns true if validation errors were set, false otherwise
 */
export const mapValidationErrorsToForm = <T extends FieldValues>(
  error: ErrorType | FailedResponse,
  setError: UseFormSetError<T>,
  options: { prefix?: string } = {},
): boolean => {
  const isFailedResponse = (err: any): err is FailedResponse => {
    return (err as FailedResponse).success === false;
  };

  const errorData = isFailedResponse(error)
    ? error
    : (error.response?.data as ValidationErrorResponse);

  const validationErrors = errorData?.validationErrors;
  const errorStatus = isFailedResponse(error)
    ? error.status
    : error.response?.status || error.status || 500;

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    let hasMapped = false;

    Object.entries(validationErrors).forEach(([field, errors]) => {
      const errorMessages = Array.isArray(errors) ? errors : [errors];
      const message = errorMessages.join(". ");

      // Convert API PascalCase or dot-notated fields to camelCase paths
      // e.g., "Address.Street" -> "address.street" or "Name" -> "name"
      const fieldPath = field
        .split(".")
        .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
        .join(".");

      const fullPath = options.prefix
        ? `${options.prefix}.${fieldPath}`
        : fieldPath;

      try {
        setError(fullPath as Path<T>, {
          type: "server",
          message: message,
        });
        hasMapped = true;
      } catch (e) {
        console.warn(`Could not map error to field: ${fullPath}`, e);
      }
    });

    if (hasMapped) return true;
  }

  // Fallback for 400 Bad Request with a detail message that might be a validation error
  if (errorStatus === 400 && errorData?.detail) {
    setError("root" as Path<T>, {
      type: "server",
      message: errorData.detail,
    });
    return true;
  }

  return false;
};

export const createErrorHandler = (
  options: {
    showToast?: boolean;
    toastMessage?: string;
    storeError?: (message: string) => void;
    redirectRules?: RedirectRule | RedirectRule[];
  } = {},
) => {
  return (error: ErrorType | FailedResponse) =>
    handleRequestError(error, options);
};
