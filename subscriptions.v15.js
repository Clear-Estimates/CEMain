  var Webflow = Webflow || [];
  Webflow.push(function() {
    $(document).off('submit');
    $(document).ready(function() {
    let cntr = {US:"United States of America"};
    let slct = document.querySelector("#country");
    for (const key in cntr) { slct.add(new Option(cntr[key], key), undefined); }
    slct.selectedIndex = 1;
    var cbInstance = Chargebee.init({
        site: "clearestimates-test",
        publishableKey: "test_IGqLcu0CiVF680fn1s5BQNU8LxgycVDyQ",
        domain: "https://newsite.clearestimates.com"//"https://clear-estimates.webflow.io"
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
            console.log('Token:' + response.token + ", Response: " + response);
            $("#submit-button").removeClass("submit");
            var par = new URLSearchParams();
            par.append("plan_id", "ce-annual");
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
            par.append("customer[auto_collection]", "on");
            if(data.coupon !== "") par.append("coupon", data.coupon);
            //par.append("card[tmp_token]", response.token);
            par.append("token_id", response.token);
            let requestOptions = { method: 'POST', headers: myHeaders, body: par };
            //fetch("https://webflow.clearestimates.com/ce-chargebee/subscriptions", requestOptions)
            fetch("https://clearestimates-test.chargebee.com/api/v2/subscriptions", requestOptions)
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