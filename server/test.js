var seanId = '17797951';

var followings = Followings.find({followedBy: seanId}, {
    fields: {follow: 1}
}).fetch();

var followingIds = _.pluck(followings, 'follow');

var secondDegreeFollowings = Followings.find( {followedBy: {$in: followingIds}}, {
    fields: { follow: 1 }
});


var followCounts = {};

secondDegreeFollowings.forEach(function(following) {
    followCounts[following.follow] = (followCounts[following.follow] || 0) + 1;
});

console.log(followCounts);
