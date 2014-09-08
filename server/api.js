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
        var friends = twitter.friends.list( {count: 200} ).data.users;
        var userId = Meteor.user().services.twitter.id;

        // Populate relationships for the logged in user
        populateRelationships(userId, friends);
        // Populate relationships for the logged in user's follows
        populateFriendRelationships(userId, friends, twitter);

    }
});
