/**
 * Require jshashes 1.0.5  install it with `npm install jshashes@1.0.5`
 * Then modify the hashes.js
 * change field `tab` in Base64: function(){...} to "LVoJPiCN2R8G90yg+hmFHuacZ1OWMnrsSTXkYpUq/3dlbfKwv6xztjI7DeBE45QA"
 * and change `utf8` variable below it to `false`
 */

const http = require("http");
const url = require("url");
// const jQuery = require("jquery");
const hashes = require("jshashes");
const DEBUG = 1;
const Hashes = hashes;
const urlapi = url;


let username = "your_account";
let password = "your_password";

let counter = 12341234;
// const options = {
//     "protocol": "http:",
//     "method": 'GET',
//     // "host": 'auth4.tsinghua.edu.cn',
//     "host": "101.6.4.100",
//     "port": 80,
//     "path": '/'
// };

/**
 * 从登陆页面脚本收集到的
 *  */
let xEncode = function(str, key) {
    if (str == "") {
        return "";
    }
    var v = s(str, true),
        k = s(key, false);
    if (k.length < 4) {
        k.length = 4;
    }
    var n = v.length - 1,
        z = v[n],
        y = v[0],
        c = 0x86014019 | 0x183639A0,
        m,
        e,
        p,
        q = Math.floor(6 + 52 / (n + 1)),
        d = 0;
    while (0 < q--) {
        d = d + c & (0x8CE0D9BF | 0x731F2640);
        e = d >>> 2 & 3;
        for (p = 0; p < n; p++) {
            y = v[p + 1];
            m = z >>> 5 ^ y << 2;
            m += (y >>> 3 ^ z << 4) ^ (d ^ y);
            m += k[(p & 3) ^ e] ^ z;
            z = v[p] = v[p] + m & (0xEFB8D130 | 0x10472ECF);
        }
        y = v[0];
        m = z >>> 5 ^ y << 2;
        m += (y >>> 3 ^ z << 4) ^ (d ^ y);
        m += k[(p & 3) ^ e] ^ z;
        z = v[n] = v[n] + m & (0xBB390742 | 0x44C6F8BD);
    }

    function s(a, b) {
        var c = a.length,
            v = [];
        for (var i = 0; i < c; i += 4) {
            v[i >> 2] = a.charCodeAt(i) | a.charCodeAt(i + 1) << 8 | a.charCodeAt(i + 2) << 16 | a.charCodeAt(i + 3) << 24;
        }
        if (b) {
            v[v.length] = c;
        }
        return v;
    }

    function l(a, b) {
        var d = a.length,
            c = (d - 1) << 2;
        if (b) {
            var m = a[d - 1];
            if ((m < c - 3) || (m > c))
                return null;
            c = m;
        }
        for (var i = 0; i < d; i++) {
            a[i] = String.fromCharCode(a[i] & 0xff, a[i] >>> 8 & 0xff, a[i] >>> 16 & 0xff, a[i] >>> 24 & 0xff);
        }
        if (b) {
            return a.join('').substring(0, c);
        } else {
            return a.join('');
        }
    }

    return l(v, false);
}

/**
 * 用http request协一个代替jquery.get的函数
 */
let get = function(url, data, callback, type, cookie1){
    console.log(`get() received url = ${url}`);
    let newURL = url + "?callback=jquery1_2&";
    for (key in data){
        newURL += key + "=" + encodeURI(data[key]).replace("/", "%2F") + '&'
    }
    let cookie = "";
    if (cookie1){
        cookie = cookie1;
    }
    newURL += "_=" + counter;
    counter += 1;
    console.log("newURL = " + newURL)
    let req = http.request(newURL, (res) => {
        res.setEncoding("utf8");
        if (DEBUG) console.log(res.headers);
        let text = "";
        res.on('data', (chunk) => {
            text += chunk;
        });
        res.on('end', () => {
            text = text.trim();
            if (DEBUG){
                console.log("========get()========");
                console.log(text);
                console.log("========get()========");
                console.log(text.substr(10, text.length-10-1));
                let json = JSON.parse(text.substr(10, text.length-10-1));
                callback(json);
            }
        });

    });
    req.on('error', (e) => {
        console.log(`Met an error in get(): \n${e}`);
    });
    req.headers = {
        'User-Agent': "http://game.granbluefantasy.jp/",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        "Cookie": cookie
    };
    // req.end(JSON.stringify(data));
    req.end();
}

