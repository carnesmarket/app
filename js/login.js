// GLOBALS

// Servidor
var server_url = "https://carnesmarket.co/apps/carnesmarket/php/app.php";

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
        // Fastclick
        FastClick.attach(document.body);
        
        // Network listeners
        document.addEventListener("offline", onOffline, false);
        document.addEventListener("online", onOnline, false);
        
        // Back Button listener para Android
        document.addEventListener("backbutton", onBackButton, false);
        
        
        // APP SCRIPTS
        
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ----------          VARIOS          ----------- */
        
        // Añadir términos y condiciones
        $("#page_content_terminos").html('<iframe class="terminos_iframe" src="https://carnesmarket.co/apps/carnesmarket/terms/terminosycondiciones.html"></iframe>');
        // Añadir política de privacidad
        $("#page_content_privacidad").html('<iframe class="terminos_iframe" src="https://carnesmarket.co/apps/carnesmarket/terms/politicaprivacidad.html"></iframe>');
        
        // Ingresar sin registrarse
        $("#btn_ingresoSimple").on( "click", function( event ) {
            clearLocalstorage();
            localStorage.setItem("id", -1);
            window.location.replace("app_user.html");
        });
        
        // Toggle aceptar terminos
        $("#aceptaTerminos").on( "click", function( event ) {
            $(this).toggleClass("aceptaTerminos_selected");
        });
        
        
        
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ----------           LOGIN          ----------- */
        
        $("#btn_iniciarSesion").on( "click", function( event ) {
            var login_user = $("#login_user").val();
            var login_pass = $("#login_pass").val();
            var installationId = device.uuid;
            window.plugins.OneSignal.getIds(function(ids) {
                var onesignalPlayerID = ids.userId;
                var loginData = [login_user, login_pass, installationId, onesignalPlayerID];
                if(login_user.trim().length >= 4 && login_pass.trim().length >= 6){
                    show_loading();
                    var data = {
                        "action": "login_correo",
                        "loginData": loginData
                    };
                    $.ajax({ url: server_url,
                        data: data,
                        type: 'POST',
                        dataType: 'json',
                        success: function(output) {
                            if(output.error){
                                showErrorServer();
                            }
                            else if(output.vacio) {
                                showErrorAlert('Correo o contraseña incorrectos.');
                            }
                            else {
                                localStorage.setItem("sessionToken", output.sessionToken);
                                localStorage.setItem("id", output.id);
                                localStorage.setItem("username", output.username);
                                localStorage.setItem("email", output.email);
                                localStorage.setItem("notifications", output.notifications);
                                localStorage.setItem("name", output.name);
                                localStorage.setItem("lastname", output.lastname);
                                localStorage.setItem("phone", output.phone);
                                localStorage.setItem("addresses", output.addresses);
                                localStorage.setItem("profilePic", output.profilePic);
                                localStorage.setItem("profilePicFacebook", output.profilePicFacebook);
                                localStorage.setItem("gender", output.gender);
                                localStorage.setItem("modoPago", output.modoPago);
                                
                                // Iniciar
                                window.location.replace("app_user.html");
                            }
                            hide_loading();
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            showErrorServer();
                        }
                    });
                }
                else {
                    showErrorAlert('Completa todos los campos. Usuario mín. 4 caracteres. Contraseña mín. 6 caracteres.');
                }
            });
        });
        
        
        
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ----------         REGISTRO         ----------- */
        
        $("#btn_registrarse").on( "click", function( event ) {
            // Recoger variables
            var reg_pass = $("#reg_pass").val();
            var reg_correo = $("#reg_email").val();
            var reg_nombre = $("#reg_nombre").val();
            var reg_apellido = $("#reg_apellido").val();
            var reg_tel = $("#reg_tel").val();
            var installationId = device.uuid;
            var emailfilter = /\S+@\S+\.\S+/;
            
            // Validaciones
            var validado = true;
            
            if(reg_pass.trim().length < 6){
                validado = false;
                showErrorAlert('La contraseña debe tener mínimo 6 caracteres.');
                return;
            }
            
            if (!emailfilter.test(reg_correo)) {
                validado = false;
                showErrorAlert('Ingresa un correo válido.');
                return;
            }
            
            if(reg_nombre.trim().length < 2){
                validado = false;
                showErrorAlert('Ingresa tu nombre.');
                return;
            }
            
            if(reg_apellido.trim().length < 2){
                validado = false;
                showErrorAlert('Ingresa tu apellido.');
                return;
            }
            
            if(reg_tel.trim().length != 10){
                validado = false;
                showErrorAlert('Ingresa un celular válido de 10 dígitos.');
                return;
            }
            
            if($("#aceptaTerminos").hasClass("aceptaTerminos_selected") == false) {
                validado = false;
                showErrorAlert('Debes aceptar los términos y condiciones para registrarte.');
                return;
            }
            
            if(validado){
                window.plugins.OneSignal.getIds(function(ids) {
                    var onesignalPlayerID = ids.userId;
                    var registroData = [reg_correo, reg_pass, reg_correo, reg_nombre, reg_apellido, reg_tel, installationId, onesignalPlayerID];
                    show_loading();
                    var data = {
                        "action": "register_correo",
                        "registroData": registroData
                    };
                    $.ajax({ url: server_url,
                        data: data,
                        type: 'POST',
                        dataType: 'json',
                        success: function(output) {
                            if(output.error){
                                showErrorServer();
                            }
                            else if(output.duplicado) {
                                if(output.duplicadoKey == "username"){
                                    showErrorAlert('Correo ya existente.');
                                }
                                else if(output.duplicadoKey == "email") {
                                    showErrorAlert('Correo ya existente.');
                                }
                                else {
                                    showErrorAlert('Una cuenta con estos datos ya existe.');
                                }
                            }
                            else {
                                localStorage.setItem("sessionToken", output.sessionToken);
                                localStorage.setItem("id", output.id);
                                localStorage.setItem("username", output.username);
                                localStorage.setItem("email", output.email);
                                localStorage.setItem("notifications", output.notifications);
                                localStorage.setItem("name", output.name);
                                localStorage.setItem("lastname", output.lastname);
                                localStorage.setItem("phone", output.phone);
                                window.location.replace("app_user.html");
                            }
                            hide_loading();
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            showErrorServer();
                            hide_loading();
                        }
                    });
                });
            }
        });
        
        
        
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ----------      FACEBOOK LOGIN      ----------- */
        
        $("#btn_iniciarfacebook").on( "click", function( event ) {
            show_loading();
            var fbLoginSuccess = function (userData) {
                window.plugins.OneSignal.getIds(function(ids) {
                    // Login correcto con facebook, obtener datos
                    var userId = userData.authResponse.userID;
                    var accessToken = userData.authResponse.accessToken;
                    var expiresIn = parseInt(userData.authResponse.expiresIn);
                    var installationId = device.uuid;
                    var onesignalPlayerID = ids.userId;
                    
                    // Traer datos de facebook
                    facebookConnectPlugin.api(userId+"?fields=id,first_name,last_name,email,picture.height(480).width(480)", ["public_profile", "email"], function (result) {
                        var fb_name = result.first_name;
                        var fb_lastname = result.last_name;
                        var fb_email = result.email;
                        var fb_picture = result.picture.data.url;
                        var fbLoginData = [userId, accessToken, expiresIn, fb_name, fb_lastname, fb_email, fb_picture, installationId, onesignalPlayerID];
                        
                        var data = {
                            "action": "loginFB",
                            "fbLoginData": fbLoginData
                        };
                        $.ajax({ url: server_url,
                            data: data,
                            type: 'POST',
                            dataType: 'json',
                            success: function(output) {
                                if(output.error){
                                    showErrorServer();
                                }
                                else if(output.duplicado) {
                                    if(output.duplicadoKey == "username"){
                                        showErrorAlert('Usuario ya existente.');
                                    }
                                    else if(output.duplicadoKey == "email") {
                                        showErrorAlert('Correo ya existente.');
                                    }
                                    else {
                                        showErrorAlert('Una cuenta con estos datos ya existe.');
                                    }
                                }
                                else {
                                    if(output.login){
                                        localStorage.setItem("sessionToken", output.sessionToken);
                                        localStorage.setItem("id", output.id);
                                        localStorage.setItem("username", output.username);
                                        localStorage.setItem("email", output.email);
                                        localStorage.setItem("notifications", output.notifications);
                                        localStorage.setItem("name", output.name);
                                        localStorage.setItem("lastname", output.lastname);
                                        localStorage.setItem("phone", output.phone);
                                        localStorage.setItem("addresses", output.addresses);
                                        localStorage.setItem("profilePic", output.profilePic);
                                        localStorage.setItem("profilePicFacebook", output.profilePicFacebook);
                                        localStorage.setItem("gender", output.gender);
                                        localStorage.setItem("modoPago", output.modoPago);
                                    }
                                    else {
                                        localStorage.setItem("sessionToken", output.sessionToken);
                                        localStorage.setItem("id", output.id);
                                        localStorage.setItem("username", output.username);
                                        localStorage.setItem("email", output.email);
                                        localStorage.setItem("notifications", output.notifications);
                                        localStorage.setItem("name", output.name);
                                        localStorage.setItem("lastname", output.lastname);
                                        localStorage.setItem("profilePicFacebook", output.profilePicFacebook);
                                    }
                                    window.location.replace("app_user.html");
                                }
                                hide_loading();
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                showErrorServer();
                                hide_loading();
                            }
                        });
                    },
                    function (error) {
                        showErrorAlert('No fue posible iniciar sesión con facebook. Intenta de nuevo.');
                    });
                });
            }
            
            // Conectar con facebook y pedir permisos
            facebookConnectPlugin.login(["public_profile", "email"], fbLoginSuccess, function (error) {
                showAlertWithTitle('Se ha cancelado el inicio con facebook.', 'Cancelado');
            });
        });
        
        
        
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ---------- ------------------------ ----------- */
        /* ----------     RESTABLECER PASS     ----------- */
        
        $("#btn_restablecer").on( "click", function( event ) {
            var recoveryEmail = $("#restab_email").val();
            var emailfilter = /\S+@\S+\.\S+/;
            if (emailfilter.test(recoveryEmail)) {
                var installationId = device.uuid;
                var recoverData = [recoveryEmail, installationId];
                show_loading();
                var data = {
                    "action": "recoveryPassword",
                    "recoverData": recoverData
                };
                $.ajax({ url: server_url,
                    data: data,
                    type: 'POST',
                    dataType: 'json',
                    success: function(output) {
                        if(output.error){
                            showErrorServer();
                        }
                        else if(output.vacio) {
                            showErrorAlert('Este correo no se encuentra registrado.');
                        }
                        else {
                            showAlertWithTitle('Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.', 'Enviado');
                        }
                        hide_loading();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        showErrorServer();
                        hide_loading();
                    }
                });
            }
            else {
                showErrorAlert('Ingresa un correo válido.');
            }
        });
        
    }
};

