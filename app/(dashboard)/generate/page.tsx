'use client';
import { styles } from '@/app/_components/styles/styles';
import { objectives, removeTypename } from '@/app/_components/wizard/constants';
// import { useLazyQuery, useMutation, useReactiveVar } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BiRightArrowCircle, BiStar } from 'react-icons/bi';
import { Spinner } from '@material-tailwind/react';
import { CallToActionDropdown } from '@/app/_components/wizard/ads-builder';
import { convertCTAString } from '@/app/_components/common';

// import AdSetting from "@gm-components/ads/ad-setting";
// import { convertCTAString, formatUrl } from "@gm-components/ads/common";
// import { CallToActionDropdown } from "@gm-components/ads/wizard/ads-builder";
// import BudgetStep from "@gm-components/ads/wizard/budget";
// import { objectives, removeTypename } from "@gm-components/ads/wizard/constants";
// import DestinationTrackingStep from "@gm-components/ads/wizard/destination-tracking";
// import InterestsStep from "@gm-components/ads/wizard/interests";
// import LocationDemographics from "@gm-components/ads/wizard/location-demographics";
// import MapPreview from "@gm-components/ads/wizard/map-preview";
// import CampaignObjectiveStep from "@gm-components/ads/wizard/objective";
// import MediaSelection from "@gm-components/media-selection";
// import paths from "@gm-config/paths";
// import { CURRENT_ACCOUNT } from "@gm-graphql/localStates/account";
// import { PLATFORM_CHILD_TARGETS_BY_PLATFORM } from "@gm-graphql/localStates/platform";
// import { UPDATE_GROWMETRICS_DRAFT } from "@gm-graphql/mutations/ads";
// import {
//   GENERATE_ADS,
//   GENERATE_SPECIFC_AD_DATA,
//   GET_AD_PREVIEW,
//   GET_BRAND_DETAILS_FROM_WEBSITE,
// } from "@gm-graphql/queries/ads";
// import { GET_AI_FACEBOOK_INTERESTS } from "@gm-graphql/queries/ai";
// import { GET_PIXELS } from "@gm-graphql/queries/campaign";
// import campaignService, { getSelectedFacebookAdAccount, getSelectedFacebookPage } from "@gm-lib/campaign";
// import { Link, useNavigate } from "react-router-dom";

// import GrowMetricsWrapper from "../hoc/GrowMetricsWrapper";

const Pages = {
  SETUP: 'intro',
  LOADING: 'loading',
  COMPLETE: 'complete',
  EDIT: 'edit',
  REVIEW: 'review',
};

