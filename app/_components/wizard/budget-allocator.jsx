import CustomIcon from "@gm-common/custom-icon";
import { Slider } from "@material-tailwind/react";
import { useState } from "react";

const BudgetAllocator = (props) => {
  const [sliderValue, setSliderValue] = useState("100");
  const [locked, setLocked] = useState(false);

  return (
    <div className="mt-5 pr-5">
      <h3 className="text-xs font-medium uppercase text-gray-900">{props.ad.headline}</h3>
      <div className="flex items-center gap-x-1">
        <CustomIcon color="gray" key="facebook" name="facebook" shade="900" size="16px" />
        <p className="text-gray-900">{props.title}</p>
      </div>
      <div className="mt-2 flex items-center gap-x-3">
        <input
          className="h-8 w-14 border border-solid border-gray-400 px-3"
          onChange={(e) => setSliderValue(Math.round(e.target.value))}
          value={sliderValue}
        ></input>
        <span className="material-symbols-outlined text-xl text-gray-900">lock</span>
        <Slider
          color="green"
          onChange={(e) => setSliderValue(Math.round(e.target.value))}
          size="sm"
          thumbClassName="border-white"
          value={sliderValue}
        />
      </div>
    </div>
  );
};

export default BudgetAllocator;
