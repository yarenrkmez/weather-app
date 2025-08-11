import React from "react";
import Layout from "components/layout/Layout";
import CityDetails from "pages/cityDetails/CityDetails";
import Dashboard from "pages/dashboard/Dashboard";
import { useRoutes } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/city-details/:cityName", element: <CityDetails /> },
    ],
  },
];

const AppRoutes = () => {
  return useRoutes(routes);
};

export default AppRoutes;
