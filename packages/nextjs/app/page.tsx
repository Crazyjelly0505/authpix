"use client"

import { useState } from "react";
import { Welcome } from "~~/components/Welcome";
import { Model } from "~~/components/Model";
import { User } from "~~/components/User";

const Home = () => {
  const [identity, setIdentity] = useState<string>("");

  return (
    <main>
      {identity === "" && <Welcome setIdentity={setIdentity} />}

      {identity === "model" && (
        <div>
          <button
            className="fixed top-20 left-4 z-40 btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
            onClick={() => setIdentity("")}
          >
            ← Return
          </button>
          <Model />
        </div>
      )}

      {identity === "user" && (
        <div>
          <button
            className="fixed top-20 left-4 z-40 btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
            onClick={() => setIdentity("")}
          >
            ← Return
          </button>
          <User />
        </div>
      )}
    </main>
  );
}

export default Home;
