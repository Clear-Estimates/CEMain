  var Webflow = Webflow || [];
  Webflow.push(function() {
    $(document).off('submit');
    $(document).ready(function () {

    // create a date estimate for the subscription trial end date
    function addMonths(numOfMonths, date = new Date()) {
          date.setMonth(date.getMonth() + numOfMonths);
        
          return date;
      };
      
      let newDate = addMonths(1);
      const estimateMonth = newDate.toLocaleString('default', { month: 'short' });
      
      let dateStringText = `${estimateMonth} ${newDate.getDate()}, ${newDate.getFullYear()}`
           
      const dateSpan = $('.trial-estimate-date');
      dateSpan.text(dateStringText);
    // end trial end date estimate calculation

    $('#phone').mask('(000) 000-0000', { clearIfNotMatch: true });
    $('#zip').mask('00000-ZZZZ', { translation: { 'Z': { pattern: /[0-9]/, optional: true } } });
    let cntr = {US:"United States of America"};
    let slct = document.querySelector("#country");
    for (const key in cntr) { slct.add(new Option(cntr[key], key), undefined); }
    slct.selectedIndex = 1;
    if (typeof plan_id === 'undefined' || plan_id === null) {
        console.log('plan_id is missing.');
    }
    var cedomain = "https://newsite.clearestimates.com";
    var ceproxydomain = "https://webflow.clearestimates.com/ce-chargebee/subscriptions";
    var cbInstance = Chargebee.init({
        site: "clearestimates",
        publishableKey: "live_3V5PE3cn04MqdLrPbcdoPS4yeafoxX1aK",
        domain: cedomain
    });
    var options = {currency: 'USD',fonts:['https://fonts.googleapis.com/css2?family=Inter&display=swap'],classes:{focus:'focus',invalid:'invalid',empty:'empty',complete:'complete'},placeholder:{number:'1111 1111 1111 1111',expiry:'MM / YY',cvv:'CVV'},style:{base:{color:'#333',fontWeight:'400',fontFamily:'Inter, sans-serif',fontSize:'16px',fontSmoothing:'antialiased',lineHeight:'19px','::placeholder':{color:'#828282'}},invalid:{color:'#E94745',':focus':{color:'#e44d5f'},'::placeholder':{color:'#FFCCA5'}}}};
    cbInstance.load("components").then(() => {
        var cardComponent = cbInstance.createComponent("card", options);
        var numberField = cardComponent.createField("number").at("#card-number");
        var expiryField = cardComponent.createField("expiry").at("#card-expiry");
        var cvvField = cardComponent.createField("cvv").at("#card-cvv");
        numberField.on('change', (currentState) => {
          $("#card-number-error").css("display", "none");
          if(currentState.error) {
            $("#card-number-error").text(currentState.error.message);
            $("#card-number-error").css("display", "block");
          }
        });
        expiryField.on('change', (currentState) => {
          $("#card-expiry-error").css("display", "none");
          if(currentState.error) {
            $("#card-expiry-error").text(currentState.error.message);
            $("#card-expiry-error").css("display", "block");
          }
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
        if (data.address2 !== "") {
            user.billingAddr2 = data.address2;
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        cardComponent.tokenize().then(response => {
            $("#submit-button").removeClass("submit");
            var par = new URLSearchParams();
            par.append("plan_id", plan_id);
            par.append("customer[first_name]", data.first_name);
            par.append("customer[last_name]", data.last_name);
            par.append("customer[email]", data.email);
            par.append("customer[cf_business_type]", data.business_type);
            if(data.phone !== "") par.append("customer[phone]", data.phone);
            par.append("billing_address[first_name]", data.first_name);
            par.append("billing_address[last_name]", data.last_name);
            par.append("billing_address[line1]", data.address);
            if(data.address2 !== "") par.append("billing_address[line2]", data.address2);
            par.append("billing_address[city]", data.city);
            par.append("billing_address[state]", data.state);
            par.append("billing_address[zip]", data.zip);
            par.append("billing_address[country]", data.country);
            par.append("customer[auto_collection]", "on");
            if (data.coupon !== "") {
                par.append("coupon", data.coupon);
            }
            par.append("token_id", response.token);
            // List possible parameters to look for
            let extraParamArray = [
                'utm_device',
                'utm_medium',
                'utm_source',
                'utm_term',
                'utm_content',
                'utm_campaign',
                'utm_adgroup'];
            // get utm parameters and other information as needed from purser which is installed on all pages of the site
            const purserObject = window.purser.fetch();
            // loop through array of possible parameters from the purser object
            extraParamArray.forEach((x) => {
                // check that the property exists, then append its value to the url along with other variables. In chargebee they are prepended with 'cf_' for 'custom field'
                purserObject.hasOwnProperty(x) && par.append(`cf_${x}`, purserObject[x])
            })
            let requestOptions = { method: 'POST', headers: myHeaders, body: par };
            fetch(ceproxydomain, requestOptions)
              .then(response => {
                  if (!response.ok) {
                      response.json().then(j => {
                          if (j.error_param == "coupon" || j.param == "coupon") {
                              $("#coupon-error").css("display", "block");
                          }
                      });
                      throw new Error("HTTP status " + response.status);
                  }
              }).then(result => {
              //$("#checkout-form").hide();
              //$("#success").show();
              window.location.href = cedomain + "/subscribe/success";
            }).catch(error => {
              $("#submit-button").removeClass("submit");
              $("#error").show();
              console.log("Post Subscription Error: ",error);
            });
          }).catch(error => {
            $("#submit-button").removeClass("submit");
            $("#error").show();
            console.log("Tokenize() Error: ",error);
          });
        })
      });
    });
  });