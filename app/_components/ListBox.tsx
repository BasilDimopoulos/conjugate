'use client';

export const POSTS_VIEW = {
  LIST: 'List',
  MONTH: 'Month',
};

export const CASSIE_AI_TEXT = 'Let CassieAI decide';

import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { BiArrowToBottom } from 'react-icons/bi';

export default function ListBox(props) {
  let items = [];
  if (
    props.items !== undefined &&
    props.items !== null &&
    props.items.length > 0
  ) {
    items = props.items;
  }
  const [selected, setSelected] = useState(props.selected || items[0]);

  const onSelect = (selectedItem) => {
    props.onSelect(selectedItem);
    setSelected(selectedItem);
  };

  useEffect(() => {
    if (props.selected !== selected) {
      setSelected(props.selected);
    }
  }, [props.selected]);

  return (
    <Listbox
      disabled={props.disabled}
      onChange={(e) => onSelect(e)}
      value={selected}
    >
      <div className="relative mt-1">
        <Listbox.Button
          className={`relative w-full cursor-default rounded-sm border border-solid bg-white py-[7px] pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm ${
            props.disabled ? 'border-gray-50' : 'border-gray-200'
          }`}
        >
          <div className="flex">
            {selected === 'Let CassieAI decide' && (
              <img className="pr-2" src="logos/ai_logo.svg" alt="" />
            )}
            <span
              className={`block h-5 truncate ${
                selected === CASSIE_AI_TEXT ? 'font-bold text-primary-700' : ''
              }`}
            >
              {selected}
            </span>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <BiArrowToBottom
              className={`material-symbols-outlined white absolute right-3 top-2 text-base ${
                props.disabled ? 'hidden' : 'block'
              }`}
            ></BiArrowToBottom>
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-20 max-h-60 w-full overflow-auto bg-white text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {items.map((item, index) => {
              if (typeof item === 'string' && item === CASSIE_AI_TEXT) {
                return (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `} relative cursor-default select-none border-[0.5px] border-solid border-gray-300 bg-[#FAF2FE] py-3 pl-5
                        pr-4 hover:bg-purple-100 hover:text-purple-900`
                    }
                    value={item}
                  >
                    {({ selected }) => (
                      <div className="flex items-center gap-x-2">
                        {/* <span className="material-symbols-outlined text-md text-primary-700">partly_cloudy_night</span> */}
                        <img src="logos/ai_logo.svg" alt="" />
                        <span
                          className={`block truncate text-base font-black text-primary-700`}
                        >
                          {item}
                        </span>
                      </div>
                    )}
                  </Listbox.Option>
                );
              } else {
                return (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `relative cursor-default select-none border-[0.5px] border-solid border-gray-300 py-2 pl-5 pr-4 ${
                        active
                          ? 'bg-purple-100 text-purple-900'
                          : 'text-gray-900'
                      }`
                    }
                    value={item?.id ? item?.id : item}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {item?.name ? item?.name : item}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                );
              }
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
