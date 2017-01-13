$(document).ready(function() {

    $('#login').click(userAJAX);

    function userAJAX() {
        let username = $('#username').val();
        let password = $('#password').val();
        let userObj = {username, password};
        if (username.length > 8) {
            $('#error').text('Username must be less than 9 characters');
        } else {
            $.ajax({
                url: '/users',
                method: 'GET',
                success: function(data) {
                    checkUser(data, userObj);
                },
                error: (err)=>{
                    console.log('users get failed:', err);
                }
            })
        }
    }

    function sessionAJAX(userObj) {
        $.ajax({
            url: '/session',
            method: 'POST',
            data: userObj,
            success: function(data) {
                window.location.replace('/game');
                // TODO: lookup altern
            },
            error: (err)=>{
                $('#error').text('Wrong password');
                console.log('session post failed:', err);
            }
        })

    }

    function checkUser(users, userObj) {
        let loginNeeded = false;
        for (var i = 0; i < users.length; i++) {
            if (userObj.username === users[i].name) {
                loginNeeded = true;
                sessionAJAX(userObj);
            }
        }
        if (!loginNeeded) {
            $.post('/users', userObj);
            $('#error').text('Username registered! Press login again');
            $('#error').css({'color': 'green'})
        }
    }
});
