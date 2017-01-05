$(document).ready(function() {

    $('#login').click(userAJAX);

    function userAJAX() {

        let username = $('#username').val();
        let password = $('#password').val();
        let userObj = {username, password};

        $.ajax({
            url: '/users',
            method: 'GET',
            success: function(data) {
                checkUser(data, userObj);
            },
            error: (err)=>{
                console.log('dun errd:', err);
            }
        })
    }

    function checkUser(users, userObj) {
        let loginNeeded = false;
        for (var i = 0; i < users.length; i++) {
            if (userObj.username === users[i].name) {
                // check if password is correct and login/redirect
                loginNeeded = true;
                loginAndRedirect()
            }
        }
        if (!loginNeeded) {
            $.post('/users', userObj);
        }
    }

});
