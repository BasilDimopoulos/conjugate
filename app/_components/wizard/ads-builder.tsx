
// import { useQuery, useReactiveVar } from "@apollo/client";
// import MediaSelection from "@gm-components/media-selection";
// import { CURRENT_ACCOUNT } from "@gm-graphql/localStates/account";
// import { GET_MEDIA_ITEM } from "@gm-graphql/queries/drive";
// import { getSelectedFacebookAdAccount, getSelectedFacebookPage } from "@gm-lib/campaign";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import AiAssistant from "./AiAssistant";
import UTMCodeForm from "./utm_code";
import { convertCTAString } from "../common";

const AdsBuilderStep = (props) => {
  const ads = props.campaign?.ads || [];
  let mediaItems = [];
  const [activeAd, setActiveAd] = useState(0);
  const [showAIPopup, setShowAiPopup] = useState(true);
  const [activeAiAssistant, setActiveAiAssistant] = useState(false);

  async function onMediaItemCreated(mediaItemId) {
    const newMediaItem = await getMediaItemById(mediaItemId);
    selectMediaItem([...selectedMediaItems, newMediaItem]);
  }

  if (ads.length === 0) {
    ads.push({
      description: "",
      headline: "",
      primaryMessage: "",
      utmCode: "",
      callToAction: "",
      mediaItems: [],
    });
  }

  const ad = ads[activeAd];

  if (ad?.mediaItems && ad?.mediaItems?.length > 0 && ad?.mediaItems && ad?.mediaItems[0]) {
    mediaItems = ad.mediaItems;
  }

  const [displayUTMPoppup, setDisplayUTMPoppup] = useState(false);
  const [primaryMessage, setPrimaryMessage] = useState(ad?.primaryMessage || "");
  const [headline, setHeadline] = useState(ad?.headline || "");
  const [description, setDescription] = useState(ad?.description || "");
  const [utmCode, setUtm] = useState(ad?.utmCode || "");
  const [callToAction, selectCallToAction] = useState(ad?.callToAction || "Learn more");
  const [headlineInput] = useDebounce(headline, 500);
  const [descriptionInput] = useDebounce(description, 500);
  const [primaryMessageInput] = useDebounce(primaryMessage, 500);
  const [selectingFromDrive, setSelectingFromDrive] = useState(false);
  const [selectedMediaItems, setSelectedMediaItems] = useState(mediaItems || []);

  const { data: getMediaItem, refetch: refetchMediaItem } = useQuery(GET_MEDIA_ITEM, {
    variables: { id: null },
  });

  const setAdValues = (data) => {
    setPrimaryMessage(data.primaryMessage);
    setHeadline(data.headline);
    setDescription(data.description);
  };

  const getMediaItemById = async (mediaId) => {
    const mediaItem = await refetchMediaItem({ id: mediaId });
    return mediaItem.data.mediaItem;
  };

  const closeAiAssistant = () => {
    setActiveAiAssistant(false);
  };
  const closeUTMPoppup = () => {
    setDisplayUTMPoppup(false);
  };

  const updateAds = async (newAds) => {
    const adAccountId = getSelectedFacebookAdAccount(props?.campaign)?.id;
    const pageId = getSelectedFacebookPage(props?.campaign)?.id;
    props.updateCampaign({
      ads: newAds,
    });
    props.refetchPreview(props?.campaign, adAccountId, pageId);
  };

  const selectAd = (index) => {
    setActiveAd(index);
    props.updatePreviewIndex(index);
  };

  const createNewAd = async () => {
    const newAd = {
      description: "",
      headline: "",
      primaryMessage: "",
      utmCode: "",
      callToAction: "",
      mediaItems: [],
    };
    const newAds = [...ads, newAd];
    updateAds(newAds);
  };

  const deleteAd = async (indexToDelete) => {
    if (indexToDelete >= 0 && indexToDelete < props.campaign?.ads?.length && props.campaign?.ads?.length > 1) {
      const newAds = [...ads];
      newAds.splice(indexToDelete, 1);
      updateAds(newAds);
      indexToDelete === activeAd ? selectAd(0) : selectAd(activeAd);
    }
  };
  useEffect(() => {
    if (ads[activeAd]) {
      const adToUpdate = {
        ...ads[activeAd],
        description,
        headline,
        primaryMessage,
        utmCode,
        callToAction,
      };

      const newAds = [...ads];
      newAds[activeAd] = adToUpdate;

      if (JSON.stringify(adToUpdate) !== JSON.stringify(props.campaign.ads[activeAd])) {
        updateAds(newAds);
      }
    }
  }, [primaryMessage, headline, description, utmCode, callToAction]);

  useEffect(() => {
    if (ads[activeAd]) {
      const adToUpdate = ads[activeAd];
      setPrimaryMessage(adToUpdate.primaryMessage);
      setHeadline(adToUpdate.headline);
      setDescription(adToUpdate.description);
      setUtm(adToUpdate.utmCode);
      selectCallToAction(adToUpdate.callToAction);
      setSelectedMediaItems(adToUpdate.mediaItems);
    }
  }, [activeAd]);

  const selectMediaItem = (mediaItems) => {
    const adToUpdate = ads[activeAd];
    adToUpdate.mediaItems = mediaItems;
    const newAds = [...ads];
    newAds[activeAd] = adToUpdate;
    setSelectedMediaItems(mediaItems);
    updateAds(newAds);
  };

  const handleLibrarySubmission = (selectedItems) => {
    setSelectedMediaItems(selectedItems);
    selectMediaItem(selectedItems);
    setSelectingFromDrive(false);
  };

  return (
    <>
      <div className="flex items-center justify-between pr-1">
        <div className="flex items-center gap-x-2">
          {ads?.map((ad, index) => (
            <div
              className={`border-b-2 border-solid border-black px-2 py-1 ${
                activeAd === index ? "bg-purple-200" : "bg-purple-100"
              }`}
              key={index}
            >
              <div className="flex cursor-pointer items-center gap-x-2">
                <p onClick={() => selectAd(index)} className="font-bold text-[#301E4C]">
                  Ad {index + 1}
                </p>
                <span
                  onClick={() => deleteAd(index)}
                  className="material-symbols-outlined text-xl font-semibold text-gray-900"
                >
                  close
                </span>
              </div>
            </div>
          ))}
        </div>
        <span
          className="material-symbols-outlined cursor-pointer text-xl font-semibold text-purple-800"
          onClick={() => {
            createNewAd();
          }}
        >
          add
        </span>
      </div>
      <MediaSelection platform={null} selectedItems={selectedMediaItems} handleSubmit={handleLibrarySubmission} />

      <div className="mt-5">
        {activeAiAssistant && (
          <div className="mb-2 flex items-center gap-x-1">
            <img src="logos/ai_logo.svg" alt="" />
            <h2 className="text-base font-bold text-primary-700">Ai Assistant</h2>
          </div>
        )}
        <h2 className="mb-3 text-base font-semibold uppercase tracking-widest text-gm-grey ">Blueprint content</h2>
        {showAIPopup && (
          <div className="mb-5 rounded-md border border-solid border-primary-700 bg-primary-300 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <img src="logos/ai_ad_copy.svg" alt="" />
                <h3 className="text-sm font-bold text-primary-700">Generate Ad copy with CassieAi</h3>
              </div>
              <div className="flex gap-x-3">
                <button
                  onClick={() => {
                    setActiveAiAssistant(true);
                    setShowAiPopup(false);
                  }}
                  className="rounded-full border border-solid border-primary-700 bg-white px-3 py-1 text-xs font-bold uppercase text-primary-700"
                >
                  Try Now
                </button>
                <button
                  onClick={() => setShowAiPopup(false)}
                  className="rounded-full border border-solid border-primary-700 bg-none px-3 py-1 text-xs font-bold uppercase text-primary-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {activeAiAssistant && <AiAssistant _close={closeAiAssistant} _setValues={setAdValues} />}
        {!activeAiAssistant && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white" htmlFor="message">
              Primary message
            </label>
            <textarea
              className="block w-full border border-solid border-gray-400 bg-white p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600 "
              id="message"
              placeholder="Write your thoughts here..."
              rows={Math.max(2, primaryMessage.split("\n").length) + 5}
              value={primaryMessage}
              onChange={(e) => setPrimaryMessage(e.target.value)}
            ></textarea>

            <label className="mb-2 mt-3 block text-sm font-medium text-gray-900 dark:text-white" htmlFor="message">
              Headline
            </label>
            <input
              className="block w-full border border-solid border-gray-400 bg-white p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600 "
              id="message"
              placeholder="Write your thoughts here..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            ></input>

            <label className="mb-2 mt-3 block text-sm font-medium text-gray-900 dark:text-white" htmlFor="message">
              Description
            </label>
            <input
              className="block w-full border border-solid border-gray-400 bg-white p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600 "
              id="message"
              placeholder="Write your thoughts here..."
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></input>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <CallToActionDropdown callToAction={convertCTAString(callToAction)} selectCallToAction={selectCallToAction} />
        <div className="flex gap-x-2 pt-5">
          <button className=" text-blue-800" onClick={() => setDisplayUTMPoppup(true)}>
            Generate UTM Code
          </button>
          <div className="group relative flex items-center">
            <span
              onClick={() => console.info(`utmCode: ${utmCode}`)}
              className={
                utmCode !== ""
                  ? "material-symbols-outlined cursor-default text-xl font-semibold text-green-600"
                  : "hidden"
              }
            >
              check_circle
            </span>
            <div className="absolute -right-3 mb-20 mr-4 hidden w-60 overflow-auto rounded-md bg-gray-900 p-2 leading-4 text-white group-hover:block">
              <p>{utmCode}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={displayUTMPoppup ? "block" : "hidden"}>
        <UTMCodeForm _onClose={closeUTMPoppup} _setUTM={setUtm} />
      </div>
    </>
  );
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const CallToActionDropdown = (props) => {
  const callToActions = [
    "No button",
    "Learn more",
    "Book now",
    "Buy tickets",
    "Contact us",
    "Download",
    "Get offer",
    "Get quote",
    "Get showtimes",
    "Listen now",
    "Order now",
    "Play game",
    "Request time",
    "See menu",
    "Sign up",
    "Subscribe",
    "Watch more",
  ];
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="mt-5 flex w-52 items-center gap-x-2 border border-solid border-gray-400 px-4 py-2">
          <span className="material-symbols-outlined text-xl font-semibold text-primary-1000">add</span>
          <p className="text-primary-1000">{props.callToAction !== "" ? props.callToAction : "Learn more"}</p>
          <span className="material-symbols-outlined absolute right-5 text-base font-semibold text-primary-1000">
            info
          </span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 size-52 origin-top-right overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="divide-y-2 divide-solid divide-gray-300">
            {callToActions.map((callToAction, index) => (
              <div key={index}>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={classNames(
                        active ? "bg-gray-200 text-gray-1000" : "text-gray-800",
                        "block px-4 py-2 text-sm"
                      )}
                      onClick={() => props.selectCallToAction(callToAction)}
                    >
                      {callToAction}
                    </a>
                  )}
                </Menu.Item>
              </div>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default AdsBuilderStep;
