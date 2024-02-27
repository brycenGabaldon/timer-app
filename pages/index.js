import Cards from "@/components/Cards";
import React, { useState } from "react";

const Index = () => {
  // Use an object to track the active card and its timer value
  const [activeTimer, setActiveTimer] = useState({
    activeId: null,
    startTime: null,
  });

  return (
    <div className="place-items-center  place-content-center flex  gap-[100px] w-screen min-h-screen bg-gray-900">
      <Cards activeTimer={activeTimer} setActiveTimer={setActiveTimer} />
    </div>
  );
};

export default Index;
