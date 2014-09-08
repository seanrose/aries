/**
 * Given a Twitter userId, creates a following entry
 * for every userId this user follows
 * @param  {String} userId  The Twitter user ID
 * @param  {Array} friends An array of Twitter user objects
 * @return
 */
function populateRelationships(userId, friends) {
    console.log('##########\nPopulating for: ' + userId +'\n##########\n');
    _.each(friends, function(friend) {
        Followings.upsert(
            { follow: friend.id_str, followedBy: userId },
            { $set: { follow: friend.id_str, followedBy: userId } }
        );
    });
}

function populateFriendRelationships(userId, friends, twitter) {
    _.each(friends, function(friend, index) {
        var friendId = friend.id_str;


        var delay = (index + 1) * 65000; // Have to do these in 1 minute intervals because fuck the Twitter API
        Meteor.setTimeout(function() {
            var friendsOfFriends = twitter.friends.list( {id: friendId, count:200} ).data.users;
            populateRelationships(friendId, friendsOfFriends);
        }, delay);
    });
}

function scoreRelationships(userId) {

}

Meteor.methods({
    importFollowings: function() {
        var twitter = new Twitter();
        // TODO(seanrose): handle pagination somehow
        var friends = twitter.friends.list( {count: 200} ).data.users;
        var userId = Meteor.user().services.twitter.id;

        // Populate relationships for the logged in user
        populateRelationships(userId, friends);
        // Populate relationships for the logged in user's follows
        populateFriendRelationships(userId, friends, twitter);

    }
});
