$(document).ready(function(){
    
    (function($) {
        "use strict";

    
    jQuery.validator.addMethod('answercheck', function (value, element) {
        return this.optional(element) || /^\bcat\b$/.test(value)
    }, "type the correct answer -_-");

    // validate contactForm form
    $(function() {
        $('#travelinquiryform').validate({
            rules: {
                email: {
                    required: true,
                    minlength: 0
                },
                fname: {
                    required: true,
                    minlength: 0
                },
                lname: {
                    required: true,
                    minlength: 0
                },
                destination: {
                    required: true,
                    minlength: 0
                },
                departure: {
                    required: true,
                    minlength: 0
                },
                start_date: {
                    required: true,
                    minlength: 0
                },
                end_date: {
                    required: true,
                    minlength: 0
                },
                num_travelers: {
                    required: true,
                    minlength: 0
                },
                rooms: {
                    required: true,
                    minlength: 0
                },
                payment: {
                    required: true,
                    minlength: 0
                },
                reference: {
                    required: true,
                    minlength: 0
                }
            },
            messages: {
                email: {
                    required: "Email field is required",
                    minlength: ""
                },
                fname: {
                    required: "First Name field is required",
                    minlength: ""
                },
                lname: {
                    required: "Last Name field is required",
                    minlength: ""
                },
                destination: {
                    required: "Destination field is required",
                    minlength: ""
                },
                departure: {
                    required: "Departure field is required",
                    minlength: ""
                },
                start_date: {
                    required: "Start Date field is required",
                    minlength: ""
                },
                end_date: {
                    required: "End Date field is required",
                    minlength: ""
                },
                num_travelers: {
                    required: "Number of Travelers is required",
                    minlength: ""
                },
                rooms: {
                    required: "Rooms field is required",
                    minlength: ""
                },
                payment: {
                    required: "Payment Date field is required",
                    minlength: ""
                },
                reference: {
                    required: "Referenced by field is required",
                    minlength: ""
                }
            },
            submitHandler: function(form) {

                var formData = {
                    email: $('#email').val(),
                    first_name: $('#fname').val(),
                    last_name: $('#lname').val(),
                    destination: $('#destination').val(),
                    departure: $('#departure').val(),
                    start_date: $('#start_date').val(),
                    end_date: $('#end_date').val(),
                    is_passport_valid: $('#valid_passport').val(),
                    num_travelers: $('#travelers').val(),
                    underage_travelers: $('#under-18-is-traveling').val(),
                    accommodations: $('#accommodations').val(),
                    rooms: $('#rooms').val(),
                    payment_date: $('#payment').val(),
                    atmosphere: $('#atmosphere').val(),
                    budget: $('#budget').val(),
                    activities: $('#activities').val(),
                    reference: $('#reference').val()
                };

                $.ajax({
                    type: "POST",
                    url: "http://localhost:5000/travelinquiryformsubmit",
                    contentType: "application/json", 
                    data: JSON.stringify(formData), 
                    success: function() {
                        $('#travelinquiryform :input').attr('disabled', 'disabled');
                        $('#travelinquiryform').fadeTo( "slow", 1, function() {
                            $(this).find(':input').attr('disabled', 'disabled');
                            $(this).find('label').css('cursor','default');
                            $('#success').fadeIn()
                            $('.modal').modal('hide');
		                	$('#success').modal('show');
                        })
                    },
                    error: function() {
                        $('#travelinquiryform').fadeTo( "slow", 1, function() {
                            $('#error').fadeIn()
                            $('.modal').modal('hide');
		                	$('#error').modal('show');
                        })
                    }
                })
            }
        })
    })
        
 })(jQuery)
})