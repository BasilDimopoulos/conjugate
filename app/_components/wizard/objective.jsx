import { useEffect, useState } from "react";

import AdSetting from "../../ads/ad-setting";
import { conversionGoals, objectives } from "./constants";

const CampaignObjectiveStep = (props) => {
  const [selectedObjective, setSelectedObjective] = useState("");
  const previousDestination = props?.campaign?.destination || {};

  const setObjective = async (objectiveId) => {
    const objective = objectives.find((obj) => obj.id === objectiveId);
    const newDestination = {
      leadType: "",
    };

    if (objectiveId === "traffic") {
      newDestination.leadType = "website";
    } else if (objectiveId === "reach") {
      newDestination.leadType = "reach";
    } else if (objectiveId === "sales") {
      newDestination.leadType = "website";
    } else if (objectiveId === "leads_website") {
      newDestination.leadType = "website";
    } else if (objectiveId === "leads_form") {
      newDestination.leadType = "form";
    } else if (objectiveId === "leads_phone") {
      newDestination.leadType = "phone";
    }
    props.updateCampaign({
      objective: {
        key: objective.key,
        id: objective.id,
      },
      destination: {
        leadType: newDestination.leadType,
        leadValue: previousDestination.leadType === newDestination.leadType ? previousDestination.leadValue : "",
      },
    });
    setSelectedObjective(objectiveId);
  };

  return (
    <div className="grid grid-cols-1 gap-2 2xl:grid-cols-2">
      {objectives.map((objective, index) => (
        <div key={index} onClick={() => setObjective(objective.id)} className="w-full">
          <AdSetting
            icon={objective.icon}
            label={objective.label}
            description={objective.description}
            selected={props?.campaign?.objective?.id === objective.id}
          />
        </div>
      ))}
    </div>
  );
};

export default CampaignObjectiveStep;
