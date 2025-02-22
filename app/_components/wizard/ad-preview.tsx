"use client";
// import CustomIcon from "@gm-common/custom-icon";
import { useEffect, useState } from "react";

import { isJsonStringValid } from "./constants";
import { BiLogoFacebookCircle } from "react-icons/bi";

const AdPreview = (props) => {
  const [adBuilder, setAdBuilder] = useState(
    isJsonStringValid(props.campaign?.adBuilder[0]) ? JSON.parse(props.campaign?.adBuilder[0]) : {}
  );
  const [pagePostedTo, setPagePostedTo] = useState(
    isJsonStringValid(props.campaign?.adsAccountsPostedTo[0]) ? props.campaign?.adsAccountsPostedTo[0] : ""
  );
  const [adAccount, setAdAccount] = useState(
    isJsonStringValid(props.campaign?.adsAccounts[0]) ? props.campaign?.adsAccounts[0] : ""
  );

  useEffect(() => {
    if (props.campaign?.adBuilder[0] !== undefined) {
      setAdBuilder(JSON.parse(props.campaign.adBuilder[0]));
    }
  }, [props.campaign?.adBuilder[0]]);

  useEffect(() => {
    if (props.campaign?.adsAccountsPostedTo[0] !== undefined) {
      setPagePostedTo(JSON.parse(props.campaign.adsAccountsPostedTo[0]));
    }
  }, [props.campaign?.adsAccountsPostedTo]);

  useEffect(() => {
    if (props.campaign?.adsAccounts[0] !== undefined) {
      setAdAccount(JSON.parse(props.campaign.adsAccounts[0]));
    }
  }, [props.campaign?.adsAccounts]);

  return (
    <div className="relative ">
      <div className="fixed max-w-sm bg-gray-200 p-4 shadow-md">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gm-grey">Ad preview</h2>
        <p className="mb-5 mt-2 text-sm font-light">
          You can preview the ad settings in the crop ratios you have decided to use.
        </p>
        <div className="flex w-fit items-center gap-x-1 border-b-4 border-solid pb-1">
          <BiLogoFacebookCircle color="gray" key="facebook" name="facebook" shade={700} size="15px" />
          <p className="text-xs font-bold">Feed (1:1)</p>
        </div>
        <div className="flex w-full items-center gap-x-5 px-2 pt-3">
          <div className="size-10 rounded-full bg-purple-400"></div>
          <div className="grow">
            <p className="text-sm font-semibold">{pagePostedTo.name}</p>
            <p className="text-xs font-light text-gray-600">Sponsored</p>
          </div>
          <div className="">
            <span className="material-symbols-outlined pr-2 text-xl text-gray-700">close</span>
            <span className="material-symbols-outlined text-xl text-gray-700">more_vert</span>
          </div>
        </div>

        <p className="py-2 text-xs text-gray-700">{adBuilder.description}</p>
        <img className="w-full" src="https://etimg.etb2bimg.com/photo/92585258.cms"></img>

        <div className="flex w-full items-center justify-between gap-x-5 px-2 pt-3">
          <div className="h-10 w-12 rounded-full bg-purple-400"></div>
          <div className="w-44">
            <p className="text-xs text-gray-800">Growmetrics.com</p>
            <p className="text-xs text-gray-900">GrowMetrics lorem impsum dolor soklo</p>
          </div>
          <div className="w-32">
            <button className="rounded-md bg-[#3C74D7] px-4 py-3 text-sm font-bold text-white">
              {adBuilder.callToAction}
            </button>
          </div>
        </div>
        <div className="mt-3 flex w-full items-center justify-between border-t border-solid border-gray-400 px-2 pt-2">
          <div className="flex items-center">
            <span className="material-symbols-outlined pr-2 text-xl text-gray-700">thumb_up</span>
            <p className="text-sm font-bold">Like</p>
          </div>
          <div className="flex items-center">
            <span className="material-symbols-outlined pr-2 text-xl text-gray-700">comment</span>
            <p className="text-sm font-bold">Comment</p>
          </div>
          <div className="flex items-center">
            <span className="material-symbols-outlined pr-2 text-xl text-gray-700">share</span>
            <p className="text-sm font-bold">Share</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdPreview;