let accessOuterNetwork = true;

let getJSON = function(url, data, callback) {
    console.log(`getJSON("${url}", ${JSON.stringify(data)}, callback`)
    if (url.match("srun_portal") != null || url.match("get_challenge") != null) {
        var enc = "s" + "run" + "_bx1",
            n = 200,
            type = 1,
            base64 = new Hashes.Base64();
        if (data.action == "login") { //login
            $data = data;
            return getJSON(url.replace("srun_portal", "get_challenge"), { "username": $data.username, "ip": $data.ip, "double_stack": "1" }, function(data) {
                var token = "";
                if (data.res != "ok") {
                    console.error(`*data.error = ${data.error}`);
                    return;
                }
                token = data.challenge;
                //$data.password = $data.org_password;
                $data.info = "{SRBX1}" + base64.encode(xEncode(JSON.stringify({ "username": $data.username, "password": $data.password, "ip": $data.ip, "acid": $data.ac_id, "enc_ver": enc }), token));
                //ip: $data.ip or data.online_ip
                //alert($data.info);
                var hmd5 = new Hashes.MD5().hex_hmac(token, data.password); //todo  this is wrong it is different from values obtained from browsers
                $data.password = "{MD5}" + hmd5;
                $data.chksum = new Hashes.SHA1().hex(token + $data.username + token + hmd5 + token + $data.ac_id + token + $data.ip + token + n + token + type + token + $data.info);
                $data.n = n;
                $data.type = type;
                return get(url, $data, callback, "jsonp");
            });
        } else if (data.action == "logout") { //logout
            $data = data;
            return getJSON(url.replace("srun_portal", "get_challenge"), { "username": $data.username, "ip": $data.ip, "double_stack": "1" }, function(data) {
                var token = "";
                if (data.res != "ok") {
                    alert(data.error);
                    return;
                }
                token = data.challenge;
                $data.info = "{SRBX1}" + base64.encode(xEncode(JSON.stringify({ "username": $data.username, "ip": $data.ip, "acid": $data.ac_id, "enc_ver": enc }), token));
                //alert($data.info);
                var str = token + $data.username + token + $data.ac_id + token + $data.ip + token + n + token + type + token + $data.info;
                $data.chksum = new Hashes.SHA1().hex(str);
                $data.n = n;
                $data.type = type;
                return get(url, $data, callback, "jsonp");
            });
        } else {
            return get(url, data, callback, "jsonp");
        }
    }
    return get(url, data, callback, "json");
}

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function getUrlParam(search, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
let login = function(currentURL, ac_id, username, password) {
    let parsedURL = url.parse(currentURL);
    let hostname = parsedURL["hostname"];
    var acid = ac_id,
        uname = username,
        pwd = password;
    // var uip = user_ip; //从页面的form2内找 然而没有用到
    if (acid == "" || acid == "0") {
        console.error("您打开的认证页面未经重定向，点击确定后将自动重定向到正确的页面。");
        return false;
    }
    if (uname == "") {
        console.error("请填写用户名(Please fill in the username)");
        // uname.focus();
        return false;
    }

    if (pwd == "") {
        console.error("请填写密码(Please fill in the password)");
        // pwd.focus();
        return false;
    }

    // if ($('#cookie')[0].checked == false) { //<==这个值最好是true 如果是false访问不了外网
    //     $.cookie("off_campus", "off", { expires: 30 });
    //     uname.val(uname.val()+"@tsinghua");
    // } else {
    //     $.cookie("off_campus", null);
    // }

    //login  认证
    var qData = {
        "action": "login",
        "username": uname,
        //"org_password": pwd.val(),
        "password": pwd,
        "ac_id": acid,
        "ip": "",
        "double_stack": "1"
    };
    console.log(`qData = ${JSON.stringify(qData)}`);
    getJSON("http://" + hostname + "/cgi-bin/srun_portal", qData, function(data) {
        // if ($('#cookie')[0].checked == false) {  #it is default to true
        //     uname.val(uname.val().replace("@tsinghua", ''));
        // }
        if (data.error == "ok") {
            let cookie = "access_token=" + data.access_token;
            qData.password = pwd;

            var redirect = getUrlParam(parsedURL["search"], 'userurl');
            if (redirect != ""){
                console.log("redirected! =>", redirect);
                // location.href = redirect;
            } else {
                if (accessOuterNetwork == false) {
                    let newLocation = parsedURL.protocol + "//" + parsedURL.hostname + "/succeed_wired.php?ac_id=" + acid + "&username=" + data.username + "&ip=" + data.client_ip + "&access_token=" + data.access_token + "&access=no";
                    //todo get a connection
                }else {
                    let newLocation = parsedURL.protocol + "//" + loparsedURLcation.hostname + "/succeed_wired.php?ac_id=" + acid + "&username=" + data.username + "&ip=" + data.client_ip + "&access_token=" + data.access_token;
                    //todo get a connection
                }
            }
            return false;
        }
        if (data.error_msg.indexOf("E2616") >= 0) {
            console.error("您的账户已余额不足(Your account has insufficient balance)");
        } else {
            console.error(`Server-side Error: ${data.error_msg}\n${data.error}`);
            return false;
        }
    });

}











let testCallBack = function(arg1){
    console.log(`testCallBack is called with ${arg1}`);
}
let predicate_login_or_logged = function(statusCode, url1){
    console.log(`checking url ${url1}`)
    if (statusCode == 200){
        let pattern = /\/succeed_wired\.php\?ac_id=([\d]+)&username=(.+?)&ip=([\.0-9]+)/;
        let result = pattern.exec(url1);
        if (result && result.length == 4){
            console.log("Already Logged in");
            console.log(`** username: ${result[2]}`);
            console.log(`** ip: ${result[3]}`);
            console.log(`** acid: ${result[1]}`);
            return false; //false to bypass further action
        }else{
            console.log(`Failed to match`);
            return true;
        }
    }
    return true;
}

let login_process = function(options1, headers, extraData){
    let pattern = /\/srun_portal_pc\.php\?ac_id=([\d]+)&/
    let result = pattern.exec(options1["path"]);
    let currentURL = `${options1["protocol"]}//${options1["hostname"]}${options1["path"]}`
    if (result && result.length == 2){
        console.log(result);
        login(currentURL, extraData["acid"], username, password);
    }
}

let acid_extraction = function(options1, headers, extraData){
    let loc = `${options1["protocol"]}//${options1["hostname"]}${options1["path"]}`;
    console.log(`acid extraction on ${loc}`);
    let parseResult = url.parse(loc);

    /**selected from the page*/ 
    let p=/\/index_([\d]+).html/;
    let arr=p.exec(loc);
    if (!arr[1]){
        console.error(`Wrong regex matching, please check the page ${loc}`);
        return;
    }

    //else
    let p2 = "";
    if (parseResult["search"]){
        p2 = parseResult["search"].substring(1);
    }
    let path = "/ac_detect.php?ac_id=" + arr[1] + "&" + p2;
    let acid = arr[1];
    let options = {
        "hostname": parseResult["hostname"],
        "protocol": parseResult["protocol"],
        "path": path,
        "headers": {
            "Cookie": headers['set-cookie']
        }
    }
    ////////////////////////////////check login status or get login page
    console.log(`synthesized url = ${parseResult["protocol"]}//${parseResult["hostname"]}${path}`);
    redirection_follower(options, predicate_login_or_logged, {"acid":acid}, login_process);
}

let redirection_follower = function(options1, cond, extraData, callback){
    console.log(`Accessing ${options1["protocol"]}//${options1["hostname"]}${options1["path"]}`)
    let url1 = `${options1["protocol"]}//${options1["hostname"]}${options1["path"]}`

    let req = http.request(options1, (res)=>{
        let statusCode = res.statusCode;
        let headers = res.headers;
        console.log(headers)

        if (statusCode == 302){
            redirection_follower(url.parse(headers["location"]), cond, extraData, callback);
        }else{
            if (cond(statusCode, url1)){
                callback(options1, headers, extraData);
            }else{
                return;
            }
        }

    });
    req.on('error', (e)=>{
        console.error(`error when connecting to ${url1};\nError: ${e}`);
    });
    req.end()
}

let options1 = {
    "protocol": "http:",
    "hostname": "101.6.4.100",
    "method": "GET",
    "path": "/"
}
redirection_follower(options1, ()=>true, {}, acid_extraction);