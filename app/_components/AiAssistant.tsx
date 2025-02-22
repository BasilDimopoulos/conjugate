'use client';
import { BiArrowToRight, BiSave, BiSolidSave } from 'react-icons/bi';
// import {useMutation, useReactiveVar } from "@apollo/client";
import ListBox from './ListBox';
// import paths from "@gm-config/paths";
// import { CURRENT_ACCOUNT } from "@gm-graphql/localStates/account";
// import { UPDATE_ACCOUNT } from "@gm-graphql/mutations/account";
// import { GET_BRAND_DETAILS_FROM_WEBSITE } from "@gm-graphql/queries/ads";
// import { styles } from "@gm-styles/styles";
import { useState } from 'react';
// import { Router, useNavigate } from "react-router-dom";

const Pages = {
  INTRO: 'intro',
  LOADING: 'loading',
  DETAILS: 'details',
};

const styles = {
  inputBox:
    'border border-solid rounded-sm border-gray-400 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-600',
  inputLabel: 'text-gray-700 text-xs mb-1',
  sectionHeader: 'uppercase font-bold gm-title-color tracking-widest',
  subText: 'text-sm text-gray-600 mt-4',
};

const ageFromSelections = [];
const ageToSelections = [];
for (let i = 18; i <= 65; i++) {
  ageFromSelections.push(i.toString());
  ageToSelections.push(i.toString());
}

