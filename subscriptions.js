  var Webflow = Webflow || [];
  Webflow.push(function() {
    $(document).off('submit');
    $(document).ready(function() {
    let cntr = {AD:"Andorra",AE:"United Arab Emirates",AF:"Afghanistan",AG:"Antigua and Barbuda",AI:"Anguilla",AL:"Albania",AM:"Armenia",AO:"Angola",AQ:"Antarctica",AR:"Argentina",AS:"American Samoa",AT:"Austria",AU:"Australia",AW:"Aruba",AX:"Åland Islands",AZ:"Azerbaijan",BA:"Bosnia and Herzegovina",BB:"Barbados",BD:"Bangladesh",BE:"Belgium",BF:"Burkina Faso",BG:"Bulgaria",BH:"Bahrain",BI:"Burundi",BJ:"Benin",BL:"Saint Barthélemy",BM:"Bermuda",BN:"Brunei Darussalam",BO:"Bolivia, Plurinational State of",BQ:"Bonaire, Sint Eustatius and Saba",BR:"Brazil",BS:"Bahamas",BT:"Bhutan",BV:"Bouvet Island",BW:"Botswana",BY:"Belarus",BZ:"Belize",CA:"Canada",CC:"Cocos (Keeling) Islands",CD:"Congo, Democratic Republic of the",CF:"Central African Republic",CG:"Congo",CH:"Switzerland",CI:"Côte d'Ivoire",CK:"Cook Islands",CL:"Chile",CM:"Cameroon",CN:"China",CO:"Colombia",CR:"Costa Rica",CU:"Cuba",CV:"Cabo Verde",CW:"Curaçao",CX:"Christmas Island",CY:"Cyprus",CZ:"Czechia",DE:"Germany",DJ:"Djibouti",DK:"Denmark",DM:"Dominica",DO:"Dominican Republic",DZ:"Algeria",EC:"Ecuador",EE:"Estonia",EG:"Egypt",EH:"Western Sahara",ER:"Eritrea",ES:"Spain",ET:"Ethiopia",FI:"Finland",FJ:"Fiji",FK:"Falkland Islands (Malvinas)",FM:"Micronesia, Federated States of",FO:"Faroe Islands",FR:"France",GA:"Gabon",GB:"United Kingdom of Great Britain and Northern Ireland",GD:"Grenada",GE:"Georgia",GF:"French Guiana",GG:"Guernsey",GH:"Ghana",GI:"Gibraltar",GL:"Greenland",GM:"Gambia",GN:"Guinea",GP:"Guadeloupe",GQ:"Equatorial Guinea",GR:"Greece",GS:"South Georgia and the South Sandwich Islands",GT:"Guatemala",GU:"Guam",GW:"Guinea-Bissau",GY:"Guyana",HK:"Hong Kong",HM:"Heard Island and McDonald Islands",HN:"Honduras",HR:"Croatia",HT:"Haiti",HU:"Hungary",ID:"Indonesia",IE:"Ireland",IL:"Israel",IM:"Isle of Man",IN:"India",IO:"British Indian Ocean Territory",IQ:"Iraq",IR:"Iran, Islamic Republic of",IS:"Iceland",IT:"Italy",JE:"Jersey",JM:"Jamaica",JO:"Jordan",JP:"Japan",KE:"Kenya",KG:"Kyrgyzstan",KH:"Cambodia",KI:"Kiribati",KM:"Comoros",KN:"Saint Kitts and Nevis",KP:"Korea, Democratic People's Republic of",KR:"Korea, Republic of",KW:"Kuwait",KY:"Cayman Islands",KZ:"Kazakhstan",LA:"Lao People's Democratic Republic",LB:"Lebanon",LC:"Saint Lucia",LI:"Liechtenstein",LK:"Sri Lanka",LR:"Liberia",LS:"Lesotho",LT:"Lithuania",LU:"Luxembourg",LV:"Latvia",LY:"Libya",MA:"Morocco",MC:"Monaco",MD:"Moldova, Republic of",ME:"Montenegro",MF:"Saint Martin, (French part)",MG:"Madagascar",MH:"Marshall Islands",MK:"North Macedonia",ML:"Mali",MM:"Myanmar",MN:"Mongolia",MO:"Macao",MP:"Northern Mariana Islands",MQ:"Martinique",MR:"Mauritania",MS:"Montserrat",MT:"Malta",MU:"Mauritius",MV:"Maldives",MW:"Malawi",MX:"Mexico",MY:"Malaysia",MZ:"Mozambique",NA:"Namibia",NC:"New Caledonia",NE:"Niger",NF:"Norfolk Island",NG:"Nigeria",NI:"Nicaragua",NL:"Netherlands",NO:"Norway",NP:"Nepal",NR:"Nauru",NU:"Niue",NZ:"New Zealand",OM:"Oman",PA:"Panama",PE:"Peru",PF:"French Polynesia",PG:"Papua New Guinea",PH:"Philippines",PK:"Pakistan",PL:"Poland",PM:"Saint Pierre and Miquelon",PN:"Pitcairn",PR:"Puerto Rico",PS:"Palestine, State of",PT:"Portugal",PW:"Palau",PY:"Paraguay",QA:"Qatar",RE:"Réunion",RO:"Romania",RS:"Serbia",RU:"Russian Federation",RW:"Rwanda",SA:"Saudi Arabia",SB:"Solomon Islands",SC:"Seychelles",SD:"Sudan",SE:"Sweden",SG:"Singapore",SH:"Saint Helena, Ascension and Tristan da Cunha",SI:"Slovenia",SJ:"Svalbard and Jan Mayen",SK:"Slovakia",SL:"Sierra Leone",SM:"San Marino",SN:"Senegal",SO:"Somalia",SR:"Surin",SS:"South Sudan",ST:"Sao Tome and Principe",SV:"El Salvador",SX:"Sint Maarten, (Dutch part)",SY:"Syrian Arab Republic",SZ:"Eswatini",TC:"Turks and Caicos Islands",TD:"Chad",TF:"French Southern Territories",TG:"Togo",TH:"Thailand",TJ:"Tajikistan",TK:"Tokelau",TL:"Timor-Leste",TM:"Turkmenistan",TN:"Tunisia",TO:"Tonga",TR:"Turkey",TT:"Trinidad and Tobago",TV:"Tuvalu",TW:"Taiwan, Province of China",TZ:"Tanzania, United Republic of",UA:"Ukraine",UG:"Uganda",UM:"United States Minor Outlying Islands",US:"United States of America",UY:"Uruguay",UZ:"Uzbekistan",VA:"Holy See",VC:"Saint Vincent and the Grenadines",VE:"Venezuela, Bolivarian Republic of",VG:"Virgin Islands, British",VI:"Virgin Islands, U.S.",VN:"Viet Nam",VU:"Vanuatu",WF:"Wallis and Futuna",WS:"Samoa",YE:"Yemen",YT:"Mayotte",ZA:"South Africa",ZM:"Zambia",ZW:"Zimbabwe"};
      let slct = document.querySelector("#country");
      for (const key in cntr) slct.add(new Option(cntr[key],key),undefined);
      var cbInstance = Chargebee.init({
        site: "clearestimates-test",
        publishableKey: "test_IGqLcu0CiVF680fn1s5BQNU8LxgycVDyQ",
        domain: "https://clear-estimates.webflow.io"
      });
      var options={fonts:['https://fonts.googleapis.com/css2?family=Inter&display=swap'],classes:{focus:'focus',invalid:'invalid',empty:'empty',complete:'complete'},placeholder:{number:'1111 1111 1111 1111',expiry:'MM / YY',cvv:'CVV'},style:{base:{color:'#333',fontWeight:'400',fontFamily:'Inter, sans-serif',fontSize:'16px',fontSmoothing:'antialiased',lineHeight:'19px','::placeholder':{color:'#828282'}},invalid:{color:'#E94745',':focus':{color:'#e44d5f'},'::placeholder':{color:'#FFCCA5'}}}};
      cbInstance.load("components").then(() => {
        var cardComponent = cbInstance.createComponent("card", options);
        var numberField = cardComponent.createField("number").at("#card-number");
        var expiryField = cardComponent.createField("expiry").at("#card-expiry");
        var cvvField = cardComponent.createField("cvv").at("#card-cvv");
        numberField.on('focus', () => {
          console.log("Number field focused");
        });
        numberField.on('change', (currentState) => {
          $("#card-number-error").css("display", "none");
          if(currentState.error) {
            $("#card-number-error").text(currentState.error.message);
            $("#card-number-error").css("display", "block");
          }
        });
        expiryField.on('focus', () => {
          console.log("Expiry field focused");
        });
        expiryField.on('change', (currentState) => {
          $("#card-expiry-error").css("display", "none");
          if(currentState.error) {
            $("#card-expiry-error").text(currentState.error.message);
            $("#card-expiry-error").css("display", "block");
          }
        });
        cvvField.on('focus', () => {
          console.log("CVV field focused");
        });
        cvvField.on('change', (currentState) => {
          $("#card-cvv-error").css("display", "none");
          if(currentState.error) {
            $("#card-cvv-error").text(currentState.error.message);
            $("#card-cvv-error").css("display", "block");
          }
        });
        cardComponent.mount();
        $("#coupon").focus(function(){ $("#coupon").val(""); $("#coupon-error").css("display", "none");});
        $("#checkout-form").on("submit", function(event) {
          event.preventDefault();
          $("#submit-button").addClass("submit");
          $("#error").hide();
          const data = Object.fromEntries(new FormData(event.target).entries());
          let user = {firstName:data.first_name,lastName:data.last_name,billingAddr1:data.address,billingCity:data.city,billingState:data.state,billingZip:data.zip,billingCountry:data.country};
          if(data.address2 !== "") user.billingAddr2 = data.address2;
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
          cardComponent.tokenize(user).then(response => {
            $("#submit-button").removeClass("submit");
            var par = new URLSearchParams();
            par.append("plan_id", "ce-monthly");
            par.append("customer[first_name]", data.first_name);
            par.append("customer[last_name]", data.last_name);
            par.append("customer[email]", data.email);
            if(data.phone !== "") par.append("customer[phone]", data.phone);
            par.append("billing_address[first_name]", data.first_name);
            par.append("billing_address[last_name]", data.last_name);
            par.append("billing_address[line1]", data.address);
            if(data.address2 !== "") par.append("billing_address[line2]", data.address2);
            par.append("billing_address[city]", data.city);
            par.append("billing_address[state]", data.state);
            par.append("billing_address[zip]", data.zip);
            par.append("billing_address[country]", data.country);
            par.append("customer[auto_collection]", "off");
            if(data.coupon !== "") par.append("coupon", data.coupon);
            par.append("card[tmp_token]", response.token);            
            let requestOptions={method:'POST',headers:myHeaders,body:par};
            fetch("https://webflow.clearestimates.com/ce-chargebee/subscriptions", requestOptions)
              .then(response => {
              let json = response.json();
              console.log(json);
              if (!response.ok) {
                console.log(response);
                if(response.error_param == "coupon") {
                  $("#coupon-error").css("display", "block");
                }
                throw new Error("HTTP status " + response.status);
              }
              return json;
            }).then(result => {
              $("#checkout-form").hide();
              $("#success").show();
              console.log(result);
            }).catch(error => {
              $("#submit-button").removeClass("submit");
              $("#error").show();
              console.log("Error",error);
            });
          }).catch(error => {
            $("#submit-button").removeClass("submit");
            $("#error").show();
            console.log("Error",error);
          });
        })
      });
    });
  });
