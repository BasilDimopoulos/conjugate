import { useMutation } from "@apollo/client";
import CustomIcon from "@gm-common/custom-icon";
import { UPDATE_CAMPAIGN } from "@gm-graphql/mutations/campaign";
import campaignService from "@gm-lib/campaign";
import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function removeItemByUniqueField(list, fieldName, valueToRemove) {
  return list.filter((item) => item[fieldName] !== valueToRemove);
}

const WizardSelect = (props) => {
  const selectableItems = campaignService.filterOutElementsByMatchingId(props.items, props.selectedItems);
  const previouslySelectedItems = props.selectedItems;

  const [items, updateItems] = useState(selectableItems || []);
  const [selectedItems, setSelectedItems] = useState(props.selectedItems || []);
  const addItem = (item) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems.push(item);
    updateCampaignData(newSelectedItems);
  };

  const removeItem = (item) => {
    if (!props.disableDeletion) {
      const newSelectedItems = removeItemByUniqueField([...selectedItems], "id", item.id);
      setSelectedItems(newSelectedItems);
      updateCampaignData(newSelectedItems);
    }
  };

  useEffect(() => {
    const newSelectableItems = campaignService.filterOutElementsByMatchingId(props.items, selectedItems);
    updateItems(newSelectableItems);
  }, [selectedItems]);

  const updateCampaignData = async (items) => {
    await props.updateCampaign({
      [props.campaignField]: items,
    });
  };

  return (
    <Listbox multiple onChange={setSelectedItems} value={selectedItems}>
      {({ open }) => (
        <>
          <Listbox.Label className="mt-2 block text-xs">{props.label}</Listbox.Label>
          <Listbox.Button className="relative flex h-10 w-full cursor-default flex-wrap items-center gap-x-2 gap-y-3 overflow-auto rounded-md bg-white py-2 pl-2 pr-10 text-left text-gray-1000 shadow-sm ring-1 ring-inset ring-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
            {selectedItems.map((item) => (
              <div className="flex items-center gap-x-1 rounded-full bg-gray-700 px-2 text-white" key={item?.id}>
                <CustomIcon color="white" key={item?.platform} name={item?.platform} size="15px" />
                <p className="text-xs font-bold">{item?.name}</p>
                <span
                  className="material-symbols-outlined white cursor-pointer text-base"
                  onClick={() => removeItem(item)}
                >
                  close
                </span>
              </div>
            ))}
            <span className="material-symbols-outlined white absolute right-3 top-2 text-base">
              keyboard_arrow_down
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            show={open}
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {items.map((item) => (
                <Listbox.Option
                  className={({ active }) =>
                    classNames(
                      active ? "bg-indigo-700 text-white" : "text-gray-1000",
                      "relative cursor-default select-none py-2 pl-3 pr-9"
                    )
                  }
                  key={item.id}
                  onClick={() => addItem(item)}
                  value={item}
                >
                  <div className="flex items-center gap-x-2">
                    <CustomIcon color="gray" key={item?.platform} name={item?.platform} shade={700} size="15px" />
                    {item.name}
                  </div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </>
      )}
    </Listbox>
  );
};

export default WizardSelect;
