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

    function sessionAJAX(userObj) {
        console.log('sessionAJAX');
        $.ajax({
            url: '/session',
            method: 'POST',
            data: userObj,
            success: function(data) {
                console.log(data);
                console.log('ayy lmao');
                window.location.replace('/game');
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
                loginNeeded = true;
                sessionAJAX(userObj);
                // window.location.replace('game.html');
            }
        }
        if (!loginNeeded) {
            $.post('/users', userObj);
            sessionAJAX(userObj);

        }
    }

});
