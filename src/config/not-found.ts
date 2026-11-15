export const notFoundConfig = {
  title: "Page not found",
  code: "404",
  label: "Route not found",
  heading: "Took a wrong turn.",
  description:
    "This road doesn't lead to a page. Head back home, or take the scenic route through the design gallery.",
  carLabel: "You",
  home: { label: "Back to home", href: "/" },
  components: { label: "Browse designs", href: "/design" },
} as const;