const AiAssistant = () => {
  const [activePage, setActivePage] = useState(Pages.INTRO);
  const [gender, setGender] = useState('All');
  const [ageFrom, setAgeFrom] = useState('18');
  const [ageTo, setAgeTo] = useState('65+');
  const [website, setWebsite] = useState('');
  const [loadingPercantage, setLoadingPercanage] = useState(0);
  //   const [updateAccount] = useMutation(UPDATE_ACCOUNT);
  //   const currentAccount = useReactiveVar(CURRENT_ACCOUNT);
  //   const navigate = useNavigate();

  //   const [getBrandDetails, { loading: loadingBrandDetails, error: brandDetailsError }] =
  //     useLazyQuery(GET_BRAND_DETAILS_FROM_WEBSITE);

    const [brandDetails, setBrandDetails] = useState({});

  //   const handleBrandDetailsUpdate = (e) => {
  //     const { name, value } = e;
  //     setBrandDetails({
  //       ...brandDetails,
  //       [name]: value,
  //     });
  //   };

  //   const analyzeWebsite = async (website) => {
  //     const details = await getBrandDetails({
  //       variables: {
  //         websiteUrl: website,
  //       },
  //     });
  //     return details?.data?.brandDetails;
  //   };

    const triggerAccountUpdate = async (accountData) => {
      try {
        // await updateAccount({
        //   variables: {
        //     accountId: currentAccount,
        //     data: {
        //       location: accountData.location,
        //       name: accountData.brandName,
        //       website,
        //       additionalInfo: accountData.additionalInfo,
        //       brandColors: accountData.brandColors,
        //       brandDescription: accountData.brandDescription,
        //       category: accountData.category,
        //       demographics: accountData.demographics,
        //       existingAds: accountData.existingAds,
        //       font: accountData.font,
        //     },
        //   },
        // });
        // navigate(paths.profileBusinessDetails);
      } catch (err) {
        console.error(err);
      }
    };

  const handleAnalysis = async () => {
    setActivePage(Pages.LOADING);
    // setTimeout(() => {
    //   setLoadingPercanage(20);
    // }, [1000]);
    const details = {
      brandName: 'Brand Name',
      brandDescription: 'Brand Description',
      demographics: ['Australia'],
      location: 'Australia',
      category: 'Category 1',
      existingAds: 'Some ad',
      brandColors: '#FFFFFF',
      font: 'Roboto',
      additionalInfo: 'None',
    };
    setBrandDetails(details);
    setActivePage(Pages.DETAILS);
  };

  const selectGender = (gender) => {
    // updateCampaign(gender, "gender");
    setGender(gender);
  };
  const setAgeInput = (age, field) => {
    if (field === 'ageFrom') {
      setAgeFrom(age);
    } else if (field === 'ageTo') {
      setAgeTo(age);
    }
  };
  return (
    <div className="h-full w-full font-sans bg-white">
      {activePage === Pages.INTRO && (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <img src="/logos/ai-assistant.svg" className="size-16"></img>
          <div className="max-w-xl text-center">
            <h1 className="pt-3 text-lg font-bold text-gray-700">
              CassieAI Assistant
            </h1>
            <p className="pb-5 pt-2 leading-6 text-gray-700">
              CassieAI knows the ins and outs of your business and is able to
              complete any task referencing her knowledge of your company.
            </p>
            <p className="pb-8 text-gray-700">
              To get started, enter your website below
            </p>
            <input
              className={`${styles.inputBox}`}
              id="first_name"
              onChange={(e) => setWebsite(e.target.value)}
              type="website"
              placeholder="https://"
              value={website}
            />
            <div className="mt-6 flex items-center justify-evenly">
              <button
                className="flex items-center gap-x-2 rounded-full bg-purple-600 px-6 py-2.5"
                onClick={() => handleAnalysis()}
              >
                <img src="/logos/ai_stars.svg" alt="" className="size-5" />
                <p className="font-bold text-white">Generate Ai Assistant</p>
              </button>
              <button
                className="flex items-center gap-x-2"
                onClick={() => setActivePage(Pages.DETAILS)}
              >
                <p className="font-bold text-gm-blue">I dont have a website</p>
                <BiArrowToRight />
              </button>
            </div>
          </div>
        </div>
      )}
      {activePage === Pages.LOADING && (
        <div className="mt-20 flex flex-col items-center">
          <div className="w-full max-w-xl ">
            <div className="flex items-center gap-x-1">
              <span className="material-symbols-outlined text-base text-gray-800">
                hourglass_empty
              </span>
              <p className="text-base font-bold">Loading...</p>
            </div>
            <div className="my-3 h-2 w-full bg-gray-300">
              <div
                className={`h-2 bg-blue-600`}
                style={{ width: loadingPercantage + '%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">Scanning website</p>
          </div>
        </div>
      )}
      {activePage === Pages.DETAILS && (
        <div className="grid grid-cols-2 pl-10">
          <div>
            <h1 className="wide mt-10 pb-1 text-lg font-semibold uppercase">
              Get Started
            </h1>
            <p className="pb-2 text-gray-700">
              Note: AI can make mistakes sometimes, make sure to review the
              information below
            </p>
            <div className="mt-2 bg-white p-5">
              <label
                className={`${styles.inputLabel} !text-sm font-bold`}
                htmlFor="businessName"
              >
                Business Name
              </label>
              <input
                className={`${styles.inputBox} mb-4 mt-1`}
                id="businessName"
                onChange={(e) => handleBrandDetailsUpdate({ name: "brandName", value: e.target.value })}
                type="text"
                value={brandDetails?.brandName || ""}
              />

              <label
                className={`${styles.inputLabel} !text-sm font-bold`}
                htmlFor="website"
              >
                Website Link
              </label>
              <input
                className={`${styles.inputBox} mb-4 mt-1`}
                id="website"
                onChange={(e) => setWebsite(e.target.value)}
                type="text"
                value={website}
              />

              <label
                className={`${styles.inputLabel} !text-sm font-bold`}
                htmlFor="description"
              >
                Product / Service Description
              </label>
              <textarea
                className={`${styles.inputBox} mb-4 mt-1 min-h-40`}
                id="description"
                onChange={(e) => handleBrandDetailsUpdate({ name: "brandDescription", value: e.target.value })}
                value={brandDetails?.brandDescription || ""}
              />

              <p
                className={`${styles.inputLabel} py-4 !text-sm font-bold`}
                htmlFor="demographics"
              >
                Audience Demographics
              </p>
              <div className="mb-6 mt-1 flex gap-x-5">
                <div className="basis-1/3">
                  <label
                    className={`${styles.inputLabel} font-semibold text-gray-700`}
                  >
                    Gender
                  </label>
                  <ListBox
                    items={['All', 'Male', 'Female']}
                    selected={gender}
                    onSelect={selectGender}
                  />
                </div>
                <div className="basis-1/3">
                  <label
                    className={`${styles.inputLabel} font-semibold text-gray-700`}
                  >
                    Age From
                  </label>
                  <ListBox
                    items={ageFromSelections}
                    selected={ageFrom}
                    onSelect={(e) => setAgeInput(e, 'ageFrom')}
                  />
                </div>
                <div className="basis-1/3">
                  <label
                    className={`${styles.inputLabel} font-semibold text-gray-700`}
                  >
                    Age To
                  </label>
                  <ListBox
                    items={ageToSelections}
                    selected={ageTo}
                    onSelect={(e) => setAgeInput(e, 'ageTo')}
                  />
                </div>
              </div>

              <label
                className={`${styles.inputLabel} !text-sm font-bold`}
                htmlFor="address"
              >
                Address
              </label>
              <input
                className={`${styles.inputBox} mb-4 mt-1`}
                placeholder="123 Windsor Avenue Vale Street"
                id="address"
                onChange={(e) => handleBrandDetailsUpdate({ name: "location", value: e.target.value })}
                type="text"
                value={brandDetails?.location || ''}
              />

              <button
                className="my-3 flex items-center gap-x-2 rounded-full bg-purple-600 px-4 py-1"
                onClick={() => triggerAccountUpdate(brandDetails)}
              >
                <BiSolidSave className='text-white'/>
                <p className="text-sm font-bold text-white">Save Changes</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
