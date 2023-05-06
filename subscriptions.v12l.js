  var Webflow = Webflow || [];
Webflow.push(function () {
    const StatusEnum = {
        UnKnown: 0,
        Valid: 1,
        Expiring: 2,
        Expired: 3
    }
    const BrandEnum = {
        UnKnown: 0,
        Visa: 1,
        Mastercard: 2,
        AmericanExpress: 3,
        Discover: 4,
        Jcb: 5,
        DinersClub: 6,
        Other: 7,
        Bancontact: 8,
        NotApplicable: 9
    }
    const AutoCollectionEnum = {
        UnKnown: 0,
        On: 1,
        Off: 2
    }
  $(document).off('submit');
      var cardComponent;
      var numberField, expiryField, cvvField;
  var cbRegApiUrl = "https://reg.clearestimates.com/api/chargebee/";
  $(document).ready(function () {
      $('#customPaymentBlock, .custom-payment-buttons').hide();
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
                //We will populate the customer info from Chargebee using the email
                var cbCustomerApiUrl = cbRegApiUrl + 'getcustomer/' + encodeURIComponent(email);
                $.get(cbCustomerApiUrl, function (data) { //data will have 2 objects (customer, card)
                    if (data != null && data.customer != null && data.card != null) {
                        if (data.has_subscription) {
                            MicroModal.init();
                            if (data.is_subscription_paused) {
                                $('#modal-1 #modal-1-content').html('<p>You have an existing subscription with us, but its paused. To resume your subscription please contact customer service using our chatbot, accessible from the bottom right corner of your screen.</p>');
                            }
                            else {
                                $('#modal-1 #modal-1-content').html('<p>You have an existing subscription with us. Please log in to <a style="color: #005ac1;text-decoration: none;" href="https://app.clearestimates.com"> Clearestimates.com</a> and start estimating.</p>');
                            }
                            $('#email,#confirm-email').val('');
                            MicroModal.show('modal-1');
                        }
                        else {
                            PopulateFormFields(data);
                        }
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
        numberField = cardComponent.createField("number").at("#card-number");
        expiryField = cardComponent.createField("expiry").at("#card-expiry");
        cvvField = cardComponent.createField("cvv").at("#card-cvv");
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
            event.preventDefault(event.target.nodeName + event.target);
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
                var objSubscription = {
                    TokenId: response.token,
                    PlanId: plan_id,
                    CustomerFirstName: data.first_name,
                    CustomerLastName: data.last_name,
                    CustomerEmail: data.email,
                    CustomerPhone: data.phone !== "" ? data.phone : null,
                    BillingAddressFirstName:  data.first_name,
                    BillingAddressLastName: data.last_name,
                    BillingAddressLine1: data.address,
                    BillingAddressLine2 : data.address2 !== "" ? data.address2 : null,
                    BillingAddressCity: data.city,
                    BillingAddressState: data.state,
                    BillingAddressZip: data.zip,
                    BillingAddressCountry: data.country,
                    CustomerAutoCollection: AutoCollectionEnum.On,
                    CustomerCompany: data.company_name !== "" ? data.company_name : null,
                    CouponIds: $.trim(data.coupon) != "" ? [$.trim(data.coupon)] : []
                };
                var listCustomValues = [{ Name: "cf_business_type", Value: data.business_type }];
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
                    // check that the property exists, then append its value to the MetaData along with other variables. In chargebee they are prepended with 'cf_' for 'custom field'
                    if (purserObject.hasOwnProperty(x)) {
                        listCustomValues.push({ Name: `cf_${x}`, Value: purserObject[x] });
                    }
                })
                objSubscription.CustomValues = listCustomValues;
                console.log("createsubscription req:" + JSON.stringify(objSubscription));
                $.post(cbRegApiUrl + "createsubscription", objSubscription, function (resp) {
                    console.log("createsubscription resp:" + JSON.stringify(resp));
                    if (resp.success) {
                        $("#error").hide();
                        window.location.href = cedomain + "/subscribe/success?registrationtoken=" + result.subscription.id + "&email=" + encodeURIComponent(data.email);
                    }
                    else { //coupon error or payment/card error
                        $("#error").show();
                        console.log(resp.param);
                        if (resp.is_coupon_error) {
                            $("#coupon-error").css("display", "block");
                        }
                        else if (resp.is_payment_error) {
                            $("#coupon-error").css("display", "none");
                        }
                    }
                }).always(function () { $("#submit-button").prop("disabled", false); });
                //=========================================================================
                //var par = new URLSearchParams();
                //par.append("plan_id", plan_id);
                //par.append("customer[first_name]", data.first_name);
                //par.append("customer[last_name]", data.last_name);
                //par.append("customer[email]", data.email);
                //par.append("customer[cf_business_type]", data.business_type);
                //if(data.phone !== "") par.append("customer[phone]", data.phone);
                //par.append("billing_address[first_name]", data.first_name);
                //par.append("billing_address[last_name]", data.last_name);
                //par.append("billing_address[line1]", data.address);
                //if(data.address2 !== "") par.append("billing_address[line2]", data.address2);
                //par.append("billing_address[city]", data.city);
                //par.append("billing_address[state]", data.state);
                //par.append("billing_address[zip]", data.zip);
                //par.append("billing_address[country]", data.country);
                //par.append("customer[auto_collection]", "on");
                //if (data.company_name !== "") {
                //    par.append("customer[company]", data.company_name);
                //}
                //if (data.coupon !== "") {
                //    par.append("coupon", data.coupon);
                //}
                //par.append("token_id", response.token);
                //// List possible parameters to look for
                //let extraParamArray = [
                //    'utm_device',
                //    'utm_medium',
                //    'utm_source',
                //    'utm_term',
                //    'utm_content',
                //    'utm_campaign',
                //    'utm_adgroup',
                //    'gclid'];
                //// get utm parameters and other information as needed from purser which is installed on all pages of the site
                //const purserObject = window.purser.fetch();
                //// loop through array of possible parameters from the purser object
                //extraParamArray.forEach((x) => {
                //    // check that the property exists, then append its value to the url along with other variables. In chargebee they are prepended with 'cf_' for 'custom field'
                //    purserObject.hasOwnProperty(x) && par.append(`cf_${x}`, purserObject[x])
                //})
                //let requestOptions = { method: 'POST', headers: myHeaders, body: par };
                //fetch(ceproxydomain, requestOptions)
                //    .then(response => {
                //        $("#submit-button").prop("disabled", false);
                //        if (!response.ok) {
                //            response.json().then(j => {
                //                if (j.error_param == "coupon" || j.param == "coupon") {
                //                    $("#coupon-error").css("display", "block");
                //                }
                //            });
                //            throw new Error("HTTP status " + response.statusText);
                //        }
                //        else {
                //            return response.json();
                //        }
                //  }).then(result => {
                //    window.location.href = cedomain + "/subscribe/success?registrationtoken=" + result.subscription.id + "&email=" + encodeURIComponent(data.email);
                //  }).catch(error => {
                //    $("#submit-button").prop("disabled", false);
                //    $("#submit-button").removeClass("submit");
                //    $("#error").show();
                //    console.log("Post Subscription Error: ",error);
                //  });
            //=================================================



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
        if ($.trim($('#first_name').val()) == '' && data.customer.FirstName != null) {
            $('#first_name').val(data.customer.FirstName);
        }
        if ($.trim($('#last_name').val()) == '' && data.customer.LastName != null) {
            $('#last_name').val(data.customer.LastName);
        }
        if ($.trim($('#phone').val()) == '' && data.customer.Phone != null) {
            $('#phone').val(data.customer.Phone);
        }
        if ($.trim($('#company_name').val()) == '' && data.customer.Company != null) {
            $('#company_name').val(data.customer.Company);
        }
        if (data.customer_business_type != null && data.customer_business_type != '') {
            $('#business_type option[value="' + data.customer_business_type + '"]').attr('selected', 'selected');
        }
        if (data.customer.Id != null) {
            $('#customer_id').val(data.customer.Id);
        }

        if (data.card.Status != null && data.card.Status == StatusEnum.Valid) {
            $('#customPaymentBlock,#lnkEditPayment').show();
            $('#defaultPaymentBlock, .custom-payment-buttons').hide();

            if ($.trim($('#address').val()) == '' && data.card.BillingAddr1 != null) {
                $('#address').val(data.card.BillingAddr1);
            }
            if ($.trim($('#address2').val()) == '' && data.card.BillingAddr2 != null) {
                $('#address2').val(data.card.BillingAddr2);
            }
            if ($.trim($('#city').val()) == '' && data.card.BillingCity != null) {
                $('#city').val(data.card.BillingCity);
            }
            if ($.trim($('#zip').val()) == '' && data.card.BillingZip != null) {
                $('#zip').val(data.card.BillingZip);
            }
            if (data.card.BillingState != null && data.card.BillingState != '') {
                $('#state option[value="' + data.card.BillingState + '"]').attr('selected', 'selected');
            }
            if (data.card.PaymentSourceId != null) {
                $('#payment_source_id').val(data.card.PaymentSourceId);
            }
            if (data.card.Last4 != null) {
                $('#last_4').val(data.card.Last4);
            }

            if (data.card.CardType != null && data.card.CardType != '' && data.card.Last4 != null) {
                UpdateCardDetails(data.card.CardType, data.card.Last4, data.card.ExpiryMonth, data.card.ExpiryYear);
                $('#lnkEditPayment').off('click').on('click', function () {
                    $('#customPaymentError').hide();
                    $('#lnkEditPayment').hide();
                    $('#defaultPaymentBlock, .custom-payment-buttons').show();
                    $('.hide-from-custom').hide();
                       
                });
                $('#btnSavePayment').off('click').on('click', function (event) {
                    event.preventDefault();
                    $('#btnSavePayment').prop("disabled", true);
                    //error checking
                    var formData = Object.fromEntries(new FormData(document.getElementById('checkout-form')).entries());
                    if (formData.first_name == '' || formData.last_name == '' || formData.address == '' || formData.city == '' || formData.state == '' || formData.zip == '') {
                        $('#customPaymentError').show();
                        $('#btnSavePayment').prop("disabled", false);
                    }
                    else {
                        $('#customPaymentError').hide();
                        let user = { firstName: formData.first_name, lastName: formData.last_name, billingAddr1: formData.address, billingCity: formData.city, billingState: formData.state, billingZip: formData.zip, billingCountry: formData.country };
                        if (formData.address2 !== "") {
                            user.billingAddr2 = formData.address2;
                        }

                        cardComponent.tokenize(user).then(response => {
                            var cbPaymentSourceApiUrl = cbRegApiUrl + "createpaymentsource/" + data.customer.Id + "/" + response.token;
                            //updating customer payment source with new card, billing info
                            $.post(cbPaymentSourceApiUrl, function (psData) {
                                if (psData != null && psData.customer_id != null && psData.payment_source_id != null && psData.card != null) {
                                    $('#payment_source_id').val(psData.payment_source_id);
                                    //updating custom payment block with new card details
                                    UpdateCardDetails(psData.card.Brand, psData.card.Last4, psData.card.ExpiryMonth, psData.card.ExpiryYear);
                                    $("#card-number-error,#card-expiry-error,#card-cvv-error").text('').css("display", "none");
                                    $("#error").hide();
                                    $('#lnkEditPayment').show();
                                    $('#defaultPaymentBlock, .custom-payment-buttons').hide();
                                    $('.hide-from-custom').show();
                                    ClearCardFields();
                                }
                            }).always(function () { $('#btnSavePayment').prop("disabled", false); });
                        }).catch(error => {
                            $('#btnSavePayment').prop("disabled", false);
                            $("#submit-button").prop("disabled", false);
                            $('#customPaymentError').hide();
                            console.log("Custom Payment Tokenize() Error: ", error);
                        });
                    }
                });

                $('#btnCancelPayment').off('click').on('click', function () {
                    $("#card-number-error,#card-expiry-error,#card-cvv-error").text('').css("display", "none");
                    $("#error").hide();
                    $('#lnkEditPayment').show();
                    $('#defaultPaymentBlock, .custom-payment-buttons').hide();
                    $('.hide-from-custom').show();
                    ClearCardFields();
                });
            }  
        }
    }

    function UpdateCardDetails(cardType, last4, expiryMonth, expiryYear) {
        var cardText = '';
        switch (cardType) {
            case BrandEnum.Mastercard:
                $('#img-card').attr('src', "https://assets.website-files.com/6144fd968952ef8fcdb1755a/64515d2162e55d8f161370c8_mc.png");
                cardText = 'Mastercard';
                break;
            case BrandEnum.Visa:
                $('#img-card').attr('src', "https://assets.website-files.com/6144fd968952ef8fcdb1755a/64515d2162e55df60d1370c7_visa.png");
                cardText = 'Visa';
                break;
            case BrandEnum.AmericanExpress :
                $('#img-card').attr('src', "https://assets.website-files.com/6144fd968952ef8fcdb1755a/64515d212e93b27be7b6122e_amex.png");
                cardText = 'American Express';
                break;
            case BrandEnum.Discover:
                $('#img-card').attr('src', "https://assets.website-files.com/6144fd968952ef8fcdb1755a/64515d21dd5ca46ea8a39694_dc.png");
                cardText = 'Discover';
                break;
        }
        $('#lbl-payment-info1').text(cardText + ' ending in ' + last4);
        if (expiryMonth != null && expiryYear != null) {
            $('#lbl-payment-info2').text('Exp: ' + (expiryMonth.length == 1 ? '0' + expiryMonth : expiryMonth) + '/' + expiryYear);
        }
    }
    function ClearCardFields() {
        if (numberField && expiryField && cvvField) {
            numberField.clear();
            expiryField.clear();
            cvvField.clear();
        }
    }
});