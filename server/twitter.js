var API_BASE = 'https://api.twitter.com/1.1',
    FRIENDS_URL = API_BASE + '/friends',
    USERS_URL = API_BASE + '/users';


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

function request(method, url, params) {
    var oauth = createOauthBinding();
    result = oauth.call(method, url, params);
    return result;
}

Twitter = function() {
    var client = this;
    this.friends_url = FRIENDS_URL;
    this.users_url = USERS_URL;

    this.friends = {

        ids: function(options) {
            options = options || {};
            var params = {};

            if ( _.has(options, 'id') ) {
                params.id = options.id;
            } else if ( _.has(options, 'username') ) {
                params.screen_name = options.screen_name;
            } else {
                params.id = Meteor.user().services.twitter.id;
            }

            url = client.friends_url + '/ids.json';

            return request('GET', url, params);
        }
    };

    this.users = {

        lookup: function(options) {
            options = options || {};
            var params = {};

            if ( _.has(options, 'id') ) {
                params.id = options.id;
            } else {
                params.screen_name = options.screen_name;
            }

            url = client.users_url + '/lookup.json';

            return request('GET', url, params);

        }
    };
};
