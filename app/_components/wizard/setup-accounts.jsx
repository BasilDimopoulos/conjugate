import { useMutation, useReactiveVar } from "@apollo/client";
import { PLATFORM_CHILD_TARGETS_BY_PLATFORM } from "@gm-graphql/localStates/platform";
import campaignService from "@gm-lib/campaign";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { styles } from "../../../styles/styles";
import WizardSelect from "./wizard-select";

const SetupAccountsStep = (props) => {
  const targets = useReactiveVar(PLATFORM_CHILD_TARGETS_BY_PLATFORM);
  const [campaignName, setCampaignName] = useState(props?.campaign?.campaignName || "");
  const [adAccounts, updateAdAccounts] = useState(
    campaignService.getListByEnabled(targets, "facebook", "adAccount") || []
  );
  const [selectedAdAccount, setSelectedAdAccounts] = useState(props?.campaign?.adAccounts || []);
  const [adPages, updateAdPages] = useState(campaignService.getListByEnabled(targets, "facebook", "page") || []);
  const [selectedAdPages, setSelectedAdPages] = useState(props?.campaign?.adPages || []);

  const [serverName] = useDebounce(campaignName, 500);

  const handleNameChange = (newValue) => {
    setCampaignName(newValue);
  };
  const setName = async (campaignName) => {
    await props.updateCampaign({ campaignName });
  };

  useEffect(() => {
    if (campaignName !== props?.campaign?.campaignName) {
      setName(campaignName);
    }
  }, [serverName]);

  useEffect(() => {
    if (adAccounts?.length > 0) {
      if (selectedAdAccount?.length === 0) {
        props.updateCampaign({
          adAccounts: [adAccounts[0]],
        });
        setSelectedAdAccounts([adAccounts[0]]);
      }
    }
    if (adPages?.length > 0) {
      if (selectedAdPages?.length === 0) {
        props.updateCampaign({
          adPages: [adPages[0]],
        });
        setSelectedAdPages([adPages[0]]);
      }
    }
  }, [adAccounts, adPages]);
  return (
    <>
      <h4 className="font-semibold text-gray-700"> Campaign Name</h4>
      <div className="relative flex items-center gap-x-1 pt-1">
        <input
          className={`${styles.inputBox}`}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Add a name to your campaign"
          type="text"
          value={campaignName}
        ></input>
        {/* <div className="group flex items-center">
          <span className=" material-symbols-outlined absolute right-3 cursor-default text-base text-gray-800">
            info
          </span>
          <div className="absolute right-0 mb-20 mr-4 hidden w-60 rounded-md bg-gray-800 p-2 leading-4 text-white group-hover:block">
            <p>If you skip, your campaign name will be auto-generated based on ad settings.</p>
          </div>
        </div> */}
      </div>
      <p className="pt-3">
        Your Facebook Page and Ad Account will be automatically connected. If you have an Instagram connected to
        GrowMetrics, this will also automatically be displayed on Instagram.
      </p>
      <div className="relative">
        <WizardSelect
          campaignField="adAccounts"
          items={adAccounts}
          label="Select Your Ad Account"
          selectedItems={selectedAdAccount}
          updateCampaign={props.updateCampaign}
          disableDeletion
        />
      </div>

      <div className="relative">
        <WizardSelect
          campaignField="adPages"
          items={adPages}
          label="Select Your Social Media Page"
          selectedItems={selectedAdPages}
          updateCampaign={props.updateCampaign}
          disableDeletion
        />
      </div>
    </>
  );
};

export default SetupAccountsStep;
