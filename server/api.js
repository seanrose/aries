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

        var delay = (index + 1) * 65000;
        Meteor.setTimeout(function() {
            var friendsOfFriends = twitter.friends.list( {id: friendId, count:200} ).data.users;
            populateRelationships(friendId, friendsOfFriends);
        }, delay);
    });
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