const GenerateAds = () => {
  const [loadingStates, setLoadingStates] = useState([
    { item: 'Scanning Website', status: 'idle' },
    { item: 'Analysing your competition', status: 'idle' },
    { item: 'Creating your ads', status: 'idle' },
    { item: 'Choosing a high converting audience', status: 'idle' },
    { item: 'Finalising your campaign', status: 'idle' },
  ]);

  const mediaItems = [];

  const [activePage, setActivePage] = useState(Pages.SETUP);
  console.log('activePage: ', activePage);
  const [loadingPercantage, setLoadingPercantage] = useState(20);
  // const currentAccount = useReactiveVar(CURRENT_ACCOUNT);
  const [website, setWebsite] = useState('');
  const [offer, setOffer] = useState('');
  // const [generateAiAd, { loading: loadingAiAd, error: aiAdError }] = useLazyQuery(GENERATE_ADS);
  // const [getAdPreview, { loading: loadingAdPreview, error: adPreviewDraft }] = useLazyQuery(GET_AD_PREVIEW);
  const [previewUrls, setPreviewUrls] = useState(['']);
  // const targets = useReactiveVar(PLATFORM_CHILD_TARGETS_BY_PLATFORM);
  // const adAccounts = campaignService.getListByEnabled(targets, "facebook", "adAccount") || [];
  const adAccounts = [];

  // const adPages = campaignService.getListByEnabled(targets, "facebook", "page") || [];
  const adPages = [];
  const [regeneratingAds, setRegeneratingAds] = useState(false);
  const [regeneratingPrimaryMessage, setRegeneratingPrimaryMessage] =
    useState(false);
  const [regeneratingHeadline, setRegeneratingHeadline] = useState(false);
  const [regeneratingDescription, setRegeneratingDescription] = useState(false);

  const [generatedCampaign, setGeneratedCampaign] = useState();
  const [selectedMediaItems, setSelectedMediaItems] = useState(
    mediaItems || []
  );
  // const [updateGrowmetricsCampaign] = useMutation(UPDATE_GROWMETRICS_DRAFT);
  // const [generateSpecificAdData] = useLazyQuery(GENERATE_SPECIFC_AD_DATA);
  const [generatedBrandDetails, setBrandDetails] = useState();
  const [marker, setMarker] = useState(null);

  const updateDraftCampaign = (data) => {
    if (!('targetedLocations' in data)) {
      setLocationFocused(false);
    }
    setCampaignData((prev) => ({
      ...prev,
      ...data,
    }));
  };
  const [campaignData, setCampaignData] = useState({});
  const [selectedAd, setSelectedAd] = useState(0);
  const [regeneratingAdData, setRegeneratingAdData] = useState({
    primaryMessage: false,
    headline: false,
    description: false,
  });
  // const [getAiInterests, { data: aiInterestsData, loading: loadingAiInterests }] = useLazyQuery(
  //   GET_AI_FACEBOOK_INTERESTS,
  //   {
  //     fetchPolicy: "cache-first",
  //   }
  // );
  // const navigate = useNavigate();

  const handleLibrarySubmission = (selectedItems) => {
    setSelectedMediaItems(selectedItems);
    setSelectedMediaItems(selectedItems);
  };

  const handleCampaignUpdates = (e) => {
    const { name, value } = e;

    setCampaignData({
      ...campaignData,
      ads: campaignData.ads.map((ad, index) =>
        index === selectedAd ? { ...ad, [name]: value } : ad
      ),
    });
  };

  const adReadyToGenerate = () => {
    if (website && offer && selectedMediaItems?.length > 0) {
      return true;
    }
    return false;
  };
  // const fetchPreview = async (data, internalAdAccountId, internalPageId) => {
  //   const previewUrls = await getAdPreview({
  //     variables: {
  //       campaignData: removeTypename(data),
  //       internalAdAccountId,
  //       internalPageId,
  //     },
  //   });
  //   setPreviewUrls(previewUrls?.data?.adPreview);
  // };

  // const [fetchPixels] = useLazyQuery(GET_PIXELS, {
  //   fetchPolicy: "no-cache",
  // });

  // const [getBrandDetails, { loading: loadingBrandDetails, error: brandDetailsError }] =
  //   useLazyQuery(GET_BRAND_DETAILS_FROM_WEBSITE);

  const updateCampaign = async (data) => {
    if (campaignService.allStepsComplete(campaignData)) {
      await updateGrowmetricsCampaign({
        variables: {
          updateData: removeTypename(data),
          businessSpaceId: currentAccount,
        },
      });
      navigate(paths.createCampaign);
    } else {
      alert('Please complete all required steps');
    }
  };

  // const fetchAiInterests = async (ad, internalAdAccountId) => {
  //   if (ad?.primaryMessage && ad?.headline && ad?.description) {
  //     const interests = await getAiInterests({
  //       variables: {
  //         primaryMessage: ad.primaryMessage,
  //         headline: ad.headline,
  //         description: ad.description,
  //         adAccountId: internalAdAccountId,
  //       },
  //     });
  //     return removeTypename(interests?.data.aiFacebookInterest.slice(0, 5));
  //   }
  // };

  // const analyzeWebsite = async (website) => {
  //   const details = await getBrandDetails({
  //     variables: {
  //       websiteUrl: formatUrl(website),
  //     },
  //   });
  //   setBrandDetails(removeTypename(details?.data?.brandDetails));
  //   return details?.data?.brandDetails;
  // };

  const generateAdsWithBusinessDetails = async () => {
    // const details = await analyzeWebsite(website);
    // const adResponse = await generateAiAd({
    //   variables: {
    //     brandInformation: {
    //       brandName: details?.brandName,
    //       brandDescription: details?.brandDescription,
    //       demographics: details?.demographics,
    //       location: details?.location,
    //       category: details?.category,
    //       existingAds: details?.existingAds,
    //       brandColors: details?.brandColors,
    //       font: details?.font,
    //       additionalInfo: details?.additionalInfo,
    //     },
    //     numberOfAds: selectedMediaItems.length,
    //     landingPage: website,
    //     offerInformation: offer,
    //   },
    // });
    // const ad = {
    //   ...adResponse.data.generatedAds,
    //   ads: adResponse.data.generatedAds?.ads?.map((adItem) => ({ ...adItem })),
    // };

    //   for (let i = 0; i < ad.ads.length; i++) {
    //     if (selectedMediaItems[i]) {
    //       ad.ads[i].mediaItems = [selectedMediaItems[i]];
    //     }
    //   }
    //   const internalAdAccount = adAccounts?.length > 0 ? adAccounts[0]?.id : "";
    //   const internalPageId = adPages?.length > 0 ? adPages[0]?.id : "";
    //   const interests = await fetchAiInterests(ad?.ads[0], internalAdAccount);
    //   ad.interests = interests;
    //   const pixelData = await fetchPixels({
    //     variables: {
    //       adAccountId: internalAdAccount,
    //     },
    //   });
    //   const pixels = pixelData.data.pixels.map((p) => JSON.parse(p));
    //   if (pixels?.length > 0) {
    //     ad.facebookSpecificData = {
    //       pixel: {
    //         name: pixels[0]?.name || "",
    //         id: pixels[0]?.id || "",
    //       },
    //     };
    //     ad.pixelTracking = true;
    //   }
    //   ad.adAccounts = adAccounts;
    //   ad.adPages = adPages;
    //   setCampaignData(ad);
    //   fetchPreview(removeTypename(ad), internalAdAccount, internalPageId);
    const ad = {
      budget: {
        amount: '20',
        strategy: 'NoEndDate',
        allocationMethod: 'Per Day',
      },
      targetedDemographics: {
        ageFrom: '18',
        ageTo: '22',
        gender: 'All',
      },
      conversionEvent: 'PURCHASE',
      ads: [
        {
          description: 'Description',
          headline: 'Headline',
          primaryMessage: 'Primary Message',
          utmCode:
            'http://www.growmetrics.com/?utm_source=growmetrics&utm_medium=growmetrics&utm_campaign=Sale_Ad_With_Image',
          callToAction: 'Learn more',
          mediaItems: [
            {
              __typename: 'MediaItem',
              id: '53665adc-4492-4bb7-8547-bdd5f831c6bf',
              alt: null,
              codec: null,
              createdBy: 'a5c40df4-ba35-458a-8af8-f81058da50d3',
              createdAt: '1724989652715',
              description: null,
              accountId: '03a0c499-96f2-4787-94e7-d6a0f9bf0448',
              duration: null,
              height: 1391,
              isMain: true,
              isUploaded: true,
              mimeType: 'image/jpeg',
              name: 'cover.jpeg',
              size: 400371,
              sourceMediaItemId: null,
              thumbnailUrl:
                'https://staging.static.growmetrics.com/thumbnails/03a0c499-96f2-4787-94e7-d6a0f9bf0448/53665adc-4492-4bb7-8547-bdd5f831c6bf.jpeg?Expires=1728696951&Key-Pair-Id=K1O3M5RZ6RDESK&Signature=LAtl3B830~h2wWB5FOZyUSN5mfRBxy0Nsfd-k9PBTePeZaA1qP84LMeKDVc1GA15dty2M2X3x03b3jv-NJk4yLojR8epW0xVx5BoeuYYMd57dYFZG1EoiQItsy-A4bt0RBajiyesOrRX~rHQrYoYl3NOAnfyDyAMtJWQvhkjebnzgIA7cVpgpc4T69EdW64iAcin4eyNhO2XE~VEqlaKAA59SYW607q4EYCqyz6K28utdFXfyaXgQt~eXj-JodzDyMxlMaEl31fR-OpAJYTa-h5Rhosex1TETdOMtr4LXa38E~BVEk53YFYEKnELDvk4CBCdRoFS7umMpXJh5vsBsw__',
              updatedAt: '1725427604095',
              url: 'https://staging.static.growmetrics.com/media/03a0c499-96f2-4787-94e7-d6a0f9bf0448/53665adc-4492-4bb7-8547-bdd5f831c6bf.jpeg?Expires=1728696951&Key-Pair-Id=K1O3M5RZ6RDESK&Signature=q9VOzQLe3u5bJqyeLiQGn8lEO~8uJKGFXjYNCsnmNuB6tsYLeen6xfZQtu4l9WARvhyu6GQ0jC82~MW-pxJDcd5~mPMfYnO64ahFV4PaiX9cnDv-t35QpEP86N3sAH4GJaY0u~d8wLVrEc9TPQ5EdwrDVt7qibwUJKkSWQqwF11evOhgDbRS5vxaybuIarXGFlgPW2b08WhNL0NxI6Sh04fGIt~~iBTHQsjAnbqjzeMrp830YhCQNp4TFJRPUypf9UaeQVr7UI7zkUrA8qNd46ClD0jfuVBByFlfIiAaTFVPKHeY0DZippUzdLujvkca41TjLJGpSsO~GYoD1KhreA__',
              variationId: null,
              width: 956,
              platform: null,
              platformId: null,
              variation: null,
              order: 0,
              folderId: null,
              firstFrameUrl: null,
            },
          ],
        },
      ],
      adAccounts: [
        {
          platform: 'facebook',
          id: 'b1926b82-54f9-4212-b5b8-ca524cb2cb8a',
          name: 'GrowMetrics 3.0 - Test Ad Account',
        },
      ],
      adPages: [
        {
          platform: 'facebook',
          id: 'a2e4f6c5-a613-49fb-8c5d-4ffd3c2c3ca5',
          name: 'GrowMetrics Test Page',
        },
      ],
      objective: {
        key: 'OUTCOME_SALES',
        id: 'sales',
      },
      destination: {
        leadType: 'website',
        leadValue: 'www.growmetrics.com',
      },
      facebookSpecificData: {
        pixel: {
          name: "Basil's Pixel",
          id: '1525974181300874',
        },
        billing_event: 'IMPRESSIONS',
        destination_type: 'WEBSITE',
        optimisation_goal: 'OFFSITE_CONVERSIONS',
        custom_event_type: 'PURCHASE',
        attribution_spec: [
          {
            event_type: 'CLICK_THROUGH',
            window_days: 7,
          },
          {
            event_type: 'VIEW_THROUGH',
            window_days: 1,
          },
        ],
      },
      campaignName: 'Sales Ad With Image',
      pixelTracking: true,
      targetedLocations: [
        {
          key: '106494',
          name: 'Adelaide',
          region: 'South Australia',
          country: 'Australia',
          country_code: 'AU',
          type: 'city',
          region_id: 134,
          radius: '20',
          radiusUnit: 'km',
          latitude: -34.9284989,
          longitude: 138.6007456,
        },
        {
          key: '3875',
          name: 'New York',
          region: null,
          country: 'United States',
          country_code: 'US',
          type: 'region',
          region_id: '',
          radius: '1',
          radiusUnit: 'km',
          latitude: 40.7127753,
          longitude: -74.0059728,
        },
        {
          key: 'BR',
          name: 'Brazil',
          region: null,
          country: 'Brazil',
          country_code: 'BR',
          type: 'country',
          region_id: '',
          radius: '1',
          radiusUnit: 'km',
          latitude: -14.235004,
          longitude: -51.92528,
        },
        {
          key: 'ChIJcyWIq41C1moRSQbt_BsLyWc',
          name: '11 Adolph St, Cremorne VIC 3121, Australia',
          region: '',
          country: '',
          country_code: '',
          type: 'google_place',
          region_id: '',
          radius: '1',
          radiusUnit: 'km',
          latitude: -37.8266589,
          longitude: 144.9966228,
        },
      ],
      interests: [
        {
          __typename: 'FacebookInterest',
          id: '6003306084421',
          name: 'Yoga',
          platform: 'facebook',
        },
        {
          id: '6003539067673',
          name: 'Luck',
          platform: 'facebook',
        },
      ],
    };

    setGeneratedCampaign(removeTypename(ad));
    setCampaignData(removeTypename(ad));
  };

  const handleLoading = async (index = 0) => {
    // const randomDelay = Math.floor(Math.random(3) * 1000) + 1000 * index;

    // setTimeout(() => {
    //   setLoadingStates((prevStates) =>
    //     prevStates.map((item, i) => {
    //       if (i === index) return { ...item, status: 'loading' };
    //       if (i === index - 1) return { ...item, status: 'complete' };
    //       return item;
    //     })
    //   );

    // setLoadingPercantage(((index + 1) * 100) / loadingStates.length);
    // if (index >= loadingStates.length) {
    // setActivePage(Pages.COMPLETE);
    setActivePage(Pages.EDIT);
    // return;
    // }
    // handleLoading(index + 1);
    // }, randomDelay);
  };

  // const regenerateAds = async () => {
  //   if (!regeneratingAds) {
  //     setRegeneratingAds(true);
  //     await generateAdsWithBusinessDetails();
  //     setRegeneratingAds(false);
  //   }
  // };

  // const regenerateContent = async (contentType) => {
  //   if (contentType === "primaryMessage") {
  //     setRegeneratingPrimaryMessage(true);
  //   } else if (contentType === "description") {
  //     setRegeneratingDescription(true);
  //   } else if (contentType === "headline") {
  //     setRegeneratingHeadline(true);
  //   }
  //   setRegeneratingAdData({
  //     ...regeneratingAdData,
  //     [contentType]: true,
  //   });
  //   const newContent = await generateSpecificAdData({
  //     variables: {
  //       brandInformation: generatedBrandDetails,
  //       fieldName: contentType,
  //     },
  //   });
  //   handleCampaignUpdates({ name: contentType, value: newContent?.data?.specifcAdData });
  //   if (contentType === "primaryMessage") {
  //     setRegeneratingPrimaryMessage(false);
  //   } else if (contentType === "description") {
  //     setRegeneratingDescription(false);
  //   } else if (contentType === "headline") {
  //     setRegeneratingHeadline(false);
  //   }

  //   return newContent;
  // };

  const selectCallToAction = (value) => {
    handleCampaignUpdates({ name: 'callToAction', value });
  };

  const updateMediaItems = (newMediaItems) => {
    handleCampaignUpdates({ name: 'mediaItems', value: newMediaItems });
  };

  useEffect(() => {
    if (activePage === Pages.LOADING) {
      generateAdsWithBusinessDetails();
      handleLoading();
    }
  }, [activePage]);

  const [showDetailObjectives, setShowDetailObjectives] = useState(false);
  const [showDetailAudience, setShowDetailAudience] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);

  useEffect(() => {
    console.log('Fetching Preview...');
    // const internalAdAccount = adAccounts?.length > 0 ? adAccounts[0]?.id : "";
    // const internalPageId = adPages?.length > 0 ? adPages[0]?.id : "";
    // fetchPreview(campaignData, internalAdAccount, internalPageId);
  }, [campaignData]);

  return (
    <>
      {activePage === Pages.SETUP && (
        <div className="mt-5 w-full">
          {/* <Link to={paths.adsAssistant}> */}
          <button className="flex items-center gap-x-2">
            <span className="material-symbols-outlined text-sm text-black">
              keyboard_backspace
            </span>
            <p className="text-sm font-bold">Back to campaigns</p>
          </button>
          {/* </Link> */}
          <div className="mt-14 flex flex-col items-center">
            <div className="flex max-w-[75%] items-center gap-x-5 rounded-lg bg-white p-10 shadow-xl">
              <div className="w-[35%]">
                <h1 className="text-3xl font-medium">Meet CassieAI</h1>
                <p className="mb-5 mt-2 font-bold text-purple-500">
                  Your AI marketing Assistant
                </p>
                <p className="leading-6">
                  CassieAI automates the campaign creation process for you.
                  Trained on $1million in ad spend, she is able to automatically
                  create the best performing campaign for your business.
                </p>
                <div className="mt-5 flex flex-col gap-y-2">
                  <p className="text-sm leading-5 text-gray-700">
                    <span className="font-bold ">Step 1</span> Enter your
                    website
                  </p>
                  <p className="text-sm leading-5 text-gray-700">
                    <span className="font-bold ">Step 2</span> Provide
                    information about the offer
                  </p>
                  <p className="text-sm leading-5 text-gray-700">
                    <span className="font-bold ">Step 3</span> Upload images for
                    your ads
                  </p>
                  <p className="text-sm leading-5 text-gray-700">
                    <span className="font-bold ">Step 4</span> Sit back. Watch
                    the magic hapen
                  </p>
                </div>
              </div>
              <div className="w-[65%]">
                <label
                  className={`${styles.inputLabel} !text-sm font-bold`}
                  htmlFor="website"
                >
                  Enter Website
                </label>
                <input
                  className={`${styles.inputBox} mb-4 mt-1 border-primary-600`}
                  id="website"
                  onChange={(e) => setWebsite(e.target.value)}
                  type="url"
                  value={website}
                />
                <label
                  className={`${styles.inputLabel} !text-sm font-bold`}
                  htmlFor="website"
                >
                  Offer Information
                </label>
                <input
                  className={`${styles.inputBox} mb-4 mt-1 border-primary-600`}
                  id="offer"
                  onChange={(e) => setOffer(e.target.value)}
                  type="text"
                  value={offer}
                />
                {/* <MediaSelection
                  platform={null}
                  selectedItems={selectedMediaItems}
                  handleSubmit={handleLibrarySubmission}
                /> */}
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <button
                className={`mt-5 flex items-center gap-x-2 rounded-full px-5 py-1.5 text-sm font-bold text-white ${
                  adReadyToGenerate() ? 'bg-gm-bg-purple' : 'bg-gray-800'
                }`}
                onClick={() => {
                  setActivePage(Pages.LOADING);
                }}
              >
                {/* <img src="/logos/ai_stars.svg" alt="" className="size-4" /> */}
                <BiStar />
                <p>Generate Ads</p>
              </button>
              {/* <Link to={paths.createCampaign}> */}
              <button className="mt-5 flex items-center gap-x-2 rounded-full px-5 py-1.5 text-sm font-bold text-blue-800">
                <p>Advanced Ads Builder</p>
                <BiRightArrowCircle />
              </button>
              {/* </Link> */}
            </div>
          </div>
        </div>
      )}

      {activePage === Pages.LOADING && (
        <div className="z-20 mt-20 flex flex-col items-center">
          <div className="w-full max-w-xl ">
            <div className="flex items-center gap-x-1">
              <p className="text-base font-bold">Loading...</p>
            </div>
            <div className="my-3 h-2 w-4/5">
              <div
                className={`h-2 bg-blue-600 transition-all duration-500 ease-in-out`}
                style={{ width: loadingPercantage + '%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">Waiting</p>
            {loadingStates.map((item, index) => (
              <div key={index}>
                {item?.status !== 'idle' && (
                  <div
                    className={`mt-6 flex translate-y-6 animate-fadeInUp items-center gap-x-2 opacity-0`}
                  >
                    {item.status === 'loading' && (
                      <Spinner
                        width={18}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                      />
                    )}
                    {item.status === 'complete' && (
                      <span className="material-symbols-outlined text-lg text-green-650">
                        check_circle
                      </span>
                    )}
                    <p className="text-lg font-medium text-gray-700">
                      {item?.item}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {activePage === Pages.LOADING ||
        (activePage === Pages.COMPLETE && (
          <div
            className={`z-10 mt-14 flex translate-y-6 flex-col items-center opacity-0 ${
              activePage === Pages.COMPLETE ? 'animate-fadeInUp' : ''
            }`}
          >
            <div className="w-[90%] items-center rounded-lg bg-white p-6 shadow-xl">
              <h2 className="font-bold uppercase tracking-widest text-gray-800">
                Preview and Edit your Ads
              </h2>
              <div className="my-5 flex w-full gap-x-5 overflow-x-auto">
                {previewUrls?.map((preview, index) => (
                  <iframe
                    key={index}
                    // src={preview}
                    width="520"
                    height="688"
                    scrolling="yes"
                    frameBorder="0"
                    className="rounded-lg border border-solid border-gray-400 shadow-lg"
                  ></iframe>
                ))}
              </div>
              <div className="w-full border-t-[1px] border-solid border-gray-600 py-2"></div>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    // regenerateAds();
                  }}
                  className="flex h-10 items-center gap-x-2 rounded-full border border-solid border-blue-800 px-3 text-sm font-bold text-blue-800"
                >
                  {!regeneratingAds && (
                    <span className="material-symbols-outlined text-lg text-blue-800">
                      restart_alt
                    </span>
                  )}
                  {regeneratingAds && (
                    <Spinner
                      width={10}
                      color="blue"
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    />
                  )}
                  <p>Regenerate All</p>
                </button>
                <div className="mx-4 h-6 border-r-[1px] border-solid border-gray-600"></div>
                <button
                  className="flex h-10 items-center gap-x-2 rounded-full border border-solid border-gm-bg-purple px-4 text-sm font-bold text-gm-bg-purple"
                  onClick={() => setActivePage(Pages.EDIT)}
                >
                  <span className="material-symbols-outlined text-lg text-gm-bg-purple">
                    edit
                  </span>
                  <p>{previewUrls?.length > 1 ? 'Edit Ads' : 'Edit Ad'}</p>
                </button>
                <button
                  onClick={() => setActivePage(Pages.REVIEW)}
                  className="ml-4 flex h-10 items-center gap-x-2 rounded-full border border-solid bg-gm-bg-purple px-4 text-sm font-bold text-white"
                >
                  <p>Looks Good</p>
                </button>
              </div>
            </div>
          </div>
        ))}
      {activePage === Pages.EDIT && (
        <div>
          <button
            className="mt-10 flex items-center gap-x-2"
            onClick={() => setActivePage(Pages.COMPLETE)}
          >
            <span className="material-symbols-outlined text-sm text-black">
              keyboard_backspace
            </span>
            <p className="text-sm font-bold">Back to previews</p>
          </button>
          <div className="flex w-full justify-center gap-x-5 p-10">
            <div className="w-3/5 rounded-md bg-white">
              <div className="px-5 pt-5">
                <div className="flex items-center gap-x-2">
                  <span className="material-symbols-outlined text-xl text-black">
                    edit
                  </span>
                  <h1 className="text-xl font-semibold">Edit Ads</h1>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className=" flex items-center gap-x-2">
                    {campaignData?.ads?.map((ad, index) => (
                      <p
                        key={index}
                        onClick={() => setSelectedAd(index)}
                        className={`cursor-pointer px-5 py-1 text-sm font-bold text-[#301E4C] ${
                          selectedAd === index
                            ? 'border-b-2 border-solid border-black bg-purple-100 '
                            : ''
                        }`}
                      >
                        Ad {index + 1}
                      </p>
                    ))}
                  </div>
                  <div>
                    <span className="material-symbols-outlined text-2xl text-black">
                      add
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-[#F5F5FF] p-5">
                <h2 className="font-semibold uppercase tracking-wider">
                  Media
                </h2>
                {/* <MediaSelection
                  platform={null}
                  selectedItems={campaignData?.ads[selectedAd]?.mediaItems}
                  handleSubmit={updateMediaItems}
                /> */}
                <div className="mt-5">
                  <h2 className="mb-2 font-semibold uppercase tracking-wider">
                    Copy
                  </h2>
                  <label
                    className="mb-1 block text-sm font-bold text-gray-700 dark:text-white"
                    htmlFor="message"
                  >
                    Primary message
                  </label>
                  <textarea
                    className="block w-full border border-solid border-gray-500 bg-white p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600 "
                    id="message"
                    placeholder="Write your message here..."
                    rows={
                      Math.max(
                        2,
                        campaignData?.ads[selectedAd]?.primaryMessage.split(
                          '\n'
                        ).length
                      ) + 5
                    }
                    value={campaignData?.ads[selectedAd]?.primaryMessage}
                    onChange={(e) =>
                      handleCampaignUpdates({
                        name: 'primaryMessage',
                        value: e.target.value,
                      })
                    }
                  ></textarea>
                  {!regeneratingPrimaryMessage && (
                    <button
                      onClick={() => regenerateContent('primaryMessage')}
                      className="mt-1 flex items-center gap-x-1 text-blue-800"
                    >
                      <span className="material-symbols-outlined text-xl">
                        restart_alt
                      </span>
                      <p className="text-sm font-bold">Regenerate</p>
                    </button>
                  )}
                  <label
                    className="mb-1 mt-3 block text-sm font-bold text-gray-700 dark:text-white"
                    htmlFor="message"
                  >
                    Headline
                  </label>
                  <input
                    className="ß block w-full border border-solid border-gray-500 bg-white p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600"
                    id="message"
                    placeholder="Write your thoughts here..."
                    value={campaignData?.ads[selectedAd]?.headline}
                    onChange={(e) =>
                      handleCampaignUpdates({
                        name: 'headline',
                        value: e.target.value,
                      })
                    }
                  ></input>
                  {!regeneratingHeadline && (
                    <button
                      className="mt-1 flex items-center gap-x-1 text-blue-800"
                      onClick={() => regenerateContent('headline')}
                    >
                      <span className="material-symbols-outlined text-xl">
                        restart_alt
                      </span>
                      <p className="text-sm font-bold">Regenerate</p>
                    </button>
                  )}

                  <label
                    className="mb-1 mt-3 block text-sm font-bold text-gray-700 dark:text-white"
                    htmlFor="message"
                  >
                    Description
                  </label>
                  <input
                    className="block w-full border border-solid border-gray-500 bg-white p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600 "
                    id="message"
                    placeholder="Write your thoughts here..."
                    value={campaignData?.ads[selectedAd]?.description}
                    onChange={(e) =>
                      handleCampaignUpdates({
                        name: 'description',
                        value: e.target.value,
                      })
                    }
                  ></input>
                  {!regeneratingDescription && (
                    <button
                      onClick={() => regenerateContent('description')}
                      className="mt-1 flex items-center gap-x-1 text-blue-800"
                    >
                      <span className="material-symbols-outlined text-xl">
                        restart_alt
                      </span>
                      <p className="text-sm font-bold">Regenerate</p>
                    </button>
                  )}

                  <h2 className="mt-5 font-semibold uppercase tracking-wider">
                    Call to Action
                  </h2>
                  <CallToActionDropdown
                    callToAction={convertCTAString(
                      campaignData?.ads[selectedAd]?.callToAction
                    )}
                    selectCallToAction={selectCallToAction}
                  />
                </div>
              </div>
              <div className="flex w-full justify-end">
                <button
                  onClick={() => setActivePage(Pages.REVIEW)}
                  className="mt-6 flex h-10 items-center gap-x-2 rounded-full border border-solid bg-gm-bg-purple px-4 text-sm font-bold text-white"
                >
                  <p>Confirm Ads</p>
                </button>
              </div>
            </div>
            <div className="w-1/4">
              <iframe
                // src={previewUrls[selectedAd]}
                width="520"
                height="790"
                scrolling="yes"
                frameBorder="0"
                className="rounded-lg border border-solid border-gray-400 shadow-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {activePage === Pages.REVIEW && (
        <div>
          <button
            className="mt-10 flex items-center gap-x-2"
            onClick={() => setActivePage(Pages.COMPLETE)}
          >
            <span className="material-symbols-outlined text-sm text-black">
              keyboard_backspace
            </span>
            <p className="text-sm font-bold">Back to previews</p>
          </button>
          <div className="flex w-full justify-center gap-x-5 p-10">
            <div className="w-3/5 rounded-md bg-white px-5 pt-5">
              <div className="">
                <div className="">
                  <h1 className="text-lg font-semibold">
                    Confirm your ads settings
                  </h1>
                  <p className="text-sm text-gray-700">
                    CassieAI can make mistakes, double check your settings for
                    your campaign below.
                  </p>
                </div>
              </div>
              <div>
                <label
                  className="mb-1 mt-6 block text-sm font-bold text-gray-700 dark:text-white"
                  htmlFor="message"
                >
                  Give your campaign a name
                </label>
                <input
                  className="block w-full border border-solid border-gray-500 bg-white p-2.5 text-sm text-gray-1000 focus:border-gray-600 focus:ring-gray-600 "
                  id="message"
                  placeholder="Enter your campaign name here..."
                  value={campaignData?.campaignName}
                  onChange={(e) =>
                    updateDraftCampaign({ campaignName: e.target.value })
                  }
                ></input>
                <div className="flex w-full items-center justify-between">
                  <h2 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wider text-gray-700">
                    Objective
                  </h2>
                  <div
                    className={`mt-2 flex cursor-pointer items-center gap-x-1 ${
                      showDetailObjectives ? 'text-blue-800' : 'text-gray-700'
                    }`}
                    onClick={() =>
                      setShowDetailObjectives(!showDetailObjectives)
                    }
                  >
                    <span className="material-symbols-outlined text-lg">
                      edit
                    </span>
                    <p className="text-sm font-semibold ">Edit</p>
                  </div>
                </div>
                {!showDetailObjectives && (
                  <div className="flex items-center gap-x-2 text-blue-800">
                    <span className="material-symbols-outlined text-xl">
                      people
                    </span>
                    <p className="text-xs font-bold">
                      {
                        objectives?.find(
                          (objective) =>
                            objective?.id === campaignData?.objective?.id
                        )?.label
                      }
                    </p>
                  </div>
                )}

                {/* {showDetailObjectives && (
                  <CampaignObjectiveStep
                    campaign={campaignData}
                    updateCampaign={updateDraftCampaign}
                    refetchPreview={() => {}}
                  />
                )}
                <div className="my-6 w-full border-b border-solid border-gray-600"></div>
                <div className="flex w-full items-center justify-between">
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-700">
                    Destination
                  </h2>
                </div>
                <DestinationTrackingStep
                  campaign={campaignData}
                  updateCampaign={updateDraftCampaign}
                  adAccountId={campaignData?.adAccounts}
                  generatePage={true}
                  // editMode={props.editMode}
                  refetchPreview={() => {}}
                />
                <div className="my-6 w-full border-b border-solid border-gray-600"></div>

                <div className="flex w-full items-center justify-between">
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-700">
                    Confirm Location Targeting
                  </h2>
                  <div className="mt-2 flex cursor-pointer items-center gap-x-1"></div>
                </div>
                <LocationDemographics
                  campaign={campaignData}
                  updateCampaign={updateDraftCampaign}
                  setMarker={setMarker}
                  focusLocation={setLocationFocused}
                  refetchPreview={() => {}}
                />
                <div className="my-6 w-full border-b border-solid border-gray-600"></div>
                <div className="flex w-full items-center justify-between">
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-700">
                    Audience Targeting
                  </h2>
                  <div
                    className={`mt-2 flex cursor-pointer items-center gap-x-1 ${
                      showDetailAudience ? 'text-blue-800' : 'text-gray-700'
                    }`}
                    onClick={() => setShowDetailAudience(!showDetailAudience)}
                  >
                    <span className="material-symbols-outlined text-lg">
                      edit
                    </span>
                    <p className="text-sm font-semibold">Edit</p>
                  </div>
                </div>
                {!showDetailAudience && (
                  <div className="flex flex-wrap items-center gap-1">
                    {campaignData?.interests?.map((interest, index) => {
                      return (
                        <div
                          className="flex items-center gap-x-1 rounded-full bg-gray-700 px-2.5 py-1 text-white"
                          key={index}
                        >
                          <p className="text-xs font-bold">{interest?.name}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
                {showDetailAudience && (
                  <InterestsStep
                    campaign={campaignData}
                    updateCampaign={updateDraftCampaign}
                  />
                )}
                <div className="my-4 w-full border-b border-solid border-gray-600"></div>
                <div className="flex w-full items-center justify-between">
                  <h2 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wider text-gray-700">
                    Budget
                  </h2>
                </div>
                <BudgetStep
                  campaign={campaignData}
                  updateCampaign={updateDraftCampaign}
                  refetchPreview={() => {}}
                /> */}
                <div className="my-4 w-full border-b border-solid border-gray-600"></div>
              </div>
              <div className="flex w-full justify-end">
                <button
                  onClick={() => updateCampaign(campaignData)}
                  className="mt-6 flex h-10 items-center gap-x-2 rounded-full border border-solid bg-gm-bg-purple px-4 text-sm font-bold text-white"
                >
                  <p>Confirm</p>
                </button>
              </div>
            </div>
            <div className="w-1/4">
              {/* {!locationFocused && (
                <iframe
                  src={previewUrls ? previewUrls[selectedAd] : ''}
                  width="520"
                  height="790"
                  scrolling="yes"
                  frameBorder="0"
                  className="rounded-lg border border-solid border-gray-400 shadow-lg"
                ></iframe>
              )}
              {locationFocused && (
                <MapPreview
                  campaign={campaignData}
                  marker={marker}
                  updateCampaign={updateDraftCampaign}
                  refetchPreview={() => {}}
                />
              )} */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateAds;
