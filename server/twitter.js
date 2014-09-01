var API_BASE = 'https://api.twitter.com/1.1',
    FRIENDS_URL = API_BASE + '/friends',
    USERS_URL = API_BASE + '/users',
    PROFILE_BASE = 'https://twitter.com';

/**
 * Creates the HTTP wrapper object that handles
 * signing OAuth 1 requests
 * @return {Object} a loaded HTTP object
 */
function createOauthBinding() {
    var config = Meteor.settings.twitter;

    var urls = {
        requestToken: "https://api.twitter.com/oauth/request_token",
        authorize: "https://api.twitter.com/oauth/authorize",
        accessToken: "https://api.twitter.com/oauth/access_token",
        authenticate: "https://api.twitter.com/oauth/authenticate"
    };

    var oauthBinding = new OAuth1Binding(config, urls);

    var user = Meteor.user();
    oauthBinding.accessToken = user.services.twitter.accessToken;
    oauthBinding.accessTokenSecret = user.services.twitter.accessTokenSecret;

    return oauthBinding;
}

/**
 * Makes an OAuth 1 signed HTTP request
 * @param  {String} method the HTTP method
 * @param  {String} url    the URL
 * @param  {Object} params an object of params to send in the request as query or body params
 * @return {object}        an HTTP response object
 */
// TODO(seanrose): make this an instance method perhaps
function request(method, url, params, oauth) {

    try {
        result = oauth.call(method, url, params);
    } catch (e) {
        if (e.response.statusCode === 429) {
            console.log(e.response.headers);
        }
        throw 'fuuuuuuu';
    }

    return result;
}

Twitter = function() {
    var client = this;

    this.oauth = createOauthBinding();
    this.friends_url = FRIENDS_URL;
    this.users_url = USERS_URL;
    this.profile_url = PROFILE_BASE;

    this.friends = {

        /**
         * Fetches a list of user IDs that the logged in user follows
         * @param  {Object} options query parameters
         * @return {[type]}         [description]
         */
        ids: function(options) {
            options = options || {};

            if (!_.has(options, 'id') && !_.has(options, 'username') ) {
                options.id = Meteor.user().services.twitter.id;
            }

            var url = client.friends_url + '/ids.json';

            return request('GET', url, options, client.oauth);
        },

        /**
         * Fetches a list of user objects that the logged in user follows
         * @param  {Object} options query parameters
         * @return {Object}         an HTTP response object
         */
        list: function(options) {
            options = options || {};

            if (!_.has(options, 'id') && !_.has(options, 'username') ) {
                options.id = Meteor.user().services.twitter.id;
            }

            var url = client.friends_url + '/list.json';

            return request('GET', url, options, client.oauth);
        }
    };

    this.users = {

        /**
         * Looks up the full user information for a list of user IDs
         * @param  {Object} options query parameters
         * @return {Array}         an array of user objects
         */
        lookup: function(options) {
            options = options || {};
            var params = {};

            if ( _.has(options, 'id') ) {
                params.id = options.id;
            } else {
                params.screen_name = options.screen_name;
            }

            url = client.users_url + '/lookup.json';

            return request('GET', url, params, client.oauth);

        },

        /**
         * Generates a URL for a given screen_name
         * @param  {String} screen_name the user's screen name
         * @return {String}             the user's profile URL
         */
        profileURL: function(screen_name) {
            return client.profile_url + '/' + screen_name;
        }
    };
};
