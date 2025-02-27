/* eslint-disable */
// import { useLazyQuery } from "@apollo/client";
// import List from "@gm-common/listbox";
import ListBox from "../ListBox";
// import { GET_AI_FACEBOOK_AD } from "@gm-graphql/queries/ai";
// import { styles } from "@gm-styles/styles";
import { styles } from "../styles/styles";
import { Spinner } from "@material-tailwind/react";
import { useEffect, useState } from "react";

// import { CASSIE_AI_TEXT } from "../../../config/constants";
import { CASSIE_AI_TEXT } from "../ListBox";

const previousCommands = {
  primaryMessage: "",
  headline: "",
  description: "",
};

const AI_STATES = {
  CREATION: "creation",
  CONFIRM: "confirm",
};

const AiAssistant = (props) => {
  const [businessName, setBusinessName] = useState("");
  const [adAbout, setAdAbout] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("");
  const [framework, setFramework] = useState("");
  const [aiState, setAiState] = useState(AI_STATES.CREATION);
  const [primaryMessage, setPrimaryMessage] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");

  // const [regeneratingPrimaryMessage, setRegeneratingPrimaryMessage] = useState(false);
  // const [regeneratingHeadline, setRegeneratingHeadline] = useState(false);
  // const [regeneratingDescription, setRegeneratingDescription] = useState(false);
  const [generatingText, setGeneratingText] = useState(false);
  const [getAiFacebookAd, { data: cassieAiResponse }] = useLazyQuery(GET_AI_FACEBOOK_AD);

  useEffect(() => {
    if (cassieAiResponse) {
      setPrimaryMessage(cassieAiResponse.aiFacebookAd.primaryMessage);
      setHeadline(cassieAiResponse.aiFacebookAd.headline);
      setDescription(cassieAiResponse.aiFacebookAd.description);
    }
  }, [cassieAiResponse, getAiFacebookAd]);

  const tonesOfVoice = [
    CASSIE_AI_TEXT, // Keep it as the first option
    "Conversational",
    "Inspirational",
    "Educational",
    "Persuasive",
    "Authoritative",
    "Energetic",
  ];

  const frameworks = [
    CASSIE_AI_TEXT, // Keep it as the first option
    "AIDA - Attention, Interest, Desire, Action",
    "PAS - Problem, Agitate, Solution",
    "FAB - Features, Advantages, Benefits",
  ];

  const setValue = (value, field) => {
    switch (field) {
      case "businessName":
        setBusinessName(value);
        break;
      case "adAbout":
        setAdAbout(value);
        break;
      case "toneOfVoice":
        setToneOfVoice(value);
        break;
      case "framework":
        setFramework(value);
        break;
      default:
        break;
    }
  };

  const clearFields = () => {
    setBusinessName("");
    setAdAbout("");
    setToneOfVoice("");
    setFramework("");
  };

  const onSave = () => {
    props._setValues({ primaryMessage, headline, description });
    props._close();
  };

  const generateAiText = async ({ businessName, adAbout, toneOfVoice, framework }) => {
    setGeneratingText(true);

    await getAiFacebookAd({
      variables: {
        businessName,
        adAbout,
        toneOfVoice: toneOfVoice == tonesOfVoice[0] ? "whatever is best for this content" : toneOfVoice,
        framework: framework == frameworks[0] ? "whatever advertising framework is best for this content" : framework,
      },
    });
    setGeneratingText(false);
    setAiState(AI_STATES.CONFIRM);
  };

  // const regenerateText = async (inputValue, field) => {
  //   let value;
  //   switch (field) {
  //     case "primaryMessage":
  //       setRegeneratingPrimaryMessage(true);
  //       value = await getAiFacebookAd(inputValue);
  //       if (value !== null) {
  //         setPrimaryMessage(value);
  //       }
  //       setRegeneratingPrimaryMessage(false);
  //       break;
  //     case "headline":
  //       setRegeneratingHeadline(true);
  //       value = await getAiFacebookAd(inputValue);
  //       if (value !== null) {
  //         setHeadline(value);
  //       }
  //       setRegeneratingHeadline(false);
  //       break;
  //     case "description":
  //       setRegeneratingDescription(true);
  //       value = await getAiFacebookAd(inputValue);
  //       if (value !== null) {
  //         setDescription(value);
  //       }
  //       setRegeneratingDescription(false);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  return (
    <div>
      {aiState === AI_STATES.CREATION && (
        <div>
          <div>
            <label className={`${styles.inputLabel} font-bold text-gray-700`}>Business name</label>
            <input
              className={`${styles.inputBox} border-[#A239FF]`}
              onChange={(e) => setValue(e.target.value, "businessName")}
              value={businessName}
            ></input>
          </div>
          <div className="mt-5">
            <label className={`${styles.inputLabel} font-bold text-gray-600`}>What is your ad about?</label>
            <input
              className={`${styles.inputBox} border-[#A239FF]`}
              onChange={(e) => setValue(e.target.value, "adAbout")}
              value={adAbout}
            ></input>
          </div>
          <div className="mt-5">
            <label className={`${styles.inputLabel} font-bold text-gray-700`}>Tone of voice</label>
            <ListBox items={tonesOfVoice} selected={toneOfVoice} onSelect={setToneOfVoice} />
          </div>
          <div className="mt-5">
            <label className={`${styles.inputLabel} font-bold text-gray-700`}>Framework</label>
            <ListBox items={frameworks} selected={framework} onSelect={setFramework} />
          </div>
          <div className="flex justify-between py-3">
            <div className="flex items-center gap-x-3">
              <div
                className="flex cursor-pointer items-center gap-x-1"
                onClick={() => {
                  clearFields();
                }}
              >
                <span className="material-symbols-outlined text-xl font-semibold text-gray-800">delete</span>
                <p className="font-bold text-gray-800">Clear Fields</p>
              </div>
              {generatingText && <Spinner width={16} />}
            </div>
            <div className="flex gap-x-2">
              <button
                onClick={() => props._close()}
                className="flex items-center rounded-full border border-solid border-primary-700 px-3 py-1 text-xs font-bold text-gm-purple"
              >
                <span className="material-symbols-outlined text-base text-primary-700">close</span>
                <p className="text-md font-bold text-primary-700">Cancel</p>
              </button>
              <button
                onClick={async () => await generateAiText({ businessName, adAbout, toneOfVoice, framework })}
                className="flex w-fit items-center gap-x-2 rounded-full bg-gm-bg-purple px-5 py-2 font-bold text-white"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
      {aiState === AI_STATES.CONFIRM && (
        <div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white" htmlFor="message">
              Primary message
            </label>
            <textarea
              className="block w-full border border-solid border-primary-700 bg-gray-100 p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600 "
              id="message"
              placeholder="Write your thoughts here..."
              rows={Math.max(2, primaryMessage?.split("\n").length) + 5}
              value={primaryMessage}
              onChange={(e) => setPrimaryMessage(e.target.value)}
            ></textarea>
            {/* {!regeneratingPrimaryMessage && (
              <span
                onClick={() => regenerateText(previousCommands.primaryMessage, "primaryMessage")}
                className="material-symbols-outlined cursor-pointer text-base font-semibold text-gray-400"
              >
                refresh
              </span>
            )}
            {regeneratingPrimaryMessage && <Spinner width={15} />} */}

            <label className="mb-2 mt-3 block text-sm font-medium text-gray-900 dark:text-white" htmlFor="message">
              Headline
            </label>
            <input
              className="block w-full border border-solid border-primary-700 bg-gray-100 p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600"
              id="message"
              placeholder="Write your thoughts here..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            ></input>
            {/* {!regeneratingHeadline && (
              <span
                onClick={() => regenerateText(previousCommands.headline, "headline")}
                className="material-symbols-outlined cursor-pointer text-base font-semibold text-gray-400"
              >
                refresh
              </span>
            )}
            {regeneratingHeadline && <Spinner width={15} />} */}

            <label className="mb-2 mt-3 block text-sm font-medium text-gray-900 dark:text-white" htmlFor="message">
              Description
            </label>
            <input
              className="block w-full border border-solid border-primary-700 bg-gray-100 p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600 "
              id="message"
              placeholder="Write your thoughts here..."
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></input>
            {/* {!regeneratingDescription && (
              <span
                onClick={() => regenerateText(previousCommands.description, "description")}
                className="material-symbols-outlined cursor-pointer text-base font-semibold text-gray-400"
              >
                refresh
              </span>
            )}
            {regeneratingDescription && <Spinner width={15} />} */}
          </div>
          <div className="flex justify-end py-5">
            <div className="flex gap-x-2">
              <button
                onClick={() => props._close()}
                className="flex items-center rounded-full border border-solid border-primary-700 px-3 py-1 text-xs font-bold text-gm-purple"
              >
                <span className="material-symbols-outlined text-base text-primary-700">close</span>
                <p className="text-md font-bold text-primary-700">Cancel</p>
              </button>
              <button
                onClick={() => onSave()}
                className="flex w-fit items-center gap-x-2 rounded-full bg-gm-bg-purple px-5 py-2 font-bold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
