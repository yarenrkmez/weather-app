import React from "react";
import { Outlet } from "react-router-dom";
import Header from "components/molecules/Header/Header";

import styles from "./Layout.module.scss";

const Layout: React.FC = () => {
  return (
    <div className={styles["page-container"]}>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
