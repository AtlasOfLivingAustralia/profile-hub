<%@ page import="java.text.SimpleDateFormat" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
 "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
    <link rel="stylesheet" href="${resource(dir: '/thirdparty/bootstrap/css/bootstrap3.3.4.min.css', absolute: true)}"
          type="text/css"/>
    <link rel="stylesheet" href="${resource(dir: '/css/nsl.css', absolute: true)}" type="text/css"/>
    <link rel="stylesheet" href="${resource(dir: '/css/theme.css', absolute: true)}" type="text/css"/>
    <link rel="stylesheet" href="${resource(dir: '/css/profiles.css', absolute: true)}" type="text/css"/>
    <link rel="stylesheet" href="${resource(dir: '/css/pdf.css', absolute: true)}" type="text/css"/>
</head>

<body>
<div class="container">
    <div class="row">
        <div class="col-md-6">
            <div class="pull-left"><span class="small-text">${opus.title}</span></div>
        </div>

        <div class="col-md-6">
            <div class="pull-right"><span class="small-text">This document was produced on ${new java.text.SimpleDateFormat("dd/MM/yyyy").format(new Date())}</span></div>
        </div>
    </div>
</div>

</body>
</html>
