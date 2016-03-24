/**
 * Created by User on 2016/3/24.
 */
$(document).ready(function(){


        var usrName= $('#usrN').val();
        var usrPwd= $('#usrPr').val();
        $.post('http://localhost:3000/userAuth',{status:0,content:0},function(data){

        });


});
