  var Webflow = Webflow || [];
  Webflow.push(function() {
    $(document).off('submit');
  $(document).ready(function () {
      $('#customPaymentBlock, .custom-payment-buttons').hide();
    var cardComponent;
    var cbRegApiUrl = "https://reg.clearestimates.com/api/chargebee/";
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
    $('#lnk-edit-payment').off('click').on('click', function (e) {
        e.preventDefault();
        $('.paymentinfo .cb-field-wrapper').addClass('hide');
        $('#cardinfoblock').removeClass('hide');
    });
    $('#confirm-email').off('copy paste').on('copy paste', function (e) {
        e.preventDefault();
    });
    $('#confirm-email, #email').off('change').on('change', function () {
        var emailError = false;
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        var email = $('#email').val().trim();
        var confirmemail = $('#confirm-email').val().trim();

        if (email != '' && !regex.test(email)) {
            if ($('#email-error').length == 0) {
                $('#email').css("margin-bottom", "2px");
                $('<div id="email-error"><label style="padding-top:2px;color:#e96c6a;font-size: 14px;margin-bottom: 5px;">Invalid email address</label></div>').insertAfter("#email");
            }
            emailError = true;
        }
        else {
            if ($('#email-error').length > 0) {
                $('#email-error').remove();
                $('#email').css("margin-bottom", "30px");
            }
            emailError = false;
        }

        if (email != '' && confirmemail != '') {
            if (email != confirmemail) {
                if ($('#confirm-email-error').length == 0) {
                    $('#confirm-email').css("margin-bottom", "2px");
                    $('<div id="confirm-email-error"><label style="padding-top:2px;color:#e96c6a;font-size: 14px;margin-bottom: 5px;">Mismatched email address</label></div>').insertAfter("#confirm-email");
                }
                emailError = true;
            }
            else {
                if ($('#confirm-email-error').length > 0) {
                    $('#confirm-email-error').remove();
                    $('#confirm-email').css("margin-bottom", "30px");
                }
                //We will load the custom info from Chargebee using the email
                var cbCustomerApiUrl = cbRegApiUrl + 'getcustomer/' + email;
                $.get(cbCustomerApiUrl, function (data) { //data will have 2 objects (customer, card)
                    if (data != null && data.customer != null && data.card != null) {
                        PopulateFormFields(data);
                        $('.paymentinfo .cb-field-wrapper').addClass('hide');
                        $('#cardinfoblock').removeClass('hide');
                        $('#lnk-edit-payment').removeClass('hide');
                    }
                    else {
                        cardComponent.mount();
                    }
                });
            }
        }
        else if ($('#confirm-email-error').length > 0) {
            $('#confirm-email-error').remove();
            $('#confirm-email').css("margin-bottom", "30px");
        }

        if (emailError) {
            $("#submit-button").prop("disabled", true);
        }
        else {
            $("#submit-button").prop("disabled", false);
        }
    });
    $('#business_type').css("padding-left", "8px");
    $('#phone').mask('(000) 000-0000', { clearIfNotMatch: true });
    $('#zip').mask('00000-ZZZZ', { translation: { 'Z': { pattern: /[0-9]/, optional: true } } });
    let cntr = {US:"United States of America"};
    let slct = document.querySelector("#country");
    for (const key in cntr) { slct.add(new Option(cntr[key], key), undefined); }
    slct.selectedIndex = 1;
    if (typeof plan_id === 'undefined' || plan_id === null) {
        console.log('plan_id is missing.');
    }
    var cedomain = "https://www.clearestimates.com";
    var ceproxydomain = "https://webflow.clearestimates.com/ce-chargebee/subscriptions";
    var cbInstance = Chargebee.init({
        site: "clearestimates",
        publishableKey: "live_3V5PE3cn04MqdLrPbcdoPS4yeafoxX1aK",//"test_IGqLcu0CiVF680fn1s5BQNU8LxgycVDyQ",
        domain: cedomain
    });
    var options = {currency: 'USD',fonts:['https://fonts.googleapis.com/css2?family=Inter&display=swap'],classes:{focus:'focus',invalid:'invalid',empty:'empty',complete:'complete'},placeholder:{number:'1111 1111 1111 1111',expiry:'MM / YY',cvv:'CVV'},style:{base:{color:'#333',fontWeight:'400',fontFamily:'Inter, sans-serif',fontSize:'16px',fontSmoothing:'antialiased',lineHeight:'19px','::placeholder':{color:'#828282'}},invalid:{color:'#E94745',':focus':{color:'#e44d5f'},'::placeholder':{color:'#FFCCA5'}}}};
    cbInstance.load("components").then(() => {
        cardComponent = cbInstance.createComponent("card", options);
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
        $("#checkout-form").off("submit").on("submit", function(event) {
            event.preventDefault();
            $("#submit-button").prop("disabled", true);
            $("#submit-button").addClass("submit");
            $("#error").hide();
            const data = Object.fromEntries(new FormData(event.target).entries());
            let user = {firstName:data.first_name,lastName:data.last_name,billingAddr1:data.address,billingCity:data.city,billingState:data.state,billingZip:data.zip,billingCountry:data.country};
            if (data.address2 !== "") {
                user.billingAddr2 = data.address2;
            }
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            cardComponent.tokenize(user).then(response => {
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
                if (data.company_name !== "") {
                    par.append("customer[company]", data.company_name);
                }
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
                    'utm_adgroup',
                    'gclid'];
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
                        $("#submit-button").prop("disabled", false);
                        if (!response.ok) {
                            response.json().then(j => {
                                if (j.error_param == "coupon" || j.param == "coupon") {
                                    $("#coupon-error").css("display", "block");
                                }
                                console.log('JSON: ' + JSON.stringify(j));
                            });
                            throw new Error("HTTP status " + response.statusText);
                        }
                        else {
                            return response.json();
                        }
                  }).then(result => {
                    window.location.href = cedomain + "/subscribe/success?registrationtoken=" + result.subscription.id + "&email=" + encodeURIComponent(data.email);
                  }).catch(error => {
                    $("#submit-button").prop("disabled", false);
                    $("#submit-button").removeClass("submit");
                    $("#error").show();
                    console.log("Post Subscription Error: ",error);
                });
            }).catch(error => {
                $("#submit-button").prop("disabled", false);
                $("#submit-button").removeClass("submit");
                $("#error").show();
                console.log("Tokenize() Error: ",error);
              });
            })
        });
    });

      function PopulateFormFields(data) {
          //populating the form fields (only if the field is empty)
          if ($.trim($('#first_name').val()) == '' && data.customer.first_name != null) {
              $('#first_name').val(data.customer.first_name);
          }
          if ($.trim($('#last_name').val()) == '' && data.customer.last_name != null) {
              $('#last_name').val(data.customer.last_name);
          }
          if ($.trim($('#phone').val()) == '' && data.customer.phone != null) {
              $('#phone').val(data.customer.phone);
          }
          if ($.trim($('#company_name').val()) == '' && data.customer.company != null) {
              $('#company_name').val(data.customer.company);
          }
          if (data.customer.cf_business_type != null && data.customer.cf_business_type != '') {
              $('#business_type option[value="' + data.customer.cf_business_type + '"]').attr('selected', 'selected');
          }
          if (data.customer.id != null) {
              $('#customer_id').val(data.customer.id);
          }
          
          if (data.card.status != null && data.card.status == "valid") {
              if ($.trim($('#address').val()) == '' && data.card.billing_addr1 != null) {
                  $('#address').val(data.card.billing_addr1);
              }
              if ($.trim($('#address2').val()) == '' && data.card.billing_addr2 != null) {
                  $('#address2').val(data.card.billing_addr2);
              }
              if ($.trim($('#city').val()) == '' && data.card.billing_city != null) {
                  $('#city').val(data.card.billing_city);
              }
              if ($.trim($('#zip').val()) == '' && data.card.billing_zip != null) {
                  $('#zip').val(data.card.billing_zip);
              }
              if (data.card.billing_state != null && data.card.billing_state != '') {
                  $('#state option[value="' + data.card.billing_state + '"]').attr('selected', 'selected');
              }
              if ($.trim($('#address2').val()) == '' && data.card.billing_addr2 != null) {
                  $('#address2').val(data.card.billing_addr2);
              }

              $('#customPaymentBlock,#lnkEditPayment').show();
              $('#defaultPaymentBlock, .custom-payment-buttons').hide();
              if (data.card.card_type != null && data.card.card_type != '' && data.card.last4 != null) {
                  var cardText = '';
                  switch (data.card.card_type.toLowerCase()) {
                      case 'mastercard':
                          $('#img-card').attr('src', "https://assets.website-files.com/6144fd968952ef8fcdb1755a/64515d2162e55d8f161370c8_mc.png");
                          cardText = 'Mastercard';
                          break;
                      case 'visa':
                          $('#img-card').attr('src', "https://assets.website-files.com/6144fd968952ef8fcdb1755a/64515d2162e55df60d1370c7_visa.png");
                          cardText = 'Visa';
                          break;
                      case 'american_express':
                          $('#img-card').attr('src', "https://assets.website-files.com/6144fd968952ef8fcdb1755a/64515d212e93b27be7b6122e_amex.png");
                          cardText = 'American Express';
                          break;
                      case 'discover':
                          $('#img-card').attr('src', "https://assets.website-files.com/6144fd968952ef8fcdb1755a/64515d21dd5ca46ea8a39694_dc.png");
                          cardText = 'Discover';
                          break;
                  }
                  $('#lbl-payment-info1').text(cardText + ' ending in ' + data.card.last4);
                  if (data.card.expiry_month != null && data.card.expiry_year != null) {
                      $('#lbl-payment-info2').text('Exp: ' + (data.card.expiry_month.length == 1 ? '0' + data.card.expiry_month : data.card.expiry_month) + '/' + data.card.expiry_year);
                  }
                  
                  $('#lnkEditPayment').off('click').on('click', function () {
                      $('#lnkEditPayment').hide();
                      $('#defaultPaymentBlock, .custom-payment-buttons').show();
                      $('.hide-from-custom').hide();
                  });
                  $('#btnCancelPayment').off('click').on('click', function () {
                      $('#lnkEditPayment').show();
                      $('#defaultPaymentBlock, .custom-payment-buttons').hide();
                      $('.hide-from-custom').show();
                  });
              }

              if (data.card.payment_source_id != null) {
                  $('#payment_source_id').val(data.card.payment_source_id);
              }
              if (data.card.last4 != null) {
                  $('#last_4').val(data.card.last4);
              }
          }
      }
  });