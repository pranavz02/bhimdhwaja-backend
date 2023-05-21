"use strict";
import request from 'request'

class SendOtp {

    /**
     * Creates a new SendOtp instance
     * @param {string} authKey Authentication key
     * @param {string, optional} messageTemplate
     */
    constructor(authKey, messageTemplate) {
        this.authKey = authKey;
        if(messageTemplate){
            this.messageTemplate = messageTemplate;
        }else{
            this.messageTemplate = "Jay Shree Bhimashankar Please enter OTP {{otp}} to change your password. Your OTP will expire within 30 mins.";
        }
        this.otp_expiry = 1440; //1 Day =1440 minutes
    }

    /**
     * Returns the base URL for MSG91 api call
     * @returns {string} Base URL for MSG91 api call
     */
    static getBaseURL() {
        return "http://sms.ssdweb.in/api/";
    }

    /**
     * Set the OTP expiry minutes for MSG91 api call
     */
    setOtpExpiry(otp_expiry) {
        this.otp_expiry=otp_expiry;
        return;
    }

    /**
     * Returns the 4 digit otp
     * @returns {integer} 4 digit otp
     */
    static generateOtp() {
        return Math.floor(1000 + Math.random() * 9000);
    }

    /**
     * Send Otp to given mobile number
     * @param {string} contactNumber receiver's mobile number along with country code
     * @param {string} senderId
     * @param {string, optional} otp
     * Return promise if no callback is passed and promises available
     */
    send(contactNumber, senderId, dltTemplateID, otp) {
        let args = {
                authkey: this.authKey,
                mobiles: contactNumber,
                message: this.messageTemplate.replace('{{otp}}', otp),
                sender: senderId,
                route: 4,
                DLT_TE_ID: dltTemplateID,
                
            };
        return SendOtp.doRequest('get', "sendhttp.php", args);
    }

    /**
     * Retry Otp to given mobile number
     * @param {string} contactNumber receiver's mobile number along with country code
     * @param {boolean} retryVoice, false to retry otp via text call, default true
     * Return promise if no callback is passed and promises available
     */
    

    /**
     * Verify Otp to given mobile number
     * @param {string} contactNumber receiver's mobile number along with country code
     * @param {string} otp otp to verify
     * Return promise if no callback is passed and promises available
     */
    

    static doRequest (method, path, params) {

        // Return promise if no callback is passed and promises available
        

        let options = {
            method: method,
            url: SendOtp.getBaseURL() + "" + path
        };

        if (method === 'get') {
            options.qs = params;
        }

        // Pass form data if post
        if (method === 'post') {
            let formKey = 'form';

            if (typeof params.media !== 'undefined') {
                formKey = 'formData';
            }
            options[formKey] = params;
        }

        request(options, function(error, response, data) {
            // request error
            

            // JSON parse error or empty strings
            try {
                // An empty string is a valid response
                if (data === '') {
                    data = {};
                }
                else {
                    data = JSON.parse(data);
                }
            }
            catch(parseError) {
                return (
                    new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage),
                    data
                );
            }

            // response object errors
            // This should return an error object not an array of errors
            

            // status code errors
            
        });

    };

}

export default SendOtp;
