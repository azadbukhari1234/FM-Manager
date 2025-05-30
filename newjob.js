$(document).ready(function(){
  // new job dialog
  $('#large-menu').click(function() {
    $('#new-job-dialog').show();
  });


  $('#mobile-menu').click(function() {
    $('#new-job-dialog').toggle('slide');
  });

  // take job in daily task
  $('#takejob').click(function(){
    $('#techbox').toggle("slide");
  });

  $("#submit-technician").click(function() {
    $("#techbox").toggle("fast");
  });
  $('#cancel-techbox').click(function() {
    $('#techbox').toggle('fast');
  });

  // complete dialog for uploading photo
  $("#complete").click(function(){
    $("#subphoto").toggle("slide");
  });

  $("#cancelupldialog").click(function(){
    $("#subphoto").toggle("fast");
  });

  $("#cancelupldialog").click(function() {
    $("#subphoto").toggle("fast");
  });
  
});