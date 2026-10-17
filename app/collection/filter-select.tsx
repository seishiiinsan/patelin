"use client";

// A filter that applies as soon as it changes. Without JavaScript, the form's button does it.
export function FilterSelect(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    />
  );
}
