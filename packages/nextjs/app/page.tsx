"use client";

import { useState } from "react";
import { First } from "~~/components/First";
import { Header } from "~~/components/Header";
import { Notice } from "~~/components/Notice";

const Home = () => {
  const [tab, setTab] = useState("home");

  return (
    <>
      <Header setTab={setTab} tab={tab} />
      <main>{tab === "home" ? <First /> : <Notice />}</main>
    </>
  );
};

export default Home;
