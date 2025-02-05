'use client';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';
import { RiAddFill, RiArrowRightLine } from 'react-icons/ri';
import { FilePondComponent } from './FilePondComponent';

export default function ArticleUploader({ userId }: { userId: string }) {
  let [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={open}
        className="flex items-center justify-center px-4 py-2 gap-x-1 text-xs border-slate-200 border-solid border"
      >
        Upload Articles <RiAddFill />
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
          <div className="flex min-h-full items-center justify-center p-4 ">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 shadow-md shadow-black/10 shadow-"
            >
              <DialogTitle
                as="h3"
                className="text-lg/7 font-medium text-slate-900"
              >
                Upload Articles
              </DialogTitle>
              <p className="mb-2 text-xs/4 text-slate-900/80">
                With your article we can generate a map of its references for
                you.
              </p>
              <FilePondComponent userId={userId}></FilePondComponent>
              <div className="mt-4">
                <Button
                  className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-xs/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
                  onClick={close}
                >
                  Generate Map
                  <RiArrowRightLine />
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
