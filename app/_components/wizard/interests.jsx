import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_AI_FACEBOOK_INTERESTS } from "@gm-graphql/queries/ai";
import { GET_INTERESTS } from "@gm-graphql/queries/campaign";
import campaignService, { getSelectedFacebookAdAccount } from "@gm-lib/campaign";
import { Spinner } from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

import { styles } from "../../../styles/styles";

const InterestsStep = (props) => {
  const adDetails = props?.campaign?.ads[0] || {};
  const [interestKeywords, setInterestKeywords] = useState(props.campaign?.interests || []);
  const targetDivRef = useRef(null);
  const handleClickOutside = (event) => {
    if (targetDivRef.current && !targetDivRef.current.contains(event?.target)) {
      setDisplayInterestSearch(false);
    }
  };
  const [interestsToDisplay, setInterestsToDisplay] = useState([]);
  const [aiInterests, setAiInterests] = useState([]);
  const [displayInterestSearch, setDisplayInterestSearch] = useState(false);
  const [adAccountId, setAdAccountId] = useState(getSelectedFacebookAdAccount(props.campaign)?.id || "");
  const [interestKeywordsInput, updateInterestKeywordsInput] = useState("");
  const [interestKeywordsInputHandler] = useDebounce(interestKeywordsInput, 500);
  const { data: aiInterestsData, loading: loadingAiInterests } = useQuery(GET_AI_FACEBOOK_INTERESTS, {
    variables: {
      primaryMessage: adDetails?.primaryMessage || "",
      headline: adDetails?.headline || "",
      description: adDetails?.description || "",
      adAccountId,
    },
    fetchPolicy: "cache-first",
    skip: !adDetails?.primaryMessage || !adDetails?.headline || !adDetails?.description,
  });

  useEffect(() => {
    if (interestKeywordsInputHandler) {
      searchForInterests(interestKeywordsInputHandler);
    }
  }, [interestKeywordsInputHandler]);

  useEffect(() => {
    if (aiInterestsData?.aiFacebookInterest) {
      setAiInterests(aiInterestsData.aiFacebookInterest);
    }
  }, [loadingAiInterests]);

  useEffect(() => {
    const existingIds = new Set(interestKeywords?.map((item) => item?.id));
    const aiInterstsToDisplay = aiInterestsData?.aiFacebookInterest?.filter(
      (aiInterest) => !existingIds.has(aiInterest?.id)
    );
    setAiInterests(aiInterstsToDisplay);
  }, [aiInterestsData, interestKeywords]);

  useEffect(() => {
    if (interestKeywordsInput?.length > 1 && interestKeywordsInput !== ` `) {
      setDisplayInterestSearch(true);
    } else {
      setDisplayInterestSearch(false);
    }
  }, [interestKeywordsInput]);

  useEffect(() => {
    // Attach the event listener when the component mounts
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const [getInterests, { loading: loadingInterest, error, data: interestData }] = useLazyQuery(GET_INTERESTS);

  const searchForInterests = async (input) => {
    try {
      const { data } = await getInterests({
        variables: {
          adAccountId,
          input,
        },
      });
      const filteredInterests = data?.interests?.filter((interest) => !interestKeywords.includes(interest));
      setInterestsToDisplay(filteredInterests);
    } catch (error) {
      console.error("Error fetching interests:", error);
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key !== "Enter") {
      return;
    }
    addNewInterest(interestKeywordsInput);
    updateInterestKeywordsInput("");
  };

  const handleInterestChange = (event) => {
    updateInterestKeywordsInput(event.target.value);
  };

  const addNewInterest = async (interest, type) => {
    const newInterests = [
      ...interestKeywords,
      {
        id: interest.id,
        name: interest.name,
        platform: interest?.platform ? interest.platform : "facebook",
      },
    ];
    props.updateCampaign({
      interests: newInterests,
    });
    setInterestKeywords([...interestKeywords, interest]);
    if (type === "aiInterest") {
      setAiInterests(aiInterests?.filter((aiInterest) => aiInterest?.id !== interest?.id));
    }
    updateInterestKeywordsInput("");
    setInterestsToDisplay([]);
  };

  const deleteInterest = async (index) => {
    const newInterests = campaignService.filterOutElementsByIndex(interestKeywords, index);
    props.updateCampaign({
      interests: newInterests,
    });
    setInterestKeywords(newInterests);
  };
  return (
    <>
      <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
        Refine your target by adding interest keywords
      </label>
      <input
        className={`${styles.inputBox}`}
        placeholder="e.g: Yoga, Organic Food, Digital Marketing"
        onChange={(e) => handleInterestChange(e, "include")}
        value={interestKeywordsInput}
      ></input>
      <div
        ref={targetDivRef}
        className={displayInterestSearch ? "absolute z-50 mb-3 max-h-40 overflow-auto shadow-md" : "hidden"}
      >
        {interestsToDisplay?.map((interest, index) => (
          <div
            key={index}
            className="flex cursor-pointer items-center gap-x-1 bg-white p-2 text-white hover:bg-gray-200"
            onClick={() => addNewInterest(interest, "include")}
          >
            <span className="material-symbols-outlined text-base text-gray-900">location_on</span>
            <p className="text-sm font-semibold text-gray-700">{interest?.name}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1 pt-2">
        {interestKeywords.map((interest, index) => {
          return (
            <div className="flex items-center gap-x-1 rounded-full bg-gray-700 px-2 text-white" key={index}>
              <p className="text-xs font-bold">{interest?.name}</p>
              <span
                className="material-symbols-outlined white cursor-pointer text-base"
                onClick={() => deleteInterest(index, "include")}
              >
                close
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3">
        <p className="mb-1 text-sm">Recommendations by CassieAi</p>
        {loadingAiInterests && <Spinner color="purple" />}
        <div className="flex flex-wrap items-center gap-1 pt-2">
          {aiInterests?.map((interest, index) => {
            return (
              <div className="flex items-center gap-x-1 rounded-full bg-gm-bg-purple px-2 text-white" key={index}>
                <p className="text-xs font-bold">{interest?.name}</p>
                <span
                  className="material-symbols-outlined white cursor-pointer text-base"
                  onClick={() => addNewInterest(interest, "aiInterest")}
                >
                  add
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default InterestsStep;
