import { useQuery, useReactiveVar } from "@apollo/client";
import { CURRENT_ACCOUNT } from "@gm-graphql/localStates/account";
import { GET_MEDIA_ITEMS } from "@gm-graphql/queries/drive";
import { useEffect, useState } from "react";

const TABLE_HEAD = ["", "", "Name", "Set", "Original Size"];

const SelectFromDrive = (props) => {
  const [selectedItems, setSelectedItems] = useState(props.selectedItems || []);
  const currentAccount = useReactiveVar(CURRENT_ACCOUNT);
  const { data: getMediaItems } = useQuery(GET_MEDIA_ITEMS, {
    variables: { accountId: currentAccount, folderId: null },
  });

  const handleSelection = (mediaId) => {
    if (selectedItems.includes(mediaId)) {
      const newArray = selectedItems.filter((item) => item !== mediaId);
      setSelectedItems(newArray);
    } else {
      const newArray = [...selectedItems, mediaId];
      setSelectedItems(newArray);
    }
  };
  return (
    <div className="fixed top-1/4 z-30 h-[500px] w-[520px] rounded-md bg-white shadow-md">
      <h1 className="pb-1 pl-3 pt-4 text-lg font-bold text-gray-900">Select from Drive</h1>
      {getMediaItems?.mediaItems?.map((mediaItem, index) => (
        <div
          key={index}
          className={`flex items-center justify-between px-4 py-2 ${
            selectedItems.some((item) => item.id === mediaItem.id) ? "bg-blue-100" : "bg-gray-100"
          }`}
          onClick={() => handleSelection(mediaItem)}
        >
          <div className="flex items-center gap-x-2">
            <img className="w-6" src={mediaItem.thumbnailUrl}></img>
            <p className="max-w-xl truncate text-xs">{mediaItem.name}</p>
          </div>
          {selectedItems?.some((item) => item.id === mediaItem.id) && (
            <span className="material-symbols-outlined text-sm text-blue-800">check_circle</span>
          )}
        </div>
      ))}
      <div className="absolute bottom-5 right-10 flex gap-x-3">
        <button onClick={props._onCancel}>Cancel</button>
        <button
          className="flex w-fit items-center gap-x-2 rounded-sm bg-blue-800 px-5 py-2"
          onClick={() => props._onSubmit(selectedItems)}
        >
          <p className="text-sm font-bold text-white">Submit</p>
        </button>
      </div>
    </div>
  );
};

export default SelectFromDrive;
