import type { ReactNode } from "react";
import { useBookingAccess } from "@/hooks/use-booking-access";

export function BookAppointmentLink({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const withBookingAccess = useBookingAccess();

  return (
    <a
      href="#book"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        void withBookingAccess(() => {
          window.history.replaceState(null, "", "#book");
          document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
        });
      }}
    >
      {children}
    </a>
  );
}