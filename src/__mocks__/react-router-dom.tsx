import React from "react";

export const MemoryRouter = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="mock-memory-router">{children}</div>
);

export const Outlet = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);

export const Link = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => <a href={to}>{children}</a>;

export const useNavigate = jest.fn(() => jest.fn());
export const useLocation = () => ({ pathname: "/" });
export const useParams = () => ({});
export const useRoutes = (routes: any) => routes?.[0]?.element ?? null;

export const BrowserRouter = MemoryRouter;
