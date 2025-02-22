/* eslint-disable complexity */

/* eslint-disable max-lines-per-function */

/* eslint-disable max-statements */
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_LEAD_FORM } from "@gm-graphql/mutations/campaign";
import { GET_FORMS } from "@gm-graphql/queries/campaign";
import { getSelectedFacebookAdAccount, getSelectedFacebookPage } from "@gm-lib/campaign";
import { styles } from "@gm-styles/styles";
import { Disclosure, Menu, RadioGroup, Transition } from "@headlessui/react";
import { Spinner, Switch } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

const CreateFormStep = (props) => {
  const pageId = getSelectedFacebookPage(props?.campaign)?.id || "";
  const {
    loading,
    data: leadFormsData,
    refetch: refetchForms,
  } = useQuery(GET_FORMS, {
    variables: {
      pageId,
    },
  });
  const formObject = props.campaign?.leadFormDraft || {};
  const forms = [
    {
      body: "Use a form thats quick to fill in and submit on a mobile device.",
      icon: "donut_large",
      key: "volume",
      title: "More volume",
    },
    {
      body: "Add a review step that gives people a chance to confirm that information.",
      icon: "person_search",
      key: "intent",
      title: "Higher intent",
    },
  ];

  const setCampaignForm = async (data) => {
    await props.updateCampaign({
      destination: {
        ...props.campaign.destination,
        leadValue: data,
      },
    });
    setSelectedForm(data);
    const adAccountId = getSelectedFacebookAdAccount(props?.campaign)?.id;
    const pageId = getSelectedFacebookPage(props?.campaign)?.id;
    props.refetchPreview(props?.campaign, adAccountId, pageId);
  };

  const updateCreatedFormObject = async (data) => {
    props.updateCampaign({
      leadFormDraft: data,
    });
  };

  const searchForms = async (query) => {
    if (query === "") return setLeadForms(leadFormsData.forms);
    const queriedForms = leadForms.filter((form) => form.name.toUpperCase().includes(query.toUpperCase()));
    setLeadForms(queriedForms);
  };

  const checkIfInputHasTooManyCharacters = (input, limit) => {
    return input.length > limit;
  };

  useEffect(() => {
    if (formObject?.formName === "" && formObject?.questions?.length < 1) {
      formObject.questions = [
        {
          question: "Full Name",
          tag: "contact information",
        },
        {
          question: "Email",
          tag: "contact information",
        },
        {
          question: "Phone",
          tag: "contact information",
        },
      ];
      updateCreatedFormObject(formObject);
    }
  }, [formObject]);

  const [selectedFormType, setselectedFormType] = useState(formObject.formType || "volume");
  const [selectedForm, setSelectedForm] = useState(props.campaign.destination.leadValue || "");
  const [pastForm, setPastForm] = useState(true);
  const [formName, setFormName] = useState(formObject.formName || "");
  const [formType, setFormType] = useState();
  const [greetingHeadline, setGreetingHeadline] = useState(formObject.greetingHeadline || "");
  const [greetingDescription, setGreetingDescription] = useState(formObject.greetingDescription || "");
  const [formNameInput] = useDebounce(formName, 500);
  const [headlineInput] = useDebounce(greetingHeadline, 500);
  const [greetinDescriptionInput] = useDebounce(greetingDescription, 500);
  const [useGreeting, setUseGreeting] = useState(formObject.greeting);
  const [loadingStage, setLoadingStage] = useState("default");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    formObject.formName = formName;
    formObject.greetingHeadline = greetingHeadline;
    formObject.greetingDescription = greetingDescription;
    formObject.formType = selectedFormType;
    formObject.greeting = useGreeting;
    updateCreatedFormObject(formObject);
  }, [formNameInput, headlineInput, greetinDescriptionInput, selectedFormType, useGreeting]);

  const [steps, setSteps] = useState([
    { name: "Step 1", href: "#", status: "current" },
    { name: "Step 2", href: "#", status: "upcoming" },
    { name: "Step 3", href: "#", status: "upcoming" },
    { name: "Step 4", href: "#", status: "upcoming" },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [moving, setMoving] = useState("right");

  const prevStep = () => {
    setMoving("left");
    setSteps((old) =>
      old.map((v, i) => {
        if (i === currentStep) {
          v.status = "upcoming";
        } else if (i === currentStep - 1) {
          v.status = "current";
        }
        return v;
      })
    );
    setCurrentStep(currentStep - 1);
    return false;
  };

  const nextStep = async () => {
    setMoving("right");
    setSteps((old) =>
      old.map((v, i) => {
        if (i === currentStep) {
          v.status = "complete";
        } else if (i === currentStep + 1) {
          v.status = "current";
        }
        return v;
      })
    );
    setCurrentStep(currentStep + 1);
    return false;
  };

  const [leadForms, setLeadForms] = useState([]);
  const [createForm] = useMutation(CREATE_LEAD_FORM);

  const handleFormCreation = async () => {
    setLoadingStage("creatingForm");
    const newForm = await createForm({
      variables: {
        formName: formObject.formName,
        formFields: JSON.stringify(formObject),
        pageId,
      },
    });
    if (!newForm.data.createLeadForm.error_code) {
      await refetchForms();
      props.updateCampaign({
        destination: {
          leadValue: newForm.data.createLeadForm.id,
        },
      });
      updateCreatedFormObject({
        formName: "",
        formType: "volume",
        greeting: true,
        greetingHeadline: "",
        greetingDescription: "",
        questions: [],
        privacyPolicyUrl: "",
        customDisclaimers: [],
        headline: "",
        description: "",
        callToActionText: "",
        link: "",
      });
      setSelectedForm(newForm.data.createLeadForm.id);
      setCurrentStep(0);
      setPastForm(true);
    } else {
      setErrorMessage(newForm.data.createLeadForm.error_message);
    }
    setLoadingStage("default");
  };

  useEffect(() => {
    if (leadFormsData !== undefined && leadFormsData.leadForms !== null) {
      setLeadForms(leadFormsData.forms);
    }
  }, [loading]);

  return (
    <div>
      <Transition
        appear={false}
        unmount={false}
        show={currentStep === 0}
        enter="transform transition ease-in-out duration-500"
        enterFrom={moving === "right" ? `translate-x-96 opacity-0` : `-translate-x-96 opacity-0`}
        enterTo={`translate-x-0 opacity-100`}
        leave="transform transition ease-in-out duration-500 "
        leaveFrom={`translate-x-0 opacity-100`}
        leaveTo={moving === "right" ? `-translate-x-full opacity-0` : `translate-x-full opacity-0`}
        as="div"
        className="overflow-visible"
      >
        <p className="mb-5">
          You can start by selecting a previously created form. Alternatively, you can turn the toggle off, and create a
          form.
        </p>
        <div className="flex items-center gap-x-2">
          <Switch checked={pastForm} onChange={() => setPastForm(!pastForm)} color="green" />
          <p className="font-bold text-gray-600">Use a past form</p>
        </div>
        <div className={`${pastForm ? "block" : "hidden"}`}>
          <div className="mt-4 flex items-center">
            <span className="material-symbols-outlined absolute ml-2 text-lg text-gray-700">search</span>
            <input
              className={`${styles.inputBox} pl-8`}
              id="billing_name"
              onChange={(e) => searchForms(e.target.value)}
              placeholder="Search past forms"
              type="text"
            />
          </div>
          <div className="bg-gray-100 pt-3">
            <h3 className="text-sm font-bold uppercase text-gray-600">{leadForms?.length} Ad Forms</h3>
            {leadForms?.map((form, index) => (
              <div
                className="mt-2 flex cursor-pointer items-center rounded-md border border-solid border-gray-400 bg-white px-3 py-2"
                key={index}
                onClick={() => setCampaignForm(form.id)}
              >
                <span className="material-symbols-outlined mr-2 text-xl text-gray-700">
                  {selectedForm !== form.id ? "radio_button_unchecked" : "radio_button_checked"}
                </span>
                <div>
                  <p className="font-bold text-blue-900">{form.name}</p>
                  {/* <p>3 days ago</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${!pastForm ? "block" : "hidden"}`}>
          <hr className="my-5 h-px border-0 bg-gray-400"></hr>
          <p className="mt-2 font-semibold">Form name</p>
          <input
            className={`${styles.inputBox}`}
            id="billing_name"
            placeholder="Enter a Form Name"
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <h3 className="mb-2 mt-3 text-sm font-bold uppercase tracking-widest text-gray-600">Form Type</h3>
          <div className="w-full">
            <div className="">
              <RadioGroup onChange={(e) => setselectedFormType(e.key)} value={selectedFormType}>
                <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
                <div className="flex gap-x-2">
                  {forms.map((plan, index) => (
                    <RadioGroup.Option
                      className={({ active, checked }) =>
                        `flex basis-1/2 cursor-pointer items-center gap-x-2 rounded-md border border-solid p-3 shadow-md hover:bg-blue-100
                    ${selectedFormType === plan.key ? "border-blue-900" : "border-gray-400"}`
                      }
                      key={index}
                      value={plan}
                    >
                      {({ active, checked }) => (
                        <>
                          <div className="relative">
                            <div className="flex items-center gap-x-1">
                              <span className="material-symbols-outlined text-base text-blue-800">{plan.icon}</span>
                              <RadioGroup.Label as="p" className="font-medium text-gray-1000">
                                {plan.title}
                              </RadioGroup.Label>
                              <span className="material-symbols-outlined text-base text-gray-800">info</span>
                            </div>
                            <RadioGroup.Description
                              as="span"
                              className={`inline ${selectedFormType === plan.key ? "text-sky-100" : "text-gray-600"}`}
                            >
                              <p className="pt-1">{plan.body}</p>
                            </RadioGroup.Description>
                            <span
                              className={`material-symbols-outlined absolute right-0 top-0 text-lg text-blue-900 ${
                                selectedFormType === plan.key ? "block" : "hidden"
                              }`}
                            >
                              check_circle
                            </span>
                          </div>
                        </>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>
            </div>
            <div className="mb-2 mt-5 flex items-center gap-x-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Greeting (Recommended)</h3>
              <Switch checked={useGreeting} onChange={() => setUseGreeting(!useGreeting)} color="green" />
            </div>
            {useGreeting && (
              <>
                <div className="relative">
                  <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
                    Enter a short headline
                  </label>
                  <input
                    className={`${styles.inputBox} mb-2 ${
                      checkIfInputHasTooManyCharacters(greetingHeadline, 60) ? "border-red-600" : ""
                    }`}
                    placeholder="Enter a short headline"
                    value={greetingHeadline}
                    onChange={(e) => {
                      setGreetingHeadline(e.target.value);
                    }}
                  ></input>
                  <span className="absolute right-3 mt-2.5 text-xs text-gray-500">{greetingHeadline.length}/60</span>
                </div>
                <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
                  Description
                </label>
                <textarea
                  className={`${styles.inputBox}`}
                  placeholder="Include additional details"
                  value={greetingDescription}
                  onChange={(e) => setGreetingDescription(e.target.value)}
                ></textarea>
              </>
            )}
          </div>
        </div>
      </Transition>

      <FormPage
        show={currentStep === 1}
        moving={moving}
        page={<PageTwo formObject={formObject} updateForm={updateCreatedFormObject} />}
      />
      <FormPage
        show={currentStep === 2}
        moving={moving}
        page={<PageThree formObject={formObject} updateForm={updateCreatedFormObject} />}
      />

      <div
        className={`flex w-full ${currentStep === 0 ? "justify-end" : "justify-between"} pt-5 ${
          pastForm ? "hidden" : "block"
        }`}
      >
        {currentStep > 0 && (
          <button onClick={() => prevStep()} className="flex items-center text-xs font-bold text-gray-1000">
            <span className="material-symbols-outlined text-base font-bold">chevron_left</span>
            <p>Back</p>
          </button>
        )}
        {currentStep < 2 && (
          <button
            onClick={() => nextStep()}
            className="text-md flex items-center gap-x-2 rounded-full bg-blue-1000 px-4 py-2 font-bold text-white"
          >
            <p>Continue</p>
            <span className="material-symbols-outlined text-base font-bold">chevron_right</span>
          </button>
        )}
        {currentStep === 2 && (
          <div>
            {loadingStage === "default" && (
              <div className="flex items-center gap-x-3">
                <p className="text-red-600">{errorMessage}</p>
                <button
                  className="text-md flex items-center gap-x-2 rounded-full bg-primary-700 px-4 py-2 font-bold text-white"
                  onClick={() => handleFormCreation()}
                >
                  <p>Finish</p>
                  <span className="material-symbols-outlined text-base font-bold">chevron_right</span>
                </button>
              </div>
            )}
            {loadingStage === "creatingForm" && <Spinner color="purple" size="large" />}
          </div>
        )}
      </div>
    </div>
  );
};

const FormPage = (props) => {
  return (
    <Transition
      appear={false}
      unmount={false}
      show={props.show}
      enter="transform transition ease-in-out duration-500"
      enterFrom={props.moving ? `translate-x-96 opacity-0` : `-translate-x-96 opacity-0`}
      enterTo={`translate-x-0 opacity-100`}
      leave="transform transition ease-in-out duration-500 "
      leaveFrom={`translate-x-0 opacity-100`}
      leaveTo={props.moving ? `-translate-x-96 opacity-0` : `translate-x-96 opacity-0`}
      className="w-full overflow-visible"
      as="div"
    >
      {props.page}
    </Transition>
  );
};

const PageTwo = (props) => {
  const formObject = props.formObject;
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(formObject.privacyPolicyUrl || "");
  const [privacyPolicyUrlInput] = useDebounce(privacyPolicyUrl, 500);
  const questions = formObject.questions || [];
  const desclaimers = formObject.disclaimers || [];
  const [showQuestions, setShowQuestions] = useState(false);
  const questionArray = [
    {
      title: "Contact Information",
      icon: "contact_page",
      questions: [
        { title: "Full Name", id: "full_name", tag: "contact information" },
        { title: "First Name", id: "first_name", tag: "contact information" },
        { title: "Last Name", id: "last_name", tag: "contact information" },
        { title: "Email", id: "email", tag: "contact information" },
        { title: "Phone", id: "phone", tag: "contact information" },
      ],
    },
    {
      title: "Location Information",
      icon: "location_on",
      questions: [
        { title: "City", id: "city", tag: "location information" },
        { title: "Zip", id: "zip", tag: "location information" },
        { title: "Post Code", id: "post_code", tag: "location information" },
        { title: "State", id: "state", tag: "location information" },
        { title: "Country", id: "country", tag: "location information" },
        { title: "Street Address", id: "street_address", tag: "location information" },
      ],
    },
    {
      title: "Work Information",
      icon: "work_outline",
      questions: [
        { title: "Company Name", id: "company_name", tag: "work information" },
        { title: "Work Email", id: "work_email", tag: "work information" },
        { title: "Job Title", id: "job_title", tag: "work information" },
        { title: "Work Phone Number", id: "work_phone", tag: "work information" },
      ],
    },
    {
      title: "Demographic Info",
      icon: "group",
      questions: [
        { title: "Date of Birth", id: "date_of_birth", tag: "demographic info" },
        { title: "Gender", id: "gender", tag: "demographic info" },
        { title: "Maritial Status", id: "maritial_status", tag: "demographic info" },
        { title: "Relationship Status", id: "relationship_status", tag: "demographic info" },
      ],
    },
    {
      title: "Custom",
      icon: "question_answer",
      questions: [
        {
          title: "Custom Question",
          id: "custom_question",
          tag: "custom",
        },
      ],
    },
  ];

  useEffect(() => {
    formObject.privacyPolicyUrl = privacyPolicyUrl;
    props.updateForm(formObject);
  }, [privacyPolicyUrlInput]);

  const addQuestionField = (title, tag) => {
    if (title === "Custom Question") {
      title = "";
    }
    const newQuestions = [...questions];
    newQuestions.push({ question: title, tag });
    formObject.questions = newQuestions;
    props.updateForm(formObject);
    setShowQuestions(false);
  };

  const removeQuestionField = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    formObject.questions = newQuestions;
    props.updateForm(formObject);
  };

  const addDesclaimerField = (title, tag, consents) => {
    const newDesclaimers = [...desclaimers];
    newDesclaimers.push({ title, tag, consents });
    formObject.disclaimers = newDesclaimers;
    props.updateForm(formObject);
  };

  const checkIfQuestionsShouldBeShown = (question) => {
    const questionHasBeenSelectedAlready = questions.some((item) => item.question === question.title);

    if (question.title === "Full Name") {
      const firstNameExists = questions.some((item) => item.question === "First Name");
      const lastNameExists = questions.some((item) => item.question === "Last Name");
      return !(firstNameExists && lastNameExists) && !questionHasBeenSelectedAlready;
    } else if (question.title === "First Name") {
      const fullNameExists = questions.some((item) => item.question === "Full Name");
      return !fullNameExists && !questionHasBeenSelectedAlready;
    } else if (question.title === "Last Name") {
      const fullNameExists = questions.some((item) => item.question === "Full Name");
      return !fullNameExists && !questionHasBeenSelectedAlready;
    } else if (question.tag === "custom") {
      return true;
    } else {
      return !questionHasBeenSelectedAlready;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Questions</h3>
      <button
        className="mb-1 mt-3 flex items-center gap-x-1 rounded-full border border-solid border-black bg-white px-3 text-black hover:border-gm-bg-purple hover:bg-gm-bg-purple hover:text-white"
        onClick={() => setShowQuestions(!showQuestions)}
      >
        <span className="material-symbols-outlined text-xl">add</span>
        <p className="font-bold">Add question</p>
      </button>
      <div className="absolute z-50">
        {showQuestions &&
          questionArray.map((question, index) => {
            return (
              <Menu as="div" className="relative text-left" key={index}>
                <Menu.Button className=" left-0 flex w-60 origin-top-right flex-col divide-y divide-gray-200 border border-solid border-gray-400 bg-white ring-1 ring-black/5 focus:outline-none">
                  <div className="flex w-full items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-x-1">
                      <span className="material-symbols-outlined text-xl text-gray-800">{question.icon}</span>
                      <p className="font-bold text-gray-900">{question.title}</p>
                    </div>
                    <span className="material-symbols-outlined text-xl text-gray-900">arrow_right</span>
                  </div>
                </Menu.Button>
                <Menu.Items className="absolute left-[240px] top-0 flex w-60 origin-top-right flex-col divide-y divide-gray-200  bg-white ring-1 ring-black/5 focus:outline-none">
                  {question.questions.map((q, i) => {
                    if (checkIfQuestionsShouldBeShown(q)) {
                      return (
                        <Menu.Item key={i}>
                          {({ active }) => (
                            <div
                              className="z-50 flex cursor-pointer items-center justify-between gap-x-3 border border-solid !border-gray-400 px-3 py-2 hover:bg-gray-200"
                              onClick={() => addQuestionField(q.title, q.tag)}
                            >
                              <p className="pl-1 font-bold text-gray-900"> {q.title}</p>
                              <span className="material-symbols-outlined text-xl text-gray-800">add</span>
                            </div>
                          )}
                        </Menu.Item>
                      );
                    }
                  })}
                </Menu.Items>
              </Menu>
            );
          })}
      </div>

      {questions.map((question, index) => {
        if (question.tag !== "custom") {
          return (
            <div key={index}>
              {question.tag !== "custom" && (
                <div className="z-90 flex items-center justify-between border-b border-solid border-gray-400 px-3 py-4 shadow-sm">
                  <div className="flex items-center gap-x-2 text-gray-900">
                    {/* <span className="material-symbols-outlined cursor-grab text-xl font-bold">drag_indicator</span> */}
                    <p className="font-semibold">{question.question}</p>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <p className="rounded-full bg-gray-300 px-3 py-1 text-xs font-medium capitalize text-black">
                      {question.tag}
                    </p>
                    <span
                      className="material-symbols-outlined cursor-pointer text-xl font-medium text-gray-900"
                      onClick={() => removeQuestionField(index)}
                    >
                      close
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div key={index}>
              <CustomQuestion
                updateForm={props.updateForm}
                index={index}
                formObject={formObject}
                removeQuestion={removeQuestionField}
                question={question}
              />
            </div>
          );
        }
      })}
      <h3 className="mt-8 text-sm font-bold uppercase tracking-widest text-gray-900">Privacy Policy</h3>
      <p className="mb-5 mt-1 text-gray-800">
        Because you will be collecting customer information, you need to include a link to your company&#39;s privacy
        policy. Your link will appear with Facebook&#39;s default privacy disclaimer.
      </p>
      <input
        className={`${styles.inputBox} boder-solid border border-black`}
        placeholder="Privacy Policy URL"
        type="text"
        value={privacyPolicyUrl}
        onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
      />

      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="relative z-0 mt-8 w-full">
              <div className="flex w-full items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">
                  Custom Disclaimer <span className="text-gray-500">(Optional)</span>
                </h3>

                <span
                  className={`material-symbols-outlined absolute right-0 cursor-default text-base text-gray-900 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  keyboard_arrow_down
                </span>
              </div>
            </Disclosure.Button>
            <Disclosure.Panel>
              {({ active }) => (
                <div>
                  <p className="mb-3 mt-1 text-gray-800">
                    You can add additional notices like marketing opt-ins and legal disclaimers to the default Facebook
                    privacy disclaimer.
                  </p>
                  {desclaimers.length < 1 && (
                    <button
                      className="flex items-center gap-x-1 rounded-full border border-solid border-blue-1000 px-3 py-1 font-bold text-white"
                      onClick={() => addDesclaimerField("", "", [])}
                    >
                      <span className="material-symbols-outlined text-sm font-bold text-blue-1000">add</span>
                      <p className="text-xs text-blue-1000">Add custom disclaimer</p>
                    </button>
                  )}
                  {desclaimers.map((disclaimer, index) => (
                    <div key={index}>
                      <Disclaimer
                        disclaimer={disclaimer}
                        index={index}
                        disclaimers={desclaimers}
                        formObject={formObject}
                        updateForm={props.updateForm}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};

const CustomQuestion = (props) => {
  const formObject = props.formObject;
  const [question, setQuestion] = useState(formObject.questions[props.index].question || "");
  const [questionInput] = useDebounce(question, 500);
  useEffect(() => {
    formObject.questions[props.index] = { question, tag: "custom" };
    props.updateForm(formObject);
  }, [questionInput]);
  return (
    <div className="mt-1 flex items-center justify-between rounded-md border-b border-solid border-gray-400 px-3 py-4 shadow-sm">
      <div className="flex w-[70%] items-center gap-x-2 text-gray-900">
        {/* <span className="material-symbols-outlined cursor-grab text-xl font-bold">drag_indicator</span> */}
        <div className="w-full">
          <label className={`${styles.inputLabel} font-bold text-gray-900`} htmlFor="username">
            Enter Custom Question{" "}
          </label>
          <input
            className={`${styles.inputBox} boder-solid border border-black`}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <p className="rounded-full bg-gray-300 px-3 py-1 text-xs font-medium text-black">Custom</p>
        <span
          className="material-symbols-outlined cursor-pointer text-xl font-medium text-gray-900"
          onClick={() => props.removeQuestion(props.index)}
        >
          close
        </span>
      </div>
    </div>
  );
};

const Disclaimer = (props) => {
  const { disclaimer, index, disclaimers, formObject } = props;
  const [title, setTitle] = useState(disclaimer.title || "");
  const [tag, setTag] = useState(disclaimer.tag || "");
  const [titleInput] = useDebounce(title, 500);
  const [tagInput] = useDebounce(tag, 500);

  useEffect(() => {
    formObject.disclaimers[index] = { title, tag, consents: disclaimer.consents };
    props.updateForm(formObject);
  }, [titleInput, tagInput]);

  const removeDesclaimerField = (index) => {
    const newDesclaimers = [...disclaimers];
    newDesclaimers.splice(index, 1);
    formObject.disclaimers = newDesclaimers;
    props.updateForm(formObject);
  };

  const updateDesclaimerField = (index, title, tag, consents) => {
    const newDesclaimers = [...disclaimers];
    newDesclaimers[index] = { title, tag, consents };
    formObject.disclaimers = newDesclaimers;
    props.updateForm(formObject);
  };

  const addNewConsent = (index, consent) => {
    const newDesclaimers = [...disclaimers];
    newDesclaimers[index].consents.push(consent);
    formObject.disclaimers = newDesclaimers;
    props.updateForm(formObject);
  };

  return (
    <div className="mt-5">
      <label className={`${styles.inputLabel} font-bold text-gray-900`}>Title</label>
      <input
        className={`${styles.inputBox} boder-solid border border-black`}
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <label className={`${styles.inputLabel} font-bold text-gray-900`}>Text</label>
      <textarea
        className={`${styles.inputBox} boder-solid border border-black`}
        type="text"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />
      <div className="mt-1 flex justify-between">
        <button
          className="flex items-center gap-x-1 rounded-full border border-solid border-blue-900 px-3 py-1"
          onClick={() => addNewConsent(index, { title: "", optional: false })}
        >
          <span className="material-symbols-outlined text-sm font-bold text-blue-1000">add</span>
          <p className="text-xs text-blue-1000">Add new consent</p>
        </button>
        <button
          className="flex items-center gap-x-1 rounded-full border border-solid border-red-900 px-3 py-1"
          onClick={() => removeDesclaimerField(index)}
        >
          <span className="material-symbols-outlined text-sm font-bold text-red-1000">delete</span>
          <p className="text-xs text-red-1000">Remove disclaimer</p>
        </button>
      </div>
      {disclaimer.consents.map((consent, i) => (
        <div key={i}>
          <Consent
            consent={consent}
            index={index}
            i={i}
            disclaimers={disclaimers}
            formObject={formObject}
            updateForm={props.updateForm}
          />
        </div>
      ))}
    </div>
  );
};

const Consent = (props) => {
  const { consent, index, i, disclaimers, formObject } = props;
  const [title, setTitle] = useState(consent.title || "");
  const [optional, setOptional] = useState(consent.optional);
  const [titleInput] = useDebounce(title, 500);
  const [optionalInput] = useDebounce(optional, 500);
  const removeConsent = (index, i) => {
    const newDesclaimers = [...disclaimers];
    newDesclaimers[index].consents.splice(i, 1);
    formObject.disclaimers = newDesclaimers;
    props.updateForm(formObject);
  };

  const updateConsent = (index, i, title, optional) => {
    const newDesclaimers = [...disclaimers];
    newDesclaimers[index].consents[i] = { title, optional };
    formObject.disclaimers = newDesclaimers;
    props.updateForm(formObject);
  };

  useEffect(() => {
    updateConsent(index, i, title, optional);
  }, [titleInput, optionalInput]);

  return (
    <div className="mt-2 rounded-md px-5 py-3 pb-4 shadow-sm" key={i}>
      <div className="flex items-center justify-between gap-x-5">
        <div className="w-3/4">
          <label className={`${styles.inputLabel} font-bold text-gray-800`}>Consent {i + 1}</label>
          <input
            className={`${styles.inputBox} boder-solid border border-black`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-x-2 pt-4">
          <Switch color="green" value={optional} onChange={() => setOptional(!optional)} />
          <p className="font-bold text-gray-900">Optional</p>
          <span
            className="material-symbols-outlined cursor-pointer pl-1 text-xl text-gray-900"
            onClick={() => removeConsent(index, i)}
          >
            close
          </span>
        </div>
      </div>
    </div>
  );
};

const PageThree = (props) => {
  const formObject = props.formObject;
  const [headline, setHeadline] = useState(formObject.headline || "");
  const [headlineInput] = useDebounce(headline, 500);
  const [description, setDescription] = useState(formObject.description || "");
  const [descriptionInput] = useDebounce(description, 500);
  const [callToAction, setCallToAction] = useState(formObject.callToActionText || "");
  const [callToActionInput] = useDebounce(callToAction, 500);
  const [link, setLink] = useState(formObject.link || "");
  const [linkInput] = useDebounce(link, 500);

  useEffect(() => {
    formObject.headline = headline;
    formObject.description = description;
    formObject.callToActionText = callToAction;
    formObject.link = link;
    props.updateForm(formObject);
  }, [headlineInput, descriptionInput, callToActionInput, linkInput]);

  return (
    <div className="w-full">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-800">Completion</h3>
      <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
        Headline
      </label>
      <input
        className={`${styles.inputBox} boder-solid border border-black`}
        type="text"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Thanks, you’re all set."
      />
      <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
        Description
      </label>
      <textarea
        className={`${styles.inputBox} boder-solid border border-black`}
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="You can visit our website or exit the form now."
      />
      <label className={`${styles.inputLabel} font-semibold text-gray-700`} htmlFor="username">
        Call to action text
      </label>
      <input
        className={`${styles.inputBox} boder-solid border border-black`}
        type="text"
        value={callToAction}
        onChange={(e) => setCallToAction(e.target.value)}
        placeholder="View website"
      />
      <label className={`${styles.inputLabel} font-semibold text-gray-800`} htmlFor="username">
        Link
      </label>
      <input
        className={`${styles.inputBox} boder-solid border border-black`}
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
    </div>
  );
};

export default CreateFormStep;
