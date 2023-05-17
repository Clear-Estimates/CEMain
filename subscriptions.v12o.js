var Webflow = Webflow || [];
Webflow.push(function () {
    const StatusEnum = { UnKnown: 0, Valid: 1, Expiring: 2, Expired: 3 }
    const BrandEnum = {mUnKnown: 0, Visa: 1, Mastercard: 2, AmericanExpress: 3, Discover: 4, Jcb: 5, DinersClub: 6, Other: 7, Bancontact: 8, NotApplicable: 9 }
    const AutoCollectionEnum = { UnKnown: 0, On: 1, Off: 2 }
    $(document).off('submit');
    var cardComponent;
    var numberField, expiryField, cvvField;
    var cbRegApiUrl = "https://regapi.clearestimates.com/api/chargebee/";
    var genericErrorMessage = '<div>Error while creating subscription. Please try again.</div>';
    var oldAddress = '', oldCity = '', oldZip = '', oldState = '', oldFName = '', oldLName = '', oldPhone = '', oldBusinessType = '', oldCompany = '';
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
                                    $('#modal-1 #modal-1-content').html('<p>You have an existing subscription with us, but its paused. To resume your subscription please contact customer service using our live chatbox, accessible from the bottom right corner of your screen.</p>');
                                }
                                else {
                                    $('#modal-1 #modal-1-content').html('<p>You have an existing subscription with us. Please log in to <a style="color: #005ac1;text-decoration: none;font-weight: 600;font-size: 15px;" href="https://app.clearestimates.com"> Clearestimates.com</a> and start estimating.' +
                                        '<br/><br/>If you haven\'t set your password yet, please contact customer service using our live chatbox, accessible from the bottom right corner of your screen.</p > ');
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
        var cbInstance = Chargebee.init({
            site: "clearestimates-test", //"clearestimates", 
            publishableKey: "test_IGqLcu0CiVF680fn1s5BQNU8LxgycVDyQ", //"live_3V5PE3cn04MqdLrPbcdoPS4yeafoxX1aK",
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
            $("#checkout-form").off("submit").on("submit", function(event) {  // Submitting the checkout form
                event.preventDefault(event.target.nodeName + event.target);
                $("#submit-button").prop("disabled", true);
                $("#submit-button").addClass("submit");
                $("#error").hide();
                var objSubscription = {};
                const data = Object.fromEntries(new FormData(event.target).entries());
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
                    //console.log(`cf_${x}` + ' -- ' + purserObject[x]);
                    // check that the property exists, then append its value to the MetaData along with other variables. In chargebee they are prepended with 'cf_' for 'custom field'
                    if (purserObject.hasOwnProperty(x)) {
                        listCustomValues.push({ Name: `cf_${x}`, Value: purserObject[x] });
                    }
                })

                if ($('#customer_id').val() !== "" && $('#payment_source_id').val() !== "") { //It's for an existing customer and the customer already has a valid card on file
                    objSubscription.CustomerId = $('#customer_id').val();
                    objSubscription.PaymentSourceId = $('#payment_source_id').val();
                    objSubscription.PlanId = plan_id;
                    
                    if ($.trim(data.coupon) !== "") {
                        var coupon = [];
                        coupon.push($.trim(data.coupon));
                        objSubscription.CouponIds = coupon;
                    }

                    //Update the customer billing info if any billing address field has been changed
                    UpdateCustomerBillingInfo(objSubscription.CustomerId, objSubscription.PaymentSourceId, data);

                    //if the customer changes phone,company or business-type, we will include those so that we can update those info
                    if (oldFName !== $.trim(data.first_name)) {
                        objSubscription.CustomerFirstName = $.trim(data.first_name);
                    }
                    if (oldLName !== $.trim(data.last_name)) {
                        objSubscription.CustomerLastName = $.trim(data.last_name);
                    }
                    if (oldPhone !== $.trim(data.phone)) {
                        objSubscription.CustomerPhone = $.trim(data.phone);
                    }
                    if (oldCompany !== $.trim(data.company_name)) {
                        objSubscription.CustomerCompany = $.trim(data.company_name);
                    }
                    if (oldBusinessType == data.business_type) { //pass this value only if the customer changes the business type
                        listCustomValues = listCustomValues.filter(function (obj) { return obj.Name !== 'cf_business_type'; });
                    }

                    objSubscription.CustomValues = listCustomValues;
                    ChargebeeCreateSubscription(objSubscription, cedomain, encodeURIComponent($.trim(data.email)));  
                }
                else { //It's for a new customer or an existing customer with an invalid/expired card on file
                    let user = { firstName: data.first_name, lastName: data.last_name, billingAddr1: $.trim(data.address), billingCity: $.trim(data.city), billingState: data.state, billingZip: $.trim(data.zip), billingCountry: data.country };
                    if ($.trim(data.address2) !== "") {
                        user.billingAddr2 = $.trim(data.address2);
                    }
                    cardComponent.tokenize(user).then(response => {
                        $("#submit-button").removeClass("submit");
                        objSubscription.TokenId = response.token;
                        objSubscription.PlanId = plan_id;
                        objSubscription.CustomerFirstName = data.first_name;
                        objSubscription.CustomerLastName = data.last_name;
                        objSubscription.CustomerEmail = $.trim(data.email);
                        objSubscription.CustomerPhone = $.trim(data.phone) !== "" ? $.trim(data.phone) : null;
                        objSubscription.BillingAddressFirstName = data.first_name;
                        objSubscription.BillingAddressLastName = data.last_name;
                        objSubscription.BillingAddressLine1 = $.trim(data.address);
                        objSubscription.BillingAddressLine2 = $.trim(data.address2) !== "" ? $.trim(data.address2) : null;
                        objSubscription.BillingAddressCity = $.trim(data.city);
                        objSubscription.BillingAddressState = data.state;
                        objSubscription.BillingAddressZip = $.trim(data.zip);
                        objSubscription.BillingAddressCountry = data.country;
                        objSubscription.AutoCollection = AutoCollectionEnum.On;
                        objSubscription.CustomerCompany = $.trim(data.company_name) !== "" ? $.trim(data.company_name) : null;

                        if ($.trim(data.coupon) !== "") {
                            var coupon = [];
                            coupon.push($.trim(data.coupon));
                            objSubscription.CouponIds = coupon;
                        } 
                        if ($('#customer_id').val() !== "") {
                            objSubscription.CustomerId = $('#customer_id').val();
                        }
                        objSubscription.CustomValues = listCustomValues;
                        ChargebeeCreateSubscription(objSubscription, cedomain, encodeURIComponent($.trim(data.email)));
                    }).catch(error => {
                        $("#submit-button").prop("disabled", false);
                        $("#submit-button").removeClass("submit");
                        $("#error").html(genericErrorMessage).show();
                        console.log("Tokenize() Error: ", error);
                    });
                }
            })
        });
    });

    function ChargebeeCreateSubscription(objSubscription, cedomain, email) {
        $.ajax({
            type: 'POST',
            url: cbRegApiUrl + "createsubscription",
            data: JSON.stringify(objSubscription),
            dataType: 'json',
            contentType: "application/json"
        }).done(function (resp) {
            console.log(JSON.stringify(resp));
            if (resp.success && resp.subscription_id != null && resp.subscription_id !== '') {
                $("#error").hide();
                $("#coupon-error").css("display", "none");
                window.location.href = cedomain + "/subscribe/success?registrationtoken=" + resp.subscription_id + "&email=" + email;
            }
            else { //coupon error or payment/card error
                if (resp.message != null && resp.message != '' && !resp.is_coupon_error) {
                    $("#error").html(resp.message).show();
                } else {
                    $("#error").html(genericErrorMessage).show();
                }

                if (resp.is_coupon_error) {
                    $("#coupon-error").css("display", "block");
                }
                else if (resp.is_payment_error) {
                    $("#coupon-error").css("display", "none");
                }
            }
        }).always(function () { $("#submit-button").prop("disabled", false); })
            .fail(function (xhr, status, error) {
                console.log(error + '--' + xhr.responseText);
            });
    }

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
        //Showing notice to user to notify we have populated the form for them
        $('#accountnotice').slideDown().delay(3000).slideUp();
        oldFName = data.customer.FirstName != null ? data.customer.FirstName : '';
        oldLName = data.customer.LastName != null ? data.customer.LastName : '';
        oldPhone = data.customer.Phone != null ? data.customer.Phone : '';
        oldCompany = data.customer.Company != null ? data.customer.Company : '';
        oldBusinessType = data.customer_business_type != null ? data.customer_business_type : '';

        if (data.card.Status != null && data.card.Status == StatusEnum.Valid) {
            oldAddress = data.card.BillingAddr1 != null ? data.card.BillingAddr1 : '';
            oldCity = data.card.BillingCity != null ? data.card.BillingCity : '';
            oldZip = data.card.BillingZip != null ? data.card.BillingZip : '';
            oldState = data.card.BillingState != null ? data.card.BillingState : '';

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
            
            if (data.card.CardType != null && data.card.CardType != '' && data.card.Last4 != null) {
                UpdateCardDetails(data.card.CardType, data.card.Last4, data.card.ExpiryMonth, data.card.ExpiryYear);
                $('#lnkEditPayment').off('click').on('click', function () { //Opening card form to update existing payment
                    $('#customPaymentError, #lnkEditPayment, .hide-from-custom').hide();
                    //$('#lnkEditPayment').hide();
                    //$('.hide-from-custom').hide();
                    $('#defaultPaymentBlock, .custom-payment-buttons').slideDown();
                });
                $('#btnSavePayment').off('click').on('click', function (event) { //Saving new card 
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
                        let user = { firstName: formData.first_name, lastName: formData.last_name, billingAddr1: $.trim(formData.address), billingCity: $.trim(formData.city), billingState: formData.state, billingZip: $.trim(formData.zip), billingCountry: formData.country };
                        if ($.trim(formData.address2) !== "") {
                            user.billingAddr2 = $.trim(formData.address2);
                        }
                        if (data.customer.Id != null && data.customer.Id !== "") {
                            //Tokenize the card and update payment source in Chargebee
                            cardComponent.tokenize(user).then(response => {
                                var cbPaymentSourceApiUrl = cbRegApiUrl + "createpaymentsource/" + data.customer.Id + "/" + response.token;
                                //updating payment source with new card, billing info
                                $.post(cbPaymentSourceApiUrl, function (psData) {
                                    if (psData != null && psData.customer_id != null && psData.payment_source_id != null && psData.card != null) {
                                        $('#payment_source_id').val(psData.payment_source_id);
                                        //updating custom payment block with new card details
                                        UpdateCardDetails(psData.card.Brand, psData.card.Last4, psData.card.ExpiryMonth, psData.card.ExpiryYear);
                                        $("#card-number-error,#card-expiry-error,#card-cvv-error").text('').css("display", "none");
                                        $("#error").hide();
                                        $('#lnkEditPayment, .hide-from-custom').show();
                                        $('#defaultPaymentBlock, .custom-payment-buttons').hide();
                                        ClearCardFields();
                                    }
                                    else {
                                        $('#customPaymentError').show();
                                    }
                                }).always(function () { $('#btnSavePayment').prop("disabled", false); });
                            }).catch(error => {
                                $('#btnSavePayment').prop("disabled", false);
                                $("#submit-button").prop("disabled", false);
                                $('#customPaymentError').hide();
                                console.log("Custom Payment Tokenize() Error: ", error);
                            });
                        }
                    }
                });

                $('#btnCancelPayment').off('click').on('click', function () {
                    $("#card-number-error,#card-expiry-error,#card-cvv-error").text('').css("display", "none");
                    $("#error").hide();
                    $('#defaultPaymentBlock, .custom-payment-buttons').hide();
                    $('#lnkEditPayment, .hide-from-custom').show();
                    ClearCardFields();
                });
            }
        }
        else if (data.customer.BillingAddress != null) { //If the card is invalid/expired, we will populate the billing address fields with customer billing address instead of card billing address
            oldAddress = data.customer.BillingAddress.Line1 != null ? data.customer.BillingAddress.Line1 : '';
            oldCity = data.customer.BillingAddress.City != null ? data.customer.BillingAddress.City : '';
            oldZip = data.customer.BillingAddress.Zip != null ? data.customer.BillingAddress.Zip : '';
            oldState = data.customer.BillingAddress.State != null ? data.customer.BillingAddress.State : '';

            if ($.trim($('#address').val()) == '' && data.customer.BillingAddress.Line1 != null) {
                $('#address').val(data.customer.BillingAddress.Line1);
            }
            if ($.trim($('#address2').val()) == '' && data.customer.BillingAddress.Line2 != null) {
                $('#address2').val(data.customer.BillingAddress.Line2);
            }
            if ($.trim($('#city').val()) == '' && data.customer.BillingAddress.City != null) {
                $('#city').val(data.customer.BillingAddress.City);
            }
            if ($.trim($('#zip').val()) == '' && data.customer.BillingAddress.Zip != null) {
                $('#zip').val(data.customer.BillingAddress.Zip);
            }
            if (data.card.BillingState != null && data.customer.BillingAddress.State != '') {
                $('#state option[value="' + data.customer.BillingAddress.State + '"]').attr('selected', 'selected');
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

    function UpdateCustomerBillingInfo(customerId, paymentSourceId, formData) {
        if (oldAddress !== $.trim(formData.address) || oldCity !== $.trim(formData.city) || oldZip !== $.trim(formData.zip) || oldState !== formData.state) {
            var billingInfoObj = {
                CustomerId: customerId,
                BillingAddressFirstName: formData.first_name,
                BillingAddressLastName: formData.last_name,
                BillingAddressLine1: $.trim(formData.address),
                BillingAddressCity: $.trim(formData.city),
                BillingAddressState: formData.state,
                BillingAddressZip: $.trim(formData.zip),
                BillingAddressCountry: formData.country,
                PaymentSourceID: paymentSourceId
            };

            if ($.trim(formData.address2) !== "") {
                billingInfoObj.BillingAddressLine2 = $.trim(formData.address2);
            }

            var cbUpdateBillingApiUrl = cbRegApiUrl + "updatebillinginfo";
            $.post(cbUpdateBillingApiUrl, billingInfoObj, function (billingResp) {
                if (billingResp) { //returns true/false
                    console.log('Billing Info updated successfully.');
                }
                else {
                    console.log('Billing Info update failed!');
                }
            })
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