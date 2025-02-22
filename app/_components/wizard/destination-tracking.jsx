import { useMutation, useQuery } from "@apollo/client";
import ListBox from "@gm-common/listbox";
import { UPDATE_CAMPAIGN } from "@gm-graphql/mutations/campaign";
import { GET_PIXELS } from "@gm-graphql/queries/campaign";
import campaign, { getSelectedFacebookAdAccount, getSelectedFacebookPage } from "@gm-lib/campaign";
import { Disclosure, RadioGroup } from "@headlessui/react";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useDebounce } from "use-debounce";

import { styles } from "../../../styles/styles";
import { isJsonStringValid } from "./constants";

const DestinationTrackingStep = (props) => {
  const [destination, setDestination] = useState(props.campaign?.destination?.leadType);
  const [phoneNumber, setPhoneNumber] = useState(props.campaign?.destination?.leadValue);
  const [landingUrl, setLandingUrl] = useState(props.campaign?.destination?.leadValue);
  const [phoneInput] = useDebounce(phoneNumber, 500);
  const [urlInput] = useDebounce(landingUrl, 500);
  const [pixelTracking, setPixelTracking] = useState(props.campaign?.pixelTracking || false);
  const [googleConversionTracking, setGoogleConversionTracking] = useState(
    props.campaign?.googleConversionTracking || false
  );
  const [adAccountId, setAdAccountId] = useState(getSelectedFacebookAdAccount(props.campaign)?.id || "");
  const [pixels, setPixels] = useState([props.campaign?.facebookSpecificData?.pixel?.name || ""]);
  const [conversionGoal, setConversionGoal] = useState(props?.campaign?.conversionGoal || "");
  const [selectablePixels, setSelectablePixels] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(props?.campaign?.objective);

  useEffect(() => {
    setDestination(props.campaign?.destination?.leadType);
    setPhoneNumber(props.campaign?.destination?.leadValue);
    setLandingUrl(props.campaign?.destination?.leadValue);
    setPixelTracking(props.campaign?.pixelTracking || false);
    setGoogleConversionTracking(props.campaign?.googleConversionTracking || false);
    setAdAccountId(getSelectedFacebookAdAccount(props.campaign)?.id || "");
    setPixels([props.campaign?.facebookSpecificData?.pixel?.name || ""]);
    setConversionGoal(props?.campaign?.conversionGoal || "");
    setSelectedCampaign(props?.campaign?.objective);
  }, [props.campaign]);

  const {
    loading,
    data: pixelData,
    refetch,
  } = useQuery(GET_PIXELS, {
    fetchPolicy: "no-cache",
    variables: {
      adAccountId,
    },
  });

  function getPixel(pixelId) {
    if (selectablePixels?.length > 0) {
      return selectablePixels.find((pixel) => pixel.id === pixelId);
    }
  }

  const getConversionGoals = () => {
    switch (props?.campaign?.objective?.key) {
      case "OUTCOME_LEADS":
        return destination === "website"
          ? [
              "Default",
              "Complete Registration",
              "Contact",
              "Find Location",
              "Lead",
              "Schedule",
              "Search",
              "Start trail",
              "Submit application",
            ]
          : ["Default"];
      case "OUTCOME_SALES":
        return [
          "Default",
          "Add payment info",
          "Add to cart",
          "Add to wishlist",
          "Complete registration",
          "Donate",
          "Initiate checkout",
          "Purchase",
          "Search",
          "Start trial",
          "Subscribe",
          "View content",
        ];
      default:
        return ["Default"];
    }
  };

  const websiteHelperText = () => {
    if (selectedCampaign === "OUTCOME_SALES") {
      return "Drive sales to this URL";
    } else if (selectedCampaign === "OUTCOME_TRAFFIC") {
      return "When people click on your ad, they will be directed to your website";
    } else {
      return "Landing page URL";
    }
  };

  useEffect(() => {
    if (pixelData !== undefined && pixelData.pixels !== null) {
      const pixels = pixelData.pixels.map((p) => JSON.parse(p));
      setSelectablePixels(pixels);
    }
  }, [loading, pixelData]);

  useEffect(() => {
    if (selectablePixels?.length > 0) {
      if (!props.campaign?.facebookSpecificData?.pixel) {
        selectPixel(selectablePixels[0].id);
        setPixels(selectablePixels[0].name);
      }
    }
  }, [selectablePixels]);

  const setCampaign = async (data) => {
    const adAccountId = getSelectedFacebookAdAccount(props?.campaign)?.id;
    const pageId = getSelectedFacebookPage(props?.campaign)?.id;
    await props.updateCampaign(data);
    await props.refetchPreview(props?.campaign, adAccountId, pageId);
  };

  const toggleTracking = (field) => {
    if (field === "pixelTracking") {
      setCampaign({
        pixelTracking: !pixelTracking,
      });
      setPixelTracking(!pixelTracking);
    } else if (field === "googleConversionTracking") {
      setCampaign(!googleConversionTracking, field);
      setGoogleConversionTracking(!googleConversionTracking);
    }
  };

  const selectPixel = (pixel) => {
    const pixelInfo = getPixel(pixel);
    setPixels([pixelInfo.name]);
    setPixelTracking(true);
    setCampaign({
      facebookSpecificData: {
        ...props.campaign?.facebookSpecificData,
        pixel: {
          name: pixelInfo?.name || "",
          id: pixel,
        },
      },
      pixelTracking: true,
    });
  };

  const selectConversionGoal = (goal) => {
    setConversionGoal(goal);
    setCampaign({
      conversionGoal: goal,
    });
  };

  const setLeadLocation = (lead) => {
    setCampaign({
      destination: {
        leadType: lead,
        leadValue: "",
      },
    });
    setDestination(lead);
    setPhoneNumber("");
    setLandingUrl("");
  };

  const updateEmail = (e) => {
    setLandingUrl(e.target.value);
  };

  const typeOfTracking = () => {
    if (selectedCampaign?.key === "OUTCOME_LEADS") {
      return "leads";
    } else if (selectedCampaign?.key === "OUTCOME_AWARENESS") {
      return "awareness";
    } else if (selectedCampaign?.key === "OUTCOME_TRAFFIC") {
      return "traffic";
    } else if (selectedCampaign?.key === "OUTCOME_SALES") {
      return "sales";
    } else {
      return "engagement";
    }
  };

  useEffect(() => {
    setCampaign({
      destination: {
        leadType: destination,
        leadValue: phoneNumber,
      },
    });
  }, [phoneInput]);

  useEffect(() => {
    setCampaign({
      destination: {
        leadType: destination,
        leadValue: landingUrl,
      },
    });
  }, [urlInput]);

  return (
    <>
      {!props.generatePage && (
        <h4 className="pb-3 font-semibold text-gray-700"> Generate {typeOfTracking()} for your business</h4>
      )}
      <div
        className={`flex flex-col gap-y-5 ${props?.editMode ? "hidden" : ""} ${props?.generatePage ? "text-sm" : ""}`}
      >
        <RadioGroup value={destination}>
          <RadioGroup.Option value="phone" className={destination === "phone" ? "block" : "hidden"}>
            {({ checked }) => (
              <div className="flex cursor-pointer gap-x-2 pb-3 text-gray-900">
                <input
                  checked={destination === "phone"}
                  className="w-4 accent-black"
                  readOnly
                  type="radio"
                  value="option1"
                />
                <span className={checked ? "" : ""}>Phone calls</span>
              </div>
            )}
          </RadioGroup.Option>
          <RadioGroup.Option value="form" className={destination === "form" ? "block" : "hidden"}>
            {({ checked }) => (
              <div className="flex cursor-pointer gap-x-2 pb-3 text-gray-900">
                <input
                  checked={destination === "form"}
                  className="w-4 accent-black"
                  readOnly
                  type="radio"
                  value="option1"
                />
                <span className={checked ? "" : ""}>Instant lead forms</span>
              </div>
            )}
          </RadioGroup.Option>
          <RadioGroup.Option
            value="website"
            className={
              selectedCampaign === "OUTCOME_LEADS" || selectedCampaign === "OUTCOME_SALES" ? "block" : "hidden"
            }
          >
            {({ checked }) => (
              <div className="flex cursor-pointer gap-x-2 text-gray-900">
                <input
                  checked={destination === "website"}
                  className="mb-5 w-4 accent-black"
                  readOnly
                  type="radio"
                  value="option1"
                />
                <span className={checked ? "" : ""}>Website</span>
              </div>
            )}
          </RadioGroup.Option>
          <RadioGroup.Option value="reach" className={destination === "reach" ? "block" : "hidden"}>
            {({ checked }) => (
              <div className="flex cursor-pointer gap-x-2 text-gray-900 ">
                <input
                  className="w-4 accent-black"
                  type="radio"
                  value="option1"
                  checked={destination === "reach"}
                  readOnly
                />
                <span className={checked ? "" : ""}>Maximise reach of your ads</span>
              </div>
            )}
          </RadioGroup.Option>
        </RadioGroup>
      </div>
      <hr className="divide-solid border-t-2"></hr>
      <div className={destination === "phone" ? "block" : "hidden"}>
        <div className="flex items-center gap-x-1 text-gray-900">
          <span className="material-symbols-outlined text-gray-890 text-base">info</span>
          <p>When people click on a call ad, they will call the number below</p>
        </div>
        <div className="pt-2">
          <PhoneInput
            autoFormat={false}
            country={"au"}
            onChange={(phone) => setPhoneNumber(phone)}
            value={phoneNumber}
          />
        </div>
      </div>
      <div className={destination === "website" ? "block" : "hidden"}>
        <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
          {websiteHelperText()}
        </label>
        <input
          className={`${styles.inputBox}`}
          onChange={(url) => updateEmail(url)}
          placeholder="Type your website URL"
          value={landingUrl}
        ></input>
      </div>
      <div className="pl-1">
        <div className="mt-5">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
            Pixel
          </label>
          <ListBox items={selectablePixels} onSelect={(pixel) => selectPixel(pixel)} selected={pixels} />
        </div>
        <div className="mt-5">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
            Conversion Goal
          </label>
          <ListBox
            items={getConversionGoals()}
            onSelect={(goal) => selectConversionGoal(goal)}
            selected={conversionGoal}
          />
        </div>
      </div>
    </>
  );
};

export default DestinationTrackingStep;
