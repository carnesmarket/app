// GLOBALS

// Servidor
var server_url = "https://carnesmarket.co/apps/carnesmarket/php/app.php";

// Device
var device;

// Network state
var networkState;

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //window.addEventListener('load', this.onDeviceReady, false); //TESTONLY
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
        // Fastclick
        FastClick.attach(document.body);
        
        // Network State
        networkState = navigator.connection.type;
        
        // Obtener tipo de dispositivo
        device = device.platform;
        
        // Poner Accesory bar en iOS Keyboard
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        
        // OneSignal PUSH Notifications
        var notificationOpenedCallback = function(jsonData) {
            var notificationData = JSON.stringify(jsonData);
            localStorage.setItem("notif_seccion", jsonData.additionalData.seccion);
            localStorage.setItem("notif_idprod", jsonData.additionalData.idProducto);
        };
        window.plugins.OneSignal.init("46bc8e1c-43ff-4373-83ce-79c76f8a3b2c", {googleProjectNumber: "1093715529525"}, notificationOpenedCallback);
        window.plugins.OneSignal.enableInAppAlertNotification(true);
        
        $("#splashscreen").animate({opacity: 1}, 500, function() {
            if(networkState == "none"){
                showAlertWithTitle('Debes estar conectado a internet.', 'Sin conexión');
            }
            else {
                if(isFirstLaunch()) {
                    startappFirstLaunch("login"); // Enviar como parámetro página de destino
                }
                else if(!CheckOnesignalPlayerID()) {
                    checkOneSigThenstartapp();
                }
                else {
                    startapp();
                }
            }
        });
    }
};

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

// CHECK FIRST LAUNCH
function isFirstLaunch() {
    var firstLaunch = localStorage.getItem('firstLaunch');
    if(firstLaunch) {
        return false; // Existe, no es first launch
    }
    else {
        return true; // No existe, si es first launch
    }
}

// PRIMER INICIO
function startappFirstLaunch(destino) {
    var data = {
        "action": "resetDevice"
    };
    // Obtener ID de OneSignal
    window.plugins.OneSignal.getIds(function(ids) {
        var onesignalPlayerID = ids.userId;
        if(onesignalPlayerID) {
            // Existe
            if(onesignalPlayerID.length > 0){
                // Es válido
                data.onesignalPlayerID = onesignalPlayerID;
            }
        }
        // Borrar todas las sesiones asociadas a este OneSignalPlayerID e iniciar
        if(data.onesignalPlayerID) {
            $.ajax({ url: server_url,
                data: data,
                type: 'POST',
                dataType: 'json',
                success: function(output) {
                    if(output.error){
                        showErrorServer();
                    }
                    else {
                        // Borrar todos los tags de onesignal
                        window.plugins.OneSignal.getTags(function(tags) {
                            var tagsKeys = Object.keys(tags);
                            window.plugins.OneSignal.deleteTags(tagsKeys);
                            
                            // Suscribirse a notificaciones por si estaba en off
                            window.plugins.OneSignal.setSubscription(true);
                            
                            localStorage.setItem("onesignalPlayerID", onesignalPlayerID);
                            leaveFirstLaunch(destino);
                        });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    showErrorServer();
                }
            });
        }
        // Si no hay OneSignalPlayerID, continuar normal.
        else {
            leaveFirstLaunch(destino);
        }
    });
}
// Al terminar el first launch, continuar:
function leaveFirstLaunch(pagDestino) {
    localStorage.setItem("firstLaunch", "1");
    // Ir a login o tutorial
    if(pagDestino == "login") {
        goto_login();
    }
    else {
        goto_login();
    }
}

// CHECK IF OneSignalPlayerID EXISTS
function CheckOnesignalPlayerID() {
    var onesignalPlayerID = localStorage.getItem('onesignalPlayerID');
    if(onesignalPlayerID) {
        return true;
    }
    else {
        return false;
    }
}

// VERIFICAR SI YA HAY UN NUEVO OneSignalPlayerID
function checkOneSigThenstartapp() {
    // Obtener ID de OneSignal
    window.plugins.OneSignal.getIds(function(ids) {
        var onesignalPlayerID = ids.userId;
        if(onesignalPlayerID) {
            // Existe
            if(onesignalPlayerID.length > 0){
                // Es válido
                clearLocalstorage();
                startappFirstLaunch("login");
            }
        }
        else {
            startapp();
        }
    });
}

// INICIO NORMAL
function startapp() {
    // Verificar si el usuario esta loggeado
    var currentSession = localStorage.getItem("sessionToken");
    if(currentSession) {
        // Verificar sesión y traer variables de usuario
        var data = {
            "action": "checkSession",
            "currentSession": currentSession
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
                    clearLocalstorage();
                    showAlertWithTitle('Tu sesión ha caducado.', 'Sesión caducada');
                    goto_login();
                }
                else {
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
                    goto_user();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                showErrorServer();
            }
        });
    }
    else {
        goto_login();
    }
}

// INICIALIZAR iOS
function initiOS() {
    // Inicializar color de statusbar en iOS
    StatusBar.styleLightContent();
    StatusBar.backgroundColorByHexString("#000000");
    StatusBar.show();
}

// IR A APLICACIÓN - LOGIN PAGE
function goto_login() {
    setTimeout(function(){
        $("#splashscreen").animate({opacity: 0}, 1000, function() {
            if (device == "iOS"){
                initiOS();
            }
            window.location.replace("login.html");
        });
    },1000)
}

// IR A APLICACIÓN - USUARIO
function goto_user() {
    setTimeout(function(){
        $("#splashscreen").animate({opacity: 0}, 1000, function() {
            if (device == "iOS"){
                initiOS();
            }
            window.location.replace("app_user.html");
        });
    },1000)
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