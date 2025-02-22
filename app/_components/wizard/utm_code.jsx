import { styles } from "@gm-styles/styles";
import { Disclosure } from "@headlessui/react";
import { useEffect, useState } from "react";

const customParamterIsValid = (customParamater) => {
  if (customParamater.name !== "" && customParamater.value !== "") {
    return true;
  } else {
    return false;
  }
};

const createURMCode = (url, source, medium, campaign, content, customParamaters) => {
  const urlParams = new URLSearchParams();
  urlParams.append("utm_source", source);
  urlParams.append("utm_medium", medium);
  urlParams.append("utm_campaign", campaign);
  urlParams.append("utm_content", content);
  for (let i = 0; i < customParamaters.length; i++) {
    if (customParamterIsValid(customParamaters[i])) {
      urlParams.append(customParamaters[i].name, customParamaters[i].value);
    }
  }
  const urmUrl = url + "?" + urlParams.toString();

  return urmUrl;
};

const UTMCodeForm = (props) => {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [customParamaters, setCustomParameters] = useState([{ name: "", value: "" }]);
  const [URMCode, setURMCode] = useState("");
  const [activeDiv, setActiveDiv] = useState("");

  const handleInputChange = (index, inputValue, type) => {
    const newArray = [...customParamaters];
    newArray[index] = { ...newArray[index], [type]: inputValue };
    setCustomParameters(newArray);
  };

  const setUTM = () => {
    const utmCode = createURMCode(url, source, medium, campaign, content, customParamaters);
    props._setUTM(utmCode);
    props._onClose();
  };

  useEffect(() => {
    if (url !== "") {
      setURMCode(createURMCode(url, source, medium, campaign, content, customParamaters));
    } else {
      setURMCode("URL Preview will appear here");
    }
  }, [url, source, medium, campaign, content, customParamaters]);

  return (
    <div className="">
      <div className="fixed  inset-x-0 top-10 z-20 m-auto max-h-[800px] w-[500px] overflow-auto bg-white px-6 pb-10 pt-8 shadow-md">
        <div className="flex items-center justify-between gap-x-2">
          <h2 className="text-lg font-semibold text-gray-900">Generate UTM Code</h2>
          <button>
            <span
              className="material-symbols-outlined cursor-pointer text-[22px] text-gray-800"
              onClick={props._onClose}
            >
              close
            </span>
          </button>
        </div>
        <div className="mt-5">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
            Website URL
          </label>
          <input
            className={`${styles.inputBox} mt-1`}
            onBlur={() => setActiveDiv("")}
            onChange={(url) => setUrl(url.target.value)}
            onFocus={() => setActiveDiv("url")}
            placeholder="Enter the website URL that you want to promote"
            value={url}
          ></input>
        </div>
        <p className="mt-4 text-xs text-gray-900">
          A UTM code is a short piece of text added to a web link to track where visitors come from. Helping businesses
          understand which marketing efforts are working. Simply fill out the boxes below to build your own UTM code.
        </p>
        <button className="mt-1 text-xs text-blue-800">Learn More</button>
        <div className="mt-2">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
            Campaign source
          </label>
          <input
            className={`${styles.inputBox} mt-1`}
            onBlur={() => setActiveDiv("")}
            onChange={(source) => setSource(source.target.value)}
            onFocus={() => setActiveDiv("source")}
            placeholder="Select a dynamic parameter or enter a value"
            value={source}
          ></input>
        </div>
        <div className={`mt-1 flex gap-x-1 ${activeDiv === "source" ? "block" : "hidden"}`}>
          <span className="material-symbols-outlined text-xs text-primary-700">info</span>
          <p className="text-xs text-primary-700">
            Identify the source of traffic, eg. Facebook, Instagram or a search engine
          </p>
        </div>

        <div className="mt-3">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
            Campaign medium
          </label>
          <input
            className={`${styles.inputBox} mt-1`}
            onBlur={() => setActiveDiv("")}
            onChange={(medium) => setMedium(medium.target.value)}
            onFocus={() => setActiveDiv("medium")}
            placeholder="Select a dynamic parameter or enter a value"
            value={medium}
          ></input>
        </div>
        <div className={`mt-1 flex gap-x-1 ${activeDiv === "medium" ? "block" : "hidden"}`}>
          <span className="material-symbols-outlined text-xs text-primary-700">info</span>
          <p className="text-xs text-primary-700">
            Identify the advertising medium, eg. “banner”, “email”, “Facebook_Feed” or “Instagram_Story”
          </p>
        </div>

        <div className="mt-3">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
            Campaign name
          </label>
          <input
            className={`${styles.inputBox} mt-1`}
            onBlur={() => setActiveDiv("")}
            onChange={(campaign) => setCampaign(campaign.target.value)}
            onFocus={() => setActiveDiv("name")}
            placeholder="Select a dynamic parameter or enter a value"
            value={campaign}
          ></input>
        </div>
        <div className={`mt-1 flex gap-x-1 ${activeDiv === "name" ? "block" : "hidden"}`}>
          <span className="material-symbols-outlined text-xs text-primary-700">info</span>
          <p className="text-xs text-primary-700">
            Identify a specific promotion or strategic campaign, eg. “summer_sale”
          </p>
        </div>

        <div className="mt-3">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
            Campaign content
          </label>
          <input
            className={`${styles.inputBox} mt-1`}
            onBlur={() => setActiveDiv("")}
            onChange={(content) => setContent(content.target.value)}
            onFocus={() => setActiveDiv("content")}
            placeholder="Select a dynamic parameter or enter a value"
            value={content}
          ></input>
        </div>
        <div className={`mt-1 flex gap-x-1 ${activeDiv === "content" ? "block" : "hidden"}`}>
          <span className="material-symbols-outlined text-xs text-primary-700">info</span>
          <p className="text-xs text-primary-700">
            Differentiate ads or links that point to the same URL, eg. “white_logo”, “black_logo”
          </p>
        </div>

        <hr className="mt-3 w-full"></hr>

        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full items-center justify-between border-l border-solid border-purple-200 pl-4">
                <div className="flex items-center gap-x-3">
                  <p className="text-3xl font-light text-purple-700">+</p>
                  <p className="pt-1 font-bold text-gray-900">Add Custom UTM Parameter</p>
                </div>
                <span className={`${open ? "-rotate-180" : ""} material-symbols-outlined text-xl text-gray-600`}>
                  keyboard_arrow_down
                </span>
              </Disclosure.Button>
              <Disclosure.Panel className="pb-2 pt-4 text-sm text-gray-600">
                {customParamaters.map((parameter, index) => (
                  <div className="mb-2 flex gap-x-5" key={index}>
                    <div className="flex-1">
                      <label className={`${styles.inputLabel}`} htmlFor="billing_address">
                        Parameter name
                      </label>
                      <input
                        className={`${styles.inputBox}`}
                        onChange={(e) => handleInputChange(index, e.target.value, "name")}
                        placeholder="Exaple: Language"
                        type="text"
                        value={customParamaters[index].name}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={`${styles.inputLabel}`} htmlFor="billing_address">
                        Value
                      </label>
                      <input
                        className={`${styles.inputBox}`}
                        onChange={(e) => handleInputChange(index, e.target.value, "value")}
                        placeholder="Exaple: Language"
                        type="text"
                        value={customParamaters[index].value}
                      />
                    </div>
                  </div>
                ))}

                <button
                  className="rounded-full border border-solid border-gray-500 px-4 py-2 text-xs font-bold"
                  onClick={() => {
                    setCustomParameters((customParamaters) => [...customParamaters, { name: "", value: "" }]);
                  }}
                >
                  Add Parameter
                </button>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <p className="mt-5 text-xs font-bold text-gray-900">URL Preview</p>
        <div className={`${styles.inputBox} mt-1 overflow-auto`}>
          <p>{URMCode}</p>
        </div>

        <div className="relative h-full pb-7">
          <div className="absolute bottom-0 right-0 top-5 flex gap-x-6">
            <button className="mt-5 flex items-center gap-x-1" onClick={props._onClose}>
              <p className="rounded-full text-xs font-semibold ">Cancel</p>
            </button>
            <button className="mt-5 flex items-center gap-x-1" onClick={() => setUTM()}>
              <p className="rounded-full bg-primary-700 px-8 py-2 text-xs font-semibold text-white">Apply</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UTMCodeForm;
