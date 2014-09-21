/**
 * Given a Twitter userId, creates a following entry
 * for every userId this user follows
 * @param  {String} userId  A Twitter user ID
 * @param  {Array} friends An array of Twitter User IDs
 * @return
 */
function populateRelationships(userId, friendIds) {
    console.log('##########\nPopulating for: ' + userId +'\n##########\n');
    _.each(friendIds, function(friendId) {
        Followings.upsert(
            { follow: friendId, followedBy: userId },
            { $set: { follow: friendId, followedBy: userId } }
        );
    });
}

/**
 * Calls populateRelationships on every one
 * of a user's friends
 * @param  {String} userId    A Twitter user ID
 * @param  {Array} friendIds An array of Twitter User IDs
 * @param  {Object} twitter   An authenticated Twitter api object
 * @return
 */
function populateFriendRelationships(userId, friendIds, twitter) {
    _.each(friendIds, function(friendId, index) {
        var delay = (index + 1) * 61000; // Have to do these in 1 minute intervals because fuck the Twitter API
        Meteor.setTimeout(function() {
            var friendsOfFriendIds = twitter.friends.ids( {id: friendId, stringify_ids: true} ).data.ids;
            populateRelationships(friendId, friendsOfFriendIds);
        }, delay);
    });
}

/**
 * Scores the total second degree follows for
 * a given user
 * @param  {String} userId A Twitter User ID
 * @return {Array}        A sorted array
 */
function scoreRelationships(userId) {
    var follows = Followings.find({followedBy: userId}, {
        fields: {follow: 1}
    }).fetch();

    var followIds = _.pluck(follows, 'follow');

    var secondDegreeFollows = Followings.find( {followedBy: {$in: followIds}}, {
        fields: { follow: 1 }
    });


    var secondDegreeFollowCounts = {};

    secondDegreeFollows.forEach(function(following) {
        if (!_.has(secondDegreeFollowCounts, following.follow)) {
            secondDegreeFollowCounts[following.follow] = {id: following.follow, count: 1};
        } else {
            secondDegreeFollowCounts[following.follow].count += 1;
        }
    });

    var scored = _.sortBy(secondDegreeFollowCounts, function(val, key, object) {
        return val.count;
    });

    return scored;
}

Meteor.methods({
    importFollowings: function() {
        var twitter = new Twitter();
        // TODO(seanrose): handle pagination somehow
        var friendIds = twitter.friends.ids( {stringify_ids: true} ).data.ids;
        var userId = Meteor.user().services.twitter.id;

        // Populate relationships for the logged in user
        populateRelationships(userId, friendIds);
        // Populate relationships for the logged in user's follows
        populateFriendRelationships(userId, friendIds, twitter);

    }
});

console.log(scoreRelationships('17797951'));
