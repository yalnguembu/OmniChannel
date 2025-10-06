# Form Validation Error Handling

This document explains how to handle API validation errors in forms using the enhanced error handling utilities.

## API Error Response Structure

The API returns validation errors in the following format:

```json
{
  "type": "https://fujipay.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Une ou plusieurs erreurs de validation se sont produites.",
  "data": null,
  "success": false,
  "errorCode": "VALIDATION_FAILED",
  "traceId": "80002b01-0008-f900-b63f-84710c7967bb",
  "timestamp": "2025-10-02T14:23:18.4985317+00:00",
  "validationErrors": {
    "Email": [
      "Le format de l'email est invalide"
    ],
    "InitialPassword": [
      "Le mot de passe initial doit contenir au moins 8 caractères",
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    ]
  },
  "metadata": null
}
```

## Usage in Forms

### Basic Usage with `createFormMutationErrorHandler`

```tsx
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"

function MyForm() {
  const form = useForm()
  const { createFormMutationErrorHandler } = useErrorHandling()

  const mutation = useMutation({
    mutationFn: (data) => apiCall(data),
    onError: createFormMutationErrorHandler(form.setError, {
      showToast: false, // Optional: disable toast to only show inline errors
    }),
    onSuccess: () => {
      // Handle success
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage /> {/* Will display API validation errors */}
            </FormItem>
          )}
        />
        {/* More fields... */}
      </form>
    </Form>
  )
}
```

### Manual Validation Error Mapping

```tsx
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"

function MyForm() {
  const form = useForm()
  const { mapValidationErrorsToForm } = useErrorHandling()

  const mutation = useMutation({
    mutationFn: (data) => apiCall(data),
    onError: (error) => {
      // Map validation errors to form
      const hasValidationErrors = mapValidationErrorsToForm(error, form.setError)

      // Handle other errors
      if (!hasValidationErrors) {
        toast.error("Something went wrong")
      }
    },
  })

  // Rest of component...
}
```

### Complete Example with Page-Level Integration

```tsx
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import { postApiUsers } from "@/shared/api"
import { CreateUserRequest, zCreateUserRequest } from "@/shared/api"

export function UserCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { createFormMutationErrorHandler } = useErrorHandling()

  const form = useForm<CreateUserRequest>({
    resolver: zodResolver(zCreateUserRequest),
    defaultValues: {
      email: "",
      initialPassword: "",
      firstName: "",
      lastName: "",
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => postApiUsers({ body: data }),
    onError: createFormMutationErrorHandler(form.setError, {
      showToast: false, // Only show inline form errors
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      navigate({ to: "/users" })
    },
  })

  const handleSubmit = (data: CreateUserRequest) => {
    createMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  )
}
```

## How It Works

1. **Error Detection**: When the API returns a `400` status with `errorCode: "VALIDATION_FAILED"`, the error handler detects it.

2. **Field Name Conversion**: API field names (PascalCase like `Email`, `InitialPassword`) are converted to camelCase (`email`, `initialPassword`) to match React Hook Form field names.

3. **Error Mapping**: Each validation error is mapped to the corresponding form field using `setError()`.

4. **Multiple Errors**: If a field has multiple validation errors, they are joined with `. ` (period and space).

5. **Toast Notification**:
   - With `showToast: true` (default): Shows a toast with all validation errors
   - With `showToast: false`: Only displays errors inline under form fields

## Features

✅ **Automatic field name conversion** (PascalCase → camelCase)
✅ **Multiple error messages per field** (combined with `. `)
✅ **Inline error display** (using `<FormMessage />`)
✅ **Optional toast notifications** (configurable)
✅ **Type-safe** (TypeScript support)
✅ **Compatible with React Hook Form** (uses native `setError` API)

## API Reference

### `createFormMutationErrorHandler<T>(setError, options)`

Creates an error handler that automatically maps validation errors to form fields.

**Parameters:**
- `setError`: React Hook Form's `setError` function
- `options`:
  - `showToast?: boolean` - Show toast notification (default: `true`)
  - `toastMessage?: string` - Custom toast message
  - `onError?: (error) => void` - Additional error handler

**Returns:** Error handler function for use in mutation `onError`

### `mapValidationErrorsToForm<T>(error, setError)`

Manually map validation errors to form fields.

**Parameters:**
- `error`: The error object from the API
- `setError`: React Hook Form's `setError` function

**Returns:** `boolean` - `true` if validation errors were mapped, `false` otherwise

## Best Practices

1. **Use `showToast: false` for better UX**: Inline errors are usually sufficient for form validation.

2. **Keep field names consistent**: Ensure your form field names match the API field names (in camelCase).

3. **Handle non-validation errors**: Always check if validation errors were mapped, and handle other errors appropriately.

4. **Combine with client-side validation**: Use Zod schemas for client-side validation to catch errors before API calls.

Example:
```tsx
const form = useForm({
  resolver: zodResolver(zCreateUserRequest), // Client-side validation
})

const mutation = useMutation({
  mutationFn: apiCall,
  onError: createFormMutationErrorHandler(form.setError), // Server-side validation
})
```
