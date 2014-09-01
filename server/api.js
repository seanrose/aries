Meteor.methods({
    test: function() {
        var t = new Twitter();
        var res = t.users.lookup( { screen_name: 'sean_a_rose'} );
        console.log(res.data);
    }
});
