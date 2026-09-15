'use client'
import React from "react";
import { Container } from "reactstrap";
import Header from "./layouts/header/Header";
import Sidebar from "./layouts/sidebars/vertical/Sidebar";

const FullLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const showMobilemenu = () => {
    setOpen(!open);
  };

  if (!mounted) {
    return null;
  }

  return (
    <main>
      <div className="pageWrapper d-md-block d-lg-flex">
        {/******** Sidebar **********/}
        <aside
          className={`sidebarArea shadow ${!open ? "" : "showSidebar"
            }`}
          style={{ backgroundColor: "#4e73df" }}
        >
          <Sidebar showMobilemenu={() => showMobilemenu()} />
        </aside>
        {/********Content Area**********/}

        <div className="contentArea">
          {/********header**********/}
          <Header showMobmenu={() => showMobilemenu()} />

          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            <div>{children}</div>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
