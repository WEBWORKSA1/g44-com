/* G44.com settings. Edit values here; no other file needs to change. */
window.G44_CONFIG = {
  /* Form inbox, stored encoded and decoded only at the moment a form is sent. Do not replace with plain text. */
  inbox: [107, 102, 98, 134, 135, 108, 108, 157, 104, 65, 82, 96, 151, 104, 153, 102, 41, 109, 158, 133],
  /* After FormSubmit activation, paste the random alias it gives you (for example "a1b2c3d4e5f6").
     When set, it replaces the inbox in every request. */
  formAlias: "",
  formEndpoint: "https://formsubmit.co/ajax/",

  /* AdSense display-unit slot IDs. Leave blank until approved; Auto ads work without them. */
  adSlots: { "in-content": "", "sidebar": "", "home-mid": "" },

  /* Payment links for the Support page. When blank, the page collects a pledge and you reply with a link. */
  donate: {
    paypal: "",        /* e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX */
    stripe: "",        /* e.g. https://buy.stripe.com/XXXX (one-time) */
    stripeMonthly: "", /* e.g. https://buy.stripe.com/YYYY (monthly) */
    bmc: ""            /* e.g. https://buymeacoffee.com/yourname */
  },

  /* Contest prizes shown on the Contests page. */
  contest: {
    prize: "US$100 gift card",
    runnerUp: "Two US$25 gift cards",
    sponsor: ""
  },

  /* Partner links. Blank = the page links to our own guide instead. */
  affiliates: { device: "", glasses: "", tracker: "" },

  /* Weather data for the pressure outlook. Open-Meteo is free for non-commercial use;
     switch to your commercial endpoint once the site earns. */
  weatherApi: "https://api.open-meteo.com/v1/forecast",
  geoApi: "https://geocoding-api.open-meteo.com/v1/search",

  cookieNotice: true
};
