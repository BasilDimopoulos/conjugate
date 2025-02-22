// import CustomIcon from "@gm-common/custom-icon";
import DatePicker from "@gm-common/datepicker";
import ListBox from "@gm-common/listbox";
// import campaignService from "@gm-lib/campaign";
// import { Disclosure } from "@headlessui/react";
// import { Slider } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { styles } from "../../../styles/styles";

// import BudgetAllocator from "./budget-allocator";

const BudgetStep = (props) => {
  const budget = props.campaign?.budget;
  const [optimiseAllocation, setOptimiseAllocation] = useState(true);
  const [budgetHasEnd, setBudgetHasEnd] = useState(budget?.strategy === "SetSchedule");
  const allocationMethods = budget?.strategy === "SetSchedule" ? ["Per Day", "Lifetime"] : ["Per Day"];
  const [budgetAllocationMethod, setBudgetAllocationMethod] = useState(
    budget?.allocationMethod || allocationMethods[0]
  );
  const [totalBudget, setTotalBudget] = useState(budget?.amount || "");

  const [budgetInput] = useDebounce(totalBudget, 500);
  const [budgetSchedule, setBudgetSchedule] = useState(budget?.schedule || { startDate: null, endDate: null });
  const [ads, selectedAds] = useState(props?.campaign?.ads || []);

  useEffect(() => {
    if (totalBudget !== budget?.amount) {
      props.updateCampaign({
        budget: {
          ...budget,
          amount: totalBudget,
        },
      });
    }
  }, [budgetInput]);

  const selectAllocation = (allocation) => {
    props.updateCampaign({
      budget: {
        ...budget,
        allocationMethod: allocation,
      },
    });
    setBudgetAllocationMethod(allocation);
  };

  const selectedDateRange = (newDateRange) => {
    props.updateCampaign({
      budget: {
        ...budget,
        schedule: newDateRange,
      },
    });
  };

  const resetSchedule = async () => {
    const newSchedule = { startDate: null, endDate: null };
    setBudgetSchedule(newSchedule);
    props.updateCampaign({
      budget: {
        ...budget,
        schedule: newSchedule,
        strategy: "SetSchedule",
      },
    });
    setBudgetHasEnd(true);
  };

  const setNoEndDate = async () => {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const newSchedule = null;
    setBudgetHasEnd(false);
    setBudgetAllocationMethod("Per Day");
    props.updateCampaign({
      budget: {
        ...budget,
        schedule: newSchedule,
        strategy: "NoEndDate",
        allocationMethod: "Per Day",
      },
    });
  };

  const updateBudgetTotal = (e) => {
    setTotalBudget(e.target.value);
  };

  return (
    <>
      <p className="mb-5 text-sm font-light">
        Set a schedule and decide how to use your budget during your campaign. You can decide between set dates with a
        periodic budget, or a campaign that continues until your total set budget is used.
      </p>
      <button
        className={`rounded-l-full border border-solid border-purple-900 px-3 py-1 text-xs font-bold ${
          !budgetHasEnd ? "bg-purple-800 text-white" : "text-purple-1000"
        }`}
        onClick={setNoEndDate}
      >
        Start now with no end date
      </button>
      <button
        className={`rounded-r-full border border-solid border-purple-900 px-3 py-1 text-xs font-bold ${
          budgetHasEnd ? "bg-purple-800 text-white" : "text-purple-1000"
        }`}
        onClick={resetSchedule}
      >
        Set schedule
      </button>

      <div className={`${!budgetHasEnd ? "hidden" : ""}`}>
        <DatePicker onSelect={selectedDateRange} selected={budgetSchedule} />
      </div>
      <p className="mt-5 text-xs font-bold">Set your budget strategy</p>
      <div className="flex gap-x-10">
        <div className="w-1/2">
          <label className="mb-2 mt-5 block text-sm font-medium text-gray-900 dark:text-white" htmlFor="message">
            Total budget
          </label>
          <input
            className={`${styles.inputBox} border-gray-500 text-right`}
            onChange={updateBudgetTotal}
            placeholder="Set your budget here"
            value={totalBudget}
          ></input>
        </div>
        <div className="w-1/2">
          <label className="mb-2 mt-5 block text-sm font-medium text-gray-900 dark:text-white" htmlFor="message">
            Budget allocation method
          </label>
          <ListBox items={allocationMethods} onSelect={selectAllocation} selected={budgetAllocationMethod} />
        </div>
      </div>

      {/* <div className="z-1 pt-5">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full">
                <div className="relative flex w-full items-center">
                  <h4 className="py-3 font-semibold text-gray-600">
                    Your budget is optmised automatically. Set advanced settings per platform
                  </h4>
                  <span
                    className={`material-symbols-outlined absolute right-0 cursor-default text-base text-gray-800 ${
                      open ? "rotate-90" : ""
                    }`}
                  >
                    keyboard_arrow_right
                  </span>
                </div>
              </Disclosure.Button>
              <Disclosure.Panel>
                {({ active }) => (
                  <div>
                    <button
                      className={`mt-1 rounded-l-full border border-solid border-purple-800  px-3 py-1 text-xs font-bold ${
                        optimiseAllocation ? "bg-purple-800 text-white" : "text-purple-900"
                      }`}
                      onClick={() => setOptimiseAllocation(true)}
                    >
                      Optimise allocation
                    </button>
                    <button
                      className="rounded-r-full border border-solid border-purple-800 px-3 py-1 text-xs font-bold text-purple-900"
                      onClick={() => setOptimiseAllocation(false)}
                    >
                      Set per platform manually
                    </button>
                    <div className={`${optimiseAllocation ? "hidden" : "else"}`}>
                      {parsedAds.map((ad, index) => (
                        <BudgetAllocator ad={ad} key={index} title={selectedAdPages[0].name} />
                      ))}
                    </div>
                  </div>
                )}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div> */}
    </>
  );
};

export default BudgetStep;
