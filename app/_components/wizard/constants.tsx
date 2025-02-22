export const objectives = [
  {
    id: "sales",
    icon: "local_offer",
    key: "OUTCOME_SALES",
    label: "Generate sales on your website",
    description: "Direct users to your website, where they can purchase something directly.",
  },
  {
    id: "leads_website",
    destination: "website",
    icon: "group",
    key: "OUTCOME_LEADS",
    label: "Generate leads on your website",
    description: "Drive users to your website where they can fill out a form for you to contact them. ",
  },
  {
    id: "leads_form",
    destination: "form",
    icon: "group",
    key: "OUTCOME_LEADS",
    label: "Generate leads via an instant lead form",
    description: "If you don't have a website, collect user details directly in the app.",
  },
  {
    id: "traffic",
    destination: "website",
    icon: "ssid_chart",
    key: "OUTCOME_TRAFFIC",
    label: "Drive traffic to your website",
    description: "Drive users to your website so to learn more about your business. ",
  },
  {
    id: "leads_phone",
    destination: "phone",
    icon: "group",
    key: "OUTCOME_LEADS",
    label: "Get people to call your business",
    description: "Get users to call your business so they can learn more about your services",
  },
  {
    id: "reach",
    destination: "reach",
    icon: "visibility",
    key: "OUTCOME_AWARENESS",
    label: "Maximise the reach of your ads",
    description: "Spread the word about your business, however minimal clicks or conversions.",
  },
];

export const conversionGoals = [
  {
    goal: "Leads",
    outcome: "OUTCOME_LEADS",
  },
  {
    goal: "Traffic",
    outcome: "OUTCOME_TRAFFIC",
  },
  {
    goal: "Sales",
    outcome: "OUTCOME_SALES",
  },
  {
    goal: "Awareness",
    outcome: "OUTCOME_AWARENESS",
  },
];

export function isJsonStringValid(str) {
  if (str === undefined || str === null || str === "{}") return false;
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function removeTypename(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeTypename(item));
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (key !== "__typename") {
        newObj[key] = removeTypename(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

export const mapConversionOutcomeToGoal = (outcome) => conversionGoals.find((goal) => goal.outcome === outcome)?.goal;

function isValidNumber(str) {
  const floatValue = parseFloat(str);
  return !isNaN(floatValue) && str !== "";
}

export const getLocalStringAsNumber = (str) => {
  if (isValidNumber(str)) {
    const number = parseFloat(str);
    return number.toLocaleString("en-US");
  } else {
    return "";
  }
};