// ANDROID - BACK BUTTON
function onBackButton() {
    var activepage = $(':mobile-pagecontainer').pagecontainer("getActivePage").attr("id");
    if(activepage == "page_first"){
        navigator.app.exitApp();
    }
    else {
        history.back();
    }
}

// ALERTAS
function alertDismissed() {
    hide_loading();
}
function showErrorServer() {
    navigator.notification.alert(
        'El servidor no responde. Vuelve a intentalo más tarde.',
        alertDismissed,
        'Servidor no responde',
        'OK'
    );
}
function showAlertWithTitle(texto, titulo) {
    navigator.notification.alert(
        texto,
        alertDismissed,
        titulo,
        'OK'
    );
}
function showErrorAlert(texto) {
    navigator.notification.alert(
        texto,
        alertDismissed,
        'Error',
        'OK'
    );
}

// LOADING
function show_loading() {
    $("#loading").css('display', "block");
    $("#loading").animate({opacity: 1}, 200, function(){});
}
function hide_loading() {
    $("#loading").animate({opacity: 0}, 100, function(){
        $("#loading").css('display', "none");
    });
}

// NETWORK LISTENERS HANDLERS
function show_offlineIndicator() {
    show_loading();
}
function hide_offlineIndicator() {
    hide_loading();
}
function onOffline() {
    navigator.notification.alert(
        'No estás conectado a internet',
        show_offlineIndicator,
        'Desconectado',
        'OK'
    );
}
function onOnline() {
    hide_offlineIndicator();
}

// Borrar localstorage, mantener variable de 1st launch
function clearLocalstorage() {
    var firstLaunch = localStorage.getItem('firstLaunch');
    var onesignalPlayerID = localStorage.getItem('onesignalPlayerID');
    localStorage.clear();
    if(firstLaunch) {
        localStorage.setItem("firstLaunch", firstLaunch);
    }
    if(onesignalPlayerID) {
        localStorage.setItem("onesignalPlayerID", onesignalPlayerID);
    }
}